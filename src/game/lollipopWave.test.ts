import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { lollipopWaveRadians, RIVE_WADEN_ID, RIVE_WADEN_PLATE } from "./lollipopWave.ts";
import { RIVER_WARDEN_PLATE, suppliedHeroUrl } from "./suppliedArt.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

const CEZANNE_PLATE = "/art/heroes/rive-waden.png";

assert.equal(RIVE_WADEN_ID, "wild-cezanne");
assert.equal(RIVE_WADEN_PLATE, CEZANNE_PLATE);
assert.equal(suppliedHeroUrl("wild-cezanne"), CEZANNE_PLATE);
assert.equal(RIVER_WARDEN_PLATE, CEZANNE_PLATE);
assert.equal(existsSync(new URL("../../public/art/heroes/rive-waden.png", import.meta.url)), true);

const heroes = read("./heroes.ts");
assert.match(
  heroes,
  /H\("wild-cezanne", "Pheobe", "Paint Controller", "Mage \/ Controller", "int", "#ce93d8", 570, 430, 42, 410, 298, 2, false,/,
);
assert.match(heroes, /"wild-cezanne"[\s\S]{0,800}\], "wild", true,/);

assert.equal(lollipopWaveRadians(RIVE_WADEN_ID, "idle", 5), 0);
assert.equal(lollipopWaveRadians(RIVE_WADEN_ID, "walk", 3), 0);
assert.equal(lollipopWaveRadians(RIVE_WADEN_ID, "cast", 6), 0);
assert.equal(lollipopWaveRadians(RIVE_WADEN_ID, "attack", 4), 0);
const mid = lollipopWaveRadians(RIVE_WADEN_ID, "attack", 8);
assert.ok(mid > 0.45, `mid wave ${mid}`);
assert.ok(Math.abs(lollipopWaveRadians(RIVE_WADEN_ID, "attack", 11)) < 1e-9);

for (const id of ["maga-boris", "maga-hooli", "maga-grumptor", "mma-jonesy", "wild-dynasty", "lw-journalist"]) {
  assert.equal(lollipopWaveRadians(id, "attack", 8), 0, id);
}

const art = read("./suppliedArt.ts");
const weapons = read("./heroWeapons.ts");
assert.match(art, /\[RIVE_WADEN_ID\]: RIVE_WADEN_PLATE/);
assert.match(art, /lollipopWaveRadians\(id, pose, frame\)/);
assert.match(art, /if \(id === RIVE_WADEN_ID\)/);
assert.match(weapons, /_phase = 0,\n\): void \{\}/);

console.log("ok rive waden plate and lollipop wave");
