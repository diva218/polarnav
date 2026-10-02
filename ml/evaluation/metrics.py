"""
Evaluation Metrics for Sea-Ice Semantic Segmentation (Model 1)
--------------------------------------------------------------
Implements:
- Pixel Accuracy
- Mean Intersection over Union (mIoU)
- Per-Class IoU (Open Water, Sea Ice, Dense Ice)
- Per-Class & Mean Dice / F1-Score
- Confusion Matrix
"""

import numpy as np
import torch
from typing import Dict, Any


class SegmentationMetrics:
    def __init__(self, num_classes: int = 3, class_names: Dict[int, str] = None):
        self.num_classes = num_classes
        self.class_names = class_names or {0: "Open Water", 1: "Sea Ice", 2: "Dense Ice"}
        self.reset()

    def reset(self):
        """Reset confusion matrix state"""
        self.confusion_matrix = np.zeros((self.num_classes, self.num_classes), dtype=np.int64)

    def _fast_hist(self, label_true: np.ndarray, label_pred: np.ndarray) -> np.ndarray:
        """Compute confusion matrix for a single prediction-groundtruth pair"""
        mask = (label_true >= 0) & (label_true < self.num_classes)
        hist = np.bincount(
            self.num_classes * label_true[mask].astype(int) + label_pred[mask].astype(int),
            minlength=self.num_classes ** 2
        ).reshape(self.num_classes, self.num_classes)
        return hist

    def update(self, preds: torch.Tensor, targets: torch.Tensor):
        """
        Accumulate metrics over a batch.
        
        Args:
            preds (torch.Tensor): Logits (B, C, H, W) or class predictions (B, H, W)
            targets (torch.Tensor): Ground-truth class labels (B, H, W)
        """
        if preds.ndim == 4:
            preds = torch.argmax(preds, dim=1)

        preds_np = preds.detach().cpu().numpy().flatten()
        targets_np = targets.detach().cpu().numpy().flatten()

        self.confusion_matrix += self._fast_hist(targets_np, preds_np)

    def compute(self) -> Dict[str, Any]:
        """
        Compute final evaluation metrics from accumulated confusion matrix.
        
        Returns:
            dict containing pixel_accuracy, mean_iou, class_iou, mean_dice, class_dice
        """
        hist = self.confusion_matrix
        
        # Total pixels correctly classified
        acc = np.diag(hist).sum() / (hist.sum() + 1e-10)

        # Per-class Intersection & Union
        intersection = np.diag(hist)
        ground_truth_per_class = hist.sum(axis=1)
        predicted_per_class = hist.sum(axis=0)

        union = ground_truth_per_class + predicted_per_class - intersection
        
        # IoU per class
        iou = intersection / (union + 1e-10)
        mean_iou = np.nanmean(iou)

        # Dice / F1 score per class: 2*TP / (2*TP + FP + FN)
        dice = (2.0 * intersection) / (ground_truth_per_class + predicted_per_class + 1e-10)
        mean_dice = np.nanmean(dice)

        per_class_iou = {self.class_names.get(i, f"Class_{i}"): float(iou[i]) for i in range(self.num_classes)}
        per_class_dice = {self.class_names.get(i, f"Class_{i}"): float(dice[i]) for i in range(self.num_classes)}

        return {
            "pixel_accuracy": float(acc),
            "mean_iou": float(mean_iou),
            "mean_dice": float(mean_dice),
            "per_class_iou": per_class_iou,
            "per_class_dice": per_class_dice,
            "confusion_matrix": hist.tolist()
        }

    def print_summary(self, metrics: Dict[str, Any] = None):
        """Print clean formatted metric table"""
        if metrics is None:
            metrics = self.compute()

        print("\n" + "═" * 55)
        print(" SEA-ICE SEGMENTATION EVALUATION METRICS (MODEL 1)")
        print("═" * 55)
        print(f" Pixel Accuracy : {metrics['pixel_accuracy'] * 100:.2f}%")
        print(f" Mean IoU (mIoU): {metrics['mean_iou'] * 100:.2f}%")
        print(f" Mean Dice / F1 : {metrics['mean_dice'] * 100:.2f}%")
        print("─" * 55)
        print(" PER-CLASS PERFORMANCE:")
        for cls_name, iou_val in metrics["per_class_iou"].items():
            dice_val = metrics["per_class_dice"][cls_name]
            print(f"  • {cls_name:<18} | IoU: {iou_val*100:6.2f}% | Dice: {dice_val*100:6.2f}%")
        print("═" * 55 + "\n")
