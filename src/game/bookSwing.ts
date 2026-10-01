/**
 * Boris's red hardcover. The pixels are the book already on his sheet.
 * Idle and walk leave that book where it was painted. Attack lifts it,
 * swings it forward on the existing swing clock, then sets it back.
 */

import { BORIS_H, BORIS_PAL, BORIS_PIX, BORIS_W } from "./borisSheet.ts";

/** Cover index in BORIS_PAL. The sheet's red book, not a new color. */
const COVER = 13;
/** Page-edge index sitting in the same hardcover. */
const EDGE = 8;

export type BookPixel = { x: number; y: number; color: string };

export type BookSwing = { angle: number; reachX: number; reachY: number };

/**
 * The tory suit is the kit whose sheet carries this red book.
 * Other book props stay on their own attack. Not a hero-id list.
 */
export function kitHoldsSwungBook(kit: { prop: string; body: string }): boolean {
  return kit.prop === "book" && kit.body === "tory";
}

/**
 * 1 on the hit frames (swing clock just started), then back to 0.
 * Any pose other than attack stays at 0, so idle and walk do not swing.
 */
export function bookSwingAmount(pose: string, frame: number): number {
  if (pose !== "attack") return 0;
  if (frame <= 6) return 1;
  if (frame >= 11) return 0;
  return (11 - frame) / 5;
}

/**
 * Forward swing on the attack clock. Amount 0 is the painted rest pose.
 * The book stays on the pixel grid: a translation, lifted on the way out.
 */
export function bookSwingMotion(pose: string, frame: number): BookSwing {
  const amount = bookSwingAmount(pose, frame);
  const lift = Math.sin(amount * Math.PI);
  return {
    angle: 0,
    reachX: 40 * amount,
    reachY: -12 * amount - 10 * lift,
  };
}

let pixels: BookPixel[] | null = null;

/** Largest red mass on the Boris sheet, plus the page edge inside that cover. */
export function redBookPixels(): BookPixel[] {
  if (pixels) return pixels;
  const raw = atob(BORIS_PIX);
  const at = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= BORIS_W || y >= BORIS_H) return 255;
    return raw.charCodeAt(y * BORIS_W + x);
  };
  const seen = new Uint8Array(BORIS_W * BORIS_H);
  let best: { x: number; y: number }[] = [];
  for (let y = 0; y < BORIS_H; y++) {
    for (let x = 0; x < BORIS_W; x++) {
      const start = y * BORIS_W + x;
      if (seen[start] || at(x, y) !== COVER) continue;
      const comp: { x: number; y: number }[] = [];
      const stack = [[x, y]];
      seen[start] = 1;
      while (stack.length) {
        const next = stack.pop();
        if (!next) break;
        const cx = next[0] ?? 0;
        const cy = next[1] ?? 0;
        comp.push({ x: cx, y: cy });
        const steps = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ];
        for (const step of steps) {
          const nx = cx + (step[0] ?? 0);
          const ny = cy + (step[1] ?? 0);
          if (nx < 0 || ny < 0 || nx >= BORIS_W || ny >= BORIS_H) continue;
          const ni = ny * BORIS_W + nx;
          if (seen[ni] || at(nx, ny) !== COVER) continue;
          seen[ni] = 1;
          stack.push([nx, ny]);
        }
      }
      if (comp.length > best.length) best = comp;
    }
  }
  let minX = BORIS_W;
  let minY = BORIS_H;
  let maxX = 0;
  let maxY = 0;
  for (const p of best) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const taken = new Set(best.map((p) => p.y * BORIS_W + p.x));
  const extra: { x: number; y: number }[] = [];
  const edge = [...best];
  while (edge.length) {
    const p = edge.pop();
    if (!p) break;
    const steps = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const step of steps) {
      const nx = p.x + (step[0] ?? 0);
      const ny = p.y + (step[1] ?? 0);
      if (nx < minX - 1 || ny < minY - 1 || nx > maxX + 1 || ny > maxY + 1) continue;
      const ni = ny * BORIS_W + nx;
      if (taken.has(ni) || at(nx, ny) !== EDGE) continue;
      taken.add(ni);
      extra.push({ x: nx, y: ny });
      edge.push({ x: nx, y: ny });
    }
  }
  // Page mark and the cover's own outline, only where the book already surrounds them.
  let grew = true;
  while (grew) {
    grew = false;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const ni = y * BORIS_W + x;
        if (taken.has(ni) || at(x, y) === 255) continue;
        let n = 0;
        if (taken.has(ni - 1)) n += 1;
        if (taken.has(ni + 1)) n += 1;
        if (taken.has(ni - BORIS_W)) n += 1;
        if (taken.has(ni + BORIS_W)) n += 1;
        if (n < 3) continue;
        taken.add(ni);
        extra.push({ x, y });
        grew = true;
      }
    }
  }
  for (let y = minY - 1; y <= maxY + 1; y++) {
    for (let x = minX - 1; x <= maxX + 1; x++) {
      if (x < 0 || y < 0 || x >= BORIS_W || y >= BORIS_H) continue;
      const ni = y * BORIS_W + x;
      const idx = at(x, y);
      if (taken.has(ni) || (idx !== 0 && idx !== COVER)) continue;
      let n = 0;
      if (x > 0 && taken.has(ni - 1)) n += 1;
      if (x + 1 < BORIS_W && taken.has(ni + 1)) n += 1;
      if (y > 0 && taken.has(ni - BORIS_W)) n += 1;
      if (y + 1 < BORIS_H && taken.has(ni + BORIS_W)) n += 1;
      if (n < 1) continue;
      taken.add(ni);
      extra.push({ x, y });
    }
  }
  const colorOf = (index: number) => BORIS_PAL[index] ?? BORIS_PAL[COVER] ?? "#a20b11";
  pixels = [...best, ...extra].map((p) => ({ x: p.x, y: p.y, color: colorOf(at(p.x, p.y)) }));
  return pixels;
}

export function bookPivot(book: BookPixel[]): { x: number; y: number } {
  let maxX = 0;
  let minY = BORIS_H;
  let maxY = 0;
  for (const p of book) {
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: maxX, y: (minY + maxY) / 2 };
}

/** Sheet-space place. Idle matches the painted pixel. Attack moves it forward. */
export function placeBookPixel(p: BookPixel, pose: string, frame: number, pivot?: { x: number; y: number }): { x: number; y: number } {
  const origin = pivot ?? bookPivot(redBookPixels());
  const motion = bookSwingMotion(pose, frame);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  const c = Math.cos(motion.angle);
  const s = Math.sin(motion.angle);
  return {
    x: origin.x + motion.reachX + dx * c - dy * s,
    y: origin.y + motion.reachY + dx * s + dy * c,
  };
}

function suitBlue(data: Uint8ClampedArray, i: number): boolean {
  const r = data[i] ?? 0;
  const g = data[i + 1] ?? 0;
  const b = data[i + 2] ?? 0;
  const a = data[i + 3] ?? 0;
  return a > 200 && b > r + 15 && b > g + 10 && b > 80;
}

/**
 * Overlay on the sheet canvas. The body blit stays. Attack covers the resting
 * book with the jacket behind it and draws those same pixels forward.
 * Idle, walk, and cast do not move it.
 */
export function paintSwungBook(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  pose: string,
  frame: number,
): void {
  if (pose !== "attack") return;
  const book = redBookPixels();
  if (!book.length) return;
  const motion = bookSwingMotion(pose, frame);
  const ox = Math.round(originX);
  const oy = Math.round(originY);
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const shot = ctx.getImageData(0, 0, width, height);
  const hidden = new Set(book.map((p) => (oy + p.y) * width + (ox + p.x)));
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const p of book) {
    const x = ox + p.x;
    const y = oy + p.y;
    let fill = "#1c3475";
    let best = 1e9;
    for (let dy = -14; dy <= 14; dy++) {
      for (let dx = -14; dx <= 14; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const key = ny * width + nx;
        if (hidden.has(key)) continue;
        const i = key * 4;
        if (!suitBlue(shot.data, i)) continue;
        const dist = dx * dx + dy * dy;
        if (dist >= best) continue;
        best = dist;
        const r = shot.data[i] ?? 0;
        const g = shot.data[i + 1] ?? 0;
        const b = shot.data[i + 2] ?? 0;
        fill = `rgb(${r},${g},${b})`;
      }
    }
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, 1, 1);
  }
  const shiftX = Math.round(motion.reachX);
  const shiftY = Math.round(motion.reachY);
  for (const p of book) {
    ctx.fillStyle = p.color;
    ctx.fillRect(ox + p.x + shiftX, oy + p.y + shiftY, 1, 1);
  }
  ctx.restore();
}
