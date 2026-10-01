import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HEROES } from "./heroes.ts";
import { bookSwingAmount } from "./bookSwing.ts";
import { lollipopWaveRadians, RIVE_WADEN_ID } from "./lollipopWave.ts";
import { ALEX_GROANS_ID, ALEX_ROCKET_FIRE, alexRocketPresentation } from "./nerf.ts";
import { HOOLI_ID } from "./heroes.ts";
import { usesWheelchair } from "./attackPose.ts";
import {
  ATTACK_MOTION_MID_FRAME,
  attackPoseLive,
  attackSwingPulse,
  heroAttackMotion,
  hooliAttackBody,
  leansStillPlate,
  plateLeanRadians,
  stillPlateLeanRadians,
} from "./attackLean.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

assert.equal(ATTACK_MOTION_MID_FRAME, 8);
assert.equal(attackSwingPulse("idle", 8), 0);
assert.equal(attackSwingPulse("walk", 8), 0);
assert.equal(attackSwingPulse("attack", 4), 0);
assert.equal(attackSwingPulse("attack", 11), 0);
assert.equal(attackPoseLive(0), false);
assert.equal(attackPoseLive(0.2), true);
assert.equal(attackPoseLive(0.99), true);
assert.equal(attackPoseLive(1), false);
assert.equal(attackPoseLive(Number.NaN), false);
const midPulse = attackSwingPulse("attack", ATTACK_MOTION_MID_FRAME);
assert.ok(midPulse > 0.9, `mid pulse ${midPulse}`);
assert.ok(midPulse > attackSwingPulse("attack", 5));
assert.ok(midPulse > attackSwingPulse("attack", 10));

assert.equal(HEROES.length, 38);
for (const hero of HEROES) {
  const idle = heroAttackMotion(hero.id, "idle", 2);
  const walk = heroAttackMotion(hero.id, "walk", 3);
  const mid = heroAttackMotion(hero.id, "attack", ATTACK_MOTION_MID_FRAME);
  assert.equal(idle.amount, 0, `${hero.id} idle`);
  assert.equal(walk.amount, 0, `${hero.id} walk`);
  assert.ok(Math.abs(mid.amount) > 0, `${hero.id} ${mid.source} ${mid.amount}`);
}

const alex = heroAttackMotion(ALEX_GROANS_ID, "attack", ATTACK_MOTION_MID_FRAME);
assert.equal(alex.source, "rocket");
assert.equal(heroAttackMotion(ALEX_GROANS_ID, "idle", 4).amount, 0);
assert.equal(ALEX_ROCKET_FIRE, 0.18);
const raised = alexRocketPresentation(ALEX_ROCKET_FIRE * 0.5);
assert.equal(raised.pose, "idle");
assert.ok(raised.lean < -0.04, `raise ${raised.lean}`);
const fired = alexRocketPresentation(ALEX_ROCKET_FIRE);
assert.equal(fired.pose, "attack");
assert.equal(fired.lean, 0);
assert.equal(fired.frame, 4);

const boris = heroAttackMotion("maga-boris", "attack", ATTACK_MOTION_MID_FRAME);
assert.equal(boris.source, "book");
assert.equal(boris.amount, bookSwingAmount("attack", ATTACK_MOTION_MID_FRAME));
assert.equal(heroAttackMotion("maga-boris", "idle", 5).amount, 0);
assert.equal(bookSwingAmount("attack", 11), 0);

const pheobe = heroAttackMotion(RIVE_WADEN_ID, "attack", ATTACK_MOTION_MID_FRAME);
assert.equal(pheobe.source, "lollipop");
assert.equal(pheobe.amount, lollipopWaveRadians(RIVE_WADEN_ID, "attack", ATTACK_MOTION_MID_FRAME));
assert.ok(pheobe.amount > 0.45);
assert.equal(heroAttackMotion(RIVE_WADEN_ID, "idle", 8).amount, 0);
assert.ok(Math.abs(lollipopWaveRadians(RIVE_WADEN_ID, "attack", 11)) < 1e-9);

const hooli = heroAttackMotion(HOOLI_ID, "attack", ATTACK_MOTION_MID_FRAME);
assert.equal(hooli.source, "burst");
assert.equal(hooli.amount, hooliAttackBody(ATTACK_MOTION_MID_FRAME));
assert.notEqual(hooli.amount, 0);
assert.equal(heroAttackMotion(HOOLI_ID, "idle", 6).amount, 0);

for (const id of ["maga-ricky", "lw-hocking", "wild-legend"]) {
  assert.equal(usesWheelchair(id), true, id);
  assert.equal(leansStillPlate(id), false, id);
  const motion = heroAttackMotion(id, "attack", ATTACK_MOTION_MID_FRAME);
  assert.equal(motion.source, "sheet", id);
  assert.notEqual(motion.amount, 0, id);
  assert.equal(stillPlateLeanRadians(id, "attack", ATTACK_MOTION_MID_FRAME, null), 0, id);
}

for (const id of ["mma-macgregor", "mma-adesanyaish", "mma-poirierish"]) {
  assert.equal(leansStillPlate(id), true, id);
  const motion = heroAttackMotion(id, "attack", ATTACK_MOTION_MID_FRAME);
  assert.equal(motion.source, "plate", id);
  assert.ok(motion.amount > 0.2, `${id} ${motion.amount}`);
  assert.equal(heroAttackMotion(id, "attack", 11).amount, 0, id);
  assert.equal(heroAttackMotion(id, "idle", 8).amount, 0, id);
}

assert.equal(heroAttackMotion("maga-steers", "attack", ATTACK_MOTION_MID_FRAME).source, "cycle");
assert.equal(heroAttackMotion("mma-nurmagoat", "attack", ATTACK_MOTION_MID_FRAME).source, "cycle");
assert.equal(leansStillPlate("maga-steers"), false);
assert.equal(leansStillPlate("mma-nurmagoat"), false);
assert.equal(heroAttackMotion("mma-jonesy", "attack", ATTACK_MOTION_MID_FRAME).source, "procedural");
assert.equal(heroAttackMotion("mma-diazish", "attack", ATTACK_MOTION_MID_FRAME).source, "procedural");

const swing = plateLeanRadians({ melee: true, chair: false, pose: "attack", frame: 8, side: null });
const brace = plateLeanRadians({ melee: false, chair: false, pose: "attack", frame: 8, side: null });
const chair = plateLeanRadians({ melee: true, chair: true, pose: "attack", frame: 8, side: "hook" });
assert.ok(swing > 0.3);
assert.ok(brace < -0.15);
assert.ok(chair > 0 && chair < swing * 0.5);
const leftLean = plateLeanRadians({ melee: true, chair: false, pose: "attack", frame: 8, side: "left" });
const rightLean = plateLeanRadians({ melee: true, chair: false, pose: "attack", frame: 8, side: "right" });
assert.ok(leftLean > 0.2, `left ${leftLean}`);
assert.ok(rightLean < -0.2, `right ${rightLean}`);
assert.ok(leftLean * rightLean < 0);
assert.equal(plateLeanRadians({ melee: true, chair: false, pose: "idle", frame: 8, side: null }), 0);
assert.equal(plateLeanRadians({ melee: true, chair: false, pose: "attack", frame: 11, side: null }), 0);
assert.equal(plateLeanRadians({ melee: false, chair: true, pose: "attack", frame: 11, side: null }), 0);

const leanSrc = read("./attackLean.ts");
assert.doesNotMatch(leanSrc, /mma-macgregor/);
assert.doesNotMatch(leanSrc, /maga-grumptor/);
assert.match(leanSrc, /suppliedHeroUrl/);
assert.match(leanSrc, /ALEX_GROANS_ID/);
assert.match(leanSrc, /RIVE_WADEN_ID/);
assert.match(leanSrc, /isHooliId/);
assert.match(leanSrc, /kitHoldsSwungBook/);

const quad = read("./quad.ts");
assert.match(quad, /stillPlateLeanRadians\(def\.id, pose, frame, limb\?\.fist \?\? null\)/);
assert.match(quad, /leanLauncher\(ctx, u\.x, u\.y, flip, plateLean\)/);
assert.match(quad, /alexRocketPresentation\(alexAge\)/);
assert.match(quad, /alexMuzzleOn\(alexAge\)/);
assert.doesNotMatch(quad, /leanPunchPlate/);

const art = read("./suppliedArt.ts");
assert.match(art, /lollipopWaveRadians\(id, pose, frame\)/);
const weapons = read("./heroWeapons.ts");
assert.match(weapons, /_phase = 0,\n\): void \{\}/);

console.log("ok attack lean");
