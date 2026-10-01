/**
 * Seats inside the painted fountain pool. The match draws that water at radius 136.
 * Five heroes sit on one ring so the bodies do not share a point.
 */

export const POOL_RADIUS = 136;

/** Inside the water, outside the fountain cap, farther apart than two hit circles. */
export const POOL_SPAWN_RING = 56;

export type SpawnPt = { x: number; y: number };

/** Deterministic seat. Index 0 is north of the fountain. The same index always returns the same offset. */
export function poolSpawn(origin: SpawnPt, index: number, seats = 5): SpawnPt {
  const n = Math.max(1, seats);
  const i = ((index % n) + n) % n;
  const angle = -Math.PI / 2 + (i * Math.PI * 2) / n;
  return {
    x: origin.x + Math.cos(angle) * POOL_SPAWN_RING,
    y: origin.y + Math.sin(angle) * POOL_SPAWN_RING,
  };
}
