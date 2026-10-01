/**
 * Lane towers. Ancients and fountains copy this height. Creeps stay at their own sizes.
 * Height is Trump's painted size (TRUMP_DRAW_HEIGHT times heroDrawScale) times 1.12, then 5% taller.
 * Feet stay on LANE_TOWER_FOOT. Body, muzzle, smoke, shadow, and click radius follow the scale.
 */

import { heroDrawScale, TRUMP_DRAW_HEIGHT, TRUMP_HERO_ID } from "./heroHeight.ts";

/** Previous plate was 1.12 times Trump as he is painted. This pass is 5% taller than that. */
const PREVIOUS_OVER_TRUMP = 1.12;
const TOWER_SIZE_BUMP = 1.05;

/** One height for every lane tower, every tier, both teams. Feet stay; the extra height grows up. */
export const LANE_TOWER_HEIGHT = TRUMP_DRAW_HEIGHT * heroDrawScale(TRUMP_HERO_ID) * PREVIOUS_OVER_TRUMP * TOWER_SIZE_BUMP;

/**
 * Old outer plate was 104. Body, click radius, muzzle, and smoke use this one scale
 * so a single tower size stays proportional. Attack range is not this number.
 */
const OUTER_BASE_HEIGHT = 104;
const OUTER_BASE_BODY = 25;
const OUTER_BASE_RADIUS = 24;

export const LANE_TOWER_SCALE = LANE_TOWER_HEIGHT / OUTER_BASE_HEIGHT;

export type LaneTier = "outer" | "middle" | "inner";

export function laneTowerTier(tier?: string): LaneTier {
  if (tier === "inner" || tier === "middle") return tier;
  return "outer";
}

/** Plate height. The same for every tier. Width follows the picture. */
export function laneTowerDrawHeight(tier?: string): number {
  void tier;
  return LANE_TOWER_HEIGHT;
}

/** Bottom of the plate relative to the tower's world point. Unchanged so the base stays on the pad. */
export const LANE_TOWER_FOOT = 16;

export function laneTowerCrown(y: number, tier?: string): number {
  return y + LANE_TOWER_FOOT - laneTowerDrawHeight(tier);
}

export function laneTowerBody(tier?: string): number {
  void tier;
  return OUTER_BASE_BODY * LANE_TOWER_SCALE;
}

export function laneTowerRadius(tier?: string): number {
  void tier;
  return OUTER_BASE_RADIUS * LANE_TOWER_SCALE;
}

/** Attack flash and the shot leave this point. It sits on the tower, not on the ground. */
export function laneTowerMuzzle(x: number, y: number, home: boolean): { x: number; y: number } {
  const side = home ? 1 : -1;
  return {
    x: x + side * 22 * LANE_TOWER_SCALE,
    y: y - 36 * LANE_TOWER_SCALE,
  };
}

export function laneTowerSmokeY(y: number): number {
  return y - 28 * LANE_TOWER_SCALE;
}
