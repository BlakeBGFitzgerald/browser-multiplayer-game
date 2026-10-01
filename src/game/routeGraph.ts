/** Lightweight routes over points the map already has. No grid, no NavMesh. */

export type RouteNode = {
  id: string;
  x: number;
  y: number;
};

export type RouteLink = {
  a: string;
  b: string;
};

/** Sequential hops along one polyline. An intermediate id stays on the path. */
export function linkChain(ids: readonly string[]): RouteLink[] {
  const links: RouteLink[] = [];
  for (let i = 1; i < ids.length; i++) links.push({ a: ids[i - 1]!, b: ids[i]! });
  return links;
}

/**
 * Shortest hop list on an undirected graph.
 * When a lane has a middle node, the result includes it. It is not a single A→C jump.
 */
export function routeBetween(links: readonly RouteLink[], start: string, goal: string): string[] {
  if (start === goal) return [start];
  const adj = new Map<string, string[]>();
  const add = (a: string, b: string) => {
    const list = adj.get(a);
    if (list) list.push(b);
    else adj.set(a, [b]);
  };
  for (const link of links) {
    add(link.a, link.b);
    add(link.b, link.a);
  }
  const prev = new Map<string, string | null>();
  const queue: string[] = [start];
  prev.set(start, null);
  let found = false;
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === goal) {
      found = true;
      break;
    }
    for (const nxt of adj.get(cur) ?? []) {
      if (prev.has(nxt)) continue;
      prev.set(nxt, cur);
      queue.push(nxt);
    }
  }
  if (!found) return [start];
  const out: string[] = [];
  let cur: string | null = goal;
  while (cur) {
    out.push(cur);
    cur = prev.get(cur) ?? null;
  }
  out.reverse();
  return out;
}

export function nearestRouteNode(nodes: readonly RouteNode[], x: number, y: number): RouteNode {
  let best = nodes[0]!;
  let bestD = Infinity;
  for (const n of nodes) {
    const dx = n.x - x;
    const dy = n.y - y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}
