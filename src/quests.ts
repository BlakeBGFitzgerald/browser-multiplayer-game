export type QuestKind = "cs" | "kills" | "tower" | "win" | "play";

export type HeatQuest = {
  kind: QuestKind;
  label: string;
  goal: number;
  progress: number;
  paid: boolean;
};

export const QUEST_COIN = 40;
export const SWEEP_COIN = 50;
export const WIN_COIN = 48;
export const LOSS_COIN = 16;
export const FIRST_WIN_COIN = 32;
export const STREAK_COIN = 12;
export const STREAK_CAP = 5;

const POOL: Array<{ kind: QuestKind; label: string; goal: number }> = [
  { kind: "cs", label: "Last-hit 12 creeps", goal: 12 },
  { kind: "kills", label: "Get 2 hero kills", goal: 2 },
  { kind: "tower", label: "Take a tower", goal: 1 },
  { kind: "win", label: "Win a match", goal: 1 },
  { kind: "play", label: "Play 2 matches", goal: 2 },
];

function daySeed(day: string): () => number {
  let s = 2166136261;
  for (let i = 0; i < day.length; i++) s = Math.imul(s ^ day.charCodeAt(i), 16777619);
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822519);
    s = Math.imul(s ^ (s >>> 13), 3266489917);
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function rollQuests(day: string): HeatQuest[] {
  const rng = daySeed(day);
  const pool = POOL.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = a;
  }
  return pool.slice(0, 3).map((q) => ({ ...q, progress: 0, paid: false }));
}

export function cleanQuests(raw: HeatQuest[] | undefined, day: string): HeatQuest[] {
  if (!raw || raw.length !== 3) return rollQuests(day);
  const ok = raw.every((q) => POOL.some((p) => p.kind === q.kind && p.goal === q.goal));
  if (!ok) return rollQuests(day);
  return raw.map((q) => ({
    kind: q.kind,
    label: q.label,
    goal: q.goal,
    progress: Math.max(0, Math.min(q.goal, Math.floor(q.progress) || 0)),
    paid: q.paid === true,
  }));
}

export type MatchHeat = {
  cs: number;
  kills: number;
  towers: number;
  win: boolean;
};

export function tickQuests(quests: HeatQuest[], match: MatchHeat): { quests: HeatQuest[]; coins: number; notes: string[] } {
  const next = quests.map((q) => ({ ...q }));
  const notes: string[] = [];
  let coins = 0;
  for (const q of next) {
    if (q.kind === "cs") q.progress = Math.min(q.goal, q.progress + match.cs);
    if (q.kind === "kills") q.progress = Math.min(q.goal, q.progress + match.kills);
    if (q.kind === "tower") q.progress = Math.min(q.goal, q.progress + match.towers);
    if (q.kind === "win" && match.win) q.progress = Math.min(q.goal, q.progress + 1);
    if (q.kind === "play") q.progress = Math.min(q.goal, q.progress + 1);
    if (q.progress >= q.goal && !q.paid) {
      q.paid = true;
      coins += QUEST_COIN;
      notes.push(`${q.label} · +${QUEST_COIN} coins`);
    }
  }
  if (next.every((q) => q.paid) && notes.length) {
    coins += SWEEP_COIN;
    notes.push(`Daily sweep · +${SWEEP_COIN} coins`);
  }
  return { quests: next, coins, notes };
}

export function streakBonus(streak: number): number {
  return STREAK_COIN * Math.max(0, Math.min(STREAK_CAP, streak) - 1);
}

export function questLine(q: HeatQuest): string {
  return `${q.label} · ${q.progress}/${q.goal}${q.paid ? " · paid" : ""}`;
}
