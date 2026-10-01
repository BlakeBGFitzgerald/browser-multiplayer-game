/**
 * Strategic jungle. The walk grid is stamped once at startup from these tables.
 * The layout does not roll per match.
 *
 * Add a path: append a JungleRoute. `radius` is the open corridor in pixels.
 *   kind "side" is a narrow cut, "dead" ends in a pocket, "alt" links two areas.
 *   Main roads stay the Grove Walk and Thicket Walk in map.ts.
 * Add a pocket: append a Hideout and a route whose last point is the pocket.
 *   `mouth` is the entrance the tree gap faces. `clear` is open ground.
 * Add a tree line: append a TreeCluster. `gap` is the open angle in radians.
 *   `gapToward` aims that opening. `sight` false blocks movement only.
 * Remove or move: delete the row or change x/y. Then reload.
 * A tree with solid false does not close a walkable cell. It is drawn only
 * when that cell is already blocked, so a painted trunk is never a fake wall.
 * Destruction is not a combat system. Set solid false to retire a trunk.
 * Camps, lanes, fountains, ancients, and the river are kept open in map.ts.
 */

export type Pt = { x: number; y: number };

export type RouteKind = "side" | "dead" | "alt";

export type JungleRoute = {
  name: string;
  kind: RouteKind;
  radius: number;
  path: Pt[];
};

export type Hideout = {
  name: string;
  x: number;
  y: number;
  /** Open radius. Trees sit outside this. */
  clear: number;
  /** Entrance the ring gap faces. */
  mouth: Pt;
};

export type Clearing = {
  name: string;
  x: number;
  y: number;
  clear: number;
  mouth: Pt;
};

export type TreeKind = "oak" | "fir" | "sapling";

export type TreeCluster = {
  name: string;
  x: number;
  y: number;
  ring: number;
  count: number;
  gapToward: Pt;
  /** Full open angle, radians. */
  gap: number;
  fir: boolean;
  kind: TreeKind;
  /** Collision radius. One cell is 50. Stay at or under 26 so a trunk is one cell. */
  trunk: number;
  sight: boolean;
  solid: boolean;
};

export type JungleTree = {
  x: number;
  y: number;
  r: number;
  kind: TreeKind;
  fir: boolean;
  solid: boolean;
  sight: boolean;
  cluster: string;
};

export type Trunk = {
  x: number;
  y: number;
  r: number;
  kind: TreeKind;
  fir: boolean;
  sight: boolean;
  cluster: string;
};

/** Side cuts, dead ends, and one bank link. Main roads live on BACK_TRACKS. */
export const JUNGLE_ROUTES: JungleRoute[] = [
  {
    name: "Mall Cut",
    kind: "side",
    radius: 34,
    path: [
      { x: 520, y: 1740 },
      { x: 500, y: 1640 },
      { x: 620, y: 1560 },
      { x: 720, y: 1520 },
    ],
  },
  {
    name: "Grove Side",
    kind: "side",
    radius: 32,
    path: [
      { x: 620, y: 860 },
      { x: 540, y: 940 },
      { x: 500, y: 980 },
      { x: 460, y: 1120 },
    ],
  },
  {
    name: "Copse Cut",
    kind: "dead",
    radius: 32,
    path: [
      { x: 960, y: 2140 },
      { x: 1060, y: 2040 },
      { x: 1140, y: 1960 },
    ],
  },
  {
    name: "North Spur",
    kind: "dead",
    radius: 30,
    path: [
      { x: 1100, y: 370 },
      { x: 1040, y: 460 },
      { x: 980, y: 560 },
    ],
  },
  {
    name: "Stand Cut",
    kind: "dead",
    radius: 32,
    path: [
      { x: 1820, y: 1820 },
      { x: 1740, y: 1900 },
      { x: 1680, y: 1960 },
    ],
  },
  {
    name: "Elliott Side",
    kind: "side",
    radius: 32,
    path: [
      { x: 1880, y: 1080 },
      { x: 1780, y: 1160 },
      { x: 1700, y: 1240 },
      { x: 1760, y: 1320 },
      { x: 1880, y: 1400 },
    ],
  },
  {
    name: "Fir Nook Cut",
    kind: "dead",
    radius: 30,
    path: [
      { x: 2040, y: 1680 },
      { x: 2100, y: 1640 },
      { x: 2160, y: 1600 },
    ],
  },
  {
    name: "South Bank Cut",
    kind: "alt",
    radius: 32,
    path: [
      { x: 980, y: 1180 },
      { x: 1000, y: 1320 },
      { x: 1360, y: 1580 },
      { x: 1560, y: 1480 },
      { x: 1700, y: 1300 },
    ],
  },
];

/** Pockets with one mouth. Separate so the woods are not one hiding blob. */
export const HIDEOUTS: Hideout[] = [
  { name: "Oak Pocket", x: 500, y: 1640, clear: 68, mouth: { x: 520, y: 1740 } },
  { name: "Reflecting Nook", x: 500, y: 980, clear: 64, mouth: { x: 540, y: 940 } },
  { name: "Capitol Hollow", x: 1140, y: 1960, clear: 66, mouth: { x: 1060, y: 2040 } },
  { name: "North Spur", x: 980, y: 560, clear: 60, mouth: { x: 1040, y: 460 } },
  { name: "Rainier Blind", x: 1680, y: 1960, clear: 68, mouth: { x: 1740, y: 1900 } },
  { name: "Elliott Pocket", x: 1700, y: 1240, clear: 64, mouth: { x: 1780, y: 1160 } },
  { name: "Fir Nook", x: 2160, y: 1600, clear: 60, mouth: { x: 2100, y: 1640 } },
];

/** Objective clearings that are not lane camps. Mouths face the nearby road. */
export const CLEARINGS: Clearing[] = [
  { name: "Capitol Alpha", x: 960, y: 2080, clear: 86, mouth: { x: 960, y: 2140 } },
  { name: "Bay Alpha", x: 2080, y: 580, clear: 86, mouth: { x: 2080, y: 680 } },
];

const CELL = 50;

export const TRUNKS: Trunk[] = [];
const trunkSeen = new Set<string>();

export function noteTrunk(t: Trunk): void {
  const key = `${t.x},${t.y}`;
  if (trunkSeen.has(key)) return;
  trunkSeen.add(key);
  TRUNKS.push(t);
}

export function inHideout(x: number, y: number): Hideout | null {
  for (const h of HIDEOUTS) {
    if (Math.hypot(h.x - x, h.y - y) <= h.clear) return h;
  }
  return null;
}

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const vx = bx - ax;
  const vy = by - ay;
  const l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

/** True when a solid sight trunk crosses the segment. Hideout rings use this. */
export function treeBlocksSight(ax: number, ay: number, bx: number, by: number): boolean {
  const midX = (ax + bx) / 2;
  const midY = (ay + by) / 2;
  for (const t of TRUNKS) {
    if (!t.sight) continue;
    if (Math.hypot(t.x - midX, t.y - midY) > 480) continue;
    if (distToSeg(t.x, t.y, ax, ay, bx, by) < t.r) return true;
  }
  return false;
}

/**
 * Vision break for a pocket only. Same pocket does not hide allies inside it.
 * Callers still apply reveal range, true sight, and the close-range check.
 */
export function hideoutBreaksSight(ax: number, ay: number, bx: number, by: number): boolean {
  const pocket = inHideout(bx, by);
  if (!pocket) return false;
  if (Math.hypot(ax - pocket.x, ay - pocket.y) <= pocket.clear + 18) return false;
  return treeBlocksSight(ax, ay, bx, by);
}

function snap(x: number, y: number): Pt {
  const cx = Math.max(0, Math.min(51, Math.floor(x / CELL)));
  const cy = Math.max(0, Math.min(51, Math.floor(y / CELL)));
  return { x: cx * CELL + CELL / 2, y: cy * CELL + CELL / 2 };
}

function angDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

function pushTree(out: JungleTree[], seen: Set<string>, tree: JungleTree): void {
  const p = snap(tree.x, tree.y);
  const key = `${p.x},${p.y}`;
  if (seen.has(key)) return;
  seen.add(key);
  out.push({ ...tree, x: p.x, y: p.y });
}

function ring(out: JungleTree[], seen: Set<string>, c: TreeCluster): void {
  const toward = Math.atan2(c.gapToward.y - c.y, c.gapToward.x - c.x);
  for (let i = 0; i < c.count; i++) {
    const a = (i / c.count) * Math.PI * 2;
    if (angDiff(a, toward) < c.gap / 2) continue;
    pushTree(out, seen, {
      x: c.x + Math.cos(a) * c.ring,
      y: c.y + Math.sin(a) * c.ring,
      r: c.trunk,
      kind: c.kind,
      fir: c.fir,
      solid: c.solid,
      sight: c.sight,
      cluster: c.name,
    });
  }
}

function shoulders(
  out: JungleTree[],
  seen: Set<string>,
  path: Pt[],
  offset: number,
  step: number,
  cluster: string,
): void {
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const steps = Math.max(1, Math.floor(len / step));
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const cx = a.x + (b.x - a.x) * u;
      const cy = a.y + (b.y - a.y) * u;
      for (const side of [-1, 1]) {
        const x = cx + nx * side * offset;
        const y = cy + ny * side * offset;
        const fir = x + y > 2600;
        const sight = k % 2 === 0;
        pushTree(out, seen, {
          x,
          y,
          r: sight ? 26 : 20,
          kind: sight ? (fir ? "fir" : "oak") : "sapling",
          fir,
          solid: true,
          sight,
          cluster,
        });
      }
    }
  }
}

type Camp = { name: string; x: number; y: number; fir: boolean };

/**
 * Deterministic trunks. `tracks` are the existing back roads. `camps` are the
 * four lane-jungle camps. Rings leave a gap toward the road. Shoulders sit
 * off the centerline so the corridor stays walkable.
 */
export function buildJungleTrees(tracks: { name: string; path: Pt[] }[], camps: Camp[]): JungleTree[] {
  const out: JungleTree[] = [];
  const seen = new Set<string>();
  const clusters: TreeCluster[] = [];
  for (const h of HIDEOUTS) {
    const fir = h.x + h.y > 2600;
    clusters.push({
      name: h.name,
      x: h.x,
      y: h.y,
      ring: h.clear + 78,
      count: 16,
      gapToward: h.mouth,
      gap: 1.25,
      fir,
      kind: fir ? "fir" : "oak",
      trunk: 26,
      sight: true,
      solid: true,
    });
  }
  for (const c of CLEARINGS) {
    const fir = c.x + c.y > 2600;
    clusters.push({
      name: c.name,
      x: c.x,
      y: c.y,
      ring: c.clear + 72,
      count: 14,
      gapToward: c.mouth,
      gap: 1.35,
      fir,
      kind: fir ? "fir" : "oak",
      trunk: 26,
      sight: true,
      solid: true,
    });
  }
  for (const camp of camps) {
    let mouth = tracks[0]?.path[0] ?? { x: camp.x, y: camp.y - 80 };
    let best = Infinity;
    for (const t of tracks) {
      for (const p of t.path) {
        const d = Math.hypot(p.x - camp.x, p.y - camp.y);
        if (d < 36 || d >= best) continue;
        best = d;
        mouth = p;
      }
    }
    clusters.push({
      name: camp.name,
      x: camp.x,
      y: camp.y,
      ring: 156,
      count: 14,
      gapToward: mouth,
      gap: 1.45,
      fir: camp.fir,
      kind: camp.fir ? "fir" : "oak",
      trunk: 26,
      sight: false,
      solid: true,
    });
  }
  for (const c of clusters) ring(out, seen, c);
  for (const t of tracks) shoulders(out, seen, t.path, 78, 62, `${t.name} wall`);
  for (const route of JUNGLE_ROUTES) shoulders(out, seen, route.path, 72, 56, `${route.name} wall`);
  return out;
}
