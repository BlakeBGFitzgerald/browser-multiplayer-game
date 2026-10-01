import { cleanHandle } from "./handles";

export const TANGLED_HOST = "tangled.com";

/** Campus seat that always passes the enter-page Tangled check. @blake is a player login. */
export const CAMPUS_TANGLED = ["lilhooligan"] as const;

export type TangledReason = "live" | "campus" | "missing" | "blocked" | "bad";

export type TangledCheck = {
  ok: boolean;
  user: string;
  reason: TangledReason;
  host: string;
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export function cleanTangledUser(raw: string): string {
  let s = raw.trim().replace(/^@+/u, "");
  s = s.replace(/^https?:\/\//iu, "");
  s = s.replace(/\.tangled\.com(?:\/.*)?$/iu, "");
  s = s.split("/")[0] ?? s;
  return cleanHandle(s);
}

export function isCampusTangled(user: string): boolean {
  return (CAMPUS_TANGLED as readonly string[]).includes(user);
}

export function tangledHost(user: string): string {
  return user ? `${user}.${TANGLED_HOST}` : TANGLED_HOST;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/** Read a Tangled profile HTML blob. Fail closed: missing beats a leftover @handle on the 404 shell. */
export function parseTangledHtml(user: string, html: string): "live" | "missing" | "blocked" | "unknown" {
  if (!html.trim()) return "unknown";
  const low = html.toLowerCase();
  const challenge =
    low.includes("just a moment") ||
    low.includes("cf-browser-verification") ||
    low.includes("performing security verification") ||
    (low.includes("enable javascript and cookies to continue") && html.length < 20000);
  if (challenge) return "blocked";
  if (low.includes("profile not found")) return "missing";
  const safe = escapeRe(user);
  const tagged = new RegExp(`@${safe}\\b`, "iu");
  const host = new RegExp(`${safe}\\.tangled\\.com`, "iu");
  if (tagged.test(html) && host.test(html)) return "live";
  return "unknown";
}

function allOrigins(url: string): string {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
}

async function readUrl(url: string, ms: number): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/json",
        "User-Agent": BROWSER_UA,
      },
    });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function emptyCheck(user: string, reason: TangledReason, ok = false): TangledCheck {
  return { ok, user, reason, host: tangledHost(user) };
}

async function scanTargets(user: string, urls: string[], ms: number): Promise<TangledCheck | null> {
  let blocked = false;
  let unknown = false;
  for (const url of urls) {
    try {
      const html = await readUrl(url, ms);
      const kind = parseTangledHtml(user, html);
      if (kind === "live") return emptyCheck(user, "live", true);
      if (kind === "missing") return emptyCheck(user, "missing");
      if (kind === "blocked") blocked = true;
      else unknown = true;
    } catch {
      unknown = true;
    }
  }
  if (blocked && !unknown) return emptyCheck(user, "blocked");
  if (blocked) return emptyCheck(user, "blocked");
  return null;
}

/** Live profile check. Campus names skip the network. Unknown names fail closed. */
export async function fetchTangledProfile(user: string): Promise<TangledCheck> {
  if (!user) return emptyCheck("", "bad");
  if (isCampusTangled(user)) return emptyCheck(user, "campus", true);
  const pages = [`https://${tangledHost(user)}/`, `https://${TANGLED_HOST}/u/${user}`];
  const direct = await scanTargets(user, pages, 8000);
  if (direct && (direct.ok || direct.reason === "missing")) return direct;
  const viaProxy = await scanTargets(
    user,
    pages.map((page) => allOrigins(page)),
    14000,
  );
  if (viaProxy) return viaProxy;
  return direct ?? emptyCheck(user, "missing");
}

/** Browser-side fallback when /api/tangled-verify is down or Cloudflare-blocked. */
export async function fetchTangledViaProxy(user: string): Promise<TangledCheck> {
  if (!user) return emptyCheck("", "bad");
  if (isCampusTangled(user)) return emptyCheck(user, "campus", true);
  const pages = [`https://${tangledHost(user)}/`, `https://${TANGLED_HOST}/u/${user}`];
  const viaProxy = await scanTargets(
    user,
    pages.map((page) => allOrigins(page)),
    14000,
  );
  return viaProxy ?? emptyCheck(user, "missing");
}
