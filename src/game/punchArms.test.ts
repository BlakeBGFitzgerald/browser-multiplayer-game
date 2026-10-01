import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HEROES } from "./heroes.ts";
import { armLayer, posePriority, resolveBasicAttack } from "./attackPose.ts";
import { MMA_PUNCH_CONTACT, MMA_PUNCH_END, mmaPunchFrame } from "./mmaPunch.ts";
import { pixelKit } from "./pixelRoster.ts";
import {
  PUNCH_ARM_REACH,
  attackArmPulse,
  guardArmExtend,
  laneMeleeSwing,
  punchingArmExtend,
  sheetMeleeStrike,
  sideArmExtend,
  suppliedMmaStill,
} from "./punchArms.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

const contact = mmaPunchFrame(MMA_PUNCH_CONTACT);
const settled = mmaPunchFrame(MMA_PUNCH_END);
assert.equal(contact, 7);
assert.equal(settled, 11);
assert.ok(PUNCH_ARM_REACH >= 36);

const plates = HEROES.filter((hero) => suppliedMmaStill(hero.id, hero.wing));
assert.deepEqual(
  plates.map((hero) => hero.id).sort(),
  ["mma-adesanyaish", "mma-macgregor", "mma-poirierish"],
);
assert.equal(suppliedMmaStill("mma-nurmagoat", "mma"), false);
assert.equal(suppliedMmaStill("mma-jonesy", "mma"), false);
assert.equal(suppliedMmaStill("mma-macgregor", "wild"), false);
assert.equal(suppliedMmaStill("future-striker", "mma"), false);

for (const hero of plates) {
  for (const attackIndex of [0, 1, 2, 3]) {
    const side = resolveBasicAttack({
      kind: "hero",
      heroId: hero.id,
      wing: hero.wing,
      melee: hero.melee,
      prop: pixelKit(hero.id).prop,
      attackIndex,
    }).side;
    assert.ok(side === "left" || side === "right", hero.id);
    const hit = punchingArmExtend("attack", contact, side, false);
    assert.ok(hit > 20, `${hero.id} ${side} ${hit}`);
    assert.ok(Math.abs(hit - attackArmPulse("attack", contact) * PUNCH_ARM_REACH) < 1e-6);
    const other = side === "left" ? "right" : "left";
    assert.equal(sideArmExtend("attack", contact, other, side), guardArmExtend(), hero.id);
    assert.equal(punchingArmExtend("attack", settled, side), 0, hero.id);
    assert.equal(punchingArmExtend("attack", 4, side), 0, hero.id);
    assert.equal(punchingArmExtend("walk", contact, side), 0, hero.id);
    assert.equal(punchingArmExtend("run", contact, side), 0, hero.id);
    assert.equal(punchingArmExtend("idle", contact, side), 0, hero.id);
    assert.equal(punchingArmExtend("attack", contact, side, true), 0, hero.id);
    assert.equal(attackArmPulse("attack", contact, true), 0, hero.id);
  }
}

assert.equal(
  posePriority({ dead: false, ultimate: false, casting: false, attacking: true, running: true }),
  "attack",
);
assert.notEqual(armLayer({ attacking: true, running: true }), "run");
assert.equal(
  posePriority({ dead: false, ultimate: false, casting: false, attacking: true, running: true, stunned: true }),
  "idle",
);
assert.equal(posePriority({ dead: true, ultimate: false, casting: false, attacking: true, running: false, stunned: true }), "death");

assert.equal(sheetMeleeStrike("maga-tommy", "maga", true, true), true);
assert.equal(sheetMeleeStrike("maga-boris", "maga", true, true), false);
assert.equal(sheetMeleeStrike("mma-macgregor", "mma", true, false), false);
assert.equal(sheetMeleeStrike("mma-jonesy", "mma", true, false), false);
assert.equal(sheetMeleeStrike("maga-ricky", "maga", true, true), true);
assert.equal(sheetMeleeStrike("wild-legend", "wild", true, true), true);
assert.equal(sheetMeleeStrike("lw-hocking", "antifa", false, true), false);
assert.equal(sheetMeleeStrike("maga-hooli", "maga", false, true), false);
assert.equal(sheetMeleeStrike("future-striker", "mma", true, true), true);

const mid = laneMeleeSwing(0.4);
assert.ok(mid.active && mid.extend > 0.9, `lane ${mid.extend}`);
assert.equal(laneMeleeSwing(0).extend, 0);
assert.equal(laneMeleeSwing(0).active, false);
assert.equal(laneMeleeSwing(1).active, false);
assert.equal(laneMeleeSwing(0.8).extend, 0);

const quad = read("./quad.ts");
assert.match(quad, /suppliedMmaStill\(def\.id, def\.wing\)/);
assert.match(quad, /drawPlatePunchArms\(/);
assert.match(quad, /sheetMeleeStrike\(def\.id, def\.wing, def\.melee, !!sheetDef\(def\.id\)\)/);
assert.doesNotMatch(quad, /mma-macgregor/);

const ink = read("./heroInk.ts");
assert.match(ink, /attackArmPulse\(r\.pose, r\.frame\)/);
assert.match(ink, /INK_PUNCH_REACH/);

console.log("ok punch arms");
