import { handleOf } from "./handles";
import { isCampusSeat, type Seat } from "./lobby";

export const IDLE_SECS = 8;
export const VOTE_SECS = 16;
export const MATCH_IDLE = 22;

export type KickVote = {
  name: string;
  yes: string[];
  no: string[];
  need: number;
  start: number;
  pulse: number;
};

export function isIdle(seat: Seat, now: number): boolean {
  if (seat.status !== "JOINED" || isCampusSeat(seat)) return false;
  return now - seat.acted >= IDLE_SECS;
}

export function voters(seats: Seat[], target: string): string[] {
  return seats.filter((s) => s.status !== "OPEN" && s.name !== target).map((s) => s.name);
}

export function voteNeed(seats: Seat[], target: string): number {
  const n = voters(seats, target).length;
  return Math.max(2, Math.floor(n / 2) + 1);
}

export function findIdle(seats: Seat[], raw: string, now: number): Seat | undefined {
  const idle = seats.filter((s) => isIdle(s, now));
  const q = raw.trim().replace(/^@+/u, "").toLowerCase();
  if (!q) return idle[0];
  return (
    idle.find((s) => handleOf(s.name) === q) ??
    idle.find((s) => s.name.toLowerCase().includes(q) || s.color.toLowerCase().includes(q))
  );
}

export function hasVoted(vote: KickVote, who: string): boolean {
  return vote.yes.includes(who) || vote.no.includes(who);
}
