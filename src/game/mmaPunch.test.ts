import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HEROES } from "./heroes.ts";
import { HOOLI_BURST_AT } from "./hooliBurst.ts";
import { ALEX_ROCKET_FIRE } from "./nerf.ts";
import { attackSwingPulse } from "./attackLean.ts";
import { resolveBasicAttack, type AttackSubject } from "./attackPose.ts";
import {
  MMA_PUNCH_CONTACT,
  MMA_PUNCH_END,
  MMA_WEIGHT_SHIFT,
  mmaPunchActive,
  mmaPunchFrame,
  mmaPunchLeanRadians,
  mmaPunchShift,
} from "./mmaPunch.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

assert.equal(MMA_PUNCH_CONTACT, 0.14);
assert.ok(MMA_PUNCH_CONTACT < MMA_PUNCH_END);
assert.ok(MMA_PUNCH_END < 0.5);
assert.equal(ALEX_ROCKET_FIRE, 0.18);
assert.deepEqual([...HOOLI_BURST_AT], [0.018, 0.108, 0.198]);

assert.equal(mmaPunchActive(0), false);
assert.equal(mmaPunchActive(MMA_PUNCH_END), false);
assert.equal(mmaPunchActive(MMA_PUNCH_CONTACT), true);

const contact = mmaPunchFrame(MMA_PUNCH_CONTACT);
assert.equal(contact, 7);
assert.ok(attackSwingPulse("attack", contact) > 0.9);
assert.equal(mmaPunchFrame(0), 4);
assert.equal(attackSwingPulse("attack", mmaPunchFrame(0)), 0);
assert.equal(attackSwingPulse("attack", mmaPunchFrame(MMA_PUNCH_END)), 0);

const left = mmaPunchLeanRadians("left", contact);
const right = mmaPunchLeanRadians("right", contact);
assert.ok(left > 0.2, `left lean ${left}`);
assert.ok(right < -0.2, `right lean ${right}`);
assert.equal(mmaPunchLeanRadians("left", 4), 0);
assert.equal(mmaPunchLeanRadians("right", 11), 0);
assert.equal(mmaPunchLeanRadians(null, contact), 0);

const shiftL = mmaPunchShift("left", contact);
const shiftR = mmaPunchShift("right", contact);
assert.ok(shiftL > 0 && shiftL <= MMA_WEIGHT_SHIFT);
assert.ok(shiftR < 0 && shiftR >= -MMA_WEIGHT_SHIFT);
assert.equal(mmaPunchShift("left", 11), 0);
assert.equal(mmaPunchShift("right", 4), 0);

const future: AttackSubject = { kind: "hero", heroId: "future-striker", wing: "mma", attackIndex: 3, melee: false };
assert.equal(resolveBasicAttack(future).side, "right");
assert.equal(resolveBasicAttack({ ...future, wing: "wild", heroId: "mma-macgregor", attackIndex: 0 }).side, null);

for (const hero of HEROES) {
  if (hero.wing !== "mma") continue;
  const sides = [0, 1, 2, 3].map(
    (attackIndex) =>
      resolveBasicAttack({
        kind: "hero",
        heroId: hero.id,
        wing: hero.wing,
        melee: hero.melee,
        attackIndex,
      }).side,
  );
  assert.deepEqual(sides, ["left", "right", "left", "right"], hero.id);
}

const game = read("./game.ts");
assert.match(game, /openMmaPunch/);
assert.match(game, /at: MMA_PUNCH_CONTACT/);
assert.match(game, /melee: true/);
assert.match(game, /if \(pellet\.melee\)/);
assert.match(game, /this\.landHit\(u, target, pellet\.dmg, pellet\.crit, pellet\.splashFrom\)/);
assert.match(game, /if \(u\.melee\) this\.landHit\(u, t, raw, crit\)/);
assert.match(game, /HOOLI_BURST_AT\[idx\]/);
assert.match(game, /at: ALEX_ROCKET_FIRE/);
assert.doesNotMatch(game, /mma-macgregor/);

const quad = read("./quad.ts");
assert.match(quad, /mmaPunchFrame\(mmaAge\)/);
assert.match(quad, /mmaPunchShift\(limb\?\.fist \?\? null, frame\)/);
assert.match(quad, /stillPlateLeanRadians\(def\.id, pose, frame, limb\?\.fist \?\? null\)/);
assert.doesNotMatch(quad, /leanPunchPlate/);

console.log("ok mma punch");
