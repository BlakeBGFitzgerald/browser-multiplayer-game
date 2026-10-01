import { canExpertAuto } from "./handles";

function queryFlag(name: string): boolean {
  if (typeof location === "undefined") return false;
  return new URLSearchParams(location.search).get(name) === "1";
}

/** DEV MODE → HERO SELECT → HOOLI. Existing test tool. */
export function isHooliTestMode(): boolean {
  return queryFlag("hooli-test");
}

/** Existing developer/test tools. No new login. */
export function isDevHeroMode(): boolean {
  if (typeof location === "undefined") return false;
  const q = new URLSearchParams(location.search);
  return q.get("hooli-test") === "1" || q.get("anim-test") === "1" || q.get("anim-match") === "1" || location.hash === "#anim-sandbox";
}

/** Hooli is only for authorized campus developers or an open developer/test tool. */
export function humanMayControlHooli(name = ""): boolean {
  return isDevHeroMode() || canExpertAuto(name);
}
