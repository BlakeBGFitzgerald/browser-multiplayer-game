import { GOLD_PER_SEC, TANGLED_GOLD_PER_SEC } from "./handles";
import {
  cleanTangledUser,
  fetchTangledProfile,
  fetchTangledViaProxy,
  isCampusTangled,
  tangledHost,
  type TangledCheck,
} from "./tangled-check";

export {
  CAMPUS_TANGLED,
  cleanTangledUser,
  isCampusTangled,
  parseTangledHtml,
  tangledHost,
  type TangledCheck,
  type TangledReason,
} from "./tangled-check";

type UAData = { brands?: { brand: string; version: string }[] };

export const TANGLED_LOGIN = "https://tangled.com/login";
export const TANGLED_SIGNUP = "https://tangled.com/register";
export const TANGLED_GOOGLE = "https://tangled.com/register";
export const TANGLED_HOST = "tangled.com";
/** One-time coins the first time a Tangled username is claimed on this locker. */
export const TANGLED_CLAIM_COINS = 250;

export function baseGoldMin(): number {
  return Math.round(GOLD_PER_SEC * 60);
}

export function tangledGoldMin(): number {
  return Math.round(TANGLED_GOLD_PER_SEC * 60);
}

/** Tangled.com profile is username.tangled.com */
export function tangledProfile(user: string): string {
  return `https://${tangledHost(user)}`;
}

export function tangledFailCopy(check: TangledCheck): string {
  if (check.reason === "bad") return "Enter your Tangled username.";
  if (check.reason === "missing") {
    return `No Tangled profile at ${check.host}. Sign up on Tangled, then come back with that username.`;
  }
  return `Tangled did not confirm @${check.user}. Sign up on Tangled, then try that username again.`;
}

export function cleanTangledList(list: string[] | undefined): string[] {
  const out: string[] = [];
  for (const raw of list ?? []) {
    const u = cleanTangledUser(raw);
    if (!u || isCampusTangled(u) || out.includes(u)) continue;
    out.push(u);
  }
  return out.slice(0, 24);
}

export function rememberTangledName(list: string[], user: string): string[] {
  return cleanTangledList([user, ...list]);
}

/** Confirm username.tangled.com is a live profile. Never takes a password. */
export async function verifyTangledUser(raw: string): Promise<TangledCheck> {
  const user = cleanTangledUser(raw);
  if (!user) return { ok: false, user: "", reason: "bad", host: TANGLED_HOST };
  if (isCampusTangled(user)) return { ok: true, user, reason: "campus", host: tangledHost(user) };
  try {
    const res = await fetch(`/api/tangled-verify?u=${encodeURIComponent(user)}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as TangledCheck;
      if (data.ok || data.reason === "missing" || data.reason === "bad") {
        return { ok: !!data.ok, user, reason: data.reason, host: data.host || tangledHost(user) };
      }
    }
  } catch {
    /* fall through to a browser-side profile read */
  }
  try {
    return await fetchTangledViaProxy(user);
  } catch {
    return fetchTangledProfile(user);
  }
}

export function enterGoldLine(_gmail = false): string {
  if (isTangledBrowser()) {
    return `Tangled browser · you earn ${tangledGoldMin()} gold/min in-match (${baseGoldMin()}/min in other browsers).`;
  }
  return `This locker · ${baseGoldMin()} gold/min. Extra gold is Tangled browser only (${tangledGoldMin()}).`;
}

/** Tangled browser only. A Google signup or a Tangled.com referrer does not count. */
export function isTangledBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const data = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  const brands = (data?.brands ?? []).map((b) => b.brand).join(" ");
  const ua = [navigator.userAgent, navigator.vendor, brands].join(" ").toLowerCase();
  if (/\btangled\b/.test(ua)) return true;
  try {
    if (sessionStorage.getItem("cu-tangled") === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}
