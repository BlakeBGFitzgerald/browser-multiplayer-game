/**
 * Living Battlefield. One config drives phases, announcements, shrines,
 * jungle, objectives, shop gates, and hero milestone choices.
 * Game.ts applies the actions. Nothing else schedules these events.
 */

export type PhaseId = "early" | "mid" | "late" | "end";

export type CampTier = "strong" | "major" | "ancient";

export type CampSpec = {
  id: string;
  name: string;
  tier: CampTier;
  x: number;
  y: number;
  fir: boolean;
  hp: number;
  damage: number;
  gold: number;
  xp: number;
  respawn: number;
  leash: number;
  sense: number;
  r: number;
  /** Team gold split, on top of the killer's gold. */
  teamGold: number;
  /** Seconds of damage boon for the team that takes it. */
  boon: number;
  boonDamage: number;
};

export type BfEffect =
  | { type: "phase"; id: PhaseId }
  | { type: "announce" }
  | { type: "shrines" }
  | { type: "night" }
  | { type: "empowerJungle" }
  | { type: "shop"; phase: PhaseId }
  | { type: "spawn"; camp: string }
  | { type: "empowerObjective"; from: string; into: string };

export type BfWhen = {
  /** Fire when the match clock reaches this second. */
  clock?: number;
  /** Tower-count triggers wait until the clock is at least this. */
  minClock?: number;
  /** Total towers destroyed on both sides. */
  towersDown?: number;
  /** clock: time only. either: time or towers. both: time and towers. */
  mode: "clock" | "either" | "both";
};

export type BfEvent = {
  id: string;
  title: string;
  line: string;
  when: BfWhen;
  /** Do not fire if this event id already ran. */
  skipIf?: string;
  effects: BfEffect[];
};

export type BfAction =
  | { type: "announce"; id: string; title: string; line: string }
  | { type: "phase"; id: PhaseId }
  | { type: "shrines" }
  | { type: "night" }
  | { type: "empowerJungle" }
  | { type: "shop"; phase: PhaseId }
  | { type: "spawn"; camp: CampSpec }
  | { type: "empowerObjective"; from: string; into: CampSpec };

const PHASE_RANK: Record<PhaseId, number> = { early: 0, mid: 1, late: 2, end: 3 };

export const PHASE_LABEL: Record<PhaseId, string> = {
  early: "EARLY GAME",
  mid: "MID GAME",
  late: "LATE GAME",
  end: "END GAME",
};

export const BATTLEFIELD = {
  shrineShield: 80,
  shrineCd: 42,
  shrineRadius: 150,
  /** Armor while standing on your own ancient hill. */
  hillArmor: 3,
  hillRadius: 500,
  /** Extra hill armor when your side has fewer towers left. */
  behindArmor: 3,
  wardLife: 72,
  wardRadius: 280,
  woodsReveal: 150,
  towerVision: 230,
  objectiveVision: 260,
  routeMs: 18,
  routeRadius: 380,
  jungleEmpower: { hp: 1.32, dmg: 1.18, gold: 1.35 },
  /** Comeback: gold multiplier when the taker's side is down towers. */
  behindGold: 1.5,
  boonSeconds: 25,
};

export const CAMPS: CampSpec[] = [
  {
    id: "warden",
    name: "River Warden",
    tier: "major",
    x: 1300,
    y: 1300,
    fir: false,
    hp: 2400,
    damage: 62,
    gold: 240,
    xp: 200,
    respawn: 75,
    leash: 460,
    sense: 240,
    r: 26,
    teamGold: 70,
    boon: 22,
    boonDamage: 10,
  },
  {
    id: "ancient-beast",
    name: "The Ancient",
    tier: "ancient",
    x: 1300,
    y: 1300,
    fir: true,
    hp: 4200,
    damage: 84,
    gold: 340,
    xp: 280,
    respawn: 95,
    leash: 520,
    sense: 280,
    r: 32,
    teamGold: 110,
    boon: 28,
    boonDamage: 16,
  },
  {
    id: "capitol-alpha",
    name: "Capitol Alpha",
    tier: "strong",
    x: 960,
    y: 2080,
    fir: false,
    hp: 1100,
    damage: 40,
    gold: 130,
    xp: 96,
    respawn: 55,
    leash: 300,
    sense: 190,
    r: 20,
    teamGold: 0,
    boon: 0,
    boonDamage: 0,
  },
  {
    id: "bay-alpha",
    name: "Bay Alpha",
    tier: "strong",
    x: 2080,
    y: 580,
    fir: true,
    hp: 1100,
    damage: 40,
    gold: 130,
    xp: 96,
    respawn: 55,
    leash: 300,
    sense: 190,
    r: 20,
    teamGold: 0,
    boon: 0,
    boonDamage: 0,
  },
];

export const SHRINE_SPOTS: { name: string; x: number; y: number }[] = [
  { name: "DC Fountain", x: 210, y: 2390 },
  { name: "Seattle Fountain", x: 2390, y: 210 },
  { name: "Reflecting Shrine", x: 780, y: 780 },
  { name: "Elliott Shrine", x: 1880, y: 1080 },
];

export const EVENTS: BfEvent[] = [
  {
    id: "awaken",
    title: "EARLY GAME",
    line: "THE BATTLEFIELD AWAKENS",
    when: { clock: 8, mode: "clock" },
    effects: [{ type: "phase", id: "early" }, { type: "announce" }, { type: "shop", phase: "early" }],
  },
  {
    id: "shrine-warn",
    title: "MID GAME",
    line: "The shrines are stirring",
    when: { clock: 78, mode: "clock" },
    skipIf: "shrines",
    effects: [{ type: "announce" }],
  },
  {
    id: "shrines",
    title: "MID GAME",
    line: "ANCIENT SHRINES HAVE AWAKENED",
    when: { clock: 90, minClock: 75, towersDown: 2, mode: "either" },
    effects: [
      { type: "phase", id: "mid" },
      { type: "announce" },
      { type: "shrines" },
      { type: "shop", phase: "mid" },
      { type: "spawn", camp: "warden" },
    ],
  },
  {
    id: "jungle",
    title: "LATE GAME",
    line: "THE JUNGLE GROWS STRONGER",
    when: { clock: 210, mode: "clock" },
    effects: [
      { type: "phase", id: "late" },
      { type: "announce" },
      { type: "night" },
      { type: "empowerJungle" },
      { type: "shop", phase: "late" },
      { type: "spawn", camp: "capitol-alpha" },
      { type: "spawn", camp: "bay-alpha" },
    ],
  },
  {
    id: "ancient-warn",
    title: "END GAME",
    line: "Something ancient is waking in the river",
    when: { clock: 312, mode: "clock" },
    skipIf: "ancient",
    effects: [{ type: "announce" }],
  },
  {
    id: "ancient",
    title: "END GAME",
    line: "THE ANCIENT HAS AWAKENED",
    when: { clock: 330, mode: "clock" },
    effects: [
      { type: "phase", id: "end" },
      { type: "announce" },
      { type: "shop", phase: "end" },
      { type: "empowerObjective", from: "warden", into: "ancient-beast" },
    ],
  },
];

export function campById(id: string): CampSpec | undefined {
  return CAMPS.find((c) => c.id === id);
}

export function phaseAtLeast(have: PhaseId, need: PhaseId): boolean {
  return PHASE_RANK[have] >= PHASE_RANK[need];
}

function due(when: BfWhen, clock: number, towersDown: number): boolean {
  const byTime = when.clock != null && clock >= when.clock;
  const towerReady = when.minClock == null || clock >= when.minClock;
  const byTowers = when.towersDown != null && towersDown >= when.towersDown && towerReady;
  if (when.mode === "clock") return byTime;
  if (when.mode === "both") return byTime && byTowers;
  return byTime || byTowers;
}

export type AttrId = "str" | "agi" | "int";

export type Perk = {
  id: string;
  name: string;
  blurb: string;
  level: number;
  /** Empty means every attribute sees this choice. */
  attrs: AttrId[];
  hp?: number;
  damage?: number;
  armor?: number;
  ms?: number;
  manaRegen?: number;
  spellAmp?: number;
  ultAmp?: number;
  cdMul?: number;
  castHeal?: number;
  slowOnHit?: number;
};

export const PERKS: Perk[] = [
  { id: "bulk", name: "Bulk", blurb: "+110 health", level: 4, attrs: ["str"], hp: 110 },
  { id: "guard", name: "Guard", blurb: "+6 armor", level: 4, attrs: ["str"], armor: 6 },
  { id: "edge", name: "Edge", blurb: "+12 damage", level: 4, attrs: ["agi"], damage: 12 },
  { id: "cleat", name: "Cleat", blurb: "+22 move speed", level: 4, attrs: ["agi"], ms: 22 },
  { id: "spark", name: "Spark", blurb: "+8 damage, +3 mana regen", level: 4, attrs: ["int"], damage: 8, manaRegen: 3 },
  { id: "well", name: "Well", blurb: "+70 health, +4 mana regen", level: 4, attrs: ["int"], hp: 70, manaRegen: 4 },
  { id: "sharpen", name: "Sharpen", blurb: "Abilities hit 12% harder", level: 7, attrs: [], spellAmp: 1.12 },
  { id: "quicken", name: "Quicken", blurb: "Q W E come back 12% sooner", level: 7, attrs: [], cdMul: 0.88 },
  { id: "bite", name: "Ult Bite", blurb: "Ultimate hits 18% harder", level: 9, attrs: [], ultAmp: 1.18 },
  { id: "wind", name: "Second Wind", blurb: "Casts restore 48 health", level: 9, attrs: [], castHeal: 48 },
  { id: "god", name: "Campus God", blurb: "+14 damage, +60 health", level: 11, attrs: [], damage: 14, hp: 60 },
  { id: "anchor", name: "Anchor", blurb: "+8 armor. Hits slow for 0.4s", level: 11, attrs: [], armor: 8, slowOnHit: 0.4 },
];

export function perksFor(level: number, attr: string): [Perk, Perk] | null {
  const row = PERKS.filter((p) => p.level === level && (p.attrs.length === 0 || p.attrs.includes(attr as AttrId)));
  if (row.length < 2) return null;
  return [row[0]!, row[1]!];
}

export function perkById(id: string): Perk | undefined {
  return PERKS.find((p) => p.id === id);
}

export class Battlefield {
  phase: PhaseId = "early";
  shopPhase: PhaseId = "early";
  shrines = false;
  night = false;
  jungleEmpowered = false;
  readonly fired = new Set<string>();
  /** Objective ids that should show a pit marker before they exist. */
  warnPit = false;

  step(clock: number, towersDown: number): BfAction[] {
    const out: BfAction[] = [];
    for (const ev of EVENTS) {
      if (this.fired.has(ev.id)) continue;
      if (ev.skipIf && this.fired.has(ev.skipIf)) {
        this.fired.add(ev.id);
        continue;
      }
      if (!due(ev.when, clock, towersDown)) continue;
      this.fired.add(ev.id);
      if (ev.id === "shrine-warn" || ev.id === "ancient-warn") this.warnPit = true;
      if (ev.id === "shrines" || ev.id === "ancient") this.warnPit = ev.id === "shrines";
      for (const effect of ev.effects) out.push(...this.apply(ev, effect));
    }
    return out;
  }

  private apply(ev: BfEvent, effect: BfEffect): BfAction[] {
    if (effect.type === "announce") return [{ type: "announce", id: ev.id, title: ev.title, line: ev.line }];
    if (effect.type === "phase") {
      this.phase = effect.id;
      return [{ type: "phase", id: effect.id }];
    }
    if (effect.type === "shrines") {
      this.shrines = true;
      return [{ type: "shrines" }];
    }
    if (effect.type === "night") {
      this.night = true;
      return [{ type: "night" }];
    }
    if (effect.type === "empowerJungle") {
      this.jungleEmpowered = true;
      return [{ type: "empowerJungle" }];
    }
    if (effect.type === "shop") {
      this.shopPhase = effect.phase;
      return [{ type: "shop", phase: effect.phase }];
    }
    if (effect.type === "spawn") {
      const camp = campById(effect.camp);
      return camp ? [{ type: "spawn", camp }] : [];
    }
    if (effect.type === "empowerObjective") {
      const camp = campById(effect.into);
      return camp ? [{ type: "empowerObjective", from: effect.from, into: camp }] : [];
    }
    return [];
  }
}

export type BfLog = { t: number; id: string; phase: PhaseId; line: string };

/** Clock-only rehearsal. Tower triggers are passed as zero unless towersAt is set. */
export function simulateBattlefield(seconds: number, towersAt?: { t: number; n: number }): BfLog[] {
  const bf = new Battlefield();
  const log: BfLog[] = [];
  let towers = 0;
  for (let t = 0; t <= seconds; t += 1) {
    if (towersAt && t >= towersAt.t) towers = towersAt.n;
    const before = new Set(bf.fired);
    const actions = bf.step(t, towers);
    for (const a of actions) {
      if (a.type !== "announce") continue;
      if (before.has(a.id)) continue;
      log.push({ t, id: a.id, phase: bf.phase, line: a.line });
    }
  }
  const again = bf.step(seconds, towers);
  if (again.length) log.push({ t: -1, id: "duplicate", phase: bf.phase, line: "fired twice" });
  return log;
}
