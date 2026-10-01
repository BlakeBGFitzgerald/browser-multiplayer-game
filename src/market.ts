import { newId } from "./bets";
import { DLC, skinById } from "./dlc";
import { ITEMS } from "./game/heroes";

export type GoodsKind = "skin" | "item";

export type Listing = {
  id: string;
  kind: GoodsKind;
  sku: string;
  price: number;
  seller: string;
  listed: number;
};

export const MIN_ASK = 20;
export const MAX_ASK = 4000;
export const NPC_BUY_MS = 14000;

export const NPC_BOARD: Listing[] = [
  { id: "npc-eagle", kind: "skin", sku: "hat-eagle", price: 260, seller: "[RC] Stickers", listed: 0 },
  { id: "npc-mask", kind: "skin", sku: "hat-mask", price: 240, seller: "[WPP] ZineKid", listed: 0 },
  { id: "npc-foam", kind: "skin", sku: "mascot-foam", price: 290, seller: "[BRB] BikeLock", listed: 0 },
  { id: "npc-night", kind: "skin", sku: "riot-night", price: 310, seller: "@spraycan", listed: 0 },
  { id: "npc-spine", kind: "skin", sku: "desk-spine", price: 330, seller: "Night Desk drop", listed: 0 },
  { id: "npc-hide", kind: "skin", sku: "mascot-rally", price: 300, seller: "[SPEC] Bleachers", listed: 0 },
  { id: "npc-badge", kind: "skin", sku: "gavel-badge", price: 380, seller: "Dean's Gavel", listed: 0 },
  { id: "npc-yard", kind: "skin", sku: "intern-cape", price: 420, seller: "[RC] Stickers", listed: 0 },
  { id: "npc-plume", kind: "skin", sku: "cadet-plume", price: 340, seller: "[AI] Parade Sand", listed: 0 },
  { id: "npc-lousy", kind: "skin", sku: "mma-lousy", price: 440, seller: "Dean's Gavel", listed: 0 },
  { id: "npc-gregor", kind: "skin", sku: "mma-mcgregor", price: 460, seller: "[RC] Stickers", listed: 0 },
  { id: "npc-bonesaw", kind: "skin", sku: "mma-bonesaw", price: 450, seller: "Quad Mason", listed: 0 },
  { id: "npc-perera", kind: "skin", sku: "mma-perera", price: 430, seller: "Dining Hall", listed: 0 },
  { id: "npc-cap", kind: "skin", sku: "mv-cap", price: 480, seller: "[RC] Stickers", listed: 0 },
  { id: "npc-bat", kind: "skin", sku: "dc-bat", price: 490, seller: "[BRB] BikeLock", listed: 0 },
  { id: "npc-cleats", kind: "item", sku: "cleats", price: 170, seller: "Track Spike", listed: 0 },
  { id: "npc-text", kind: "item", sku: "text", price: 210, seller: "Quad Mason", listed: 0 },
  { id: "npc-coat", kind: "item", sku: "coat", price: 240, seller: "Lab Burner", listed: 0 },
  { id: "npc-meal", kind: "item", sku: "meal", price: 260, seller: "Dining Hall", listed: 0 },
  { id: "npc-dean", kind: "item", sku: "dean", price: 520, seller: "Dean's Gavel", listed: 0 },
];

export function clampAsk(n: number): number {
  if (!Number.isFinite(n)) return MIN_ASK;
  return Math.max(MIN_ASK, Math.min(MAX_ASK, Math.round(n)));
}

export function askPrice(kind: GoodsKind, sku: string): number {
  if (kind === "skin") return clampAsk(Math.round((skinById(sku)?.coins ?? 400) * 0.65));
  return clampAsk(Math.round((ITEMS.find((i) => i.id === sku)?.cost ?? 400) * 0.52));
}

export function goodsName(kind: GoodsKind, sku: string): string {
  if (kind === "skin") return skinById(sku)?.name ?? sku;
  return ITEMS.find((i) => i.id === sku)?.name ?? sku;
}

export function goodsBlurb(kind: GoodsKind, sku: string): string {
  if (kind === "skin") return skinById(sku)?.blurb ?? "DLC skin.";
  return ITEMS.find((i) => i.id === sku)?.blurb ?? "Fountain item.";
}

export function goodsTint(kind: GoodsKind, sku: string): string {
  if (kind === "skin") return skinById(sku)?.tint ?? "#c9a24a";
  return "#b9a888";
}

export function parseSku(raw: string): { kind: GoodsKind; sku: string } | null {
  const [kind, sku] = raw.split(":");
  if ((kind === "skin" || kind === "item") && sku) return { kind, sku };
  return null;
}

export function skuKey(kind: GoodsKind, sku: string): string {
  return `${kind}:${sku}`;
}

export function makeListing(kind: GoodsKind, sku: string, price: number, seller: string): Listing {
  return {
    id: newId("mkt"),
    kind,
    sku,
    price: clampAsk(price),
    seller,
    listed: Date.now(),
  };
}

export function boardOf(yours: Listing[], gone: string[]): Listing[] {
  const live = NPC_BOARD.filter((l) => !gone.includes(l.id));
  return [...yours, ...live];
}

export const SKIN_SKUS = DLC.map((s) => s.id);
export const ITEM_SKUS = ITEMS.map((i) => i.id);
