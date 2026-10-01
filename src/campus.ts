export type Clan = { tag: string; name: string; members: number };

export const HOUSE_CLANS: Clan[] = [
  { tag: "RC", name: "Rally Crimson", members: 4 },
  { tag: "BRB", name: "Bike Rack Bloc", members: 6 },
  { tag: "WPP", name: "West Piazza Press", members: 3 },
];

export function clanLabel(c: Clan): string {
  return `[${c.tag}] ${c.name}`;
}

export type Ticket = {
  picks: number[];
  draw: number[];
  hits: number;
  prize: number;
};

/** Quad Lotto is Millix only. */
export const LOTTO_TICKET_MLX = 100_000;

export function drawSix(): number[] {
  const n = Array.from({ length: 40 }, (_, i) => i + 1);
  for (let i = n.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = n[i]!;
    n[i] = n[j]!;
    n[j] = a;
  }
  return n.slice(0, 6).sort((a, b) => a - b);
}

export function lottoPrize(hits: number): number {
  const table = [0, 0, 40_000, 160_000, 500_000, 1_800_000, 8_000_000];
  return table[hits] ?? 0;
}

export function hitCount(picks: number[], draw: number[]): number {
  return picks.filter((n) => draw.includes(n)).length;
}
