import "../server/dom-stub.ts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Game } from "./game.ts";
import { Input } from "./input.ts";
import { Sfx } from "./audio.ts";
import { POOL_RADIUS, type SpawnPt } from "./baseSpawn.ts";
import { OPENING_GOLD } from "./aiShopPlan.ts";
import { laneBattleStart } from "./waveFollow.ts";

const mapSrc = readFileSync(fileURLToPath(new URL("./map.ts", import.meta.url)), "utf8");

type Lane = "top" | "mid" | "bot";
type Team = "home" | "away";
type Actor = {
  kind: string;
  team: Team;
  lane?: Lane;
  name: string;
  x: number;
  y: number;
  gold: number;
  dead: boolean;
  respawn: number;
  waveDuty: string;
  inv?: { id: string }[] | null;
};

function grab(name: string): SpawnPt {
  const block = mapSrc.match(/export const fountain[\s\S]*?};/)?.[0] ?? "";
  const m = block.match(new RegExp(`${name}:\\s*\\{\\s*x:\\s*(-?\\d+(?:\\.\\d+)?),\\s*y:\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (!m) throw new Error(`missing fountain ${name}`);
  return { x: Number(m[1]), y: Number(m[2]) };
}

const CELL = Number(mapSrc.match(/export const CELL = (\d+)/)?.[1]);
const CELLS = Number(mapSrc.match(/export const CELLS = (\d+)/)?.[1]);
const EDGE = Number(mapSrc.match(/const EDGE = (\d+)/)?.[1]);
const WORLD = CELL * CELLS;

function num(expr: string): number {
  const e = expr.trim();
  if (/^\d+(?:\.\d+)?$/.test(e)) return Number(e);
  if (e === "EDGE") return EDGE;
  if (e === "WORLD") return WORLD;
  if (e === "WORLD - EDGE") return WORLD - EDGE;
  throw new Error(`lane expr ${e}`);
}

function pathOf(name: string): SpawnPt[] {
  const m = mapSrc.match(new RegExp(`const ${name}: Pt\\[] = \\[([\\s\\S]*?)\\];`));
  if (!m?.[1]) throw new Error(name);
  const pts: SpawnPt[] = [];
  const re = /\{\s*x:\s*([^,]+),\s*y:\s*([^}]+)\}/g;
  let hit: RegExpExecArray | null;
  while ((hit = re.exec(m[1]))) pts.push({ x: num(hit[1]!), y: num(hit[2]!) });
  return pts;
}

function hypot(a: SpawnPt, b: SpawnPt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distSeg(p: SpawnPt, a: SpawnPt, b: SpawnPt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1) return hypot(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

function distPoly(p: SpawnPt, path: SpawnPt[]): number {
  let best = Infinity;
  for (let i = 0; i < path.length; i++) {
    best = Math.min(best, hypot(p, path[i]!));
    if (i + 1 < path.length) best = Math.min(best, distSeg(p, path[i]!, path[i + 1]!));
  }
  return best;
}

function teamPath(team: Team, lane: Lane): SpawnPt[] {
  const path = homePaths[lane];
  return team === "home" ? path : [...path].reverse();
}

const fountains: Record<Team, SpawnPt> = { home: grab("home"), away: grab("away") };
const homePaths = {
  top: pathOf("topHome"),
  mid: pathOf("midHome"),
  bot: pathOf("botHome"),
};
const starts: Record<Team, Record<Lane, SpawnPt>> = {
  home: {
    top: laneBattleStart(homePaths.top, fountains.home),
    mid: laneBattleStart(homePaths.mid, fountains.home),
    bot: laneBattleStart(homePaths.bot, fountains.home),
  },
  away: {
    top: laneBattleStart([...homePaths.top].reverse(), fountains.away),
    mid: laneBattleStart([...homePaths.mid].reverse(), fountains.away),
    bot: laneBattleStart([...homePaths.bot].reverse(), fountains.away),
  },
};

for (const team of ["home", "away"] as const) {
  const lanes: Lane[] = ["top", "mid", "bot"];
  for (const lane of lanes) {
    const start = starts[team][lane];
    assert.ok(hypot(start, fountains[team]) > POOL_RADIUS, `${team} ${lane} start is outside the pool`);
    for (const other of lanes) {
      if (other === lane) continue;
      assert.ok(hypot(start, starts[team][other]) > 80, `${team} ${lane} shares a start with ${other}`);
    }
  }
}

function makeGame(): Game {
  const canvas = {
    width: 1280,
    height: 720,
    hidden: true,
    style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720, x: 0, y: 0, toJSON() {} }),
    getContext: () => null,
    addEventListener() {},
    removeEventListener() {},
  } as unknown as HTMLCanvasElement;
  const input = new Input(canvas, () => ({ x: 0, y: 0, zoom: 1 }), false);
  const sfx = new Sfx();
  sfx.muted = true;
  return new Game(canvas, null as unknown as CanvasRenderingContext2D, input, sfx, true, true);
}

const game = makeGame();
game.start({
  spec: true,
  home: ["A", "B", "C", "D", "E"],
  away: ["F", "G", "H", "I", "J"],
  kits: ["lw-journalist", "maga-grumptor", "maga-alexgroans", "mma-macgregor", "wild-icon"],
  awayKits: ["lw-bitenten", "maga-tommy", "lw-sandbags", "mma-jonesy", "wild-karen"],
});

const box = game as unknown as { units: Actor[]; guard: number };
box.guard = 0;
const heroes = () => box.units.filter((u) => u.kind === "hero");
assert.equal(heroes().length, 10);

for (const u of heroes()) {
  assert.ok(u.lane === "top" || u.lane === "mid" || u.lane === "bot", `${u.name} has no lane`);
  assert.ok(hypot(u, fountains[u.team]) < POOL_RADIUS, `${u.name} did not spawn in the pool`);
  assert.ok(u.gold < OPENING_GOLD, `${u.name} did not spend starting gold`);
  assert.ok(u.gold >= 0, `${u.name} gold went negative`);
  const owned = (u.inv ?? []).filter((slot) => slot?.id).length;
  assert.ok(owned > 0, `${u.name} has no starting items`);
}

function step(seconds: number): void {
  const n = Math.round(seconds * 30);
  for (let i = 0; i < n; i++) game.update(1 / 30);
}

step(3.4);

for (const u of heroes()) {
  const lane = u.lane ?? "mid";
  const own = starts[u.team][lane];
  const fromBase = hypot(u, fountains[u.team]);
  assert.ok(fromBase > POOL_RADIUS, `${u.name} still in the ${u.team} pool (${fromBase.toFixed(0)})`);
  assert.notEqual(u.waveDuty, "PREPARING", `${u.name} is still buying`);
  assert.notEqual(u.waveDuty, "WAITING_IN_BASE", `${u.name} is waiting in base`);
  const ownPoly = distPoly(u, teamPath(u.team, lane));
  for (const other of ["top", "mid", "bot"] as const) {
    if (other === lane) continue;
    const startOk = hypot(u, own) < hypot(u, starts[u.team][other]);
    const polyOk = ownPoly < distPoly(u, teamPath(u.team, other));
    assert.ok(
      startOk || polyOk,
      `${u.name} ${u.team} ${lane} is closer to ${other} (start ${hypot(u, own).toFixed(0)} vs ${hypot(u, starts[u.team][other]).toFixed(0)}, lane ${ownPoly.toFixed(0)} vs ${distPoly(u, teamPath(u.team, other)).toFixed(0)}) duty ${u.waveDuty}`,
    );
  }
}

const watched = heroes().find((u) => u.team === "away" && u.lane === "bot");
if (!watched) throw new Error("missing away bot");
const watchedLane = watched.lane;
watched.dead = true;
watched.respawn = 0.05;
step(0.2);
assert.equal(watched.dead, false, "respawn did not fire");
assert.equal(watched.lane, watchedLane, "respawn changed the lane");
assert.ok(hypot(watched, fountains.away) < POOL_RADIUS + 40, "respawn was not in the pool");
step(3.4);
assert.ok(hypot(watched, fountains.away) > POOL_RADIUS, "respawned bot stayed in the pool");
assert.equal(watched.lane, "bot");
assert.notEqual(watched.waveDuty, "PREPARING");
assert.notEqual(watched.waveDuty, "WAITING_IN_BASE");
const watchedPoly = distPoly(watched, teamPath("away", "bot"));
assert.ok(
  hypot(watched, starts.away.bot) < hypot(watched, starts.away.top) || watchedPoly < distPoly(watched, teamPath("away", "top")),
  "respawned bot left its lane",
);
assert.ok(
  hypot(watched, starts.away.bot) < hypot(watched, starts.away.mid) || watchedPoly < distPoly(watched, teamPath("away", "mid")),
  "respawned bot left its lane",
);

console.log("bot deploy tests ok");
