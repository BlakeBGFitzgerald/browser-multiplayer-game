import { CALL_FIRST_BLOOD, callShutdown, callStreak } from "./announce.ts";

/** Desk cues for kill banners the match already shows. One id per on-screen line. */
export const KILL_NOTICE_SOUNDS = {
  "first-blood": "sting-first-blood",
  kill: "hit-kill",
  "two-for-two": "sting-two",
  "hat-trick": "sting-hat",
  "quad-stack": "sting-quad",
  "on-fire": "sting-fire",
  unstoppable: "sting-unstoppable",
  "campus-godlike": "sting-godlike",
  shutdown: "sting-shutdown",
} as const;

export type KillNoticeId = keyof typeof KILL_NOTICE_SOUNDS;

export type KillSoundId = (typeof KILL_NOTICE_SOUNDS)[KillNoticeId];

export type KillSoundPlay = {
  notice: KillNoticeId;
  sound: KillSoundId;
};

const STREAK_RANK: ReadonlyArray<readonly [number, KillNoticeId]> = [
  [2, "two-for-two"],
  [3, "hat-trick"],
  [4, "quad-stack"],
  [5, "on-fire"],
  [6, "unstoppable"],
  [7, "campus-godlike"],
  [10, "campus-godlike"],
];

const STREAK_BY_TEXT = new Map<string, KillNoticeId>();

function remember(line: string, id: KillNoticeId): void {
  const lower = line.trim().toLowerCase();
  if (!lower) return;
  STREAK_BY_TEXT.set(lower, id);
  STREAK_BY_TEXT.set(lower.replace(/[!.]+$/g, "").trim(), id);
}

for (const [n, id] of STREAK_RANK) remember(callStreak(n), id);

function isNoticeId(key: string): key is KillNoticeId {
  return Object.prototype.hasOwnProperty.call(KILL_NOTICE_SOUNDS, key);
}

/** Banner copy, event id, or "STREAK BROKEN · N" → one notice id. */
export function canonicalNotice(notice: string): KillNoticeId | null {
  const raw = notice.trim().toLowerCase();
  if (!raw) return null;
  if (raw.startsWith("streak broken")) return "shutdown";
  const stripped = raw.replace(/[!.]+$/g, "").trim();
  if (stripped === "first blood" || stripped === "first-blood") return "first-blood";
  if (stripped === "kill") return "kill";
  if (stripped === "shutdown") return "shutdown";
  const streak = STREAK_BY_TEXT.get(raw) ?? STREAK_BY_TEXT.get(stripped);
  if (streak) return streak;
  if (isNoticeId(stripped)) return stripped;
  return null;
}

export function soundIdForKillNotice(notice: string): KillSoundId | null {
  const id = canonicalNotice(notice);
  if (!id) return null;
  return KILL_NOTICE_SOUNDS[id];
}

/**
 * Append one play for this notice.
 * The same notice in the same trigger — event id or the banner it shows — does not queue again.
 */
export function queueKillSound(queue: readonly KillSoundPlay[], notice: string): KillSoundPlay[] {
  const next = queue.map((row) => ({ ...row }));
  const id = canonicalNotice(notice);
  if (!id) return next;
  if (next.some((row) => row.notice === id)) return next;
  next.push({ notice: id, sound: KILL_NOTICE_SOUNDS[id] });
  return next;
}

/**
 * The banner that stays on screen for this kill, then one sound.
 * First blood overwrites a streak, and a streak overwrites a shutdown, matching the banner writes.
 * A normal kill with no banner uses the short hit.
 */
export function soundsForKillTrigger(input: {
  firstBlood: boolean;
  streak: number;
  shutdown: number;
}): KillSoundPlay[] {
  const lines: string[] = [];
  const shutdown = Number.isFinite(input.shutdown) ? input.shutdown : 0;
  const streak = Number.isFinite(input.streak) ? input.streak : 0;
  const down = callShutdown(shutdown);
  if (down) lines.push(down);
  const hot = callStreak(streak);
  if (hot) lines.push(hot);
  if (input.firstBlood) lines.push(CALL_FIRST_BLOOD);
  const shown = lines.length ? lines[lines.length - 1]! : "kill";
  return queueKillSound(queueKillSound([], shown), shown);
}
