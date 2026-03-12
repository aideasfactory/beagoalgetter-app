#!/usr/bin/env python3
"""Generate improved Goal Getter app icon with gradient target and depth."""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'images')

# Brand colors
CYAN = (0, 194, 255)
CYAN_LIGHT = (77, 216, 255)
CYAN_DARK = (0, 130, 200)
BLUE_DEEP = (0, 80, 160)
BG_DARK = (10, 22, 40)  # #0a1628
BG_LIGHTER = (15, 35, 65)


def lerp_color(c1, c2, t):
    """Linear interpolate between two RGB colors."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_gradient_ring(draw, center, outer_r, inner_r, img_size, color_top, color_bottom):
    """Draw a ring with vertical gradient by drawing pixel by pixel."""
    cx, cy = center
    for y in range(max(0, int(cy - outer_r - 1)), min(img_size, int(cy + outer_r + 2))):
        for x in range(max(0, int(cx - outer_r - 1)), min(img_size, int(cx + outer_r + 2))):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            if inner_r <= dist <= outer_r:
                # Vertical gradient factor (0 at top, 1 at bottom)
                t = (y - (cy - outer_r)) / (2 * outer_r)
                t = max(0, min(1, t))
                color = lerp_color(color_top, color_bottom, t)
                # Anti-alias edges
                alpha = 1.0
                if dist > outer_r - 1.5:
                    alpha = max(0, (outer_r - dist) / 1.5)
                elif dist < inner_r + 1.5:
                    alpha = max(0, (dist - inner_r) / 1.5)
                if alpha > 0:
                    color_with_alpha = color + (int(255 * alpha),)
                    draw.point((x, y), fill=color_with_alpha)


def draw_gradient_circle(draw, center, radius, img_size, color_top, color_bottom):
    """Draw a filled circle with vertical gradient."""
    cx, cy = center
    for y in range(max(0, int(cy - radius - 1)), min(img_size, int(cy + radius + 2))):
        for x in range(max(0, int(cx - radius - 1)), min(img_size, int(cx + radius + 2))):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            if dist <= radius:
                t = (y - (cy - radius)) / (2 * radius)
                t = max(0, min(1, t))
                color = lerp_color(color_top, color_bottom, t)
                alpha = 1.0
                if dist > radius - 1.5:
                    alpha = max(0, (radius - dist) / 1.5)
                if alpha > 0:
                    color_with_alpha = color + (int(255 * alpha),)
                    draw.point((x, y), fill=color_with_alpha)


def create_radial_gradient_bg(size):
    """Create a dark background with subtle radial gradient for depth."""
    img = Image.new('RGBA', (size, size), BG_DARK + (255,))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    max_r = int(size * 0.7)

    for r in range(max_r, 0, -1):
        t = 1.0 - (r / max_r)
        color = lerp_color(BG_DARK, BG_LIGHTER, t * 0.6)
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=color + (255,)
        )
    return img


def generate_icon(size=1024, padding_factor=0.12):
    """Generate the main app icon."""
    # Background with radial gradient
    img = create_radial_gradient_bg(size)

    # Create target layer with transparency for glow
    target_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    target_draw = ImageDraw.Draw(target_layer)

    cx, cy = size // 2, size // 2
    padding = int(size * padding_factor)
    max_radius = (size // 2) - padding

    # Ring dimensions (3 cyan rings + 2 dark gaps + center dot)
    ring_width = max_radius * 0.18
    gap_width = max_radius * 0.14

    # Outer ring
    outer_r = max_radius
    inner_r = outer_r - ring_width
    draw_gradient_ring(target_draw, (cx, cy), outer_r, inner_r, size, CYAN_LIGHT, CYAN_DARK)

    # Middle ring
    outer_r2 = inner_r - gap_width
    inner_r2 = outer_r2 - ring_width
    draw_gradient_ring(target_draw, (cx, cy), outer_r2, inner_r2, size, CYAN_LIGHT, BLUE_DEEP)

    # Inner ring
    outer_r3 = inner_r2 - gap_width
    inner_r3 = outer_r3 - ring_width
    draw_gradient_ring(target_draw, (cx, cy), outer_r3, inner_r3, size, CYAN_LIGHT, BLUE_DEEP)

    # Center dot
    dot_r = inner_r3 - gap_width * 0.5
    if dot_r > 0:
        draw_gradient_circle(target_draw, (cx, cy), dot_r, size, CYAN_LIGHT, CYAN_DARK)

    # Create glow effect
    glow_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    # Draw bright cyan circles for glow source
    glow_draw.ellipse(
        [cx - max_radius, cy - max_radius, cx + max_radius, cy + max_radius],
        fill=CYAN + (40,)
    )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=size * 0.06))

    # Composite: bg -> glow -> target
    img = Image.alpha_composite(img, glow_layer)
    img = Image.alpha_composite(img, target_layer)

    return img.convert('RGB')


def generate_adaptive_icon(size=1024):
    """Generate adaptive icon with extra safe zone padding (Android)."""
    # Android adaptive icons need the foreground to fit within the inner 66% circle
    # So we add more padding
    return generate_icon(size, padding_factor=0.22)


def generate_favicon(size=48):
    """Generate a small favicon."""
    icon = generate_icon(512, padding_factor=0.08)
    return icon.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    print("Generating app icon (1024x1024)...")
    icon = generate_icon(1024)
    icon.save(os.path.join(OUTPUT_DIR, 'icon.png'), 'PNG', optimize=True)

    print("Generating adaptive icon (1024x1024)...")
    adaptive = generate_adaptive_icon(1024)
    adaptive.save(os.path.join(OUTPUT_DIR, 'adaptive-icon.png'), 'PNG', optimize=True)

    print("Generating favicon (48x48)...")
    fav = generate_favicon(48)
    fav.save(os.path.join(OUTPUT_DIR, 'favicon.png'), 'PNG', optimize=True)

    print("Done! Icons saved to assets/images/")
