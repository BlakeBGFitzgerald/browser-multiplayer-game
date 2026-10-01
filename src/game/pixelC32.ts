import { skinById, type SkinLook } from "../dlc";
import { kitHoldsSwungBook } from "./bookSwing";
import { type Gait, type PixelKit } from "./pixelRoster";
import { paintPixelSkin } from "./pixelSkin";
import { skinMotion } from "./skinMotion";

/** C32 256-bit art bible: 64×64 native, multi-step shade, rim, material dither. Heroes only. */
export const PIXEL_SIZE = 64;
export const PIXEL_INK = "#1a1008";
const WHITE = "#fff6e4";
const CHEEK = "#c08060";
const LIP = "#c07070";
const MOUTH = "#6a2020";

export type PixelPose = "idle" | "walk" | "attack" | "cast" | "ult" | "hurt" | "death" | "victory" | "portrait";

export const GAMEPLAY_POSES: PixelPose[] = ["idle", "walk", "attack", "cast", "ult", "hurt", "death"];

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
    if (h > 6) this.rect(x + 3, y + 5, 1, h - 8, hi);
    if (w > 8) this.rect(x + w - 4, y + 6, 1, Math.max(1, h - 9), lo);
    if (h > 10) this.rect(x + 5, y + 8, 1, 4, dim(mid, 0.18));
    if (w > 10) this.dither(x + 2, y + 3, 2, h - 6, hi);
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
  const glow = lit(kit.coatHi, 0.38);
  const skinGlow = lit(kit.skinHi, 0.3);
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

export type Face = "pout" | "grin" | "shout" | "calm" | "squint" | "open" | "grim" | "smirk";

export function faceOf(id: string): Face {
  const map: Record<string, Face> = {
    "maga-grumptor": "pout",
    "maga-elonmolk": "calm",
    "maga-rogentor": "grin",
    "maga-alexgroans": "shout",
    "maga-boris": "smirk",
    "maga-brander": "open",
    "maga-vestyt": "grim",
    "maga-steers": "squint",
    "maga-hooli": "smirk",
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
    "wild-slush": "grin",
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
  lyL: number;
  lyR: number;
  arm: number;
  gait: Gait;
  strike: "punch" | "swing" | "shoot" | "shout";
  /** Horizontal idle weight. Skins set this; the base kit stays at 0. */
  stance: number;
  /** Extra body lean in radians. Base kit stays at 0. */
  lean: number;
  /** MMA basic-attack hand. Null keeps the authored attack. */
  fist?: "left" | "right" | "hook" | null;
  /** Infantry weapon pose. Null keeps the authored attack. */
  weaponPose?: string | null;
};

/** Limb cue for one basic attack. Attack replaces the running-arm pose. */
export type AttackLimb = {
  fist: "left" | "right" | "hook" | null;
  weapon: string | null;
};

export function strikeOf(kit: PixelKit): "punch" | "swing" | "shoot" | "shout" {
  if (kitHoldsSwungBook(kit)) return "swing";
  if (kit.prop === "mic" || kit.prop === "megaphone") return "shout";
  if (
    kit.prop === "rocket" ||
    kit.prop === "flask" ||
    kit.prop === "globe" ||
    kit.prop === "staff" ||
    kit.prop === "brush" ||
    kit.prop === "camera" ||
    kit.prop === "file" ||
    kit.prop === "book" ||
    kit.prop === "stud"
  ) {
    return "shoot";
  }
  if (kit.gait === "fight" || kit.body === "shorts" || kit.prop === "glove" || kit.prop === "tape") return "punch";
  return "swing";
}

/** 8-phase walk: contact → down → pass → up → opposite contact → down → pass → return. */
function gaitOffsets(
  gait: Gait,
  walk: number,
  pose: PixelPose,
): { l: number; r: number; bob: number; lyL: number; lyR: number; arm: number } {
  if (pose !== "walk") return { l: 0, r: 0, bob: 0, lyL: 0, lyR: 0, arm: 0 };
  const phase = ((walk % 8) + 8) % 8;
  const table = [
    { l: 7, r: -2, bob: 0, lyL: 0, lyR: -3, arm: -3 },
    { l: 5, r: 0, bob: 1, lyL: 2, lyR: -4, arm: -2 },
    { l: 2, r: 2, bob: 0, lyL: 0, lyR: 0, arm: 0 },
    { l: 0, r: 5, bob: -1, lyL: -4, lyR: 1, arm: 2 },
    { l: -2, r: 7, bob: 0, lyL: -3, lyR: 0, arm: 3 },
    { l: 0, r: 5, bob: 1, lyL: -4, lyR: 2, arm: 2 },
    { l: 2, r: 2, bob: 0, lyL: 0, lyR: 0, arm: 0 },
    { l: 5, r: 0, bob: -1, lyL: 1, lyR: -4, arm: -2 },
  ];
  const base = table[phase]!;
  let { l, r, bob, lyL, lyR, arm } = base;
  if (gait === "stomp" || gait === "waddle") {
    l += 1;
    r += 1;
    lyL += phase === 1 || phase === 5 ? 1 : 0;
  } else if (gait === "roll") {
    l = 0;
    r = 0;
    lyL = 0;
    lyR = 0;
    bob = phase % 2;
    arm = Math.round(arm * 0.45);
  } else if (gait === "glide") {
    l = Math.round(l * 0.78);
    r = Math.round(r * 0.78);
    lyL = Math.round(lyL * 0.65);
    lyR = Math.round(lyR * 0.65);
    bob = phase % 2;
    arm = Math.round(arm * 0.7);
  } else if (gait === "shuffle") {
    l = Math.round(Math.max(-4, Math.min(4, l * 0.62)));
    r = Math.round(Math.max(-4, Math.min(4, r * 0.62)));
    bob = 0;
  } else if (gait === "swagger" || gait === "saunter") {
    bob += phase % 2 ? 1 : 0;
    arm += phase % 2 ? 1 : 0;
  } else if (gait === "bounce" || gait === "fight" || gait === "duo") {
    bob += phase === 1 || phase === 5 ? 2 : phase === 3 || phase === 7 ? -1 : 0;
  } else if (gait === "talk") {
    l = Math.max(-1, l - 1);
    r = Math.max(-1, r - 1);
    arm += 1;
  } else if (gait === "march") {
    lyL += phase % 4 === 1 ? 1 : 0;
    lyR += phase % 4 === 3 ? 1 : 0;
  }
  return { l, r, bob, lyL, lyR, arm };
}

export function computeRig(kit: PixelKit, pose: PixelPose, frame: number, skinId?: string, limb?: AttackLimb | null): Rig {
  const walk = pose === "walk" ? frame % 8 : 0;
  const strike = strikeOf(kit);
  const ult = pose === "ult";
  const cast = pose === "cast" || ult;
  let punch = 0;
  if (pose === "attack") {
    if (strike === "punch") punch = frame <= 5 ? 2 + frame : Math.max(0, 10 - frame);
    else if (strike === "shoot") punch = frame <= 5 ? 1 : frame <= 7 ? 4 : 1;
    else if (strike === "shout") punch = frame <= 6 ? 2 : 1;
    else punch = frame <= 5 ? 3 + Math.min(3, frame) : Math.max(1, 9 - frame);
  } else if (cast) {
    punch = ult ? 4 + (frame < 6 ? 2 : 0) : 2 + (frame < 6 ? 2 : 0);
  }
  const dead = pose === "death";
  const hurt = pose === "hurt";
  const win = pose === "victory";
  const blink = pose === "idle" && (frame === 4 || frame === 9);
  const gait = gaitOffsets(kit.gait, walk, pose);
  let { l, r, bob, lyL, lyR, arm } = gait;
  const motion = skinMotion(skinId);
  let stance = 0;
  let lean = 0;
  if (motion) {
    lean = motion.lean;
    if (pose === "walk") {
      l = Math.round(l * motion.stride);
      r = Math.round(r * motion.stride);
      lyL = Math.round(lyL * motion.stride);
      lyR = Math.round(lyR * motion.stride);
      arm = Math.round(arm * motion.arm);
      bob = Math.round(bob * motion.bob);
      if (motion.bob >= 1.7 && walk % 4 === 1) bob += 1;
    } else if (pose === "idle") {
      const phase = frame % 10;
      bob += phase === 2 || phase === 7 ? -motion.idleBob : phase === 0 || phase === 5 ? motion.idleBob : 0;
      stance = phase < 5 ? motion.idleShift : -motion.idleShift;
    } else if (pose === "attack") {
      const reached = Math.round(punch * motion.reach);
      if (frame <= 5) punch = Math.max(0, reached - motion.windup);
      else if (frame <= 8) punch = reached;
      else punch = Math.max(-2, reached - motion.follow);
    }
  }
  let fistShift = 0;
  if (pose === "attack") arm = 0;
  if (pose === "attack" && limb?.fist) {
    const t = frame <= 5 ? 0.45 : frame <= 7 ? 1 : Math.max(0, (11 - frame) / 5);
    punch = (limb.fist === "hook" ? 4 : 3) * t;
    fistShift = limb.fist === "left" ? -1 : limb.fist === "hook" ? 2 : 1;
  } else if (pose === "attack" && limb?.weapon) {
    const t = frame <= 5 ? 0.4 : frame <= 7 ? 1 : Math.max(0, (11 - frame) / 5);
    const gun = limb.weapon === "rifle" || limb.weapon === "pistol" || limb.weapon === "shotgun";
    if (gun) {
      const kick = limb.weapon === "shotgun" ? 1.35 : limb.weapon === "pistol" ? 0.85 : 1;
      punch = (frame >= 6 && frame <= 8 ? 1 : 3) * kick;
    } else if (limb.weapon === "spear") punch = 4 * t;
    else if (limb.weapon === "book") {
      const hit = frame <= 6 ? 1 : Math.max(0, (11 - frame) / 5);
      punch = 2 * hit;
    } else punch = 3.2 * t;
  }
  const breath = pose === "idle" ? (frame === 3 || frame === 8 ? -1 : 0) : 0;
  const hx = hurt ? -4 - (frame > 2 ? 2 : 0) : pose === "attack" && frame <= 6 ? 2 : 0;
  const hy =
    dead
      ? 34
      : 10 +
        breath +
        (hurt ? 2 : 0) +
        (cast ? (ult ? -6 : -4) : 0) +
        (win ? -3 : 0) +
        (pose === "attack" && frame <= 6 ? -1 : 0) +
        bob;
  const ty = dead ? 40 : 27 + breath + (win ? -1 : 0) + (cast && ult ? -2 : 0) + bob;
  let lift =
    win || cast || (pose === "attack" && frame <= 7)
      ? win
        ? 10
        : ult
          ? 12
          : cast
            ? 9
            : strike === "shoot"
              ? 3
              : 5
      : 0;
  if (motion && cast) lift += motion.castLift;
  return {
    pose,
    frame,
    cx: 32 + hx + fistShift,
    hy,
    ty,
    ly: 48 + (pose === "idle" && frame === 3 ? -1 : 0) + bob,
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
    lyL,
    lyR,
    arm,
    gait: kit.gait,
    strike,
    stance,
    lean,
    fist: limb?.fist ?? null,
    weaponPose: limb?.weapon ?? null,
  };
}

type WornSkin = { look: SkinLook; tint: string };

function wornOf(skinId?: string): WornSkin | undefined {
  if (!skinId) return undefined;
  const s = skinById(skinId);
  if (!s) return undefined;
  return { look: s.look, tint: s.tint };
}

export function stampC32(g: Grid, kit: PixelKit, pose: PixelPose, frame: number, skinId?: string): void {
  const skin = wornOf(skinId);
  if (pose === "portrait") {
    stampPortrait(g, kit);
    if (skin) paintPixelSkin(g, skin.look, skin.tint, { cx: 32, hy: 12, ty: 34, pose: "portrait", frame: 0 });
    outline(g);
    rimLight(g, kit);
    return;
  }
  const r = computeRig(kit, pose, frame, skinId);
  if (r.dead) {
    if (kit.id === "wild-legend") paintLegendDeath(g, kit, frame);
    else if (kit.id === "maga-hooli") paintHooliDeath(g, kit, frame);
    else paintDeath(g, kit, frame);
    if (skin) paintPixelSkin(g, skin.look, skin.tint, { cx: 32, hy: 40, ty: 46, pose: "death", frame });
    outline(g);
    rimLight(g, kit);
    return;
  }
  paintHero(g, kit, r);
  if (pose === "attack" && frame <= 6) paintHitPixels(g, kit, r.cx + 18 + r.punch, r.ty);
  if (r.cast) paintCastPixels(g, kit, r.cx, r.hy, frame, pose === "ult");
  if (r.hurt) {
    g.dot(r.cx - 10, r.hy + 4, kit.vfx);
    g.dot(r.cx + 13, r.hy + 3, WHITE);
    g.dot(r.cx + 9, r.hy - 1, kit.trim);
  }
  if (r.win) {
    g.dot(r.cx - 13, r.hy - 5, kit.trim);
    g.dot(r.cx + 13, r.hy - 6, kit.vfx);
    g.dot(r.cx, r.hy - 8, WHITE);
  }
  if (skin) paintPixelSkin(g, skin.look, skin.tint, { cx: r.cx, hy: r.hy, ty: r.ty, pose, frame });
  outline(g);
  rimLight(g, kit);
}

function stampPortrait(g: Grid, kit: PixelKit): void {
  g.rect(0, 0, 64, 64, dim(kit.coatLo, 0.12));
  g.rect(2, 2, 60, 60, "#0c0a08");
  g.rect(4, 4, 56, 14, kit.coat);
  g.rect(4, 4, 56, 4, kit.coatHi);
  g.dither(4, 10, 56, 6, kit.coatLo);
  g.rect(4, 40, 56, 20, kit.coatLo);
  g.rect(4, 42, 56, 4, kit.coat);
  const dummy: Rig = {
    pose: "portrait",
    frame: 0,
    cx: 32,
    hy: 12,
    ty: 34,
    ly: 80,
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
  paintHero(g, kit, dummy);
  g.rect(4, 58, 56, 3, kit.accent);
  g.rect(4, 4, 56, 3, kit.trim);
}

function paintDeath(g: Grid, kit: PixelKit, frame: number): void {
  const sink = frame <= 1 ? 6 - frame * 2 : frame <= 3 ? 1 : 0;
  const wide = kit.wide ? 4 : 0;
  const slide = frame >= 4 ? Math.min(4, frame - 3) : 0;
  g.block(10 + slide, 46 + sink, 42 + wide, 10, kit.coat, kit.coatHi, kit.coatLo);
  g.rect(14 + slide, 42 + sink, 34, 6, kit.coat);
  g.rect(18 + slide, 38 + sink, 18, 8, kit.skin);
  g.rect(20 + slide, 36 + sink, 14, 4, kit.skinHi);
  g.rect(16 + slide, 34 + sink, 24, 4, kit.hair);
  g.rect(18 + slide, 32 + sink, 12, 3, kit.hairHi);
  g.rect(34 + slide, 48 + sink, 9, 4, kit.accent);
  g.dot(24 + slide, 42 + sink, PIXEL_INK);
  g.dot(32 + slide, 42 + sink, PIXEL_INK);
  g.rect(26 + slide, 45 + sink, 6, 2, MOUTH);
  g.rect(12 + slide, 56, 10, 4, PIXEL_INK);
  g.rect(40 + slide, 56, 10, 4, PIXEL_INK);
  g.dot(42 + slide, 40 + sink, kit.vfx);
  g.dot(46 + slide, 44 + sink, kit.trim);
  if (frame >= 2) {
    g.dot(8, 58, dim(kit.coat, 0.2));
    g.dot(52, 57, kit.trim);
  }
  if (frame >= 5) g.dither(16, 54, 28, 4, dim(kit.coatLo, 0.15));
}

function paintHead(g: Grid, kit: PixelKit, cx: number, y: number, blink: boolean, fat = 0): void {
  const lo = dim(kit.skin, 0.42);
  g.rect(cx - 4, y + 13, 8, 5, kit.skin);
  g.rect(cx - 3, y + 13, 6, 3, kit.skinHi);
  g.block(cx - 8 - fat, y, 16 + fat * 2, 16, kit.skin, kit.skinHi, lo);
  g.rect(cx - 5, y + 1, 10, 3, kit.skinHi);
  g.rim(cx - 7 - fat, y + 1, 14 + fat * 2, 4, lit(kit.skinHi, 0.22));
  g.rect(cx + 5 + fat, y + 4, 3, 8, CHEEK);
  g.dot(cx - 5 - fat, y + 9, CHEEK);
  g.dot(cx + 4 + fat, y + 9, CHEEK);
  g.rect(cx - 9 - fat, y + 5, 3, 7, kit.skin);
  g.rect(cx + 6 + fat, y + 5, 3, 7, kit.skin);
  g.dot(cx - 9 - fat, y + 8, lo);
  g.dot(cx + 8 + fat, y + 8, CHEEK);
  g.dot(cx - 1, y + 8, dim(kit.skin, 0.22));
  paintFace(g, kit, cx, y, blink);
}

function paintFace(g: Grid, kit: PixelKit, cx: number, y: number, blink: boolean): void {
  const face = faceOf(kit.id);
  g.rect(cx - 4, y + 4, 3, 1, dim(kit.hair, 0.15));
  g.rect(cx + 2, y + 4, 3, 1, dim(kit.hair, 0.15));
  if (blink) {
    g.rect(cx - 4, y + 7, 4, 1, PIXEL_INK);
    g.rect(cx + 1, y + 7, 4, 1, PIXEL_INK);
  } else {
    g.rect(cx - 4, y + 6, 4, 3, WHITE);
    g.rect(cx + 1, y + 6, 4, 3, WHITE);
    g.dot(cx - 2, y + 8, PIXEL_INK);
    g.dot(cx + 3, y + 8, PIXEL_INK);
    g.dot(cx - 4, y + 6, lit(WHITE, 0.25));
    g.dot(cx + 1, y + 6, lit(WHITE, 0.25));
  }
  g.rect(cx, y + 9, 2, 2, dim(kit.skin, 0.28));
  if (face === "pout") {
    g.rect(cx - 3, y + 12, 7, 2, LIP);
    g.rect(cx - 1, y + 13, 4, 1, MOUTH);
  } else if (face === "grin") {
    g.rect(cx - 4, y + 12, 9, 2, WHITE);
    g.rect(cx - 3, y + 13, 7, 1, MOUTH);
  } else if (face === "shout") {
    g.rect(cx - 3, y + 11, 7, 4, MOUTH);
    g.dot(cx, y + 12, WHITE);
  } else if (face === "smirk") {
    g.rect(cx - 1, y + 12, 5, 1, LIP);
    g.dot(cx + 3, y + 13, MOUTH);
  } else if (face === "grim") {
    g.rect(cx - 3, y + 12, 6, 1, MOUTH);
  } else if (face === "open") {
    g.rect(cx - 3, y + 12, 6, 3, LIP);
    g.rect(cx - 1, y + 13, 3, 2, MOUTH);
  } else if (face === "squint") {
    g.rect(cx - 4, y + 7, 4, 1, PIXEL_INK);
    g.rect(cx + 1, y + 7, 4, 1, PIXEL_INK);
    g.rect(cx - 1, y + 12, 4, 1, LIP);
  } else {
    g.rect(cx - 2, y + 12, 5, 1, LIP);
  }
}

function paintLegs(g: Grid, kit: PixelKit, r: Rig, longCoat = false): void {
  const { cx, ly, l, r: rr } = r;
  const shoe = "#3a2418";
  const shoeHi = "#5c3a28";
  const pant = longCoat ? kit.coatLo : dim(kit.coat, 0.2);
  const walking = r.pose === "walk";
  const leftX = cx - 7 + (walking ? -Math.max(0, l - 1) : 0);
  const rightX = cx + 1 + (walking ? Math.max(0, rr - 1) : 0);
  const leftY = ly + (walking ? r.lyL : 0);
  const rightY = ly + (walking ? r.lyR : 0);
  g.block(leftX, leftY, 7, 11 - Math.max(0, r.lyL), pant, kit.coat, kit.coatLo);
  g.block(rightX, rightY, 7, 11 - Math.max(0, r.lyR), pant, kit.coat, kit.coatLo);
  g.fold(leftX + 2, leftY + 1, 7, kit.coatHi);
  g.block(leftX - 1, leftY + 9, 8, 4, shoe, shoeHi, PIXEL_INK);
  g.block(rightX, rightY + 9, 8, 4, shoe, shoeHi, PIXEL_INK);
  g.dot(leftX + 2, leftY + 10, lit(shoeHi, 0.2));
  g.dot(rightX + 3, rightY + 10, lit(shoeHi, 0.2));
}

function suitArms(g: Grid, kit: PixelKit, r: Rig, x: number, w: number, ty: number): void {
  const lift = r.lift;
  const punch = r.punch;
  const swing = r.pose === "walk" ? r.arm : 0;
  const back = r.pose === "walk" ? -r.arm : r.pose === "attack" && r.strike === "swing" ? -2 : 0;
  g.block(x - 4 + Math.min(0, back), ty + 2 - lift + Math.max(0, -swing), 5, 11, kit.coat, kit.coatHi, kit.coatLo);
  g.block(x + w - 1 + punch + Math.max(0, swing), ty + 2 - lift, 5, 11, kit.coat, kit.coatHi, kit.coatLo);
  g.block(x - 5 + Math.min(0, back), ty + 11 - lift + Math.max(0, -swing), 5, 5, kit.skin, kit.skinHi, dim(kit.skin, 0.4));
  g.block(x + w + punch + Math.max(0, swing), ty + 11 - lift, 5, 5, kit.skin, kit.skinHi, dim(kit.skin, 0.4));
  g.rect(x - 4, ty + 10 - lift, 3, 2, WHITE);
  g.rect(x + w + punch, ty + 10 - lift, 3, 2, WHITE);
}

function paintTorso(g: Grid, kit: PixelKit, r: Rig): { x: number; w: number } {
  const { cx, ty } = r;
  const wide = kit.wide ? 3 : 0;
  let w = 21 + wide;
  let x = cx - Math.floor(w / 2);
  if (kit.body === "tech") {
    w = 18;
    x = cx - 9;
    g.drape(x, ty, w, 20, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 6, ty + 4, 13, 5, kit.accent);
    g.dot(cx + 3, ty + 5, kit.trim);
    g.dot(cx - 3, ty + 5, WHITE);
    g.rect(cx - 5, ty + 12, 10, 1, PIXEL_INK);
  } else if (kit.body === "hoodie" || kit.body === "street") {
    w = 21;
    x = cx - 10;
    g.drape(x, ty, w, 20, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 5, ty, 10, 5, kit.coatLo);
    g.rect(cx - 4, ty + 1, 8, 3, kit.coat);
  } else if (kit.body === "parka" || kit.body === "earth") {
    w = 26;
    x = cx - 13;
    g.drape(x, ty, w, 21, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(x + 2, ty + 3, w - 4, 5, "#efe6d6");
  } else if (kit.body === "shorts") {
    w = 18;
    x = cx - 9;
    g.drape(x, ty, w, 13, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 6, ty + 11, 13, 6, kit.accent);
  } else if (kit.body === "labcoat") {
    w = 24;
    x = cx - 12;
    g.drape(x, ty, w, 21, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 4, ty, 8, 5, WHITE);
    g.rect(cx + 5, ty + 5, 5, 6, kit.accent);
  } else if (kit.body === "pink" || kit.body === "gold" || kit.body === "gown") {
    w = 21;
    x = cx - 10;
    g.drape(x, ty, w, 21, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 4, ty + 5, 8, 3, kit.trim);
  } else if (kit.body === "chair") {
    w = 21;
    x = cx - 10;
    g.drape(x, ty, w, 16, kit.coat, kit.coatHi, kit.coatLo);
    g.block(cx - 13, ty + 10, 8, 14, "#2a2430", "#4a4450", "#141018");
    g.block(cx + 5, ty + 10, 8, 14, "#2a2430", "#4a4450", "#141018");
    g.rect(cx - 12, ty + 21, 24, 4, kit.trim);
  } else {
    g.drape(x, ty, w, 21, kit.coat, kit.coatHi, kit.coatLo);
    g.rect(cx - 4, ty, 8, 6, WHITE);
    g.rect(cx - 2, ty + 1, 4, 18, kit.accent);
    g.rect(cx - 2, ty + 1, 4, 4, kit.trim);
    g.dot(cx, ty + 10, kit.trim);
    g.rect(x + 3, ty + 4, 5, 7, kit.coatHi);
  }
  suitArms(g, kit, r, x, w, ty);
  return { x, w };
}

function paintProp(g: Grid, kit: PixelKit, r: Rig): void {
  const { cx, ty, punch, win, cast } = r;
  const px = cx + 16 + punch * 2;
  const py = ty + (win || cast ? -10 : 3);
  switch (kit.prop) {
    case "rocket":
      g.block(px, py - 9, 8, 17, kit.trim, kit.coatHi, kit.coatLo);
      g.rect(px, py - 13, 8, 4, kit.accent);
      g.dot(px + 3, py - 12, WHITE);
      g.dot(px + 2, py + 8, "#ff7043");
      g.dot(px + 4, py + 8, "#ffcc80");
      if (cast || (r.pose === "attack" && r.frame >= 4)) g.dot(px + 3, py + 12, "#ffcc80");
      break;
    case "mic":
      g.rect(px + 3, py, 2, 13, PIXEL_INK);
      g.block(px - 1, py - 8, 10, 9, kit.accent, kit.coatHi, kit.coatLo);
      g.dot(px + 3, py - 4, WHITE);
      break;
    case "megaphone":
      g.rect(px, py, 4, 10, PIXEL_INK);
      g.block(px - 1, py - 4, 8, 8, kit.accent, kit.coatHi, kit.coatLo);
      g.rect(px + 6, py - 8, 9, 12, kit.trim);
      if (cast || (r.pose === "attack" && r.frame >= 4)) {
        g.dot(px + 16, py - 5, kit.vfx);
        g.dot(px + 18, py, WHITE);
      }
      break;
    case "book":
      g.block(px, py, 12, 13, kit.accent, kit.coatHi, kit.coatLo);
      g.rect(px + 2, py + 2, 8, 10, PIXEL_INK);
      g.dot(px + 4, py + 4, kit.trim);
      g.rect(px + 3, py + 8, 5, 1, WHITE);
      break;
    case "flask":
      g.block(px, py - 2, 9, 13, "#7ec8ff", WHITE, "#3d6ea6");
      g.rect(px + 3, py - 5, 4, 4, PIXEL_INK);
      g.dot(px + 4, py + 3, WHITE);
      break;
    case "globe":
      g.block(px, py - 2, 12, 12, "#3d6ea6", "#7ec8ff", "#1a3a5c");
      g.rect(px + 3, py + 1, 5, 4, "#5ad45a");
      g.dot(px + 8, py + 5, WHITE);
      break;
    case "mittens":
      g.block(cx - 17, ty + 12, 9, 9, kit.accent, kit.coatHi, kit.coatLo);
      g.block(cx + 9, ty + 12, 9, 9, kit.accent, kit.coatHi, kit.coatLo);
      g.dot(cx - 13, ty + 14, WHITE);
      break;
    case "halo":
      g.rect(cx - 10, r.hy - 5, 21, 2, kit.accent);
      g.rect(cx - 8, r.hy - 6, 16, 1, kit.trim);
      if (cast || win) g.dot(cx, r.hy - 8, WHITE);
      break;
    case "glove":
    case "tape":
      g.block(cx + 13 + punch, ty + 8, 10, 10, kit.accent, WHITE, kit.coatLo);
      g.dot(cx + 17 + punch, ty + 11, WHITE);
      break;
    case "sash":
      g.rect(cx - 10, ty + 5, 21, 4, kit.accent);
      g.dot(cx, ty + 6, kit.trim);
      break;
    case "belt":
      g.rect(cx - 9, ty + 12, 18, 5, PIXEL_INK);
      g.rect(cx - 2, ty + 12, 6, 5, kit.trim);
      break;
    case "staff":
      g.rect(cx + 16 + punch, ty - 10, 3, 28, "#6b4a2a");
      g.block(cx + 13 + punch, ty - 16, 9, 8, kit.accent, kit.trim, kit.coatLo);
      break;
    case "camera":
      g.block(px - 2, py, 16, 10, PIXEL_INK, "#3a2418", PIXEL_INK);
      g.rect(px + 9, py + 2, 6, 6, WHITE);
      g.dot(px + 3, py + 3, kit.vfx);
      break;
    case "file":
      g.block(px, py, 12, 14, WHITE, "#efe6d6", "#8a8070");
      g.rect(px + 2, py + 3, 8, 1, PIXEL_INK);
      g.rect(px + 2, py + 6, 8, 1, PIXEL_INK);
      break;
    case "brush":
      g.rect(px + 3, py - 2, 3, 16, "#6b4a2a");
      g.block(px, py - 8, 9, 6, "#3d6ea6", "#7ec8ff", "#1a3a5c");
      g.rect(px + 6, py - 5, 4, 4, "#c4161c");
      break;
    case "stud":
      g.rect(px + 2, py + 4, 14, 3, kit.accent);
      g.rect(px + 2, py + 3, 12, 1, lit(kit.accent, 0.3));
      g.dot(px + 15, py + 4, kit.hair);
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
  if (kit.id === "maga-hooli") {
    paintHooli(g, kit, r);
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
    g.dot(r.cx - 10, r.hy + 3, lit(kit.skinHi, 0.15));
    g.dot(r.cx + 8, r.ty + 3, lit(kit.coatHi, 0.2));
  }
}

function paintHooli(g: Grid, kit: PixelKit, r: Rig): void {
  const cx = r.cx;
  const hy = Math.max(5, Math.min(16, r.hy));
  const ty = r.pose === "portrait" ? 34 : r.ty;
  const ly = r.pose === "portrait" ? 80 : r.ly;
  const leather = lit(kit.coat, 0.08);
  const leatherHi = lit(kit.coatHi, 0.18);
  const leatherLo = kit.coatLo;
  const stud = kit.accent;
  const studHi = lit(stud, 0.35);
  const pink = kit.hair;
  const pinkHi = kit.hairHi;
  const pinkLo = dim(pink, 0.32);
  const jean = "#141418";
  const jeanHi = "#2a2a32";
  const pump = WHITE;
  const pumpLo = "#c8c0b4";
  const skinLo = dim(kit.skin, 0.4);
  const sway = r.pose === "walk" ? r.arm : r.pose === "idle" ? (r.frame % 6 === 2 ? 1 : 0) : 0;
  const hawkLean = r.pose === "walk" ? r.bob : r.pose === "attack" ? -1 : r.cast || r.win ? 1 : 0;
  const jab = r.pose === "attack" ? r.punch : r.cast ? r.punch : 0;
  const sniper = r.pose === "ult";

  if (r.pose !== "portrait") {
    const leftX = cx - 8 + (r.pose === "walk" ? -Math.max(0, r.l - 1) : r.pose === "idle" ? -1 : 0);
    const rightX = cx + 1 + (r.pose === "walk" ? Math.max(0, r.r - 1) : r.pose === "idle" ? 2 : 0);
    const leftY = ly + (r.pose === "walk" ? r.lyL : 0);
    const rightY = ly + (r.pose === "walk" ? r.lyR + r.bob : 0);
    g.block(leftX, leftY, 8, 12, jean, jeanHi, PIXEL_INK);
    g.block(rightX, rightY, 8, 12, jean, jeanHi, PIXEL_INK);
    g.fold(leftX + 2, leftY + 1, 8, jeanHi);
    g.fold(rightX + 5, rightY + 2, 7, PIXEL_INK);
    g.block(leftX - 2, leftY + 10, 11, 5, pump, pump, pumpLo);
    g.block(rightX - 1, rightY + 10, 11, 5, pump, pump, pumpLo);
    g.rect(leftX, leftY + 10, 8, 1, stud);
    g.rect(rightX + 1, rightY + 10, 8, 1, stud);
    g.dot(leftX + 1, leftY + 11, WHITE);
    g.dot(rightX + 2, rightY + 11, WHITE);
  }

  g.drape(cx - 12, ty, 24, r.pose === "portrait" ? 18 : 20, leather, leatherHi, leatherLo);
  g.rect(cx - 11, ty + 2, 7, 13, leatherHi);
  g.rect(cx + 6, ty + 3, 6, 13, leatherLo);
  g.fold(cx - 7, ty + 4, 12, leatherHi);
  g.fold(cx + 4, ty + 5, 10, leatherLo);
  g.rect(cx - 11, ty + 1, 2, 15, stud);
  g.rect(cx + 10, ty + 2, 2, 14, stud);
  for (const [sx, sy] of [
    [-10, 3],
    [-10, 6],
    [-10, 9],
    [-10, 12],
    [11, 4],
    [11, 7],
    [11, 10],
    [11, 13],
    [-6, 2],
    [5, 2],
  ] as const) {
    g.dot(cx + sx, ty + sy, studHi);
  }
  g.rect(cx - 4, ty + 12, 9, 3, PIXEL_INK);
  g.rect(cx - 2, ty + 12, 5, 3, stud);
  g.dot(cx, ty + 13, studHi);

  g.block(cx - 16, ty + 3 - (r.lift ? 1 : 0), 6, 12, leather, leatherHi, leatherLo);
  g.block(cx - 16, ty + 13 - (r.lift ? 1 : 0), 6, 5, kit.skin, kit.skinHi, skinLo);
  g.dot(cx - 14, ty + 5, studHi);
  g.dot(cx - 14, ty + 8, stud);

  const gunX = cx + 11 + jab;
  const gunY = ty + (sniper ? -4 : r.cast ? -2 : r.pose === "attack" ? 4 : 6) + sway;
  g.block(gunX, gunY, 6, 12, leather, leatherHi, leatherLo);
  g.block(gunX, gunY + 11, 6, 5, kit.skin, kit.skinHi, skinLo);
  if (r.pose === "attack" || sniper || r.cast) {
    g.rect(gunX + 5, gunY + 6, sniper ? 16 : 10, 3, stud);
    g.rect(gunX + 5, gunY + 5, sniper ? 14 : 8, 1, studHi);
    g.dot(gunX + (sniper ? 20 : 14), gunY + 6, pink);
    if (sniper) {
      g.rect(gunX + 8, gunY + 2, 3, 3, pinkHi);
      g.dot(gunX + 9, gunY + 1, WHITE);
    }
  }

  g.block(cx - 8, hy, 17, 16, kit.skin, kit.skinHi, skinLo);
  g.rect(cx - 5, hy + 1, 10, 4, kit.skinHi);
  g.rect(cx - 9, hy + 5, 3, 6, kit.skin);
  g.rect(cx + 7, hy + 5, 3, 6, kit.skinHi);
  if (r.blink) {
    g.rect(cx - 5, hy + 8, 4, 1, PIXEL_INK);
    g.rect(cx + 2, hy + 8, 4, 1, PIXEL_INK);
  } else {
    g.rect(cx - 5, hy + 6, 4, 4, WHITE);
    g.rect(cx + 2, hy + 6, 4, 4, WHITE);
    g.dot(cx - 3, hy + 8, PIXEL_INK);
    g.dot(cx + 5, hy + 8, PIXEL_INK);
    g.dot(cx - 4, hy + 6, kit.vfx);
  }
  g.rect(cx - 1, hy + 9, 3, 2, dim(kit.skin, 0.2));
  g.rect(cx - 3, hy + 12, 8, 3, MOUTH);
  g.dot(cx, hy + 12, WHITE);
  g.rect(cx - 1, hy + 14, 5, 1, LIP);
  if (r.pose === "attack" || r.cast || r.win) g.rect(cx - 4, hy + 12, 10, 4, MOUTH);

  const hawkX = cx - 3 + hawkLean;
  const hawkTop = hy - (sniper || r.win ? 12 : 10);
  g.rect(hawkX, hawkTop + 5, 8, 12, pinkLo);
  g.rect(hawkX + 1, hawkTop + 2, 6, 14, pink);
  g.rect(hawkX + 2, hawkTop - 1, 5, 10, pinkHi);
  g.rect(hawkX + 3, hawkTop - 3, 3, 6, lit(pinkHi, 0.28));
  g.dot(hawkX + 4, hawkTop - 4, WHITE);
  g.rect(hawkX - 1, hy + 1, 4, 7, pink);
  g.rect(hawkX + 6, hy + 1, 4, 6, pinkHi);
  g.dither(hawkX + 1, hawkTop + 4, 5, 8, pinkLo);
  if (r.pose === "walk" || r.pose === "idle") g.dot(hawkX + 5 + sway, hawkTop, WHITE);
}

function paintHooliDeath(g: Grid, kit: PixelKit, frame: number): void {
  const sink = frame <= 1 ? 5 - frame * 2 : frame <= 3 ? 1 : 0;
  const slide = frame >= 4 ? Math.min(5, frame - 3) : 0;
  g.block(12 + slide, 46 + sink, 38, 10, kit.coat, kit.coatHi, kit.coatLo);
  g.rect(16 + slide, 42 + sink, 28, 6, "#141418");
  g.rect(20 + slide, 50 + sink, 10, 4, WHITE);
  g.rect(34 + slide, 50 + sink, 10, 4, WHITE);
  g.rect(18 + slide, 38 + sink, 16, 8, kit.skin);
  g.rect(22 + slide, 32 + sink, 14, 8, kit.hair);
  g.rect(24 + slide, 30 + sink, 8, 6, kit.hairHi);
  g.rect(20 + slide, 40 + sink, 5, 3, PIXEL_INK);
  g.rect(28 + slide, 40 + sink, 5, 3, PIXEL_INK);
  g.rect(24 + slide, 44 + sink, 8, 3, MOUTH);
  g.dot(16 + slide, 44 + sink, kit.accent);
  g.dot(40 + slide, 45 + sink, kit.vfx);
}

function paintGrump(g: Grid, kit: PixelKit, r: Rig): void {
  const cx = r.cx;
  const hy = Math.max(4, Math.min(14, r.hy));
  const ty = r.pose === "portrait" ? 36 : r.ty;
  const ly = r.pose === "portrait" ? 80 : r.ly;
  const navy = kit.coat;
  const navyHi = kit.coatHi;
  const navyLo = kit.coatLo;
  const skinLo = dim(kit.skin, 0.42);
  const h = kit.hair;
  const hi = kit.hairHi;
  const hLo = dim(h, 0.35);
  const pointUp = r.pose === "idle" || r.pose === "cast" || r.pose === "ult" || r.pose === "victory" || r.pose === "portrait";
  const jab = r.pose === "attack" && r.frame >= 3 && r.frame <= 6;
  const punch = jab ? r.punch : 0;

  if (r.pose !== "portrait") {
    const strideL = r.pose === "walk" ? -Math.max(0, r.l - 1) : r.pose === "idle" ? -1 : 0;
    const strideR = r.pose === "walk" ? Math.max(0, r.r - 1) : r.pose === "idle" ? 3 : 0;
    const leftX = cx - 8 + strideL;
    const rightX = cx + 1 + strideR;
    const leftY = ly + (r.pose === "walk" ? r.lyL : 0);
    const rightY = ly + (r.pose === "walk" ? r.lyR + r.bob : 0);
    g.block(leftX, leftY, 8, 11, navy, navyHi, navyLo);
    g.block(rightX, rightY, 8, 11, navy, navyHi, navyLo);
    g.fold(leftX + 3, leftY + 1, 7, navyHi);
    g.block(leftX - 2, leftY + 9, 10, 4, "#1a120c", "#3a2a20", PIXEL_INK);
    g.block(rightX, rightY + 9, 10, 4, "#1a120c", "#3a2a20", PIXEL_INK);
  }

  g.drape(cx - 11, ty, 22, r.pose === "portrait" ? 18 : 21, navy, navyHi, navyLo);
  g.rect(cx - 9, ty + 3, 5, 11, navyHi);
  g.rect(cx + 6, ty + 4, 4, 11, navyLo);
  g.rect(cx - 3, ty, 8, 8, WHITE);
  g.rect(cx - 1, ty + 2, 5, 5, WHITE);
  g.rect(cx, ty + 3, 3, 17, kit.accent);
  g.dot(cx, ty + 4, lit(kit.accent, 0.35));
  g.rect(cx + 6, ty + 6, 4, 3, WHITE);
  g.dot(cx + 6, ty + 6, "#c4161c");
  g.dot(cx + 9, ty + 6, "#1a3d9c");
  g.dot(cx + 7, ty + 7, WHITE);
  g.dot(cx + 8, ty + 8, "#c4161c");

  g.block(cx - 16, ty + 3 - (r.lift ? 1 : 0), 6, 13, navy, navyHi, navyLo);
  g.block(cx - 16, ty + 14 - (r.lift ? 1 : 0), 6, 5, kit.skin, kit.skinHi, skinLo);
  g.rect(cx - 15, ty + 13, 4, 2, WHITE);

  if (pointUp && !r.hurt) {
    const up = r.cast || r.win ? 5 : 3;
    g.block(cx + 11, ty - up, 6, 12, navy, navyHi, navyLo);
    g.rect(cx + 11, ty + 8 - up, 5, 2, WHITE);
    g.rect(cx + 13, ty - 8 - up, 4, 9, kit.skin);
    g.rect(cx + 15, ty - 13 - up, 2, 6, kit.skin);
    g.dot(cx + 16, ty - 14 - up, kit.skinHi);
    if (r.cast || r.win) {
      g.dot(cx + 17, ty - 16 - up, kit.vfx);
      g.dot(cx + 18, ty - 13 - up, WHITE);
    }
  } else {
    g.block(cx + 10 + punch, ty + 3 - r.lift, 6, 13, navy, navyHi, navyLo);
    g.block(cx + 10 + punch, ty + 14 - r.lift, 6, 5, kit.skin, kit.skinHi, skinLo);
    g.rect(cx + 11 + punch, ty + 13 - r.lift, 4, 2, WHITE);
    if (jab) {
      g.rect(cx + 16 + punch, ty + 13, 5, 3, kit.skin);
      g.dot(cx + 21 + punch, ty + 13, kit.skinHi);
    }
  }

  g.rect(cx - 3, hy + 13, 7, 5, kit.skin);
  g.block(cx - 8, hy + 1, 17, 16, kit.skin, kit.skinHi, skinLo);
  g.rect(cx - 5, hy + 2, 10, 4, kit.skinHi);
  g.rim(cx - 7, hy + 2, 14, 4, lit(kit.skinHi, 0.18));
  g.rect(cx - 10, hy + 6, 3, 7, kit.skin);
  g.rect(cx + 8, hy + 6, 3, 7, kit.skinHi);
  g.dot(cx + 6, hy + 10, CHEEK);
  g.rect(cx - 4, hy + 5, 4, 1, dim(h, 0.25));
  g.rect(cx + 2, hy + 5, 4, 1, dim(h, 0.25));
  if (r.blink) {
    g.rect(cx - 4, hy + 8, 4, 1, PIXEL_INK);
    g.rect(cx + 2, hy + 8, 4, 1, PIXEL_INK);
  } else {
    g.rect(cx - 4, hy + 7, 4, 3, WHITE);
    g.rect(cx + 2, hy + 7, 4, 3, WHITE);
    g.dot(cx - 2, hy + 9, "#1a3d9c");
    g.dot(cx + 4, hy + 9, "#1a3d9c");
    g.dot(cx - 4, hy + 7, lit(WHITE, 0.2));
  }
  g.rect(cx, hy + 10, 3, 3, dim(kit.skin, 0.22));
  g.rect(cx - 2, hy + 14, 6, 2, LIP);
  g.dot(cx + 3, hy + 15, MOUTH);

  const wob = r.pose === "walk" && (r.walk === 1 || r.walk === 5) ? 1 : 0;
  g.rect(cx - 5, hy - 5, 13, 4, hi);
  g.rect(cx - 8, hy - 4, 18, 5, h);
  g.rect(cx - 9, hy - 1, 21, 8, h);
  g.rect(cx - 4, hy - 6, 9, 3, lit(hi, 0.35));
  g.dot(cx, hy - 7, lit(hi, 0.5));
  g.rect(cx - 10, hy + 2 + wob, 5, 10, h);
  g.rect(cx + 8, hy + 2, 6, 10, h);
  g.rect(cx + 11, hy + 4, 4, 6, hi);
  g.rect(cx - 9, hy + 6, 4, 5, hLo);
  g.dot(cx - 6, hy - 3, lit(hi, 0.4));
}

function paintLegend(g: Grid, kit: PixelKit, r: Rig): void {
  const lean = r.pose === "attack" ? 3 : r.hurt ? -3 : r.win ? 1 : 0;
  const bob = r.pose === "walk" ? r.bob : r.pose === "idle" && (r.frame === 3 || r.frame === 8) ? -1 : 0;
  const hx = r.cx + lean;
  const hy = r.pose === "portrait" ? 10 : Math.max(3, 5 + bob + (r.cast ? -1 : 0) + (r.hurt ? 1 : 0));
  const skinLo = dim(kit.skin, 0.4);
  const pant = kit.accent;
  const pantHi = "#5a5e64";
  const pantLo = "#1a1e22";
  const chair = "#1c1e22";
  const chairHi = "#3a3e44";
  const chairLo = "#0c0d10";
  const spin = r.pose === "walk" ? r.walk : r.pose === "cast" ? r.frame : 0;

  if (r.pose !== "portrait") {
    g.block(hx - 14, hy + 10, 6, 20, chair, chairHi, chairLo);
    g.rect(hx - 15, hy + 4, 5, 10, chair);
    g.block(hx - 16, hy - 1, 8, 6, chair, chairHi, chairLo);
    g.block(hx - 10, hy + 28, 20, 6, chair, chairHi, chairLo);
    g.rect(hx + 10, hy + 24, 3, 9, chair);
    g.rect(hx + 9, hy + 22, 5, 4, chairHi);
    g.dot(hx + 11, hy + 21, WHITE);
    g.rect(hx + 5, hy + 46, 15, 3, chair);
    paintLegendWheel(g, hx - 10, hy + 44, spin);
    g.block(hx + 8, hy + 50, 5, 5, PIXEL_INK, chairHi, PIXEL_INK);
    g.block(hx + 14, hy + 51, 4, 4, PIXEL_INK, chairHi, PIXEL_INK);
  }

  g.drape(hx - 10, hy + 16, 21, 14, kit.coat, kit.coatHi, kit.coatLo);
  g.block(hx - 15, hy + 17, 6, 9, kit.coat, kit.coatHi, kit.coatLo);
  g.block(hx + 9, hy + 17, 6, 9, kit.coat, kit.coatHi, kit.coatLo);
  if (r.pose !== "portrait") {
    g.drape(hx - 8, hy + 29, 18, 10, pant, pantHi, pantLo);
    g.rect(hx + 8, hy + 30, 15, 13, pant);
    g.rect(hx + 3, hy + 30, 1, 10, pantHi);
    g.block(hx + 18, hy + 41, 8, 5, PIXEL_INK, "#3a2418", PIXEL_INK);
  }

  const handY = hy + (r.cast || r.win ? 13 : r.pose === "attack" ? 20 : 18);
  const jab = r.pose === "attack" && r.frame >= 3 ? r.punch : 0;
  g.block(hx - 12, handY, 6, 5, kit.skin, kit.skinHi, skinLo);
  g.rect(hx - 12, handY + 4, 1, 4, kit.skin);
  g.rect(hx - 9, handY + 4, 1, 4, kit.skinHi);
  g.rect(hx - 7, handY + 4, 1, 4, kit.skin);
  g.block(hx + 3 + jab, handY, 6, 5, kit.skin, kit.skinHi, skinLo);
  g.rect(hx + 3 + jab, handY + 4, 1, 4, kit.skin);
  g.rect(hx + 6 + jab, handY + 4, 1, 4, kit.skinHi);
  g.rect(hx + 8 + jab, handY + 4, 1, r.pose === "attack" ? 6 : 4, kit.skin);

  g.block(hx - 7, hy, 15, 16, kit.skin, kit.skinHi, skinLo);
  g.rect(hx - 4, hy + 1, 9, 4, kit.skinHi);
  g.rect(hx - 9, hy + 5, 3, 6, kit.skin);
  g.rect(hx + 7, hy + 5, 3, 6, kit.skinHi);
  g.rect(hx - 5, hy + 4, 4, 1, kit.hair);
  g.rect(hx + 2, hy + 4, 4, 1, kit.hair);
  g.rect(hx - 6, hy + 6, 15, 1, PIXEL_INK);
  g.rect(hx - 5, hy + 5, 5, 5, PIXEL_INK);
  g.rect(hx + 1, hy + 5, 5, 5, PIXEL_INK);
  if (r.blink) {
    g.rect(hx - 4, hy + 8, 3, 1, PIXEL_INK);
    g.rect(hx + 2, hy + 8, 3, 1, PIXEL_INK);
  } else {
    g.rect(hx - 4, hy + 6, 3, 3, WHITE);
    g.rect(hx + 2, hy + 6, 3, 3, WHITE);
    g.dot(hx - 3, hy + 8, PIXEL_INK);
    g.dot(hx + 4, hy + 8, PIXEL_INK);
  }
  g.rect(hx, hy + 9, 3, 2, dim(kit.skin, 0.22));
  g.rect(cxMust(hx), hy + 10, 9, 3, kit.hair);
  g.rect(hx - 3, hy + 13, 7, 4, MOUTH);
  g.dot(hx, hy + 13, WHITE);
  g.rect(hx, hy + 15, 3, 1, LIP);

  g.rect(hx - 3, hy - 3, 8, 4, kit.hair);
  g.rect(hx, hy - 5, 4, 4, kit.hair);
  g.dot(hx + 1, hy - 6, kit.hairHi);
  g.rect(hx - 7, hy + 1, 4, 6, kit.hair);
  g.rect(hx + 4, hy + 1, 4, 5, kit.hair);
  g.rect(hx - 5, hy + 5, 3, 5, kit.hair);
}

function cxMust(hx: number): number {
  return hx - 4;
}

function paintLegendWheel(g: Grid, x: number, y: number, spin: number): void {
  g.block(x - 9, y - 9, 19, 19, PIXEL_INK, "#2a2e34", PIXEL_INK);
  g.rect(x - 6, y - 6, 13, 13, "#1a1c20");
  if (spin % 2 === 0) {
    g.rect(x - 8, y, 17, 2, "#5a5e64");
    g.rect(x, y - 8, 2, 17, "#5a5e64");
  } else {
    for (let i = -6; i <= 6; i++) {
      g.dot(x + i, y + i, "#5a5e64");
      g.dot(x + i, y - i, "#5a5e64");
    }
  }
  g.rect(x - 2, y - 2, 5, 5, "#8a8e94");
  g.rect(x - 9, y - 1, 19, 3, PIXEL_INK);
  g.rect(x - 1, y - 9, 3, 19, PIXEL_INK);
}

function paintLegendDeath(g: Grid, kit: PixelKit, frame: number): void {
  const sink = frame === 0 ? 3 : frame === 1 ? 1 : 0;
  const hx = 30;
  const hy = 14 + sink;
  g.block(hx - 14, hy + 12, 8, 18, "#1c1e22", "#3a3e44", "#0c0d10");
  g.block(hx - 10, hy + 26, 20, 6, "#1c1e22", "#3a3e44", "#0c0d10");
  paintLegendWheel(g, hx - 10, hy + 38, 0);
  g.drape(hx - 10, hy + 16, 19, 13, kit.coat, kit.coatHi, kit.coatLo);
  g.rect(hx - 8, hy + 26, 20, 9, kit.accent);
  g.block(hx - 7, hy + 2, 16, 13, kit.skin, kit.skinHi, dim(kit.skin, 0.4));
  g.rect(hx - 4, hy, 10, 4, kit.hair);
  g.rect(hx - 5, hy + 6, 5, 4, PIXEL_INK);
  g.rect(hx + 2, hy + 6, 5, 4, PIXEL_INK);
  g.rect(hx - 3, hy + 11, 8, 3, kit.hair);
  g.rect(hx - 1, hy + 14, 5, 3, MOUTH);
  g.dot(hx + 13, hy + 10, kit.vfx);
}

function paintUnique(g: Grid, kit: PixelKit, r: Rig): void {
  const { cx, hy, ty } = r;
  switch (kit.id) {
    case "maga-elonmolk":
      g.rect(cx - 8, hy + 8, 16, 3, PIXEL_INK);
      g.rect(cx - 7, hy + 8, 14, 1, "#7ec8ff");
      g.dot(cx + 5, ty + 5, kit.accent);
      g.dot(cx - 4, ty + 6, WHITE);
      break;
    case "maga-rogentor":
      g.rect(cx - 13, hy + 6, 5, 8, PIXEL_INK);
      g.rect(cx + 8, hy + 6, 5, 8, PIXEL_INK);
      g.dot(cx - 11, hy + 9, kit.trim);
      g.dot(cx + 11, hy + 9, kit.trim);
      g.rect(cx - 10, hy + 13, 21, 3, PIXEL_INK);
      break;
    case "maga-alexgroans":
      g.rect(cx - 10, hy + 5, 5, 5, PIXEL_INK);
      g.rect(cx + 6, hy + 5, 5, 5, PIXEL_INK);
      g.dot(cx + 9, hy + 8, kit.vfx);
      g.rect(cx - 8, ty - 3, 16, 5, PIXEL_INK);
      g.rect(cx - 5, ty - 4, 10, 3, kit.accent);
      break;
    case "maga-brander":
      g.rect(cx - 5, ty + 3, 10, 3, kit.trim);
      g.dot(cx, ty + 4, WHITE);
      g.rect(cx - 4, hy + 14, 8, 3, kit.hair);
      break;
    case "maga-vestyt":
      g.rect(cx - 9, hy + 6, 18, 4, PIXEL_INK);
      g.rect(cx - 8, hy + 6, 16, 1, kit.trim);
      g.rect(cx - 3, ty + 5, 6, 8, kit.trim);
      g.dot(cx, ty + 8, WHITE);
      break;
    case "maga-steers":
      g.rect(cx - 8, hy + 6, 16, 4, PIXEL_INK);
      g.rect(cx - 7, hy + 6, 5, 4, "#7ec8ff");
      g.rect(cx + 2, hy + 6, 5, 4, "#7ec8ff");
      g.dot(cx - 5, hy + 8, WHITE);
      g.dot(cx + 4, hy + 8, WHITE);
      break;
    case "lw-bitenten":
      g.rect(cx - 9, hy + 9, 18, 4, PIXEL_INK);
      g.rect(cx - 8, hy + 9, 16, 1, "#7ec8ff");
      g.rect(cx + 6, ty + 4, 4, 4, "#c4161c");
      g.dot(cx + 8, ty + 4, "#3ec8c1");
      break;
    case "lw-sandbags":
      g.rect(cx - 4, hy + 13, 8, 4, kit.hair);
      g.rect(cx - 3, hy + 14, 6, 3, kit.hairHi);
      break;
    case "lw-youngturkey":
      g.rect(cx - 13, hy + 2, 8, 10, kit.skin);
      g.rect(cx + 5, hy + 2, 8, 10, kit.skin);
      g.dot(cx - 10, hy + 6, PIXEL_INK);
      g.dot(cx + 9, hy + 6, PIXEL_INK);
      g.rect(cx - 12, hy + 10, 5, 2, LIP);
      g.rect(cx + 6, hy + 10, 5, 2, LIP);
      break;
    case "lw-climate":
      g.rect(cx - 10, ty + 3, 21, 4, kit.accent);
      g.dot(cx + 8, ty + 4, WHITE);
      break;
    case "lw-odramma":
      g.rect(cx - 10, hy - 6, 21, 3, kit.accent);
      g.rect(cx - 8, hy - 7, 16, 1, kit.trim);
      if (r.cast || r.win) g.dot(cx, hy - 10, WHITE);
      break;
    case "lw-harass":
      g.dot(cx - 5, hy + 14, kit.trim);
      g.dot(cx + 5, hy + 14, kit.trim);
      g.rect(cx - 6, ty + 8, 13, 3, kit.trim);
      break;
    case "lw-hocking":
      g.rect(cx - 5, hy + 8, 10, 3, PIXEL_INK);
      g.rect(cx - 4, hy + 8, 8, 1, "#7ec8ff");
      break;
    case "lw-vakxie":
      g.rect(cx - 8, hy + 8, 16, 3, PIXEL_INK);
      g.dot(cx + 6, ty + 5, kit.vfx);
      break;
    case "wild-cartoons":
      g.rect(cx - 8, ty + 3, 16, 3, "#f0c14a");
      g.rect(cx - 6, ty + 5, 3, 10, PIXEL_INK);
      g.rect(cx + 4, ty + 5, 3, 10, PIXEL_INK);
      break;
    case "wild-cezanne":
      g.rect(cx + 10, ty, 8, 6, "#3d6ea6");
      g.rect(cx + 12, ty + 1, 4, 4, "#c4161c");
      break;
    case "wild-icon":
      g.rect(cx - 4, ty + 6, 8, 8, kit.trim);
      g.dot(cx, ty + 9, WHITE);
      break;
    case "wild-enigma":
      g.block(cx - 8, hy + 5, 16, 8, "#121018", "#2a2430", PIXEL_INK);
      g.rect(cx - 5, hy + 8, 4, 3, kit.vfx);
      g.rect(cx + 2, hy + 8, 4, 3, kit.vfx);
      break;
    case "wild-karen":
      g.rect(cx - 10, hy + 8, 21, 4, PIXEL_INK);
      g.rect(cx - 9, hy + 8, 18, 1, "#3a2418");
      break;
    case "wild-butter":
      g.rect(cx - 10, hy + 8, 21, 5, kit.accent);
      g.rect(cx - 9, hy + 8, 18, 1, WHITE);
      break;
    case "mma-macgregor":
      g.rect(cx - 5, hy + 3, 10, 3, "#c9a24a");
      break;
    case "mma-nurmagoat":
      g.rect(cx - 6, ty + 10, 13, 4, kit.accent);
      break;
    case "mma-jonesy":
      g.rect(cx - 8, ty + 4, 16, 4, kit.trim);
      break;
    case "mma-poirierish":
      g.rect(cx - 8, ty + 10, 16, 4, WHITE);
      g.dot(cx, ty + 12, kit.accent);
      break;
    case "mma-diazish":
      g.rect(cx + 8, ty + 3, 6, 10, kit.accent);
      g.rect(cx + 9, ty + 4, 4, 8, WHITE);
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
  const wob = r.pose === "walk" && (r.walk === 2 || r.walk === 7) ? 1 : r.pose === "idle" && r.frame === 5 ? 1 : 0;
  switch (kit.id) {
    case "maga-boris":
      g.block(cx - 9, y - 3, 21, 8, h, hi, lo);
      g.dot(cx - 10, y + wob, h);
      g.rect(cx + 4, y - 6, 13, 8, hi);
      g.rect(cx + 9, y + 1, 9, 10, h);
      g.dot(cx - 6 + wob, y - 5, hi);
      break;
    case "lw-bitenten":
    case "lw-sandbags":
      g.block(cx - 9, y + 1, 18, 6, h, hi, lo);
      g.rect(cx - 5, y - 1, 14, 5, hi);
      g.rect(cx - 10, y + 5, 5, 8, h);
      g.rect(cx + 8, y + 5, 5, 7, h);
      break;
    case "wild-icon":
      g.rect(cx - 13, y, 26, 4, kit.coatLo);
      g.rect(cx - 10, y - 3, 21, 4, kit.coat);
      g.rect(cx - 8, y, 16, 3, kit.coatHi);
      g.rect(cx - 13, y + 4, 5, 12, kit.coatLo);
      g.rect(cx + 8, y + 4, 5, 12, kit.coatLo);
      break;
    case "wild-dynasty":
      g.block(cx - 10, y - 4, 24, 9, kit.coat, kit.coatHi, kit.coatLo);
      g.rect(cx - 8, y - 6, 16, 4, kit.coatHi);
      g.rect(cx - 13, y + 4, 5, 9, kit.coat);
      g.rect(cx + 9, y + 4, 5, 9, kit.coat);
      g.dot(cx - 9, y + 10, kit.accent);
      g.dot(cx + 11, y + 10, kit.accent);
      break;
    case "wild-karen":
      g.block(cx - 10, y + 1, 21, 8, h, hi, lo);
      g.rect(cx - 8, y - 1, 16, 4, hi);
      g.rect(cx - 13, y + 5, 5, 10, h);
      g.rect(cx + 8, y + 5, 6, 10, h);
      g.rect(cx - 9, y - 4, 18, 4, PIXEL_INK);
      g.rect(cx - 6, y - 6, 5, 4, "#3a2418");
      g.rect(cx + 3, y - 6, 5, 4, "#3a2418");
      break;
    case "mma-nurmagoat":
      g.block(cx - 9, y - 3, 18, 8, "#3a2418", "#5c3a28", "#1a120c");
      g.rect(cx - 5, y - 4, 10, 3, "#5c3a28");
      g.rect(cx - 8, y + 4, 16, 4, h);
      break;
    case "mma-adesanyaish":
      g.block(cx - 5, y, 10, 8, h, hi, lo);
      g.rect(cx - 1, y - 5, 5, 5, hi);
      g.dot(cx, y - 7, hi);
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
      g.block(cx - 8, y + 2, 17, 6, h, hi, lo);
      g.rect(cx - 4, y + 1, 10, 3, hi);
      g.rect(cx + 8, y + 5, 5, 5, h);
      break;
    case "mess":
      g.block(cx - 9, y, 21, 8, h, hi, lo);
      g.rect(cx + 5, y - 4, 10, 5, hi);
      g.rect(cx + 9, y + 3, 9, 9, h);
      g.dot(cx - 10, y + 1 + wob, h);
      break;
    case "locks":
      g.block(cx - 8, y + 1, 16, 6, h, hi, lo);
      g.rect(cx - 13, y + 5, 5, 21, h);
      g.rect(cx + 8, y + 5, 5, 22, h);
      g.rect(cx - 10, y + 10, 3, 9, hi);
      g.rect(cx + 10, y + 12, 3, 8, hi);
      break;
    case "fade":
    case "buzz":
    case "close":
      g.block(cx - 8, y + 2, 16, 4, h, hi, lo);
      g.rect(cx - 5, y + 1, 10, 3, hi);
      g.rect(cx - 8, y + 5, 3, 5, h);
      g.rect(cx + 5, y + 5, 3, 5, h);
      break;
    case "white":
      g.block(cx - 9, y + 1, 18, 6, h, hi, lo);
      g.rect(cx - 5, y, 13, 4, hi);
      g.rect(cx - 10, y + 5, 5, 8, h);
      break;
    case "bob":
    case "blondbob":
      g.block(cx - 10, y + 1, 21, 8, h, hi, lo);
      g.rect(cx - 8, y - 1, 16, 3, hi);
      g.rect(cx - 13, y + 5, 5, 10, h);
      g.rect(cx + 8, y + 5, 6, 10, h);
      break;
    case "thin":
      g.rect(cx - 5, y + 5, 10, 3, h);
      g.rect(cx - 4, y + 4, 8, 2, hi);
      g.dot(cx, y + 3, hi);
      break;
    case "beret":
      g.block(cx - 10, y, 21, 5, PIXEL_INK, "#3a2418", PIXEL_INK);
      g.rect(cx - 8, y - 3, 16, 3, PIXEL_INK);
      g.dot(cx - 10, y - 3, kit.accent);
      g.rect(cx - 5, y + 4, 10, 3, h);
      break;
    case "visor":
      g.block(cx - 8, y + 2, 16, 4, h, hi, lo);
      g.rect(cx - 10, y + 8, 21, 5, kit.accent);
      g.rect(cx - 9, y + 8, 18, 2, WHITE);
      break;
    case "hood":
      g.block(cx - 13, y, 26, 10, kit.coatLo, kit.coat, kit.coatLo);
      g.rect(cx - 9, y + 1, 18, 5, kit.coat);
      break;
    case "crest":
      g.block(cx - 5, y, 10, 8, h, hi, lo);
      g.rect(cx - 1, y - 5, 5, 5, hi);
      break;
    case "longish":
      g.block(cx - 8, y + 1, 16, 6, h, hi, lo);
      g.rect(cx - 10, y + 5, 5, 14, h);
      g.rect(cx + 8, y + 5, 5, 15, h);
      break;
    case "glam":
      g.block(cx - 10, y - 3, 24, 9, kit.coat, kit.coatHi, kit.coatLo);
      g.rect(cx - 13, y + 5, 5, 9, kit.coat);
      g.rect(cx + 9, y + 5, 5, 9, kit.coat);
      break;
    case "beard":
      g.block(cx - 8, y + 2, 16, 5, h, hi, lo);
      g.rect(cx - 5, y + 13, 10, 5, h);
      g.rect(cx - 4, y + 14, 8, 3, hi);
      break;
    case "goat":
      g.block(cx - 6, y + 2, 13, 4, h, hi, lo);
      g.rect(cx - 1, y + 13, 4, 4, h);
      break;
    default:
      g.block(cx - 8, y + 1, 16, 6, h, hi, lo);
      g.rect(cx - 5, y, 10, 3, hi);
      g.rect(cx - 9, y + 4, 4, 6, h);
      g.rect(cx + 5, y + 4, 4, 6, h);
  }
}

function paintHitPixels(g: Grid, kit: PixelKit, x: number, y: number): void {
  g.dot(x, y, WHITE);
  g.dot(x + 3, y - 3, kit.vfx);
  g.dot(x + 5, y, kit.trim);
  g.dot(x + 4, y + 4, kit.accent);
  g.dot(x - 2, y + 3, WHITE);
  g.dot(x + 6, y - 1, lit(kit.vfx, 0.3));
}

function paintCastPixels(g: Grid, kit: PixelKit, cx: number, hy: number, frame: number, ult = false): void {
  const lift = frame < 6 ? 4 : 1;
  const spread = ult ? 3 : 0;
  g.dot(cx + 13, hy - 3 - lift, kit.vfx);
  g.dot(cx + 16 + spread, hy - 5 - lift, WHITE);
  g.dot(cx + 10, hy - 6 - lift, kit.trim);
  g.dot(cx - 10 - spread, hy - 4, kit.accent);
  g.dot(cx + 14, hy - 8 - lift, lit(kit.vfx, 0.4));
  if (ult) {
    g.dot(cx, hy - 10 - lift, WHITE);
    g.dot(cx - 6, hy - 8, kit.vfx);
    g.dot(cx + 8, hy - 12, kit.trim);
    g.dot(cx + 18, hy - 2, lit(kit.accent, 0.3));
  }
}

export function poseFrameC32(pose: PixelPose, time: number, swing: number): number {
  if (pose === "walk") return Math.floor(time * 14) % 8;
  if (pose === "idle") return Math.floor(time * 6) % 10;
  if (pose === "attack") {
    // Combat lands when swing() fires (swing clock starts at 0). Impact is the first frames.
    return Math.min(11, 4 + Math.floor(Math.max(0, Math.min(1, swing)) * 8));
  }
  if (pose === "cast" || pose === "ult") {
    const span = pose === "ult" ? 0.55 : 0.38;
    const t = 1 - Math.max(0, Math.min(1, swing / span));
    return Math.min(9, 4 + Math.floor(t * 6));
  }
  if (pose === "hurt") return Math.min(4, Math.floor(time * 16) % 5);
  if (pose === "death") return Math.min(7, Math.floor(time * 7));
  if (pose === "victory") return Math.floor(time * 6) % 8;
  return 0;
}
