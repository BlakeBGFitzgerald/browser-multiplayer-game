import { hooliAttackBody, sheetAttackParts } from "./attackLean";
import { kitHoldsSwungBook, paintSwungBook } from "./bookSwing";
import { computeRig, type AttackLimb, type PixelPose } from "./pixelC32";
import { pixelKit } from "./pixelRoster";
import { paintSkinBody, skinMotion } from "./skinMotion";

export type SheetDef = {
  id: string;
  w: number;
  h: number;
  pal: string[];
  pix: string;
  split: number;
  gait: "step" | "roll" | "unit";
  skin: string;
  blink: { x: number; y: number; w: number; h: number }[];
  flash: { x: number; y: number };
  /** Empty column between the planted feet. Walk splits here instead of mid-sheet. */
  gap?: number;
  /** Wheel hubs in sheet pixels. A roll gait spins a spoke cross on each while moving. */
  wheels?: { x: number; y: number }[];
};

const CANVAS = 128;
const INK = "#100c08";
const decoded = new Map<string, HTMLCanvasElement>();

function decode(def: SheetDef): HTMLCanvasElement {
  const hit = decoded.get(def.id);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = def.w;
  c.height = def.h;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const img = ctx.createImageData(def.w, def.h);
  const raw = atob(def.pix);
  const pal = def.pal.map((hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
  });
  for (let i = 0; i < raw.length; i++) {
    const idx = raw.charCodeAt(i);
    if (idx === 255) continue;
    const rgb = pal[idx];
    if (!rgb) continue;
    img.data[i * 4] = rgb[0];
    img.data[i * 4 + 1] = rgb[1];
    img.data[i * 4 + 2] = rgb[2];
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  decoded.set(def.id, c);
  return c;
}

function blit(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
): void {
  if (sw <= 0 || sh <= 0) return;
  ctx.drawImage(src, sx, sy, sw, sh, Math.round(dx), Math.round(dy), sw, sh);
}

/** Opposite-foot stride. Skin stride still scales it; the floor stays visible. */
function footStep(frame: number, skinId: string | undefined, reach: number): { lx: number; rx: number; ly: number; ry: number } {
  const phase = ((frame % 8) + 8) % 8;
  const table = [
    { l: -1, r: 0.85, ly: 0, ry: -1 },
    { l: -0.65, r: 0.4, ly: 0.4, ry: -0.75 },
    { l: -0.12, r: 0.12, ly: 0, ry: 0 },
    { l: 0.4, r: -0.55, ly: -0.75, ry: 0.4 },
    { l: 0.85, r: -1, ly: -1, ry: 0 },
    { l: 0.4, r: -0.65, ly: -0.75, ry: 0.4 },
    { l: 0.12, r: -0.12, ly: 0, ry: 0 },
    { l: -0.55, r: 0.4, ly: 0.4, ry: -0.75 },
  ];
  const p = table[phase]!;
  const s = Math.max(0.55, skinMotion(skinId)?.stride ?? 1);
  return {
    lx: Math.round(p.l * reach * s),
    rx: Math.round(p.r * reach * s),
    ly: Math.round(p.ly * 6 * s),
    ry: Math.round(p.ry * 6 * s),
  };
}

/** Swing the whole lower half, left against right, so the stride is the legs and not a sliding shoe. */
function paintWalkingLegs(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  def: SheetDef,
  bodyX: number,
  bob: number,
  frame: number,
  skinId: string | undefined,
  reach: number,
): void {
  const gap = def.gap ?? (def.w >> 1);
  const top = def.split;
  const h = def.h - top;
  const step = footStep(frame, skinId, reach);
  const overlap = 2;
  blit(ctx, src, 0, top, gap + overlap, h, bodyX + step.lx, top + bob + step.ly);
  blit(ctx, src, Math.max(0, gap - overlap), top, def.w - gap + overlap, h, bodyX + gap - overlap + step.rx, top + bob + step.ry);
}

function paintFeet(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  def: SheetDef,
  bodyX: number,
  destY: number,
  frame: number,
  skinId: string | undefined,
  reach: number,
): void {
  const shoe = 18;
  const gap = def.gap ?? (def.w >> 1);
  const sy = def.h - shoe;
  const step = footStep(frame, skinId, reach);
  blit(ctx, src, 0, sy, gap + 2, shoe, bodyX + step.lx, destY + step.ly);
  blit(ctx, src, gap - 2, sy, def.w - gap + 2, shoe, bodyX + gap - 2 + step.rx, destY + step.ry);
}

function paintWheels(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, centers: number[]): void {
  const ang = (phase % 8) * (Math.PI / 4);
  for (const cx of centers) {
    ctx.save();
    ctx.translate(x + cx, y);
    ctx.rotate(ang);
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(-1, -6, 2, 12);
    ctx.fillRect(-6, -1, 12, 2);
    ctx.fillStyle = INK;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }
}

/** Mohawk ticks on its own. The rifle stays on the torso so the shot does not tear the arms. */
function hooliNudge(pose: PixelPose, frame: number, walk: number): { body: number; hair: number } {
  if (pose === "idle") {
    const hair = frame === 1 || frame === 6 ? 1 : frame === 2 || frame === 7 ? -1 : 0;
    const body = frame === 3 || frame === 8 ? 1 : 0;
    return { body, hair };
  }
  if (pose === "walk") {
    const hair = walk % 4 === 1 ? 1 : walk % 4 === 3 ? -1 : 0;
    return { body: 0, hair };
  }
  if (pose === "attack") {
    const hair = frame <= 5 ? 1 : frame <= 7 ? 0 : frame <= 9 ? -1 : 0;
    return { body: hooliAttackBody(frame), hair };
  }
  if (pose === "cast") return { body: 2, hair: 1 };
  if (pose === "ult") return { body: 4, hair: 1 };
  if (pose === "hurt") return { body: -3, hair: -1 };
  return { body: 0, hair: 0 };
}

function dots(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, n: number, color: string, frame: number): void {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + frame * 0.35;
    ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * (r * 0.55)), 2, 2);
  }
}

export function paintHeroSheet(
  ctx: CanvasRenderingContext2D,
  def: SheetDef,
  pose: PixelPose,
  frame: number,
  skinId?: string,
  limb?: AttackLimb | null,
): void {
  const src = decode(def);
  const kit = pixelKit(def.id);
  const r = computeRig(kit, pose, frame, skinId, limb);
  const pad = (CANVAS - def.w) >> 1;
  ctx.imageSmoothingEnabled = false;
  if (pose === "portrait") {
    const bust = def.id === "maga-hooli";
    const sy = bust ? 12 : 0;
    const sh = bust ? 100 : Math.min(def.h, 96);
    const dy = bust ? 6 : 16;
    blit(ctx, src, 0, sy, def.w, sh, pad, dy);
    if (skinId) paintSkinBody(ctx, skinId, { x: pad, y: dy, w: def.w, h: sh }, pose, frame);
    return;
  }

  const breath = (pose === "idle" && (frame === 3 || frame === 8) ? -1 : 0) + (pose === "idle" ? r.bob : 0);
  const weight =
    (pose === "idle" ? (frame === 1 || frame === 6 ? 1 : frame === 2 || frame === 7 ? -1 : 0) : 0) +
    (pose === "idle" ? r.stance : 0);
  const attack = sheetAttackParts(pose, frame, r.punch, !!skinId);
  const jab = attack.jab;
  const recoil = attack.recoil;
  const lift = r.lift ? -Math.min(pose === "ult" ? 9 : 6, r.lift) : 0;
  const knock = r.hurt ? -4 - (frame > 2 ? 2 : 0) : 0;
  const sway = pose === "walk" ? Math.round(r.arm * 1.15) : 0;
  const bob = (pose === "walk" ? r.bob : 0) + breath;
  const posture = Math.round(r.lean * 28);
  const bodyX = pad + knock + weight + jab + recoil + sway + posture;
  const rise = lift + bob + knock;
  const lean =
    attack.lean !== 0
      ? attack.lean
      : pose === "hurt"
        ? 0.12
          : pose === "walk"
            ? r.walk % 2 === 0
              ? -0.04
              : 0.04
            : pose === "cast" || pose === "ult"
              ? -0.05
              : 0;

  if (r.dead) {
    const flop = 0.85 + Math.min(0.45, frame * 0.08);
    ctx.save();
    ctx.translate(64 + knock, 108 + Math.min(6, frame));
    ctx.rotate(flop);
    blit(ctx, src, 0, 0, def.w, def.h, -def.w / 2, -80);
    if (skinId) paintSkinBody(ctx, skinId, { x: -def.w / 2, y: -80, w: def.w, h: def.h }, pose, frame);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = INK;
  ctx.fillRect(40 + knock + weight, 122 + bob, 48, 3);
  ctx.restore();

  if (lean) {
    ctx.save();
    ctx.translate(64, 112);
    ctx.rotate(lean);
    ctx.translate(-64, -112);
  }

  const split = def.split;
  const lowerH = def.h - split;
  const upperY = rise + (r.hy - 10);

  if (def.gait === "unit") {
    const hop = pose === "walk" ? (r.walk % 2 === 0 ? -1 : 1) : 0;
    if (pose === "walk") {
      const shoe = 18;
    blit(ctx, src, 0, 0, def.w, def.h - shoe, bodyX + hop, rise);
    paintFeet(ctx, src, def, bodyX + hop, rise + def.h - shoe, r.walk, skinId, 11);
    } else {
      blit(ctx, src, 0, 0, def.w, def.h, bodyX + hop, rise);
    }
    paintFace(ctx, def, bodyX + hop, rise, r.blink, pose, frame, kit.vfx);
    paintCombat(ctx, def, bodyX + hop, rise, pose, frame, kit.vfx, r.hurt);
    if (skinId) paintSkinBody(ctx, skinId, { x: bodyX + hop, y: rise, w: def.w, h: def.h }, pose, frame);
    if (lean) ctx.restore();
    return;
  }

  if (def.gait === "roll") {
    const roll = pose === "walk" ? Math.round(Math.sin((r.walk / 8) * Math.PI * 2) * 2) : pose === "attack" ? jab : 0;
    blit(ctx, src, 0, split, def.w, lowerH, bodyX + roll, split + bob);
    if (pose === "walk") {
      const hubs = def.wheels ?? [
        { x: def.id === "lw-hocking" ? 39 : 40, y: split + lowerH - 8 },
        { x: 66, y: split + lowerH - 8 },
      ];
      for (const wheel of hubs) paintWheels(ctx, bodyX + roll, wheel.y + bob, r.walk, [wheel.x]);
    }
    blit(ctx, src, 0, 0, def.w, split, bodyX + Math.round(roll * 0.35), upperY);
    paintFace(ctx, def, bodyX + Math.round(roll * 0.35), upperY, r.blink, pose, frame, kit.vfx);
    paintCombat(ctx, def, bodyX + Math.round(roll * 0.35), upperY, pose, frame, kit.vfx, r.hurt);
    if (skinId) paintSkinBody(ctx, skinId, { x: bodyX, y: rise, w: def.w, h: def.h }, pose, frame);
    if (lean) ctx.restore();
    return;
  }

  if (pose === "walk") {
    paintWalkingLegs(ctx, src, def, bodyX, bob, r.walk, skinId, 14);
  } else {
    const plant = r.hurt ? 1 : pose === "victory" ? -1 : 0;
    blit(ctx, src, 0, split, def.w, lowerH, bodyX, split + bob + plant);
  }

  const hooli = def.id === "maga-hooli";
  const nudge = hooli ? hooliNudge(pose, frame, r.walk) : { body: 0, hair: 0 };
  const upperX = bodyX + nudge.body;
  if (hooli) {
    const hairH = 36;
    blit(ctx, src, 0, 0, def.w, hairH, upperX + nudge.hair, upperY);
    blit(ctx, src, 0, hairH, def.w, split - hairH, upperX, upperY + hairH);
  } else {
    blit(ctx, src, 0, 0, def.w, split, bodyX, upperY);
  }
  paintFace(ctx, def, hooli ? upperX : bodyX, upperY, r.blink, pose, frame, kit.vfx);
  paintCombat(ctx, def, hooli ? upperX : bodyX, upperY, pose, frame, kit.vfx, r.hurt);
  if (kitHoldsSwungBook(kit)) paintSwungBook(ctx, bodyX, upperY, pose, frame);
  if (skinId) paintSkinBody(ctx, skinId, { x: bodyX, y: rise, w: def.w, h: def.h }, pose, frame);
  if (lean) ctx.restore();
}

function paintFace(
  ctx: CanvasRenderingContext2D,
  def: SheetDef,
  pad: number,
  upperY: number,
  blink: boolean,
  pose: PixelPose,
  frame: number,
  vfx: string,
): void {
  if (blink) {
    ctx.fillStyle = def.skin;
    for (const e of def.blink) ctx.fillRect(pad + e.x, upperY + e.y, e.w, e.h);
  }
  if (pose === "attack" || pose === "cast" || pose === "ult" || pose === "victory") {
    ctx.fillStyle = pose === "ult" || pose === "victory" ? "#ffe08a" : vfx;
    const ring = pose === "ult" ? 12 : pose === "victory" ? 8 : 6;
    dots(ctx, pad + def.flash.x, upperY + def.flash.y, ring, pose === "ult" ? 14 : 10, pose === "ult" ? "#ffe08a" : vfx, frame);
    if (pose === "attack" && frame >= 4) {
      ctx.fillStyle = "#fff6e4";
      ctx.fillRect(pad + def.flash.x, upperY + def.flash.y, 7, 2);
      ctx.fillRect(pad + def.flash.x + 5, upperY + def.flash.y - 5, 2, 7);
      ctx.fillRect(pad + def.flash.x + 2, upperY + def.flash.y - 2, 3, 3);
    }
  }
}

function paintCombat(
  ctx: CanvasRenderingContext2D,
  def: SheetDef,
  pad: number,
  upperY: number,
  pose: PixelPose,
  frame: number,
  vfx: string,
  hurt: boolean,
): void {
  if (pose === "cast" || pose === "ult") {
    ctx.save();
    ctx.globalAlpha = pose === "ult" ? 0.22 : 0.14;
    ctx.fillStyle = pose === "ult" ? "#ffe08a" : vfx;
    ctx.fillRect(pad + 10, upperY + 18, def.w - 20, 52);
    ctx.restore();
    dots(ctx, pad + (def.w >> 1), upperY + 40, pose === "ult" ? 22 : 16, 8, pose === "ult" ? "#ffe08a" : vfx, frame + 3);
  }
  if (hurt) {
    ctx.fillStyle = "rgba(255,80,40,0.28)";
    ctx.fillRect(pad + 8, upperY + 8, def.w - 16, 70);
  }
}
