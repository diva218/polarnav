"""
Validation Module for Sea-Ice Semantic Segmentation (Model 1)
--------------------------------------------------------------
Evaluates model state on validation/test DataLoaders and computes
loss, pixel accuracy, mIoU, and per-class metrics.
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from typing import Dict, Any, Tuple

from ml.evaluation.metrics import SegmentationMetrics


def validate_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    num_classes: int = 3,
    class_names: Dict[int, str] = None
) -> Tuple[float, Dict[str, Any]]:
    """
    Run evaluation pass over dataloader.
    
    Returns:
        Tuple[float, Dict[str, Any]]: (average_val_loss, metrics_dictionary)
    """
    model.eval()
    metrics_calc = SegmentationMetrics(num_classes=num_classes, class_names=class_names)
    total_loss = 0.0
    total_samples = 0

    with torch.no_grad():
        for images, targets in dataloader:
            images = images.to(device, dtype=torch.float32)
            targets = targets.to(device, dtype=torch.long)

            logits = model(images)
            loss, ce_loss, dice_loss = criterion(logits, targets)

            total_loss += loss.item() * images.size(0)
            total_samples += images.size(0)

            # Update confusion matrix and metrics
            metrics_calc.update(logits, targets)

    avg_loss = total_loss / max(1, total_samples)
    metrics_summary = metrics_calc.compute()
    metrics_summary["val_loss"] = avg_loss

    return avg_loss, metrics_summary
