"""
Visualization Module for Sea-Ice Segmentation Predictions (Model 1)
--------------------------------------------------------------------
Generates 4-panel diagnostic visualizations:
1. Original SAR Image
2. Ground-Truth Mask
3. Predicted Mask
4. Overlay (SAR + Mask overlay)

Includes color-coded legend for Open Water, Sea Ice, and Dense Ice.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import ListedColormap


# Standard PolarNav Color Palette for Sea Ice Classes
# 0: Open Water -> Deep Navy Blue (#0a1c38)
# 1: Sea Ice -> Cyan / Ice Blue (#38bdf8)
# 2: Dense Ice -> Pure White (#f8fafc)
PALETTE_RGB = np.array([
    [10, 28, 56],     # Class 0: Open Water (Deep Navy)
    [56, 189, 248],   # Class 1: Sea Ice (Cyan)
    [248, 250, 252]   # Class 2: Dense Ice (White)
], dtype=np.uint8)

COLORMAP = ListedColormap([
    '#0a1c38',  # Open Water
    '#38bdf8',  # Sea Ice
    '#f8fafc'   # Dense Ice
])


def mask_to_rgb(mask: np.ndarray) -> np.ndarray:
    """Convert integer mask (H, W) into RGB image (H, W, 3) using PALETTE_RGB."""
    h, w = mask.shape
    rgb = np.zeros((h, w, 3), dtype=np.uint8)
    for class_id in range(3):
        rgb[mask == class_id] = PALETTE_RGB[class_id]
    return rgb


def visualize_prediction(
    image: np.ndarray,
    pred_mask: np.ndarray,
    target_mask: np.ndarray = None,
    save_path: str = None,
    title_suffix: str = "",
    class_percentages: dict = None
):
    """
    Generate and save a 4-panel or 3-panel visualization figure.
    
    Args:
        image (np.ndarray): Original image (H, W) or (H, W, C) normalized in [0, 1] or [0, 255]
        pred_mask (np.ndarray): Integer prediction mask (H, W) with values 0, 1, 2
        target_mask (np.ndarray, optional): Integer ground-truth mask (H, W)
        save_path (str, optional): Path where visualization image will be saved
        title_suffix (str): Additional text for figure title
        class_percentages (dict, optional): Dict of class percentages for subtitle
    """
    # Ensure image is 2D grayscale or 3D RGB for display
    if image.ndim == 3 and image.shape[0] in [1, 3]:  # PyTorch (C, H, W)
        image = np.transpose(image, (1, 2, 0))
    if image.ndim == 3 and image.shape[2] == 1:
        image = image.squeeze(2)

    # Normalize image for display
    img_disp = image.copy().astype(np.float32)
    if img_disp.max() > 1.0:
        img_disp /= 255.0

    pred_rgb = mask_to_rgb(pred_mask)
    
    num_panels = 4 if target_mask is not None else 3
    fig, axes = plt.subplots(1, num_panels, figsize=(4 * num_panels, 4.5), dpi=150)
    fig.patch.set_facecolor('#050d17')

    # Panel 1: Original SAR Image
    ax1 = axes[0]
    if img_disp.ndim == 2:
        ax1.imshow(img_disp, cmap='gray')
    else:
        ax1.imshow(img_disp)
    ax1.set_title("Sentinel-1 SAR Image", color='white', fontsize=11, fontweight='bold', pad=10)
    ax1.axis('off')

    # Panel 2: Ground-Truth Mask (if provided)
    col_idx = 1
    if target_mask is not None:
        target_rgb = mask_to_rgb(target_mask)
        ax2 = axes[col_idx]
        ax2.imshow(target_rgb)
        ax2.set_title("Ground-Truth Mask", color='white', fontsize=11, fontweight='bold', pad=10)
        ax2.axis('off')
        col_idx += 1

    # Panel 3: Predicted Mask
    ax3 = axes[col_idx]
    ax3.imshow(pred_rgb)
    ax3.set_title("Predicted Sea-Ice Mask", color='cyan', fontsize=11, fontweight='bold', pad=10)
    ax3.axis('off')
    col_idx += 1

    # Panel 4: Overlay
    ax4 = axes[col_idx]
    if img_disp.ndim == 2:
        ax4.imshow(img_disp, cmap='gray')
    else:
        ax4.imshow(img_disp)
    ax4.imshow(pred_rgb, alpha=0.45)
    ax4.set_title("SAR + Mask Overlay", color='white', fontsize=11, fontweight='bold', pad=10)
    ax4.axis('off')

    # Legend patches
    legend_patches = [
        mpatches.Patch(color='#0a1c38', label='0 = Open Water'),
        mpatches.Patch(color='#38bdf8', label='1 = Sea Ice'),
        mpatches.Patch(color='#f8fafc', label='2 = Dense Ice')
    ]
    legend = fig.legend(
        handles=legend_patches,
        loc='lower center',
        ncol=3,
        frameon=True,
        facecolor='#0a1825',
        edgecolor='#38bdf8',
        fontsize=9,
        labelcolor='white'
    )

    title_str = "PolarNav Sea-Ice Segmentation (Model 1)"
    if title_suffix:
        title_str += f" — {title_suffix}"
    
    if class_percentages:
        perc_str = f"Open Water: {class_percentages.get('Open Water', 0):.1f}% | Sea Ice: {class_percentages.get('Sea Ice', 0):.1f}% | Dense Ice: {class_percentages.get('Dense Ice', 0):.1f}%"
        fig.suptitle(f"{title_str}\n{perc_str}", color='white', fontsize=12, y=0.98, fontweight='bold')
    else:
        fig.suptitle(title_str, color='white', fontsize=12, y=0.98, fontweight='bold')

    plt.tight_layout(rect=[0, 0.08, 1, 0.93])

    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, facecolor=fig.get_facecolor(), edgecolor='none')
        plt.close(fig)
    else:
        plt.show()
        plt.close(fig)
