/**
 * One route graph for this quad: fountains, lane polylines, towers, jungle
 * tracks, camp cuts, and the river. Built from the points already in the map.
 */

import { JUNGLE_ROUTES } from "./jungle.ts";
import {
  BACK_TRACKS,
  JUNGLE_CAMPS,
  LANES,
  ancientPos,
  fountain,
  lanePath,
  towers,
  type Lane,
  type Pt,
} from "./map.ts";
import { linkChain, type RouteLink, type RouteNode } from "./routeGraph.ts";

export type MatchGraph = {
  nodes: RouteNode[];
  links: RouteLink[];
  byId: Map<string, RouteNode>;
};

const JOIN = 160;
const CAMP_JOIN = 260;

let cached: MatchGraph | null = null;

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function matchGraph(): MatchGraph {
  if (cached) return cached;
  const nodes: RouteNode[] = [];
  const links: RouteLink[] = [];
  const seen = new Set<string>();

  const add = (id: string, p: Pt): string => {
    if (!seen.has(id)) {
      seen.add(id);
      nodes.push({ id, x: p.x, y: p.y });
    }
    return id;
  };
  const join = (a: string, b: string) => {
    if (!a || !b || a === b) return;
    links.push({ a, b });
  };

  add("fountain-home", fountain.home);
  add("fountain-away", fountain.away);
  add("ancient-home", ancientPos.home);
  add("ancient-away", ancientPos.away);
  join("fountain-home", "ancient-home");
  join("fountain-away", "ancient-away");
  add("river", { x: 1300, y: 1300 });

  for (const lane of LANES) {
    const path = lanePath.home[lane];
    const ids = path.map((p, i) => add(`lane-${lane}-${i}`, p));
    for (const link of linkChain(ids)) join(link.a, link.b);
    const first = ids[0];
    const last = ids[ids.length - 1];
    if (first) join("fountain-home", first);
    if (last) join(last, "fountain-away");
  }

  for (const track of BACK_TRACKS) {
    const ids = track.path.map((p, i) => add(`track-${slug(track.name)}-${i}`, p));
    for (const link of linkChain(ids)) join(link.a, link.b);
  }

  for (const route of JUNGLE_ROUTES) {
    const ids = route.path.map((p, i) => add(`cut-${slug(route.name)}-${i}`, p));
    for (const link of linkChain(ids)) join(link.a, link.b);
  }

  for (const camp of JUNGLE_CAMPS) add(`camp-${slug(camp.name)}`, camp);

  for (const spec of towers) {
    const id = add(`tower-${spec.team}-${spec.lane}-${spec.tier}`, spec.pos);
    let best = "";
    let bestD = 420;
    const lane: Lane = spec.lane;
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length; i++) {
      const p = path[i]!;
      const d = Math.hypot(p.x - spec.pos.x, p.y - spec.pos.y);
      if (d < bestD) {
        bestD = d;
        best = `lane-${lane}-${i}`;
      }
    }
    if (best) join(id, best);
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!;
      const b = nodes[j]!;
      const camp = a.id.startsWith("camp-") || b.id.startsWith("camp-");
      const limit = camp ? CAMP_JOIN : JOIN;
      if (Math.hypot(a.x - b.x, a.y - b.y) <= limit) join(a.id, b.id);
    }
  }

  const byId = new Map<string, RouteNode>();
  for (const n of nodes) byId.set(n.id, n);
  cached = { nodes, links, byId };
  return cached;
}
