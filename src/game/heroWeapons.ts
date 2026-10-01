/**
 * Held weapons for ranged basic attacks. The hero plate and pixel body stay as they are.
 * This overlay sits in the hand, the same way Alex Groans keeps his foam launcher.
 * Offsets are 96-plate pixels. scaleSuppliedField grows them with the tall body, feet fixed.
 * Each weapon has its own attack motion: phase 0 is the shot, phase 1 is the ready hold.
 */

import { scaleSuppliedOffset } from "./heroHeight.ts";
import { nerfMuzzle } from "./nerf.ts";

export type WeaponGrip = "one" | "two";

export type WeaponType =
  | "nerf-launcher"
  | "boom"
  | "lion-staff"
  | "stud-carbine"
  | "prompter"
  | "podium"
  | "rail"
  | "horn"
  | "pipette"
  | "vine-crossbow"
  | "camera"
  | "dossier"
  | "flash"
  | "drone"
  | "palette"
  | "vine-bow";

export type AttackMotion =
  | "nerf-brace"
  | "boom-pop"
  | "lion-thrust"
  | "stud-kick"
  | "prompter-raise"
  | "podium-pop"
  | "rail-loose"
  | "horn-kick"
  | "pipette-plunge"
  | "vine-loose"
  | "shutter-pop"
  | "dossier-snap"
  | "selfie-flash"
  | "drone-kick"
  | "palette-loose"
  | "vine-creak";

export type WeaponColors = {
  body: string;
  accent: string;
  metal: string;
};

/** Grip is the hand. Muzzle is the tip relative to that grip. Positive x is forward. Negative y is up. */
export type HeroWeapon = {
  id: string;
  type: WeaponType;
  motion: AttackMotion;
  colors: WeaponColors;
  grip: WeaponGrip;
  /** Ready hold, plate pixels. The near hand sits on this point. */
  anchor: { x: number; y: number };
  muzzle: { x: number; y: number };
  /** How far walk, hurt, cast, and victory nudge this weapon. */
  tune: { bob: number; drop: number; cast: number; win: number };
  /**
   * The hero sheet or plate already shows this weapon in a hand.
   * The overlay is skipped so a second gun is not drawn on top.
   */
  inArt?: boolean;
};

export type WeaponDraw = {
  x: number;
  y: number;
  angle: number;
  span: number;
};

/**
 * Procedural hand, plate pixels, after the foot-anchored scale.
 * y -20 lands on the painted hand. Stephen Hocking's rail sits a little lower, in the chair.
 */
const HAND = { x: 15, y: -20 };
const SEAT = { x: 14, y: -17 };

export const HERO_WEAPONS: Readonly<Record<string, HeroWeapon>> = {
  "maga-alexgroans": {
    id: "maga-alexgroans",
    type: "nerf-launcher",
    motion: "nerf-brace",
    colors: { body: "#3aa0ff", accent: "#ff8a1e", metal: "#ffd24a" },
    grip: "one",
    anchor: { x: 18, y: -46 },
    muzzle: { x: 22, y: 0 },
    tune: { bob: 1, drop: 3, cast: 4, win: 6 },
  },
  "maga-rogentor": {
    id: "maga-rogentor",
    type: "boom",
    motion: "boom-pop",
    colors: { body: "#3a2c1c", accent: "#c9a24a", metal: "#d8c6a4" },
    grip: "two",
    anchor: { ...HAND, x: 14 },
    muzzle: { x: 18, y: -2 },
    tune: { bob: 1, drop: 4, cast: 5, win: 7 },
  },
  "maga-brander": {
    id: "maga-brander",
    type: "lion-staff",
    motion: "lion-thrust",
    colors: { body: "#6b4226", accent: "#f0c14a", metal: "#8a6848" },
    grip: "two",
    anchor: { ...HAND, x: 12 },
    muzzle: { x: 8, y: -20 },
    tune: { bob: 1, drop: 3, cast: 6, win: 8 },
  },
  "maga-hooli": {
    id: "maga-hooli",
    type: "stud-carbine",
    motion: "stud-kick",
    colors: { body: "#1a1214", accent: "#ff4da6", metal: "#c8c4bc" },
    grip: "two",
    anchor: { ...HAND, x: 13 },
    muzzle: { x: 26, y: -1 },
    tune: { bob: 1, drop: 5, cast: 3, win: 5 },
    inArt: true,
  },
  "lw-odramma": {
    id: "lw-odramma",
    type: "prompter",
    motion: "prompter-raise",
    colors: { body: "#1a3a6e", accent: "#f0c14a", metal: "#7ec8ff" },
    grip: "one",
    anchor: { ...HAND, x: 16 },
    muzzle: { x: 14, y: -6 },
    tune: { bob: 1, drop: 3, cast: 7, win: 8 },
  },
  "lw-harass": {
    id: "lw-harass",
    type: "podium",
    motion: "podium-pop",
    colors: { body: "#4a2c6e", accent: "#f4efe4", metal: "#e6c56a" },
    grip: "one",
    anchor: { ...HAND, x: 16 },
    muzzle: { x: 10, y: -12 },
    tune: { bob: 1, drop: 2, cast: 6, win: 9 },
  },
  "lw-hocking": {
    id: "lw-hocking",
    type: "rail",
    motion: "rail-loose",
    colors: { body: "#141820", accent: "#7ee7ff", metal: "#9aa4b2" },
    grip: "two",
    anchor: SEAT,
    muzzle: { x: 28, y: 0 },
    tune: { bob: 0, drop: 2, cast: 3, win: 4 },
  },
  "lw-youngturkey": {
    id: "lw-youngturkey",
    type: "horn",
    motion: "horn-kick",
    colors: { body: "#14663c", accent: "#f4fff6", metal: "#102018" },
    grip: "two",
    anchor: { ...HAND, x: 14 },
    muzzle: { x: 18, y: -2 },
    tune: { bob: 2, drop: 4, cast: 4, win: 6 },
  },
  "lw-vakxie": {
    id: "lw-vakxie",
    type: "pipette",
    motion: "pipette-plunge",
    colors: { body: "#e7fff3", accent: "#3dcc6a", metal: "#7f98a0" },
    grip: "two",
    anchor: { ...HAND, x: 15 },
    muzzle: { x: 22, y: 0 },
    tune: { bob: 1, drop: 3, cast: 4, win: 5 },
  },
  "lw-climate": {
    id: "lw-climate",
    type: "vine-crossbow",
    motion: "vine-loose",
    colors: { body: "#4a5c32", accent: "#8fd18a", metal: "#efe6d6" },
    grip: "two",
    anchor: { ...HAND, x: 13 },
    muzzle: { x: 20, y: 0 },
    tune: { bob: 1, drop: 3, cast: 4, win: 6 },
  },
  "lw-journalist": {
    id: "lw-journalist",
    type: "camera",
    motion: "shutter-pop",
    colors: { body: "#1a1c1e", accent: "#e23b3b", metal: "#d5d8dc" },
    grip: "two",
    anchor: { ...HAND, x: 14 },
    muzzle: { x: 18, y: 0 },
    tune: { bob: 1, drop: 4, cast: 3, win: 5 },
  },
  "wild-enigma": {
    id: "wild-enigma",
    type: "dossier",
    motion: "dossier-snap",
    colors: { body: "#121216", accent: "#c9a24a", metal: "#efe6d6" },
    grip: "two",
    anchor: { ...HAND, x: 14 },
    muzzle: { x: 16, y: -2 },
    tune: { bob: 1, drop: 3, cast: 5, win: 6 },
  },
  "wild-dynasty": {
    id: "wild-dynasty",
    type: "flash",
    motion: "selfie-flash",
    colors: { body: "#ff6fae", accent: "#fff6e4", metal: "#ffd24a" },
    grip: "one",
    anchor: { ...HAND, x: 16 },
    muzzle: { x: 14, y: -2 },
    tune: { bob: 2, drop: 3, cast: 5, win: 8 },
    inArt: true,
  },
  "wild-butter": {
    id: "wild-butter",
    type: "drone",
    motion: "drone-kick",
    colors: { body: "#102820", accent: "#69f0ae", metal: "#d7ffe8" },
    grip: "two",
    anchor: { ...HAND, x: 13 },
    muzzle: { x: 16, y: -8 },
    tune: { bob: 1, drop: 3, cast: 4, win: 6 },
    inArt: true,
  },
  "wild-cezanne": {
    id: "wild-cezanne",
    type: "palette",
    motion: "palette-loose",
    colors: { body: "#8a5a32", accent: "#ce93d8", metal: "#f48fb1" },
    grip: "two",
    anchor: { ...HAND, x: 14 },
    muzzle: { x: 18, y: -1 },
    tune: { bob: 1, drop: 3, cast: 5, win: 7 },
  },
  "wild-vegan": {
    id: "wild-vegan",
    type: "vine-bow",
    motion: "vine-creak",
    colors: { body: "#5c8a3a", accent: "#c8f5a0", metal: "#efe6d6" },
    grip: "two",
    anchor: { ...HAND, x: 14 },
    muzzle: { x: 16, y: -2 },
    tune: { bob: 1, drop: 3, cast: 5, win: 7 },
  },
};

export function heroWeapon(id: string): HeroWeapon | undefined {
  return HERO_WEAPONS[id];
}

/** The 128-bit weapon overlays are off. Sheets and plates keep whatever they already show. */
export function weaponOverlayDrawn(_id: string): boolean {
  return false;
}

/** Near hand for a one-hand weapon. Both hands when the grip is two. */
export function weaponGripsHand(_id: string, _near: boolean): boolean {
  return false;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Three poses: shot at 0, follow-through at 0.5, ready hold at 1. */
function segment(phase: number, fire: WeaponDraw, peak: WeaponDraw, ready: WeaponDraw): WeaponDraw {
  const t = phase <= 0.5 ? phase / 0.5 : (phase - 0.5) / 0.5;
  const from = phase <= 0.5 ? fire : peak;
  const to = phase <= 0.5 ? peak : ready;
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    angle: lerp(from.angle, to.angle, t),
    span: lerp(from.span, to.span, t),
  };
}

function clampPhase(phase: number): number {
  if (phase < 0) return 0;
  if (phase > 1) return 1;
  return phase;
}

/** Foam launcher braces forward, then kicks back into the shoulder. */
function nerfBrace(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 30, y: -34, angle: -0.08, span: 0 },
    { x: 12, y: -26, angle: 0.42, span: 1 },
    { x: 18, y: -46, angle: 0, span: 0 },
  );
}

/** Boom mic leans into the bit, then pops back to the chest. */
function boomPop(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 22, y: -24, angle: -0.55, span: 1 },
    { x: 8, y: -14, angle: 0.28, span: 0.1 },
    { x: 14, y: -20, angle: -0.12, span: 0.25 },
  );
}

/** Lion staff plants, then thrusts the mane forward. Peak is the lunge. */
function lionThrust(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 8, y: -28, angle: -1.15, span: 0 },
    { x: 22, y: -12, angle: -0.35, span: 1 },
    { x: 12, y: -20, angle: -0.7, span: 0.2 },
  );
}

/** Studded carbine stays level for the shot, then the muzzle climbs. */
function studKick(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 18, y: -20, angle: 0.02, span: 0 },
    { x: 6, y: -28, angle: -0.72, span: 1 },
    { x: 13, y: -20, angle: -0.04, span: 0 },
  );
}

/** Prompter lifts to the mouth, then punches the slate forward. */
function prompterRaise(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 10, y: -30, angle: -0.95, span: 1 },
    { x: 22, y: -16, angle: -0.12, span: 0 },
    { x: 16, y: -20, angle: -0.45, span: 0.35 },
  );
}

/** Podium mic rises off the stand and pops. */
function podiumPop(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 14, y: -18, angle: -0.2, span: 0.2 },
    { x: 12, y: -32, angle: -1.05, span: 1 },
    { x: 16, y: -20, angle: -0.35, span: 0.15 },
  );
}

/** Seated rail levels and looses, then sinks back across the lap. */
function railLoose(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 22, y: -17, angle: 0.02, span: 1 },
    { x: 10, y: -12, angle: -0.4, span: 0 },
    { x: 14, y: -17, angle: 0.06, span: 0.2 },
  );
}

/** Horn plants low, then the kick throws the bell up. */
function hornKick(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 12, y: -10, angle: 0.45, span: 0 },
    { x: 20, y: -24, angle: -0.7, span: 1 },
    { x: 14, y: -20, angle: -0.15, span: 0.2 },
  );
}

/** Plunger drives forward on the shot, then draws back. */
function pipettePlunge(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 20, y: -20, angle: 0.04, span: 1 },
    { x: 10, y: -22, angle: -0.22, span: 0 },
    { x: 15, y: -20, angle: 0, span: 0.35 },
  );
}

/** Branch crossbow holds level, string back, then snaps. */
function vineLoose(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 10, y: -20, angle: -0.02, span: 1 },
    { x: 18, y: -20, angle: 0.08, span: 0 },
    { x: 13, y: -20, angle: 0, span: 0.45 },
  );
}

/** Camera rises to the eye and the shutter pops, then drops. */
function shutterPop(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 16, y: -26, angle: -0.08, span: 1 },
    { x: 8, y: -14, angle: 0.48, span: 0 },
    { x: 14, y: -20, angle: -0.02, span: 0.1 },
  );
}

/** Dossier opens flat on the shot, then snaps shut overhead. */
function dossierSnap(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 16, y: -18, angle: 0.05, span: 1 },
    { x: 8, y: -28, angle: -0.85, span: 0 },
    { x: 14, y: -20, angle: -0.2, span: 0.15 },
  );
}

/** Selfie stick extends, flashes, then tucks to the cheek. */
function selfieFlash(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 26, y: -22, angle: -0.18, span: 1 },
    { x: 8, y: -16, angle: 0.55, span: 0 },
    { x: 16, y: -20, angle: -0.08, span: 0.2 },
  );
}

/** Drone pad plants, then kicks the drone off the nose. */
function droneKick(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 12, y: -14, angle: 0.2, span: 0 },
    { x: 18, y: -26, angle: -0.8, span: 1 },
    { x: 13, y: -20, angle: -0.1, span: 0.15 },
  );
}

/** Palette bow draws the brush to the cheek, then looses it. */
function paletteLoose(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 8, y: -24, angle: -0.6, span: 1 },
    { x: 20, y: -18, angle: 0.05, span: 0 },
    { x: 14, y: -20, angle: -0.25, span: 0.4 },
  );
}

/** Vine bow creaks open on the draw, then the string snaps home. */
function vineCreak(phase: number): WeaponDraw {
  return segment(
    phase,
    { x: 9, y: -23, angle: -0.35, span: 1 },
    { x: 17, y: -16, angle: 0.22, span: 0 },
    { x: 14, y: -20, angle: -0.08, span: 0.3 },
  );
}

const MOTIONS: Readonly<Record<AttackMotion, (phase: number) => WeaponDraw>> = {
  "nerf-brace": nerfBrace,
  "boom-pop": boomPop,
  "lion-thrust": lionThrust,
  "stud-kick": studKick,
  "prompter-raise": prompterRaise,
  "podium-pop": podiumPop,
  "rail-loose": railLoose,
  "horn-kick": hornKick,
  "pipette-plunge": pipettePlunge,
  "vine-loose": vineLoose,
  "shutter-pop": shutterPop,
  "dossier-snap": dossierSnap,
  "selfie-flash": selfieFlash,
  "drone-kick": droneKick,
  "palette-loose": paletteLoose,
  "vine-creak": vineCreak,
};

/** Attack-clock pose. Phase 0 is the shot. Phase 1 is ready. */
export function weaponDrawParams(motion: AttackMotion, phase: number): WeaponDraw {
  return MOTIONS[motion](clampPhase(phase));
}

function holdDraw(spec: HeroWeapon, pose: string, frame: number): WeaponDraw {
  const ready = weaponDrawParams(spec.motion, 1);
  const tune = spec.tune;
  if (pose === "walk" || pose === "run") {
    const bob = (frame % 2 === 0 ? 1 : -1) * tune.bob;
    return { ...ready, x: ready.x + bob, y: ready.y - Math.abs(bob) };
  }
  if (pose === "hurt") {
    return { ...ready, x: ready.x - tune.drop, y: ready.y + tune.drop * 0.5, angle: ready.angle + 0.2 };
  }
  if (pose === "cast" || pose === "ult") {
    return { ...ready, y: ready.y - tune.cast, angle: ready.angle - 0.4, span: Math.min(1, ready.span + 0.35) };
  }
  if (pose === "victory") {
    return { ...ready, y: ready.y - tune.win, angle: ready.angle - 0.75, span: 0.25 };
  }
  return ready;
}

function placedDraw(spec: HeroWeapon, pose: string, frame: number, phase: number): WeaponDraw {
  if (pose === "attack") return weaponDrawParams(spec.motion, phase);
  return holdDraw(spec, pose, frame);
}

function tipOf(draw: WeaponDraw, muzzle: { x: number; y: number }): { x: number; y: number } {
  const cos = Math.cos(draw.angle);
  const sin = Math.sin(draw.angle);
  return {
    x: draw.x + muzzle.x * cos - muzzle.y * sin,
    y: draw.y + muzzle.x * sin + muzzle.y * cos,
  };
}

/**
 * Muzzle in world space. Basic shots leave from the attack pose.
 * Alex's launcher keeps nerfMuzzle, including Hot Mic and Truth Bomb.
 */
export function heroWeaponMuzzle(
  id: string,
  x: number,
  y: number,
  face: number,
  pose = "idle",
  phase = 0,
): { x: number; y: number } {
  const spec = heroWeapon(id);
  if (!spec) return { x, y };
  if (spec.type === "nerf-launcher") return nerfMuzzle(x, y, face, pose === "attack" ? "attack" : "idle");
  const draw = placedDraw(spec, pose, 0, phase);
  const tip = tipOf(draw, spec.muzzle);
  const scaled = scaleSuppliedOffset(Math.cos(face) * tip.x, tip.y + Math.sin(face) * 4);
  return { x: x + scaled.x, y: y + scaled.y };
}

/** 128-bit weapon overlays are off. The hero picture is left as it is. */
export function drawHeroWeapon(
  _ctx: CanvasRenderingContext2D,
  _heroId: string,
  _x: number,
  _y: number,
  _flip: number,
  _pose = "idle",
  _frame = 0,
  _phase = 0,
): void {}
