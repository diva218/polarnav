"""
Sea-Ice U-Net Training Pipeline (Model 1)
----------------------------------------
Trains U-Net model on Sentinel-1 SAR imagery for 3-class sea-ice segmentation:
- Class 0: Open Water
- Class 1: Sea Ice
- Class 2: Dense/Compact Sea Ice

Supports:
- AdamW Optimizer + CosineAnnealing LR Scheduler
- Combined Loss (CrossEntropy + Multi-Class Dice)
- Mixed Precision (AMP) when CUDA is available
- Albumentations data augmentation
- Checkpoint saving (Best mIoU & Latest)
- Training metrics plotting & evaluation summary
"""

import os
import random
import argparse
import json
import numpy as np
import yaml
from pathlib import Path
from PIL import Image
from tqdm import tqdm
import matplotlib.pyplot as plt

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

import albumentations as A
from albumentations.pytorch import ToTensorV2

from ml.models.unet import UNet
from ml.training.losses import CombinedSegmentationLoss
from ml.training.validate import validate_epoch
from ml.preprocessing.prepare_dataset import load_image, load_mask


# ═════════════════════════════════════════════════════════════════════════════
# 1. REPRODUCIBILITY & SEEDING
# ═════════════════════════════════════════════════════════════════════════════

def set_seed(seed: int = 42):
    """Set random seeds across Python, NumPy, and PyTorch for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


# ═════════════════════════════════════════════════════════════════════════════
# 2. PYTORCH DATASET CLASS
# ═════════════════════════════════════════════════════════════════════════════

class SeaIceDataset(Dataset):
    def __init__(self, dataset_dir: str, transform=None, image_size: int = 512, in_channels: int = 1):
        self.dataset_dir = Path(dataset_dir)
        self.img_dir = self.dataset_dir / "images"
        self.mask_dir = self.dataset_dir / "masks"
        self.transform = transform
        self.image_size = image_size
        self.in_channels = in_channels

        if not self.img_dir.exists() or not self.mask_dir.exists():
            self.image_paths = []
            self.mask_paths = []
            return

        supported_exts = [".tif", ".tiff", ".png", ".jpg", ".jpeg"]
        self.image_paths = sorted([p for p in self.img_dir.glob("*") if p.suffix.lower() in supported_exts])
        
        mask_map = {p.stem: p for p in self.mask_dir.glob("*") if p.suffix.lower() in supported_exts}
        self.mask_paths = [mask_map[p.stem] for p in self.image_paths if p.stem in mask_map]

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = str(self.image_paths[idx])
        mask_path = str(self.mask_paths[idx])

        img = load_image(img_path)
        mask = load_mask(mask_path)

        # Ensure single channel grayscale or RGB matching config
        if img.ndim == 2:
            img = np.expand_dims(img, axis=-1)

        if self.in_channels == 1 and img.shape[2] == 3:
            img = img[:, :, 0:1]

        if self.transform:
            augmented = self.transform(image=img, mask=mask)
            img = augmented["image"]
            mask = augmented["mask"]
        else:
            # Default resize and tensor conversion
            img = cv2_resize(img, (self.image_size, self.image_size))
            mask = cv2_resize_mask(mask, (self.image_size, self.image_size))
            
            img = torch.from_numpy(img).permute(2, 0, 1).float() / 255.0
            mask = torch.from_numpy(mask).long()

        return img, mask


def cv2_resize(img, dsize):
    try:
        import cv2
        return cv2.resize(img, dsize, interpolation=cv2.INTER_LINEAR)
    except Exception:
        from PIL import Image
        if img.ndim == 2:
            return np.array(Image.fromarray(img).resize(dsize, Image.BILINEAR))
        return np.array(Image.fromarray(img).resize(dsize, Image.BILINEAR))

def cv2_resize_mask(mask, dsize):
    try:
        import cv2
        return cv2.resize(mask.astype(np.uint8), dsize, interpolation=cv2.INTER_NEAREST)
    except Exception:
        from PIL import Image
        return np.array(Image.fromarray(mask.astype(np.uint8)).resize(dsize, Image.NEAREST))


# ═════════════════════════════════════════════════════════════════════════════
# 3. ALBUMENTATIONS AUGMENTATIONS
# ═════════════════════════════════════════════════════════════════════════════

def get_transforms(image_size: int, is_train: bool = True, cfg_aug: dict = None):
    if cfg_aug is None:
        cfg_aug = {}

    if is_train:
        return A.Compose([
            A.Resize(image_size, image_size),
            A.HorizontalFlip(p=cfg_aug.get("horizontal_flip_prob", 0.5)),
            A.VerticalFlip(p=cfg_aug.get("vertical_flip_prob", 0.5)),
            A.RandomRotate90(p=cfg_aug.get("random_rotate_prob", 0.5)),
            A.RandomBrightnessContrast(
                brightness_limit=0.1, contrast_limit=0.1, p=cfg_aug.get("brightness_contrast_prob", 0.3)
            ),
            A.Normalize(mean=(0.5,), std=(0.5,)),
            ToTensorV2()
        ])
    else:
        return A.Compose([
            A.Resize(image_size, image_size),
            A.Normalize(mean=(0.5,), std=(0.5,)),
            ToTensorV2()
        ])


# ═════════════════════════════════════════════════════════════════════════════
# 4. MAIN TRAINING PIPELINE
# ═════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Train Sea-Ice U-Net Segmentation Model")
    parser.add_argument("--config", type=str, default="ml/configs/sea_ice.yaml", help="Path to config file")
    args = parser.parse_args()

    with open(args.config, "r") as f:
        cfg = yaml.safe_load(f)

    # Set random seed
    seed = cfg["training"]["seed"]
    set_seed(seed)

    # Device configuration
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Datasets
    train_dir = cfg["dataset"]["train_dir"]
    val_dir = cfg["dataset"]["val_dir"]
    test_dir = cfg["dataset"]["test_dir"]
    img_size = cfg["training"]["image_size"]
    in_channels = cfg["model"]["in_channels"]
    num_classes = cfg["model"]["num_classes"]

    # Verify prepared datasets exist, else prepare automatically
    if not Path(train_dir).exists() or len(SeaIceDataset(train_dir)) == 0:
        print(" Train dataset not found. Running dataset preparation...")
        from ml.preprocessing.prepare_dataset import main as prep_main
        prep_main()

    train_ds = SeaIceDataset(train_dir, transform=get_transforms(img_size, is_train=True, cfg_aug=cfg["augmentation"]), in_channels=in_channels)
    val_ds = SeaIceDataset(val_dir, transform=get_transforms(img_size, is_train=False), in_channels=in_channels)
    test_ds = SeaIceDataset(test_dir, transform=get_transforms(img_size, is_train=False), in_channels=in_channels)

    # Startup Status Output
    print("\n" + "═" * 60)
    print(" POLARNAV ML — SEA-ICE SEGMENTATION TRAINING (MODEL 1)")
    print("═" * 60)
    print(f" Device                  : {device.type.upper()}")
    print(f" Number of Train Samples : {len(train_ds)}")
    print(f" Number of Val Samples   : {len(val_ds)}")
    print(f" Number of Test Samples  : {len(test_ds)}")
    print(f" Number of Classes       : {num_classes} ({', '.join(cfg['classes'].values())})")
    print(f" Image Input Resolution  : {img_size}x{img_size}")
    print(f" Batch Size / Epochs     : {cfg['training']['batch_size']} / {cfg['training']['epochs']}")
    print("═" * 60 + "\n")

    if len(train_ds) == 0:
        raise RuntimeError("No training samples found! Place dataset images in ml/datasets/raw/ or run prepare_dataset.py --create-synthetic.")

    # DataLoaders
    batch_size = cfg["training"]["batch_size"]
    num_workers = cfg["training"]["num_workers"] if device.type == "cuda" else 0

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    # Initialize U-Net Model
    model = UNet(
        in_channels=in_channels,
        num_classes=num_classes,
        base_filters=cfg["model"]["base_filters"],
        bilinear=cfg["model"]["bilinear"]
    ).to(device)

    # Loss, Optimizer, Scheduler, AMP Scaler
    criterion = CombinedSegmentationLoss(num_classes=num_classes)
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg["training"]["learning_rate"], weight_decay=cfg["training"]["weight_decay"])
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=cfg["training"]["epochs"])
    scaler = torch.amp.GradScaler('cuda', enabled=cfg["training"].get("use_amp", True) and device.type == "cuda")

    # Checkpoint setup
    ckpt_dir = Path(cfg["training"]["checkpoint_dir"])
    os.makedirs(ckpt_dir, exist_ok=True)
    best_ckpt_path = ckpt_dir / cfg["training"]["best_model_name"]
    latest_ckpt_path = ckpt_dir / cfg["training"]["latest_model_name"]

    plots_dir = Path(cfg["output"]["plots_dir"])
    os.makedirs(plots_dir, exist_ok=True)

    best_val_miou = 0.0
    history = {"train_loss": [], "val_loss": [], "val_accuracy": [], "val_miou": [], "val_dice": []}

    print(" Starting training loop...\n")

    for epoch in range(1, cfg["training"]["epochs"] + 1):
        model.train()
        running_loss = 0.0
        pbar = tqdm(train_loader, desc=f"Epoch {epoch:02d}/{cfg['training']['epochs']:02d}", leave=False)

        for images, targets in pbar:
            images = images.to(device, dtype=torch.float32)
            targets = targets.to(device, dtype=torch.long)

            optimizer.zero_grad()

            if device.type == "cuda" and cfg["training"].get("use_amp", True):
                with torch.amp.autocast('cuda'):
                    logits = model(images)
                    loss, ce_loss, dice_loss = criterion(logits, targets)

                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                logits = model(images)
                loss, ce_loss, dice_loss = criterion(logits, targets)
                loss.backward()
                optimizer.step()

            running_loss += loss.item() * images.size(0)
            pbar.set_postfix({"loss": f"{loss.item():.4f}"})

        scheduler.step()
        train_loss = running_loss / len(train_ds)

        # Validation Pass
        val_loss, val_metrics = validate_epoch(
            model, val_loader, criterion, device, num_classes=num_classes, class_names=cfg["classes"]
        )

        val_acc = val_metrics["pixel_accuracy"]
        val_miou = val_metrics["mean_iou"]
        val_dice = val_metrics["mean_dice"]

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["val_accuracy"].append(val_acc)
        history["val_miou"].append(val_miou)
        history["val_dice"].append(val_dice)

        # Print Epoch Summary
        print(f"Epoch [{epoch:02d}/{cfg['training']['epochs']:02d}] "
              f"Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | "
              f"Val Acc: {val_acc*100:.2f}% | Val mIoU: {val_miou*100:.2f}% | Val Dice: {val_dice*100:.2f}%")

        # Save Latest Checkpoint
        checkpoint_state = {
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "val_miou": val_miou,
            "config": cfg
        }
        torch.save(checkpoint_state, latest_ckpt_path)

        # Save Best Model Checkpoint
        if val_miou > best_val_miou:
            best_val_miou = val_miou
            torch.save(checkpoint_state, best_ckpt_path)
            print(f"   [BEST MODEL] Saved new best model checkpoint (Val mIoU: {val_miou*100:.2f}%) -> {best_ckpt_path}")

    print("\n Training complete!")
    print(f" Best Validation mIoU: {best_val_miou*100:.2f}%")

    # Save History JSON
    with open(plots_dir / "history.json", "w") as f:
        json.dump(history, f, indent=2)

    # Plot & Save Training Curves
    fig, axes = plt.subplots(1, 2, figsize=(12, 5), dpi=150)
    fig.patch.set_facecolor('#050d17')

    epochs_range = range(1, cfg['training']['epochs'] + 1)
    
    # Loss plot
    axes[0].plot(epochs_range, history["train_loss"], label="Train Loss", color='#38bdf8', linewidth=2)
    axes[0].plot(epochs_range, history["val_loss"], label="Val Loss", color='#f43f5e', linewidth=2)
    axes[0].set_title("Training & Validation Loss", color='white', fontweight='bold')
    axes[0].set_xlabel("Epoch", color='white')
    axes[0].set_ylabel("Loss", color='white')
    axes[0].legend(facecolor='#0a1825', labelcolor='white')
    axes[0].grid(True, linestyle='--', alpha=0.3)
    axes[0].tick_params(colors='white')

    # mIoU plot
    axes[1].plot(epochs_range, [m * 100 for m in history["val_miou"]], label="Val mIoU (%)", color='#10b981', linewidth=2)
    axes[1].plot(epochs_range, [a * 100 for a in history["val_accuracy"]], label="Val Acc (%)", color='#a855f7', linewidth=2)
    axes[1].set_title("Validation Accuracy & mIoU", color='white', fontweight='bold')
    axes[1].set_xlabel("Epoch", color='white')
    axes[1].set_ylabel("Percentage (%)", color='white')
    axes[1].legend(facecolor='#0a1825', labelcolor='white')
    axes[1].grid(True, linestyle='--', alpha=0.3)
    axes[1].tick_params(colors='white')

    plt.tight_layout()
    plt.savefig(plots_dir / "training_history.png", facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f" Saved training curve plot to: {plots_dir / 'training_history.png'}")

    # Final Evaluation on Test Set
    print("\n Running final evaluation on Test Dataset...")
    best_checkpoint = torch.load(best_ckpt_path, map_location=device)
    model.load_state_dict(best_checkpoint["model_state_dict"])
    
    _, test_metrics = validate_epoch(model, test_loader, criterion, device, num_classes=num_classes, class_names=cfg["classes"])
    
    from ml.evaluation.metrics import SegmentationMetrics
    metrics_display = SegmentationMetrics(num_classes=num_classes, class_names=cfg["classes"])
    metrics_display.print_summary(test_metrics)


if __name__ == "__main__":
    main()
