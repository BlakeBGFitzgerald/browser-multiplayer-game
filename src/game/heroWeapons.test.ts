import assert from "node:assert/strict";
import { HEROES } from "./heroes.ts";
import { SUPPLIED_HERO_FOOT } from "./heroHeight.ts";
import { nerfMuzzle } from "./nerf.ts";
import { heroWeapon, heroWeaponMuzzle, weaponDrawParams, weaponOverlayDrawn, type AttackMotion } from "./heroWeapons.ts";

const MELEE_ABSENT = [
  "mma-macgregor",
  "mma-nurmagoat",
  "mma-jonesy",
  "mma-adesanyaish",
  "mma-poirierish",
  "mma-diazish",
  "maga-tommy",
  "maga-boris",
];

const ranged = HEROES.filter((hero) => hero.melee === false);
const types = new Set<string>();
const motions = new Set<string>();

for (const hero of ranged) {
  const weapon = heroWeapon(hero.id);
  assert.ok(weapon, hero.id);
  assert.equal(weapon.id, hero.id);
  assert.equal(types.has(weapon.type), false, weapon.type);
  assert.equal(motions.has(weapon.motion), false, weapon.motion);
  types.add(weapon.type);
  motions.add(weapon.motion);
}

assert.equal(types.size, ranged.length);
assert.equal(motions.size, ranged.length);

for (const hero of HEROES) {
  if (hero.melee) assert.equal(heroWeapon(hero.id), undefined, hero.id);
}

for (const id of MELEE_ABSENT) {
  assert.equal(heroWeapon(id), undefined, id);
  const hero = HEROES.find((row) => row.id === id);
  assert.equal(hero?.melee, true, id);
}

const alex = heroWeapon("maga-alexgroans");
assert.equal(alex?.type, "nerf-launcher");
assert.equal(alex?.motion, "nerf-brace");
for (const hero of ranged) {
  assert.equal(weaponOverlayDrawn(hero.id), false, hero.id);
}

const nerf = nerfMuzzle(100, 200, 0, "attack");
const alexMuzzle = heroWeaponMuzzle("maga-alexgroans", 100, 200, 0, "attack", 0);
assert.deepEqual(alexMuzzle, nerf);

const right = heroWeaponMuzzle("lw-journalist", 100, 200, 0, "attack", 0);
const left = heroWeaponMuzzle("lw-journalist", 100, 200, Math.PI, "attack", 0);
const feetY = 200 + SUPPLIED_HERO_FOOT;
assert.ok(Math.abs(right.y - feetY) > 8);
assert.ok(Math.abs(left.y - feetY) > 8);
assert.ok(right.x > 100);
assert.ok(left.x < 100);
assert.ok(Math.abs(right.x - 100 + (left.x - 100)) < 0.5);

const first: AttackMotion = "lion-thrust";
const second: AttackMotion = "vine-creak";
const firstShot = weaponDrawParams(first, 0);
const firstPeak = weaponDrawParams(first, 0.5);
const secondShot = weaponDrawParams(second, 0);
const secondPeak = weaponDrawParams(second, 0.5);
assert.notDeepEqual(firstShot, firstPeak);
assert.notDeepEqual(secondShot, secondPeak);
assert.notDeepEqual(firstShot, secondShot);
assert.notDeepEqual(firstPeak, secondPeak);

const rogan = heroWeapon("maga-rogentor");
const brander = heroWeapon("maga-brander");
assert.ok(rogan);
assert.ok(brander);
assert.equal(rogan.id, "maga-rogentor");
assert.equal(brander.id, "maga-brander");
assert.notEqual(rogan.type, brander.type);
assert.notEqual(rogan.motion, brander.motion);
assert.notEqual(heroWeapon("lw-hocking")?.type, heroWeapon("wild-butter")?.type);

console.log("ok hero weapons");
for (const hero of ranged) {
  const weapon = heroWeapon(hero.id);
  console.log(`${hero.id} ${weapon?.type} ${weapon?.motion}`);
}
