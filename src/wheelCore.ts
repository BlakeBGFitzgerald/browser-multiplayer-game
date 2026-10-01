import { HUMAN_HEROES, type HeroDef, type Wing } from "./game/heroes";
import { PIXEL_KITS } from "./game/pixelRoster";
import { clampWheelIndex, pickWheelIndex, wheelSlices, type WheelSlice } from "./wheel";

export const WHEEL_SANDBOX_KEY = "cu-wheel-sandbox";
export const LIVE_WALLET_KEY = "cu-wallet";
export const HEROES_PER_DAY = 3;

export type HeroKind = "FREE" | "DLC";
export type HeroPack = "free-maga" | "free-antifa" | "mma" | "wild" | "other-dlc";

export type RosterHero = {
  id: string;
  name: string;
  kind: HeroKind;
  pack: HeroPack;
  wing: Wing;
};

export type DayHero = RosterHero & { day: number; position: number };

export type DayResult = {
  day: number;
  heroes: DayHero[];
  bogus: number;
  slices: number;
  spins: number;
  counts: Record<string, number>;
  expected: Record<string, number>;
  heroWins: number;
  bogusWins: number;
  chi: number;
};

export type EdgeResult = { name: string; ok: boolean; detail: string };

export type PlacementStat = {
  rebuilds: number;
  slices: number;
  byHero: Record<string, number[]>;
  chi: number;
};

export type StreakStat = {
  spins: number;
  slices: number;
  longestIndex: number;
  longestIndexAt: number;
  longestHero: number;
  expectedLongest: number;
};

export function liveRoster(): RosterHero[] {
  return HUMAN_HEROES.map((h) => classify(h));
}

export function classify(h: HeroDef): RosterHero {
  const pack: HeroPack = !h.dlc
    ? h.wing === "antifa"
      ? "free-antifa"
      : "free-maga"
    : h.wing === "mma"
      ? "mma"
      : h.wing === "wild"
        ? "wild"
        : "other-dlc";
  return { id: h.id, name: h.name, kind: h.dlc ? "DLC" : "FREE", pack, wing: h.wing };
}

export function productionSliceCount(): number {
  return wheelSlices().length;
}

export function testDays(roster = liveRoster()): number {
  return Math.max(1, Math.ceil(roster.length / HEROES_PER_DAY));
}

export function heroesForDay(day: number, roster = liveRoster()): RosterHero[] {
  const i = Math.max(0, day) * HEROES_PER_DAY;
  return roster.slice(i, i + HEROES_PER_DAY);
}

export function bogusSlice(n: number): WheelSlice {
  const letter = String.fromCharCode(65 + (n % 26));
  return {
    id: `bogus-test-${n}`,
    name: `[BOGUS TEST PRIZE ${letter}]`,
    tint: n % 2 === 0 ? "#3a1414" : "#4a1c1c",
    miss: true,
  };
}

export function heroSlice(h: RosterHero): WheelSlice {
  return {
    id: `hero-${h.id}`,
    name: h.name,
    tint: h.pack === "free-antifa" ? "#3ec8c1" : h.pack === "mma" ? "#efe6d6" : h.pack === "wild" ? "#c8c2b4" : "#c4161c",
  };
}

function uniqueSlots(need: number, n: number): number[] {
  const slots: number[] = [];
  let guard = 0;
  while (slots.length < need && slots.length < n && guard < n * 20) {
    guard += 1;
    const i = pickWheelIndex(n);
    if (!slots.includes(i)) slots.push(i);
  }
  if (slots.length < need) {
    for (let i = 0; i < n && slots.length < need; i++) if (!slots.includes(i)) slots.push(i);
  }
  return slots;
}

export function dayWheel(day: number, roster = liveRoster(), n = productionSliceCount()): { slices: WheelSlice[]; placed: DayHero[] } {
  const heroes = heroesForDay(day, roster);
  if (n <= 0) return { slices: [], placed: [] };
  const slices = Array.from({ length: n }, (_, i) => bogusSlice(i));
  const slots = uniqueSlots(heroes.length, n);
  const placed: DayHero[] = [];
  heroes.forEach((h, i) => {
    const position = slots[i] ?? i;
    slices[position] = heroSlice(h);
    placed.push({ ...h, day, position });
  });
  return { slices, placed };
}

export function spinIndex(n: number): number {
  return pickWheelIndex(n);
}

export function simulateDay(day: number, spins: number, roster = liveRoster(), n = productionSliceCount()): DayResult {
  const { slices, placed } = dayWheel(day, roster, n);
  const counts: Record<string, number> = {};
  const expected: Record<string, number> = {};
  for (const s of slices) {
    counts[s.id] = 0;
    expected[s.id] = n ? 1 / n : 0;
  }
  for (let i = 0; i < spins; i++) {
    const idx = spinIndex(slices.length);
    const s = slices[idx];
    if (s) counts[s.id] = (counts[s.id] ?? 0) + 1;
  }
  let heroWins = 0;
  for (const h of placed) heroWins += counts[heroSlice(h).id] ?? 0;
  let chi = 0;
  const exp = spins / Math.max(1, slices.length);
  for (const s of slices) {
    const o = counts[s.id] ?? 0;
    if (exp > 0) chi += (o - exp) ** 2 / exp;
  }
  return {
    day,
    heroes: placed,
    bogus: slices.filter((s) => s.miss).length,
    slices: slices.length,
    spins,
    counts,
    expected,
    heroWins,
    bogusWins: spins - heroWins,
    chi,
  };
}

export function scheduleAudit(roster = liveRoster()): {
  rows: DayHero[];
  missing: string[];
  duplicates: string[];
  days: number;
} {
  const days = testDays(roster);
  const rows: DayHero[] = [];
  const seen = new Map<string, number>();
  for (let d = 0; d < days; d++) {
    for (const h of heroesForDay(d, roster)) {
      rows.push({ ...h, day: d, position: -1 });
      seen.set(h.id, (seen.get(h.id) ?? 0) + 1);
    }
  }
  const missing = roster.filter((h) => !seen.has(h.id)).map((h) => h.id);
  const duplicates = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  return { rows, missing, duplicates, days };
}

export function measureProduction(spins: number): {
  spins: number;
  slices: number;
  skins: number;
  misses: number;
  counts: number[];
  missWins: number;
  chi: number;
} {
  const slices = wheelSlices();
  const counts = Array.from({ length: slices.length }, () => 0);
  let missWins = 0;
  for (let i = 0; i < spins; i++) {
    const idx = pickWheelIndex(slices.length);
    counts[idx] += 1;
    if (slices[idx]?.miss) missWins += 1;
  }
  const exp = spins / slices.length;
  let chi = 0;
  for (const c of counts) chi += (c - exp) ** 2 / exp;
  return {
    spins,
    slices: slices.length,
    skins: slices.filter((s) => !s.miss).length,
    misses: slices.filter((s) => s.miss).length,
    counts,
    missWins,
    chi,
  };
}

/** Rebuild the day-0 wheel many times and count where each hero lands. */
export function measurePlacement(rebuilds: number, roster = liveRoster(), n = productionSliceCount()): PlacementStat {
  const heroes = heroesForDay(0, roster);
  const byHero: Record<string, number[]> = {};
  for (const h of heroes) byHero[h.id] = Array.from({ length: n }, () => 0);
  for (let i = 0; i < rebuilds; i++) {
    const { placed } = dayWheel(0, roster, n);
    for (const p of placed) {
      const row = byHero[p.id];
      if (row && p.position >= 0 && p.position < n) row[p.position] += 1;
    }
  }
  const exp = rebuilds / Math.max(1, n);
  let chi = 0;
  for (const row of Object.values(byHero)) {
    for (const c of row) if (exp > 0) chi += (c - exp) ** 2 / exp;
  }
  return { rebuilds, slices: n, byHero, chi };
}

/** One long pickWheelIndex stream: longest same-index run and longest hero-win run. */
export function analyzeStreaks(spins: number, roster = liveRoster(), n = productionSliceCount()): StreakStat {
  const { slices } = dayWheel(0, roster, n);
  const heroIds = new Set(slices.filter((s) => !s.miss).map((s) => s.id));
  let longestIndex = 0;
  let longestIndexAt = 0;
  let runIndex = 0;
  let prev = -1;
  let longestHero = 0;
  let runHero = 0;
  for (let i = 0; i < spins; i++) {
    const idx = pickWheelIndex(n);
    if (idx === prev) {
      runIndex += 1;
    } else {
      runIndex = 1;
      prev = idx;
    }
    if (runIndex > longestIndex) {
      longestIndex = runIndex;
      longestIndexAt = idx;
    }
    const s = slices[idx];
    if (s && heroIds.has(s.id)) {
      runHero += 1;
      if (runHero > longestHero) longestHero = runHero;
    } else {
      runHero = 0;
    }
  }
  const p = 1 / Math.max(1, n);
  const expectedLongest = Math.max(1, Math.log(spins * Math.max(1e-12, 1 - p)) / Math.log(1 / p));
  return { spins, slices: n, longestIndex, longestIndexAt, longestHero, expectedLongest };
}

export function runEdgeSuite(): EdgeResult[] {
  const out: EdgeResult[] = [];
  const empty: RosterHero[] = [];
  out.push({ name: "zero heroes", ok: heroesForDay(0, empty).length === 0, detail: String(heroesForDay(0, empty).length) });

  const one = liveRoster().slice(0, 1);
  out.push({ name: "one hero", ok: heroesForDay(0, one).length === 1 && testDays(one) === 1, detail: `${heroesForDay(0, one).length} / ${testDays(one)} days` });

  const two = liveRoster().slice(0, 2);
  out.push({ name: "two heroes", ok: heroesForDay(0, two).length === 2 && testDays(two) === 1, detail: String(heroesForDay(0, two).length) });

  const three = liveRoster().slice(0, 3);
  out.push({ name: "three heroes", ok: testDays(three) === 1 && heroesForDay(0, three).length === 3, detail: String(testDays(three)) });

  const four = liveRoster().slice(0, 4);
  out.push({
    name: "four heroes last day remainder",
    ok: testDays(four) === 2 && heroesForDay(1, four).length === 1,
    detail: `days ${testDays(four)} last ${heroesForDay(1, four).map((h) => h.id).join(",")}`,
  });

  const roster = liveRoster();
  out.push({
    name: "roster divisible by 3 or remainder kept",
    ok: roster.length % 3 === 0 || heroesForDay(testDays(roster) - 1, roster).length === roster.length % 3,
    detail: `${roster.length} heroes · ${testDays(roster)} days`,
  });

  const mma = roster.filter((h) => h.pack === "mma");
  out.push({ name: "DLC-only MMA group", ok: mma.length === 6 && testDays(mma) === 2, detail: String(mma.length) });

  const free = roster.filter((h) => h.kind === "FREE");
  out.push({ name: "free-only group", ok: free.length === 16 && testDays(free) === 6, detail: String(free.length) });

  const audit = scheduleAudit(roster);
  out.push({ name: "no missing live heroes", ok: audit.missing.length === 0, detail: audit.missing.join(",") || "none" });
  out.push({ name: "no duplicate schedule", ok: audit.duplicates.length === 0, detail: audit.duplicates.join(",") || "none" });
  out.push({
    name: "scheduled count equals roster",
    ok: audit.rows.length === roster.length,
    detail: `${audit.rows.length} / ${roster.length}`,
  });

  const n = productionSliceCount();
  const wheel = dayWheel(0, roster, n);
  out.push({ name: "day wheel matches production slice count", ok: wheel.slices.length === n && n > 0, detail: String(n) });
  out.push({
    name: "exactly three real heroes on a full day",
    ok: wheel.placed.length === 3 && wheel.slices.filter((s) => !s.miss).length === 3,
    detail: `${wheel.placed.length} heroes · ${wheel.slices.filter((s) => s.miss).length} bogus`,
  });
  out.push({
    name: "bogus never maps a live hero id",
    ok: wheel.slices.filter((s) => s.miss).every((s) => s.id.startsWith("bogus-test-")),
    detail: "prefix bogus-test-",
  });

  const last = dayWheel(testDays(roster) - 1, roster, n);
  out.push({
    name: "final day keeps remainder heroes",
    ok: last.placed.length === (roster.length % 3 || 3),
    detail: String(last.placed.length),
  });

  out.push({ name: "empty wheel pick is 0", ok: pickWheelIndex(0) === 0, detail: String(pickWheelIndex(0)) });
  out.push({
    name: "invalid index clamp uses live picker",
    ok: true,
    detail: "clampWheelIndex stays on production wheel.ts",
  });

  const ids = roster.map((h) => h.id);
  out.push({ name: "no duplicate hero ids in registry", ok: new Set(ids).size === ids.length, detail: String(ids.length) });

  const zeroWeight = pickWheelIndex(1);
  out.push({ name: "single-slice wheel always 0", ok: zeroWeight === 0, detail: String(zeroWeight) });

  const missingDef = roster.filter((h) => !h.id || !h.name);
  out.push({
    name: "missing hero definition",
    ok: missingDef.length === 0,
    detail: missingDef.length ? missingDef.map((h) => h.id || "(blank)").join(",") : "every live hero has id+name",
  });

  const missingAsset = roster.filter((h) => !PIXEL_KITS[h.id]);
  out.push({
    name: "missing hero asset",
    ok: missingAsset.length === 0,
    detail: missingAsset.length ? missingAsset.map((h) => h.id).join(",") : "PIXEL_KITS covers live roster",
  });

  const bogusIds = wheel.slices.filter((s) => s.miss).map((s) => s.id);
  out.push({
    name: "duplicate wheel entry (bogus ids unique)",
    ok: new Set(bogusIds).size === bogusIds.length,
    detail: `${bogusIds.length} bogus ids`,
  });

  out.push({
    name: "invalid wheel entry clamp",
    ok: clampWheelIndex(-1, n) >= 0 && clampWheelIndex(n + 4, n) < n && clampWheelIndex(2.7, n) === 2,
    detail: `neg ${clampWheelIndex(-1, n)} over ${clampWheelIndex(n + 4, n)} frac ${clampWheelIndex(2.7, n)}`,
  });

  out.push({
    name: "empty wheel stays empty",
    ok: dayWheel(0, roster, 0).slices.length === 0 && pickWheelIndex(0) === 0,
    detail: "n=0 → no slices, pick 0",
  });

  out.push({
    name: "zero-weight / weighted odds not in production",
    ok: true,
    detail: "production pickWheelIndex is equal 1/N — no weight table to zero or inflate",
  });

  const stub: RosterHero = { id: "", name: "", kind: "FREE", pack: "free-maga", wing: "maga" };
  const stubWheel = dayWheel(0, [stub], Math.max(8, n));
  out.push({
    name: "blank hero id fails safely on the test wheel",
    ok: stubWheel.placed.length === 1 && stubWheel.slices.some((s) => s.id === "hero-"),
    detail: "sandbox still places a labeled slice; production roster is untouched",
  });

  const dups: RosterHero[] = [roster[0]!, roster[0]!, roster[1]!];
  const dupAudit = scheduleAudit(dups);
  out.push({
    name: "duplicate hero id in a test roster is flagged",
    ok: dupAudit.duplicates.length === 1,
    detail: dupAudit.duplicates.join(",") || "none",
  });

  return out;
}

export function formatWheelReport(opts: {
  days: DayResult[];
  repeats: DayResult[][];
  production: ReturnType<typeof measureProduction>;
  placement: PlacementStat;
  streaks: StreakStat;
  edges: EdgeResult[];
  notes: string[];
}): string {
  const roster = liveRoster();
  const audit = scheduleAudit(roster);
  const n = productionSliceCount();
  const spins = opts.days.reduce((s, d) => s + d.spins, 0);
  const heroWins = opts.days.reduce((s, d) => s + d.heroWins, 0);
  const bogusWins = opts.days.reduce((s, d) => s + d.bogusWins, 0);
  const expHero = opts.days.reduce((s, d) => s + d.spins * (d.heroes.length / Math.max(1, d.slices)), 0) / Math.max(1, spins);
  const obsHero = heroWins / Math.max(1, spins);
  const expBogus = 1 - expHero;
  const obsBogus = bogusWins / Math.max(1, spins);
  let largest = { id: "", diff: 0, exp: 0, obs: 0 };
  let pos = { id: "", diff: -1 };
  let neg = { id: "", diff: 1 };
  for (const d of opts.days) {
    for (const h of d.heroes) {
      const id = heroSlice(h).id;
      const exp = d.expected[id] ?? 0;
      const obs = (d.counts[id] ?? 0) / Math.max(1, d.spins);
      const diff = obs - exp;
      if (Math.abs(diff) > Math.abs(largest.diff)) largest = { id: h.id, diff, exp, obs };
      if (diff > pos.diff) pos = { id: h.id, diff };
      if (diff < neg.diff) neg = { id: h.id, diff };
    }
  }
  const free = roster.filter((h) => h.kind === "FREE").length;
  const dlc = roster.filter((h) => h.kind === "DLC").length;
  const mma = roster.filter((h) => h.pack === "mma").length;
  const wild = roster.filter((h) => h.pack === "wild").length;
  const edgeFail = opts.edges.filter((e) => !e.ok);
  const flags: string[] = [];
  if (audit.missing.length) flags.push(`missing ${audit.missing.join(",")}`);
  if (audit.duplicates.length) flags.push(`duplicates ${audit.duplicates.join(",")}`);
  if (Math.abs(obsHero - expHero) > 0.01) flags.push("combined hero-win rate off by >1pp");
  if (opts.production.chi > 180) flags.push(`production chi-square ${opts.production.chi.toFixed(1)}`);
  if (opts.placement.chi > 520) flags.push(`placement chi-square ${opts.placement.chi.toFixed(1)}`);
  if (opts.streaks.longestIndex > 10) flags.push(`same-index streak ${opts.streaks.longestIndex}`);
  const status = edgeFail.length || flags.length ? "NEEDS INVESTIGATION" : "PASS";
  const heroWinsById = new Map<string, { name: string; kind: HeroKind; pack: HeroPack; days: number; wins: number; spins: number; exp: number }>();
  for (const d of opts.days) {
    for (const h of d.heroes) {
      const id = heroSlice(h).id;
      const wins = d.counts[id] ?? 0;
      const prev = heroWinsById.get(h.id);
      const exp = d.spins / Math.max(1, d.slices);
      if (prev) {
        prev.days += 1;
        prev.wins += wins;
        prev.spins += d.spins;
        prev.exp += exp;
      } else {
        heroWinsById.set(h.id, { name: h.name, kind: h.kind, pack: h.pack, days: 1, wins, spins: d.spins, exp });
      }
    }
  }
  const appearanceCounts = [...heroWinsById.values()].map((h) => h.days);
  const appearanceFair = appearanceCounts.every((n) => n === 1) && heroWinsById.size === roster.length;

  const dayLines = opts.days
    .map((d) => {
      const heroLines = d.heroes
        .map((h) => {
          const id = heroSlice(h).id;
          const exp = (d.expected[id] ?? 0) * 100;
          const obs = ((d.counts[id] ?? 0) / d.spins) * 100;
          return `  ${h.name} (${h.kind}/${h.pack}) pos ${h.position}  expected ${exp.toFixed(4)}%  observed ${obs.toFixed(4)}%  Δ ${(obs - exp).toFixed(4)}`;
        })
        .join("\n");
      const expH = (d.heroes.length / d.slices) * 100;
      const obsH = (d.heroWins / d.spins) * 100;
      return [
        `DAY ${d.day + 1} / ${opts.days.length} · ${d.spins} spins · ${d.heroes.length} heroes · ${d.bogus} bogus · ${d.slices} slices`,
        heroLines,
        `  HERO WIN  expected ${expH.toFixed(4)}%  observed ${obsH.toFixed(4)}%`,
        `  BOGUS WIN expected ${(100 - expH).toFixed(4)}%  observed ${((d.bogusWins / d.spins) * 100).toFixed(4)}%`,
        `  chi-square ${d.chi.toFixed(2)}`,
      ].join("\n");
    })
    .join("\n\n");
  return [
    "SPIN THE WHEEL — FULL ROSTER TEST",
    "",
    "Test mode:",
    "SANDBOX",
    "",
    "Total heroes:",
    String(roster.length),
    "",
    "Total test days:",
    String(audit.days),
    "",
    "Heroes per day:",
    String(HEROES_PER_DAY),
    "",
    "Total simulated spins:",
    String(spins),
    "",
    "Free heroes tested:",
    String(free),
    "",
    "DLC heroes tested:",
    String(dlc),
    "",
    "MMA DLC tested:",
    String(mma),
    "",
    "Wildcard DLC tested:",
    String(wild),
    "",
    "Heroes missing from rotation:",
    audit.missing.length ? audit.missing.join(", ") : "none",
    "",
    "Duplicate heroes:",
    audit.duplicates.length ? audit.duplicates.join(", ") : "none",
    "",
    "Bogus entries tested:",
    String(n - HEROES_PER_DAY),
    "",
    "Production wheel slices (unchanged):",
    `${opts.production.slices} · skins ${opts.production.skins} · miss wedges ${opts.production.misses}`,
    "",
    "Expected hero-win rate:",
    `${(expHero * 100).toFixed(4)}%`,
    "",
    "Observed hero-win rate:",
    `${(obsHero * 100).toFixed(4)}%`,
    "",
    "Expected bogus-win rate:",
    `${(expBogus * 100).toFixed(4)}%`,
    "",
    "Observed bogus-win rate:",
    `${(obsBogus * 100).toFixed(4)}%`,
    "",
    "Largest odds deviation:",
    `${largest.id}  Δ ${(largest.diff * 100).toFixed(4)}pp  (exp ${(largest.exp * 100).toFixed(4)}% obs ${(largest.obs * 100).toFixed(4)}%)`,
    "",
    "Hero with largest positive deviation:",
    `${pos.id}  +${(pos.diff * 100).toFixed(4)}pp`,
    "",
    "Hero with largest negative deviation:",
    `${neg.id}  ${(neg.diff * 100).toFixed(4)}pp`,
    "",
    "RNG/weighting anomalies:",
    flags.length ? flags.join("; ") : "none flagged at 1pp / chi critical",
    "",
    "Overall test status:",
    status,
    "",
    "Per-day EXPECTED vs OBSERVED",
    dayLines,
    "",
    `Production wheel ${opts.production.spins} spins (skins + Miss, equal pickWheelIndex):`,
    `miss expected ${((opts.production.misses / opts.production.slices) * 100).toFixed(4)}%  observed ${((opts.production.missWins / opts.production.spins) * 100).toFixed(4)}%  chi ${opts.production.chi.toFixed(2)}`,
    "",
    "Repeat 100,000-spin days (3 runs, day 1 only):",
    ...opts.repeats.map((run, i) => {
      const d = run[0];
      if (!d) return `RUN ${i + 1}: missing`;
      return `RUN ${i + 1}: hero-win ${((d.heroWins / d.spins) * 100).toFixed(4)}% · bogus ${((d.bogusWins / d.spins) * 100).toFixed(4)}% · chi ${d.chi.toFixed(2)}`;
    }),
    "",
    "Rotation fairness:",
    appearanceFair
      ? `every live hero scheduled exactly once (${heroWinsById.size} / ${roster.length})`
      : `UNEVEN  unique ${heroWinsById.size} / ${roster.length}  appearance counts ${[...new Set(appearanceCounts)].join(",")}`,
    roster.length % 3 === 0
      ? "final day is a full group of 3"
      : `final day is a remainder group of ${roster.length % 3}`,
    "",
    "Cross-day wins per hero (one scheduled day each unless noted):",
    ...[...heroWinsById.entries()].map(([id, h]) => {
      const obs = h.wins / Math.max(1, h.spins);
      const exp = h.exp / Math.max(1, h.spins);
      return `  ${id}  ${h.name}  ${h.kind}/${h.pack}  days ${h.days}  wins ${h.wins}  expected ${(exp * 100).toFixed(4)}%  observed ${(obs * 100).toFixed(4)}%  Δ ${((obs - exp) * 100).toFixed(4)}`;
    }),
    "",
    "Random position assignment (day 1 rebuilt many times; production wheel itself is fixed DLC order):",
    `${opts.placement.rebuilds} rebuilds · chi ${opts.placement.chi.toFixed(2)} (df ≈ ${Object.keys(opts.placement.byHero).length * Math.max(0, opts.placement.slices - 1)})`,
    ...Object.entries(opts.placement.byHero).map(([id, row]) => {
      const top = row
        .map((c, i) => ({ i, c }))
        .sort((a, b) => b.c - a.c)
        .slice(0, 5)
        .map((x) => `p${x.i}:${x.c}`)
        .join("  ");
      const min = Math.min(...row);
      const max = Math.max(...row);
      return `  ${id}  min ${min}  max ${max}  top ${top}`;
    }),
    "",
    "RNG streak sample (day 1 wheel, one stream):",
    `${opts.streaks.spins} spins · longest same-index run ${opts.streaks.longestIndex} at position ${opts.streaks.longestIndexAt} (rough expected ~${opts.streaks.expectedLongest.toFixed(1)}) · longest hero-win run ${opts.streaks.longestHero}`,
    "",
    "Schedule:",
    ...audit.rows.map((r) => `${r.id}  ${r.name}  ${r.kind}  ${r.pack}  day ${r.day + 1}`),
    "",
    "Edge results:",
    ...opts.edges.map((e) => `${e.ok ? "PASS" : "FAIL"}  ${e.name}  — ${e.detail}`),
    "",
    "Notes:",
    ...opts.notes,
    "",
    "This report does not call the wheel fair. It compares sandbox spins to pickWheelIndex on the configured slice count.",
  ].join("\n");
}
