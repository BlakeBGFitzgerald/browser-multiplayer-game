/**
 * Sgt. Slush's packed-snow basic. One hero.
 * The volley clock is the same swing path Alex's rocket uses.
 * Death and stun are decided before this pose. Run arms lose while it is up.
 */

import { heroDrawScale, SNOWBALL_HERO_ID } from "./heroHeight.ts";

export { SNOWBALL_HERO_ID };

/** Basic-attack event. The snowball leaves the hand on this beat. */
export const SnowballRelease = "SnowballRelease";

/** Seconds into the swing when the hand lets go. After the cock, before follow-through. */
export const SNOWBALL_RELEASE = 0.28;

/** Follow-through settles and the volley clock stops. */
export const SNOWBALL_END = 0.62;

/** Attack frame whose hand offset is the spawn point. */
export const SNOW_RELEASE_FRAME = 6;

export type SnowPhase = "form" | "cock" | "swing" | "release" | "follow";

export function snowballFrame(age: number): number {
  const t = Math.max(0, age);
  if (t < 0.06) return 0;
  if (t < 0.12) return 1;
  if (t < 0.17) return 2;
  if (t < 0.22) return 3;
  if (t < 0.25) return 4;
  if (t < SNOWBALL_RELEASE) return 5;
  if (t < SNOWBALL_RELEASE + 0.05) return SNOW_RELEASE_FRAME;
  if (t < 0.4) return 7;
  if (t < 0.5) return 8;
  return 9;
}

export function snowballPhase(frame: number): SnowPhase {
  if (frame <= 1) return "form";
  if (frame <= 3) return "cock";
  if (frame <= 5) return "swing";
  if (frame === SNOW_RELEASE_FRAME) return "release";
  return "follow";
}

export function snowballPresentation(age: number): { pose: "attack"; frame: number } {
  return { pose: "attack", frame: snowballFrame(age) };
}

export function snowballReleaseOn(age: number): boolean {
  return age >= SNOWBALL_RELEASE && age < SNOWBALL_RELEASE + 0.05;
}

/**
 * Hand in full-size pixels. +x is forward. -y is up.
 * The draw scale shrinks this with the plate.
 */
export function snowballHandLocal(frame: number): { x: number; y: number } {
  switch (snowballPhase(frame)) {
    case "form":
      return { x: 12, y: -18 };
    case "cock":
      return { x: -8, y: -24 };
    case "swing":
      return { x: 18, y: -16 };
    case "release":
      return { x: 30, y: -12 };
    case "follow":
      return { x: 36, y: -4 };
  }
}

/** World offset from the unit origin. Release is not the origin. */
export function snowballHandOffset(frame: number): { x: number; y: number } {
  const hand = snowballHandLocal(frame);
  const scale = heroDrawScale(SNOWBALL_HERO_ID);
  return { x: hand.x * scale, y: hand.y * scale };
}

/** Spawn at the throwing hand. Forward follows facing. The lift stays above the feet. */
export function snowballSpawn(
  x: number,
  y: number,
  face: number,
  frame = SNOW_RELEASE_FRAME,
): { x: number; y: number } {
  const hand = snowballHandOffset(frame);
  return {
    x: x + Math.cos(face) * hand.x,
    y: y + hand.y + Math.sin(face) * Math.abs(hand.x) * 0.2,
  };
}

export type SnowPose = "death" | "attack" | "walk" | "idle";

/**
 * Death, then stun, then the throw, then walk, then idle.
 * A stun or a death never shows the throw.
 */
export function snowballBodyPose(input: {
  dead: boolean;
  stunned: boolean;
  age: number;
  running: boolean;
}): SnowPose {
  if (input.dead) return "death";
  if (input.stunned) return "idle";
  if (input.age > 0 && input.age < SNOWBALL_END) return "attack";
  if (input.running) return "walk";
  return "idle";
}

/** The throw replaces run arms. Stun and death do not take the throwing arm. */
export function snowballArmLayer(input: {
  dead: boolean;
  stunned: boolean;
  age: number;
  running: boolean;
}): "attack" | "run" | "idle" {
  if (input.dead || input.stunned) return "idle";
  if (input.age > 0 && input.age < SNOWBALL_END) return "attack";
  if (input.running) return "run";
  return "idle";
}
