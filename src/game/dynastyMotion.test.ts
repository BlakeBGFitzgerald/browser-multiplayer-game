import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ATTACK_MOTION_MID_FRAME, heroAttackMotion, leansStillPlate, stillPlateLeanRadians } from "./attackLean.ts";
import {
  dynastyAttackAmount,
  dynastyAttackHand,
  dynastyAttackPhase,
  dynastyMoveGait,
  dynastyReleaseHand,
  DYNASTY_ID,
} from "./dynastyMotion.ts";
import { heroDrawScale, scaleSuppliedOffset, TRUMP_DRAW_HEIGHT } from "./heroHeight.ts";
import { heroById } from "./heroes.ts";
import { heroWeaponMuzzle } from "./heroWeapons.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

const hero = heroById(DYNASTY_ID);
assert.equal(hero.melee, false);
assert.equal(hero.name, "The Reality Dynasty");
assert.equal(heroDrawScale(DYNASTY_ID), 1);
assert.equal(TRUMP_DRAW_HEIGHT * heroDrawScale(DYNASTY_ID), TRUMP_DRAW_HEIGHT);

for (const frame of [0, 1, 2, 3, 4, 5, 6, 7]) {
  const gait = dynastyMoveGait("walk", frame);
  assert.ok(Math.abs(gait) > 0.2, `walk ${frame} ${gait}`);
}

assert.ok(Math.abs(dynastyMoveGait("idle", 3)) < 1e-6);
assert.ok(Math.abs(dynastyMoveGait("idle", 0)) < 1e-6);

const mid = ATTACK_MOTION_MID_FRAME;
assert.ok(Math.abs(dynastyMoveGait("attack", mid)) < 1e-6);
assert.equal(dynastyAttackPhase("attack", mid), "release");
assert.ok(dynastyAttackAmount("attack", mid) > 0.9);
assert.equal(dynastyAttackAmount("walk", 3), 0);
assert.equal(dynastyAttackAmount("idle", 2), 0);

assert.equal(dynastyMoveGait("walk", 2, true), 0);
assert.equal(dynastyAttackPhase("attack", mid, true), "none");
assert.equal(dynastyAttackAmount("attack", mid, true), 0);
assert.equal(dynastyMoveGait("death", 4), 0);
assert.equal(dynastyAttackPhase("death", mid), "none");

const wind = dynastyAttackHand("attack", 6);
const shot = dynastyAttackHand("attack", mid);
const tuck = dynastyAttackHand("attack", 10);
assert.ok(wind && shot && tuck);
assert.ok(shot.x > wind.x + 20, `release ${shot.x} windup ${wind.x}`);
assert.equal(dynastyAttackPhase("attack", 6), "windup");
assert.equal(dynastyAttackPhase("attack", 10), "recover");

const hand = dynastyReleaseHand();
const muzzle = heroWeaponMuzzle(DYNASTY_ID, 0, 0, 0, "attack", 0);
const scaled = scaleSuppliedOffset(hand.x, hand.y);
assert.ok(Math.abs(scaled.x - muzzle.x) < 0.75, `hand ${scaled.x} muzzle ${muzzle.x}`);
assert.ok(Math.abs(scaled.y - muzzle.y) < 0.75, `hand ${scaled.y} muzzle ${muzzle.y}`);

assert.equal(leansStillPlate(DYNASTY_ID), false);
assert.equal(stillPlateLeanRadians(DYNASTY_ID, "attack", mid), 0);
const motion = heroAttackMotion(DYNASTY_ID, "attack", mid);
assert.equal(motion.source, "plate");
assert.ok(motion.amount > 0.9);
assert.equal(heroAttackMotion(DYNASTY_ID, "walk", 3).amount, 0);
assert.equal(heroAttackMotion(DYNASTY_ID, "idle", 2).amount, 0);

const quad = read("./quad.ts");
assert.match(quad, /applyDynastyBob\(ctx, u\.x, u\.y, pose, frame, dead \|\| stunned\)/);
assert.match(quad, /drawDynastyMotion\(ctx, u\.x, u\.y, flip, pose, frame, dead \|\| stunned\)/);
const bobAt = quad.indexOf("applyDynastyBob(ctx");
const blitAt = quad.indexOf("drawSuppliedHero(ctx, def.id");
const armAt = quad.indexOf("drawDynastyMotion(ctx");
assert.ok(bobAt > 0 && bobAt < blitAt && blitAt < armAt);

console.log(`ok dynasty ranged walk ${dynastyMoveGait("walk", 1)} attack ${motion.amount}`);
