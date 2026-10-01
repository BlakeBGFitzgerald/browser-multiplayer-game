import type { Team } from "./map";

const MAGA_TAUNT = ["Hold DC!", "Mall's ours!", "Fall in!", "USA!", "Move up!", "Stand fast!"];
const ANTIFA_TAUNT = ["Bloc up!", "Take Seattle!", "Push mid!", "No gods!", "Hold the Needle!", "Link arms!"];
const MAGA_KILL = ["That's a wrap!", "Stay down!", "DC holds!"];
const ANTIFA_KILL = ["Stay down!", "Seattle takes it!", "Off the mall!"];
const MAGA_CREEP = ["Line!", "Cap!", "Sir!"];
const ANTIFA_CREEP = ["Bloc!", "Move!", "Now!"];

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)] ?? lines[0]!;
}

export function heroTaunt(team: Team): string {
  return pick(team === "home" ? MAGA_TAUNT : ANTIFA_TAUNT);
}

export function heroKillLine(team: Team): string {
  return pick(team === "home" ? MAGA_KILL : ANTIFA_KILL);
}

export function creepBark(team: Team): string {
  return pick(team === "home" ? MAGA_CREEP : ANTIFA_CREEP);
}

export const MAGA_DEATH = "FAKE NEWS, FAKE NEWS!";
export const ANTIFA_DEATH = "You fucking nazi";
