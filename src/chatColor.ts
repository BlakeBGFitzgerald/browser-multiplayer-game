/** Accessible name colours for the existing match chat. Not team colours. */

export type ChatPerson = {
  id: string;
  name: string;
  team?: "maga" | "antifa" | "spec";
};

export const CHAT_PALETTE = [
  { id: "blue", hex: "#7eb3ff" },
  { id: "orange", hex: "#f0a04b" },
  { id: "green", hex: "#5fd4a0" },
  { id: "purple", hex: "#c9a0ff" },
  { id: "yellow", hex: "#f2d35b" },
  { id: "teal", hex: "#4fd4c8" },
  { id: "pink", hex: "#ff8ec8" },
  { id: "white", hex: "#e8e4dc" },
  { id: "periwinkle", hex: "#9ab6ff" },
  { id: "peach", hex: "#ffb086" },
  { id: "mint", hex: "#86e0b0" },
  { id: "lavender", hex: "#e0c8ff" },
] as const;

export const CHAT_CAP = 80;

const byName = new Map<string, string>();
const byId = new Map<string, string>();
const teamByName = new Map<string, ChatPerson["team"]>();

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 33 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function resetChatColors(): void {
  byName.clear();
  byId.clear();
  teamByName.clear();
}

export function assignMatchColors(people: ChatPerson[]): void {
  const used = new Set(byName.values());
  const seen = new Set<string>();
  let slot = 0;
  for (const p of people) {
    if (!p.name || seen.has(p.id)) continue;
    seen.add(p.id);
    if (p.team) teamByName.set(p.name, p.team);
    if (byName.has(p.name)) continue;
    while (used.has(CHAT_PALETTE[slot % CHAT_PALETTE.length]!.hex) && slot < CHAT_PALETTE.length) {
      slot += 1;
    }
    const hex = CHAT_PALETTE[slot % CHAT_PALETTE.length]!.hex;
    slot += 1;
    used.add(hex);
    byId.set(p.id, hex);
    byName.set(p.name, hex);
  }
}

export function rememberChatName(name: string, team?: ChatPerson["team"]): string {
  if (!name) return CHAT_PALETTE[0].hex;
  const existing = byName.get(name);
  if (existing) {
    if (team) teamByName.set(name, team);
    return existing;
  }
  const hex = CHAT_PALETTE[hashName(name) % CHAT_PALETTE.length]!.hex;
  byName.set(name, hex);
  if (team) teamByName.set(name, team);
  return hex;
}

export function chatNameColor(name: string): string {
  return byName.get(name) ?? rememberChatName(name);
}

export function chatTeamTag(name: string): "RED" | "BLUE" | "SPEC" | "" {
  const team = teamByName.get(name);
  if (team === "maga") return "RED";
  if (team === "antifa") return "BLUE";
  if (team === "spec") return "SPEC";
  return "";
}

export function assignedChatColor(name: string): string | undefined {
  return byName.get(name);
}

export function assignedCount(): number {
  return byName.size;
}
