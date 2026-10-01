/**
 * Rive Waden's lollipop.
 * The live kit is wild-cezanne. That painter was still the shared procedural
 * placeholder. The plate replaces the picture. Id, stats, abilities, faction,
 * and the DLC flag stay on that kit.
 * One wave per basic attack, on the existing swing clock. Other ids stay still.
 */

export const RIVE_WADEN_ID = "wild-cezanne";

export const RIVE_WADEN_PLATE = "/art/heroes/rive-waden.png";
export const RIVE_WADEN_BODY = "/art/heroes/rive-waden-body.png";
export const RIVE_WADEN_POP = "/art/heroes/rive-waden-pop.png";

/** Stick grip, as fractions of the plate. Feet are the bottom edge. */
export const RIVE_WADEN_GRIP = { x: 0.321, y: 0.38 };

/** Peak tilt of the candy, radians. Idle is 0. */
const WAVE = 0.55;

/**
 * 0 on idle, walk, and cast. Attack frames 4 through 11 are the swing clock:
 * hold, one arc, hold again.
 */
export function lollipopWaveRadians(id: string, pose: string, frame: number): number {
  if (id !== RIVE_WADEN_ID) return 0;
  if (pose !== "attack") return 0;
  const local = Math.max(0, Math.min(7, frame - 4));
  return Math.sin((local / 7) * Math.PI) * WAVE;
}
