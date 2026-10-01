/**
 * Battlefield draw height. Trump is Grump (maga-grumptor).
 * drawPixelHero blits the 128 canvas at PIXEL_SCALE 1.12.
 * Supplied plates still blit at 96, then scale up from the feet to this height.
 * Lane creeps do not use it. Lane towers and base towers size from Trump's painted height.
 * Trump, Pheobe, and MMA then paint at HERO_DRAW_SCALE.
 * Sgt. Slush paints at half. The shared reference stays.
 */

import { isMmaHero } from "./heroes.ts";
import { RIVE_WADEN_ID } from "./lollipopWave.ts";

export const TRUMP_HERO_ID = "maga-grumptor";

/** Battlefield shrink for Trump, Pheobe, and every MMA fighter. Other heroes stay at 1. */
export const HERO_DRAW_SCALE = 0.88;

/** Sgt. Slush. The plate, the arms, and the snowball spawn use this together. */
export const SNOWBALL_HERO_ID = "wild-slush";
export const HALF_DRAW_SCALE = 0.5;

/** Hero click radius before a half-size plate. Attack range is not this number. */
export const HERO_HIT_RADIUS = 22;

const SHORT_HERO_IDS = new Set<string>([TRUMP_HERO_ID, RIVE_WADEN_ID]);

/**
 * Per-hero paint scale. Trump and Pheobe are named. MMA is the wing, so a later fighter gets it too.
 * Sgt. Slush is half. TRUMP_DRAW_HEIGHT is not this scale. The rest of the roster keeps the full height.
 */
export function heroDrawScale(id: string): number {
  if (id === SNOWBALL_HERO_ID) return HALF_DRAW_SCALE;
  if (SHORT_HERO_IDS.has(id) || isMmaHero(id)) return HERO_DRAW_SCALE;
  return 1;
}

/** Body circle. Half-size paint gets a half-size circle. Attack range stays on the kit. */
export function heroHitRadius(id: string): number {
  if (id === SNOWBALL_HERO_ID) return HERO_HIT_RADIUS * HALF_DRAW_SCALE;
  return HERO_HIT_RADIUS;
}

/** drawPixelHero height: PIXEL_SIZE * PIXEL_SCALE. */
export const TRUMP_DRAW_HEIGHT = 128 * 1.12;

/** Shared supplied-plate blit before the foot-anchored scale. */
export const SUPPLIED_PLATE_HEIGHT = 96;

/** Supplied plates plant their feet here. The scale grows upward from this line. */
export const SUPPLIED_HERO_FOOT = 10;

/**
 * Shared reference height. Other heroes and lane towers measure against this.
 * Trump's own paint scale is heroDrawScale, not a change to this return.
 */
export function heroDrawHeight(id: string): number {
  void id;
  return TRUMP_DRAW_HEIGHT;
}

/** 96-plate blit, then this scale, is heroDrawHeight. Feet stay on SUPPLIED_HERO_FOOT. */
export const SUPPLIED_BODY_SCALE = heroDrawHeight(TRUMP_HERO_ID) / SUPPLIED_PLATE_HEIGHT;

/**
 * Grump's opaque rows on the 128 canvas. Bottom is exclusive.
 * The canvas blit is TRUMP_DRAW_HEIGHT. The body is these rows.
 * Other kits are measured the same way and scaled onto this span.
 */
export const TRUMP_BODY_TOP = 7;
export const TRUMP_BODY_BOTTOM = 125;

type BodySpan = { top: number; bottom: number };

const TRUMP_BODY: BodySpan = { top: TRUMP_BODY_TOP, bottom: TRUMP_BODY_BOTTOM };

/**
 * Kits whose idle body is not Grump's span.
 * Sheets are the quantized still, shadow excluded. Procedural kits are the painted idle.
 * A missing id is a full sheet: same span as Grump, scale 1.
 */
const BODY_SPAN: Record<string, BodySpan> = {
  "wild-dynasty": { top: 51, bottom: 125 },
  "wild-cartoons": { top: 34, bottom: 118 },
  "lw-climate": { top: 33, bottom: 123 },
  "lw-journalist": { top: 33, bottom: 123 },
  "wild-icon": { top: 32, bottom: 124 },
  "lw-bitenten": { top: 30, bottom: 123 },
  "lw-odramma": { top: 29, bottom: 123 },
  "lw-vakxie": { top: 29, bottom: 123 },
  "wild-karen": { top: 27, bottom: 123 },
  "lw-sandbags": { top: 23, bottom: 125 },
  "lw-harass": { top: 21, bottom: 125 },
  "lw-youngturkey": { top: 19, bottom: 125 },
  "maga-hooli": { top: 20, bottom: 126 },
  "wild-enigma": { top: 7, bottom: 124 },
  "maga-ricky": { top: 6, bottom: 125 },
  "mma-jonesy": { top: 15, bottom: 127 },
  "mma-diazish": { top: 14, bottom: 127 },
};

export function heroBodySpan(id: string): BodySpan {
  return BODY_SPAN[id] ?? TRUMP_BODY;
}

/** Uniform scale that makes this kit's opaque body as tall as Grump. */
export function heroBodyScale(id: string): number {
  const span = heroBodySpan(id);
  const body = span.bottom - span.top;
  return (TRUMP_BODY_BOTTOM - TRUMP_BODY_TOP) / body;
}

/** World y of Grump's feet relative to the unit origin. Every pixel hero shares it. */
export function heroFootOffset(): number {
  const px = heroDrawHeight(TRUMP_HERO_ID) / 128;
  return -heroDrawHeight(TRUMP_HERO_ID) + 34 + TRUMP_BODY_BOTTOM * px;
}

/**
 * drawPixelHero destination for the 128 canvas, relative to the unit origin.
 * Width matches height. Feet land on heroFootOffset. The body matches Grump.
 */
export function pixelHeroBlit(id: string): { w: number; h: number; top: number } {
  const draw = heroDrawHeight(id);
  const scale = heroBodyScale(id);
  const h = draw * scale;
  const span = heroBodySpan(id);
  const top = heroFootOffset() - span.bottom * (h / 128);
  return { w: h, h, top };
}

/** World pixels from this kit's feet to its crown after pixelHeroBlit. */
export function fittedBodyHeight(id: string): number {
  const span = heroBodySpan(id);
  const blit = pixelHeroBlit(id);
  return (span.bottom - span.top) * (blit.h / 128);
}

export function suppliedHeroCrown(y: number): number {
  return y + SUPPLIED_HERO_FOOT - TRUMP_DRAW_HEIGHT;
}

/**
 * World y of the painted sprite top. Scale 1 matches the shared crown.
 * A shorter kit grows down from this line; the foot stays put.
 */
export function heroSpriteTop(y: number, id: string, supplied: boolean): number {
  const scale = heroDrawScale(id);
  if (supplied) return y + SUPPLIED_HERO_FOOT - TRUMP_DRAW_HEIGHT * scale;
  if (scale === 1) return y - TRUMP_DRAW_HEIGHT + 34;
  const foot = heroFootOffset();
  const blitTop = pixelHeroBlit(id).top;
  const paintedTop = foot + (blitTop - foot) * scale;
  return y - TRUMP_DRAW_HEIGHT + 34 + (paintedTop - blitTop);
}

/**
 * An offset authored against the 96 plate, scaled around the foot line.
 * dx/dy are relative to the unit origin. Feet (dy = +10) stay put.
 */
export function scaleSuppliedOffset(dx: number, dy: number): { x: number; y: number } {
  const foot = SUPPLIED_HERO_FOOT;
  return {
    x: dx * SUPPLIED_BODY_SCALE,
    y: foot + (dy - foot) * SUPPLIED_BODY_SCALE,
  };
}

/** Scale a 96-plate blit up to Trump's height, then the per-hero draw scale. Feet stay on the foot line. */
export function scaleSuppliedField(ctx: CanvasRenderingContext2D, x: number, y: number, id = ""): void {
  const footY = y + SUPPLIED_HERO_FOOT;
  const scale = SUPPLIED_BODY_SCALE * heroDrawScale(id);
  ctx.translate(x, footY);
  ctx.scale(scale, scale);
  ctx.translate(-x, -footY);
}
