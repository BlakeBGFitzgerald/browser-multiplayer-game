/** Hooli's basic attack. One command, three cracks, one tommy-burst clip. */

/** Crack times inside public/audio/battle/weapons/tommy/tommy_burst.wav. */
export const HOOLI_BURST_AT = [0.018, 0.108, 0.198] as const;

/** Pose window. The gun settles after the third recoil. */
export const HOOLI_BURST_END = 0.3;

/** Split one attack's damage across the burst so the total stays the attack's damage. */
export function burstShares(raw: number): number[] {
  const n = HOOLI_BURST_AT.length;
  const whole = Math.max(0, Math.round(raw));
  const base = Math.floor(whole / n);
  const shares = Array.from({ length: n }, () => base);
  shares[n - 1] = whole - base * (n - 1);
  return shares;
}

/** Attack-pose frame. Aim before the first crack, then recoil with each shot. */
export function hooliBurstFrame(age: number): number {
  const first = HOOLI_BURST_AT[0] ?? 0;
  if (age < first) return 5;
  let local = age;
  for (let i = HOOLI_BURST_AT.length - 1; i >= 0; i--) {
    const at = HOOLI_BURST_AT[i]!;
    if (age >= at) {
      local = age - at;
      break;
    }
  }
  if (local < 0.045) return 9;
  return 6;
}

export function hooliMuzzleOn(age: number): boolean {
  return HOOLI_BURST_AT.some((at) => age >= at && age < at + 0.042);
}
