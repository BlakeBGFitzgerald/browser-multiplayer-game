import { weaponGripsHand } from "./heroWeapons.ts";
import type { PixelPose } from "./pixelC32";
import type { BodyStyle, Gait, PropStyle } from "./pixelRoster";

/**
 * Running-arm decision for procedural limbs.
 *
 * Wheelchair locomotion is the existing kit config: body "chair" or gait "roll".
 * Ricky (maga-ricky), Stephen Hocking (lw-hocking), and The Legend (wild-legend)
 * set that. No other current kit does, and HeroDef has no separate flag.
 * Plate PNGs and sheet stills keep their own arms; paintArms applies this only
 * when it draws the limbs.
 */

const BOTH_HANDS: ReadonlySet<PropStyle> = new Set(["glove", "tape", "mittens"]);

export type ArmKit = {
  id: string;
  body: BodyStyle;
  gait: Gait;
  prop: PropStyle;
};

export type ArmSwingDecision = {
  id: string;
  /** This arm hangs and swings with the walk cycle. */
  swing: boolean;
  /** This hand keeps the existing prop pose so the weapon does not leave the hand. */
  weaponPriority: boolean;
  usesWheelchair: boolean;
};

/** Chair body or roll gait. The draw loop does not keep a hero id list. */
export function usesWheelchair(kit: ArmKit): boolean {
  return kit.body === "chair" || kit.gait === "roll";
}

/** Gloves, tape, and mittens occupy both hands. Every other prop rides the near hand. */
function handHoldsProp(prop: PropStyle, near: boolean): boolean {
  if (prop === "none") return false;
  if (BOTH_HANDS.has(prop)) return true;
  return near;
}

/**
 * On-foot walk requests the swing. Idle, attack, cast, hurt, and death do not.
 * A wheelchair, a held prop, or a ranged weapon suppresses it for that arm.
 * A one-hand weapon holds the near hand. A two-hand weapon holds both.
 * The free arm of a one-handed hold may still swing. The kit argument is that hero only.
 */
export function runningArmSwing(kit: ArmKit, pose: PixelPose, near: boolean): ArmSwingDecision {
  const wheelchair = usesWheelchair(kit);
  const weaponPriority = handHoldsProp(kit.prop, near) || weaponGripsHand(kit.id, near);
  const movingOnFoot = pose === "walk";
  return {
    id: kit.id,
    swing: movingOnFoot && !wheelchair && !weaponPriority,
    weaponPriority,
    usesWheelchair: wheelchair,
  };
}

/** Fore-aft offset in painter pixels. Opposite arms take opposite signs. Clamped so the hand stays beside the torso. */
export function runningArmOffset(armPhase: number, near: boolean): number {
  const raw = near ? -armPhase : armPhase;
  if (raw > 2) return 2;
  if (raw < -2) return -2;
  return raw === 0 ? 0 : raw;
}

export type RunningArmPose = {
  swing: number;
  shoulderOut: number;
  shoulderLift: number;
  elbowOut: number;
  elbowDrop: number;
  elbowLead: number;
  handOut: number;
  handDrop: number;
};

/** Hang, a small elbow bend, and a shoulder lift. `halfWidth` is the torso half-width in painter pixels. */
export function runningArmPose(armPhase: number, near: boolean, halfWidth: number): RunningArmPose {
  const swing = runningArmOffset(armPhase, near);
  return {
    swing,
    shoulderOut: halfWidth - 2,
    shoulderLift: swing > 0 ? 1 : swing < 0 ? -1 : 0,
    elbowOut: halfWidth + 6,
    elbowDrop: 11,
    elbowLead: swing * 0.45,
    handOut: halfWidth + 7,
    handDrop: 22,
  };
}
