/** Visual walk blend. Gameplay still uses Unit.moved; this only eases the pose. */
const blends = new Map<number, { v: number; at: number }>();

export function strideBlend(id: number, moving: boolean, time: number, dead: boolean): number {
  if (dead) {
    blends.delete(id);
    return 0;
  }
  const prev = blends.get(id);
  const dt = Math.min(0.05, Math.max(0, time - (prev?.at ?? time)));
  const v = prev?.v ?? 0;
  const next = moving ? Math.min(1, v + dt * 8) : Math.max(0, v - dt * 9);
  blends.set(id, { v: next, at: time });
  return next;
}

export function resetStride(id: number): void {
  blends.delete(id);
}
