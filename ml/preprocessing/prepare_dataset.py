"""
Dataset Preprocessing, Data Validation, and Train/Val/Test Split (Model 1)
--------------------------------------------------------------------------
Loads Sentinel-1 SAR satellite imagery and pixel-level sea-ice masks.
Performs data integrity verification before splitting into 70% Train / 15% Val / 15% Test.

Supports GeoTIFF (.tif / .tiff) via rasterio and standard images (.png / .jpg) via OpenCV/PIL.
Includes a `--create-synthetic` mode for instant end-to-end pipeline verification.
"""

import os
import glob
import shutil
import argparse
import numpy as np
import yaml
from pathlib import Path
from typing import List, Tuple, Dict

# Optional rasterio import with fallback
try:
    import rasterio
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False

import cv2
from PIL import Image


def load_config(config_path: str = "ml/configs/sea_ice.yaml") -> dict:
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def load_image(filepath: str) -> np.ndarray:
    """Load image from GeoTIFF or standard image format."""
    ext = Path(filepath).suffix.lower()
    if ext in ['.tif', '.tiff'] and HAS_RASTERIO:
        with rasterio.open(filepath) as src:
            img = src.read()  # (Channels, Height, Width)
            if img.shape[0] == 1:
                img = img[0]  # (Height, Width)
            else:
                img = np.transpose(img, (1, 2, 0))
            return img
    
    # OpenCV / PIL fallback
    img = cv2.imread(filepath, cv2.IMREAD_UNCHANGED)
    if img is None:
        pil_img = Image.open(filepath)
        img = np.array(pil_img)
    if img.ndim == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return img


def load_mask(filepath: str) -> np.ndarray:
    """Load mask file as integer class IDs (0=Open Water, 1=Sea Ice, 2=Dense Ice)."""
    mask = load_image(filepath)
    if mask.ndim == 3:
        mask = mask[:, :, 0]  # Take first channel if 3D
    return mask.astype(np.int64)


def validate_dataset(image_paths: List[str], mask_paths: List[str], num_classes: int = 3) -> Tuple[bool, List[str]]:
    """
    Validate dataset integrity:
    1. Every image has a corresponding mask.
    2. Image dimensions match mask dimensions.
    3. Masks contain ONLY valid integer class IDs [0, num_classes-1].
    4. Files are not corrupted or unreadable.
    """
    errors = []
    print(" Verifying dataset integrity...")
    
    mask_lookup = {Path(p).stem: p for p in mask_paths}
    
    for img_path in image_paths:
        stem = Path(img_path).stem
        if stem not in mask_lookup:
            errors.append(f"Missing matching mask for image: {img_path}")
            continue

        mask_path = mask_lookup[stem]
        
        try:
            img = load_image(img_path)
            mask = load_mask(mask_path)
        except Exception as e:
            errors.append(f"Corrupt or unreadable file pair [{img_path} / {mask_path}]: {e}")
            continue

        # Dimension check
        img_h, img_w = img.shape[:2]
        mask_h, mask_w = mask.shape[:2]
        if (img_h, img_w) != (mask_h, mask_w):
            errors.append(f"Dimension mismatch! Image {img_path} ({img_h}x{img_w}) vs Mask {mask_path} ({mask_h}x{mask_w})")

        # Class ID range check
        unique_classes = np.unique(mask)
        invalid_classes = [c for c in unique_classes if c not in range(num_classes)]
        if invalid_classes:
            errors.append(f"Mask {mask_path} contains invalid class IDs: {invalid_classes}. Expected only {list(range(num_classes))}")

    is_valid = len(errors) == 0
    return is_valid, errors


def split_dataset(
    pairs: List[Tuple[str, str]],
    split_ratio: List[float] = [0.70, 0.15, 0.15],
    seed: int = 42
) -> Dict[str, List[Tuple[str, str]]]:
    """Deterministically split dataset pairs into train, val, and test splits."""
    assert abs(sum(split_ratio) - 1.0) < 1e-4, "Split ratios must sum to 1.0"
    
    np.random.seed(seed)
    indices = np.arange(len(pairs))
    np.random.shuffle(indices)

    n_total = len(pairs)
    n_train = int(n_total * split_ratio[0])
    n_val = int(n_total * split_ratio[1])

    train_indices = indices[:n_train]
    val_indices = indices[n_train:n_train + n_val]
    test_indices = indices[n_train + n_val:]

    return {
        "train": [pairs[i] for i in train_indices],
        "val": [pairs[i] for i in val_indices],
        "test": [pairs[i] for i in test_indices]
    }


def copy_split_files(splits: Dict[str, List[Tuple[str, str]]], base_dir: str = "ml/datasets"):
    """Copy or save split file pairs into train/, val/, and test/ subdirectories."""
    for split_name, pairs in splits.items():
        split_img_dir = Path(base_dir) / split_name / "images"
        split_mask_dir = Path(base_dir) / split_name / "masks"

        os.makedirs(split_img_dir, exist_ok=True)
        os.makedirs(split_mask_dir, exist_ok=True)

        for img_path, mask_path in pairs:
            shutil.copy2(img_path, split_img_dir / Path(img_path).name)
            shutil.copy2(mask_path, split_mask_dir / Path(mask_path).name)

    print(f" Dataset successfully prepared and split:")
    print(f"   • Train: {len(splits['train'])} samples ({Path(base_dir)/'train'})")
    print(f"   • Val  : {len(splits['val'])} samples ({Path(base_dir)/'val'})")
    print(f"   • Test : {len(splits['test'])} samples ({Path(base_dir)/'test'})")


def create_synthetic_dataset(num_samples: int = 30, image_size: int = 512, raw_dir: str = "ml/datasets/raw"):
    """
    Generate synthetic Sentinel-1 SAR imagery and pixel ground-truth masks
    for rapid end-to-end pipeline testing when no raw satellite dataset is present.
    """
    img_dir = Path(raw_dir) / "images"
    mask_dir = Path(raw_dir) / "masks"
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(mask_dir, exist_ok=True)

    print(f"\n Generating {num_samples} synthetic Sentinel-1 SAR tiles in {raw_dir}...")
    np.random.seed(42)

    for i in range(num_samples):
        # Generate synthetic SAR backscatter (speckle noise + radar intensities)
        noise = np.random.gamma(shape=2.0, scale=0.1, size=(image_size, image_size))
        
        # Create continuous spatial structures using distance transforms / circles
        x = np.linspace(-1, 1, image_size)
        y = np.linspace(-1, 1, image_size)
        xx, yy = np.meshgrid(x, y)
        r = np.sqrt(xx**2 + yy**2)

        mask = np.zeros((image_size, image_size), dtype=np.uint8)
        mask[r < 0.75] = 1   # Class 1: Sea Ice
        mask[r < 0.40] = 2   # Class 2: Dense/Compact Ice

        # Add random ice floe shapes
        for _ in range(5):
            cx, cy = np.random.uniform(-0.6, 0.6, 2)
            cr = np.random.uniform(0.1, 0.25)
            dist = np.sqrt((xx - cx)**2 + (yy - cy)**2)
            mask[dist < cr] = np.random.choice([1, 2])

        # Synthesize SAR backscatter intensities per class
        sar_img = np.zeros((image_size, image_size), dtype=np.float32)
        sar_img[mask == 0] = np.random.normal(30, 10, (mask == 0).sum())   # Open water: dark radar backscatter
        sar_img[mask == 1] = np.random.normal(140, 25, (mask == 1).sum()) # Sea Ice: medium radar backscatter
        sar_img[mask == 2] = np.random.normal(210, 20, (mask == 2).sum()) # Dense Ice: bright radar backscatter

        sar_img = np.clip(sar_img * noise, 0, 255).astype(np.uint8)

        img_path = img_dir / f"sar_tile_{i+1:03d}.png"
        mask_path = mask_dir / f"sar_tile_{i+1:03d}.png"

        Image.fromarray(sar_img).save(img_path)
        Image.fromarray(mask).save(mask_path)

    print(f" Synthetic dataset created successfully with {num_samples} samples.")


def main():
    parser = argparse.ArgumentParser(description="PolarNav Sea-Ice Dataset Preprocessing & Verification")
    parser.add_argument("--config", type=str, default="ml/configs/sea_ice.yaml", help="Path to config YAML")
    parser.add_argument("--create-synthetic", action="store_true", help="Generate synthetic samples for pipeline testing")
    parser.add_argument("--synthetic-samples", type=int, default=30, help="Number of synthetic samples to generate")
    args = parser.parse_args()

    cfg = load_config(args.config)
    raw_dir = cfg["dataset"]["raw_dir"]
    base_dir = Path(raw_dir).parent

    if args.create_synthetic or not os.path.exists(Path(raw_dir) / "images"):
        create_synthetic_dataset(num_samples=args.synthetic_samples, image_size=cfg["training"]["image_size"], raw_dir=raw_dir)

    img_dir = Path(raw_dir) / "images"
    mask_dir = Path(raw_dir) / "masks"

    supported_exts = cfg["dataset"]["supported_extensions"]
    image_paths = sorted([str(p) for p in img_dir.glob("*") if p.suffix.lower() in supported_exts])
    mask_paths = sorted([str(p) for p in mask_dir.glob("*") if p.suffix.lower() in supported_exts])

    if not image_paths or not mask_paths:
        print(f"\n No dataset files found in {raw_dir}.")
        print("   Please place raw SAR images in: ml/datasets/raw/images/")
        print("   Please place ground-truth masks in: ml/datasets/raw/masks/")
        print("   Or run with --create-synthetic to generate sample data.\n")
        return

    # Data Validation
    is_valid, errors = validate_dataset(image_paths, mask_paths, num_classes=cfg["model"]["num_classes"])
    
    if not is_valid:
        print("\n DATASET VALIDATION FAILED:")
        for err in errors:
            print(f"   [ERROR] {err}")
        raise RuntimeError("Dataset verification failed. Fix errors listed above before training.")

    print(f" Dataset validation passed successfully! ({len(image_paths)} valid sample pairs)")

    # Pair images and masks
    mask_lookup = {Path(p).stem: p for p in mask_paths}
    pairs = [(img_path, mask_lookup[Path(img_path).stem]) for img_path in image_paths]

    # Split dataset
    splits = split_dataset(pairs, split_ratio=cfg["dataset"]["split_ratio"], seed=cfg["training"]["seed"])

    # Copy to dataset folders
    copy_split_files(splits, base_dir=str(base_dir))


if __name__ == "__main__":
    main()
