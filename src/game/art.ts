import { ITEMS } from "./heroes";
import { suppliedHeroUrl } from "./suppliedArt";
import { ABILITY_N, abilityRgba } from "./abilityIcons.ts";
import {
  drawPixelPortrait,
  drawPixelPromo,
  drawPixelSelectCard,
  type PromoKind,
} from "./pixelPaint";

export type HeroArtMode = "card" | "face" | "promo" | "ultimate" | "dlc" | "millix";

const CARD = 256;
const FACE = 128;
const PROMO_W = 512;
const PROMO_H = 288;
const heroUrls = new Map<string, string>();
const itemUrls = new Map<string, string>();
const iconUrls = new Map<string, string>();
const promoUrls = new Map<string, string>();

function canvas(w: number, h = w): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(8, 6, 4, 0.78)";
  ctx.lineWidth = Math.max(1.4, r * 0.08);
  ctx.stroke();
}

function oval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, rot = 0): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(8, 6, 4, 0.78)";
  ctx.lineWidth = Math.max(1.4, Math.min(rx, ry) * 0.08);
  ctx.stroke();
}

function drawHeroCanvas(id: string, skinId?: string, mode: HeroArtMode = "card"): HTMLCanvasElement {
  const size = mode === "face" ? FACE : CARD;
  const c = canvas(size);
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.imageSmoothingEnabled = false;
  if (mode === "face") drawPixelPortrait(ctx, id, size, skinId);
  else if (mode === "promo" || mode === "ultimate" || mode === "dlc" || mode === "millix") {
    const p = canvas(PROMO_W, PROMO_H);
    const px = p.getContext("2d");
    if (px) drawPixelPromo(px, id, mode === "promo" ? "spotlight" : mode, PROMO_W, PROMO_H, skinId);
    return p;
  } else drawPixelSelectCard(ctx, id, size, skinId);
  return c;
}

function drawItemCanvas(id: string): HTMLCanvasElement {
  const it = ITEMS.find((i) => i.id === id);
  const SIZE = 128;
  const c = canvas(SIZE);
  const ctx = c.getContext("2d");
  if (!ctx || !it) return c;
  const g = ctx.createLinearGradient(0, 0, 0, SIZE);
  g.addColorStop(0, "#6a4a22");
  g.addColorStop(0.22, "#3a2614");
  g.addColorStop(1, "#0a0704");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "rgba(90, 56, 20, 0.45)";
  for (let i = 0; i < 7; i++) ctx.fillRect(10, 14 + i * 16, SIZE - 20, 10);
  ctx.fillStyle = "rgba(201, 162, 74, 0.2)";
  for (let i = 0; i < 6; i++) ctx.fillRect(12, 16 + i * 18, SIZE - 24, 2);
  ctx.fillStyle = "rgba(16, 12, 8, 0.5)";
  ctx.beginPath();
  ctx.ellipse(64, 110, 44, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 9;
  ctx.strokeRect(4, 4, SIZE - 8, SIZE - 8);
  ctx.strokeStyle = "#efe6d6";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, SIZE - 24, SIZE - 24);
  ctx.fillStyle = "#f0c14a";
  ctx.fillRect(4, 4, 12, 12);
  ctx.fillRect(SIZE - 16, 4, 12, 12);
  ctx.fillRect(4, SIZE - 16, 12, 12);
  ctx.fillRect(SIZE - 16, SIZE - 16, 12, 12);
  ctx.fillStyle = "rgba(240, 193, 74, 0.22)";
  ctx.fillRect(12, 12, SIZE - 24, 10);
  if (id === "cleats") {
    oval(ctx, 64, 72, 40, 18, "#c4161c");
    ctx.fillStyle = "#f0c14a";
    ctx.fillRect(38, 66, 52, 6);
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(34, 80, 60, 12);
    for (let i = 0; i < 5; i++) ctx.fillRect(40 + i * 10, 90, 5, 12);
    ctx.fillStyle = "rgba(255, 246, 228, 0.35)";
    ctx.fillRect(42, 68, 18, 3);
    return c;
  }
  if (id === "text") {
    ctx.fillStyle = "#7ec8ff";
    ctx.fillRect(30, 26, 68, 80);
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(60, 30, 8, 72);
    ctx.fillStyle = "#1a120c";
    for (let i = 0; i < 5; i++) ctx.fillRect(36, 38 + i * 12, 20, 5);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(34, 30, 20, 8);
    return c;
  }
  if (id === "meal") {
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(22, 46, 84, 52);
    disc(ctx, 48, 70, 16, "#c4161c");
    disc(ctx, 80, 70, 13, "#d4a017");
    ctx.fillStyle = "#8a9a6a";
    ctx.fillRect(38, 90, 52, 10);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(28, 50, 28, 8);
    return c;
  }
  if (id === "coat") {
    ctx.fillStyle = "#efe6d6";
    ctx.beginPath();
    ctx.moveTo(34, 26);
    ctx.lineTo(94, 26);
    ctx.lineTo(102, 110);
    ctx.lineTo(26, 110);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5ad45a";
    ctx.fillRect(57, 26, 14, 84);
    disc(ctx, 48, 56, 5, "#c9a24a");
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.fillRect(38, 30, 16, 10);
    return c;
  }
  if (id === "tray") {
    ctx.fillStyle = "#d8c4a0";
    ctx.fillRect(20, 50, 88, 48);
    ctx.fillStyle = "#9a7a48";
    ctx.fillRect(20, 46, 88, 10);
    ctx.fillRect(20, 94, 88, 10);
    disc(ctx, 48, 72, 15, "#c4161c");
    disc(ctx, 76, 70, 12, "#e07020");
    disc(ctx, 62, 86, 9, "#f0c14a");
    ctx.fillStyle = "rgba(232, 112, 32, 0.55)";
    ctx.beginPath();
    ctx.ellipse(92, 64, 16, 10, 0.4, 0, Math.PI * 2);
    ctx.fill();
    return c;
  }
  if (id === "pen") {
    ctx.save();
    ctx.translate(64, 64);
    ctx.rotate(-0.7);
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(-9, -48, 18, 76);
    ctx.fillStyle = "#1a120c";
    ctx.beginPath();
    ctx.moveTo(-9, 28);
    ctx.lineTo(0, 50);
    ctx.lineTo(9, 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(-9, -18, 18, 9);
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(-4, -48, 8, 14);
    ctx.restore();
    ctx.fillStyle = "#c4161c";
    ctx.font = "700 16px Anton, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CRIT", 64, 118);
    return c;
  }
  if (id === "flare") {
    ctx.fillStyle = "#f0c14a";
    ctx.fillRect(58, 28, 12, 36);
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(48, 62, 32, 28);
    ctx.fillStyle = "#fff8e0";
    ctx.fillRect(60, 34, 8, 12);
    return c;
  }
  if (id === "smoke") {
    ctx.fillStyle = "#9aa0a8";
    ctx.fillRect(46, 50, 36, 40);
    ctx.fillStyle = "#d0d4dc";
    ctx.fillRect(40, 36, 22, 16);
    ctx.fillRect(62, 28, 18, 14);
    ctx.fillRect(78, 40, 14, 12);
    return c;
  }
  if (id === "lantern") {
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(50, 40, 28, 36);
    ctx.fillStyle = "#ffe08a";
    ctx.fillRect(56, 48, 16, 18);
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(60, 28, 8, 14);
    return c;
  }
  if (id === "plate") {
    ctx.fillStyle = "#8aa0b4";
    ctx.fillRect(28, 36, 72, 56);
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(36, 48, 56, 8);
    ctx.fillRect(36, 68, 56, 8);
    return c;
  }
  if (id === "banner") {
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(36, 28, 40, 64);
    ctx.fillStyle = "#f0c14a";
    ctx.fillRect(72, 28, 8, 78);
    ctx.fillRect(42, 40, 28, 8);
    return c;
  }
  if (id === "crown") {
    ctx.fillStyle = "#f0c14a";
    ctx.fillRect(28, 58, 72, 22);
    ctx.fillRect(28, 40, 14, 22);
    ctx.fillRect(57, 32, 14, 30);
    ctx.fillRect(86, 40, 14, 22);
    return c;
  }
  if (id === "aegis") {
    ctx.fillStyle = "#3ec8c1";
    ctx.beginPath();
    ctx.moveTo(64, 24);
    ctx.lineTo(100, 44);
    ctx.lineTo(90, 96);
    ctx.lineTo(64, 112);
    ctx.lineTo(38, 96);
    ctx.lineTo(28, 44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0c1c1a";
    ctx.fillRect(58, 52, 12, 32);
    return c;
  }
  if (id === "hourglass") {
    ctx.fillStyle = "#f0c14a";
    ctx.fillRect(40, 28, 48, 10);
    ctx.fillRect(40, 90, 48, 10);
    ctx.beginPath();
    ctx.moveTo(46, 38);
    ctx.lineTo(82, 38);
    ctx.lineTo(64, 64);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(64, 64);
    ctx.lineTo(82, 90);
    ctx.lineTo(46, 90);
    ctx.closePath();
    ctx.fill();
    return c;
  }
  if (id === "ulock") {
    ctx.strokeStyle = "#c9a24a";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(38, 70);
    ctx.arc(64, 50, 26, Math.PI, 0);
    ctx.lineTo(90, 70);
    ctx.stroke();
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(30, 66, 68, 30);
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(57, 74, 14, 14);
    ctx.fillStyle = "rgba(255,246,228,0.28)";
    ctx.fillRect(36, 70, 20, 6);
    return c;
  }
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(26, 30, 76, 72);
  ctx.fillStyle = "#1a120c";
  ctx.font = "700 22px Anton, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DEAN", 64, 74);
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(38, 86, 52, 7);
  ctx.fillStyle = "rgba(255,246,228,0.28)";
  ctx.fillRect(32, 36, 28, 8);
  return c;
}

export function heroArtUrl(id: string, skinId?: string, mode: HeroArtMode = "card"): string {
  const supplied = suppliedHeroUrl(id);
  if (supplied) return supplied;
  const key = `${mode}:${id}:${skinId || ""}`;
  const hit = heroUrls.get(key);
  if (hit) return hit;
  const url = drawHeroCanvas(id, skinId, mode).toDataURL("image/png");
  heroUrls.set(key, url);
  return url;
}

export function itemArtUrl(id: string): string {
  const hit = itemUrls.get(id);
  if (hit) return hit;
  const url = drawItemCanvas(id).toDataURL("image/png");
  itemUrls.set(id, url);
  return url;
}

export function abilityArtUrl(id: string, key: "Q" | "W" | "E" | "R" | "P"): string {
  const k = `${id}:${key}`;
  const hit = iconUrls.get(k);
  if (hit) return hit;
  const rgba = abilityRgba(id, key);
  const c = canvas(ABILITY_N);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error(`missing ability icon: ${k}`);
  const img = ctx.createImageData(ABILITY_N, ABILITY_N);
  img.data.set(rgba);
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL("image/png");
  iconUrls.set(k, url);
  return url;
}

export function promoArtUrl(id: string, kind: PromoKind = "spotlight", skinId?: string): string {
  const supplied = suppliedHeroUrl(id);
  if (supplied) return supplied;
  const k = `${kind}:${id}:${skinId || ""}`;
  const hit = promoUrls.get(k);
  if (hit) return hit;
  const c = canvas(PROMO_W, PROMO_H);
  const ctx = c.getContext("2d");
  if (ctx) drawPixelPromo(ctx, id, kind, PROMO_W, PROMO_H, skinId);
  const url = c.toDataURL("image/png");
  promoUrls.set(k, url);
  return url;
}

export function artImg(kind: "hero" | "item", id: string, name: string, cls: string, skinId?: string, mode: HeroArtMode = "card"): string {
  const src = kind === "hero" ? heroArtUrl(id, skinId, mode) : itemArtUrl(id);
  const dim = kind === "hero" ? (mode === "face" ? 128 : 256) : 72;
  return `<img class="${cls}" alt="${name}" src="${src}" width="${dim}" height="${dim}" />`;
}

export function abilityImg(id: string, key: "Q" | "W" | "E" | "R" | "P", name: string): string {
  const kind = key === "P" ? " passive" : key === "R" ? " ult" : "";
  return `<img class="skill-art${kind}" alt="${name}" src="${abilityArtUrl(id, key)}" width="64" height="64" />`;
}

export function promoImg(id: string, kind: PromoKind, name: string, cls = "promo-art"): string {
  return `<img class="${cls}" alt="${name}" src="${promoArtUrl(id, kind)}" width="512" height="288" />`;
}

export function itemName(id: string): string {
  return ITEMS.find((i) => i.id === id)?.name ?? id;
}
