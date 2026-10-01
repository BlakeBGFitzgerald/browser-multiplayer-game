import { paletteFor, type ShopTheme } from "./giftShop.ts";
import { THUMB_N, thumbRgba } from "./giftThumbs.ts";

const cache = new Map<string, string>();

/** Cached data-URL thumbnail. Shop, bag, tooltip, and build tree share this. */
export function giftThumbUrl(painterId: string, theme: ShopTheme, px = 48): string {
  const key = `${painterId}:${theme}:${px}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rgba = thumbRgba(painterId, paletteFor(theme).bg);
  const n = THUMB_N;
  const cell = Math.max(1, Math.floor(px / n));
  const size = cell * n;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      const r = rgba[i] ?? 0;
      const g = rgba[i + 1] ?? 0;
      const b = rgba[i + 2] ?? 0;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}
