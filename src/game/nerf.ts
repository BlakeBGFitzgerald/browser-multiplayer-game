/** Toy foam launcher for Alex Groans. The hero plate is not edited. */

import { scaleSuppliedOffset } from "./heroHeight.ts";

export const ALEX_GROANS_ID = "maga-alexgroans";

/** Basic-attack event. The foam rocket leaves when the launcher is braced. */
export const AlexRocketFire = "AlexRocketFire";

/** Seconds into the swing when AlexRocketFire happens. After the raise, before recoil. */
export const ALEX_ROCKET_FIRE = 0.18;

/**
 * Recoil settles and the volley clock stops.
 * Independent of Hooli's burst end.
 */
export const ALEX_ROCKET_END = 0.46;

/** Attack-cycle frame that suppliedArt maps to cell 0, the raised firing pose. */
const ALEX_FIRE_FRAME = 4;

export function alexMuzzleOn(age: number): boolean {
  return age >= ALEX_ROCKET_FIRE && age < ALEX_ROCKET_FIRE + 0.042;
}

/**
 * Raise into the aim, then attack-0 at AlexRocketFire, then recoil.
 * The lean is a few degrees, foot-anchored, and level when the rocket leaves.
 */
export function alexRocketPresentation(age: number): { pose: "idle" | "attack"; frame: number; lean: number } {
  if (age < ALEX_ROCKET_FIRE) {
    const t = Math.max(0, age) / ALEX_ROCKET_FIRE;
    return { pose: "idle", frame: 0, lean: -0.1 * (1 - t) };
  }
  const span = Math.max(0.001, ALEX_ROCKET_END - ALEX_ROCKET_FIRE);
  const t = Math.max(0, Math.min(0.999, (age - ALEX_ROCKET_FIRE) / span));
  return { pose: "attack", frame: ALEX_FIRE_FRAME + Math.floor(t * 8), lean: 0 };
}

export type NerfColor = "nerf-blue" | "nerf-orange";

export type ShotAmmo = "can" | "bottle" | NerfColor;

const BLUE = "#3aa0ff";
const ORANGE = "#ff8a1e";
const TIP = "#ffd24a";
const INK = "#142033";

export function isNerfColor(ammo: string | undefined): ammo is NerfColor {
  return ammo === "nerf-blue" || ammo === "nerf-orange";
}

export function asShotAmmo(raw: string | undefined): ShotAmmo | undefined {
  if (raw === "can" || raw === "bottle" || raw === "nerf-blue" || raw === "nerf-orange") return raw;
  return undefined;
}

/** Blue, then orange, then blue. */
export function nextNerfColor(previous: NerfColor | undefined): NerfColor {
  return previous === "nerf-blue" ? "nerf-orange" : "nerf-blue";
}

/**
 * Muzzle in world space. The launcher sits in the forward hand.
 * Offsets were authored on the 96 plate. They scale with the taller body, feet fixed.
 */
export function nerfMuzzle(x: number, y: number, face: number, pose = "idle"): { x: number; y: number } {
  const reach = pose === "attack" ? 40 : 30;
  const scaled = scaleSuppliedOffset(Math.cos(face) * reach, -34 + Math.sin(face) * 8);
  return { x: x + scaled.x, y: y + scaled.y };
}

/** Chunky plastic blaster. Drawn in hero space; flip is the facing scale. */
export function drawNerfLauncher(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: number,
  pose = "idle",
  frame = 0,
): void {
  const reach = pose === "attack" ? 30 : pose === "walk" ? 20 + (frame % 2) : 18;
  const lift = pose === "attack" ? 30 : 46 - (pose === "walk" ? frame % 3 : 0);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(flip < 0 ? -1 : 1, 1);
  ctx.translate(reach, -lift);
  ctx.fillStyle = INK;
  ctx.fillRect(-8, -7, 28, 14);
  ctx.fillStyle = BLUE;
  ctx.fillRect(-6, -5, 22, 10);
  ctx.fillStyle = TIP;
  ctx.fillRect(2, -5, 4, 10);
  ctx.fillStyle = ORANGE;
  ctx.fillRect(14, -6, 8, 12);
  ctx.fillStyle = "#fff6e4";
  ctx.fillRect(-4, -3, 6, 2);
  ctx.fillStyle = INK;
  ctx.fillRect(-2, 5, 6, 5);
  ctx.restore();
}

/** Small foam dart. A short same-color trail sits behind the nose. */
export function drawNerfRocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tx: number,
  ty: number,
  color: NerfColor,
): void {
  const ang = Math.atan2(ty - y, tx - x);
  const foam = color === "nerf-blue" ? BLUE : ORANGE;
  const nose = color === "nerf-blue" ? "#d7f1ff" : TIP;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = foam;
  for (let i = 1; i <= 4; i++) {
    ctx.globalAlpha = 0.35 - i * 0.07;
    ctx.fillRect(-8 - i * 4, i % 2 === 0 ? -2 : 0, 3, 2);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = INK;
  ctx.fillRect(-7, -4, 16, 8);
  ctx.fillStyle = foam;
  ctx.fillRect(-6, -3, 12, 6);
  ctx.fillStyle = nose;
  ctx.fillRect(6, -2, 3, 4);
  ctx.fillRect(9, -1, 2, 2);
  ctx.fillStyle = color === "nerf-blue" ? ORANGE : BLUE;
  ctx.fillRect(-6, -4, 3, 2);
  ctx.fillRect(-6, 2, 3, 2);
  ctx.restore();
}
