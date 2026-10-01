import { handleOf } from "./handles";

export type Seat = {
  team: "maga" | "antifa" | "spec";
  color: string;
  hex: string;
  name: string;
  status: "YOU" | "OPEN" | "JOINED" | "BOT";
  acted: number;
  reserved?: boolean;
};

export type ChatKind = "talk" | "type" | "sys";

export type ChatLine = { who: string; text: string; sys?: boolean; kind?: ChatKind; channel?: "team" | "all" };

const MAGA: { color: string; hex: string }[] = [
  { color: "Rally Crimson", hex: "#c81e1e" },
  { color: "Sodium Gold", hex: "#d4a017" },
  { color: "Parade Sand", hex: "#c4a574" },
  { color: "Lawn Kelly", hex: "#3fa34a" },
  { color: "Civic Blue", hex: "#2f6fbf" },
];

const ANTIFA: { color: string; hex: string }[] = [
  { color: "Quad Teal", hex: "#2aa7a1" },
  { color: "Smoke Slate", hex: "#8a8f96" },
  { color: "Torch Orange", hex: "#e26a21" },
  { color: "Zine Violet", hex: "#7a4cc4" },
  { color: "Ice Cyan", hex: "#6fd3e0" },
];

/** Five gallery seats. Seat 0 stays open for a paying spectator; NPCs fill the rest. */
export const SPEC_SEATS = 5;
/** Ten on the field. @blake and @lilhooligan sit campus and swap MAGA/Antifa each game. */
export const MATCH_SEATS = 10;
export const PLAYERS_PER_TEAM = 5;
export const CAMPUS_BLAKE = "@blake";
export const CAMPUS_LIL = "@lilhooligan";
export const CAMPUS = CAMPUS_LIL;
export const CAMPUS_ANTIFA = CAMPUS_LIL;

const SPEC: { color: string; hex: string }[] = [
  { color: "Rail One", hex: "#8a7a5a" },
  { color: "Rail Two", hex: "#6e5c3a" },
  { color: "Press Box", hex: "#c4a574" },
  { color: "Bleacher", hex: "#9a8a6a" },
  { color: "Camera Deck", hex: "#5a5348" },
];

export function emptySeats(): Seat[] {
  return [
    ...MAGA.map((c, i) => ({
      team: "maga" as const,
      ...c,
      name: i === 0 ? "You" : c.color,
      status: i === 0 ? ("YOU" as const) : ("OPEN" as const),
      acted: 0,
      reserved: false,
    })),
    ...ANTIFA.map((c) => ({
      team: "antifa" as const,
      ...c,
      name: c.color,
      status: "OPEN" as const,
      acted: 0,
      reserved: false,
    })),
  ];
}

export function emptySpecSeats(): Seat[] {
  return SPEC.slice(0, SPEC_SEATS).map((c) => ({
    team: "spec" as const,
    ...c,
    name: c.color,
    status: "OPEN" as const,
    acted: 0,
  }));
}

export const JOIN_SCRIPT: { at: number; seat: number; name: string; chat?: string }[] = [
  { at: 1.6, seat: 9, name: "[BRB] BikeLock", chat: "Need a 4." },
  { at: 2.4, seat: 7, name: "[WPP] ZineKid", chat: "mid?" },
  { at: 3.6, seat: 5, name: "[BRB] SprayCan" },
  { at: 4.8, seat: 2, name: "[RC] Stickers" },
];

/** Other paying spectators type. They never Talk. */
export const SPEC_SCRIPT: { at: number; seat: number; name: string; chat?: string }[] = [
  { at: 1.3, seat: 1, name: "[SPEC] Bleachers", chat: "no mic up here. typing." },
  { at: 2.6, seat: 2, name: "[SPEC] QuadCam", chat: "dc mid looking messy" },
  { at: 4.4, seat: 3, name: "[SPEC] PressBox", chat: "seattle fountain is loud from the bowl" },
  { at: 6.2, seat: 4, name: "[SPEC] Camera", chat: "gg from the stands" },
];

export function joinedCount(seats: Seat[]): number {
  return seats.filter((s) => s.status !== "OPEN").length;
}

export function specCount(specs: Seat[]): number {
  return specs.filter((s) => s.status !== "OPEN").length;
}

export function isCampusSeat(seat: Seat): boolean {
  return !!seat.reserved;
}

export function campusPair(blakeMaga: boolean): { maga: string; antifa: string } {
  return blakeMaga
    ? { maga: CAMPUS_BLAKE, antifa: CAMPUS_LIL }
    : { maga: CAMPUS_LIL, antifa: CAMPUS_BLAKE };
}

export function campusTeam(blakeMaga: boolean): "maga" | "antifa" {
  return blakeMaga ? "antifa" : "maga";
}

export function campusName(team: "maga" | "antifa", blakeMaga: boolean): string {
  return campusPair(blakeMaga)[team];
}

export function campusSides(blakeMaga: boolean): { maga: string; antifa: string } {
  return campusPair(blakeMaga);
}

function youHolds(seats: Seat[], name: string): boolean {
  return seats.some((s) => s.status === "YOU" && handleOf(s.name) === handleOf(name));
}

function ensureCampus(seats: Seat[], team: "maga" | "antifa", name: string, prefer: number, youName: string): void {
  const teamSeats = seats.filter((s) => s.team === team);
  const held = seats.find((s) => s.status !== "OPEN" && handleOf(s.name) === handleOf(name));
  if (held) {
    held.reserved = held.status !== "YOU";
    return;
  }
  if (youHolds(seats, name) || (handleOf(youName) === handleOf(name) && seats.some((s) => s.status === "YOU"))) return;
  const preferSeat = teamSeats[prefer];
  const slot = preferSeat?.status === "OPEN" ? preferSeat : teamSeats.find((s) => s.status === "OPEN");
  if (!slot) return;
  slot.status = "JOINED";
  slot.name = name;
  slot.reserved = true;
  slot.acted = 0;
}

/** @blake and @lilhooligan sit campus every match and swap MAGA/Antifa each game. */
export function lockCampus(seats: Seat[], youName = "", blakeMaga = true): void {
  const pair = campusPair(blakeMaga);
  for (const s of seats) {
    if (!s.reserved) continue;
    if (s.team === "maga" || s.team === "antifa") {
      const want = pair[s.team];
      if (s.status !== "YOU" && handleOf(s.name) === handleOf(want)) continue;
    }
    if (s.status === "YOU") {
      s.reserved = false;
      continue;
    }
    s.reserved = false;
    if (s.status === "JOINED") {
      s.status = "OPEN";
      s.name = s.color;
    }
  }
  ensureCampus(seats, "maga", pair.maga, 1, youName);
  ensureCampus(seats, "antifa", pair.antifa, 1, youName);
}

export function restoreCampus(seat: Seat, blakeMaga = true): void {
  if (seat.team === "spec" || !seat.reserved) {
    seat.status = "OPEN";
    seat.name = seat.color;
    seat.reserved = false;
    return;
  }
  const name = campusName(seat.team, blakeMaga);
  if (!name) {
    seat.status = "OPEN";
    seat.name = seat.color;
    seat.reserved = false;
    return;
  }
  seat.status = "JOINED";
  seat.name = name;
  seat.acted = 0;
}

export function rosterWithCampus(
  home: string[],
  away: string[],
  blakeMaga = true,
): { home: string[]; away: string[] } {
  const h = home.slice();
  const a = away.slice();
  while (h.length < PLAYERS_PER_TEAM) h.push(`[AI] MAGA ${h.length}`);
  while (a.length < PLAYERS_PER_TEAM) a.push(`[AI] Antifa ${a.length}`);
  const pair = campusPair(blakeMaga);
  if (!h.some((n) => handleOf(n) === handleOf(pair.maga))) h[1] = pair.maga;
  if (!a.some((n) => handleOf(n) === handleOf(pair.antifa))) a[1] = pair.antifa;
  return { home: h.slice(0, PLAYERS_PER_TEAM), away: a.slice(0, PLAYERS_PER_TEAM) };
}

function isStarName(name: string): boolean {
  const h = handleOf(name);
  return h === "blake" || h === "lilhooligan";
}

/** AI / demo matches. Seats @blake and @lilhooligan on opposite sides. */
export function rosterWithStars(
  home: string[],
  away: string[],
  blakeMaga = true,
): { home: string[]; away: string[] } {
  const magaStar = blakeMaga ? "@blake" : "@lilhooligan";
  const antifaStar = blakeMaga ? "@lilhooligan" : "@blake";
  const h = home.filter((n) => !isStarName(n));
  const a = away.filter((n) => !isStarName(n));
  while (h.length < PLAYERS_PER_TEAM - 1) h.push(`[AI] MAGA ${h.length}`);
  while (a.length < PLAYERS_PER_TEAM - 1) a.push(`[AI] Antifa ${a.length}`);
  h.unshift(magaStar);
  a.unshift(antifaStar);
  return { home: h.slice(0, PLAYERS_PER_TEAM), away: a.slice(0, PLAYERS_PER_TEAM) };
}
