import { cleanTangledUser, isCampusTangled } from "./tangled-check";

export type TangledRow = {
  user: string;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
};

export type KirkCup = {
  maga: number;
  antifa: number;
  youWins: number;
  youLosses: number;
  kills: number;
  deaths: number;
  assists: number;
};

/** Campus circuit names that sit the Tangled board. Not player claims. @blake logs in when he wants to play. */
export const TANGLED_CIRCUIT: TangledRow[] = [
  { user: "lilhooligan", wins: 11, losses: 3, kills: 78, deaths: 27, assists: 55 },
  { user: "quadpress", wins: 7, losses: 4, kills: 44, deaths: 31, assists: 28 },
  { user: "malloaks", wins: 6, losses: 5, kills: 39, deaths: 36, assists: 33 },
  { user: "elliottbay", wins: 5, losses: 6, kills: 28, deaths: 34, assists: 41 },
  { user: "nightstoop", wins: 4, losses: 6, kills: 22, deaths: 38, assists: 19 },
  { user: "rainierstand", wins: 3, losses: 7, kills: 18, deaths: 41, assists: 24 },
];

export function emptyKirk(): KirkCup {
  return { maga: 0, antifa: 0, youWins: 0, youLosses: 0, kills: 0, deaths: 0, assists: 0 };
}

export function emptyRow(user: string): TangledRow {
  return { user, wins: 0, losses: 0, kills: 0, deaths: 0, assists: 0 };
}

export function leagueKdr(kills: number, deaths: number): string {
  if (deaths <= 0) return kills === 0 ? "0.00" : kills.toFixed(2);
  return (kills / deaths).toFixed(2);
}

export function leaguePts(row: TangledRow): number {
  return row.wins * 3;
}

export function parseKda(line: string): { k: number; d: number; a: number } {
  const p = line.split("/").map((x) => Number.parseInt(x.trim(), 10));
  return { k: Number.isFinite(p[0]) ? p[0]! : 0, d: Number.isFinite(p[1]) ? p[1]! : 0, a: Number.isFinite(p[2]) ? p[2]! : 0 };
}

export function cleanKirk(raw: Partial<KirkCup> | undefined): KirkCup {
  const e = emptyKirk();
  if (!raw) return e;
  return {
    maga: Math.max(0, raw.maga ?? 0),
    antifa: Math.max(0, raw.antifa ?? 0),
    youWins: Math.max(0, raw.youWins ?? 0),
    youLosses: Math.max(0, raw.youLosses ?? 0),
    kills: Math.max(0, raw.kills ?? 0),
    deaths: Math.max(0, raw.deaths ?? 0),
    assists: Math.max(0, raw.assists ?? 0),
  };
}

export function cleanRows(list: TangledRow[] | undefined): TangledRow[] {
  const out: TangledRow[] = [];
  const seen = new Set<string>();
  for (const raw of list ?? []) {
    const user = cleanTangledUser(raw.user);
    if (!user || isCampusTangled(user) || seen.has(user)) continue;
    seen.add(user);
    out.push({
      user,
      wins: Math.max(0, raw.wins || 0),
      losses: Math.max(0, raw.losses || 0),
      kills: Math.max(0, raw.kills || 0),
      deaths: Math.max(0, raw.deaths || 0),
      assists: Math.max(0, raw.assists || 0),
    });
  }
  return out.slice(0, 48);
}

export function sortRows(rows: TangledRow[]): TangledRow[] {
  return [...rows].sort((a, b) => {
    const pts = leaguePts(b) - leaguePts(a);
    if (pts) return pts;
    const wins = b.wins - a.wins;
    if (wins) return wins;
    const kd = Number(leagueKdr(b.kills, b.deaths)) - Number(leagueKdr(a.kills, a.deaths));
    if (kd) return kd;
    return a.user.localeCompare(b.user);
  });
}

export function mergeTangledBoard(saved: string[], played: TangledRow[]): TangledRow[] {
  const map = new Map<string, TangledRow>();
  for (const r of TANGLED_CIRCUIT) map.set(r.user, { ...r });
  for (const raw of saved) {
    const u = cleanTangledUser(raw);
    if (!u || isCampusTangled(u) || map.has(u)) continue;
    map.set(u, emptyRow(u));
  }
  for (const r of played) {
    const u = cleanTangledUser(r.user);
    if (!u || isCampusTangled(u)) continue;
    map.set(u, { ...emptyRow(u), ...r, user: u });
  }
  return sortRows([...map.values()]);
}

export function bumpRow(row: TangledRow, win: boolean, k: number, d: number, a: number): TangledRow {
  return {
    user: row.user,
    wins: row.wins + (win ? 1 : 0),
    losses: row.losses + (win ? 0 : 1),
    kills: row.kills + k,
    deaths: row.deaths + d,
    assists: row.assists + a,
  };
}
