import { PLAYERS_PER_TEAM } from "../lobby";
import { AI_FREE_HEROES, AI_HERO_POOL, heroById, isDevAiOnlyHero, isPlayable, matchKits } from "./heroes";

/** Why an official pick was refused. */
export type PickReason = "already-picked" | "invalid" | "locked";

export type PickResult =
  | { ok: true; heroId: string; seat: string }
  | { ok: false; reason: PickReason; heroId: string; seat: string };

export type PickOrder = {
  seat: string;
  heroId: string;
  human?: boolean;
  allowDevAi?: boolean;
};

/**
 * One match's hero reservations. Empty after clear(), which is a new match.
 * The same hero id cannot sit on two seats. Disconnect does not release.
 */
export class MatchDraft {
  private readonly bySeat = new Map<string, string>();
  private readonly byHero = new Map<string, string>();

  clear(): void {
    this.bySeat.clear();
    this.byHero.clear();
  }

  heroOf(seat: string): string {
    return this.bySeat.get(seat) ?? "";
  }

  ownerOf(heroId: string): string {
    return this.byHero.get(heroId) ?? "";
  }

  takenIds(): string[] {
    return [...this.byHero.keys()];
  }

  takenByOther(heroId: string, seat: string): boolean {
    const owner = this.byHero.get(heroId);
    return !!owner && owner !== seat;
  }

  /**
   * Official accept. Same seat may repick: the old id is freed and the new one reserved.
   * A second seat asking for an id already reserved is refused.
   */
  accept(seat: string, heroId: string, opts: { human?: boolean; allowDevAi?: boolean } = {}): PickResult {
    if (!isPlayable(heroId)) return { ok: false, reason: "invalid", heroId, seat };
    if (opts.human && isDevAiOnlyHero(heroId) && !opts.allowDevAi) {
      return { ok: false, reason: "locked", heroId, seat };
    }
    const owner = this.byHero.get(heroId);
    if (owner && owner !== seat) return { ok: false, reason: "already-picked", heroId, seat };
    const prev = this.bySeat.get(seat);
    if (prev === heroId) return { ok: true, heroId, seat };
    if (prev) this.byHero.delete(prev);
    this.bySeat.set(seat, heroId);
    this.byHero.set(heroId, seat);
    return { ok: true, heroId, seat };
  }

  /** Apply orders in order. The first claim of an id wins; the rest are already-picked. */
  acceptOrders(orders: readonly PickOrder[]): PickResult[] {
    return orders.map((order) =>
      this.accept(order.seat, order.heroId, { human: order.human, allowDevAi: order.allowDevAi }),
    );
  }

  /** An id from pool that this match has not reserved. */
  randomHero(pool: readonly string[], rng: () => number = Math.random): string | null {
    const open: string[] = [];
    const seen = new Set<string>();
    for (const id of pool) {
      if (!isPlayable(id) || this.byHero.has(id) || seen.has(id)) continue;
      seen.add(id);
      open.push(id);
    }
    if (!open.length) return null;
    const n = Math.floor(rng() * open.length);
    return open[Math.min(open.length - 1, Math.max(0, n))] ?? null;
  }

  /** Bot, random fill, or an empty seat. Never takes a reserved id. */
  assignBot(seat: string, pool: readonly string[], rng: () => number = Math.random): PickResult {
    const held = this.bySeat.get(seat);
    if (held) return { ok: true, heroId: held, seat };
    const id = this.randomHero(pool, rng);
    if (!id) return { ok: false, reason: "invalid", heroId: "", seat };
    return this.accept(seat, id);
  }

  /**
   * Timeout hands the seat to AI. A hero already reserved stays.
   * An empty seat rolls from whatever is still open.
   */
  assignTimeout(seat: string, pool: readonly string[], rng: () => number = Math.random): PickResult {
    return this.assignBot(seat, pool, rng);
  }

  /** Disconnect keeps the reservation. Reconnect reads the same id. */
  hold(seat: string): string {
    return this.heroOf(seat);
  }
}

/** Every registered playable kit. DLC is included. New HEROES show up here on their own. */
export function freeBotIds(): string[] {
  return AI_HERO_POOL.map((h) => h.id);
}

/** Free kits first, then the rest of the live list, for a duplicate that must move. */
function replacementIds(): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const h of [...AI_FREE_HEROES, ...AI_HERO_POOL]) {
    if (seen.has(h.id) || !isPlayable(h.id)) continue;
    seen.add(h.id);
    out.push(h.id);
  }
  return out;
}

function takeOpen(draft: MatchDraft, seat: string): string {
  const res = draft.assignBot(seat, replacementIds(), () => 0);
  if (!res.ok || !res.heroId) {
    console.warn(`[draft] no open hero for ${seat}`);
    throw new Error(`[draft] no open hero for ${seat}`);
  }
  return res.heroId;
}

/** Omitted AI seats. Uniform among the registered pool, including DLC. */
function rollOpen(draft: MatchDraft, seat: string): string {
  const res = draft.assignBot(seat, freeBotIds());
  if (!res.ok || !res.heroId) {
    console.warn(`[draft] no open hero for ${seat}`);
    throw new Error(`[draft] no open hero for ${seat}`);
  }
  return res.heroId;
}

function placeSide(draft: MatchDraft, team: string, ids: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < PLAYERS_PER_TEAM; i++) {
    const seat = `${team}-${i}`;
    const raw = ids[i] ?? "";
    if (!isPlayable(raw)) {
      console.warn(`[draft] invalid hero ${raw}; reassigning from the remaining pool`);
      out.push(takeOpen(draft, seat));
      continue;
    }
    const res = draft.accept(seat, raw);
    if (res.ok) {
      out.push(res.heroId);
      continue;
    }
    console.warn(`[draft] duplicate hero ${raw}; reassigning from the remaining pool`);
    out.push(takeOpen(draft, seat));
  }
  return out;
}

/**
 * Heroes for one match. Home keeps the requested ids. Away copies are not used:
 * an omitted away side is filled from whatever is still open, so a normal match
 * does not log a duplicate. Passed duplicates are logged and moved.
 */
export function uniqueSideKits(
  pickId: string,
  homeIds?: readonly string[],
  awayIds?: readonly string[],
): { home: string[]; away: string[] } {
  const draft = new MatchDraft();
  const homeAsked = (homeIds ?? []).slice(0, PLAYERS_PER_TEAM);
  const awayAsked = (awayIds ?? []).slice(0, PLAYERS_PER_TEAM);
  const homeSeed =
    homeAsked.length >= PLAYERS_PER_TEAM ? homeAsked : matchKits(heroById(pickId)).map((h) => h.id);
  const home = placeSide(draft, "home", homeSeed);
  const away =
    awayAsked.length >= PLAYERS_PER_TEAM
      ? placeSide(draft, "away", awayAsked)
      : Array.from({ length: PLAYERS_PER_TEAM }, (_, i) => rollOpen(draft, `away-${i}`));
  return { home, away };
}
