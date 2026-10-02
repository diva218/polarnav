"""
Loss Functions for Sea-Ice Semantic Segmentation (Model 1)
---------------------------------------------------------
Combines CrossEntropyLoss and Multi-Class DiceLoss for robust boundary and class segmentation.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class DiceLoss(nn.Module):
    """
    Multi-Class Soft Dice Loss for Multi-Class Segmentation.
    """
    def __init__(self, num_classes: int = 3, smooth: float = 1e-6):
        super(DiceLoss, self).__init__()
        self.num_classes = num_classes
        self.smooth = smooth

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        """
        Args:
            logits: (B, num_classes, H, W) raw output from model
            targets: (B, H, W) integer mask with values in [0, num_classes-1]
        Returns:
            torch.Tensor: Scalar Dice loss
        """
        probabilities = F.softmax(logits, dim=1)
        
        # One-hot encode targets to shape (B, num_classes, H, W)
        targets_one_hot = F.one_hot(targets.long(), num_classes=self.num_classes)
        targets_one_hot = targets_one_hot.permute(0, 3, 1, 2).float()

        dice_loss = 0.0
        for class_idx in range(self.num_classes):
            prob = probabilities[:, class_idx, :, :]
            target = targets_one_hot[:, class_idx, :, :]

            intersection = torch.sum(prob * target)
            cardinality = torch.sum(prob) + torch.sum(target)

            dice = (2.0 * intersection + self.smooth) / (cardinality + self.smooth)
            dice_loss += (1.0 - dice)

        return dice_loss / self.num_classes


class CombinedSegmentationLoss(nn.Module):
    """
    Combined Loss = CrossEntropyLoss + DiceLoss
    
    Provides smooth gradient optimization from CrossEntropy while directly optimizing
    the spatial overlap metric via Dice Loss.
    """
    def __init__(self, num_classes: int = 3, ce_weight: float = 1.0, dice_weight: float = 1.0, class_weights: torch.Tensor = None):
        super(CombinedSegmentationLoss, self).__init__()
        self.ce = nn.CrossEntropyLoss(weight=class_weights)
        self.dice = DiceLoss(num_classes=num_classes)
        self.ce_weight = ce_weight
        self.dice_weight = dice_weight

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        ce_loss = self.ce(logits, targets.long())
        dice_loss = self.dice(logits, targets)
        total_loss = (self.ce_weight * ce_loss) + (self.dice_weight * dice_loss)
        return total_loss, ce_loss, dice_loss
