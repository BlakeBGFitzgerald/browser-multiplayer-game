import { skinById } from "../dlc";
import { sheetDef } from "./sheetDefs";
import { paintHeroSheet } from "./sheetPaint";
import { computeRig, faceOf, type AttackLimb, type Face, type PixelPose, type Rig } from "./pixelC32";
import { SNOWBALL_HERO_ID } from "./heroHeight";
import { snowballPhase } from "./snowball";
import { attackArmPulse, INK_PUNCH_REACH } from "./punchArms";
import { runningArmPose, runningArmSwing } from "./runArms";
import { paintSkinBody } from "./skinMotion";
import { type BodyStyle, type HairStyle, type PixelKit, type PropStyle } from "./pixelRoster";

/** C42 pixel bible: 128×128 native, nearest blit. Grump uses the supplied sheet. Same kits and poses. */
export const INK_SIZE = 128;
const WHITE = "#fff6e4";
const INK = "#1a1008";
const LIP = "#c07070";
const MOUTH = "#6a2020";
const SCALE = 2;

function clamp255(n: number): number {
  const v = Math.round(n);
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexOf(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp255(v).toString(16).padStart(2, "0")).join("")}`;
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgbOf(a);
  const [br, bg, bb] = rgbOf(b);
  return hexOf(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function dim(c: string, t = 0.38): string {
  return mix(c, INK, t);
}

function lit(c: string, t = 0.32): string {
  return mix(c, WHITE, t);
}

function wearKit(kit: PixelKit, skinId?: string): PixelKit {
  if (!skinId) return kit;
  const s = skinById(skinId);
  if (!s) return kit;
  return {
    ...kit,
    coat: mix(kit.coat, s.tint, 0.42),
    coatHi: mix(kit.coatHi, s.tint, 0.28),
    coatLo: mix(kit.coatLo, s.tint, 0.22),
    accent: mix(kit.accent, s.tint, 0.35),
  };
}

function oval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient): void {
  const cx = Math.round(x);
  const cy = Math.round(y);
  const arx = Math.max(1, Math.round(rx));
  const ary = Math.max(1, Math.round(ry));
  ctx.fillStyle = typeof fill === "string" ? fill : "#888888";
  for (let j = -ary; j <= ary; j++) {
    const t = 1 - (j * j) / (ary * ary);
    const w = Math.max(0, Math.round(arx * Math.sqrt(Math.max(0, t))));
    ctx.fillRect(cx - w, cy + j, w * 2 + 1, 1);
  }
}

function strokeOval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, width = 2): void {
  const cx = Math.round(x);
  const cy = Math.round(y);
  const arx = Math.max(1, Math.round(rx));
  const ary = Math.max(1, Math.round(ry));
  const inner = Math.max(0, Math.round(width));
  ctx.fillStyle = color;
  for (let j = -ary; j <= ary; j++) {
    const t = 1 - (j * j) / (ary * ary);
    const w = Math.max(0, Math.round(arx * Math.sqrt(Math.max(0, t))));
    const iw = Math.max(0, w - inner);
    ctx.fillRect(cx - w, cy + j, w - iw, 1);
    ctx.fillRect(cx + iw + 1, cy + j, w - iw, 1);
  }
}

function capsule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string | CanvasGradient,
  r = 6,
): void {
  const ix = Math.round(x);
  const iy = Math.round(y);
  const iw = Math.max(1, Math.round(w));
  const ih = Math.max(1, Math.round(h));
  const rr = Math.max(0, Math.min(Math.round(r), Math.floor(Math.min(iw, ih) / 2)));
  ctx.fillStyle = typeof fill === "string" ? fill : "#888888";
  ctx.fillRect(ix + rr, iy, iw - rr * 2, ih);
  ctx.fillRect(ix, iy + rr, iw, ih - rr * 2);
  oval(ctx, ix + rr, iy + rr, rr, rr, fill);
  oval(ctx, ix + iw - rr - 1, iy + rr, rr, rr, fill);
  oval(ctx, ix + rr, iy + ih - rr - 1, rr, rr, fill);
  oval(ctx, ix + iw - rr - 1, iy + ih - rr - 1, rr, rr, fill);
}

function quad(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  fill: string | CanvasGradient,
): void {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function limb(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w: number,
  mid: string,
  hi: string,
): void {
  const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1)));
  const tw = Math.max(2, Math.round(w));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x1 + (x2 - x1) * t);
    const y = Math.round(y1 + (y2 - y1) * t);
    ctx.fillStyle = i < steps * 0.35 ? hi : mid;
    ctx.fillRect(x - (tw >> 1), y - (tw >> 1), tw, tw);
  }
}

function coatGrad(_ctx: CanvasRenderingContext2D, kit: PixelKit, _x: number, _y: number, _w: number, _h: number): string {
  return kit.coat;
}

function skinGrad(_ctx: CanvasRenderingContext2D, kit: PixelKit, _x: number, _y: number, _r: number): string {
  return kit.skin;
}

function sx(n: number): number {
  return n * SCALE;
}

function isHooli(kit: PixelKit): boolean {
  return kit.id === "maga-hooli";
}

function isSlush(kit: PixelKit): boolean {
  return kit.id === SNOWBALL_HERO_ID;
}

function isMma(kit: PixelKit): boolean {
  return kit.body === "shorts";
}

function paintShadow(ctx: CanvasRenderingContext2D, r: Rig, kit: PixelKit): void {
  if (r.dead) return;
  ctx.save();
  ctx.globalAlpha = 0.32;
  oval(ctx, sx(r.cx), sx(58 + r.bob * 0.3), kit.wide ? 24 : 17, 5.5, INK);
  ctx.restore();
}

function shoeOf(kit: PixelKit): { shoe: string; sole: string; shine: boolean } {
  if (isHooli(kit)) return { shoe: WHITE, sole: "#c8c4bc", shine: true };
  if (isMma(kit)) return { shoe: dim(kit.skin, 0.08), sole: dim(kit.skin, 0.22), shine: false };
  if (isSlush(kit)) return { shoe: "#3a2a1c", sole: "#1a1008", shine: false };
  if (kit.body === "gown" || kit.body === "pearl" || kit.body === "pink") return { shoe: kit.accent, sole: dim(kit.accent, 0.25), shine: true };
  return { shoe: dim(kit.coatLo, 0.08), sole: INK, shine: false };
}

function paintLegs(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig, near: boolean): void {
  const cx = sx(r.cx);
  const hip = sx(r.ly - 2) + (isSlush(kit) ? -8 : 0);
  const footY = sx(60 + (near ? r.lyR : r.lyL));
  const side = near ? 1 : -1;
  const hipTurn =
    r.fist && r.pose === "attack" ? (near ? -1 : 1) * (r.fist === "left" ? -1 : 1) * (r.fist === "hook" ? 2.5 : 1.2) : 0;
  const ox = sx((near ? r.r : r.l) + side * (kit.wide ? 5 : 3.5)) + hipTurn;
  const jean = isHooli(kit) ? "#161412" : isSlush(kit) ? kit.coat : isMma(kit) ? kit.coat : dim(kit.coat, 0.16);
  const { shoe, sole, shine } = shoeOf(kit);
  const kneeX = cx + side * 7 + ox * 0.45;
  const kneeY = (hip + footY) * 0.52;
  limb(ctx, cx + side * 6, hip, kneeX, kneeY, isSlush(kit) || kit.wide ? 11 : 8.4, jean, lit(jean, 0.16));
  limb(ctx, kneeX, kneeY, cx + ox, footY, isSlush(kit) || kit.wide ? 10 : 7.6, jean, lit(jean, 0.1));
  if (isMma(kit)) {
    oval(ctx, kneeX, kneeY, 4, 3.4, dim(kit.skin, 0.08));
  }
  if (isSlush(kit)) paintCamoBlots(ctx, kneeX - 4, kneeY - 2);
  const fx = cx + ox + side * 2;
  const fy = footY + 3;
  ctx.beginPath();
  ctx.ellipse(fx, fy, isHooli(kit) ? 9.5 : 7.2, isHooli(kit) ? 4.4 : 3.6, side * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = shoe;
  ctx.fill();
  ctx.fillStyle = sole;
  ctx.fillRect(fx - 6, fy + 2, 13, 2);
  if (shine) {
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.fillRect(fx - 4, fy - 1, 8, 1.6);
  }
  if (isHooli(kit)) {
    ctx.fillStyle = WHITE;
    ctx.fillRect(fx - 5, fy - 2, 10, 2.2);
    ctx.fillStyle = "#d8d4cc";
    ctx.fillRect(fx + 3, fy - 1, 3, 2);
  }
  if (isSlush(kit)) {
    ctx.fillStyle = "#c2a36a";
    ctx.fillRect(fx - 6, fy - 3, 12, 2.4);
    ctx.fillStyle = "#2a1c12";
    ctx.fillRect(fx - 6, fy + 2, 13, 2.4);
  }
}

function paintChair(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig): void {
  const cx = sx(r.cx);
  const seat = sx(r.ly - 4);
  const phase = (r.walk % 8) * (Math.PI / 4);
  ctx.fillStyle = dim(kit.coatLo, 0.2);
  ctx.fillRect(cx - 22, seat, 44, 6);
  ctx.fillRect(cx - 18, seat - 16, 4, 18);
  ctx.fillRect(cx + 14, seat - 16, 4, 18);
  for (const side of [-1, 1]) {
    const wx = cx + side * 16;
    const wy = seat + 8;
    ctx.fillStyle = "#2a241c";
    ctx.beginPath();
    ctx.arc(wx, wy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(r.pose === "walk" ? phase : 0);
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(-1, -7, 2, 14);
    ctx.fillRect(-7, -1, 14, 2);
    ctx.restore();
    ctx.fillStyle = kit.accent;
    ctx.fillRect(wx - 1, wy - 1, 2, 2);
  }
}

function paintTorso(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig): void {
  const cx = sx(r.cx);
  const ty = sx(r.ty);
  const wide = kit.wide ? 34 : isSlush(kit) ? 30 : isMma(kit) ? 22 : 26;
  const h = r.dead ? 18 : isSlush(kit) ? 40 : isMma(kit) ? 26 : 32;
  ctx.save();
  if (r.dead) ctx.transform(1, 0.15, 0, 0.75, 0, sx(8));
  if (r.fist && r.pose === "attack") {
    const dir = r.fist === "left" ? -1 : 1;
    const rad = r.fist === "hook" ? 0.16 : 0.08;
    ctx.translate(cx, ty + 16);
    ctx.rotate(dir * rad);
    ctx.translate(-cx, -(ty + 16));
  }
  oval(ctx, cx - wide * 0.42, ty + 2, 7, 6, coatGrad(ctx, kit, cx - 20, ty - 6, 16, 16));
  oval(ctx, cx + wide * 0.42, ty + 2, 7, 6, coatGrad(ctx, kit, cx + 4, ty - 6, 16, 16));
  if (isMma(kit)) {
    oval(ctx, cx, ty + 10, wide * 0.46, h * 0.48, skinGrad(ctx, kit, cx, ty + 8, 16));
    capsule(ctx, cx - wide / 2 + 1, ty + 14, wide - 2, 14, coatGrad(ctx, kit, cx - wide / 2, ty + 14, wide, 14), 6);
    ctx.fillStyle = kit.accent;
    ctx.fillRect(cx - wide / 2 + 3, ty + 16, wide - 6, 2.4);
    ctx.fillStyle = lit(kit.skinHi, 0.12);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(cx - 3, ty + 2, 2, 12);
    ctx.globalAlpha = 1;
  } else {
    capsule(ctx, cx - wide / 2, ty - 4, wide, h, coatGrad(ctx, kit, cx - wide / 2, ty - 4, wide, h), 11);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - wide / 2, ty - 4, wide, h, 11);
    ctx.stroke();
    ctx.fillStyle = lit(kit.coatHi, 0.22);
    ctx.globalAlpha = 0.38;
    ctx.fillRect(cx - wide / 2 + 5, ty, 3.2, h - 12);
    ctx.globalAlpha = 1;
    ctx.fillStyle = dim(kit.coat, 0.18);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(cx + wide / 2 - 8, ty + 4, 2, h - 14);
    ctx.globalAlpha = 1;
  }
  paintCollar(ctx, kit, cx, ty, wide);
  paintBodyTrim(ctx, kit, cx, ty, wide, h);
  paintSignature(ctx, kit, cx, ty, wide, h);
  if (isSlush(kit) && !r.dead) {
    paintCamoBlots(ctx, cx - 10, ty + 2);
    paintCamoBlots(ctx, cx + 2, ty + 8);
  }
  ctx.restore();
}

function paintCollar(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, ty: number, _wide: number): void {
  if (isMma(kit)) return;
  const suit =
    kit.body === "navy" ||
    kit.body === "tory" ||
    kit.body === "blazer" ||
    kit.body === "hope" ||
    kit.body === "broadcast" ||
    kit.body === "oversuit";
  if (suit) {
    quad(ctx, [
      [cx - 8, ty - 2],
      [cx - 2, ty + 8],
      [cx - 10, ty + 10],
    ], dim(kit.coat, 0.12));
    quad(ctx, [
      [cx + 8, ty - 2],
      [cx + 2, ty + 8],
      [cx + 10, ty + 10],
    ], lit(kit.coatHi, 0.08));
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.82;
    ctx.fillRect(cx - 3.4, ty - 2, 6.8, 10);
    ctx.globalAlpha = 1;
  } else if (kit.body === "hoodie" || kit.body === "street" || kit.body === "cloak" || kit.body === "parka") {
    quad(ctx, [
      [cx - 12, ty - 4],
      [cx, ty + 10],
      [cx + 12, ty - 4],
      [cx + 8, ty - 8],
      [cx - 8, ty - 8],
    ], kit.coatLo);
  }
}

function paintBodyTrim(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, ty: number, wide: number, h: number): void {
  const body: BodyStyle = kit.body;
  if (body === "navy" || body === "tory" || body === "blazer" || body === "hope") {
    ctx.fillStyle = kit.accent;
    ctx.beginPath();
    ctx.moveTo(cx - 2.4, ty + 6);
    ctx.lineTo(cx + 2.4, ty + 6);
    ctx.lineTo(cx + 1.6, ty + h - 8);
    ctx.lineTo(cx, ty + h - 4);
    ctx.lineTo(cx - 1.6, ty + h - 8);
    ctx.fill();
    oval(ctx, cx, ty + 10, 1.8, 1.8, kit.trim);
    oval(ctx, cx, ty + 16, 1.6, 1.6, kit.trim);
    oval(ctx, cx - wide / 2 + 8, ty + 8, 2.2, 2.2, kit.trim);
  } else if (body === "hoodie" || body === "street" || body === "cloak") {
    ctx.strokeStyle = dim(kit.coatLo, 0.1);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - 6, ty + 12);
    ctx.lineTo(cx - 4, ty + h - 6);
    ctx.moveTo(cx + 6, ty + 12);
    ctx.lineTo(cx + 4, ty + h - 6);
    ctx.stroke();
  } else if (body === "labcoat") {
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.9;
    capsule(ctx, cx - wide / 2 + 1, ty, wide - 2, h - 2, WHITE, 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = kit.accent;
    ctx.fillRect(cx + 6, ty + 8, 7, 9);
    ctx.fillStyle = dim(kit.coat, 0.1);
    ctx.fillRect(cx - 10, ty + 10, 6, 8);
    ctx.fillStyle = kit.vfx;
    oval(ctx, cx + 9, ty + 12, 1.6, 1.6, kit.vfx);
  } else if (body === "gown" || body === "pearl" || body === "pink") {
    oval(ctx, cx, ty + 18, wide / 2 + 3, 12, coatGrad(ctx, kit, cx - 18, ty, 36, 28));
    ctx.fillStyle = kit.trim;
    ctx.fillRect(cx - wide / 2 + 2, ty + 6, wide - 4, 2);
  } else if (body === "drip") {
    ctx.fillStyle = kit.coatHi;
    ctx.fillRect(cx - 13, ty + 18, 26, 7);
    oval(ctx, cx, ty + 8, 4, 3, kit.accent);
    oval(ctx, cx - 6, ty + 10, 2.2, 2.2, kit.trim);
    oval(ctx, cx + 6, ty + 10, 2.2, 2.2, kit.trim);
  } else if (body === "tech" || body === "gadget") {
    ctx.fillStyle = kit.accent;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(cx - 9, ty + 6, 18, 3);
    ctx.fillRect(cx - 7, ty + 12, 14, 2);
    ctx.globalAlpha = 1;
    oval(ctx, cx + 8, ty + 8, 2, 2, kit.vfx);
  } else if (body === "broadcast" || body === "desk") {
    ctx.fillStyle = kit.trim;
    ctx.fillRect(cx - 14, ty + 17, 28, 3.4);
    ctx.fillStyle = kit.accent;
    oval(ctx, cx - 8, ty + 8, 2, 2, kit.accent);
  } else if (body === "robe" || body === "earth") {
    ctx.fillStyle = kit.accent;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(cx - 2, ty + 2, 4, h - 8);
    ctx.globalAlpha = 1;
  } else if (body === "parka") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(cx - 12, ty + 4, 24, 3);
    oval(ctx, cx, ty + 16, 5, 4, kit.coatLo);
  } else if (body === "toon") {
    oval(ctx, cx, ty + 8, 8, 6, kit.accent);
    ctx.fillStyle = WHITE;
    oval(ctx, cx - 3, ty + 7, 2, 2, WHITE);
    oval(ctx, cx + 3, ty + 7, 2, 2, WHITE);
  } else if (body === "chair") {
    ctx.fillStyle = dim(kit.coatLo, 0.12);
    ctx.fillRect(cx - 16, ty + 16, 32, 6);
    ctx.fillRect(cx - 14, ty + 6, 4, 16);
    ctx.fillRect(cx + 10, ty + 6, 4, 16);
  }
}

function paintSignature(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, ty: number, wide: number, h: number): void {
  if (isHooli(kit)) {
    ctx.fillStyle = "#c8c4bc";
    for (let i = 0; i < 6; i++) oval(ctx, cx - 11 + i * 4.4, ty + 3, 1.7, 1.7, "#d8d4cc");
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - wide / 2 - 1, ty + 4 + i * 5);
      ctx.lineTo(cx - wide / 2 - 6, ty + 2 + i * 5);
      ctx.lineTo(cx - wide / 2 - 1, ty + 6 + i * 5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + wide / 2 + 1, ty + 4 + i * 5);
      ctx.lineTo(cx + wide / 2 + 6, ty + 2 + i * 5);
      ctx.lineTo(cx + wide / 2 + 1, ty + 6 + i * 5);
      ctx.fill();
    }
    ctx.fillStyle = kit.vfx;
    ctx.fillRect(cx - 8, ty + 12, 16, 2);
    return;
  }
  if (kit.id === "maga-grumptor") {
    oval(ctx, cx - wide / 2 + 7, ty + 7, 2.6, 2.6, kit.trim);
    ctx.fillStyle = kit.trim;
    ctx.fillRect(cx - wide / 2 + 5, ty + 6, 4, 2);
  } else if (kit.id === "maga-vestyt") {
    ctx.strokeStyle = kit.trim;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, ty + 6, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();
    oval(ctx, cx, ty + 14, 2.4, 2.4, kit.trim);
  } else if (kit.id === "wild-karen") {
    for (let i = 0; i < 5; i++) oval(ctx, cx - 8 + i * 4, ty + 2, 1.5, 1.5, WHITE);
  } else if (kit.id === "mma-nurmagoat") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(cx - 12, ty + 12, 24, 4);
    oval(ctx, cx + 10, ty + 14, 3, 3, kit.trim);
  } else if (kit.id === "mma-jonesy") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(cx - 11, ty + 18, 22, 4);
    oval(ctx, cx, ty + 20, 3, 2, INK);
  } else if (kit.id === "lw-odramma" || kit.id === "lw-hocking") {
    strokeOval(ctx, cx, ty - 22, 13, 4.2, kit.trim, 2.6);
  } else if (kit.id === "wild-icon") {
    ctx.fillStyle = kit.accent;
    ctx.font = "700 8px Anton, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("X", cx, ty + 12);
  } else if (kit.id === "maga-elonmolk") {
    ctx.fillStyle = kit.vfx;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(cx - 8, ty + 8, 16, 2);
    ctx.globalAlpha = 1;
  }
  void h;
}

function clampHand(x1: number, y1: number, x2: number, y2: number, max: number): { x: number; y: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  if (len <= max) return { x: x2, y: y2 };
  return { x: x1 + (dx / len) * max, y: y1 + (dy / len) * max };
}

function strikingNear(fist: Rig["fist"], near: boolean): boolean {
  return fist === "left" ? !near : near;
}

/**
 * Guard is the chin. The punching arm travels out to the edge of the sheet
 * and back. The other hand stays up. No extra weapon.
 */
function paintPunchArm(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig, near: boolean): void {
  const cx = sx(r.cx);
  const sy = sx(r.ty + 2);
  const side = near ? 1 : -1;
  const fist = r.fist ?? "right";
  const striking = strikingNear(fist, near);
  const pulse = attackArmPulse(r.pose, r.frame);
  const extend = pulse * INK_PUNCH_REACH;
  const shoulderX = cx + side * 10;
  const shoulderY = sy - 2;
  const guardX = cx + side * 4;
  const guardY = sy - 18;
  let aimX = guardX;
  let aimY = guardY;
  if (striking) {
    const fullX = Math.min(120, shoulderX + 8 + extend);
    const fullY = fist === "hook" ? sy - 10 : sy + 2;
    aimX = guardX + (fullX - guardX) * pulse;
    aimY = guardY + (fullY - guardY) * pulse;
  }
  const hand = clampHand(shoulderX, shoulderY, aimX, aimY, striking ? 18 + extend : 22);
  const elbowDrop = striking ? 10 * (1 - pulse) + 2 : 4;
  const elbowX = shoulderX + (hand.x - shoulderX) * (striking ? 0.48 : 0.55);
  const elbowY = shoulderY + (hand.y - shoulderY) * 0.5 + elbowDrop;
  const sleeve = isMma(kit) ? kit.skin : kit.coat;
  const thick = striking ? 8.4 : 7;
  limb(ctx, shoulderX, shoulderY, elbowX, elbowY, thick, sleeve, lit(sleeve, 0.18));
  limb(ctx, elbowX, elbowY, hand.x, hand.y, thick * 0.82, sleeve, lit(sleeve, 0.12));
  oval(ctx, hand.x, hand.y, striking ? 7.2 : 5, striking ? 6.4 : 4.6, skinGrad(ctx, kit, hand.x, hand.y, 6));
  if (kit.prop === "glove" || kit.prop === "tape" || kit.prop === "mittens" || isMma(kit)) {
    oval(ctx, hand.x, hand.y, striking ? 8.4 : 6.2, striking ? 7.2 : 5.4, kit.accent);
    oval(ctx, hand.x + 1.6, hand.y - 1.4, 2.2, 2, WHITE);
  }
}

/** Infantry strike. The authored prop stays in the near hand. No extra weapon is spawned. */
function paintWeaponArm(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig, near: boolean): void {
  const cx = sx(r.cx);
  const sy = sx(r.ty + 2);
  const side = near ? 1 : -1;
  const kind = r.weaponPose ?? "melee";
  const pulse = attackArmPulse(r.pose, r.frame);
  const wind = pulse * 28;
  const fire = kind === "rifle" || kind === "pistol" || kind === "shotgun";
  const shoulderX = cx + side * 8;
  const shoulderY = sy;
  let aimX = cx + side * 14;
  let aimY = sy + 8;
  if (near && fire) {
    const kick = pulse < 0.35 ? (kind === "shotgun" ? -8 : kind === "pistol" ? -4 : -6) : 0;
    aimX = cx + (kind === "pistol" ? 22 : 30) + kick;
    aimY = sy - (kind === "shotgun" ? 1 : 4);
  } else if (near && kind === "spear") {
    aimX = cx + 14 + wind;
    aimY = sy + 1;
  } else if (near) {
    const raised = { x: cx - 6, y: sy - 22 };
    const struck = { x: cx + 18 + wind, y: sy + 8 };
    aimX = raised.x + (struck.x - raised.x) * pulse;
    aimY = raised.y + (struck.y - raised.y) * pulse;
  } else {
    aimX = cx + side * 8;
    aimY = sy - 10;
  }
  const hand = clampHand(shoulderX, shoulderY, aimX, aimY, near && !fire ? 16 + wind : 22);
  const elbowX = shoulderX + (hand.x - shoulderX) * 0.55;
  const elbowY = shoulderY + (hand.y - shoulderY) * 0.55 + 3;
  const sleeve = isMma(kit) ? kit.skin : kit.coat;
  limb(ctx, shoulderX, shoulderY, elbowX, elbowY, 7.2, sleeve, lit(sleeve, 0.18));
  limb(ctx, elbowX, elbowY, hand.x, hand.y, 6.4, sleeve, lit(sleeve, 0.12));
  oval(ctx, hand.x, hand.y, 5.2, 5, skinGrad(ctx, kit, hand.x, hand.y, 6));
  if (near) paintProp(ctx, kit, r, hand.x, hand.y);
}

function paintRunningArm(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig, near: boolean): void {
  const cx = sx(r.cx);
  const sy = sx(r.ty + 2);
  const side = near ? 1 : -1;
  const half = (kit.wide ? 34 : isMma(kit) ? 22 : 26) / 2;
  const pose = runningArmPose(r.arm, near, half);
  const shoulderX = cx + side * pose.shoulderOut;
  const shoulderY = sy - pose.shoulderLift;
  const elbowX = cx + side * pose.elbowOut + pose.elbowLead;
  const elbowY = shoulderY + pose.elbowDrop;
  const handX = cx + side * pose.handOut + pose.swing;
  const handY = shoulderY + pose.handDrop;
  const sleeve = isMma(kit) ? kit.skin : kit.coat;
  limb(ctx, shoulderX, shoulderY, elbowX, elbowY, 7.2, sleeve, lit(sleeve, 0.18));
  limb(ctx, elbowX, elbowY, handX, handY, 6.4, sleeve, lit(sleeve, 0.12));
  oval(ctx, handX, handY, 4.4, 4.2, skinGrad(ctx, kit, handX, handY, 6));
}

function paintCamoBlots(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#24381c";
  ctx.fillRect(x, y, 7, 4);
  ctx.fillStyle = "#6a4328";
  ctx.fillRect(x + 6, y + 3, 6, 4);
  ctx.fillStyle = "#c2a36a";
  ctx.fillRect(x + 2, y + 6, 5, 3);
}

function paintPackedSnow(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#eef6ff";
  ctx.fillRect(x - 7, y - 5, 12, 7);
  ctx.fillStyle = "#d7e8f4";
  ctx.fillRect(x - 3, y - 9, 8, 5);
  ctx.fillStyle = "#f7fbff";
  ctx.fillRect(x + 2, y - 2, 6, 5);
  ctx.fillStyle = "#c5d6e4";
  ctx.fillRect(x - 6, y + 1, 5, 4);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 1, y - 7, 3, 2);
}

function paintSlushGlove(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  oval(ctx, x, y, 6.2, 5.4, "#6a4328");
  ctx.fillStyle = "#c2a36a";
  ctx.fillRect(x - 4, y - 2, 8, 2);
  oval(ctx, x + 1.4, y - 1.2, 1.6, 1.4, WHITE);
}

/** Form, cock, swing, release, follow-through. The snow leaves the near hand. */
function paintSlushThrowArm(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig, near: boolean): void {
  const cx = sx(r.cx);
  const sy = sx(r.ty + 2);
  const side = near ? 1 : -1;
  const phase = snowballPhase(r.frame);
  const shoulderX = cx + side * 10;
  const shoulderY = sy - 2;
  let aimX = cx + side * 8;
  let aimY = sy + 6;
  if (near) {
    if (phase === "form") {
      aimX = cx + 16;
      aimY = sy - 6;
    } else     if (phase === "cock") {
      aimX = cx - 18;
      aimY = sy - 30;
    } else if (phase === "swing") {
      aimX = cx + 24;
      aimY = sy - 10;
    } else if (phase === "release") {
      aimX = cx + 38;
      aimY = sy - 2;
    } else {
      aimX = cx + 44;
      aimY = sy + 12;
    }
  }
  const hand = clampHand(shoulderX, shoulderY, aimX, aimY, near ? 36 : 18);
  const elbowX = shoulderX + (hand.x - shoulderX) * 0.5;
  const elbowY = shoulderY + (hand.y - shoulderY) * 0.45 + (near && (phase === "cock" || phase === "form") ? -2 : 4);
  const sleeve = kit.coat;
  limb(ctx, shoulderX, shoulderY, elbowX, elbowY, near ? 8.2 : 7, sleeve, lit(sleeve, 0.18));
  limb(ctx, elbowX, elbowY, hand.x, hand.y, near ? 7 : 6, sleeve, lit(sleeve, 0.12));
  paintCamoBlots(ctx, elbowX - 4, elbowY - 2);
  paintSlushGlove(ctx, hand.x, hand.y);
  if (near && phase !== "release" && phase !== "follow") paintPackedSnow(ctx, hand.x + 2, hand.y - 2);
}

function paintArms(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig, near: boolean): void {
  if (isSlush(kit) && r.pose === "attack") {
    paintSlushThrowArm(ctx, kit, r, near);
    return;
  }
  if (r.pose === "attack" && r.fist) {
    if (strikingNear(r.fist, near)) return;
    paintPunchArm(ctx, kit, r, near);
    return;
  }
  if (r.pose === "attack" && r.weaponPose) {
    if (near) return;
    paintWeaponArm(ctx, kit, r, near);
    return;
  }
  if (runningArmSwing(kit, r.pose, near).swing) {
    paintRunningArm(ctx, kit, r, near);
    return;
  }
  const cx = sx(r.cx);
  const sy = sx(r.ty + 2);
  const side = near ? 1 : -1;
  const reach = sx(r.punch * (near ? 1 : 0.35) + r.arm * side * 0.4 + (r.lift ? 2 : 0));
  const attackReach = r.pose === "attack" ? attackArmPulse(r.pose, r.frame) * (near ? INK_PUNCH_REACH : 8) : 0;
  const up = sx(r.lift * (near ? 1 : 0.45) - (near ? 0 : 2));
  const handX = cx + side * (18 + (kit.wide ? 3 : 0)) + (near ? reach + attackReach : -reach * 0.2);
  const handY = sy + 10 - up + (r.strike === "shoot" && near && r.pose === "attack" ? -6 : 0);
  const midX = (cx + side * 8 + handX) * 0.5;
  const midY = (sy + handY) * 0.5 + 2;
  const sleeve = isMma(kit) ? kit.skin : kit.coat;
  limb(ctx, cx + side * 8, sy, midX, midY, 7.2, sleeve, lit(sleeve, 0.18));
  limb(ctx, midX, midY, handX, handY, 6.4, sleeve, lit(sleeve, 0.12));
  oval(ctx, handX, handY, 5.2, 5, skinGrad(ctx, kit, handX, handY, 6));
  if (kit.prop === "glove" || kit.prop === "tape" || kit.prop === "mittens") {
    oval(ctx, handX, handY, 6.4, 6, kit.accent);
    oval(ctx, handX + side * 2, handY - 1, 2.2, 2.2, WHITE);
  }
  if (isSlush(kit)) paintSlushGlove(ctx, handX, handY);
  if (near) paintProp(ctx, kit, r, handX, handY);
}

function paintProp(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig, x: number, y: number): void {
  const p: PropStyle = kit.prop;
  ctx.save();
  ctx.translate(x, y);
  if (r.strike === "shoot" && (r.pose === "attack" || r.pose === "ult")) ctx.rotate(-0.38);
  if (r.pose === "cast" || r.pose === "ult") ctx.rotate(-0.18);
  if (p === "tie") {
    ctx.fillStyle = kit.accent;
    ctx.beginPath();
    ctx.moveTo(-3.2, -20);
    ctx.lineTo(3.2, -20);
    ctx.lineTo(2.2, 7);
    ctx.lineTo(0, 12);
    ctx.lineTo(-2.2, 7);
    ctx.fill();
    ctx.fillStyle = lit(kit.accent, 0.25);
    ctx.fillRect(-1.2, -18, 2.4, 16);
  } else if (p === "rocket") {
    capsule(ctx, -4, -20, 8, 22, kit.accent, 4);
    ctx.fillStyle = "#ff7043";
    ctx.fillRect(-3, 2, 6, 7);
    ctx.fillStyle = "#ffcc80";
    ctx.fillRect(-2, 7, 4, 4);
    ctx.fillStyle = WHITE;
    ctx.fillRect(-2, -16, 3, 8);
  } else if (p === "mic") {
    ctx.fillStyle = INK;
    ctx.fillRect(-1.4, -4, 2.8, 17);
    oval(ctx, 0, -9, 5.4, 6.4, kit.accent);
    ctx.fillStyle = lit(kit.accent, 0.3);
    oval(ctx, -1, -11, 2, 2, WHITE);
  } else if (p === "megaphone") {
    ctx.fillStyle = kit.accent;
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(16, -12);
    ctx.lineTo(16, 12);
    ctx.lineTo(-5, 5);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.fillRect(14, -10, 5, 20);
    ctx.fillStyle = INK;
    oval(ctx, -2, 0, 3, 3, INK);
  } else if (p === "book") {
    capsule(ctx, -9, -11, 18, 16, kit.accent, 2);
    ctx.fillStyle = WHITE;
    ctx.fillRect(-7, -8, 14, 11);
    ctx.fillStyle = INK;
    ctx.fillRect(-5, -5, 10, 1.2);
    ctx.fillRect(-5, -1, 10, 1.2);
  } else if (p === "flask") {
    ctx.fillStyle = "#7ec8ff";
    ctx.beginPath();
    ctx.moveTo(-3, -14);
    ctx.lineTo(3, -14);
    ctx.lineTo(8, 9);
    ctx.lineTo(-8, 9);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(-2, -6, 3, 7);
    ctx.globalAlpha = 1;
    ctx.fillStyle = kit.vfx;
    oval(ctx, 0, 4, 3, 2, kit.vfx);
  } else if (p === "globe") {
    oval(ctx, 0, 0, 10, 10, "#3d6ea6");
    ctx.fillStyle = "#5ad45a";
    ctx.beginPath();
    ctx.ellipse(-1, -1, 5, 3.4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    strokeOval(ctx, 0, 0, 10, 10, lit("#3d6ea6", 0.3), 1.4);
  } else if (p === "halo") {
    strokeOval(ctx, 0, -30, 13, 4.4, kit.trim, 3);
  } else if (p === "glove" || p === "tape") {
    oval(ctx, 0, 0, 8.4, 8, kit.accent);
    oval(ctx, 0, 0, 3.2, 3.2, WHITE);
  } else if (p === "camera") {
    capsule(ctx, -12, -7, 24, 14, INK, 3);
    oval(ctx, 6, 0, 4.6, 4.6, WHITE);
    oval(ctx, 6, 0, 2.2, 2.2, kit.vfx);
    ctx.fillStyle = kit.accent;
    ctx.fillRect(-10, -5, 6, 3);
  } else if (p === "stud") {
    ctx.fillStyle = "#9a968e";
    ctx.fillRect(-18, -2.4, 24, 4.8);
    ctx.fillStyle = "#d0ccc4";
    ctx.fillRect(-16, -1.2, 18, 2.2);
    ctx.fillStyle = kit.vfx;
    ctx.beginPath();
    ctx.moveTo(6, -6);
    ctx.lineTo(20, 0);
    ctx.lineTo(6, 6);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.fillRect(8, -1.4, 5, 2.8);
    ctx.shadowColor = kit.vfx;
    ctx.shadowBlur = 8;
    oval(ctx, 18, 0, 2.2, 2.2, WHITE);
    ctx.shadowBlur = 0;
  } else if (p === "brush") {
    ctx.fillStyle = "#8a6a40";
    ctx.fillRect(-16, -2.2, 20, 4.4);
    ctx.fillStyle = "#3d6ea6";
    ctx.fillRect(4, -7, 9, 14);
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(10, -5, 5, 10);
  } else if (p === "file") {
    capsule(ctx, -9, -9, 18, 16, WHITE, 2);
    ctx.fillStyle = INK;
    ctx.fillRect(-6, -5, 12, 1.4);
    ctx.fillRect(-6, -1, 12, 1.4);
    ctx.fillRect(-6, 3, 8, 1.4);
    ctx.fillStyle = kit.accent;
    ctx.fillRect(-9, -9, 18, 3);
  } else if (p === "staff") {
    ctx.fillStyle = kit.trim;
    ctx.fillRect(-1.6, -24, 3.2, 32);
    oval(ctx, 0, -26, 5.6, 5.6, kit.accent);
    oval(ctx, 0, -26, 2.4, 2.4, WHITE);
  } else if (p === "sash" || p === "belt") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(-13, 8, 26, 4.4);
    oval(ctx, 10, 10, 2.4, 2.4, kit.trim);
  } else if (p === "mittens") {
    oval(ctx, 0, 2, 7.4, 6.2, kit.accent);
    ctx.fillStyle = WHITE;
    ctx.fillRect(-3, -2, 6, 2);
  }
  ctx.restore();
}

function paintHead(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig): void {
  const cx = sx(r.cx);
  const hy = sx(r.hy + 6);
  const face: Face = faceOf(kit.id);
  const rx = kit.wide ? 17.4 : isSlush(kit) ? 21.4 : isHooli(kit) ? 14.2 : 15.2;
  const ry = kit.wide ? 17.8 : isSlush(kit) ? 20.2 : 16.4;
  ctx.save();
  if (r.dead) {
    ctx.translate(cx, hy + 8);
    ctx.rotate(1.15);
    ctx.translate(-cx, -hy);
  }
  paintHairBack(ctx, kit, cx, hy, rx);
  oval(ctx, cx - rx + 1, hy + 1, 3.2, 4.2, dim(kit.skin, 0.08));
  oval(ctx, cx + rx - 1, hy + 1, 3.2, 4.2, dim(kit.skin, 0.08));
  oval(ctx, cx, hy, rx, ry, skinGrad(ctx, kit, cx, hy, rx + 2));
  strokeOval(ctx, cx, hy, rx, ry, INK, 2.2);
  strokeOval(ctx, cx, hy, rx - 1.2, ry - 1.2, dim(kit.skin, 0.42), 1.2);
  ctx.fillStyle = "rgba(255,246,228,0.22)";
  oval(ctx, cx - rx * 0.28, hy - ry * 0.28, 4.2, 3, "rgba(255,246,228,0.22)");
  paintHairFront(ctx, kit, cx, hy, rx);
  paintFace(ctx, kit, cx, hy, face, r);
  paintHeadGear(ctx, kit, cx, hy, rx);
  ctx.restore();
}

function paintHairBack(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, hy: number, rx: number): void {
  const style: HairStyle = kit.hairStyle;
  ctx.fillStyle = kit.hair;
  if (style === "locks" || style === "longish" || style === "curl") {
    oval(ctx, cx - 11, hy + 8, 6.4, 13, kit.hair);
    oval(ctx, cx + 11, hy + 8, 6.4, 13, kit.hairHi);
    oval(ctx, cx - 7, hy + 14, 4, 8, dim(kit.hair, 0.12));
    oval(ctx, cx + 8, hy + 14, 4, 8, kit.hair);
  } else if (style === "hood" || style === "mask") {
    oval(ctx, cx, hy - 2, rx + 7, 19, kit.coatLo);
    oval(ctx, cx, hy - 8, rx + 5, 10, kit.coat);
  } else if (style === "glam" || style === "blondbob" || style === "bob") {
    oval(ctx, cx - 12, hy + 8, 5, 11, kit.hair);
    oval(ctx, cx + 12, hy + 8, 5, 11, kit.hairHi);
  } else if (style === "sweep") {
    oval(ctx, cx - 10, hy + 4, 6, 10, kit.hair);
  }
}

function paintHairFront(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, hy: number, rx: number): void {
  const style: HairStyle = kit.hairStyle;
  const g = ctx.createLinearGradient(cx - rx, hy - 18, cx + rx, hy);
  g.addColorStop(0, kit.hairHi);
  g.addColorStop(1, kit.hair);
  ctx.fillStyle = g;
  if (style === "sweep") {
    ctx.beginPath();
    ctx.moveTo(cx - 20, hy + 2);
    ctx.quadraticCurveTo(cx - 8, hy - 32, cx + 22, hy - 12);
    ctx.quadraticCurveTo(cx + 8, hy - 14, cx - 16, hy + 8);
    ctx.fill();
    ctx.fillStyle = kit.hairHi;
    ctx.beginPath();
    ctx.moveTo(cx - 10, hy - 4);
    ctx.quadraticCurveTo(cx + 4, hy - 26, cx + 16, hy - 8);
    ctx.quadraticCurveTo(cx + 2, hy - 10, cx - 8, hy + 2);
    ctx.fill();
    ctx.fillStyle = lit(kit.hairHi, 0.2);
    ctx.beginPath();
    ctx.moveTo(cx - 2, hy - 10);
    ctx.quadraticCurveTo(cx + 8, hy - 22, cx + 14, hy - 8);
    ctx.fill();
  } else if (style === "slick" || style === "slickblond") {
    oval(ctx, cx + 2, hy - 11, rx - 0.4, 8.4, g);
    ctx.beginPath();
    ctx.moveTo(cx - 8, hy - 8);
    ctx.quadraticCurveTo(cx + 10, hy - 16, cx + 14, hy - 4);
    ctx.fill();
  } else if (style === "crest") {
    ctx.beginPath();
    ctx.moveTo(cx - 6, hy - 2);
    ctx.lineTo(cx - 3, hy - 34);
    ctx.quadraticCurveTo(cx + 8, hy - 38, cx + 12, hy - 22);
    ctx.lineTo(cx + 6, hy - 2);
    ctx.fill();
    ctx.fillStyle = kit.hairHi;
    ctx.fillRect(cx + 1, hy - 30, 4.2, 20);
    if (isHooli(kit)) {
      ctx.fillStyle = lit(kit.hairHi, 0.28);
      ctx.fillRect(cx + 2, hy - 32, 2, 14);
      oval(ctx, cx + 6, hy - 28, 3, 3, kit.vfx);
    }
  } else if (style === "bob" || style === "blondbob") {
    oval(ctx, cx, hy - 2, rx + 3.6, 14.5, g);
    oval(ctx, cx - 10, hy + 6, 5, 8, kit.hair);
    oval(ctx, cx + 10, hy + 6, 5, 8, kit.hairHi);
  } else if (style === "white" || style === "thin" || style === "prof") {
    oval(ctx, cx, hy - 12, rx - 1.4, 7.6, g);
    if (style === "white") {
      oval(ctx, cx - 10, hy + 2, 4, 6, kit.hair);
      oval(ctx, cx + 10, hy + 2, 4, 6, kit.hairHi);
    }
    if (style === "prof") oval(ctx, cx, hy + 11, 7.6, 4.4, kit.hair);
  } else if (style === "mess") {
    oval(ctx, cx - 7, hy - 13, 8.4, 7.4, g);
    oval(ctx, cx + 7, hy - 12, 8.4, 8.2, kit.hair);
    oval(ctx, cx, hy - 15, 6, 5, kit.hairHi);
  } else if (style === "fade" || style === "buzz" || style === "close" || style === "short") {
    oval(ctx, cx, hy - 11, rx - 1.2, 6.4, g);
    ctx.globalAlpha = 0.45;
    oval(ctx, cx, hy - 6, rx - 0.4, 4, dim(kit.hair, 0.1));
    ctx.globalAlpha = 1;
  } else if (style === "lab") {
    ctx.fillStyle = WHITE;
    capsule(ctx, cx - 17, hy - 17, 34, 11, WHITE, 4);
    ctx.fillStyle = kit.accent;
    ctx.fillRect(cx + 10, hy - 14, 6, 5);
  } else if (style === "visor") {
    capsule(ctx, cx - 15, hy - 9, 30, 9, kit.accent, 4);
    ctx.fillStyle = kit.vfx;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(cx - 12, hy - 7, 24, 5);
    ctx.globalAlpha = 1;
  } else if (style === "beret") {
    oval(ctx, cx - 2, hy - 15, 15, 6.4, kit.coat);
    oval(ctx, cx + 8, hy - 16, 5, 3, kit.accent);
  } else if (style === "glam") {
    oval(ctx, cx, hy - 8, rx + 2.4, 11, g);
    oval(ctx, cx + 11, hy + 3, 5.4, 11, kit.hairHi);
    oval(ctx, cx - 11, hy + 2, 4.4, 8, kit.hair);
  } else if (style === "goat") {
    oval(ctx, cx, hy - 11, rx - 2.4, 6.4, g);
    ctx.fillStyle = kit.hair;
    ctx.fillRect(cx - 2.2, hy + 10, 4.4, 7);
    oval(ctx, cx, hy + 16, 3.4, 2.4, kit.hair);
  } else if (style === "mascot") {
    oval(ctx, cx, hy - 8, rx + 5, 13, kit.accent);
    oval(ctx, cx - 8, hy - 14, 4, 4, kit.coatHi);
    oval(ctx, cx + 8, hy - 14, 4, 4, kit.coatHi);
  } else if (style === "duo") {
    oval(ctx, cx - 8, hy - 11, 8.4, 7.4, g);
    oval(ctx, cx + 8, hy - 11, 8.4, 7.4, kit.hairHi);
  } else if (style === "dark") {
    oval(ctx, cx, hy - 11, rx, 8.6, g);
    oval(ctx, cx - 8, hy - 4, 4, 6, kit.hair);
  } else if (style === "hood" || style === "mask") {
    /* painted in back */
  } else {
    oval(ctx, cx, hy - 11, rx - 0.6, 7.4, g);
  }
}

function paintFace(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, hy: number, face: Face, r: Rig): void {
  const eyeY = hy - 1;
  const eyeOpen = !r.blink;
  ctx.fillStyle = dim(kit.hair, 0.05);
  ctx.beginPath();
  ctx.moveTo(cx - 8, eyeY - 5);
  ctx.quadraticCurveTo(cx - 5, eyeY - 7.2, cx - 2, eyeY - 5);
  ctx.strokeStyle = dim(kit.hair, 0.08);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 2, eyeY - 5);
  ctx.quadraticCurveTo(cx + 5, eyeY - 7.2, cx + 8, eyeY - 5);
  ctx.stroke();
  if (eyeOpen) {
    const ex = face === "squint" ? 2.4 : 3.1;
    const ey = face === "squint" ? 1.5 : 3.4;
    oval(ctx, cx - 5, eyeY, ex + 0.8, ey + 0.6, WHITE);
    oval(ctx, cx + 5, eyeY, ex + 0.8, ey + 0.6, WHITE);
    oval(ctx, cx - 5, eyeY, ex, ey, INK);
    oval(ctx, cx + 5, eyeY, ex, ey, INK);
    oval(ctx, cx - 4.1, eyeY - 1.1, 1.15, 1.15, WHITE);
    oval(ctx, cx + 5.9, eyeY - 1.1, 1.15, 1.15, WHITE);
  } else {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(cx - 8, eyeY);
    ctx.lineTo(cx - 2, eyeY);
    ctx.moveTo(cx + 2, eyeY);
    ctx.lineTo(cx + 8, eyeY);
    ctx.stroke();
  }
  oval(ctx, cx, hy + 3.4, 2.4, 2.8, dim(kit.skin, 0.14));
  oval(ctx, cx, hy + 2.2, 1.4, 1.2, dim(kit.skin, 0.08));
  oval(ctx, cx - 8.4, hy + 4.4, 3.2, 2.1, dim(kit.skin, 0.12));
  oval(ctx, cx + 8.4, hy + 4.4, 3.2, 2.1, dim(kit.skin, 0.12));
  paintFacialHair(ctx, kit, cx, hy);
  ctx.strokeStyle = MOUTH;
  ctx.lineWidth = 1.9;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (face === "pout") {
    ctx.arc(cx, hy + 8.4, 4.2, 0.2, Math.PI - 0.2, true);
    ctx.stroke();
  } else if (face === "grin" || face === "smirk") {
    ctx.arc(cx + (face === "smirk" ? 2 : 0), hy + 7.2, 5.2, 0.12, Math.PI - 0.12);
    ctx.stroke();
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(cx - 3, hy + 7.4, 6, 1.4);
    ctx.globalAlpha = 1;
  } else if (face === "shout" || face === "open") {
    oval(ctx, cx, hy + 8.6, 3.4, 4.4, MOUTH);
    oval(ctx, cx, hy + 9.6, 1.9, 1.7, LIP);
  } else if (face === "grim") {
    ctx.moveTo(cx - 5.4, hy + 8.4);
    ctx.lineTo(cx + 5.4, hy + 8.4);
    ctx.stroke();
  } else {
    ctx.arc(cx, hy + 8.2, 3.6, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  if (isSlush(kit)) {
    ctx.fillStyle = "#e09070";
    ctx.fillRect(cx - 8, hy + 2, 2, 2);
    ctx.fillRect(cx + 6, hy + 3, 2, 2);
    ctx.fillRect(cx - 3, hy + 5, 2, 1);
  }
  if (kit.id === "maga-steers" || kit.id === "lw-bitenten" || kit.id === "maga-elonmolk" || kit.id === "lw-vakxie") {
    strokeOval(ctx, cx - 5, eyeY, 5, 3.6, INK, 1.5);
    strokeOval(ctx, cx + 5, eyeY, 5, 3.6, INK, 1.5);
    ctx.beginPath();
    ctx.moveTo(cx - 0.6, eyeY);
    ctx.lineTo(cx + 0.6, eyeY);
    ctx.stroke();
    ctx.strokeStyle = lit(INK, 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 10, eyeY);
    ctx.lineTo(cx - 12, eyeY + 1);
    ctx.moveTo(cx + 10, eyeY);
    ctx.lineTo(cx + 12, eyeY + 1);
    ctx.stroke();
  }
}

function paintFacialHair(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, hy: number): void {
  if (kit.id === "maga-grumptor") {
    ctx.fillStyle = kit.hair;
    ctx.globalAlpha = 0.35;
    oval(ctx, cx, hy + 9, 6, 2.4, kit.hair);
    ctx.globalAlpha = 1;
  } else if (kit.id === "maga-boris" || kit.id === "lw-sandbags") {
    ctx.fillStyle = kit.hair;
    oval(ctx, cx, hy + 11, 5.4, 2.2, kit.hair);
  } else if (kit.id === "mma-nurmagoat" || kit.hairStyle === "goat") {
    ctx.fillStyle = kit.hair;
    ctx.fillRect(cx - 2, hy + 9, 4, 7);
    oval(ctx, cx, hy + 16, 3.2, 2.2, kit.hair);
  } else if (kit.id === "mma-diazish" || kit.hairStyle === "longish") {
    ctx.fillStyle = kit.hair;
    oval(ctx, cx, hy + 11, 6, 2.6, kit.hair);
  } else if (kit.id === "maga-steers" || kit.hairStyle === "prof") {
    oval(ctx, cx, hy + 11, 7.2, 3.6, kit.hair);
  }
}

function paintHeadGear(ctx: CanvasRenderingContext2D, kit: PixelKit, cx: number, hy: number, rx: number): void {
  if (isSlush(kit)) {
    oval(ctx, cx, hy - rx * 0.62, rx * 0.95, 9, "#3f6b34");
    ctx.fillStyle = "#6a4328";
    ctx.fillRect(cx - rx * 0.72, hy - 8, rx * 1.44, 4);
    oval(ctx, cx + 1, hy - rx * 0.95, 4.4, 4.4, "#c2a36a");
    ctx.fillStyle = "#24381c";
    ctx.fillRect(cx - 7, hy - 14, 4, 3);
    ctx.fillStyle = "#6a4328";
    ctx.fillRect(cx + 4, hy - 13, 3, 3);
    return;
  }
  if (kit.prop === "halo" && kit.id !== "lw-hocking") {
    strokeOval(ctx, cx, hy - 21, 13.5, 4.4, kit.trim, 2.6);
  }
  if (kit.hairStyle === "mask") {
    ctx.fillStyle = dim(kit.coat, 0.08);
    ctx.fillRect(cx - rx + 2, hy - 2, rx * 2 - 4, 9);
    ctx.fillStyle = kit.accent;
    ctx.fillRect(cx - 5, hy + 1, 10, 3.2);
  }
  if (isHooli(kit)) {
    oval(ctx, cx - rx + 2, hy + 3, 2.2, 2.2, "#d0ccc4");
    oval(ctx, cx + rx - 2, hy + 3, 2.2, 2.2, "#d0ccc4");
    ctx.fillStyle = kit.vfx;
    ctx.globalAlpha = 0.35;
    oval(ctx, cx + 2, hy - 22, 3, 3, kit.vfx);
    ctx.globalAlpha = 1;
  }
}

function paintPoseVfx(ctx: CanvasRenderingContext2D, kit: PixelKit, r: Rig): void {
  const cx = sx(r.cx);
  const hy = sx(r.hy);
  if (r.pose === "cast" || r.pose === "ult") {
    ctx.save();
    ctx.globalAlpha = r.pose === "ult" ? 0.5 : 0.3;
    strokeOval(ctx, cx, hy + 8, 24 + r.frame, 11, kit.vfx, 3);
    if (r.pose === "ult") {
      ctx.globalAlpha = 0.62;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + r.frame * 0.22;
        oval(ctx, cx + Math.cos(a) * 28, hy + Math.sin(a) * 17, 2.8, 2.8, lit(kit.vfx, 0.4));
      }
    }
    ctx.restore();
  }
  if (r.pose === "attack" && r.strike === "shoot" && r.frame >= 5) {
    ctx.save();
    ctx.globalAlpha = 0.78;
    ctx.shadowColor = kit.vfx;
    ctx.shadowBlur = 10;
    oval(ctx, cx + 30, sx(r.ty), 7, 3.4, kit.vfx);
    ctx.restore();
  }
  if (r.pose === "attack" && r.strike === "punch" && r.frame >= 3 && r.frame <= 7) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    strokeOval(ctx, cx + 26, sx(r.ty + 4), 8, 6, kit.vfx, 2);
    ctx.restore();
  }
  if (r.hurt) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#ff6b3a";
    ctx.fillRect(cx - 18, hy - 18, 36, 4);
    ctx.restore();
  }
}

export function paintHeroInk(
  ctx: CanvasRenderingContext2D,
  kit: PixelKit,
  pose: PixelPose,
  frame: number,
  skinId?: string,
  limb?: AttackLimb | null,
): void {
  const worn = wearKit(kit, skinId);
  ctx.clearRect(0, 0, INK_SIZE, INK_SIZE);
  ctx.imageSmoothingEnabled = false;
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";
  const sheet = sheetDef(worn.id);
  if (sheet) {
    paintHeroSheet(ctx, sheet, pose, frame, skinId, limb);
    return;
  }
  if (pose === "portrait") {
    paintPortrait(ctx, worn);
    if (skinId) paintSkinBody(ctx, skinId, { x: 32, y: 24, w: 64, h: 84 }, pose, frame);
    return;
  }
  const r = computeRig(worn, pose, frame, skinId, limb);
  paintShadow(ctx, r, worn);
  const wheeled = worn.body === "chair" || worn.gait === "roll";
  if (wheeled) paintChair(ctx, worn, r);
  else paintLegs(ctx, worn, r, false);
  paintArms(ctx, worn, r, false);
  paintTorso(ctx, worn, r);
  if (!wheeled) paintLegs(ctx, worn, r, true);
  paintArms(ctx, worn, r, true);
  paintHead(ctx, worn, r);
  if (isSlush(worn) && r.pose === "attack") paintSlushThrowArm(ctx, worn, r, true);
  if (!isSlush(worn) && r.pose === "attack" && r.fist) paintPunchArm(ctx, worn, r, strikingNear(r.fist, true));
  else if (!isSlush(worn) && r.pose === "attack" && r.weaponPose) paintWeaponArm(ctx, worn, r, true);
  paintPoseVfx(ctx, worn, r);
  if (skinId) {
    paintSkinBody(ctx, skinId, { x: sx(r.cx) - 36, y: sx(r.hy) - 8, w: 72, h: 96 }, pose, frame);
  }
}

function paintPortrait(ctx: CanvasRenderingContext2D, kit: PixelKit): void {
  const wash = ctx.createRadialGradient(64, 52, 8, 64, 70, 70);
  wash.addColorStop(0, mix(kit.coatHi, WHITE, 0.12));
  wash.addColorStop(0.55, kit.coat);
  wash.addColorStop(1, dim(kit.coatLo, 0.18));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, INK_SIZE, INK_SIZE);
  ctx.fillStyle = "rgba(255,246,228,0.08)";
  oval(ctx, 42, 28, 28, 16, "rgba(255,246,228,0.08)");
  const r: Rig = {
    pose: "portrait",
    frame: 0,
    cx: 32,
    hy: 14,
    ty: 40,
    ly: 52,
    walk: 0,
    punch: 0,
    lift: 0,
    blink: false,
    dead: false,
    hurt: false,
    win: false,
    cast: false,
    bob: 0,
    l: 0,
    r: 0,
    lyL: 0,
    lyR: 0,
    arm: 0,
    gait: kit.gait,
    strike: "swing",
    stance: 0,
    lean: 0,
  };
  oval(ctx, 64, 108, 40, 30, coatGrad(ctx, kit, 24, 78, 80, 48));
  paintTorso(ctx, kit, { ...r, ty: 40, cx: 32 });
  paintArms(ctx, kit, { ...r, ty: 40, punch: 1, lift: 1 }, false);
  paintArms(ctx, kit, { ...r, ty: 40, punch: 1, lift: 1 }, true);
  paintHead(ctx, kit, { ...r, hy: 16, cx: 32 });
  ctx.strokeStyle = kit.trim;
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, INK_SIZE - 4, INK_SIZE - 4);
}
