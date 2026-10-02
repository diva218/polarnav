"""
Sea-Ice Inference & Prediction Module (Model 1)
-----------------------------------------------
Loads trained U-Net checkpoint and performs pixel-level segmentation on input
Sentinel-1 SAR imagery.

Outputs:
- Predicted segmentation mask (.png / .npy)
- 4-panel diagnostic visualization
- Class percentages breakdown (Open Water, Sea Ice, Dense Ice)
- Exposes Python API for downstream model integration (Iceberg detection, Route optimization)
"""

import os
import argparse
import yaml
import numpy as np
import torch
import torch.nn.functional as F
from pathlib import Path
from PIL import Image

import albumentations as A
from albumentations.pytorch import ToTensorV2

from ml.models.unet import UNet
from ml.preprocessing.prepare_dataset import load_image
from ml.visualization.visualize_predictions import visualize_prediction


# Default Class Names mapping
DEFAULT_CLASS_NAMES = {
    0: "Open Water",
    1: "Sea Ice",
    2: "Dense Ice"
}


def load_model(checkpoint_path: str, config: dict, device: torch.device) -> UNet:
    """Load trained U-Net model from checkpoint."""
    model = UNet(
        in_channels=config["model"]["in_channels"],
        num_classes=config["model"]["num_classes"],
        base_filters=config["model"]["base_filters"],
        bilinear=config["model"]["bilinear"]
    ).to(device)

    if os.path.exists(checkpoint_path):
        checkpoint = torch.load(checkpoint_path, map_location=device)
        if "model_state_dict" in checkpoint:
            model.load_state_dict(checkpoint["model_state_dict"])
        else:
            model.load_state_dict(checkpoint)
        print(f" Loaded trained U-Net checkpoint: {checkpoint_path}")
    else:
        print(f" WARNING: Checkpoint '{checkpoint_path}' not found. Initializing untrained U-Net weights for demonstration.")

    model.eval()
    return model


def predict_sea_ice(
    image_input,
    model: UNet,
    config: dict,
    device: torch.device
) -> dict:
    """
    Python API for Sea-Ice Segmentation Inference.
    Designed for consumption by downstream models (Iceberg Detection, Route Optimization).
    
    Args:
        image_input (str or np.ndarray): Path to satellite image or numpy array
        model (UNet): Trained PyTorch U-Net model
        config (dict): Model configuration dict
        device (torch.device): PyTorch device (CUDA or CPU)

    Returns:
        dict: {
            "segmentation_mask": np.ndarray (H, W) uint8 class IDs,
            "class_percentages": dict {class_name: float},
            "probability_map": np.ndarray (C, H, W) float32 probabilities,
            "spatial_distribution": dict,
            "original_image": np.ndarray
        }
    """
    if isinstance(image_input, (str, Path)):
        img_raw = load_image(str(image_input))
    else:
        img_raw = image_input

    orig_h, orig_w = img_raw.shape[:2]
    img_size = config["training"]["image_size"]
    num_classes = config["model"]["num_classes"]
    class_names = config.get("classes", DEFAULT_CLASS_NAMES)

    # Prepare single-channel or 3-channel input matching config
    img_processed = img_raw.copy()
    if img_processed.ndim == 2:
        img_processed = np.expand_dims(img_processed, axis=-1)
    
    if config["model"]["in_channels"] == 1 and img_processed.shape[2] == 3:
        img_processed = img_processed[:, :, 0:1]

    # Preprocessing transform
    transform = A.Compose([
        A.Resize(img_size, img_size),
        A.Normalize(mean=(0.5,), std=(0.5,)),
        ToTensorV2()
    ])

    transformed = transform(image=img_processed)
    img_tensor = transformed["image"].unsqueeze(0).to(device, dtype=torch.float32)

    # Model Forward Pass
    with torch.no_grad():
        logits = model(img_tensor)
        probs = F.softmax(logits, dim=1).squeeze(0).cpu().numpy()  # (C, H, W)
        pred_mask_resized = np.argmax(probs, axis=0).astype(np.uint8)  # (H, W)

    # Resize prediction back to original dimensions
    import cv2
    pred_mask = cv2.resize(pred_mask_resized, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)

    # Calculate class percentages
    total_pixels = pred_mask.size
    class_percentages = {}
    spatial_distribution = {}

    for cls_id in range(num_classes):
        cls_name = class_names.get(cls_id, f"Class_{cls_id}")
        count = np.sum(pred_mask == cls_id)
        pct = (count / total_pixels) * 100.0
        class_percentages[cls_name] = round(pct, 2)
        spatial_distribution[cls_name] = {
            "pixel_count": int(count),
            "percentage": round(pct, 2)
        }

    return {
        "segmentation_mask": pred_mask,
        "class_percentages": class_percentages,
        "probability_map": probs,
        "spatial_distribution": spatial_distribution,
        "original_image": img_raw
    }


def main():
    parser = argparse.ArgumentParser(description="Run Sea-Ice Segmentation Inference (Model 1)")
    parser.add_argument("--image", type=str, required=True, help="Path to input Sentinel-1 SAR satellite image")
    parser.add_argument("--config", type=str, default="ml/configs/sea_ice.yaml", help="Path to config file")
    parser.add_argument("--checkpoint", type=str, default=None, help="Path to model checkpoint (.pth)")
    parser.add_argument("--save-mask", action="store_true", help="Save raw prediction mask as PNG")
    args = parser.parse_args()

    # Load configuration
    with open(args.config, "r") as f:
        cfg = yaml.safe_load(f)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f" Device: {device.type.upper()}")

    # Determine checkpoint path
    ckpt_path = args.checkpoint
    if not ckpt_path:
        ckpt_dir = Path(cfg["training"]["checkpoint_dir"])
        best_path = ckpt_dir / cfg["training"]["best_model_name"]
        latest_path = ckpt_dir / cfg["training"]["latest_model_name"]
        ckpt_path = str(best_path if best_path.exists() else latest_path)

    # Load Model
    model = load_model(ckpt_path, cfg, device)

    # Run Prediction
    result = predict_sea_ice(args.image, model, cfg, device)
    
    pred_mask = result["segmentation_mask"]
    class_percentages = result["class_percentages"]
    orig_img = result["original_image"]

    # Print Formatted Output Breakdown
    print("\n" + "═" * 45)
    print(" SEA-ICE SEGMENTATION INFERENCE OUTPUT")
    print("═" * 45)
    for cls_name, pct in class_percentages.items():
        print(f" {cls_name:<18}: {pct:5.1f}%")
    print("═" * 45 + "\n")

    # Save Output Mask & Visualization
    stem = Path(args.image).stem
    out_mask_dir = Path(cfg["output"]["masks_dir"])
    out_pred_dir = Path(cfg["output"]["predictions_dir"])
    os.makedirs(out_mask_dir, exist_ok=True)
    os.makedirs(out_pred_dir, exist_ok=True)

    mask_save_path = out_mask_dir / f"{stem}_mask.png"
    vis_save_path = out_pred_dir / f"{stem}_prediction.png"

    # Save PNG mask
    Image.fromarray(pred_mask).save(mask_save_path)
    print(f" Saved predicted mask : {mask_save_path}")

    # Generate 4-panel visualization plot
    visualize_prediction(
        image=orig_img,
        pred_mask=pred_mask,
        save_path=str(vis_save_path),
        title_suffix=stem,
        class_percentages=class_percentages
    )
    print(f" Saved visualization   : {vis_save_path}\n")


if __name__ == "__main__":
    main()
