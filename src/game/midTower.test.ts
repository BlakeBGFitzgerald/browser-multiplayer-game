import assert from "node:assert/strict";
import { AWAY_TOWER_T, HOME_TOWER_T, towers } from "./map.ts";

assert.equal(HOME_TOWER_T.mid.outer, 0.36);
assert.equal(HOME_TOWER_T.mid.inner, 0.08);
assert.equal(AWAY_TOWER_T.mid.outer, 0.64);
assert.equal(AWAY_TOWER_T.mid.inner, 0.92);
assert.equal(HOME_TOWER_T.mid.middle, 0.31);
assert.equal(AWAY_TOWER_T.mid.middle, 0.69);
assert.deepEqual(HOME_TOWER_T.top, { inner: 0.07, middle: 0.26, outer: 0.44 });
assert.deepEqual(HOME_TOWER_T.bot, { inner: 0.03, middle: 0.18, outer: 0.34 });
assert.deepEqual(AWAY_TOWER_T.top, { inner: 0.93, middle: 0.74, outer: 0.56 });
assert.deepEqual(AWAY_TOWER_T.bot, { inner: 0.88, middle: 0.7, outer: 0.46 });

const mid = towers.filter((t) => t.lane === "mid");
const midMiddle = mid.filter((t) => t.tier === "middle");
assert.equal(midMiddle.length, 0);

for (const team of ["home", "away"] as const) {
  const side = mid.filter((t) => t.team === team);
  assert.deepEqual(
    side.map((t) => t.tier).sort(),
    ["inner", "outer"],
  );
}

for (const lane of ["top", "bot"] as const) {
  for (const team of ["home", "away"] as const) {
    const tiers = towers.filter((t) => t.lane === lane && t.team === team).map((t) => t.tier);
    assert.equal(tiers.includes("middle"), true, `${team} ${lane}`);
    assert.equal(tiers.length, 3);
  }
}

assert.equal(towers.length, 16);
console.log("ok mid towers");
