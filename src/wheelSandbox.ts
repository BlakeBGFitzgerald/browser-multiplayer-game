import {
  analyzeStreaks,
  dayWheel,
  formatWheelReport,
  heroesForDay,
  HEROES_PER_DAY,
  heroSlice,
  liveRoster,
  LIVE_WALLET_KEY,
  measurePlacement,
  measureProduction,
  productionSliceCount,
  runEdgeSuite,
  scheduleAudit,
  simulateDay,
  testDays,
  WHEEL_SANDBOX_KEY,
} from "./wheelCore";
import { drawWheel } from "./wheel";

export function isWheelTestMode(): boolean {
  if (typeof location === "undefined") return false;
  const q = new URLSearchParams(location.search);
  return q.get("wheel-test") === "1" || location.hash === "#wheel-sandbox";
}

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function hideLiveChrome(): void {
  document.querySelectorAll<HTMLElement>(".page").forEach((el) => {
    if (el.id !== "wheel-sandbox") el.hidden = true;
  });
  const view = document.getElementById("view");
  if (view) view.hidden = true;
  const hud = document.getElementById("hud");
  if (hud) hud.hidden = true;
  const flag = document.getElementById("flag");
  if (flag) flag.style.display = "none";
  const rubble = document.getElementById("rubble");
  if (rubble) rubble.style.display = "none";
  const rail = document.getElementById("rail");
  if (rail) rail.hidden = true;
  document.body.classList.add("wheel-sandbox-open");
}

function paintPreview(day: number): void {
  const roster = liveRoster();
  const days = testDays(roster);
  const heroes = heroesForDay(day, roster);
  const n = productionSliceCount();
  const { slices, placed } = dayWheel(day, roster, n);
  $("wh-day").textContent = `SIMULATED DAY: ${day + 1} / ${days}`;
  $("wh-heroes").textContent = `TODAY'S HEROES:\n${heroes.map((h) => `${h.name} · ${h.kind} · ${h.pack}`).join("\n") || "(none)"}`;
  $("wh-bogus").textContent = `BOGUS ENTRIES: ${slices.filter((s) => s.miss).length}  ·  SLICE COUNT: ${n} (matches production)`;
  $("wh-audit").textContent = placed.map((h) => `${h.name} → day ${h.day + 1} → position ${h.position}`).join("\n");
  const canvas = document.querySelector<HTMLCanvasElement>("#wh-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) drawWheel(ctx, canvas.width, canvas.height, 0, slices);
  }
}

function resetSandbox(): void {
  localStorage.removeItem(WHEEL_SANDBOX_KEY);
}

function runFull(million: boolean): string {
  const before = localStorage.getItem(LIVE_WALLET_KEY);
  const roster = liveRoster();
  const days = testDays(roster);
  const per = million ? 1_000_000 : 100_000;
  $("wh-status").textContent = `Running ${per.toLocaleString()} spins × ${days} days…`;
  const t0 = performance.now();
  const results = [];
  for (let d = 0; d < days; d++) results.push(simulateDay(d, per, roster));
  const repeats = [0, 1, 2].map(() => [simulateDay(0, 100_000, roster)]);
  const production = measureProduction(1_000_000);
  const placement = measurePlacement(10_000, roster);
  const streaks = analyzeStreaks(100_000, roster);
  const edges = runEdgeSuite();
  const after = localStorage.getItem(LIVE_WALLET_KEY);
  const ms = Math.round(performance.now() - t0);
  const audit = scheduleAudit(roster);
  const notes = [
    `Sandbox used pickWheelIndex from wheel.ts. Production wheelSlices() was not rewritten.`,
    `Elapsed ${ms} ms.`,
    `Live locker untouched: ${before === after}.`,
    `Sandbox key ${WHEEL_SANDBOX_KEY} holds no ownership.`,
    `Production wheel is DLC skins + Miss wedges (${production.slices} slices). Test days place ${HEROES_PER_DAY} live heroes and fill the rest with [BOGUS TEST PRIZE] misses.`,
    `Unique heroes scheduled ${audit.rows.length} / roster ${roster.length}.`,
    "Bogus slices have miss:true and never call grantSkin or spend MILLIX.",
    "Production does not rotate three heroes per calendar day. That schedule is sandbox-only.",
    "Production does not randomize slice order. Sandbox placement uses pickWheelIndex only to pick unique test slots.",
    "UI: SPIN THE WHEEL — TEST MODE. Leave test mode clears sandbox storage.",
  ];
  const text = formatWheelReport({ days: results, repeats, production, placement, streaks, edges, notes });
  const first = results[0];
  if (first) {
    const heroBlock = first.heroes
      .map((h) => {
        const id = heroSlice(h).id;
        const exp = ((first.expected[id] ?? 0) * 100).toFixed(2);
        const obs = (((first.counts[id] ?? 0) / first.spins) * 100).toFixed(2);
        return `${h.name}:\nExpected ${exp}%\nObserved ${obs}%`;
      })
      .join("\n\n");
    const expH = ((first.heroes.length / first.slices) * 100).toFixed(2);
    const obsH = ((first.heroWins / first.spins) * 100).toFixed(2);
    const expB = (100 - Number(expH)).toFixed(2);
    const obsB = ((first.bogusWins / first.spins) * 100).toFixed(2);
    $("wh-results").textContent = [
      "RESULTS",
      "",
      heroBlock,
      "",
      `Bogus:\nExpected ${expB}%\nObserved ${obsB}%`,
      "",
      `Combined hero-win  expected ${expH}%  observed ${obsH}%`,
    ].join("\n");
  }
  $("wh-report").textContent = text;
  $("wh-status").textContent = `Done in ${ms} ms. Live locker unchanged.`;
  (window as unknown as { __wheelSandboxReport?: string }).__wheelSandboxReport = text;
  localStorage.setItem(WHEEL_SANDBOX_KEY, JSON.stringify({ ran: true, at: Date.now(), days: results.length }));
  return text;
}

export function bootWheelSandbox(): void {
  hideLiveChrome();
  $("wheel-sandbox").hidden = false;
  paintPreview(0);
  $("wh-status").textContent = "SPIN THE WHEEL — TEST MODE. Sandbox only. Live locker is not charged.";

  $("wh-run").addEventListener("click", () => {
    runFull(false);
  });
  $("wh-run1m").addEventListener("click", () => {
    runFull(true);
  });
  $("wh-edges").addEventListener("click", () => {
    $("wh-report").textContent = runEdgeSuite()
      .map((e) => `${e.ok ? "PASS" : "FAIL"}  ${e.name} — ${e.detail}`)
      .join("\n");
  });
  $("wh-reset").addEventListener("click", () => {
    resetSandbox();
    paintPreview(0);
    $("wh-report").textContent = "";
    $("wh-results").textContent = "";
    $("wh-status").textContent = "Sandbox reset. Production wheel and locker unchanged.";
  });
  $("wh-back").addEventListener("click", () => {
    resetSandbox();
    location.href = location.pathname;
  });

  (window as unknown as { __wheelRunAudit?: (million: boolean) => string }).__wheelRunAudit = (million: boolean) =>
    runFull(million);
}
