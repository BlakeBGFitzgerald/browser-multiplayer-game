/**
 * Lane infantry and lane archers, both teams.
 * Jungle, heroes, towers, ancients, and objective creeps keep their own sizes.
 * Damage, range, attack speed, health, gold, and XP are not this file.
 */

/** Uniform plate scale. Width follows the picture. */
export const LANE_CREEP_SCALE = 1.5;

/** Plate height before the scale. */
const BASE_HEIGHT = 48;

/** Bottom of the plate relative to the creep's world point. Feet stay on the lane. */
export const LANE_CREEP_FOOT = 8;

/** Click and body radius before the scale. Attack range is not this number. */
const BASE_RADIUS = { infantry: 15, archer: 12 } as const;

/**
 * creepPix paints lane infantry and archers into a box this tall, then blits at LANE_CREEP_SCALE.
 * The painted feet sit on the last row of that box.
 */
export const LANE_CREEP_PROC_BASE_HEIGHT = 84;

/** Old procedural foot padding. Click radius may grow; this foot does not. */
const PROC_FOOT_PAD = 6;

export type LaneCreepJob = "infantry" | "archer";

export function laneCreepDrawHeight(): number {
  return BASE_HEIGHT * LANE_CREEP_SCALE;
}

export function laneCreepCrown(y: number): number {
  return y + LANE_CREEP_FOOT - laneCreepDrawHeight();
}

export function laneCreepRadius(job: LaneCreepJob): number {
  return BASE_RADIUS[job] * LANE_CREEP_SCALE;
}

/** Lane jobs grow together. Every other creep role stays at 1. */
export function laneCreepDrawScale(role: string): number {
  return role === "infantry" || role === "archer" ? LANE_CREEP_SCALE : 1;
}

/** Procedural lane feet, from the body radius before the click scale. */
export function laneCreepProcFoot(y: number, archer: boolean): number {
  const base = archer ? BASE_RADIUS.archer : BASE_RADIUS.infantry;
  return y + base + PROC_FOOT_PAD;
}

export function laneCreepProcCrown(y: number, archer: boolean): number {
  return laneCreepProcFoot(y, archer) - LANE_CREEP_PROC_BASE_HEIGHT * LANE_CREEP_SCALE;
}
