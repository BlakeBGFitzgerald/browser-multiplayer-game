/**
 * Chunky pixel shots. One blot is a few screen pixels. No particles are allocated here.
 */

import type { ProjectileLook } from "./projectileLook.ts";
import { drawNerfRocket } from "./nerf.ts";

type Slot = "ink" | "shade" | "hi" | "body" | "accent" | "metal" | "dye" | "color";
type Dot = readonly [number, number, number, number, Slot];

const INK = "#142033";
const HI = "#fff6e4";
const SHADE = "#1a120c";

const ARROW: readonly Dot[] = [
  [-8, -2, 12, 4, "ink"],
  [-7, -1, 10, 2, "body"],
  [4, -2, 5, 4, "ink"],
  [5, -1, 3, 2, "metal"],
  [7, 0, 2, 1, "hi"],
  [-11, -3, 3, 2, "accent"],
  [-11, -1, 3, 2, "dye"],
  [-11, 1, 3, 2, "color"],
];

const CROSSBOW: readonly Dot[] = [
  [-4, -2, 8, 3, "ink"],
  [-3, -1, 6, 1, "body"],
  [4, -2, 4, 3, "ink"],
  [5, -1, 2, 1, "metal"],
  [-6, -2, 2, 1, "accent"],
  [-6, 0, 2, 1, "dye"],
];

const VINE: readonly Dot[] = [
  [-10, -2, 14, 4, "ink"],
  [-9, -1, 12, 2, "body"],
  [4, -2, 5, 4, "ink"],
  [5, -1, 3, 2, "metal"],
  [-13, -4, 3, 3, "accent"],
  [-13, 1, 3, 3, "dye"],
  [-10, -3, 2, 2, "hi"],
];

const MIC: readonly Dot[] = [
  [-8, -3, 16, 6, "ink"],
  [-7, -2, 10, 4, "body"],
  [3, -3, 6, 6, "ink"],
  [4, -2, 4, 4, "metal"],
  [5, -1, 2, 2, "hi"],
  [-2, -1, 3, 2, "accent"],
];

const SOUND: readonly Dot[] = [
  [-8, -1, 2, 2, "accent"],
  [-5, -3, 2, 4, "accent"],
  [-2, -5, 2, 6, "hi"],
  [2, -3, 6, 6, "ink"],
  [3, -2, 4, 4, "metal"],
  [4, -1, 2, 2, "body"],
];

const STAFF: readonly Dot[] = [
  [-2, -2, 4, 4, "ink"],
  [-1, -1, 2, 2, "accent"],
  [-5, -1, 3, 2, "body"],
  [2, -1, 2, 2, "hi"],
  [0, -4, 2, 2, "accent"],
  [0, 2, 2, 2, "body"],
];

const TRACER: readonly Dot[] = [
  [-5, -1, 8, 2, "ink"],
  [-4, -1, 6, 2, "accent"],
  [-2, -1, 3, 1, "hi"],
  [3, -1, 2, 2, "metal"],
];

const SLUG: readonly Dot[] = [
  [-5, -3, 10, 6, "ink"],
  [-4, -2, 8, 4, "dye"],
  [-4, -2, 8, 2, "accent"],
  [-2, 0, 4, 1, "body"],
];

const RAIL: readonly Dot[] = [
  [-6, -2, 12, 4, "ink"],
  [-5, -1, 8, 2, "metal"],
  [3, -1, 3, 2, "accent"],
  [-3, -1, 2, 1, "hi"],
];

const NOTE: readonly Dot[] = [
  [-3, -4, 6, 5, "ink"],
  [-2, -3, 4, 3, "body"],
  [-1, -2, 2, 1, "hi"],
  [2, -1, 2, 6, "metal"],
  [3, 3, 3, 2, "accent"],
];

const DROP: readonly Dot[] = [
  [0, -4, 2, 2, "hi"],
  [-1, -2, 4, 3, "accent"],
  [-2, 0, 6, 3, "body"],
  [-1, 2, 4, 2, "metal"],
  [0, 3, 2, 2, "shade"],
];

const CUBE: readonly Dot[] = [
  [-4, -4, 8, 8, "ink"],
  [-3, -3, 6, 6, "dye"],
  [-3, -3, 3, 3, "accent"],
  [1, 1, 2, 2, "metal"],
];

const SCRAP: readonly Dot[] = [
  [-4, -3, 8, 6, "ink"],
  [-3, -2, 6, 4, "dye"],
  [-2, -1, 4, 1, "accent"],
  [-3, 1, 3, 1, "body"],
];

const DISC: readonly Dot[] = [
  [-3, -3, 6, 6, "ink"],
  [-2, -2, 4, 4, "dye"],
  [-1, -1, 2, 2, "accent"],
  [-4, -1, 2, 2, "hi"],
  [3, -1, 2, 2, "hi"],
];

const QUAD: readonly Dot[] = [
  [-4, -4, 2, 2, "accent"],
  [2, -4, 2, 2, "hi"],
  [-4, 2, 2, 2, "metal"],
  [2, 2, 2, 2, "body"],
  [-1, -1, 2, 2, "accent"],
];

const GLOB: readonly Dot[] = [
  [-4, -3, 8, 7, "ink"],
  [-3, -2, 6, 5, "accent"],
  [-1, -1, 3, 3, "metal"],
  [2, 1, 2, 2, "body"],
  [-2, -2, 2, 1, "hi"],
];

const CAN: readonly Dot[] = [
  [-4, -6, 8, 12, "ink"],
  [-3, -4, 6, 8, "body"],
  [-3, -6, 6, 2, "metal"],
  [-2, -3, 2, 4, "hi"],
  [-3, 3, 6, 2, "shade"],
];

const BOTTLE: readonly Dot[] = [
  [-2, -7, 4, 3, "ink"],
  [-1, -6, 2, 2, "metal"],
  [-4, -4, 8, 10, "ink"],
  [-3, -3, 6, 8, "body"],
  [-2, -2, 2, 3, "hi"],
  [-3, 3, 6, 2, "shade"],
];

const PENNANT: readonly Dot[] = [
  [-3, -5, 8, 10, "ink"],
  [-2, -4, 6, 3, "accent"],
  [-2, -1, 6, 3, "dye"],
  [-2, 2, 6, 3, "color"],
  [-8, -1, 5, 2, "accent"],
  [-1, -3, 2, 1, "hi"],
];

const TEAL: readonly Dot[] = [
  [-3, -4, 8, 8, "ink"],
  [-2, -3, 6, 6, "accent"],
  [-1, -2, 2, 2, "hi"],
  [1, 1, 3, 2, "body"],
  [-7, -1, 4, 2, "metal"],
];

const CAPITOL: readonly Dot[] = [
  [-5, -4, 10, 8, "ink"],
  [-4, -3, 8, 6, "body"],
  [-1, -5, 2, 8, "dye"],
  [-4, 1, 8, 2, "accent"],
  [-3, -2, 2, 2, "hi"],
];

const NEEDLE: readonly Dot[] = [
  [-1, -2, 3, 4, "ink"],
  [0, -8, 2, 8, "accent"],
  [0, -10, 2, 3, "color"],
  [-1, 2, 4, 2, "metal"],
  [0, -7, 1, 2, "hi"],
];

const SNOW: readonly Dot[] = [
  [-5, -2, 8, 5, "ink"],
  [-6, -4, 5, 3, "hi"],
  [-3, -3, 7, 5, "dye"],
  [-1, -1, 4, 3, "body"],
  [2, 0, 3, 3, "metal"],
  [-5, 1, 3, 2, "accent"],
  [1, -5, 3, 2, "hi"],
  [-2, 2, 4, 2, "body"],
];

const SPARK: readonly Dot[] = [
  [-1, -5, 2, 10, "ink"],
  [-5, -1, 10, 2, "ink"],
  [-1, -4, 2, 8, "color"],
  [-4, -1, 8, 2, "color"],
  [-1, -1, 2, 2, "hi"],
];

const DOTS: Readonly<Record<string, readonly Dot[]>> = {
  "arrow-home": ARROW,
  "arrow-away": ARROW,
  "crossbow-bolt": CROSSBOW,
  "vine-arrow": VINE,
  "mic-capsule": MIC,
  "sound-bolt": SOUND,
  "staff-spark": STAFF,
  tracer: TRACER,
  "paper-slug": SLUG,
  "metal-bolt": RAIL,
  "note-bolt": NOTE,
  "green-drop": DROP,
  "flash-cube": CUBE,
  "paper-scrap": SCRAP,
  "flash-disc": DISC,
  "quad-spark": QUAD,
  "paint-glob": GLOB,
  can: CAN,
  bottle: BOTTLE,
  "tower-pennant": PENNANT,
  "tower-teal": TEAL,
  "capitol-chip": CAPITOL,
  "needle-splinter": NEEDLE,
  "ability-spark": SPARK,
  snowball: SNOW,
};

function tone(slot: Slot, look: ProjectileLook): string {
  if (slot === "ink") return INK;
  if (slot === "shade") return SHADE;
  if (slot === "hi") return HI;
  if (slot === "body") return look.body;
  if (slot === "accent") return look.accent;
  if (slot === "metal") return look.metal;
  if (slot === "dye") return look.dye;
  return look.color;
}

function place(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  lx: number,
  ly: number,
  w: number,
  h: number,
  color: string,
): void {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x + lx * c - ly * s), Math.round(y + lx * s + ly * c), w, h);
}

function paintDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  look: ProjectileLook,
  dots: readonly Dot[],
): void {
  for (const dot of dots) {
    place(ctx, x, y, ang, dot[0], dot[1], dot[2], dot[3], tone(dot[4], look));
  }
}

function spins(id: string): boolean {
  return id === "can" || id === "bottle" || id === "paint-glob" || id === "paper-scrap" || id === "flash-cube" || id === "quad-spark";
}

function pulses(id: string): boolean {
  return id === "flash-disc" || id === "green-drop" || id === "staff-spark" || id === "ability-spark" || id === "quad-spark";
}

function trail(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, color: string, time: number): void {
  const phase = Math.floor(time * 10);
  for (let i = 1; i <= 3; i++) {
    ctx.globalAlpha = 0.5 - i * 0.12;
    const side = (i + phase) % 2 === 0 ? 1 : -1;
    place(ctx, x, y, ang, -3 - i * 3, side, 2, 2, color);
  }
  ctx.globalAlpha = 1;
}

export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tx: number,
  ty: number,
  look: ProjectileLook,
  time = 0,
): void {
  if (look.id === "foam-rocket") {
    drawNerfRocket(ctx, x, y, tx, ty, look.dye === "nerf-orange" ? "nerf-orange" : "nerf-blue");
    return;
  }
  const flight = Math.atan2(ty - y, tx - x);
  const wobble = look.id === "note-bolt" ? Math.sin(time * 12) * 0.18 : 0;
  const ang = flight + wobble + (spins(look.id) ? time * 7 : 0);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  trail(ctx, x, y, flight, look.accent || look.color, time);
  paintDots(ctx, x, y, ang, look, DOTS[look.id] ?? SPARK);
  if (pulses(look.id) && Math.sin(time * 16) > 0) {
    place(ctx, x, y, flight, 5, -3, 2, 2, HI);
  }
  ctx.restore();
}

function chip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dx: number,
  dy: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x + dx), Math.round(y + dy), w, h);
}

function impactKind(id: string): "foam" | "tick" | "splat" | "junk" | "shard" | "flash" | "drop" | "puff" | "spark" {
  if (id === "foam-rocket") return "foam";
  if (id === "snowball") return "puff";
  if (id === "arrow-home" || id === "arrow-away" || id === "crossbow-bolt" || id === "vine-arrow") return "tick";
  if (id === "paint-glob") return "splat";
  if (id === "can" || id === "bottle") return "junk";
  if (id === "tower-pennant" || id === "tower-teal" || id === "capitol-chip" || id === "needle-splinter") return "shard";
  if (id === "flash-cube" || id === "flash-disc") return "flash";
  if (id === "green-drop") return "drop";
  return "spark";
}

/** A few chunky pixels at a hit. Life is seconds remaining, about a sixth of a second. */
export function drawProjectileImpact(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  look: ProjectileLook,
  life: number,
): void {
  if (life <= 0) return;
  const spread = (0.16 - Math.min(life, 0.16)) * 26;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const kind = impactKind(look.id);
  if (kind === "foam") {
    chip(ctx, x, y, -spread, -1, 3, 3, look.color);
    chip(ctx, x, y, spread, 1, 2, 2, look.metal);
    chip(ctx, x, y, 0, -spread, 2, 2, HI);
  } else if (kind === "tick") {
    chip(ctx, x, y, -spread, 0, 3, 2, look.metal);
    chip(ctx, x, y, spread, -1, 2, 2, look.accent);
  } else if (kind === "splat") {
    chip(ctx, x, y, -spread, -1, 3, 3, look.accent);
    chip(ctx, x, y, spread, 1, 3, 2, look.metal);
    chip(ctx, x, y, 0, spread, 2, 2, look.body);
  } else if (kind === "junk") {
    chip(ctx, x, y, -spread, 0, 3, 2, look.body);
    chip(ctx, x, y, spread, -1, 2, 2, look.metal);
  } else if (kind === "shard") {
    chip(ctx, x, y, -spread, -1, 3, 2, look.accent);
    chip(ctx, x, y, 1, 0, 3, 2, look.dye);
    chip(ctx, x, y, spread, 1, 2, 2, look.color);
  } else if (kind === "flash") {
    chip(ctx, x, y, -1, -1, 3, 3, HI);
    chip(ctx, x, y, -spread, 0, 2, 2, look.accent);
  } else if (kind === "drop") {
    chip(ctx, x, y, 0, -spread, 2, 2, look.accent);
    chip(ctx, x, y, 1, 1, 2, 2, look.body);
  } else if (kind === "puff") {
    chip(ctx, x, y, -spread * 0.55, -1, 3, 2, look.dye);
    chip(ctx, x, y, spread * 0.4, 1, 2, 2, HI);
    chip(ctx, x, y, 1, -spread * 0.35, 2, 2, look.body);
  } else {
    chip(ctx, x, y, -spread, 0, 2, 2, look.color);
    chip(ctx, x, y, spread, 0, 2, 2, look.color);
    chip(ctx, x, y, 0, -spread, 2, 2, HI);
  }
  ctx.restore();
}
