import { skinById, type SkinLook } from "../dlc";
import { type Gait, type PixelKit } from "./pixelRoster";
import { paintPixelSkin } from "./pixelSkin";

/** C28 art bible: 48×48 native, multi-step shade, rim light. Heroes only. */
export const PIXEL_SIZE = 48;
export const PIXEL_INK = "#1a1008";
const WHITE = "#fff6e4";
const CHEEK = "#c08060";
const LIP = "#c07070";
const MOUTH = "#6a2020";

export type PixelPose = "idle" | "walk" | "attack" | "cast" | "hurt" | "death" | "victory" | "portrait";

function clamp255(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n;
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
  return mix(c, "#1a1008", t);
}

function lit(c: string, t = 0.32): string {
  return mix(c, WHITE, t);
}

export class Grid {
  readonly w = PIXEL_SIZE;
  readonly h = PIXEL_SIZE;
  readonly p: (string | "")[];
  constructor() {
    this.p = Array.from({ length: PIXEL_SIZE * PIXEL_SIZE }, () => "");
  }
  get(x: number, y: number): string {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return "";
    return this.p[y * this.w + x] ?? "";
  }
  set(x: number, y: number, c: string): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !c) return;
    this.p[y * this.w + x] = c;
  }
  rect(x: number, y: number, w: number, h: number, c: string): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  dot(x: number, y: number, c: string): void {
    this.set(x, y, c);
  }
  block(x: number, y: number, w: number, h: number, mid: string, hi: string, lo: string): void {
    this.rect(x, y, w, h, mid);
    this.rect(x, y, w, 1, hi);
    this.rect(x, y, 1, h, hi);
    this.rect(x + w - 1, y + 1, 1, h - 1, lo);
    this.rect(x + 1, y + h - 1, w - 1, 1, lo);
  }
  drape(x: number, y: number, w: number, h: number, mid: string, hi: string, lo: string): void {
    this.block(x, y, w, h, mid, hi, lo);
    if (h > 5) this.rect(x + 2, y + 4, 1, h - 6, hi);
    if (w > 6) this.rect(x + w - 3, y + 5, 1, Math.max(1, h - 7), lo);
    if (h > 8) this.rect(x + 4, y + 6, 1, 3, dim(mid, 0.18));
  }
  fold(x: number, y: number, h: number, c: string): void {
    this.rect(x, y, 1, h, c);
  }
  rim(x: number, y: number, w: number, h: number, c: string): void {
    this.rect(x, y, w, 1, c);
    this.rect(x, y, 1, h, c);
  }
  dither(x: number, y: number, w: number, h: number, c: string): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (((i + j) & 1) === 0) this.set(x + i, y + j, c);
  }
}

function rimLight(g: Grid, kit: PixelKit): void {
  const glow = lit(kit.coatHi, 0.35);
  const skinGlow = lit(kit.skinHi, 0.28);
  for (let y = 1; y < g.h - 1; y++) {
    for (let x = 1; x < g.w - 1; x++) {
      const c = g.get(x, y);
      if (!c || c === PIXEL_INK) continue;
      const left = !g.get(x - 1, y) || g.get(x - 1, y) === PIXEL_INK;
      const top = !g.get(x, y - 1) || g.get(x, y - 1) === PIXEL_INK;
      if ((left || top) && ((x + y) & 1) === 0) {
        g.set(x, y, c === kit.skin || c === kit.skinHi ? skinGlow : glow);
      }
    }
  }
}

function outline(g: Grid, ink = PIXEL_INK): void {
  const add: { x: number; y: number }[] = [];
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; x++) {
      if (g.get(x, y)) continue;
      if (g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1) || g.get(x, y + 1)) add.push({ x, y });
    }
  }
  for (const p of add) g.set(p.x, p.y, ink);
}

type Face = "pout" | "grin" | "shout" | "calm" | "squint" | "open" | "grim" | "smirk";

function faceOf(id: string): Face {
  const map: Record<string, Face> = {
    "maga-grumptor": "pout",
    "maga-elonmolk": "calm",
    "maga-rogentor": "grin",
    "maga-alexgroans": "shout",
    "maga-boris": "smirk",
    "maga-brander": "open",
    "maga-vestyt": "grim",
    "maga-steers": "squint",
    "lw-bitenten": "open",
    "lw-sandbags": "grim",
    "lw-odramma": "calm",
    "lw-harass": "grin",
    "lw-hocking": "calm",
    "lw-youngturkey": "smirk",
    "lw-vakxie": "squint",
    "lw-climate": "open",
    "wild-icon": "grim",
    "wild-enigma": "calm",
    "wild-cartoons": "grin",
    "wild-dynasty": "smirk",
    "wild-legend": "open",
    "wild-karen": "shout",
    "wild-butter": "squint",
    "wild-cezanne": "calm",
    "mma-macgregor": "smirk",
    "mma-nurmagoat": "grim",
    "mma-jonesy": "calm",
    "mma-adesanyaish": "smirk",
    "mma-poirierish": "grin",
    "mma-diazish": "open",
  };
  return map[id] ?? "calm";
}

export type Rig = {
  pose: PixelPose;
  frame: number;
  cx: number;
  hy: number;
  ty: number;
  ly: number;
  walk: number;
  punch: number;
  lift: number;
  blink: boolean;
  dead: boolean;
  hurt: boolean;
  win: boolean;
  cast: boolean;
  bob: number;
  l: number;
  r: number;
  gait: Gait;
};

function gaitOffsets(gait: Gait, walk: number, pose: PixelPose): { l: number; r: number; bob: number } {
  if (pose !== "walk") return { l: 0, r: 0, bob: 0 };
  const cycle = walk % 8;
  const ext = gait === "stomp" || gait === "waddle" ? 4 : gait === "glide" || gait === "roll" ? 2 : 3;
  const hop = gait === "bounce" || gait === "fight" || gait === "duo" ? 1 : 0;
  const l = cycle === 1 || cycle === 2 ? ext : cycle === 5 || cycle === 6 ? -1 : 0;
  const r = cycle === 5 || cycle === 6 ? ext : cycle === 1 || cycle === 2 ? -1 : 0;
  const bob = cycle === 1 || cycle === 5 ? hop : cycle === 2 || cycle === 6 ? -hop : 0;
  if (gait === "waddle") return { l: l + (cycle % 2 ? 1 : 0), r: r - (cycle % 2 ? 1 : 0), bob: cycle % 2 };
  if (gait === "shuffle") return { l: Math.min(2, l), r: Math.min(2, r), bob: 0 };
  if (gait === "swagger") return { l, r, bob: cycle % 2 ? 1 : 0 };
  if (gait === "roll") return { l: 0, r: 0, bob: cycle % 2 ? 1 : 0 };
  if (gait === "talk") return { l: Math.max(0, l - 1), r: Math.max(0, r - 1), bob: cycle === 3 ? 1 : 0 };
  return { l, r, bob };
}

function computeRig(kit: PixelKit, pose: PixelPose, frame: number): Rig {
  const walk = pose === "walk" ? frame % 8 : 0;
  const punch =
    pose === "attack" ? (frame <= 1 ? frame : frame === 2 || frame === 3 ? 4 : 2) : pose === "cast" ? 1 + (frame > 3 ? 2 : 0) : 0;
  const dead = pose === "death";
  const hurt = pose === "hurt";
  const win = pose === "victory";
  const cast = pose === "cast";
  const blink = pose === "idle" && (frame === 3 || frame === 7);
  const { l, r, bob } = gaitOffsets(kit.gait, walk, pose);
  const breath = pose === "idle" ? (frame === 2 || frame === 6 ? -1 : 0) : 0;
  const hx = hurt ? -3 - (frame > 1 ? 1 : 0) : 0;
  const hy = dead ? 26 : 7 + breath + (hurt ? 1 : 0) + (cast ? -3 : 0) + (win ? -2 : 0) + bob;
  const ty = dead ? 30 : 20 + breath + (win ? -1 : 0) + bob;
  const lift = win || cast || (pose === "attack" && frame >= 2 && frame <= 4) ? (win ? 8 : cast ? 7 : 4) : 0;
  return {
    pose,
    frame,
    cx: 24 + hx,
    hy,
    ty,
    ly: 36 + (pose === "idle" && frame === 2 ? -1 : 0) + bob,
    walk,
    punch,
    lift,
    blink,
    dead,
    hurt,
    win,
    cast,
    bob,
    l,
    r,
    gait: kit.gait,
  };
}

type WornSkin = { look: SkinLook; tint: string };

function wornOf(skinId?: string): WornSkin | undefined {
  if (!skinId) return undefined;
  const s = skinById(skinId);
  if (!s) return undefined;
  return { look: s.look, tint: s.tint };
}

function applySkin(g: Grid, skin: WornSkin | undefined, r: { cx: number; hy: number; ty: number; pose: string; frame: number }): void {
  if (!skin) return;
  paintPixelSkin(g, skin.look, skin.tint, r);
}

export function stampC28(g: Grid, kit: PixelKit, pose: PixelPose, frame: number, skinId?: string): void {
  const skin = wornOf(skinId);
  if (pose === "portrait") {
    stampPortrait(g, kit);
    applySkin(g, skin, { cx: 24, hy: 10, ty: 26, pose: "portrait", frame: 0 });
    outline(g);
    rimLight(g, kit);
    return;
  }
  const r = computeRig(kit, pose, frame);
  if (r.dead) {
    if (kit.id === "wild-legend") paintLegendDeath(g, kit, frame);
    else paintDeath(g, kit, frame);
    applySkin(g, skin, { cx: 24, hy: 30, ty: 34, pose: "death", frame });
    outline(g);
    rimLight(g, kit);
    return;
  }
  paintHero(g, kit, r);
  if (pose === "attack" && (frame === 3 || frame === 4)) paintHitPixels(g, kit, r.cx + 14, r.ty);
  if (r.cast) paintCastPixels(g, kit, r.cx, r.hy, frame);
  if (r.hurt) {
    g.dot(r.cx - 8, r.hy + 3, kit.vfx);
    g.dot(r.cx + 10, r.hy + 2, WHITE);
    g.dot(r.cx + 7, r.hy - 1, kit.trim);
  }
  if (r.win) {
    g.dot(r.cx - 10, r.hy - 4, kit.trim);
    g.dot(r.cx + 10, r.hy - 5, kit.vfx);
  }
  applySkin(g, skin, { cx: r.cx, hy: r.hy, ty: r.ty, pose, frame });
  outline(g);
  rimLight(g, kit);
}

function stampPortrait(g: Grid, kit: PixelKit): void {
  g.rect(0, 0, 48, 48, dim(kit.coatLo, 0.12));
  g.rect(1, 1, 46, 46, "#0c0a08");
  g.rect(3, 3, 42, 10, kit.coat);
  g.rect(3, 3, 42, 3, kit.coatHi);
  g.dither(3, 8, 42, 4, kit.coatLo);
  g.rect(3, 30, 42, 15, kit.coatLo);
  g.rect(3, 32, 42, 3, kit.coat);
  const dummy: Rig = {
    pose: "portrait",
    frame: 0,
    cx: 24,
    hy: 10,
    ty: 26,
    ly: 60,
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
    gait: kit.gait,
  };
  paintHero(g, kit, dummy);
  g.rect(3, 43, 42, 2, kit.accent);
  g.rect(3, 3, 42, 2, kit.trim);
}

function paintDeath(g: Grid, kit: PixelKit, frame: number): void {
  const sink = frame === 0 ? 3 : frame === 1 ? 1 : 0;
  const wide = kit.wide ? 3 : 0;
  g.block(8, 34 + sink, 32 + wide, 8, kit.coat, kit.coatHi, kit.coatLo);
  g.rect(11, 32 + sink, 26, 4, kit.coat);
  g.rect(14, 29 + sink, 14, 6, kit.skin);
  g.rect(16, 28 + sink, 10, 3, kit.skinHi);
  g.rect(12, 26 + sink, 18, 3, kit.hair);
  g.rect(14, 25 + sink, 8, 2, kit.hairHi);
  g.rect(26, 36 + sink, 7, 3, kit.accent);
  g.dot(18, 32 + sink, PIXEL_INK);
  g.dot(24, 32 + sink, PIXEL_INK);
  g.rect(19, 34 + sink, 5, 1, MOUTH);
  g.rect(9, 42, 8, 3, PIXEL_INK);
  g.rect(30, 42, 8, 3, PIXEL_INK);
  g.dot(32, 30 + sink, kit.vfx);
  g.dot(35, 33 + sink, kit.trim);
}

function paintHead(g: Grid, kit: PixelKit, cx: number, y: number, blink: boolean, fat = 0): void {
  const lo = dim(kit.skin, 0.42);
  g.rect(cx - 3, y + 10, 6, 4, kit.skin);
  g.rect(cx - 2, y + 10, 4, 2, kit.skinHi);
  g.block(cx - 6 - fat, y, 12 + fat * 2, 12, kit.skin, kit.skinHi, lo);
  g.rect(cx - 4, y + 1, 8, 2, kit.skinHi);
  g.rim(cx - 5 - fat, y + 1, 10 + fat * 2, 3, lit(kit.skinHi, 0.2));
  g.rect(cx + 4 + fat, y + 3, 2, 6, CHEEK);
  g.dot(cx - 4 - fat, y + 7, CHEEK);
  g.dot(cx + 3 + fat, y + 7, CHEEK);
  g.rect(cx - 7 - fat, y + 4, 2, 5, kit.skin);
  g.rect(cx + 5 + fat, y + 4, 2, 5, kit.skin);
  g.dot(cx - 7 - fat, y + 6, lo);
  g.dot(cx + 6 + fat, y + 6, CHEEK);
  g.dot(cx - 1, y + 6, dim(kit.skin, 0.22));
  paintFace(g, kit, cx, y, blink);
}

function paintFace(g: Grid, kit: PixelKit, cx: number, y: number, blink: boolean): void {
  const face = faceOf(kit.id);
  g.rect(cx - 3, y + 3, 2, 1, dim(kit.hair, 0.15));
  g.rect(cx + 2, y + 3, 2, 1, dim(kit.hair, 0.15));
  if (blink) {
    g.rect(cx - 3, y + 5, 3, 1, PIXEL_INK);
    g.rect(cx + 1, y + 5, 3, 1, PIXEL_INK);
  } else {
    g.rect(cx - 3, y + 5, 3, 2, WHITE);
    g.rect(cx + 1, y + 5, 3, 2, WHITE);
    g.dot(cx - 2, y + 6, PIXEL_INK);
    g.dot(cx + 2, y + 6, PIXEL_INK);
    g.dot(cx - 3, y + 5, lit(WHITE, 0.2));
  }
  g.dot(cx, y + 7, dim(kit.skin, 0.28));
  if (face === "pout") {
    g.rect(cx - 2, y + 9, 5, 2, LIP);
    g.rect(cx - 1, y + 10, 3, 1, MOUTH);
  } else if (face === "grin") {
    g.rect(cx - 3, y + 9, 7, 2, WHITE);
    g.rect(cx - 2, y + 10, 5, 1, MOUTH);
  } else if (face === "shout") {
    g.rect(cx - 2, y + 8, 5, 3, MOUTH);
    g.dot(cx, y + 9, WHITE);
  } else if (face === "smirk") {
    g.rect(cx - 1, y + 9, 4, 1, LIP);
    g.dot(cx + 2, y + 10, MOUTH);
  } else if (face === "grim") {
    g.rect(cx - 2, y + 9, 5, 1, MOUTH);
  } else if (face === "open") {
    g.rect(cx - 2, y + 9, 5, 2, LIP);
    g.dot(cx, y + 10, MOUTH);
  } else if (face === "squint") {
    g.rect(cx - 3, y + 5, 3, 1, PIXEL_INK);
    g.rect(cx + 1, y + 5, 3, 1, PIXEL_INK);
    g.rect(cx - 1, y + 9, 3, 1, LIP);
  } else {
    g.rect(cx - 2, y + 9, 4, 1, LIP);
  }
}

function paintLegs(g: Grid, kit: PixelKit, r: Rig, longCoat = false): void {
  const { cx, ly, l, r: rr } = r;
  const shoe = "#3a2418";
  const shoeHi = "#5c3a28";
  const pant = longCoat ? kit.coatLo : dim(kit.coat, 0.2);
  const leftX = cx - 5 + (r.pose === "walk" ? -Math.max(0, l - 1) : 0);
  const rightX = cx + 1 + (r.pose === "walk" ? Math.max(0, rr - 1) : 0);
  g.block(leftX, ly, 5, 8, pant, kit.coat, kit.coatLo);
  g.block(rightX, ly, 5, 8, pant, kit.coat, kit.coatLo);
  g.block(leftX - 1, ly + 7, 6, 3, shoe, shoeHi, PIXEL_INK);
  g.block(rightX, ly + 7, 6, 3, shoe, shoeHi, PIXEL_INK);
  g.dot(leftX + 1, ly + 8, lit(shoeHi, 0.2));
  g.dot(rightX + 2, ly + 8, lit(shoeHi, 0.2));
}

function suitArms(g: Grid, kit: PixelKit, r: Rig, x: number, w: number, ty: number): void {
  const lift = r.lift;
  const punch = r.punch;
  g.block(x - 3, ty + 2 - lift, 4, 8, kit.coat, kit.coatHi, kit.coatLo);
  g.block(x + w - 1 + punch, ty + 2 - lift, 4, 8, kit.coat, kit.coatHi, kit.coatLo);
  g.block(x - 4, ty + 8 - lift, 4, 4, kit.skin, kit.skinHi, dim(kit.skin, 0.4));
  g.block(x + w + punch, ty + 8 - lift, 4, 4, kit.skin, kit.skinHi, dim(kit.skin, 0.4));
}

function paintTorso(g: Grid, kit: PixelKit, r: Rig): { x: number; w: number } {
  const { cx, ty } = r;
  const wide = kit.wide ? 2 : 0;
  let w = 16 + wide;
  let x = cx - Math.floor(w / 2);
  if (kit.body === "tech") {
    w = 14;
    x = cx - 7;
    g.drape(x, ty, w, 15, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 5, ty + 3, 10, 4, kit.accent);
    g.dot(cx + 2, ty + 4, kit.trim);
    g.dot(cx - 2, ty + 4, WHITE);
    g.rect(cx - 4, ty + 9, 8, 1, PIXEL_INK);
  } else if (kit.body === "hoodie" || kit.body === "street") {
    w = 16;
    x = cx - 8;
    g.drape(x, ty, w, 15, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 4, ty, 8, 4, kit.coatLo);
    g.rect(cx - 3, ty + 1, 6, 2, kit.coat);
  } else if (kit.body === "parka" || kit.body === "earth") {
    w = 20;
    x = cx - 10;
    g.drape(x, ty, w, 16, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(x + 1, ty + 2, w - 2, 4, "#efe6d6");
  } else if (kit.body === "shorts") {
    w = 14;
    x = cx - 7;
    g.drape(x, ty, w, 10, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 5, ty + 8, 10, 5, kit.accent);
  } else if (kit.body === "labcoat") {
    w = 18;
    x = cx - 9;
    g.drape(x, ty, w, 16, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 3, ty, 6, 4, WHITE);
    g.rect(cx + 4, ty + 4, 4, 5, kit.accent);
  } else if (kit.body === "pink" || kit.body === "gold" || kit.body === "gown") {
    w = 16;
    x = cx - 8;
    g.drape(x, ty, w, 16, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 3, ty + 4, 6, 2, kit.trim);
  } else if (kit.body === "chair") {
    w = 16;
    x = cx - 8;
    g.drape(x, ty, w, 12, kit.coat, kit.coatHi, kit.coatLo);
    g.block(cx - 10, ty + 8, 6, 10, "#2a2430", "#4a4450", "#141018");
    g.block(cx + 4, ty + 8, 6, 10, "#2a2430", "#4a4450", "#141018");
    g.rect(cx - 9, ty + 16, 18, 3, kit.trim);
  } else {
    g.drape(x, ty, w, 16, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 3, ty, 6, 5, WHITE);
    g.rect(cx - 2, ty + 1, 3, 14, kit.accent);
    g.rect(cx - 2, ty + 1, 3, 3, kit.trim);
    g.dot(cx - 1, ty + 8, kit.trim);
    g.rect(x + 2, ty + 3, 4, 5, kit.coatHi);
  }
  suitArms(g, kit, r, x, w, ty);
  return { x, w };
}

function paintProp(g: Grid, kit: PixelKit, r: Rig): void {
  const { cx, ty, punch, win, cast } = r;
  const px = cx + 12 + punch * 2;
  const py = ty + (win || cast ? -8 : 2);
  switch (kit.prop) {
    case "rocket":
      g.block(px, py - 7, 6, 13, kit.trim, kit.coatHi, kit.coatLo);
      g.rect(px, py - 10, 6, 3, kit.accent);
      g.dot(px + 2, py - 9, WHITE);
      g.dot(px + 1, py + 6, "#ff7043");
      g.dot(px + 3, py + 6, "#ffcc80");
      if (cast || (r.pose === "attack" && r.frame >= 3)) g.dot(px + 2, py + 9, "#ffcc80");
      break;
    case "mic":
      g.rect(px + 2, py, 2, 10, PIXEL_INK);
      g.block(px - 1, py - 6, 8, 7, kit.accent, kit.coatHi, kit.coatLo);
      g.dot(px + 2, py - 3, WHITE);
      break;
    case "megaphone":
      g.rect(px, py, 3, 8, PIXEL_INK);
      g.block(px - 1, py - 3, 6, 6, kit.accent, kit.coatHi, kit.coatLo);
      g.rect(px + 4, py - 6, 7, 9, kit.trim);
      if (cast || (r.pose === "attack" && r.frame >= 3)) {
        g.dot(px + 12, py - 4, kit.vfx);
        g.dot(px + 14, py, WHITE);
      }
      break;
    case "book":
      g.block(px, py, 9, 10, kit.accent, kit.coatHi, kit.coatLo);
      g.rect(px + 1, py + 1, 6, 8, PIXEL_INK);
      g.dot(px + 3, py + 3, kit.trim);
      g.rect(px + 2, py + 6, 4, 1, WHITE);
      break;
    case "flask":
      g.block(px, py - 2, 7, 10, "#7ec8ff", WHITE, "#3d6ea6");
      g.rect(px + 2, py - 4, 3, 3, PIXEL_INK);
      g.dot(px + 3, py + 2, WHITE);
      break;
    case "globe":
      g.block(px, py - 2, 9, 9, "#3d6ea6", "#7ec8ff", "#1a3a5c");
      g.rect(px + 2, py, 4, 3, "#5ad45a");
      g.dot(px + 6, py + 4, WHITE);
      break;
    case "mittens":
      g.block(cx - 13, ty + 9, 7, 7, kit.accent, kit.coatHi, kit.coatLo);
      g.block(cx + 7, ty + 9, 7, 7, kit.accent, kit.coatHi, kit.coatLo);
      g.dot(cx - 10, ty + 11, WHITE);
      break;
    case "halo":
      g.rect(cx - 8, r.hy - 4, 16, 2, kit.accent);
      g.rect(cx - 6, r.hy - 5, 12, 1, kit.trim);
      if (cast || win) g.dot(cx, r.hy - 7, WHITE);
      break;
    case "glove":
    case "tape":
      g.block(cx + 10 + punch, ty + 6, 8, 8, kit.accent, WHITE, kit.coatLo);
      g.dot(cx + 13 + punch, ty + 8, WHITE);
      break;
    case "sash":
      g.rect(cx - 8, ty + 4, 16, 3, kit.accent);
      g.dot(cx, ty + 5, kit.trim);
      break;
    case "belt":
      g.rect(cx - 7, ty + 9, 14, 4, PIXEL_INK);
      g.rect(cx - 2, ty + 9, 5, 4, kit.trim);
      break;
    case "staff":
      g.rect(cx + 12 + punch, ty - 8, 3, 22, "#6b4a2a");
      g.block(cx + 10 + punch, ty - 12, 7, 6, kit.accent, kit.trim, kit.coatLo);
      break;
    case "camera":
      g.block(px - 2, py, 12, 8, PIXEL_INK, "#3a2418", PIXEL_INK);
      g.rect(px + 7, py + 2, 5, 5, WHITE);
      g.dot(px + 2, py + 2, kit.vfx);
      break;
    case "file":
      g.block(px, py, 9, 11, WHITE, "#efe6d6", "#8a8070");
      g.rect(px + 1, py + 2, 7, 1, PIXEL_INK);
      g.rect(px + 1, py + 5, 7, 1, PIXEL_INK);
      break;
    case "brush":
      g.rect(px + 2, py - 2, 2, 12, "#6b4a2a");
      g.block(px, py - 6, 7, 5, "#3d6ea6", "#7ec8ff", "#1a3a5c");
      g.rect(px + 5, py - 4, 3, 3, "#c4161c");
      break;
    default:
      break;
  }
}

function paintHero(g: Grid, kit: PixelKit, r: Rig): void {
  if (kit.id === "maga-grumptor") {
    paintGrump(g, kit, r);
    return;
  }
  if (kit.id === "wild-legend") {
    paintLegend(g, kit, r);
    return;
  }
  const fat = kit.wide || kit.id === "lw-sandbags" || kit.id === "lw-bitenten" ? 1 : 0;
  paintHead(g, kit, r.cx, r.hy, r.blink, fat);
  paintTorso(g, kit, r);
  paintUnique(g, kit, r);
  paintLegs(g, kit, r, kit.body === "robe" || kit.body === "gown" || kit.hairStyle === "locks");
  paintProp(g, kit, r);
  if (kit.hairStyle !== "duo" && kit.hairStyle !== "mascot") paintHairOnTop(g, kit, r);
  if (r.pose === "idle" || r.pose === "walk") {
    g.dot(r.cx - 8, r.hy + 2, lit(kit.skinHi, 0.15));
    g.dot(r.cx + 6, r.ty + 2, lit(kit.coatHi, 0.2));
  }
}

/** Template read of the supplied Grump pixel figure: navy suit, blond puff, red tie, flag, point. */
function paintGrump(g: Grid, kit: PixelKit, r: Rig): void {
  const cx = r.cx;
  const hy = Math.max(3, Math.min(10, r.hy));
  const ty = r.pose === "portrait" ? 28 : r.ty;
  const ly = r.pose === "portrait" ? 60 : r.ly;
  const navy = kit.coat;
  const navyHi = kit.coatHi;
  const navyLo = kit.coatLo;
  const skinLo = dim(kit.skin, 0.42);
  const h = kit.hair;
  const hi = kit.hairHi;
  const hLo = dim(h, 0.35);
  const pointUp = r.pose === "idle" || r.pose === "cast" || r.pose === "victory" || r.pose === "portrait";
  const jab = r.pose === "attack" && r.frame >= 2 && r.frame <= 4;
  const punch = jab ? r.punch : 0;

  if (r.pose !== "portrait") {
    const strideL = r.pose === "walk" ? -Math.max(0, r.l - 1) : r.pose === "idle" ? -1 : 0;
    const strideR = r.pose === "walk" ? Math.max(0, r.r - 1) : r.pose === "idle" ? 2 : 0;
    const leftX = cx - 6 + strideL;
    const rightX = cx + 1 + strideR;
    g.block(leftX, ly, 6, 8, navy, navyHi, navyLo);
    g.block(rightX, ly + (r.pose === "walk" ? r.bob : 0), 6, 8, navy, navyHi, navyLo);
    g.fold(leftX + 2, ly + 1, 5, navyHi);
    g.block(leftX - 2, ly + 7, 8, 3, "#1a120c", "#3a2a20", PIXEL_INK);
    g.block(rightX, ly + 7 + (r.pose === "walk" ? r.bob : 0), 8, 3, "#1a120c", "#3a2a20", PIXEL_INK);
    g.dot(leftX, ly + 8, "#4a3a30");
    g.dot(rightX + 5, ly + 8, "#4a3a30");
  }

  g.drape(cx - 8, ty, 17, r.pose === "portrait" ? 14 : 16, navy, navyHi, navyLo);
  g.rect(cx - 7, ty + 2, 4, 8, navyHi);
  g.rect(cx + 5, ty + 3, 3, 8, navyLo);
  g.rect(cx - 2, ty, 6, 6, WHITE);
  g.rect(cx - 1, ty + 1, 4, 4, WHITE);
  g.rect(cx, ty + 2, 2, 13, kit.accent);
  g.dot(cx, ty + 3, lit(kit.accent, 0.35));
  g.dot(cx + 1, ty + 7, dim(kit.accent, 0.2));
  g.rect(cx + 5, ty + 5, 3, 2, WHITE);
  g.dot(cx + 5, ty + 5, "#c4161c");
  g.dot(cx + 7, ty + 5, "#1a3d9c");
  g.dot(cx + 6, ty + 6, WHITE);

  g.block(cx - 12, ty + 2 - (r.lift ? 1 : 0), 5, 10, navy, navyHi, navyLo);
  g.block(cx - 12, ty + 11 - (r.lift ? 1 : 0), 5, 4, kit.skin, kit.skinHi, skinLo);
  g.rect(cx - 11, ty + 10, 3, 2, WHITE);
  g.dot(cx - 10, ty + 12, kit.skinHi);

  if (pointUp && !r.hurt) {
    const up = r.cast || r.win ? 4 : r.pose === "idle" && (r.frame === 2 || r.frame === 6) ? 1 : 2;
    g.block(cx + 8, ty - up, 5, 9, navy, navyHi, navyLo);
    g.rect(cx + 8, ty + 6 - up, 4, 2, WHITE);
    g.rect(cx + 10, ty - 6 - up, 3, 7, kit.skin);
    g.rect(cx + 11, ty - 10 - up, 2, 5, kit.skin);
    g.dot(cx + 12, ty - 11 - up, kit.skinHi);
    if (r.cast || r.win) {
      g.dot(cx + 13, ty - 12 - up, kit.vfx);
      g.dot(cx + 14, ty - 10 - up, WHITE);
    }
  } else {
    g.block(cx + 7 + punch, ty + 2 - r.lift, 5, 10, navy, navyHi, navyLo);
    g.block(cx + 7 + punch, ty + 11 - r.lift, 5, 4, kit.skin, kit.skinHi, skinLo);
    g.rect(cx + 8 + punch, ty + 10 - r.lift, 3, 2, WHITE);
    if (jab) {
      g.rect(cx + 12 + punch, ty + 10, 4, 2, kit.skin);
      g.dot(cx + 16 + punch, ty + 10, kit.skinHi);
    }
  }

  g.rect(cx - 2, hy + 10, 5, 4, kit.skin);
  g.rect(cx - 1, hy + 10, 3, 2, kit.skinHi);
  g.block(cx - 6, hy + 1, 13, 12, kit.skin, kit.skinHi, skinLo);
  g.rect(cx - 4, hy + 2, 8, 3, kit.skinHi);
  g.rim(cx - 5, hy + 2, 10, 3, lit(kit.skinHi, 0.18));
  g.rect(cx - 8, hy + 5, 2, 5, kit.skin);
  g.rect(cx + 7, hy + 5, 2, 5, kit.skinHi);
  g.dot(cx - 8, hy + 7, skinLo);
  g.dot(cx + 8, hy + 7, CHEEK);
  g.dot(cx + 5, hy + 8, CHEEK);
  g.rect(cx - 3, hy + 4, 3, 1, dim(h, 0.25));
  g.rect(cx + 1, hy + 4, 3, 1, dim(h, 0.25));
  if (r.blink) {
    g.rect(cx - 3, hy + 6, 3, 1, PIXEL_INK);
    g.rect(cx + 1, hy + 6, 3, 1, PIXEL_INK);
  } else {
    g.rect(cx - 3, hy + 6, 3, 2, WHITE);
    g.rect(cx + 1, hy + 6, 3, 2, WHITE);
    g.dot(cx - 2, hy + 7, "#1a3d9c");
    g.dot(cx + 2, hy + 7, "#1a3d9c");
    g.dot(cx - 3, hy + 6, lit(WHITE, 0.2));
  }
  g.rect(cx, hy + 8, 2, 2, dim(kit.skin, 0.22));
  g.dot(cx + 1, hy + 9, CHEEK);
  g.rect(cx - 1, hy + 11, 4, 1, LIP);
  g.dot(cx + 2, hy + 12, MOUTH);
  if (r.hurt) {
    g.rect(cx - 1, hy + 11, 4, 2, MOUTH);
    g.dot(cx + 6, hy + 3, WHITE);
  }

  const wob = r.pose === "walk" && (r.walk === 1 || r.walk === 5) ? 1 : r.pose === "idle" && r.frame === 4 ? 1 : 0;
  g.rect(cx - 4, hy - 4, 10, 3, hi);
  g.rect(cx - 6, hy - 3, 14, 4, h);
  g.rect(cx - 7, hy - 1, 16, 6, h);
  g.rect(cx - 3, hy - 5, 7, 2, lit(hi, 0.35));
  g.dot(cx - 1, hy - 6, lit(hi, 0.5));
  g.rect(cx - 8, hy + 1 + wob, 4, 8, h);
  g.rect(cx + 6, hy + 1, 5, 8, h);
  g.rect(cx + 8, hy + 3, 3, 5, hi);
  g.rect(cx - 7, hy + 5, 3, 4, hLo);
  g.rect(cx + 5, hy + 6, 3, 3, hLo);
  g.dot(cx - 5, hy - 2, lit(hi, 0.4));
  g.dot(cx + 4, hy - 3, hi);
  g.rect(cx - 5, hy + 1, 10, 2, h);
}

/** Template read of the supplied Legend figure: glasses, stache, white tee, chair. */
function paintLegend(g: Grid, kit: PixelKit, r: Rig): void {
  const lean = r.pose === "attack" ? 2 : r.hurt ? -2 : r.win ? 1 : 0;
  const bob = r.pose === "walk" ? r.bob : r.pose === "idle" && (r.frame === 2 || r.frame === 6) ? -1 : 0;
  const hx = r.cx + lean;
  const hy = r.pose === "portrait" ? 8 : Math.max(2, 3 + bob + (r.cast ? -1 : 0) + (r.hurt ? 1 : 0));
  const skinLo = dim(kit.skin, 0.4);
  const pant = kit.accent;
  const pantHi = "#5a5e64";
  const pantLo = "#1a1e22";
  const chair = "#1c1e22";
  const chairHi = "#3a3e44";
  const chairLo = "#0c0d10";
  const spin = r.pose === "walk" ? r.walk : r.pose === "cast" ? r.frame : 0;

  if (r.pose !== "portrait") {
    g.block(hx - 11, hy + 8, 5, 16, chair, chairHi, chairLo);
    g.rect(hx - 12, hy + 3, 4, 8, chair);
    g.block(hx - 13, hy - 1, 7, 5, chair, chairHi, chairLo);
    g.block(hx - 8, hy + 22, 16, 5, chair, chairHi, chairLo);
    g.rect(hx + 8, hy + 20, 2, 7, chair);
    g.rect(hx + 7, hy + 18, 4, 3, chairHi);
    g.dot(hx + 9, hy + 17, WHITE);
    g.rect(hx + 4, hy + 36, 12, 2, chair);
    paintLegendWheel(g, hx - 8, hy + 34, spin);
    g.block(hx + 6, hy + 38, 4, 4, PIXEL_INK, chairHi, PIXEL_INK);
    g.block(hx + 11, hy + 39, 3, 3, PIXEL_INK, chairHi, PIXEL_INK);
  }

  g.drape(hx - 8, hy + 12, 16, 11, kit.coat, kit.coatHi, kit.coatLo);
  g.block(hx - 12, hy + 13, 5, 7, kit.coat, kit.coatHi, kit.coatLo);
  g.block(hx + 7, hy + 13, 5, 7, kit.coat, kit.coatHi, kit.coatLo);
  if (r.pose !== "portrait") {
    g.drape(hx - 6, hy + 23, 14, 8, pant, pantHi, pantLo);
    g.rect(hx + 6, hy + 24, 12, 10, pant);
    g.rect(hx + 2, hy + 24, 1, 8, pantHi);
    g.block(hx + 14, hy + 32, 7, 4, PIXEL_INK, "#3a2418", PIXEL_INK);
    g.dot(hx + 16, hy + 33, "#4a3a30");
  }

  const handY = hy + (r.cast || r.win ? 10 : r.pose === "attack" ? 16 : 14);
  const jab = r.pose === "attack" && r.frame >= 2 ? r.punch : 0;
  g.block(hx - 9, handY, 5, 4, kit.skin, kit.skinHi, skinLo);
  g.rect(hx - 9, handY + 3, 1, 3, kit.skin);
  g.rect(hx - 7, handY + 3, 1, 3, kit.skinHi);
  g.rect(hx - 5, handY + 3, 1, 3, kit.skin);
  g.block(hx + 2 + jab, handY, 5, 4, kit.skin, kit.skinHi, skinLo);
  g.rect(hx + 2 + jab, handY + 3, 1, 3, kit.skin);
  g.rect(hx + 4 + jab, handY + 3, 1, 3, kit.skinHi);
  g.rect(hx + 6 + jab, handY + 3, 1, r.pose === "attack" ? 5 : 3, kit.skin);
  if (r.cast || r.win) {
    g.dot(hx - 10, handY - 2, kit.vfx);
    g.dot(hx + 8, handY - 3, WHITE);
  }

  g.block(hx - 5, hy, 11, 12, kit.skin, kit.skinHi, skinLo);
  g.rect(hx - 3, hy + 1, 7, 3, kit.skinHi);
  g.rect(hx - 7, hy + 4, 2, 5, kit.skin);
  g.rect(hx + 6, hy + 4, 2, 5, kit.skinHi);
  g.rect(hx - 4, hy + 3, 3, 1, kit.hair);
  g.rect(hx + 1, hy + 3, 3, 1, kit.hair);
  g.rect(hx - 5, hy + 5, 12, 1, PIXEL_INK);
  g.rect(hx - 4, hy + 4, 4, 4, PIXEL_INK);
  g.rect(hx + 1, hy + 4, 4, 4, PIXEL_INK);
  if (r.blink) {
    g.rect(hx - 3, hy + 6, 2, 1, PIXEL_INK);
    g.rect(hx + 2, hy + 6, 2, 1, PIXEL_INK);
  } else {
    g.rect(hx - 3, hy + 5, 2, 2, WHITE);
    g.rect(hx + 2, hy + 5, 2, 2, WHITE);
    g.dot(hx - 2, hy + 6, PIXEL_INK);
    g.dot(hx + 3, hy + 6, PIXEL_INK);
  }
  g.rect(hx, hy + 7, 2, 2, dim(kit.skin, 0.22));
  g.rect(hx - 3, hy + 8, 7, 2, kit.hair);
  g.rect(hx - 2, hy + 9, 5, 1, kit.hairHi);
  g.rect(hx - 2, hy + 10, 5, 3, MOUTH);
  g.dot(hx, hy + 10, WHITE);
  g.rect(hx, hy + 12, 2, 1, LIP);
  if (r.hurt) g.rect(hx - 2, hy + 10, 5, 2, MOUTH);

  g.rect(hx - 2, hy - 2, 6, 3, kit.hair);
  g.rect(hx, hy - 4, 3, 3, kit.hair);
  g.dot(hx + 1, hy - 5, kit.hairHi);
  g.rect(hx - 5, hy + 1, 3, 5, kit.hair);
  g.rect(hx + 3, hy + 1, 3, 4, kit.hair);
  g.rect(hx - 4, hy + 4, 2, 4, kit.hair);
  g.dot(hx - 3, hy, kit.hairHi);
}

function paintLegendWheel(g: Grid, x: number, y: number, spin: number): void {
  g.block(x - 7, y - 7, 15, 15, PIXEL_INK, "#2a2e34", PIXEL_INK);
  g.rect(x - 5, y - 5, 11, 11, "#1a1c20");
  if (spin % 2 === 0) {
    g.rect(x - 6, y, 13, 1, "#5a5e64");
    g.rect(x, y - 6, 1, 13, "#5a5e64");
  } else {
    for (let i = -5; i <= 5; i++) {
      g.dot(x + i, y + i, "#5a5e64");
      g.dot(x + i, y - i, "#5a5e64");
    }
  }
  g.rect(x - 1, y - 1, 3, 3, "#8a8e94");
  g.rect(x - 7, y - 1, 15, 2, PIXEL_INK);
  g.rect(x - 1, y - 7, 2, 15, PIXEL_INK);
}

function paintLegendDeath(g: Grid, kit: PixelKit, frame: number): void {
  const sink = frame === 0 ? 2 : frame === 1 ? 1 : 0;
  const hx = 22;
  const hy = 10 + sink;
  g.block(hx - 11, hy + 10, 6, 14, "#1c1e22", "#3a3e44", "#0c0d10");
  g.block(hx - 8, hy + 20, 16, 5, "#1c1e22", "#3a3e44", "#0c0d10");
  paintLegendWheel(g, hx - 8, hy + 28, 0);
  g.drape(hx - 8, hy + 12, 15, 10, kit.coat, kit.coatHi, kit.coatLo);
  g.rect(hx - 6, hy + 20, 16, 7, kit.accent);
  g.block(hx - 5, hy + 2, 12, 10, kit.skin, kit.skinHi, dim(kit.skin, 0.4));
  g.rect(hx - 3, hy, 8, 3, kit.hair);
  g.rect(hx - 4, hy + 5, 4, 3, PIXEL_INK);
  g.rect(hx + 1, hy + 5, 4, 3, PIXEL_INK);
  g.rect(hx - 2, hy + 9, 6, 2, kit.hair);
  g.rect(hx - 1, hy + 11, 4, 2, MOUTH);
  g.dot(hx + 10, hy + 8, kit.vfx);
}

function paintUnique(g: Grid, kit: PixelKit, r: Rig): void {
  const { cx, hy, ty } = r;
  switch (kit.id) {
    case "maga-grumptor":
      g.rect(cx - 3, hy + 11, 7, 3, CHEEK);
      g.rect(cx + 6, ty + 3, 4, 4, kit.trim);
      g.dot(cx + 7, ty + 4, WHITE);
      g.rect(cx - 2, ty + 1, 3, 16, kit.accent);
      g.rect(cx - 1, ty + 2, 1, 14, kit.trim);
      break;
    case "maga-elonmolk":
      g.rect(cx - 6, hy + 6, 12, 2, PIXEL_INK);
      g.rect(cx - 5, hy + 6, 10, 1, "#7ec8ff");
      g.dot(cx + 4, ty + 4, kit.accent);
      g.dot(cx - 3, ty + 5, WHITE);
      break;
    case "maga-rogentor":
      g.rect(cx - 10, hy + 5, 4, 6, PIXEL_INK);
      g.rect(cx + 6, hy + 5, 4, 6, PIXEL_INK);
      g.dot(cx - 8, hy + 7, kit.trim);
      g.dot(cx + 8, hy + 7, kit.trim);
      g.rect(cx - 8, hy + 10, 16, 2, PIXEL_INK);
      break;
    case "maga-alexgroans":
      g.rect(cx - 8, hy + 4, 4, 4, PIXEL_INK);
      g.rect(cx + 5, hy + 4, 4, 4, PIXEL_INK);
      g.dot(cx + 7, hy + 6, kit.vfx);
      g.rect(cx - 6, ty - 2, 12, 4, PIXEL_INK);
      g.rect(cx - 4, ty - 3, 8, 2, kit.accent);
      break;
    case "maga-brander":
      g.rect(cx - 4, ty + 2, 8, 2, kit.trim);
      g.dot(cx, ty + 3, WHITE);
      g.rect(cx - 3, hy + 11, 6, 2, kit.hair);
      break;
    case "maga-vestyt":
      g.rect(cx - 7, hy + 5, 14, 3, PIXEL_INK);
      g.rect(cx - 6, hy + 5, 12, 1, kit.trim);
      g.rect(cx - 2, ty + 4, 4, 6, kit.trim);
      g.dot(cx, ty + 6, WHITE);
      break;
    case "maga-steers":
      g.rect(cx - 6, hy + 5, 12, 3, PIXEL_INK);
      g.rect(cx - 5, hy + 5, 4, 3, "#7ec8ff");
      g.rect(cx + 1, hy + 5, 4, 3, "#7ec8ff");
      g.dot(cx - 3, hy + 6, WHITE);
      g.dot(cx + 3, hy + 6, WHITE);
      break;
    case "lw-bitenten":
      g.rect(cx - 7, hy + 7, 14, 3, PIXEL_INK);
      g.rect(cx - 6, hy + 7, 12, 1, "#7ec8ff");
      g.rect(cx + 5, ty + 3, 3, 3, "#c4161c");
      g.dot(cx + 6, ty + 3, "#3ec8c1");
      break;
    case "lw-sandbags":
      g.rect(cx - 3, hy + 10, 6, 3, kit.hair);
      g.rect(cx - 2, hy + 11, 4, 2, kit.hairHi);
      break;
    case "lw-youngturkey":
      g.rect(cx - 10, hy + 2, 6, 8, kit.skin);
      g.rect(cx + 4, hy + 2, 6, 8, kit.skin);
      g.dot(cx - 8, hy + 5, PIXEL_INK);
      g.dot(cx + 7, hy + 5, PIXEL_INK);
      g.rect(cx - 9, hy + 8, 4, 1, LIP);
      g.rect(cx + 5, hy + 8, 4, 1, LIP);
      break;
    case "lw-climate":
      g.rect(cx - 8, ty + 2, 16, 3, kit.accent);
      g.dot(cx + 6, ty + 3, WHITE);
      break;
    case "lw-odramma":
      g.rect(cx - 8, hy - 5, 16, 2, kit.accent);
      g.rect(cx - 6, hy - 6, 12, 1, kit.trim);
      if (r.cast || r.win) g.dot(cx, hy - 8, WHITE);
      break;
    case "lw-harass":
      g.dot(cx - 4, hy + 11, kit.trim);
      g.dot(cx + 4, hy + 11, kit.trim);
      g.rect(cx - 5, ty + 6, 10, 2, kit.trim);
      break;
    case "lw-hocking":
      g.rect(cx - 4, hy + 6, 8, 2, PIXEL_INK);
      g.rect(cx - 3, hy + 6, 6, 1, "#7ec8ff");
      break;
    case "lw-vakxie":
      g.rect(cx - 6, hy + 6, 12, 2, PIXEL_INK);
      g.dot(cx + 5, ty + 4, kit.vfx);
      break;
    case "wild-cartoons":
      g.rect(cx - 6, ty + 2, 12, 2, "#f0c14a");
      g.rect(cx - 5, ty + 4, 2, 8, PIXEL_INK);
      g.rect(cx + 3, ty + 4, 2, 8, PIXEL_INK);
      break;
    case "wild-cezanne":
      g.rect(cx + 8, ty, 6, 5, "#3d6ea6");
      g.rect(cx + 9, ty + 1, 3, 3, "#c4161c");
      break;
    case "wild-icon":
      g.rect(cx - 3, ty + 5, 6, 6, kit.trim);
      g.dot(cx, ty + 7, WHITE);
      break;
    case "wild-enigma":
      g.block(cx - 6, hy + 4, 12, 6, "#121018", "#2a2430", PIXEL_INK);
      g.rect(cx - 4, hy + 6, 3, 2, kit.vfx);
      g.rect(cx + 1, hy + 6, 3, 2, kit.vfx);
      break;
    case "wild-legend":
      g.rect(cx - 6, hy + 2, 12, 3, "#c4161c");
      g.dot(cx, hy + 2, WHITE);
      break;
    case "wild-karen":
      g.rect(cx - 8, hy + 6, 16, 3, PIXEL_INK);
      g.rect(cx - 7, hy + 6, 14, 1, "#3a2418");
      break;
    case "wild-butter":
      g.rect(cx - 8, hy + 6, 16, 4, kit.accent);
      g.rect(cx - 7, hy + 6, 14, 1, WHITE);
      break;
    case "mma-macgregor":
      g.rect(cx - 4, hy + 2, 8, 2, "#c9a24a");
      break;
    case "mma-nurmagoat":
      g.rect(cx - 5, ty + 8, 10, 3, kit.accent);
      break;
    case "mma-jonesy":
      g.rect(cx - 6, ty + 3, 12, 3, kit.trim);
      break;
    case "mma-poirierish":
      g.rect(cx - 6, ty + 8, 12, 3, WHITE);
      g.dot(cx, ty + 9, kit.accent);
      break;
    case "mma-diazish":
      g.rect(cx + 6, ty + 2, 5, 8, kit.accent);
      g.rect(cx + 7, ty + 3, 3, 6, WHITE);
      break;
    default:
      break;
  }
}

function paintHairOnTop(g: Grid, kit: PixelKit, r: Rig): void {
  const { cx } = r;
  const y = r.hy;
  const h = kit.hair;
  const hi = kit.hairHi;
  const lo = dim(h);
  const wob = r.pose === "walk" && (r.walk === 1 || r.walk === 5) ? 1 : r.pose === "idle" && r.frame === 4 ? 1 : 0;
  switch (kit.id) {
    case "maga-grumptor":
      g.block(cx - 6, y + 2, 14, 5, h, hi, lo);
      g.rect(cx - 3, y, 16, 4, hi);
      g.rect(cx + 6, y + 1, 11, 8, h);
      g.rect(cx + 11, y + 4, 6, 6, hi);
      g.dot(cx + 16, y + 8, h);
      g.rect(cx - 7, y + 4, 4, 6, h);
      g.dot(cx + 13, y, lit(hi, 0.45));
      break;
    case "maga-boris":
      g.block(cx - 7, y - 2, 16, 6, h, hi, lo);
      g.dot(cx - 8, y + wob, h);
      g.rect(cx + 3, y - 5, 10, 6, hi);
      g.rect(cx + 7, y + 1, 7, 8, h);
      g.dot(cx - 5 + wob, y - 4, hi);
      g.dot(cx + 13, y + 4, h);
      break;
    case "lw-bitenten":
    case "lw-sandbags":
      g.block(cx - 7, y + 1, 14, 5, h, hi, lo);
      g.rect(cx - 4, y - 1, 11, 4, hi);
      g.rect(cx - 8, y + 4, 4, 6, h);
      g.rect(cx + 6, y + 4, 4, 5, h);
      break;
    case "wild-legend":
      g.block(cx - 7, y, 14, 4, kit.accent, "#e05050", "#6a1010");
      g.rect(cx - 4, y - 2, 8, 2, kit.accent);
      g.rect(cx - 6, y + 3, 12, 3, h);
      break;
    case "wild-icon":
      g.rect(cx - 10, y, 20, 3, kit.coatLo);
      g.rect(cx - 8, y - 2, 16, 3, kit.coat);
      g.rect(cx - 6, y, 12, 2, kit.coatHi);
      g.rect(cx - 10, y + 3, 4, 9, kit.coatLo);
      g.rect(cx + 6, y + 3, 4, 9, kit.coatLo);
      break;
    case "wild-dynasty":
      g.block(cx - 8, y - 3, 18, 7, kit.coat, kit.coatHi, kit.coatLo);
      g.rect(cx - 6, y - 5, 12, 3, kit.coatHi);
      g.rect(cx - 10, y + 3, 4, 7, kit.coat);
      g.rect(cx + 7, y + 3, 4, 7, kit.coat);
      g.dot(cx - 7, y + 8, kit.accent);
      g.dot(cx + 8, y + 8, kit.accent);
      break;
    case "wild-karen":
      g.block(cx - 8, y + 1, 16, 6, h, hi, lo);
      g.rect(cx - 6, y - 1, 12, 3, hi);
      g.rect(cx - 10, y + 4, 4, 8, h);
      g.rect(cx + 6, y + 4, 5, 8, h);
      g.rect(cx - 7, y - 3, 14, 3, PIXEL_INK);
      g.rect(cx - 5, y - 5, 4, 3, "#3a2418");
      g.rect(cx + 2, y - 5, 4, 3, "#3a2418");
      break;
    case "mma-nurmagoat":
      g.block(cx - 7, y - 2, 14, 6, "#3a2418", "#5c3a28", "#1a120c");
      g.rect(cx - 4, y - 3, 8, 2, "#5c3a28");
      g.rect(cx - 6, y + 3, 12, 3, h);
      break;
    case "mma-adesanyaish":
      g.block(cx - 4, y, 8, 6, h, hi, lo);
      g.rect(cx - 1, y - 4, 4, 4, hi);
      g.dot(cx, y - 6, hi);
      break;
    default:
      paintHairStyle(g, kit, cx, y, wob);
  }
}

function paintHairStyle(g: Grid, kit: PixelKit, cx: number, y: number, wob: number): void {
  const h = kit.hair;
  const hi = kit.hairHi;
  const lo = dim(h);
  switch (kit.hairStyle) {
    case "slick":
    case "slickblond":
      g.block(cx - 6, y + 2, 13, 5, h, hi, lo);
      g.rect(cx - 3, y + 1, 8, 2, hi);
      g.rect(cx + 6, y + 4, 4, 4, h);
      break;
    case "mess":
      g.block(cx - 7, y, 16, 6, h, hi, lo);
      g.rect(cx + 4, y - 3, 8, 4, hi);
      g.rect(cx + 7, y + 2, 7, 7, h);
      g.dot(cx - 8, y + 1 + wob, h);
      break;
    case "locks":
      g.block(cx - 6, y + 1, 12, 5, h, hi, lo);
      g.rect(cx - 10, y + 4, 4, 16, h);
      g.rect(cx + 6, y + 4, 4, 17, h);
      g.rect(cx - 8, y + 8, 2, 7, hi);
      g.rect(cx + 8, y + 9, 2, 6, hi);
      break;
    case "fade":
    case "buzz":
    case "close":
      g.block(cx - 6, y + 2, 12, 3, h, hi, lo);
      g.rect(cx - 4, y + 1, 8, 2, hi);
      g.rect(cx - 6, y + 4, 2, 4, h);
      g.rect(cx + 4, y + 4, 2, 4, h);
      break;
    case "white":
      g.block(cx - 7, y + 1, 14, 5, h, hi, lo);
      g.rect(cx - 4, y, 10, 3, hi);
      g.rect(cx - 8, y + 4, 4, 6, h);
      break;
    case "bob":
    case "blondbob":
      g.block(cx - 8, y + 1, 16, 6, h, hi, lo);
      g.rect(cx - 6, y - 1, 12, 2, hi);
      g.rect(cx - 10, y + 4, 4, 8, h);
      g.rect(cx + 6, y + 4, 5, 8, h);
      break;
    case "thin":
      g.rect(cx - 4, y + 4, 8, 2, h);
      g.rect(cx - 3, y + 3, 6, 1, hi);
      g.dot(cx, y + 2, hi);
      break;
    case "beret":
      g.block(cx - 8, y, 16, 4, PIXEL_INK, "#3a2418", PIXEL_INK);
      g.rect(cx - 6, y - 2, 12, 2, PIXEL_INK);
      g.dot(cx - 8, y - 2, kit.accent);
      g.rect(cx - 4, y + 3, 8, 2, h);
      break;
    case "visor":
      g.block(cx - 6, y + 2, 12, 3, h, hi, lo);
      g.rect(cx - 8, y + 6, 16, 4, kit.accent);
      g.rect(cx - 7, y + 6, 14, 2, WHITE);
      break;
    case "hood":
      g.block(cx - 10, y, 20, 8, kit.coatLo, kit.coat, kit.coatLo);
      g.rect(cx - 7, y + 1, 14, 4, kit.coat);
      break;
    case "crest":
      g.block(cx - 4, y, 8, 6, h, hi, lo);
      g.rect(cx - 1, y - 4, 4, 4, hi);
      break;
    case "longish":
      g.block(cx - 6, y + 1, 12, 5, h, hi, lo);
      g.rect(cx - 8, y + 4, 4, 11, h);
      g.rect(cx + 6, y + 4, 4, 12, h);
      break;
    case "glam":
      g.block(cx - 8, y - 2, 18, 7, kit.coat, kit.coatHi, kit.coatLo);
      g.rect(cx - 10, y + 4, 4, 7, kit.coat);
      g.rect(cx + 7, y + 4, 4, 7, kit.coat);
      break;
    case "beard":
      g.block(cx - 6, y + 2, 12, 4, h, hi, lo);
      g.rect(cx - 4, y + 10, 8, 4, h);
      g.rect(cx - 3, y + 11, 6, 2, hi);
      break;
    case "goat":
      g.block(cx - 5, y + 2, 10, 3, h, hi, lo);
      g.rect(cx - 1, y + 10, 3, 3, h);
      break;
    default:
      g.block(cx - 6, y + 1, 12, 5, h, hi, lo);
      g.rect(cx - 4, y, 8, 2, hi);
      g.rect(cx - 7, y + 3, 3, 5, h);
      g.rect(cx + 4, y + 3, 3, 5, h);
  }
}

function paintHitPixels(g: Grid, kit: PixelKit, x: number, y: number): void {
  g.dot(x, y, WHITE);
  g.dot(x + 2, y - 2, kit.vfx);
  g.dot(x + 4, y, kit.trim);
  g.dot(x + 3, y + 3, kit.accent);
  g.dot(x - 1, y + 2, WHITE);
}

function paintCastPixels(g: Grid, kit: PixelKit, cx: number, hy: number, frame: number): void {
  const lift = frame > 3 ? 2 : 0;
  g.dot(cx + 10, hy - 2 - lift, kit.vfx);
  g.dot(cx + 12, hy - 4 - lift, WHITE);
  g.dot(cx + 8, hy - 5 - lift, kit.trim);
  g.dot(cx - 8, hy - 3, kit.accent);
}

export function poseFrameC28(pose: PixelPose, time: number, swing: number): number {
  if (pose === "walk") return Math.floor(time * 12) % 8;
  if (pose === "idle") return Math.floor(time * 5) % 8;
  if (pose === "attack") {
    if (swing > 0.84) return 5;
    if (swing > 0.68) return 4;
    if (swing > 0.5) return 3;
    if (swing > 0.32) return 2;
    if (swing > 0.16) return 1;
    return 0;
  }
  if (pose === "cast") {
    if (swing > 0.86) return 7;
    if (swing > 0.72) return 6;
    if (swing > 0.58) return 5;
    if (swing > 0.44) return 4;
    if (swing > 0.3) return 3;
    if (swing > 0.18) return 2;
    if (swing > 0.08) return 1;
    return 0;
  }
  if (pose === "hurt") return Math.floor(time * 12) % 4;
  if (pose === "death") return Math.min(3, Math.floor(time * 5));
  if (pose === "victory") return Math.floor(time * 5) % 6;
  return 0;
}
