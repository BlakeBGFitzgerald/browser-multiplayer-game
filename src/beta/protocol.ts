import type { Order } from "../game/input";

/** Wire types for the closed-beta host. The match sim stays in Game. */

export type BetaRole = "player" | "admin";

export type NetEvent = {
  id: number;
  kind: "swing" | "cast" | "death" | "tower";
  heroId: string;
  x: number;
  y: number;
  melee: boolean;
  ult: boolean;
  team: "home" | "away";
};

export type SnapUnit = {
  id: number;
  kind: "hero" | "minion" | "tower" | "ancient";
  team: "home" | "away";
  name: string;
  heroId: string;
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  dead: boolean;
  respawn: number;
  face: number;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold: number;
  items: string[];
  slots?: string[];
  slotCounts?: number[];
  slotCds?: number[];
  cds: number[];
  seat: number;
  color: string;
  skin: string;
  objectiveId: string;
  castT: number;
  castUlt: boolean;
  burstAge: number;
  atk: number;
  period: number;
  ms: number;
  moved: boolean;
  hurtT: number;
  dashMark: number;
  stun: number;
  slow: number;
  shield: number;
  wild: boolean;
  barkT: number;
  lane: string;
  towerTier: string;
};

export type SnapShot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  team: "home" | "away";
  heroId: string;
  color: string;
  ammo: string;
  /** Who fired, so a remote client can pick the sprite. Empty when unknown. */
  source?: string;
};

export type WorldSnap = {
  clock: number;
  phase: "early" | "mid" | "late" | "end";
  shopPhase: "early" | "mid" | "late" | "end";
  shrines: boolean;
  night: boolean;
  warnPit: boolean;
  ended: boolean;
  winner: "home" | "away" | "";
  banner: string;
  feed: string[];
  units: SnapUnit[];
  shots: SnapShot[];
  events: NetEvent[];
};

export type ClientMsg =
  | { t: "auth"; code: string; name: string; token?: string }
  | { t: "order"; order: Order }
  | { t: "ping"; n: number }
  | { t: "leave" }
  | { t: "ready" }
  | { t: "admin"; op: "start" | "stop" };

export type ServerMsg =
  | { t: "deny"; reason: "code" | "full" | "closed" | "bad" }
  | { t: "ok"; role: BetaRole; seat: number; token: string; match: "queue" | "live" | "over" }
  | { t: "queue"; players: number; need: number }
  | {
      t: "start";
      seat: number;
      homeKits: string[];
      awayKits: string[];
      homeNames: string[];
      awayNames: string[];
    }
  | { t: "snap"; snap: WorldSnap }
  | { t: "end"; winner: "home" | "away" | "" }
  | { t: "lobby" }
  | { t: "pong"; n: number };

const MAX_FRAME = 4096;

function num(v: unknown, lo: number, hi: number): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  if (v < lo || v > hi) return null;
  return v;
}

function orderOf(raw: unknown): Order | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.kind === "stop") return { kind: "stop" };
  if (o.kind === "move" || o.kind === "attack-move") {
    const x = num(o.x, -100, 4000);
    const y = num(o.y, -100, 4000);
    if (x == null || y == null) return null;
    return { kind: o.kind, x, y };
  }
  if (o.kind === "attack") {
    const id = num(o.id, 1, 1_000_000);
    if (id == null) return null;
    return { kind: "attack", id: Math.floor(id) };
  }
  if (o.kind === "choose") {
    const x = num(o.x, -100, 4000);
    const y = num(o.y, -100, 4000);
    if (x == null || y == null) return { kind: "choose" };
    return { kind: "choose", x, y };
  }
  if (o.kind === "ability") {
    const slot = num(o.slot, 0, 3);
    const x = num(o.x, -100, 4000);
    const y = num(o.y, -100, 4000);
    if (slot == null) return null;
    return { kind: "ability", slot: Math.floor(slot), x: x ?? undefined, y: y ?? undefined };
  }
  if (o.kind === "buy") {
    if (typeof o.id !== "string" || o.id.length < 1 || o.id.length > 40) return null;
    if (!/^[a-z0-9-]+$/.test(o.id)) return null;
    return { kind: "buy", id: o.id };
  }
  if (o.kind === "bag") {
    const index = num(o.index, 0, 3);
    if (index == null) return null;
    return { kind: "bag", index: Math.floor(index) };
  }
  if (o.kind === "mile" && (o.which === "a" || o.which === "b")) return { kind: "mile", which: o.which };
  return null;
}

/** Accept only known client messages. Competitive fields (damage, gold, xp) are ignored. */
export function parseClientMessage(raw: string): ClientMsg | null {
  if (raw.length > MAX_FRAME) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const m = data as Record<string, unknown>;
  if (m.t === "auth") {
    const code = typeof m.code === "string" ? m.code.slice(0, 80) : "";
    const name = typeof m.name === "string" ? m.name : "";
    const token = typeof m.token === "string" ? m.token.slice(0, 128) : "";
    if (!code && !token) return null;
    return { t: "auth", code, name, token: token || undefined };
  }
  if (m.t === "order") {
    const order = orderOf(m.order);
    if (!order) return null;
    return { t: "order", order };
  }
  if (m.t === "ping") {
    const n = num(m.n, 0, 1e15);
    if (n == null) return null;
    return { t: "ping", n: Math.floor(n) };
  }
  if (m.t === "leave") return { t: "leave" };
  if (m.t === "ready") return { t: "ready" };
  if (m.t === "admin" && (m.op === "start" || m.op === "stop")) return { t: "admin", op: m.op };
  return null;
}
