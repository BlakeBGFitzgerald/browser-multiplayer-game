import { DLC, skinById, type SkinLook } from "../dlc";
import type { PixelPose } from "./pixelC32";

/**
 * Per-skin locomotion on the existing rig. Numbers stay small so the walk
 * clock (tied to movement) and the attack clock (tied to swing()) still land
 * on the same frames. A skin changes posture, stride, and the prop, not the
 * damage timing.
 */
export type SkinMotion = {
  idleBob: number;
  idleShift: number;
  stride: number;
  bob: number;
  arm: number;
  reach: number;
  windup: number;
  follow: number;
  castLift: number;
  lean: number;
};

const M = (
  idleBob: number,
  idleShift: number,
  stride: number,
  bob: number,
  arm: number,
  reach: number,
  windup: number,
  follow: number,
  castLift: number,
  lean: number,
): SkinMotion => ({ idleBob, idleShift, stride, bob, arm, reach, windup, follow, castLift, lean });

/** Thematic motion for each costume. Not a recolor of one cycle. */
const LOOK: Record<SkinLook, SkinMotion> = {
  eagle: M(1, 1, 1.05, 1, 1.1, 1.05, 0, 1, 1, 0.03),
  parade: M(1, 2, 1.2, 1.1, 1.3, 1.1, 1, 1, 2, 0.04),
  cape: M(1, 2, 1.15, 0.9, 1.2, 1.05, 0, 1, 2, 0.04),
  visor: M(0, 0, 0.85, 0.6, 0.7, 1.1, 0, 0, 1, -0.04),
  mask: M(0, 1, 0.78, 0.5, 0.8, 1.25, 1, 2, 0, 0.05),
  spine: M(1, 1, 0.8, 0.7, 0.6, 0.9, 1, 0, 3, 0.05),
  crown: M(2, 1, 1.1, 1.4, 1.2, 1, 0, 1, 2, 0),
  hide: M(1, 2, 0.75, 1.5, 0.7, 0.95, 2, 2, 0, 0.04),
  stamp: M(1, 0, 0.9, 1.6, 0.8, 1, 1, 2, 1, 0),
  sash: M(1, 1, 1.18, 1, 1.25, 1.05, 0, 1, 1, 0.03),
  hood: M(0, 1, 0.8, 0.55, 0.65, 1.15, 1, 1, 1, 0.05),
  goggles: M(0, 0, 0.95, 0.8, 0.9, 1.1, 0, 1, 1, -0.03),
  band: M(1, 1, 1.05, 1.3, 1.15, 1.2, 0, 1, 0, 0),
  badge: M(0, 0, 0.92, 0.7, 0.75, 0.95, 0, 0, 1, 0),
  plume: M(1, 1, 1.22, 1.15, 1.2, 1.05, 0, 1, 2, 0.03),
  wrap: M(0, 2, 0.78, 0.8, 0.85, 1.1, 1, 1, 0, 0.05),
  halo: M(2, 0, 0.72, 1.2, 0.6, 0.9, 0, 0, 4, 0),
  gloves: M(1, 1, 1.08, 1.25, 1.15, 1.4, 1, 2, 0, -0.02),
  belt: M(1, 2, 0.82, 1.1, 0.8, 1.15, 1, 2, 0, 0.04),
  ear: M(1, 2, 0.95, 1.2, 1, 1.2, 0, 1, 0, 0.02),
  shorts: M(1, 1, 1.12, 1.55, 1.1, 1.15, 0, 1, 0, 0),
  tape: M(1, 1, 1.02, 1, 1.3, 1.2, 0, 2, 0, -0.02),
  cowl: M(0, 1, 0.8, 0.6, 0.7, 1.3, 1, 2, 1, 0.05),
  web: M(1, 0, 0.7, 0.9, 1.1, 1.15, 0, 1, 1, 0),
  shield: M(0, 1, 0.8, 0.65, 0.55, 0.9, 1, 0, 1, 0.03),
  hammer: M(1, 1, 0.78, 1.3, 0.9, 1.2, 2, 3, 1, 0.04),
  bolt: M(0, 0, 1.45, 0.35, 0.8, 1.05, 0, 0, 1, -0.05),
  lasso: M(1, 2, 1, 1, 1.45, 1.25, 1, 2, 2, 0.02),
  lantern: M(1, 0, 0.88, 0.75, 0.7, 0.95, 0, 0, 3, 0),
  claws: M(0, 1, 0.9, 0.7, 1.1, 1.5, 1, 2, 0, 0.04),
  gauntlet: M(1, 1, 0.85, 1.1, 0.8, 1.35, 2, 2, 1, 0.03),
  mouse: M(2, 1, 0.85, 1.7, 1.2, 1, 0, 1, 1, 0),
  minnie: M(2, 2, 0.9, 1.5, 1.15, 0.95, 0, 1, 2, 0.02),
  pooh: M(1, 2, 0.7, 1.4, 0.6, 0.85, 1, 1, 0, 0.04),
  tigger: M(2, 1, 1.15, 2.1, 1.3, 1.1, 0, 2, 1, 0),
  alice: M(1, 1, 0.95, 1.15, 0.9, 0.9, 0, 0, 2, 0),
  hatter: M(1, 3, 1.05, 1.1, 1.2, 1, 1, 1, 2, 0.06),
  grin: M(1, 2, 0.75, 0.5, 0.8, 1.05, 0, 1, 2, 0),
  holmes: M(0, 1, 1.05, 0.7, 0.85, 1.05, 1, 1, 1, 0.02),
  drac: M(1, 1, 0.7, 0.4, 0.7, 1.1, 1, 1, 2, 0.03),
  neckbolts: M(0, 0, 0.88, 0.5, 0.55, 1.2, 2, 1, 0, 0),
  felix: M(2, 2, 1, 1.6, 1.25, 1.05, 0, 1, 1, 0.03),
  oz: M(1, 1, 1.05, 1.2, 1, 0.95, 0, 1, 2, 0),
  robin: M(1, 1, 1.25, 0.8, 1.15, 1.2, 1, 1, 1, -0.03),
};

/**
 * Same hero and same look still need their own handling. These follow the
 * skin's blurb (pressure wrestle, power shot, kick, title fight) rather than
 * a random offset.
 */
const TWEAK: Record<string, Partial<SkinMotion>> = {
  "desk-halo": { idleBob: 1, stride: 0.9, castLift: 2 },
  "mv-strange": { idleBob: 2, stride: 0.68, castLift: 5, lean: -0.03 },
  "gavel-badge": { stride: 0.9, idleShift: 0, castLift: 1 },
  "dc-lex": { stride: 1.08, idleShift: 1, reach: 1.2, lean: 0.03 },
  "mma-lousy": { stride: 1.12, reach: 1.05, arm: 1.25 },
  "mma-bonesaw": { stride: 0.86, reach: 1.4, windup: 2, follow: 3 },
  "mma-coreme": { stride: 0.74, reach: 0.95, idleShift: 2, bob: 0.75 },
  "mma-khabib": { stride: 0.68, idleShift: 2, lean: 0.06, reach: 0.9 },
  "mma-oliveher": { stride: 1.18, reach: 1.35, bob: 1.35, arm: 1.2 },
  "mma-ngannou": { stride: 0.84, reach: 1.2, windup: 2, follow: 3, bob: 1.45 },
  "mma-makechev": { stride: 0.7, reach: 1.05, arm: 0.65, idleBob: 0 },
  "mma-adesanya": { stride: 1.28, reach: 1.5, lean: -0.04, arm: 1.25 },
  "mma-perera": { stride: 0.92, reach: 1.15, bob: 1.85, follow: 1 },
  "mma-diaznt": { stride: 1.08, arm: 1.4, reach: 1.1 },
  "mma-mashvidal": { stride: 0.88, reach: 1.42, windup: 1, follow: 2 },
  "mma-omalley": { stride: 1.22, bob: 1.65, reach: 1.28, arm: 1.15, idleShift: 1 },
  "dc-harley": { stride: 0.92, bob: 1.95, idleShift: 2, reach: 1.05, arm: 1.4, idleBob: 2 },
};

export function skinMotion(skinId?: string): SkinMotion | undefined {
  if (!skinId) return undefined;
  const skin = skinById(skinId);
  if (!skin) return undefined;
  const base = LOOK[skin.look];
  const tweak = TWEAK[skinId];
  return tweak ? { ...base, ...tweak } : base;
}

export type SkinBox = { x: number; y: number; w: number; h: number };

function mix(a: string, b: string, t: number): string {
  const an = parseInt(a.slice(1), 16);
  const bn = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const av = (an >> shift) & 255;
    const bv = (bn >> shift) & 255;
    return Math.max(0, Math.min(255, Math.round(av + (bv - av) * t)));
  };
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}

function px(n: number): number {
  return Math.round(n);
}

/** Crisp costume pixels on top of the live sheet or painted body. */
export function paintSkinBody(
  ctx: CanvasRenderingContext2D,
  skinId: string,
  box: SkinBox,
  pose: PixelPose,
  frame: number,
): void {
  const skin = skinById(skinId);
  if (!skin) return;
  const tint = skin.tint;
  const hi = mix(tint, "#fff6e4", 0.45);
  const lo = mix(tint, "#1a1008", 0.45);
  const ink = "#1a1008";
  const { x, y, w, h } = box;
  const step = pose === "walk" ? frame % 2 : 0;
  const swing = pose === "attack" ? (frame <= 5 ? -4 : frame <= 8 ? 10 : 2) : pose === "cast" || pose === "ult" ? -6 : 0;
  const flutter = pose === "walk" ? (step ? 5 : -2) : pose === "idle" ? (frame % 5 === 0 ? 2 : 0) : pose === "attack" ? -4 : 1;
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const look = skin.look;
  if (look === "cape" || look === "parade" || look === "drac") {
    ctx.fillStyle = lo;
    ctx.fillRect(px(x + 2), px(y + h * 0.32), 7, px(h * 0.5 + flutter));
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w - 10), px(y + h * 0.3), 8, px(h * 0.48 - flutter));
    ctx.fillStyle = hi;
    ctx.fillRect(px(x + w - 8), px(y + h * 0.32), 2, px(h * 0.3));
    if (look === "parade" || look === "drac") {
      ctx.fillStyle = look === "drac" ? "#c4161c" : "#c4161c";
      ctx.fillRect(px(x + 2), px(y + h * 0.72 + flutter), 7, 3);
      ctx.fillRect(px(x + w - 10), px(y + h * 0.7 - flutter), 8, 3);
    }
  }
  if (look === "eagle" || look === "plume" || look === "robin" || look === "holmes" || look === "hatter") {
    const brim = look === "hatter" ? 16 : 6;
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.28), px(y + 2), px(w * 0.44), 4);
    ctx.fillStyle = hi;
    ctx.fillRect(px(x + w * 0.34), px(y - brim + (pose === "walk" ? step : 0)), px(w * 0.28), brim);
    if (look === "plume" || look === "robin") {
      ctx.fillStyle = "#fff6e4";
      ctx.fillRect(px(x + w * 0.62), px(y - 8 - step), 3, 10);
      ctx.fillStyle = tint;
      ctx.fillRect(px(x + w * 0.66), px(y - 10 - step), 2, 4);
    }
    if (look === "holmes" && (pose === "attack" || pose === "cast" || pose === "ult")) {
      ctx.fillStyle = ink;
      ctx.fillRect(px(x + w * 0.62 + swing), px(y + h * 0.28), 10, 2);
      ctx.fillStyle = hi;
      ctx.fillRect(px(x + w * 0.78 + swing), px(y + h * 0.26), 3, 3);
    }
  }
  if (look === "visor" || look === "goggles") {
    ctx.fillStyle = ink;
    ctx.fillRect(px(x + w * 0.22), px(y + h * 0.16), px(w * 0.56), 5);
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.26), px(y + h * 0.16), px(w * 0.2), 4);
    ctx.fillRect(px(x + w * 0.52), px(y + h * 0.16), px(w * 0.2), 4);
    ctx.fillStyle = hi;
    ctx.fillRect(px(x + w * 0.28), px(y + h * 0.16), 3, 2);
  }
  if (look === "mask" || look === "cowl" || look === "spine") {
    ctx.fillStyle = look === "spine" ? "#2a1038" : ink;
    ctx.fillRect(px(x + w * 0.24), px(y + h * 0.1), px(w * 0.52), px(h * 0.16));
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.3), px(y + h * 0.14), 6, 4);
    ctx.fillRect(px(x + w * 0.52), px(y + h * 0.14), 6, 4);
    ctx.fillStyle = "#fff6e4";
    ctx.fillRect(px(x + w * 0.32), px(y + h * 0.15), 2, 2);
    ctx.fillRect(px(x + w * 0.54), px(y + h * 0.15), 2, 2);
  }
  if (look === "crown" || look === "halo") {
    ctx.fillStyle = tint;
    const rise = look === "halo" ? 8 + (frame % 4) : 4;
    ctx.fillRect(px(x + w * 0.28), px(y - rise), px(w * 0.44), look === "halo" ? 3 : 4);
    ctx.fillStyle = hi;
    if (look === "crown") {
      ctx.fillRect(px(x + w * 0.28), px(y - rise - 3), 3, 3);
      ctx.fillRect(px(x + w * 0.48), px(y - rise - 5), 3, 5);
      ctx.fillRect(px(x + w * 0.66), px(y - rise - 3), 3, 3);
    }
  }
  if (look === "hood") {
    ctx.fillStyle = lo;
    ctx.fillRect(px(x + w * 0.18), px(y), px(w * 0.64), px(h * 0.22));
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.22), px(y + 2), px(w * 0.56), 4);
    ctx.fillStyle = ink;
    ctx.fillRect(px(x + w * 0.3), px(y + h * 0.1), px(w * 0.4), px(h * 0.08));
  }
  if (look === "sash" || look === "badge" || look === "stamp" || look === "belt") {
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.2), px(y + h * 0.4), px(w * 0.6), 4);
    if (look === "sash") ctx.fillRect(px(x + w * 0.62), px(y + h * 0.4), 4, px(h * 0.28));
    if (look === "belt") {
      ctx.fillStyle = ink;
      ctx.fillRect(px(x + w * 0.44), px(y + h * 0.38), 8, 8);
      ctx.fillStyle = hi;
      ctx.fillRect(px(x + w * 0.46), px(y + h * 0.4), 3, 3);
    }
    if (look === "badge" || look === "stamp") {
      ctx.fillStyle = hi;
      ctx.fillRect(px(x + w * 0.62), px(y + h * 0.36), 8, 8);
      ctx.fillStyle = tint;
      ctx.fillRect(px(x + w * 0.64), px(y + h * 0.38), 4, 4);
    }
  }
  if (look === "hide" || look === "shorts" || look === "wrap" || look === "tape") {
    ctx.fillStyle = tint;
    const y0 = look === "shorts" || look === "wrap" || look === "tape" ? h * 0.55 : h * 0.32;
    const hh = look === "hide" ? h * 0.4 : h * 0.16;
    ctx.fillRect(px(x + w * 0.22), px(y + y0 + (pose === "walk" ? step : 0)), px(w * 0.56), px(hh));
    ctx.fillStyle = hi;
    ctx.fillRect(px(x + w * 0.28), px(y + y0 + 2), px(w * 0.2), 2);
    if (look === "wrap" || look === "tape") {
      ctx.fillStyle = lo;
      ctx.fillRect(px(x + w * 0.24), px(y + h * 0.72 + (step ? 2 : 0)), 6, px(h * 0.12));
      ctx.fillRect(px(x + w * 0.62), px(y + h * 0.72 + (step ? 0 : 2)), 6, px(h * 0.12));
    }
  }
  if (look === "gloves" || look === "gauntlet" || look === "claws") {
    const hx = x + w * 0.72 + swing;
    const hy = y + h * 0.42;
    ctx.fillStyle = tint;
    ctx.fillRect(px(hx), px(hy), look === "gauntlet" ? 12 : 9, look === "gauntlet" ? 10 : 8);
    ctx.fillStyle = hi;
    ctx.fillRect(px(hx + 2), px(hy + 1), 3, 3);
    if (look === "claws") {
      ctx.fillStyle = "#fff6e4";
      for (let i = 0; i < 3; i++) ctx.fillRect(px(hx + 8 + (frame > 6 ? 6 : 0)), px(hy + i * 3), 8, 2);
    }
    if (pose === "attack" && frame >= 4 && frame <= 8) {
      ctx.fillStyle = hi;
      ctx.fillRect(px(hx + 10), px(hy + 2), 8, 2);
      ctx.fillRect(px(hx + 14), px(hy - 2), 2, 8);
    }
  }
  if (look === "hammer" || look === "shield" || look === "lasso" || look === "lantern" || look === "bolt" || look === "web") {
    const wx = x + w * 0.7 + swing;
    const wy = y + h * 0.28;
    if (look === "hammer") {
      ctx.fillStyle = "#6b4a2a";
      ctx.fillRect(px(wx + 4), px(wy), 3, 26);
      ctx.fillStyle = tint;
      ctx.fillRect(px(wx - 2 + (frame > 7 ? -4 : 0)), px(wy - 2), 16, 7);
      ctx.fillStyle = hi;
      ctx.fillRect(px(wx), px(wy), 8, 2);
    } else if (look === "shield") {
      ctx.fillStyle = tint;
      ctx.fillRect(px(x + 2 - (pose === "attack" ? 2 : 0)), px(y + h * 0.32), 12, 22);
      ctx.fillStyle = "#fff6e4";
      ctx.fillRect(px(x + 5), px(y + h * 0.4), 6, 8);
      ctx.fillStyle = "#c4161c";
      ctx.fillRect(px(x + 7), px(y + h * 0.43), 2, 3);
    } else if (look === "lasso") {
      const spin = (pose === "attack" || pose === "cast" || pose === "ult" ? frame : 1) % 4;
      const rad = pose === "attack" ? 10 : 7;
      ctx.fillStyle = tint;
      ctx.fillRect(px(wx + (spin === 0 ? rad : 0)), px(wy), 3, 3);
      ctx.fillRect(px(wx), px(wy + (spin === 1 ? rad : 0)), 3, 3);
      ctx.fillRect(px(wx - (spin === 2 ? rad : 0)), px(wy + 6), 3, 3);
      ctx.fillRect(px(wx + 4), px(wy + (spin === 3 ? rad : 4)), 3, 3);
    } else if (look === "lantern") {
      ctx.fillStyle = ink;
      ctx.fillRect(px(wx), px(wy), 3, 8);
      ctx.fillStyle = tint;
      ctx.fillRect(px(wx - 3), px(wy + 8 - (pose === "cast" || pose === "ult" ? 6 : 0)), 9, 10);
      ctx.fillStyle = hi;
      ctx.fillRect(px(wx - 1), px(wy + 10), 4, 4);
    } else if (look === "bolt") {
      ctx.fillStyle = tint;
      const streak = pose === "walk" ? 10 + step * 4 : pose === "attack" ? 14 : 4;
      ctx.fillRect(px(x - streak), px(y + h * 0.55), streak, 3);
      ctx.fillStyle = hi;
      ctx.fillRect(px(x - streak), px(y + h * 0.55), 4, 2);
    } else if (look === "web") {
      ctx.fillStyle = tint;
      ctx.fillRect(px(x + w * 0.3), px(y + h * 0.45), px(w * 0.4), 1);
      ctx.fillRect(px(x + w * 0.48), px(y + h * 0.32), 1, px(h * 0.28));
      if (pose === "attack") {
        ctx.fillRect(px(x + w * 0.8 + swing), px(y + h * 0.3), 10, 1);
        ctx.fillRect(px(x + w * 0.9 + swing), px(y + h * 0.22), 1, 12);
      }
    }
  }
  if (look === "ear") {
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.18), px(y + h * 0.16 + (pose === "walk" ? step : 0)), 5, 7);
    ctx.fillRect(px(x + w * 0.7), px(y + h * 0.16 + (pose === "walk" ? -step : 0)), 5, 7);
    ctx.fillStyle = hi;
    ctx.fillRect(px(x + w * 0.2), px(y + h * 0.18), 2, 2);
  }
  if (look === "mouse" || look === "minnie" || look === "felix" || look === "grin") {
    ctx.fillStyle = look === "minnie" ? tint : ink;
    ctx.fillRect(px(x + w * 0.28), px(y - 4 - (pose === "idle" ? frame % 3 : 0)), 8, 8);
    ctx.fillRect(px(x + w * 0.55), px(y - 4 - (pose === "idle" ? (frame + 1) % 3 : 0)), 8, 8);
    if (look === "minnie") {
      ctx.fillStyle = tint;
      ctx.fillRect(px(x + w * 0.62), px(y - 8), 6, 4);
    }
    if (look === "felix" || look === "grin") {
      ctx.fillStyle = "#fff6e4";
      ctx.fillRect(px(x + w * 0.38), px(y + h * 0.22), px(w * 0.24), 3);
    }
    if (look === "felix" && pose === "walk") {
      ctx.fillStyle = ink;
      ctx.fillRect(px(x + w - 4 + (step ? 6 : -2)), px(y + h * 0.4), 8, 3);
    }
  }
  if (look === "pooh") {
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.3), px(y - 2), 8, 6);
    ctx.fillRect(px(x + w * 0.55), px(y - 2), 8, 6);
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(px(x + w * 0.7 + (pose === "walk" ? step * 2 : 0)), px(y + h * 0.55), 8, 7);
  }
  if (look === "tigger") {
    ctx.fillStyle = tint;
    ctx.fillStyle = ink;
    for (let i = 0; i < 4; i++) ctx.fillRect(px(x + w * 0.3), px(y + h * 0.35 + i * 6 + (pose === "walk" ? bobHop(frame) : 0)), px(w * 0.4), 2);
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.25), px(y + h * 0.3), px(w * 0.5), 3);
    if (pose === "walk") {
      ctx.fillStyle = lo;
      ctx.fillRect(px(x + 8), px(y + h - 4 - bobHop(frame) * 2), 4, 3);
    }
  }
  if (look === "alice" || look === "oz") {
    ctx.fillStyle = look === "oz" ? "#7ec8ff" : tint;
    ctx.fillRect(px(x + w * 0.3), px(y + 2), px(w * 0.4), 3);
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.22), px(y + h * 0.48), px(w * 0.56), px(h * 0.16));
    if (look === "oz") {
      ctx.fillStyle = "#fff6e4";
      ctx.fillRect(px(x + w * 0.28), px(y + h * 0.78 + step), 6, 3);
      ctx.fillRect(px(x + w * 0.58), px(y + h * 0.78 + (step ? 0 : 1)), 6, 3);
    }
  }
  if (look === "neckbolts") {
    ctx.fillStyle = tint;
    ctx.fillRect(px(x + w * 0.16), px(y + h * 0.24), 6, 4);
    ctx.fillRect(px(x + w * 0.74), px(y + h * 0.24), 6, 4);
    ctx.fillStyle = hi;
    ctx.fillRect(px(x + w * 0.18), px(y + h * 0.25), 2, 2);
    ctx.fillRect(px(x + w * 0.76), px(y + h * 0.25), 2, 2);
  }

  if (pose === "walk") {
    ctx.fillStyle = lo;
    const dust = look === "bolt" || look === "tigger" ? 4 : 2;
    ctx.fillRect(px(x + w * 0.3 - step * 3), px(y + h - 3), dust, 2);
    ctx.fillRect(px(x + w * 0.6 + step * 3), px(y + h - 2), dust, 2);
  }
  if ((pose === "cast" || pose === "ult") && frame >= 4) {
    ctx.fillStyle = pose === "ult" ? "#ffe08a" : hi;
    const n = pose === "ult" ? 6 : 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + frame;
      ctx.fillRect(px(x + w * 0.5 + Math.cos(a) * 16), px(y + h * 0.2 + Math.sin(a) * 8), 2, 2);
    }
  }
  ctx.restore();
}

function bobHop(frame: number): number {
  return frame % 4 === 1 ? 3 : 0;
}

/** Every shelf skin resolves, and twins on one hero do not share a signature. */
export function skinMotionAudit(): string[] {
  const problems: string[] = [];
  const sig = (id: string) => {
    const m = skinMotion(id);
    return m ? Object.values(m).join(",") : "";
  };
  for (const skin of DLC) {
    if (!skinMotion(skin.id)) problems.push(`missing ${skin.id}`);
  }
  const groups = new Map<string, string[]>();
  for (const skin of DLC) {
    const list = groups.get(skin.hero) ?? [];
    list.push(skin.id);
    groups.set(skin.hero, list);
  }
  for (const [hero, ids] of groups) {
    const seen = new Map<string, string>();
    for (const id of ids) {
      const s = sig(id);
      const prev = seen.get(s);
      if (prev) problems.push(`same motion ${hero} ${prev} ${id}`);
      else seen.set(s, id);
    }
  }
  return problems;
}
