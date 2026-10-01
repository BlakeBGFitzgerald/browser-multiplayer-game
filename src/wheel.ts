import { DLC } from "./dlc";

/** Coins if the wheel lands a skin already in the locker. */
export const WHEEL_OWNED_COINS = 80;

export type WheelSlice = {
  id: string;
  name: string;
  tint: string;
  miss?: boolean;
};

export function campusDay(at = Date.now()): string {
  const d = new Date(at);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** True after this locker has already used today’s free spin. */
export function wheelLocked(day: string, done: boolean, at = Date.now()): boolean {
  return done === true && day === campusDay(at);
}

export function msUntilNextCampusDay(at = Date.now()): number {
  const d = new Date(at);
  d.setHours(24, 0, 0, 0);
  return Math.max(0, d.getTime() - at);
}

export function wheelWaitLabel(at = Date.now()): string {
  const s = Math.max(0, Math.ceil(msUntilNextCampusDay(at) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function missSlice(n: number): WheelSlice {
  return {
    id: `miss-${n}`,
    name: "Miss",
    tint: n % 2 === 0 ? "#2a1c14" : "#3d2818",
    miss: true,
  };
}

/** Prize skins with a Miss wedge after every two, so about one spin in three pays nothing. */
export function wheelSlices(): WheelSlice[] {
  const skins: WheelSlice[] = DLC.map((s) => ({ id: s.id, name: s.name, tint: s.tint }));
  const out: WheelSlice[] = [];
  let misses = 0;
  for (let i = 0; i < skins.length; i++) {
    out.push(skins[i]!);
    if (i % 2 === 1) out.push(missSlice(misses++));
  }
  if (skins.length % 2 === 1) out.push(missSlice(misses));
  return out;
}

export function isWheelMiss(slice: WheelSlice | undefined): boolean {
  return !!slice?.miss;
}

export function pickWheelIndex(n: number): number {
  if (n <= 0) return 0;
  return Math.floor(Math.random() * n);
}

/** Stale pending indexes from an older wheel still have to land on a real slice. */
export function clampWheelIndex(index: number, n: number): number {
  if (n <= 0) return 0;
  if (!Number.isFinite(index) || index < 0 || index >= n) return pickWheelIndex(n);
  return Math.floor(index);
}

export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}

/** Positive rotation so slice `index` sits under the top pointer. */
export function wheelStop(index: number, slices: number, turns = 6): number {
  const n = Math.max(1, slices);
  const arc = (Math.PI * 2) / n;
  return turns * Math.PI * 2 - (index * arc + arc / 2);
}

function sliceInk(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return "#070604";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return l > 0.55 ? "#070604" : "#efe6d6";
}

export function drawWheel(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  angle: number,
  slices: WheelSlice[],
): void {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy) - 6;
  const n = Math.max(1, slices.length);
  const arc = (Math.PI * 2) / n;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  for (let i = 0; i < n; i++) {
    const s = slices[i]!;
    const a0 = -Math.PI / 2 + i * arc;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, a0, a0 + arc);
    ctx.closePath();
    ctx.fillStyle = s.tint;
    ctx.fill();
    if (s.miss) {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(201,162,74,0.4)";
      ctx.lineWidth = 1.2;
      for (let x = -r; x <= r; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, -r);
        ctx.lineTo(x + r, r);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, a0, a0 + arc);
    ctx.closePath();
    ctx.strokeStyle = s.miss ? "#c9a24a" : "#070604";
    ctx.lineWidth = s.miss ? 1.5 : 2;
    ctx.stroke();
    ctx.save();
    ctx.rotate(a0 + arc / 2);
    ctx.fillStyle = s.miss ? "#c9a24a" : sliceInk(s.tint);
    const tiny = n > 24;
    const tight = n > 16;
    ctx.font = tiny
      ? "700 8px 'IBM Plex Mono', ui-monospace, monospace"
      : tight
        ? "700 9px 'IBM Plex Mono', ui-monospace, monospace"
        : "700 11px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const cap = tiny ? 9 : tight ? 12 : 16;
    const raw = s.miss ? "MISS" : s.name;
    const label = raw.length > cap ? `${raw.slice(0, cap - 1)}…` : raw;
    ctx.fillText(label, r - 14, 0);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fillStyle = "#120f0b";
  ctx.fill();
  ctx.strokeStyle = "#c9a24a";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#c9a24a";
  ctx.font = "18px Anton, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FREE", 0, 1);
  ctx.restore();
}
