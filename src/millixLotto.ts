import { handleOf } from "./handles";

/** One Millix Hourly draw at the top of every UTC hour. Vacant places roll Millix over. */
export const MLX_HOUR_MS = 3_600_000;
export const MLX_STAKE = 50;
export const MLX_WINNERS = 3;
/** Empty slots in the draw. A blank place has no winner and that share rolls over. */
export const MLX_BLANKS = 10;

/** Other Millix users on the network who stake every hour. */
export const NPC_MILLIX = [
  "nodewalker",
  "fiatleak",
  "quadpay",
  "mlxpulse",
  "clearingdesk",
  "railgold",
  "hourpot",
  "micropay",
  "ledgerfox",
  "stampmill",
  "poolthree",
  "tangledcam",
  "dcnode",
  "seattlemlx",
  "kirkpot",
  "v6lamp",
  "hatdrip",
  "fountainpay",
  "bleachermlx",
  "pressbox",
  "midwarsmlx",
] as const;

export type MlxPlace = {
  name: string;
  place: number;
  prize: number;
};

export type MlxDraw = {
  hour: number;
  pot: number;
  carry: number;
  roll: number;
  winners: MlxPlace[];
};

export type MlxEntry = {
  hour: number;
  paid: boolean;
};

export type MlxPayoutStatus = "escrow" | "sent" | "cleared";

/** One Hourly prize for this locker. Pot sits on the campus node until it pays. */
export type MlxPayout = {
  id: string;
  hour: number;
  place: number;
  prize: number;
  to: string;
  tx: string;
  status: MlxPayoutStatus;
  at: number;
};

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Deterministic display address for another Millix user on the hour. */
export function npcMillixAddr(name: string): string {
  let h = 0x6d4c58;
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619);
  let out = "1";
  let x = h >>> 0;
  for (let i = 0; i < 52; i++) {
    x = Math.imul(x ^ (x >>> 15), 0x85ebca6b) >>> 0;
    out += B58[x % 58]!;
  }
  return out;
}

export function payoutWord(status: MlxPayoutStatus): string {
  if (status === "escrow") return "held in escrow";
  if (status === "sent") return "paid from escrow";
  return "cleared to wallet";
}

export function hourId(at = Date.now()): number {
  return Math.floor(at / MLX_HOUR_MS);
}

export function hourStart(id: number): number {
  return id * MLX_HOUR_MS;
}

export function hourEnd(id: number): number {
  return (id + 1) * MLX_HOUR_MS;
}

export function hourLabel(id: number): string {
  return `${new Date(hourStart(id)).toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function splitPot(pot: number): [number, number, number] {
  const a = Math.round(pot * 0.5);
  const b = Math.round(pot * 0.3);
  const c = pot - a - b;
  return [a, b, c];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sameMillix(a: string, b: string): boolean {
  if (a === b) return true;
  const ha = handleOf(a);
  const hb = handleOf(b);
  return Boolean(ha && hb && ha === hb);
}

export function hourStakers(entered: boolean): number {
  return NPC_MILLIX.length + (entered ? 1 : 0);
}

export function hourPot(entered: boolean, carry = 0): number {
  return hourStakers(entered) * MLX_STAKE + Math.max(0, Math.round(carry));
}

export function placedWinners(draw: MlxDraw): MlxPlace[] {
  return draw.winners.filter((w) => w.name);
}

export function drawHour(hour: number, you?: string, carry = 0): MlxDraw {
  const pool: string[] = [...NPC_MILLIX];
  if (you) pool.push(you);
  for (let i = 0; i < MLX_BLANKS; i++) pool.push("");
  const rng = mulberry32(hour ^ 0x4d4c58);
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = t;
  }
  const pot = hourPot(Boolean(you), carry);
  const prizes = splitPot(pot);
  const winners = [0, 1, 2].map((i) => ({
    name: copy[i] ?? "",
    place: i + 1,
    prize: prizes[i]!,
  }));
  const roll = winners.filter((w) => !w.name).reduce((sum, w) => sum + w.prize, 0);
  return { hour, pot, carry: Math.max(0, Math.round(carry)), roll, winners };
}

export function placeWord(place: number): string {
  if (place === 1) return "1st";
  if (place === 2) return "2nd";
  return "3rd";
}
