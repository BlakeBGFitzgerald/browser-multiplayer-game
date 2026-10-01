/** Match inventory. Six slots per hero. Gold stays on the hero. */

export const SLOT_COUNT = 6;

/** Refund when an item does not set its own sellValue. */
export const SELL_RATIO = 0.5;

/** Cap used when an item is stackable and omits maxStack. */
export const DEFAULT_STACK_MAX = 3;

/** Cooldown used when an active item omits activeCd. */
export const DEFAULT_ACTIVE_CD = 8;

export const MSG_FULL = "Inventory full";
export const MSG_GOLD = "Not enough gold";

export type ItemSlot = {
  id: string;
  count: number;
  cd: number;
};

export type TimedBuff = {
  slot: number;
  kind: string;
};

export type Carrier = {
  gold: number;
  slots: Array<ItemSlot | null>;
  buff: TimedBuff | null;
};

export type Stock = {
  id: string;
  cost: number;
  sellValue?: number;
  stackable?: boolean;
  maxStack?: number;
  active?: string;
  activeCd?: number;
  heal?: number;
  consume?: string;
  /** Quick-buy places these ids. The purchase is all-or-nothing. */
  recipe?: string[];
};

export type BuyResult =
  | { ok: true; spent: number; gold: number }
  | { ok: false; reason: "gold" | "full" | "missing"; message: string };

export type SellResult =
  | { ok: true; refund: number; gold: number; clearedBuff: boolean; buffKind: string }
  | { ok: false; reason: "empty"; message: string };

export type ActivateResult =
  | { ok: true; effect: string; heal: number; consume: string }
  | { ok: false; reason: "empty" | "cooldown" | "inert"; message: string };

export function emptyCarrier(gold = 0): Carrier {
  const slots: Array<ItemSlot | null> = [];
  for (let i = 0; i < SLOT_COUNT; i++) slots.push(null);
  return { gold, slots, buff: null };
}

export function sellValueOf(item: { cost: number; sellValue?: number }): number {
  if (typeof item.sellValue === "number") return item.sellValue;
  return Math.floor(item.cost * SELL_RATIO);
}

export function stackMax(item: Stock): number {
  if (!item.stackable) return 1;
  const cap = item.maxStack ?? DEFAULT_STACK_MAX;
  return cap > 1 ? cap : DEFAULT_STACK_MAX;
}

export function stackLabel(count: number): string {
  return count > 1 ? String(count) : "";
}

export function slotFree(slots: Array<ItemSlot | null>): boolean {
  for (const slot of slots) if (!slot) return true;
  return false;
}

export function ownedIds(slots: Array<ItemSlot | null>): string[] {
  const ids: string[] = [];
  for (const slot of slots) if (slot) ids.push(slot.id);
  return ids;
}

export function normalizeSlots(slots: Array<ItemSlot | null>): Array<ItemSlot | null> {
  const out = emptyCarrier().slots;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const slot = slots[i];
    if (!slot || !slot.id) continue;
    out[i] = { id: slot.id, count: Math.max(1, slot.count || 1), cd: Math.max(0, slot.cd || 0) };
  }
  return out;
}

export function slotsFromSnap(
  items: string[],
  slots?: string[],
  counts?: number[],
  cds?: number[],
): Array<ItemSlot | null> {
  if (slots && slots.length === SLOT_COUNT) {
    return normalizeSlots(
      slots.map((id, i) => (id ? { id, count: counts?.[i] ?? 1, cd: cds?.[i] ?? 0 } : null)),
    );
  }
  const out = emptyCarrier().slots;
  let n = 0;
  for (const id of items) {
    if (!id || n >= SLOT_COUNT) continue;
    out[n] = { id, count: 1, cd: 0 };
    n += 1;
  }
  return out;
}

export function snapSlots(slots: Array<ItemSlot | null>): {
  slots: string[];
  slotCounts: number[];
  slotCds: number[];
} {
  const laid = normalizeSlots(slots);
  return {
    slots: laid.map((slot) => slot?.id ?? ""),
    slotCounts: laid.map((slot) => slot?.count ?? 0),
    slotCds: laid.map((slot) => slot?.cd ?? 0),
  };
}

function findStock(catalog: Stock[], id: string): Stock | undefined {
  return catalog.find((item) => item.id === id);
}

function cloneSlots(slots: Array<ItemSlot | null>): Array<ItemSlot | null> {
  return slots.map((slot) => (slot ? { id: slot.id, count: slot.count, cd: slot.cd } : null));
}

function placeOne(slots: Array<ItemSlot | null>, item: Stock): Array<ItemSlot | null> | null {
  const next = cloneSlots(slots);
  const cap = stackMax(item);
  if (item.stackable) {
    const idx = next.findIndex((slot) => slot && slot.id === item.id && slot.count < cap);
    if (idx >= 0) {
      const slot = next[idx];
      if (slot) slot.count += 1;
      return next;
    }
  }
  const hole = next.findIndex((slot) => !slot);
  if (hole < 0) return null;
  next[hole] = { id: item.id, count: 1, cd: 0 };
  return next;
}

function expand(item: Stock, catalog: Stock[]): Stock[] | null {
  if (!item.recipe || item.recipe.length === 0) return [item];
  const parts: Stock[] = [];
  for (const id of item.recipe) {
    const part = findStock(catalog, id);
    if (!part) return null;
    parts.push(part);
  }
  return parts;
}

function placeMany(slots: Array<ItemSlot | null>, items: Stock[]): Array<ItemSlot | null> | null {
  let next = cloneSlots(slots);
  for (const item of items) {
    const placed = placeOne(next, item);
    if (!placed) return null;
    next = placed;
  }
  return next;
}

export function canPlaceItem(slots: Array<ItemSlot | null>, item: Stock, catalog: Stock[]): boolean {
  const parts = expand(item, catalog);
  if (!parts) return false;
  return placeMany(slots, parts) !== null;
}

export function roomLabel(slots: Array<ItemSlot | null>, item: Stock, catalog: Stock[]): string {
  const fits = canPlaceItem(slots, item, catalog);
  if (!fits) return MSG_FULL;
  if (slotFree(slots)) return "slot free";
  return "stacks";
}

export function buy(carrier: Carrier, itemId: string, catalog: Stock[]): BuyResult {
  const item = findStock(catalog, itemId);
  if (!item) return { ok: false, reason: "missing", message: "Unknown item" };
  const parts = expand(item, catalog);
  if (!parts) return { ok: false, reason: "missing", message: "Unknown item" };
  if (carrier.gold < item.cost) return { ok: false, reason: "gold", message: MSG_GOLD };
  const next = placeMany(carrier.slots, parts);
  if (!next) return { ok: false, reason: "full", message: MSG_FULL };
  carrier.gold -= item.cost;
  carrier.slots = next;
  return { ok: true, spent: item.cost, gold: carrier.gold };
}

export function sell(carrier: Carrier, index: number, catalog: Stock[]): SellResult {
  const slot = carrier.slots[index];
  if (!slot) return { ok: false, reason: "empty", message: "Empty slot" };
  const item = findStock(catalog, slot.id);
  const refund = item ? sellValueOf(item) : 0;
  const cleared = carrier.buff?.slot === index;
  const buffKind = cleared ? (carrier.buff?.kind ?? "") : "";
  if (cleared) carrier.buff = null;
  if (slot.count > 1) {
    slot.count -= 1;
    slot.cd = 0;
  } else {
    carrier.slots[index] = null;
  }
  carrier.gold += refund;
  return { ok: true, refund, gold: carrier.gold, clearedBuff: cleared, buffKind };
}

function effectOf(item: Stock): string {
  if (item.active) return item.active;
  if (item.heal && item.heal > 0) return "heal";
  if (item.consume) return item.consume;
  return "";
}

export function activate(carrier: Carrier, index: number, catalog: Stock[]): ActivateResult {
  const slot = carrier.slots[index];
  if (!slot) return { ok: false, reason: "empty", message: "Empty slot" };
  const item = findStock(catalog, slot.id);
  if (!item) return { ok: false, reason: "inert", message: "Unknown item" };
  const effect = effectOf(item);
  if (!effect) return { ok: false, reason: "inert", message: "No active" };
  if (slot.cd > 0) return { ok: false, reason: "cooldown", message: "Cooling down" };
  const consumes = Boolean(item.consume) || (Boolean(item.heal) && Boolean(item.stackable) && !item.active);
  if (!consumes) {
    slot.cd = item.activeCd ?? DEFAULT_ACTIVE_CD;
    if (item.active === "haste" || item.active === "shield") {
      carrier.buff = { slot: index, kind: item.active };
    }
  }
  if (consumes) {
    if (slot.count > 1) slot.count -= 1;
    else carrier.slots[index] = null;
  }
  return { ok: true, effect, heal: item.heal ?? 0, consume: item.consume ?? "" };
}
