import assert from "node:assert/strict";
import {
  DeathCounts,
  baseRespawnTime,
  firstDeathSeconds,
  heroRespawnSeconds,
  maximumRespawnTime,
  respawnTimeIncreasePerDeath,
} from "./respawn.ts";

const level = 4;
const base = firstDeathSeconds(level);
assert.equal(base, baseRespawnTime + level * 1.6);
assert.equal(firstDeathSeconds(1), 6 + 1 * 1.6);

const counts = new DeathCounts();
const first = counts.noteDeath("red", level);
assert.equal(counts.count("red"), 1);
assert.equal(first, base);
assert.equal(first, heroRespawnSeconds(1, level));

const second = counts.noteDeath("red", level);
const third = counts.noteDeath("red", level);
assert.equal(counts.count("red"), 3);
assert.equal(second, first + respawnTimeIncreasePerDeath);
assert.equal(third, second + respawnTimeIncreasePerDeath);
assert.equal(second, heroRespawnSeconds(2, level));
assert.equal(third, heroRespawnSeconds(3, level));

const otherLevel = 2;
const blueFirst = counts.noteDeath("blue", otherLevel);
assert.equal(counts.count("blue"), 1);
assert.equal(counts.count("red"), 3);
assert.equal(blueFirst, firstDeathSeconds(otherLevel));
const blueSecond = counts.noteDeath("blue", otherLevel);
assert.equal(blueSecond, blueFirst + respawnTimeIncreasePerDeath);
assert.equal(counts.count("red"), 3);

let capped = 0;
for (let n = 0; n < 40; n++) {
  capped = counts.noteDeath("cap", 11);
  assert.ok(capped <= maximumRespawnTime);
}
assert.equal(capped, maximumRespawnTime);
assert.equal(heroRespawnSeconds(1, 11), firstDeathSeconds(11));
assert.ok(firstDeathSeconds(11) <= maximumRespawnTime);
const over = firstDeathSeconds(11) + 30 * respawnTimeIncreasePerDeath;
assert.ok(over > maximumRespawnTime);
assert.equal(heroRespawnSeconds(31, 11), maximumRespawnTime);

counts.reset();
assert.equal(counts.count("red"), 0);
assert.equal(counts.count("blue"), 0);
assert.equal(counts.count("cap"), 0);
const restarted = counts.noteDeath("red", level);
assert.equal(counts.count("red"), 1);
assert.equal(restarted, base);
assert.equal(counts.count("blue"), 0);

console.log("ok respawn");
