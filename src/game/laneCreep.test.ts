import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LANE_CREEP_FOOT,
  LANE_CREEP_PROC_BASE_HEIGHT,
  LANE_CREEP_SCALE,
  laneCreepCrown,
  laneCreepDrawHeight,
  laneCreepDrawScale,
  laneCreepProcCrown,
  laneCreepProcFoot,
  laneCreepRadius,
} from "./laneCreep.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

assert.equal(LANE_CREEP_SCALE, 1.5);
assert.equal(laneCreepDrawHeight(), 72);
assert.equal(laneCreepDrawHeight(), 48 * LANE_CREEP_SCALE);
assert.equal(LANE_CREEP_FOOT, 8);
assert.equal(laneCreepCrown(100), 100 + 8 - 72);

assert.equal(laneCreepRadius("infantry"), 15 * LANE_CREEP_SCALE);
assert.equal(laneCreepRadius("archer"), 12 * LANE_CREEP_SCALE);
assert.equal(laneCreepRadius("infantry"), laneCreepRadius("archer") * (15 / 12));

const art = read("./suppliedArt.ts");
assert.match(art, /export const JUNGLE_CREEP_HEIGHT = 48/);
assert.match(art, /export const JUNGLE_CREEP_FOOT = 8/);
assert.doesNotMatch(art, /JUNGLE_CREEP_HEIGHT = 72/);
assert.notEqual(48, laneCreepDrawHeight());

assert.equal(laneCreepDrawScale("infantry"), LANE_CREEP_SCALE);
assert.equal(laneCreepDrawScale("archer"), LANE_CREEP_SCALE);
assert.equal(laneCreepDrawScale("warden"), 1);
assert.equal(laneCreepDrawScale("boar"), 1);
assert.equal(laneCreepDrawScale("ancient"), 1);

const procHeight = LANE_CREEP_PROC_BASE_HEIGHT * LANE_CREEP_SCALE;
assert.equal(procHeight, 126);
assert.equal(laneCreepProcFoot(200, false), 200 + 15 + 6);
assert.equal(laneCreepProcFoot(200, true), 200 + 12 + 6);
assert.equal(laneCreepProcCrown(200, false), laneCreepProcFoot(200, false) - procHeight);
assert.equal(laneCreepProcCrown(200, true), laneCreepProcFoot(200, true) - procHeight);

const pix = read("./creepPix.ts");
const quad = read("./quad.ts");
const world = read("./worldPix.ts");
const game = read("./game.ts");

assert.match(pix, /laneCreepDrawScale\(role\)/);
assert.match(pix, /laneCreepProcFoot/);
assert.match(pix, /LANE_CREEP_PROC_BASE_HEIGHT/);
assert.match(art, /laneCreepDrawHeight\(\)/);
assert.match(art, /JUNGLE_CREEP_HEIGHT/);
assert.match(quad, /laneCreepCrown\(u\.y\)/);
assert.match(quad, /laneCreepProcCrown\(u\.y, u\.caster\)/);
assert.match(world, /drawSuppliedCreep\(ctx, u\.team, u\.caster, u\.x, u\.y, flip, alpha\)/);
assert.match(world, /drawCreepPix\(ctx, u\)/);
assert.match(game, /laneCreepRadius\(job\)/);
assert.match(game, /u\.maxHp = archer \? 240 : 420/);
assert.match(game, /u\.damage = archer \? 16 : 24/);
assert.match(game, /u\.range = archer \? 310 : 92/);
assert.match(game, /u\.period = archer \? 1\.25 : 1\.05/);
assert.match(game, /u\.ms = archer \? 238 : 252/);
assert.match(game, /u\.gold = archer \? 32 : 44/);
assert.match(game, /t\.wild \? 64 : 42/);

console.log(`ok lane creeps ${laneCreepDrawHeight()} jungle 48`);
