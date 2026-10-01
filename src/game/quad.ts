import { skinById } from "../dlc";
import { heroSpriteTop, scaleSuppliedField } from "./heroHeight";
import { drawHeroWeapon, heroWeaponMuzzle } from "./heroWeapons";
import { ALEX_GROANS_ID, ALEX_ROCKET_END, alexMuzzleOn, alexRocketPresentation, type ShotAmmo } from "./nerf";
import { SNOWBALL_END, SNOWBALL_HERO_ID, snowballPresentation, snowballReleaseOn, snowballSpawn } from "./snowball";
import { drawProjectile, drawProjectileImpact } from "./projectileDraw";
import { projectileLook, type ProjectileLook } from "./projectileLook";
import { LANE_CREEP_SCALE, laneCreepCrown, laneCreepProcCrown } from "./laneCreep";
import { laneTowerCrown } from "./laneTower";
import { drawSuppliedHero, JUNGLE_CREEP_FOOT, JUNGLE_CREEP_HEIGHT, SUPPLIED_ANCIENT_FOOT, SUPPLIED_ANCIENT_HEIGHT, suppliedFountainReady, suppliedHeroPlate, suppliedLaneCreepReady } from "./suppliedArt";
import { HOOLI_BURST_END, hooliBurstFrame, hooliMuzzleOn } from "./hooliBurst";
import { heroById } from "./heroes";
import { attackLimb, punchSideForAttack, resolveBasicAttack, usesWheelchair } from "./attackPose";
import { drawPlatePunchArms, drawSheetStrikeArms, sheetMeleeStrike, suppliedMmaStill } from "./punchArms";
import { sheetDef } from "./sheetDefs";
import { attackPoseLive, stillPlateLeanRadians } from "./attackLean";
import { DYNASTY_ID, applyDynastyBob, drawDynastyMotion } from "./dynastyMotion";
import { mmaPunchActive, mmaPunchFrame, mmaPunchLeanRadians, mmaPunchShift } from "./mmaPunch";
import { stunIsHeavy, stunPose, type StunPose } from "./stunReact";
import { pixelKit } from "./pixelRoster";
import {
  drawPixelAura,
  drawPixelCastRing,
  drawPixelHero,
  drawPixelImpact,
  drawPixelTrail,
  pixelVfxColor,
  poseFrame,
} from "./pixelPaint";
import {
  crisp,
  drawPixAncient,
  drawPixBush,
  drawPixCamp,
  drawPixCreep,
  drawPixFern,
  drawPixFountain,
  drawPixFountainLive,
  drawPixKeep,
  drawPixLamp,
  drawPixLog,
  drawPixRock,
  drawPixShop,
  drawPixShroom,
  drawPixTree,
  drawPixWaterLive,
  paintC42World,
} from "./worldPix";
import { TRUNKS } from "./jungle";
import {
  BACK_TRACKS,
  CELL,
  JUNGLE_CAMPS,
  LANES,
  WOODS,
  WORLD,
  along,
  ancientPos,
  dist,
  fountain,
  inWoods,
  isWalkable,
  lanePath,
  trackRank,
  towers as towerSpecs,
  type Pt,
  type Team,
  type TrackRank,
} from "./map";

export type Sprite = {
  kind: "hero" | "minion" | "tower" | "ancient";
  team: Team;
  name: string;
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  color: string;
  caster: boolean;
  player: boolean;
  wild?: boolean;
  bark?: string;
  heroId?: string;
  skin?: string;
  level: number;
  dead: boolean;
  facing?: number;
  mana?: number;
  maxMana?: number;
  time?: number;
  walk?: boolean;
  walkRate?: number;
  /** 0 idle, 1 full stride. Eases in and out so legs are not stuck mid-step. */
  stride?: number;
  swing?: number;
  /** Basic attacks fired. Punch side follows this counter. */
  beat?: number;
  /** Seconds into Hooli's tommy burst. 0 when the gun is down. */
  burst?: number;
  dash?: number;
  cast?: number;
  ult?: boolean;
  hurt?: number;
  id?: number;
  objectiveId?: string;
  barkT?: number;
  towerTier?: "outer" | "middle" | "inner";
  shield?: boolean;
  stunned?: boolean;
  slowed?: boolean;
};

const MID = { x: 1300, y: 1300 };
const RDIR = { x: Math.SQRT1_2, y: Math.SQRT1_2 };
const RIVER_A = { x: MID.x - RDIR.x * 980, y: MID.y - RDIR.y * 980 };
const RIVER_B = { x: MID.x + RDIR.x * 980, y: MID.y + RDIR.y * 980 };

function hash(n: number): number {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function distSeg(p: Pt, a: Pt, b: Pt): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const l2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2));
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
}

function onLane(x: number, y: number, radius: number): boolean {
  const p = { x, y };
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      if (distSeg(p, path[i]!, path[i + 1]!) < radius) return true;
    }
  }
  if (dist(p, fountain.home) < 260 || dist(p, fountain.away) < 260) return true;
  if (dist(p, MID) < 210) return true;
  if (dist(p, ancientPos.home) < 170 || dist(p, ancientPos.away) < 170) return true;
  for (const c of JUNGLE_CAMPS) {
    if (dist(p, c) < 100) return true;
  }
  return false;
}

type Plant = { x: number; y: number; r: number; fir: boolean };

const TREES: Plant[] = [];
const BUSHES: { x: number; y: number; s: number }[] = [];
const FERNS: { x: number; y: number; s: number }[] = [];
const ROCKS: { x: number; y: number; s: number }[] = [];
const LOGS: { x: number; y: number; ang: number }[] = [];
const FLOWERS: { x: number; y: number; pink: boolean }[] = [];
const SHROOMS: { x: number; y: number; s: number }[] = [];
type StreetPropKind = "hydrant" | "can" | "meter" | "crate" | "planter" | "kiosk";
const PROPS: { x: number; y: number; kind: StreetPropKind; dc: boolean }[] = [];
const CHERRY: { x: number; y: number; s: number }[] = [];
const MAPLES: { x: number; y: number; s: number }[] = [];
const HEDGES: { x: number; y: number; w: number; dc: boolean }[] = [];
(function plant(): void {
  let s = 2026;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < 2100; i++) {
    const x = 40 + rnd() * (WORLD - 80);
    const y = 40 + rnd() * (WORLD - 80);
    if (onLane(x, y, 150) || isWalkable(x, y)) continue;
    const fir = x + y > WORLD;
    TREES.push({ x, y, r: (fir ? 20 : 16) + rnd() * 22, fir });
  }
  TREES.sort((a, b) => a.y - b.y);
  for (const track of BACK_TRACKS) {
    for (let i = 0; i < track.path.length - 1; i++) {
      const a = track.path[i]!;
      const b = track.path[i + 1]!;
      const len = dist(a, b);
      const steps = Math.max(2, Math.floor(len / 38));
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        const cx = a.x + (b.x - a.x) * t;
        const cy = a.y + (b.y - a.y) * t;
        for (const side of [-1, 1] as const) {
          const off = 58 + rnd() * 38;
          const x = cx + nx * side * off;
          const y = cy + ny * side * off;
          if (onLane(x, y, 140) || isWalkable(x, y)) continue;
          const fir = x + y > WORLD;
          TREES.push({ x, y, r: (fir ? 18 : 15) + rnd() * 18, fir });
          if (rnd() < 0.55) {
            const x2 = cx + nx * side * (96 + rnd() * 28);
            const y2 = cy + ny * side * (96 + rnd() * 28);
            if (onLane(x2, y2, 140) || isWalkable(x2, y2)) continue;
            TREES.push({ x: x2, y: y2, r: (fir ? 16 : 14) + rnd() * 16, fir });
          }
          if (rnd() < 0.4) BUSHES.push({ x, y, s: 10 + rnd() * 10 });
        }
      }
    }
  }
  for (const w of WOODS) {
    for (let i = 0; i < 150; i++) {
      const ang = rnd() * Math.PI * 2;
      const rad = Math.sqrt(rnd());
      const x = w.x + Math.cos(w.rot) * Math.cos(ang) * w.rx * rad - Math.sin(w.rot) * Math.sin(ang) * w.ry * rad;
      const y = w.y + Math.sin(w.rot) * Math.cos(ang) * w.rx * rad + Math.cos(w.rot) * Math.sin(ang) * w.ry * rad;
      if (onLane(x, y, 140) || isWalkable(x, y)) continue;
      TREES.push({ x, y, r: (w.fir ? 18 : 15) + rnd() * 20, fir: w.fir });
      if (rnd() < 0.35) FERNS.push({ x, y, s: 8 + rnd() * 12 });
    }
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2 + rnd() * 0.2;
      const x = w.x + Math.cos(w.rot) * Math.cos(ang) * w.rx * 1.08 - Math.sin(w.rot) * Math.sin(ang) * w.ry * 1.08;
      const y = w.y + Math.sin(w.rot) * Math.cos(ang) * w.rx * 1.08 + Math.cos(w.rot) * Math.sin(ang) * w.ry * 1.08;
      if (onLane(x, y, 140) || isWalkable(x, y)) continue;
      TREES.push({ x, y, r: (w.fir ? 22 : 18) + rnd() * 14, fir: w.fir });
    }
  }
  TREES.sort((a, b) => a.y - b.y);
  for (let i = 0; i < 620; i++) {
    const x = 80 + rnd() * (WORLD - 160);
    const y = 80 + rnd() * (WORLD - 160);
    if (onLane(x, y, 120) || isWalkable(x, y)) continue;
    FERNS.push({ x, y, s: 8 + rnd() * 12 });
  }
  for (let i = 0; i < 220; i++) {
    const t = rnd();
    const alongR = {
      x: RIVER_A.x + (RIVER_B.x - RIVER_A.x) * t,
      y: RIVER_A.y + (RIVER_B.y - RIVER_A.y) * t,
    };
    const side = rnd() < 0.5 ? -1 : 1;
    const x = alongR.x + -RDIR.y * side * (88 + rnd() * 36);
    const y = alongR.y + RDIR.x * side * (88 + rnd() * 36);
    if (dist({ x, y }, MID) < 210) continue;
    ROCKS.push({ x, y, s: 8 + rnd() * 16 });
  }
  for (let i = 0; i < 48; i++) {
    const x = 120 + rnd() * (WORLD - 240);
    const y = 120 + rnd() * (WORLD - 240);
    if (onLane(x, y, 140) || isWalkable(x, y)) continue;
    LOGS.push({ x, y, ang: rnd() * Math.PI });
  }
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const len = dist(a, b);
      const steps = Math.max(2, Math.floor(len / 70));
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        const cx = a.x + (b.x - a.x) * t;
        const cy = a.y + (b.y - a.y) * t;
        for (const side of [-1, 1]) {
          let planted = false;
          for (const off of [168, 196]) {
            const x = cx + nx * side * off;
            const y = cy + ny * side * off;
            if (onLane(x, y, 146) || isWalkable(x, y)) continue;
            BUSHES.push({ x, y, s: 11 + hash(x * 3 + y) * 9 });
            planted = true;
            break;
          }
          if (!planted) continue;
        }
      }
    }
  }
  for (let i = 0; i < 420; i++) {
    const x = 60 + rnd() * (WORLD - 120);
    const y = 60 + rnd() * (WORLD - 120);
    if (onLane(x, y, 150) || !isWalkable(x, y)) continue;
    if (inWoods(x, y)) continue;
    FLOWERS.push({ x, y, pink: x + y < WORLD });
  }
  for (const w of WOODS) {
    for (let i = 0; i < 18; i++) {
      const ang = rnd() * Math.PI * 2;
      const rad = 0.35 + rnd() * 0.55;
      const x = w.x + Math.cos(w.rot) * Math.cos(ang) * w.rx * rad - Math.sin(w.rot) * Math.sin(ang) * w.ry * rad;
      const y = w.y + Math.sin(w.rot) * Math.cos(ang) * w.rx * rad + Math.cos(w.rot) * Math.sin(ang) * w.ry * rad;
      if (isWalkable(x, y)) continue;
      SHROOMS.push({ x, y, s: 4 + rnd() * 5 });
    }
  }
  const kinds: StreetPropKind[] = ["hydrant", "can", "meter", "crate", "planter", "kiosk"];
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (const t of [0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 0.96]) {
      const p = along(path, t);
      const a = along(path, Math.min(1, t + 0.02));
      const len = dist(p, a) || 1;
      const nx = -(a.y - p.y) / len;
      const ny = (a.x - p.x) / len;
      const side = (t * 10) % 2 < 1 ? 1 : -1;
      const x = p.x + nx * side * 168;
      const y = p.y + ny * side * 168;
      if (onLane(x, y, 146) || isWalkable(x, y)) continue;
      const kind = kinds[Math.floor(rnd() * kinds.length)]!;
      PROPS.push({ x, y, kind, dc: x + y < WORLD });
    }
  }
  for (let i = 0; i < 52; i++) {
    const x = 80 + rnd() * 520;
    const y = 1880 + rnd() * 620;
    if (onLane(x, y, 90) || dist({ x, y }, fountain.home) < 220) continue;
    CHERRY.push({ x, y, s: 16 + rnd() * 14 });
  }
  for (let i = 0; i < 46; i++) {
    const x = 1880 + rnd() * 620;
    const y = 40 + rnd() * 620;
    if (onLane(x, y, 90) || dist({ x, y }, fountain.away) < 220) continue;
    MAPLES.push({ x, y, s: 15 + rnd() * 14 });
  }
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (const t of [0.16, 0.34, 0.52, 0.7, 0.86]) {
      const p = along(path, t);
      const a = along(path, Math.min(1, t + 0.02));
      const len = dist(p, a) || 1;
      const nx = -(a.y - p.y) / len;
      const ny = (a.x - p.x) / len;
      const side = t > 0.5 ? 1 : -1;
      const x = p.x + nx * side * 176;
      const y = p.y + ny * side * 176;
      if (onLane(x, y, 146) || isWalkable(x, y)) continue;
      HEDGES.push({ x: x - 18, y, w: 36 + rnd() * 22, dc: x + y < WORLD });
    }
  }
  for (let i = 0; i < 480; i++) {
    const x = 40 + rnd() * (WORLD - 80);
    const y = 40 + rnd() * (WORLD - 80);
    if (onLane(x, y, 150) || isWalkable(x, y)) continue;
    const fir = x + y > WORLD;
    TREES.push({ x, y, r: (fir ? 14 : 12) + rnd() * 16, fir });
  }
  TREES.sort((a, b) => a.y - b.y);
})();

const FRINGE = 1120;
const FRINGE_TREES: Plant[] = [];
const FRINGE_BUSHES: { x: number; y: number; s: number }[] = [];
const FRINGE_TRASH: { x: number; y: number; n: number }[] = [];
(function plantFringe(): void {
  let s = 4048;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const place = (): { x: number; y: number } => {
    const band = rnd();
    if (band < 0.25) return { x: -FRINGE + rnd() * FRINGE, y: -FRINGE + rnd() * (WORLD + 2 * FRINGE) };
    if (band < 0.5) return { x: WORLD + rnd() * FRINGE, y: -FRINGE + rnd() * (WORLD + 2 * FRINGE) };
    if (band < 0.75) return { x: rnd() * WORLD, y: -FRINGE + rnd() * FRINGE };
    return { x: rnd() * WORLD, y: WORLD + rnd() * FRINGE };
  };
  for (let i = 0; i < 1680; i++) {
    const p = place();
    FRINGE_TREES.push({ x: p.x, y: p.y, r: 16 + rnd() * 26, fir: rnd() > 0.78 });
  }
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const jitter = () => (rnd() - 0.5) * 36;
    FRINGE_TREES.push({ x: -18 + jitter() - rnd() * 70, y: t * WORLD + jitter(), r: 18 + rnd() * 20, fir: rnd() > 0.8 });
    FRINGE_TREES.push({ x: WORLD + 18 + jitter() + rnd() * 70, y: t * WORLD + jitter(), r: 18 + rnd() * 20, fir: rnd() > 0.8 });
    FRINGE_TREES.push({ x: t * WORLD + jitter(), y: -18 + jitter() - rnd() * 70, r: 18 + rnd() * 20, fir: rnd() > 0.8 });
    FRINGE_TREES.push({ x: t * WORLD + jitter(), y: WORLD + 18 + jitter() + rnd() * 70, r: 18 + rnd() * 20, fir: rnd() > 0.8 });
  }
  FRINGE_TREES.sort((a, b) => a.y - b.y);
  for (let i = 0; i < 340; i++) {
    const p = place();
    FRINGE_BUSHES.push({ x: p.x, y: p.y, s: 12 + rnd() * 16 });
  }
  for (let i = 0; i < 380; i++) {
    const p = place();
    FRINGE_TRASH.push({ x: p.x, y: p.y, n: rnd() });
  }
  for (let i = 0; i < 48; i++) {
    const t = rnd();
    const side = Math.floor(rnd() * 4);
    const along = t * WORLD;
    const off = 28 + rnd() * 90;
    const p =
      side === 0
        ? { x: -off, y: along }
        : side === 1
          ? { x: WORLD + off, y: along }
          : side === 2
            ? { x: along, y: -off }
            : { x: along, y: WORLD + off };
    FRINGE_TRASH.push({ x: p.x, y: p.y, n: rnd() });
  }
  const dumps = [
    { x: -90, y: -70 },
    { x: -220, y: 60 },
    { x: 70, y: -160 },
    { x: -150, y: 210 },
    { x: 190, y: -80 },
    { x: -40, y: 120 },
    { x: 130, y: -220 },
    { x: WORLD + 90, y: -70 },
    { x: WORLD + 200, y: 80 },
    { x: WORLD - 70, y: -160 },
    { x: -90, y: WORLD + 80 },
    { x: 80, y: WORLD + 180 },
    { x: WORLD + 90, y: WORLD + 70 },
  ];
  for (const p of dumps) FRINGE_TRASH.push({ x: p.x, y: p.y, n: 0.72 });
})();

function lamps(): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (const t of [0.06, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9]) {
      const p = along(path, t);
      const a = along(path, Math.min(0.98, t + 0.03));
      const len = dist(p, a) || 1;
      const nx = -(a.y - p.y) / len;
      const ny = (a.x - p.x) / len;
      const side = t < 0.5 ? 1 : -1;
      let placed = false;
      for (const off of [side * 168, side * -168, side * 198]) {
        const x = p.x + nx * off;
        const y = p.y + ny * off;
        if (onLane(x, y, 140) || isWalkable(x, y)) continue;
        out.push({ x, y });
        placed = true;
        break;
      }
      void placed;
    }
  }
  out.push(fountain.home, fountain.away, MID, ancientPos.home, ancientPos.away);
  return out;
}

const LAMPS = lamps();

let ground: HTMLCanvasElement | null = null;
const GROUND_REV = 45;
let groundRev = 0;

function ensureGround(): HTMLCanvasElement {
  const platesReady = suppliedFountainReady(true) && suppliedFountainReady(false);
  if (ground && groundRev === GROUND_REV) return ground;
  if (ground && !platesReady) return ground;
  const c = document.createElement("canvas");
  c.width = WORLD;
  c.height = WORLD;
  const g = c.getContext("2d");
  if (!g) return c;
  paintGround(g);
  ground = c;
  groundRev = platesReady ? GROUND_REV : 0;
  return c;
}

function paintGround(ctx: CanvasRenderingContext2D): void {
  crisp(ctx);
  paintC42World(ctx);
  for (const c of JUNGLE_CAMPS) drawPixCamp(ctx, c);
  for (const r of ROCKS) drawPixRock(ctx, r);
  for (const log of LOGS) drawPixLog(ctx, log);
  for (const f of FERNS) drawPixFern(ctx, f);
  for (const s of SHROOMS) drawPixShroom(ctx, s);
  for (const b of BUSHES) drawPixBush(ctx, b);
  for (const t of TREES) drawPixTree(ctx, t);
  for (const t of TRUNKS) {
    ctx.fillStyle = t.fir ? "rgba(6, 16, 14, 0.55)" : "rgba(10, 22, 8, 0.5)";
    ctx.beginPath();
    ctx.arc(t.x, t.y, 22, 0, Math.PI * 2);
    ctx.fill();
    drawPixTree(ctx, { x: t.x, y: t.y, r: t.kind === "sapling" ? 14 : 18, fir: t.fir });
  }
  for (const L of LAMPS) drawPixLamp(ctx, L);
  drawPixFountain(ctx, fountain.home, true);
  drawPixFountain(ctx, fountain.away, false);
  drawPixShop(ctx, true);
  drawPixShop(ctx, false);
  drawMapLabels(ctx);
}

function drawBiome(ctx: CanvasRenderingContext2D): void {
  const lawn = ctx.createLinearGradient(0, WORLD, WORLD, 0);
  lawn.addColorStop(0, "#4a6a38");
  lawn.addColorStop(0.22, "#3c5c32");
  lawn.addColorStop(0.5, "#2a4630");
  lawn.addColorStop(0.78, "#1a3a34");
  lawn.addColorStop(1, "#0e2a2c");
  ctx.fillStyle = lawn;
  ctx.fillRect(0, 0, WORLD, WORLD);
  for (let i = 0; i < 1800; i++) {
    const n = hash(i * 17.3);
    const x = hash(i * 9.1) * WORLD;
    const y = hash(i * 5.7) * WORLD;
    const warm = (y - x + WORLD) / (WORLD * 2);
    ctx.fillStyle = warm > 0.5 ? "rgba(110, 150, 60, 0.16)" : "rgba(18, 58, 56, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y, 28 + n * 52, 14 + n * 28, n * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(50, 82, 32, 0.38)";
  for (let i = 0; i < 3200; i++) {
    const x = hash(i * 13.2) * WORLD;
    const y = hash(i * 8.4) * WORLD;
    if (onLane(x, y, 90)) continue;
    ctx.fillRect(x, y, 2, 3 + hash(i * 4.1) * 5);
  }
  ctx.fillStyle = "rgba(90, 70, 36, 0.22)";
  for (let i = 0; i < 420; i++) {
    const x = hash(i * 21.4) * WORLD;
    const y = hash(i * 16.8) * WORLD;
    if (onLane(x, y, 70)) continue;
    ctx.beginPath();
    ctx.ellipse(x, y, 18 + hash(i * 3.2) * 34, 8 + hash(i * 4.7) * 14, hash(i) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(180, 70, 90, 0.22)";
  for (let i = 0; i < 260; i++) {
    const x = hash(i * 41.1) * WORLD;
    const y = hash(i * 19.6) * WORLD;
    if (onLane(x, y, 80) || isWalkable(x, y)) continue;
    ctx.beginPath();
    ctx.arc(x, y, 1.6 + hash(i * 2.2) * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 900; i++) {
    const n = hash(i * 61.2);
    const x = hash(i * 23.4) * WORLD;
    const y = hash(i * 17.8) * WORLD;
    if (onLane(x, y, 80)) continue;
    const fir = x + y > WORLD;
    ctx.fillStyle = fir ? "rgba(30, 70, 62, 0.28)" : "rgba(70, 110, 40, 0.26)";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3 + n * 4, y - 5 - n * 6);
    ctx.lineTo(x + 7 + n * 3, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(40, 28, 14, 0.2)";
  for (let i = 0; i < 240; i++) {
    const x = hash(i * 33.1) * WORLD;
    const y = hash(i * 29.6) * WORLD;
    if (onLane(x, y, 70)) continue;
    ctx.beginPath();
    ctx.ellipse(x, y, 22 + hash(i) * 40, 8 + hash(i * 2) * 12, hash(i * 3) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(70, 110, 42, 0.18)";
  for (let i = 0; i < 2400; i++) {
    const x = hash(i * 47.1) * WORLD;
    const y = hash(i * 39.6) * WORLD;
    if (onLane(x, y, 70)) continue;
    ctx.fillRect(x, y, 1.4, 4 + hash(i * 2.8) * 6);
  }
  ctx.fillStyle = "rgba(28, 18, 8, 0.16)";
  for (let i = 0; i < 180; i++) {
    const x = hash(i * 71.4) * WORLD;
    const y = hash(i * 53.2) * WORLD;
    if (onLane(x, y, 80)) continue;
    ctx.beginPath();
    ctx.ellipse(x, y, 30 + hash(i) * 50, 10 + hash(i * 2) * 16, hash(i * 5) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(8, 6, 4, 0.55)";
  ctx.fillRect(0, 0, WORLD, 28);
  ctx.fillRect(0, WORLD - 28, WORLD, 28);
  ctx.fillRect(0, 0, 28, WORLD);
  ctx.fillRect(WORLD - 28, 0, 28, WORLD);
}

function drawCliffs(ctx: CanvasRenderingContext2D): void {
  for (let cy = 0; cy < WORLD; cy += CELL) {
    for (let cx = 0; cx < WORLD; cx += CELL) {
      const mx = cx + CELL / 2;
      const my = cy + CELL / 2;
      if (isWalkable(mx, my) || onLane(mx, my, 110)) continue;
      const fir = cx + cy > WORLD;
      ctx.fillStyle = fir ? "#0c1e1a" : "#152414";
      ctx.fillRect(cx, cy, CELL, CELL);
      const n = hash(cx * 0.17 + cy * 0.31);
      ctx.fillStyle = fir ? "rgba(20, 70, 62, 0.18)" : "rgba(50, 90, 30, 0.16)";
      ctx.fillRect(cx + 6, cy + 8, 12 + n * 18, 8);
      if (isWalkable(mx, my + CELL)) {
        ctx.fillStyle = fir ? "#1c3c34" : "#3a5228";
        ctx.beginPath();
        ctx.moveTo(cx, cy + CELL);
        ctx.lineTo(cx + CELL, cy + CELL);
        ctx.lineTo(cx + CELL - 6, cy + CELL + 16);
        ctx.lineTo(cx + 6, cy + CELL + 16);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(cx + 4, cy + CELL, CELL - 8, 4);
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(cx + CELL / 2, cy + CELL + 22, CELL * 0.58, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (isWalkable(mx + CELL, my)) {
        ctx.fillStyle = fir ? "#16302c" : "#2a3c1c";
        ctx.fillRect(cx + CELL - 6, cy + 4, 14, CELL - 4);
      }
      if (isWalkable(mx, my - CELL)) {
        ctx.fillStyle = "rgba(0,0,0,0.38)";
        ctx.fillRect(cx, cy, CELL, 12);
      }
      if (isWalkable(mx - CELL, my)) {
        ctx.fillStyle = "rgba(0,0,0,0.24)";
        ctx.fillRect(cx, cy, 9, CELL);
      }
      ctx.fillStyle = fir ? "rgba(62, 200, 193, 0.08)" : "rgba(201, 162, 74, 0.08)";
      ctx.fillRect(cx + 10 + n * 16, cy + 18, 3, 10 + n * 8);
      ctx.fillStyle = fir ? "rgba(18, 56, 48, 0.35)" : "rgba(48, 72, 28, 0.32)";
      ctx.beginPath();
      ctx.ellipse(cx + 18 + n * 10, cy + 22, 8 + n * 10, 4 + n * 5, n, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(20, 16, 10, 0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy + 10);
      ctx.lineTo(cx + 18 + n * 12, cy + CELL - 8);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 245, 210, 0.06)";
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy + 6);
      ctx.lineTo(cx + 14, cy + 20);
      ctx.stroke();
      ctx.fillStyle = fir ? "rgba(40, 110, 88, 0.22)" : "rgba(70, 110, 40, 0.2)";
      ctx.beginPath();
      ctx.ellipse(cx + 8 + n * 20, cy + CELL - 10, 10 + n * 8, 4, n, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fir ? "rgba(90, 70, 50, 0.28)" : "rgba(110, 90, 60, 0.26)";
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy + 14);
      ctx.lineTo(cx + 14 + n * 8, cy + 8);
      ctx.lineTo(cx + 18, cy + 20);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawRiver(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.translate(MID.x, MID.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#1a1610";
  ctx.fillRect(-980, -132, 1960, 264);
  const bank = ctx.createLinearGradient(0, -110, 0, 110);
  bank.addColorStop(0, "#3a2c1c");
  bank.addColorStop(0.1, "#6a5640");
  bank.addColorStop(0.9, "#5a4a34");
  bank.addColorStop(1, "#2a2016");
  ctx.fillStyle = bank;
  ctx.fillRect(-960, -108, 1920, 216);
  const water = ctx.createLinearGradient(0, -82, 0, 82);
  water.addColorStop(0, "#0e2838");
  water.addColorStop(0.28, "#1c5870");
  water.addColorStop(0.5, "#3a8a9a");
  water.addColorStop(0.62, "#6ab0b8");
  water.addColorStop(0.78, "#1c5870");
  water.addColorStop(1, "#0e2838");
  ctx.fillStyle = water;
  ctx.fillRect(-940, -82, 1880, 164);
  ctx.fillStyle = "rgba(210, 240, 245, 0.14)";
  ctx.fillRect(-940, -18, 1880, 10);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(-940, 22, 1880, 5);
  for (let i = -8; i <= 8; i++) {
    ctx.fillStyle = "rgba(180, 230, 235, 0.07)";
    ctx.fillRect(-900 + i * 110, -40, 70, 3);
  }
  ctx.fillStyle = "rgba(210, 245, 250, 0.09)";
  for (let i = -18; i <= 18; i++) {
    const n = hash(i * 4.2);
    ctx.beginPath();
    ctx.ellipse(i * 48, -12 + (i % 3) * 8, 22 + n * 18, 3, 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(20, 70, 50, 0.45)";
  for (let i = -16; i <= 16; i++) {
    const x = i * 56;
    ctx.beginPath();
    ctx.ellipse(x + 18, -78, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(40, 100, 60, 0.4)";
    ctx.beginPath();
    ctx.ellipse(x + 18, -82, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(20, 70, 50, 0.45)";
  }
  ctx.fillStyle = "rgba(40, 90, 70, 0.55)";
  for (let i = -12; i <= 12; i++) {
    const x = i * 72;
    ctx.beginPath();
    ctx.moveTo(x - 6, -108);
    ctx.lineTo(x, -128 - (i & 1) * 10);
    ctx.lineTo(x + 6, -108);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 6, 108);
    ctx.lineTo(x, 128 + (i & 1) * 8);
    ctx.lineTo(x + 6, 108);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "#5a4a38";
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    ctx.fillRect(i * 160 - 5, -96, 10, 192);
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(i * 160 - 7, -18, 14, 6);
    ctx.fillStyle = "#5a4a38";
  }
  ctx.fillStyle = "#4a3a28";
  ctx.fillRect(-92, -118, 184, 236);
  const deck = ctx.createLinearGradient(-80, 0, 80, 0);
  deck.addColorStop(0, "#3a2e22");
  deck.addColorStop(0.5, "#8a6a48");
  deck.addColorStop(1, "#3a2e22");
  ctx.fillStyle = deck;
  ctx.fillRect(-78, -108, 156, 216);
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(-78, -8, 156, 6);
  ctx.fillRect(-78, 4, 156, 6);
  ctx.fillStyle = "#2a2218";
  for (let i = -4; i <= 4; i++) ctx.fillRect(i * 16 - 3, -108, 6, 216);
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 3;
  ctx.strokeRect(-78, -108, 156, 216);
  ctx.fillStyle = "#1a120c";
  ctx.fillRect(-84, -112, 8, 224);
  ctx.fillRect(76, -112, 8, 224);
  ctx.fillStyle = "#c9a24a";
  for (let y = -100; y <= 100; y += 18) {
    ctx.fillRect(-84, y, 8, 4);
    ctx.fillRect(76, y, 8, 4);
  }
  ctx.fillStyle = "rgba(210, 245, 250, 0.12)";
  for (let i = -24; i <= 24; i++) {
    const n = hash(i * 8.1);
    ctx.beginPath();
    ctx.ellipse(i * 38, 8 + Math.sin(i) * 10, 16 + n * 14, 2.4, 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(30, 90, 50, 0.55)";
  for (let i = -10; i <= 10; i++) {
    if (Math.abs(i) < 2) continue;
    ctx.beginPath();
    ctx.ellipse(i * 80 + 10, 62, 14, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(50, 130, 70, 0.4)";
    ctx.beginPath();
    ctx.ellipse(i * 80 + 10, 58, 9, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(30, 90, 50, 0.55)";
  }
  ctx.fillStyle = "rgba(12, 28, 36, 0.35)";
  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 120, 20, 18, 5, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function strokePath(ctx: CanvasRenderingContext2D, path: Pt[]): void {
  ctx.beginPath();
  ctx.moveTo(path[0]!.x, path[0]!.y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x, path[i]!.y);
  ctx.stroke();
}

function strokeLanes(ctx: CanvasRenderingContext2D): void {
  for (const lane of LANES) strokePath(ctx, lanePath.home[lane]);
}

function strokeConnectors(ctx: CanvasRenderingContext2D): void {
  const home = [
    [fountain.home, lanePath.home.top[0]!],
    [fountain.home, lanePath.home.mid[0]!],
    [fountain.home, lanePath.home.bot[0]!],
  ];
  const away = [
    [fountain.away, lanePath.home.top[lanePath.home.top.length - 1]!],
    [fountain.away, lanePath.home.mid[lanePath.home.mid.length - 1]!],
    [fountain.away, lanePath.home.bot[lanePath.home.bot.length - 1]!],
  ];
  for (const [a, b] of [...home, ...away]) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function paintStreet(ctx: CanvasRenderingContext2D): void {
  strokeLanes(ctx);
  strokeConnectors(ctx);
}

function drawRoads(ctx: CanvasRenderingContext2D): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#5a5244";
  ctx.lineWidth = 168;
  paintStreet(ctx);
  ctx.strokeStyle = "#8a7a62";
  ctx.lineWidth = 148;
  paintStreet(ctx);
  ctx.strokeStyle = "#2a261e";
  ctx.lineWidth = 138;
  paintStreet(ctx);
  const asphalt = ctx.createLinearGradient(0, WORLD, WORLD, 0);
  asphalt.addColorStop(0, "#6a5e4e");
  asphalt.addColorStop(0.45, "#3e382e");
  asphalt.addColorStop(1, "#2a3232");
  ctx.strokeStyle = asphalt;
  ctx.lineWidth = 104;
  paintStreet(ctx);
  ctx.strokeStyle = "rgba(18, 14, 10, 0.55)";
  ctx.lineWidth = 10;
  paintStreet(ctx);
  ctx.strokeStyle = "rgba(239, 230, 214, 0.32)";
  ctx.lineWidth = 3;
  paintStreet(ctx);
  ctx.strokeStyle = "rgba(232, 196, 74, 0.78)";
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 20]);
  paintStreet(ctx);
  ctx.setLineDash([]);
  drawCrosswalk(ctx, MID, Math.PI / 4);
  drawCrosswalk(ctx, along(lanePath.home.mid, 0.22), Math.PI / 4);
  drawCrosswalk(ctx, along(lanePath.home.mid, 0.78), Math.PI / 4);
  drawCrosswalk(ctx, along(lanePath.home.top, 0.22), Math.PI / 2);
  drawCrosswalk(ctx, along(lanePath.home.top, 0.72), 0);
  drawCrosswalk(ctx, along(lanePath.home.bot, 0.22), 0);
  drawCrosswalk(ctx, along(lanePath.home.bot, 0.72), Math.PI / 2);
  ctx.fillStyle = "rgba(18, 12, 8, 0.22)";
  for (const lane of LANES) {
    for (const t of [0.26, 0.48, 0.7]) {
      const p = along(lanePath.home[lane], t);
      ctx.beginPath();
      ctx.ellipse(p.x + 8, p.y - 6, 22, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "rgba(20, 16, 12, 0.45)";
  for (const lane of LANES) {
    for (const t of [0.18, 0.36, 0.54, 0.72]) {
      const p = along(lanePath.home[lane], t);
      ctx.beginPath();
      ctx.arc(p.x + 18, p.y - 8, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "rgba(18, 14, 10, 0.5)";
  for (const lane of LANES) {
    for (const t of [0.12, 0.28, 0.44, 0.6, 0.76, 0.88]) {
      const p = along(lanePath.home[lane], t);
      ctx.fillRect(p.x - 16, p.y + 10, 22, 8);
      ctx.strokeStyle = "#4a3a28";
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - 16, p.y + 10, 22, 8);
    }
  }
  ctx.fillStyle = "rgba(90, 80, 64, 0.35)";
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const len = dist(a, b);
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      const steps = Math.max(4, Math.floor(len / 28));
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        ctx.fillRect(x + nx * 62 - 4, y + ny * 62 - 3, 8, 6);
        ctx.fillRect(x - nx * 62 - 4, y - ny * 62 - 3, 8, 6);
        if (k % 3 === 0) {
          ctx.fillStyle = "rgba(40, 32, 22, 0.55)";
          ctx.fillRect(x + nx * 70 - 5, y + ny * 70 - 4, 10, 8);
          ctx.fillStyle = "rgba(90, 80, 64, 0.35)";
        }
      }
    }
  }
}

function drawStreetDress(ctx: CanvasRenderingContext2D): void {
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (const t of [0.14, 0.32, 0.5, 0.68, 0.86]) {
      const p = along(path, t);
      const a = along(path, Math.min(1, t + 0.02));
      const ang = Math.atan2(a.y - p.y, a.x - p.x);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      ctx.fillStyle = "rgba(201, 162, 74, 0.42)";
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-12, -11);
      ctx.lineTo(-12, 11);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const p = along(path, t);
      ctx.fillStyle = "#2a2218";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a4a38";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = "rgba(18, 14, 10, 0.28)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 140; i++) {
    const lane = LANES[i % 3]!;
    const t = 0.08 + hash(i * 9.2) * 0.84;
    const p = along(lanePath.home[lane], t);
    const a = along(lanePath.home[lane], Math.min(1, t + 0.01));
    const ang = Math.atan2(a.y - p.y, a.x - p.x);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(-22, hash(i) * 16 - 8);
    ctx.lineTo(28, hash(i * 2.1) * 14 - 7);
    ctx.stroke();
    ctx.restore();
  }
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const len = dist(a, b);
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      const steps = Math.max(1, Math.floor(len / 160));
      for (let k = 1; k <= steps; k++) {
        const t = k / (steps + 1);
        const x = a.x + (b.x - a.x) * t + nx * 70;
        const y = a.y + (b.y - a.y) * t + ny * 70;
        if (onLane(x, y, 48)) continue;
        drawBench(ctx, x, y, Math.atan2(b.y - a.y, b.x - a.x), lane === "bot" || k % 2 === 0);
      }
    }
  }
}

function drawBench(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, dc: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(-16, 6, 36, 6);
  ctx.fillStyle = dc ? "#5a3a22" : "#1a2a28";
  ctx.fillRect(-18, -4, 36, 10);
  ctx.fillStyle = dc ? "#c9a24a" : "#3ec8c1";
  ctx.fillRect(-18, -6, 36, 3);
  ctx.fillStyle = "#2a1c12";
  ctx.fillRect(-16, 6, 4, 8);
  ctx.fillRect(12, 6, 4, 8);
  ctx.restore();
}

function drawCrosswalk(ctx: CanvasRenderingContext2D, p: Pt, ang: number): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(ang);
  ctx.fillStyle = "rgba(239, 230, 214, 0.62)";
  for (let i = -5; i <= 5; i++) ctx.fillRect(-38, i * 9 - 3, 76, 5);
  ctx.restore();
}

function drawTowerPads(ctx: CanvasRenderingContext2D): void {
  for (const spec of towerSpecs) {
    const p = spec.pos;
    const home = spec.team === "home";
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(p.x + 6, p.y + 18, 46, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = home ? "#4a3a28" : "#243438";
    ctx.beginPath();
    ctx.arc(p.x, p.y + 8, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = home ? "#c9a24a" : "#3ec8c1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 8, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = home ? "rgba(196, 22, 28, 0.22)" : "rgba(62, 200, 193, 0.2)";
    ctx.beginPath();
    ctx.arc(p.x, p.y + 8, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = home ? "#6a5a40" : "#2a3a3c";
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (i * i + j * j > 6) continue;
        ctx.fillRect(p.x + i * 10 - 4, p.y + j * 10, 8, 8);
      }
    }
    ctx.strokeStyle = home ? "rgba(201,162,74,0.45)" : "rgba(62,200,193,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x - 28, p.y - 18, 56, 52);
    ctx.fillStyle = home ? "rgba(255, 220, 140, 0.12)" : "rgba(160, 240, 230, 0.1)";
    ctx.beginPath();
    ctx.arc(p.x, p.y - 6, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = home ? "#c4161c" : "#3ec8c1";
    ctx.fillRect(p.x - 1, p.y - 28, 3, 12);
  }
}

function drawRock(ctx: CanvasRenderingContext2D, r: { x: number; y: number; s: number }): void {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(r.x + 4, r.y + 8, r.s * 1.1, r.s * 0.4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  const stone = ctx.createLinearGradient(r.x - r.s, r.y - r.s, r.x + r.s, r.y + r.s);
  stone.addColorStop(0, "#8a7a68");
  stone.addColorStop(1, "#3a3228");
  ctx.fillStyle = stone;
  ctx.beginPath();
  ctx.ellipse(r.x, r.y, r.s, r.s * 0.72, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(239, 230, 214, 0.18)";
  ctx.beginPath();
  ctx.ellipse(r.x - r.s * 0.3, r.y - r.s * 0.25, r.s * 0.3, r.s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawLog(ctx: CanvasRenderingContext2D, log: { x: number; y: number; ang: number }): void {
  ctx.save();
  ctx.translate(log.x, log.y);
  ctx.rotate(log.ang);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(-22, 4, 48, 8);
  ctx.fillStyle = "#5a3a1c";
  ctx.fillRect(-24, -6, 48, 12);
  ctx.fillStyle = "#c9a24a";
  ctx.beginPath();
  ctx.ellipse(24, 0, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2410";
  ctx.beginPath();
  ctx.ellipse(24, 0, 2.4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, b: { x: number; y: number; s: number }): void {
  ctx.fillStyle = "rgba(18, 36, 20, 0.55)";
  ctx.beginPath();
  ctx.ellipse(b.x + 6, b.y + 8, b.s * 1.4, b.s * 0.6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  const bush = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.s);
  bush.addColorStop(0, "#4a8a38");
  bush.addColorStop(1, "#142414");
  ctx.fillStyle = bush;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b.x - b.s * 0.4, b.y + 2, b.s * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(160, 210, 90, 0.22)";
  ctx.beginPath();
  ctx.arc(b.x - b.s * 0.2, b.y - b.s * 0.25, b.s * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function drawLawnScatter(ctx: CanvasRenderingContext2D): void {
  for (const f of FLOWERS) {
    ctx.fillStyle = f.pink ? "rgba(220, 120, 150, 0.55)" : "rgba(90, 160, 70, 0.45)";
    ctx.beginPath();
    ctx.arc(f.x, f.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = f.pink ? "rgba(255, 210, 220, 0.7)" : "rgba(240, 210, 80, 0.7)";
    ctx.beginPath();
    ctx.arc(f.x - 2.2, f.y - 1, 1.6, 0, Math.PI * 2);
    ctx.arc(f.x + 2.2, f.y - 1, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a24a";
    ctx.beginPath();
    ctx.arc(f.x, f.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Extra campus props baked into the ground cache (rev 16). */
function drawCampusDetail(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  for (let i = 0; i < 900; i++) {
    const n = hash(i * 17.3 + 4.1);
    const x = 70 + hash(i * 3.1) * (WORLD - 140);
    const y = 70 + hash(i * 7.4) * (WORLD - 140);
    const dx = x - MID.x;
    const dy = y - MID.y;
    if (dx * dx + dy * dy < 210 * 210) continue;
    ctx.strokeStyle = `rgba(48, 92, 38, ${0.16 + n * 0.22})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (hash(i + 2.2) - 0.5) * 5, y - 3 - n * 5);
    ctx.stroke();
  }
  ctx.restore();

  const fountains: Pt[] = [fountain.home, fountain.away];
  for (const f of fountains) {
    const dc = f.x + f.y < WORLD;
    ctx.save();
    ctx.strokeStyle = dc ? "rgba(201, 162, 74, 0.12)" : "rgba(62, 200, 193, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 252, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = "rgba(18, 14, 10, 0.24)";
  ctx.lineWidth = 1.15;
  ctx.lineCap = "round";
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const len = dist(a, b);
      const steps = Math.max(6, Math.floor(len / 90));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const jx = (hash(i * 11 + s + lane.length) - 0.5) * 16;
        const jy = (hash(i * 13 + s + 2 + lane.length) - 0.5) * 16;
        ctx.lineTo(a.x + (b.x - a.x) * t + jx, a.y + (b.y - a.y) * t + jy);
      }
      ctx.stroke();
    }
  }
  ctx.restore();

  const halls: Array<{ x: number; y: number; w: number; h: number; dc: boolean; label: string }> = [
    { x: 48, y: 1640, w: 90, h: 64, dc: true, label: "ADMIN" },
    { x: 48, y: 1748, w: 78, h: 52, dc: true, label: "DORM" },
    { x: 48, y: 1988, w: 70, h: 48, dc: true, label: "REC" },
    { x: 640, y: 2496, w: 110, h: 44, dc: true, label: "GYM" },
    { x: 980, y: 2496, w: 86, h: 40, dc: true, label: "LAB" },
    { x: 2496, y: 700, w: 84, h: 56, dc: false, label: "HALL" },
    { x: 2496, y: 796, w: 70, h: 46, dc: false, label: "DORM" },
    { x: 2496, y: 1188, w: 76, h: 50, dc: false, label: "COOP" },
    { x: 1680, y: 48, w: 110, h: 44, dc: false, label: "PIKE" },
    { x: 1488, y: 48, w: 86, h: 40, dc: false, label: "DOCK" },
  ];
  for (const h of halls) {
    ctx.fillStyle = h.dc ? "#3a2c22" : "#243040";
    ctx.fillRect(h.x, h.y, h.w, h.h);
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(h.x + 0.5, h.y + 0.5, h.w, h.h);
    ctx.fillStyle = h.dc ? "#5a3a28" : "#1a2834";
    ctx.fillRect(h.x + 3, h.y + 3, h.w - 6, 8);
    ctx.fillStyle = h.dc ? "rgba(210, 186, 92, 0.28)" : "rgba(142, 232, 224, 0.26)";
    const cols = Math.max(2, Math.floor((h.w - 12) / 16));
    const rows = Math.max(1, Math.floor((h.h - 18) / 13));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillRect(h.x + 8 + c * 16, h.y + 16 + r * 13, 7, 8);
      }
    }
    ctx.fillStyle = h.dc ? "#c9a24a" : "#3ec8c1";
    ctx.font = "600 8px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(h.label, h.x + h.w / 2, h.y + h.h - 5);
    ctx.textAlign = "left";
  }

  ctx.save();
  ctx.fillStyle = "rgba(210, 186, 92, 0.28)";
  const arrows: Array<[number, number, number]> = [
    [220, 400, Math.PI / 2],
    [400, 2380, 0],
    [2200, 220, Math.PI],
    [2380, 2200, -Math.PI / 2],
    [1300, 80, 0],
    [1300, 2520, Math.PI],
    [80, 1300, Math.PI / 2],
    [2520, 1300, -Math.PI / 2],
  ];
  for (const [x, y, a] of arrows) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(18, 14, 10, 0.18)";
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const len = dist(a, b) || 1;
      const steps = Math.max(3, Math.floor(len / 70));
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const n = hash(s * 9 + i * 4 + lane.length);
        if (n < 0.45) continue;
        const x = a.x + (b.x - a.x) * t + (n - 0.7) * 22;
        const y = a.y + (b.y - a.y) * t + (hash(s + 3) - 0.5) * 18;
        ctx.beginPath();
        ctx.ellipse(x, y, 9 + n * 8, 3.5, n, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawCampusV16(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  for (let i = 0; i < 2200; i++) {
    const n = hash(i * 71.4 + 8.2);
    const x = hash(i * 14.6) * WORLD;
    const y = hash(i * 9.8) * WORLD;
    if (onLane(x, y, 72)) continue;
    const dc = x + y < WORLD;
    ctx.fillStyle = dc ? `rgba(92, 132, 48, ${0.18 + n * 0.28})` : `rgba(36, 88, 78, ${0.16 + n * 0.26})`;
    ctx.fillRect(x, y, 1.4, 3.2 + n * 4.6);
  }
  for (let i = 0; i < 480; i++) {
    const n = hash(i * 33.1 + 2.4);
    const x = hash(i * 19.2) * WORLD;
    const y = hash(i * 12.7) * WORLD;
    if (onLane(x, y, 88)) continue;
    const dc = x + y < WORLD;
    ctx.fillStyle = dc ? `rgba(220, 90, 120, ${0.28 + n * 0.35})` : `rgba(70, 190, 150, ${0.22 + n * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.3 + n * 1.8, 0, Math.PI * 2);
    ctx.fill();
    if (n > 0.55) {
      ctx.fillStyle = dc ? "rgba(255, 210, 140, 0.35)" : "rgba(180, 255, 230, 0.28)";
      ctx.beginPath();
      ctx.arc(x + 2.2, y - 1.4, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.strokeStyle = "rgba(18, 12, 8, 0.2)";
  ctx.lineWidth = 1.05;
  ctx.lineCap = "round";
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const len = dist(a, b) || 1;
      const steps = Math.max(4, Math.floor(len / 64));
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const n = hash(s * 17 + i * 5 + lane.length + 9);
        if (n < 0.38) continue;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        ctx.beginPath();
        ctx.moveTo(x - 18 + n * 8, y - 4);
        ctx.quadraticCurveTo(x, y + (n - 0.5) * 10, x + 16, y + 3);
        ctx.stroke();
      }
    }
  }
  ctx.fillStyle = "rgba(28, 22, 16, 0.55)";
  for (const lane of LANES) {
    for (const t of [0.14, 0.4, 0.62, 0.84]) {
      const p = along(lanePath.home[lane], t);
      ctx.beginPath();
      ctx.arc(p.x - 22, p.y + 12, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(90, 80, 64, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = "rgba(18, 12, 8, 0.35)";
      ctx.beginPath();
      ctx.arc(p.x - 22, p.y + 12, 2.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  for (const f of [fountain.home, fountain.away]) {
    const dc = f.x + f.y < WORLD;
    ctx.strokeStyle = dc ? "rgba(201, 162, 74, 0.16)" : "rgba(62, 200, 193, 0.14)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 258, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(40, 28, 16, 0.22)";
  for (const r of ROCKS) {
    ctx.beginPath();
    ctx.ellipse(r.x + 6, r.y + r.s * 0.4, r.s * 0.9, r.s * 0.35, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(70, 110, 48, 0.28)";
    ctx.beginPath();
    ctx.ellipse(r.x - r.s * 0.2, r.y - r.s * 0.15, r.s * 0.45, r.s * 0.22, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(40, 28, 16, 0.22)";
  }
  const oxDc = 70;
  const oyDc = 2360;
  ctx.fillStyle = "rgba(239, 230, 214, 0.22)";
  for (let i = 0; i < 40; i++) {
    const n = hash(i * 8.1);
    ctx.beginPath();
    ctx.arc(oxDc + 80 + n * 360, oyDc - 90 - hash(i * 3.3) * 140, 1.4 + n, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(90, 70, 48, 0.35)";
  for (let i = 0; i < 8; i++) ctx.fillRect(oxDc + 156 + i * 28, oyDc - 42, 18, 3);
  const oxSea = 2140;
  const oySea = 40;
  ctx.strokeStyle = "rgba(20, 40, 48, 0.45)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(oxSea + 36 + i * 38, oySea + 206);
    ctx.lineTo(oxSea + 36 + i * 38, oySea + 226);
    ctx.stroke();
    ctx.fillStyle = "#3a2a1c";
    ctx.beginPath();
    ctx.arc(oxSea + 36 + i * 38, oySea + 226, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(180, 230, 235, 0.1)";
  for (let i = 0; i < 10; i++) ctx.fillRect(oxSea + 12 + i * 42, oySea + 28 + (i % 3) * 10, 28, 3);
  ctx.restore();
}

/** Extra campus paint baked into the ground cache (rev 17). */
function drawCampusV17(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  for (let i = 0; i < 1600; i++) {
    const n = hash(i * 83.2 + 1.7);
    const x = hash(i * 11.4) * WORLD;
    const y = hash(i * 7.9) * WORLD;
    if (onLane(x, y, 68)) continue;
    const dc = x + y < WORLD;
    ctx.fillStyle = dc ? `rgba(48, 92, 28, ${0.14 + n * 0.22})` : `rgba(24, 72, 64, ${0.12 + n * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1.2 + n, y - 2.4 - n * 3);
    ctx.lineTo(x + 2.6 + n, y);
    ctx.closePath();
    ctx.fill();
  }
  for (let i = 0; i < 220; i++) {
    const n = hash(i * 51.6 + 4.2);
    const x = hash(i * 15.3) * WORLD;
    const y = hash(i * 10.1) * WORLD;
    if (onLane(x, y, 90)) continue;
    ctx.fillStyle = n > 0.5 ? `rgba(70, 140, 48, ${0.28 + n * 0.3})` : `rgba(210, 190, 70, ${0.24 + n * 0.28})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.1 + n, 0, Math.PI * 2);
    ctx.arc(x + 2.4, y - 0.8, 0.9, 0, Math.PI * 2);
    ctx.arc(x + 1.1, y + 1.6, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const w of WOODS) {
    ctx.fillStyle = w.fir ? "rgba(18, 48, 42, 0.22)" : "rgba(70, 52, 22, 0.2)";
    for (let i = 0; i < 28; i++) {
      const n = hash(w.x + i * 17.4 + 6);
      ctx.beginPath();
      ctx.ellipse(
        w.x + (n - 0.5) * w.rx * 1.5,
        w.y + (hash(i * 3.1) - 0.5) * w.ry * 1.5,
        5 + n * 9,
        2.2 + n * 3,
        n * 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  for (const t of TREES) {
    if (hash(t.x * 0.13 + t.y) < 0.55) continue;
    ctx.fillStyle = t.fir ? "rgba(40, 90, 78, 0.08)" : "rgba(255, 220, 140, 0.07)";
    ctx.beginPath();
    ctx.ellipse(t.x - 4, t.y + 6, t.r * 0.7, t.r * 0.28, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(232, 216, 168, 0.28)";
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (const t of [0.07, 0.93]) {
      const p0 = along(path, Math.max(0, t - 0.012));
      const p1 = along(path, Math.min(1, t + 0.012));
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy) || 1;
      const tx = dx / len;
      const ty = dy / len;
      const nx = -ty;
      const ny = tx;
      const p = along(path, t);
      for (let b = 0; b < 6; b++) {
        const ox = p.x + tx * (b - 2.5) * 8;
        const oy = p.y + ty * (b - 2.5) * 8;
        ctx.beginPath();
        ctx.moveTo(ox - nx * 14, oy - ny * 14);
        ctx.lineTo(ox + nx * 14, oy + ny * 14);
        ctx.lineTo(ox + nx * 14 + tx * 4, oy + ny * 14 + ty * 4);
        ctx.lineTo(ox - nx * 14 + tx * 4, oy - ny * 14 + ty * 4);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.fillStyle = "rgba(28, 22, 16, 0.5)";
  ctx.strokeStyle = "rgba(90, 80, 64, 0.4)";
  ctx.lineWidth = 1;
  for (const lane of LANES) {
    for (const t of [0.22, 0.5, 0.76]) {
      const p = along(lanePath.home[lane], t);
      const x = p.x + 18;
      const y = p.y - 16;
      ctx.fillRect(x, y, 14, 10);
      ctx.strokeRect(x + 0.5, y + 0.5, 14, 10);
      ctx.strokeStyle = "rgba(18, 12, 8, 0.45)";
      ctx.beginPath();
      ctx.moveTo(x + 3, y);
      ctx.lineTo(x + 3, y + 10);
      ctx.moveTo(x + 7, y);
      ctx.lineTo(x + 7, y + 10);
      ctx.moveTo(x + 11, y);
      ctx.lineTo(x + 11, y + 10);
      ctx.stroke();
      ctx.strokeStyle = "rgba(90, 80, 64, 0.4)";
    }
  }
  ctx.fillStyle = "rgba(90, 74, 52, 0.32)";
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!;
      const b = path[i + 1]!;
      const len = dist(a, b) || 1;
      const steps = Math.max(4, Math.floor(len / 80));
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const n = hash(s * 19 + i * 7 + lane.length);
        if (n < 0.4) continue;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        ctx.fillRect(x + 26 + n * 6, y - 3, 5, 9);
        ctx.fillRect(x - 32 - n * 6, y - 3, 5, 9);
      }
    }
  }
  ctx.strokeStyle = "rgba(201, 162, 74, 0.28)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(MID.x, MID.y, 86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(239, 230, 214, 0.22)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(MID.x - 70, MID.y);
  ctx.lineTo(MID.x + 70, MID.y);
  ctx.moveTo(MID.x, MID.y - 70);
  ctx.lineTo(MID.x, MID.y + 70);
  ctx.stroke();
  const oxDc = 70;
  const oyDc = 2360;
  ctx.fillStyle = "rgba(210, 196, 168, 0.22)";
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      if ((row + col) % 2 === 0) ctx.fillRect(oxDc + 148 + col * 16, oyDc - 58 - row * 10, 14, 8);
    }
  }
  const oxSea = 2140;
  const oySea = 40;
  ctx.fillStyle = "#3a2a1c";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(oxSea + 48 + i * 34, oySea + 168, 22, 14);
    ctx.fillStyle = "#5a3a24";
    ctx.fillRect(oxSea + 50 + i * 34, oySea + 170, 18, 4);
    ctx.fillStyle = "#3a2a1c";
  }
  ctx.strokeStyle = "rgba(90, 70, 48, 0.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(oxSea + 58 + i * 40, oySea + 198, 7, 0.4, Math.PI * 1.8);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(220, 240, 245, 0.16)";
  for (let i = 0; i < 80; i++) {
    const n = hash(i * 27.4);
    const x = MID.x + (n - 0.5) * 1400;
    const y = MID.y + (hash(i * 9.2) - 0.5) * 1400;
    if (Math.abs((x - MID.x) + (y - MID.y)) > 80 && Math.abs((x - MID.x) - (y - MID.y)) > 80) continue;
    ctx.beginPath();
    ctx.ellipse(x, y, 6 + n * 8, 2.2, n, 0, Math.PI * 2);
    ctx.fill();
  }
  const halls: Array<{ x: number; y: number; w: number; h: number; dc: boolean }> = [
    { x: 48, y: 1640, w: 90, h: 64, dc: true },
    { x: 640, y: 2496, w: 110, h: 44, dc: true },
    { x: 2496, y: 700, w: 84, h: 56, dc: false },
    { x: 1680, y: 48, w: 110, h: 44, dc: false },
  ];
  for (const h of halls) {
    ctx.fillStyle = h.dc ? "rgba(26, 18, 12, 0.45)" : "rgba(12, 20, 24, 0.45)";
    ctx.fillRect(h.x + h.w * 0.35, h.y - 6, 10, 6);
    ctx.fillRect(h.x + h.w * 0.62, h.y - 5, 8, 5);
    ctx.fillStyle = h.dc ? "#c4161c" : "#3ec8c1";
    ctx.fillRect(h.x + h.w - 8, h.y - 22, 2, 18);
    ctx.beginPath();
    ctx.moveTo(h.x + h.w - 6, h.y - 20);
    ctx.lineTo(h.x + h.w + 10, h.y - 16);
    ctx.lineTo(h.x + h.w - 6, h.y - 12);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(26, 18, 12, 0.55)";
  for (let i = 0; i < 6; i++) ctx.fillRect(640 + 8 + i * 16, 2544, 3, 10);
  ctx.strokeStyle = "rgba(26, 18, 12, 0.4)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(640 + 8, 2544);
  ctx.lineTo(640 + 8 + 5 * 16, 2544);
  ctx.stroke();
  ctx.restore();
}

/** Ground-cache polish (rev 19). Layout and walkability stay the same. */
function drawCampusV19(ctx: CanvasRenderingContext2D): void {
  const dcWash = ctx.createRadialGradient(fountain.home.x, fountain.home.y, 80, fountain.home.x, fountain.home.y, 1180);
  dcWash.addColorStop(0, "rgba(255, 196, 110, 0.1)");
  dcWash.addColorStop(0.55, "rgba(196, 22, 28, 0.04)");
  dcWash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = dcWash;
  ctx.beginPath();
  ctx.arc(fountain.home.x, fountain.home.y, 1180, 0, Math.PI * 2);
  ctx.fill();
  const seaWash = ctx.createRadialGradient(fountain.away.x, fountain.away.y, 70, fountain.away.x, fountain.away.y, 1180);
  seaWash.addColorStop(0, "rgba(90, 220, 210, 0.12)");
  seaWash.addColorStop(0.55, "rgba(20, 70, 80, 0.07)");
  seaWash.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = seaWash;
  ctx.beginPath();
  ctx.arc(fountain.away.x, fountain.away.y, 1180, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  const occlude = ctx.createRadialGradient(MID.x, MID.y, 120, MID.x, MID.y, 1600);
  occlude.addColorStop(0, "rgba(255,255,255,1)");
  occlude.addColorStop(0.62, "rgba(230, 220, 200, 1)");
  occlude.addColorStop(1, "rgba(70, 78, 72, 1)");
  ctx.fillStyle = occlude;
  ctx.fillRect(0, 0, WORLD, WORLD);
  ctx.restore();
  for (const spec of towerSpecs) {
    const home = spec.team === "home";
    const p = spec.pos;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath();
    ctx.ellipse(p.x + 5, p.y + 22, 52, 16, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = home ? "rgba(201, 162, 74, 0.55)" : "rgba(62, 200, 193, 0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 8, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = home ? "rgba(196, 22, 28, 0.28)" : "rgba(62, 200, 193, 0.26)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 8, 50, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    ctx.strokeStyle = "rgba(26, 18, 12, 0.18)";
    ctx.lineWidth = 86;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(path[0]!.x, path[0]!.y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x, path[i]!.y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(239, 230, 214, 0.08)";
    ctx.lineWidth = 52;
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(MID.x, MID.y);
  ctx.rotate(Math.PI / 4);
  const water = ctx.createLinearGradient(0, -70, 0, 70);
  water.addColorStop(0, "rgba(180, 230, 240, 0.08)");
  water.addColorStop(0.5, "rgba(40, 90, 110, 0.16)");
  water.addColorStop(1, "rgba(180, 230, 240, 0.08)");
  ctx.fillStyle = water;
  ctx.fillRect(-980, -36, 1960, 72);
  ctx.fillStyle = "rgba(230, 250, 255, 0.12)";
  for (let i = 0; i < 36; i++) {
    const n = hash(i * 14.2);
    ctx.fillRect(-920 + n * 1840, -18 + hash(i * 3.1) * 28, 40 + n * 70, 2.2);
  }
  ctx.restore();
  for (const t of TREES) {
    if (hash(t.x * 0.13 + t.y * 0.07) > 0.55) continue;
    ctx.fillStyle = "rgba(8, 12, 8, 0.16)";
    ctx.beginPath();
    ctx.ellipse(t.x + 6, t.y + t.r * 0.7, t.r * 1.05, t.r * 0.32, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(8, 6, 4, 0.42)";
  ctx.fillRect(0, 0, WORLD, 18);
  ctx.fillRect(0, WORLD - 18, WORLD, 18);
  ctx.fillRect(0, 0, 18, WORLD);
  ctx.fillRect(WORLD - 18, 0, 18, WORLD);
}

function drawCampusV20(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (const w of WOODS) {
    const shade = ctx.createRadialGradient(w.x, w.y, 20, w.x, w.y, Math.max(w.rx, w.ry) * 1.05);
    shade.addColorStop(0, "rgba(210, 214, 200, 1)");
    shade.addColorStop(1, "rgba(255,255,255,1)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(w.x, w.y, w.rx * 1.05, w.ry * 1.05, w.rot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    ctx.strokeStyle = "rgba(70, 48, 24, 0.28)";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 18]);
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(path[0]!.x, path[0]!.y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x, path[i]!.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(255, 236, 200, 0.1)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 22]);
    ctx.beginPath();
    ctx.moveTo(path[0]!.x, path[0]!.y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x, path[i]!.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.save();
  ctx.translate(MID.x, MID.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "rgba(10, 28, 36, 0.16)";
  ctx.fillRect(-960, -92, 1920, 14);
  ctx.fillRect(-960, 78, 1920, 14);
  ctx.fillStyle = "rgba(210, 245, 250, 0.1)";
  for (let i = 0; i < 28; i++) {
    const n = hash(i * 8.8);
    ctx.beginPath();
    ctx.ellipse(-880 + n * 1760, -8 + (i % 5) * 6, 28 + n * 22, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (const f of [fountain.home, fountain.away]) {
    const home = f === fountain.home;
    const glow = ctx.createRadialGradient(f.x, f.y, 40, f.x, f.y, 220);
    glow.addColorStop(0, home ? "rgba(255, 210, 120, 0.1)" : "rgba(90, 230, 220, 0.1)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = home ? "rgba(201, 162, 74, 0.28)" : "rgba(62, 200, 193, 0.26)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 168, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const c of JUNGLE_CAMPS) {
    ctx.fillStyle = "rgba(18, 12, 8, 0.22)";
    ctx.beginPath();
    ctx.ellipse(c.x + 4, c.y + 10, 34, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(138, 90, 40, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 28, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(70, 110, 42, 0.22)";
  for (let i = 0; i < 900; i++) {
    const x = hash(i * 91.4) * WORLD;
    const y = hash(i * 73.2) * WORLD;
    if (onLane(x, y, 78)) continue;
    ctx.fillRect(x, y, 1.3, 3.4 + hash(i * 2.1) * 4);
  }
  for (const t of TREES) {
    ctx.fillStyle = "rgba(8, 12, 8, 0.1)";
    ctx.beginPath();
    ctx.ellipse(t.x + 8, t.y + t.r * 0.78, t.r * 0.95, t.r * 0.26, 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  const haze = ctx.createRadialGradient(MID.x, MID.y, 700, MID.x, MID.y, 1900);
  haze.addColorStop(0, "rgba(0,0,0,0)");
  haze.addColorStop(1, "rgba(18, 22, 28, 0.18)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, WORLD, WORLD);
}

function drawShroom(ctx: CanvasRenderingContext2D, s: { x: number; y: number; s: number }): void {
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(s.x - 1.4, s.y, 2.8, s.s);
  ctx.fillStyle = "#c45c2c";
  ctx.beginPath();
  ctx.ellipse(s.x, s.y, s.s * 1.1, s.s * 0.7, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "rgba(239, 230, 214, 0.7)";
  ctx.beginPath();
  ctx.arc(s.x - s.s * 0.3, s.y - 1, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawCherry(ctx: CanvasRenderingContext2D, c: { x: number; y: number; s: number }): void {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(c.x + 6, c.y + 10, c.s * 0.8, c.s * 0.28, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2414";
  ctx.fillRect(c.x - 3, c.y, 6, 16);
  const bloom = ctx.createRadialGradient(c.x - 4, c.y - 10, 2, c.x, c.y - 8, c.s);
  bloom.addColorStop(0, "#f8d0dc");
  bloom.addColorStop(0.45, "#d07090");
  bloom.addColorStop(1, "#8a3048");
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(c.x, c.y - 10, c.s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(c.x - c.s * 0.45, c.y - 6, c.s * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 230, 236, 0.28)";
  ctx.beginPath();
  ctx.arc(c.x - c.s * 0.25, c.y - 16, c.s * 0.32, 0, Math.PI * 2);
  ctx.fill();
}

function drawMaple(ctx: CanvasRenderingContext2D, c: { x: number; y: number; s: number }): void {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(c.x + 6, c.y + 10, c.s * 0.82, c.s * 0.28, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1a12";
  ctx.fillRect(c.x - 3, c.y, 6, 16);
  const canopy = ctx.createRadialGradient(c.x - 4, c.y - 10, 2, c.x, c.y - 8, c.s);
  canopy.addColorStop(0, "#f0c070");
  canopy.addColorStop(0.4, "#c45c2c");
  canopy.addColorStop(1, "#5a2814");
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.arc(c.x, c.y - 10, c.s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(c.x - c.s * 0.4, c.y - 5, c.s * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 210, 140, 0.28)";
  ctx.beginPath();
  ctx.arc(c.x - c.s * 0.22, c.y - 16, c.s * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawHedge(ctx: CanvasRenderingContext2D, h: { x: number; y: number; w: number; dc: boolean }): void {
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(h.x - 2, h.y + 6, h.w + 4, 6);
  const g = ctx.createLinearGradient(h.x, h.y - 10, h.x, h.y + 8);
  g.addColorStop(0, h.dc ? "#6a9a48" : "#2a6a58");
  g.addColorStop(1, "#142414");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(h.x, h.y - 8, h.w, 16, 6);
  ctx.fill();
  ctx.fillStyle = h.dc ? "rgba(201, 162, 74, 0.2)" : "rgba(62, 200, 193, 0.16)";
  ctx.fillRect(h.x + 4, h.y - 6, h.w - 8, 3);
  ctx.fillStyle = h.dc ? "rgba(90, 140, 50, 0.35)" : "rgba(40, 110, 90, 0.32)";
  ctx.beginPath();
  ctx.arc(h.x + 8, h.y - 4, 5, 0, Math.PI * 2);
  ctx.arc(h.x + h.w - 8, h.y - 3, 4.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawStreetProp(
  ctx: CanvasRenderingContext2D,
  p: { x: number; y: number; kind: StreetPropKind; dc: boolean },
): void {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(2, 8, 8, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (p.kind === "hydrant") {
    ctx.fillStyle = p.dc ? "#c4161c" : "#3ec8c1";
    ctx.fillRect(-5, -8, 10, 16);
    ctx.fillRect(-8, -2, 16, 4);
    ctx.fillStyle = p.dc ? "#c9a24a" : "#8ad8d4";
    ctx.fillRect(-4, -12, 8, 5);
  } else if (p.kind === "can") {
    ctx.fillStyle = "#2a3228";
    ctx.fillRect(-6, -10, 12, 18);
    ctx.fillStyle = "#3a4a38";
    ctx.fillRect(-7, -12, 14, 4);
    ctx.fillStyle = p.dc ? "#c4161c" : "#3ec8c1";
    ctx.fillRect(-5, -4, 10, 3);
  } else if (p.kind === "meter") {
    ctx.fillStyle = "#2a2218";
    ctx.fillRect(-2, -4, 4, 14);
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(-5, -14, 10, 12);
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(-3, -11, 6, 6);
  } else if (p.kind === "crate") {
    ctx.fillStyle = p.dc ? "#6a4a28" : "#1a2a28";
    ctx.fillRect(-8, -6, 16, 12);
    ctx.strokeStyle = p.dc ? "#c9a24a" : "#3ec8c1";
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -6, 16, 12);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(-8, 0, 16, 2);
  } else if (p.kind === "planter") {
    ctx.fillStyle = p.dc ? "#6a4a28" : "#1a2a28";
    ctx.fillRect(-10, 0, 20, 8);
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(-8, -4, 16, 6);
    ctx.fillStyle = p.dc ? "#4a8a38" : "#2a6a58";
    ctx.beginPath();
    ctx.arc(-3, -8, 5, 0, Math.PI * 2);
    ctx.arc(4, -7, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.dc ? "#c4161c" : "#3ec8c1";
    ctx.fillRect(-10, 6, 20, 2);
  } else {
    ctx.fillStyle = p.dc ? "#5a3a22" : "#142428";
    ctx.fillRect(-9, -14, 18, 22);
    ctx.fillStyle = p.dc ? "#c9a24a" : "#3ec8c1";
    ctx.fillRect(-9, -16, 18, 4);
    ctx.fillStyle = "rgba(239, 230, 214, 0.35)";
    ctx.fillRect(-6, -10, 12, 3);
    ctx.fillRect(-6, -4, 12, 3);
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(-3, 2, 6, 8);
  }
  ctx.restore();
}

function drawMapLabels(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "rgba(196, 22, 28, 0.62)";
  ctx.font = "700 22px Anton, Impact, sans-serif";
  ctx.fillText("TOP", 200, 240);
  ctx.fillText("MID", 980, 1420);
  ctx.fillText("BOT", 2280, 2480);
  ctx.fillStyle = "rgba(62, 200, 193, 0.62)";
  ctx.fillText("TOP", 1880, 200);
  ctx.fillText("BOT", 2360, 720);
  ctx.textAlign = "left";
  ctx.font = "700 42px Anton, Impact, sans-serif";
  ctx.fillStyle = "#c4161c";
  ctx.fillText("WASHINGTON DC", fountain.home.x - 28, fountain.home.y - 318);
  ctx.font = "600 14px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#c9a24a";
  ctx.fillText("MAGA TOWN · NATIONAL MALL", fountain.home.x - 28, fountain.home.y - 294);
  ctx.font = "700 42px Anton, Impact, sans-serif";
  ctx.fillStyle = "#3ec8c1";
  ctx.fillText("SEATTLE", fountain.away.x - 118, fountain.away.y + 308);
  ctx.font = "600 14px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#efe6d6";
  ctx.fillText("ANTIFA TOWN · ELLIOTT BAY", fountain.away.x - 118, fountain.away.y + 332);
  ctx.textAlign = "center";
  ctx.font = "700 18px Anton, Impact, sans-serif";
  for (const w of WOODS) {
    ctx.fillStyle = w.fir ? "rgba(62, 200, 193, 0.72)" : "rgba(201, 162, 74, 0.78)";
    ctx.fillText(w.name.toUpperCase(), w.x, w.y - 28);
    ctx.fillStyle = "rgba(239, 230, 214, 0.7)";
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillText("WOODS", w.x, w.y - 10);
    ctx.font = "700 18px Anton, Impact, sans-serif";
  }
  ctx.font = "600 11px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "rgba(201, 162, 74, 0.8)";
  for (const t of BACK_TRACKS) {
    const p = t.path[Math.floor(t.path.length / 2)]!;
    if (onLane(p.x, p.y, 120)) continue;
    const rank = trackRank(t.name);
    ctx.fillStyle = rank === "primary" ? (p.x + p.y > WORLD ? "rgba(62, 200, 193, 0.88)" : "rgba(201, 162, 74, 0.9)") : "rgba(201, 162, 74, 0.7)";
    ctx.fillText(t.name.toUpperCase(), p.x, p.y + 6);
    ctx.fillStyle = "rgba(239, 230, 214, 0.72)";
    ctx.fillText(rank === "primary" ? "JUNGLE ROAD" : rank === "gank" ? "GANK CUT" : "FLANK TRACK", p.x, p.y + 20);
  }
  ctx.textAlign = "left";
}

function drawJungleFloor(ctx: CanvasRenderingContext2D): void {
  for (let i = 0; i < 220; i++) {
    const n = hash(i * 31.7);
    const x = hash(i * 11.2) * WORLD;
    const y = hash(i * 7.9) * WORLD;
    if (onLane(x, y, 90)) continue;
    const fir = x + y > WORLD;
    ctx.fillStyle = fir ? "rgba(12, 40, 32, 0.22)" : "rgba(28, 52, 18, 0.2)";
    ctx.beginPath();
    ctx.ellipse(x, y, 40 + n * 70, 22 + n * 36, n * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(40, 24, 10, 0.35)";
  for (let i = 0; i < 180; i++) {
    const x = hash(i * 27.3) * WORLD;
    const y = hash(i * 14.8) * WORLD;
    if (onLane(x, y, 100) || isWalkable(x, y)) continue;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 18 + hash(i) * 22, y + 6);
    ctx.lineTo(x + 8, y + 4);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(90, 60, 24, 0.22)";
  for (let i = 0; i < 160; i++) {
    const x = hash(i * 44.2) * WORLD;
    const y = hash(i * 21.6) * WORLD;
    if (onLane(x, y, 90) || isWalkable(x, y)) continue;
    ctx.beginPath();
    ctx.ellipse(x, y, 16 + hash(i) * 28, 6 + hash(i * 3) * 10, hash(i) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWoodsFloor(ctx: CanvasRenderingContext2D): void {
  for (const w of WOODS) {
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.rotate(w.rot);
    const floor = ctx.createRadialGradient(0, 0, 12, 0, 0, Math.max(w.rx, w.ry));
    if (w.fir) {
      floor.addColorStop(0, "rgba(8, 28, 24, 0.55)");
      floor.addColorStop(0.55, "rgba(10, 36, 32, 0.42)");
      floor.addColorStop(1, "rgba(8, 24, 22, 0)");
    } else {
      floor.addColorStop(0, "rgba(18, 36, 12, 0.5)");
      floor.addColorStop(0.55, "rgba(24, 44, 16, 0.38)");
      floor.addColorStop(1, "rgba(20, 36, 12, 0)");
    }
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.ellipse(0, 0, w.rx, w.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = w.fir ? "rgba(12, 40, 34, 0.28)" : "rgba(32, 52, 20, 0.26)";
    ctx.beginPath();
    ctx.ellipse(0, 4, w.rx * 0.92, w.ry * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < 48; i++) {
      const n = hash(w.x * 0.13 + w.y * 0.07 + i * 9.1);
      const ang = n * Math.PI * 2;
      const rad = Math.sqrt(hash(i * 4.7 + w.x)) * 0.92;
      const lx = Math.cos(w.rot) * Math.cos(ang) * w.rx * rad - Math.sin(w.rot) * Math.sin(ang) * w.ry * rad;
      const ly = Math.sin(w.rot) * Math.cos(ang) * w.rx * rad + Math.cos(w.rot) * Math.sin(ang) * w.ry * rad;
      const x = w.x + lx;
      const y = w.y + ly;
      if (onLane(x, y, 90)) continue;
      ctx.fillStyle = w.fir ? "rgba(20, 56, 48, 0.35)" : "rgba(48, 72, 28, 0.32)";
      ctx.beginPath();
      ctx.ellipse(x, y, 16 + n * 28, 8 + n * 14, n * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function strokeTrack(ctx: CanvasRenderingContext2D, path: Pt[]): void {
  ctx.beginPath();
  ctx.moveTo(path[0]!.x, path[0]!.y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x, path[i]!.y);
  ctx.stroke();
}

function drawJungleTrails(ctx: CanvasRenderingContext2D): void {
  const order: TrackRank[] = ["flank", "gank", "primary"];
  for (const rank of order) {
    for (const t of BACK_TRACKS) {
      if (trackRank(t.name) !== rank) continue;
      paintWornRoad(ctx, t.path, rank, t.path[0]!.x + t.path[0]!.y > WORLD);
    }
  }
}

function paintWornRoad(ctx: CanvasRenderingContext2D, path: Pt[], rank: TrackRank, fir: boolean): void {
  const primary = rank === "primary";
  const gank = rank === "gank";
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = fir ? "rgba(18, 40, 34, 0.42)" : "rgba(36, 52, 22, 0.4)";
  ctx.lineWidth = primary ? 108 : gank ? 70 : 42;
  strokeTrack(ctx, path);
  ctx.strokeStyle = "#2a1c10";
  ctx.lineWidth = primary ? 78 : gank ? 48 : 28;
  strokeTrack(ctx, path);
  ctx.strokeStyle = primary ? "#6a4a28" : gank ? "#5a3e22" : "#4a3220";
  ctx.lineWidth = primary ? 58 : gank ? 34 : 18;
  strokeTrack(ctx, path);
  ctx.strokeStyle = primary ? "#8a6234" : gank ? "#704c28" : "#5a3e22";
  ctx.lineWidth = primary ? 36 : gank ? 18 : 9;
  strokeTrack(ctx, path);
  if (primary) {
    ctx.strokeStyle = fir ? "rgba(90, 140, 120, 0.22)" : "rgba(180, 150, 80, 0.22)";
    ctx.lineWidth = 14;
    strokeTrack(ctx, path);
    ctx.strokeStyle = "rgba(40, 24, 12, 0.45)";
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 16]);
    strokeTrack(ctx, path);
    ctx.setLineDash([]);
  } else if (gank) {
    ctx.strokeStyle = "rgba(40, 24, 12, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 18]);
    strokeTrack(ctx, path);
    ctx.setLineDash([]);
  }
  ctx.restore();
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    const len = dist(a, b) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const step = primary ? 22 : gank ? 32 : 44;
    const steps = Math.max(2, Math.floor(len / step));
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const x = a.x + (b.x - a.x) * u;
      const y = a.y + (b.y - a.y) * u;
      const n = hash(x * 0.19 + y * 0.11 + k + rank.length);
      ctx.fillStyle = n > 0.55 ? "rgba(42, 28, 12, 0.38)" : "rgba(130, 96, 48, 0.26)";
      ctx.beginPath();
      ctx.ellipse(x + (n - 0.5) * 18, y + (hash(k * 3.1 + x) - 0.5) * 12, 6 + n * 8, 2.6 + n * 3, n * 2, 0, Math.PI * 2);
      ctx.fill();
      if (primary && k % 3 === 0) {
        ctx.fillStyle = "rgba(28, 18, 10, 0.55)";
        ctx.fillRect(x + nx * 4 - 3, y + ny * 4 - 1.4, 6, 2.4);
        ctx.fillRect(x - nx * 5 + 4, y - ny * 5 + 3, 5, 2);
      }
      if (n > 0.72) {
        const side = n > 0.86 ? 1 : -1;
        const rx = x + nx * (primary ? 28 : 18) * side;
        const ry = y + ny * (primary ? 28 : 18) * side;
        ctx.fillStyle = fir ? "#3a4a40" : "#6a5a40";
        ctx.beginPath();
        ctx.ellipse(rx, ry, 7 + n * 6, 4 + n * 3, n * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = fir ? "#8aa090" : "#c4b49a";
        ctx.beginPath();
        ctx.ellipse(rx - 2, ry - 1, 3, 1.6, n, 0, Math.PI * 2);
        ctx.fill();
      }
      if (primary && n > 0.64) {
        ctx.strokeStyle = "rgba(70, 48, 22, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + nx * 22, y + ny * 22);
        ctx.lineTo(x + nx * 34 + 8, y + ny * 30);
        ctx.stroke();
      }
    }
  }
}

function drawWoodsCanopy(ctx: CanvasRenderingContext2D): void {
  for (const w of WOODS) {
    ctx.save();
    ctx.translate(w.x, w.y);
    ctx.rotate(w.rot);
    const shade = ctx.createRadialGradient(-w.rx * 0.15, -w.ry * 0.2, 20, 0, 0, Math.max(w.rx, w.ry) * 1.05);
    if (w.fir) {
      shade.addColorStop(0, "rgba(6, 28, 24, 0.22)");
      shade.addColorStop(0.45, "rgba(10, 40, 34, 0.38)");
      shade.addColorStop(1, "rgba(8, 24, 22, 0)");
    } else {
      shade.addColorStop(0, "rgba(16, 40, 12, 0.18)");
      shade.addColorStop(0.45, "rgba(20, 52, 16, 0.36)");
      shade.addColorStop(1, "rgba(12, 32, 10, 0)");
    }
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(0, 0, w.rx * 1.06, w.ry * 1.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < 22; i++) {
      const n = hash(w.x + i * 17.3 + w.y);
      const ang = n * Math.PI * 2;
      const rad = 0.2 + hash(i * 8.1 + w.ry) * 0.7;
      const x =
        w.x + Math.cos(w.rot) * Math.cos(ang) * w.rx * rad - Math.sin(w.rot) * Math.sin(ang) * w.ry * rad;
      const y =
        w.y + Math.sin(w.rot) * Math.cos(ang) * w.rx * rad + Math.cos(w.rot) * Math.sin(ang) * w.ry * rad;
      ctx.fillStyle = w.fir ? `rgba(40, 90, 78, ${0.08 + n * 0.08})` : `rgba(90, 140, 50, ${0.08 + n * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(x, y - 12, 28 + n * 36, 16 + n * 18, n * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawJungleCamps(ctx: CanvasRenderingContext2D): void {
  for (const c of JUNGLE_CAMPS) {
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    ctx.ellipse(c.x + 10, c.y + 16, 88, 40, 0.2, 0, Math.PI * 2);
    ctx.fill();
    const pit = ctx.createRadialGradient(c.x - 10, c.y - 8, 8, c.x, c.y, 86);
    pit.addColorStop(0, "#a07a48");
    pit.addColorStop(0.45, "#5a3e24");
    pit.addColorStop(1, "#1a120c");
    ctx.fillStyle = pit;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.fir ? "#1c3a32" : "#3a5a28";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 84, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#4a3a28";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.4;
      ctx.beginPath();
      ctx.ellipse(c.x + Math.cos(a) * 58, c.y + Math.sin(a) * 42, 11, 7, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#c45c2c";
    ctx.beginPath();
    ctx.arc(c.x, c.y + 4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd978";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a2414";
    ctx.fillRect(c.x - 8, c.y + 10, 16, 10);
    ctx.fillStyle = "#5a3a1c";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.2;
      ctx.beginPath();
      ctx.ellipse(c.x + Math.cos(a) * 36, c.y + Math.sin(a) * 28, 9, 6, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a24a";
      ctx.beginPath();
      ctx.ellipse(c.x + Math.cos(a) * 36 + 4, c.y + Math.sin(a) * 28, 5, 3.2, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a3a1c";
    }
    ctx.fillStyle = c.fir ? "#1c4a40" : "#3a6a28";
    for (let i = 0; i < 6; i++) {
      const a = i * 1.1;
      ctx.beginPath();
      ctx.arc(c.x + Math.cos(a) * 70, c.y + Math.sin(a) * 58, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = c.fir ? "#3ec8c1" : "#c9a24a";
    ctx.font = "700 13px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(c.name.toUpperCase(), c.x, c.y - 96);
    ctx.fillStyle = "rgba(239,230,214,0.75)";
    ctx.font = "600 10px 'IBM Plex Mono', monospace";
    ctx.fillText("JUNGLE CAMP", c.x, c.y - 80);
    ctx.textAlign = "left";
  }
}

function drawFern(ctx: CanvasRenderingContext2D, f: { x: number; y: number; s: number }): void {
  ctx.fillStyle = "#1c3a22";
  ctx.beginPath();
  ctx.moveTo(f.x, f.y + 4);
  ctx.lineTo(f.x + f.s, f.y - f.s * 0.8);
  ctx.lineTo(f.x + 2, f.y);
  ctx.lineTo(f.x - f.s * 0.2, f.y - f.s);
  ctx.lineTo(f.x - f.s, f.y - f.s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#4a8a48";
  ctx.beginPath();
  ctx.moveTo(f.x, f.y + 2);
  ctx.lineTo(f.x + f.s * 0.55, f.y - f.s * 0.5);
  ctx.lineTo(f.x - f.s * 0.45, f.y - f.s * 0.35);
  ctx.closePath();
  ctx.fill();
}

function drawMidPlaza(ctx: CanvasRenderingContext2D): void {
  const ring = ctx.createRadialGradient(MID.x, MID.y, 40, MID.x, MID.y, 220);
  ring.addColorStop(0, "rgba(196, 160, 80, 0.28)");
  ring.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(MID.x, MID.y, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a3c2c";
  ctx.beginPath();
  ctx.arc(MID.x, MID.y, 178, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a5640";
  for (let i = -6; i <= 6; i++) {
    for (let j = -6; j <= 6; j++) {
      if (i * i + j * j > 36) continue;
      if ((i + j) % 2 === 0) ctx.fillRect(MID.x + i * 14 - 6, MID.y + j * 14 - 6, 12, 12);
    }
  }
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(MID.x, MID.y, 168, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#8a6a38";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(MID.x, MID.y, 154, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#2a2016";
  ctx.beginPath();
  ctx.arc(MID.x, MID.y, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9a24a";
  ctx.beginPath();
  ctx.arc(MID.x, MID.y - 8, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(MID.x - 6, MID.y + 4, 12, 22);
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(MID.x + 4, MID.y - 18, 18, 10);
  ctx.fillStyle = "#c9a24a";
  ctx.font = "700 15px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("KIRK CUP", MID.x, MID.y + 52);
  ctx.textAlign = "left";
  ctx.fillStyle = "#3a2a1c";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(MID.x + Math.cos(a) * 148, MID.y + Math.sin(a) * 148, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9a24a";
    ctx.fillRect(MID.x + Math.cos(a) * 148 - 2, MID.y + Math.sin(a) * 148 - 18, 4, 16);
    ctx.fillStyle = "#3a2a1c";
  }
  drawBench(ctx, MID.x - 70, MID.y + 90, 0, true);
  drawBench(ctx, MID.x + 70, MID.y + 90, Math.PI, false);
}

function drawFountainPlaza(ctx: CanvasRenderingContext2D, f: Pt, dc: boolean): void {
  const gold = dc ? "#c9a24a" : "#3ec8c1";
  const stone = dc ? "#6a5a40" : "#2a3a3a";
  const stoneHi = dc ? "#b8a888" : "#6a7c7e";
  const ink = dc ? "#2a1c10" : "#0c181a";
  const midAng = Math.atan2(MID.y - f.y, MID.x - f.x);
  drawBaseCurtain(ctx, f, dc);
  const glow = ctx.createRadialGradient(f.x, f.y, 24, f.x, f.y, 390);
  glow.addColorStop(0, dc ? "rgba(200, 230, 255, 0.72)" : "rgba(110, 255, 240, 0.66)");
  glow.addColorStop(0.28, dc ? "rgba(201, 162, 74, 0.22)" : "rgba(62, 200, 193, 0.22)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 390, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(f.x + 12, f.y + 22, 268, 96, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dc ? "rgba(90, 160, 200, 0.18)" : "rgba(40, 180, 170, 0.16)";
  ctx.beginPath();
  ctx.ellipse(f.x + 8, f.y + 14, 250, 80, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dc ? "#3a2c1c" : "#101c20";
  ctx.beginPath();
  ctx.arc(f.x, f.y, 244, 0, Math.PI * 2);
  ctx.fill();
  for (let i = -24; i <= 24; i++) {
    for (let j = -24; j <= 24; j++) {
      const dx = i * 11;
      const dy = j * 11;
      const d2 = dx * dx + dy * dy;
      if (d2 < 146 * 146 || d2 > 238 * 238) continue;
      const wedge = Math.abs(i) % 3 === Math.abs(j) % 3;
      ctx.fillStyle = wedge ? (dc ? "#7a6848" : "#2c4044") : (i + j) % 2 === 0 ? (dc ? "#5a4a32" : "#1c3034") : (dc ? "#3e3020" : "#0e1c20");
      ctx.beginPath();
      ctx.moveTo(f.x + dx - 6, f.y + dy);
      ctx.lineTo(f.x + dx, f.y + dy - 6);
      ctx.lineTo(f.x + dx + 6, f.y + dy);
      ctx.lineTo(f.x + dx, f.y + dy + 6);
      ctx.closePath();
      ctx.fill();
    }
  }
  for (const [r, w, c] of [
    [186, 32, stoneHi],
    [168, 18, stone],
    [152, 10, gold],
    [140, 5, dc ? "#efe6d6" : "#c8f4ee"],
  ] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = dc ? "rgba(239, 230, 214, 0.55)" : "rgba(200, 255, 246, 0.42)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 146, 0, Math.PI * 2);
  ctx.stroke();
  const foam = ctx.createRadialGradient(f.x, f.y, 118, f.x, f.y, 142);
  foam.addColorStop(0, "rgba(255,255,255,0)");
  foam.addColorStop(0.72, dc ? "rgba(220, 240, 255, 0.18)" : "rgba(210, 255, 248, 0.16)");
  foam.addColorStop(1, dc ? "rgba(255, 255, 255, 0.55)" : "rgba(230, 255, 250, 0.5)");
  ctx.fillStyle = foam;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 142, 0, Math.PI * 2);
  ctx.fill();
  const pool = ctx.createRadialGradient(f.x - 26, f.y - 24, 8, f.x, f.y, 136);
  pool.addColorStop(0, dc ? "#f4fbff" : "#eefff9");
  pool.addColorStop(0.18, dc ? "#b4e0f8" : "#a8fff0");
  pool.addColorStop(0.42, dc ? "#5ab0d8" : "#4ae8d4");
  pool.addColorStop(0.72, dc ? "#2e7ea8" : "#1ab0a4");
  pool.addColorStop(1, dc ? "#16506c" : "#0a6058");
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 136, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.beginPath();
  ctx.ellipse(f.x - 36, f.y - 44, 58, 20, -0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = dc ? "rgba(210, 236, 255, 0.32)" : "rgba(170, 255, 240, 0.3)";
  ctx.lineWidth = 2.2;
  for (const r of [112, 86, 58, 32]) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = dc ? "rgba(255, 248, 220, 0.16)" : "rgba(180, 255, 240, 0.14)";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    ctx.beginPath();
    ctx.ellipse(f.x + Math.cos(a) * 72, f.y + Math.sin(a) * 72, 16, 4, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = dc ? "#efe6d6" : "#1c2a2c";
  ctx.beginPath();
  ctx.arc(f.x, f.y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = dc ? "#c4161c" : "#8ef0e8";
  ctx.beginPath();
  ctx.arc(f.x, f.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = dc ? "#8a6a28" : "#1a4844";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 20, 0, Math.PI * 2);
  ctx.stroke();
  if (dc) {
    ctx.fillStyle = "#d8c8a8";
    ctx.fillRect(f.x - 8, f.y - 108, 16, 82);
    ctx.fillStyle = "#b8a888";
    ctx.fillRect(f.x - 11, f.y - 78, 22, 8);
    ctx.fillRect(f.x - 11, f.y - 48, 22, 8);
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.moveTo(f.x, f.y - 132);
    ctx.lineTo(f.x + 14, f.y - 108);
    ctx.lineTo(f.x - 14, f.y - 108);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(f.x + 6, f.y - 126, 5, 26);
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.moveTo(f.x + 11, f.y - 124);
    ctx.lineTo(f.x + 36, f.y - 114);
    ctx.lineTo(f.x + 11, f.y - 104);
    ctx.fill();
  } else {
    ctx.fillStyle = "#8aa4a8";
    ctx.beginPath();
    ctx.arc(f.x, f.y - 8, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8e0e2";
    ctx.fillRect(f.x - 4, f.y - 102, 8, 78);
    ctx.fillStyle = "#3ec8c1";
    ctx.fillRect(f.x - 14, f.y - 58, 28, 5);
    ctx.fillStyle = "#ffd978";
    ctx.beginPath();
    ctx.arc(f.x, f.y - 108, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 217, 120, 0.32)";
    ctx.beginPath();
    ctx.arc(f.x, f.y - 108, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = dc ? "rgba(201,162,74,0.82)" : "rgba(62,200,193,0.78)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 240, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const px = f.x + Math.cos(a) * 240;
    const py = f.y + Math.sin(a) * 240;
    ctx.fillStyle = dc ? "#1e341c" : "#102824";
    ctx.beginPath();
    ctx.arc(px, py, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dc ? "#4a6a32" : "#2a5a48";
    ctx.beginPath();
    ctx.arc(px, py - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(px, py, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  const gate = midAng;
  drawGiftPavilion(ctx, f.x + Math.cos(gate + Math.PI) * 204, f.y + Math.sin(gate + Math.PI) * 204, dc, gate + Math.PI);
  for (let i = 0; i < 6; i++) {
    const a = gate + ((i + 1) / 7) * Math.PI * 2;
    drawStall(ctx, f.x + Math.cos(a) * 204, f.y + Math.sin(a) * 204, dc, a);
    drawBench(ctx, f.x + Math.cos(a + 0.28) * 258, f.y + Math.sin(a + 0.28) * 258, a + Math.PI / 2, dc);
  }
  ctx.fillStyle = dc ? "rgba(255, 240, 200, 0.28)" : "rgba(180, 255, 245, 0.24)";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(f.x + Math.cos(a) * 38, f.y + Math.sin(a) * 38 - 26, 7, 22, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = gold;
  ctx.font = "700 15px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(dc ? "DC FOUNTAIN" : "BAY FOUNTAIN", f.x, f.y + 278);
  ctx.textAlign = "left";
}

function drawBaseCurtain(ctx: CanvasRenderingContext2D, f: Pt, dc: boolean): void {
  const midAng = Math.atan2(MID.y - f.y, MID.x - f.x);
  const open = 0.62;
  ctx.save();
  ctx.strokeStyle = dc ? "#2a1c10" : "#0a1416";
  ctx.lineWidth = 28;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.arc(f.x, f.y, 286, midAng + open, midAng + Math.PI * 2 - open);
  ctx.stroke();
  ctx.strokeStyle = dc ? "#5a4630" : "#24383c";
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 286, midAng + open, midAng + Math.PI * 2 - open);
  ctx.stroke();
  ctx.strokeStyle = dc ? "#c9a24a" : "#3ec8c1";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 298, midAng + open, midAng + Math.PI * 2 - open);
  ctx.stroke();
  const span = Math.PI * 2 - open * 2;
  for (let i = 0; i < 18; i++) {
    const a = midAng + open + (i + 0.5) * (span / 18);
    const x = f.x + Math.cos(a) * 286;
    const y = f.y + Math.sin(a) * 286;
    ctx.fillStyle = dc ? "#3a2a18" : "#142228";
    ctx.fillRect(x - 5, y - 16, 10, 18);
    ctx.fillStyle = dc ? "#c4161c" : "#3ec8c1";
    ctx.fillRect(x - 5, y - 20, 10, 5);
  }
  for (const side of [-open, open]) {
    const a = midAng + side;
    const x = f.x + Math.cos(a) * 286;
    const y = f.y + Math.sin(a) * 286;
    ctx.fillStyle = dc ? "#2a1c10" : "#0c181a";
    ctx.fillRect(x - 12, y - 28, 24, 52);
    ctx.fillStyle = dc ? "#c9a24a" : "#3ec8c1";
    ctx.fillRect(x - 12, y - 34, 24, 8);
    ctx.fillStyle = dc ? "#c4161c" : "#8ef0e8";
    ctx.fillRect(x - 4, y - 48, 8, 16);
  }
  ctx.restore();
}

function drawGiftPavilion(ctx: CanvasRenderingContext2D, x: number, y: number, dc: boolean, ang: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.PI / 2);
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(-56, 20, 112, 20);
  ctx.fillStyle = dc ? "#2a1810" : "#0e1c20";
  ctx.fillRect(-50, -18, 100, 48);
  ctx.fillStyle = dc ? "#4a3020" : "#1a3034";
  ctx.fillRect(-46, -14, 92, 12);
  const roof = ctx.createLinearGradient(-56, -48, 56, -8);
  roof.addColorStop(0, dc ? "#e86868" : "#7af0e4");
  roof.addColorStop(0.5, dc ? "#c4161c" : "#3ec8c1");
  roof.addColorStop(1, dc ? "#5a0c0c" : "#0e4038");
  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.moveTo(-58, -14);
  ctx.lineTo(0, -52);
  ctx.lineTo(58, -14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = dc ? "#c9a24a" : "#8ad8d4";
  ctx.fillRect(-42, -16, 84, 6);
  ctx.fillStyle = dc ? "#8a2018" : "#1a5850";
  for (let i = -4; i <= 4; i++) ctx.fillRect(i * 10 - 2, -36, 4, 18);
  ctx.fillStyle = "#fff6e4";
  ctx.fillRect(-32, -6, 20, 16);
  ctx.fillRect(12, -6, 20, 16);
  ctx.fillStyle = dc ? "#c9a24a" : "#3ec8c1";
  ctx.fillRect(-28, 0, 12, 6);
  ctx.fillRect(16, 0, 12, 6);
  ctx.fillStyle = dc ? "#1a1008" : "#061014";
  ctx.fillRect(-10, 8, 20, 20);
  ctx.fillStyle = goldOf(dc);
  ctx.fillRect(-20, 26, 40, 7);
  ctx.fillStyle = dc ? "#3a2416" : "#122428";
  ctx.fillRect(-36, -58, 72, 16);
  ctx.strokeStyle = goldOf(dc);
  ctx.lineWidth = 2;
  ctx.strokeRect(-36, -58, 72, 16);
  ctx.fillStyle = "#fff6e4";
  ctx.font = "700 11px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("GIFT SHOP", 0, -46);
  ctx.restore();
}

function goldOf(dc: boolean): string {
  return dc ? "#c9a24a" : "#3ec8c1";
}

function drawStall(ctx: CanvasRenderingContext2D, x: number, y: number, dc: boolean, ang: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.PI / 2);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fillRect(-18, 10, 40, 12);
  ctx.fillStyle = dc ? "#4a2e1c" : "#15282c";
  ctx.fillRect(-20, -10, 40, 26);
  ctx.fillStyle = dc ? "#c4161c" : "#3ec8c1";
  ctx.beginPath();
  ctx.moveTo(-24, -10);
  ctx.lineTo(0, -28);
  ctx.lineTo(24, -10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = goldOf(dc);
  ctx.fillRect(-16, -10, 32, 3);
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(-12, 0, 8, 7);
  ctx.fillRect(4, 0, 8, 7);
  ctx.fillStyle = dc ? "#efe6d6" : "#8ef0e8";
  ctx.fillRect(-6, 8, 12, 4);
  ctx.restore();
}

function drawTree(ctx: CanvasRenderingContext2D, t: Plant): void {
  drawPixTree(ctx, t);
}

function drawTreeLegacyUnused(ctx: CanvasRenderingContext2D, t: Plant): void {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(t.x + 10, t.y + 14, t.r * 0.9, t.r * 0.35, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1a12";
  ctx.fillRect(t.x - 4, t.y, 8, t.fir ? 22 : 16);
  ctx.fillStyle = "rgba(90, 60, 30, 0.55)";
  ctx.fillRect(t.x - 3, t.y + 2, 2, t.fir ? 16 : 12);
  if (t.fir) {
    ctx.fillStyle = "#163028";
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - t.r * 1.6);
    ctx.lineTo(t.x + t.r * 0.85, t.y + 6);
    ctx.lineTo(t.x - t.r * 0.85, t.y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a5a40";
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - t.r * 1.35);
    ctx.lineTo(t.x + t.r * 0.62, t.y - 4);
    ctx.lineTo(t.x - t.r * 0.62, t.y - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4a8a58";
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - t.r * 1.15);
    ctx.lineTo(t.x + t.r * 0.38, t.y - 14);
    ctx.lineTo(t.x - t.r * 0.38, t.y - 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(180, 230, 190, 0.18)";
    ctx.beginPath();
    ctx.moveTo(t.x - 2, t.y - t.r * 1.2);
    ctx.lineTo(t.x + t.r * 0.18, t.y - 18);
    ctx.lineTo(t.x - t.r * 0.12, t.y - 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#1a2a22";
    ctx.beginPath();
    ctx.moveTo(t.x - t.r * 0.55, t.y + 4);
    ctx.lineTo(t.x - t.r * 0.22, t.y - t.r * 0.4);
    ctx.lineTo(t.x - t.r * 0.08, t.y + 4);
    ctx.closePath();
    ctx.fill();
    return;
  }
  const canopy = ctx.createRadialGradient(t.x - 4, t.y - 12, 4, t.x, t.y - 8, t.r);
  canopy.addColorStop(0, "#8aba58");
  canopy.addColorStop(0.4, "#4a8a38");
  canopy.addColorStop(1, "#1c3a1c");
  ctx.fillStyle = canopy;
  ctx.beginPath();
  ctx.arc(t.x, t.y - 10, t.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(t.x - t.r * 0.4, t.y - 6, t.r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(t.x + t.r * 0.35, t.y - 8, t.r * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(t.x + t.r * 0.08, t.y - t.r * 0.55, t.r * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(210, 240, 160, 0.18)";
  ctx.beginPath();
  ctx.arc(t.x - t.r * 0.28, t.y - 18, t.r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(40, 70, 20, 0.28)";
  ctx.beginPath();
  ctx.arc(t.x + t.r * 0.22, t.y - 4, t.r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawBeerCan(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, maga: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(-3.2, 5, 6.4, 2);
  ctx.fillStyle = maga ? "#d8d4cc" : "#9aa0a4";
  ctx.fillRect(-3, -6, 6, 12);
  ctx.fillStyle = maga ? "#c4161c" : "#1c1c1c";
  ctx.fillRect(-3, -1, 6, 5);
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(-2.2, -5.2, 4.4, 1.8);
  ctx.fillStyle = maga ? "#f0c14a" : "#3a3a3a";
  ctx.fillRect(-2, 0.4, 4, 2.4);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.fillRect(-2, -4.4, 1.3, 8);
  ctx.fillStyle = "#c8c4bc";
  ctx.fillRect(-2.4, -7.2, 4.8, 1.4);
  ctx.restore();
}

function drawBeerBottle(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, maga: boolean): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.fillRect(-2.2, 6, 4.4, 2);
  ctx.fillStyle = maga ? "#3a5a22" : "#141810";
  ctx.beginPath();
  ctx.moveTo(-2.6, 6);
  ctx.lineTo(-2.2, -3);
  ctx.lineTo(-1.1, -8);
  ctx.lineTo(1.1, -8);
  ctx.lineTo(2.2, -3);
  ctx.lineTo(2.6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = maga ? "#c9a24a" : "#2a2a2a";
  ctx.fillRect(-1.4, -10.2, 2.8, 2.4);
  ctx.fillStyle = "rgba(220, 240, 180, 0.28)";
  ctx.fillRect(-1.2, -2, 1.1, 6);
  ctx.restore();
}

function drawTrashHeap(ctx: CanvasRenderingContext2D, x: number, y: number, n: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(2.15 + n * 0.4, 2.15 + n * 0.4);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(4, 12, 26, 9, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = n > 0.5 ? "#4a4030" : "#3a3428";
  ctx.beginPath();
  ctx.ellipse(0, 3, 22, 12, 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = n > 0.4 ? "#efe6d6" : "#d8c090";
  ctx.beginPath();
  ctx.ellipse(-8, -6, 11, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = n > 0.55 ? "#c45c2c" : "#1a1a1a";
  ctx.beginPath();
  ctx.ellipse(8, -10, 10, 9, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c9a24a";
  ctx.save();
  ctx.translate(-18, 4);
  ctx.rotate(-0.32);
  ctx.fillRect(0, 0, 20, 7);
  ctx.fillStyle = "#8a6a38";
  ctx.fillRect(2, 1.5, 16, 1.4);
  ctx.restore();
  ctx.fillStyle = "#6a4a28";
  ctx.beginPath();
  ctx.ellipse(14, 2, 8, 5.5, 0.45, 0, Math.PI * 2);
  ctx.fill();
  drawBeerCan(ctx, -12, 0, 0.85, n > 0.5);
  drawBeerBottle(ctx, 16, -6, -0.7, n > 0.32);
  drawBeerCan(ctx, 3, -14, 1.15, n > 0.62);
  if (n > 0.35) drawBeerBottle(ctx, -6, -12, 0.35, false);
  if (n > 0.6) drawBeerCan(ctx, 12, 8, -0.5, true);
  ctx.fillStyle = "#8a2018";
  ctx.beginPath();
  ctx.ellipse(18, 8, 5, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOffmapWoods(ctx: CanvasRenderingContext2D, view?: WorldView): void {
  const pad = 90;
  const left = view ? view.x - view.hw - pad : -FRINGE;
  const top = view ? view.y - view.hh - pad : -FRINGE;
  const right = view ? view.x + view.hw + pad : WORLD + FRINGE;
  const bot = view ? view.y + view.hh + pad : WORLD + FRINGE;
  ctx.fillStyle = "#3a5c28";
  ctx.imageSmoothingEnabled = false;
  if (left < 0) ctx.fillRect(left, top, Math.min(0, right) - left, bot - top);
  if (right > WORLD) ctx.fillRect(Math.max(WORLD, left), top, right - Math.max(WORLD, left), bot - top);
  if (top < 0) {
    ctx.fillRect(Math.max(0, left), top, Math.min(WORLD, right) - Math.max(0, left), Math.min(0, bot) - top);
  }
  if (bot > WORLD) {
    ctx.fillRect(
      Math.max(0, left),
      Math.max(WORLD, top),
      Math.min(WORLD, right) - Math.max(0, left),
      bot - Math.max(WORLD, top),
    );
  }
  const mottled = view ? 70 : 40;
  for (let i = 0; i < mottled; i++) {
    const n = hash((Math.floor(left / 80) + i) * 17.3 + Math.floor(top / 80) * 9.1);
    const mx = left + n * Math.max(40, right - left);
    const my = top + hash(i * 4.7 + left) * Math.max(40, bot - top);
    if (mx > 8 && mx < WORLD - 8 && my > 8 && my < WORLD - 8) continue;
    ctx.fillStyle = n > 0.5 ? "#4a6e30" : "#2a4620";
    ctx.fillRect(Math.round(mx / 2) * 2, Math.round(my / 2) * 2, 24, 12);
  }
  for (const b of FRINGE_BUSHES) {
    if (!seen(b.x, b.y, 40, view)) continue;
    drawPixBush(ctx, b);
  }
  for (const t of FRINGE_TREES) {
    if (!seen(t.x, t.y, t.r + 20, view)) continue;
    drawTree(ctx, t);
  }
  for (const h of FRINGE_TRASH) {
    if (!seen(h.x, h.y, 48, view)) continue;
    drawTrashHeap(ctx, h.x, h.y, h.n);
  }
}

function drawRedcap(ctx: CanvasRenderingContext2D, x: number, y: number, flip: number): void {
  ctx.fillStyle = "#6a0c10";
  ctx.beginPath();
  ctx.ellipse(x, y + 1.6, 9.4, 3.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c4161c";
  ctx.beginPath();
  ctx.ellipse(x, y - 2.6, 9.4, 6.4, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 9.4, y - 3.6, 18.8, 5);
  ctx.fillStyle = "#e0242c";
  ctx.beginPath();
  ctx.ellipse(x - 1, y - 5.4, 6.2, 3.2, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9a1218";
  ctx.beginPath();
  ctx.ellipse(x + flip * 7.4, y + 1.4, 8.2, 2.5, flip * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(x - 3.2, y - 4.2, 6.4, 3.2);
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(x - 2.2, y - 3.4, 4.4, 1.6);
}

function drawDcCampus(ctx: CanvasRenderingContext2D): void {
  const ox = 300;
  const oy = 2140;
  ctx.fillStyle = "#6a5a38";
  ctx.fillRect(ox, oy - 44, 430, 34);
  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(ox + 8, oy - 52, 414, 12);
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(ox + 12, oy - 50, 406, 3);
  const pool = ctx.createLinearGradient(ox + 40, oy - 250, ox + 40, oy - 44);
  pool.addColorStop(0, "#d4eef8");
  pool.addColorStop(0.22, "#8ec8e8");
  pool.addColorStop(0.55, "#3a6e90");
  pool.addColorStop(1, "#163848");
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(ox + 28, oy - 268, 118, 232);
  ctx.fillStyle = pool;
  ctx.fillRect(ox + 40, oy - 256, 94, 208);
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 5;
  ctx.strokeRect(ox + 40, oy - 256, 94, 208);
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.fillRect(ox + 48, oy - 246, 32, 56);
  ctx.fillStyle = "rgba(239,230,214,0.3)";
  for (let i = 0; i < 11; i++) ctx.fillRect(ox + 46, oy - 242 + i * 18, 82, 3);
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(ox + 40, oy - 48, 94, 8);
  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(ox + 150, oy - 126, 250, 86);
  const colonnade = ctx.createLinearGradient(ox + 150, oy - 126, ox + 400, oy - 40);
  colonnade.addColorStop(0, "#efe6d6");
  colonnade.addColorStop(0.5, "#c9b48a");
  colonnade.addColorStop(1, "#6a5640");
  ctx.fillStyle = colonnade;
  ctx.fillRect(ox + 158, oy - 118, 234, 70);
  ctx.fillStyle = "#efe6d6";
  for (let i = 0; i < 11; i++) ctx.fillRect(ox + 166 + i * 20, oy - 114, 10, 62);
  ctx.fillStyle = "#3a2a1c";
  for (let i = 0; i < 11; i++) ctx.fillRect(ox + 169 + i * 20, oy - 108, 4, 18);
  ctx.fillStyle = "rgba(201, 162, 74, 0.45)";
  ctx.fillRect(ox + 158, oy - 118, 234, 6);
  ctx.fillStyle = "#d8c8a8";
  ctx.fillRect(ox + 216, oy - 196, 100, 78);
  ctx.beginPath();
  ctx.arc(ox + 266, oy - 196, 52, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(ox + 266, oy - 196, 52, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(ox + 264, oy - 274, 5, 32);
  ctx.fillStyle = "#c9a24a";
  ctx.beginPath();
  ctx.moveTo(ox + 269, oy - 272);
  ctx.lineTo(ox + 308, oy - 262);
  ctx.lineTo(ox + 269, oy - 252);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 248, 220, 0.28)";
  ctx.beginPath();
  ctx.ellipse(ox + 250, oy - 214, 18, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d4c4a0";
  ctx.fillRect(ox + 22, oy - 300, 20, 210);
  ctx.fillRect(ox + 14, oy - 314, 36, 16);
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(ox + 22, oy - 300, 20, 6);
  ctx.fillStyle = "#8a7a60";
  ctx.fillRect(ox + 338, oy - 96, 92, 54);
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(ox + 338, oy - 106, 92, 12);
  ctx.fillStyle = "#efe6d6";
  ctx.font = "600 12px 'IBM Plex Mono', monospace";
  ctx.fillText("NATIONAL MALL", ox + 150, oy + 14);
  ctx.fillText("REFLECTING POOL", ox + 32, oy - 276);
  ctx.fillStyle = "#3a4a28";
  ctx.fillRect(ox + 140, oy - 56, 270, 10);
  ctx.fillRect(ox + 140, oy - 136, 270, 10);
  ctx.fillStyle = "#5a6a38";
  for (let i = 0; i < 13; i++) ctx.fillRect(ox + 148 + i * 20, oy - 64, 8, 18);
  ctx.fillRect(ox + 148, oy - 146, 254, 8);
  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(ox + 408, oy - 220, 74, 98);
  ctx.fillStyle = "#efe6d6";
  for (let i = 0; i < 5; i++) ctx.fillRect(ox + 418, oy - 208 + i * 16, 54, 8);
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(ox + 408, oy - 230, 74, 12);
  ctx.fillStyle = "#d4c4a0";
  ctx.fillRect(ox + 488, oy - 176, 56, 76);
  ctx.fillStyle = "#efe6d6";
  for (let i = 0; i < 4; i++) ctx.fillRect(ox + 496, oy - 164 + i * 16, 40, 6);
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(ox + 488, oy - 186, 56, 10);
  ctx.fillStyle = "#6a5a40";
  ctx.fillRect(ox + 48, oy - 48, 70, 8);
  for (let i = 0; i < 5; i++) ctx.fillRect(ox + 52 + i * 12, oy - 40, 8, 5);
  ctx.fillStyle = "#d8c8a8";
  ctx.fillRect(ox + 250, oy - 320, 30, 76);
  ctx.fillRect(ox + 242, oy - 330, 46, 12);
  ctx.fillStyle = "#c9a24a";
  ctx.beginPath();
  ctx.moveTo(ox + 265, oy - 330);
  ctx.lineTo(ox + 265, oy - 352);
  ctx.lineTo(ox + 284, oy - 340);
  ctx.closePath();
  ctx.fill();
  drawBench(ctx, ox + 180, oy - 30, 0, true);
  drawBench(ctx, ox + 250, oy - 30, 0, true);
  drawBench(ctx, ox + 320, oy - 30, 0, true);
  ctx.fillStyle = "rgba(196, 22, 28, 0.2)";
  ctx.fillRect(ox + 158, oy - 118, 234, 5);
  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(ox + 530, oy - 148, 52, 70);
  ctx.fillStyle = "#efe6d6";
  for (let i = 0; i < 3; i++) ctx.fillRect(ox + 538, oy - 136 + i * 16, 36, 6);
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(ox + 530, oy - 158, 52, 10);
  ctx.fillStyle = "#d8c8a8";
  ctx.fillRect(ox + 90, oy - 360, 24, 56);
  ctx.fillRect(ox + 84, oy - 370, 36, 12);
  ctx.fillStyle = "#c9a24a";
  ctx.beginPath();
  ctx.moveTo(ox + 102, oy - 370);
  ctx.lineTo(ox + 102, oy - 392);
  ctx.lineTo(ox + 120, oy - 380);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a4a28";
  ctx.fillRect(ox + 408, oy - 44, 96, 8);
  for (let i = 0; i < 6; i++) ctx.fillRect(ox + 414 + i * 14, oy - 36, 8, 5);
  ctx.fillStyle = "rgba(196, 22, 28, 0.55)";
  ctx.fillRect(ox + 176, oy - 78, 18, 10);
  ctx.fillRect(ox + 228, oy - 78, 18, 10);
  drawGiftPavilion(ctx, ox + 360, oy - 40, true, 0);
  ctx.fillStyle = "#6a5a38";
  ctx.fillRect(ox - 40, oy - 20, 80, 14);
  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(ox - 36, oy - 26, 72, 8);
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#efe6d6" : "#c9a24a";
    ctx.fillRect(ox - 30 + i * 8, oy - 80, 6, 54);
  }
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(ox - 32, oy - 88, 76, 10);
  ctx.fillStyle = "#d8c8a8";
  ctx.fillRect(ox + 200, oy - 360, 36, 90);
  ctx.fillRect(ox + 192, oy - 372, 52, 14);
  ctx.fillStyle = "#c9a24a";
  ctx.beginPath();
  ctx.moveTo(ox + 218, oy - 372);
  ctx.lineTo(ox + 218, oy - 400);
  ctx.lineTo(ox + 240, oy - 384);
  ctx.closePath();
  ctx.fill();
}

function drawSeattleShore(ctx: CanvasRenderingContext2D): void {
  const ox = 1960;
  const oy = 320;
  const bay = ctx.createLinearGradient(ox, oy, ox + 430, oy + 220);
  bay.addColorStop(0, "#0e2834");
  bay.addColorStop(0.45, "#1a5868");
  bay.addColorStop(1, "#3a8a96");
  ctx.fillStyle = bay;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + 460, oy);
  ctx.lineTo(ox + 460, oy + 210);
  ctx.lineTo(ox + 40, oy + 210);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(180, 230, 235, 0.12)";
  for (let i = 0; i < 6; i++) ctx.fillRect(ox + 20 + i * 70, oy + 40 + (i % 2) * 18, 48, 4);
  ctx.fillStyle = "#4a3a28";
  ctx.fillRect(ox + 20, oy + 188, 280, 18);
  ctx.fillStyle = "#6a5a40";
  ctx.fillRect(ox + 20, oy + 178, 280, 12);
  const skyline = [
    { x: ox + 48, h: 128, w: 30 },
    { x: ox + 86, h: 96, w: 24 },
    { x: ox + 118, h: 156, w: 34 },
    { x: ox + 160, h: 84, w: 26 },
    { x: ox + 194, h: 118, w: 28 },
    { x: ox + 230, h: 72, w: 22 },
    { x: ox + 258, h: 140, w: 20 },
    { x: ox + 282, h: 88, w: 18 },
  ];
  for (const t of skyline) {
    const glass = ctx.createLinearGradient(t.x, oy + 178 - t.h, t.x + t.w, oy + 178);
    glass.addColorStop(0, "#8ef0e8");
    glass.addColorStop(0.35, "#1a3a40");
    glass.addColorStop(1, "#0a181c");
    ctx.fillStyle = glass;
    ctx.fillRect(t.x, oy + 178 - t.h, t.w, t.h);
    ctx.fillStyle = "rgba(180, 240, 235, 0.28)";
    for (let y = oy + 186 - t.h; y < oy + 172; y += 9) ctx.fillRect(t.x + 4, y, t.w - 8, 3);
  }
  ctx.fillStyle = "#c45c2c";
  ctx.fillRect(ox + 40, oy + 168, 110, 16);
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox + 48, oy + 162, 28, 8);
  ctx.fillRect(ox + 86, oy + 162, 28, 8);
  ctx.fillStyle = "#1c2a2c";
  ctx.fillRect(ox + 300, oy + 150, 70, 28);
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(ox + 308, oy + 156, 16, 8);
  ctx.fillRect(ox + 332, oy + 156, 16, 8);
  drawNeedle(ctx, ox + 410, oy + 150);
  ctx.fillStyle = "#1a2830";
  ctx.beginPath();
  ctx.moveTo(ox + 250, oy + 70);
  ctx.lineTo(ox + 340, oy + 70);
  ctx.lineTo(ox + 352, oy + 92);
  ctx.lineTo(ox + 238, oy + 92);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox + 258, oy + 76, 18, 8);
  ctx.fillRect(ox + 286, oy + 76, 18, 8);
  ctx.fillRect(ox + 314, oy + 76, 14, 8);
  ctx.fillStyle = "#4a3a28";
  ctx.fillRect(ox + 300, oy + 188, 90, 12);
  ctx.fillStyle = "#6a5a40";
  ctx.fillRect(ox + 300, oy + 180, 90, 10);
  ctx.fillStyle = "#c45c2c";
  ctx.fillRect(ox + 168, oy + 148, 64, 22);
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox + 174, oy + 142, 20, 8);
  ctx.fillRect(ox + 202, oy + 142, 20, 8);
  ctx.strokeStyle = "rgba(62, 200, 193, 0.45)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(ox + 20, oy + 198);
  ctx.lineTo(ox + 280, oy + 198);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#efe6d6";
  ctx.font = "600 12px 'IBM Plex Mono', monospace";
  ctx.fillText("PIKE PLACE", ox + 48, oy + 220);
  ctx.fillText("ELLIOTT BAY", ox + 168, oy + 220);
  ctx.fillText("FERRY", ox + 268, oy + 64);
  ctx.fillStyle = "rgba(239, 230, 214, 0.35)";
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(ox + 80 + i * 32, oy + 50 + (i % 3) * 18, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#2a2218";
  ctx.fillRect(ox + 372, oy + 40, 8, 110);
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox + 360, oy + 48, 40, 6);
  ctx.fillRect(ox + 368, oy + 70, 24, 5);
  ctx.fillStyle = "#1a2830";
  ctx.beginPath();
  ctx.moveTo(ox + 120, oy + 88);
  ctx.lineTo(ox + 188, oy + 88);
  ctx.lineTo(ox + 196, oy + 108);
  ctx.lineTo(ox + 112, oy + 108);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox + 128, oy + 94, 14, 6);
  ctx.fillRect(ox + 150, oy + 94, 14, 6);
  ctx.fillStyle = "#c45c2c";
  ctx.fillRect(ox + 390, oy + 156, 42, 18);
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox + 396, oy + 150, 14, 6);
  ctx.fillStyle = "rgba(180, 240, 235, 0.22)";
  for (let i = 0; i < 8; i++) ctx.fillRect(ox + 28 + i * 18, oy + 24, 10, 2);
  ctx.fillStyle = "#142428";
  ctx.fillRect(ox + 430, oy + 120, 16, 58);
  ctx.fillStyle = "#8aa4a8";
  ctx.fillRect(ox + 426, oy + 116, 24, 6);
  const basin = ctx.createRadialGradient(ox + 200, oy + 118, 10, ox + 200, oy + 118, 88);
  basin.addColorStop(0, "#dcfff8");
  basin.addColorStop(0.32, "#6ae8dc");
  basin.addColorStop(0.7, "#1a5868");
  basin.addColorStop(1, "#0a2028");
  ctx.fillStyle = "#142428";
  ctx.beginPath();
  ctx.arc(ox + 200, oy + 118, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8ad8d4";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(ox + 200, oy + 118, 84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#3ec8c1";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(ox + 200, oy + 118, 76, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = basin;
  ctx.beginPath();
  ctx.arc(ox + 200, oy + 118, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.ellipse(ox + 180, oy + 98, 28, 10, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c8e0e2";
  ctx.fillRect(ox + 197, oy + 70, 6, 36);
  ctx.fillStyle = "#ffd978";
  ctx.beginPath();
  ctx.arc(ox + 200, oy + 66, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#efe6d6";
  ctx.font = "600 12px 'IBM Plex Mono', monospace";
  ctx.fillText("HARBOR POOL", ox + 156, oy + 228);
  drawGiftPavilion(ctx, ox + 318, oy + 128, false, Math.PI);
  ctx.fillStyle = "#142428";
  ctx.beginPath();
  ctx.moveTo(ox - 40, oy + 40);
  ctx.lineTo(ox + 80, oy + 40);
  ctx.lineTo(ox + 96, oy + 70);
  ctx.lineTo(ox - 56, oy + 70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox - 24, oy + 48, 22, 8);
  ctx.fillRect(ox + 16, oy + 48, 22, 8);
  ctx.fillStyle = "#1a2830";
  ctx.fillRect(ox + 430, oy + 80, 22, 70);
  ctx.fillStyle = "#8aa4a8";
  ctx.fillRect(ox + 424, oy + 74, 34, 8);
  ctx.fillStyle = "#c45c2c";
  ctx.fillRect(ox + 360, oy + 200, 88, 18);
  ctx.fillStyle = "#3ec8c1";
  ctx.fillRect(ox + 368, oy + 194, 24, 8);
  ctx.fillRect(ox + 404, oy + 194, 24, 8);
}

function drawLampPosts(ctx: CanvasRenderingContext2D): void {
  for (const L of LAMPS) {
    ctx.fillStyle = "#1a1612";
    ctx.fillRect(L.x - 3, L.y - 44, 6, 48);
    ctx.fillStyle = "#3a3228";
    ctx.fillRect(L.x - 8, L.y + 2, 16, 5);
    ctx.fillStyle = "#ffd978";
    ctx.beginPath();
    ctx.moveTo(L.x - 8, L.y - 46);
    ctx.lineTo(L.x + 8, L.y - 46);
    ctx.lineTo(L.x + 6, L.y - 34);
    ctx.lineTo(L.x - 6, L.y - 34);
    ctx.closePath();
    ctx.fill();
  }
}

export type WorldView = {
  x: number;
  y: number;
  hw: number;
  hh: number;
  lite: boolean;
};

function seen(x: number, y: number, pad: number, v: WorldView | undefined): boolean {
  if (!v) return true;
  return x > v.x - v.hw - pad && x < v.x + v.hw + pad && y > v.y - v.hh - pad && y < v.y + v.hh + pad;
}

/** One local-space glow, reused. Flicker is globalAlpha, not a new gradient. */
let warmLamp: CanvasGradient | null = null;
let towerHome36: CanvasGradient | null = null;
let towerAway36: CanvasGradient | null = null;
let towerHome54: CanvasGradient | null = null;
let towerAway54: CanvasGradient | null = null;
let steamGlow: CanvasGradient | null = null;
let cloudShade: CanvasGradient | null = null;
let worldSky: CanvasGradient | null = null;

function warmLampFill(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!warmLamp) {
    warmLamp = ctx.createRadialGradient(0, 0, 2, 0, 0, 150);
    warmLamp.addColorStop(0, "rgba(255, 236, 170, 0.58)");
    warmLamp.addColorStop(0.18, "rgba(255, 180, 70, 0.26)");
    warmLamp.addColorStop(1, "rgba(255, 120, 30, 0)");
  }
  return warmLamp;
}

function towerFill(ctx: CanvasRenderingContext2D, home: boolean, radius: 36 | 54): CanvasGradient {
  const slot = radius === 36 ? (home ? "h36" : "a36") : home ? "h54" : "a54";
  const cached =
    slot === "h36" ? towerHome36 : slot === "a36" ? towerAway36 : slot === "h54" ? towerHome54 : towerAway54;
  if (cached) return cached;
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
  g.addColorStop(0, home ? "rgba(255, 220, 140, 0.28)" : "rgba(160, 240, 230, 0.28)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  if (slot === "h36") towerHome36 = g;
  else if (slot === "a36") towerAway36 = g;
  else if (slot === "h54") towerHome54 = g;
  else towerAway54 = g;
  return g;
}

function steamFill(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!steamGlow) {
    steamGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, 40);
    steamGlow.addColorStop(0, "rgba(200, 240, 235, 0.16)");
    steamGlow.addColorStop(1, "rgba(40, 80, 90, 0)");
  }
  return steamGlow;
}

function cloudFill(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!cloudShade) {
    cloudShade = ctx.createRadialGradient(0, 0, 20, 0, 0, 260);
    cloudShade.addColorStop(0, "rgba(40, 36, 28, 0.16)");
    cloudShade.addColorStop(1, "rgba(40, 36, 28, 0)");
  }
  return cloudShade;
}

function skyFill(ctx: CanvasRenderingContext2D): CanvasGradient {
  if (!worldSky) {
    worldSky = ctx.createLinearGradient(0, 0, 0, WORLD);
    worldSky.addColorStop(0, "rgba(255, 210, 140, 0.07)");
    worldSky.addColorStop(0.45, "rgba(0,0,0,0)");
    worldSky.addColorStop(1, "rgba(20, 50, 70, 0.08)");
  }
  return worldSky;
}

export function drawQuadWorld(ctx: CanvasRenderingContext2D, time: number, view?: WorldView): void {
  crisp(ctx);
  drawOffmapWoods(ctx, view);
  const g = ensureGround();
  ctx.imageSmoothingEnabled = false;
  if (view) {
    const pad = 72;
    const sx = Math.max(0, Math.floor(view.x - view.hw - pad));
    const sy = Math.max(0, Math.floor(view.y - view.hh - pad));
    const sw = Math.min(WORLD - sx, Math.ceil(view.hw * 2 + pad * 2));
    const sh = Math.min(WORLD - sy, Math.ceil(view.hh * 2 + pad * 2));
    if (sw > 0 && sh > 0) ctx.drawImage(g, sx, sy, sw, sh, sx, sy, sw, sh);
  } else {
    ctx.drawImage(g, 0, 0);
  }
  const lite = view?.lite ?? false;
  if (!view || seen(MID.x, MID.y, 1100, view)) drawPixWaterLive(ctx, time);
  if (!view || seen(fountain.home.x, fountain.home.y, 200, view)) drawPixFountainLive(ctx, fountain.home, true, time);
  if (!view || seen(fountain.away.x, fountain.away.y, 200, view)) drawPixFountainLive(ctx, fountain.away, false, time);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = warmLampFill(ctx);
  for (const L of LAMPS) {
    if (!seen(L.x, L.y, 160, view)) continue;
    const flick = 0.42 + Math.sin(time * 6.2 + L.x * 0.01) * 0.16;
    const rad = lite ? 110 : 150;
    ctx.save();
    ctx.translate(L.x, L.y - 28);
    ctx.globalAlpha = flick / 0.58;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  if (!lite) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(255, 220, 150, ${0.05 + Math.sin(time * 0.7) * 0.02})`;
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokeLanes(ctx);
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255, 245, 210, 0.28)";
  const sparks = lite ? 36 : 56;
  for (let i = 0; i < sparks; i++) {
    const n = hash(i * 41.3);
    const x = hash(i * 19.1) * WORLD;
    const y = hash(i * 11.7) * WORLD;
    if (!seen(x, y, 20, view)) continue;
    const drift = Math.sin(time * (0.6 + n) + i) * 22;
    ctx.globalAlpha = 0.1 + n * 0.2;
    ctx.beginPath();
    ctx.arc(x + drift, y + Math.cos(time * 0.8 + i) * 12, 1.3 + n * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const bugs = lite ? 5 : 8;
  for (const w of WOODS) {
    if (!seen(w.x, w.y, w.rx, view)) continue;
    for (let i = 0; i < bugs; i++) {
      const n = hash(w.x + i * 13.2);
      const drift = Math.sin(time * (1.4 + n) + i) * 16;
      const x = w.x + Math.cos(n * 6) * w.rx * 0.45 + drift;
      const y = w.y + Math.sin(n * 8) * w.ry * 0.4 + Math.cos(time * 1.1 + i) * 10;
      ctx.fillStyle = w.fir ? `rgba(180, 255, 230, ${0.12 + n * 0.18})` : `rgba(255, 230, 120, ${0.12 + n * 0.18})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + n * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(180, 230, 235, 0.16)";
  ctx.lineWidth = 1.15;
  ctx.lineCap = "round";
  if (seen(fountain.away.x, fountain.away.y, 520, view)) {
    const drops = lite ? 28 : 48;
    for (let i = 0; i < drops; i++) {
      const n = hash(i * 17.3);
      const x = fountain.away.x - 420 + n * 860 + Math.sin(time * 0.8 + i) * 30;
      const y = fountain.away.y - 360 + ((time * 180 + n * 720) % 720);
      ctx.globalAlpha = 0.08 + n * 0.14;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y + 18);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (seen(fountain.home.x, fountain.home.y, 420, view)) {
    for (let i = 0; i < 48; i++) {
      const n = hash(i * 29.1);
      const x = fountain.home.x - 220 + n * 540 + Math.sin(time * 0.4 + i) * 40;
      const y = fountain.home.y - 200 + hash(i * 8.2) * 440 + Math.cos(time * 0.35 + i) * 24;
      ctx.fillStyle = `rgba(255, 210, 140, ${0.06 + n * 0.1})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.4 + n * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const t of towerSpecs) {
    const home = t.team === "home";
    const glow = 0.22 + Math.sin(time * 3.3 + t.pos.x * 0.01) * 0.12;
    ctx.fillStyle = home ? `rgba(255, 220, 140, ${glow})` : `rgba(160, 240, 230, ${glow})`;
    ctx.fillRect(t.pos.x - 8, t.pos.y - 22, 5, 8);
    ctx.fillRect(t.pos.x + 4, t.pos.y - 22, 5, 8);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  const pulse = 0.45 + Math.sin(time * 4) * 0.25;
  ctx.fillStyle = `rgba(255, 217, 120, ${pulse})`;
  ctx.beginPath();
  ctx.arc(ancientPos.away.x, ancientPos.away.y - 78, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 80, 60, ${0.4 + Math.sin(time * 3.2) * 0.22})`;
  ctx.beginPath();
  ctx.arc(ancientPos.home.x, ancientPos.home.y - 84, 4.5, 0, Math.PI * 2);
  ctx.fill();
  drawLiveV16(ctx, time, view);
  drawLiveV17(ctx, time, view);
  drawLiveV19(ctx, time, view);
  drawLiveV20(ctx, time, view);
  drawLiveV21Jungle(ctx, time, view);
}

function drawLiveV16(ctx: CanvasRenderingContext2D, time: number, view?: WorldView): void {
  const lite = view?.lite ?? false;
  if (lite) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(190, 235, 240, 0.2)";
  ctx.lineWidth = 1.05;
  ctx.lineCap = "round";
  if (seen(fountain.away.x, fountain.away.y, 520, view)) {
    for (let i = 0; i < 36; i++) {
    const n = hash(i * 21.8);
    const x = fountain.away.x - 480 + n * 980 + Math.sin(time * 0.9 + i) * 36;
    const y = fountain.away.y - 400 + ((time * 220 + n * 820) % 820);
    ctx.globalAlpha = 0.1 + n * 0.16;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 7, y + 22);
    ctx.stroke();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (seen(fountain.home.x, fountain.home.y, 360, view)) {
    for (let i = 0; i < 56; i++) {
      const n = hash(i * 13.4);
      const drift = time * (18 + n * 12);
      const x = fountain.home.x - 80 + ((n * 420 + drift) % 460);
      const y = fountain.home.y - 240 + hash(i * 6.2) * 280 + Math.sin(time * 0.8 + i) * 18;
      ctx.fillStyle = `rgba(255, 180, 200, ${0.14 + n * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 2.4 + n, 1.2, n, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (seen(MID.x, MID.y, 420, view)) {
    for (let i = 0; i < 36; i++) {
      const n = hash(i * 44.2);
      const x = MID.x - 260 + n * 520 + Math.sin(time * 0.45 + i) * 40;
      const y = MID.y - 220 + ((time * 28 + n * 480) % 440);
      ctx.fillStyle = `rgba(210, 90, 40, ${0.16 + n * 0.22})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 3.2 + n * 1.6, 1.5, 0.5 + n, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const w of WOODS) {
    if (!seen(w.x, w.y, Math.max(w.rx, w.ry), view)) continue;
    for (let i = 0; i < 10; i++) {
      const n = hash(w.x + i * 19.4 + 3);
      const x = w.x + Math.cos(n * 7 + time * 0.3) * w.rx * 0.5;
      const y = w.y + Math.sin(n * 5 + time * 0.4) * w.ry * 0.42;
      ctx.fillStyle = w.fir ? `rgba(160, 255, 230, ${0.14 + n * 0.2})` : `rgba(255, 220, 110, ${0.14 + n * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.3 + n * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const t of towerSpecs) {
    if (!seen(t.pos.x, t.pos.y, 50, view)) continue;
    const home = t.team === "home";
    const glow = 0.12 + Math.sin(time * 2.6 + t.pos.x * 0.02) * 0.08;
    ctx.save();
    ctx.translate(t.pos.x, t.pos.y - 18);
    ctx.globalAlpha = glow / 0.28;
    ctx.fillStyle = towerFill(ctx, home, 36);
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawLiveV17(ctx: CanvasRenderingContext2D, time: number, view?: WorldView): void {
  if (view?.lite) return;
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const n = hash(i * 9.4);
    const orbit = 420 + n * 280;
    const a = time * (0.12 + n * 0.08) + i;
    const x = MID.x + Math.cos(a) * orbit * (n > 0.5 ? 0.7 : 1);
    const y = MID.y + Math.sin(a * 0.85) * orbit * 0.55;
    if (!seen(x, y, 40, view)) continue;
    ctx.fillStyle = `rgba(18, 12, 8, ${0.4 + n * 0.28})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 7 + n * 4, 2.2, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  if (seen(fountain.away.x, fountain.away.y, 280, view)) {
    ctx.fillStyle = steamFill(ctx);
    for (let i = 0; i < 10; i++) {
      const n = hash(i * 31.2);
      const x = fountain.away.x - 80 + n * 220 + Math.sin(time * 0.5 + i) * 16;
      const y = fountain.away.y - 40 + hash(i * 4.8) * 90 - ((time * 12 + n * 40) % 50);
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = 0.55 + n * 0.45;
      ctx.beginPath();
      ctx.ellipse(0, 0, 26 + n * 16, 12 + n * 8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (seen(fountain.home.x, fountain.home.y, 280, view)) {
    for (let i = 0; i < 22; i++) {
      const n = hash(i * 18.6);
      const x = fountain.home.x - 160 + n * 360 + Math.sin(time * 0.55 + i) * 28;
      const y = fountain.home.y - 120 + hash(i * 5.5) * 240 + Math.cos(time * 0.4 + i) * 16;
      ctx.fillStyle = `rgba(239, 230, 214, ${0.08 + n * 0.12})`;
      ctx.beginPath();
      ctx.rect(x, y, 3.2 + n * 2, 1.4);
      ctx.fill();
    }
  }
  for (const f of [fountain.home, fountain.away]) {
    if (!seen(f.x, f.y, 80, view)) continue;
    const dc = f.x + f.y < WORLD;
    for (let i = 0; i < 8; i++) {
      const a = time * 2.2 + i * 0.8;
      ctx.fillStyle = dc ? `rgba(200, 230, 255, ${0.16 + Math.sin(time * 4 + i) * 0.08})` : `rgba(160, 255, 240, ${0.14 + Math.sin(time * 4 + i) * 0.08})`;
      ctx.beginPath();
      ctx.arc(f.x + Math.cos(a) * 22, f.y - 10 - Math.abs(Math.sin(a)) * 16, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawLiveV19(ctx: CanvasRenderingContext2D, time: number, view?: WorldView): void {
  if (view?.lite) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = skyFill(ctx);
  if (!view) ctx.fillRect(0, 0, WORLD, WORLD);
  else {
    const sx = Math.max(0, view.x - view.hw);
    const sy = Math.max(0, view.y - view.hh);
    ctx.fillRect(sx, sy, view.hw * 2, view.hh * 2);
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (let i = 0; i < 5; i++) {
    const n = hash(i * 17.7);
    const x = ((time * (12 + n * 8) + n * WORLD) % (WORLD + 400)) - 200;
    const y = 180 + n * 900;
    if (view && !seen(x, y, 280, view)) continue;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = cloudFill(ctx);
    ctx.beginPath();
    ctx.ellipse(0, 0, 240, 70, n, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const spec of towerSpecs) {
    if (!seen(spec.pos.x, spec.pos.y, 80, view)) continue;
    const home = spec.team === "home";
    const pulse = 0.16 + Math.sin(time * 3.1 + spec.pos.x * 0.015) * 0.08;
    ctx.save();
    ctx.translate(spec.pos.x, spec.pos.y - 36);
    ctx.globalAlpha = pulse / 0.28;
    ctx.fillStyle = towerFill(ctx, home, 54);
    ctx.beginPath();
    ctx.arc(0, 0, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawLiveV20(ctx: CanvasRenderingContext2D, time: number, view?: WorldView): void {
  if (view?.lite) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  if (seen(MID.x, MID.y, 420, view)) {
    for (let i = 0; i < 18; i++) {
      const n = hash(i * 12.6);
      const x = MID.x - 220 + n * 440 + Math.sin(time * 0.7 + i) * 18;
      const y = MID.y - 80 + ((time * 22 + n * 160) % 140);
      ctx.fillStyle = `rgba(180, 230, 240, ${0.1 + n * 0.12})`;
      ctx.fillRect(x, y, 10 + n * 16, 1.4);
    }
  }
  for (const f of [fountain.home, fountain.away]) {
    if (!seen(f.x, f.y, 200, view)) continue;
    const dc = f === fountain.home;
    for (let i = 0; i < 10; i++) {
      const a = time * 1.8 + i * 0.62;
      ctx.fillStyle = dc ? `rgba(255, 220, 150, ${0.1 + Math.sin(time * 3 + i) * 0.06})` : `rgba(150, 245, 230, ${0.1 + Math.sin(time * 3 + i) * 0.06})`;
      ctx.beginPath();
      ctx.arc(f.x + Math.cos(a) * (28 + i * 3), f.y - 8 - Math.abs(Math.sin(a * 1.4)) * 22, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCampusV21Jungle(ctx: CanvasRenderingContext2D): void {
  for (const t of BACK_TRACKS) {
    if (trackRank(t.name) !== "primary") continue;
    const fir = t.path[0]!.x + t.path[0]!.y > WORLD;
    ctx.save();
    ctx.strokeStyle = fir ? "rgba(62, 200, 193, 0.1)" : "rgba(201, 162, 74, 0.12)";
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokeTrack(ctx, t.path);
    ctx.restore();
  }
  drawJungleGates(ctx);
  drawCampLandmarks(ctx);
}

type JungleGate = { name: string; x: number; y: number; kind: "base" | "lane" | "river"; fir: boolean };

const JUNGLE_GATES: JungleGate[] = [
  { name: "BASE CUT", x: 360, y: 1980, kind: "base", fir: false },
  { name: "TOP CUT", x: 420, y: 1880, kind: "lane", fir: false },
  { name: "BOT CUT", x: 620, y: 2280, kind: "lane", fir: false },
  { name: "MID MOUTH", x: 980, y: 1180, kind: "river", fir: false },
  { name: "GROVE TOP", x: 720, y: 400, kind: "lane", fir: false },
  { name: "BASE CUT", x: 2260, y: 360, kind: "base", fir: true },
  { name: "BAY TOP", x: 2080, y: 580, kind: "lane", fir: true },
  { name: "RIVER MOUTH", x: 1700, y: 1300, kind: "river", fir: true },
  { name: "RAINIER BOT", x: 1980, y: 1740, kind: "lane", fir: true },
];

function drawJungleGates(ctx: CanvasRenderingContext2D): void {
  for (const g of JUNGLE_GATES) {
    const ink = g.fir ? "#1a3a34" : "#3a2a14";
    const stone = g.fir ? "#4a6a62" : "#8a7a58";
    const trim = g.fir ? "#3ec8c1" : "#c9a24a";
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(g.x + 6, g.y + 14, 36, 14, 0.15, 0, Math.PI * 2);
    ctx.fill();
    if (g.kind === "river") {
      ctx.fillStyle = "rgba(42, 106, 120, 0.35)";
      ctx.beginPath();
      ctx.ellipse(g.x, g.y + 8, 42, 16, 0.6, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        const a = i * 1.1;
        ctx.fillStyle = "#2a6a58";
        ctx.beginPath();
        ctx.moveTo(g.x + Math.cos(a) * 22, g.y + 10 + Math.sin(a) * 8);
        ctx.lineTo(g.x + Math.cos(a) * 22 + 3, g.y - 8 + Math.sin(a) * 8);
        ctx.lineTo(g.x + Math.cos(a) * 22 + 8, g.y + 10 + Math.sin(a) * 8);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.fillStyle = stone;
    ctx.fillRect(g.x - 22, g.y - 18, 10, 28);
    ctx.fillRect(g.x + 12, g.y - 16, 10, 26);
    ctx.fillStyle = ink;
    ctx.fillRect(g.x - 22, g.y + 8, 10, 6);
    ctx.fillRect(g.x + 12, g.y + 8, 10, 6);
    ctx.fillStyle = trim;
    ctx.fillRect(g.x - 21, g.y - 20, 8, 4);
    ctx.fillRect(g.x + 13, g.y - 18, 8, 4);
    if (g.kind === "base") {
      ctx.fillStyle = trim;
      ctx.beginPath();
      ctx.moveTo(g.x - 4, g.y - 28);
      ctx.lineTo(g.x + 4, g.y - 28);
      ctx.lineTo(g.x, g.y - 38);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = g.fir ? "rgba(62, 200, 193, 0.82)" : "rgba(201, 162, 74, 0.86)";
    ctx.font = "700 11px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(g.name, g.x, g.y - 44);
    ctx.fillStyle = "rgba(239, 230, 214, 0.7)";
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillText(g.kind === "river" ? "TO RIVER" : g.kind === "base" ? "TO BASE" : "TO LANE", g.x, g.y - 32);
    ctx.textAlign = "left";
  }
}

function drawCampLandmarks(ctx: CanvasRenderingContext2D): void {
  for (const c of JUNGLE_CAMPS) {
    ctx.save();
    ctx.translate(c.x, c.y);
    if (c.name === "Mall Oaks") {
      ctx.fillStyle = "#3a2414";
      ctx.fillRect(-58, -8, 16, 36);
      ctx.fillStyle = "#5a3a1c";
      ctx.beginPath();
      ctx.ellipse(-50, -18, 22, 16, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9a24a";
      ctx.fillRect(-62, 10, 24, 6);
    } else if (c.name === "Reflecting Grove") {
      ctx.fillStyle = "#8a8490";
      ctx.beginPath();
      ctx.ellipse(48, 8, 22, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(126, 200, 255, 0.45)";
      ctx.beginPath();
      ctx.ellipse(48, 6, 14, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c4b49a";
      ctx.fillRect(40, -18, 6, 22);
      ctx.fillRect(50, -16, 6, 20);
    } else if (c.name === "Rainier Stand") {
      ctx.fillStyle = "#4a5a50";
      ctx.beginPath();
      ctx.moveTo(46, 18);
      ctx.lineTo(58, -28);
      ctx.lineTo(72, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#1a3a32";
      ctx.beginPath();
      ctx.moveTo(52, 4);
      ctx.lineTo(58, -22);
      ctx.lineTo(66, 4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = "#6a3a20";
      ctx.fillRect(40, -6, 22, 16);
      ctx.fillRect(46, -16, 16, 12);
      ctx.fillStyle = "#3ec8c1";
      ctx.fillRect(50, -12, 8, 6);
      ctx.fillStyle = "#2a1c12";
      ctx.fillRect(44, 8, 14, 6);
    }
    ctx.restore();
  }
  const copse = [
    { x: 960, y: 2080, fir: false, mark: "column" },
    { x: 2080, y: 580, fir: true, mark: "piling" },
  ];
  for (const p of copse) {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(p.x + 4, p.y + 12, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    if (p.mark === "column") {
      ctx.fillStyle = "#c4b49a";
      ctx.fillRect(p.x - 8, p.y - 36, 16, 40);
      ctx.fillStyle = "#efe6d6";
      ctx.fillRect(p.x - 12, p.y - 42, 24, 8);
    } else {
      ctx.fillStyle = "#4a3a28";
      ctx.fillRect(p.x - 6, p.y - 28, 12, 36);
      ctx.fillStyle = "#3ec8c1";
      ctx.fillRect(p.x - 8, p.y - 8, 16, 4);
    }
  }
}

function drawLiveV21Jungle(ctx: CanvasRenderingContext2D, time: number, view?: WorldView): void {
  if (view?.lite) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const t of BACK_TRACKS) {
    if (trackRank(t.name) !== "primary") continue;
    const fir = t.path[0]!.x + t.path[0]!.y > WORLD;
    const mid = t.path[Math.floor(t.path.length / 2)]!;
    if (!seen(mid.x, mid.y, 420, view)) continue;
    for (let i = 0; i < t.path.length - 1; i++) {
      const a = t.path[i]!;
      const b = t.path[i + 1]!;
      const n = hash(i * 9.2 + t.path.length);
      const x = a.x + (b.x - a.x) * ((time * 0.08 + n) % 1);
      const y = a.y + (b.y - a.y) * ((time * 0.08 + n) % 1);
      ctx.fillStyle = fir ? `rgba(140, 230, 220, ${0.06 + n * 0.06})` : `rgba(255, 220, 140, ${0.06 + n * 0.06})`;
      ctx.fillRect(x - 10, y - 1, 20 + n * 16, 2);
    }
  }
  ctx.restore();
}

export function drawSprite(ctx: CanvasRenderingContext2D, u: Sprite, ambience: boolean): void {
  ctx.save();
  if (u.dead) {
    if (u.kind === "minion") ctx.globalAlpha = Math.max(0.15, Math.min(1, (u.barkT ?? 0) / 0.8));
    else ctx.globalAlpha = u.kind === "hero" ? 0.72 : 0.35;
  }
  if (u.kind === "hero" && !u.dead) {
    const t = u.time ?? 0;
    const beat = 1 + Math.sin(t * 4.2) * 0.07;
    const ring = u.player ? "rgba(240, 193, 74, 0.95)" : u.team === "home" ? "rgba(196, 22, 28, 0.72)" : "rgba(62, 200, 193, 0.72)";
    ctx.fillStyle = u.player ? "rgba(240, 193, 74, 0.18)" : u.team === "home" ? "rgba(196, 22, 28, 0.12)" : "rgba(62, 200, 193, 0.12)";
    ctx.beginPath();
    ctx.ellipse(u.x, u.y + 18, u.r * 1.42 * beat, u.r * 0.52 * beat, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ring;
    ctx.lineWidth = u.player ? 3.2 : 2.1;
    ctx.beginPath();
    ctx.ellipse(u.x, u.y + 18, u.r * 1.42 * beat, u.r * 0.52 * beat, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(u.x, u.y + 18, u.r * 1.12 * beat, u.r * 0.38 * beat, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,0.58)";
  ctx.beginPath();
  const shadow = u.kind === "hero" ? u.r * 1.4 : u.r;
  ctx.ellipse(u.x + 3, u.y + shadow + 7, shadow * 1.38, shadow * 0.48, 0.15, 0, Math.PI * 2);
  ctx.fill();

  if (u.kind === "tower" || u.kind === "ancient") drawKeep(ctx, u);
  else if (u.kind === "minion") drawCreep(ctx, u);
  else drawHero(ctx, u, ambience);
  if (u.kind === "hero" && u.walk && !u.dead) {
    const t = u.time ?? 0;
    ctx.fillStyle = "rgba(90, 70, 40, 0.28)";
    for (let i = 0; i < 3; i++) {
      const n = hash(u.x + i * 9 + Math.floor(t * 8));
      ctx.beginPath();
      ctx.ellipse(u.x - 8 + i * 7, u.y + 20 + Math.sin(t * 14 + i) * 2, 5 + n * 4, 2, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (!u.dead) drawBars(ctx, u);
  if (u.bark) drawBark(ctx, u);
  ctx.restore();
}

/** Pixels between the sprite crown and the bottom of the bar frame. */
const BAR_CLEAR = 3;

function barFrameHeight(kind: Sprite["kind"]): number {
  return kind === "hero" ? 9 : 7;
}

/**
 * World y of the top of the painted sprite. Smaller is higher on screen.
 * Supplied hero feet sit at y+10. The 96 plate scales up to Trump's draw height, then heroDrawScale. Feet stay.
 * Pixel heroes match drawPixelHero. Trump, Pheobe, and MMA use that shorter crown. Everyone else stays.
 * Lane creeps: feet at LANE_CREEP_FOOT, height from laneCreepDrawHeight. A missing plate uses the scaled procedural body.
 * Lane towers use laneTowerCrown. Every tier is the same height.
 * Ancients: shrine plate, feet and height from the supplied blit.
 * Jungle and woods stay on JUNGLE_CREEP_HEIGHT.
 */
function spriteCrown(u: Sprite): number {
  if (u.kind === "hero") {
    if (u.heroId && suppliedHeroPlate(u.heroId)) return heroSpriteTop(u.y, u.heroId, true);
    return heroSpriteTop(u.y, u.heroId ?? "", false);
  }
  if (u.kind === "ancient") return u.y + SUPPLIED_ANCIENT_FOOT - SUPPLIED_ANCIENT_HEIGHT;
  if (u.kind === "tower") return laneTowerCrown(u.y, u.towerTier);
  if (u.kind === "minion" && !u.wild) {
    if (!suppliedLaneCreepReady(u.team, u.caster)) return laneCreepProcCrown(u.y, u.caster);
    return laneCreepCrown(u.y);
  }
  return u.y + JUNGLE_CREEP_FOOT - JUNGLE_CREEP_HEIGHT;
}

/** Health-fill y. The frame starts one pixel above this and covers the mana row on heroes. */
function barFillY(u: Sprite): number {
  if (u.kind === "minion" && u.wild) return u.y + u.r + 9;
  return spriteCrown(u) - BAR_CLEAR - barFrameHeight(u.kind) + 1;
}

/** Name baseline just above the bar frame so the plate and the bars both stay visible. */
function heroNameY(u: Sprite): number {
  return barFillY(u) - 7;
}

function drawBars(ctx: CanvasRenderingContext2D, u: Sprite): void {
  const hero = u.kind === "hero";
  const w = hero ? 58 : u.kind === "minion" ? 30 : 48;
  const y = barFillY(u);
  ctx.fillStyle = "rgba(8, 6, 4, 0.92)";
  ctx.strokeStyle = "rgba(220, 200, 150, 0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(u.x - w / 2 - 1, y - 1, w + 2, hero ? 9 : 7, 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1a100c";
  ctx.fillRect(u.x - w / 2, y, w, 5);
  const pct = Math.max(0, Math.min(1, u.hp / u.maxHp));
  ctx.fillStyle = u.team === "home" ? "#3ea84a" : "#c43434";
  ctx.fillRect(u.x - w / 2, y, w * pct, 5);
  ctx.fillStyle = "rgba(255, 255, 220, 0.28)";
  ctx.fillRect(u.x - w / 2, y, w * pct, 2);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  for (let i = 1; i < 5; i++) ctx.fillRect(u.x - w / 2 + (w * i) / 5, y, 1, 5);
  if (hero && (u.maxMana ?? 0) > 0) {
    ctx.fillStyle = "#102028";
    ctx.fillRect(u.x - w / 2, y + 5, w, 3);
    ctx.fillStyle = "#4ec8ff";
    ctx.fillRect(u.x - w / 2, y + 5, w * Math.max(0, Math.min(1, (u.mana ?? 0) / (u.maxMana ?? 1))), 3);
  }
}

const BARK_BOX = 20;

function paintBark(ctx: CanvasRenderingContext2D, text: string, cx: number, top: number, team: Team): void {
  ctx.font = "700 12px 'IBM Plex Mono', monospace";
  const w = Math.min(180, ctx.measureText(text).width + 14);
  const x = cx - w / 2;
  ctx.fillStyle = "rgba(12, 10, 8, 0.88)";
  ctx.strokeStyle = team === "home" ? "#c4161c" : "#3ec8c1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, top, w, BARK_BOX, 3);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 5, top + BARK_BOX);
  ctx.lineTo(cx, top + BARK_BOX + 6);
  ctx.lineTo(cx + 5, top + BARK_BOX);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = team === "home" ? "#f0c14a" : "#8ad8d4";
  ctx.textAlign = "center";
  ctx.fillText(text, cx, top + 14);
  ctx.textAlign = "left";
}

function drawBark(ctx: CanvasRenderingContext2D, u: Sprite): void {
  const text = u.bark ?? "";
  if (!text) return;
  const top = u.kind === "hero" ? u.y - 58 : u.kind === "minion" && !u.wild ? barFillY(u) - BARK_BOX - 8 : u.y - 36;
  paintBark(ctx, text, u.x, top, u.team);
}

/**
 * Kill-credit caption in viewport pixels. The chip is centered on viewW/2, viewH/2.
 * dy shifts it by one announcement line when a centered banner already owns that point.
 */
export function drawScreenBark(
  ctx: CanvasRenderingContext2D,
  text: string,
  viewW: number,
  viewH: number,
  team: Team,
  dy = 0,
): void {
  if (!text) return;
  paintBark(ctx, text, viewW / 2, viewH / 2 - BARK_BOX / 2 + dy, team);
}

function drawCapitol(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath();
  ctx.ellipse(x + 6, y + 30, 78, 18, 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a2a1c";
  ctx.beginPath();
  ctx.ellipse(x, y + 26, 76, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y + 26, 62, 11, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#5a4a38";
  ctx.fillRect(x - 74, y + 10, 148, 16);
  ctx.fillStyle = "#8a7a60";
  ctx.fillRect(x - 66, y + 4, 132, 8);
  const facade = ctx.createLinearGradient(x - 58, y - 20, x + 58, y + 12);
  facade.addColorStop(0, "#efe6d0");
  facade.addColorStop(0.45, "#c9b48a");
  facade.addColorStop(1, "#6a5640");
  ctx.fillStyle = facade;
  ctx.fillRect(x - 58, y - 18, 116, 28);
  ctx.fillStyle = "#efe6d6";
  for (let i = -50; i <= 46; i += 12) ctx.fillRect(x + i, y - 16, 7, 24);
  ctx.fillStyle = "#3a2a1c";
  for (let i = -50; i <= 46; i += 12) ctx.fillRect(x + i + 2, y - 14, 3, 8);
  ctx.fillStyle = "rgba(201, 162, 74, 0.4)";
  for (let i = -50; i <= 46; i += 12) ctx.fillRect(x + i, y - 16, 7, 3);
  ctx.fillStyle = "#8a7a60";
  ctx.fillRect(x - 70, y + 18, 140, 6);
  ctx.fillRect(x - 60, y + 24, 120, 5);
  const drum = ctx.createLinearGradient(x - 26, y - 50, x + 26, y - 10);
  drum.addColorStop(0, "#fff4d8");
  drum.addColorStop(1, "#8a7048");
  ctx.fillStyle = drum;
  ctx.fillRect(x - 26, y - 48, 52, 32);
  ctx.beginPath();
  ctx.arc(x, y - 48, 28, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - 48, 28, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "#c4161c";
  ctx.fillRect(x - 2, y - 92, 4, 24);
  ctx.fillStyle = "#c9a24a";
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 88);
  ctx.lineTo(x + 24, y - 80);
  ctx.lineTo(x + 2, y - 72);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 248, 220, 0.32)";
  ctx.beginPath();
  ctx.ellipse(x - 10, y - 56, 14, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a5a40";
  ctx.fillRect(x - 78, y + 22, 156, 5);
  ctx.fillStyle = "#efe6d6";
  for (let i = -3; i <= 3; i++) ctx.fillRect(x + i * 16 - 3, y + 4, 5, 8);
}

function drawNeedle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "rgba(0,0,0,0.34)";
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 34, 34, 12, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#142228";
  ctx.beginPath();
  ctx.ellipse(x, y + 30, 30, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3ec8c1";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(x, y + 30, 22, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#1c2a2c";
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 30);
  ctx.lineTo(x - 5, y - 56);
  ctx.lineTo(x + 5, y - 56);
  ctx.lineTo(x + 16, y + 30);
  ctx.closePath();
  ctx.fill();
  const steel = ctx.createLinearGradient(x - 10, y - 50, x + 12, y + 22);
  steel.addColorStop(0, "#c8e0e2");
  steel.addColorStop(0.4, "#5a7478");
  steel.addColorStop(1, "#0e181a");
  ctx.fillStyle = steel;
  ctx.beginPath();
  ctx.moveTo(x - 11, y + 26);
  ctx.lineTo(x - 3, y - 52);
  ctx.lineTo(x + 3, y - 52);
  ctx.lineTo(x + 11, y + 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3ec8c1";
  ctx.beginPath();
  ctx.ellipse(x, y - 36, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(239, 230, 214, 0.88)";
  ctx.beginPath();
  ctx.ellipse(x, y - 36, 11, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(62, 200, 193, 0.7)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(x, y - 36, 18, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(200, 220, 220, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 24);
  ctx.lineTo(x, y - 52);
  ctx.lineTo(x + 20, y + 24);
  ctx.stroke();
  ctx.strokeStyle = "#d8e8e8";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(x, y - 54);
  ctx.lineTo(x, y - 88);
  ctx.stroke();
  ctx.fillStyle = "#ffd978";
  ctx.beginPath();
  ctx.arc(x, y - 90, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 217, 120, 0.38)";
  ctx.beginPath();
  ctx.arc(x, y - 90, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200, 240, 240, 0.26)";
  ctx.beginPath();
  ctx.ellipse(x - 7, y - 38, 9, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function keepHp(u: Sprite): number {
  if (u.dead) return 0;
  if (!u.maxHp) return 1;
  return Math.max(0, Math.min(1, u.hp / u.maxHp));
}

function drawKeepSmoke(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, amount: number, home: boolean): void {
  if (amount <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const n = 3 + Math.floor(amount * 4);
  for (let i = 0; i < n; i++) {
    const drift = Math.sin(time * 1.4 + i * 1.7) * 8;
    const lift = ((time * 18 + i * 11) % 36) + i * 6;
    const a = 0.08 + amount * 0.16;
    ctx.fillStyle = home ? `rgba(255, 180, 90, ${a})` : `rgba(160, 230, 220, ${a})`;
    ctx.beginPath();
    ctx.ellipse(x + drift + (i % 2 ? 6 : -6), y - lift, 10 + i * 2, 6 + i, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawKeep(ctx: CanvasRenderingContext2D, u: Sprite): void {
  if (u.kind === "ancient") {
    drawPixAncient(ctx, u);
    return;
  }
  drawPixKeep(ctx, u);
}

function drawKeepLegacyUnused(ctx: CanvasRenderingContext2D, u: Sprite): void {
  if (u.kind === "ancient") {
    if (u.team === "home") drawCapitol(ctx, u.x, u.y);
    else drawNeedle(ctx, u.x, u.y);
    const ratio = keepHp(u);
    if (ratio < 0.75) drawKeepSmoke(ctx, u.x, u.y - 40, u.time ?? 0, 1 - ratio, u.team === "home");
    ctx.fillStyle = u.team === "home" ? "#c4161c" : "#3ec8c1";
    ctx.font = "700 13px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(u.team === "home" ? "WASHINGTON DC" : "SEATTLE", u.x, u.y + 56);
    ctx.textAlign = "left";
    return;
  }
  const home = u.team === "home";
  const ratio = keepHp(u);
  const hurt = 1 - ratio;
  const swing = Math.max(0, u.swing ?? 0);
  const tw = u.time ?? 0;
  const s = u.towerTier === "inner" ? 38 : u.towerTier === "middle" ? 31 : 25;
  const h = s * 2.82;
  const x = u.x;
  const y = u.y;
  const gold = home ? "#c9a24a" : "#3ec8c1";
  const ink = home ? "#2a1810" : "#0c1a1e";
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  ctx.beginPath();
  ctx.ellipse(x + 6, y + s + 12, s * 1.55, 14, 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = home ? "#3a2a1c" : "#142228";
  ctx.beginPath();
  ctx.ellipse(x, y + s + 6, s * 1.42, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.ellipse(x, y + s + 6, s * 1.22, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = home ? "rgba(196, 22, 28, 0.28)" : "rgba(62, 200, 193, 0.24)";
  ctx.beginPath();
  ctx.ellipse(x, y + s + 6, s * 0.78, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = home ? "#5a3a22" : "#1a3034";
  ctx.beginPath();
  ctx.ellipse(x, y + s + 2, s * 1.08, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  if (u.dead) {
    ctx.fillStyle = home ? "#4a3224" : "#1a2a2c";
    ctx.beginPath();
    ctx.moveTo(x - s * 1.05, y + s);
    ctx.lineTo(x - s * 0.4, y - 2);
    ctx.lineTo(x + s * 0.05, y + s * 0.28);
    ctx.lineTo(x + s * 0.55, y + 2);
    ctx.lineTo(x + s * 1.05, y + s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = home ? "#8a6a40" : "#4a6a68";
    for (let i = 0; i < 9; i++) {
      const n = hash(x + i * 11);
      ctx.beginPath();
      ctx.ellipse(x - s * 0.85 + n * s * 1.7, y + s - n * 14, 6 + n * 7, 3.4 + n * 3.4, n, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(x - 6, y + 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff6d0";
    ctx.beginPath();
    ctx.arc(x - 8, y + 4, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = home ? "#c4161c" : "#3ec8c1";
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 10);
    ctx.lineTo(x + 28, y + 16);
    ctx.lineTo(x + 10, y + 20);
    ctx.fill();
    drawKeepSmoke(ctx, x, y + 2, tw, 1, home);
    ctx.fillStyle = home ? "rgba(255, 110, 40, 0.42)" : "rgba(80, 220, 200, 0.32)";
    ctx.beginPath();
    ctx.arc(x + 8, y, 3.4 + Math.sin(tw * 9) * 1.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillStyle = "#0c0a08";
  ctx.beginPath();
  ctx.moveTo(x - s, y + s);
  ctx.lineTo(x - s + 12, y - h + 6);
  ctx.lineTo(x + s + 12, y - h + 6);
  ctx.lineTo(x + s, y + s);
  ctx.closePath();
  ctx.fill();
  const face = ctx.createLinearGradient(x - s, y - h, x + s, y + s);
  if (home) {
    face.addColorStop(0, hurt > 0.5 ? "#8a6240" : "#f0d8a8");
    face.addColorStop(0.35, hurt > 0.25 ? "#b07848" : "#c48a50");
    face.addColorStop(1, ink);
  } else {
    face.addColorStop(0, hurt > 0.5 ? "#4a6868" : "#c8ecec");
    face.addColorStop(0.35, hurt > 0.25 ? "#4a7074" : "#4a7880");
    face.addColorStop(1, ink);
  }
  ctx.save();
  ctx.shadowColor = home ? "rgba(196, 22, 28, 0.45)" : "rgba(62, 200, 193, 0.45)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.moveTo(x - s + 8, y + s - 2);
  ctx.lineTo(x - s + 16, y - h + 12);
  ctx.lineTo(x + s + 6, y - h + 12);
  ctx.lineTo(x + s, y + s - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(x - s + 8, y + s - 2);
  ctx.lineTo(x - s + 16, y - h + 12);
  ctx.lineTo(x + s + 6, y - h + 12);
  ctx.lineTo(x + s, y + s - 2);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = home ? "rgba(201, 162, 74, 0.5)" : "rgba(62, 200, 193, 0.44)";
  ctx.fillRect(x - s + 14, y - h + 16, s * 1.55, 5);
  ctx.fillRect(x - s + 12, y - 6, s * 1.6, 4);
  ctx.fillRect(x - s + 10, y + 10, s * 1.62, 3);
  const merlons = u.towerTier === "inner" ? 5 : 4;
  for (let i = 0; i < merlons; i++) {
    if (hurt > 0.5 && i % 2 === 1) continue;
    ctx.fillStyle = home ? "#3a2018" : "#142428";
    ctx.fillRect(x - s + 12 + i * ((s * 1.58) / merlons), y - h, 10, 16);
    ctx.fillStyle = gold;
    ctx.fillRect(x - s + 12 + i * ((s * 1.58) / merlons), y - h - 3, 10, 4);
  }
  ctx.fillStyle = home ? "rgba(90, 50, 28, 0.46)" : "rgba(20, 40, 44, 0.5)";
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 4; col++) {
      if (hurt > 0.25 && (row + col) % 5 === 0) continue;
      if (hurt > 0.5 && (row + col) % 3 === 0) continue;
      ctx.fillRect(x - 20 + col * 13 + (row % 2) * 5, y - 20 + row * 7, 10, 5);
    }
  }
  if (hurt > 0.25) {
    ctx.strokeStyle = "rgba(20, 10, 6, 0.6)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 22);
    ctx.lineTo(x - 2, y + 6);
    ctx.lineTo(x + 10, y + 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 16);
    ctx.lineTo(x + 14, y + 8);
    ctx.stroke();
  }
  if (hurt > 0.5) {
    ctx.fillStyle = "rgba(12, 8, 6, 0.42)";
    ctx.beginPath();
    ctx.moveTo(x + 6, y - 10);
    ctx.lineTo(x + 20, y + 8);
    ctx.lineTo(x + 4, y + 14);
    ctx.fill();
    ctx.fillStyle = "rgba(8, 6, 4, 0.5)";
    ctx.fillRect(x - 16, y - 4, 10, 8);
  }
  const win = 0.3 + Math.sin(tw * 3.4 + x * 0.02) * 0.16;
  const winA = hurt > 0.75 ? 0.12 : 0.22 + win;
  ctx.fillStyle = home ? `rgba(255, 220, 140, ${winA})` : `rgba(160, 240, 230, ${winA})`;
  ctx.fillRect(x - 12, y - 16, 9, 13);
  ctx.fillRect(x + 5, y - 16, 9, 13);
  if (hurt < 0.75) {
    ctx.fillRect(x - 12, y + 2, 9, 10);
    ctx.fillRect(x + 5, y + 2, 9, 10);
  }
  ctx.fillStyle = home ? "rgba(255, 240, 180, 0.58)" : "rgba(200, 255, 245, 0.52)";
  ctx.fillRect(x - 11, y - 16, 7, 3);
  ctx.fillRect(x + 6, y - 16, 7, 3);
  ctx.fillStyle = "#120e0a";
  ctx.beginPath();
  ctx.roundRect(x - 8, y + 14, 16, 18, 3);
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = home ? "#f0c14a" : "#8ad8d4";
  ctx.beginPath();
  ctx.arc(x + 3, y + 23, 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(x + 18, y - 10 - swing * 12);
  ctx.rotate(0.32 + swing * 0.85);
  ctx.fillStyle = home ? "#4a2e18" : "#163034";
  ctx.fillRect(-4, -5, 26, 9);
  ctx.fillStyle = gold;
  ctx.fillRect(16, -7, 12, 13);
  ctx.fillStyle = "#fff6d0";
  ctx.beginPath();
  ctx.arc(24, 0, 3.2 + swing * 2, 0, Math.PI * 2);
  ctx.fill();
  if (swing > 0.35) {
    ctx.fillStyle = home ? "rgba(255, 180, 80, 0.55)" : "rgba(140, 255, 230, 0.45)";
    ctx.beginPath();
    ctx.arc(30, 0, 6 + swing * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  const gemY = y - h + 26;
  const pulse = 0.7 + Math.sin(tw * 3.2 + x * 0.01) * 0.2;
  const gem = ctx.createRadialGradient(x, gemY, 1, x, gemY, 20);
  gem.addColorStop(0, "#fff8d0");
  gem.addColorStop(0.35, u.color);
  gem.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gem;
  ctx.beginPath();
  ctx.arc(x, gemY, 13 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.moveTo(x, gemY - 8);
  ctx.lineTo(x + 7, gemY);
  ctx.lineTo(x, gemY + 8);
  ctx.lineTo(x - 7, gemY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fff8d0";
  ctx.beginPath();
  ctx.arc(x - 1, gemY - 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = home ? "#c4161c" : "#3ec8c1";
  ctx.fillRect(x - 2, y - h - 20, 4, 20);
  ctx.beginPath();
  ctx.moveTo(x + 2, y - h - 18);
  ctx.lineTo(x + 20, y - h - 10);
  ctx.lineTo(x + 2, y - h - 2);
  ctx.fill();
  ctx.fillStyle = home ? "rgba(40, 90, 38, 0.5)" : "rgba(40, 90, 78, 0.4)";
  ctx.beginPath();
  ctx.ellipse(x + (home ? -22 : 22), y + 20, 8, 4.4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  if (hurt > 0.25) {
    ctx.fillStyle = "rgba(8, 6, 4, 0.28)";
    ctx.fillRect(x - 18, y + 6, 8, 5);
  }
  if (hurt > 0.5) drawKeepSmoke(ctx, x, y - h + 28, tw, 0.45 + hurt * 0.3, home);
  if (hurt > 0.75) {
    drawKeepSmoke(ctx, x + 8, y - 8, tw, hurt, home);
    ctx.fillStyle = home ? "rgba(255, 140, 50, 0.5)" : "rgba(90, 230, 210, 0.38)";
    ctx.beginPath();
    ctx.arc(x + 12, y - 8, 2.2 + Math.sin(tw * 12) * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 220, 140, 0.45)";
    ctx.beginPath();
    ctx.arc(x - 10, y + 4, 1.4 + Math.sin(tw * 15) * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCreep(ctx: CanvasRenderingContext2D, u: Sprite): void {
  drawPixCreep(ctx, u);
}

function drawCreepLegacyUnused(ctx: CanvasRenderingContext2D, u: Sprite): void {
  const scale = u.wild ? 1.85 : 1.65 * LANE_CREEP_SCALE;
  ctx.save();
  ctx.translate(u.x, u.y);
  ctx.scale(scale, scale);
  ctx.translate(-u.x, -u.y);
  if (u.wild) {
    drawJungleCreep(ctx, u);
    ctx.restore();
    return;
  }
  const maga = u.team === "home";
  const flip = Math.cos(u.facing ?? 0) < 0 ? -1 : 1;
  const walk = u.walk ? Math.sin((u.time ?? 0) * 10.4) : 0;
  const swing = u.swing ?? 0;
  ctx.translate(flip * 1.2, walk * 0.7);
  if (u.caster) drawLaneArcher(ctx, u, maga, flip, swing);
  else drawLaneInfantry(ctx, u, maga, flip);
  ctx.restore();
}

function drawLaneInfantry(ctx: CanvasRenderingContext2D, u: Sprite, maga: boolean, flip: number): void {
  const body = ctx.createLinearGradient(u.x - 10, u.y - 14, u.x + 10, u.y + 16);
  if (maga) {
    body.addColorStop(0, "#e04848");
    body.addColorStop(1, "#6a1010");
  } else {
    body.addColorStop(0, "#2a2a2a");
    body.addColorStop(1, "#080808");
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(u.x - 11, u.y - 8, 22, 22, 3);
  ctx.fill();
  ctx.fillStyle = maga ? "#8a2018" : "#101010";
  ctx.fillRect(u.x - 8, u.y + 10, 5, 8);
  ctx.fillRect(u.x + 3, u.y + 10, 5, 8);
  ctx.fillStyle = maga ? "#c9a24a" : "#1a1a1a";
  ctx.fillRect(u.x - 11, u.y + 6, 22, 5);
  if (maga) {
    ctx.fillStyle = "#f0c14a";
    ctx.beginPath();
    ctx.arc(u.x, u.y - 14, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(u.x - 5, u.y - 12, 4, 3);
    ctx.fillRect(u.x + 2, u.y - 12, 4, 3);
    drawRedcap(ctx, u.x, u.y - 18, flip);
    ctx.fillStyle = "rgba(255, 220, 140, 0.28)";
    ctx.beginPath();
    ctx.ellipse(u.x, u.y - 11, 6.2, 2.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c9a24a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(u.x - flip * 14, u.y + 4, 7, 0.4, 2.6);
    ctx.stroke();
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(u.x - 11, u.y - 1, 22, 2);
    ctx.fillStyle = "#6a1810";
    ctx.fillRect(u.x - 10, u.y + 16, 7, 3);
    ctx.fillRect(u.x + 3, u.y + 16, 7, 3);
    ctx.strokeStyle = "rgba(201, 162, 74, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(u.x - 11, u.y - 8, 22, 14);
  } else {
    ctx.fillStyle = "#1c1c1c";
    ctx.beginPath();
    ctx.arc(u.x, u.y - 14, 8.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.ellipse(u.x, u.y - 20, 9.4, 6.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(u.x - 10, u.y - 18, 20, 8);
    ctx.fillStyle = "#161616";
    ctx.beginPath();
    ctx.arc(u.x, u.y - 13, 6.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2c2c2c";
    ctx.fillRect(u.x - 4.6, u.y - 13.6, 3.2, 1.6);
    ctx.fillRect(u.x + 1.4, u.y - 13.6, 3.2, 1.6);
    ctx.fillStyle = "#121212";
    ctx.fillRect(u.x - 3.2, u.y - 10.2, 6.4, 2.2);
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(u.x - flip * 14, u.y + 4, 7, 0.4, 2.6);
    ctx.stroke();
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(u.x - 11, u.y - 1, 22, 2);
    ctx.fillRect(u.x - 10, u.y + 16, 7, 3);
    ctx.fillRect(u.x + 3, u.y + 16, 7, 3);
    ctx.strokeStyle = "rgba(90, 90, 90, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(u.x - 11, u.y - 8, 22, 14);
    ctx.fillStyle = "rgba(90, 90, 90, 0.4)";
    ctx.fillRect(u.x - 8, u.y - 6, 7, 3);
  }
}

function drawLaneArcher(ctx: CanvasRenderingContext2D, u: Sprite, maga: boolean, flip: number, swing: number): void {
  const body = ctx.createLinearGradient(u.x - 10, u.y - 14, u.x + 10, u.y + 16);
  if (maga) {
    body.addColorStop(0, "#d8c090");
    body.addColorStop(1, "#5a3014");
  } else {
    body.addColorStop(0, "#2a2a2a");
    body.addColorStop(1, "#080808");
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(u.x, u.y + 4, 9, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  if (maga) {
    ctx.fillStyle = "#f0d8a8";
    ctx.beginPath();
    ctx.arc(u.x, u.y - 10, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(u.x - 4.5, u.y - 11, 3.2, 2.2);
    ctx.fillRect(u.x + 1.4, u.y - 11, 3.2, 2.2);
    drawRedcap(ctx, u.x, u.y - 15, flip);
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(u.x - 6, u.y - 2, 12, 2);
    ctx.strokeStyle = "rgba(40, 22, 10, 0.7)";
  } else {
    ctx.fillStyle = "#1c1c1c";
    ctx.beginPath();
    ctx.arc(u.x, u.y - 10, 7.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.ellipse(u.x, u.y - 16, 8.8, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(u.x - 9, u.y - 15, 18, 8);
    ctx.fillStyle = "#161616";
    ctx.beginPath();
    ctx.arc(u.x, u.y - 9.4, 5.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2c2c2c";
    ctx.fillRect(u.x - 4.2, u.y - 10.2, 2.8, 1.5);
    ctx.fillRect(u.x + 1.4, u.y - 10.2, 2.8, 1.5);
    ctx.fillStyle = "#121212";
    ctx.fillRect(u.x - 2.8, u.y - 7.2, 5.6, 2);
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(u.x - 6, u.y - 2, 12, 2);
    ctx.strokeStyle = "rgba(20, 20, 20, 0.8)";
  }
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.ellipse(u.x, u.y + 4, 9, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  const release = swing > 0.02 && swing < 0.55;
  const hx = u.x + flip * (release ? 16 - swing * 6 : 11);
  const hy = u.y + (release ? -10 + swing * 14 : 2);
  ctx.strokeStyle = maga ? "#5a3014" : "#141414";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(u.x + flip * 6, u.y - 2);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  const can = Math.floor(u.x + u.y + (u.level || 0)) % 2 === 0;
  ctx.save();
  ctx.translate(hx + flip * 2, hy - 2);
  ctx.scale(1.55, 1.55);
  if (can) drawBeerCan(ctx, 0, 0, release ? flip * 0.9 : 0.15, maga);
  else drawBeerBottle(ctx, 0, 0, release ? flip * 1.1 : 0.2, maga);
  ctx.restore();
}

function drawJungleCreep(ctx: CanvasRenderingContext2D, u: Sprite): void {
  ctx.fillStyle = "#2a180c";
  ctx.beginPath();
  ctx.ellipse(u.x + 3, u.y + 8, 17, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  const hide = ctx.createLinearGradient(u.x - 12, u.y - 8, u.x + 14, u.y + 10);
  hide.addColorStop(0, "#8a6238");
  hide.addColorStop(1, u.color);
  ctx.fillStyle = hide;
  ctx.beginPath();
  ctx.ellipse(u.x - 2, u.y, 15, 11, -0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(18, 10, 6, 0.75)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(u.x + 13, u.y - 5, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#efe6d6";
  ctx.beginPath();
  ctx.moveTo(u.x + 18, u.y - 3);
  ctx.lineTo(u.x + 26, u.y + 2);
  ctx.lineTo(u.x + 17, u.y + 5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(u.x + 18, u.y - 8);
  ctx.lineTo(u.x + 24, u.y - 12);
  ctx.lineTo(u.x + 16, u.y - 4);
  ctx.fill();
  ctx.fillStyle = "#5a3a1c";
  ctx.beginPath();
  ctx.ellipse(u.x + 8, u.y - 12, 4, 6, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a120c";
  ctx.beginPath();
  ctx.arc(u.x + 15, u.y - 7, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3a1c";
  ctx.fillRect(u.x - 14, u.y + 8, 5, 8);
  ctx.fillRect(u.x + 4, u.y + 8, 5, 8);
  ctx.fillStyle = "#8a6238";
  ctx.beginPath();
  ctx.ellipse(u.x - 6, u.y - 2, 4, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 220, 160, 0.28)";
  ctx.beginPath();
  ctx.arc(u.x + 10, u.y - 8, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.beginPath();
  ctx.arc(u.x + 14.2, u.y - 7.6, 0.7, 0, Math.PI * 2);
  ctx.fill();
}

/** Small pixel flash and a puff of smoke at the tommy muzzle. */
function drawTommyFlash(ctx: CanvasRenderingContext2D, x: number, y: number, flip: number): void {
  const ox = Math.round(x);
  const oy = Math.round(y);
  ctx.fillStyle = "#fff6e4";
  ctx.fillRect(ox, oy, 4, 3);
  ctx.fillStyle = "#ffe08a";
  ctx.fillRect(ox + flip * 4, oy - 1, 5, 3);
  ctx.fillStyle = "#f0c14a";
  ctx.fillRect(ox + flip * 8, oy, 3, 2);
  ctx.fillStyle = "rgba(90, 86, 78, 0.85)";
  ctx.fillRect(ox + flip * 11, oy - 3, 3, 2);
  ctx.fillRect(ox + flip * 13, oy + 2, 2, 2);
}

/** Foot stays planted. A few degrees, dipped to level, while the launcher comes up. */
function leanLauncher(ctx: CanvasRenderingContext2D, x: number, y: number, flip: number, radians: number): void {
  const ground = y + 10;
  ctx.translate(x, ground);
  ctx.rotate(radians * flip);
  ctx.translate(-x, -ground);
}

/** Stun shake. A chair rocks around the seat. A standing body jitters. No leftover when rot is 0. */
function shakeStunBody(ctx: CanvasRenderingContext2D, x: number, y: number, pose: StunPose): void {
  if (pose.rot === 0 && pose.x === 0 && pose.y === 0) return;
  if (pose.upper) {
    const ground = y + 10;
    ctx.translate(x, ground);
    ctx.rotate(pose.rot);
    ctx.translate(-x, -ground);
    return;
  }
  ctx.translate(pose.x, pose.y);
  ctx.translate(x, y - 8);
  ctx.rotate(pose.rot);
  ctx.translate(-x, -(y - 8));
}

function drawHero(ctx: CanvasRenderingContext2D, u: Sprite, ambience: boolean): void {
  const def = heroById(u.heroId ?? "riot");
  const ang = u.facing ?? 0;
  const walking = !!u.walk;
  const t = (u.time ?? 0) * (u.walkRate ?? 1);
  const swing = Math.max(0, u.swing ?? 0);
  const flip = Math.cos(ang) < 0 ? -1 : 1;
  const outline = u.player ? "#f0c14a" : u.team === "home" ? "#c4161c" : "#3ec8c1";
  const dead = !!u.dead;
  const dashing = (u.dash ?? 0) > 0.4;
  const burst = def.id === "maga-hooli" ? Math.max(0, u.burst ?? 0) : 0;
  const alexAge = def.id === ALEX_GROANS_ID ? Math.max(0, u.burst ?? 0) : 0;
  const snowAge = def.id === SNOWBALL_HERO_ID ? Math.max(0, u.burst ?? 0) : 0;
  const bursting = burst > 0 && burst < HOOLI_BURST_END;
  const alexCue = alexAge > 0 && alexAge < ALEX_ROCKET_END ? alexRocketPresentation(alexAge) : null;
  const snowCue = snowAge > 0 && snowAge < SNOWBALL_END ? snowballPresentation(snowAge) : null;
  const stunned = !!u.stunned && !dead;
  const mmaAge = def.wing === "mma" ? Math.max(0, u.burst ?? 0) : 0;
  const mmaLive = def.wing === "mma" && mmaPunchActive(mmaAge);
  const shot =
    def.wing === "mma"
      ? mmaLive
      : snowCue
        ? snowCue.pose === "attack"
        : bursting || alexCue?.pose === "attack" || (def.id !== "maga-hooli" && def.id !== ALEX_GROANS_ID && def.id !== SNOWBALL_HERO_ID && attackPoseLive(swing));
  const pose = dead
    ? "death"
    : (u.cast ?? 0) > 0 && u.ult
      ? "ult"
      : (u.cast ?? 0) > 0
        ? "cast"
        : stunned
          ? "idle"
          : snowCue
            ? snowCue.pose
            : alexCue
              ? alexCue.pose
              : shot
                ? "attack"
                : (u.hurt ?? 0) > 0
                  ? "hurt"
                  : walking
                    ? "walk"
                    : "idle";
  const frame =
    !stunned && !dead && snowCue
      ? snowCue.frame
      : !stunned && bursting
        ? hooliBurstFrame(burst)
        : !stunned && alexCue
          ? alexCue.frame
          : !stunned && mmaLive && pose === "attack"
            ? mmaPunchFrame(mmaAge)
            : poseFrame(pose, t, pose === "cast" || pose === "ult" ? (u.cast ?? 0) : swing);
  const stride = Math.max(0, Math.min(1, u.stride ?? (walking ? 1 : 0)));
  const vfx = pixelVfxColor(def.id);
  const worn = u.skin ? skinById(u.skin) : undefined;
  const impact = worn?.tint ?? vfx;
  const decision =
    pose === "attack"
      ? resolveBasicAttack({
          kind: "hero",
          heroId: def.id,
          wing: def.wing,
          role: def.role,
          prop: pixelKit(def.id).prop,
          melee: def.melee,
          attackIndex: Math.max(0, (u.beat ?? 1) - 1),
        })
      : null;
  const limb = attackLimb(decision);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = u.player ? "#f0c14a" : u.team === "home" ? "#c4161c" : "#3ec8c1";
  ctx.globalAlpha = 0.28;
  ctx.fillRect(Math.round(u.x - 24), Math.round(u.y + 14), 48, 4);
  ctx.globalAlpha = 1;
  ctx.fillStyle = outline;
  ctx.fillRect(Math.round(u.x - 25), Math.round(u.y + 13), 50, 1);
  ctx.fillRect(Math.round(u.x - 25), Math.round(u.y + 18), 50, 1);
  if (dashing && !dead) drawPixelTrail(ctx, u.x, u.y, flip, vfx);
  const stunBody = stunPose({
    stun: stunned ? 1 : 0,
    time: u.time ?? 0,
    wheelchair: usesWheelchair(def.id),
    heavy: stunIsHeavy(def.role),
  });
  if (!dead) shakeStunBody(ctx, u.x, u.y, stunBody);
  const plate = !!suppliedHeroPlate(def.id);
  const lean = stunned ? 0 : (alexCue?.lean ?? 0);
  const plateLean = plate ? stillPlateLeanRadians(def.id, pose, frame, limb?.fist ?? null) : 0;
  const mmaShift = def.wing === "mma" && pose === "attack" ? mmaPunchShift(limb?.fist ?? null, frame) : 0;
  const mmaLean =
    def.wing === "mma" && pose === "attack" && plateLean === 0 ? mmaPunchLeanRadians(limb?.fist ?? null, frame) : 0;
  if (lean !== 0 || plateLean !== 0 || mmaLean !== 0 || mmaShift !== 0) {
    ctx.save();
    if (mmaShift !== 0) ctx.translate(flip * mmaShift, 0);
    if (lean !== 0) leanLauncher(ctx, u.x, u.y, flip, lean);
    if (plateLean !== 0) leanLauncher(ctx, u.x, u.y, flip, plateLean);
    if (mmaLean !== 0) leanLauncher(ctx, u.x, u.y, flip, mmaLean);
  }
  if (plate) {
    ctx.save();
    scaleSuppliedField(ctx, u.x, u.y, def.id);
    if (def.id === DYNASTY_ID) applyDynastyBob(ctx, u.x, u.y, pose, frame, dead || stunned);
  }
  const suppliedHero = drawSuppliedHero(ctx, def.id, u.x, u.y, flip, dead ? 0.72 : 1, pose, frame);
  if (plate && def.id === DYNASTY_ID) drawDynastyMotion(ctx, u.x, u.y, flip, pose, frame, dead || stunned);
  if (plate && suppliedMmaStill(def.id, def.wing)) {
    drawPlatePunchArms(ctx, u.x, u.y, flip, limb?.fist ?? null, pose, frame, stunned, def.id);
  }
  if (plate) ctx.restore();
  const blendLegs = !suppliedHero && !dead && (pose === "walk" || pose === "idle") && stride > 0.04 && stride < 0.96;
  if (!suppliedHero && blendLegs) {
    ctx.globalAlpha = 1 - stride;
    drawPixelHero(ctx, def.id, u.x, u.y, "idle", poseFrame("idle", t, 0), flip, u.skin);
    ctx.globalAlpha = stride;
    drawPixelHero(ctx, def.id, u.x, u.y, "walk", poseFrame("walk", t, 0), flip, u.skin);
    ctx.globalAlpha = 1;
  } else if (!suppliedHero) {
    const shown = pose === "walk" && stride <= 0.04 ? "idle" : pose === "idle" && stride >= 0.96 ? "walk" : pose;
    const shownFrame = shown === pose ? frame : poseFrame(shown, t, 0);
    drawPixelHero(ctx, def.id, u.x, u.y, shown, shownFrame, flip, u.skin, pose === "attack" ? limb : null);
  }
  if (!suppliedHero && sheetMeleeStrike(def.id, def.wing, def.melee, !!sheetDef(def.id))) {
    const side = limb?.fist ?? punchSideForAttack(Math.max(0, (u.beat ?? 1) - 1));
    drawSheetStrikeArms(ctx, u.x, u.y, flip, side, pose, frame, stunned, def.id, usesWheelchair(def.id));
  }
  const attackPhase = pose === "attack" ? Math.max(0, Math.min(1, swing)) : 0;
  if (!dead) drawHeroWeapon(ctx, def.id, u.x, u.y, flip, pose, frame, attackPhase);
  if (lean !== 0 || plateLean !== 0 || mmaLean !== 0 || mmaShift !== 0) ctx.restore();
  if (!suppliedHero && bursting && !dead && hooliMuzzleOn(burst)) {
    const muzzle = heroWeaponMuzzle(def.id, u.x, u.y, ang, "attack", attackPhase);
    drawTommyFlash(ctx, muzzle.x, muzzle.y, flip);
  } else if (!dead && alexCue && alexMuzzleOn(alexAge)) {
    const muzzle = heroWeaponMuzzle(def.id, u.x, u.y, ang, "attack", attackPhase);
    drawPixelImpact(ctx, muzzle.x, muzzle.y, impact, 8, def.id, worn?.look);
  } else if (!dead && snowCue && snowballReleaseOn(snowAge)) {
    const hand = snowballSpawn(u.x, u.y, ang);
    drawPixelImpact(ctx, hand.x, hand.y, "#f4fbff", 6, def.id, worn?.look);
  } else if (swing < 0.22 && swing > 0 && !dead && pose === "attack" && def.id !== "maga-hooli" && def.id !== ALEX_GROANS_ID && def.id !== SNOWBALL_HERO_ID && def.id !== DYNASTY_ID) {
    drawPixelImpact(ctx, u.x + flip * 26, u.y - 14, impact, 12, def.id, worn?.look);
  }
  if (!suppliedHero && (pose === "cast" || pose === "ult") && !dead) {
    drawPixelImpact(ctx, u.x, u.y - (pose === "ult" ? 58 : 52), impact, pose === "ult" ? 16 : 12, def.id, worn?.look);
  }
  ctx.restore();
  if (u.shield) drawPixelAura(ctx, u.x, u.y, "shield", t, "#7ec8ff");
  if (u.stunned) drawPixelAura(ctx, u.x, u.y, "stun", t, "#ffe08a");
  if (u.slowed) drawPixelAura(ctx, u.x, u.y, "slow", t, "#7ec8ff");
  if (!ambience) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#fff6e4";
    ctx.font = "700 11px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    const plate = `${u.name}  ${u.level}`;
    const nameY = heroNameY(u);
    ctx.fillText(plate, u.x, nameY);
    ctx.shadowBlur = 0;
    ctx.fillStyle = u.team === "home" ? "#c4161c" : "#3ec8c1";
    ctx.beginPath();
    ctx.arc(u.x - plate.length * 6.6 / 2 - 8, nameY - 3, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "left";
    ctx.restore();
  }
}

export function drawTargetMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  locked: boolean,
  time: number,
): void {
  const pulse = locked ? 1.6 + Math.sin(time * 9) * 1.1 : 0;
  const rad = r + 12 + pulse;
  const s = locked ? 11 : 8;
  ctx.save();
  ctx.strokeStyle = locked ? "rgba(240, 193, 74, 0.96)" : "rgba(239, 230, 214, 0.62)";
  ctx.lineWidth = locked ? 2.4 : 1.5;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(x - rad, y - rad + s);
  ctx.lineTo(x - rad, y - rad);
  ctx.lineTo(x - rad + s, y - rad);
  ctx.moveTo(x + rad - s, y - rad);
  ctx.lineTo(x + rad, y - rad);
  ctx.lineTo(x + rad, y - rad + s);
  ctx.moveTo(x + rad, y + rad - s);
  ctx.lineTo(x + rad, y + rad);
  ctx.lineTo(x + rad - s, y + rad);
  ctx.moveTo(x - rad + s, y + rad);
  ctx.lineTo(x - rad, y + rad);
  ctx.lineTo(x - rad, y + rad - s);
  ctx.stroke();
  if (locked) {
    ctx.strokeStyle = "rgba(240, 193, 74, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y + 16, rad * 0.92, rad * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawCastRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  life: number,
  color: string,
  kind: "nova" | "cone" | "slow" | "heal" | "ult" | "dash",
  heroId?: string,
): void {
  drawPixelCastRing(ctx, x, y, r, life, color, kind, heroId);
}

export function drawMoveMarker(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  const pulse = 10 + (time * 28) % 16;
  ctx.strokeStyle = "rgba(240, 193, 74, 0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(240, 193, 74, ${0.7 - pulse / 40})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 11, y);
  ctx.lineTo(x - 5, y);
  ctx.moveTo(x + 5, y);
  ctx.lineTo(x + 11, y);
  ctx.moveTo(x, y - 11);
  ctx.lineTo(x, y - 5);
  ctx.moveTo(x, y + 5);
  ctx.lineTo(x, y + 11);
  ctx.stroke();
}

export function drawBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tx: number,
  ty: number,
  color: string,
  heroId?: string,
  ammo?: ShotAmmo,
  team?: Team,
  source?: string,
  time = 0,
): void {
  drawProjectile(ctx, x, y, tx, ty, projectileLook({ ammo, heroId, team, source, color }), time);
}

export function drawShotImpact(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  look: ProjectileLook,
  life: number,
): void {
  drawProjectileImpact(ctx, x, y, look, life);
}

type FilmPack = {
  key: string;
  bloom: CanvasGradient;
  vig: CanvasGradient;
  grade: CanvasGradient;
  corners: CanvasGradient[];
  cornerR: number;
};

let filmPack: FilmPack | null = null;

function filmGrades(ctx: CanvasRenderingContext2D, w: number, h: number, lite: boolean): FilmPack {
  const key = `${Math.round(w)}x${Math.round(h)}:${lite ? 1 : 0}`;
  if (filmPack && filmPack.key === key) return filmPack;
  const bloom = ctx.createRadialGradient(w * 0.5, h * 0.36, 6, w * 0.5, h * 0.4, h * 0.68);
  bloom.addColorStop(0, lite ? "rgba(255, 214, 140, 0.12)" : "rgba(255, 214, 140, 0.22)");
  bloom.addColorStop(0.4, "rgba(255, 160, 70, 0.09)");
  bloom.addColorStop(1, "rgba(0,0,0,0)");
  const vig = ctx.createRadialGradient(w / 2, h * 0.42, h * 0.08, w / 2, h / 2, h * 0.92);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(0.48, "rgba(8, 4, 2, 0.16)");
  vig.addColorStop(1, lite ? "rgba(4, 1, 0, 0.55)" : "rgba(4, 1, 0, 0.78)");
  const grade = ctx.createLinearGradient(0, 0, 0, h);
  grade.addColorStop(0, "rgba(255, 196, 110, 0.1)");
  grade.addColorStop(0.42, "rgba(0,0,0,0)");
  grade.addColorStop(1, "rgba(12, 28, 44, 0.18)");
  const cornerR = Math.max(w, h) * 0.32;
  const spots = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
    { x: w, y: h },
  ];
  const corners = spots.map((c) => {
    const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, cornerR);
    g.addColorStop(0, "rgba(18, 8, 2, 0.62)");
    g.addColorStop(0.45, "rgba(12, 6, 2, 0.2)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    return g;
  });
  filmPack = { key, bloom, vig, grade, corners, cornerR };
  return filmPack;
}

export function filmic(ctx: CanvasRenderingContext2D, w: number, h: number, time = 0, lite = false): void {
  const pack = filmGrades(ctx, w, h, lite);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = pack.bloom;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = lite ? "rgba(48, 22, 10, 0.12)" : "rgba(48, 22, 10, 0.2)";
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.fillStyle = pack.vig;
  ctx.fillRect(0, 0, w, h);
  if (lite) return;
  ctx.fillStyle = pack.grade;
  ctx.fillRect(0, 0, w, h);
  const dirt = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
    { x: w, y: h },
  ];
  for (let i = 0; i < dirt.length; i++) {
    const c = dirt[i]!;
    ctx.fillStyle = pack.corners[i]!;
    ctx.beginPath();
    ctx.arc(c.x, c.y, pack.cornerR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(90, 50, 20, 0.22)";
  for (let i = 0; i < 16; i++) {
    const n = hash(i * 51.2);
    const side = i % 4;
    const px = side === 0 ? n * 70 : side === 1 ? w - n * 70 : hash(i * 8.1) * w;
    const py = side === 2 ? n * 54 : side === 3 ? h - n * 54 : hash(i * 4.4) * h;
    ctx.globalAlpha = 0.18 + n * 0.28;
    ctx.beginPath();
    ctx.ellipse(px, py, 3 + n * 8, 1.2 + n * 2, n * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255, 245, 220, 0.055)";
  for (let i = 0; i < 64; i++) {
    const n = hash(i * 19.7 + time * 0.15);
    ctx.fillRect(hash(i * 7.1 + time) * w, hash(i * 3.9 + time * 0.4) * h, 1 + n, 1);
  }
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "rgba(255, 210, 140, 0.08)";
  ctx.fillRect(0, 0, w, h * 0.28);
  ctx.restore();
}

export const C42_RETIRED = {
  drawBiome,
  drawCliffs,
  drawRiver,
  drawRoads,
  drawStreetDress,
  drawTowerPads,
  drawRock,
  drawLog,
  drawBush,
  drawLawnScatter,
  drawCampusDetail,
  drawCampusV16,
  drawCampusV17,
  drawCampusV19,
  drawCampusV20,
  drawShroom,
  drawCherry,
  drawMaple,
  drawHedge,
  drawStreetProp,
  drawJungleFloor,
  drawWoodsFloor,
  drawJungleTrails,
  drawWoodsCanopy,
  drawJungleCamps,
  drawFern,
  drawMidPlaza,
  drawFountainPlaza,
  drawTreeLegacyUnused,
  drawDcCampus,
  drawSeattleShore,
  drawLampPosts,
  drawCampusV21Jungle,
  drawKeepLegacyUnused,
  drawCreepLegacyUnused,
};

export function quadBadge(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "rgba(12,10,8,0.82)";
  ctx.fillRect(x - 16, y, 168, 22);
  ctx.strokeStyle = "rgba(240,193,74,0.7)";
  ctx.strokeRect(x - 16, y, 168, 22);
  ctx.fillStyle = "#c9a24a";
  ctx.font = "600 10px 'IBM Plex Mono', monospace";
  ctx.fillText("QUAD ENGINE C42", x - 8, y + 15);
}
