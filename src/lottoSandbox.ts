import { drawSix, LOTTO_TICKET_MLX } from "./campus";
import {
  buySandboxHourly,
  buySandboxTicket,
  claimSandboxPrize,
  emptyWallet,
  expectedHitShare,
  expectedPrizeGross,
  formatReport,
  liveWalletUntouched,
  loadSandbox,
  LOTTO_SANDBOX_KEY,
  pickError,
  rejectFabricatedWin,
  rejectPriceRewrite,
  resetSandbox,
  runEdgeSuite,
  saveSandbox,
  simulateDraws,
  type SandboxWallet,
} from "./lottoCore";

const LIVE_KEY = "cu-wallet";

export function isLottoTestMode(): boolean {
  if (typeof location === "undefined") return false;
  const q = new URLSearchParams(location.search);
  return q.get("lotto-test") === "1" || location.hash === "#lotto-sandbox";
}

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

let box: SandboxWallet = emptyWallet();
let picks: number[] = [];
let lastId = "";

function paint(): void {
  const grid = $("sb-grid");
  grid.innerHTML = Array.from({ length: 40 }, (_, i) => {
    const n = i + 1;
    const on = picks.includes(n);
    return `<button type="button" class="ball${on ? " on" : ""}" data-sb="${n}">${n}</button>`;
  }).join("");
  $("sb-picks").textContent = `${picks.length} / 6 picked${picks.length ? ` · ${[...picks].sort((a, b) => a - b).join(" ")}` : ""}`;
  $("sb-bal").textContent = `${box.mlx.toLocaleString()} sandbox MLX · tickets ${box.tickets.length} · hourly ${box.hourly.length}`;
  if (!box.tickets.length && !box.hourly.length) {
    $("sb-hist").innerHTML = "<li>No sandbox results yet.</li>";
  } else {
    $("sb-hist").innerHTML = [
      ...box.tickets.slice(0, 8).map(
        (t) =>
          `<li>Quad · ${t.id} · ${new Date(t.at).toISOString()} · picked ${t.picks.join(" ")} · drew ${t.draw.join(" ")} · ${t.hits} hits · ${t.prize ? `+${t.prizeNet}` : "miss"} · claimed ${t.claimed}</li>`,
      ),
      ...box.hourly.slice(0, 4).map(
        (h) =>
          `<li>Hourly · ${h.id} · hour ${h.hour} · pot ${h.pot} · place ${h.hit || "—"} · ${h.prizeNet} · claimed ${h.claimed}</li>`,
      ),
    ].join("");
  }
}

function say(msg: string): void {
  $("sb-out").textContent = msg;
}

export function bootLottoSandbox(): void {
  box = loadSandbox();
  const page = $("lotto-sandbox");
  page.hidden = false;
  document.querySelectorAll<HTMLElement>(".page").forEach((el) => {
    if (el.id !== "lotto-sandbox") el.hidden = true;
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
  document.body.classList.add("lotto-sandbox-open");
  paint();
  say("LOTTERY TEST MODE. Sandbox MLX only. Live locker is not charged.");

  $("sb-grid").addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-sb]");
    if (!btn?.dataset.sb) return;
    const n = Number(btn.dataset.sb);
    if (picks.includes(n)) picks = picks.filter((x) => x !== n);
    else if (picks.length < 6) picks.push(n);
    paint();
  });

  $("sb-quick").addEventListener("click", () => {
    picks = drawSix();
    paint();
  });

  $("sb-buy").addEventListener("click", () => {
    const err = pickError(picks);
    if (err) {
      say(err);
      return;
    }
    const r = buySandboxTicket(box, picks);
    if (r.ticket) lastId = r.ticket.id;
    say(r.message);
    paint();
  });

  $("sb-claim").addEventListener("click", () => {
    if (!lastId) {
      say("No sandbox ticket to claim.");
      return;
    }
    say(claimSandboxPrize(box, lastId).message);
    paint();
  });

  $("sb-fake").addEventListener("click", () => {
    say(rejectFabricatedWin().message);
  });

  $("sb-price").addEventListener("click", () => {
    say(rejectPriceRewrite().message);
  });

  $("sb-hourly").addEventListener("click", () => {
    const hour = Math.floor(Date.now() / 3_600_000);
    const r = buySandboxHourly(box, hour, "sandbox-tester");
    if (r.row) lastId = r.row.id;
    say(r.message);
    paint();
  });

  $("sb-edges").addEventListener("click", () => {
    const edges = runEdgeSuite();
    const fail = edges.filter((e) => !e.ok).length;
    $("sb-report").textContent = edges.map((e) => `${e.ok ? "PASS" : "FAIL"}  ${e.name} — ${e.detail}`).join("\n");
    say(`${edges.length - fail} passed · ${fail} failed. Live wallet key ${LIVE_KEY} was not written.`);
  });

  $("sb-sim").addEventListener("click", () => {
    runSims(false);
  });

  $("sb-sim1m").addEventListener("click", () => {
    runSims(true);
  });

  $("sb-reset").addEventListener("click", () => {
    box = resetSandbox();
    picks = [];
    lastId = "";
    paint();
    $("sb-report").textContent = "";
    say("Sandbox reset. Live locker unchanged.");
  });

  $("sb-back").addEventListener("click", () => {
    location.href = location.pathname;
  });

  (window as unknown as { __lottoRunAudit?: (million: boolean) => string }).__lottoRunAudit = (million: boolean) => {
    runSims(million);
    return (window as unknown as { __lottoSandboxReport?: string }).__lottoSandboxReport ?? "";
  };
}

function runSims(million: boolean): void {
  const before = localStorage.getItem(LIVE_KEY);
  const fixed = [1, 2, 3, 4, 5, 6];
  say("Running sandbox simulation…");
  const t0 = performance.now();
  const sim100k = simulateDraws(100_000, fixed, `run-100k-${Date.now()}`);
  const sim1m = million ? simulateDraws(1_000_000, fixed, `run-1m-${Date.now()}`) : null;
  const edges = runEdgeSuite();
  const after = localStorage.getItem(LIVE_KEY);
  const ms = Math.round(performance.now() - t0);
  const notes = [
    `Simulation used the live drawSix / hitCount / lottoPrize functions.`,
    `Elapsed ${ms} ms.`,
    `Live locker untouched: ${liveWalletUntouched(before, after)}.`,
    `Sandbox key ${LOTTO_SANDBOX_KEY}. Start balance ${box.startMlx}.`,
    `Theoretical average gross prize ${expectedPrizeGross().toFixed(2)} MLX vs ticket ${LOTTO_TICKET_MLX}.`,
    `Expected hit shares: ${expectedHitShare()
      .map((p, h) => `${h}=${(p * 100).toFixed(4)}%`)
      .join(" ")}`,
    "Quad Lotto awards the prize in the same click as the ticket. Duplicate claim is rejected.",
    "Hourly draws are deterministic for a given hour and pool. A different name changes the shuffle.",
    "Client Math.random() is the Quad Lotto RNG. A modified client can replace it. Flagged, not changed.",
    "UI: sandbox banner visible. Purchase lock blocks in-flight doubles. Price rewrite and fabricated wins rejected.",
  ];
  const text = formatReport(sim100k, sim1m, edges, notes);
  $("sb-report").textContent = text;
  say(sim1m ? `1,000,000 + 100,000 draws done in ${ms} ms.` : `100,000 draws done in ${ms} ms.`);
  saveSandbox(box);
  (window as unknown as { __lottoSandboxReport?: string }).__lottoSandboxReport = text;
}
