/** Ring-desk copy in a Bruce Buffer cadence. Original lines — not his trademarks. */

export function introScript(magaStar: string, antifaStar: string): string[] {
  return [
    "Ladies and gentlemen!",
    "Live from Washington DC versus Seattle. This is MAGA vs Antifa!",
    `In the crimson corner: MAGA! Washington DC! And ${magaStar}!`,
    `In the teal corner: Antifa! Seattle! And ${antifaStar}!`,
    "Five seats a side. Ten on the field.",
    "FIGHT!",
  ];
}

export const CALL_FIRST_BLOOD = "FIRST BLOOD!";

export function callStreak(n: number): string {
  if (n === 2) return "TWO FOR TWO!";
  if (n === 3) return "HAT TRICK!";
  if (n === 4) return "QUAD STACK!";
  if (n === 5) return "ON FIRE!";
  if (n === 6) return "UNSTOPPABLE!";
  if (n === 7 || n === 10) return "CAMPUS GODLIKE!";
  return "";
}

export function callShutdown(n: number): string {
  return n >= 3 ? `STREAK BROKEN · ${n}` : "";
}

export function callTower(homeFell: boolean, label = "tower"): string {
  return homeFell ? `The MAGA ${label} is down!` : `The Antifa ${label} is down!`;
}

export function callWinner(homeWin: boolean): string {
  return homeWin
    ? "And the winner: MAGA! Washington DC holds!"
    : "And the winner: Antifa! Seattle takes the mall!";
}

export function callConcede(): string {
  return "MAGA conceded! Seattle takes the mall!";
}
