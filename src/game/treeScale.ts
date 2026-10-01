/** Vertical scale for bushes. Width and the ground contact stay put. */
export const FOLIAGE_V = 1.75;

/**
 * Trees were already this much taller than bushes (`FOLIAGE_V * TREE_V_PRIOR`).
 * The next bump is applied on top of that current height, not instead of it.
 */
export const TREE_V_PRIOR = 1.2;

/**
 * Extra height on the current tree scale. About 18% taller.
 * Oaks (home / DC) and firs (away / Seattle) share `TREE_V`.
 */
export const TREE_HEIGHT_BUMP = 1.18;

/** Draw height for every woodland tree. Crown width is not part of this scale. */
export const TREE_V = FOLIAGE_V * TREE_V_PRIOR * TREE_HEIGHT_BUMP;

/** Grow a point up from the ground contact. The contact itself stays put. */
export function foliageY(base: number, py: number, scale = FOLIAGE_V): number {
  return base - (base - py) * scale;
}

/** Height only. Width is never passed through here. */
export function foliageH(h: number, scale = FOLIAGE_V): number {
  return h * scale;
}
