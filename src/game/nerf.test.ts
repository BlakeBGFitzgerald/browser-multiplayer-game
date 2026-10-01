import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { HEROES } from "./heroes.ts";
import {
  SUPPLIED_BODY_SCALE,
  SUPPLIED_HERO_FOOT,
  SUPPLIED_PLATE_HEIGHT,
  TRUMP_DRAW_HEIGHT,
  TRUMP_HERO_ID,
  fittedBodyHeight,
  heroBodySpan,
  heroDrawHeight,
  heroFootOffset,
  pixelHeroBlit,
  scaleSuppliedOffset,
  suppliedHeroCrown,
} from "./heroHeight.ts";
import { suppliedHeroUrl } from "./suppliedArt.ts";
import { nerfMuzzle, nextNerfColor } from "./nerf.ts";

const blue = nextNerfColor(undefined);
const orange = nextNerfColor(blue);
const blueAgain = nextNerfColor(orange);
assert.equal(blue, "nerf-blue");
assert.equal(orange, "nerf-orange");
assert.equal(blueAgain, "nerf-blue");

const ink = readFileSync(new URL("./heroInk.ts", import.meta.url), "utf8");
const paint = readFileSync(new URL("./pixelPaint.ts", import.meta.url), "utf8");
const art = readFileSync(new URL("./suppliedArt.ts", import.meta.url), "utf8");
assert.match(ink, /export const INK_SIZE = 128/);
assert.match(paint, /export const PIXEL_SIZE = INK_SIZE/);
assert.match(paint, /export const PIXEL_SCALE = 1\.12/);
assert.match(paint, /pixelHeroBlit\(live\)/);
assert.match(art, /blit\(ctx, img, x, y \+ LANE_CREEP_FOOT, laneCreepDrawHeight\(\)/);
assert.match(art, /blit\(ctx, img, x, y \+ JUNGLE_CREEP_FOOT, JUNGLE_CREEP_HEIGHT/);
assert.match(art, /blit\(ctx, img, x, y \+ SUPPLIED_HERO_FOOT, SUPPLIED_PLATE_HEIGHT/);
assert.match(art, /blitLollipop\(ctx, body, pop, x, y \+ SUPPLIED_HERO_FOOT, SUPPLIED_PLATE_HEIGHT/);
assert.doesNotMatch(art, /TRUMP_DRAW_HEIGHT/);

assert.equal(TRUMP_DRAW_HEIGHT, 128 * 1.12);
assert.equal(SUPPLIED_PLATE_HEIGHT * SUPPLIED_BODY_SCALE, TRUMP_DRAW_HEIGHT);
assert.equal(heroDrawHeight(TRUMP_HERO_ID), TRUMP_DRAW_HEIGHT);
const trumpBlit = pixelHeroBlit(TRUMP_HERO_ID);
assert.equal(trumpBlit.h, TRUMP_DRAW_HEIGHT);
assert.equal(trumpBlit.top, -TRUMP_DRAW_HEIGHT + 34);
const trumpBody = fittedBodyHeight(TRUMP_HERO_ID);
const trumpFoot = heroFootOffset();
assert.ok(HEROES.length >= 30);
for (const hero of HEROES) {
  assert.equal(heroDrawHeight(hero.id), TRUMP_DRAW_HEIGHT, hero.id);
  if (suppliedHeroUrl(hero.id)) continue;
  assert.ok(Math.abs(fittedBodyHeight(hero.id) - trumpBody) < 1e-6, hero.id);
  const span = heroBodySpan(hero.id);
  const blit = pixelHeroBlit(hero.id);
  const foot = blit.top + span.bottom * (blit.h / 128);
  assert.ok(Math.abs(foot - trumpFoot) < 1e-6, hero.id);
}

const feet = scaleSuppliedOffset(0, SUPPLIED_HERO_FOOT);
assert.equal(feet.x, 0);
assert.equal(feet.y, SUPPLIED_HERO_FOOT);

const oldCrown = scaleSuppliedOffset(0, SUPPLIED_HERO_FOOT - SUPPLIED_PLATE_HEIGHT);
assert.equal(oldCrown.y, suppliedHeroCrown(0));

const muzzle = nerfMuzzle(100, 200, 0, "attack");
assert.ok(muzzle.x > 100);
assert.ok(muzzle.y < 200);

const idle = nerfMuzzle(100, 200, 0, "idle");
assert.ok(muzzle.x > idle.x);
assert.ok(muzzle.y < 200 - 34);

console.log("ok nerf colors and muzzle");
console.log(`trump ${TRUMP_DRAW_HEIGHT} heroes ${HEROES.length} plate ${SUPPLIED_PLATE_HEIGHT}`);
