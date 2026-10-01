/**
 * Which jungle camp to walk, using the camps and routes the map already has.
 * Empty camps are never a destination. Lane heroes stay on a lane emergency.
 */

import { routeBetween, type RouteLink } from "./routeGraph.ts";

export type CampSide = "home" | "away";

export type CampSpot = {
  id: string;
  x: number;
  y: number;
  side: CampSide;
  live: boolean;
  /** A seen enemy hero is standing on this camp. */
  threatened?: boolean;
};

export type CampQuery = {
  x: number;
  y: number;
  side: CampSide;
  jungler: boolean;
  /** The lane still needs this hero. Junglers ignore it. */
  laneEmergency: boolean;
  camps: readonly CampSpot[];
  stickyId?: string;
  /** Lane heroes only take a camp close to where they already stand. */
  nearbyOnly?: boolean;
  nearby?: number;
};

const NEARBY = 900;

/** Nearest live camp on this side. A closer live camp wins over a walk across the map. */
export function pickLiveCamp(q: CampQuery): CampSpot | null {
  if (!q.jungler && q.laneEmergency) return null;
  const near = q.nearby ?? NEARBY;
  const pool = q.camps.filter((c) => {
    if (c.side !== q.side || !c.live || c.threatened) return false;
    if (q.nearbyOnly && Math.hypot(c.x - q.x, c.y - q.y) > near) return false;
    return true;
  });
  if (pool.length === 0) return null;
  let nearest = pool[0]!;
  let best = Infinity;
  for (const c of pool) {
    const d = Math.hypot(c.x - q.x, c.y - q.y);
    if (d < best) {
      best = d;
      nearest = c;
    }
  }
  if (q.stickyId) {
    const sticky = pool.find((c) => c.id === q.stickyId);
    if (sticky) {
      const sd = Math.hypot(sticky.x - q.x, sticky.y - q.y);
      if (sd <= best * 1.35 + 120) return sticky;
    }
  }
  return nearest;
}

/** Back track or jungle cut. A fountain hop is not a woods path. */
export function isJungleNode(id: string): boolean {
  return id.startsWith("cut-") || id.startsWith("track-");
}

/** Graph walk from a lane entrance to a camp. Intermediate jungle nodes stay on it. */
export function junglerPath(links: readonly RouteLink[], from: string, campId: string): string[] {
  return routeBetween(links, from, campId);
}
