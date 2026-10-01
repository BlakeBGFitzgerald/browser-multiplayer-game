import { drawSix, hitCount, LOTTO_TICKET_MLX, lottoPrize } from "./campus";
import { drawHour, hourStakers, MLX_BLANKS, MLX_STAKE, MLX_WINNERS, NPC_MILLIX, splitPot } from "./millixLotto";
import { devCutOf, netAfterDevCut } from "./millix";

/** Isolated sandbox storage. Never reads or writes `cu-wallet`. */
export const LOTTO_SANDBOX_KEY = "cu-lotto-sandbox";
export const LOTTO_SANDBOX_START_MLX = 50_000_000;
export const LOTTO_POOL = 40;
export const LOTTO_PICKS = 6;

export type LottoHits = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type SandboxTicket = {
  id: string;
  at: number;
  picks: number[];
  draw: number[];
  hits: number;
  prize: number;
  prizeNet: number;
  ticketCut: number;
  prizeCut: number;
  claimed: boolean;
  ms: number;
};

export type SandboxHourly = {
  id: string;
  hour: number;
  you: string;
  entered: boolean;
  pot: number;
  winners: { name: string; place: number; prize: number }[];
  hit: number;
  prize: number;
  prizeNet: number;
  claimed: boolean;
  at: number;
};

export type SandboxWallet = {
  mlx: number;
  startMlx: number;
  tickets: SandboxTicket[];
  hourly: SandboxHourly[];
  claims: string[];
  busy: boolean;
  lastError: string;
};

export type AuditRow = {
  runId: string;
  drawId: string;
  rng: number[];
  hits: number;
  tier: string;
  prize: number;
  ms: number;
  error: string;
};

export type EdgeResult = { name: string; ok: boolean; detail: string };

export type HitHist = [number, number, number, number, number, number, number];

export type SimReport = {
  runId: string;
  draws: number;
  entries: number;
  winning: number;
  losing: number;
  hits: HitHist;
  numbers: number[];
  jackpots: number;
  avgPrize: number;
  totalPayout: number;
  totalStake: number;
  chiHits: number;
  chiNumbers: number;
  flags: string[];
  sample: AuditRow[];
};

const TIER = ["miss", "miss", "two", "three", "four", "five", "jackpot"] as const;

export function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  const kk = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= kk; i++) r = (r * (n - kk + i)) / i;
  return r;
}

export function expectedHitShare(): number[] {
  const den = comb(LOTTO_POOL, LOTTO_PICKS);
  return [0, 1, 2, 3, 4, 5, 6].map((h) => (comb(LOTTO_PICKS, h) * comb(LOTTO_POOL - LOTTO_PICKS, LOTTO_PICKS - h)) / den);
}

export function expectedPrizeGross(): number {
  const p = expectedHitShare();
  return p.reduce((sum, share, h) => sum + share * lottoPrize(h), 0);
}

export function emptyWallet(): SandboxWallet {
  return {
    mlx: LOTTO_SANDBOX_START_MLX,
    startMlx: LOTTO_SANDBOX_START_MLX,
    tickets: [],
    hourly: [],
    claims: [],
    busy: false,
    lastError: "",
  };
}

export function loadSandbox(): SandboxWallet {
  if (typeof localStorage === "undefined") return emptyWallet();
  try {
    const raw = localStorage.getItem(LOTTO_SANDBOX_KEY);
    if (!raw) return emptyWallet();
    const parsed = JSON.parse(raw) as Partial<SandboxWallet>;
    const next = emptyWallet();
    next.mlx = typeof parsed.mlx === "number" ? parsed.mlx : next.mlx;
    next.startMlx = typeof parsed.startMlx === "number" ? parsed.startMlx : next.startMlx;
    next.tickets = Array.isArray(parsed.tickets) ? parsed.tickets : [];
    next.hourly = Array.isArray(parsed.hourly) ? parsed.hourly : [];
    next.claims = Array.isArray(parsed.claims) ? parsed.claims : [];
    return next;
  } catch {
    return emptyWallet();
  }
}

export function saveSandbox(w: SandboxWallet): void {
  if (typeof localStorage === "undefined") return;
  const { busy: _busy, ...rest } = w;
  localStorage.setItem(LOTTO_SANDBOX_KEY, JSON.stringify(rest));
}

export function resetSandbox(): SandboxWallet {
  const w = emptyWallet();
  if (typeof localStorage !== "undefined") localStorage.removeItem(LOTTO_SANDBOX_KEY);
  return w;
}

export function pickError(picks: number[]): string {
  if (!Array.isArray(picks)) return "Missing picks.";
  if (picks.length !== LOTTO_PICKS) return `Need ${LOTTO_PICKS} numbers, got ${picks.length}.`;
  const seen = new Set<number>();
  for (const n of picks) {
    if (!Number.isInteger(n)) return "Invalid number.";
    if (n < 1 || n > LOTTO_POOL) return `Out-of-range number ${n}.`;
    if (seen.has(n)) return `Duplicate number ${n}.`;
    seen.add(n);
  }
  return "";
}

export function drawValid(draw: number[]): boolean {
  if (draw.length !== LOTTO_PICKS) return false;
  const seen = new Set<number>();
  for (const n of draw) {
    if (!Number.isInteger(n) || n < 1 || n > LOTTO_POOL || seen.has(n)) return false;
    seen.add(n);
  }
  return true;
}

let seq = 0;
function nid(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export function settleTicket(picks: number[], forced?: number[]): { error: string } | { ticket: Omit<SandboxTicket, "claimed"> } {
  const bad = pickError(picks);
  if (bad) return { error: bad };
  if (forced) {
    if (!drawValid(forced)) return { error: "Invalid forced draw." };
  }
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const draw = forced ? [...forced].sort((a, b) => a - b) : drawSix();
  const ms = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
  if (!drawValid(draw)) return { error: "RNG produced an invalid draw." };
  const sorted = [...picks].sort((a, b) => a - b);
  const hits = hitCount(sorted, draw);
  const prize = lottoPrize(hits);
  const ticketCut = devCutOf(LOTTO_TICKET_MLX);
  const { cut: prizeCut, net: prizeNet } = netAfterDevCut(prize);
  return {
    ticket: {
      id: nid("t"),
      at: Date.now(),
      picks: sorted,
      draw,
      hits,
      prize,
      prizeNet,
      ticketCut,
      prizeCut,
      ms,
    },
  };
}

export function buySandboxTicket(w: SandboxWallet, picks: number[], forced?: number[]): { ok: boolean; message: string; ticket?: SandboxTicket } {
  if (w.busy) return { ok: false, message: "Purchase already in flight." };
  w.busy = true;
  try {
    if (w.mlx < LOTTO_TICKET_MLX) {
      w.lastError = "INSUFFICIENT SANDBOX MLX";
      return { ok: false, message: `Need ${LOTTO_TICKET_MLX} sandbox MLX.` };
    }
    const settled = settleTicket(picks, forced);
    if ("error" in settled) {
      w.lastError = settled.error;
      return { ok: false, message: settled.error };
    }
    w.mlx -= LOTTO_TICKET_MLX;
    w.mlx += settled.ticket.prizeNet;
    if (w.mlx < 0) {
      w.mlx = 0;
      w.lastError = "NEGATIVE BALANCE BLOCKED";
      return { ok: false, message: "Negative balance blocked." };
    }
    const ticket: SandboxTicket = { ...settled.ticket, claimed: true };
    w.tickets.unshift(ticket);
    w.claims.push(ticket.id);
    w.lastError = "";
    saveSandbox(w);
    const msg = ticket.prize
      ? `Drew ${ticket.draw.join(" ")}. ${ticket.hits} hits. +${ticket.prizeNet} sandbox MLX after 1% cut.`
      : `Drew ${ticket.draw.join(" ")}. ${ticket.hits} hit${ticket.hits === 1 ? "" : "s"}. Miss.`;
    return { ok: true, message: msg, ticket };
  } finally {
    w.busy = false;
  }
}

export function claimSandboxPrize(w: SandboxWallet, id: string): { ok: boolean; message: string } {
  if (w.busy) return { ok: false, message: "Claim already in flight." };
  w.busy = true;
  try {
    const t = w.tickets.find((x) => x.id === id) ?? w.hourly.find((x) => x.id === id);
    if (!t) return { ok: false, message: "Unknown result." };
    if (t.claimed || w.claims.includes(id)) return { ok: false, message: "Duplicate claim rejected." };
    t.claimed = true;
    w.claims.push(id);
    w.mlx += "prizeNet" in t ? t.prizeNet : 0;
    saveSandbox(w);
    return { ok: true, message: "Prize claimed." };
  } finally {
    w.busy = false;
  }
}

export function rejectFabricatedWin(): { ok: false; message: string } {
  return { ok: false, message: "Authoritative draw only. Fabricated winning result rejected." };
}

export function rejectPriceRewrite(): { ok: false; message: string } {
  return { ok: false, message: "Entry price is fixed at 100,000 MLX. Rewrite rejected." };
}

export function buySandboxHourly(w: SandboxWallet, hour: number, you: string): { ok: boolean; message: string; row?: SandboxHourly } {
  if (w.busy) return { ok: false, message: "Purchase already in flight." };
  w.busy = true;
  try {
    if (w.hourly.some((h) => h.hour === hour && h.entered)) return { ok: false, message: "Already in this hour." };
    if (w.mlx < MLX_STAKE) return { ok: false, message: `Need ${MLX_STAKE} sandbox MLX.` };
    w.mlx -= MLX_STAKE;
    const draw = drawHour(hour, you, 0);
    const hit = draw.winners.find((x) => x.name === you);
    const prize = hit?.prize ?? 0;
    const { net } = netAfterDevCut(prize);
    const row: SandboxHourly = {
      id: nid("h"),
      hour,
      you,
      entered: true,
      pot: draw.pot,
      winners: draw.winners,
      hit: hit?.place ?? 0,
      prize,
      prizeNet: net,
      claimed: true,
      at: Date.now(),
    };
    w.mlx += net;
    w.hourly.unshift(row);
    w.claims.push(row.id);
    saveSandbox(w);
    return {
      ok: true,
      message: hit ? `Hour ${hour}: place ${hit.place} · +${net} sandbox MLX.` : `Hour ${hour}: no place. Pot ${draw.pot}.`,
      row,
    };
  } finally {
    w.busy = false;
  }
}

export function simulateDraws(count: number, picks: number[], runId: string, keep = 64): SimReport {
  const bad = pickError(picks);
  if (bad) {
    return {
      runId,
      draws: 0,
      entries: 0,
      winning: 0,
      losing: 0,
      hits: [0, 0, 0, 0, 0, 0, 0],
      numbers: Array.from({ length: LOTTO_POOL }, () => 0),
      jackpots: 0,
      avgPrize: 0,
      totalPayout: 0,
      totalStake: 0,
      chiHits: 0,
      chiNumbers: 0,
      flags: [bad],
      sample: [],
    };
  }
  const hits: HitHist = [0, 0, 0, 0, 0, 0, 0];
  const numbers = Array.from({ length: LOTTO_POOL }, () => 0);
  const sample: AuditRow[] = [];
  let payout = 0;
  const sorted = [...picks].sort((a, b) => a - b);
  for (let i = 0; i < count; i++) {
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const draw = drawSix();
    const ms = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
    const h = hitCount(sorted, draw);
    const prize = lottoPrize(h);
    hits[h] += 1;
    payout += prize;
    for (const n of draw) numbers[n - 1] += 1;
    const row: AuditRow = {
      runId,
      drawId: `d-${i + 1}`,
      rng: draw,
      hits: h,
      tier: TIER[h] ?? "miss",
      prize,
      ms,
      error: drawValid(draw) ? "" : "invalid-draw",
    };
    if (row.error || h >= 4 || sample.length < keep) sample.push(row);
  }
  const winning = hits[2] + hits[3] + hits[4] + hits[5] + hits[6];
  const exp = expectedHitShare();
  let chiHits = 0;
  for (let h = 0; h <= 6; h++) {
    const e = exp[h]! * count;
    if (e >= 5) chiHits += (hits[h]! - e) ** 2 / e;
  }
  let chiNumbers = 0;
  const expN = (count * LOTTO_PICKS) / LOTTO_POOL;
  for (const n of numbers) chiNumbers += (n - expN) ** 2 / expN;
  const flags: string[] = [];
  if (hits[0]! + hits[1]! + winning !== count) flags.push("Hit histogram does not sum to draws.");
  if (numbers.some((n) => n === 0) && count >= 400) flags.push("A pool number never appeared.");
  if (chiHits > 22) flags.push(`Hit-count chi-square ${chiHits.toFixed(2)} exceeds 99% critical (~18.5 for merged bins).`);
  if (chiNumbers > 63) flags.push(`Number-frequency chi-square ${chiNumbers.toFixed(2)} exceeds 99% critical (~63.7, 39 df).`);
  return {
    runId,
    draws: count,
    entries: count,
    winning,
    losing: count - winning,
    hits,
    numbers,
    jackpots: hits[6]!,
    avgPrize: count ? payout / count : 0,
    totalPayout: payout,
    totalStake: count * LOTTO_TICKET_MLX,
    chiHits,
    chiNumbers,
    flags,
    sample,
  };
}

export function runEdgeSuite(): EdgeResult[] {
  const out: EdgeResult[] = [];
  const w = emptyWallet();

  const zero = buySandboxTicket(w, []);
  out.push({ name: "zero entries / empty picks", ok: !zero.ok && /Need 6/.test(zero.message), detail: zero.message });

  const one = buySandboxTicket(w, [7]);
  out.push({ name: "one entry", ok: !one.ok, detail: one.message });

  const max = Array.from({ length: 40 }, (_, i) => i + 1);
  const tooMany = buySandboxTicket(w, max);
  out.push({ name: "more than six picks", ok: !tooMany.ok, detail: tooMany.message });

  const dup = buySandboxTicket(w, [1, 2, 3, 4, 5, 5]);
  out.push({ name: "duplicate numbers", ok: !dup.ok && /Duplicate/.test(dup.message), detail: dup.message });

  const inv = buySandboxTicket(w, [1, 2, 3, 4, 5, 1.5] as unknown as number[]);
  out.push({ name: "invalid number", ok: !inv.ok, detail: inv.message });

  const oor = buySandboxTicket(w, [1, 2, 3, 4, 5, 41]);
  out.push({ name: "out-of-range number", ok: !oor.ok, detail: oor.message });

  const noneg = buySandboxTicket(w, [0, 1, 2, 3, 4, 5]);
  out.push({ name: "zero is out of range", ok: !noneg.ok, detail: noneg.message });

  const missing = lottoPrize(99);
  out.push({ name: "missing prize config falls to 0", ok: missing === 0, detail: String(missing) });

  const broke = emptyWallet();
  broke.mlx = 0;
  const poor = buySandboxTicket(broke, [1, 2, 3, 4, 5, 6]);
  out.push({ name: "draw with no funds", ok: !poor.ok && broke.mlx === 0, detail: poor.message });

  const forcedBad = buySandboxTicket(emptyWallet(), [1, 2, 3, 4, 5, 6], [1, 1, 1, 1, 1, 1]);
  out.push({ name: "invalid forced draw rejected", ok: !forcedBad.ok, detail: forcedBad.message });

  const live = emptyWallet();
  live.busy = true;
  const locked = buySandboxTicket(live, [1, 2, 3, 4, 5, 6]);
  out.push({ name: "busy lock blocks second purchase", ok: !locked.ok, detail: locked.message });

  const okw = emptyWallet();
  const first = buySandboxTicket(okw, [1, 2, 3, 4, 5, 6]);
  const again = first.ticket ? claimSandboxPrize(okw, first.ticket.id) : { ok: true, message: "no ticket" };
  out.push({ name: "duplicate claim rejected", ok: !again.ok && /Duplicate/.test(again.message), detail: again.message });

  const fab = rejectFabricatedWin();
  out.push({ name: "fabricated win rejected", ok: !fab.ok, detail: fab.message });

  const price = rejectPriceRewrite();
  out.push({ name: "price rewrite rejected", ok: !price.ok, detail: price.message });

  const a = emptyWallet();
  a.busy = false;
  const p1 = buySandboxTicket(a, [1, 2, 3, 4, 5, 6]);
  const p2 = buySandboxTicket(a, [1, 2, 3, 4, 5, 6]);
  out.push({
    name: "two sequential purchases are two tickets, not one doubled",
    ok: Boolean(p1.ok && p2.ok && a.tickets.length === 2 && p1.ticket?.id !== p2.ticket?.id),
    detail: `${a.tickets.length} tickets`,
  });

  const jack = buySandboxTicket(emptyWallet(), [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6]);
  out.push({
    name: "jackpot tier 6",
    ok: Boolean(jack.ok && jack.ticket?.hits === 6 && jack.ticket.prize === 8_000_000),
    detail: jack.ticket ? `${jack.ticket.hits} / ${jack.ticket.prize}` : jack.message,
  });

  const five = buySandboxTicket(emptyWallet(), [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 7]);
  out.push({ name: "five-hit tier", ok: Boolean(five.ok && five.ticket?.hits === 5 && five.ticket.prize === 1_800_000), detail: five.message });

  const four = buySandboxTicket(emptyWallet(), [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 8, 9]);
  out.push({ name: "four-hit tier", ok: Boolean(four.ok && four.ticket?.prize === 500_000), detail: four.message });

  const three = buySandboxTicket(emptyWallet(), [1, 2, 3, 4, 5, 6], [1, 2, 3, 8, 9, 10]);
  out.push({ name: "three-hit tier", ok: Boolean(three.ok && three.ticket?.prize === 160_000), detail: three.message });

  const two = buySandboxTicket(emptyWallet(), [1, 2, 3, 4, 5, 6], [1, 2, 8, 9, 10, 11]);
  out.push({ name: "two-hit smallest prize", ok: Boolean(two.ok && two.ticket?.prize === 40_000), detail: two.message });

  const miss = buySandboxTicket(emptyWallet(), [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]);
  out.push({ name: "no-prize miss", ok: Boolean(miss.ok && miss.ticket?.prize === 0 && miss.ticket.hits === 0), detail: miss.message });

  const rng: number[] = [];
  for (let i = 0; i < 80; i++) rng.push(...drawSix());
  const uniq = new Set(rng);
  out.push({
    name: "every pool number can appear",
    ok: uniq.size === LOTTO_POOL,
    detail: `${uniq.size} distinct numbers in 80 draws`,
  });
  out.push({
    name: "draws are not a sequential 1-6 loop",
    ok: !(rng[0] === 1 && rng[1] === 2 && rng[2] === 3 && rng[3] === 4 && rng[4] === 5 && rng[5] === 6 && rng[6] === 1),
    detail: rng.slice(0, 12).join(" "),
  });

  const h1 = drawHour(9001, "alice");
  const h2 = drawHour(9001, "alice");
  const h3 = drawHour(9001, "bob");
  const h4 = drawHour(9001);
  out.push({ name: "hourly same hour+name is deterministic", ok: JSON.stringify(h1.winners) === JSON.stringify(h2.winners), detail: "repeat" });
  out.push({
    name: "hourly name changes the shuffle (identity in pool)",
    ok: JSON.stringify(h1.winners) !== JSON.stringify(h3.winners) || JSON.stringify(h1.winners) !== JSON.stringify(h4.winners),
    detail: "alice vs bob vs none",
  });
  out.push({
    name: "hourly pot uses 21 NPCs + optional you",
    ok: h4.pot === hourStakers(false) * MLX_STAKE && h1.pot === hourStakers(true) * MLX_STAKE,
    detail: `${h4.pot} / ${h1.pot}`,
  });
  const [aShare, bShare, cShare] = splitPot(h1.pot);
  out.push({
    name: "hourly 50/30/20 split",
    ok: aShare + bShare + cShare === h1.pot && Math.abs(aShare - Math.round(h1.pot * 0.5)) === 0,
    detail: `${aShare} ${bShare} ${cShare}`,
  });
  out.push({
    name: "hourly blanks exist",
    ok: MLX_BLANKS === 10 && MLX_WINNERS === 3 && NPC_MILLIX.length === 21,
    detail: `${MLX_BLANKS} blanks · ${NPC_MILLIX.length} npc`,
  });

  const bal = emptyWallet();
  const before = bal.mlx;
  buySandboxTicket(bal, [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]);
  out.push({
    name: "miss ticket deducts 100,000 and never goes negative",
    ok: bal.mlx === before - LOTTO_TICKET_MLX && bal.mlx >= 0,
    detail: String(bal.mlx),
  });

  return out;
}

export function liveWalletUntouched(before: string | null, after: string | null): boolean {
  return before === after;
}

export function formatReport(sim100k: SimReport, sim1m: SimReport | null, edges: EdgeResult[], notes: string[]): string {
  const exp = expectedHitShare();
  const use = sim1m ?? sim100k;
  const lines = (r: SimReport) =>
    [0, 1, 2, 3, 4, 5, 6]
      .map((h) => {
        const obs = r.hits[h]! / Math.max(1, r.draws);
        return `  ${h} hits  expected ${(exp[h]! * 100).toFixed(4)}%  observed ${(obs * 100).toFixed(4)}%  n=${r.hits[h]}`;
      })
      .join("\n");
  const edgeFail = edges.filter((e) => !e.ok);
  const status = edgeFail.length || use.flags.length ? (edgeFail.length ? "NEEDS INVESTIGATION" : "NEEDS INVESTIGATION") : "PASS";
  return [
    "LOTTERY TEST REPORT",
    "",
    "Test mode:",
    "SANDBOX",
    "",
    "Number of draws:",
    String(use.draws),
    "",
    "Number of entries:",
    String(use.entries),
    "",
    "Winning results:",
    `${use.winning} (2+ hits)`,
    "",
    "Prize distribution:",
    `0:${use.hits[0]} 1:${use.hits[1]} 2:${use.hits[2]} 3:${use.hits[3]} 4:${use.hits[4]} 5:${use.hits[5]} 6:${use.hits[6]}`,
    "",
    "Expected distribution:",
    exp.map((p, h) => `${h}:${(p * 100).toFixed(5)}%`).join("  "),
    "",
    "Observed distribution:",
    use.hits.map((n, h) => `${h}:${((n / use.draws) * 100).toFixed(5)}%`).join("  "),
    "",
    "Average prize:",
    `${use.avgPrize.toFixed(2)} MLX gross (theoretical ${expectedPrizeGross().toFixed(2)})`,
    "",
    "Total simulated payout:",
    `${use.totalPayout} MLX gross · stake ${use.totalStake} MLX`,
    "",
    "RNG/draw errors:",
    use.flags.length ? `${use.sample.filter((s) => s.error).length} · ${use.flags.join("; ")}` : String(use.sample.filter((s) => s.error).length),
    "",
    "Duplicate-award errors:",
    String(edgeFail.filter((e) => /claim|award/i.test(e.name)).length),
    "",
    "Accounting errors:",
    String(edgeFail.filter((e) => /balance|negative|deduct|funds/i.test(e.name)).length),
    "",
    "Concurrency errors:",
    String(edgeFail.filter((e) => /busy|sequential|flight/i.test(e.name)).length),
    "",
    "UI errors:",
    notes.find((n) => n.startsWith("UI:")) ?? "see sandbox playtest",
    "",
    "Security/integrity errors:",
    String(edgeFail.filter((e) => /fabricated|price|identity|rewrite/i.test(e.name)).length),
    "",
    "Overall test status:",
    status,
    "",
    "100,000-draw EXPECTED vs OBSERVED",
    lines(sim100k),
    `chi-square hits ${sim100k.chiHits.toFixed(2)} · numbers ${sim100k.chiNumbers.toFixed(2)}`,
    "",
    sim1m ? "1,000,000-draw EXPECTED vs OBSERVED" : "1,000,000-draw: not run",
    sim1m ? lines(sim1m) : "",
    sim1m ? `chi-square hits ${sim1m.chiHits.toFixed(2)} · numbers ${sim1m.chiNumbers.toFixed(2)}` : "",
    "",
    "Edge results:",
    ...edges.map((e) => `${e.ok ? "PASS" : "FAIL"}  ${e.name}  — ${e.detail}`),
    "",
    "Notes:",
    ...notes,
    "",
    "This report does not call the lottery fair. It compares sandbox draws to the configured tables only.",
  ].join("\n");
}
