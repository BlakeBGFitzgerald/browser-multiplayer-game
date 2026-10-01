import assert from "node:assert/strict";
import { pixelKit } from "./pixelRoster.ts";
import { runningArmOffset, runningArmSwing } from "./runArms.ts";

const onFoot = pixelKit("maga-vestyt");
const otherOnFoot = pixelKit("wild-cartoons");
const wheel = pixelKit("maga-ricky");
const wheelProp = pixelKit("lw-hocking");
const wheelLegend = pixelKit("wild-legend");
const weapon = pixelKit("maga-hooli");
const nerf = pixelKit("maga-alexgroans");
const gloves = pixelKit("mma-macgregor");

assert.equal(onFoot.prop, "none");
assert.equal(onFoot.body === "chair" || onFoot.gait === "roll", false);

const moving = runningArmSwing(onFoot, "walk", true);
assert.equal(moving.id, "maga-vestyt");
assert.equal(moving.swing, true);
assert.equal(moving.usesWheelchair, false);
assert.equal(moving.weaponPriority, false);
assert.equal(runningArmSwing(onFoot, "walk", false).swing, true);

for (const pose of ["idle", "attack", "cast", "hurt", "death"] as const) {
  const decision = runningArmSwing(onFoot, pose, true);
  assert.equal(decision.swing, false, pose);
  assert.equal(decision.id, "maga-vestyt", pose);
}

assert.equal(runningArmSwing(onFoot, "ult", false).swing, false);
assert.equal(runningArmSwing(onFoot, "victory", true).swing, false);

for (const kit of [wheel, wheelProp, wheelLegend]) {
  const near = runningArmSwing(kit, "walk", true);
  const far = runningArmSwing(kit, "walk", false);
  assert.equal(near.usesWheelchair, true, kit.id);
  assert.equal(near.swing, false, kit.id);
  assert.equal(far.swing, false, kit.id);
  assert.equal(near.id, kit.id);
}

const held = runningArmSwing(weapon, "walk", true);
const far = runningArmSwing(weapon, "walk", false);
assert.equal(held.id, "maga-hooli");
assert.equal(held.weaponPriority, true);
assert.equal(held.swing, false);
assert.equal(far.weaponPriority, false);
assert.equal(far.swing, true);
assert.equal(runningArmSwing(weapon, "attack", true).swing, false);
assert.equal(runningArmSwing(weapon, "attack", true).weaponPriority, true);
assert.equal(runningArmSwing(weapon, "attack", false).swing, false);

const groans = runningArmSwing(nerf, "walk", true);
assert.equal(groans.id, "maga-alexgroans");
assert.equal(groans.weaponPriority, true);
assert.equal(groans.swing, false);
assert.equal(runningArmSwing(nerf, "walk", false).swing, true);

assert.equal(runningArmSwing(gloves, "walk", true).weaponPriority, true);
assert.equal(runningArmSwing(gloves, "walk", false).weaponPriority, true);
assert.equal(runningArmSwing(gloves, "walk", true).swing, false);
assert.equal(runningArmSwing(gloves, "walk", false).swing, false);

const again = runningArmSwing(onFoot, "walk", true);
const wheeled = runningArmSwing(wheel, "walk", true);
const other = runningArmSwing(otherOnFoot, "walk", true);
assert.equal(again.id, "maga-vestyt");
assert.equal(again.swing, true);
assert.equal(wheeled.id, "maga-ricky");
assert.equal(wheeled.swing, false);
assert.equal(other.id, "wild-cartoons");
assert.equal(other.swing, true);
assert.equal(other.usesWheelchair, false);
assert.equal(runningArmSwing(weapon, "walk", true).id, "maga-hooli");
assert.equal(runningArmSwing(onFoot, "walk", true).swing, true);

const forward = runningArmOffset(-3, true);
const back = runningArmOffset(-3, false);
assert.ok(forward > 0);
assert.ok(back < 0);
assert.equal(forward, -back);
assert.ok(runningArmOffset(3, true) < 0);
assert.ok(Math.abs(runningArmOffset(10, true)) <= 2);
assert.equal(runningArmOffset(0, true), 0);

console.log("ok running arm swing");
