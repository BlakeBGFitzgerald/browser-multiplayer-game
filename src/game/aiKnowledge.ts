/**
 * Team vision query shared by AI target picks and the fog draw.
 * Radii come from numbers the match already uses.
 */

import { BATTLEFIELD } from "./battlefield.ts";

export type Sight = { x: number; y: number; r: number };

/** Expert hunt distance already used when an AI hero looks for a fight. */
export const HERO_SIGHT = 520;

/** Lane minions light a shorter disc. Same radius as a ward flare. */
export const MINION_SIGHT = BATTLEFIELD.wardRadius;

/** Towers and ancients. */
export const TOWER_SIGHT = BATTLEFIELD.towerVision;

/** True when any allied sight disc covers the enemy. Outside every disc is unknown. */
export function enemyInTeamVision(enemy: { x: number; y: number }, sights: readonly Sight[]): boolean {
  for (const s of sights) {
    if (!(s.r > 0)) continue;
    const dx = enemy.x - s.x;
    const dy = enemy.y - s.y;
    if (dx * dx + dy * dy <= s.r * s.r) return true;
  }
  return false;
}
