import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { POOL_RADIUS } from "./baseSpawn.ts";
import {
  LANE_CLEAR,
  laneApproach,
  laneBattleStart,
  laneStartHold,
  mayPeelToJungle,
  waveGoal,
  waveHasLeft,
  waveRefreshSeconds,
  type WaveLeader,
} from "./waveFollow.ts";

const gameSrc = readFileSync(fileURLToPath(new URL("./game.ts", import.meta.url)), "utf8");

const fountain = { x: 210, y: 2390 };
const laneStart = { x: 560, y: 2040 };
const laneMid = { x: 1300, y: 1300 };

function hypot(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Positive when `p` sits behind the leader, toward the fountain. */
function behind(leader: { x: number; y: number }, p: { x: number; y: number }): number {
  const dx = leader.x - fountain.x;
  const dy = leader.y - fountain.y;
  const len = Math.hypot(dx, dy) || 1;
  const vx = p.x - leader.x;
  const vy = p.y - leader.y;
  return -((vx * dx + vy * dy) / len);
}

const unmoved: WaveLeader = {
  x: laneMid.x,
  y: laneMid.y,
  fromFountain: hypot(fountain, laneMid),
  advanced: 0,
};

const waiting = waveGoal({
  alive: true,
  preparing: false,
  fountain,
  seat: 0,
  role: "tank",
  slot: 0,
  laneStart,
  leader: unmoved,
  heroX: fountain.x,
  heroY: fountain.y,
});
assert.ok(waiting, "a living hero still gets a goal");
assert.equal(waiting.duty, "MOVING_TO_LANE_START");
assert.ok(hypot(waiting, fountain) > POOL_RADIUS, "lane start is outside the pool");
assert.ok(hypot(waiting, laneStart) < 80, "goal is that lane's entrance");
assert.ok(hypot(waiting, laneMid) > 400, "goal is not the map center");
assert.equal(waveHasLeft(unmoved), false);

const held = waveGoal({
  alive: true,
  preparing: false,
  fountain,
  seat: 0,
  role: "tank",
  slot: 0,
  laneStart,
  leader: unmoved,
  heroX: waiting.x,
  heroY: waiting.y,
});
assert.ok(held);
assert.equal(held.duty, "WAITING_AT_LANE_START");
assert.ok(
  hypot(laneStartHold(fountain, laneStart, "support", 0), laneStart)
    > hypot(laneStartHold(fountain, laneStart, "tank", 0), laneStart),
  "support waits further back than the tank",
);

const leader: WaveLeader = {
  x: 900,
  y: 1700,
  fromFountain: hypot(fountain, { x: 900, y: 1700 }),
  advanced: 160,
};
assert.equal(waveHasLeft(leader), true);
assert.ok(leader.fromFountain > POOL_RADIUS, "leader is ahead of the base");

const tank = waveGoal({
  alive: true,
  preparing: false,
  fountain,
  seat: 1,
  role: "tank",
  slot: 0,
  laneStart,
  leader,
  heroX: laneStart.x,
  heroY: laneStart.y,
});
const ranged = waveGoal({
  alive: true,
  preparing: false,
  fountain,
  seat: 2,
  role: "ranged",
  slot: 0,
  laneStart,
  leader,
  heroX: laneStart.x,
  heroY: laneStart.y,
});
assert.ok(tank && ranged);
assert.equal(tank.duty, "FOLLOWING_CREEP_WAVE");
const ahead = waveGoal({
  alive: true,
  preparing: false,
  fountain,
  seat: 1,
  role: "tank",
  slot: 0,
  laneStart,
  leader,
  heroX: 700,
  heroY: 1900,
});
assert.ok(ahead);
assert.equal(ahead.duty, "FOLLOWING_CREEP_WAVE", "past the entrance, a released hero stays with the wave");
assert.ok(hypot(ahead, leader) < hypot(ahead, laneStart));
assert.ok(behind(leader, tank) > 0, "tank is not past the leading creep");
assert.ok(behind(leader, ranged) > behind(leader, tank), "ranged sits further back than the tank");
assert.ok(hypot(tank, leader) < hypot(ranged, leader));

assert.equal(
  waveGoal({
    alive: false,
    preparing: false,
    fountain,
    seat: 0,
    role: "melee",
    slot: 0,
    laneStart,
    leader,
    heroX: 0,
    heroY: 0,
  }),
  null,
  "a dead hero is not given a wave goal",
);

const meleeA = waveGoal({
  alive: true,
  preparing: false,
  fountain,
  seat: 3,
  role: "melee",
  slot: 0,
  laneStart,
  leader,
  heroX: leader.x,
  heroY: leader.y,
});
const meleeB = waveGoal({
  alive: true,
  preparing: false,
  fountain,
  seat: 4,
  role: "melee",
  slot: 1,
  laneStart,
  leader,
  heroX: leader.x,
  heroY: leader.y,
});
assert.ok(meleeA && meleeB);
assert.ok(meleeA.x !== meleeB.x || meleeA.y !== meleeB.y, "two heroes on the same wave get different offsets");

const preparing = waveGoal({
  alive: true,
  preparing: true,
  fountain,
  seat: 0,
  role: "support",
  slot: 0,
  laneStart,
  leader,
  heroX: fountain.x,
  heroY: fountain.y,
});
assert.ok(preparing);
assert.equal(preparing.duty, "PREPARING");
assert.ok(hypot(preparing, fountain) < POOL_RADIUS, "opening buy stays in the pool");

assert.equal(mayPeelToJungle(true, false, false, true), false, "jungle waits until the hero has joined a wave");
assert.equal(mayPeelToJungle(true, true, true, true), false, "a lane fight keeps the jungler with the wave");
assert.equal(mayPeelToJungle(true, true, false, false), false, "no wave means walk to the next one");
assert.equal(mayPeelToJungle(false, true, false, true), false);
assert.equal(mayPeelToJungle(true, true, false, true), true);
assert.equal(mayPeelToJungle(true, true, false, true, 3), false, "jungle waits until the lane deploy is done");

for (let id = 0; id < 8; id++) {
  const t = waveRefreshSeconds(id);
  assert.ok(t >= 0.4 && t <= 0.8, `refresh ${t}`);
}

assert.match(gameSrc, /this\.aiControlled\(u\)/);
assert.match(gameSrc, /this\.holdForWave\(\)/);
assert.match(gameSrc, /waveGoal\(/);
assert.match(gameSrc, /laneBattleStart\(/);
assert.match(gameSrc, /laneApproach\(/);
assert.doesNotMatch(gameSrc, /departLanes/);

const awayFountain = { x: 2390, y: 210 };
const awayBot = [
  { x: 2340, y: 300 },
  { x: 2420, y: 540 },
  { x: 2420, y: 1480 },
];
const tucked = laneBattleStart(awayBot, awayFountain);
assert.ok(hypot(tucked, awayFountain) >= LANE_CLEAR, "a spawn inside the pool is not the battle start");
assert.equal(tucked.x, 2420);
assert.equal(tucked.y, 540);
assert.ok(hypot(laneStartHold(awayFountain, tucked, "support", 0), awayFountain) > POOL_RADIUS);

const midPoly = [fountain, { x: 560, y: 2040 }, { x: 1300, y: 1300 }, { x: 2040, y: 560 }];
const midHold = { x: 499, y: 2058 };
const fromPool = laneApproach({ x: 210, y: 2334 }, midPoly, midHold);
assert.ok(fromPool[0]);
assert.equal(fromPool[0].x, 560);
assert.equal(fromPool[0].y, 2040);
const ancient = { x: 430, y: 2170 };
const pulled = laneApproach({ x: 337, y: 2256 }, midPoly, midHold);
assert.ok(pulled[0]);
assert.ok(pulled[0].x !== fountain.x || pulled[0].y !== fountain.y, "a mid refresh must not walk back to the fountain");
assert.ok(pulled.every((p) => p.x !== ancient.x || p.y !== ancient.y), "the ancient is not on the mid lane");
assert.ok(hypot(pulled[0], { x: 560, y: 2040 }) < hypot(pulled[0], { x: 260, y: 2060 }));

const homeTop = laneBattleStart([{ x: 260, y: 2060 }, { x: 180, y: 1480 }], fountain);
assert.equal(homeTop.x, 260);
assert.equal(homeTop.y, 2060);
const homeBot = laneBattleStart([{ x: 540, y: 2420 }], fountain);
const awayTop = laneBattleStart([{ x: 2060, y: 260 }], awayFountain);
assert.ok(homeTop.x !== awayTop.x || homeTop.y !== awayTop.y);
assert.ok(hypot(homeBot, fountain) > POOL_RADIUS);
assert.ok(hypot(awayTop, awayFountain) > POOL_RADIUS);

console.log("wave follow tests ok");
