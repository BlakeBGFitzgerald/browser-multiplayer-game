/**
 * MMA basic punches on the existing swing clock.
 * The visible sequence is a short window, like the rocket raise and the
 * lollipop wave. The rest of the attack cooldown is guard, then walk or idle.
 * Hand choice stays on punchSideForAttack. This file only times the motion.
 */

import { attackSwingPulse } from "./attackLean.ts";
import type { PunchSide } from "./attackPose.ts";

/** Fist meets the target. One pellet, full damage, on the volley clock. */
export const MMA_PUNCH_CONTACT = 0.14;

/** Back in guard. Walk and idle resume after this. */
export const MMA_PUNCH_END = 0.36;

/** Draw-space weight shift at full extension, pixels. 0 in guard. */
export const MMA_WEIGHT_SHIFT = 6;

/** True only while the punch is in the air. Age 0 and the settled clock are guard. */
export function mmaPunchActive(age: number): boolean {
  return age > 0 && age < MMA_PUNCH_END;
}

/**
 * Attack frames 4 through 11 squeezed into the punch window.
 * Contact is frame 7, the arm rig's full extension.
 */
export function mmaPunchFrame(age: number): number {
  if (!(age > 0)) return 4;
  if (age >= MMA_PUNCH_END) return 11;
  const t = age / MMA_PUNCH_END;
  return 4 + Math.min(7, Math.floor(t * 8));
}

/** Same foot-planted lean as a still plate. Left and right are opposite signs. */
export function mmaPunchLeanRadians(side: PunchSide | null, frame: number): number {
  const pulse = attackSwingPulse("attack", frame);
  if (pulse === 0 || !side) return 0;
  const sign = side === "right" ? -1 : 1;
  const mag = side === "hook" ? 0.42 : 0.36;
  return sign * mag * pulse;
}

/** Along the facing. Positive is the left-hand side. 0 when the punch is done. */
export function mmaPunchShift(side: PunchSide | null, frame: number): number {
  const pulse = attackSwingPulse("attack", frame);
  if (pulse === 0 || !side) return 0;
  const sign = side === "right" ? -1 : 1;
  return sign * MMA_WEIGHT_SHIFT * pulse;
}
