/**
 * Supplied plates. File names are the assignment. Drawing them does not change combat.
 * Heroes: public/art/heroes. Buildings: public/art/buildings.
 */

import { SUPPLIED_HERO_FOOT, SUPPLIED_PLATE_HEIGHT } from "./heroHeight.ts";
import { LANE_CREEP_FOOT, laneCreepDrawHeight } from "./laneCreep.ts";
import { LANE_TOWER_FOOT, LANE_TOWER_HEIGHT, laneTowerDrawHeight } from "./laneTower.ts";
import {
  RIVE_WADEN_BODY,
  RIVE_WADEN_GRIP,
  RIVE_WADEN_ID,
  RIVE_WADEN_PLATE,
  RIVE_WADEN_POP,
  lollipopWaveRadians,
} from "./lollipopWave.ts";

const HERO_ART: Record<string, string> = {
  "maga-alexgroans": "/art/heroes/alex-groans.png",
  "maga-steers": "/art/heroes/jp-steers.png",
  "mma-macgregor": "/art/heroes/macgregor.png",
  "mma-nurmagoat": "/art/heroes/nurmagoat.png",
  "mma-poirierish": "/art/heroes/Dustin.png",
  "mma-adesanyaish": "/art/heroes/adesanya.png",
  [RIVE_WADEN_ID]: RIVE_WADEN_PLATE,
  "wild-dynasty": "/art/heroes/kardashians.png",
};

/**
 * Right-facing cycles. The match flip mirrors them for the left.
 * Attack cell 0 is the hit. The swing clock starts there.
 */
function cycle(id: string): { idle: string[]; walk: string[]; attack: string[] } {
  const pose = (name: string, n: number) =>
    Array.from({ length: n }, (_, i) => `/art/heroes/cycles/${id}/${name}-${i}.png`);
  return { idle: pose("idle", 4), walk: pose("walk", 4), attack: pose("attack", 4) };
}

const HERO_CYCLES: Record<string, { idle: string[]; walk: string[]; attack: string[] }> = {
  "maga-alexgroans": cycle("maga-alexgroans"),
  "maga-steers": cycle("maga-steers"),
  "mma-nurmagoat": cycle("mma-nurmagoat"),
};

function cycleIndex(pose: string, frame: number, count: number): number {
  if (count <= 1) return 0;
  if (pose === "attack") {
    const local = Math.max(0, Math.min(7, frame - 4));
    return Math.min(count - 1, Math.floor((local * count) / 8));
  }
  if (pose === "walk") return Math.floor(Math.max(0, frame) / 2) % count;
  return Math.abs(frame) % count;
}

/** More than one attack cell. Those frames are the attack motion. */
export function suppliedHasAttackCycle(id: string): boolean {
  const attack = HERO_CYCLES[id]?.attack;
  return !!attack && attack.length > 1;
}

/** Attack, walk, or idle cell. Null when this id has no cycle. */
export function suppliedCycleCell(id: string, pose: string, frame: number): number | null {
  const row = HERO_CYCLES[id];
  if (!row) return null;
  const frames = pose === "walk" ? row.walk : pose === "attack" ? row.attack : row.idle;
  if (frames.length === 0) return null;
  return cycleIndex(pose, frame, frames.length);
}

function cycleUrl(id: string, pose: string, frame: number): string | undefined {
  const row = HERO_CYCLES[id];
  if (!row) return undefined;
  const frames = pose === "walk" ? row.walk : pose === "attack" ? row.attack : row.idle;
  return frames[cycleIndex(pose, frame, frames.length)];
}

function warmCycles(id: string): void {
  const row = HERO_CYCLES[id];
  if (!row) return;
  for (const url of [...row.idle, ...row.walk, ...row.attack]) plate(url);
}

const CREEP_ART: Record<string, string> = {
  "home:infantry": "/art/heroes/Maga infantry.png",
  "home:archer": "/art/heroes/maga archer.png",
  "away:infantry": "/art/heroes/antifa melee.png",
  "away:archer": "/art/heroes/antifa archer.png",
};

/** Jungle camps and the woods stacks. Lane minions stay on CREEP_ART. */
const JUNGLE_CREEP_ART = "/art/heroes/jungle-woods-creep.png";

/** Woods plate height. Lane infantry and archers use laneCreepDrawHeight. */
export const JUNGLE_CREEP_HEIGHT = 48;
/** Bottom of the woods plate relative to the camp point. */
export const JUNGLE_CREEP_FOOT = 8;

const TRUMP_TOWER = "/art/buildings/Trump tower artwork.png";
const ANTIFA_TOWER = "/art/buildings/antifa tower.png";
const MAGA_SHRINE = "/art/buildings/Maga Shrine.png";
const ANTIFA_SHRINE = "/art/buildings/Antifa shrine.png";

/** The ancient is the base. It draws that side's shrine. */
const ANCIENT_ART: Record<string, string> = {
  home: MAGA_SHRINE,
  away: ANTIFA_SHRINE,
};

/** Lane keeps stay on the tower plates. */
const TOWER_ART: Record<string, string> = {
  home: TRUMP_TOWER,
  away: ANTIFA_TOWER,
};

/** The fountain plaza draws that side's tower. */
const FOUNTAIN_ART: Record<string, string> = {
  home: TRUMP_TOWER,
  away: ANTIFA_TOWER,
};

/** Shrine plate on the ancient. Same height as a lane tower. Feet sit on the pad. */
export const SUPPLIED_ANCIENT_FOOT = 28;
export const SUPPLIED_ANCIENT_HEIGHT = LANE_TOWER_HEIGHT;

/** Tower plate on the fountain plaza. Same height as a lane tower. Feet stay on the pad. */
export const SUPPLIED_FOUNTAIN_FOOT = 22;
export const SUPPLIED_FOUNTAIN_HEIGHT = LANE_TOWER_HEIGHT;

const cache = new Map<string, HTMLImageElement>();

function plate(url: string): HTMLImageElement | null {
  if (typeof Image === "undefined") return null;
  let img = cache.get(url);
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.src = url;
    cache.set(url, img);
  }
  if (!img.complete || img.naturalWidth <= 0) return null;
  return img;
}

function blit(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, ground: number, height: number, flip = 1, alpha = 1): void {
  const w = height * (img.naturalWidth / img.naturalHeight);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x), Math.round(ground));
  ctx.scale(flip, 1);
  ctx.drawImage(img, Math.round(-w / 2), Math.round(-height), Math.round(w), Math.round(height));
  ctx.restore();
}

export function suppliedHeroUrl(id: string): string | undefined {
  return HERO_ART[id];
}

/** Cached plate. Starts the load and keeps the element so a later frame can draw it. */
export function suppliedHeroPlate(id: string): HTMLImageElement | null {
  const url = HERO_ART[id];
  if (!url) return null;
  return plate(url);
}

/**
 * Pose frame for an animated plate. Falls back to the still until the cell loads.
 * Idle and walk face right. Attack cell 0 is contact.
 */
export function suppliedHeroFrame(id: string, pose: string, frame: number): HTMLImageElement | null {
  warmCycles(id);
  const animated = cycleUrl(id, pose, frame);
  if (animated) {
    const img = plate(animated);
    if (img) return img;
  }
  return suppliedHeroPlate(id);
}

/**
 * Body stays. The lollipop layer rotates around the hand grip for one attack.
 * Angle 0 is the painted hold, so idle and the ends of the swing match the plate.
 */
function blitLollipop(
  ctx: CanvasRenderingContext2D,
  body: HTMLImageElement,
  pop: HTMLImageElement,
  x: number,
  ground: number,
  height: number,
  flip: number,
  alpha: number,
  angle: number,
): void {
  const w = height * (body.naturalWidth / body.naturalHeight);
  const left = -w / 2;
  const top = -height;
  const gx = left + RIVE_WADEN_GRIP.x * w;
  const gy = top + RIVE_WADEN_GRIP.y * height;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x), Math.round(ground));
  ctx.scale(flip, 1);
  ctx.drawImage(body, Math.round(left), Math.round(top), Math.round(w), Math.round(height));
  ctx.translate(gx, gy);
  ctx.rotate(angle);
  ctx.drawImage(pop, Math.round(left - gx), Math.round(top - gy), Math.round(w), Math.round(height));
  ctx.restore();
}

export function drawSuppliedHero(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  flip: number,
  alpha = 1,
  pose = "idle",
  frame = 0,
): boolean {
  const img = suppliedHeroFrame(id, pose, frame);
  if (!img) return false;
  if (id === RIVE_WADEN_ID) {
    const body = plate(RIVE_WADEN_BODY);
    const pop = plate(RIVE_WADEN_POP);
    if (body && pop) {
      blitLollipop(ctx, body, pop, x, y + SUPPLIED_HERO_FOOT, SUPPLIED_PLATE_HEIGHT, flip, alpha, lollipopWaveRadians(id, pose, frame));
      return true;
    }
  }
  blit(ctx, img, x, y + SUPPLIED_HERO_FOOT, SUPPLIED_PLATE_HEIGHT, flip, alpha);
  return true;
}

export function drawSuppliedCreep(
  ctx: CanvasRenderingContext2D,
  team: "home" | "away",
  caster: boolean,
  x: number,
  y: number,
  flip: number,
  alpha = 1,
): boolean {
  const url = CREEP_ART[`${team}:${caster ? "archer" : "infantry"}`];
  if (!url) return false;
  const img = plate(url);
  if (!img) return false;
  blit(ctx, img, x, y + LANE_CREEP_FOOT, laneCreepDrawHeight(), flip, alpha);
  return true;
}

export function suppliedLaneCreepReady(team: "home" | "away", caster: boolean): boolean {
  const url = CREEP_ART[`${team}:${caster ? "archer" : "infantry"}`];
  return url ? plate(url) != null : false;
}

/** The man with the bat and the burning barrel. Woods height stays; lane creeps are taller. */
export function drawSuppliedJungleCreep(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: number,
  alpha = 1,
): boolean {
  const img = plate(JUNGLE_CREEP_ART);
  if (!img) return false;
  blit(ctx, img, x, y + JUNGLE_CREEP_FOOT, JUNGLE_CREEP_HEIGHT, flip, alpha);
  return true;
}

/** Pheobe's still. The lollipop wave stays on wild-cezanne. */
export const RIVER_WARDEN_PLATE = RIVE_WADEN_PLATE;
/** Same battlefield height as Pheobe's scaled plate. Feet are the caller's ground line. */
export const RIVER_WARDEN_HEIGHT = 126;

export function drawSuppliedRiverWarden(
  ctx: CanvasRenderingContext2D,
  x: number,
  ground: number,
  flip: number,
  alpha = 1,
): boolean {
  const img = plate(RIVER_WARDEN_PLATE);
  if (!img) return false;
  blit(ctx, img, x, ground, RIVER_WARDEN_HEIGHT, flip, alpha);
  return true;
}

export function drawSuppliedAncient(ctx: CanvasRenderingContext2D, team: "home" | "away", x: number, y: number, dead: boolean): boolean {
  const url = ANCIENT_ART[team];
  if (!url) return false;
  const img = plate(url);
  if (!img) return false;
  blit(ctx, img, x, y + SUPPLIED_ANCIENT_FOOT, SUPPLIED_ANCIENT_HEIGHT, 1, dead ? 0.45 : 1);
  return true;
}

/** Lane tower plate. Feet on the pad. */
export function drawSuppliedTower(
  ctx: CanvasRenderingContext2D,
  team: "home" | "away",
  x: number,
  y: number,
  dead: boolean,
  tier?: "outer" | "middle" | "inner",
): boolean {
  const url = TOWER_ART[team];
  if (!url) return false;
  const img = plate(url);
  if (!img) return false;
  const height = laneTowerDrawHeight(tier);
  blit(ctx, img, x, y + LANE_TOWER_FOOT, height, 1, dead ? 0.45 : 1);
  return true;
}

export function drawSuppliedFountain(ctx: CanvasRenderingContext2D, home: boolean, x: number, y: number): boolean {
  const url = FOUNTAIN_ART[home ? "home" : "away"];
  if (!url) return false;
  const img = plate(url);
  if (!img) return false;
  blit(ctx, img, x, y + SUPPLIED_FOUNTAIN_FOOT, SUPPLIED_FOUNTAIN_HEIGHT, 1, 1);
  return true;
}

export function suppliedFountainReady(home: boolean): boolean {
  const url = FOUNTAIN_ART[home ? "home" : "away"];
  return url ? plate(url) != null : false;
}
