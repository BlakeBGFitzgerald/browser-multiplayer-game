/**
 * Stun reaction for every hero. Death still wins. The chair stays a chair.
 * The push is one step, not a physics step.
 */

/** Pixels shoved back when a stun first lands. */
export const STUN_PUSH = 42;

/** Non-zero for the whole stun. The draw multiplies this by a sine. */
export function stunShakeAmount(stun: number): number {
  if (!(stun > 0)) return 0;
  return 2.6;
}

export function stunIsHeavy(role: string | undefined): boolean {
  return !!role && /tank/i.test(role);
}

/** No kit stands up out of a stun. Wheelchair heroes included. */
export function stunStandsUp(_id: string): boolean {
  return false;
}

export type StunPose = {
  x: number;
  y: number;
  rot: number;
  /** Rock around the seat. The chair is not detached. */
  upper: boolean;
  standUp: boolean;
};

export function stunPose(input: {
  stun: number;
  time: number;
  wheelchair: boolean;
  heavy: boolean;
}): StunPose {
  const standUp = false;
  const upper = input.wheelchair;
  if (!(input.stun > 0)) return { x: 0, y: 0, rot: 0, upper, standUp };
  const scale = input.heavy ? 1.35 : 1;
  const amp = stunShakeAmount(input.stun) * scale;
  const wobble = Math.sin(input.time * 46);
  const wobble2 = Math.sin(input.time * 33 + 0.7);
  if (upper) {
    return { x: 0, y: 0, rot: wobble * 0.08 * scale, upper, standUp };
  }
  return {
    x: wobble * amp,
    y: wobble2 * amp * 0.55,
    rot: wobble * 0.05 * scale,
    upper,
    standUp,
  };
}

/**
 * One step away from the stun source.
 * With no source, or the same point, step backward along facing.
 */
export function stunPushVector(
  facing: number,
  self: { x: number; y: number },
  source?: { x: number; y: number } | null,
): { x: number; y: number } {
  let dx = 0;
  let dy = 0;
  if (source && (source.x !== self.x || source.y !== self.y)) {
    dx = self.x - source.x;
    dy = self.y - source.y;
  } else {
    dx = -Math.cos(facing);
    dy = -Math.sin(facing);
  }
  const n = Math.hypot(dx, dy) || 1;
  return { x: (dx / n) * STUN_PUSH, y: (dy / n) * STUN_PUSH };
}
