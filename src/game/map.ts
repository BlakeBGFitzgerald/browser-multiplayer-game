import { CLEARINGS, HIDEOUTS, JUNGLE_ROUTES, buildJungleTrees, noteTrunk } from "./jungle";

export const CELL = 50;
export const CELLS = 52;
export const WORLD = CELL * CELLS;

export type Team = "home" | "away";
export type Lane = "top" | "mid" | "bot";
export type Pt = { x: number; y: number };

export const LANES: Lane[] = ["top", "mid", "bot"];

export const fountain: Record<Team, Pt> = {
  home: { x: 210, y: 2390 },
  away: { x: 2390, y: 210 },
};

export const ancientPos: Record<Team, Pt> = {
  home: { x: 430, y: 2170 },
  away: { x: 2170, y: 430 },
};

/** Inset so the outer-lane centerlines sit in the map corners. */
const EDGE = 180;

/** Top hugs the top-left corner. Bot hugs the bottom-right corner. Mid is the diagonal. */
const topHome: Pt[] = [
  { x: 260, y: 2060 },
  { x: EDGE, y: 1480 },
  { x: EDGE, y: EDGE },
  { x: 1480, y: EDGE },
  { x: 2060, y: 260 },
];

const midHome: Pt[] = [
  { x: 560, y: 2040 },
  { x: 1300, y: 1300 },
  { x: 2040, y: 560 },
];

const botHome: Pt[] = [
  { x: 540, y: WORLD - EDGE },
  { x: 1480, y: WORLD - EDGE },
  { x: WORLD - EDGE, y: WORLD - EDGE },
  { x: WORLD - EDGE, y: 1480 },
  { x: WORLD - EDGE, y: 540 },
  { x: 2340, y: 300 },
];

function reverse(path: Pt[]): Pt[] {
  return [...path].reverse();
}

export const lanePath: Record<Team, Record<Lane, Pt[]>> = {
  home: { top: topHome, mid: midHome, bot: botHome },
  away: { top: reverse(topHome), mid: reverse(midHome), bot: reverse(botHome) },
};

export function along(path: Pt[], t: number): Pt {
  if (path.length === 0) return { x: 0, y: 0 };
  const clamped = Math.max(0, Math.min(1, t));
  const segs = path.length - 1;
  const f = clamped * segs;
  const i = Math.min(segs - 1, Math.floor(f));
  const u = f - i;
  const a = path[i]!;
  const b = path[i + 1]!;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export type Woods = {
  name: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
  fir: boolean;
};

/** Named forest pockets. DC stays y > x (river is y ≈ x). Seattle stays x > y. */
export const WOODS: Woods[] = [
  { name: "Mall Oaks Woods", x: 700, y: 1480, rx: 290, ry: 210, rot: -0.42, fir: false },
  { name: "Reflecting Grove Woods", x: 620, y: 860, rx: 270, ry: 220, rot: 0.32, fir: false },
  { name: "Capitol Copse", x: 960, y: 2080, rx: 250, ry: 190, rot: 0.18, fir: false },
  { name: "Rainier Woods", x: 1980, y: 1740, rx: 280, ry: 210, rot: 0.38, fir: true },
  { name: "Elliott Woods", x: 1920, y: 1020, rx: 270, ry: 200, rot: -0.28, fir: true },
  { name: "Bay Copse", x: 2080, y: 580, rx: 240, ry: 180, rot: -0.12, fir: true },
];

export function inWoods(x: number, y: number): Woods | null {
  for (const w of WOODS) {
    const dx = x - w.x;
    const dy = y - w.y;
    const c = Math.cos(-w.rot);
    const s = Math.sin(-w.rot);
    const lx = dx * c - dy * s;
    const ly = dx * s + dy * c;
    if ((lx * lx) / (w.rx * w.rx) + (ly * ly) / (w.ry * w.ry) <= 1) return w;
  }
  return null;
}

export type BackTrack = { name: string; path: Pt[] };

/**
 * Walkable dirt behind the lanes. DC and Seattle stay on their own side of the
 * river except where a path goes around the map edge.
 */
export const BACK_TRACKS: BackTrack[] = [
  {
    name: "Behind Top",
    path: [
      { x: 420, y: 1880 },
      { x: 390, y: 1480 },
      { x: 460, y: 1120 },
      { x: 620, y: 860 },
      { x: 720, y: 900 },
    ],
  },
  {
    name: "North Back",
    path: [
      { x: 720, y: 400 },
      { x: 1100, y: 370 },
      { x: 1480, y: 380 },
      { x: 1820, y: 460 },
      { x: 2080, y: 580 },
      { x: 2260, y: 420 },
    ],
  },
  {
    name: "Behind Bot",
    path: [
      { x: 620, y: 2280 },
      { x: 960, y: 2140 },
      { x: 1280, y: 2220 },
      { x: 1580, y: 2180 },
      { x: 1680, y: 1980 },
    ],
  },
  {
    name: "East Back",
    path: [
      { x: 2260, y: 560 },
      { x: 2220, y: 980 },
      { x: 2160, y: 1380 },
      { x: 2040, y: 1680 },
      { x: 1980, y: 1740 },
      { x: 1880, y: 1760 },
    ],
  },
  {
    name: "Grove Walk",
    path: [
      { x: 360, y: 1980 },
      { x: 520, y: 1740 },
      { x: 700, y: 1480 },
      { x: 720, y: 1520 },
      { x: 640, y: 1180 },
      { x: 620, y: 860 },
      { x: 980, y: 1180 },
    ],
  },
  {
    name: "Thicket Walk",
    path: [
      { x: 2260, y: 360 },
      { x: 2080, y: 580 },
      { x: 1960, y: 820 },
      { x: 1920, y: 1020 },
      { x: 1880, y: 1080 },
      { x: 1980, y: 1440 },
      { x: 1980, y: 1740 },
      { x: 1700, y: 1300 },
    ],
  },
];

export type TrackRank = "primary" | "gank" | "flank";

export function trackRank(name: string): TrackRank {
  if (name === "Grove Walk" || name === "Thicket Walk") return "primary";
  if (name === "Behind Top" || name === "Behind Bot") return "gank";
  return "flank";
}

export const JUNGLE_TRAILS: [Pt, Pt][] = BACK_TRACKS.flatMap((t) => {
  const segs: [Pt, Pt][] = [];
  for (let i = 0; i < t.path.length - 1; i++) segs.push([t.path[i]!, t.path[i + 1]!]);
  return segs;
});

export type JungleCamp = { name: string; x: number; y: number; fir: boolean };

export const JUNGLE_CAMPS: JungleCamp[] = [
  { name: "Mall Oaks", x: 720, y: 1520, fir: false },
  { name: "Reflecting Grove", x: 780, y: 780, fir: false },
  { name: "Rainier Stand", x: 1820, y: 1820, fir: true },
  { name: "Elliott Thicket", x: 1880, y: 1080, fir: true },
];

export function norm(x: number, y: number): Pt {
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
}

export type TowerTier = "outer" | "middle" | "inner";
export type TowerSpec = { team: Team; lane: Lane; tier: TowerTier; pos: Pt };

export const HOME_TOWER_T: Record<Lane, Record<TowerTier, number>> = {
  top: { inner: 0.07, middle: 0.26, outer: 0.44 },
  mid: { inner: 0.08, middle: 0.31, outer: 0.36 },
  bot: { inner: 0.03, middle: 0.18, outer: 0.34 },
};
export const AWAY_TOWER_T: Record<Lane, Record<TowerTier, number>> = {
  top: { inner: 0.93, middle: 0.74, outer: 0.56 },
  mid: { inner: 0.92, middle: 0.69, outer: 0.64 },
  bot: { inner: 0.88, middle: 0.7, outer: 0.46 },
};
const TOWER_TIERS: TowerTier[] = ["inner", "middle", "outer"];

/** Top and bot: inner in front of town, middle midway, outer at the map corner. Mid has no middle tower: outer set back from the river, inner closer to base. */
export const towers: TowerSpec[] = LANES.flatMap((lane) => {
  const path = lanePath.home[lane];
  return TOWER_TIERS.flatMap((tier) => {
    if (lane === "mid" && tier === "middle") return [];
    return [
      { team: "home" as const, lane, tier, pos: along(path, HOME_TOWER_T[lane][tier]) },
      { team: "away" as const, lane, tier, pos: along(path, AWAY_TOWER_T[lane][tier]) },
    ];
  });
});

const walk = new Uint8Array(CELLS * CELLS);

function idx(cx: number, cy: number): number {
  return cy * CELLS + cx;
}

function carveCircle(x: number, y: number, r: number): void {
  const cr = Math.ceil(r / CELL);
  const ccx = Math.floor(x / CELL);
  const ccy = Math.floor(y / CELL);
  for (let y0 = ccy - cr; y0 <= ccy + cr; y0++) {
    for (let x0 = ccx - cr; x0 <= ccx + cr; x0++) {
      if (x0 < 0 || y0 < 0 || x0 >= CELLS || y0 >= CELLS) continue;
      const wx = x0 * CELL + CELL / 2;
      const wy = y0 * CELL + CELL / 2;
      if (Math.hypot(wx - x, wy - y) <= r) walk[idx(x0, y0)] = 1;
    }
  }
}

function carveLine(a: Pt, b: Pt, radius: number): void {
  const steps = Math.max(2, Math.ceil(dist(a, b) / 20));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    carveCircle(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, radius);
  }
}

function carvePath(path: Pt[], radius: number): void {
  for (let i = 0; i < path.length - 1; i++) carveLine(path[i]!, path[i + 1]!, radius);
}

function distSeg(p: Pt, a: Pt, b: Pt): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2));
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
}

function nearPath(p: Pt, path: Pt[], radius: number): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    if (distSeg(p, path[i]!, path[i + 1]!) < radius) return true;
  }
  return false;
}

/** Cells a trunk must not close: lanes, bases, camps, roads, pockets. */
function keepsOpen(x: number, y: number): boolean {
  const p = { x, y };
  if (dist(p, fountain.home) < 250 || dist(p, fountain.away) < 250) return true;
  if (dist(p, ancientPos.home) < 160 || dist(p, ancientPos.away) < 160) return true;
  if (dist(p, { x: 1300, y: 1300 }) < 200) return true;
  if (nearPath(p, topHome, 128) || nearPath(p, botHome, 128) || nearPath(p, midHome, 138)) return true;
  if (nearPath(p, [fountain.home, topHome[0]!], 128)) return true;
  if (nearPath(p, [fountain.home, midHome[0]!], 138)) return true;
  if (nearPath(p, [fountain.home, botHome[0]!], 128)) return true;
  if (nearPath(p, [fountain.away, topHome[topHome.length - 1]!], 128)) return true;
  if (nearPath(p, [fountain.away, midHome[midHome.length - 1]!], 138)) return true;
  if (nearPath(p, [fountain.away, botHome[botHome.length - 1]!], 128)) return true;
  for (const t of BACK_TRACKS) {
    const keep = trackRank(t.name) === "primary" ? 46 : trackRank(t.name) === "gank" ? 40 : 36;
    if (nearPath(p, t.path, keep)) return true;
  }
  for (const c of JUNGLE_CAMPS) {
    if (dist(p, c) < 90) return true;
  }
  for (const c of CLEARINGS) {
    if (dist(p, c) < c.clear) return true;
  }
  for (const h of HIDEOUTS) {
    if (dist(p, h) < h.clear) return true;
  }
  for (const route of JUNGLE_ROUTES) {
    if (nearPath(p, route.path, route.radius)) return true;
  }
  return false;
}

(function buildWalk(): void {
  carvePath(topHome, 128);
  carvePath(midHome, 138);
  carvePath(botHome, 128);
  carveLine(fountain.home, topHome[0]!, 128);
  carveLine(fountain.home, midHome[0]!, 138);
  carveLine(fountain.home, botHome[0]!, 128);
  carveLine(fountain.away, topHome[topHome.length - 1]!, 128);
  carveLine(fountain.away, midHome[midHome.length - 1]!, 138);
  carveLine(fountain.away, botHome[botHome.length - 1]!, 128);
  carveCircle(fountain.home.x, fountain.home.y, 250);
  carveCircle(fountain.away.x, fountain.away.y, 250);
  carveCircle(ancientPos.home.x, ancientPos.home.y, 160);
  carveCircle(ancientPos.away.x, ancientPos.away.y, 160);
  carveCircle(1300, 1300, 200);
  for (const t of BACK_TRACKS) carvePath(t.path, 68);
  for (const c of JUNGLE_CAMPS) carveCircle(c.x, c.y, 95);
  for (const w of WOODS) carveCircle(w.x, w.y, 88);
  for (const route of JUNGLE_ROUTES) carvePath(route.path, route.radius);
  for (const h of HIDEOUTS) carveCircle(h.x, h.y, h.clear);
  for (const tree of buildJungleTrees(BACK_TRACKS, JUNGLE_CAMPS)) {
    const cx = Math.floor(tree.x / CELL);
    const cy = Math.floor(tree.y / CELL);
    if (cx < 1 || cy < 1 || cx >= CELLS - 1 || cy >= CELLS - 1) continue;
    const wx = cx * CELL + CELL / 2;
    const wy = cy * CELL + CELL / 2;
    const open = keepsOpen(wx, wy);
    if (!tree.solid) {
      if (!open && walk[idx(cx, cy)] === 0) {
        noteTrunk({ x: wx, y: wy, r: tree.r, kind: tree.kind, fir: tree.fir, sight: false, cluster: tree.cluster });
      }
      continue;
    }
    if (open) continue;
    walk[idx(cx, cy)] = 0;
    noteTrunk({ x: wx, y: wy, r: tree.r, kind: tree.kind, fir: tree.fir, sight: tree.sight, cluster: tree.cluster });
  }
})();

export function isWalkable(x: number, y: number): boolean {
  const cx = Math.floor(x / CELL);
  const cy = Math.floor(y / CELL);
  if (cx < 0 || cy < 0 || cx >= CELLS || cy >= CELLS) return false;
  return walk[idx(cx, cy)] === 1;
}

export function nearestWalkable(x: number, y: number): Pt {
  if (isWalkable(x, y)) return { x, y };
  let best = { x, y };
  let bestD = Infinity;
  for (let cy = 0; cy < CELLS; cy++) {
    for (let cx = 0; cx < CELLS; cx++) {
      if (!walk[idx(cx, cy)]) continue;
      const wx = cx * CELL + CELL / 2;
      const wy = cy * CELL + CELL / 2;
      const d = Math.hypot(wx - x, wy - y);
      if (d < bestD) {
        bestD = d;
        best = { x: wx, y: wy };
      }
    }
  }
  return best;
}

type HeapNode = { x: number; y: number; g: number; f: number };

const PATH_N = CELLS * CELLS;
const PATH_CAME = new Int32Array(PATH_N);
const PATH_G = new Float32Array(PATH_N);
const PATH_CLOSED = new Uint16Array(PATH_N);
const PATH_GEN = new Uint16Array(PATH_N);
let pathStamp = 1;

function heapPush(h: HeapNode[], n: HeapNode): void {
  h.push(n);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p]!.f <= n.f) break;
    h[i] = h[p]!;
    i = p;
  }
  h[i] = n;
}

function heapPop(h: HeapNode[]): HeapNode | undefined {
  const top = h[0];
  const last = h.pop();
  if (!h.length || !last) return top;
  let i = 0;
  h[0] = last;
  for (;;) {
    const l = i * 2 + 1;
    const r = l + 1;
    let s = i;
    if (l < h.length && h[l]!.f < h[s]!.f) s = l;
    if (r < h.length && h[r]!.f < h[s]!.f) s = r;
    if (s === i) break;
    const tmp = h[i]!;
    h[i] = h[s]!;
    h[s] = tmp;
    i = s;
  }
  return top;
}

export function findPath(sx: number, sy: number, tx: number, ty: number): Pt[] {
  const sx0 = Math.floor(sx / CELL);
  const sy0 = Math.floor(sy / CELL);
  const gx = Math.floor(tx / CELL);
  const gy = Math.floor(ty / CELL);
  if (sx0 === gx && sy0 === gy) return [{ x: tx, y: ty }];
  pathStamp += 1;
  if (pathStamp > 65000) {
    PATH_CLOSED.fill(0);
    PATH_GEN.fill(0);
    pathStamp = 1;
  }
  const stamp = pathStamp;
  const start = sy0 * CELLS + sx0;
  PATH_G[start] = 0;
  PATH_CAME[start] = -1;
  PATH_GEN[start] = stamp;
  const open: HeapNode[] = [];
  heapPush(open, { x: sx0, y: sy0, g: 0, f: Math.abs(gx - sx0) + Math.abs(gy - sy0) });
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  while (open.length) {
    const cur = heapPop(open)!;
    const ck = cur.y * CELLS + cur.x;
    if (PATH_CLOSED[ck] === stamp) continue;
    if (PATH_GEN[ck] === stamp && cur.g > PATH_G[ck]! + 0.01) continue;
    PATH_CLOSED[ck] = stamp;
    if (cur.x === gx && cur.y === gy) {
      const pts: Pt[] = [{ x: tx, y: ty }];
      let k = PATH_CAME[ck]!;
      while (k >= 0) {
        const cx = k % CELLS;
        const cy = (k / CELLS) | 0;
        pts.push({ x: cx * CELL + CELL / 2, y: cy * CELL + CELL / 2 });
        k = PATH_CAME[k]!;
      }
      pts.reverse();
      return pts;
    }
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= CELLS || ny >= CELLS) continue;
      if (!walk[idx(nx, ny)]) continue;
      const nk = ny * CELLS + nx;
      const step = dx !== 0 && dy !== 0 ? 1.4 : 1;
      const g = cur.g + step;
      if (PATH_GEN[nk] === stamp && g >= PATH_G[nk]!) continue;
      PATH_GEN[nk] = stamp;
      PATH_G[nk] = g;
      PATH_CAME[nk] = ck;
      heapPush(open, { x: nx, y: ny, g, f: g + Math.abs(gx - nx) + Math.abs(gy - ny) });
    }
  }
  return [nearestWalkable(tx, ty)];
}
