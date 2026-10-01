/** Handles that drip match gold faster than the rest of the ten. */
export const FAST_GOLD_HANDLES = ["blake", "lilhooligan"] as const;

export const GOLD_PER_SEC = 3.2;
export const FAST_GOLD_PER_SEC = 8;
/** Tangled browser: 384 gold/min vs 192. */
export const TANGLED_GOLD_PER_SEC = 6.4;

export function cleanHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/u, "")
    .replace(/[^a-zA-Z0-9_]/gu, "")
    .slice(0, 20)
    .toLowerCase();
}

export function handleOf(name: string): string {
  const tagged = name.toLowerCase().match(/@([a-z0-9_]{2,20})/u);
  if (tagged?.[1]) return tagged[1];
  const stripped = name.replace(/\[[^\]]*\]/gu, " ");
  return cleanHandle(stripped.split(/\s+/u).find((p) => p && p !== "ai" && p !== "you") ?? stripped);
}

export function displayHandle(raw: string): string {
  const h = cleanHandle(raw);
  return h ? `@${h}` : "";
}

export function isFastGold(name: string): boolean {
  const h = handleOf(name);
  return (FAST_GOLD_HANDLES as readonly string[]).includes(h);
}

/** @blake and @lilhooligan can hand the keyboard to expert AI. */
export function canExpertAuto(name: string): boolean {
  return isFastGold(name);
}

/** @lilhooligan starts on expert AI. @blake keeps the keyboard until he taps P. */
export function defaultExpertAuto(name: string): boolean {
  return handleOf(name) === "lilhooligan";
}

/** Match gold per second. Tangled browser raises the local hero. Google signup does not. */
export function goldDrip(name: string, player = false, tangled = false): number {
  if (isFastGold(name)) return FAST_GOLD_PER_SEC;
  if (player && tangled) return TANGLED_GOLD_PER_SEC;
  return GOLD_PER_SEC;
}
