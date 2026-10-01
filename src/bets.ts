import type { Team } from "./game/map";

export type BetMarket = "town" | "clock" | "tower";
export type BetRail = "coins" | "mlx";
export type BetStatus = "open" | "won" | "lost" | "void";

export type LiveBet = {
  id: string;
  matchId: string;
  market: BetMarket;
  side: string;
  stake: number;
  rail: BetRail;
  odds: number;
  placed: number;
};

export type BetRecord = LiveBet & {
  status: BetStatus;
  payout: number;
  settled: number;
};

export type BetResult = {
  winner: Team | "";
  clock: number;
  firstTower: Team | "";
};

export const ODDS = 1.9;
export const BET_STAKE = 100;
export const BETS_PER_MATCH = 3;
export const BETS_PER_HOUR = 1;
export const BET_HOUR_MS = 3_600_000;
export const CLOCK_LINE = 480;

export function betHour(at = Date.now()): number {
  return Math.floor(at / BET_HOUR_MS);
}

export function betHourEnd(id = betHour()): number {
  return (id + 1) * BET_HOUR_MS;
}

/** Live slips plus settled (non-void) slips in this UTC hour. */
export function betsInHour(live: LiveBet[], hist: BetRecord[], at = Date.now()): number {
  const h = betHour(at);
  let n = live.filter((b) => betHour(b.placed) === h).length;
  for (const b of hist) {
    if (betHour(b.placed) === h && b.status !== "void") n += 1;
  }
  return n;
}

export function formatClock(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.floor(Math.max(0, sec) % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function payoutOf(stake: number): number {
  return Math.round(stake * ODDS);
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function markets(): { id: BetMarket; label: string; line: string }[] {
  return [
    { id: "town", label: "Match winner", line: "Which town still stands?" },
    { id: "clock", label: "Clock", line: `Under / over ${formatClock(CLOCK_LINE)}` },
    { id: "tower", label: "First tower", line: "Who takes the first tower?" },
  ];
}

export function sides(market: BetMarket): { id: string; label: string }[] {
  if (market === "town") {
    return [
      { id: "home", label: "MAGA · Washington DC" },
      { id: "away", label: "Antifa · Seattle" },
    ];
  }
  if (market === "clock") {
    return [
      { id: "under", label: `Under ${formatClock(CLOCK_LINE)}` },
      { id: "over", label: `Over ${formatClock(CLOCK_LINE)}` },
    ];
  }
  return [
    { id: "home", label: "MAGA takes first tower" },
    { id: "away", label: "Antifa takes first tower" },
  ];
}

export function marketLabel(market: BetMarket): string {
  return markets().find((m) => m.id === market)?.label ?? market;
}

export function sideLabel(market: BetMarket, side: string): string {
  return sides(market).find((s) => s.id === side)?.label ?? side;
}

export function slipLine(bet: LiveBet): string {
  return `${marketLabel(bet.market)} · ${sideLabel(bet.market, bet.side)} · ${bet.stake} ${bet.rail} @ ${bet.odds.toFixed(2)}`;
}

export function betHits(bet: LiveBet, result: BetResult): boolean {
  if (bet.market === "town") return result.winner !== "" && bet.side === result.winner;
  if (bet.market === "clock") {
    if (bet.side === "under") return result.clock < CLOCK_LINE;
    return result.clock >= CLOCK_LINE;
  }
  return result.firstTower !== "" && bet.side === result.firstTower;
}
