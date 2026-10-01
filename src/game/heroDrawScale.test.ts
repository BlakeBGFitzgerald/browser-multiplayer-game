import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HEROES } from "./heroes.ts";
import {
  HERO_DRAW_SCALE,
  TRUMP_DRAW_HEIGHT,
  TRUMP_HERO_ID,
  heroDrawHeight,
  heroDrawScale,
  heroFootOffset,
  SUPPLIED_HERO_FOOT,
  heroSpriteTop,
  pixelHeroBlit,
  suppliedHeroCrown,
} from "./heroHeight.ts";

const PHEOBE = "wild-cezanne";
const MMA = [
  "mma-macgregor",
  "mma-nurmagoat",
  "mma-jonesy",
  "mma-adesanyaish",
  "mma-poirierish",
  "mma-diazish",
];

assert.equal(TRUMP_HERO_ID, "maga-grumptor");
assert.equal(TRUMP_DRAW_HEIGHT, 128 * 1.12);
assert.equal(HERO_DRAW_SCALE, 0.88);
assert.equal(heroDrawHeight(TRUMP_HERO_ID), TRUMP_DRAW_HEIGHT);
assert.equal(heroDrawScale(TRUMP_HERO_ID), 0.88);
assert.equal(heroDrawScale(PHEOBE), 0.88);

for (const id of MMA) {
  const hero = HEROES.find((h) => h.id === id);
  assert.ok(hero, id);
  assert.equal(hero.wing, "mma", id);
  assert.equal(heroDrawScale(id), 0.88, id);
}

const mma = HEROES.filter((h) => h.wing === "mma");
assert.ok(mma.length >= MMA.length);
for (const hero of mma) assert.equal(heroDrawScale(hero.id), 0.88, hero.id);

const plain = HEROES.find((h) => h.wing !== "mma" && h.id !== TRUMP_HERO_ID && h.id !== PHEOBE);
assert.ok(plain);
assert.equal(heroDrawScale(plain.id), 1, plain.id);
assert.equal(heroDrawHeight(plain.id), TRUMP_DRAW_HEIGHT, plain.id);

const trumpBlit = pixelHeroBlit(TRUMP_HERO_ID);
assert.equal(trumpBlit.h, TRUMP_DRAW_HEIGHT);
assert.equal(trumpBlit.h * heroDrawScale(TRUMP_HERO_ID), TRUMP_DRAW_HEIGHT * 0.88);

const foot = heroFootOffset();
const oldTop = -TRUMP_DRAW_HEIGHT + 34;
assert.equal(heroSpriteTop(0, plain.id, false), oldTop);
assert.equal(heroSpriteTop(0, TRUMP_HERO_ID, false), foot + (oldTop - foot) * 0.88);
assert.equal(heroSpriteTop(0, plain.id, true), suppliedHeroCrown(0));
assert.equal(heroSpriteTop(0, PHEOBE, true), SUPPLIED_HERO_FOOT - TRUMP_DRAW_HEIGHT * 0.88);

const paint = readFileSync(new URL("./pixelPaint.ts", import.meta.url), "utf8");
const height = readFileSync(new URL("./heroHeight.ts", import.meta.url), "utf8");
const quad = readFileSync(new URL("./quad.ts", import.meta.url), "utf8");
assert.match(paint, /heroDrawScale\(live\)/);
assert.match(paint, /pixelHeroBlit\(live\)/);
assert.match(height, /SUPPLIED_BODY_SCALE \* heroDrawScale\(id\)/);
assert.match(quad, /scaleSuppliedField\(ctx, u\.x, u\.y, def\.id\)/);

console.log(`ok draw scale 0.88 trump ${TRUMP_HERO_ID} height ${TRUMP_DRAW_HEIGHT} -> ${TRUMP_DRAW_HEIGHT * 0.88}`);
