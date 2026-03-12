#!/usr/bin/env python3
"""Generate improved Goal Getter splash screen."""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'images')

# Brand colors
CYAN = (0, 194, 255)
CYAN_LIGHT = (77, 216, 255)
CYAN_DARK = (0, 130, 200)
BLUE_DEEP = (0, 80, 160)
BG_DARK = (10, 22, 40)
BG_LIGHTER = (15, 35, 65)
WHITE = (255, 255, 255)


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def draw_gradient_ring(draw, center, outer_r, inner_r, img_w, img_h, color_top, color_bottom):
    cx, cy = center
    for y in range(max(0, int(cy - outer_r - 1)), min(img_h, int(cy + outer_r + 2))):
        for x in range(max(0, int(cx - outer_r - 1)), min(img_w, int(cx + outer_r + 2))):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx * dx + dy * dy)
            if inner_r <= dist <= outer_r:
                t = (y - (cy - outer_r)) / (2 * outer_r)
                t = max(0, min(1, t))
                color = lerp_color(color_top, color_bottom, t)
                alpha = 1.0
                if dist > outer_r - 1.5:
                    alpha = max(0, (outer_r - dist) / 1.5)
                elif dist < inner_r + 1.5:
                    alpha = max(0, (dist - inner_r) / 1.5)
                if alpha > 0:
                    draw.point((x, y), fill=color + (int(255 * alpha),))


def draw_gradient_circle(draw, center, radius, img_w, img_h, color_top, color_bottom):
    cx, cy = center
    for y in range(max(0, int(cy - radius - 1)), min(img_h, int(cy + radius + 2))):
        for x in range(max(0, int(cx - radius - 1)), min(img_w, int(cx + radius + 2))):
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
                    draw.point((x, y), fill=color + (int(255 * alpha),))


def generate_splash_icon(width=1284, height=2778):
    """Generate splash screen with centered target icon and text."""
    # Create background with subtle radial gradient
    img = Image.new('RGBA', (width, height), BG_DARK + (255,))
    draw = ImageDraw.Draw(img)

    # Radial gradient background
    cx, cy = width // 2, height // 2 - 80  # Slightly above center
    max_r = int(max(width, height) * 0.5)
    for r in range(max_r, 0, -2):  # Step by 2 for speed
        t = 1.0 - (r / max_r)
        color = lerp_color(BG_DARK, BG_LIGHTER, t * 0.5)
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=color + (255,)
        )

    # Target icon
    target_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    target_draw = ImageDraw.Draw(target_layer)

    icon_size = int(width * 0.28)  # Target icon size
    icon_cx, icon_cy = width // 2, height // 2 - 80

    ring_width = icon_size * 0.18
    gap_width = icon_size * 0.14

    # Outer ring
    outer_r = icon_size
    inner_r = outer_r - ring_width
    draw_gradient_ring(target_draw, (icon_cx, icon_cy), outer_r, inner_r, width, height, CYAN_LIGHT, CYAN_DARK)

    # Middle ring
    outer_r2 = inner_r - gap_width
    inner_r2 = outer_r2 - ring_width
    draw_gradient_ring(target_draw, (icon_cx, icon_cy), outer_r2, inner_r2, width, height, CYAN_LIGHT, BLUE_DEEP)

    # Inner ring
    outer_r3 = inner_r2 - gap_width
    inner_r3 = outer_r3 - ring_width
    draw_gradient_ring(target_draw, (icon_cx, icon_cy), outer_r3, inner_r3, width, height, CYAN_LIGHT, BLUE_DEEP)

    # Center dot
    dot_r = inner_r3 - gap_width * 0.5
    if dot_r > 0:
        draw_gradient_circle(target_draw, (icon_cx, icon_cy), dot_r, width, height, CYAN_LIGHT, CYAN_DARK)

    # Glow behind target
    glow_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_r = int(icon_size * 1.3)
    glow_draw.ellipse(
        [icon_cx - glow_r, icon_cy - glow_r, icon_cx + glow_r, icon_cy + glow_r],
        fill=CYAN + (30,)
    )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=icon_size * 0.4))

    img = Image.alpha_composite(img, glow_layer)
    img = Image.alpha_composite(img, target_layer)

    # Draw "GOAL GETTER" text
    text_draw = ImageDraw.Draw(img)
    text_y = icon_cy + icon_size + 80

    # Try to use a clean system font, fall back to default
    font_size = int(width * 0.065)
    font = None
    font_paths = [
        '/System/Library/Fonts/SFProDisplay-Bold.otf',
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/SFNSDisplay-Bold.otf',
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except (OSError, IOError):
                continue

    if font is None:
        font = ImageFont.load_default()

    text = "GOAL GETTER"

    # Get text bounding box
    bbox = text_draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_x = (width - text_w) // 2

    # Draw text with slight letter spacing effect by drawing character by character
    text_draw.text((text_x, text_y), text, fill=WHITE + (255,), font=font)

    # Also generate a splash-icon.png (just the icon portion for expo-splash-screen v2)
    # This is the icon without text, sized appropriately
    splash_icon_size = 288
    icon_img = Image.new('RGBA', (splash_icon_size * 3, splash_icon_size * 3), (0, 0, 0, 0))
    icon_draw = ImageDraw.Draw(icon_img)
    si_cx, si_cy = splash_icon_size * 3 // 2, splash_icon_size * 3 // 2
    si_r = splash_icon_size

    si_ring_w = si_r * 0.18
    si_gap_w = si_r * 0.14

    o_r = si_r
    i_r = o_r - si_ring_w
    draw_gradient_ring(icon_draw, (si_cx, si_cy), o_r, i_r, splash_icon_size * 3, splash_icon_size * 3, CYAN_LIGHT, CYAN_DARK)

    o_r2 = i_r - si_gap_w
    i_r2 = o_r2 - si_ring_w
    draw_gradient_ring(icon_draw, (si_cx, si_cy), o_r2, i_r2, splash_icon_size * 3, splash_icon_size * 3, CYAN_LIGHT, BLUE_DEEP)

    o_r3 = i_r2 - si_gap_w
    i_r3 = o_r3 - si_ring_w
    draw_gradient_ring(icon_draw, (si_cx, si_cy), o_r3, i_r3, splash_icon_size * 3, splash_icon_size * 3, CYAN_LIGHT, BLUE_DEEP)

    d_r = i_r3 - si_gap_w * 0.5
    if d_r > 0:
        draw_gradient_circle(icon_draw, (si_cx, si_cy), d_r, splash_icon_size * 3, splash_icon_size * 3, CYAN_LIGHT, CYAN_DARK)

    icon_img = icon_img.resize((splash_icon_size, splash_icon_size), Image.LANCZOS)

    return img.convert('RGB'), icon_img


if __name__ == '__main__':
    print("Generating splash screen (1284x2778)...")
    splash, splash_icon = generate_splash_icon()
    splash.save(os.path.join(OUTPUT_DIR, 'splash.png'), 'PNG', optimize=True)
    print("Generating splash-icon.png (288x288)...")
    splash_icon.save(os.path.join(OUTPUT_DIR, 'splash-icon.png'), 'PNG', optimize=True)
    print("Done! Splash assets saved to assets/images/")
