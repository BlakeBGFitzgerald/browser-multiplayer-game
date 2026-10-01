import assert from "node:assert/strict";
import { usesWheelchair } from "./attackPose.ts";
import {
  STUN_PUSH,
  stunIsHeavy,
  stunPose,
  stunPushVector,
  stunShakeAmount,
  stunStandsUp,
} from "./stunReact.ts";

assert.equal(stunShakeAmount(0), 0);
assert.equal(stunShakeAmount(-1), 0);
assert.ok(stunShakeAmount(0.2) !== 0);
assert.ok(stunShakeAmount(1.1) > 0);

const quiet = stunPose({ stun: 0, time: 1.4, wheelchair: false, heavy: false });
assert.equal(quiet.x, 0);
assert.equal(quiet.y, 0);
assert.equal(quiet.rot, 0);
assert.equal(quiet.standUp, false);

const shaking = stunPose({ stun: 0.8, time: 0.17, wheelchair: false, heavy: false });
assert.ok(shaking.x !== 0 || shaking.y !== 0 || shaking.rot !== 0);
assert.equal(shaking.standUp, false);
assert.equal(shaking.upper, false);

const heavy = stunPose({ stun: 0.8, time: 0.17, wheelchair: false, heavy: true });
assert.ok(Math.abs(heavy.rot) > Math.abs(shaking.rot));
assert.equal(stunIsHeavy("Tank / Fighter"), true);
assert.equal(stunIsHeavy("Fighter / Tank"), true);
assert.equal(stunIsHeavy("Assassin / Fighter"), false);

for (const id of ["maga-ricky", "lw-hocking", "wild-legend"]) {
  assert.equal(usesWheelchair(id), true, id);
  assert.equal(stunStandsUp(id), false, id);
  const chair = stunPose({ stun: 1, time: 0.2, wheelchair: true, heavy: false });
  assert.equal(chair.standUp, false, id);
  assert.equal(chair.upper, true, id);
  assert.equal(chair.x, 0, id);
  assert.equal(chair.y, 0, id);
  assert.notEqual(chair.rot, 0, id);
}

const ended = stunPose({ stun: 0, time: 3, wheelchair: true, heavy: true });
assert.equal(ended.rot, 0);
assert.equal(ended.x, 0);
assert.equal(stunStandsUp("mma-macgregor"), false);
assert.equal(stunStandsUp("maga-tommy"), false);

assert.ok(STUN_PUSH >= 24 && STUN_PUSH <= 72);
const away = stunPushVector(0, { x: 100, y: 100 }, { x: 40, y: 100 });
assert.ok(away.x > 0, `push x ${away.x}`);
assert.ok(Math.abs(away.y) < 1e-6);
assert.ok(Math.hypot(away.x, away.y) > STUN_PUSH - 0.01);
assert.ok(Math.hypot(away.x, away.y) < STUN_PUSH + 0.01);

const back = stunPushVector(0, { x: 10, y: 10 }, { x: 10, y: 10 });
assert.ok(back.x < 0, `facing back ${back.x}`);
assert.ok(Math.hypot(back.x, back.y) > STUN_PUSH - 0.01);

console.log("ok stun react");
