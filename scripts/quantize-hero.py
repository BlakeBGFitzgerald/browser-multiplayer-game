#!/usr/bin/env python3
"""Box-downsample a supplied pixel-art still to a 96×128 C42 sheet module."""
from __future__ import annotations

import argparse
import base64
import collections
import json
from pathlib import Path

from PIL import Image


def is_bg(c: tuple[int, int, int]) -> bool:
    r, g, b = c[:3]
    return r > 240 and g > 240 and b > 240


def bbox(im: Image.Image) -> tuple[int, int, int, int]:
    w, h = im.size
    px = im.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            a = c[3] if len(c) > 3 else 255
            if a < 20:
                continue
            if is_bg(c):
                continue
            if x < minx:
                minx = x
            if y < miny:
                miny = y
            if x > maxx:
                maxx = x
            if y > maxy:
                maxy = y
    return max(0, minx - 8), max(0, miny - 8), min(w - 1, maxx + 8), min(h - 1, maxy + 8)


def quantize(
    src: Path,
    name: str,
    out_ts: Path,
    out_png: Path,
    tw: int = 80,
    th: int = 120,
    cw: int = 96,
    ch: int = 128,
    contain: bool = False,
    colors: int = 28,
) -> None:
    raw = Image.open(src).convert("RGBA")
    x0, y0, x1, y1 = bbox(raw)
    crop = raw.crop((x0, y0, x1 + 1, y1 + 1))
    if contain:
        aspect = crop.size[0] / max(1, crop.size[1])
        box_w, box_h = tw, th
        if aspect > box_w / box_h:
            tw = box_w
            th = max(8, round(box_w / aspect))
        else:
            th = box_h
            tw = max(8, round(box_h * aspect))
        tw -= tw % 2
        th -= th % 2
    p = crop.load()
    cw0, ch0 = crop.size
    for y in range(ch0):
        for x in range(cw0):
            r, g, b, a = p[x, y]
            if a < 20 or is_bg((r, g, b)):
                p[x, y] = (0, 0, 0, 0)
    small = crop.resize((tw, th), Image.BOX)
    opaque = Image.new("RGB", (tw, th), (255, 255, 255))
    op = opaque.load()
    sp = small.load()
    mask = Image.new("L", (tw, th), 0)
    mp = mask.load()
    for y in range(th):
        for x in range(tw):
            r, g, b, a = sp[x, y]
            if a > 80:
                op[x, y] = (r, g, b)
                mp[x, y] = 255
    q = opaque.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    qp = q.load()
    out = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    opx = out.load()
    ink = (16, 12, 8, 255)
    for y in range(th):
        for x in range(tw):
            if mp[x, y] < 80:
                continue
            r, g, b = qp[x, y]
            if r > 248 and g > 248 and b > 248:
                continue
            if r < 36 and g < 30 and b < 28:
                opx[x, y] = ink
            else:
                opx[x, y] = (r, g, b, 255)
    for y in range(1, th - 1):
        for x in range(1, tw - 1):
            if opx[x, y][3] == 0:
                continue
            n = 0
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    if opx[x + dx, y + dy][3]:
                        n += 1
            if n <= 1:
                opx[x, y] = (0, 0, 0, 0)
    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    ox = (cw - tw) // 2
    oy = ch - th - 2
    canvas.paste(out, (ox, oy), out)
    out_png.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_png)
    pal: collections.Counter[tuple[int, int, int, int]] = collections.Counter()
    for y in range(ch):
        for x in range(cw):
            c = canvas.getpixel((x, y))
            if c[3]:
                pal[c] += 1
    palette = [c for c, _ in pal.most_common()]
    index = {c: i for i, c in enumerate(palette)}
    pix = bytearray()
    for y in range(ch):
        for x in range(cw):
            c = canvas.getpixel((x, y))
            pix.append(255 if c[3] == 0 else index[c])
    hexes = [f"#{c[0]:02x}{c[1]:02x}{c[2]:02x}" for c in palette]
    b64 = base64.b64encode(bytes(pix)).decode()
    const = name.upper()
    out_ts.write_text(
        f'''/** Quantized {name} sheet. 96×128 native C42. */
export const {const}_W = {cw};
export const {const}_H = {ch};
export const {const}_OX = {ox};
export const {const}_OY = {oy};
export const {const}_PAL = {json.dumps(hexes)};
export const {const}_PIX = "{b64}";
'''
    )
    print(name, "pal", len(palette), "opaque", sum(pal.values()), "->", out_ts)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("src")
    p.add_argument("name")
    p.add_argument("ts")
    p.add_argument("png")
    p.add_argument("--contain", action="store_true")
    p.add_argument("--colors", type=int, default=28)
    p.add_argument("--tw", type=int, default=80)
    p.add_argument("--th", type=int, default=120)
    p.add_argument("--cw", type=int, default=96)
    p.add_argument("--ch", type=int, default=128)
    a = p.parse_args()
    quantize(
        Path(a.src),
        a.name,
        Path(a.ts),
        Path(a.png),
        tw=a.tw,
        th=a.th,
        cw=a.cw,
        ch=a.ch,
        contain=a.contain,
        colors=a.colors,
    )


if __name__ == "__main__":
    main()
