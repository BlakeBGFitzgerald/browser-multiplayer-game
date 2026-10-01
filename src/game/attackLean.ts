/**
 * Basic-attack motion on the existing swing clock.
 * poseFrame maps attack onto frames 4 through 11. The pose flag stays up
 * for the rest of the cooldown and rests on frame 11, so the visible pulse
 * peaks mid-window and is back at 0 there.
 * A still plate cocks around the feet. Kits that already move keep that motion.
 * Alex, Boris, Pheobe, and Hooli stay on their own clocks.
 */

import { bookSwingAmount, kitHoldsSwungBook } from "./bookSwing.ts";
import { DYNASTY_ID, dynastyAttackAmount } from "./dynastyMotion.ts";
import { heroById, isHooliId, isPlayable } from "./heroes.ts";
import { lollipopWaveRadians, RIVE_WADEN_ID } from "./lollipopWave.ts";
import { ALEX_GROANS_ID } from "./nerf.ts";
import { pixelKit } from "./pixelRoster.ts";
import { suppliedCycleCell, suppliedHasAttackCycle, suppliedHeroUrl } from "./suppliedArt.ts";
import { attackLimb, resolveBasicAttack, usesWheelchair, type PunchSide } from "./attackPose.ts";

/** Middle of attack frames 4–11. The shared plate pulse is strongest here. */
export const ATTACK_MOTION_MID_FRAME = 8;

/** Melee still plates swing forward, radians at the peak of the pulse. */
const MELEE_SWING = 0.34;
/** Ranged still plates brace back. */
const RANGED_BRACE = 0.2;
/** Chair or roll gait. A small upper lean. The chair does not grow legs. */
const CHAIR_LEAN = 0.1;

export type AttackMotionSource =
  | "rocket"
  | "book"
  | "lollipop"
  | "burst"
  | "cycle"
  | "sheet"
  | "procedural"
  | "plate";

export type AttackMotion = {
  source: AttackMotionSource;
  /** 0 is rest. Idle, walk, and cast stay at 0. */
  amount: number;
};

/**
 * 0 outside attack, 0 at frame 4 and frame 11, strongest at mid-swing.
 * Same window as the lollipop wave.
 */
export function attackSwingPulse(pose: string, frame: number): number {
  if (pose !== "attack") return 0;
  const local = frame - 4;
  if (local <= 0 || local >= 7) return 0;
  return Math.sin((local / 7) * Math.PI);
}

/**
 * Swing clock is 0 at the hit and 1 when the attack is ready again.
 * The pose stays up through the cooldown, including the frame-11 rest.
 * Ready (1), the fire frame (0), and NaN go back to walk or idle.
 */
export function attackPoseLive(swing: number): boolean {
  return swing > 0 && swing < 1;
}

/** Hooli's rifle kick on the burst frames. Idle is not this. */
export function hooliAttackBody(frame: number): number {
  if (frame <= 5) return 3;
  if (frame <= 7) return 1;
  if (frame <= 9) return -5;
  return -1;
}

/**
 * Sheet body shift on the attack clock. The painter uses this for the jab,
 * the recoil, and the early lean. Other poses stay at 0.
 */
export function sheetAttackParts(
  pose: string,
  frame: number,
  punch: number,
  skinned: boolean,
): { jab: number; recoil: number; lean: number } {
  if (pose !== "attack") return { jab: 0, recoil: 0, lean: 0 };
  const jab =
    frame <= 6
      ? Math.min(skinned ? 12 : 7, 2 + punch)
      : skinned
        ? Math.max(-4, Math.round((2 + punch) * 0.45) - (frame - 7))
        : Math.max(-3, 9 - frame);
  const recoil = frame >= 8 ? -3 : 0;
  const lean = frame <= 7 ? -0.1 : 0;
  return { jab, recoil, lean };
}

export function sheetAttackAmount(pose: string, frame: number, punch = 0, skinned = false): number {
  const parts = sheetAttackParts(pose, frame, punch, skinned);
  return parts.jab + parts.recoil + parts.lean;
}

/** Procedural fist or authored reach. 0 off the attack pose. */
export function proceduralAttackReach(pose: string, frame: number, side: PunchSide | null): number {
  if (pose !== "attack") return 0;
  const t = frame <= 5 ? 0.45 : frame <= 7 ? 1 : Math.max(0, (11 - frame) / 5);
  if (side) return (side === "hook" ? 4 : 3) * t;
  if (frame <= 5) return 2 + Math.min(3, frame);
  if (frame <= 7) return 4;
  return Math.max(1, 9 - frame);
}

export type PlateLeanInput = {
  melee: boolean;
  chair: boolean;
  pose: string;
  frame: number;
  side?: PunchSide | null;
};

/**
 * Radians around the feet. Melee swings forward. Ranged braces back.
 * A chair gets a smaller lean and no step. 0 at idle and at the end of the clock.
 */
export function plateLeanRadians(input: PlateLeanInput): number {
  const pulse = attackSwingPulse(input.pose, input.frame);
  if (pulse === 0) return 0;
  const alternating = input.side === "left" || input.side === "right" || input.side === "hook";
  if (alternating && !input.chair) {
    const sign = input.side === "right" ? -1 : 1;
    const mag = input.side === "hook" ? 0.42 : input.melee ? MELEE_SWING : RANGED_BRACE;
    return sign * mag * pulse;
  }
  const sign = input.melee ? 1 : -1;
  let mag = input.melee ? MELEE_SWING : RANGED_BRACE;
  if (input.chair) mag = CHAIR_LEAN;
  return sign * mag * pulse;
}

/**
 * A supplied still, with no attack cycle and no special motion.
 * Future plates on this path lean. Not a roster list.
 */
export function leansStillPlate(id: string): boolean {
  if (id === DYNASTY_ID) return false;
  if (id === ALEX_GROANS_ID || id === RIVE_WADEN_ID || isHooliId(id)) return false;
  if (kitHoldsSwungBook(pixelKit(id))) return false;
  if (!suppliedHeroUrl(id)) return false;
  if (suppliedHasAttackCycle(id)) return false;
  return true;
}

function readsMelee(id: string): boolean {
  if (isPlayable(id)) return heroById(id).melee;
  const kit = pixelKit(id);
  if (kit.gait === "fight" || kit.body === "shorts" || kit.prop === "glove" || kit.prop === "tape") return true;
  return kit.prop !== "rocket" && kit.prop !== "flask" && kit.prop !== "globe" && kit.prop !== "staff";
}

/** Lean applied in drawHero. 0 unless this id blits a still plate. */
export function stillPlateLeanRadians(id: string, pose: string, frame: number, side: PunchSide | null = null): number {
  if (!leansStillPlate(id)) return 0;
  return plateLeanRadians({
    melee: readsMelee(id),
    chair: usesWheelchair(id),
    pose,
    frame,
    side,
  });
}

function attackSide(id: string): PunchSide | null {
  if (!isPlayable(id)) return null;
  const hero = heroById(id);
  const limb = attackLimb(
    resolveBasicAttack({
      kind: "hero",
      heroId: hero.id,
      wing: hero.wing,
      role: hero.role,
      prop: pixelKit(hero.id).prop,
      melee: hero.melee,
      attackIndex: 0,
    }),
  );
  return limb?.fist ?? null;
}

/**
 * Motion this hero shows on a basic attack.
 * Idle and walk are 0. Attack frame 8 is mid-swing and is not 0.
 */
export function heroAttackMotion(id: string, pose: string, frame: number): AttackMotion {
  if (id === ALEX_GROANS_ID) {
    if (pose !== "attack") return { source: "rocket", amount: 0 };
    const cell = suppliedCycleCell(id, "attack", frame) ?? 0;
    return { source: "rocket", amount: cell + 1 };
  }
  if (kitHoldsSwungBook(pixelKit(id))) {
    return { source: "book", amount: bookSwingAmount(pose, frame) };
  }
  if (id === RIVE_WADEN_ID) {
    return { source: "lollipop", amount: lollipopWaveRadians(id, pose, frame) };
  }
  if (isHooliId(id)) {
    if (pose !== "attack") return { source: "burst", amount: 0 };
    return { source: "burst", amount: hooliAttackBody(frame) };
  }
  if (suppliedHasAttackCycle(id)) {
    if (pose !== "attack") return { source: "cycle", amount: 0 };
    const cell = suppliedCycleCell(id, "attack", frame) ?? 0;
    return { source: "cycle", amount: cell + 1 };
  }
  if (id === DYNASTY_ID) {
    return { source: "plate", amount: dynastyAttackAmount(pose, frame) };
  }
  if (leansStillPlate(id)) {
    return { source: "plate", amount: stillPlateLeanRadians(id, pose, frame, attackSide(id)) };
  }
  const kit = pixelKit(id);
  const procedural = !suppliedHeroUrl(id) && (kit.body === "shorts" || kit.gait === "fight");
  if (procedural) {
    return { source: "procedural", amount: proceduralAttackReach(pose, frame, attackSide(id)) };
  }
  return { source: "sheet", amount: sheetAttackAmount(pose, frame) };
}
