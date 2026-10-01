#!/usr/bin/env python3
"""Shift red trim on the Antifa tower and Antifa shrine plates to teal.

Stone gray, black cloth, and candle-flame yellow/orange stay. Alpha stays.
Writes the same public paths the game already serves.
"""

from __future__ import annotations

from PIL import Image

TARGET_H = 174.0  # #2ec4b6
PATHS = (
    "public/art/buildings/antifa tower.png",
    "public/art/buildings/Antifa shrine.png",
)


def hsv_of(r: int, g: int, b: int) -> tuple[float, float, float]:
    mx = max(r, g, b)
    mn = min(r, g, b)
    if mx == 0:
        return 0.0, 0.0, 0.0
    sat = (mx - mn) / mx
    if mx == mn:
        hue = 0.0
    else:
        d = mx - mn
        if mx == r:
            hue = ((g - b) / d) % 6
        elif mx == g:
            hue = (b - r) / d + 2
        else:
            hue = (r - g) / d + 4
        hue *= 60.0
    return hue, sat, mx / 255.0


def hsv_to_rgb(hue: float, sat: float, val: float) -> tuple[int, int, int]:
    sector = (hue % 360) / 60.0
    chroma = val * sat
    x = chroma * (1 - abs(sector % 2 - 1))
    m = val - chroma
    i = int(sector) % 6
    table = (
        (chroma, x, 0),
        (x, chroma, 0),
        (0, chroma, x),
        (0, x, chroma),
        (x, 0, chroma),
        (chroma, 0, x),
    )
    rp, gp, bp = table[i]
    return (
        max(0, min(255, int(round((rp + m) * 255)))),
        max(0, min(255, int(round((gp + m) * 255)))),
        max(0, min(255, int(round((bp + m) * 255)))),
    )


def is_red_accent(r: int, g: int, b: int, a: int) -> bool:
    if a < 8 or r < 16 or r < g or r < b:
        return False
    hue, sat, val = hsv_of(r, g, b)
    if hue > 180:
        hue -= 360
    # Candle cores are warmer than the trim and carry a strong green channel.
    if hue >= 15 and g >= r * 0.45 and val >= 0.45:
        return False
    if sat >= 0.33 and -22 <= hue <= 16:
        return True
    if sat >= 0.50 and 16 < hue <= 22 and g <= r * 0.48 and val < 0.72:
        return True
    return False


def recolor(path: str) -> int:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    changed = 0
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if not is_red_accent(r, g, b, a):
                continue
            _hue, sat, val = hsv_of(r, g, b)
            pixels[x, y] = (*hsv_to_rgb(TARGET_H, sat, val), a)
            changed += 1
    image.save(path, compress_level=6)
    return changed


def main() -> None:
    for path in PATHS:
        print(f"{path}: {recolor(path)} pixels")


if __name__ == "__main__":
    main()
