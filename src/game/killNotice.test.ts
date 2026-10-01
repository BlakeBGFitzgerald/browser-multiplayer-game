import assert from "node:assert/strict";
import { queueKillSound, soundIdForKillNotice, soundsForKillTrigger } from "./killNotice.ts";

const firstBlood = soundIdForKillNotice("first-blood");
assert.equal(firstBlood, "sting-first-blood");
assert.equal(soundIdForKillNotice("FIRST BLOOD!"), firstBlood);

const event = soundsForKillTrigger({ firstBlood: true, streak: 1, shutdown: 0 });
assert.equal(event.length, 1);
assert.equal(event[0]!.notice, "first-blood");
assert.equal(event[0]!.sound, firstBlood);

const repeated = queueKillSound(event, "FIRST BLOOD!");
assert.equal(repeated.length, 1);
assert.equal(repeated[0]!.sound, firstBlood);

const normal = soundsForKillTrigger({ firstBlood: false, streak: 1, shutdown: 0 });
assert.equal(normal.length, 1);
assert.equal(normal[0]!.sound, "hit-kill");
assert.notEqual(normal[0]!.sound, firstBlood);

const streaks = [2, 3, 4, 5, 6, 7].map(
  (n) => soundsForKillTrigger({ firstBlood: false, streak: n, shutdown: 0 })[0]!.sound,
);
assert.equal(new Set(streaks).size, streaks.length);
for (const sound of streaks) assert.notEqual(sound, firstBlood);
assert.equal(
  soundsForKillTrigger({ firstBlood: false, streak: 7, shutdown: 0 })[0]!.sound,
  soundsForKillTrigger({ firstBlood: false, streak: 10, shutdown: 0 })[0]!.sound,
);
assert.equal(soundsForKillTrigger({ firstBlood: false, streak: 1, shutdown: 4 })[0]!.notice, "shutdown");
assert.equal(soundsForKillTrigger({ firstBlood: false, streak: 3, shutdown: 4 })[0]!.notice, "hat-trick");
assert.equal(soundsForKillTrigger({ firstBlood: true, streak: 3, shutdown: 4 })[0]!.notice, "first-blood");

console.log("ok kill notice");
