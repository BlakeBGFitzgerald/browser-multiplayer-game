/**
 * AI buy list for the existing Gift Shop. Ids, prices, and recipes stay in giftShop.
 * Six bag slots stay in inventory. This file only chooses the next real id.
 */

import {
  GIFT_ITEMS,
  buildsInto,
  giftById,
  quotePurchase,
  totalCost,
  type Purse,
} from "./giftShop.ts";
import { sellValueOf } from "./inventory.ts";

export type AiRole = "melee" | "ranged" | "tank" | "support" | "mma";
export type AiPhase = "early" | "mid" | "late";

export type AiBuild = {
  early: string[];
  mid: string[];
  late: string[];
};

/**
 * Early, mid, and late ids per role. Each list is a different set.
 * Recipes consume components, so a full bag is the tail of the list, not every row at once.
 */
export const AI_ROLE_BUILDS: Record<AiRole, AiBuild> = {
  melee: {
    early: ["chalk", "gum", "socks"],
    mid: ["ulock", "text", "guards"],
    late: ["slam", "dean", "kicks"],
  },
  ranged: {
    early: ["chalk", "lace", "metro"],
    mid: ["pen", "cleats", "chip"],
    late: ["sticks", "chain", "stamp"],
  },
  tank: {
    early: ["gum", "pamphlet", "clip"],
    mid: ["meal", "coat", "socks"],
    late: ["plate", "parade", "aegis"],
  },
  support: {
    early: ["clip", "pencil", "pom"],
    mid: ["bandage", "bead", "compass"],
    late: ["care", "buddy", "lantern"],
  },
  mma: {
    early: ["chalk", "gum", "lace"],
    mid: ["chip", "ulock", "cleats"],
    late: ["horn", "tray", "crown"],
  },
};

/** Real armor rows. Bought ahead of the list when physical deaths pile up. */
export const AI_ARMOR: Record<AiRole, string> = {
  melee: "plate",
  ranged: "vest",
  tank: "aegis",
  support: "vest",
  mma: "coat",
};

const LOW_CASTS = ["heal", "shield", "popshield", "haste"] as const;
const FIGHT_CASTS = ["haste", "shield", "popshield"] as const;

/** Match purse at the fountain. The spawn path spends this through the real shop. */
export const OPENING_GOLD = 420;

const SUPPORT_PRIMARY = new Set(["support", "disable", "controller"]);

export type RoleHint = {
  melee: boolean;
  wing: string;
  /** HeroDef.role, such as "Tank / Fighter" or "Carry". */
  role?: string;
  attr?: string;
};

/**
 * Shop list from the kit that already exists.
 * MMA and ranged stay on those lists only when the hero actually is one.
 * A strength frontliner uses tank or melee from the role field and the kit band.
 * Intelligence casters and supports use the support list.
 */
export function aiRoleOf(hero: RoleHint, band: string): AiRole {
  if (hero.wing === "mma") return "mma";
  const words = (hero.role ?? "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 0);
  const primary = words[0] ?? "";
  const supportWord = SUPPORT_PRIMARY.has(primary);
  if (primary === "tank" || (band === "tank" && !supportWord)) return "tank";
  if (supportWord || band === "support" || band === "controller") return "support";
  const intelligence =
    hero.attr === "int" &&
    (band === "mage" || primary === "mage" || primary === "nuker" || words.includes("mage") || words.includes("artillery"));
  if (intelligence) return "support";
  if (!hero.melee || band === "marksman" || band === "mage") return "ranged";
  return "melee";
}

/** Early while the hero is still finding a build. Mid and late follow the level, not the clock. */
export function aiPhaseForLevel(level: number): AiPhase {
  if (level >= 9) return "late";
  if (level >= 5) return "mid";
  return "early";
}

/**
 * Buy early ids the purse can afford, in list order. Skip a row that costs too much.
 * Gold that cannot buy a real early id stays in the purse.
 */
export function spendOpeningGold(role: AiRole, gold = OPENING_GOLD, owned: readonly string[] = []): Purse {
  let purse: Purse = { gold, items: owned.slice() };
  for (const id of AI_ROLE_BUILDS[role].early) {
    if (purse.items.includes(id)) continue;
    if (purse.items.length >= 6) break;
    if (!giftById(id)) continue;
    const quote = quotePurchase(purse, id);
    if (!quote.ok) continue;
    purse = quote.next;
  }
  return purse;
}

export type LevelBias = {
  hp: number;
  armor: number;
  ms: number;
  aspd: number;
  mana: number;
  manaRegen: number;
  hpRegen: number;
};

/** Hard stop so a long match cannot stack this bonus without bound. Level 11 sits under each cap. */
const BIAS_CAP: LevelBias = {
  hp: 90,
  armor: 5,
  ms: 24,
  aspd: 0.1,
  mana: 80,
  manaRegen: 2,
  hpRegen: 1.2,
};

function biasSteps(level: number): number {
  return Math.max(0, level - 1);
}

function capBias(n: number, cap: number): number {
  if (n <= 0) return 0;
  return n > cap ? cap : n;
}

/**
 * Small linear extra on the shared per-level line. Level 1 adds nothing.
 * Tanks pick up health and armor. Agility-like roles pick up move and attack speed.
 * Supports pick up mana and regen. Early steps stay small.
 */
export function roleLevelBonus(role: AiRole, level: number): LevelBias {
  const n = biasSteps(level);
  if (role === "tank") {
    return {
      hp: capBias(n * 8, BIAS_CAP.hp),
      armor: capBias(n * 0.4, BIAS_CAP.armor),
      ms: 0,
      aspd: 0,
      mana: 0,
      manaRegen: 0,
      hpRegen: 0,
    };
  }
  if (role === "support") {
    return {
      hp: 0,
      armor: 0,
      ms: 0,
      aspd: 0,
      mana: capBias(n * 6, BIAS_CAP.mana),
      manaRegen: capBias(n * 0.15, BIAS_CAP.manaRegen),
      hpRegen: capBias(n * 0.05, BIAS_CAP.hpRegen),
    };
  }
  const msPer = role === "mma" ? 2 : role === "ranged" ? 1.8 : 1.5;
  const aspdPer = role === "ranged" ? 0.009 : role === "mma" ? 0.008 : 0.007;
  return {
    hp: 0,
    armor: 0,
    ms: capBias(n * msPer, BIAS_CAP.ms),
    aspd: capBias(n * aspdPer, BIAS_CAP.aspd),
    mana: 0,
    manaRegen: 0,
    hpRegen: 0,
  };
}

export function aiRoleIds(role: AiRole): string[] {
  const b = AI_ROLE_BUILDS[role];
  return [...b.early, ...b.mid, ...b.late];
}

export function wishList(role: AiRole, phase: AiPhase): string[] {
  const b = AI_ROLE_BUILDS[role];
  const ids = [...b.early];
  if (phase !== "early") ids.push(...b.mid);
  if (phase === "late") ids.push(...b.late);
  return ids;
}

/**
 * Shop search for an item that already cuts, fells, or passes trees.
 * Returns null when the catalogue has no such row.
 */
export function treeCutItemId(): string | null {
  for (const it of GIFT_ITEMS) {
    const blob = `${it.id} ${it.name} ${it.description} ${it.passive ?? ""} ${it.active ?? ""}`.toLowerCase();
    const cuts = /\b(cut|chop|fell|quell|hatchet|timber)\b/.test(blob) || /\bdestroy(?:s|ed)? trees?\b/.test(blob);
    const trees = /\b(tree|trees|trunk|trunks)\b/.test(blob);
    if (cuts && trees) return it.id;
  }
  return null;
}

export type BuyPlan =
  | { ok: true; next: Purse; sold: string | null }
  | { ok: false; reason: string };

/** Quote a buy. If the bag is full, sell one completed component and quote again. */
export function planPurchase(purse: Purse, want: string): BuyPlan {
  const first = quotePurchase(purse, want);
  if (first.ok) return { ok: true, next: first.next, sold: null };
  if (first.reason !== "Bag is full") return { ok: false, reason: first.reason };
  const victim = componentToSell(purse.items, want);
  if (!victim) return { ok: false, reason: first.reason };
  const trimmed = dropItem(purse, victim);
  const second = quotePurchase(trimmed, want);
  if (!second.ok) return { ok: false, reason: second.reason };
  return { ok: true, next: second.next, sold: victim };
}

export type BuyStep = { buyId: string; sellId: string | null };

export function nextAiBuy(
  purse: Purse,
  role: AiRole,
  phase: AiPhase,
  opts: { preferArmor: boolean; lowHp: boolean },
): BuyStep | null {
  if (opts.lowHp && !purse.items.includes("juice") && purse.items.length < 6 && giftById("juice")) {
    const heal = quotePurchase(purse, "juice");
    if (heal.ok && heal.spend <= purse.gold) return { buyId: "juice", sellId: null };
  }
  if (opts.preferArmor) {
    const armor = AI_ARMOR[role];
    if (armor && giftById(armor) && !purse.items.includes(armor)) {
      const planned = planPurchase(purse, armor);
      if (planned.ok) return { buyId: armor, sellId: planned.sold };
    }
  }
  for (const id of wishList(role, phase)) {
    if (purse.items.includes(id)) continue;
    const it = giftById(id);
    if (!it) continue;
    const planned = planPurchase(purse, id);
    if (planned.ok) return { buyId: id, sellId: planned.sold };
    if (planned.reason.startsWith("Need")) return null;
  }
  return null;
}

export function pickActiveIndex(
  slots: ReadonlyArray<{ id: string; cd: number } | null>,
  mode: "low" | "fight",
): number {
  const order = mode === "low" ? LOW_CASTS : FIGHT_CASTS;
  for (const cast of order) {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot || slot.cd > 0) continue;
      const it = giftById(slot.id);
      if (it?.cast === cast) return i;
    }
  }
  return -1;
}

/** True when the page asked for purchase logs. Default is off. Does not grant gold. */
export function aiShopDebug(): boolean {
  const search = globalThis.location?.search;
  if (!search) return false;
  return new URLSearchParams(search).get("aiShop") === "1";
}

/** Lane-deploy traces. Off unless the page has `?bots=1`. */
export function botDeployDebug(): boolean {
  const search = globalThis.location?.search;
  if (!search) return false;
  return new URLSearchParams(search).get("bots") === "1";
}

function componentToSell(items: readonly string[], want: string): string | null {
  let best: string | null = null;
  let bestCost = Infinity;
  for (const id of items) {
    if (id === want) continue;
    if (buildsInto(id).length === 0) continue;
    const cost = totalCost(id);
    if (cost < bestCost) {
      bestCost = cost;
      best = id;
    }
  }
  return best;
}

function dropItem(purse: Purse, id: string): Purse {
  const it = giftById(id);
  const idx = purse.items.indexOf(id);
  if (!it || idx < 0) return purse;
  const items = purse.items.slice();
  items.splice(idx, 1);
  return { gold: purse.gold + sellValueOf(it), items };
}
