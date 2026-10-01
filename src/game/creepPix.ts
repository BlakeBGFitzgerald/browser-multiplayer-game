import { equippedWeapon, weaponAttackPose, weaponMotion, type WeaponMotion } from "./attackPose";
import { LANE_CREEP_PROC_BASE_HEIGHT, laneCreepDrawScale, laneCreepProcFoot } from "./laneCreep";
import { drawSuppliedJungleCreep, drawSuppliedRiverWarden } from "./suppliedArt";

/**
 * Lane infantry, archers, neutrals, and objective creeps.
 * Same ink-and-sheen language as the Grump sheet, blitted from a shared frame cache.
 * There is no siege job in the spawn table, so none is painted.
 */

export const CREEP_CORPSE = 0.8;

type Ctx = CanvasRenderingContext2D;

export type CreepSprite = {
  x: number;
  y: number;
  team: "home" | "away";
  caster: boolean;
  wild?: boolean;
  facing?: number;
  walk?: boolean;
  time?: number;
  swing?: number;
  color: string;
  name?: string;
  hurt?: number;
  dead?: boolean;
  stride?: number;
  walkRate?: number;
  r?: number;
  id?: number;
  barkT?: number;
  objectiveId?: string;
};

type Role = "infantry" | "archer" | "boar" | "stag" | "bear" | "cat" | "warden" | "ancient" | "capitol" | "bay";
type Rank = "lane" | "pup" | "alpha" | "elite";

const INK = "#1a1008";
const WHITE = "#fff6e4";
const BONE = "#efe6d2";
const GOLD = "#c9a24a";
const GOLD_HI = "#f0d078";
const GOLD_LO = "#7a5a22";
const SKIN = "#f0c8a0";
const SKIN_HI = "#ffe0c0";
const SKIN_LO = "#c49068";
const SKIN_BLOC = "#d8c090";
const WOOD = "#6a3e1c";
const WOOD_HI = "#a86a32";
const WOOD_LO = "#3a2412";
const LEATHER = "#5a3820";
const LEATHER_HI = "#8a5a30";
const BOOT = "#241810";
const SOLE = "#100c08";
const TEAL = "#3ec8c1";
const TEAL_LO = "#1a6e68";
const RED = "#c4161c";
const RED_HI = "#e84848";
const RED_LO = "#6a1014";
const STEEL = "#b7c0c6";
const STEEL_HI = "#e4eef2";
const STEEL_LO = "#5c686e";
const RIVER = "#1a4a62";
const MOSS = "#3d6a3a";
const STONE = "#8a8478";

const cache = new Map<string, HTMLCanvasElement>();

function roleOf(u: CreepSprite): Role {
  const id = u.objectiveId ?? "";
  const name = u.name ?? "";
  if (id === "warden" || name === "River Warden") return "warden";
  if (id === "ancient-beast" || name === "The Ancient") return "ancient";
  if (id === "capitol-alpha" || name === "Capitol Alpha") return "capitol";
  if (id === "bay-alpha" || name === "Bay Alpha") return "bay";
  if (!u.wild) return u.caster ? "archer" : "infantry";
  if (name.startsWith("Mall")) return "boar";
  if (name.startsWith("Reflect")) return "stag";
  if (name.startsWith("Rainier")) return "bear";
  if (name.startsWith("Elliott")) return "cat";
  return u.color === "#4a7a62" ? "bear" : "boar";
}

function rankOf(u: CreepSprite, role: Role): Rank {
  if (role === "infantry" || role === "archer") return "lane";
  if (role === "warden" || role === "ancient" || role === "capitol" || role === "bay") return "elite";
  return (u.name ?? "").endsWith(" pup") ? "pup" : "alpha";
}

function boxFor(role: Role, rank: Rank): { w: number; h: number } {
  if (role === "ancient") return { w: 112, h: 108 };
  if (role === "warden") return { w: 92, h: 100 };
  if (role === "capitol") return { w: 96, h: 100 };
  if (role === "bay") return { w: 100, h: 86 };
  if (role === "boar") return rank === "pup" ? { w: 78, h: 58 } : { w: 96, h: 70 };
  if (role === "stag") return rank === "pup" ? { w: 70, h: 78 } : { w: 88, h: 96 };
  if (role === "bear") return rank === "pup" ? { w: 76, h: 66 } : { w: 96, h: 82 };
  if (role === "cat") return rank === "pup" ? { w: 84, h: 58 } : { w: 104, h: 70 };
  if (role === "archer") return { w: 108, h: LANE_CREEP_PROC_BASE_HEIGHT };
  return { w: 82, h: LANE_CREEP_PROC_BASE_HEIGHT };
}

function gaitOf(phase: number, stride: number): number {
  if (stride <= 0.18) return -1;
  const f = Math.floor((phase / (Math.PI * 2)) * 8);
  return ((f % 8) + 8) % 8;
}

function armOf(swing: number, dead: boolean): number {
  if (dead || swing >= 0.8) return -1;
  return Math.max(0, Math.min(5, Math.floor((swing / 0.8) * 6)));
}

type Steps = { lx: number; ly: number; rx: number; ry: number };

function steps(gait: number, reach: number): Steps {
  if (gait < 0) return { lx: -6, ly: 0, rx: 4, ry: 0 };
  const a = (gait / 8) * Math.PI * 2;
  const s = Math.sin(a);
  const c = Math.cos(a);
  const lift = Math.min(5, Math.round(reach * 0.65));
  return {
    lx: Math.round(-5 + s * reach),
    ly: -Math.round(Math.max(0, c) * lift),
    rx: Math.round(3 - s * reach),
    ry: -Math.round(Math.max(0, -c) * lift),
  };
}

function fill(g: Ctx, x: number, y: number, w: number, h: number, c: string): void {
  if (w < 1 || h < 1) return;
  g.fillStyle = c;
  g.fillRect(x | 0, y | 0, w | 0, h | 0);
}

function edge(g: Ctx, x: number, y: number, w: number, h: number, c: string): void {
  fill(g, x - 1, y - 1, w + 2, h + 2, INK);
  fill(g, x, y, w, h, c);
}

function sheen(g: Ctx, x: number, y: number, w: number, h: number, c: string): void {
  fill(g, x, y, w, h, c);
}

function frameFor(key: string, w: number, h: number, paint: (g: Ctx) => void): HTMLCanvasElement {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return c;
  g.imageSmoothingEnabled = false;
  paint(g);
  cache.set(key, c);
  return c;
}

function leg(
  g: Ctx,
  socket: number,
  hip: number,
  footX: number,
  foot: number,
  lift: number,
  pants: string,
  hi: string,
  back: boolean,
): void {
  const y1 = foot + lift;
  const kneeY = hip + Math.max(6, Math.floor((y1 - hip) * 0.48));
  const kneeX = Math.round(socket + (footX - socket) * 0.45);
  const thigh = Math.max(4, kneeY - hip);
  fill(g, socket - 1, hip - 2, 8, thigh + 3, INK);
  fill(g, socket, hip - 1, 6, thigh, back ? pants : hi);
  fill(g, kneeX - 1, kneeY, 8, Math.max(4, y1 - kneeY - 5), INK);
  fill(g, kneeX, kneeY + 1, 6, Math.max(2, y1 - kneeY - 7), back ? hi : pants);
  fill(g, kneeX, kneeY, 6, 2, LEATHER);
  edge(g, footX - 2, y1 - 7, 10, 6, BOOT);
  sheen(g, footX - 1, y1 - 6, 2, 3, "#5a4632");
  fill(g, footX - 3, y1 - 2, 12, 3, SOLE);
  fill(g, footX + 5, y1 - 2, 3, 1, "#3a3028");
}

function armShift(arm: number): number {
  if (arm < 0) return 0;
  return [-7, -9, 1, 12, 6, 2][arm] ?? 0;
}

/** Swing matches the old infantry stick. Thrust and fire follow the weapon pose. */
function weaponOffsets(arm: number, motion: WeaponMotion): { shift: number; ext: number; rise: number } {
  if (arm < 0) return { shift: 0, ext: 0, rise: 0 };
  if (motion === "thrust") {
    return { shift: [0, 2, 8, 14, 6, 1][arm] ?? 0, ext: arm === 3 ? 10 : 4, rise: -2 };
  }
  if (motion === "fire") {
    return { shift: [1, -2, -8, -5, -1, 0][arm] ?? 0, ext: 0, rise: -6 };
  }
  return {
    shift: [-12, -16, 6, 22, 12, 2][arm] ?? 0,
    ext: arm === 3 ? 18 : arm === 2 ? 10 : arm === 4 ? 6 : 0,
    rise: arm < 2 ? -14 : arm === 3 ? 4 : -2,
  };
}

function paintHuman(
  g: Ctx,
  w: number,
  h: number,
  maga: boolean,
  archer: boolean,
  warden: boolean,
  variant: number,
  gait: number,
  arm: number,
  hurt: boolean,
  dead: number,
): void {
  if (dead >= 0) {
    paintHumanDown(g, h, maga, archer, warden, dead);
    return;
  }
  const cx = Math.floor(w / 2) + (hurt ? -2 : 0);
  const foot = h - 1;
  const reach = warden ? 4 : archer ? 5 : 6;
  const st = steps(gait, reach);
  const bob = gait === 1 || gait === 2 || gait === 5 || gait === 6 ? -1 : 0;
  const hip = foot - (warden ? 30 : archer ? 24 : 26) + bob;
  const shoulder = hip - (warden ? 22 : archer ? 16 : 18);
  const head = shoulder - (warden ? 16 : 14);
  const cloth = warden ? "#465860" : archer ? (maga ? "#8a7048" : "#2c2c2c") : maga ? RED : "#3a3a3a";
  const clothHi = warden ? "#9eb0b4" : archer ? (maga ? "#c8ae80" : "#6a6a6a") : maga ? RED_HI : "#6e6e6e";
  const clothLo = warden ? "#243034" : archer ? (maga ? "#5a4630" : "#161616") : maga ? RED_LO : "#1a1a1a";
  const pants = warden ? "#3a4448" : maga ? "#3e4e68" : "#2a2e38";
  const pantsHi = warden ? "#667278" : maga ? "#8aa0be" : "#4a5160";
  const skin = maga ? SKIN : SKIN_BLOC;
  const shift = armShift(arm);

  if (warden) {
    fill(g, cx - 16, shoulder + 4, 10, hip - shoulder + 8, RIVER);
    fill(g, cx - 14, shoulder + 6, 6, 8, TEAL);
    fill(g, cx - 18, hip - 4, 8, 10, GOLD);
  } else if (archer) {
    edge(g, cx - 16, shoulder + 2, 8, 16, LEATHER);
    fill(g, cx - 15, shoulder + 4, 2, 10, LEATHER_HI);
    for (let i = 0; i < 3; i++) {
      fill(g, cx - 14, shoulder - 2 - i * 3, 1, 6, WOOD);
      fill(g, cx - 16, shoulder - 4 - i * 3, 3, 2, WHITE);
      fill(g, cx - 12, shoulder - 3 - i * 3, 2, 2, GOLD);
    }
  } else if (!maga) {
    edge(g, cx - 18, hip - 8, 12, 14, "#101010");
    fill(g, cx - 16, hip - 6, 8, 8, "#2a2a2a");
    fill(g, cx - 15, hip - 4, 3, 5, "#5a5a5a");
    fill(g, cx - 12, hip - 2, 6, 4, TEAL);
  } else {
    fill(g, cx - 18, hip - 14, 2, 16, WOOD_LO);
    fill(g, cx - 24, hip - 12, 8, 8, RED);
    fill(g, cx - 24, hip - 10, 8, 2, WHITE);
  }

  const orderBack = st.lx <= st.rx;
  const drawLeg = (footX: number, lift: number, socket: number, back: boolean) => {
    leg(g, socket, hip, footX, foot, lift, pants, pantsHi, back);
  };
  if (orderBack) {
    drawLeg(cx + st.lx, st.ly, cx - 7, true);
    drawLeg(cx + st.rx, st.ry, cx + 2, false);
  } else {
    drawLeg(cx + st.rx, st.ry, cx + 2, true);
    drawLeg(cx + st.lx, st.ly, cx - 7, false);
  }

  const bw = warden ? 26 : archer ? 16 : 22;
  const bh = hip - shoulder + 4;
  edge(g, cx - Math.floor(bw / 2), shoulder, bw, bh, cloth);
  sheen(g, cx - Math.floor(bw / 2) + 1, shoulder + 1, 3, Math.max(4, bh - 6), clothHi);
  fill(g, cx + Math.floor(bw / 2) - 5, shoulder + bh - 5, 4, 4, clothLo);
  fill(g, cx - Math.floor(bw / 2), shoulder, bw, 1, warden ? STEEL_HI : maga ? "#ff8a84" : "#9a9a9a");
  if (!maga && !warden) fill(g, cx + Math.floor(bw / 2) - 2, shoulder + 2, 2, bh - 4, TEAL);
  if (warden) {
    edge(g, cx - 8, shoulder + 2, 16, 12, STEEL);
    sheen(g, cx - 7, shoulder + 3, 4, 8, STEEL_HI);
    fill(g, cx - 2, shoulder + 6, 4, 4, TEAL);
    fill(g, cx - 6, shoulder + 10, 2, 2, GOLD_HI);
    fill(g, cx + 4, shoulder + 10, 2, 2, GOLD_HI);
    fill(g, cx - 10, shoulder - 2, 8, 5, GOLD);
    fill(g, cx + 4, shoulder - 2, 8, 5, GOLD);
    fill(g, cx - 12, hip - 6, bw + 2, 5, GOLD);
    fill(g, cx - 3, hip - 5, 6, 3, GOLD_HI);
  } else if (archer) {
    fill(g, cx - 6, shoulder + 4, 10, 3, LEATHER);
    fill(g, cx - 5, shoulder + 5, 4, 1, LEATHER_HI);
    fill(g, cx - 2, hip - 5, 6, 3, maga ? GOLD : "#101010");
  } else {
    fill(g, cx - 9, hip - 8, 18, 6, LEATHER);
    fill(g, cx - 8, hip - 7, 16, 1, LEATHER_HI);
    fill(g, cx - 3, hip - 8, 6, 6, maga ? GOLD : "#101010");
    fill(g, cx - 2, hip - 7, 2, 2, maga ? GOLD_HI : TEAL);
    fill(g, cx - 1, shoulder + 6, 2, 2, GOLD);
    fill(g, cx - 1, shoulder + 11, 2, 2, GOLD);
    fill(g, cx - 1, shoulder + 16, 2, 2, GOLD_LO);
    if (maga) {
      fill(g, cx - 4, shoulder + 8, 2, 2, WHITE);
      fill(g, cx - 5, shoulder + 9, 4, 1, WHITE);
      fill(g, cx - 4, shoulder + 10, 2, 2, WHITE);
    } else {
      fill(g, cx + 4, shoulder + 6, 5, 3, TEAL);
      fill(g, cx - 2, shoulder + 4, 4, 3, "#0a0a0a");
    }
    if (variant === 1 && maga) {
      edge(g, cx + 6, hip - 2, 6, 6, LEATHER);
      fill(g, cx + 7, hip - 1, 2, 2, GOLD);
    }
    if (variant === 1 && !maga) {
      fill(g, cx - 10, shoulder + 8, 4, 3, "#2a2a2a");
      fill(g, cx - 9, shoulder + 9, 2, 1, TEAL);
    }
  }

  const infantry = !archer && !warden;
  const motion = infantry
    ? weaponMotion(
        weaponAttackPose(
          equippedWeapon({
            kind: "minion",
            job: "infantry",
            name: "Infantry",
            team: maga ? "home" : "away",
          }),
        ),
      )
    : "swing";
  const posed = infantry ? weaponOffsets(arm, motion) : null;
  const handX = cx + (archer ? 8 : 12) + (posed ? posed.shift : shift);
  const handY = shoulder + (posed && motion !== "swing" ? (motion === "fire" ? 2 : 8) : arm === 2 || arm === 3 ? 4 : 12);
  fill(g, cx + 6, shoulder + 4, Math.max(4, handX - cx - 4), 4, clothLo);
  edge(g, handX - 2, handY - 2, 5, 5, maga ? SKIN : "#222");
  if (archer) paintBow(g, handX, handY, arm, maga);
  else if (warden) paintTrident(g, handX, handY, arm);
  else paintMelee(g, handX, handY, arm, maga, posed);

  edge(g, cx - 7, head, 14, 13, skin);
  sheen(g, cx - 6, head + 1, 3, 6, maga ? SKIN_HI : "#ecd8a8");
  fill(g, cx + 3, head + 7, 3, 4, SKIN_LO);
  if (hurt) {
    fill(g, cx - 4, head + 5, 3, 1, INK);
    fill(g, cx + 2, head + 5, 3, 1, INK);
    fill(g, cx - 1, head + 9, 3, 2, RED);
  } else {
    fill(g, cx - 4, head + 5, 2, 2, INK);
    fill(g, cx + 2, head + 5, 2, 2, INK);
    fill(g, cx - 3, head + 4, 1, 1, WHITE);
    fill(g, cx + 3, head + 4, 1, 1, WHITE);
    fill(g, cx - 1, head + 9, 3, 1, maga ? "#a06048" : "#806050");
  }

  if (warden) {
    edge(g, cx - 8, head - 12, 16, 12, STEEL);
    sheen(g, cx - 7, head - 11, 4, 6, STEEL_HI);
    fill(g, cx - 2, head - 18, 4, 8, GOLD);
    fill(g, cx - 6, head - 16, 5, 3, TEAL);
    fill(g, cx + 2, head - 16, 5, 3, RED);
    fill(g, cx - 9, head - 2, 18, 3, GOLD);
    fill(g, cx - 4, head + 8, 8, 3, "#c8d0d4");
  } else if (maga) {
    edge(g, cx - 8, head - 8, 16, 8, RED);
    sheen(g, cx - 7, head - 7, 4, 4, RED_HI);
    fill(g, cx - 9, head - 1, 20, 3, WHITE);
    fill(g, cx - 2, head - 6, 6, 4, WHITE);
    fill(g, cx - 4, head + 10, 8, 2, maga ? "#f4d2b0" : SKIN);
  } else {
    edge(g, cx - 9, head - 8, 18, 12, "#2a2a2a");
    fill(g, cx - 8, head - 7, 2, 8, "#6a6a6a");
    fill(g, cx - 7, head - 10, 6, 5, "#1a1a1a");
    fill(g, cx - 8, head + 1, 16, 4, "#101010");
    fill(g, cx - 6, head + 2, 4, 2, "#d8dde0");
    fill(g, cx + 2, head + 2, 4, 2, "#d8dde0");
    fill(g, cx - 5, head + 3, 2, 1, TEAL);
    fill(g, cx + 3, head + 3, 2, 1, TEAL);
    fill(g, cx - 3, head + 7, 7, 3, "#101010");
  }

  if (hurt) {
    fill(g, cx - 2, shoulder + 8, 3, 3, WHITE);
    fill(g, cx + 4, hip - 8, 2, 2, "#ffd0c8");
  }
}

function paintMelee(
  g: Ctx,
  x: number,
  y: number,
  arm: number,
  maga: boolean,
  posed: { ext: number; rise: number } | null,
): void {
  const ext = posed ? posed.ext : arm === 3 ? 8 : arm === 2 ? 4 : 0;
  const rise = posed ? posed.rise : arm < 2 ? -8 : arm === 3 ? 2 : -2;
  if (posed && ext > 0) {
    const len = 16 + ext;
    edge(g, x + 2, y - 2, len, 5, maga ? WOOD : "#2a2a2a");
    sheen(g, x + 3, y - 1, len - 6, 1, maga ? WOOD_HI : "#3a3a3a");
    if (maga) {
      fill(g, x + len - 2, y - 6, 10, 12, RED);
      fill(g, x + len, y - 4, 6, 3, WHITE);
      fill(g, x, y - 1, 6, 4, GOLD);
    } else {
      fill(g, x + len - 2, y - 6, 12, 12, "#101010");
      fill(g, x + len + 4, y - 3, 6, 5, TEAL);
    }
    return;
  }
  edge(g, x + 2, y + rise, 4, 16 + ext, maga ? WOOD : "#2a2a2a");
  sheen(g, x + 3, y + rise + 1, 1, 8, maga ? WOOD_HI : "#3a3a3a");
  if (maga) {
    fill(g, x + 1, y + rise + 12 + ext, 6, 4, GOLD);
    fill(g, x + 2, y + rise + 13 + ext, 2, 2, GOLD_HI);
    fill(g, x, y + rise - 2, 8, 3, RED);
    fill(g, x, y + rise - 1, 8, 1, WHITE);
  } else {
    fill(g, x - 2, y + rise - 4, 10, 7, "#101010");
    fill(g, x + 6, y + rise - 2, 4, 4, TEAL);
    fill(g, x + 1, y + rise + 14 + ext, 5, 3, STEEL_LO);
  }
}

function paintBow(g: Ctx, x: number, y: number, arm: number, maga: boolean): void {
  const pull = arm < 0 ? 2 : [4, 8, 11, 2, 0, 1][arm] ?? 2;
  const wood = maga ? WOOD : "#3a342c";
  const hi = maga ? WOOD_HI : "#6a6458";
  fill(g, x + 1, y - 18, 3, 5, WOOD_LO);
  fill(g, x + 4, y - 14, 3, 6, hi);
  fill(g, x + 8, y - 8, 4, 12, wood);
  fill(g, x + 4, y + 4, 3, 6, hi);
  fill(g, x + 1, y + 9, 3, 5, WOOD_LO);
  fill(g, x + 8, y - 8, 1, 12, hi);
  fill(g, x + 7 - pull, y - 16, 1, 30, "#efe6d6");
  if (pull > 2) {
    fill(g, x - 4, y - 2, 12 + pull, 1, "#d8c090");
    fill(g, x + 8 + pull, y - 3, 4, 3, STEEL_HI);
    fill(g, x - 7, y - 4, 3, 2, maga ? RED : TEAL);
    fill(g, x - 7, y + 1, 3, 2, WHITE);
  }
  if (arm === 3) {
    fill(g, x + 16, y - 2, 14, 1, "#d8c090");
    fill(g, x + 30, y - 3, 4, 3, STEEL);
    fill(g, x + 14, y - 4, 3, 2, maga ? RED : TEAL);
  }
}

function paintTrident(g: Ctx, x: number, y: number, arm: number): void {
  const rise = arm < 2 ? -16 : arm >= 4 ? -6 : 4;
  edge(g, x + 2, y + rise, 3, 36, STEEL_LO);
  sheen(g, x + 3, y + rise + 2, 1, 16, STEEL_HI);
  fill(g, x - 4, y + rise, 8, 3, GOLD);
  fill(g, x - 2, y + rise - 8, 2, 8, STEEL);
  fill(g, x + 4, y + rise - 8, 2, 8, STEEL);
  fill(g, x + 1, y + rise - 10, 2, 8, STEEL_HI);
  fill(g, x - 1, y + rise + 28, 6, 3, GOLD);
  if (arm === 3) fill(g, x + 8, y + rise + 10, 10, 2, "#d8fff8");
}

function paintHumanDown(g: Ctx, h: number, maga: boolean, archer: boolean, warden: boolean, frame: number): void {
  const ground = h - 1;
  const cloth = warden ? STEEL : maga ? RED : "#3a3a3a";
  const hi = warden ? STEEL_HI : maga ? RED_HI : "#2a2a2a";
  if (frame <= 0) {
    edge(g, 28, ground - 36, 18, 16, cloth);
    sheen(g, 29, ground - 35, 3, 10, hi);
    edge(g, 30, ground - 48, 12, 12, maga ? SKIN : SKIN_BLOC);
    fill(g, 24, ground - 18, 6, 16, maga ? "#3e4e68" : "#1a1c22");
    fill(g, 38, ground - 16, 6, 14, maga ? "#6a7c98" : "#2a2e38");
    fill(g, 22, ground - 3, 10, 4, BOOT);
    fill(g, 36, ground - 3, 10, 4, BOOT);
    if (maga) fill(g, 28, ground - 56, 14, 6, RED);
    else fill(g, 26, ground - 56, 16, 8, "#0a0a0a");
    return;
  }
  const y = ground - (frame >= 3 ? 14 : 22);
  const x = 10 + frame * 2;
  edge(g, x, y, 36 - frame, 12, cloth);
  sheen(g, x + 1, y + 1, 4, 6, hi);
  edge(g, x + 30, y - 8, 12, 11, maga ? SKIN : SKIN_BLOC);
  fill(g, x + 4, y + 10, 8, 6, maga ? "#3e4e68" : "#222");
  fill(g, x + 16, y + 12, 10, 5, BOOT);
  fill(g, x + 28, ground - 5, 12, 3, SOLE);
  if (maga && !warden) fill(g, x + 32, y - 12, 12, 5, RED);
  if (!maga && !warden) fill(g, x + 28, y - 12, 14, 7, "#0a0a0a");
  if (warden) {
    fill(g, x + 34, y - 14, 8, 8, GOLD);
    fill(g, x - 6, y + 2, 8, 3, TEAL);
  }
  if (archer) {
    fill(g, x + 8, y + 14, 16, 2, WOOD);
    fill(g, x + 6, y + 16, 3, 6, WOOD_HI);
  } else {
    fill(g, x - 4, y + 4, 8, 3, maga ? GOLD : "#222");
  }
  if (frame >= 3) {
    fill(g, x + 18, y + 4, 4, 2, "#ffd0c8");
    fill(g, x + 6, ground - 3, 18, 2, "rgba(0,0,0,0.35)");
  }
}

type Quad = { x: number; y: number };

function quadSteps(gait: number, reach: number): Quad[] {
  if (gait < 0) {
    return [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];
  }
  const a = (gait / 8) * Math.PI * 2;
  const s = Math.sin(a);
  const c = Math.cos(a);
  const liftA = -Math.round(Math.max(0, c) * 4);
  const liftB = -Math.round(Math.max(0, -c) * 4);
  const fx = Math.round(s * reach);
  return [
    { x: fx, y: liftA },
    { x: -fx, y: liftB },
    { x: -fx, y: liftB },
    { x: fx, y: liftA },
  ];
}

function hoof(g: Ctx, x: number, ground: number, lift: number, len: number, thick: number, fur: string, dark: string): void {
  const y = ground + lift;
  fill(g, x, y - len, thick + 2, len, INK);
  fill(g, x + 1, y - len + 1, thick, len - 4, fur);
  fill(g, x + 1, y - len + 1, 2, Math.max(2, len - 6), dark);
  fill(g, x - 1, y - 2, thick + 4, 3, "#1a120c");
}

function paintBeast(
  g: Ctx,
  w: number,
  h: number,
  role: Role,
  alpha: boolean,
  gait: number,
  arm: number,
  hurt: boolean,
  dead: number,
): void {
  if (dead >= 0) {
    paintBeastDown(g, w, h, role, alpha, dead);
    return;
  }
  const ground = h - 1;
  const lunge = armShift(arm);
  const bob = gait === 2 || gait === 6 ? -1 : 0;
  const lean = hurt ? -3 : 0;
  if (role === "boar") paintBoar(g, w, ground, alpha, gait, lunge, bob, lean, hurt);
  else if (role === "stag") paintStag(g, w, ground, alpha, gait, lunge, bob, lean, hurt);
  else if (role === "bear") paintBear(g, w, ground, alpha, gait, lunge, bob, lean, hurt, arm);
  else paintCat(g, w, ground, alpha, gait, lunge, bob, lean, hurt);
}

function paintBoar(g: Ctx, w: number, ground: number, alpha: boolean, gait: number, lunge: number, bob: number, lean: number, hurt: boolean): void {
  const q = quadSteps(gait, alpha ? 5 : 3);
  const cx = Math.floor(w / 2) + Math.round(lunge * 0.4) + lean;
  const body = alpha ? 0 : 4;
  hoof(g, cx - 18 + q[2]!.x, ground, q[2]!.y, 16, 5, "#5a341c", "#3a2010");
  hoof(g, cx + 8 + q[3]!.x, ground, q[3]!.y, 16, 5, "#6a4424", "#3a2010");
  hoof(g, cx - 12 + q[0]!.x, ground, q[0]!.y, 16, 5, "#6a4424", "#3a2010");
  hoof(g, cx + 14 + q[1]!.x, ground, q[1]!.y, 16, 5, "#5a341c", "#3a2010");
  const by = ground - 30 + body + bob;
  edge(g, cx - 24, by, 46, 16, "#6b3a22");
  sheen(g, cx - 22, by + 1, 6, 6, "#8a5430");
  fill(g, cx + 8, by + 6, 10, 7, "#4a2814");
  fill(g, cx - 22, by + 14, 40, 2, "#4a2814");
  for (let i = 0; i < 6; i++) fill(g, cx - 16 + i * 6, by + 1, 2, 5, i % 2 ? "#3a2416" : "#2a1a10");
  edge(g, cx + 18 + Math.round(lunge * 0.3), by - 2, 16, 12, "#7a4630");
  fill(g, cx + 30, by + 2, 8, 6, "#c4a080");
  fill(g, cx + 36, by + 4, 4, 3, "#e8c8a8");
  fill(g, cx + 28, by + 1, 2, 2, INK);
  fill(g, cx + 29, by + 1, 1, 1, WHITE);
  const tusk = alpha ? 7 : 4;
  fill(g, cx + 26, by + 8, 3, tusk, BONE);
  fill(g, cx + 30, by + 8, 3, tusk, BONE);
  if (alpha) {
    fill(g, cx + 26, by + 12, 3, 2, GOLD);
    fill(g, cx - 4, by + 6, 5, 2, "#e8d0c0");
  }
  fill(g, cx - 26, by + 8, 6, 4, "#5a341c");
  if (hurt) fill(g, cx + 4, by + 6, 3, 3, "#ffd0c8");
}

function paintStag(g: Ctx, w: number, ground: number, alpha: boolean, gait: number, lunge: number, bob: number, lean: number, hurt: boolean): void {
  const q = quadSteps(gait, alpha ? 6 : 4);
  const cx = Math.floor(w / 2) + Math.round(lunge * 0.35) + lean;
  hoof(g, cx - 16 + q[2]!.x, ground, q[2]!.y, alpha ? 28 : 22, 3, "#c4a06a", "#8a6840");
  hoof(g, cx + 6 + q[3]!.x, ground, q[3]!.y, alpha ? 28 : 22, 3, "#d8b888", "#8a6840");
  hoof(g, cx - 10 + q[0]!.x, ground, q[0]!.y, alpha ? 26 : 20, 3, "#d8b888", "#8a6840");
  hoof(g, cx + 10 + q[1]!.x, ground, q[1]!.y, alpha ? 26 : 20, 3, "#c4a06a", "#8a6840");
  const by = ground - (alpha ? 40 : 34) + bob;
  edge(g, cx - 18, by, 32, 14, "#c4a06a");
  sheen(g, cx - 16, by + 1, 5, 6, "#e4c898");
  fill(g, cx - 8, by + 4, 3, 3, WHITE);
  fill(g, cx, by + 7, 3, 3, WHITE);
  fill(g, cx + 6, by + 3, 2, 2, "#fff8ee");
  edge(g, cx + 10, by - 16, 6, 18, "#d8b888");
  edge(g, cx + 8 + Math.round(lunge * 0.2), by - 24, 12, 10, "#e0c4a0");
  fill(g, cx + 14, by - 20, 2, 2, INK);
  fill(g, cx + 15, by - 20, 1, 1, WHITE);
  fill(g, cx + 6, by - 22, 4, 3, "#8a5a48");
  fill(g, cx + 16, by - 18, 5, 2, "#5a4030");
  if (alpha) {
    fill(g, cx + 10, by - 36, 2, 12, "#5a4030");
    fill(g, cx + 6, by - 34, 6, 2, "#6a5040");
    fill(g, cx + 14, by - 32, 6, 2, "#6a5040");
    fill(g, cx + 4, by - 30, 3, 2, "#7a6050");
    fill(g, cx + 18, by - 28, 3, 2, "#7a6050");
    fill(g, cx - 4, by + 2, 8, 6, WHITE);
  } else {
    fill(g, cx + 12, by - 28, 2, 5, "#6a5040");
  }
  fill(g, cx - 20, by + 4, 4, 8, "#b89060");
  if (hurt) fill(g, cx + 2, by + 4, 3, 3, "#ffd0c8");
}

function paintBear(
  g: Ctx,
  w: number,
  ground: number,
  alpha: boolean,
  gait: number,
  lunge: number,
  bob: number,
  lean: number,
  hurt: boolean,
  arm: number,
): void {
  const q = quadSteps(gait, 3);
  const cx = Math.floor(w / 2) + Math.round(lunge * 0.25) + lean;
  const fur = "#2c3c34";
  const hi = "#3e5648";
  hoof(g, cx - 20 + q[2]!.x, ground, q[2]!.y, 16, 7, fur, "#1a2820");
  hoof(g, cx + 10 + q[3]!.x, ground, q[3]!.y, 16, 7, hi, "#1a2820");
  hoof(g, cx - 14 + q[0]!.x, ground, q[0]!.y, 14, 7, hi, "#1a2820");
  const paw = arm === 2 || arm === 3 ? -8 : 0;
  hoof(g, cx + 16 + q[1]!.x, ground + paw, q[1]!.y, 14, 8, fur, "#1a2820");
  fill(g, cx + 20, ground - 4, 2, 3, BONE);
  fill(g, cx + 23, ground - 4, 2, 3, BONE);
  if (arm === 3) {
    fill(g, cx + 22, ground - 20, 3, 3, BONE);
    fill(g, cx + 26, ground - 18, 3, 3, BONE);
    fill(g, cx + 30, ground - 16, 3, 3, BONE);
  }
  const by = ground - 36 + bob;
  edge(g, cx - 26, by, 48, 26, fur);
  sheen(g, cx - 24, by + 2, 8, 10, hi);
  fill(g, cx - 8, by - 6, 18, 8, "#24342c");
  edge(g, cx + 16, by - 4, 18, 16, hi);
  fill(g, cx + 28, by + 2, 8, 6, "#c8b8a0");
  fill(g, cx + 24, by + 1, 3, 3, INK);
  fill(g, cx + 25, by + 1, 1, 1, "#d8ffe8");
  fill(g, cx + 20, by - 8, 5, 4, fur);
  fill(g, cx + 30, by - 8, 5, 4, fur);
  fill(g, cx + 22, by - 10, 2, 3, "#1a2820");
  if (alpha) {
    fill(g, cx - 6, by + 8, 14, 10, "#e4dcc8");
    fill(g, cx - 2, by + 12, 6, 4, WHITE);
    fill(g, cx - 22, by + 4, 6, 3, "#c45a4a");
  }
  fill(g, cx - 28, by + 10, 6, 4, fur);
  if (hurt) fill(g, cx, by + 10, 4, 3, "#ffd0c8");
}

function paintCat(g: Ctx, w: number, ground: number, alpha: boolean, gait: number, lunge: number, bob: number, lean: number, hurt: boolean): void {
  const q = quadSteps(gait, alpha ? 6 : 4);
  const cx = Math.floor(w / 2) + Math.round(lunge * 0.55) + lean;
  const fur = "#4a5648";
  const hi = "#6a7a62";
  hoof(g, cx - 22 + q[2]!.x, ground, q[2]!.y, 14, 3, fur, "#2a3228");
  hoof(g, cx + 4 + q[3]!.x, ground, q[3]!.y, 14, 3, hi, "#2a3228");
  hoof(g, cx - 12 + q[0]!.x, ground, q[0]!.y, 14, 3, hi, "#2a3228");
  hoof(g, cx + 12 + q[1]!.x, ground, q[1]!.y, 14, 3, fur, "#2a3228");
  const by = ground - 26 + bob;
  const tail = gait < 0 ? 0 : Math.round(Math.sin((gait / 8) * Math.PI * 2) * 4);
  fill(g, cx - 40, by + 6 + tail, alpha ? 20 : 14, 3, fur);
  fill(g, cx - 44, by + 4 + tail, 6, 3, "#2a2218");
  edge(g, cx - 26, by, 44, 14, fur);
  sheen(g, cx - 24, by + 1, 6, 5, hi);
  fill(g, cx - 8, by + 8, 16, 4, "#3a4438");
  edge(g, cx + 14, by - 6, 14, 12, hi);
  fill(g, cx + 24, by - 2, 8, 5, "#e0d0b0");
  fill(g, cx + 22, by - 2, 2, 2, INK);
  fill(g, cx + 26, by - 1, 2, 2, "#e8d060");
  fill(g, cx + 16, by - 12, 3, 6, fur);
  fill(g, cx + 24, by - 12, 3, 6, fur);
  fill(g, cx + 16, by - 12, 3, 2, "#e8d8a0");
  if (alpha) {
    fill(g, cx + 8, by - 2, 8, 5, "#d8efe8");
    fill(g, cx - 10, by + 2, 4, 2, TEAL);
  }
  if (hurt) fill(g, cx + 4, by + 4, 3, 3, "#ffd0c8");
}

function paintBeastDown(g: Ctx, w: number, h: number, role: Role, alpha: boolean, frame: number): void {
  const ground = h - 1;
  const y = ground - (frame >= 3 ? 16 : 24);
  const fur = role === "boar" ? "#6b3a22" : role === "stag" ? "#c4a06a" : role === "bear" ? "#2c3c34" : "#4a5648";
  const hi = role === "boar" ? "#8a5430" : role === "stag" ? "#e4c898" : role === "bear" ? "#3e5648" : "#6a7a62";
  edge(g, 12, y, w - 36, 14, fur);
  sheen(g, 14, y + 1, 6, 6, hi);
  edge(g, w - 32, y - 6, 16, 12, hi);
  fill(g, 18, y + 12, 8, 5, fur);
  fill(g, 32, y + 13, 8, 4, BOOT);
  fill(g, w - 28, y + 2, 2, 2, INK);
  if (role === "stag" && alpha) fill(g, w - 24, y - 16, 2, 10, "#5a4030");
  if (role === "boar") fill(g, w - 18, y + 6, 3, 5, BONE);
  if (frame >= 2) fill(g, 20, ground - 3, 24, 2, "rgba(0,0,0,0.3)");
}

function paintCapitol(g: Ctx, w: number, h: number, gait: number, arm: number, hurt: boolean, dead: number): void {
  if (dead >= 0) {
    paintBeastDown(g, w, h, "stag", true, dead);
    fill(g, 18, h - 20, 22, 5, RED);
    return;
  }
  const ground = h - 1;
  const lunge = armShift(arm);
  const bob = gait === 2 || gait === 6 ? -1 : 0;
  const lean = hurt ? -3 : 0;
  paintStag(g, w, ground, true, gait, lunge, bob, lean, hurt);
  const cx = Math.floor(w / 2) + Math.round(lunge * 0.35) + lean;
  const by = ground - 40 + bob;
  fill(g, cx - 16, by + 2, 28, 8, RED);
  fill(g, cx - 16, by + 4, 28, 2, GOLD);
  fill(g, cx - 4, by + 3, 6, 4, WHITE);
  edge(g, cx + 8, by - 22, 12, 8, GOLD);
  sheen(g, cx + 9, by - 21, 3, 4, GOLD_HI);
  fill(g, cx + 18, by - 8, 8, 5, RED);
  fill(g, cx - 6, by - 40, 2, 8, GOLD);
  fill(g, cx + 14, by - 38, 2, 8, GOLD);
}

function paintBay(g: Ctx, w: number, h: number, gait: number, arm: number, hurt: boolean, dead: number): void {
  if (dead >= 0) {
    paintBeastDown(g, w, h, "cat", true, dead);
    fill(g, 16, h - 18, 20, 4, TEAL_LO);
    return;
  }
  const ground = h - 1;
  const q = quadSteps(gait, 5);
  const lunge = armShift(arm);
  const cx = Math.floor(w / 2) + Math.round(lunge * 0.4) + (hurt ? -3 : 0);
  const bob = gait === 2 || gait === 6 ? -1 : 0;
  hoof(g, cx - 20 + q[2]!.x, ground, q[2]!.y, 16, 4, "#2a3a44", "#142028");
  hoof(g, cx + 6 + q[3]!.x, ground, q[3]!.y, 16, 4, "#345058", "#142028");
  hoof(g, cx - 10 + q[0]!.x, ground, q[0]!.y, 16, 4, "#345058", "#142028");
  hoof(g, cx + 14 + q[1]!.x, ground, q[1]!.y, 16, 4, "#2a3a44", "#142028");
  const by = ground - 32 + bob;
  const tail = gait < 0 ? 0 : Math.round(Math.sin((gait / 8) * Math.PI * 2) * 5);
  fill(g, cx - 36, by + 4 + tail, 16, 4, "#243840");
  fill(g, cx - 40, by + 2 + tail, 6, 4, TEAL);
  edge(g, cx - 22, by, 40, 16, "#2c4450");
  sheen(g, cx - 20, by + 1, 6, 6, "#3e6270");
  fill(g, cx - 8, by - 6, 16, 8, TEAL);
  fill(g, cx - 4, by - 4, 8, 4, "#b8fff4");
  edge(g, cx + 14, by - 10, 16, 14, "#3e6270");
  fill(g, cx + 26, by - 4, 8, 5, "#d8e4e0");
  fill(g, cx + 22, by - 6, 3, 5, "#1a2830");
  fill(g, cx + 30, by - 6, 3, 5, "#1a2830");
  fill(g, cx + 24, by - 2, 2, 2, GOLD);
  fill(g, cx + 18, by + 2, 4, 3, WHITE);
  if (arm === 3) fill(g, cx + 32, by + 4, 8, 2, "#d8fff8");
  if (hurt) fill(g, cx, by + 4, 3, 3, "#ffd0c8");
}

function paintAncient(g: Ctx, w: number, h: number, gait: number, arm: number, hurt: boolean, dead: number): void {
  const ground = h - 1;
  if (dead >= 0) {
    const y = ground - (dead >= 3 ? 20 : 32);
    edge(g, 8, y, w - 20, 18, "#5a4030");
    sheen(g, 10, y + 1, 8, 6, "#7a5a40");
    fill(g, 20, y + 4, 8, 8, RED);
    fill(g, 24, y + 6, 3, 3, "#ffb0a0");
    fill(g, 36, y - 8, 16, 6, MOSS);
    fill(g, 12, ground - 4, 30, 3, "#3a2818");
    return;
  }
  const lean = hurt ? -2 : 0;
  const bob = gait === 1 || gait === 5 ? -1 : 0;
  const cx = Math.floor(w / 2) + lean;
  for (let i = 0; i < 3; i++) {
    const a = gait < 0 ? 0 : ((gait / 8) + i / 3) * Math.PI * 2;
    const lx = Math.round(Math.sin(a) * 4);
    const ly = gait < 0 ? 0 : -Math.round(Math.max(0, Math.cos(a)) * 4);
    const x = cx - 22 + i * 18 + lx;
    fill(g, x, ground - 22 + ly + bob, 8, 22 - ly, "#3a2818");
    fill(g, x - 4, ground - 4 + ly, 14, 4, "#2a1c10");
    fill(g, x + 1, ground - 20 + ly, 2, 10, "#6a5038");
  }
  const by = ground - 62 + bob;
  edge(g, cx - 18, by, 36, 44, "#5a4030");
  sheen(g, cx - 16, by + 2, 6, 20, "#7a5840");
  fill(g, cx - 8, by + 6, 2, 30, "#3a2818");
  fill(g, cx + 4, by + 8, 2, 26, "#3e2c1c");
  fill(g, cx - 14, by + 10, 2, 18, "#6a5038");
  fill(g, cx + 8, by + 10, 8, 24, "#3a2818");
  fill(g, cx - 6, by + 14, 12, 14, RED);
  fill(g, cx - 3, by + 17, 6, 8, "#e07068");
  fill(g, cx - 1, by + 20, 2, 3, "#ffd0c0");
  fill(g, cx - 14, by + 6, 5, 16, STONE);
  fill(g, cx + 10, by + 8, 5, 14, STONE);
  fill(g, cx - 20, by + 4, 10, 6, MOSS);
  fill(g, cx + 8, by - 2, 12, 6, MOSS);
  edge(g, cx - 8, by - 16, 18, 16, "#6a4c34");
  fill(g, cx - 3, by - 10, 3, 3, "#f0e0c0");
  fill(g, cx + 4, by - 10, 3, 3, "#f0e0c0");
  fill(g, cx - 1, by - 4, 5, 2, "#2a1c12");
  const slam = arm === 2 || arm === 3;
  const ay = by + (slam ? 20 : 4) + (arm < 2 && arm >= 0 ? -8 : 0);
  fill(g, cx - 28, ay, 14, 5, "#4a3424");
  fill(g, cx + 16, ay, 16, 5, "#4a3424");
  fill(g, cx - 30, ay - 4, 6, 4, MOSS);
  fill(g, cx + 26, ay - 6, 8, 5, MOSS);
  if (arm === 3) fill(g, cx + 30, ay + 6, 12, 3, "#ffd0a0");
  fill(g, cx - 4, by - 28, 3, 12, "#3a2818");
  fill(g, cx + 6, by - 24, 3, 8, "#3a2818");
  fill(g, cx - 8, by - 26, 6, 3, MOSS);
}

function paintRole(
  g: Ctx,
  w: number,
  h: number,
  role: Role,
  rank: Rank,
  maga: boolean,
  variant: number,
  gait: number,
  arm: number,
  hurt: boolean,
  dead: number,
): void {
  if (role === "infantry" || role === "archer" || role === "warden") {
    paintHuman(g, w, h, maga, role === "archer", role === "warden", variant, gait, arm, hurt, dead);
    return;
  }
  if (role === "ancient") {
    paintAncient(g, w, h, gait, arm, hurt, dead);
    return;
  }
  if (role === "capitol") {
    paintCapitol(g, w, h, gait, arm, hurt, dead);
    return;
  }
  if (role === "bay") {
    paintBay(g, w, h, gait, arm, hurt, dead);
    return;
  }
  paintBeast(g, w, h, role, rank === "alpha", gait, arm, hurt, dead);
}

function blit(ctx: Ctx, img: HTMLCanvasElement, x: number, foot: number, flip: number, scale = 1): void {
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(foot));
  ctx.scale(flip, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, -Math.floor(w / 2), -h, w, h);
  ctx.restore();
}

export function drawCreepPix(ctx: Ctx, u: CreepSprite): void {
  if (u.objectiveId === "warden" || u.name === "River Warden") {
    if (u.dead && (u.barkT ?? 0) <= 0) return;
    const flip = Math.cos(u.facing ?? 0) < 0 ? -1 : 1;
    const alpha = u.dead ? Math.max(0.15, Math.min(1, (u.barkT ?? 0) / 0.8)) : 1;
    const ground = u.y + (u.r ?? 26) + 6;
    if (drawSuppliedRiverWarden(ctx, u.x, ground, flip, alpha)) return;
  }
  if (u.wild && !u.objectiveId) {
    if (u.dead && (u.barkT ?? 0) <= 0) return;
    const flip = Math.cos(u.facing ?? 0) < 0 ? -1 : 1;
    const alpha = u.dead ? Math.max(0.15, Math.min(1, (u.barkT ?? 0) / 0.8)) : 1;
    if (drawSuppliedJungleCreep(ctx, u.x, u.y, flip, alpha)) return;
  }
  const role = roleOf(u);
  const rank = rankOf(u, role);
  const dead = !!u.dead;
  const corpse = u.barkT ?? 0;
  const deadFrame = dead ? Math.max(0, Math.min(3, Math.floor((1 - Math.min(1, corpse / CREEP_CORPSE)) * 4))) : -1;
  const rate = Math.max(0.35, u.walkRate ?? 1);
  const stride = dead ? 0 : Math.max(0, Math.min(1, u.stride ?? (u.walk ? 1 : 0)));
  const phase = (u.time ?? 0) * (11.2 * rate);
  const gait = dead ? -1 : gaitOf(phase, stride);
  const swing = u.swing ?? 1;
  const attacking = !dead && (u.hurt ?? 0) < 0.08 && swing < 0.8;
  const arm = attacking ? armOf(swing, dead) : -1;
  const hurt = !dead && !attacking && (u.hurt ?? 0) > 0.04;
  const maga = u.team !== "away";
  const variant = role === "infantry" || role === "archer" ? (u.id ?? 0) % 2 : 0;
  const box = boxFor(role, rank);
  const shownGait = gait;
  const key = `${role}|${maga ? "m" : "a"}|${rank}|${variant}|${hurt ? 1 : 0}|${deadFrame}|${arm}|${shownGait}`;
  const img = frameFor(key, box.w, box.h, (g) => {
    paintRole(g, box.w, box.h, role, rank, maga, variant, shownGait, arm, hurt, deadFrame);
  });
  const lane = role === "infantry" || role === "archer";
  const drawScale = laneCreepDrawScale(role);
  const r = u.r ?? 14;
  const foot = lane ? laneCreepProcFoot(u.y, role === "archer") : u.y + r + 6;
  const flip = Math.cos(u.facing ?? 0) < 0 ? -1 : 1;
  const blendWalk = !dead && !attacking && !hurt && stride > 0.08 && stride < 0.92 && gait >= 0;
  ctx.imageSmoothingEnabled = false;
  if (blendWalk) {
    const idleKey = `${role}|${maga ? "m" : "a"}|${rank}|${variant}|0|-1|-1|-1`;
    const idle = frameFor(idleKey, box.w, box.h, (g) => {
      paintRole(g, box.w, box.h, role, rank, maga, variant, -1, -1, false, -1);
    });
    ctx.save();
    ctx.globalAlpha = 1 - stride;
    blit(ctx, idle, u.x, foot, flip, drawScale);
    ctx.globalAlpha = stride;
    blit(ctx, img, u.x, foot, flip, drawScale);
    ctx.restore();
  } else if (!dead && !attacking && !hurt && stride <= 0.18) {
    const idleKey = `${role}|${maga ? "m" : "a"}|${rank}|${variant}|0|-1|-1|-1`;
    const idle = frameFor(idleKey, box.w, box.h, (g) => {
      paintRole(g, box.w, box.h, role, rank, maga, variant, -1, -1, false, -1);
    });
    blit(ctx, idle, u.x, foot, flip, drawScale);
  } else {
    blit(ctx, img, u.x, foot, flip, drawScale);
  }

  if ((role === "warden" || role === "ancient") && !dead) {
    const t = u.time ?? 0;
    const spark = Math.floor(t * 5) % 2 === 0;
    ctx.fillStyle = spark ? "#d8fff6" : TEAL;
    const sx = u.x + flip * (role === "ancient" ? 6 : 10);
    const sy = foot - (role === "ancient" ? 48 : 62);
    ctx.fillRect(sx, sy, 2, 2);
    ctx.fillStyle = GOLD_HI;
    ctx.fillRect(sx + flip * 4, sy + 4, 2, 2);
  }
  if (arm === 3 && !dead) {
    ctx.fillStyle = role === "archer" ? "#fff6e4" : "#ffe08a";
    ctx.fillRect(u.x + flip * (box.w * 0.32 * drawScale), foot - box.h * 0.42 * drawScale, (flip > 0 ? 10 : -10) * drawScale, 2 * drawScale);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(u.x + flip * (box.w * 0.38 * drawScale), foot - box.h * 0.48 * drawScale, 3 * drawScale, 3 * drawScale);
  }
}
