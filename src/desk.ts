import { FAQ } from "./faq";
import { PAYPAL_EMAIL, devCredit } from "./millix";
import { writeClip } from "./clip";

const STORE = "cu-desk";
const MAX_LINES = 80;
const WAIT_MS = 420;

export type DeskWho = "you" | "desk" | "sys";

export type DeskLine = { who: DeskWho; text: string; at: number };

type DeskSave = { lines: DeskLine[] };

export type DeskChip = { label: string; q: string };

const STOP = new Set([
  "the",
  "a",
  "an",
  "is",
  "how",
  "do",
  "i",
  "to",
  "what",
  "where",
  "who",
  "and",
  "or",
  "of",
  "in",
  "on",
  "for",
  "my",
  "me",
  "you",
  "does",
  "can",
  "with",
  "it",
  "this",
  "that",
  "are",
  "be",
  "at",
  "from",
  "your",
  "we",
  "if",
  "not",
  "please",
  "help",
  "about",
  "there",
]);

export const DESK_CHIPS: DeskChip[] = [
  { label: "How to play", q: "Where is How to play?" },
  { label: "Phone", q: "Can I play on a phone?" },
  { label: "Start a match", q: "How do I start a match?" },
  { label: "Log in", q: "How do I log in?" },
  { label: "Splash crit bash", q: "What do splash, crit, and bash items do?" },
  { label: "Watch AI", q: "How do Watch AI and the enter-page demo work?" },
  { label: "Millix", q: "What is Millix?" },
  { label: "DAG", q: "What is a DAG?" },
  { label: "Spectator", q: "How do spectator seats work?" },
  { label: "Music", q: "How does the background music work?" },
  { label: "Sound card", q: "What is the sound card?" },
  { label: "Royalty-free SFX", q: "Are the battle sounds royalty-free?" },
  { label: "Contact", q: "How do I contact support?" },
];

export function deskHello(): string {
  return `Campus Desk. ${devCredit()} developed this tab. Ask about play, Millix, DLC, Account, or seats. Replies come from the FAQ in this browser. For a human, email the thread to ${PAYPAL_EMAIL}. This desk is not wait-room Talk and not the match mic.`;
}

function words(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/@/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/u)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function loadSave(): DeskSave {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return { lines: [] };
    const parsed = JSON.parse(raw) as DeskSave;
    if (!Array.isArray(parsed.lines)) return { lines: [] };
    return {
      lines: parsed.lines
        .filter((l) => l && (l.who === "you" || l.who === "desk" || l.who === "sys") && typeof l.text === "string")
        .slice(-MAX_LINES),
    };
  } catch {
    return { lines: [] };
  }
}

function saveLines(lines: DeskLine[]): void {
  localStorage.setItem(STORE, JSON.stringify({ lines: lines.slice(-MAX_LINES) } satisfies DeskSave));
}

function faqHit(q: string): { q: string; a: string; score: number } | null {
  const qw = words(q);
  if (!qw.length) return null;
  let best: { q: string; a: string; score: number } | null = null;
  for (const g of FAQ) {
    for (const item of g.items) {
      const qSet = new Set(words(item.q));
      const aSet = new Set(words(item.a));
      let score = 0;
      for (const w of qw) {
        if (qSet.has(w)) score += 4;
        else if (aSet.has(w)) score += 1;
      }
      if (item.q.toLowerCase() === q.trim().toLowerCase()) score += 20;
      if (!best || score > best.score) best = { q: item.q, a: item.a, score };
    }
  }
  if (!best || best.score < 5) return null;
  return best;
}

function contactIntent(q: string): boolean {
  const w = new Set(words(q));
  return ["email", "contact", "human", "developer", "developers", "support", "desk", "staff"].some((k) => w.has(k));
}

function extraReply(q: string): string | "" {
  const w = new Set(words(q));
  const blob = words(q).join(" ");
  const has = (...keys: string[]) => keys.some((k) => w.has(k) || blob.includes(k));
  if (has("spotify", "playlist", "hooligan")) {
    return "For now the soundtrack is The Star-Spangled Banner, played in this tab — public domain, no download. Spotify does not have to load. Link Spotify still pays +1,000 gold once if you want that locker bonus.";
  }
  if (has("anthem", "soundtrack") || (has("music") && has("mute", "volume", "off", "on", "bar"))) {
    return "Click Enter with sound. The Star-Spangled Banner plays in this tab — public domain, no file to download. HUD Mute cuts the anthem. Combat clinks, minion tings, and a coin on every kill keep playing.";
  }
  if (has("dag", "tangle", "acyclic", "blockchain", "erc")) {
    return "Open Millix · DAG from the enter page. Millix is not a blockchain and not an ERC-20. It is a directed acyclic graph: arrows only go forward, no mining, no blocks. millix.org is the protocol. This game takes MLX for DLC (40% off the £1.99 sticker), seats, lotto, and Hourly.";
  }
  if (has("refund", "chargeback", "moneyback")) {
    return `DLC unlocks when the payment clears. Matches are free. There is no in-tab refund button. Email ${PAYPAL_EMAIL} with the rail (Millix, PayPal, or card) and what you bought. ${devCredit()} take 1% of that payment.`;
  }
  if (has("bug", "broken", "crash", "stuck", "error")) {
    return `If a control or a payment looks wrong, say what page you were on and what you tapped. The FAQ and Patches cover the current build. Email ${PAYPAL_EMAIL} if this desk cannot fix it. Clearing site data wipes the locker — do that last.`;
  }
  if (contactIntent(q)) {
    return `Open Campus Desk any time — Support on the enter page, or the button in the corner. This desk answers from the FAQ. For a human, use Email this thread. That opens mail to ${PAYPAL_EMAIL} (${devCredit()}).`;
  }
  return "";
}

export function deskAnswer(q: string): string {
  const text = q.trim();
  if (!text) return "Type a question, or tap a topic under the log.";
  const hit = faqHit(text);
  if (hit && hit.score >= 20) return hit.a;
  if (contactIntent(text)) {
    const extra = extraReply(text);
    if (extra) return extra;
  }
  if (hit) return hit.a;
  const extra = extraReply(text);
  if (extra) return extra;
  return `No FAQ hit for that. Try Start a match, Millix, Spectator, Music, or Watch AI. Open FAQ for the full list. For a human, Email this thread to ${PAYPAL_EMAIL}.`;
}

export function deskMailHref(lines: DeskLine[]): string {
  const body = lines
    .slice(-16)
    .map((l) => `${l.who === "you" ? "You" : l.who === "sys" ? "SYS" : "Desk"}: ${l.text}`)
    .join("\n\n")
    .slice(0, 1600);
  const subject = "MAGA vs Antifa · Campus Desk";
  return `mailto:${PAYPAL_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body || deskHello())}`;
}

export function isDeskOpen(): boolean {
  return document.body.classList.contains("desk-open");
}

let setDeskOpen: (on: boolean) => void = () => undefined;

export function closeDesk(): boolean {
  if (!isDeskOpen()) return false;
  setDeskOpen(false);
  return true;
}

function $(id: string): HTMLElement {
  return document.querySelector(`#${id}`)!;
}

export function mountDesk(opts?: { onLayer?: () => void }): void {
  const fab = $("desk-fab");
  const panel = $("desk");
  const log = $("desk-log");
  const chips = $("desk-chips");
  const form = $("desk-form") as HTMLFormElement;
  const input = $("desk-in") as HTMLInputElement;
  const err = $("desk-err");
  const status = $("desk-status");
  let lines = loadSave().lines;
  let waiting = false;

  const greeting: DeskLine = { who: "desk", text: deskHello(), at: Date.now() };
  if (!lines.length) lines = [greeting];

  function persist(): void {
    saveLines(lines);
  }

  function paint(): void {
    log.innerHTML = lines
      .map((l) => {
        const tag = l.who === "you" ? "You" : l.who === "sys" ? "SYS" : "Desk";
        return `<div class="desk-line desk-${l.who}"><em>${tag}</em> ${esc(l.text)}</div>`;
      })
      .join("");
    if (waiting) log.innerHTML += `<div class="desk-line desk-wait"><em>Desk</em> typing…</div>`;
    log.scrollTop = log.scrollHeight;
    chips.innerHTML = DESK_CHIPS.map((c) => `<button type="button" class="thin" data-q="${esc(c.q)}">${esc(c.label)}</button>`).join("");
    status.textContent = waiting
      ? "Desk is typing…"
      : "Ask about play, Millix, DLC, Account, or seats. Replies come from the FAQ in this tab.";
    err.hidden = true;
    err.textContent = "";
  }

  function setOpen(on: boolean): void {
    panel.hidden = !on;
    panel.classList.toggle("open", on);
    document.body.classList.toggle("desk-open", on);
    fab.setAttribute("aria-expanded", on ? "true" : "false");
    fab.textContent = on ? "Close desk" : "Support";
    if (on) {
      paint();
      input.focus();
    }
    opts?.onLayer?.();
  }
  setDeskOpen = setOpen;

  function push(who: DeskWho, text: string): void {
    lines.push({ who, text, at: Date.now() });
    if (lines.length > MAX_LINES) lines = lines.slice(-MAX_LINES);
    persist();
  }

  function ask(raw: string): void {
    const q = raw.trim();
    if (!q || waiting) return;
    push("you", q);
    waiting = true;
    paint();
    window.setTimeout(() => {
      waiting = false;
      push("desk", deskAnswer(q));
      paint();
    }, WAIT_MS);
  }

  fab.addEventListener("click", () => setOpen(!isDeskOpen()));
  $("desk-close").addEventListener("click", () => setOpen(false));
  const menu = document.querySelector("#btn-desk");
  menu?.addEventListener("click", () => setOpen(true));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = "";
    ask(q);
  });

  chips.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-q]");
    if (!btn?.dataset.q) return;
    ask(btn.dataset.q);
  });

  $("desk-clear").addEventListener("click", () => {
    lines = [{ who: "sys", text: "Thread cleared on this locker.", at: Date.now() }, { ...greeting, at: Date.now() }];
    persist();
    paint();
  });

  $("desk-mail").addEventListener("click", () => {
    const href = deskMailHref(lines);
    err.hidden = true;
    try {
      window.location.href = href;
    } catch {
      err.hidden = false;
      err.textContent = `Mail did not open. Copy the thread and send it to ${PAYPAL_EMAIL}.`;
    }
    void writeClip(lines.map((l) => `${l.who}: ${l.text}`).join("\n")).then((ok) => {
      if (ok) status.textContent = `Thread copied. Mail ${PAYPAL_EMAIL} if the mail app did not open.`;
    });
  });

  paint();
}
