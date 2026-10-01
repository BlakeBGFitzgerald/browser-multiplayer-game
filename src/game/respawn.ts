/**
 * Hero respawn length for the current match.
 *
 * First death keeps the existing timer: `baseRespawnTime + level * 1.6`
 * (the old `6 + level * 1.6`). Each later death of that same hero adds
 * `respawnTimeIncreasePerDeath` seconds. The result never passes
 * `maximumRespawnTime`.
 *
 * respawnTime = min(base + (deathCount - 1) * respawnTimeIncreasePerDeath, maximumRespawnTime)
 * where base is the existing first-death time at that level.
 */

/** Constant term of the existing first-death timer. */
export const baseRespawnTime = 6;

/** Seconds added to that hero's next respawn for each death after the first. */
export const respawnTimeIncreasePerDeath = 2;

/**
 * Hard cap. A level-11 first death is 23.6s, so this sits eight steps above it
 * and also stops a long string of early deaths.
 */
export const maximumRespawnTime = 40;

/** Existing per-level addition. First death must stay `6 + level * 1.6`. */
const RESPAWN_PER_LEVEL = 1.6;

/** Existing first-death seconds at this level. Later deaths add the step on top. */
export function firstDeathSeconds(level: number): number {
  return baseRespawnTime + level * RESPAWN_PER_LEVEL;
}

/** Respawn seconds for this death count at this level. Death 1 is the existing base. */
export function heroRespawnSeconds(deathCount: number, level: number): number {
  const deaths = Math.max(1, deathCount);
  const base = firstDeathSeconds(level);
  return Math.min(base + (deaths - 1) * respawnTimeIncreasePerDeath, maximumRespawnTime);
}

/**
 * Deaths this match, one count per hero. The count survives respawn and
 * returns to zero only when the match resets.
 */
export class DeathCounts {
  private counts = new Map<string, number>();

  count(heroKey: string): number {
    return this.counts.get(heroKey) ?? 0;
  }

  /**
   * Record one death for this hero and return the respawn seconds.
   * Player and AI both call this. A different key is a different hero.
   */
  noteDeath(heroKey: string, level: number): number {
    const deathCount = this.count(heroKey) + 1;
    this.counts.set(heroKey, deathCount);
    return heroRespawnSeconds(deathCount, level);
  }

  /** New match. Every hero's death count starts over. */
  reset(): void {
    this.counts.clear();
  }
}
