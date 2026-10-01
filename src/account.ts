import { cleanHandle, displayHandle } from "./handles";

export type AccountProvider = "facebook" | "gmail" | "email";

export type AccountSession = {
  provider: AccountProvider;
  email: string;
  name: string;
};

export type AccountRecord = {
  email: string;
  hash: string;
  name: string;
  providers: AccountProvider[];
  created: number;
};

const STORE = "cu-accounts";
const RESERVED = new Set(["blake", "lilhooligan", "you", "ai"]);

export function cleanEmail(raw: string): string {
  return raw.trim().toLowerCase().slice(0, 80);
}

export function emailOk(raw: string): boolean {
  const e = cleanEmail(raw);
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/u.test(e);
}

export function providerLabel(p: AccountProvider): string {
  if (p === "facebook") return "Facebook";
  if (p === "gmail") return "Gmail";
  return "email";
}

export function handleFromAccount(email: string, name: string): string {
  const fromName = cleanHandle(name);
  if (fromName && !RESERVED.has(fromName) && fromName.length >= 2) return fromName;
  const local = cleanHandle(cleanEmail(email).split("@")[0] ?? "");
  let h = local.length >= 2 ? local : "player";
  if (!RESERVED.has(h)) return h;
  for (let i = 2; i < 20; i++) {
    const next = `${h}${i}`.slice(0, 20);
    if (!RESERVED.has(next)) return next;
  }
  return "player";
}

export function accountLine(session: AccountSession | null): string {
  if (!session) return "Log in with Facebook or Gmail, or sign up with email. This locker stays on this browser.";
  const who = session.name || displayHandle(handleFromAccount(session.email, session.name)) || session.email;
  return `Logged in with ${providerLabel(session.provider)} as ${session.email} · ${who}`;
}

export function loadRecords(): AccountRecord[] {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AccountRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r) => ({
        email: cleanEmail(r.email ?? ""),
        hash: typeof r.hash === "string" ? r.hash : "",
        name: String(r.name ?? "").trim().slice(0, 24),
        providers: (r.providers ?? []).filter(
          (p): p is AccountProvider => p === "facebook" || p === "gmail" || p === "email",
        ),
        created: typeof r.created === "number" ? r.created : Date.now(),
      }))
      .filter((r) => emailOk(r.email));
  } catch {
    return [];
  }
}

function saveRecords(rows: AccountRecord[]): void {
  localStorage.setItem(STORE, JSON.stringify(rows));
}

export async function hashPass(pass: string, email: string): Promise<string> {
  const body = `${cleanEmail(email)}\n${pass}`;
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 2166136261;
  for (let i = 0; i < body.length; i++) {
    h ^= body.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function upsert(row: AccountRecord): AccountRecord {
  const rows = loadRecords();
  const i = rows.findIndex((r) => r.email === row.email);
  if (i >= 0) rows[i] = row;
  else rows.push(row);
  saveRecords(rows);
  return row;
}

export async function signupEmail(emailRaw: string, pass: string, confirm: string, nameRaw: string): Promise<
  { ok: true; session: AccountSession } | { ok: false; reason: string }
> {
  const email = cleanEmail(emailRaw);
  const name = nameRaw.trim().slice(0, 24);
  if (!emailOk(email)) return { ok: false, reason: "That is not a usable email." };
  if (pass.length < 8) return { ok: false, reason: "Password needs 8 characters." };
  if (pass !== confirm) return { ok: false, reason: "Those passwords do not match." };
  const existing = loadRecords().find((r) => r.email === email);
  if (existing?.hash) return { ok: false, reason: "That email already has a locker. Log in with email." };
  const hash = await hashPass(pass, email);
  const providers: AccountProvider[] = existing ? [...new Set([...existing.providers, "email" as const])] : ["email"];
  upsert({
    email,
    hash,
    name: name || existing?.name || "",
    providers,
    created: existing?.created ?? Date.now(),
  });
  return { ok: true, session: { provider: "email", email, name: name || existing?.name || "" } };
}

export async function loginEmail(emailRaw: string, pass: string): Promise<
  { ok: true; session: AccountSession } | { ok: false; reason: string }
> {
  const email = cleanEmail(emailRaw);
  if (!emailOk(email)) return { ok: false, reason: "That is not a usable email." };
  const row = loadRecords().find((r) => r.email === email);
  if (!row) return { ok: false, reason: "No locker on that email. Sign up, or use Facebook / Gmail." };
  if (!row.hash) {
    const via = row.providers.includes("facebook") ? "Facebook" : row.providers.includes("gmail") ? "Gmail" : "that social";
    return { ok: false, reason: `This locker is ${via}. Use that button.` };
  }
  if ((await hashPass(pass, email)) !== row.hash) return { ok: false, reason: "Wrong password." };
  return { ok: true, session: { provider: "email", email, name: row.name } };
}

export function loginSocial(
  provider: "facebook" | "gmail",
  emailRaw: string,
  nameRaw: string,
): { ok: true; session: AccountSession } | { ok: false; reason: string } {
  const email = cleanEmail(emailRaw);
  const name = nameRaw.trim().slice(0, 24);
  if (!emailOk(email)) return { ok: false, reason: "Type the email on that account." };
  if (provider === "gmail" && !email.endsWith("@gmail.com") && !email.endsWith("@googlemail.com")) {
    return { ok: false, reason: "Gmail login needs a @gmail.com address." };
  }
  const existing = loadRecords().find((r) => r.email === email);
  const providers = existing
    ? [...new Set([...existing.providers, provider])]
    : [provider];
  upsert({
    email,
    hash: existing?.hash ?? "",
    name: name || existing?.name || "",
    providers,
    created: existing?.created ?? Date.now(),
  });
  return { ok: true, session: { provider, email, name: name || existing?.name || "" } };
}

export function readSession(raw: Partial<AccountSession> | undefined): AccountSession | null {
  if (!raw) return null;
  const provider = raw.provider;
  const email = cleanEmail(raw.email ?? "");
  if ((provider !== "facebook" && provider !== "gmail" && provider !== "email") || !emailOk(email)) return null;
  return { provider, email, name: String(raw.name ?? "").trim().slice(0, 24) };
}
