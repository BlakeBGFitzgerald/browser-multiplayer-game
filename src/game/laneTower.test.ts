import assert from "node:assert/strict";
import { heroDrawScale, TRUMP_DRAW_HEIGHT, TRUMP_HERO_ID } from "./heroHeight.ts";
import {
  LANE_TOWER_FOOT,
  LANE_TOWER_HEIGHT,
  LANE_TOWER_SCALE,
  laneTowerBody,
  laneTowerDrawHeight,
  laneTowerMuzzle,
  laneTowerRadius,
  laneTowerSmokeY,
} from "./laneTower.ts";
import { SUPPLIED_ANCIENT_FOOT, SUPPLIED_ANCIENT_HEIGHT, SUPPLIED_FOUNTAIN_FOOT, SUPPLIED_FOUNTAIN_HEIGHT } from "./suppliedArt.ts";

const trumpDrawn = TRUMP_DRAW_HEIGHT * heroDrawScale(TRUMP_HERO_ID);
const previous = trumpDrawn * 1.12;
const height = previous * 1.05;
assert.equal(TRUMP_HERO_ID, "maga-grumptor");
assert.equal(height / previous, 1.05);
assert.equal(LANE_TOWER_HEIGHT, height);
assert.equal(SUPPLIED_ANCIENT_HEIGHT, height);
assert.equal(SUPPLIED_FOUNTAIN_HEIGHT, height);
assert.equal(SUPPLIED_ANCIENT_FOOT, 28);
assert.equal(SUPPLIED_FOUNTAIN_FOOT, 22);
assert.equal(LANE_TOWER_SCALE, height / 104);
assert.equal(LANE_TOWER_FOOT, 16);

for (const tier of ["outer", "middle", "inner", undefined, "nope"] as const) {
  assert.equal(laneTowerDrawHeight(tier), height);
  assert.equal(laneTowerBody(tier), 25 * LANE_TOWER_SCALE);
  assert.equal(laneTowerRadius(tier), 24 * LANE_TOWER_SCALE);
}

assert.equal(laneTowerDrawHeight("outer"), laneTowerDrawHeight("middle"));
assert.equal(laneTowerDrawHeight("middle"), laneTowerDrawHeight("inner"));
assert.equal(laneTowerBody("inner"), laneTowerBody("outer"));
assert.equal(laneTowerRadius("inner"), laneTowerRadius("outer"));

const home = laneTowerMuzzle(100, 200, true);
const away = laneTowerMuzzle(100, 200, false);
assert.equal(home.y, away.y);
assert.equal(home.y, 200 - 36 * LANE_TOWER_SCALE);
assert.equal(laneTowerSmokeY(200), 200 - 28 * LANE_TOWER_SCALE);
assert.ok(home.y < 200);
assert.ok(Math.abs(home.x - 100 - 22 * LANE_TOWER_SCALE) < 1e-9);
assert.ok(Math.abs(100 - away.x - 22 * LANE_TOWER_SCALE) < 1e-9);
assert.notEqual(home.x, 100);

console.log("ok lane towers");
console.log(`tower height ${height}`);
