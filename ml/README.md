# PolarNav ML — Sea-Ice Segmentation Model Pipeline (Model 1)

This module implements **Model 1: U-Net Sea-Ice Semantic Segmentation** for the PolarNav polar maritime navigation decision-support system. It processes Sentinel-1 Synthetic Aperture Radar (SAR) satellite imagery to produce pixel-level classification maps distinguishing:

1. **Open Water** (`Class 0`)
2. **Sea Ice** (`Class 1`)
3. **Dense / Compact Sea Ice** (`Class 2`)

---

## 📁 ML Project Structure

```
ml/
├── models/
│   └── unet.py                 # PyTorch U-Net architecture (configurable channels & classes)
├── datasets/
│   ├── raw/                    # Raw Sentinel-1 images (.tif/.png) and ground-truth masks
│   ├── processed/              # Verified preprocessed imagery
│   ├── train/                  # 70% Train split
│   ├── val/                    # 15% Validation split
│   └── test/                   # 15% Test split
├── training/
│   ├── train.py                # Main training pipeline (AdamW, AMP, Cosine Scheduler)
│   ├── validate.py             # Validation loop & metrics calculation
│   └── losses.py               # Combined Loss (CrossEntropyLoss + Multi-Class DiceLoss)
├── inference/
│   └── predict.py              # CLI & Python API for inference on new SAR imagery
├── preprocessing/
│   └── prepare_dataset.py      # Dataset validation, GeoTIFF loading, synthetic sample generator
├── evaluation/
│   └── metrics.py              # Pixel Accuracy, mIoU, Per-Class IoU, Dice/F1 score
├── visualization/
│   └── visualize_predictions.py# 4-Panel visual output generator with legends
├── configs/
│   └── sea_ice.yaml            # Centralized YAML configuration file
├── checkpoints/                # Model checkpoint storage (.pth)
├── outputs/
│   ├── masks/                  # Predicted raw PNG/NPY masks
│   ├── predictions/            # 4-Panel diagnostic visualization plots
│   └── plots/                  # Training history curves (loss, mIoU, accuracy)
├── requirements.txt            # Python dependencies
└── README.md                   # System documentation & usage guide
```

---

## 🛠️ 1. Environment Setup

Ensure Python 3.11+ is installed. Install all required ML dependencies:

```bash
pip install -r ml/requirements.txt
```

Key libraries:
- `torch` & `torchvision` (PyTorch deep learning framework)
- `rasterio` (Sentinel-1 GeoTIFF satellite raster I/O)
- `albumentations` (SAR satellite data augmentation)
- `opencv-python` & `pillow` (Image processing)
- `matplotlib` & `scikit-learn` (Visualization & metrics evaluation)

---

## 🛰️ 2. Dataset Setup & Preparation

### Dataset Structure
Place your raw Sentinel-1 SAR imagery and corresponding integer segmentation masks into:

```
ml/datasets/raw/images/   <- Sentinel-1 SAR images (.tif, .png, .jpg)
ml/datasets/raw/masks/    <- Integer masks (0=Water, 1=Sea Ice, 2=Dense Ice)
```

> **Mask Class Labels:**
> - `0` = Open Water
> - `1` = Sea Ice
> - `2` = Dense / Compact Sea Ice

### Dataset Verification & Splitting
Run `prepare_dataset.py` to validate dataset integrity (checks image-mask pair alignment, dimensions, and class IDs) and split the data into **70% Train / 15% Val / 15% Test**:

```bash
python ml/preprocessing/prepare_dataset.py
```

### Synthetic Pipeline Verification (No Satellite Data Required)
If you do not yet have raw Sentinel-1 GeoTIFF rasters locally, generate synthetic SAR satellite tiles to verify the complete end-to-end training and inference pipeline immediately:

```bash
python ml/preprocessing/prepare_dataset.py --create-synthetic --synthetic-samples 30
```

---

## 🚀 3. Training the Model

To train the U-Net sea-ice segmentation model using settings from `ml/configs/sea_ice.yaml`:

```bash
python ml/training/train.py
```

### Training Features:
- **Automatic Device Selection**: Uses CUDA GPU if available, otherwise CPU.
- **Combined Segmentation Loss**: `Loss = CrossEntropyLoss + DiceLoss`.
- **Optimization**: `AdamW` optimizer + `CosineAnnealingLR` scheduler.
- **Mixed Precision**: CUDA Automatic Mixed Precision (`torch.amp.autocast`) enabled for fast training.
- **Augmentation**: Albumentations flips, rotations, and contrast adjustments.
- **Checkpointing**: Automatically saves `best_unet_sea_ice.pth` (based on validation mIoU) and `latest_unet_sea_ice.pth`.

---

## 📊 4. Evaluation & Metrics

The validation and evaluation modules automatically calculate:
- **Pixel Accuracy**
- **Mean IoU (mIoU)**
- **Mean Dice / F1 Score**
- **Per-Class IoU & Dice** for:
  - Open Water
  - Sea Ice
  - Dense / Compact Ice

Sample evaluation printout:
```
=======================================================
 SEA-ICE SEGMENTATION EVALUATION METRICS (MODEL 1)
=======================================================
 Pixel Accuracy : 94.20%
 Mean IoU (mIoU): 88.50%
 Mean Dice / F1 : 93.80%
-------------------------------------------------------
 PER-CLASS PERFORMANCE:
  • Open Water         | IoU:  91.40% | Dice:  95.50%
  • Sea Ice            | IoU:  86.80% | Dice:  92.93%
  • Dense Ice          | IoU:  87.30% | Dice:  93.20%
=======================================================
```

Training loss and validation mIoU curves are automatically saved to `ml/outputs/plots/training_history.png`.

---

## 🔍 5. Running Inference

To run sea-ice segmentation on any Sentinel-1 satellite image:

```bash
python ml/inference/predict.py --image path/to/sar_image.png
```

### Command Output:
```
=============================================
 SEA-ICE SEGMENTATION INFERENCE OUTPUT
=============================================
 Open Water        :  42.3%
 Sea Ice           :  38.7%
 Dense Ice         :  19.0%
=============================================

 Saved predicted mask : ml/outputs/masks/sar_image_mask.png
 Saved visualization   : ml/outputs/predictions/sar_image_prediction.png
```

Visualizations are generated as 4-panel figures:
1. **Sentinel-1 SAR Image**
2. **Ground-Truth Mask**
3. **Predicted Sea-Ice Mask** (Color-coded legend)
4. **SAR + Mask Overlay**

---

## 🔗 6. Downstream Model Integration API

`ml/inference/predict.py` exposes a clean Python API for consumption by future models:

```python
from ml.inference.predict import predict_sea_ice, load_model
import torch, yaml

# Load config & model
with open("ml/configs/sea_ice.yaml") as f:
    cfg = yaml.safe_load(f)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = load_model("ml/checkpoints/best_unet_sea_ice.pth", cfg, device)

# Run inference
result = predict_sea_ice("path/to/sar_tile.tif", model, cfg, device)

# Access outputs for downstream models
mask = result["segmentation_mask"]            # (H, W) uint8 tensor (0, 1, 2)
percentages = result["class_percentages"]    # {"Open Water": 42.3, "Sea Ice": 38.7, ...}
prob_map = result["probability_map"]          # (C, H, W) float32 probabilities

# Future downstream models (Iceberg Detection, Route Optimization) consume `mask` and `prob_map`
```
