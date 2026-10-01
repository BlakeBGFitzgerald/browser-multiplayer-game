import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  AI_ROLE_BUILDS,
  OPENING_GOLD,
  aiRoleOf,
  roleLevelBonus,
  spendOpeningGold,
  type AiRole,
} from "./aiShopPlan.ts";
import { POOL_RADIUS, poolSpawn, type SpawnPt } from "./baseSpawn.ts";
import { giftById, totalCost } from "./giftShop.ts";
import { heroById } from "./heroes.ts";
import { kitPatch } from "./kits.ts";

const mapSrc = readFileSync(fileURLToPath(new URL("./map.ts", import.meta.url)), "utf8");
const gameSrc = readFileSync(fileURLToPath(new URL("./game.ts", import.meta.url)), "utf8");

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
  if (pts.length < 2) throw new Error(`${name} waypoints`);
  return pts;
}

function along(path: SpawnPt[], t: number): SpawnPt {
  const segs = path.length - 1;
  const f = Math.max(0, Math.min(1, t)) * segs;
  const i = Math.min(segs - 1, Math.floor(f));
  const u = f - i;
  const a = path[i]!;
  const b = path[i + 1]!;
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

function hypot(a: SpawnPt, b: SpawnPt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const fountains = { home: grab("home"), away: grab("away") };
const laneMids = ["topHome", "midHome", "botHome"].map((name) => along(pathOf(name), 0.5));

for (const team of ["home", "away"] as const) {
  const origin = fountains[team];
  const seats = [0, 1, 2, 3, 4].map((i) => poolSpawn(origin, i));
  for (let i = 0; i < seats.length; i++) {
    const p = seats[i]!;
    const d = hypot(p, origin);
    assert.ok(d < POOL_RADIUS, `${team} seat ${i} left the pool (${d.toFixed(1)})`);
    assert.ok(d + 22 < POOL_RADIUS, `${team} seat ${i} body leaves the pool`);
    for (const mid of laneMids) {
      assert.ok(hypot(p, mid) > 80, `${team} seat ${i} sits on a lane midpoint`);
    }
    assert.deepEqual(poolSpawn(origin, i), p, "spawn offset is deterministic");
  }
  assert.ok(hypot(seats[0]!, seats[1]!) > 44, "two heroes on one team overlap");
  for (let i = 0; i < seats.length; i++) {
    for (let j = i + 1; j < seats.length; j++) {
      assert.ok(hypot(seats[i]!, seats[j]!) > 44, `${team} seats ${i} and ${j} overlap`);
    }
  }
}

assert.match(gameSrc, /poolSpawn\(fountain\[team\], index\)/);
assert.match(gameSrc, /this\.openingShops\(\)/);
assert.match(gameSrc, /this\.holdForWave\(\)/);
assert.doesNotMatch(gameSrc, /departLanes/);
assert.match(gameSrc, /roleLevelBonus\(/);
assert.doesNotMatch(gameSrc, /stageMidScrim/);

const roles: AiRole[] = ["melee", "ranged", "tank", "support", "mma"];
const bags: string[] = [];
for (const role of roles) {
  const purse = spendOpeningGold(role, OPENING_GOLD);
  const early = new Set(AI_ROLE_BUILDS[role].early);
  assert.ok(purse.gold < OPENING_GOLD, `${role} spent nothing`);
  assert.ok(purse.gold >= 0, role);
  assert.ok(purse.items.length > 0 && purse.items.length <= 6, role);
  const seen = new Set<string>();
  let spent = 0;
  for (const id of purse.items) {
    assert.ok(early.has(id), `${role} bought ${id} outside the early list`);
    assert.ok(!seen.has(id), `${role} duplicate ${id}`);
    seen.add(id);
    assert.ok(giftById(id), id);
    spent += totalCost(id);
  }
  assert.equal(purse.gold, OPENING_GOLD - spent, role);
  bags.push([...purse.items].sort().join(","));
}
assert.equal(new Set(bags).size, roles.length, "opening bags differ by role");

const broke = spendOpeningGold("melee", 10);
assert.equal(broke.gold, 10);
assert.deepEqual(broke.items, []);

function roleOf(id: string): AiRole {
  const h = heroById(id);
  return aiRoleOf({ melee: h.melee, wing: h.wing, role: h.role, attr: h.attr }, kitPatch(h.id).band);
}

assert.equal(roleOf("spike"), "melee");
assert.equal(roleOf("shot"), "ranged");
assert.equal(roleOf("mma-macgregor"), "mma");
assert.equal(roleOf("mascot"), "tank");
assert.equal(roleOf("desk"), "support");
assert.equal(roleOf("riot"), "melee");
assert.equal(roleOf("janitor"), "support");
assert.equal(roleOf("maga-hooli"), "ranged");

const meleeOpen = spendOpeningGold(roleOf("spike"));
for (const id of meleeOpen.items) assert.ok(AI_ROLE_BUILDS.melee.early.includes(id), id);
const tankOpen = spendOpeningGold(roleOf("mascot"));
for (const id of tankOpen.items) assert.ok(AI_ROLE_BUILDS.tank.early.includes(id), id);
assert.notEqual(meleeOpen.items.join(","), tankOpen.items.join(","));

const tank = roleLevelBonus("tank", 10);
const agi = roleLevelBonus("ranged", 10);
const melee = roleLevelBonus("melee", 10);
assert.ok(tank.hp > agi.hp, "tank health bonus");
assert.ok(tank.armor > agi.armor, "tank armor bonus");
assert.ok(tank.hp + tank.armor > agi.hp + agi.armor);
assert.ok(agi.ms > tank.ms, "agility move bonus");
assert.ok(agi.aspd > tank.aspd, "agility attack speed bonus");
assert.ok(melee.ms > tank.ms);
assert.ok(agi.aspd <= 0.12 && melee.aspd <= 0.12);
assert.ok(agi.ms <= 28 && melee.ms <= 28);
assert.ok(tank.hp <= 120 && tank.armor <= 6);
const earlyTank = roleLevelBonus("tank", 2);
assert.ok(earlyTank.hp > 0 && earlyTank.hp < tank.hp / 3, "early levels stay small");
assert.equal(roleLevelBonus("ranged", 1).ms, 0);
assert.equal(roleLevelBonus("tank", 1).hp, 0);
const support = roleLevelBonus("support", 10);
assert.ok(support.mana > agi.mana);
assert.ok(support.manaRegen > agi.manaRegen);

console.log("pool shop tests ok");
