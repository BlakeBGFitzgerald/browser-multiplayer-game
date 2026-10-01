import assert from "node:assert/strict";
import { HEROES } from "./heroes.ts";
import { HERO_WEAPONS } from "./heroWeapons.ts";
import { projectileLook } from "./projectileLook.ts";

const EXPECT: Record<string, string> = {
  "nerf-launcher": "foam-rocket",
  boom: "mic-capsule",
  "lion-staff": "staff-spark",
  "stud-carbine": "tracer",
  prompter: "paper-slug",
  podium: "sound-bolt",
  rail: "metal-bolt",
  horn: "note-bolt",
  pipette: "green-drop",
  "vine-crossbow": "crossbow-bolt",
  camera: "flash-cube",
  dossier: "paper-scrap",
  flash: "flash-disc",
  drone: "quad-spark",
  palette: "paint-glob",
  "vine-bow": "vine-arrow",
};

const seen = new Set<string>();
for (const spec of Object.values(HERO_WEAPONS)) {
  const id = projectileLook({ heroId: spec.id, source: "hero" }).id;
  assert.equal(id, EXPECT[spec.type], spec.id);
  assert.equal(seen.has(id), false, id);
  seen.add(id);
}
assert.equal(seen.size, Object.keys(HERO_WEAPONS).length);

const blue = projectileLook({ ammo: "nerf-blue", heroId: "maga-alexgroans", source: "hero" });
const orange = projectileLook({ ammo: "nerf-orange", heroId: "maga-alexgroans", source: "spell" });
assert.equal(blue.id, "foam-rocket");
assert.equal(orange.id, "foam-rocket");
assert.equal(blue.dye, "nerf-blue");
assert.equal(orange.dye, "nerf-orange");
assert.notEqual(blue.dye, orange.dye);
assert.notEqual(blue.color, orange.color);

const homeArrow = projectileLook({ source: "archer", team: "home" });
const awayArrow = projectileLook({ source: "archer", team: "away" });
assert.match(homeArrow.id, /arrow/);
assert.match(awayArrow.id, /arrow/);
assert.notEqual(homeArrow.id, awayArrow.id);
assert.notEqual(homeArrow.accent, awayArrow.accent);

const homeTower = projectileLook({ source: "tower", team: "home" });
const awayTower = projectileLook({ source: "tower", team: "away" });
assert.notEqual(homeTower.id, awayTower.id);
assert.notEqual(homeTower.id, "foam-rocket");
assert.notEqual(awayTower.id, "foam-rocket");
assert.equal(seen.has(homeTower.id), false);
assert.equal(seen.has(awayTower.id), false);

for (const hero of HEROES) {
  if (!hero.melee) continue;
  const look = projectileLook({ heroId: hero.id, source: "hero" });
  assert.equal(seen.has(look.id), false, hero.id);
}

assert.equal(projectileLook({ ammo: "can", heroId: "maga-rogentor", source: "hero" }).id, "can");
assert.equal(projectileLook({ ammo: "bottle", source: "spell" }).id, "bottle");
assert.equal(projectileLook({ heroId: "maga-rogentor", source: "spell", color: "#c9a24a" }).id, "ability-spark");

assert.doesNotThrow(() => {
  projectileLook(undefined);
  projectileLook(null);
  projectileLook({});
  projectileLook({ heroId: "no-such", ammo: "plasma", source: "siege", team: "sideways", color: "" });
});

console.log("ok projectile looks");
for (const spec of Object.values(HERO_WEAPONS)) {
  console.log(`${spec.id} ${spec.type} ${EXPECT[spec.type]}`);
}
