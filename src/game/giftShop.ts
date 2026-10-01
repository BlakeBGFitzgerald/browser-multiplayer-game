/**
 * In-match Gift Shop catalogue.
 *
 * Cost model: `cost` is the assembly price of that row only.
 * Total = assembly + each direct component's total.
 * A basic that sits in two branches is counted once per branch, because each
 * branch is its own build. Quick buy subtracts a part you already hold once.
 *
 * Theme tints the thumbnail backdrop and the aisle line. Stat numbers ignore theme.
 *
 * Approximations (the match has no second ability engine):
 * - Quiet Soles: a hush-step is just move speed.
 * - Buddy Banner: a lane aura is regen and armor on you. Allies do not share it.
 * - Slow Jar: on-hit slow uses the existing slow timer.
 * - Spell rows: ability percent multiplies spell damage the match already uses.
 * - Attack speed shortens the existing swing period.
 * - Haste and shield are the bag click the match already casts.
 * - Heals, mana, cleanse, ward, smoke, and the sticker shield fire once on purchase.
 * - Walkie Talkie ping is flavor. The detail panel says it does not cast.
 */

import { HEROES } from "./heroes.ts";
import { DEFAULT_STACK_MAX, SLOT_COUNT } from "./inventory.ts";
import { kitPatch, type RoleBand } from "./kits.ts";

export type ShopCategory =
  | "starting"
  | "consumables"
  | "boots"
  | "damage"
  | "defense"
  | "support"
  | "utility"
  | "magic"
  | "attack"
  | "advanced";

export type ShopTheme = "NONE" | "MAGA_PARODY" | "ANTIFA_PARODY";

export type ShopBuildRole = "marksman" | "damage" | "tank" | "mage" | "support";

/** Bag click or one-shot the match can actually run. */
export type GiftCast = "haste" | "shield" | "heal" | "mana" | "cleanse" | "ward" | "smoke" | "popshield";

export type GiftItem = {
  id: string;
  name: string;
  /** Assembly cost. Not the tree total. */
  cost: number;
  category: ShopCategory;
  description: string;
  passive?: string;
  /** Player-facing active line. Without `cast`, it is flavor and does not fire. */
  active?: string;
  cast?: GiftCast;
  activeCd?: number;
  components: string[];
  /** Authored visual default. The open shop still follows the buyer's team. */
  theme: ShopTheme;
  /** Thumbnail painter id. Same as id. */
  painter: string;
  /** Shown when the fantasy is only partly in the match. */
  approx?: string;
  hp?: number;
  mana?: number;
  damage?: number;
  armor?: number;
  mr?: number;
  ms?: number;
  /** Fraction of the swing period removed. 0.1 is 10% faster. */
  aspd?: number;
  hpRegen?: number;
  manaRegen?: number;
  splash?: number;
  splashR?: number;
  crit?: number;
  critX?: number;
  bash?: number;
  bashT?: number;
  trueSight?: number;
  /** Multiplier on ability damage. 1.08 is +8%. */
  spellAmp?: number;
  slowOnHit?: number;
  heal?: number;
  manaRestore?: number;
  shieldPop?: number;
  /** Same id shares one slot up to maxStack. */
  stackable?: boolean;
  maxStack?: number;
  /** Refund for one. Omitted items sell for half the buy cost. */
  sellValue?: number;
};

export type GiftNumbers = {
  hp: number;
  mana: number;
  damage: number;
  armor: number;
  mr: number;
  ms: number;
  aspd: number;
  hpRegen: number;
  manaRegen: number;
  splash: number;
  splashR: number;
  crit: number;
  critX: number;
  bash: number;
  bashT: number;
  spellAmp: number;
  slowOnHit: number;
  trueSight: number;
};

export type HeroBuild = {
  hero: string;
  startingItems: string[];
  earlyItems: string[];
  coreItems: string[];
  situationalItems: string[];
  luxuryItems: string[];
};

export type Purse = { gold: number; items: string[] };

export type BuyQuote = {
  ok: boolean;
  spend: number;
  reason: string;
  consumed: string[];
  next: Purse;
};

/** Same six pockets as the hero inventory. */
export const BAG_SLOTS = SLOT_COUNT;
export const GIFT_THEME_DEFAULT: ShopTheme = "NONE";

export const SHOP_TABS: { id: ShopCategory | "all" | "builds"; label: string }[] = [
  { id: "starting", label: "Starting" },
  { id: "consumables", label: "Consumables" },
  { id: "boots", label: "Boots" },
  { id: "damage", label: "Damage" },
  { id: "defense", label: "Defense" },
  { id: "support", label: "Support" },
  { id: "utility", label: "Utility" },
  { id: "magic", label: "Magic" },
  { id: "attack", label: "Attack" },
  { id: "advanced", label: "Advanced" },
  { id: "all", label: "All Items" },
  { id: "builds", label: "Builds" },
];

const CONSUME: ReadonlySet<GiftCast> = new Set(["heal", "mana", "cleanse", "ward", "smoke", "popshield"]);

function g(
  id: string,
  name: string,
  cost: number,
  category: ShopCategory,
  description: string,
  extra: Partial<GiftItem> = {},
): GiftItem {
  return {
    components: [],
    theme: "NONE",
    ...extra,
    id,
    name,
    cost,
    category,
    description,
    painter: extra.painter ?? id,
  };
}

export const GIFT_ITEMS: GiftItem[] = [
  g("chalk", "Quad Chalk", 60, "starting", "A stub from the quad blackboard. It still thinks it is a weapon.", { damage: 3 }),
  g("pamphlet", "Folded Pamphlet", 55, "starting", "Folded until the jokes are thick enough to count as armor.", { armor: 2 }),
  g("gum", "Cafeteria Gum", 70, "starting", "One piece. The cafeteria clock says it is a meal.", { hp: 40 }),
  g("lace", "Spare Lace", 50, "starting", "The spare from a gym bag. Tie it on and the lane gets shorter.", { ms: 10 }),
  g("pencil", "Stub Pencil", 55, "starting", "Chewed. Still holds a little mana in the graphite.", { mana: 32 }),
  g("clip", "Paper Clip", 45, "starting", "Bent straight, then bent back. A tiny bandage that learned geometry.", { hpRegen: 0.6 }),

  g("flare", "Ward Flare", 80, "consumables", "Pops a ward at your feet. The match already knows this flare.", {
    cast: "ward",
    active: "Drop a ward where you stand.",
  }),
  g("smoke", "Smoke Can", 90, "consumables", "You fade for a few seconds. Woods and smoke hide you from far eyes.", {
    cast: "smoke",
    active: "Fade for 5 seconds.",
  }),
  g("juice", "Juice Box", 75, "consumables", "Warm juice. The straw points at your health bar.", {
    cast: "heal",
    heal: 140,
    active: "Heal 140 when you buy it.",
  }),
  g("espresso", "Quad Espresso", 80, "consumables", "Four shots in a paper cup. The mana comes back awake.", {
    cast: "mana",
    manaRestore: 90,
    active: "Restore 90 mana when you buy it.",
  }),
  g("wipe", "Wet Wipe", 65, "consumables", "Campus lemon. It takes the slow off your shoes.", {
    cast: "cleanse",
    active: "Clear a slow when you buy it.",
  }),
  g("sticker", "Bumper Sticker", 60, "consumables", "Slaps a little shield on your jacket. One slap.", {
    theme: "MAGA_PARODY",
    cast: "popshield",
    shieldPop: 80,
    active: "A small shield when you buy it.",
  }),

  g("socks", "Tube Socks", 110, "boots", "Striped. The stripe is faster than the sock deserves.", { ms: 14 }),
  g("cleats", "Track Cleats", 180, "boots", "The track shed's loudest pair. They keep the spare lace.", {
    components: ["lace"],
    ms: 28,
    passive: "Move speed from the track shed.",
  }),
  g("guards", "Cleat Guards", 150, "boots", "Plastic over the socks so the quad stops biting your ankles.", {
    components: ["socks"],
    ms: 16,
    armor: 2,
  }),
  g("parade", "Parade Boots", 280, "boots", "Shined for a rally that was mostly a marching band.", {
    theme: "MAGA_PARODY",
    components: ["cleats", "pamphlet"],
    ms: 36,
    armor: 4,
    passive: "Heavy step, thicker hide.",
  }),
  g("quiet", "Quiet Soles", 210, "boots", "Rubber that wants to sneak. The match only pays you in speed.", {
    theme: "ANTIFA_PARODY",
    components: ["guards"],
    ms: 24,
    passive: "A hush-step.",
    approx: "Quiet step is move speed. This match has no separate sneak stat.",
  }),
  g("kicks", "Megaphone Kicks", 400, "boots", "Boots with a speaker in the heel. Click the bag for a short haste.", {
    theme: "MAGA_PARODY",
    components: ["parade"],
    ms: 42,
    damage: 8,
    cast: "haste",
    activeCd: 16,
    active: "Click the bag slot. A short haste.",
  }),

  g("text", "Annotated Text", 220, "damage", "Someone underlined the mean sentences. They hit harder.", {
    components: ["chalk"],
    damage: 14,
  }),
  g("chip", "Bullhorn Chip", 190, "damage", "A cracked speaker cone. Crits like a feedback squeal.", {
    damage: 8,
    crit: 0.06,
    critX: 1.6,
  }),
  g("dean", "Dean's List", 340, "damage", "Your name in gold ink. The gold is paint. The damage is not.", {
    components: ["text", "chip"],
    damage: 20,
    hp: 70,
  }),
  g("horn", "Handheld Megaphone", 250, "damage", "Points at the other fountain and believes that is tactics.", {
    theme: "MAGA_PARODY",
    components: ["chip"],
    damage: 12,
  }),
  g("rant", "Rant Notes", 220, "damage", "Index cards in a rubber band. Each card is a swing.", {
    theme: "ANTIFA_PARODY",
    components: ["text"],
    damage: 15,
  }),
  g("crown", "Capitol Crown", 700, "damage", "Cardboard points sprayed gold. The crits forgot it was cardboard.", {
    theme: "MAGA_PARODY",
    components: ["dean", "horn"],
    damage: 24,
    hp: 50,
    crit: 0.1,
    critX: 1.75,
    passive: "Late swings crit a little harder.",
  }),

  g("meal", "Meal Plan", 240, "defense", "The plan is one tray and a lot of health.", {
    components: ["gum"],
    hp: 150,
  }),
  g("coat", "Lab Coat", 210, "defense", "It survived chemistry. Armor is a side effect.", {
    components: ["pamphlet"],
    armor: 6,
  }),
  g("plate", "Barricade Plate", 360, "defense", "A cafeteria tray that graduated into a wall.", {
    components: ["meal", "coat"],
    hp: 140,
    armor: 6,
  }),
  g("vest", "Reflective Vest", 240, "defense", "Orange, then not. It shrugs off a little magic.", {
    components: ["coat"],
    armor: 4,
    hp: 60,
    mr: 3,
  }),
  g("aegis", "Needle Aegis", 580, "defense", "A stitched shield. The needles are the aesthetic.", {
    components: ["plate"],
    hp: 200,
    armor: 8,
    passive: "A fat pool of health and armor.",
  }),
  g("hourglass", "Hourglass", 300, "defense", "Click the bag. Sand becomes a shield for a moment.", {
    components: ["gum", "pamphlet"],
    hp: 60,
    cast: "shield",
    activeCd: 18,
    active: "Click the bag slot. A fat shield.",
  }),
  g("hoodie", "Hoodie", 180, "defense", "The hood is up. The quad wind counts as mitigation.", {
    theme: "ANTIFA_PARODY",
    hp: 70,
    armor: 2,
    mr: 3,
  }),

  g("bandage", "Bandage Roll", 130, "support", "Campus gauze. Health trickles back between waves.", {
    components: ["clip"],
    hpRegen: 1.4,
    hp: 40,
  }),
  g("bead", "Group Chat Bead", 140, "support", "A bead that vibrates when the chat is mad. Mana likes it.", {
    theme: "ANTIFA_PARODY",
    components: ["pencil"],
    manaRegen: 1.1,
    mana: 40,
  }),
  g("pom", "Pom Pom", 100, "support", "Shaken at the fountain. A little regen, a little speed.", {
    hpRegen: 0.5,
    ms: 6,
  }),
  g("care", "Care Package", 280, "support", "Socks, gauze, and a note that says drink water.", {
    components: ["bandage", "pom"],
    hpRegen: 2,
    hp: 70,
  }),
  g("buddy", "Buddy Banner", 360, "support", "A little flag that was supposed to warm the whole lane.", {
    theme: "ANTIFA_PARODY",
    components: ["care", "bead"],
    hpRegen: 1.6,
    manaRegen: 1,
    armor: 3,
    hp: 40,
    passive: "Regen and armor.",
    approx: "The lane aura stays on you. Allies do not gain it.",
  }),
  g("choir", "Choir Card", 200, "support", "Four-part harmony, one singer. Mana regen anyway.", {
    components: ["bead"],
    manaRegen: 1.4,
    mana: 50,
  }),

  g("compass", "Quad Compass", 160, "utility", "Points at the fountain you already know. Sight comes along.", {
    ms: 8,
    trueSight: 120,
  }),
  g("lantern", "Campus Lantern", 480, "utility", "True sight nearby, and a little armor from the brass.", {
    armor: 4,
    trueSight: 220,
    passive: "Reveals stealth in a short radius.",
  }),
  g("map", "Pocket Map", 170, "utility", "The quad, folded wrong. You still see a bit farther.", {
    components: ["compass"],
    ms: 10,
    trueSight: 160,
  }),
  g("whistle", "Brass Whistle", 200, "utility", "Click the bag. The whistle is a short haste.", {
    components: ["lace"],
    ms: 12,
    cast: "haste",
    activeCd: 16,
    active: "Click the bag slot. A short haste.",
  }),
  g("banner", "Mall Banner", 320, "utility", "Borrowed from a kiosk. Click the bag when you want to be early.", {
    theme: "MAGA_PARODY",
    components: ["whistle", "chalk"],
    damage: 8,
    ms: 8,
    cast: "haste",
    activeCd: 16,
    active: "Click the bag slot. A short haste.",
  }),
  g("walkie", "Walkie Talkie", 180, "utility", "A plastic brick with a heroic antenna.", {
    components: ["compass"],
    manaRegen: 0.5,
    trueSight: 90,
    active: "Call a gold ping across the quad.",
    approx: "The ping is flavor. The match does not cast it.",
  }),

  g("card", "Index Card", 170, "magic", "One thesis, both sides. Damage and a sip of mana.", {
    damage: 5,
    mana: 50,
  }),
  g("thesis", "Thesis Draft", 220, "magic", "Unfinished on purpose. The mana pool does not care.", {
    components: ["card"],
    mana: 80,
    manaRegen: 0.8,
  }),
  g("candle", "Vigil Candle", 160, "magic", "A small flame that argues with incoming spells.", {
    components: ["pencil"],
    manaRegen: 1.2,
    mana: 36,
    mr: 2,
  }),
  g("chant", "Chant Notes", 340, "magic", "The chorus makes ability damage a little ruder.", {
    theme: "ANTIFA_PARODY",
    components: ["thesis", "clip"],
    damage: 8,
    mana: 50,
    spellAmp: 1.08,
    passive: "Ability damage is a little higher.",
  }),
  g("orb", "Glass Orb", 500, "magic", "A paperweight that thinks it is a crystal ball.", {
    components: ["chant"],
    damage: 10,
    mana: 70,
    spellAmp: 1.12,
    mr: 4,
    passive: "Ability damage steps up again.",
  }),
  g("prism", "Lecture Prism", 420, "magic", "Splits the overhead light into a spell and a shrug.", {
    components: ["orb", "candle"],
    damage: 8,
    mana: 40,
    spellAmp: 1.08,
    mr: 5,
  }),

  g("metro", "Pocket Metronome", 180, "attack", "Ticks faster than the swing wants to.", {
    aspd: 0.1,
    passive: "Attack speed. The swing period gets shorter.",
  }),
  g("pen", "Red Pen", 200, "attack", "The pen believes in crits. The paper never asked.", {
    components: ["chalk"],
    damage: 10,
    crit: 0.12,
    critX: 1.8,
  }),
  g("tray", "Cafeteria Tray", 220, "attack", "Splash. Nearby rivals eat part of the hit.", {
    components: ["gum"],
    damage: 8,
    splash: 0.4,
    splashR: 160,
    passive: "Splash a share of the hit onto nearby rivals.",
  }),
  g("ulock", "Bike U-Lock", 240, "attack", "A chance to bash. The bike is still missing.", {
    components: ["clip"],
    damage: 11,
    bash: 0.14,
    bashT: 1.05,
    passive: "A chance to stun on hit.",
  }),
  g("sticks", "Drumline Sticks", 300, "attack", "Two sticks and a metronome. The swing keeps time.", {
    components: ["metro", "pen"],
    aspd: 0.12,
    damage: 8,
    crit: 0.06,
    critX: 1.7,
  }),
  g("chain", "Stapler Chain", 360, "attack", "Stapled into a whip. Crits, and the splash stayed.", {
    components: ["pen", "tray"],
    damage: 14,
    crit: 0.14,
    critX: 1.85,
    splash: 0.3,
    splashR: 150,
  }),
  g("slam", "Lectern Slam", 380, "attack", "The lectern comes off the desk. Bash and splash.", {
    components: ["ulock", "tray"],
    damage: 14,
    bash: 0.16,
    bashT: 1.1,
    splash: 0.28,
    splashR: 150,
  }),
  g("jar", "Slow Jar", 160, "attack", "Opens on a hit. Their shoes argue with the floor.", {
    damage: 4,
    slowOnHit: 1.1,
    passive: "Hits apply a short slow.",
    approx: "The slow uses the existing slow timer.",
  }),
  g("stamp", "Red Stamp Press", 540, "attack", "APPROVED, in red, on the rival. Crits and swings faster.", {
    theme: "MAGA_PARODY",
    components: ["chain", "sticks"],
    damage: 16,
    crit: 0.18,
    critX: 1.9,
    aspd: 0.08,
  }),

  g("seal", "Campus Wax Seal", 400, "advanced", "A red blob that pretends to be a relic component.", {
    hp: 50,
    damage: 6,
    armor: 2,
  }),
  g("relic", "Quad Relic", 520, "advanced", "The seal grew a pedestal. Still a joke. Still stats.", {
    components: ["seal"],
    hp: 90,
    armor: 4,
    damage: 10,
  }),
  g("filibuster", "Filibuster Gavel", 780, "advanced", "Secret. It talks so long the swing becomes policy.", {
    theme: "MAGA_PARODY",
    components: ["crown", "slam"],
    damage: 22,
    hp: 100,
    crit: 0.08,
    critX: 1.7,
    bash: 0.06,
    bashT: 0.8,
    passive: "A loud final. Damage, health, a little crit, a little bash.",
  }),
  g("consensus", "Consensus Circle", 760, "advanced", "Secret. Everyone agreed, which is how you know it is fiction.", {
    theme: "ANTIFA_PARODY",
    components: ["buddy", "prism"],
    hp: 120,
    armor: 5,
    mana: 60,
    spellAmp: 1.06,
    hpRegen: 1.2,
    passive: "Health, armor, and a bump to ability damage.",
  }),
  g("mug", "The Ancient Mug", 720, "advanced", "Secret. The fountain coffee achieved tenure.", {
    components: ["aegis", "kicks"],
    hp: 150,
    armor: 5,
    ms: 16,
    damage: 10,
  }),
  g("syllabus", "Forbidden Syllabus", 800, "advanced", "Secret. The reading list bites. Ability damage believes the footnotes.", {
    components: ["orb", "dean"],
    damage: 18,
    mana: 100,
    spellAmp: 1.14,
  }),
  g("podium", "Podium of Yelling", 680, "advanced", "Secret. A box, a megaphone, and the belief that volume is range.", {
    theme: "MAGA_PARODY",
    components: ["kicks", "horn"],
    ms: 14,
    damage: 16,
  }),
  g("zine", "Endless Zine", 700, "advanced", "Secret. Page one is the spell. There is no last page.", {
    theme: "ANTIFA_PARODY",
    components: ["chant", "rant"],
    damage: 14,
    mana: 60,
    spellAmp: 1.1,
  }),
];

const BY_ID = new Map<string, GiftItem>();
for (const it of GIFT_ITEMS) {
  if (!BY_ID.has(it.id)) BY_ID.set(it.id, it);
  if (it.cast && CONSUME.has(it.cast)) {
    it.stackable = true;
    it.maxStack = it.maxStack ?? DEFAULT_STACK_MAX;
  }
}

export function giftById(id: string): GiftItem | undefined {
  return BY_ID.get(id);
}

function must(id: string): GiftItem {
  const it = BY_ID.get(id);
  if (!it) throw new Error(`missing gift item ${id}`);
  return it;
}

export function isConsume(it: GiftItem): boolean {
  return it.cast != null && CONSUME.has(it.cast);
}

const totalMemo = new Map<string, number>();

export function totalCost(id: string): number {
  const hit = totalMemo.get(id);
  if (hit != null) return hit;
  const it = must(id);
  let t = it.cost;
  for (const c of it.components) t += totalCost(c);
  totalMemo.set(id, t);
  return t;
}

let intoMap: Map<string, string[]> | null = null;

export function buildsInto(id: string): string[] {
  if (!intoMap) {
    intoMap = new Map();
    for (const it of GIFT_ITEMS) {
      for (const c of it.components) {
        const list = intoMap.get(c) ?? [];
        list.push(it.id);
        intoMap.set(c, list);
      }
    }
  }
  return (intoMap.get(id) ?? []).slice();
}

export function recipeCycle(): string | null {
  const color = new Map<string, number>();
  const dfs = (id: string): string | null => {
    const state = color.get(id) ?? 0;
    if (state === 1) return id;
    if (state === 2) return null;
    color.set(id, 1);
    const it = BY_ID.get(id);
    if (!it) return id;
    for (const c of it.components) {
      const hit = dfs(c);
      if (hit) return hit;
    }
    color.set(id, 2);
    return null;
  };
  for (const it of GIFT_ITEMS) {
    const hit = dfs(it.id);
    if (hit) return hit;
  }
  return null;
}

export function missingComponentIds(): string[] {
  const bad: string[] = [];
  for (const it of GIFT_ITEMS) {
    for (const c of it.components) if (!BY_ID.has(c)) bad.push(`${it.id}->${c}`);
  }
  return bad;
}

function descendants(id: string, out: Set<string>): void {
  const it = BY_ID.get(id);
  if (!it) return;
  for (const c of it.components) {
    if (out.has(c)) continue;
    out.add(c);
    descendants(c, out);
  }
}

function coveredValue(id: string, owned: Set<string>, used: Set<string>): number {
  if (owned.has(id)) {
    if (used.has(id)) return 0;
    used.add(id);
    return totalCost(id);
  }
  const it = must(id);
  let v = 0;
  for (const c of it.components) v += coveredValue(c, owned, used);
  return v;
}

export function quotePurchase(purse: Purse, id: string): BuyQuote {
  const it = BY_ID.get(id);
  const same = { gold: purse.gold, items: purse.items.slice() };
  if (!it) return { ok: false, spend: 0, reason: "Unknown item", consumed: [], next: same };
  if (!isConsume(it) && purse.items.includes(id)) {
    return { ok: false, spend: 0, reason: "Already in the bag", consumed: [], next: same };
  }
  const tree = new Set<string>();
  descendants(id, tree);
  const consumed = isConsume(it) ? [] : purse.items.filter((have) => tree.has(have));
  const owned = new Set(consumed);
  const spend = Math.max(0, totalCost(id) - coveredValue(id, owned, new Set()));
  const nextItems = purse.items.filter((have) => !consumed.includes(have));
  if (!isConsume(it) && nextItems.length >= BAG_SLOTS) {
    return { ok: false, spend, reason: "Bag is full", consumed, next: same };
  }
  if (purse.gold < spend) {
    return { ok: false, spend, reason: `Need ${spend - purse.gold} more gold`, consumed, next: same };
  }
  if (!isConsume(it)) nextItems.push(id);
  return {
    ok: true,
    spend,
    reason: "",
    consumed,
    next: { gold: purse.gold - spend, items: nextItems },
  };
}

export function purchase(purse: Purse, id: string): Purse | null {
  const q = quotePurchase(purse, id);
  return q.ok ? q.next : null;
}

export function statSummary(it: GiftItem): string {
  const bits: string[] = [];
  if (it.damage) bits.push(`+${it.damage} damage`);
  if (it.hp) bits.push(`+${it.hp} health`);
  if (it.mana) bits.push(`+${it.mana} mana`);
  if (it.armor) bits.push(`+${it.armor} armor`);
  if (it.mr) bits.push(`+${it.mr} resist`);
  if (it.ms) bits.push(`+${it.ms} move`);
  if (it.aspd) bits.push(`+${Math.round(it.aspd * 100)}% attack speed`);
  if (it.hpRegen) bits.push(`+${it.hpRegen} health regen`);
  if (it.manaRegen) bits.push(`+${it.manaRegen} mana regen`);
  if (it.crit) bits.push(`${Math.round(it.crit * 100)}% crit`);
  if (it.bash) bits.push(`${Math.round(it.bash * 100)}% bash`);
  if (it.splash) bits.push(`splash ${Math.round(it.splash * 100)}%`);
  if (it.spellAmp && it.spellAmp > 1) bits.push(`+${Math.round((it.spellAmp - 1) * 100)}% ability`);
  if (it.slowOnHit) bits.push("slow on hit");
  if (it.trueSight) bits.push(`sight ${it.trueSight}`);
  if (it.heal) bits.push(`heal ${it.heal}`);
  if (it.manaRestore) bits.push(`restore ${it.manaRestore} mana`);
  if (it.shieldPop) bits.push(`shield ${it.shieldPop}`);
  if (it.cast === "ward") bits.push("ward");
  if (it.cast === "smoke") bits.push("smoke");
  if (it.cast === "haste") bits.push("haste");
  if (it.cast === "shield") bits.push("shield");
  if (it.cast === "cleanse") bits.push("cleanse slow");
  return bits.join(", ") || "No stat shift";
}

export function emptyNumbers(): GiftNumbers {
  return {
    hp: 0,
    mana: 0,
    damage: 0,
    armor: 0,
    mr: 0,
    ms: 0,
    aspd: 0,
    hpRegen: 0,
    manaRegen: 0,
    splash: 0,
    splashR: 0,
    crit: 0,
    critX: 1,
    bash: 0,
    bashT: 0,
    spellAmp: 1,
    slowOnHit: 0,
    trueSight: 0,
  };
}

export function numbersFor(ids: readonly string[]): GiftNumbers {
  const s = emptyNumbers();
  for (const id of ids) {
    const it = BY_ID.get(id);
    if (!it) continue;
    s.hp += it.hp ?? 0;
    s.mana += it.mana ?? 0;
    s.damage += it.damage ?? 0;
    s.armor += it.armor ?? 0;
    s.mr += it.mr ?? 0;
    s.ms += it.ms ?? 0;
    s.aspd += it.aspd ?? 0;
    s.hpRegen += it.hpRegen ?? 0;
    s.manaRegen += it.manaRegen ?? 0;
    s.splash += it.splash ?? 0;
    s.splashR = Math.max(s.splashR, it.splashR ?? 0);
    s.crit += it.crit ?? 0;
    if (it.critX) s.critX = Math.max(s.critX, it.critX);
    s.bash += it.bash ?? 0;
    s.bashT = Math.max(s.bashT, it.bashT ?? 0);
    if (it.spellAmp && it.spellAmp > 1) s.spellAmp *= it.spellAmp;
    s.slowOnHit = Math.max(s.slowOnHit, it.slowOnHit ?? 0);
    s.trueSight = Math.max(s.trueSight, it.trueSight ?? 0);
  }
  s.crit = Math.min(0.6, s.crit);
  s.bash = Math.min(0.4, s.bash);
  s.aspd = Math.min(0.4, s.aspd);
  s.spellAmp = Math.min(1.45, s.spellAmp);
  return s;
}

/** Theme is accepted and ignored. Stats stay on the item. */
export function numbersForTheme(ids: readonly string[], theme: ShopTheme): GiftNumbers {
  void theme;
  return numbersFor(ids);
}

export function flourishLine(theme: ShopTheme): string {
  if (theme === "MAGA_PARODY") return "Liberty aisle. Extra red, extra gold, extra volume.";
  if (theme === "ANTIFA_PARODY") return "Away aisle. Extra black, extra pink, extra group project.";
  return "Campus aisle. Plain sticker, plain stats.";
}

export function shopThemeForTeam(team: "home" | "away"): ShopTheme {
  return team === "home" ? "MAGA_PARODY" : "ANTIFA_PARODY";
}

export type ThumbPalette = {
  bg: string;
  k: string;
  h: string;
  m: string;
  s: string;
  a: string;
  p: string;
  o: string;
};

export function paletteFor(theme: ShopTheme): ThumbPalette {
  if (theme === "MAGA_PARODY") {
    return { bg: "#2a1214", k: "#1a0a0c", h: "#fff4e0", m: "#f0c14a", s: "#7a1c24", a: "#c4161c", p: "#f7f1e6", o: "#1d4e89" };
  }
  if (theme === "ANTIFA_PARODY") {
    return { bg: "#141418", k: "#0c0c10", h: "#f3ffe9", m: "#e8e8e8", s: "#2a2a30", a: "#e23b8c", p: "#d8ffe8", o: "#3ddc97" };
  }
  return { bg: "#24180f", k: "#1a120c", h: "#fff6e4", m: "#e6d3a1", s: "#6a4a22", a: "#c9a24a", p: "#efe6d6", o: "#8a5a28" };
}

export function searchGift(query: string, pool: readonly GiftItem[] = GIFT_ITEMS): GiftItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return pool.slice();
  return pool.filter((it) => {
    const parts = [
      it.name,
      it.category,
      statSummary(it),
      it.description,
      it.passive ?? "",
      it.active ?? "",
      it.approx ?? "",
      ...it.components.map((c) => giftById(c)?.name ?? c),
      ...buildsInto(it.id).map((up) => giftById(up)?.name ?? up),
    ];
    return parts.join(" ").toLowerCase().includes(q);
  });
}

export function activeCastNote(it: GiftItem): string {
  if (it.cast === "haste" || it.cast === "shield") return "Click the bag slot. The match casts this.";
  if (it.cast && isConsume(it)) return "Fires once when you buy it.";
  if (it.active) return "Flavor. The match does not cast this.";
  return "";
}

/** Role to shop build. Edit this map to retune a band. */
export const BAND_TO_SHOP_ROLE: Record<RoleBand, ShopBuildRole> = {
  marksman: "marksman",
  assassin: "damage",
  fighter: "damage",
  tank: "tank",
  mage: "mage",
  support: "support",
  controller: "support",
};

export const ROLE_BUILDS: Record<ShopBuildRole, Omit<HeroBuild, "hero">> = {
  marksman: {
    startingItems: ["chalk", "lace", "juice"],
    earlyItems: ["pen", "cleats", "metro"],
    coreItems: ["sticks", "chain"],
    situationalItems: ["jar", "vest"],
    luxuryItems: ["stamp", "crown"],
  },
  damage: {
    startingItems: ["chalk", "gum", "socks"],
    earlyItems: ["ulock", "text", "chip"],
    coreItems: ["slam", "dean"],
    situationalItems: ["plate", "kicks"],
    luxuryItems: ["filibuster", "podium"],
  },
  tank: {
    startingItems: ["gum", "pamphlet", "clip"],
    earlyItems: ["meal", "coat", "socks"],
    coreItems: ["plate", "parade"],
    situationalItems: ["aegis", "hourglass"],
    luxuryItems: ["mug", "relic"],
  },
  mage: {
    startingItems: ["pencil", "chalk", "espresso"],
    earlyItems: ["card", "thesis", "candle"],
    coreItems: ["chant", "orb"],
    situationalItems: ["prism", "coat"],
    luxuryItems: ["syllabus", "zine"],
  },
  support: {
    startingItems: ["clip", "pencil", "pamphlet"],
    earlyItems: ["bandage", "bead", "compass"],
    coreItems: ["care", "buddy"],
    situationalItems: ["whistle", "hourglass"],
    luxuryItems: ["consensus", "lantern"],
  },
};

/** Hand overrides. Empty until a hero needs its own list. */
export const BUILD_OVERRIDES: Partial<Record<string, Partial<Omit<HeroBuild, "hero">>>> = {};

export const HERO_BUILDS: HeroBuild[] = HEROES.map((hero) => {
  const role = BAND_TO_SHOP_ROLE[kitPatch(hero.id).band];
  const base = ROLE_BUILDS[role];
  const over = BUILD_OVERRIDES[hero.id];
  return {
    hero: hero.id,
    startingItems: over?.startingItems ?? base.startingItems,
    earlyItems: over?.earlyItems ?? base.earlyItems,
    coreItems: over?.coreItems ?? base.coreItems,
    situationalItems: over?.situationalItems ?? base.situationalItems,
    luxuryItems: over?.luxuryItems ?? base.luxuryItems,
  };
});

export function buildForHero(heroId: string): HeroBuild {
  return (
    HERO_BUILDS.find((b) => b.hero === heroId) ?? {
      hero: heroId,
      ...ROLE_BUILDS.damage,
    }
  );
}

export function categoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const it of GIFT_ITEMS) counts[it.category] = (counts[it.category] ?? 0) + 1;
  return counts;
}
