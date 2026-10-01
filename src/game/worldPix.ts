/** C42 world bible. Same pixel language as the Grump sheet: hard edges, ink outlines, left-top light. */

import { drawCreepPix, type CreepSprite } from "./creepPix";
import { laneTowerBody, laneTowerMuzzle, laneTowerSmokeY } from "./laneTower";
import { drawJungleMeleeSwing, drawLaneMeleeSwing } from "./punchArms";
import { drawSuppliedAncient, drawSuppliedCreep, drawSuppliedFountain, drawSuppliedJungleCreep, drawSuppliedTower, suppliedFountainReady } from "./suppliedArt";
import { HIDEOUTS, JUNGLE_ROUTES } from "./jungle";
import { TREE_V, foliageH, foliageY } from "./treeScale";
import {
  BACK_TRACKS,
  JUNGLE_CAMPS,
  LANES,
  WORLD,
  ancientPos,
  dist,
  fountain,
  inWoods,
  isWalkable,
  lanePath,
  type Pt,
  type Team,
} from "./map";

export const TEX = 2;
export const TILE = 32;
const INK = "#1a1008";
const WHITE = "#fff6e4";
const MID = { x: 1300, y: 1300 };
const RDIR = { x: Math.SQRT1_2, y: Math.SQRT1_2 };
const RIVER_A = { x: MID.x - RDIR.x * 980, y: MID.y - RDIR.y * 980 };
const RIVER_B = { x: MID.x + RDIR.x * 980, y: MID.y + RDIR.y * 980 };

export type WorldKind =
  | "lawn"
  | "fir"
  | "road"
  | "walk"
  | "river"
  | "bank"
  | "woods"
  | "woodsFir"
  | "cliff"
  | "cliffFir"
  | "plaza"
  | "plazaSea"
  | "camp"
  | "dirt";

function hash(n: number): number {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

export function snap(n: number): number {
  return Math.round(n / TEX) * TEX;
}

export function crisp(ctx: CanvasRenderingContext2D): void {
  ctx.imageSmoothingEnabled = false;
}

export function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(snap(x), snap(y), Math.max(TEX, snap(w)), Math.max(TEX, snap(h)));
}

export function ink(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  px(ctx, x, y, TEX, TEX, color);
}

export function oval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string): void {
  const cx = snap(x);
  const cy = snap(y);
  const arx = Math.max(TEX, snap(rx));
  const ary = Math.max(TEX, snap(ry));
  ctx.fillStyle = fill;
  for (let j = -ary; j <= ary; j += TEX) {
    const t = 1 - (j * j) / (ary * ary);
    const w = Math.max(0, snap(arx * Math.sqrt(Math.max(0, t))));
    ctx.fillRect(cx - w, cy + j, w * 2 + TEX, TEX);
  }
}

export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, width = TEX): void {
  const cx = snap(x);
  const cy = snap(y);
  const arx = Math.max(TEX, snap(rx));
  const ary = Math.max(TEX, snap(ry));
  const inner = Math.max(TEX, snap(width));
  ctx.fillStyle = color;
  for (let j = -ary; j <= ary; j += TEX) {
    const t = 1 - (j * j) / (ary * ary);
    const w = Math.max(0, snap(arx * Math.sqrt(Math.max(0, t))));
    const iw = Math.max(0, w - inner);
    ctx.fillRect(cx - w, cy + j, w - iw, TEX);
    ctx.fillRect(cx + iw + TEX, cy + j, w - iw, TEX);
  }
}

function distSeg(p: Pt, a: Pt, b: Pt): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2));
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
}

function onLane(x: number, y: number, radius: number): boolean {
  const p = { x, y };
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      if (distSeg(p, path[i]!, path[i + 1]!) < radius) return true;
    }
  }
  if (dist(p, fountain.home) < 260 || dist(p, fountain.away) < 260) return true;
  if (dist(p, MID) < 210) return true;
  if (dist(p, ancientPos.home) < 170 || dist(p, ancientPos.away) < 170) return true;
  for (const c of JUNGLE_CAMPS) {
    if (dist(p, c) < 100) return true;
  }
  return false;
}

function onRiver(x: number, y: number, radius: number): boolean {
  return distSeg({ x, y }, RIVER_A, RIVER_B) < radius;
}

function onTrail(x: number, y: number, radius: number): boolean {
  const p = { x, y };
  for (const t of BACK_TRACKS) {
    for (let i = 0; i < t.path.length - 1; i++) {
      if (distSeg(p, t.path[i]!, t.path[i + 1]!) < radius) return true;
    }
  }
  for (const route of JUNGLE_ROUTES) {
    for (let i = 0; i < route.path.length - 1; i++) {
      if (distSeg(p, route.path[i]!, route.path[i + 1]!) < radius) return true;
    }
  }
  return false;
}

export function shopPos(dc: boolean): Pt {
  const f = dc ? fountain.home : fountain.away;
  const a = Math.atan2(MID.y - f.y, MID.x - f.x) + Math.PI;
  return { x: f.x + Math.cos(a) * 204, y: f.y + Math.sin(a) * 204 };
}

function classify(x: number, y: number): WorldKind {
  const fir = x + y > WORLD;
  if (onRiver(x, y, 78)) return "river";
  if (onRiver(x, y, 118)) return "bank";
  if (dist({ x, y }, fountain.home) < 210) return "plaza";
  if (dist({ x, y }, fountain.away) < 210) return "plazaSea";
  for (const c of JUNGLE_CAMPS) {
    if (dist({ x, y }, c) < 86) return "camp";
  }
  if (onLane(x, y, 62)) return "road";
  if (onLane(x, y, 92) || onTrail(x, y, 26)) return "walk";
  if (onLane(x, y, 118)) return "dirt";
  for (const h of HIDEOUTS) {
    if (dist({ x, y }, h) < h.clear - 8) return "dirt";
  }
  const wood = inWoods(x, y);
  if (wood) return wood.fir ? "woodsFir" : "woods";
  if (!isWalkable(x, y) && !onLane(x, y, 110)) return fir ? "cliffFir" : "cliff";
  return fir ? "fir" : "lawn";
}

type Swatch = { a: string; b: string; c: string; d: string; ink: string };

const SW: Record<WorldKind, Swatch> = {
  lawn: { a: "#4a6e30", b: "#3a5c28", c: "#2a4620", d: "#1a3018", ink: "#142010" },
  fir: { a: "#1a4a44", b: "#143830", c: "#0e2a28", d: "#0a201c", ink: "#061412" },
  road: { a: "#4a4838", b: "#3a3830", c: "#2a2824", d: "#1a1814", ink: "#0c0a08" },
  walk: { a: "#8a7a5c", b: "#6a5a40", c: "#4a4030", d: "#2a2418", ink: "#1a140c" },
  river: { a: "#6ab0b8", b: "#3a8a9a", c: "#1c5870", d: "#0e2838", ink: "#081820" },
  bank: { a: "#8a6a48", b: "#6a5640", c: "#3a2c1c", d: "#2a2016", ink: "#14100c" },
  woods: { a: "#3a5a22", b: "#2a4418", c: "#1a3010", d: "#12200c", ink: "#0c1408" },
  woodsFir: { a: "#164038", b: "#102e28", c: "#0a221c", d: "#061814", ink: "#040e0c" },
  cliff: { a: "#3a5228", b: "#2a3c1c", c: "#152414", d: "#0c160c", ink: "#081008" },
  cliffFir: { a: "#1c3c34", b: "#16302c", c: "#0c1e1a", d: "#081412", ink: "#040c0a" },
  plaza: { a: "#c4b49a", b: "#8a7a58", c: "#5a4a32", d: "#3a2c1c", ink: "#1a140c" },
  plazaSea: { a: "#6a7c7e", b: "#2a3a3a", c: "#1c3034", d: "#0e1c20", ink: "#081214" },
  camp: { a: "#a07a48", b: "#5a3e24", c: "#3a2818", d: "#1a120c", ink: "#0c0804" },
  dirt: { a: "#6a5234", b: "#4a3a24", c: "#3a2c1c", d: "#24180e", ink: "#140e08" },
};

function stampTile(ctx: CanvasRenderingContext2D, x: number, y: number, kind: WorldKind, n: number): void {
  const s = SW[kind];
  px(ctx, x, y, TILE, TILE, s.b);
  const v = Math.floor(n * 7);
  if (v === 0) px(ctx, x, y, TILE, TEX * 2, s.a);
  else if (v === 1) px(ctx, x, y, TEX * 2, TILE, s.a);
  else if (v === 2) px(ctx, x + TILE - TEX * 3, y + TEX, TEX * 2, TEX * 5, s.c);
  else if (v === 3) px(ctx, x + TEX * 2, y + TILE - TEX * 3, TEX * 8, TEX * 2, s.d);
  else if (v === 4) {
    px(ctx, x + TEX * 3, y + TEX * 4, TEX * 3, TEX * 2, s.a);
    px(ctx, x + TEX * 8, y + TEX * 9, TEX * 2, TEX * 3, s.c);
  } else if (v === 5) px(ctx, x + TEX, y + TEX * 2, TEX, TEX * 6, s.d);
  else px(ctx, x + TEX * 6, y + TEX, TEX * 4, TEX, s.a);

  if (kind === "road") {
    const mid = n > 0.45;
    if (mid) px(ctx, x + TILE / 2 - TEX, y + TEX * 2, TEX, TEX * 4, "#c9a24a");
    px(ctx, x, y + TILE - TEX, TILE, TEX, s.d);
    px(ctx, x, y, TEX, TILE, s.a);
  }
  if (kind === "walk") {
    const brick = (Math.floor(x / TILE) + Math.floor(y / TILE)) % 2 === 0;
    px(ctx, x + TEX, y + TEX, TILE - TEX * 2, TILE - TEX * 2, brick ? s.a : s.b);
    px(ctx, x + TEX, y + TILE / 2, TILE - TEX * 2, TEX, s.c);
    px(ctx, x, y + TILE - TEX, TILE, TEX, s.ink);
  }
  if (kind === "river") {
    px(ctx, x, y, TILE, TILE, s.c);
    px(ctx, x, y + TEX * 3, TILE, TEX * 2, s.b);
    if (n > 0.55) px(ctx, x + TEX * 2, y + TEX * 6, TEX * 7, TEX, s.a);
    if (n > 0.72) px(ctx, x + TEX * 8, y + TEX * 10, TEX * 5, TEX, WHITE);
    px(ctx, x, y + TILE - TEX, TILE, TEX, s.d);
  }
  if (kind === "bank") {
    px(ctx, x, y + TILE - TEX * 4, TILE, TEX * 2, "#3a5a28");
    if (n > 0.4) px(ctx, x + TEX * 4, y + TEX * 2, TEX * 3, TEX * 2, "#2a4620");
  }
  if (kind === "plaza" || kind === "plazaSea") {
    const check = (Math.floor(x / TILE) + Math.floor(y / TILE)) % 2 === 0;
    px(ctx, x, y, TILE, TILE, check ? s.a : s.b);
    px(ctx, x, y, TILE, TEX, s.a);
    px(ctx, x, y + TILE - TEX, TILE, TEX, s.ink);
    px(ctx, x, y, TEX, TILE, s.a);
    px(ctx, x + TILE - TEX, y, TEX, TILE, s.ink);
  }
  if (kind === "camp") {
    oval(ctx, x + TILE / 2, y + TILE / 2, 12, 8, s.b);
    if (n > 0.5) px(ctx, x + TEX * 4, y + TEX * 6, TEX * 3, TEX * 2, "#c45c2c");
  }
  if (kind === "cliff" || kind === "cliffFir") {
    px(ctx, x, y, TILE, TILE, s.c);
    px(ctx, x, y, TILE, TEX * 2, s.ink);
    px(ctx, x, y + TEX * 3, TILE, TEX, s.a);
    px(ctx, x + TEX * 2, y + TEX * 8, TEX * 6, TEX * 3, s.b);
    px(ctx, x + TILE - TEX * 3, y + TEX * 4, TEX * 2, TEX * 8, s.d);
  }
}

function strokeLane(ctx: CanvasRenderingContext2D, path: Pt[]): void {
  ctx.beginPath();
  ctx.moveTo(path[0]!.x, path[0]!.y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x, path[i]!.y);
  ctx.stroke();
}

/** Continuous ribbons so the three lanes read as paths, plus the fountain-to-lane joins. */
function paintLanePaths(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const paint = (width: number, color: string, dash: number[]) => {
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    for (const lane of LANES) strokeLane(ctx, lanePath.home[lane]);
    const joins: [Pt, Pt][] = [
      [fountain.home, lanePath.home.top[0]!],
      [fountain.home, lanePath.home.mid[0]!],
      [fountain.home, lanePath.home.bot[0]!],
      [fountain.away, lanePath.home.top[lanePath.home.top.length - 1]!],
      [fountain.away, lanePath.home.mid[lanePath.home.mid.length - 1]!],
      [fountain.away, lanePath.home.bot[lanePath.home.bot.length - 1]!],
    ];
    for (const [a, b] of joins) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  };
  paint(78, "#6a5a40", []);
  paint(46, "#3a342c", []);
  paint(34, "#4a4638", []);
  paint(3, "#e8c050", [18, 22]);
  ctx.restore();
}

/** Stone basin so each fountain reads as a base pool, not a plaza tile. */
function paintBasePool(ctx: CanvasRenderingContext2D, f: Pt, home: boolean): void {
  const stone = home ? "#8a7a58" : "#2a3a3a";
  const water = home ? "#1c5870" : "#0a6058";
  const hi = home ? "#6ab0b8" : "#1ab0a4";
  const rim = home ? "#c9a24a" : "#3ec8c1";
  oval(ctx, f.x + 10, f.y + 18, 188, 74, "rgba(0,0,0,0.35)");
  oval(ctx, f.x, f.y, 176, 68, stone);
  oval(ctx, f.x, f.y, 154, 56, "#1a140c");
  oval(ctx, f.x - 6, f.y - 4, 136, 46, water);
  oval(ctx, f.x - 18, f.y - 12, 52, 16, hi);
  ring(ctx, f.x, f.y, 168, 62, rim, 6);
  ring(ctx, f.x, f.y, 148, 52, home ? "#efe6d6" : "#c8f4ee", 3);
}

export function paintC42World(ctx: CanvasRenderingContext2D): void {
  crisp(ctx);
  ctx.fillStyle = SW.lawn.b;
  ctx.fillRect(0, 0, WORLD, WORLD);
  for (let y = 0; y < WORLD; y += TILE) {
    for (let x = 0; x < WORLD; x += TILE) {
      const cx = x + TILE / 2;
      const cy = y + TILE / 2;
      const kind = classify(cx, cy);
      stampTile(ctx, x, y, kind, hash(x * 0.17 + y * 0.31));
    }
  }
  paintLanePaths(ctx);
  paintBasePool(ctx, fountain.home, true);
  paintBasePool(ctx, fountain.away, false);
  px(ctx, 0, 0, WORLD, TEX * 6, INK);
  px(ctx, 0, WORLD - TEX * 6, WORLD, TEX * 6, INK);
  px(ctx, 0, 0, TEX * 6, WORLD, INK);
  px(ctx, WORLD - TEX * 6, 0, TEX * 6, WORLD, INK);
}

/** Oaks and firs share TREE_V. Height grows up from the ground contact. Width stays. */
export function drawPixTree(ctx: CanvasRenderingContext2D, t: { x: number; y: number; r: number; fir: boolean }): void {
  crisp(ctx);
  const x = snap(t.x);
  const y = snap(t.y);
  const r = Math.max(12, snap(t.r));
  oval(ctx, x + 4, y + 12, r * 0.72, r * 0.26, "rgba(0,0,0,0.5)");
  const trunkH = t.fir ? 20 : 16;
  const trunkTop = y - 2;
  let base = trunkTop + trunkH;
  if (!t.fir) {
    base = Math.max(base, y - 12 + r * 0.7, y - 6 + r * 0.48, y - 8 + r * 0.42);
  }
  const vy = (py: number) => foliageY(base, py, TREE_V);
  px(ctx, x - 4, vy(trunkTop), 8, foliageH(trunkH, TREE_V), INK);
  px(ctx, x - 3, vy(y - 2), 3, foliageH(t.fir ? 18 : 14, TREE_V), "#6a3a1c");
  px(ctx, x, vy(y), 3, foliageH(12, TREE_V), "#3a2414");
  if (t.fir) {
    const layers = [
      { dy: 4, w: r * 0.95, c: "#0c201c", i: INK },
      { dy: -6, w: r * 0.78, c: "#163028", i: "#0a1814" },
      { dy: -16, w: r * 0.58, c: "#2a5a40", i: "#12241c" },
      { dy: -26, w: r * 0.38, c: "#4a8a58", i: "#1a3a28" },
    ];
    for (const L of layers) {
      px(ctx, x - L.w, vy(y + L.dy), L.w * 2, foliageH(10, TREE_V), L.i);
      px(ctx, x - L.w + 2, vy(y + L.dy + 2), L.w * 2 - 4, foliageH(6, TREE_V), L.c);
    }
    px(ctx, x - 6, vy(y - 34), 4, foliageH(3, TREE_V), "#8aba70");
    return;
  }
  const blobs = [
    { dx: 0, dy: -12, w: r, h: r * 0.7, c: "#1c3a1c" },
    { dx: -r * 0.45, dy: -6, w: r * 0.62, h: r * 0.48, c: "#2a5a28" },
    { dx: r * 0.4, dy: -8, w: r * 0.55, h: r * 0.42, c: "#4a8a38" },
    { dx: -4, dy: -r * 0.7, w: r * 0.42, h: r * 0.34, c: "#6a9a40" },
  ];
  for (const b of blobs) {
    oval(ctx, x + b.dx, vy(y + b.dy), b.w, foliageH(b.h, TREE_V), INK);
    oval(ctx, x + b.dx - 2, vy(y + b.dy - 2), b.w - 3, foliageH(b.h - 3, TREE_V), b.c);
  }
  px(ctx, x - 8, vy(y - r * 0.55), 5, foliageH(3, TREE_V), "#8aba58");
  px(ctx, x + 6, vy(y - 8), 3, foliageH(2, TREE_V), "#2a4620");
}

export function drawPixBush(ctx: CanvasRenderingContext2D, b: { x: number; y: number; s: number }): void {
  const x = snap(b.x);
  const y = snap(b.y);
  const s = Math.max(8, snap(b.s));
  oval(ctx, x + 3, y + 6, s * 0.8, s * 0.32, "rgba(0,0,0,0.4)");
  const base = y + s * 0.62;
  const vy = (py: number) => foliageY(base, py);
  oval(ctx, x, vy(y), s, foliageH(s * 0.62), INK);
  oval(ctx, x - 2, vy(y - 2), s * 0.82, foliageH(s * 0.5), "#2a4a1c");
  oval(ctx, x - 4, vy(y - 4), s * 0.5, foliageH(s * 0.34), "#4a7a30");
  px(ctx, x - 6, vy(y - 6), 3, foliageH(2), "#8aba58");
}

const ROCK_HI = "#c4b49a";
const ROCK_MID = "#6a6458";
const ROCK_LO = "#3a3830";
const ROCK_MOSS = "#3a5a28";
const ROCK_MOSS_HI = "#6a8a38";
const BARK = "#6a3a1c";
const BARK_HI = "#8a5a2c";
const BARK_LO = "#3a2414";
const RING = "#c4a06a";
const MOSS = "#4a7a30";
const FROND = "#2a4a1c";
const FROND_HI = "#6a8a38";
const FROND_LIT = "#8aba58";

/** Stacked river stone. Center stays on the old oval. Light from the top left. */
export function drawPixRock(ctx: CanvasRenderingContext2D, r: { x: number; y: number; s: number }): void {
  crisp(ctx);
  const x = snap(r.x);
  const y = snap(r.y);
  const s = Math.max(8, snap(r.s));
  oval(ctx, x + TEX * 2, y + snap(s * 0.42), s * 0.9, snap(s * 0.22), "rgba(0,0,0,0.4)");
  const slabs = [
    { dx: s * 0.08, dy: s * 0.18, w: s * 1.55, h: s * 0.34, c: ROCK_LO },
    { dx: -s * 0.12, dy: -s * 0.12, w: s * 1.85, h: s * 0.4, c: ROCK_MID },
    { dx: -s * 0.22, dy: -s * 0.46, w: s * 1.2, h: s * 0.36, c: ROCK_HI },
    { dx: s * 0.05, dy: -s * 0.68, w: s * 0.48, h: s * 0.24, c: "#efe6d6" },
  ];
  for (const b of slabs) {
    const bw = snap(b.w);
    const bh = Math.max(TEX, snap(b.h));
    const bx = snap(x + b.dx - bw / 2);
    const by = snap(y + b.dy);
    px(ctx, bx - TEX, by - TEX, bw + TEX * 2, bh + TEX, INK);
    px(ctx, bx, by, bw, bh, b.c);
    px(ctx, bx, by, TEX, bh, b.c === ROCK_LO ? ROCK_MID : "#fff6e4");
    px(ctx, bx + bw - TEX * 2, by + TEX, TEX, bh - TEX, b.c === "#efe6d6" ? ROCK_HI : "#2a2824");
  }
  px(ctx, x, y - snap(s * 0.4), TEX, snap(s * 0.5), "#1a1814");
  px(ctx, x, y + TEX, snap(s * 0.4), TEX, "#1a1814");
  px(ctx, x - snap(s * 0.7), y + TEX, snap(s * 0.42), snap(s * 0.2), ROCK_MOSS);
  px(ctx, x - snap(s * 0.55), y, snap(s * 0.18), TEX, ROCK_MOSS_HI);
  px(ctx, x - snap(s * 0.35), y - snap(s * 0.5), TEX * 2, TEX, WHITE);
}

const LOG_ART = [
  "..........mmm...........",
  "......mmmmmmmmmmm.......",
  "..bbbbbbbbbbbbbbbbbb....",
  ".hkkbbbbbbbbbbbbbbbbk...",
  ".hddkkkkkkkkkkkkkkkkk...",
  ".hdbbbbbbbbbbbbbbbbbb...",
  "..hbbbbbbbbbbbbbbb......",
  "....nnnnnnnnnnnnnn......",
];

const LOG_PAL: Record<string, string> = {
  m: MOSS,
  b: BARK,
  k: BARK_HI,
  h: RING,
  d: BARK_LO,
  n: "rgba(0,0,0,0.38)",
};

let logPlate: HTMLCanvasElement | null = null;

function fallenLogPlate(): HTMLCanvasElement | null {
  if (logPlate) return logPlate;
  if (typeof document === "undefined") return null;
  const rows = LOG_ART.length;
  const cols = LOG_ART[0]!.length;
  const c = document.createElement("canvas");
  c.width = cols * TEX;
  c.height = rows * TEX;
  const g = c.getContext("2d");
  if (!g) return null;
  g.imageSmoothingEnabled = false;
  const wood = (ch: string | undefined) => !!ch && ch !== "." && ch !== "n";
  for (let row = 0; row < rows; row++) {
    const line = LOG_ART[row]!;
    for (let col = 0; col < cols; col++) {
      if (!wood(line[col])) continue;
      for (const [cx, cy] of [
        [col - 1, row],
        [col + 1, row],
        [col, row - 1],
        [col, row + 1],
      ]) {
        if (cy < 0 || cy >= rows || cx < 0 || cx >= cols) continue;
        const neighbor = LOG_ART[cy]![cx];
        if (neighbor === ".") px(g, cx * TEX, cy * TEX, TEX, TEX, INK);
      }
    }
  }
  for (let row = 0; row < rows; row++) {
    const line = LOG_ART[row]!;
    for (let col = 0; col < cols; col++) {
      const color = LOG_PAL[line[col]!];
      if (!color || line[col] === "n") continue;
      px(g, col * TEX, row * TEX, TEX, TEX, color);
    }
  }
  for (let row = 0; row < rows; row++) {
    const line = LOG_ART[row]!;
    for (let col = 0; col < cols; col++) {
      if (line[col] !== "n") continue;
      px(g, col * TEX, row * TEX, TEX, TEX, LOG_PAL.n!);
    }
  }
  px(g, 5 * TEX, 4 * TEX, TEX, TEX, "#efe6d6");
  px(g, 6 * TEX, 4 * TEX, TEX, TEX, BARK_LO);
  px(g, 14 * TEX, 3 * TEX, TEX * 2, TEX, BARK_LO);
  logPlate = c;
  return c;
}

/** Fallen trunk. Same center as the old bar. The stored angle turns the log. */
export function drawPixLog(ctx: CanvasRenderingContext2D, log: { x: number; y: number; ang: number }): void {
  crisp(ctx);
  const x = snap(log.x);
  const y = snap(log.y);
  const plate = fallenLogPlate();
  if (!plate) {
    px(ctx, x - 16, y - 2, 34, 8, BARK);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(log.ang);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(plate, -Math.round(plate.width / 2), -Math.round(plate.height / 2) + TEX);
  ctx.restore();
}

function fernFrond(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, lean: number): void {
  const n = Math.max(4, Math.floor(h / (TEX * 2)));
  for (let i = 0; i < n; i++) {
    const t = n <= 1 ? 0 : i / (n - 1);
    const sx = snap(x + lean * t * h * 0.35);
    const sy = snap(y - (i * h) / n);
    px(ctx, sx, sy, TEX, TEX * 2, INK);
    px(ctx, sx, sy, TEX, TEX, "#3a5c28");
    const w = snap((1 - t * 0.7) * Math.max(TEX * 3, h * 0.38));
    px(ctx, sx - w, sy, w, TEX, INK);
    px(ctx, sx - w + TEX, sy, Math.max(TEX, w - TEX), TEX, t < 0.35 ? FROND_LIT : FROND_HI);
    px(ctx, sx + TEX, sy - TEX, w, TEX, INK);
    px(ctx, sx + TEX, sy - TEX, Math.max(TEX, w - TEX), TEX, t < 0.45 ? "#3a5c28" : FROND);
    if (i % 2 === 0) px(ctx, sx - TEX * 2, sy - TEX, TEX, TEX, "#c6e090");
  }
  px(ctx, snap(x + lean * h * 0.35), y - h, TEX * 2, TEX, FROND_LIT);
}

/** Wood fern. The foot stays on y. Three fronds grow up from that spot. */
export function drawPixFern(ctx: CanvasRenderingContext2D, f: { x: number; y: number; s: number }): void {
  crisp(ctx);
  const x = snap(f.x);
  const y = snap(f.y);
  const s = Math.max(8, snap(f.s));
  const h = snap(Math.max(16, s * 1.2));
  oval(ctx, x + TEX, y + TEX * 2, snap(s * 0.45), TEX * 2, "rgba(0,0,0,0.35)");
  fernFrond(ctx, x, y, snap(h * 0.72), -0.9);
  fernFrond(ctx, x, y, snap(h * 0.72), 0.9);
  fernFrond(ctx, x, y, h, 0);
  px(ctx, x - TEX * 2, y - TEX, TEX * 2, TEX, MOSS);
}

/** Red cap. Stem foot stays on y. Spots and gills sit on the same cap. */
export function drawPixShroom(ctx: CanvasRenderingContext2D, s: { x: number; y: number; s: number }): void {
  crisp(ctx);
  const x = snap(s.x);
  const y = snap(s.y);
  const cap = Math.max(TEX * 3, snap(6 + s.s * 0.55));
  const stem = snap(Math.max(8, 6 + s.s * 0.35));
  oval(ctx, x + 2, y + 3, cap * 0.7, 3, "rgba(0,0,0,0.35)");
  px(ctx, x - TEX, y - stem, TEX * 2, stem, INK);
  px(ctx, x - TEX / 2, y - stem + TEX, TEX, stem - TEX, "#efe6d6");
  px(ctx, x - TEX / 2, y - stem + TEX, TEX / 2, stem - TEX * 2, WHITE);
  px(ctx, x + TEX / 2, y - stem + TEX * 2, TEX / 2, stem - TEX * 3, "#c4b49a");
  const gillY = y - stem;
  px(ctx, x - cap + TEX, gillY, cap * 2 - TEX * 2, TEX * 2, INK);
  px(ctx, x - cap + TEX * 2, gillY, cap * 2 - TEX * 4, TEX, "#f0d0c8");
  for (let i = -Math.floor(cap / TEX) + 1; i <= Math.floor(cap / TEX) - 1; i += 2) {
    px(ctx, x + i * TEX, gillY, TEX, TEX, "#a06058");
  }
  oval(ctx, x, gillY - TEX, cap, snap(cap * 0.55), INK);
  oval(ctx, x - 1, gillY - TEX * 2, cap - TEX, snap(cap * 0.46), "#c4161c");
  oval(ctx, x - TEX, gillY - TEX * 2.5, cap * 0.42, snap(cap * 0.2), "#e84848");
  px(ctx, x - cap * 0.4, gillY - TEX * 3, TEX, TEX, WHITE);
  px(ctx, x + TEX, gillY - cap * 0.35, TEX, TEX, WHITE);
  px(ctx, x + cap * 0.28, gillY - TEX * 2, TEX, TEX, WHITE);
  px(ctx, x - TEX, gillY - cap * 0.42, TEX, TEX, "#ffd0c8");
}

export function drawPixLamp(ctx: CanvasRenderingContext2D, L: { x: number; y: number }): void {
  const x = snap(L.x);
  const y = snap(L.y);
  px(ctx, x - 3, y + 8, 8, 4, INK);
  px(ctx, x - 1, y - 28, 4, 36, "#3a2c1c");
  px(ctx, x, y - 26, 2, 30, "#8a6a38");
  px(ctx, x - 6, y - 36, 14, 10, INK);
  px(ctx, x - 4, y - 34, 10, 6, "#c9a24a");
  px(ctx, x - 2, y - 32, 4, 3, WHITE);
}

export function drawPixFountain(ctx: CanvasRenderingContext2D, f: Pt, dc: boolean): void {
  crisp(ctx);
  if (drawSuppliedFountain(ctx, dc, f.x, f.y)) return;
  const gold = dc ? "#c9a24a" : "#3ec8c1";
  const stone = dc ? "#8a7a58" : "#2a3a3a";
  const hi = dc ? "#c4b49a" : "#6a7c7e";
  const water = dc ? "#3a8a9a" : "#1ab0a4";
  const deep = dc ? "#16506c" : "#0a6058";
  oval(ctx, f.x + 8, f.y + 16, 168, 62, "rgba(0,0,0,0.5)");
  oval(ctx, f.x, f.y + 4, 158, 58, INK);
  oval(ctx, f.x, f.y, 152, 54, stone);
  oval(ctx, f.x - 8, f.y - 6, 140, 46, hi);
  oval(ctx, f.x, f.y, 128, 42, INK);
  oval(ctx, f.x, f.y, 122, 38, deep);
  oval(ctx, f.x - 10, f.y - 8, 70, 18, water);
  oval(ctx, f.x - 18, f.y - 12, 36, 8, WHITE);
  ring(ctx, f.x, f.y, 148, 52, gold, 4);
  ring(ctx, f.x, f.y, 132, 44, dc ? "#efe6d6" : "#c8f4ee", 2);
  px(ctx, f.x - 6, f.y - 40, 12, 44, hi);
  oval(ctx, f.x, f.y - 44, 16, 10, gold);
  oval(ctx, f.x, f.y - 44, 8, 5, dc ? "#c4161c" : "#8ef0e8");
  if (dc) {
    px(ctx, f.x - 10, f.y - 86, 20, 42, "#d8c8a8");
    px(ctx, f.x - 14, f.y - 90, 28, 8, gold);
    px(ctx, f.x - 4, f.y - 110, 8, 20, "#c4161c");
    px(ctx, f.x + 4, f.y - 106, 16, 10, "#c4161c");
  } else {
    px(ctx, f.x - 4, f.y - 92, 8, 52, "#6a7c7e");
    px(ctx, f.x - 14, f.y - 100, 28, 10, "#3ec8c1");
    px(ctx, f.x - 2, f.y - 118, 4, 18, "#8ef0e8");
  }
}

export function drawPixShop(ctx: CanvasRenderingContext2D, dc: boolean): void {
  const p = shopPos(dc);
  const x = snap(p.x);
  const y = snap(p.y);
  const gold = dc ? "#c9a24a" : "#3ec8c1";
  const wall = dc ? "#6a3a22" : "#1a2a2c";
  const roof = dc ? "#c4161c" : "#0e2a2c";
  oval(ctx, x + 6, y + 18, 42, 14, "rgba(0,0,0,0.45)");
  px(ctx, x - 36, y - 8, 72, 36, INK);
  px(ctx, x - 34, y - 6, 68, 32, wall);
  px(ctx, x - 32, y - 4, 20, 14, dc ? "#3a2010" : "#0a181a");
  px(ctx, x + 8, y - 4, 20, 14, dc ? "#3a2010" : "#0a181a");
  px(ctx, x - 30, y - 2, 16, 10, gold);
  px(ctx, x + 10, y - 2, 16, 10, gold);
  px(ctx, x - 8, y + 4, 16, 20, INK);
  px(ctx, x - 6, y + 6, 12, 16, dc ? "#2a1810" : "#081416");
  px(ctx, x - 38, y - 22, 76, 16, INK);
  px(ctx, x - 36, y - 20, 72, 12, roof);
  px(ctx, x - 20, y - 34, 40, 14, INK);
  px(ctx, x - 18, y - 32, 36, 10, gold);
  ctx.fillStyle = INK;
  ctx.font = "700 8px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = dc ? "#1a1008" : "#041014";
  ctx.fillText("GIFT", x, y - 24);
  ctx.textAlign = "left";
  px(ctx, x - 28, y - 18, 8, 4, WHITE);
  px(ctx, x + 16, y - 18, 6, 3, WHITE);
}

export function drawPixCamp(ctx: CanvasRenderingContext2D, c: { x: number; y: number; fir: boolean }): void {
  oval(ctx, c.x + 8, c.y + 12, 58, 24, "rgba(0,0,0,0.45)");
  oval(ctx, c.x, c.y, 54, 28, INK);
  oval(ctx, c.x, c.y, 48, 24, "#5a3e24");
  oval(ctx, c.x - 6, c.y - 4, 28, 12, "#a07a48");
  ring(ctx, c.x, c.y, 52, 26, c.fir ? "#1c3a32" : "#3a5a28", 4);
  oval(ctx, c.x, c.y + 2, 8, 6, "#c45c2c");
  oval(ctx, c.x - 1, c.y, 4, 3, "#ffd978");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    oval(ctx, c.x + Math.cos(a) * 34, c.y + Math.sin(a) * 18, 7, 5, "#4a3a28");
  }
}

function paintTowerShot(ctx: CanvasRenderingContext2D, x: number, y: number, home: boolean, dead: boolean, swing: number): void {
  if (dead || swing <= 0.08) return;
  const muzzle = laneTowerMuzzle(x, y, home);
  const gold = home ? "#c9a24a" : "#3ec8c1";
  oval(ctx, muzzle.x, muzzle.y, 10 + swing * 8, 6, gold);
  px(ctx, muzzle.x + (home ? -4 : -6), muzzle.y, 16, 2, WHITE);
}

export function drawPixKeep(
  ctx: CanvasRenderingContext2D,
  u: {
    x: number;
    y: number;
    team: Team;
    dead: boolean;
    hp: number;
    maxHp: number;
    towerTier?: "outer" | "middle" | "inner";
    time?: number;
    swing?: number;
  },
): void {
  crisp(ctx);
  const home = u.team === "home";
  const hurt = 1 - Math.max(0, Math.min(1, u.hp / u.maxHp));
  const s = laneTowerBody(u.towerTier);
  const x = snap(u.x);
  const y = snap(u.y);
  if (home && drawSuppliedTower(ctx, "home", x, y, u.dead, u.towerTier)) {
    if (u.hp / u.maxHp < 0.75) drawPixSmoke(ctx, x, laneTowerSmokeY(y), u.time ?? 0, 1 - u.hp / u.maxHp, home);
    paintTowerShot(ctx, x, y, home, u.dead, u.swing ?? 0);
    return;
  }
  if (!home && drawSuppliedTower(ctx, "away", x, y, u.dead, u.towerTier)) {
    if (u.hp / u.maxHp < 0.75) drawPixSmoke(ctx, x, laneTowerSmokeY(y), u.time ?? 0, 1 - u.hp / u.maxHp, home);
    paintTowerShot(ctx, x, y, home, u.dead, u.swing ?? 0);
    return;
  }
  const gold = home ? "#c9a24a" : "#3ec8c1";
  const brick = home ? "#8a3a28" : "#1a3a3c";
  const hi = home ? "#c46a48" : "#2a6a6c";
  const lo = home ? "#4a1810" : "#0c2426";
  oval(ctx, x + 6, y + s + 8, s * 1.35, 12, "rgba(0,0,0,0.5)");
  oval(ctx, x, y + s + 4, s * 1.2, 10, INK);
  oval(ctx, x, y + s + 2, s * 1.05, 8, gold);

  if (u.dead) {
    px(ctx, x - s, y + 4, s * 2, s * 0.7, lo);
    px(ctx, x - s * 0.7, y - 4, s * 0.5, s * 0.5, brick);
    px(ctx, x + 4, y, s * 0.6, s * 0.4, hi);
    oval(ctx, x - 6, y + 8, 8, 6, gold);
    drawPixSmoke(ctx, x, y, u.time ?? 0, 1, home);
    return;
  }

  const h = snap(s * 2.6);
  px(ctx, x - s * 0.7, y - h + 16, s * 1.4, h, INK);
  px(ctx, x - s * 0.62, y - h + 20, s * 1.24, h - 8, brick);
  px(ctx, x - s * 0.62, y - h + 20, TEX * 2, h - 8, hi);
  px(ctx, x + s * 0.5, y - h + 22, TEX * 2, h - 12, lo);
  for (let i = 0; i < 4; i++) {
    px(ctx, x - s * 0.4, y - h + 36 + i * 14, s * 0.8, 3, lo);
    px(ctx, x - s * 0.28, y - h + 40 + i * 14, 6, 8, INK);
    px(ctx, x + s * 0.08, y - h + 40 + i * 14, 6, 8, gold);
  }
  px(ctx, x - s * 0.82, y - h + 10, s * 1.64, 12, INK);
  px(ctx, x - s * 0.74, y - h + 12, s * 1.48, 8, gold);
  for (let i = -2; i <= 2; i++) {
    px(ctx, x + i * 10 - 3, y - h, 6, 12, INK);
    px(ctx, x + i * 10 - 2, y - h + 2, 4, 8, brick);
  }
  px(ctx, x - 2, y - h - 18, 4, 18, home ? "#c4161c" : "#3ec8c1");
  px(ctx, x + 2, y - h - 16, 14, 8, home ? "#c4161c" : "#3ec8c1");
  oval(ctx, x, y - h + 22, 6, 5, gold);
  if (hurt > 0.25) px(ctx, x - s * 0.4, y - 8, 8, 6, INK);
  if (hurt > 0.5) {
    px(ctx, x + 6, y - 20, 10, 8, lo);
    drawPixSmoke(ctx, x, y - h * 0.4, u.time ?? 0, 0.55, home);
  }
  if (hurt > 0.75) {
    px(ctx, x - 12, y - 4, 14, 6, "#2a1008");
    drawPixSmoke(ctx, x + 8, y - 8, u.time ?? 0, 0.9, home);
  }
  const swing = u.swing ?? 0;
  if (swing > 0.08) {
    oval(ctx, x + (home ? 22 : -22), y - h * 0.4, 10 + swing * 8, 6, gold);
    px(ctx, x + (home ? 18 : -28), y - h * 0.4, 16, 2, WHITE);
  }
}

export function drawPixAncient(ctx: CanvasRenderingContext2D, u: { x: number; y: number; team: Team; dead: boolean; time?: number; hp: number; maxHp: number }): void {
  crisp(ctx);
  const home = u.team === "home";
  const x = snap(u.x);
  const y = snap(u.y);
  if (drawSuppliedAncient(ctx, home ? "home" : "away", x, y, u.dead)) {
    if (u.hp / u.maxHp < 0.75) drawPixSmoke(ctx, x, y - 36, u.time ?? 0, 1 - u.hp / u.maxHp, home);
    ctx.fillStyle = home ? "#c4161c" : "#3ec8c1";
    ctx.font = "700 13px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(home ? "WASHINGTON DC" : "SEATTLE", x, y + 56);
    ctx.textAlign = "left";
    return;
  }
  oval(ctx, x + 8, y + 22, 48, 16, "rgba(0,0,0,0.5)");
  if (home) {
    px(ctx, x - 36, y - 8, 72, 36, INK);
    px(ctx, x - 34, y - 6, 68, 32, "#c4b49a");
    for (let i = -3; i <= 3; i++) {
      px(ctx, x + i * 9 - 3, y - 6, 5, 28, "#efe6d6");
      px(ctx, x + i * 9 - 2, y - 4, 2, 24, "#8a7a58");
    }
    oval(ctx, x, y - 28, 28, 16, INK);
    oval(ctx, x, y - 30, 24, 13, "#c9a24a");
    oval(ctx, x, y - 32, 14, 8, "#c4161c");
    px(ctx, x - 2, y - 52, 4, 16, "#c4161c");
    px(ctx, x + 2, y - 48, 12, 8, "#c4161c");
  } else {
    px(ctx, x - 8, y - 70, 16, 78, INK);
    px(ctx, x - 6, y - 68, 12, 74, "#6a7c7e");
    px(ctx, x - 4, y - 66, 4, 70, "#c8f4ee");
    oval(ctx, x, y - 78, 22, 10, INK);
    oval(ctx, x, y - 80, 18, 8, "#3ec8c1");
    px(ctx, x - 18, y - 8, 36, 16, "#1a2a2c");
  }
  if (u.hp / u.maxHp < 0.75) drawPixSmoke(ctx, x, y - 36, u.time ?? 0, 1 - u.hp / u.maxHp, home);
  ctx.fillStyle = home ? "#c4161c" : "#3ec8c1";
  ctx.font = "700 13px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(home ? "WASHINGTON DC" : "SEATTLE", x, y + 56);
  ctx.textAlign = "left";
}

export function drawPixSmoke(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, amount: number, home: boolean): void {
  const n = Math.max(1, Math.floor(3 + amount * 4));
  for (let i = 0; i < n; i++) {
    const lift = ((time * 18 + i * 11) % 28) + i * 4;
    const drift = Math.sin(time * 2 + i) * 6;
    oval(ctx, x + drift + (i % 2 ? 6 : -6), y - lift, 6 + i, 4 + i * 0.6, home ? "rgba(40,24,16,0.45)" : "rgba(16,32,32,0.4)");
  }
}

export function drawPixCreep(ctx: CanvasRenderingContext2D, u: CreepSprite): void {
  crisp(ctx);
  const flip = Math.cos(u.facing ?? 0) < 0 ? -1 : 1;
  const alpha = u.dead ? Math.max(0.15, Math.min(1, (u.barkT ?? 0) / 0.8)) : 1;
  if (!u.wild) {
    if (drawSuppliedCreep(ctx, u.team, u.caster, u.x, u.y, flip, alpha)) {
      drawLaneMeleeSwing(ctx, u.x, u.y, flip, u.team, u.swing ?? 1, u.caster, !!u.dead);
      return;
    }
  } else if (!u.objectiveId) {
    if (u.dead && (u.barkT ?? 0) <= 0) return;
    if (drawSuppliedJungleCreep(ctx, u.x, u.y, flip, alpha)) {
      drawJungleMeleeSwing(ctx, u.x, u.y, flip, u.swing ?? 1, !!u.dead);
      return;
    }
  }
  drawCreepPix(ctx, u);
}

export function drawPixWaterLive(ctx: CanvasRenderingContext2D, time: number): void {
  crisp(ctx);
  ctx.save();
  ctx.translate(MID.x, MID.y);
  ctx.rotate(Math.PI / 4);
  const shift = snap(Math.sin(time) * 10);
  px(ctx, -940 + shift, -12, 1880, 4, "rgba(220,245,250,0.35)");
  px(ctx, -940 - shift, 16, 1880, 2, "rgba(180,230,240,0.22)");
  for (let i = 0; i < 18; i++) {
    const n = hash(i * 7.3);
    const x = -880 + ((time * 48 + n * 1800) % 1760);
    const y = -48 + n * 90;
    px(ctx, x, y, 18 + n * 16, 2, "rgba(210,240,245,0.28)");
  }
  ctx.restore();
}

export function drawPixFountainLive(ctx: CanvasRenderingContext2D, f: Pt, dc: boolean, time: number): void {
  if (suppliedFountainReady(dc)) return;
  crisp(ctx);
  const gold = dc ? "#c9a24a" : "#3ec8c1";
  const r = 58 + Math.sin(time * 2.2) * 8;
  ring(ctx, f.x, f.y, r, r * 0.38, `rgba(255,255,255,${0.28 + Math.sin(time * 3) * 0.1})`, 2);
  ring(ctx, f.x, f.y, r * 0.62, r * 0.24, gold, 2);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + time * 1.7;
    const lift = 20 + Math.sin(time * 5.4 + i) * 16;
    const rad = 6 + (i % 4) * 7;
    px(ctx, f.x + Math.cos(a) * rad, f.y - lift, 2, 3, dc ? "#d2ecff" : "#aafff2");
  }
}

export function drawPixJunk(ctx: CanvasRenderingContext2D, x: number, y: number, ammo: "can" | "bottle", maga: boolean, spin: number): void {
  ctx.save();
  ctx.translate(snap(x), snap(y));
  ctx.rotate(spin);
  px(ctx, -16, -1, 14, 2, "#c4a06a");
  px(ctx, -18, -4, 4, 2, maga ? "#c4161c" : "#3ec8c1");
  px(ctx, -18, 2, 4, 2, WHITE);
  if (ammo === "can") {
    px(ctx, -2, -5, 6, 10, maga ? "#c4161c" : "#3ec8c1");
    px(ctx, -2, -7, 6, 2, "#c9a24a");
    px(ctx, -1, -3, 2, 2, WHITE);
  } else {
    px(ctx, -1, -8, 4, 12, maga ? "#5a2010" : "#1a3a34");
    px(ctx, -1, -10, 4, 2, maga ? "#c4161c" : "#3ec8c1");
  }
  ctx.restore();
}
