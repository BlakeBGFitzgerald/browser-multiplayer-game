import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { armLayer } from "./attackPose.ts";
import { heroById } from "./heroes.ts";
import {
  HALF_DRAW_SCALE,
  HERO_DRAW_SCALE,
  TRUMP_DRAW_HEIGHT,
  TRUMP_HERO_ID,
  heroDrawHeight,
  heroDrawScale,
  heroHitRadius,
} from "./heroHeight.ts";
import { pixelKit } from "./pixelRoster.ts";
import { runningArmSwing } from "./runArms.ts";
import {
  SNOW_RELEASE_FRAME,
  SNOWBALL_END,
  SNOWBALL_HERO_ID,
  SNOWBALL_RELEASE,
  snowballArmLayer,
  snowballBodyPose,
  snowballFrame,
  snowballHandOffset,
  snowballPresentation,
  snowballSpawn,
} from "./snowball.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

assert.equal(SNOWBALL_HERO_ID, "wild-slush");
assert.equal(HALF_DRAW_SCALE, 0.5);
assert.equal(heroDrawScale(SNOWBALL_HERO_ID), 0.5);
assert.equal(heroDrawScale("maga-quirk"), 1);
assert.equal(heroDrawScale(TRUMP_HERO_ID), HERO_DRAW_SCALE);
assert.equal(heroDrawScale("wild-cezanne"), 0.88);
assert.equal(heroDrawHeight(SNOWBALL_HERO_ID), TRUMP_DRAW_HEIGHT);
assert.equal(TRUMP_DRAW_HEIGHT * heroDrawScale(SNOWBALL_HERO_ID), TRUMP_DRAW_HEIGHT * 0.5);
assert.equal(heroHitRadius(SNOWBALL_HERO_ID), 11);
assert.equal(heroHitRadius("maga-quirk"), 22);

const slush = heroById(SNOWBALL_HERO_ID);
assert.equal(slush.name, "Sgt. Slush");
assert.equal(slush.melee, false);
assert.ok(slush.range >= 300);
assert.equal(slush.damage, 51);
assert.ok(slush.abilities.length === 4);

assert.equal(snowballFrame(SNOWBALL_RELEASE), SNOW_RELEASE_FRAME);
assert.equal(snowballPresentation(SNOWBALL_RELEASE).pose, "attack");
const hand = snowballHandOffset(SNOW_RELEASE_FRAME);
assert.notEqual(hand.x, 0);
assert.notEqual(hand.y, 0);
const spawned = snowballSpawn(100, 200, 0, SNOW_RELEASE_FRAME);
assert.notEqual(spawned.x, 100);
assert.notEqual(spawned.y, 200);

const throwing = { dead: false, stunned: false, age: SNOWBALL_RELEASE, running: true };
assert.equal(snowballBodyPose(throwing), "attack");
assert.equal(snowballArmLayer(throwing), "attack");
assert.equal(armLayer({ attacking: true, running: true }), "attack");
assert.equal(runningArmSwing(pixelKit(SNOWBALL_HERO_ID), "attack", true).swing, false);
assert.equal(runningArmSwing(pixelKit(SNOWBALL_HERO_ID), "attack", false).swing, false);
assert.equal(runningArmSwing(pixelKit(SNOWBALL_HERO_ID), "walk", true).swing, true);

assert.equal(snowballBodyPose({ dead: false, stunned: true, age: SNOWBALL_RELEASE, running: true }), "idle");
assert.equal(snowballArmLayer({ dead: false, stunned: true, age: SNOWBALL_RELEASE, running: true }), "idle");
assert.equal(snowballBodyPose({ dead: true, stunned: false, age: SNOWBALL_RELEASE, running: false }), "death");
assert.equal(snowballBodyPose({ dead: false, stunned: false, age: SNOWBALL_END, running: true }), "walk");
assert.equal(snowballBodyPose({ dead: false, stunned: false, age: 0, running: false }), "idle");

const quad = read("./quad.ts");
const poseAt = quad.indexOf("const pose = dead");
const stunPose = quad.indexOf('? "idle"', poseAt);
const snowPose = quad.indexOf(": snowCue", poseAt);
assert.ok(poseAt > 0 && stunPose > poseAt && snowPose > stunPose);
assert.match(quad, /stunned\s*\n\s*\? "idle"\s*\n\s*: snowCue/);
assert.match(quad, /snowballSpawn\(u\.x, u\.y, ang\)/);
assert.match(read("./game.ts"), /snowballSpawn\(u\.x, u\.y, face\)/);
assert.match(read("./heroInk.ts"), /isSlush\(kit\) && r\.pose === "attack"/);

console.log(
  `ok slush ${SNOWBALL_HERO_ID} draw ${TRUMP_DRAW_HEIGHT * 0.5} release ${SNOWBALL_RELEASE}s hand ${hand.x},${hand.y}`,
);
