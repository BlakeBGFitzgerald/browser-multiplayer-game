import { canExpertAuto, defaultExpertAuto, goldDrip, handleOf } from "../handles";
import { MATCH_IDLE } from "../kick";
import { PLAYERS_PER_TEAM } from "../lobby";
import { isTangledBrowser } from "../tangled";
import { skinById } from "../dlc";
import type { Sfx } from "./audio";
import { CREEP_CORPSE } from "./creepPix";
import { resetStride, strideBlend } from "./stride";
import { drawBolt, drawCastRing, drawMoveMarker, drawQuadWorld, drawScreenBark, drawShotImpact, drawSprite, drawTargetMark, filmic, quadBadge } from "./quad";
import { CALL_FIRST_BLOOD, callConcede, callShutdown, callStreak, callTower, callWinner, introScript } from "./announce";
import { ANTIFA_DEATH, creepBark, heroTaunt, MAGA_DEATH } from "./barks";
import { humanMayControlHooli } from "../hooliSandbox";
import { HOOLI_BURST_AT, HOOLI_BURST_END, burstShares } from "./hooliBurst";
import { uniqueSideKits } from "./draftPick";
import { kitHoldsSwungBook } from "./bookSwing";
import { ITEMS, MMA_MELEE_RANGE, RANGED_BASIC_MIN, authorizeHumanHero, heroById, isDevAiOnlyHero, isHooliId, type CastFx, type HeroDef } from "./heroes";
import {
  MSG_FULL,
  MSG_GOLD,
  SLOT_COUNT,
  activate,
  buy,
  canPlaceItem,
  emptyCarrier,
  ownedIds,
  roomLabel,
  sell,
  sellValueOf,
  slotFree,
  slotsFromSnap,
  snapSlots,
  type Carrier,
  type ItemSlot,
  type Stock,
  type TimedBuff,
} from "./inventory";
import { pixelKit } from "./pixelRoster";
import { hideoutBreaksSight } from "./jungle";
import { heroWeapon, heroWeaponMuzzle } from "./heroWeapons";
import { laneCreepRadius } from "./laneCreep";
import { laneTowerMuzzle, laneTowerRadius } from "./laneTower";
import { asProjectileSource, projectileLook, type ProjectileLook, type ProjectileSource } from "./projectileLook";
import { ALEX_GROANS_ID, ALEX_ROCKET_END, ALEX_ROCKET_FIRE, AlexRocketFire, asShotAmmo, nextNerfColor, type NerfColor, type ShotAmmo } from "./nerf";
import { heroHitRadius } from "./heroHeight";
import { SNOWBALL_END, SNOWBALL_HERO_ID, SNOWBALL_RELEASE, SnowballRelease, snowballSpawn } from "./snowball";
import { MMA_PUNCH_CONTACT, MMA_PUNCH_END } from "./mmaPunch";
import { stunPushVector } from "./stunReact";
import { pixelVfxColor } from "./pixelPaint";
import { kitPatch, type KitPatch } from "./kits";
import { budgetBase, mechById, mechIntent, type MechSpec } from "./mechs";
import {
  GIFT_ITEMS,
  giftById,
  isConsume,
  numbersFor,
  quotePurchase,
  totalCost,
  type GiftItem,
  type GiftNumbers,
} from "./giftShop";
import { enemyInTeamVision, HERO_SIGHT, MINION_SIGHT, TOWER_SIGHT, type Sight } from "./aiKnowledge.ts";
import {
  OPENING_GOLD,
  aiPhaseForLevel,
  aiRoleOf,
  aiShopDebug,
  botDeployDebug,
  nextAiBuy,
  pickActiveIndex,
  roleLevelBonus,
  spendOpeningGold,
} from "./aiShopPlan.ts";
import { POOL_RADIUS, poolSpawn } from "./baseSpawn.ts";
import { pickLiveCamp, type CampSpot } from "./junglePlan.ts";
import {
  formationRole,
  laneApproach,
  laneBattleStart,
  mayPeelToJungle,
  waveGoal,
  waveHasLeft,
  waveRefreshSeconds,
  type WaveDuty,
  type WaveGoal,
} from "./waveFollow.ts";
import { matchGraph } from "./matchRoutes.ts";
import { nearestRouteNode, routeBetween } from "./routeGraph.ts";
import { soundsForKillTrigger } from "./killNotice.ts";
import { DeathCounts } from "./respawn.ts";
import { KILL_VOICE, creditVoiceMulti, pickKillLine, type KillCue, type MultiMark } from "./killVoice";
import type { NetEvent, SnapShot, SnapUnit, WorldSnap } from "../beta/protocol";
import type { Input, Order } from "./input";
import {
  BATTLEFIELD,
  Battlefield,
  PHASE_LABEL,
  SHRINE_SPOTS,
  campById,
  perkById,
  perksFor,
  type BfAction,
  type CampSpec,
  type Perk,
} from "./battlefield";
import {
  BACK_TRACKS,
  CELL,
  CELLS,
  JUNGLE_CAMPS,
  LANES,
  WOODS,
  WORLD,
  ancientPos,
  dist,
  findPath,
  isWalkable,
  along,
  fountain,
  inWoods,
  lanePath,
  nearestWalkable,
  trackRank,
  norm,
  towers as towerSpecs,
  type Lane,
  type Pt,
  type Team,
  type TowerTier,
} from "./map";

export type Screen = "title" | "help" | "play" | "paused" | "victory" | "defeat";

type Kind = "hero" | "minion" | "tower" | "ancient";

type Fx = { stun: number; slow: number; shield: number; aspd: number; taunt: number };

type Unit = {
  id: number;
  kind: Kind;
  team: Team;
  name: string;
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  damage: number;
  armor: number;
  range: number;
  ms: number;
  melee: boolean;
  atk: number;
  /** Basic attacks started. Visual punch side only. */
  beat: number;
  period: number;
  dead: boolean;
  respawn: number;
  path: Pt[];
  target: number | null;
  /** Enemy hero this tower is drawn onto. 0 means no draw. */
  drawId: number;
  heroId?: string;
  level: number;
  xp: number;
  gold: number;
  items: string[];
  /** Six match slots. Empty entries are unused. */
  inv: Array<ItemSlot | null>;
  /** Timed buff applied by an item slot. Cleared when that slot is sold. */
  itemBuff: TimedBuff | null;
  cds: number[];
  fx: Fx;
  player: boolean;
  /** Closed-beta seat. -1 keeps the local keyboard rules. */
  seat: number;
  /** True while a connected tester is driving this seat. AI stays off. */
  driven: boolean;
  handle: string;
  lane?: Lane;
  wp: number;
  caster: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  streak: number;
  hits: Record<number, number>;
  color: string;
  skin?: string;
  wild: boolean;
  homeX: number;
  homeY: number;
  bark: string;
  barkT: number;
  face: number;
  aggro: boolean;
  lockOn: boolean;
  attackMove: boolean;
  bashCd: number;
  towerTier?: TowerTier;
  aiT: number;
  routeX: number;
  routeY: number;
  /** Cached route-graph goal. Rebuilt on a timer or when the goal key changes. */
  routeKey: string;
  routeAt: number;
  /** One hero per side walks jungle camps when the map has them. */
  jungler: boolean;
  /** Camp id this hero is already walking. Held until it dies, a seen threat, or the lane calls. */
  campStick: string;
  /** Ring index inside the fountain pool. The same seat is used on respawn. */
  poolIndex: number;
  /** Clock of the last friendly-wave sample. Negative forces a fresh read. */
  waveAt: number;
  waveLx: number;
  waveLy: number;
  waveAdv: number;
  waveFrom: number;
  waveSeen: boolean;
  /** Wait in the pool, buy, follow the wave, then fight. */
  waveDuty: WaveDuty;
  /** This life has stood with a friendly wave. Junglers may peel only after that. */
  joinedWave: boolean;
  /** Chase path was built to step around a trunk. Drop it when the target drops. */
  detour?: boolean;
  heat: number;
  heatMax: number;
  dashMark: number;
  castT: number;
  castUlt: boolean;
  moved: boolean;
  hurtT: number;
  /** Seconds into the current delayed basic (Hooli burst or Alex raise). 0 when the weapon is down. */
  burstAge: number;
  /** Pellets still owed by the current basic attack. */
  volley?: VolleyPellet[];
  guardCd: number;
  hasteT: number;
  markT: number;
  baseMs: number;
  hpRegen: number;
  manaRegen: number;
  mr: number;
  objectiveId: string;
  respawnMax: number;
  leash: number;
  sense: number;
  perks: string[];
  spellAmp: number;
  ultAmp: number;
  cdMul: number;
  castHeal: number;
  slowOnHit: number;
  stealthT: number;
  boonT: number;
  boonDmg: number;
  itemCd: number;
  trueSight: number;
  shrineCd: number;
  armorBase: number;
  xpWorth: number;
};

type Ward = { x: number; y: number; team: Team; life: number; r: number };

type Shot = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  dmg: number;
  team: Team;
  target: number;
  from: number;
  color: string;
  crit: boolean;
  onHit: boolean;
  /** False for the second and third pellets of a burst. Damage still lands. */
  procs?: boolean;
  /** Full attack damage used once for splash, on the first pellet. */
  splashFrom?: number;
  heroId?: string;
  ammo?: ShotAmmo;
  /** Sprite bearer only. Combat ignores it. */
  source?: ProjectileSource;
  rider?: { slow?: number; stun?: number; mark?: number; knock?: number; pull?: number; hook?: number };
};

type ShotPuff = { x: number; y: number; life: number; look: ProjectileLook };

function blankPuffs(): ShotPuff[] {
  const row: ShotPuff[] = [];
  for (let i = 0; i < 12; i++) row.push({ x: 0, y: 0, life: 0, look: projectileLook(null) });
  return row;
}

type VolleyPellet = {
  at: number;
  idx: number;
  dmg: number;
  crit: boolean;
  proc: boolean;
  splashFrom: number;
  target: number;
  tx: number;
  ty: number;
  fired: boolean;
  /** Named fire mark, when this pellet waits on an animation event. */
  event?: string;
  /** Melee contact. Lands on the unit instead of launching a bolt. */
  melee?: boolean;
};

type BurstNote = { hero: string; t: number; dmg: number; idx: number };

type HitKind = { crit?: boolean; splash?: boolean; spell?: boolean };

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; s: number };
type Floater = { x: number; y: number; text: string; life: number; color: string };
type CastRing = { x: number; y: number; r: number; life: number; max: number; color: string; kind: "nova" | "cone" | "slow" | "heal" | "ult" | "dash"; heroId?: string };

export type AbilityHud = { key: string; name: string; cd: number; max: number; ready: boolean; mana: number; fx: string; blurb: string };
export type ShopHud = {
  id: string;
  name: string;
  cost: number;
  blurb: string;
  can: boolean;
  shelf: string;
  sellValue: number;
  room: string;
};
export type SlotHud = { id: string; count: number; cd: number; active: boolean };

export type Hud = {
  screen: Screen;
  clock: string;
  clockSec: number;
  winner: "home" | "away" | "";
  firstTower: "home" | "away" | "";
  gold: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  level: number;
  kda: string;
  kdr: string;
  abilities: AbilityHud[];
  items: string[];
  slots: SlotHud[];
  invNote: string;
  sellIndex: number;
  shop: ShopHud[];
  shopOpen: boolean;
  team: "home" | "away";
  muted: boolean;
  banner: string;
  feed: string[];
  dead: boolean;
  respawn: number;
  selected: string;
  skin: string;
  inFountain: boolean;
  canAutoplay: boolean;
  autoplay: boolean;
  tangled: boolean;
  drip: number;
  idleKick: string;
  targetLine: string;
  followTag: string;
  gallery: boolean;
  cs: number;
  streak: number;
  bestStreak: number;
  towers: number;
  xp: number;
  xpNeed: number;
  xpPct: number;
  heat: string;
  concedeLine: string;
  concedeMode: "hidden" | "call" | "vote";
  phase: string;
  shelf: string;
  objective: string;
  mile: string;
  mileA: string;
  mileB: string;
  /** Washington DC and Seattle, 0–1 of ancient health. */
  bases: { home: number; away: number };
};

const CONCEDE_CLOCK = 90;
const CONCEDE_VOTE = 22;
const CONCEDE_COOLDOWN = 40;

const XP = [0, 180, 420, 740, 1140, 1640, 2240, 2940, 3740, 4640, 5640];

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

/** Lift a kill chip off a centered #banner. One banner line — clamp(22px, 5vw, 44px) — plus the chip. */
function screenCallShift(viewW: number): number {
  const line = Math.max(22, Math.min(44, viewW * 0.05));
  return Math.round(line + 16);
}

function foes(a: Unit, b: Unit): boolean {
  if (a.id === b.id) return false;
  if (a.wild || b.wild) return a.wild !== b.wild;
  return a.team !== b.team;
}

function other(team: Team): Team {
  return team === "home" ? "away" : "home";
}

function itemStats(slots: Array<ItemSlot | null> | string[] | undefined): GiftNumbers {
  if (!slots || slots.length === 0) return numbersFor([]);
  if (typeof slots[0] === "string") return numbersFor(slots as string[]);
  const ids: string[] = [];
  for (const slot of slots as Array<ItemSlot | null>) {
    if (!slot) continue;
    const n = Math.max(1, slot.count || 1);
    for (let i = 0; i < n; i++) ids.push(slot.id);
  }
  return numbersFor(ids);
}

function kdr(kills: number, deaths: number): string {
  if (deaths <= 0) return kills === 0 ? "0.00" : kills.toFixed(2);
  return (kills / deaths).toFixed(2);
}

export class Game {
  screen: Screen = "title";
  selected = "maga-grumptor";
  muted = false;
  shopOpen = false;
  private sellPick = -1;
  private invNote = "";
  private invNoteT = 0;
  private worn = "";
  private follow = true;
  private camX = WORLD * 0.22;
  private camY = WORLD * 0.82;
  private zoom = 0.92;
  private shake = 0;
  private w = 1280;
  private h = 720;
  private time = 0;
  private clock = 0;
  private nid = 1;
  private units: Unit[] = [];
  private shots: Shot[] = [];
  /** Hit pixels. Twelve slots, reused. Cleared in halt(). */
  private puffs: ShotPuff[] = blankPuffs();
  private puffAt = 0;
  /** Last foam color fired by each Alex, so the next dart swaps blue and orange. */
  private nerfColor = new Map<number, NerfColor>();
  private burstLog: BurstNote[] = [];
  private parts: Particle[] = [];
  private floats: Floater[] = [];
  private rings: CastRing[] = [];
  /** Delayed original kits. Cleared in halt(). */
  private spellPending: { at: number; owner: number; mech: string; x: number; y: number; enemy: number; ult: boolean; range: number; slot: number; heat: number }[] = [];
  /** Next basic discharges this mechanic id. */
  private armed = new Map<number, string>();
  private feed: { text: string; t: number }[] = [];
  private banner = "";
  private bannerT = 0;
  private waveT = 30;
  private waves = 0;
  private guard = 0;
  private marker: Pt | null = null;
  private ended = false;
  private bf = new Battlefield();
  private bfQueue: string[] = [];
  private wards: Ward[] = [];
  private fogSeen: Record<Team, Uint8Array> = {
    home: new Uint8Array(CELLS * CELLS),
    away: new Uint8Array(CELLS * CELLS),
  };
  private fogNow: Record<Team, Uint8Array> = {
    home: new Uint8Array(CELLS * CELLS),
    away: new Uint8Array(CELLS * CELLS),
  };
  private fogStampAt = -1;
  private fogCanvas: HTMLCanvasElement | null = null;
  private fogCtx: CanvasRenderingContext2D | null = null;
  private fogPixels: ImageData | null = null;
  private miniPlate: HTMLCanvasElement | null = null;
  private miniPlateSize = 0;
  private drawScratch: Unit[] = [];
  private fogAlpha: Record<Team, Float32Array> = {
    home: new Float32Array(CELLS * CELLS),
    away: new Float32Array(CELLS * CELLS),
  };
  private sightCache: Record<Team, Sight[] | null> = { home: null, away: null };
  private routes = new Set<Lane>();
  private mile: { id: number; a: Perk; b: Perk } | null = null;
  private firstTower: Team | "" = "";
  private gateNoteT = 0;
  private firstBlood = false;
  /** Per-hero deaths this match. Reset with the rest of the match state in start(). */
  private deathCounts = new DeathCounts();
  private playerTowers = 0;
  private playerBest = 0;
  private holdCall = "";
  private holdCallT = 0;
  /** Voice multi-kill ladder. Separate from killer.streak and shutdown gold. */
  private voiceMulti = new Map<number, MultiMark>();
  private killCues: KillCue[] = [];
  /** Spoken kill-credit line, painted at the viewport center until it clears. */
  private killLine = "";
  private killLineT = 0;
  private killLineTeam: Team = "home";
  autoplay = false;
  private manualUntil = 0;
  private tangled = false;
  private watch = false;
  private spec = false;
  private lastInput = 0;
  private idleVote: { yes: number; need: number; pulse: number } | null = null;
  private demo = false;
  private followStars = false;
  private starHandle = "lilhooligan";
  private bound = false;
  private humans: string[] = [];
  private concede: { yes: string[]; names: string[]; start: number; pulse: number } | null = null;
  private concedeCd = 0;
  private battleMixT = 0;
  private liveCache: Unit[] | null = null;
  private sizeSkip = 0;
  /** Dedicated host: no window, no draw, no client audio. */
  private headless = false;
  /** Browser attached to a host. Draw and sound stay; the host simulates. */
  private remote = false;
  private mySeat = -1;
  private netEvents: NetEvent[] = [];
  private netEid = 1;
  private lastNet = 0;
  private netPrimed = false;
  private chase = new Map<number, { x: number; y: number }>();
  onRemoteOrder: ((order: Order) => void) | null = null;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  readonly input: Input;
  private readonly sfx: Sfx;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    input: Input,
    sfx: Sfx,
    bound = false,
    headless = false,
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.input = input;
    this.sfx = sfx;
    this.bound = bound;
    this.headless = headless;
    if (headless) {
      this.w = 1280;
      this.h = 720;
      this.sfx.muted = true;
      return;
    }
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  cam(): { x: number; y: number; zoom: number } {
    return { x: this.camX, y: this.camY, zoom: this.zoom };
  }

  show(screen: Screen): void {
    this.screen = screen;
  }

  bag(): string[] {
    return [...(this.player()?.items ?? [])];
  }

  pick(id: string, actor = ""): void {
    this.selected = authorizeHumanHero(id, humanMayControlHooli(actor));
  }

  wear(id: string): void {
    this.worn = id;
  }

  over(): boolean {
    return this.ended;
  }

  halt(): void {
    this.ended = true;
    this.sellPick = -1;
    this.invNote = "";
    this.invNoteT = 0;
    this.units = [];
    this.shots = [];
    this.clearPuffs();
    this.nerfColor.clear();
    this.parts = [];
    this.floats = [];
    this.spellPending = [];
    this.armed.clear();
    this.voiceMulti.clear();
    this.killCues = [];
    this.killLine = "";
    this.killLineT = 0;
    this.watch = false;
    this.demo = false;
    this.sfx.setBattle(0);
    this.sfx.stopBattle();
  }

  start(roster?: {
    home: string[];
    away: string[];
    watch?: boolean;
    spec?: boolean;
    stash?: string[];
    demo?: boolean;
    followStars?: boolean;
    humans?: string[];
    kits?: string[];
    awayKits?: string[];
  }): void {
    this.ended = false;
    this.remote = false;
    this.onRemoteOrder = null;
    this.mySeat = -1;
    if (!this.remote) {
      this.netEvents = [];
      this.lastNet = 0;
      this.netPrimed = false;
      this.chase.clear();
    }
    this.bf = new Battlefield();
    this.bfQueue = [];
    this.wards = [];
    this.resetFog();
    this.routes = new Set();
    this.mile = null;
    this.firstTower = "";
    this.gateNoteT = 0;
    this.shopOpen = false;
    this.sellPick = -1;
    this.invNote = "";
    this.invNoteT = 0;
    this.follow = true;
    this.clock = 0;
    this.time = 0;
    this.nid = 1;
    this.units = [];
    this.shots = [];
    this.clearPuffs();
    this.parts = [];
    this.floats = [];
    this.feed = [];
    this.firstBlood = false;
    this.deathCounts.reset();
    this.playerTowers = 0;
    this.playerBest = 0;
    this.holdCall = "";
    this.holdCallT = 0;
    this.voiceMulti.clear();
    this.killCues = [];
    this.killLine = "";
    this.killLineT = 0;
    this.waveT = 26;
    this.waves = 0;
    this.guard = 2.4;
    this.manualUntil = 0;
    this.lastInput = 0;
    this.idleVote = null;
    this.concede = null;
    this.concedeCd = 0;
    this.battleMixT = 0;
    this.tangled = isTangledBrowser();
    this.demo = roster?.demo ?? false;
    this.spec = Boolean(roster?.spec);
    this.followStars = Boolean(roster?.followStars) || this.demo;
    this.watch = roster?.watch || this.demo || this.spec;
    this.input.flush();
    this.zoom = this.followStars ? 0.74 : this.watch ? 0.7 : 0.92;
    const home = roster?.home ?? [];
    const away = roster?.away ?? [];
    const you = home[0] ?? "";
    const youPlay = !this.spec && !this.demo;
    const humanLead = youPlay && !this.watch && !this.followStars;
    const allowHooli = !humanLead || humanMayControlHooli(you);
    this.selected = authorizeHumanHero(this.selected, allowHooli);
    const pick = heroById(this.selected);
    this.autoplay = this.watch || this.spec || defaultExpertAuto(you);
    this.banner = roster?.spec
      ? "Spectator gallery. Type in chat. You cannot Talk on the mic."
      : this.demo
        ? "Live 5v5. Hero fight on mid. Click to watch full screen."
        : this.followStars
          ? "Watching AI. Heroes fight on mid. Space snaps to the clash."
        : this.watch
      ? "Watching expert AI. P takes the keyboard."
      : this.autoplay
        ? this.tangled
          ? "Expert AI on. Tangled gold per minute is up."
          : "Expert AI is playing. P takes the keyboard."
        : this.tangled
          ? "Tangled browser · extra gold per minute"
          : "Washington DC vs Seattle";
    this.bannerT = this.autoplay || this.tangled || this.watch ? 2.8 : 2.2;
    const homeList = roster?.kits ?? [];
    const awayList = roster?.awayKits ?? [];
    const unique = uniqueSideKits(pick.id, homeList, awayList);
    const kits = unique.home.map((id) => heroById(id));
    const awayKits = unique.away.map((id) => heroById(id));
    if (homeList.length >= PLAYERS_PER_TEAM && awayList.length >= PLAYERS_PER_TEAM) {
      this.banner = "MAGA cast versus Seattle. Ten AI. Space snaps to the clash.";
    } else if (homeList.length >= PLAYERS_PER_TEAM) {
      this.banner = "Watching AI. DLC heroes only. Space snaps to the clash.";
    }
    const lanes: Lane[] = ["mid", "top", "bot", "top", "bot"];
    for (let i = 0; i < PLAYERS_PER_TEAM; i++) this.spawnHero(kits[i] ?? pick, "home", youPlay && i === 0, lanes[i]!, home[i], i);
    for (let i = 0; i < PLAYERS_PER_TEAM; i++) this.spawnHero(awayKits[i] ?? pick, "away", false, lanes[i]!, away[i], i);
    this.assignJunglers();
    for (const spec of towerSpecs) this.spawnTower(spec.team, spec.lane, spec.tier, spec.pos);
    this.spawnAncient("home");
    this.spawnAncient("away");
    this.spawnCamps();
    this.spawnWave();
    this.humans = this.uniqPlayers(roster?.humans ?? []);
    if (!this.humans.length && youPlay && you) this.humans = [you];
    const lead = this.units.find((u) => u.player);
    if (lead && isDevAiOnlyHero(lead.heroId ?? "") && !humanMayControlHooli(lead.handle || lead.name || you)) {
      this.autoplay = true;
    }
    this.openingShops();
    this.holdForWave();
    const p = this.player();
    if (this.followStars) {
      this.pickStar(home, away);
    } else if (p) {
      this.camX = p.x;
      this.camY = p.y;
      p.itemBuff = null;
      this.syncInv(p, []);
    } else {
      const focus = this.watchFocus();
      if (focus) {
        this.camX = focus.x;
        this.camY = focus.y;
      }
    }
    this.screen = "play";
    this.sfx.stopRing();
    void this.sfx.unlock().then(() => {
      this.sfx.startBattle();
      if (this.demo || this.muted) return;
      this.sfx.fanfare();
      const starName = (names: string[], fallback: string) =>
        names.some((n) => handleOf(n) === "blake")
          ? "Blake Fitzgerald"
          : names.some((n) => handleOf(n) === "lilhooligan")
            ? "Lil Hooligan"
            : fallback;
      const magaStar = starName(home, "MAGA");
      const antifaStar = starName(away, "Antifa");
      const lines = introScript(magaStar, antifaStar);
      this.sfx.announceIntro(lines, () => {});
    });
  }

  /** Keep the six pockets and the id list on the same items. Holes stay put. */
  private syncInv(u: Unit, ids: string[]): void {
    const prev = u.inv?.length === SLOT_COUNT ? u.inv : emptyCarrier().slots;
    const next = prev.map((slot) => (slot ? { id: slot.id, count: slot.count, cd: slot.cd } : null));
    const need = new Map<string, number>();
    for (const id of ids) {
      if (!id) continue;
      need.set(id, (need.get(id) ?? 0) + 1);
    }
    for (let i = 0; i < SLOT_COUNT; i++) {
      const slot = next[i];
      if (!slot) continue;
      const left = need.get(slot.id) ?? 0;
      if (left <= 0) {
        next[i] = null;
        continue;
      }
      const gift = giftById(slot.id);
      const stacked = Boolean(gift && (gift.stackable || isConsume(gift)));
      slot.count = stacked ? Math.max(1, slot.count) : 1;
      need.set(slot.id, 0);
    }
    for (const [id, left] of need) {
      if (left <= 0) continue;
      for (let n = 0; n < left; n++) {
        const hole = next.findIndex((slot) => !slot);
        if (hole < 0) break;
        next[hole] = { id, count: 1, cd: 0 };
      }
    }
    u.inv = next;
    u.items = ownedIds(next);
  }

  private stockOf(it: GiftItem): Stock {
    return {
      id: it.id,
      cost: totalCost(it.id),
      sellValue: it.sellValue,
      stackable: Boolean(it.stackable) || isConsume(it),
      maxStack: it.maxStack,
      active: it.cast,
      activeCd: it.activeCd,
      heal: it.heal,
      consume: isConsume(it) ? it.cast : undefined,
    };
  }

  private readCarrier(u: Unit): Carrier {
    const slots = u.inv?.length === SLOT_COUNT ? u.inv : emptyCarrier().slots;
    return {
      gold: u.gold,
      slots: slots.map((slot) => (slot ? { id: slot.id, count: slot.count, cd: slot.cd } : null)),
      buff: u.itemBuff ? { slot: u.itemBuff.slot, kind: u.itemBuff.kind } : null,
    };
  }

  private writeCarrier(u: Unit, carrier: Carrier): void {
    u.gold = carrier.gold;
    u.inv = carrier.slots.map((slot) => (slot ? { id: slot.id, count: slot.count, cd: slot.cd } : null));
    u.items = ownedIds(u.inv);
    u.itemBuff = carrier.buff ? { slot: carrier.buff.slot, kind: carrier.buff.kind } : null;
  }

  private noteInv(p: Unit, message: string): void {
    if (!p.player) return;
    this.invNote = message;
    this.invNoteT = 2.4;
    if (message === MSG_FULL) {
      this.banner = MSG_FULL;
      this.bannerT = 1.8;
    }
  }

  buy(id: string): void {
    if (this.remote) {
      this.onRemoteOrder?.({ kind: "buy", id });
      return;
    }
    this.buyUnit(this.player(), id);
  }

  sell(index: number): void {
    if (this.remote) {
      this.onRemoteOrder?.({ kind: "sell", index });
      return;
    }
    this.sellUnit(this.player(), index);
  }

  /** Shop is open: this HUD slot is the item to sell. */
  pickSell(index: number): void {
    const p = this.player();
    if (!p?.inv?.[index]) {
      this.sellPick = -1;
      return;
    }
    this.sellPick = index;
  }

  private buyUnit(p: Unit | undefined, id: string): boolean {
    const it = giftById(id);
    if (!p || !it || p.dead) return false;
    if (!this.nearFountain(p)) return false;
    if (isConsume(it) || it.stackable) {
      const carrier = this.readCarrier(p);
      const result = buy(carrier, it.id, [this.stockOf(it)]);
      if (!result.ok) {
        this.noteInv(p, result.message);
        return false;
      }
      this.writeCarrier(p, carrier);
      this.applyItems(p);
      if (p.player) {
        this.invNote = "";
        this.invNoteT = 0;
        this.sfx.coin();
      }
      return true;
    }
    const quote = quotePurchase({ gold: p.gold, items: ownedIds(p.inv ?? []) }, id);
    if (!quote.ok) {
      if (quote.reason === "Bag is full") this.noteInv(p, MSG_FULL);
      else if (quote.reason.startsWith("Need")) this.noteInv(p, MSG_GOLD);
      return false;
    }
    p.gold = quote.next.gold;
    this.syncInv(p, quote.next.items);
    this.applyItems(p);
    if (p.player) {
      this.invNote = "";
      this.invNoteT = 0;
      this.sfx.coin();
    }
    return true;
  }

  private sellUnit(p: Unit | undefined, index: number): void {
    if (!p) return;
    const slot = p.inv?.[index];
    const it = giftById(slot?.id ?? "");
    if (!slot || !it) return;
    const carrier = this.readCarrier(p);
    const result = sell(carrier, index, [this.stockOf(it)]);
    if (!result.ok) return;
    this.writeCarrier(p, carrier);
    if (result.clearedBuff) {
      if (result.buffKind === "haste") p.hasteT = 0;
      if (result.buffKind === "shield") p.fx.shield = 0;
      if (result.buffKind === "popshield") p.fx.shield = 0;
    }
    if (this.sellPick === index && !p.inv[index]) this.sellPick = -1;
    this.applyItems(p);
    if (p.player) this.sfx.coin();
  }

  chooseMile(which: "a" | "b"): void {
    if (this.remote) {
      this.onRemoteOrder?.({ kind: "mile", which });
      return;
    }
    if (!this.mile) return;
    const perk = which === "a" ? this.mile.a : this.mile.b;
    const u = this.byId(this.mile.id);
    this.mile = null;
    if (!u) return;
    this.applyPerk(u, perk);
    this.banner = perk.name;
    this.bannerT = 1.8;
  }

  useBag(index: number): void {
    if (this.remote) {
      this.onRemoteOrder?.({ kind: "bag", index });
      return;
    }
    this.useBagUnit(this.player(), index);
  }

  private useBagUnit(p: Unit | undefined, index: number): void {
    if (!p || p.dead) return;
    const held = p.inv?.[index];
    const it = giftById(held?.id ?? "");
    if (!held || !it) return;
    const carrier = this.readCarrier(p);
    const result = activate(carrier, index, [this.stockOf(it)]);
    if (!result.ok) return;
    this.writeCarrier(p, carrier);
    if (result.effect === "haste") {
      p.hasteT = Math.max(p.hasteT, 3.2);
      p.itemBuff = { slot: index, kind: "haste" };
      this.floats.push({ x: p.x, y: p.y - 28, text: "HASTE", life: 0.7, color: "#f0c14a" });
    } else if (result.effect === "shield") {
      p.fx.shield = Math.max(p.fx.shield, 160);
      p.itemBuff = { slot: index, kind: "shield" };
      this.floats.push({ x: p.x, y: p.y - 28, text: "SHIELD", life: 0.7, color: "#7ec8ff" });
    } else if (result.effect === "heal" || result.heal > 0) {
      const n = result.heal > 0 ? result.heal : (it.heal ?? 0);
      if (n > 0) {
        p.hp = Math.min(p.maxHp, p.hp + n);
        this.floats.push({ x: p.x, y: p.y - 28, text: `+${n}`, life: 0.7, color: "#6adf7a" });
      }
    } else if (result.effect === "mana") {
      const n = it.manaRestore ?? 80;
      p.mana = Math.min(p.maxMana, p.mana + n);
      this.floats.push({ x: p.x, y: p.y - 28, text: `+${n}`, life: 0.7, color: "#7ec8ff" });
    } else if (result.effect === "cleanse") {
      p.fx.slow = 0;
      this.floats.push({ x: p.x, y: p.y - 28, text: "CLEAN", life: 0.7, color: "#efe6d6" });
    } else if (result.effect === "popshield") {
      p.fx.shield = Math.max(p.fx.shield, it.shieldPop ?? 80);
      p.itemBuff = { slot: index, kind: "popshield" };
      this.floats.push({ x: p.x, y: p.y - 28, text: "STICK", life: 0.7, color: "#f0c14a" });
    } else if (result.consume === "ward" || result.consume === "smoke") {
      this.useConsume(p, result.consume);
    }
    this.burst(p.x, p.y, "#f0c14a", 8);
    this.sfx.coin(0.7);
    this.applyItems(p);
  }

  /** Match gold for the local hero. Watch, gallery, and the enter demo do not take it. */
  grantGold(n: number): boolean {
    if (this.remote || this.headless) return false;
    if (this.spec || this.demo || this.watch || n <= 0) return false;
    const p = this.player();
    if (!p) return false;
    p.gold += n;
    this.banner = `+${Math.floor(n)} gold`;
    this.bannerT = 2.4;
    return true;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) this.sfx.unlock();
    return this.muted;
  }

  clearMute(): void {
    this.muted = false;
  }

  toggleAutoplay(): void {
    if (this.spec || this.demo) return;
    const p = this.player();
    if (this.autoplay) {
      if (p && isDevAiOnlyHero(p.heroId ?? "") && !humanMayControlHooli(p.handle || p.name || "")) {
        this.banner = "Hooli is AI-only";
        this.bannerT = 1.6;
        return;
      }
      this.autoplay = false;
      this.followStars = false;
      this.follow = true;
      this.manualUntil = 0;
      this.lastInput = this.clock;
      this.idleVote = null;
      this.banner = "You have the keyboard";
      this.bannerT = 1.6;
      if (p) {
        this.camX = p.x;
        this.camY = p.y;
      }
      return;
    }
    if (!this.watch && !canExpertAuto(p?.handle || p?.name || "")) return;
    this.autoplay = true;
    if (this.watch) this.followStars = true;
    this.manualUntil = 0;
    this.lastInput = this.clock;
    this.idleVote = null;
    this.banner = this.watch ? "Watching AI. Heroes fight on mid. Space snaps to the clash." : "Expert AI on";
    this.bannerT = 1.6;
  }

  stayActive(): void {
    this.lastInput = this.clock;
    this.idleVote = null;
    this.banner = "Kick vote dropped. You have the keyboard.";
    this.bannerT = 1.8;
  }

  keepAlive(): void {
    this.lastInput = this.clock;
  }

  callConcede(): void {
    if (this.watch || this.spec || this.demo || this.ended || this.screen !== "play") return;
    if (this.concede) {
      this.voteConcede(true);
      return;
    }
    if (this.concedeCd > 0) {
      this.banner = `Concede is cooling down · ${Math.ceil(this.concedeCd)}s`;
      this.bannerT = 1.8;
      return;
    }
    if (this.clock < CONCEDE_CLOCK) {
      this.banner = "Concede opens after 1:30, and only if MAGA is losing.";
      this.bannerT = 2.2;
      return;
    }
    if (!this.sideLosing("home")) {
      this.banner = "Concede stays closed until MAGA is losing.";
      this.bannerT = 2.2;
      return;
    }
    const names = this.teamPlayers();
    const you = this.voterName();
    this.concede = { yes: [you], names, start: this.clock, pulse: 0 };
    this.banner =
      names.length <= 1
        ? "MAGA conceded."
        : `Concede vote. Every MAGA player must agree · ${this.concede.yes.length}/${names.length}.`;
    this.bannerT = 2.8;
    this.pushFeed("Concede vote · MAGA");
    this.finishConcedeIfReady();
  }

  voteConcede(yes: boolean): void {
    if (this.watch || this.spec || this.demo || this.ended) return;
    if (!this.concede) {
      if (yes) this.callConcede();
      return;
    }
    const you = this.voterName();
    if (!yes) {
      this.failConcede("Concede vote failed. A MAGA player said no.");
      return;
    }
    if (!this.concede.yes.includes(you)) this.concede.yes.push(you);
    this.banner = `Concede vote · ${this.concede.yes.length}/${this.concede.names.length} MAGA players.`;
    this.bannerT = 2;
    this.finishConcedeIfReady();
  }

  private uniqPlayers(names: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const n of names) {
      const key = handleOf(n) || n.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(n);
    }
    return out;
  }

  private teamPlayers(): string[] {
    if (this.humans.length) return this.humans;
    const p = this.player();
    return p ? [p.name] : [];
  }

  private voterName(): string {
    return this.player()?.name ?? this.humans[0] ?? "You";
  }

  private countTowers(team: Team): number {
    return this.units.filter((u) => u.kind === "tower" && u.team === team && !u.dead).length;
  }

  private teamGold(team: Team): number {
    let g = 0;
    for (const u of this.units) {
      if (u.kind === "hero" && u.team === team) g += u.gold;
    }
    return g;
  }

  private teamKills(team: Team): number {
    let k = 0;
    for (const u of this.units) {
      if (u.kind === "hero" && u.team === team) k += u.kills;
    }
    return k;
  }

  private baseFrac(team: Team): number {
    const u = this.units.find((x) => x.kind === "ancient" && x.team === team);
    if (!u || u.maxHp <= 0) return 0;
    return Math.max(0, Math.min(1, u.hp / u.maxHp));
  }

  private ancientHp(team: Team): number {
    const u = this.units.find((x) => x.kind === "ancient" && x.team === team);
    if (!u || u.maxHp <= 0) return 1;
    return u.dead ? 0 : u.hp / u.maxHp;
  }

  private sideLosing(team: Team): boolean {
    const foe = other(team);
    const ours = this.countTowers(team);
    const theirs = this.countTowers(foe);
    if (ours < theirs) return true;
    if (ours > theirs) return false;
    if (this.teamGold(team) + 120 < this.teamGold(foe)) return true;
    if (this.ancientHp(team) + 0.08 < this.ancientHp(foe)) return true;
    return this.clock >= 150 && this.teamKills(team) < this.teamKills(foe);
  }

  private concedeHudMode(): "hidden" | "call" | "vote" {
    if (this.watch || this.spec || this.demo || this.ended || this.screen !== "play") return "hidden";
    if (this.concede) return "vote";
    if (this.clock >= CONCEDE_CLOCK && this.sideLosing("home") && this.concedeCd <= 0) return "call";
    return "hidden";
  }

  private concedeHudLine(): string {
    if (this.concede) {
      return `MAGA concede · ${this.concede.yes.length}/${this.concede.names.length} players. Every player on this side must vote yes. Bots do not vote.`;
    }
    if (this.concedeHudMode() === "call") {
      return "MAGA is losing. Call concede — every player on MAGA must agree.";
    }
    return "";
  }

  private tickConcede(dt: number): void {
    if (this.ended || this.screen !== "play") {
      this.concede = null;
      return;
    }
    if (!this.concede) {
      this.concedeCd = Math.max(0, this.concedeCd - dt);
      return;
    }
    if (!this.sideLosing("home")) {
      this.failConcede("Concede vote dropped. MAGA is not losing.");
      return;
    }
    if (this.clock - this.concede.start > CONCEDE_VOTE) {
      this.failConcede("Concede vote timed out.");
      return;
    }
    this.concede.pulse += dt;
    if (this.concede.pulse >= 0.75) {
      this.concede.pulse = 0;
      const you = this.voterName();
      const next = this.concede.names.find((n) => n !== you && !this.concede!.yes.includes(n));
      if (next) {
        this.concede.yes.push(next);
        this.banner = `${next} voted yes on concede · ${this.concede.yes.length}/${this.concede.names.length}.`;
        this.bannerT = 1.8;
        this.pushFeed(`${next} · concede yes`);
      }
    }
    this.finishConcedeIfReady();
  }

  private finishConcedeIfReady(): void {
    if (!this.concede) return;
    if (this.concede.yes.length < this.concede.names.length) return;
    this.concede = null;
    this.ended = true;
    this.screen = "defeat";
    this.sfx.lose();
    const line = callConcede();
    this.banner = line;
    this.bannerT = 6;
    this.pushFeed("MAGA conceded");
    if (!this.demo) this.sfx.announceNow(line);
  }

  private failConcede(why: string): void {
    this.concede = null;
    this.concedeCd = CONCEDE_COOLDOWN;
    this.banner = why;
    this.bannerT = 2.4;
    this.pushFeed("Concede vote failed");
  }

  private tickIdleKick(dt: number): void {
    if (this.watch || this.autoplay || this.ended || this.screen !== "play") {
      this.idleVote = null;
      return;
    }
    if (this.clock < 14 || this.clock - this.lastInput < MATCH_IDLE) {
      this.idleVote = null;
      return;
    }
    if (!this.idleVote) {
      this.idleVote = { yes: 1, need: 4, pulse: 0 };
      this.banner = "Idle kick vote. Take the keyboard or expert AI takes your kit.";
      this.bannerT = 3.2;
      this.pushFeed("Kick vote: idle");
    }
    this.idleVote.pulse += dt;
    if (this.idleVote.pulse >= 0.85 && this.idleVote.yes < this.idleVote.need) {
      this.idleVote.pulse = 0;
      this.idleVote.yes += 1;
    }
    if (this.idleVote.yes >= this.idleVote.need) {
      this.autoplay = true;
      this.manualUntil = 0;
      this.idleVote = null;
      this.lastInput = this.clock;
      this.banner = "Idle kick passed. Expert AI took your kit. P takes the keyboard.";
      this.bannerT = 3.4;
      this.pushFeed("Idle kick passed");
    }
  }

  castSlot(slot: number): void {
    this.input.queue({ kind: "ability", slot });
  }

  hud(): Hud {
    const p = this.camTarget() ?? this.player();
    const def = heroById(p?.heroId ?? this.selected);
    const inF = p ? this.nearFountain(p) : false;
    return {
      screen: this.screen,
      clock: this.fmt(this.clock),
      clockSec: Math.floor(this.clock),
      winner: this.screen === "victory" ? "home" : this.screen === "defeat" ? "away" : "",
      firstTower: this.firstTower,
      gold: Math.floor(p?.gold ?? 0),
      hp: Math.max(0, Math.floor(p?.hp ?? 0)),
      maxHp: Math.floor(p?.maxHp ?? def.hp),
      mana: Math.max(0, Math.floor(p?.mana ?? 0)),
      maxMana: Math.floor(p?.maxMana ?? def.mana),
      level: p?.level ?? 1,
      kda: `${p?.kills ?? 0} / ${p?.deaths ?? 0} / ${p?.assists ?? 0}`,
      kdr: kdr(p?.kills ?? 0, p?.deaths ?? 0),
      abilities: def.abilities.map((ab, i) => ({
        key: ab.key,
        name: ab.name,
        cd: p?.cds[i] ?? 0,
        max: ab.cd,
        ready: (p?.cds[i] ?? 0) <= 0 && (p?.mana ?? 0) >= ab.mana && (i < 3 || (p?.level ?? 1) >= 6),
        mana: ab.mana,
        fx: ab.fx,
        blurb: ab.blurb,
      })),
      items: p?.items ?? [],
      slots: (p?.inv ?? emptyCarrier().slots).map((slot) => {
        const gift = slot ? giftById(slot.id) : undefined;
        const active = Boolean(gift && (gift.cast === "haste" || gift.cast === "shield" || isConsume(gift)));
        return { id: slot?.id ?? "", count: slot?.count ?? 0, cd: slot?.cd ?? 0, active };
      }),
      invNote: this.invNoteT > 0 ? this.invNote : "",
      sellIndex: this.shopOpen ? this.sellPick : -1,
      shop: GIFT_ITEMS.map((it) => {
        const slots = p?.inv ?? emptyCarrier().slots;
        const stacked = Boolean(it.stackable) || isConsume(it);
        const stock: Stock = {
          id: it.id,
          cost: totalCost(it.id),
          sellValue: it.sellValue,
          stackable: stacked,
          maxStack: it.maxStack,
          consume: isConsume(it) ? it.cast : undefined,
        };
        const quote = p ? quotePurchase({ gold: p.gold, items: ownedIds(slots) }, it.id) : null;
        const fits = stacked ? canPlaceItem(slots, stock, [stock]) : Boolean(quote?.ok);
        const price = !stacked && quote && quote.spend > 0 ? quote.spend : stock.cost;
        let room = MSG_FULL;
        if (stacked) room = roomLabel(slots, stock, [stock]);
        else if (quote?.reason === "Bag is full") room = MSG_FULL;
        else if (slotFree(slots) || (quote?.consumed.length ?? 0) > 0 || quote?.ok) room = "slot free";
        const afford = (p?.gold ?? 0) >= price;
        return {
          id: it.id,
          name: it.name,
          cost: price,
          blurb: it.description,
          shelf: it.category,
          can: inF && (stacked ? afford && fits : Boolean(quote?.ok)),
          sellValue: sellValueOf({ cost: stock.cost, sellValue: it.sellValue }),
          room,
        };
      }),
      shopOpen: this.shopOpen && !this.spec,
      team: p?.team ?? "home",
      muted: this.muted,
      banner: this.bannerT > 0 ? this.banner : "",
      feed: this.feed.slice(0, 5).map((f) => f.text),
      dead: this.spec ? false : (p?.dead ?? false),
      respawn: p?.respawn ?? 0,
      selected: p?.heroId ?? this.selected,
      skin: skinById(p?.skin ?? "")?.name ?? "",
      inFountain: inF,
      canAutoplay: !this.spec && (this.watch || this.autoplay || canExpertAuto(p?.handle || p?.name || "")),
      autoplay: this.autoplay,
      tangled: this.tangled,
      drip: goldDrip(p?.handle || p?.name || "", true, this.tangled),
      idleKick: this.idleVote ? `Idle kick ${this.idleVote.yes}/${this.idleVote.need}. Take the keyboard or AI takes your kit.` : "",
      targetLine: this.spec ? "Gallery · type only" : this.targetHud(p),
      followTag: this.followStars ? this.starTag() : "",
      gallery: this.spec,
      cs: p?.cs ?? 0,
      streak: p?.streak ?? 0,
      bestStreak: Math.max(this.playerBest, p?.streak ?? 0),
      towers: this.playerTowers,
      xp: p?.xp ?? 0,
      xpNeed: this.xpNeed(p),
      xpPct: this.xpPct(p),
      heat: this.heatLine(p),
      concedeLine: this.concedeHudLine(),
      concedeMode: this.concedeHudMode(),
      phase: PHASE_LABEL[this.bf.phase],
      shelf: this.shelfNote(),
      objective: this.objectiveLine(),
      mile: this.mile ? `${this.mile.a.level === 11 ? "Level 11" : `Level ${this.mile.a.level}`} · pick a path` : "",
      mileA: this.mile ? `${this.mile.a.name} · ${this.mile.a.blurb}` : "",
      mileB: this.mile ? `${this.mile.b.name} · ${this.mile.b.blurb}` : "",
      bases: { home: this.baseFrac("home"), away: this.baseFrac("away") },
    };
  }

  update(dt: number): void {
    this.time += dt;
    this.liveCache = null;
    this.sizeSkip += 1;
    if (this.remote) {
      this.forwardRemote();
      this.easeChase(dt);
      const focus = this.player();
      if (this.follow && focus) {
        const k = 1 - Math.exp(-dt * 7.5);
        this.camX += (focus.x - this.camX) * k;
        this.camY += (focus.y - this.camY) * k;
      }
      this.clampCam();
      this.battleMixT += dt;
      if (this.battleMixT >= 0.12) {
        this.battleMixT = 0;
        this.mixBattle();
      }
      if (!this.headless) {
        if (!this.bound || this.sizeSkip % 8 === 0) this.resize();
        this.sightCache.home = null;
        this.sightCache.away = null;
        this.tickFog(dt);
        this.draw(false);
      }
      return;
    }
    if (!this.headless && (!this.bound || this.sizeSkip % 8 === 0)) this.resize();
    if (this.input.consumePause()) {
      if (this.screen === "play") this.screen = "paused";
      else if (this.screen === "paused") this.screen = "play";
    }
    if (this.input.consumeShop() && this.screen === "play" && !this.spec) this.shopOpen = !this.shopOpen;
    if (this.input.consumeCenter()) this.follow = true;
    const pan = this.input.pan();
    const drag = this.input.consumePanDelta();
    if ((this.screen === "play" || this.screen === "paused") && (pan.x || pan.y || drag.x || drag.y)) {
      this.follow = false;
      this.camX += pan.x * 900 * dt + drag.x;
      this.camY += pan.y * 900 * dt + drag.y;
      if (this.screen === "play") {
        this.lastInput = this.clock;
        this.idleVote = null;
      }
    }
    if (this.screen === "play" && this.input.consumeAutoplay()) this.toggleAutoplay();
    if (this.screen !== "play") {
      if (this.screen === "paused") {
        const pausedFocus = this.camTarget();
        if (this.follow && pausedFocus) {
          const k = 1 - Math.exp(-dt * 7.5);
          this.camX += (pausedFocus.x - this.camX) * k;
          this.camY += (pausedFocus.y - this.camY) * k;
        }
        this.clampCam();
      } else this.sfx.setBattle(0);
      if (!this.headless) this.draw(this.screen === "title" || this.screen === "help");
      return;
    }
    this.clock += dt;
    this.tickKillVoice();
    this.bannerT = Math.max(0, this.bannerT - dt);
    this.invNoteT = Math.max(0, this.invNoteT - dt);
    this.killLineT = Math.max(0, this.killLineT - dt);
    if (this.killLineT <= 0) this.killLine = "";
    this.tickBattlefield();
    this.tickWards(dt);
    if (this.holdCallT > 0) {
      this.holdCallT -= dt;
      if (this.holdCallT <= 0 && this.holdCall) {
        if (!this.demo) this.sfx.announceNow(this.holdCall);
        this.holdCall = "";
      }
    }
    this.guard = Math.max(0, this.guard - dt);
    this.waveT -= dt;
    if (this.waveT <= 0) {
      this.spawnWave();
      this.waveT = 24;
    }
    const order = this.input.consumeOrder();
    const steerHero = this.player();
    const hooliLocked = Boolean(
      steerHero && isDevAiOnlyHero(steerHero.heroId ?? "") && !humanMayControlHooli(steerHero.handle || steerHero.name || ""),
    );
    if (hooliLocked) {
      this.autoplay = true;
      this.manualUntil = 0;
    }
    const canSteer = !this.spec && !this.demo && !(this.watch && this.autoplay) && !hooliLocked;
    if (order && canSteer) {
      this.lastInput = this.clock;
      this.idleVote = null;
      if (this.autoplay) this.manualUntil = this.clock + 5;
      this.handleOrder(order);
    }
    this.tickIdleKick(dt);
    this.tickConcede(dt);
    if (!this.ended) {
      this.liveCache = null;
      this.sightCache.home = null;
      this.sightCache.away = null;
      for (const u of this.units) {
        if (u.kind === "hero" && !u.dead) {
          if (this.aiControlled(u)) {
            u.aiT -= dt;
            if (u.aiT <= 0) {
              u.aiT = 0.11 + (u.id % 7) * 0.012;
              this.think(u, dt);
            }
          }
        }
        this.tickUnit(u, dt);
      }
      this.tickShots(dt);
      this.tickSpells();
      this.tickFx(dt);
      this.liveCache = null;
      let kept = 0;
      for (let i = 0; i < this.units.length; i++) {
        const u = this.units[i]!;
        if (u.dead && u.kind === "minion" && !u.wild && u.barkT <= 0) continue;
        this.units[kept++] = u;
      }
      this.units.length = kept;
      this.checkWin();
    }
    const focus = this.camTarget();
    if (this.follow && focus) {
      const k = 1 - Math.exp(-dt * 7.5);
      this.camX += (focus.x - this.camX) * k;
      this.camY += (focus.y - this.camY) * k;
    }
    this.clampCam();
    this.battleMixT += dt;
    if (this.battleMixT >= 0.12) {
      this.battleMixT = 0;
      this.mixBattle();
    }
    this.sightCache.home = null;
    this.sightCache.away = null;
    this.tickFog(dt);
    if (!this.headless) this.draw(false);
  }

  private forwardRemote(): void {
    const order = this.input.consumeOrder();
    if (!order || !this.onRemoteOrder) return;
    if (order.kind === "ability" || order.kind === "choose") {
      const w = this.input.world();
      this.onRemoteOrder({ ...order, x: order.x ?? w.x, y: order.y ?? w.y });
      return;
    }
    this.onRemoteOrder(order);
  }

  private easeChase(dt: number): void {
    const k = 1 - Math.exp(-dt * 14);
    for (const u of this.units) {
      const c = this.chase.get(u.id);
      if (!c) continue;
      u.x += (c.x - u.x) * k;
      u.y += (c.y - u.y) * k;
    }
  }

  private mixBattle(): void {
    if (this.ended) {
      this.sfx.setBattle(0);
      return;
    }
    const r2 = 920 * 920;
    let heroClash = 0;
    let steel = 0;
    for (const u of this.units) {
      if (u.dead || u.target == null) continue;
      const dx = u.x - this.camX;
      const dy = u.y - this.camY;
      if (dx * dx + dy * dy > r2) continue;
      const t = this.byId(u.target);
      if (!t || t.dead) continue;
      if (u.kind === "hero") {
        steel += 0.45;
        if (t.kind === "hero") heroClash += 1;
      } else if (u.kind === "minion" || u.kind === "tower") {
        steel += 0.12;
      }
    }
    const n = Math.min(1, heroClash * 0.28 + steel * 0.08);
    this.sfx.setBattle(0.16 + n * 0.84, this.bf.phase);
    this.sfx.setDrumFight(Math.min(1, heroClash * 0.5 + steel), this.bf.phase);
  }

  private clampCam(): void {
    const edge = 180;
    this.camX = clamp(this.camX, edge, WORLD - edge);
    this.camY = clamp(this.camY, edge, WORLD - edge);
  }

  starTag(): string {
    return this.starHandle === "lilhooligan" ? "@lilhooligan" : "@blake";
  }

  private camTarget(): Unit | undefined {
    if (this.followStars) {
      const star = this.starUnit();
      if (star && this.closestEnemyHero(star, 480)) return star;
      const clash = this.clashFocus();
      if (clash) return clash;
      return star;
    }
    if (this.watch) return this.watchFocus();
    return this.player();
  }

  private clashFocus(): Unit | undefined {
    const star = this.starUnit();
    let best: Unit | undefined;
    let score = 0;
    for (const u of this.units) {
      if (u.dead || u.kind !== "hero") continue;
      let n = 0;
      for (const e of this.units) {
        if (e.dead || e.kind !== "hero" || e.team === u.team) continue;
        if (dist(u, e) < 420) n += 1;
      }
      if (n <= 0) continue;
      const s = n * 12 + (star && u.id === star.id ? 6 : 0);
      if (s > score) {
        score = s;
        best = u;
      }
    }
    return best;
  }

  private pickStar(home: string[], away: string[]): void {
    const names = [...home, ...away];
    const hasBlake = names.some((n) => handleOf(n) === "blake");
    const hasLil = names.some((n) => handleOf(n) === "lilhooligan");
    this.starHandle = hasBlake && hasLil ? (Math.random() < 0.5 ? "blake" : "lilhooligan") : hasBlake ? "blake" : "lilhooligan";
    const star = this.starUnit();
    const focus = star ?? this.watchFocus();
    if (focus) {
      this.camX = focus.x;
      this.camY = focus.y;
    }
  }

  heroCard(): { name: string; team: Team; heroId: string; lane: string; x: number; y: number; hp: number; targetTeam: string }[] {
    return this.units
      .filter((u) => u.kind === "hero")
      .map((u) => {
        const target = u.target !== null ? this.byId(u.target) : undefined;
        return {
          name: u.name,
          team: u.team,
          heroId: u.heroId ?? "",
          lane: u.lane ?? "",
          x: Math.round(u.x),
          y: Math.round(u.y),
          hp: Math.round(u.hp),
          targetTeam: target && !target.dead ? target.team : "",
        };
      });
  }

  /**
   * Existing swing path against a still foe on mid.
   * A spoofed ranged flag must not let an MMA kit fire a basic-attack projectile.
   */
  rehearseBasic(heroId: string, gap: number, spoofRanged = false): {
    heroId: string;
    melee: boolean;
    range: number;
    basicShots: number;
    dealt: boolean;
    startDist: number;
    dist: number;
  } {
    this.halt();
    this.ended = false;
    this.screen = "play";
    this.remote = false;
    this.autoplay = false;
    this.watch = false;
    this.demo = false;
    this.spec = false;
    this.guard = 0;
    this.shots = [];
    this.units = [];
    this.floats = [];
    const path = lanePath.home.mid;
    const origin = along(path, 0.08);
    let foeAt = along(path, 0.45);
    for (let t = 0.09; t <= 0.95; t += 0.005) {
      const p = along(path, t);
      if (Math.hypot(p.x - origin.x, p.y - origin.y) >= gap) {
        foeAt = p;
        break;
      }
    }
    const def = heroById(heroId);
    this.spawnHero(def, "home", true, "mid", "probe");
    const attacker = this.units.find((u) => u.kind === "hero" && u.heroId === def.id);
    if (!attacker) throw new Error(`missing ${heroId}`);
    attacker.x = origin.x;
    attacker.y = origin.y;
    attacker.mana = 0;
    attacker.maxMana = 0;
    attacker.path = [];
    attacker.aggro = false;
    attacker.lockOn = true;
    attacker.attackMove = false;
    const dummy = this.baseUnit("minion", "away", "bag", foeAt.x, foeAt.y, 18, null);
    dummy.maxHp = 50000;
    dummy.hp = dummy.maxHp;
    dummy.ms = 0;
    dummy.range = 0;
    dummy.armor = 0;
    dummy.damage = 0;
    this.units.push(dummy);
    attacker.target = dummy.id;
    if (spoofRanged) {
      attacker.melee = false;
      attacker.range = 900;
    }
    const startDist = dist(attacker, dummy);
    const hp0 = dummy.hp;
    const seen = new Set<Shot>();
    let basicShots = 0;
    for (let i = 0; i < 150; i++) {
      this.tickUnit(attacker, 1 / 30);
      for (const s of this.shots) {
        if (s.from === attacker.id && s.onHit && !seen.has(s)) {
          seen.add(s);
          basicShots += 1;
        }
      }
      this.tickShots(1 / 30);
    }
    return {
      heroId: def.id,
      melee: attacker.melee,
      range: attacker.range,
      basicShots,
      dealt: dummy.hp < hp0 - 0.5,
      startDist,
      dist: dist(attacker, dummy),
    };
  }

  private starUnit(): Unit | undefined {
    const live = (handle: string) =>
      this.units.find((u) => u.kind === "hero" && !u.dead && u.handle === handle);
    const mine = live(this.starHandle);
    if (mine) return mine;
    const other = this.starHandle === "blake" ? "lilhooligan" : "blake";
    const swap = live(other);
    if (swap) {
      this.starHandle = other;
      return swap;
    }
    return this.units.find((u) => u.kind === "hero" && !u.dead);
  }

  private player(): Unit | undefined {
    return this.units.find((u) => u.player);
  }

  private watchFocus(): Unit | undefined {
    let best: Unit | undefined;
    let score = -1;
    for (const u of this.units) {
      if (u.kind !== "hero" || u.dead) continue;
      let n = 0;
      for (const e of this.units) {
        if (e.dead || e.kind !== "hero" || e.team === u.team) continue;
        if (dist(u, e) < 420) n += 1;
      }
      const s = n * 12 + (u.player ? 2 : 0);
      if (s > score) {
        score = s;
        best = u;
      }
    }
    return best ?? this.player();
  }

  private scrim(): boolean {
    return this.demo || (this.watch && !this.spec);
  }

  private spawnHero(def: HeroDef, team: Team, player: boolean, lane: Lane, alias?: string, index = 0): void {
    const spot = poolSpawn(fountain[team], index);
    const label = alias?.trim() || def.name;
    const u = this.baseUnit("hero", team, label, spot.x, spot.y, heroHitRadius(def.id), def);
    u.player = player;
    u.heroId = def.id;
    u.lane = lane;
    u.poolIndex = index;
    u.handle = handleOf(label);
    u.gold = OPENING_GOLD;
    u.color = def.color;
    u.period = def.aspd ?? (def.melee ? 1.05 : 1.2);
    u.hpRegen = def.hpRegen ?? 2.2;
    u.manaRegen = def.manaRegen ?? 6;
    u.mr = def.mr ?? 0;
    u.baseMs = def.ms;
    this.keepMmaMelee(u);
    this.keepRedBookMelee(u);
    if (player) this.shout(u, def.voice?.select ?? `${def.name}. Locked.`, true);
    if (player && this.worn) {
      const dlc = skinById(this.worn);
      if (dlc && (dlc.hero === def.id || dlc.hero === "all")) {
        u.skin = dlc.id;
        u.color = dlc.tint;
      }
    }
    this.units.push(u);
    if (botDeployDebug() && !player) {
      const side = team === "home" ? "A" : "B";
      console.info(`[Bot] ${label} spawned → Team ${side} pool`);
      console.info(`[Bot] ${label} starting gold → ${u.gold}`);
      console.info(`[Bot] ${label} lane assigned → ${lane.toUpperCase()}`);
    }
  }

  /**
   * Opening buy is done. AI heroes walk to their lane entrance.
   * They do not sit in the pool waiting for the creep wave.
   */
  private holdForWave(): void {
    for (const u of this.units) {
      if (u.kind !== "hero") continue;
      u.path = [];
      u.target = null;
      u.waveAt = -1;
      u.joinedWave = false;
      u.routeKey = "";
      if (u.waveDuty === "PREPARING" && this.needsOpeningItem(u) && this.aiControlled(u)) continue;
      u.waveDuty = "MOVING_TO_LANE_START";
    }
  }

  private spawnTower(team: Team, lane: Lane, tier: TowerTier, pos: Pt): void {
    const hp = tier === "outer" ? 1500 : tier === "middle" ? 1850 : 2200;
    const u = this.baseUnit("tower", team, `${tier} ${lane}`, pos.x, pos.y, laneTowerRadius(tier), null);
    u.maxHp = hp;
    u.hp = hp;
    u.damage = tier === "outer" ? 44 : tier === "middle" ? 52 : 60;
    u.range = tier === "outer" ? 340 : tier === "middle" ? 370 : 400;
    u.period = 0.95;
    u.ms = 0;
    u.armor = tier === "outer" ? 6 : tier === "middle" ? 8 : 10;
    u.lane = lane;
    u.towerTier = tier;
    u.melee = false;
    u.color = team === "home" ? "#3d7ea6" : "#a63d3d";
    this.units.push(u);
  }

  private spawnAncient(team: Team): void {
    const p = ancientPos[team];
    const u = this.baseUnit("ancient", team, team === "home" ? "Washington DC" : "Seattle", p.x, p.y, 36, null);
    u.maxHp = 2800;
    u.hp = 2800;
    u.damage = 62;
    u.range = 420;
    u.period = 0.85;
    u.ms = 0;
    u.armor = 10;
    u.melee = false;
    u.color = team === "home" ? "#f0c14a" : "#ff4d8d";
    this.units.push(u);
  }

  private spawnWave(): void {
    this.waves += 1;
    const archers = this.waves % 3 === 0 ? 2 : 1;
    for (const team of ["home", "away"] as Team[]) {
      for (const lane of LANES) {
        const path = lanePath[team][lane];
        const a = path[0] ?? fountain[team];
        const b = path[1] ?? a;
        const n = norm(b.x - a.x, b.y - a.y);
        const p = { x: -n.y, y: n.x };
        for (let i = 0; i < 3; i++) {
          this.spawnMinion(
            team,
            lane,
            "infantry",
            a.x + n.x * 28 + p.x * (i - 1) * 22,
            a.y + n.y * 28 + p.y * (i - 1) * 22,
          );
        }
        for (let i = 0; i < archers; i++) {
          const side = archers === 1 ? 0 : i === 0 ? -1 : 1;
          this.spawnMinion(
            team,
            lane,
            "archer",
            a.x - n.x * 36 + p.x * side * 16,
            a.y - n.y * 36 + p.y * side * 16,
          );
        }
      }
    }
    this.banner = this.waves === 1 ? "Minion line is out" : `Wave ${this.waves}`;
    this.bannerT = 1.3;
    this.sfx.wave();
    const lead = this.units.find((u) => u.kind === "minion" && !u.wild && !u.dead && u.team === "home" && !u.caster);
    if (lead) this.shout(lead, creepBark("home"), false);
  }

  private spawnMinion(team: Team, lane: Lane, job: "infantry" | "archer", x: number, y: number): void {
    const archer = job === "archer";
    const u = this.baseUnit("minion", team, archer ? "Archer" : "Infantry", x, y, laneCreepRadius(job), null);
    u.maxHp = archer ? 240 : 420;
    u.hp = u.maxHp;
    u.damage = archer ? 16 : 24;
    u.range = archer ? 310 : 92;
    u.period = archer ? 1.25 : 1.05;
    u.ms = archer ? 238 : 252;
    u.melee = !archer;
    u.caster = archer;
    u.lane = lane;
    u.wp = 0;
    u.gold = archer ? 32 : 44;
    u.color = archer
      ? team === "home" ? "#c9e4a8" : "#e8c08a"
      : team === "home" ? "#6a90c4" : "#c45c5c";
    this.units.push(u);
  }

  private spawnCamps(): void {
    for (const camp of JUNGLE_CAMPS) {
      this.spawnCampCreep(camp.name, camp.x, camp.y, true, camp.fir);
      this.spawnCampCreep(camp.name, camp.x + 28, camp.y + 18, false, camp.fir);
      this.spawnCampCreep(camp.name, camp.x - 26, camp.y + 16, false, camp.fir);
    }
  }

  private spawnCampCreep(camp: string, x: number, y: number, alpha: boolean, fir: boolean): void {
    const u = this.baseUnit("minion", "home", alpha ? camp : `${camp} pup`, x, y, alpha ? 18 : 13, null);
    u.wild = true;
    u.homeX = x;
    u.homeY = y;
    u.maxHp = alpha ? 720 : 340;
    u.hp = u.maxHp;
    u.damage = alpha ? 30 : 16;
    u.range = 78;
    u.period = 1.15;
    u.ms = 210;
    u.melee = true;
    u.gold = alpha ? 88 : 42;
    u.color = fir ? "#4a7a62" : "#8a5a28";
    this.units.push(u);
  }

  private baseUnit(kind: Kind, team: Team, name: string, x: number, y: number, r: number, def: HeroDef | null): Unit {
    return {
      id: this.nid++,
      kind,
      team,
      name,
      x,
      y,
      r,
      hp: def?.hp ?? 100,
      maxHp: def?.hp ?? 100,
      mana: def?.mana ?? 0,
      maxMana: def?.mana ?? 0,
      damage: def?.damage ?? 10,
      armor: def?.armor ?? 0,
      range: def?.range ?? 120,
      ms: def?.ms ?? 0,
      melee: def?.melee ?? true,
      atk: 0,
      beat: 0,
      period: def ? (def.melee ? 1.05 : 1.2) : 1.1,
      dead: false,
      respawn: 0,
      path: [],
      target: null,
      drawId: 0,
      level: 1,
      xp: 0,
      gold: 0,
      items: [],
      inv: emptyCarrier().slots,
      itemBuff: null,
      cds: [0, 0, 0, 0],
      fx: { stun: 0, slow: 0, shield: 0, aspd: 0, taunt: 0 },
      player: false,
      seat: -1,
      driven: false,
      handle: "",
      wp: 0,
      caster: false,
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      streak: 0,
      hits: {},
      color: def?.color ?? "#ccc",
      wild: false,
      homeX: x,
      homeY: y,
      bark: "",
      barkT: 0,
      face: team === "home" ? -Math.PI / 4 : (3 * Math.PI) / 4,
      aggro: true,
      lockOn: false,
      attackMove: false,
      bashCd: 0,
      aiT: 0,
      routeX: -1,
      routeY: -1,
      routeKey: "",
      routeAt: 0,
      jungler: false,
      campStick: "",
      poolIndex: 0,
      waveAt: -1,
      waveLx: 0,
      waveLy: 0,
      waveAdv: 0,
      waveFrom: 0,
      waveSeen: false,
      waveDuty: "WAITING_IN_BASE",
      joinedWave: false,
      heat: 0,
      heatMax: 5,
      dashMark: 0,
      castT: 0,
      castUlt: false,
      moved: false,
      hurtT: 0,
      burstAge: 0,
      guardCd: 0,
      hasteT: 0,
      markT: 0,
      baseMs: def?.ms ?? 0,
      hpRegen: def?.hpRegen ?? 2.2,
      manaRegen: def?.manaRegen ?? 6,
      mr: def?.mr ?? 0,
      objectiveId: "",
      respawnMax: 0,
      leash: 0,
      sense: 0,
      perks: [],
      spellAmp: 1,
      ultAmp: 1,
      cdMul: 1,
      castHeal: 0,
      slowOnHit: 0,
      stealthT: 0,
      boonT: 0,
      boonDmg: 0,
      itemCd: 0,
      trueSight: 0,
      shrineCd: 0,
      armorBase: def?.armor ?? 0,
      xpWorth: 0,
    };
  }

  private kitOf(u: Unit): KitPatch {
    return kitPatch(u.heroId ?? "riot");
  }

  private handleOrder(order: Order | null): void {
    if (!order || this.spec || this.demo) return;
    const p = this.player();
    if (!p || p.dead) return;
    this.applyOrder(p, order);
  }

  private aimOf(order: Order): { x: number; y: number } {
    if ((order.kind === "ability" || order.kind === "choose") && order.x != null && order.y != null) {
      return { x: order.x, y: order.y };
    }
    return this.input.world();
  }

  private applyOrder(p: Unit, order: Order): void {
    if (p.dead && order.kind !== "buy" && order.kind !== "sell") return;
    const mouse = this.aimOf(order);
    if (order.kind === "stop") {
      p.path = [];
      p.target = null;
      p.aggro = false;
      p.lockOn = false;
      p.attackMove = false;
      this.input.attackMove = false;
      return;
    }
    if (order.kind === "buy") {
      this.buyUnit(p, order.id);
      return;
    }
    if (order.kind === "sell") {
      this.sellUnit(p, order.index);
      return;
    }
    if (order.kind === "bag") {
      this.useBagUnit(p, order.index);
      return;
    }
    if (order.kind === "mile") {
      if (!this.mile || this.mile.id !== p.id) return;
      const perk = order.which === "a" ? this.mile.a : this.mile.b;
      this.mile = null;
      this.applyPerk(p, perk);
      this.banner = perk.name;
      this.bannerT = 1.8;
      return;
    }
    if (order.kind === "choose") {
      const hit = this.pickChoose(p, mouse.x, mouse.y, 64);
      if (hit) {
        this.lockTarget(p, hit);
        this.input.attackMove = false;
        this.banner = `Target · ${this.targetLabel(hit)}`;
        this.bannerT = 1.3;
        return;
      }
      this.input.attackMove = !this.input.attackMove;
      this.banner = this.input.attackMove ? "A · click a creep or hero" : "Target cancelled";
      this.bannerT = 1.6;
      return;
    }
    if (order.kind === "move" || order.kind === "attack-move") {
      const aggro = order.kind === "attack-move";
      const hit = this.pickChoose(p, order.x, order.y, 56);
      if (hit) {
        this.lockTarget(p, hit);
        this.input.attackMove = false;
        return;
      }
      const dest = nearestWalkable(order.x, order.y);
      p.target = null;
      p.path = findPath(p.x, p.y, dest.x, dest.y);
      p.aggro = aggro;
      p.lockOn = false;
      p.attackMove = aggro;
      this.marker = dest;
      return;
    }
    if (order.kind === "attack") {
      const hit = this.byId(order.id);
      if (hit && this.canChoose(p, hit)) this.lockTarget(p, hit);
      return;
    }
    if (order.kind === "ability") this.tryCast(p, order.slot, mouse.x, mouse.y);
  }

  private tryCast(u: Unit, slot: number, x: number, y: number): void {
    const def = heroById(u.heroId ?? "riot");
    const ab = def.abilities[slot];
    if (!ab) return;
    if (slot === 3 && u.level < 6) return;
    if (u.cds[slot]! > 0 || u.mana < ab.mana || u.fx.stun > 0) return;
    const hover = this.unitAt(x, y, 28);
    const enemy = hover && hover.team !== u.team && !hover.dead ? hover : this.closestEnemy(u, ab.range || 500);
    if (ab.kind === "unit" && !enemy) return;
    u.mana -= ab.mana;
    u.cds[slot] = ab.cd * (slot < 3 ? u.cdMul : 1);
    if (u.castHeal > 0) u.hp = Math.min(u.maxHp, u.hp + u.castHeal);
    u.castUlt = slot === 3;
    u.castT = slot === 3 ? 0.55 : 0.38;
    this.sfx.kitCast(def.id, slot === 3, this.hear(u));
    this.noteNet({ kind: "cast", heroId: def.id, x: u.x, y: u.y, melee: u.melee, ult: slot === 3, team: u.team });
    const kit = this.kitOf(u);
    if (slot === 3) this.shout(u, kit.voice.ult, true);
    else if (Math.random() < 0.42) this.shout(u, kit.voice.casts[slot] ?? kit.voice.casts[0] ?? heroTaunt(u.team), false);
    this.playFx(u, ab.fx, x, y, enemy, slot === 3, ab.range, slot, ab.mech);
  }

  private playFx(u: Unit, fx: CastFx, x: number, y: number, enemy: Unit | undefined, ult: boolean, range: number, slot = 0, mech?: string): void {
    const kit = this.kitOf(u);
    const allies = this.living().filter((a) => a.team === u.team && a.id !== u.id && dist(a, u) < 260).length;
    const pow = (base: number) => {
      let n = base + u.level * (ult ? 14 : 8);
      if (kit.kind === "heat" && ult) n += u.heat * 16;
      if (kit.kind === "mark" && enemy && enemy.markT > 0) n *= ult ? 1.28 : 1.16;
      if (kit.kind === "link" && fx === "heal") n *= 1 + Math.min(3, allies) * 0.12;
      if (kit.kind === "ambush" && inWoods(u.x, u.y)) n *= 1.08;
      n *= u.spellAmp;
      if (ult) n *= u.ultAmp;
      return n;
    };
    if (mech) this.castMech(u, mech, x, y, enemy, ult, range, slot, pow, "cast");
    else if (fx === "cone") this.cone(u, x, y, Math.max(range, 180), 70, pow(90));
    else if (fx === "dash") this.dash(u, x, y, range || 320);
    else if (fx === "aspd") u.fx.aspd = 4 + (kit.kind === "heat" ? u.heat * 0.28 : 0);
    else if (fx === "nova") this.nova(u, range || (ult ? 250 : 220), pow(ult ? 180 : 120));
    else if (fx === "bolt" && enemy) {
      const sniper = ult && kit.kind === "barrage";
      this.bolt(u, enemy, pow(ult ? (sniper ? 270 : 220) : 100), sniper ? 860 : 620);
      if (sniper) this.floats.push({ x: enemy.x, y: enemy.y - 42, text: "SNIPER", life: 0.8, color: "#ff4da6" });
    }
    else if (fx === "slow") this.slowZone(x, y, u.team, 180, kit.kind === "zone" ? 2.6 : 2.2);
    else if (fx === "stun" && enemy) {
      this.hurt(enemy, pow(80), u, { spell: true });
      this.applyStun(enemy, 1.1, u);
    } else if (fx === "shield") u.fx.shield = 160 + u.level * 10;
    else if (fx === "taunt") {
      for (const e of this.living()) {
        if (e.team !== u.team && dist(e, u) < (range || 230)) {
          e.fx.taunt = 1.6;
          e.target = u.id;
        }
      }
      if (kit.kind === "tauntwall") u.fx.shield = Math.max(u.fx.shield, 110 + u.level * 8);
    } else if (fx === "dashnova") {
      this.dash(u, x, y, range || 380);
      this.nova(u, 160, pow(160));
    } else if (fx === "heal") this.healNear(u, range || 230, pow(ult ? 160 : 90));
    else if (fx === "rain") this.rain(x, y, u, 170, pow(110));

    if (!mech && (fx === "dash" || fx === "dashnova")) {
      u.dashMark = 2.2;
      if (kit.kind === "haste" || kit.kind === "ambush" || kit.kind === "barrage") u.hasteT = 2.3;
    }
    if ((fx === "slow" || fx === "stun" || fx === "rain") && (kit.kind === "mark" || kit.kind === "zone")) {
      if (enemy) enemy.markT = 3.2;
      else {
        for (const e of this.living()) {
          if (e.team !== u.team && dist(e, { x, y }) < 190) e.markT = 3.2;
        }
      }
    }
    if (!mech && kit.kind === "zone" && (fx === "rain" || (fx === "nova" && ult))) {
      this.slowZone(fx === "rain" ? x : u.x, fx === "rain" ? y : u.y, u.team, 170, 1.15);
    }
    if (kit.kind === "heat") {
      if (ult) {
        if (u.heat > 0) this.floats.push({ x: u.x, y: u.y - 36, text: `${kit.stack} ${u.heat}`, life: 0.85, color: "#ff6b3a" });
        u.heat = 0;
        this.applyItems(u);
      } else if (slot < 3) {
        u.heat = Math.min(u.heatMax, u.heat + 1);
        this.floats.push({ x: u.x, y: u.y - 26, text: `${kit.stack} ${u.heat}`, life: 0.55, color: "#f0c14a" });
        this.applyItems(u);
      }
    }
    if (kit.kind === "mark" && ult && enemy) enemy.markT = 0;
    if (ult) {
      this.shake = Math.max(this.shake, 0.26);
      this.burst(u.x, u.y, u.color, 22);
    }
    const ringKind: CastRing["kind"] = ult
      ? "ult"
      : fx === "heal"
        ? "heal"
        : fx === "slow" || fx === "rain"
          ? "slow"
          : fx === "dash" || fx === "dashnova"
            ? "dash"
            : fx === "cone"
              ? "cone"
              : "nova";
    const ringX = fx === "rain" || fx === "slow" ? x : u.x;
    const ringY = fx === "rain" || fx === "slow" ? y : u.y;
    this.rings.push({
      x: ringX,
      y: ringY,
      r: Math.max(90, range || (ult ? 240 : 180)),
      life: ult ? 0.72 : 0.42,
      max: ult ? 0.72 : 0.42,
      color: fx === "heal" ? "#80cbc4" : fx === "slow" ? "#7ec8ff" : pixelVfxColor(u.heroId ?? "riot"),
      kind: ringKind,
      heroId: u.heroId,
    });
  }

  private healNear(u: Unit, range: number, amt: number): void {
    for (const a of this.living()) {
      if (a.team !== u.team || dist(a, u) > range) continue;
      a.hp = Math.min(a.maxHp, a.hp + amt);
    }
    this.burst(u.x, u.y, "#80cbc4", 12 + Math.min(6, Math.round(amt / 40)));
  }

  private rain(x: number, y: number, from: Unit, r: number, dmg: number): void {
    for (const e of this.living()) {
      if (e.team !== from.team && Math.hypot(e.x - x, e.y - y) < r) this.hurt(e, dmg, from, { spell: true });
    }
    this.burst(x, y, from.color, 16);
  }

  private dash(u: Unit, x: number, y: number, range: number): void {
    const n = Math.hypot(x - u.x, y - u.y) || 1;
    const d = Math.min(range, n);
    const nx = u.x + ((x - u.x) / n) * d;
    const ny = u.y + ((y - u.y) / n) * d;
    const p = nearestWalkable(nx, ny);
    u.x = p.x;
    u.y = p.y;
    u.path = [];
    this.burst(u.x, u.y, u.color, 10);
  }

  private cone(u: Unit, x: number, y: number, range: number, spread: number, dmg: number): void {
    const face = Math.atan2(y - u.y, x - u.x);
    for (const e of this.living()) {
      if (e.team === u.team) continue;
      const d = dist(u, e);
      if (d > range) continue;
      const ang = Math.atan2(e.y - u.y, e.x - u.x);
      let diff = Math.abs(ang - face);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < (spread * Math.PI) / 180) this.hurt(e, dmg, u, { spell: true });
    }
    this.burst(u.x + Math.cos(face) * 80, u.y + Math.sin(face) * 80, u.color, 12);
  }

  private nova(u: Unit, range: number, dmg: number): void {
    for (const e of this.living()) {
      if (e.team !== u.team && dist(u, e) < range) this.hurt(e, dmg, u, { spell: true });
    }
    this.burst(u.x, u.y, u.color, 18);
  }

  private bolt(from: Unit, to: Unit, dmg: number, speed = 620, rider?: Shot["rider"], useMuzzle = false): void {
    this.sfx.arrow();
    const nerf = from.heroId === ALEX_GROANS_ID;
    const face = Math.atan2(to.y - from.y, to.x - from.x);
    const muzzle =
      (nerf || useMuzzle) && from.heroId
        ? heroWeaponMuzzle(from.heroId, from.x, from.y, face, "attack")
        : { x: from.x, y: from.y };
    this.shots.push({
      x: muzzle.x,
      y: muzzle.y,
      tx: to.x,
      ty: to.y,
      speed,
      dmg,
      team: from.team,
      target: to.id,
      from: from.id,
      color: pixelVfxColor(from.heroId ?? "riot"),
      crit: false,
      onHit: false,
      heroId: from.heroId,
      ammo: nerf ? this.takeNerf(from.id) : undefined,
      source: "spell",
      rider,
    });
  }

  private takeNerf(id: number): NerfColor {
    const color = nextNerfColor(this.nerfColor.get(id));
    this.nerfColor.set(id, color);
    return color;
  }

  private slowZone(x: number, y: number, team: Team, r: number, dur: number): void {
    for (const e of this.living()) {
      if (e.team !== team && Math.hypot(e.x - x, e.y - y) < r) e.fx.slow = dur;
    }
    this.burst(x, y, "#7ec8ff", 14);
  }

  private castMech(
    u: Unit,
    id: string,
    x: number,
    y: number,
    enemy: Unit | undefined,
    ult: boolean,
    range: number,
    _slot: number,
    pow: (base: number) => number,
    phase: "cast" | "go" | "armed",
  ): void {
    const spec = mechById(id);
    const delay =
      spec.timing === "pulse" ? 0.42 : spec.span > 0 && spec.span <= 5 ? spec.span : spec.timing === "windup" ? 0.5 : 0.8;
    if (phase === "cast" && spec.timing === "next") {
      this.mechSelf(u, spec, pow, ult, 1);
      this.armed.set(u.id, id);
      this.floats.push({ x: u.x, y: u.y - 22, text: "READY", life: 0.55, color: u.color });
      return;
    }
    if (phase === "cast" && (spec.timing === "windup" || spec.timing === "expire" || spec.timing === "pulse")) {
      if (spec.timing !== "windup") {
        const blinkLater = spec.timing === "expire" && spec.travel === "blink";
        this.mechGo(u, spec, x, y, enemy, ult, range, pow, !blinkLater, spec.timing === "pulse" ? 0.7 : 0.65);
      } else {
        this.floats.push({ x, y: y - 16, text: "…", life: 0.45, color: u.color });
      }
      this.spellPending.push({
        at: this.clock + delay,
        owner: u.id,
        mech: id,
        x,
        y,
        enemy: enemy?.id ?? -1,
        ult,
        range,
        slot: _slot,
        heat: u.heat,
      });
      return;
    }
    const popping = phase === "go" && spec.timing === "expire";
    const pulsing = phase === "go" && spec.timing === "pulse";
    if (popping && (spec.self === "decay" || spec.self === "aspd")) {
      this.mechPop(u, spec, pow);
      return;
    }
    const mult = popping ? 0.85 : pulsing ? 0.7 : 1;
    const move = phase !== "armed" && !pulsing && (!popping || spec.travel === "blink");
    this.mechGo(u, spec, x, y, enemy, ult, range, pow, move, mult);
  }

  private tickSpells(): void {
    if (!this.spellPending.length) return;
    const due = this.spellPending.filter((p) => p.at <= this.clock);
    this.spellPending = this.spellPending.filter((p) => p.at > this.clock);
    for (const p of due) {
      const u = this.byId(p.owner);
      if (!u || u.dead) continue;
      const enemy = p.enemy >= 0 ? this.byId(p.enemy) : undefined;
      const kit = this.kitOf(u);
      const pow = (base: number) => {
        let n = base + u.level * (p.ult ? 14 : 8);
        if (kit.kind === "heat" && p.ult) n += p.heat * 16;
        if (kit.kind === "mark" && enemy && enemy.markT > 0) n *= p.ult ? 1.28 : 1.16;
        if (kit.kind === "ambush" && inWoods(u.x, u.y)) n *= 1.08;
        n *= u.spellAmp;
        if (p.ult) n *= u.ultAmp;
        return n;
      };
      this.castMech(u, p.mech, p.x, p.y, enemy && !enemy.dead ? enemy : undefined, p.ult, p.range, p.slot, pow, "go");
    }
  }

  private mechPop(u: Unit, spec: MechSpec, pow: (base: number) => number): void {
    if (spec.self === "decay") u.fx.shield = 0;
    if (spec.self === "aspd") u.fx.aspd = 0;
    for (const e of this.living()) {
      if (e.team === u.team || dist(e, u) > 150) continue;
      if (spec.self === "decay") this.mechShove(u, e, "knock", 78);
      this.hurt(e, pow(spec.self === "aspd" ? 40 : 50), u, { spell: true });
    }
    this.burst(u.x, u.y, u.color, 12);
  }

  private mechGo(
    u: Unit,
    spec: MechSpec,
    x: number,
    y: number,
    enemy: Unit | undefined,
    ult: boolean,
    range: number,
    pow: (base: number) => number,
    move: boolean,
    mult: number,
  ): void {
    const low = spec.cond === "low" ? (u.hp < u.maxHp * 0.4 ? 1.3 : 0.62) : 1;
    const scale = mult * low;
    let dmg = Math.round(pow(budgetBase(spec.budget, ult)) * scale);
    if (dmg < 0) dmg = 0;
    const from = { x: u.x, y: u.y };
    let stop: Unit | undefined;
    let hits: Unit[] = [];
    if (move && spec.travel === "stop") {
      stop = this.mechMove(u, x, y, range || 320, "stop");
      if (stop) hits = [stop];
    } else if (move && (spec.travel === "dash" || spec.travel === "back" || spec.travel === "blink")) {
      if (spec.shape === "line") hits = this.lineHits(u, x, y, range || 240);
      this.mechMove(u, x, y, range || 320, spec.travel);
    }
    if (spec.shape === "bolt") {
      const target = enemy && enemy.team !== u.team && !enemy.dead ? enemy : stop;
      if (target) {
        const farOk = spec.cond !== "far" || dist(from, target) > Math.max(180, (range || 400) * 0.5);
        const marked = target.markT > 0;
        let boltDmg = dmg;
        if (spec.cond === "far" && !farOk) boltDmg = Math.round(boltDmg * 0.45);
        if (spec.cond === "marked" && !marked) boltDmg = Math.round(Math.max(1, boltDmg) * 0.55);
        if (spec.cond === "marked" && marked) boltDmg = Math.round(boltDmg * 1.25);
        this.bolt(u, target, Math.max(1, boltDmg || pow(40)), ult ? 780 : 620, this.mechRider(spec, farOk, marked), !isHooliId(u.heroId ?? ""));
      }
    } else if (spec.shape !== "self" || spec.status !== "none") {
      if (!hits.length) hits = this.mechHits(u, spec, x, y, enemy, range, stop);
      else hits = this.mechFilter(u, spec, hits, range || 240);
      const markedHits = spec.cond === "marked" ? hits.filter((e) => e.markT > 0) : hits;
      const use = spec.cond === "marked" && markedHits.length ? markedHits : hits;
      const markedScale = spec.cond === "marked" && markedHits.length ? 1.25 : spec.cond === "marked" ? 0.55 : 1;
      for (const e of use) {
        const dealt = Math.round(dmg * markedScale);
        if (dealt > 0 && spec.shape !== "self") this.hurt(e, dealt, u, { spell: true });
        this.mechStatus(u, e, spec);
        if (spec.status === "knock" || spec.travel === "knock" || spec.travel === "pull" || spec.travel === "hook") {
          const how = spec.travel === "pull" || spec.travel === "hook" ? spec.travel : "knock";
          this.mechShove(u, e, how, how === "hook" ? 0 : 88);
        }
      }
    }
    this.mechSelf(u, spec, pow, ult, low);
    if (spec.cond === "allies") this.mechAllies(u, spec, range, pow, ult, scale);
  }

  private mechRider(spec: MechSpec, farOk: boolean, marked: boolean): Shot["rider"] {
    const rider: NonNullable<Shot["rider"]> = {};
    if (spec.cond === "far" && !farOk) return rider;
    if (spec.status === "slow") rider.slow = 2.2;
    if (spec.status === "heavy") rider.slow = 2.8;
    if (spec.status === "stun") rider.stun = spec.cond === "marked" && marked ? 1.45 : 1.1;
    if (spec.status === "mark" || (spec.cond === "marked" && !marked)) rider.mark = 3.2;
    if (spec.status === "knock" || spec.travel === "knock") rider.knock = 88;
    if (spec.travel === "pull") rider.pull = 100;
    if (spec.travel === "hook") rider.hook = 1;
    if (spec.cond === "marked" && marked && (spec.status === "slow" || spec.status === "heavy")) rider.stun = 0.7;
    return rider;
  }

  private payRider(src: Unit, t: Unit, rider: NonNullable<Shot["rider"]>): void {
    if (rider.slow) t.fx.slow = Math.max(t.fx.slow, rider.slow);
    if (rider.stun) this.applyStun(t, rider.stun, src);
    if (rider.mark) t.markT = Math.max(t.markT, rider.mark);
    if (rider.knock) this.mechShove(src, t, "knock", rider.knock);
    if (rider.pull) this.mechShove(src, t, "pull", rider.pull);
    if (rider.hook) this.mechShove(src, t, "hook", 0);
  }

  private mechHits(u: Unit, spec: MechSpec, x: number, y: number, enemy: Unit | undefined, range: number, stop?: Unit): Unit[] {
    if (stop && (spec.shape === "unit" || spec.cond === "first")) return this.mechFilter(u, spec, [stop], range);
    let list: Unit[] = [];
    if (spec.shape === "unit") {
      if (enemy && enemy.team !== u.team && !enemy.dead) list = [enemy];
    } else if (spec.shape === "line") list = this.lineHits(u, x, y, range || 220);
    else if (spec.shape === "wedge") list = this.wedgeHits(u, x, y, Math.max(range || 180, 160), spec.span >= 20 ? spec.span : 62);
    else if (spec.shape === "ring") {
      const r = Math.max(150, Math.min(range || 230, 280));
      list = this.living().filter((e) => e.team !== u.team && dist(e, u) < r);
    } else if (spec.shape === "ground") {
      const r = spec.span >= 40 ? spec.span : 160;
      list = this.living().filter((e) => e.team !== u.team && Math.hypot(e.x - x, e.y - y) < r);
    } else if (spec.shape === "self") {
      const r = Math.max(range || 0, 210);
      list = this.living().filter((e) => e.team !== u.team && dist(e, u) < r);
    }
    return this.mechFilter(u, spec, list, range || 220);
  }

  private mechFilter(u: Unit, spec: MechSpec, list: Unit[], range: number): Unit[] {
    let hits = list;
    if (spec.cond === "heroes") hits = hits.filter((e) => e.kind === "hero");
    if (spec.cond === "far") hits = hits.filter((e) => dist(u, e) > Math.max(160, range * 0.5));
    if (spec.cond === "near") hits = hits.filter((e) => dist(u, e) <= Math.max(110, range * 0.48));
    if (spec.cond === "first") hits = [...hits].sort((a, b) => dist(u, a) - dist(u, b)).slice(0, 1);
    if (spec.cond === "marked") {
      const marked = hits.filter((e) => e.markT > 0);
      if (marked.length) return marked;
    }
    return hits;
  }

  private lineHits(u: Unit, x: number, y: number, range: number): Unit[] {
    const n = Math.hypot(x - u.x, y - u.y) || 1;
    const len = Math.min(Math.max(range, 80), Math.max(n, 80));
    const vx = (x - u.x) / n;
    const vy = (y - u.y) / n;
    const hits: Unit[] = [];
    for (const e of this.living()) {
      if (e.team === u.team) continue;
      const proj = (e.x - u.x) * vx + (e.y - u.y) * vy;
      if (proj < 0 || proj > len) continue;
      const px = u.x + vx * proj;
      const py = u.y + vy * proj;
      if (Math.hypot(e.x - px, e.y - py) <= 42) hits.push(e);
    }
    return hits;
  }

  private wedgeHits(u: Unit, x: number, y: number, range: number, spread: number): Unit[] {
    const face = Math.atan2(y - u.y, x - u.x);
    const hits: Unit[] = [];
    for (const e of this.living()) {
      if (e.team === u.team) continue;
      const d = dist(u, e);
      if (d > range) continue;
      let diff = Math.abs(Math.atan2(e.y - u.y, e.x - u.x) - face);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < (spread * Math.PI) / 180) hits.push(e);
    }
    return hits;
  }

  private mechMove(u: Unit, x: number, y: number, range: number, travel: "dash" | "stop" | "back" | "blink"): Unit | undefined {
    const kit = this.kitOf(u);
    const marked = () => {
      u.dashMark = 2.2;
      if (kit.kind === "haste" || kit.kind === "ambush" || kit.kind === "barrage") u.hasteT = Math.max(u.hasteT, 2.3);
    };
    if (travel === "back") {
      const n = Math.hypot(x - u.x, y - u.y) || 1;
      this.dash(u, u.x - ((x - u.x) / n) * range, u.y - ((y - u.y) / n) * range, range);
      marked();
      return;
    }
    if (travel === "blink") {
      this.slowZone(u.x, u.y, u.team, 100, 1.6);
      this.dash(u, x, y, range);
      marked();
      return;
    }
    if (travel === "stop") {
      const n = Math.hypot(x - u.x, y - u.y) || 1;
      const len = Math.min(range, Math.hypot(x - u.x, y - u.y));
      const vx = (x - u.x) / n;
      const vy = (y - u.y) / n;
      let hit: Unit | undefined;
      let best = len + 1;
      for (const e of this.living()) {
        if (e.team === u.team || e.kind === "tower" || e.kind === "ancient") continue;
        const proj = (e.x - u.x) * vx + (e.y - u.y) * vy;
        if (proj < 16 || proj > len) continue;
        const px = u.x + vx * proj;
        const py = u.y + vy * proj;
        if (Math.hypot(e.x - px, e.y - py) > 46) continue;
        if (proj < best) {
          best = proj;
          hit = e;
        }
      }
      const step = hit ? Math.max(0, best - 40) : len;
      const p = nearestWalkable(u.x + vx * step, u.y + vy * step);
      u.x = p.x;
      u.y = p.y;
      u.path = [];
      this.burst(u.x, u.y, u.color, 10);
      marked();
      return hit;
    }
    this.dash(u, x, y, range);
    marked();
    return;
  }

  private mechShove(u: Unit, e: Unit, travel: "knock" | "pull" | "hook", distPx: number): void {
    if (e.kind === "tower" || e.kind === "ancient" || e.dead) return;
    const n = Math.hypot(e.x - u.x, e.y - u.y) || 1;
    let x = e.x;
    let y = e.y;
    if (travel === "knock") {
      x = e.x + ((e.x - u.x) / n) * distPx;
      y = e.y + ((e.y - u.y) / n) * distPx;
    } else if (travel === "pull") {
      const step = Math.min(distPx, Math.max(0, n - 72));
      x = e.x - ((e.x - u.x) / n) * step;
      y = e.y - ((e.y - u.y) / n) * step;
    } else {
      x = u.x + ((e.x - u.x) / n) * 70;
      y = u.y + ((e.y - u.y) / n) * 70;
    }
    const p = nearestWalkable(x, y);
    e.x = p.x;
    e.y = p.y;
    e.path = [];
  }

  private mechStatus(u: Unit, e: Unit, spec: MechSpec): void {
    const marked = e.markT > 0;
    if (spec.status === "slow") e.fx.slow = Math.max(e.fx.slow, spec.cond === "marked" && marked ? 3 : 2.2);
    if (spec.status === "heavy") e.fx.slow = Math.max(e.fx.slow, 2.8);
    if (spec.status === "stun") {
      const sec = spec.cond === "marked" && marked ? 1.45 : spec.cond === "low" && u.hp < u.maxHp * 0.4 ? 1.35 : 1.1;
      this.applyStun(e, sec, u);
    }
    if (spec.status === "taunt") {
      e.fx.taunt = Math.max(e.fx.taunt, 1.6);
      if (e.kind === "hero" || e.kind === "minion") e.target = u.id;
    }
    if (spec.status === "mark" || (spec.cond === "marked" && !marked)) e.markT = Math.max(e.markT, 3.2);
    if (spec.cond === "marked" && marked && (spec.status === "slow" || spec.status === "heavy")) this.applyStun(e, 0.7, u);
  }

  private mechSelf(u: Unit, spec: MechSpec, pow: (base: number) => number, ult: boolean, low: number): void {
    const scale = spec.cond === "low" ? low : 1;
    if (spec.self === "shield" || spec.self === "decay") u.fx.shield = Math.max(u.fx.shield, (160 + u.level * 10) * scale);
    if (spec.self === "aspd") u.fx.aspd = Math.max(u.fx.aspd, 4 * scale);
    if (spec.self === "haste") u.hasteT = Math.max(u.hasteT, 2.3 * scale);
    if (spec.self === "stealth") u.stealthT = Math.max(u.stealthT, 2.4);
    if (spec.self === "boon") {
      u.boonT = Math.max(u.boonT, 3.5);
      u.boonDmg = Math.max(u.boonDmg, 6 + u.level * 2);
    }
    if (spec.self === "cleanse") {
      u.fx.stun = 0;
      u.fx.slow = 0;
    }
    if (spec.self === "heal" || spec.self === "cleanse") {
      if (spec.cond === "first") {
        let best: Unit | undefined;
        for (const a of this.living()) {
          if (a.team !== u.team || dist(a, u) > Math.max(spec.span || 0, 220)) continue;
          if (!best || a.hp / a.maxHp < best.hp / best.maxHp) best = a;
        }
        const who = best ?? u;
        who.hp = Math.min(who.maxHp, who.hp + pow(budgetBase("heal", ult)) * scale);
      } else {
        u.hp = Math.min(u.maxHp, u.hp + pow(budgetBase(spec.budget === "heal" ? "heal" : "heal", ult)) * (spec.self === "cleanse" ? 0.7 : 1) * scale);
      }
    }
  }

  private mechAllies(u: Unit, spec: MechSpec, range: number, pow: (base: number) => number, ult: boolean, scale: number): void {
    const r = Math.max(range || 0, 200);
    for (const a of this.living()) {
      if (a.team !== u.team || a.id === u.id || dist(a, u) > r) continue;
      if (spec.self === "boon") {
        a.boonT = Math.max(a.boonT, 3);
        a.boonDmg = Math.max(a.boonDmg, 4 + u.level);
      }
      if (spec.self === "haste") a.hasteT = Math.max(a.hasteT, 2);
      if (spec.self === "shield" || spec.self === "decay") a.fx.shield = Math.max(a.fx.shield, 70 + u.level * 4);
      if (spec.self === "cleanse") {
        a.fx.stun = 0;
        a.fx.slow = 0;
      }
      if (spec.self === "heal" || spec.self === "cleanse" || spec.budget === "heal" || spec.budget === "rain") {
        a.hp = Math.min(a.maxHp, a.hp + pow(spec.budget === "heal" ? budgetBase("heal", ult) : 48) * scale);
      }
    }
  }

  private think(u: Unit, dt: number): void {
    this.thinkExpert(u, dt);
  }

  private thinkExpert(u: Unit, dt: number): void {
    void dt;
    if (u.fx.stun > 0) return;
    const f = fountain[u.team];
    let foes = 0;
    let allies = 0;
    for (const e of this.living()) {
      if (e.id === u.id) continue;
      if (e.team === u.team) {
        if (e.kind === "hero" && dist(u, e) < 380) allies += 1;
      } else if (this.knownHero(u, e) && dist(u, e) < 340) foes += 1;
    }
    const lowHp = u.hp < u.maxHp * 0.45;
    if (lowHp || foes > 0) {
      const idx = pickActiveIndex(u.inv ?? [], lowHp ? "low" : "fight");
      if (idx >= 0) this.useBagUnit(u, idx);
    }
    if (u.hp < u.maxHp * 0.28 || (u.hp < u.maxHp * 0.4 && foes >= allies + 2)) {
      u.target = null;
      u.campStick = "";
      this.march(u, f.x, f.y, "retreat");
      this.maybeBuy(u, true);
      this.expertCast(u, true);
      return;
    }
    const post = this.wavePost(u);
    if (post.duty === "PREPARING") {
      this.holdInPool(u, post);
      return;
    }
    if (post.duty === "MOVING_TO_LANE_START" || post.duty === "WAITING_AT_LANE_START") {
      this.deployLane(u, post);
      return;
    }
    if (!this.combatNearWave(u)) {
      if (mayPeelToJungle(u.jungler, u.joinedWave, this.laneInFight(u), true, this.clock)) {
        if (this.farmCamp(u)) return;
        this.returnFromWoods(u);
        return;
      }
      const pit = this.seenObjective(u, 700);
      if (pit && !u.jungler && u.joinedWave && this.foeNearWave(u, pit)) {
        u.campStick = "";
        this.marchObjective(u, pit);
        return;
      }
      u.target = null;
      this.laneMarch(u);
      return;
    }
    u.waveDuty = "ENGAGING";
    if (post.atFront) u.joinedWave = true;
    this.expertCast(u, false);
    const hero = this.closestEnemyHero(u, HERO_SIGHT);
    const lasthit = this.lastHitTarget(u, true);
    if (hero && u.hp > u.maxHp * 0.28 && (dist(u, hero) <= u.range + hero.r + 16 || this.foeNearWave(u, hero))) {
      const d = dist(u, hero);
      const tower = this.enemyCover(u);
      const diving = Boolean(tower && dist(u, tower) < tower.range * 0.45 && this.alliedWaveAt(u, tower) < 1);
      if (!diving) {
        const steal = lasthit && d > 250 && lasthit.hp <= u.damage + 6;
        if (!steal) {
          if (d > u.range + hero.r + 10) {
            u.target = null;
            this.march(u, hero.x, hero.y, `hunt:${hero.id}`);
          } else {
            u.target = hero.id;
            u.path = [];
          }
          return;
        }
      }
    }
    if (this.scrim() && u.lane === "mid" && !u.jungler) {
      const rival = this.living().find((e) => e.kind === "hero" && e.team !== u.team && e.lane === "mid" && this.knownHero(u, e));
      if (rival && (dist(u, rival) <= u.range + rival.r + 16 || this.foeNearWave(u, rival))) {
        if (dist(u, rival) > u.range + rival.r) {
          u.target = null;
          this.march(u, rival.x, rival.y, `scrim:${rival.id}`);
        } else {
          u.target = rival.id;
          u.path = [];
        }
        return;
      }
    }
    if (lasthit && !lasthit.wild && this.foeNearWave(u, lasthit)) {
      u.target = lasthit.id;
      u.path = [];
      return;
    }
    const deny = this.denyTarget(u);
    if (deny) {
      u.target = deny.id;
      u.path = [];
      return;
    }
    const tower = this.closestEnemyTower(u, 420);
    if (tower && this.sees(u.team, tower.x, tower.y) && this.alliedWaveAt(u, tower) >= 2 && u.hp > u.maxHp * 0.5) {
      u.target = tower.id;
      return;
    }
    const cover = this.enemyCover(u);
    if (cover && this.alliedWaveAt(u, cover) < 1) {
      u.target = null;
      this.march(u, f.x, f.y, "retreat");
      return;
    }
    const low = this.closestEnemyMinion(u, 280);
    if (low && !low.wild && this.sees(u.team, low.x, low.y) && low.hp < low.maxHp * 0.42 && this.foeNearWave(u, low)) {
      u.target = low.id;
      return;
    }
    if (mayPeelToJungle(u.jungler, u.joinedWave, this.laneInFight(u), true, this.clock)) {
      if (this.farmCamp(u)) return;
      this.returnFromWoods(u);
      return;
    }
    this.laneMarch(u);
  }

  /** True when a connected player is driving. Watch-AI and idle autoplay stay on the wave plan. */
  private aiControlled(u: Unit): boolean {
    if (u.kind !== "hero" || u.dead) return false;
    if (u.seat >= 0) return !u.driven;
    return !u.player || (this.autoplay && this.clock >= this.manualUntil);
  }

  /** Lane this hero is walking. A later rotate follows that lane's wave, not a fixed node. */
  private laneOf(u: Unit): Lane {
    return this.rotateLane(u) ?? u.lane ?? "mid";
  }

  /** Furthest living friendly lane creep. That is the front of this wave. */
  private laneLeader(u: Unit): Unit | undefined {
    const lane = this.laneOf(u);
    const origin = fountain[u.team];
    let best: Unit | undefined;
    let bestD = -1;
    for (const m of this.living()) {
      if (m.kind !== "minion" || m.wild || m.objectiveId) continue;
      if (m.team !== u.team || m.lane !== lane) continue;
      const d = dist(m, origin);
      if (d > bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  }

  private cacheWaveLeader(u: Unit): void {
    const leader = this.laneLeader(u);
    const origin = fountain[u.team];
    if (!leader) {
      u.waveSeen = false;
      u.waveAdv = 0;
      u.waveFrom = 0;
      return;
    }
    u.waveSeen = true;
    u.waveLx = leader.x;
    u.waveLy = leader.y;
    u.waveAdv = Math.hypot(leader.x - leader.homeX, leader.y - leader.homeY);
    u.waveFrom = dist(leader, origin);
  }

  /** Sample the wave on a timer, then place this hero behind its leader or on the pool seat. */
  private wavePost(u: Unit): WaveGoal {
    const refresh = waveRefreshSeconds(u.id);
    if (u.waveAt < 0 || this.clock - u.waveAt >= refresh) {
      this.cacheWaveLeader(u);
      u.waveAt = this.clock;
    }
    const preparing = this.aiControlled(u)
      && this.nearFountain(u)
      && this.needsOpeningItem(u)
      && u.waveDuty !== "MOVING_TO_LANE_START";
    const lane = this.laneOf(u);
    const path = lanePath[u.team][lane];
    const rawStart = laneBattleStart(path, fountain[u.team]);
    const laneStart = isWalkable(rawStart.x, rawStart.y) ? rawStart : nearestWalkable(rawStart.x, rawStart.y);
    const goal = waveGoal({
      alive: !u.dead,
      preparing,
      fountain: fountain[u.team],
      seat: u.poolIndex,
      role: formationRole(this.shopRole(u)),
      slot: this.laneSlot(u),
      laneStart,
      leader: u.waveSeen
        ? { x: u.waveLx, y: u.waveLy, fromFountain: u.waveFrom, advanced: u.waveAdv }
        : null,
      heroX: u.x,
      heroY: u.y,
    });
    if (!goal) return { duty: "WAITING_IN_BASE", x: u.homeX, y: u.homeY, atFront: false };
    this.noteDeploy(u, goal.duty, goal);
    u.waveDuty = goal.duty;
    if (goal.atFront) u.joinedWave = true;
    return goal;
  }

  /** Logs a deploy step when `?bots=1`. Off by default. */
  private noteDeploy(u: Unit, duty: WaveDuty, post: WaveGoal): void {
    if (u.waveDuty === duty || !botDeployDebug()) return;
    const lane = (u.lane ?? "mid").toUpperCase();
    const team = u.team === "home" ? "A" : "B";
    if (duty === "PREPARING") console.info(`[Bot] ${u.name} spawned → Team ${team} pool · gold ${Math.round(u.gold)}`);
    else if (duty === "MOVING_TO_LANE_START") console.info(`[Bot] ${u.name} lane ${lane} · leaving pool → ${Math.round(post.x)},${Math.round(post.y)}`);
    else if (duty === "WAITING_AT_LANE_START") console.info(`[Bot] ${u.name} reached ${lane} start · waiting for creep wave`);
    else if (duty === "FOLLOWING_CREEP_WAVE") console.info(`[Bot] ${u.name} creep wave detected · following`);
    else if (duty === "ENGAGING" || duty === "APPROACHING_FRONTLINE") console.info(`[Bot] ${u.name} entering combat`);
  }

  private laneSlot(u: Unit): number {
    const lane = u.lane ?? "mid";
    let slot = 0;
    for (const h of this.units) {
      if (h.kind !== "hero" || h.team !== u.team || (h.lane ?? "mid") !== lane) continue;
      if (h.id < u.id) slot += 1;
    }
    return slot;
  }

  /** Walk to this lane's entrance, then hold. Do not chase, and do not go back to the pool. */
  private deployLane(u: Unit, post: WaveGoal): void {
    const lane = this.laneOf(u);
    const path = lanePath[u.team][lane];
    const start = path[0];
    if (!start && botDeployDebug()) console.info(`[Bot] ERROR → ${u.name} lane start position missing`);
    if (!u.lane && botDeployDebug()) console.info(`[Bot] ERROR → ${u.name} no lane assigned`);
    u.target = null;
    if (post.duty === "WAITING_AT_LANE_START") {
      u.path = [];
      const next = path[1] ?? start;
      if (start && next) u.face = Math.atan2(next.y - start.y, next.x - start.x);
      return;
    }
    const stuck = dist(u, post) > 70 && !u.moved && u.routeAt > 0 && this.clock - u.routeAt > 2.2;
    if (stuck) {
      if (botDeployDebug()) console.info(`[Bot] WARNING → ${u.name} stuck while leaving pool`);
      u.routeKey = "";
      u.path = [];
    }
    this.laneMarch(u);
    if (stuck && u.path.length <= 1 && dist(u, post) > 70) {
      const grid = findPath(u.x, u.y, post.x, post.y);
      if (grid.length > 1) u.path = grid;
      else if (botDeployDebug()) console.info(`[Bot] ERROR → ${u.name} navigation path failed`);
    }
  }

  /** Stay on the pool seat. A hero in attack range can swing. Do not chase across the map. */
  private holdInPool(u: Unit, post: WaveGoal): void {
    if (post.duty === "PREPARING") {
      this.openingShop(u);
      if (this.needsOpeningItem(u)) u.waveDuty = "MOVING_TO_LANE_START";
    }
    this.maybeBuy(u, true);
    if (this.nearFountain(u) && this.clock > 10 && (u.hp < u.maxHp * 0.86 || u.mana < u.maxMana * 0.45)) {
      u.target = null;
      u.path = [];
      return;
    }
    const touch = this.closestEnemyHero(u, u.range + 28);
    if (touch && dist(u, touch) <= u.range + touch.r + 10) {
      u.target = touch.id;
      u.path = [];
      this.expertCast(u, false);
      return;
    }
    u.target = null;
    if (dist(u, post) > 24) this.laneMarch(u);
    else u.path = [];
  }

  /** Enemy in vision, in range, and near the friendly wave. A far hero is not a chase. */
  private combatNearWave(u: Unit): boolean {
    const leader = this.laneLeader(u);
    if (!leader) return false;
    const origin = fountain[u.team];
    const advanced = Math.hypot(leader.x - leader.homeX, leader.y - leader.homeY);
    if (!waveHasLeft({ fromFountain: dist(leader, origin), advanced })) return false;
    const withWave = dist(u, leader) < 280;
    for (const e of this.living()) {
      if (e.id === u.id || e.team === u.team) continue;
      if (e.kind === "hero" && this.knownHero(u, e)) {
        if (dist(u, e) <= u.range + e.r + 16) return true;
        if (withWave && dist(e, leader) < 380 && dist(u, e) < 420) return true;
        continue;
      }
      if (dist(e, leader) > 380) continue;
      if (e.kind === "minion" && !e.wild && !e.objectiveId) {
        if (!this.sees(u.team, e.x, e.y)) continue;
        if (dist(u, e) <= u.range + e.r + 32) return true;
      } else if ((e.kind === "tower" || e.kind === "ancient") && withWave) {
        if (!this.sees(u.team, e.x, e.y)) continue;
        if (dist(u, e) < 420 && this.alliedWaveAt(u, e) >= 2) return true;
      }
    }
    return false;
  }

  /** Foe is standing with the friendly wave, and this hero is close enough to step in. */
  private foeNearWave(u: Unit, foe: Unit): boolean {
    const leader = this.laneLeader(u);
    if (!leader) return false;
    return dist(foe, leader) < 380 && dist(u, leader) < 340;
  }

  /** Enemy creeps or a seen hero on the friendly front. A quiet push is not a fight. */
  private laneInFight(u: Unit): boolean {
    const leader = this.laneLeader(u);
    if (!leader) return false;
    for (const e of this.living()) {
      if (e.team === u.team) continue;
      if (e.kind === "hero") {
        if (this.knownHero(u, e) && dist(e, leader) < 300) return true;
        continue;
      }
      if (e.kind === "minion" && !e.wild && !e.objectiveId && dist(e, leader) < 240) return true;
    }
    return false;
  }

  private route(u: Unit, x: number, y: number): void {
    const gx = Math.floor(x / CELL);
    const gy = Math.floor(y / CELL);
    if (u.routeX === gx && u.routeY === gy && u.path.length > 0) return;
    u.routeX = gx;
    u.routeY = gy;
    u.path = findPath(u.x, u.y, x, y);
  }

  /** Lane walks stay on that lane's polyline. Camps and retreats still use the route graph. */
  private laneRouteOf(key: string): { team: Team; lane: Lane } | null {
    if (!key.startsWith("lane-start:") && !key.startsWith("wave:")) return null;
    const parts = key.split(":");
    const team = parts[1];
    const lane = parts[2];
    if (team !== "home" && team !== "away") return null;
    if (lane !== "top" && lane !== "mid" && lane !== "bot") return null;
    return { team, lane };
  }

  /** Follow cached lane, jungle, and fountain nodes. Rebuilt when the goal changes or the timer elapses. */
  private march(u: Unit, x: number, y: number, key: string): void {
    const hold = key.startsWith("camp:");
    const wave = key.startsWith("wave:") || key.startsWith("pool:") || key.startsWith("lane-start:");
    const refresh = wave ? 0.6 : 1.35;
    const stale = !hold && this.clock - u.routeAt > refresh;
    const end = u.path[u.path.length - 1];
    const jumped = wave && (!end || Math.hypot(end.x - x, end.y - y) > 48);
    if (u.routeKey === key && !stale && !jumped && (u.path.length > 0 || dist(u, { x, y }) < 34)) {
      if ((hold || wave) && !u.moved) this.unstick(u);
      return;
    }
    u.routeKey = key;
    u.routeAt = this.clock;
    const laneRoute = this.laneRouteOf(key);
    if (laneRoute) {
      const poly = [fountain[laneRoute.team], ...lanePath[laneRoute.team][laneRoute.lane]];
      const along = laneApproach(u, poly, { x, y });
      if (along.length < 2 && dist(u, { x, y }) > 36) {
        const grid = findPath(u.x, u.y, x, y);
        if (grid.length > 1) {
          u.path = grid;
          u.routeX = -1;
          u.routeY = -1;
          return;
        }
        if (botDeployDebug() && key.startsWith("lane-start:")) {
          console.info(`[Bot] ERROR → ${u.name} navigation path failed`);
        }
      }
      u.path = along;
      u.routeX = -1;
      u.routeY = -1;
      return;
    }
    const graph = matchGraph();
    const from = nearestRouteNode(graph.nodes, u.x, u.y);
    const to = nearestRouteNode(graph.nodes, x, y);
    const ids = routeBetween(graph.links, from.id, to.id);
    const pts: Pt[] = [];
    for (const id of ids) {
      const n = graph.byId.get(id);
      if (n) pts.push({ x: n.x, y: n.y });
    }
    const last = pts[pts.length - 1];
    if (!last || dist(last, { x, y }) > 28) pts.push({ x, y });
    while (pts.length > 1 && dist(u, pts[0]!) < 36) pts.shift();
    if (pts.length < 2 && dist(u, { x, y }) > 36) {
      const grid = findPath(u.x, u.y, x, y);
      if (grid.length > 1) {
        u.path = grid;
        u.routeX = -1;
        u.routeY = -1;
        return;
      }
      if (botDeployDebug() && key.startsWith("lane-start:")) {
        console.info(`[Bot] ERROR → ${u.name} navigation path failed`);
      }
    }
    u.path = pts;
    u.routeX = -1;
    u.routeY = -1;
  }

  /** Walk the cached wave goal. The route graph fills the path. No teleport. */
  private laneMarch(u: Unit): void {
    const post = this.wavePost(u);
    const lane = this.laneOf(u);
    const key = post.duty === "WAITING_IN_BASE" || post.duty === "PREPARING"
      ? `pool:${u.team}:${u.poolIndex}`
      : post.duty === "MOVING_TO_LANE_START" || post.duty === "WAITING_AT_LANE_START"
        ? `lane-start:${u.team}:${lane}`
        : `wave:${u.team}:${lane}`;
    this.march(u, post.x, post.y, key);
  }

  /** Grid step around a trunk, then back onto the route. A failed grid nudges sideways. */
  private unstick(u: Unit): void {
    const step = u.path[0];
    if (!step || dist(u, step) <= 22) return;
    const grid = findPath(u.x, u.y, step.x, step.y);
    if (grid.length > 1) {
      u.path = grid.concat(u.path.slice(1));
      return;
    }
    if (u.path.length > 6) return;
    const ang = Math.atan2(step.y - u.y, step.x - u.x) + (u.id % 2 === 0 ? Math.PI / 2 : -Math.PI / 2);
    const side = nearestWalkable(u.x + Math.cos(ang) * 36, u.y + Math.sin(ang) * 36);
    u.path = [side, ...u.path];
  }

  /**
   * Walk the nearest live camp on this side of the woods.
   * Lane heroes only when the lane is quiet and the camp is close and safe.
   */
  private farmCamp(u: Unit): boolean {
    if (this.closestEnemyHero(u, 200)) {
      u.campStick = "";
      return false;
    }
    const pick = pickLiveCamp({
      x: u.x,
      y: u.y,
      side: u.team,
      jungler: u.jungler,
      laneEmergency: u.jungler ? this.laneInFight(u) : this.laneNeedsHero(u),
      camps: this.campSpots(u),
      stickyId: u.campStick,
      nearbyOnly: !u.jungler,
    });
    if (!pick) {
      u.campStick = "";
      return false;
    }
    u.campStick = pick.id;
    const creep = this.campCreep(u, pick);
    const seen = Boolean(creep && this.sees(u.team, creep.x, creep.y));
    if (creep && seen && dist(u, creep) <= u.range + creep.r + 8) {
      u.target = creep.id;
      u.path = [];
      return true;
    }
    u.target = null;
    const step = creep && seen && dist(u, pick) < 160 ? creep : pick;
    this.march(u, step.x, step.y, `camp:${pick.id}`);
    return true;
  }

  /** Enemy creeps on this lane, a seen hero, or a nearby objective. A quiet wave is not an emergency. */
  private laneNeedsHero(u: Unit): boolean {
    if (this.clock < 16) return true;
    if (this.seenObjective(u, 700)) return true;
    const lane = u.lane ?? "mid";
    for (const e of this.living()) {
      if (e.kind === "minion" && !e.wild && !e.objectiveId && e.team !== u.team && e.lane === lane && dist(u, e) < 400) return true;
      if (this.knownHero(u, e) && e.lane === lane && dist(u, e) < 620) return true;
    }
    const front = this.frontInfantry(u);
    if (!front || dist(u, front) > 520) return false;
    return this.living().some((e) => e.kind === "minion" && !e.wild && e.team !== u.team && dist(e, front) < 240);
  }

  private campSpots(u: Unit): CampSpot[] {
    return JUNGLE_CAMPS.map((c) => ({
      id: `camp-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      x: c.x,
      y: c.y,
      side: c.fir ? "away" : "home",
      live: this.campLive(c.x, c.y),
      threatened: this.campThreatened(u, c.x, c.y),
    }));
  }

  private campLive(x: number, y: number): boolean {
    return this.units.some(
      (e) => e.wild && !e.dead && e.kind === "minion" && !e.objectiveId && Math.hypot(e.homeX - x, e.homeY - y) <= 90,
    );
  }

  private campThreatened(u: Unit, x: number, y: number): boolean {
    return this.living().some((e) => this.knownHero(u, e) && Math.hypot(e.x - x, e.y - y) < 240);
  }

  /** Living creep of this camp. Attack only what the team can see, and only while the camp is up. */
  private campCreep(u: Unit, camp: { x: number; y: number }): Unit | undefined {
    let best: Unit | undefined;
    let bestD = Infinity;
    for (const e of this.living()) {
      if (!e.wild || e.kind !== "minion" || e.objectiveId) continue;
      if (Math.hypot(e.homeX - camp.x, e.homeY - camp.y) > 90) continue;
      const d = dist(u, e);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private seenObjective(u: Unit, maxDist: number): Unit | undefined {
    let best: Unit | undefined;
    let bestD = maxDist;
    for (const o of this.living()) {
      if (!o.objectiveId || !this.sees(u.team, o.x, o.y)) continue;
      const d = dist(u, o);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }
    return best;
  }

  private marchObjective(u: Unit, obj: Unit): void {
    if (dist(u, obj) <= u.range + obj.r + 8) {
      u.target = obj.id;
      u.path = [];
      return;
    }
    u.target = null;
    this.march(u, obj.x, obj.y, `obj:${obj.id}`);
  }

  /** Camps are clear. Walk back to the friendly wave. Do not hop to a far pit. */
  private returnFromWoods(u: Unit): void {
    u.campStick = "";
    this.laneMarch(u);
  }

  private rotateLane(u: Unit): Lane | null {
    if (u.jungler || this.bf.phase === "early" || u.deaths < 1) return null;
    const lane = u.lane ?? "mid";
    const outer = this.laneTower(u.team, lane, "outer");
    if (outer && !outer.dead) return null;
    for (const other of LANES) {
      if (other === lane) continue;
      const t = this.laneTower(u.team, other, "outer");
      if (t && !t.dead) return other;
    }
    return null;
  }

  private assignJunglers(): void {
    for (const team of ["home", "away"] as const) {
      const heroes = this.units.filter((unit) => unit.kind === "hero" && unit.team === team);
      const sideAssassin = heroes.find((unit) => unit.lane !== "mid" && kitPatch(unit.heroId ?? "").band === "assassin");
      const side = heroes.find((unit) => unit.lane !== "mid");
      const pick = sideAssassin ?? heroes[3] ?? side ?? heroes[heroes.length - 1];
      if (pick) pick.jungler = true;
    }
  }

  private expertCast(u: Unit, fleeing: boolean): void {
    const def = heroById(u.heroId ?? "riot");
    const hero = this.closestEnemyHero(u, 620);
    const n = this.living().filter((e) => e.kind === "hero" && e.team !== u.team && dist(u, e) < 250).length;
    const f = fountain[u.team];
    const fired = (slot: number, x: number, y: number): boolean => {
      const mana = u.mana;
      this.tryCast(u, slot, x, y);
      return u.mana < mana;
    };
    const slotOf = (fx: CastFx): number => def.abilities.findIndex((a) => a.fx === fx && !a.mech);
    const intentAt = (slot: number) => {
      const mech = def.abilities[slot]?.mech;
      return mech ? mechIntent(mechById(mech)) : null;
    };
    if (fleeing) {
      for (let slot = 0; slot < 4; slot++) {
        if (intentAt(slot) === "dash" && fired(slot, f.x, f.y)) return;
      }
      const dash = slotOf("dash") >= 0 ? slotOf("dash") : slotOf("dashnova");
      if (dash >= 0 && fired(dash, f.x, f.y)) return;
      for (let slot = 0; slot < 4; slot++) {
        if (intentAt(slot) === "save" && fired(slot, u.x, u.y)) return;
      }
      const cover = slotOf("shield") >= 0 ? slotOf("shield") : slotOf("heal");
      if (cover >= 0 && fired(cover, u.x, u.y)) return;
      return;
    }
    if (!hero) {
      const creep = this.lastHitTarget(u, true) ?? this.campAttack(u);
      if (!creep) return;
      for (let slot = 0; slot < 3; slot++) {
        const intent = intentAt(slot);
        if ((intent === "off" || intent === "slow") && fired(slot, creep.x, creep.y)) return;
      }
      const bolt = slotOf("bolt");
      if (bolt >= 0 && fired(bolt, creep.x, creep.y)) return;
      return;
    }
    const d = dist(u, hero);
    if (u.level >= 6 && (n >= 2 || hero.hp < hero.maxHp * 0.55)) {
      const ultIntent = intentAt(3);
      const aim = ultIntent === "save" || ultIntent === "buff" ? u : hero;
      if (fired(3, aim.x, aim.y)) return;
    }
    for (let slot = 0; slot < 3; slot++) {
      const a = def.abilities[slot];
      if (!a) continue;
      const intent = intentAt(slot);
      if (intent) {
        if (intent === "taunt" && n >= 2 && d < 230 && fired(slot, u.x, u.y)) return;
        if (intent === "slow" && n >= 2 && fired(slot, hero.x, hero.y)) return;
        if (intent === "buff" && d < (kitPatch(def.id).kind === "barrage" ? Math.max(280, u.range) : 180) && fired(slot, u.x, u.y)) return;
        if (intent === "save" && u.hp < u.maxHp * 0.55 && fired(slot, u.x, u.y)) return;
        if (intent === "off" && d < (a.range || 280) && fired(slot, hero.x, hero.y)) return;
        if (intent === "dash" && d > 150 && d < 310 && u.hp > u.maxHp * 0.55 && fired(slot, hero.x, hero.y)) return;
        continue;
      }
      if (a.fx === "taunt" && n >= 2 && d < 230 && fired(slot, u.x, u.y)) return;
      if (a.fx === "slow" && n >= 2 && fired(slot, hero.x, hero.y)) return;
      if (a.fx === "aspd" && d < (kitPatch(def.id).kind === "barrage" ? Math.max(280, u.range) : 180) && fired(slot, u.x, u.y)) return;
      if (a.fx === "shield" && u.hp < u.maxHp * 0.55 && fired(slot, u.x, u.y)) return;
      if (a.fx === "heal" && u.hp < u.maxHp * 0.7 && fired(slot, u.x, u.y)) return;
      if ((a.fx === "bolt" || a.fx === "stun" || a.fx === "cone" || a.fx === "nova" || a.fx === "rain") && d < (a.range || 280) && fired(slot, hero.x, hero.y)) return;
      if ((a.fx === "dash" || a.fx === "dashnova") && d > 150 && d < 310 && u.hp > u.maxHp * 0.55 && fired(slot, hero.x, hero.y)) return;
    }
  }

  private maybeBuy(u: Unit, expert = false): void {
    void expert;
    if (!this.nearFountain(u)) return;
    const role = this.shopRole(u);
    const purse = { gold: u.gold, items: ownedIds(u.inv ?? []) };
    const step = nextAiBuy(purse, role, aiPhaseForLevel(u.level), {
      preferArmor: u.deaths >= 2 && this.enemyMostlyPhysical(u.team),
      lowHp: u.hp < u.maxHp * 0.55,
    });
    if (!step) return;
    const before = u.gold;
    if (step.sellId) {
      const idx = (u.inv ?? []).findIndex((slot) => slot?.id === step.sellId);
      if (idx >= 0) this.sellUnit(u, idx);
    }
    if (!this.buyUnit(u, step.buyId)) return;
    const it = giftById(step.buyId);
    if (it?.cast === "heal" || it?.cast === "mana" || it?.cast === "cleanse" || it?.cast === "popshield" || it?.cast === "ward" || it?.cast === "smoke") {
      const idx = (u.inv ?? []).findIndex((slot) => slot?.id === step.buyId && slot.cd <= 0);
      if (idx >= 0) this.useBagUnit(u, idx);
    }
    if (aiShopDebug()) console.info(`[aiShop] ${u.name}${step.sellId ? ` sold ${step.sellId}` : ""} bought ${step.buyId} (${Math.round(before - u.gold)}g)`);
  }

  private shopRole(u: Unit): ReturnType<typeof aiRoleOf> {
    const def = heroById(u.heroId ?? "riot");
    return aiRoleOf({ melee: def.melee, wing: def.wing, role: def.role, attr: def.attr }, kitPatch(def.id).band);
  }

  /** AI spends the opening purse on early gear while it is still standing in the pool. */
  private openingShops(): void {
    for (const u of this.units) {
      if (u.kind !== "hero" || u.dead) continue;
      if (!this.aiControlled(u) || !this.nearFountain(u)) continue;
      u.waveDuty = "PREPARING";
      this.openingShop(u);
    }
  }

  /** True when the purse can still buy an early id this hero does not own. */
  private needsOpeningItem(u: Unit): boolean {
    const owned = ownedIds(u.inv ?? []);
    const plan = spendOpeningGold(this.shopRole(u), u.gold, owned);
    return plan.items.some((id) => !owned.includes(id));
  }

  private openingShop(u: Unit): void {
    const owned = ownedIds(u.inv ?? []);
    const before = u.gold;
    const plan = spendOpeningGold(this.shopRole(u), u.gold, owned);
    for (const id of plan.items) {
      if (owned.includes(id)) continue;
      if (!this.buyUnit(u, id)) break;
    }
    if (botDeployDebug() && before !== u.gold) {
      console.info(`[Bot] ${u.name} purchased starting items · gold ${Math.round(u.gold)}`);
    }
  }

  private enemyMostlyPhysical(team: Team): boolean {
    let physical = 0;
    let other = 0;
    for (const e of this.units) {
      if (e.kind !== "hero" || e.team === team) continue;
      const band = kitPatch(e.heroId ?? "").band;
      if (band === "mage" || band === "support" || band === "controller") other += 1;
      else physical += 1;
    }
    return physical > other;
  }

  private applyItems(u: Unit): void {
    const def = heroById(u.heroId ?? "riot");
    const extra = itemStats(u.inv);
    const bias = roleLevelBonus(this.shopRole(u), u.level);
    const lvl = (u.level - 1) * 42;
    u.maxHp = def.hp + extra.hp + lvl + bias.hp;
    u.damage = def.damage + extra.damage + (u.level - 1) * 3;
    u.armor = def.armor + extra.armor + bias.armor;
    u.baseMs = def.ms + extra.ms + bias.ms;
    u.ms = u.baseMs + (u.hasteT > 0 ? 36 : 0);
    const basePeriod = def.aspd ?? (def.melee ? 1.05 : 1.2);
    u.period = basePeriod * (1 - extra.aspd) * (1 - bias.aspd);
    u.mr = (def.mr ?? 0) + extra.mr;
    u.hpRegen = (def.hpRegen ?? 2.2) + extra.hpRegen + bias.hpRegen;
    u.manaRegen = (def.manaRegen ?? 6) + extra.manaRegen + bias.manaRegen;
    u.maxMana = (def.mana ?? 0) + (u.level - 1) * 18 + extra.mana + bias.mana;
    u.mana = Math.min(u.mana, u.maxMana);
    if (def.kind === "heat" && u.heat >= u.heatMax) {
      u.range = def.range + 36;
      u.damage += 6;
    } else {
      u.range = def.range;
    }
    this.keepMmaMelee(u);
    this.keepRedBookMelee(u);
    u.hp = Math.min(u.hp, u.maxHp);
    u.trueSight = extra.trueSight;
    this.foldPerks(u);
    if (extra.spellAmp > 1) u.spellAmp *= extra.spellAmp;
    if (extra.slowOnHit) u.slowOnHit = Math.max(u.slowOnHit, extra.slowOnHit);
    u.armorBase = u.armor;
  }

  private tickUnit(u: Unit, dt: number): void {
    if (!Number.isFinite(u.x) || !Number.isFinite(u.y)) {
      const home = fountain[u.team];
      u.x = Number.isFinite(u.homeX) ? u.homeX : home.x;
      u.y = Number.isFinite(u.homeY) ? u.homeY : home.y;
      u.face = 0;
      u.path = [];
    }
    u.moved = false;
    for (const k of ["stun", "slow", "aspd", "taunt"] as const) u.fx[k] = Math.max(0, u.fx[k] - dt);
    if (u.kind === "hero") {
      this.keepMmaMelee(u);
      this.keepRedBookMelee(u);
      for (let i = 0; i < 4; i++) u.cds[i] = Math.max(0, u.cds[i]! - dt);
      u.mana = Math.min(u.maxMana, u.mana + dt * (this.nearFountain(u) ? 28 : u.manaRegen));
      if (!u.dead) u.gold += dt * goldDrip(u.handle || u.name, u.player, this.tangled);
      u.dashMark = Math.max(0, u.dashMark - dt);
      u.castT = Math.max(0, u.castT - dt);
      if (u.castT <= 0) u.castUlt = false;
      u.hurtT = Math.max(0, u.hurtT - dt);
      u.guardCd = Math.max(0, u.guardCd - dt);
      u.hasteT = Math.max(0, u.hasteT - dt);
      u.markT = Math.max(0, u.markT - dt);
      u.stealthT = Math.max(0, u.stealthT - dt);
      u.boonT = Math.max(0, u.boonT - dt);
      u.itemCd = Math.max(0, u.itemCd - dt);
      if (u.inv) {
        for (const slot of u.inv) if (slot && slot.cd > 0) slot.cd = Math.max(0, slot.cd - dt);
      }
      u.shrineCd = Math.max(0, u.shrineCd - dt);
      const kit = this.kitOf(u);
      u.ms = u.baseMs + (u.hasteT > 0 ? 36 : 0) + (kit.kind === "ambush" && inWoods(u.x, u.y) ? 10 : 0) + (this.nearRuin(u) ? BATTLEFIELD.routeMs : 0);
      u.armor = u.armorBase + this.hillArmor(u);
      if (!u.dead && this.bf.shrines && u.shrineCd <= 0) this.touchShrine(u);
      if (!u.dead && u.hp > 0 && u.hp < u.maxHp * 0.35 && u.guardCd <= 0 && kit.kind === "guard") {
        u.fx.shield = Math.max(u.fx.shield, 140 + u.level * 8);
        u.guardCd = 20;
        this.floats.push({ x: u.x, y: u.y - 28, text: kit.stack.toUpperCase(), life: 0.8, color: "#e8c050" });
        this.burst(u.x, u.y, u.color, 10);
      }
    }
    u.barkT = Math.max(0, u.barkT - dt);
    if (u.barkT <= 0) u.bark = "";
    if (u.kind === "minion") u.hurtT = Math.max(0, u.hurtT - dt);
    if (u.dead) {
      u.volley = undefined;
      u.burstAge = 0;
      if (u.kind === "hero") {
        u.respawn -= dt;
        if (u.respawn <= 0) this.revive(u);
      }
      if (u.wild) {
        u.respawn -= dt;
        if (u.respawn <= 0) {
          u.dead = false;
          u.hp = u.maxHp;
          u.x = u.homeX;
          u.y = u.homeY;
          u.target = null;
          u.path = [];
        }
      }
      return;
    }
    if (u.kind === "hero") u.hp = Math.min(u.maxHp, u.hp + dt * (this.nearFountain(u) ? 55 : u.hpRegen));
    u.atk = Math.max(0, u.atk - dt);
    this.tickVolley(u, dt);
    u.bashCd = Math.max(0, u.bashCd - dt);
    if (u.fx.stun > 0) return;
    if (u.kind === "tower" || u.kind === "ancient") {
      this.thinkTower(u);
      return;
    }
    if (u.wild && dist(u, { x: u.homeX, y: u.homeY }) > (u.leash || 280)) u.target = null;
    if (u.target !== null) {
      const t = this.byId(u.target);
      if (!t || t.dead || (!foes(u, t) && !(t.kind === "minion" && !t.wild && t.team === u.team && t.hp < t.maxHp * 0.5))) {
        u.target = null;
        u.lockOn = false;
        if (u.detour && !(u.player && u.attackMove && this.marker)) {
          u.path = [];
          u.routeX = -1;
          u.routeY = -1;
        }
        u.detour = false;
        if (u.player && u.attackMove && this.marker) {
          u.path = findPath(u.x, u.y, this.marker.x, this.marker.y);
        }
      } else if (dist(u, t) <= u.range + t.r) {
        u.path = [];
        this.swing(u, t);
      } else if (u.ms > 0) {
        if (u.player && !u.lockOn && !u.attackMove) u.target = null;
        else this.moveToward(u, t.x, t.y, dt);
      }
    } else if (u.kind === "minion" && u.wild) {
      this.driveCamp(u, dt);
    } else if (u.kind === "minion") {
      this.driveMinion(u, dt);
    } else if (u.path.length && u.ms > 0) {
      const n = u.path[0]!;
      this.steer(u, n.x, n.y, dt);
      if (dist(u, n) < 16) {
        u.path.shift();
        if (!u.path.length && u.player) {
          u.aggro = true;
          u.attackMove = false;
        }
      }
    }
    if (u.player && u.kind === "hero" && u.aggro && !u.target && u.fx.stun <= 0 && !this.shopOpen) {
      const t = this.autoTarget(u, u.attackMove ? 56 : 22);
      if (t) {
        u.target = t.id;
        u.lockOn = false;
        if (dist(u, t) <= u.range + t.r) this.swing(u, t);
      }
    }
  }

  /** Attack range, matching swing: centre distance against range plus the target's radius. */
  private towerReach(tower: Unit, t: Unit): boolean {
    return dist(tower, t) <= tower.range + t.r;
  }

  /** Living foe of the given kind still inside this tower's range. Lane minions only. */
  private towerLock(tower: Unit, id: number, kind: "minion" | "hero"): Unit | undefined {
    const t = this.byId(id);
    if (!t || t.dead || t.kind !== kind) return undefined;
    if (kind === "minion" && t.wild) return undefined;
    if (!foes(tower, t) || !this.towerReach(tower, t)) return undefined;
    return t;
  }

  private towerLaneMinion(tower: Unit): Unit | undefined {
    let best: Unit | undefined;
    let bestD = Infinity;
    for (const e of this.living()) {
      if (e.dead || e.kind !== "minion" || e.wild || !foes(tower, e)) continue;
      const d = dist(tower, e);
      if (d <= tower.range + e.r && d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private towerEnemyHero(tower: Unit): Unit | undefined {
    let best: Unit | undefined;
    let bestD = Infinity;
    for (const e of this.living()) {
      if (e.dead || e.kind !== "hero" || !foes(tower, e)) continue;
      const d = dist(tower, e);
      if (d <= tower.range + e.r && d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  /**
   * Sticky tower target. A drawn hero outranks minions. A minion outranks an
   * undrawn hero. The same priority never swaps, so a closer creep or a second
   * diver cannot flicker the lock.
   */
  private thinkTower(u: Unit): void {
    const drawn = u.drawId ? this.towerLock(u, u.drawId, "hero") : undefined;
    if (!drawn) u.drawId = 0;
    if (drawn) {
      u.target = drawn.id;
      u.path = [];
      this.swing(u, drawn);
      return;
    }
    const lockedCreep = u.target !== null ? this.towerLock(u, u.target, "minion") : undefined;
    if (lockedCreep) {
      this.swing(u, lockedCreep);
      return;
    }
    const creep = this.towerLaneMinion(u);
    if (creep) {
      u.target = creep.id;
      u.path = [];
      this.swing(u, creep);
      return;
    }
    const lockedHero = u.target !== null ? this.towerLock(u, u.target, "hero") : undefined;
    if (lockedHero) {
      this.swing(u, lockedHero);
      return;
    }
    const hero = this.towerEnemyHero(u);
    if (hero) {
      u.target = hero.id;
      u.path = [];
      this.swing(u, hero);
      return;
    }
    u.target = null;
  }

  /** Allied tower draws onto an enemy hero who just damaged an allied hero, when both stand in range. */
  private drawTowerAggro(attacker: Unit, victim: Unit): void {
    if (attacker.dead) return;
    for (const tower of this.living()) {
      if (tower.dead || (tower.kind !== "tower" && tower.kind !== "ancient")) continue;
      if (tower.team !== victim.team) continue;
      if (!this.towerReach(tower, attacker) || !this.towerReach(tower, victim)) continue;
      const held = tower.drawId ? this.towerLock(tower, tower.drawId, "hero") : undefined;
      if (held && held.id !== attacker.id) continue;
      tower.drawId = attacker.id;
      tower.target = attacker.id;
      tower.path = [];
      if (tower.fx.stun <= 0) this.swing(tower, attacker);
    }
  }

  private driveMinion(u: Unit, dt: number): void {
    const reach = u.caster ? 320 : 150;
    const creep = this.closestEnemyMinion(u, reach);
    if (creep) {
      u.target = creep.id;
      return;
    }
    if (!u.caster) {
      const tower = this.closestEnemy(u, 130);
      if (tower && (tower.kind === "tower" || tower.kind === "ancient" || tower.kind === "hero") && this.structureOpen(tower)) {
        u.target = tower.id;
        return;
      }
    } else {
      const front = this.frontInfantry(u);
      if (front && dist(u, front) < 52) {
        const shot = this.closestEnemyMinion(u, 310) ?? this.closestEnemy(u, 280);
        if (shot && shot.kind !== "hero") u.target = shot.id;
        return;
      }
    }
    this.walkLane(u, dt);
  }

  private driveCamp(u: Unit, dt: number): void {
    const home = { x: u.homeX, y: u.homeY };
    const leash = u.leash || 280;
    if (dist(u, home) > leash) {
      u.target = null;
      this.moveToward(u, home.x, home.y, dt);
      if (dist(u, home) < 22) u.hp = u.maxHp;
      return;
    }
    if (!u.target) {
      let best: Unit | undefined;
      let bestD = u.sense || 170;
      for (const e of this.living()) {
        if (e.kind !== "hero" || e.dead) continue;
        const d = dist(u, e);
        if (d < bestD) {
          bestD = d;
          best = e;
        }
      }
      if (best) u.target = best.id;
    }
    if (!u.target && dist(u, home) > 16) this.moveToward(u, home.x, home.y, dt);
  }

  private frontInfantry(u: Unit): Unit | undefined {
    let best: Unit | undefined;
    let bestWp = -1;
    for (const m of this.living()) {
      if (m.kind !== "minion" || m.caster || m.team !== u.team || m.lane !== u.lane) continue;
      if (m.wp > bestWp) {
        best = m;
        bestWp = m.wp;
      }
    }
    return best;
  }

  private walkLane(u: Unit, dt: number): void {
    const path = lanePath[u.team][u.lane ?? "mid"];
    const wp = path[Math.min(u.wp, path.length - 1)];
    if (!wp) return;
    this.steer(u, wp.x, wp.y, dt);
    if (dist(u, wp) < 40) u.wp = Math.min(path.length - 1, u.wp + 1);
  }

  private steer(u: Unit, x: number, y: number, dt: number): void {
    const n = Math.hypot(x - u.x, y - u.y) || 1;
    const slow = u.fx.slow > 0 ? 0.55 : 1;
    const sp = u.ms * slow;
    const fx = clamp(u.x + ((x - u.x) / n) * sp * dt, 20, WORLD - 20);
    const fy = clamp(u.y + ((y - u.y) / n) * sp * dt, 20, WORLD - 20);
    u.face = Math.atan2(y - u.y, x - u.x);
    if (isWalkable(fx, fy)) {
      u.x = fx;
      u.y = fy;
      u.moved = true;
      return;
    }
    const ax = clamp(u.x + ((x - u.x) / n) * sp * dt, 20, WORLD - 20);
    if (isWalkable(ax, u.y)) {
      u.x = ax;
      u.moved = true;
      return;
    }
    const by = clamp(u.y + ((y - u.y) / n) * sp * dt, 20, WORLD - 20);
    if (isWalkable(u.x, by)) {
      u.y = by;
      u.moved = true;
    }
  }

  /** Straight step on open ground. Around a trunk, follow the cached grid path. */
  private moveToward(u: Unit, x: number, y: number, dt: number): void {
    const n = Math.hypot(x - u.x, y - u.y) || 1;
    const slow = u.fx.slow > 0 ? 0.55 : 1;
    const sp = u.ms * slow;
    const fx = clamp(u.x + ((x - u.x) / n) * sp * dt, 20, WORLD - 20);
    const fy = clamp(u.y + ((y - u.y) / n) * sp * dt, 20, WORLD - 20);
    const midOk = isWalkable((u.x + fx) / 2, (u.y + fy) / 2);
    if (isWalkable(fx, fy) && midOk) {
      this.steer(u, x, y, dt);
      return;
    }
    this.route(u, x, y);
    u.detour = true;
    const step = u.path[0];
    if (!step) return;
    const next = u.path.length > 1 && dist(u, step) < 20 ? u.path[1]! : step;
    this.steer(u, next.x, next.y, dt);
    if (dist(u, next) < 18) {
      if (next === u.path[0]) u.path.shift();
      else u.path.splice(0, 2);
    }
  }

  private hear(u: Unit): number {
    const d = Math.hypot(u.x - this.camX, u.y - this.camY);
    return clamp(1.05 - d / 640, 0.08, 1);
  }

  private playSwing(u: Unit, t: Unit): void {
    if (u.kind === "tower" || u.kind === "ancient") {
      this.sfx.towerShot(this.hear(u));
      this.noteNet({ kind: "tower", heroId: "", x: u.x, y: u.y, melee: false, ult: false, team: u.team });
      return;
    }
    if (u.kind === "hero") {
      this.sfx.kitSwing(u.heroId ?? "riot", this.hear(u), u.melee, u.player ? 3 : 2);
      this.noteNet({ kind: "swing", heroId: u.heroId ?? "", x: u.x, y: u.y, melee: u.melee, ult: false, team: u.team });
      if (t.kind === "hero" && Math.random() < 0.28) this.shout(u, heroTaunt(u.team), true);
      else if (t.wild) this.sfx.hog();
      return;
    }
    if (u.kind === "minion") {
      if (u.wild) this.sfx.hog();
      else if (u.caster) this.sfx.arrow();
      else this.sfx.swing();
      if (!u.wild && t.kind === "minion" && Math.random() < 0.07) this.shout(u, creepBark(u.team), false);
      return;
    }
    this.sfx.attack();
  }

  private shout(u: Unit, line: string, voice: boolean): void {
    if (u.barkT > 0.4) return;
    u.bark = line;
    u.barkT = voice ? 2.1 : 1.3;
    if (voice && u.kind === "hero") this.sfx.speak(line, u.team === "home");
    else if (u.wild) this.sfx.hog();
    else this.sfx.grunt(u.team === "home");
  }

  /** MMA basic attacks stay melee even if a unit was marked ranged. */
  private keepMmaMelee(u: Unit): void {
    if (u.kind !== "hero" || !u.heroId) return;
    const def = heroById(u.heroId);
    if (def.id !== u.heroId || def.wing !== "mma") return;
    u.melee = true;
    if (u.range >= RANGED_BASIC_MIN) u.range = def.range < RANGED_BASIC_MIN ? def.range : MMA_MELEE_RANGE;
  }

  /** The red-book basic stays a melee swing. Ability shots are not touched. */
  private keepRedBookMelee(u: Unit): void {
    if (u.kind !== "hero" || !u.heroId) return;
    if (!kitHoldsSwungBook(pixelKit(u.heroId))) return;
    u.melee = true;
    if (u.range >= RANGED_BASIC_MIN) {
      const def = heroById(u.heroId);
      u.range = def.id === u.heroId && def.range < RANGED_BASIC_MIN ? def.range : 150;
    }
  }

  private swing(u: Unit, t: Unit): void {
    this.keepMmaMelee(u);
    this.keepRedBookMelee(u);
    const kit = u.kind === "hero" ? this.kitOf(u) : undefined;
    const rage = kit?.kind === "rage" && u.hp < u.maxHp * 0.4;
    const period = (u.fx.aspd > 0 ? u.period * 0.65 : u.period) * (rage ? 0.78 : 1);
    if (u.atk > 0) return;
    if (u.volley?.some((pellet) => !pellet.fired)) return;
    u.atk = period;
    u.beat += 1;
    this.playSwing(u, t);
    const stats = itemStats(u.inv);
    let raw = u.damage + (u.boonT > 0 ? u.boonDmg : 0);
    let crit = false;
    if (u.kind === "hero" && stats.crit > 0 && Math.random() < stats.crit) {
      raw = Math.round(raw * stats.critX);
      crit = true;
    }
    if (u.kind === "hero" && kit?.kind === "ambush" && u.dashMark > 0) {
      raw = Math.round(raw * 1.32);
      u.dashMark = 0;
      this.floats.push({ x: t.x, y: t.y - 30, text: "AMBUSH", life: 0.7, color: "#ff6b3a" });
    }
    if (u.kind === "hero" && this.armed.has(u.id)) {
      const id = this.armed.get(u.id)!;
      this.armed.delete(u.id);
      const spec = mechById(id);
      const def = heroById(u.heroId ?? "");
      const slot = def.abilities.findIndex((a) => a.mech === id);
      const ult = slot === 3;
      const reach = def.abilities[slot]?.range || 220;
      const pow = (base: number) => {
        let n = base + u.level * (ult ? 14 : 8);
        n *= u.spellAmp;
        if (ult) n *= u.ultAmp;
        return n;
      };
      this.castMech(u, id, t.x, t.y, t, ult, reach, Math.max(0, slot), pow, "armed");
      if (spec.self === "boon") {
        u.boonT = 0;
        u.boonDmg = 0;
      }
    }
    if (u.kind === "hero" && isHooliId(u.heroId ?? "") && !u.melee) {
      this.openVolley(u, t, raw, crit);
      return;
    }
    if (u.kind === "hero" && u.heroId === ALEX_GROANS_ID && !u.melee) {
      this.openAlexRocket(u, t, raw, crit);
      return;
    }
    if (u.kind === "hero" && u.heroId === SNOWBALL_HERO_ID && !u.melee) {
      this.openSnowball(u, t, raw, crit);
      return;
    }
    if (u.kind === "hero" && u.melee && this.unitIsMma(u)) {
      this.openMmaPunch(u, t, raw, crit);
      return;
    }
    if (u.melee) this.landHit(u, t, raw, crit);
    else this.launchShot(u, t.id, t.x, t.y, raw, crit, true);
  }

  /**
   * First application shoves a living hero back one step.
   * Duration, tenacity, and cooldowns are unchanged.
   */
  private applyStun(t: Unit, seconds: number, from?: Unit): void {
    if (!(seconds > 0)) return;
    const fresh = t.fx.stun <= 0;
    t.fx.stun = Math.max(t.fx.stun, seconds);
    if (fresh && t.kind === "hero" && !t.dead) this.shoveStun(t, from);
  }

  private shoveStun(t: Unit, from?: Unit): void {
    const step = stunPushVector(t.face, t, from);
    const fx = clamp(t.x + step.x, 20, WORLD - 20);
    const fy = clamp(t.y + step.y, 20, WORLD - 20);
    if (isWalkable(fx, fy)) {
      t.x = fx;
      t.y = fy;
      return;
    }
    if (isWalkable(fx, t.y)) {
      t.x = fx;
      return;
    }
    if (isWalkable(t.x, fy)) t.y = fy;
  }

  /** Wing, not a name list. A future MMA kit delays the same way. */
  private unitIsMma(u: Unit): boolean {
    if (u.kind !== "hero" || !u.heroId) return false;
    const def = heroById(u.heroId);
    return def.id === u.heroId && def.wing === "mma";
  }

  /** One pellet at fist contact. Damage is not split. A death clears the volley. */
  private openMmaPunch(u: Unit, t: Unit, raw: number, crit: boolean): void {
    u.face = Math.atan2(t.y - u.y, t.x - u.x);
    u.burstAge = 0.001;
    u.volley = [
      {
        at: MMA_PUNCH_CONTACT,
        idx: 0,
        dmg: raw,
        crit,
        proc: true,
        splashFrom: raw,
        target: t.id,
        tx: t.x,
        ty: t.y,
        fired: false,
        melee: true,
      },
    ];
  }

  /** One pellet at SnowballRelease. The shot leaves the hand. Damage is not split. */
  private openSnowball(u: Unit, t: Unit, raw: number, crit: boolean): void {
    u.face = Math.atan2(t.y - u.y, t.x - u.x);
    u.burstAge = 0.001;
    u.volley = [
      {
        at: SNOWBALL_RELEASE,
        event: SnowballRelease,
        idx: 0,
        dmg: raw,
        crit,
        proc: true,
        splashFrom: raw,
        target: t.id,
        tx: t.x,
        ty: t.y,
        fired: false,
      },
    ];
  }

  /** One pellet at AlexRocketFire. Cooldown already started. Damage is not split. */
  private openAlexRocket(u: Unit, t: Unit, raw: number, crit: boolean): void {
    u.face = Math.atan2(t.y - u.y, t.x - u.x);
    u.burstAge = 0.001;
    u.volley = [
      {
        at: ALEX_ROCKET_FIRE,
        event: AlexRocketFire,
        idx: 0,
        dmg: raw,
        crit,
        proc: true,
        splashFrom: raw,
        target: t.id,
        tx: t.x,
        ty: t.y,
        fired: false,
      },
    ];
  }

  /** Three pellets, one cooldown, the attack's damage split across them. */
  private openVolley(u: Unit, t: Unit, raw: number, crit: boolean): void {
    const shares = burstShares(raw);
    u.face = Math.atan2(t.y - u.y, t.x - u.x);
    u.burstAge = 0.001;
    u.volley = shares.map((dmg, idx) => ({
      at: HOOLI_BURST_AT[idx] ?? 0,
      idx,
      dmg,
      crit,
      proc: idx === 0,
      splashFrom: raw,
      target: t.id,
      tx: t.x,
      ty: t.y,
      fired: false,
    }));
  }

  private tickVolley(u: Unit, dt: number): void {
    if (!u.volley) return;
    u.burstAge += dt;
    for (const pellet of u.volley) {
      if (pellet.fired || u.burstAge < pellet.at) continue;
      pellet.fired = true;
      const target = this.byId(pellet.target);
      const tx = target && !target.dead ? target.x : pellet.tx;
      const ty = target && !target.dead ? target.y : pellet.ty;
      if (target && !target.dead) u.face = Math.atan2(ty - u.y, tx - u.x);
      if (pellet.melee) {
        if (target && !target.dead && !u.dead) this.landHit(u, target, pellet.dmg, pellet.crit, pellet.splashFrom);
      } else {
        this.launchShot(u, pellet.target, tx, ty, pellet.dmg, pellet.crit, pellet.proc, pellet.proc ? pellet.splashFrom : undefined);
      }
      this.burstLog.push({ hero: u.heroId ?? "", t: this.clock, dmg: pellet.dmg, idx: pellet.idx });
      if (this.burstLog.length > 24) this.burstLog.shift();
    }
    const settle =
      u.heroId === ALEX_GROANS_ID
        ? ALEX_ROCKET_END
        : u.heroId === SNOWBALL_HERO_ID
          ? SNOWBALL_END
          : this.unitIsMma(u)
            ? MMA_PUNCH_END
            : HOOLI_BURST_END;
    if (u.burstAge >= settle && u.volley.every((pellet) => pellet.fired)) {
      u.volley = undefined;
      u.burstAge = 0;
    }
  }

  burstReport(): BurstNote[] {
    return this.burstLog.slice();
  }

  /** Number the ten heroes so a host can hand a seat to a tester. Local matches never call this. */
  openSeats(): void {
    let i = 0;
    for (const u of this.units) {
      if (u.kind !== "hero") continue;
      u.seat = i;
      u.driven = false;
      i += 1;
    }
  }

  driveSeat(seat: number, name: string): boolean {
    const u = this.units.find((x) => x.kind === "hero" && x.seat === seat);
    if (!u) return false;
    u.driven = true;
    u.path = [];
    u.target = null;
    u.routeKey = "";
    const clean = name.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 24);
    if (clean) {
      u.name = clean;
      u.handle = handleOf(clean);
    }
    return true;
  }

  releaseSeat(seat: number): void {
    const u = this.units.find((x) => x.kind === "hero" && x.seat === seat);
    if (!u) return;
    u.driven = false;
  }

  seatHeld(seat: number): boolean {
    return this.units.some((u) => u.kind === "hero" && u.seat === seat && u.driven);
  }

  heroAtSeat(seat: number): string {
    return this.units.find((u) => u.kind === "hero" && u.seat === seat)?.heroId ?? "";
  }

  seatOrder(seat: number, order: Order): void {
    if (this.ended || this.screen !== "play") return;
    const u = this.units.find((x) => x.kind === "hero" && x.seat === seat && x.driven);
    if (!u) return;
    this.applyOrder(u, order);
  }

  /** Browser draws a host match and sends orders instead of simulating them. */
  followServer(seat: number): void {
    this.remote = true;
    this.mySeat = seat;
    this.netPrimed = false;
    this.lastNet = 0;
    this.chase.clear();
    if (seat < 0) {
      this.spec = true;
      this.watch = true;
    } else {
      this.spec = false;
      this.watch = false;
      this.autoplay = false;
      this.followStars = false;
      this.follow = true;
    }
    this.retargetSeat();
  }

  serverView(): {
    clock: number;
    phase: string;
    ended: boolean;
    winner: "home" | "away" | "";
    driven: number;
    heroes: number;
  } {
    let driven = 0;
    let heroes = 0;
    for (const u of this.units) {
      if (u.kind !== "hero") continue;
      heroes += 1;
      if (u.driven) driven += 1;
    }
    return { clock: this.clock, phase: this.bf.phase, ended: this.ended, winner: this.matchWinner(), driven, heroes };
  }

  worldSnap(): WorldSnap {
    const units: SnapUnit[] = [];
    for (const u of this.units) {
      units.push({
        id: u.id,
        kind: u.kind,
        team: u.team,
        name: u.name,
        heroId: u.heroId ?? "",
        x: Math.round(u.x),
        y: Math.round(u.y),
        r: u.r,
        hp: Math.round(u.hp),
        maxHp: Math.round(u.maxHp),
        mana: Math.round(u.mana),
        maxMana: Math.round(u.maxMana),
        dead: u.dead,
        respawn: Math.round(u.respawn * 10) / 10,
        face: Math.round(u.face * 100) / 100,
        level: u.level,
        kills: u.kills,
        deaths: u.deaths,
        assists: u.assists,
        cs: u.cs,
        gold: Math.round(u.gold),
        items: ownedIds(u.inv ?? []),
        ...snapSlots(u.inv ?? emptyCarrier().slots),
        cds: u.cds.map((n) => Math.round(n * 10) / 10),
        seat: u.seat,
        color: u.color,
        skin: u.skin ?? "",
        objectiveId: u.objectiveId,
        castT: Math.round(u.castT * 100) / 100,
        castUlt: u.castUlt,
        burstAge: Math.round(u.burstAge * 1000) / 1000,
        atk: Math.round(u.atk * 100) / 100,
        period: u.period,
        ms: u.ms,
        moved: u.moved,
        hurtT: Math.round(u.hurtT * 100) / 100,
        dashMark: Math.round(u.dashMark * 100) / 100,
        stun: Math.round(u.fx.stun * 100) / 100,
        slow: Math.round(u.fx.slow * 100) / 100,
        shield: Math.round(u.fx.shield),
        wild: u.wild,
        barkT: Math.round(u.barkT * 10) / 10,
        lane: u.lane ?? "",
        towerTier: u.towerTier ?? "",
      });
    }
    const shots: SnapShot[] = this.shots.map((s) => ({
      x: Math.round(s.x),
      y: Math.round(s.y),
      tx: Math.round(s.tx),
      ty: Math.round(s.ty),
      team: s.team,
      heroId: s.heroId ?? "",
      color: s.color,
      ammo: s.ammo ?? "",
      source: s.source ?? "",
    }));
    return {
      clock: Math.round(this.clock * 100) / 100,
      phase: this.bf.phase,
      shopPhase: this.bf.shopPhase,
      shrines: this.bf.shrines,
      night: this.bf.night,
      warnPit: this.bf.warnPit,
      ended: this.ended,
      winner: this.matchWinner(),
      banner: this.bannerT > 0 ? this.banner.slice(0, 160) : "",
      feed: this.feed.slice(0, 5).map((f) => f.text.slice(0, 120)),
      units,
      shots,
      events: this.netEvents.slice(),
    };
  }

  applySnap(snap: WorldSnap): void {
    const keep = new Set<number>();
    for (const s of snap.units) {
      keep.add(s.id);
      let u = this.byId(s.id);
      const fresh = !u;
      if (!u) u = this.adopt(s);
      this.copySnap(u, s, fresh);
    }
    this.units = this.units.filter((u) => keep.has(u.id));
    this.shots = snap.shots.map((s) => ({
      x: s.x,
      y: s.y,
      tx: s.tx,
      ty: s.ty,
      speed: 480,
      dmg: 0,
      team: s.team,
      target: 0,
      from: 0,
      color: s.color,
      crit: false,
      onHit: false,
      heroId: s.heroId || undefined,
      ammo: asShotAmmo(s.ammo),
      source: asProjectileSource(s.source),
    }));
    this.clock = snap.clock;
    this.bf.phase = snap.phase;
    this.bf.shopPhase = snap.shopPhase;
    this.bf.shrines = snap.shrines;
    this.bf.night = snap.night;
    this.bf.warnPit = snap.warnPit;
    this.ended = snap.ended;
    this.banner = snap.banner;
    this.bannerT = snap.banner ? 1.2 : 0;
    this.feed = snap.feed.map((text) => ({ text, t: this.time }));
    this.retargetSeat();
    if (snap.ended && snap.winner) {
      const mine = this.mySeat >= 5 ? "away" : this.mySeat >= 0 ? "home" : "";
      this.screen = !mine || snap.winner === mine ? "victory" : "defeat";
      if (!mine) this.screen = snap.winner === "home" ? "victory" : "defeat";
    } else if (!snap.ended && this.screen !== "paused") {
      this.screen = "play";
    }
    this.playNet(snap.events);
  }

  private matchWinner(): "home" | "away" | "" {
    if (!this.ended) return "";
    const home = this.units.find((u) => u.kind === "ancient" && u.team === "home");
    const away = this.units.find((u) => u.kind === "ancient" && u.team === "away");
    if (away?.dead) return "home";
    if (home?.dead) return "away";
    return "";
  }

  private noteNet(e: Omit<NetEvent, "id">): void {
    if (!this.headless) return;
    this.netEvents.push({ ...e, id: this.netEid++ });
    if (this.netEvents.length > 48) this.netEvents.shift();
  }

  private playNet(events: NetEvent[]): void {
    if (!this.remote) return;
    let max = this.lastNet;
    for (const e of events) if (e.id > max) max = e.id;
    if (!this.netPrimed) {
      this.netPrimed = true;
      this.lastNet = max;
      return;
    }
    for (const e of events) {
      if (e.id <= this.lastNet) continue;
      const vol = clamp(1.05 - Math.hypot(e.x - this.camX, e.y - this.camY) / 640, 0.08, 1);
      if (e.kind === "swing") this.sfx.kitSwing(e.heroId || "riot", vol, e.melee, 2);
      else if (e.kind === "cast") this.sfx.kitCast(e.heroId || "riot", e.ult, vol);
      else if (e.kind === "death") this.sfx.death();
      else this.sfx.towerShot(vol);
    }
    this.lastNet = max;
  }

  private retargetSeat(): void {
    for (const u of this.units) {
      if (u.kind !== "hero") continue;
      u.player = this.mySeat >= 0 && u.seat === this.mySeat;
    }
  }

  private adopt(s: SnapUnit): Unit {
    const def = s.heroId ? heroById(s.heroId) : null;
    const u = this.baseUnit(s.kind, s.team, s.name, s.x, s.y, s.r || 18, s.kind === "hero" ? def : null);
    u.id = s.id;
    if (s.id >= this.nid) this.nid = s.id + 1;
    this.units.push(u);
    return u;
  }

  private copySnap(u: Unit, s: SnapUnit, fresh: boolean): void {
    u.kind = s.kind;
    u.team = s.team;
    u.name = s.name;
    u.heroId = s.heroId || undefined;
    u.r = s.r;
    u.hp = s.hp;
    u.maxHp = s.maxHp;
    u.mana = s.mana;
    u.maxMana = s.maxMana;
    u.dead = s.dead;
    u.respawn = s.respawn;
    u.face = s.face;
    u.level = s.level;
    u.kills = s.kills;
    u.deaths = s.deaths;
    u.assists = s.assists;
    u.cs = s.cs;
    u.gold = s.gold;
    u.inv = slotsFromSnap(s.items, s.slots, s.slotCounts, s.slotCds);
    u.items = ownedIds(u.inv);
    u.cds = s.cds.slice();
    u.seat = s.seat;
    u.color = s.color;
    if (s.skin) u.skin = s.skin;
    u.objectiveId = s.objectiveId;
    u.castT = s.castT;
    u.castUlt = s.castUlt;
    u.burstAge = s.burstAge;
    u.atk = s.atk;
    u.period = s.period;
    u.ms = s.ms;
    u.moved = s.moved;
    u.hurtT = s.hurtT;
    u.dashMark = s.dashMark;
    u.fx.stun = s.stun;
    u.fx.slow = s.slow;
    u.fx.shield = s.shield;
    u.wild = s.wild;
    u.barkT = s.barkT;
    if (s.lane === "top" || s.lane === "mid" || s.lane === "bot") u.lane = s.lane;
    if (s.towerTier === "outer" || s.towerTier === "middle" || s.towerTier === "inner") u.towerTier = s.towerTier;
    this.chase.set(u.id, { x: s.x, y: s.y });
    if (fresh) {
      u.x = s.x;
      u.y = s.y;
    }
  }

  /** Both teams, for the hold-Tab board. */
  scoreboard(): { team: Team; name: string; hero: string; level: number; k: number; d: number; a: number; cs: number; dead: boolean; respawn: number }[] {
    return this.units
      .filter((u) => u.kind === "hero")
      .map((u) => ({
        team: u.team,
        name: u.name,
        hero: heroById(u.heroId ?? "").name,
        level: u.level,
        k: u.kills,
        d: u.deaths,
        a: u.assists,
        cs: u.cs,
        dead: u.dead,
        respawn: Math.max(0, Math.ceil(u.respawn)),
      }));
  }

  private launchShot(u: Unit, target: number, tx: number, ty: number, dmg: number, crit: boolean, procs: boolean, splashFrom?: number): void {
    const heroId = u.kind === "hero" ? u.heroId : undefined;
    const nerf = heroId === ALEX_GROANS_ID;
    const armed = !!heroId && !!heroWeapon(heroId);
    const face = Number.isFinite(u.face) ? u.face : Math.atan2(ty - u.y, tx - u.x);
    const archer = u.kind === "minion" && u.caster && !u.wild;
    let ox = u.x;
    let oy = u.y;
    if (heroId === SNOWBALL_HERO_ID) {
      const hand = snowballSpawn(u.x, u.y, face);
      ox = hand.x;
      oy = hand.y;
    } else if (armed && heroId) {
      const muzzle = heroWeaponMuzzle(heroId, u.x, u.y, face, "attack");
      ox = muzzle.x;
      oy = muzzle.y;
    } else if (u.kind === "tower") {
      const muzzle = laneTowerMuzzle(u.x, u.y, u.team === "home");
      ox = muzzle.x;
      oy = muzzle.y;
    } else if (archer) {
      ox = u.x + Math.cos(face) * 18;
      oy = u.y - 12 + Math.sin(face) * 5;
    }
    const source: ProjectileSource =
      u.kind === "hero" ? "hero" : u.kind === "tower" ? "tower" : u.kind === "ancient" ? "ancient" : archer ? "archer" : "spell";
    // The old can-or-bottle coin flip lived here. Keep the roll so later crits stay on the same stream.
    if (archer) Math.random();
    this.shots.push({
      x: ox,
      y: oy,
      tx,
      ty,
      speed: u.kind === "tower" || u.kind === "ancient" ? 520 : 480,
      dmg,
      team: u.team,
      target,
      from: u.id,
      color: u.kind === "hero" ? pixelVfxColor(u.heroId ?? "riot") : u.color,
      crit,
      onHit: true,
      procs,
      splashFrom,
      heroId: u.kind === "hero" ? u.heroId : undefined,
      ammo: nerf ? this.takeNerf(u.id) : undefined,
      source,
    });
  }

  private clearPuffs(): void {
    this.puffAt = 0;
    for (const puff of this.puffs) puff.life = 0;
  }

  /** Visual only. The slot ring is allocated once. */
  private stampPuff(s: Shot): void {
    const src = projectileLook(s);
    const puff = this.puffs[this.puffAt]!;
    this.puffAt = (this.puffAt + 1) % this.puffs.length;
    puff.x = s.tx;
    puff.y = s.ty;
    puff.life = 0.16;
    puff.look.id = src.id;
    puff.look.team = src.team;
    puff.look.dye = src.dye;
    puff.look.color = src.color;
    puff.look.body = src.body;
    puff.look.accent = src.accent;
    puff.look.metal = src.metal;
  }

  private tickShots(dt: number): void {
    const shots = this.shots;
    let w = 0;
    for (let i = 0; i < shots.length; i++) {
      const s = shots[i]!;
      const t = this.byId(s.target);
      if (t && !t.dead) {
        s.tx = t.x;
        s.ty = t.y;
      }
      const n = Math.hypot(s.tx - s.x, s.ty - s.y) || 1;
      const step = s.speed * dt;
      if (n <= step) {
        this.stampPuff(s);
        if (t && !t.dead) {
          const src = this.byId(s.from);
          if (src && s.onHit && s.procs !== false) this.landHit(src, t, s.dmg, s.crit, s.splashFrom);
          else if (src && s.onHit) this.hurt(t, s.dmg, src, { crit: s.crit });
          else this.hurt(t, s.dmg, src, { spell: true });
          if (s.rider && src && !t.dead) this.payRider(src, t, s.rider);
        }
      } else {
        s.x += ((s.tx - s.x) / n) * step;
        s.y += ((s.ty - s.y) / n) * step;
        shots[w++] = s;
      }
    }
    shots.length = w;
  }

  private landHit(src: Unit, t: Unit, raw: number, crit: boolean, splashFrom?: number): void {
    this.hurt(t, raw, src, { crit });
    if (src.kind === "hero" && src.slowOnHit > 0 && t.kind === "hero" && !t.dead) {
      t.fx.slow = Math.max(t.fx.slow, src.slowOnHit);
    }
    if (src.kind !== "hero") return;
    const kit = this.kitOf(src);
    if (kit.kind === "vamp" && t.kind === "hero" && !src.dead) {
      const heal = Math.max(4, raw * 0.12);
      src.hp = Math.min(src.maxHp, src.hp + heal);
      this.floats.push({ x: src.x, y: src.y - 22, text: `+${Math.floor(heal)}`, life: 0.5, color: "#80cbc4" });
    }
    const stats = itemStats(src.inv);
    if (kit.kind === "barrage") {
      stats.splash = Math.max(stats.splash, 0.34);
      stats.splashR = Math.max(stats.splashR, 145);
      stats.bash = Math.min(0.4, stats.bash + 0.2);
      stats.bashT = Math.max(stats.bashT, 0.75);
    }
    if (stats.bash > 0 && t.kind !== "tower" && t.kind !== "ancient" && src.bashCd <= 0 && Math.random() < stats.bash) {
      src.bashCd = 2.3;
      this.applyStun(t, stats.bashT, src);
      this.floats.push({ x: t.x + 6, y: t.y - 34, text: "BASH", life: 0.75, color: "#7ec8ff" });
      this.burst(t.x, t.y, "#7ec8ff", 9);
      this.sfx.bash(this.hear(t));
    }
    if (stats.splash <= 0) return;
    const splashDmg = Math.max(1, (splashFrom ?? raw) * stats.splash);
    const reach = stats.splashR || 170;
    let splashHits = 0;
    for (const e of this.living()) {
      if (e.id === t.id) continue;
      if (!foes(src, e)) continue;
      if (e.kind === "tower" || e.kind === "ancient") continue;
      if (dist(e, t) > reach) continue;
      this.hurt(e, splashDmg, src, { splash: true });
      splashHits += 1;
    }
    if (splashHits > 0) this.sfx.splash(this.hear(t));
  }

  private hurt(t: Unit, raw: number, src?: Unit, kind: HitKind = {}): void {
    if (t.dead) return;
    if (t.player && this.guard > 0) return;
    if (!this.structureOpen(t)) {
      this.noteGate(t, src);
      return;
    }
    let dmg = Math.max(1, raw - t.armor - (kind.spell ? t.mr * 0.45 : 0));
    if (t.fx.shield > 0) {
      const use = Math.min(t.fx.shield, dmg);
      t.fx.shield -= use;
      dmg -= use;
    }
    t.hp -= dmg;
    if (t.kind === "hero") t.hurtT = 0.22;
    else if (t.kind === "minion") t.hurtT = 0.16;
    const label = kind.crit ? `CRIT ${Math.floor(dmg)}` : `${Math.floor(dmg)}`;
    const color = kind.crit ? "#ff6b3a" : kind.splash ? "#e8c050" : "#ffe08a";
    this.floats.push({ x: t.x, y: t.y - (kind.crit ? 24 : 18), text: label, life: kind.crit ? 0.75 : 0.55, color });
    const vol = this.hear(t);
    if (src?.kind === "hero") this.sfx.kitHit(src.heroId ?? "riot", vol);
    else if (src?.kind === "minion") this.sfx.minionHit(src.wild ? "wild" : src.caster ? "ranged" : "melee", vol);
    else if (src?.melee) this.sfx.clink("minion", vol);
    else this.sfx.ting("minion", vol);
    const surface = t.kind === "tower" || t.kind === "ancient" ? "structure" : t.armor >= 6 ? "armor" : "flesh";
    this.sfx.hit(vol, surface);
    if (t.kind === "hero") this.sfx.kitHit(t.heroId ?? "riot", vol * 0.45);
    if (kind.crit) this.sfx.crit(vol);
    if (src?.melee && (t.kind === "hero" || t.kind === "minion")) {
      this.burst((src.x + t.x) / 2, (src.y + t.y) / 2, kind.crit ? "#ff6b3a" : "#ffe8a0", kind.crit ? 12 : 7);
    }
    if (kind.splash) this.burst(t.x, t.y, "#e8c050", 5);
    if (src && t.kind === "hero" && src.kind === "hero" && src.team !== t.team) {
      t.hits[src.id] = this.clock;
    }
    if (src && src.kind === "hero" && t.kind === "hero" && foes(src, t)) this.drawTowerAggro(src, t);
    if (t.hp <= 0) this.kill(t, src);
  }

  private kill(t: Unit, src?: Unit): void {
    t.dead = true;
    t.hp = 0;
    t.path = [];
    const magaDeath = t.kind === "hero" && !!t.heroId && heroById(t.heroId).id === t.heroId && heroById(t.heroId).wing === "maga";
    if (t.kind === "hero" && !magaDeath) this.shout(t, this.kitOf(t).voice.death, true);
    t.target = null;
    this.burst(t.x, t.y, t.color, 14);
    if (t.kind === "minion") {
      t.bark = "";
      t.barkT = CREEP_CORPSE;
      if (t.objectiveId) {
        this.onObjectiveDown(t, src);
        t.respawn = t.respawnMax || 75;
        return;
      }
      if (src && (t.wild || src.team !== t.team)) {
        const g = t.gold || 32;
        src.gold += g;
        this.popGold(src, g, false);
        this.giveXp(t.x, t.y, src.team, t.wild ? 64 : 42);
        if (src.kind === "hero") src.cs += 1;
        this.sfx.minionDown(this.hear(t));
        this.sfx.coin(this.hear(t));
        if (src.player) {
          if (src.cs === 5 || src.cs === 10 || src.cs === 20 || src.cs === 30 || src.cs === 40) {
            const bonus = src.cs >= 30 ? 28 : src.cs >= 20 ? 18 : src.cs >= 10 ? 12 : 8;
            src.gold += bonus;
            this.popGold(src, bonus, true);
            this.banner = `${src.cs} last-hits`;
            this.bannerT = 1.5;
            this.pushFeed(`${src.name} · ${src.cs} last-hits`);
          }
        }
      }
      if (t.wild) {
        t.respawn = 42;
        this.sfx.hog();
      } else this.sfx.grunt(t.team === "home");
      return;
    }
    if (t.kind === "tower") {
      if (!this.firstTower) this.firstTower = other(t.team);
      const line = callTower(t.team === "home", t.name);
      this.banner = line;
      this.bannerT = 3.2;
      this.sfx.tower(this.hear(t));
      if (!this.demo) this.sfx.announceNow(line);
      const takers = other(t.team);
      const p = this.player();
      if (p && p.team === takers) this.playerTowers += 1;
      if (src) {
        src.gold += 180;
        this.popGold(src, 180, true);
      }
      for (const u of this.units) {
        if (u.kind !== "hero" || u.dead || u.team !== takers) continue;
        const share = this.firstTower === takers && src?.id !== u.id ? 55 : 30;
        u.gold += share;
        if (u.player) this.popGold(u, share, true);
      }
      this.giveXp(t.x, t.y, takers, 140);
      this.pushFeed(`${t.name} destroyed`);
      if (t.lane && !this.routes.has(t.lane)) {
        this.routes.add(t.lane);
        this.bfQueue.push(`The cut behind ${t.lane} is open`);
      }
      this.burst(t.x, t.y - 12, t.color, 36);
      this.burst(t.x, t.y + 8, "#8a7a60", 18);
      this.shake = Math.max(this.shake, 0.42);
      return;
    }
    if (t.kind === "ancient") {
      this.ended = true;
      this.screen = t.team === "away" ? "victory" : "defeat";
      if (this.screen === "victory") this.sfx.win();
      else this.sfx.lose();
      const line = callWinner(this.screen === "victory");
      this.banner = line;
      this.bannerT = 6;
      if (!this.demo) this.sfx.announceNow(line);
      return;
    }
    if (t.kind === "hero") {
      t.respawn = this.deathCounts.noteDeath(String(t.id), t.level);
      t.deaths = this.deathCounts.count(String(t.id));
      this.noteNet({ kind: "death", heroId: t.heroId ?? "", x: t.x, y: t.y, melee: t.melee, ult: false, team: t.team });
      this.sfx.death();
      if (magaDeath) {
        t.bark = MAGA_DEATH;
        t.barkT = 2.8;
        this.sfx.fakeNews();
      } else if (t.team === "away") {
        t.bark = ANTIFA_DEATH;
        t.barkT = 2.8;
        this.sfx.nazi();
      }
      this.pushFeed(`${t.name}: ${t.bark}`);
      this.creditHeroKill(t, src);
    }
  }

  private creditHeroKill(victim: Unit, src?: Unit): void {
    const assistWindow = 12;
    this.voiceMulti.delete(victim.id);
    let killer: Unit | undefined;
    if (src?.kind === "hero" && src.team !== victim.team) killer = src;
    else {
      let latest = -1;
      for (const [id, at] of Object.entries(victim.hits)) {
        if (this.clock - at > assistWindow || at < latest) continue;
        const u = this.byId(Number(id));
        if (u?.kind === "hero" && u.team !== victim.team) {
          latest = at;
          killer = u;
        }
      }
    }
    const assists: Unit[] = [];
    const seen = new Set<number>();
    const take = (u: Unit | undefined): void => {
      if (!u || u.kind !== "hero" || u.team === victim.team) return;
      if (killer && u.id === killer.id) return;
      if (seen.has(u.id)) return;
      seen.add(u.id);
      assists.push(u);
    };
    for (const [id, at] of Object.entries(victim.hits)) {
      if (this.clock - at > assistWindow) continue;
      take(this.byId(Number(id)));
    }
    for (const u of this.units) {
      if (u.kind !== "hero" || u.dead || u.team === victim.team) continue;
      if (Math.hypot(u.x - victim.x, u.y - victim.y) < 220) take(u);
    }
    const shut = victim.streak;
    victim.streak = 0;
    if (killer) {
      killer.kills += 1;
      killer.streak += 1;
      if (killer.player) this.playerBest = Math.max(this.playerBest, killer.streak);
      const openingBlood = !this.firstBlood;
      let gold = 180 + victim.level * 20;
      if (!this.firstBlood) gold += 50;
      if (shut >= 3) gold += 40 + shut * 25;
      killer.gold += gold;
      this.popGold(killer, gold, true);
      this.giveXp(victim.x, victim.y, killer.team, 220);
      for (const a of assists) {
        a.assists += 1;
        a.gold += 55;
        if (a.player) this.popGold(a, 55, false);
      }
      const extra = assists.length ? ` +${assists.length}` : "";
      this.pushFeed(`${killer.name} shut down ${victim.name}${extra}`);
      this.sfx.kill();
      this.sfx.coin(this.hear(victim), true);
      this.queueKillVoice(killer);
      if (killer.kind === "hero") {
        const kkit = this.kitOf(killer);
        if (kkit.kind === "ambush" || kkit.kind === "haste") {
          killer.cds[0] = Math.max(0, (killer.cds[0] ?? 0) * 0.5);
          killer.cds[1] = Math.max(0, (killer.cds[1] ?? 0) * 0.55);
          this.floats.push({ x: killer.x, y: killer.y - 34, text: "RESET", life: 0.7, color: "#7ec8ff" });
        }
      }
      const down = callShutdown(shut);
      if (down) {
        this.banner = down;
        this.bannerT = 2.6;
        this.pushFeed(`${killer.name} breaks a ${shut} streak`);
      }
      const hot = callStreak(killer.streak);
      if (hot) {
        this.banner = hot;
        this.bannerT = 2.8;
        this.holdCall = hot;
        this.holdCallT = 1.4;
        this.pushFeed(`${killer.name} · ${hot}`);
      }
      if (!this.firstBlood) {
        this.firstBlood = true;
        this.banner = CALL_FIRST_BLOOD;
        this.bannerT = 3.4;
        this.holdCall = CALL_FIRST_BLOOD;
        this.holdCallT = 2.2;
      }
      if (!this.muted) {
        for (const row of soundsForKillTrigger({
          firstBlood: openingBlood,
          streak: killer.streak,
          shutdown: shut,
        })) {
          this.sfx.playKillNotice(row.sound);
        }
      }
    } else this.pushFeed(`${victim.name} burned out`);
  }

  /** Queue the voice ladder for the hero who received the kill. */
  private queueKillVoice(killer: Unit): void {
    if (killer.kind !== "hero" || !killer.heroId) return;
    const credited = creditVoiceMulti("killer", this.voiceMulti.get(killer.id), this.clock, this.killCues, {
      unitId: killer.id,
      heroId: killer.heroId,
      home: killer.team === "home",
      playAt: this.clock + KILL_VOICE.settle,
    });
    if (credited.mark) this.voiceMulti.set(killer.id, credited.mark);
    this.killCues = [...credited.queue];
  }

  private tickKillVoice(): void {
    const now = this.clock;
    const idx = this.killCues.findIndex((cue) => cue.playAt <= now);
    if (idx < 0) return;
    const cue = this.killCues[idx]!;
    if (!cue.line) cue.line = pickKillLine(cue.heroId, cue.n, KILL_VOICE.rng);
    let spoke = true;
    try {
      spoke = this.sfx.speakKill(cue.line, cue.home);
    } catch {
      spoke = true;
    }
    if (!spoke) return;
    const u = this.byId(cue.unitId);
    if (u) {
      this.killLine = cue.line;
      this.killLineT = Math.max(2.2, cue.line.length * 0.05);
      this.killLineTeam = u.team;
    }
    this.killCues.splice(idx, 1);
  }

  private revive(u: Unit): void {
    const f = fountain[u.team];
    const seat = { x: u.homeX, y: u.homeY };
    const spot = dist(seat, f) < POOL_RADIUS ? seat : f;
    u.dead = false;
    u.x = spot.x;
    u.y = spot.y;
    u.hp = u.maxHp;
    u.mana = u.maxMana;
    u.path = [];
    u.target = null;
    u.wp = 0;
    u.waveAt = -1;
    u.joinedWave = false;
    u.waveDuty = "WAITING_IN_BASE";
    u.waveSeen = false;
    u.routeKey = "";
    u.campStick = "";
    u.hits = {};
    u.aggro = true;
    u.lockOn = false;
    u.attackMove = false;
    u.heat = 0;
    u.dashMark = 0;
    u.castT = 0;
    u.castUlt = false;
    u.moved = false;
    resetStride(u.id);
    u.hurtT = 0;
    this.sfx.respawn(this.hear(u));
    if (this.aiControlled(u) && this.nearFountain(u)) {
      if (this.needsOpeningItem(u)) this.openingShop(u);
      u.waveDuty = "MOVING_TO_LANE_START";
      u.lane = u.lane ?? "mid";
    }
    if (isHooliId(u.heroId ?? "")) {
      u.atk = 0;
      u.face = u.team === "home" ? -Math.PI / 4 : (3 * Math.PI) / 4;
    }
    u.hasteT = 0;
    u.markT = 0;
  }

  private giveXp(x: number, y: number, team: Team, amount: number): void {
    for (const u of this.units) {
      if (u.kind !== "hero" || u.team !== team || u.dead) continue;
      if (Math.hypot(u.x - x, u.y - y) > 560) continue;
      u.xp += amount;
      while (u.level < 11 && u.xp >= (XP[u.level] ?? 99999)) {
        u.level += 1;
        this.applyItems(u);
        u.hp = Math.min(u.maxHp, u.hp + 40);
        u.mana = Math.min(u.maxMana, u.mana + 40);
        if (u.player) {
          this.banner = `Level ${u.level}`;
          this.bannerT = 1.6;
          this.burst(u.x, u.y, "#f0c14a", 16);
          this.sfx.coin();
        }
        this.offerMile(u);
      }
    }
  }

  private checkWin(): void {
    const home = this.units.find((u) => u.kind === "ancient" && u.team === "home");
    const away = this.units.find((u) => u.kind === "ancient" && u.team === "away");
    if (home?.dead) {
      this.ended = true;
      this.screen = "defeat";
      this.sfx.lose();
    }
    if (away?.dead) {
      this.ended = true;
      this.screen = "victory";
      this.sfx.win();
      const p = this.player();
      if (p) this.shout(p, this.kitOf(p).voice.win, true);
    }
  }

  private living(): Unit[] {
    if (this.liveCache) return this.liveCache;
    const out: Unit[] = [];
    for (const u of this.units) {
      if (!u.dead) out.push(u);
    }
    this.liveCache = out;
    return out;
  }

  private byId(id: number): Unit | undefined {
    return this.units.find((u) => u.id === id);
  }

  private canChoose(p: Unit, t: Unit): boolean {
    if (t.id === p.id || t.dead) return false;
    if (foes(p, t)) return true;
    return t.kind === "minion" && !t.wild && t.team === p.team && t.hp < t.maxHp * 0.5;
  }

  private pickChoose(p: Unit, x: number, y: number, pad: number): Unit | undefined {
    let best: Unit | undefined;
    let bestD = pad;
    for (const u of this.living()) {
      if (!this.canChoose(p, u)) continue;
      const extra = u.kind === "hero" ? u.r * 0.35 : 0;
      const d = Math.hypot(u.x - x, u.y - y) - u.r - extra;
      if (d < bestD) {
        bestD = d;
        best = u;
      }
    }
    return best;
  }

  private lockTarget(p: Unit, hit: Unit): void {
    p.target = hit.id;
    p.path = [];
    p.aggro = true;
    p.lockOn = true;
    p.attackMove = false;
    this.input.attackMove = false;
    this.marker = { x: hit.x, y: hit.y };
  }

  private targetLabel(u: Unit): string {
    if (u.handle) return `@${u.handle}`;
    return u.name;
  }

  private targetHud(p: Unit | undefined): string {
    if (!p || p.dead) return "";
    if (this.input.attackMove) return "A · click a creep or hero";
    if (p.lockOn && p.target !== null) {
      const t = this.byId(p.target);
      if (t && !t.dead) return `Target · ${this.targetLabel(t)}`;
    }
    return "Auto-attack";
  }

  private unitAt(x: number, y: number, pad: number): Unit | undefined {
    let best: Unit | undefined;
    let bestD = pad;
    for (const u of this.living()) {
      const d = Math.hypot(u.x - x, u.y - y) - u.r;
      if (d < bestD) {
        bestD = d;
        best = u;
      }
    }
    return best;
  }

  private autoTarget(u: Unit, pad: number): Unit | undefined {
    const reach = u.range + pad;
    let hero: Unit | undefined;
    let heroD = reach;
    let creep: Unit | undefined;
    let creepScore = Infinity;
    for (const e of this.living()) {
      if (e.kind === "tower" || e.kind === "ancient") continue;
      if (!foes(u, e)) continue;
      const d = dist(u, e);
      if (d > reach + e.r) continue;
      if (e.kind === "hero") {
        if (this.veiled(u, e)) continue;
        if (d < heroD) {
          heroD = d;
          hero = e;
        }
      } else if (e.kind === "minion") {
        const score = e.hp + d * 0.2;
        if (score < creepScore) {
          creepScore = score;
          creep = e;
        }
      }
    }
    return hero ?? creep;
  }

  private closestEnemyMinion(u: Unit, range: number): Unit | undefined {
    let best: Unit | undefined;
    let bestD = range;
    for (const e of this.living()) {
      if (e.kind !== "minion" || e.wild || e.team === u.team) continue;
      const d = dist(u, e);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private closestEnemy(u: Unit, range: number): Unit | undefined {
    let best: Unit | undefined;
    let bestD = range;
    for (const e of this.living()) {
      if (e.id === u.id || !foes(u, e)) continue;
      if (u.kind === "hero" && e.kind === "hero" && this.veiled(u, e)) continue;
      const d = dist(u, e);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private closestEnemyHero(u: Unit, range: number): Unit | undefined {
    let best: Unit | undefined;
    let bestD = range;
    for (const e of this.living()) {
      if (!this.knownHero(u, e)) continue;
      const d = dist(u, e);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private knownHero(u: Unit, e: Unit): boolean {
    if (e.dead || e.kind !== "hero" || e.team === u.team) return false;
    if (!enemyInTeamVision(e, this.sightsFor(u.team))) return false;
    if (this.veiled(u, e)) return false;
    return true;
  }

  private sees(team: Team, x: number, y: number): boolean {
    return enemyInTeamVision({ x, y }, this.sightsFor(team));
  }

  private sightsFor(team: Team): Sight[] {
    const cached = this.sightCache[team];
    if (cached) return cached;
    const out: Sight[] = [];
    for (const u of this.units) {
      if (u.dead) continue;
      if (u.objectiveId) {
        out.push({ x: u.x, y: u.y, r: BATTLEFIELD.objectiveVision });
        continue;
      }
      if (u.wild || u.team !== team) continue;
      if (u.kind === "hero") out.push({ x: u.x, y: u.y, r: Math.max(HERO_SIGHT, u.trueSight) });
      else if (u.kind === "minion") out.push({ x: u.x, y: u.y, r: MINION_SIGHT });
      else if (u.kind === "tower" || u.kind === "ancient") out.push({ x: u.x, y: u.y, r: TOWER_SIGHT });
    }
    for (const w of this.wards) {
      if (w.team === team) out.push({ x: w.x, y: w.y, r: w.r });
    }
    this.sightCache[team] = out;
    return out;
  }

  /** Camp creep already locked, in range, and in team vision. Abilities use this, not a hidden hero. */
  private campAttack(u: Unit): Unit | undefined {
    if (u.target === null) return undefined;
    const t = this.byId(u.target);
    if (!t || t.dead || !t.wild || t.kind !== "minion" || t.objectiveId) return undefined;
    if (!this.sees(u.team, t.x, t.y)) return undefined;
    if (dist(u, t) > u.range + t.r + 8) return undefined;
    return t;
  }

  private lastHitTarget(u: Unit, tight = false): Unit | undefined {
    let best: Unit | undefined;
    const pad = tight ? 8 : 24;
    for (const e of this.living()) {
      if (e.kind !== "minion" || (!e.wild && e.team === u.team)) continue;
      if (u.kind === "hero" && !this.sees(u.team, e.x, e.y)) continue;
      if (dist(u, e) > u.range + 40) continue;
      if (e.hp <= u.damage + pad) {
        if (!best || e.hp < best.hp) best = e;
      }
    }
    return best;
  }

  private denyTarget(u: Unit): Unit | undefined {
    let best: Unit | undefined;
    for (const e of this.living()) {
      if (e.kind !== "minion" || e.wild || e.team !== u.team) continue;
      if (dist(u, e) > u.range + 24) continue;
      if (e.hp <= u.damage + 6) {
        if (!best || e.hp < best.hp) best = e;
      }
    }
    return best;
  }

  private closestEnemyTower(u: Unit, range: number): Unit | undefined {
    let best: Unit | undefined;
    let bestD = range;
    for (const e of this.living()) {
      if ((e.kind !== "tower" && e.kind !== "ancient") || e.team === u.team) continue;
      if (!this.structureOpen(e)) continue;
      const d = dist(u, e);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private laneTower(team: Team, lane: Lane, tier: TowerTier): Unit | undefined {
    return this.units.find((u) => u.kind === "tower" && u.team === team && u.lane === lane && u.towerTier === tier);
  }

  /** The living tower that still blocks this one. A missing middle tier falls through to the outer. */
  private blockingTier(t: Unit): TowerTier | null {
    if (t.kind !== "tower" || !t.lane || !t.towerTier || t.towerTier === "outer") return null;
    let need: TowerTier = t.towerTier === "middle" ? "outer" : "middle";
    while (true) {
      const prev = this.laneTower(t.team, t.lane, need);
      if (prev && !prev.dead) return need;
      if (prev || need === "outer") return null;
      need = "outer";
    }
  }

  private structureOpen(t: Unit): boolean {
    if (t.kind === "ancient") {
      return this.units.some((u) => u.kind === "tower" && u.team === t.team && u.towerTier === "inner" && u.dead);
    }
    return this.blockingTier(t) === null;
  }

  private noteGate(t: Unit, src?: Unit): void {
    if (!src?.player) return;
    if (this.clock - this.gateNoteT < 1.8) return;
    this.gateNoteT = this.clock;
    const block = t.kind === "tower" ? this.blockingTier(t) : null;
    this.banner =
      t.kind === "ancient"
        ? "Take an inner tower before the town."
        : block === "middle"
          ? "Take the middle tower on this street first."
          : "Take the outer tower on this street first.";
    this.bannerT = 1.7;
  }

  private enemyCover(u: Unit): Unit | undefined {
    for (const t of this.living()) {
      if ((t.kind !== "tower" && t.kind !== "ancient") || t.team === u.team) continue;
      if (dist(u, t) < t.range - 16) return t;
    }
    return undefined;
  }

  private alliedWaveAt(u: Unit, t: Unit): number {
    let n = 0;
    for (const m of this.living()) {
      if (m.kind !== "minion" || m.team !== u.team) continue;
      if (dist(m, t) < t.range) n += 1;
    }
    return n;
  }

  private nearFountain(u: Unit): boolean {
    return dist(u, fountain[u.team]) < 210;
  }

  private popGold(u: Unit, n: number, hot: boolean): void {
    if (n <= 0) return;
    this.floats.push({
      x: u.x + 8,
      y: u.y - 26,
      text: `+${Math.floor(n)}g`,
      life: hot ? 1 : 0.75,
      color: hot ? "#f0c14a" : "#b8f0a0",
    });
  }

  private xpNeed(p: Unit | undefined): number {
    if (!p || p.level >= 11) return 0;
    return Math.max(0, (XP[p.level] ?? 0) - p.xp);
  }

  private xpPct(p: Unit | undefined): number {
    if (!p || p.level >= 11) return 1;
    const prev = XP[p.level - 1] ?? 0;
    const next = XP[p.level] ?? prev + 1;
    const span = Math.max(1, next - prev);
    return Math.max(0, Math.min(1, (p.xp - prev) / span));
  }

  private heatLine(p: Unit | undefined): string {
    if (!p) return "Last-hit · buy · take a tower";
    const bits: string[] = [`CS ${p.cs}`];
    if (p.streak >= 2) bits.push(`${p.streak} streak`);
    if (p.level < 11) {
      const need = this.xpNeed(p);
      bits.push(p.level < 6 ? `${need} XP to R` : `${need} XP to Lv${p.level + 1}`);
    }
    const missing = ITEMS.find((it) => !p.items.includes(it.id));
    if (missing) {
      const short = Math.max(0, missing.cost - p.gold);
      bits.push(short > 0 ? `${missing.name} ${short}g short` : `Buy ${missing.name}`);
    } else if (!this.firstTower) bits.push("First tower");
    else bits.push("Push the town");
    if (p.kind === "hero" && p.heat > 0) bits.unshift(`${this.kitOf(p).stack} ${p.heat}/${p.heatMax}`);
    return bits.slice(0, 4).join(" · ");
  }

  private pushFeed(text: string): void {
    this.feed.unshift({ text, t: this.time });
    this.feed = this.feed.filter((f) => this.time - f.t < 8).slice(0, 6);
  }

  private burst(x: number, y: number, color: string, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 40 + Math.random() * 140;
      this.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, color, s: 2 + Math.random() * 3 });
    }
    if (this.parts.length > 420) this.parts.splice(0, this.parts.length - 420);
  }

  private compactLife<T extends { life: number }>(list: T[], dt: number, step?: (item: T) => void, cap = 0): void {
    let w = 0;
    for (let i = 0; i < list.length; i++) {
      const item = list[i]!;
      item.life -= dt;
      if (item.life <= 0) continue;
      if (step) step(item);
      list[w++] = item;
    }
    list.length = w;
    if (cap > 0 && list.length > cap) list.splice(0, list.length - cap);
  }

  private tickFx(dt: number): void {
    this.compactLife(this.parts, dt, (p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }, 420);
    this.compactLife(this.floats, dt, (f) => {
      f.y -= 22 * dt;
    }, 96);
    this.compactLife(this.rings, dt, undefined, 40);
    for (const puff of this.puffs) {
      if (puff.life > 0) puff.life -= dt;
    }
  }

  private fmt(t: number): string {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  private resize(): void {
    if (this.headless) return;
    const lite = this.demo;
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5);
    let w: number;
    let h: number;
    if (this.bound) {
      const r = this.canvas.getBoundingClientRect();
      w = Math.max(1, r.width || 640);
      h = Math.max(1, r.height || 360);
    } else {
      w = Math.max(1, window.innerWidth);
      h = Math.max(1, window.innerHeight);
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    }
    if (this.canvas.width !== Math.floor(w * dpr) || this.canvas.height !== Math.floor(h * dpr)) {
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);
    }
    this.w = w;
    this.h = h;
    this.zoom = this.followStars ? 0.74 : this.watch ? 0.7 : w < 800 ? 0.78 : 0.92;
  }

  private draw(ambience: boolean): void {
    if (this.headless) return;
    const { ctx } = this;
    const lite = ambience || this.demo;
    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = lite ? "low" : "medium";
    ctx.fillStyle = "#3c5c32";
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.save();
    ctx.translate(this.w / 2, this.h / 2);
    ctx.scale(this.zoom, this.zoom);
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * 14 * this.shake, (Math.random() - 0.5) * 14 * this.shake);
      this.shake = Math.max(0, this.shake - 0.045);
    }
    ctx.translate(-this.camX, -this.camY);
    const hw = this.w / (2 * this.zoom);
    const hh = this.h / (2 * this.zoom);
    drawQuadWorld(ctx, this.time, { x: this.camX, y: this.camY, hw, hh, lite });
    if (!ambience) this.drawBattlefield();
    if (!ambience) this.drawFog();
    if (this.marker && !ambience) drawMoveMarker(ctx, this.marker.x, this.marker.y, this.time);
    const pad = 90;
    const drawUnits = this.drawScratch;
    drawUnits.length = 0;
    for (const u of this.units) {
      const corpse = u.kind === "minion" && u.dead && u.barkT > 0;
      if (u.dead && u.kind !== "tower" && u.kind !== "ancient" && !(u.kind === "hero" && u.barkT > 0) && !corpse) continue;
      if (!ambience && !this.viewerSeesUnit(u)) continue;
      if (Math.abs(u.x - this.camX) >= hw + pad || Math.abs(u.y - this.camY) >= hh + pad) continue;
      drawUnits.push(u);
    }
    drawUnits.sort((a, b) => a.y - b.y);
    for (const u of drawUnits) {
      if (this.followStars && u.kind === "hero" && !u.dead && u.handle === this.starHandle) {
        ctx.save();
        ctx.strokeStyle = "rgba(240,193,74,0.9)";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(u.x, u.y + 10, u.r * 1.45, u.r * 0.58, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      const veil = u.kind === "hero" && this.veiledFromViewer(u);
      if (veil) ctx.globalAlpha = 0.22;
      this.drawUnit(u, ambience);
      if (veil) ctx.globalAlpha = 1;
      if (u.objectiveId && !u.dead) {
        ctx.fillStyle = "#f0c14a";
        ctx.font = "700 12px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(u.name, u.x, u.y - u.r - 18);
        ctx.textAlign = "left";
      }
    }
    if (!ambience) this.drawAimMarks();
    for (const ring of this.rings) {
      drawCastRing(ctx, ring.x, ring.y, ring.r, ring.life / ring.max, ring.color, ring.kind, ring.heroId);
    }
    for (const s of this.shots) {
      if (!ambience && s.team !== this.viewTeam() && !this.visibleNow(this.viewTeam(), s.x, s.y)) continue;
      drawBolt(ctx, s.x, s.y, s.tx, s.ty, s.color, s.heroId, s.ammo, s.team, s.source, this.time);
    }
    for (const puff of this.puffs) {
      if (puff.life > 0) drawShotImpact(ctx, puff.x, puff.y, puff.look, puff.life);
    }
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.parts) {
      if (Math.abs(p.x - this.camX) > hw + 48 || Math.abs(p.y - this.camY) > hh + 48) continue;
      const a = clamp(p.life / 0.45, 0, 1);
      const s = Math.max(2, Math.round(p.s * 2));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = "#fff8e0";
      ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) + 1, Math.max(1, s - 2), Math.max(1, s - 2));
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    for (const f of this.floats) {
      ctx.globalAlpha = clamp(f.life / (f.color === "#ffe08a" ? 0.55 : 0.9), 0, 1);
      ctx.fillStyle = f.color;
      ctx.font = f.color === "#ffe08a" ? "600 13px 'IBM Plex Mono', monospace" : "700 14px 'IBM Plex Mono', monospace";
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    this.drawPhaseWash();
    filmic(ctx, this.w, this.h, this.time, lite);
    if (!lite) this.drawMinimap();
    quadBadge(ctx, this.w - 166, 14);
    if (this.killLine) {
      const callUp = this.bannerT > 0 && this.banner.length > 0;
      drawScreenBark(ctx, this.killLine, this.w, this.h, this.killLineTeam, callUp ? -screenCallShift(this.w) : 0);
    }
  }

  private drawAimMarks(): void {
    if (this.spec || this.demo || (this.watch && this.autoplay)) return;
    const p = this.player();
    if (!p || p.dead) {
      this.canvas.style.cursor = "crosshair";
      return;
    }
    const mouse = this.input.world();
    const primed = this.input.attackMove;
    const hover = this.pickChoose(p, mouse.x, mouse.y, primed ? 72 : 52);
    const locked = p.lockOn && p.target !== null ? this.byId(p.target) : undefined;
    if (hover && hover.id !== locked?.id) {
      drawTargetMark(this.ctx, hover.x, hover.y, hover.r, primed, this.time);
    }
    if (locked && !locked.dead) {
      drawTargetMark(this.ctx, locked.x, locked.y, locked.r, true, this.time);
    }
    this.canvas.style.cursor = primed || hover ? "pointer" : "crosshair";
  }

  private drawUnit(u: Unit, ambience: boolean): void {
    const walking = u.moved && u.fx.stun <= 0;
    drawSprite(
      this.ctx,
      {
        ...u,
        facing: u.face,
        mana: u.mana,
        maxMana: u.maxMana,
        time: this.time,
        walk: walking,
        walkRate: (Math.max(160, u.ms) / 270) * (u.fx.slow > 0 ? 0.55 : 1),
        stride: strideBlend(u.id, walking, this.time, u.dead),
        swing: u.period > 0 ? 1 - u.atk / u.period : 0,
        beat: u.beat,
        burst: u.burstAge,
        dash: u.dashMark,
        cast: u.castT,
        ult: u.castUlt && u.castT > 0,
        hurt: u.hurtT,
        shield: u.fx.shield > 0,
        stunned: u.fx.stun > 0,
        slowed: u.fx.slow > 0,
      },
      ambience,
    );
  }

  /** Woods, tracks, lanes, and pools. Rebuilt only when the minimap size changes. */
  private minimapPlate(size: number): HTMLCanvasElement | null {
    const px = Math.max(1, Math.round(size));
    if (this.miniPlate && this.miniPlateSize === px) return this.miniPlate;
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = px;
    c.height = px;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const sx = px / WORLD;
    const biome = ctx.createLinearGradient(0, px, px, 0);
    biome.addColorStop(0, "#3a5a32");
    biome.addColorStop(0.5, "#243828");
    biome.addColorStop(1, "#16302c");
    ctx.fillStyle = biome;
    ctx.fillRect(0, 0, px, px);
    ctx.save();
    ctx.translate(1300 * sx, 1300 * sx);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#2a6a78";
    ctx.fillRect(-px * 0.55, -6, px * 1.1, 12);
    ctx.restore();
    for (const w of WOODS) {
      ctx.save();
      ctx.translate(w.x * sx, w.y * sx);
      ctx.rotate(w.rot);
      ctx.fillStyle = w.fir ? "rgba(8, 36, 32, 0.85)" : "rgba(22, 48, 16, 0.82)";
      ctx.beginPath();
      ctx.ellipse(0, 0, w.rx * sx, w.ry * sx, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const t of BACK_TRACKS) {
      const rank = trackRank(t.name);
      const fir = t.path[0]!.x + t.path[0]!.y > WORLD;
      ctx.strokeStyle = rank === "primary" ? (fir ? "#5ad4c8" : "#c9a24a") : "#7a5630";
      ctx.lineWidth = rank === "primary" ? 2.6 : rank === "gank" ? 1.5 : 1;
      ctx.setLineDash(rank === "primary" ? [] : rank === "gank" ? [3, 3] : [2, 5]);
      ctx.globalAlpha = rank === "flank" ? 0.7 : 1;
      ctx.beginPath();
      ctx.moveTo(t.path[0]!.x * sx, t.path[0]!.y * sx);
      for (let i = 1; i < t.path.length; i++) ctx.lineTo(t.path[i]!.x * sx, t.path[i]!.y * sx);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.strokeStyle = "#c4a06a";
    ctx.lineWidth = 3.5;
    for (const lane of LANES) {
      const path = lanePath.home[lane];
      ctx.beginPath();
      ctx.moveTo(path[0]!.x * sx, path[0]!.y * sx);
      for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x * sx, path[i]!.y * sx);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(142, 198, 232, 0.85)";
    ctx.beginPath();
    ctx.arc(fountain.home.x * sx, fountain.home.y * sx, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(62, 200, 193, 0.85)";
    ctx.beginPath();
    ctx.arc(fountain.away.x * sx, fountain.away.y * sx, 7, 0, Math.PI * 2);
    ctx.fill();
    for (const camp of JUNGLE_CAMPS) {
      ctx.fillStyle = camp.fir ? "#3ec8c1" : "#c9a24a";
      ctx.beginPath();
      ctx.arc(camp.x * sx, camp.y * sx, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a120c";
      ctx.beginPath();
      ctx.arc(camp.x * sx, camp.y * sx, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    this.miniPlate = c;
    this.miniPlateSize = px;
    return c;
  }

  private drawMinimap(): void {
    const { ctx } = this;
    const size = Math.min(196, this.w * 0.28);
    const x = 14;
    const y = this.h - size - 14;
    ctx.fillStyle = "rgba(8,10,8,0.88)";
    ctx.fillRect(x - 3, y - 3, size + 6, size + 6);
    ctx.strokeStyle = "rgba(240,193,74,0.45)";
    ctx.strokeRect(x - 3, y - 3, size + 6, size + 6);
    const sx = size / WORLD;
    ctx.save();
    ctx.translate(x, y);
    const plate = this.minimapPlate(size);
    if (plate) ctx.drawImage(plate, 0, 0, size, size);
    this.paintMinimapFog(size);
    for (const u of this.units) {
      if (u.dead && u.kind === "hero") continue;
      if (u.dead && u.kind === "minion" && !u.wild) continue;
      if (!this.viewerSeesUnit(u)) continue;
      ctx.fillStyle = u.kind === "hero" ? u.color : u.wild ? "#8a5a28" : u.team === "home" ? "#3d7ea6" : "#a63d3d";
      const r = u.kind === "hero" ? 4.8 : u.wild ? 2.2 : u.kind === "minion" ? 1.6 : 2.6;
      ctx.beginPath();
      ctx.arc(u.x * sx, u.y * sx, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(239,236,227,0.7)";
    ctx.lineWidth = 1;
    const vw = (this.w / this.zoom) * sx;
    const vh = (this.h / this.zoom) * sx;
    ctx.strokeRect(this.camX * sx - vw / 2, this.camY * sx - vh / 2, vw, vh);
    ctx.font = "700 10px 'IBM Plex Mono', monospace";
    const team = this.viewTeam();
    if (this.explored(team, fountain.home.x, fountain.home.y)) {
      ctx.fillStyle = "#c4161c";
      ctx.fillText("DC", fountain.home.x * sx - 8, fountain.home.y * sx + 16);
    }
    if (this.explored(team, fountain.away.x, fountain.away.y)) {
      ctx.fillStyle = "#3ec8c1";
      ctx.fillText("SEA", fountain.away.x * sx - 10, fountain.away.y * sx + 16);
    }
    const pit = this.units.find((u) => u.objectiveId && !u.dead && this.visibleNow(team, u.x, u.y));
    if (pit) {
      ctx.fillStyle = "#f0c14a";
      ctx.fillRect(pit.x * sx - 3, pit.y * sx - 3, 6, 6);
    }
    ctx.restore();
  }

  private tickBattlefield(): void {
    const actions = this.bf.step(this.clock, this.deadTowers());
    for (const action of actions) this.applyBf(action);
    if (this.bannerT <= 0 && this.holdCallT <= 0 && this.bfQueue.length) {
      const line = this.bfQueue.shift() ?? "";
      if (!line) return;
      this.banner = line;
      this.bannerT = 3.4;
      this.pushFeed(line);
      if (!this.demo) this.sfx.phase();
    }
  }

  private deadTowers(): number {
    let n = 0;
    for (const u of this.units) if (u.kind === "tower" && u.dead) n += 1;
    return n;
  }

  private applyBf(action: BfAction): void {
    if (action.type === "announce") {
      this.bfQueue.push(action.line);
      return;
    }
    if (action.type === "empowerJungle") {
      const mul = BATTLEFIELD.jungleEmpower;
      for (const u of this.units) {
        if (!u.wild || u.objectiveId) continue;
        u.maxHp = Math.round(u.maxHp * mul.hp);
        u.hp = Math.min(u.maxHp, Math.round(u.hp * mul.hp));
        u.damage = Math.round(u.damage * mul.dmg);
        u.gold = Math.round(u.gold * mul.gold);
      }
      return;
    }
    if (action.type === "spawn") {
      this.spawnObjective(action.camp);
      return;
    }
    if (action.type === "empowerObjective") {
      const live = this.units.find((u) => u.objectiveId === action.from);
      if (live) {
        this.becomeObjective(live, action.into);
        this.sfx.objective(this.hear(live));
      } else this.spawnObjective(action.into);
    }
  }

  private spawnObjective(spec: CampSpec): void {
    if (this.units.some((u) => u.objectiveId === spec.id && !u.dead)) return;
    const u = this.baseUnit("minion", "home", spec.name, spec.x, spec.y, spec.r, null);
    this.becomeObjective(u, spec);
    this.units.push(u);
    this.burst(spec.x, spec.y, "#f0c14a", 20);
    const distCam = Math.hypot(spec.x - this.camX, spec.y - this.camY);
    this.sfx.objective(clamp(1.05 - distCam / 800, 0.2, 1));
  }

  private becomeObjective(u: Unit, spec: CampSpec): void {
    u.name = spec.name;
    u.objectiveId = spec.id;
    u.wild = true;
    u.homeX = spec.x;
    u.homeY = spec.y;
    u.x = spec.x;
    u.y = spec.y;
    u.r = spec.r;
    u.maxHp = spec.hp;
    u.hp = spec.hp;
    u.damage = spec.damage;
    u.gold = spec.gold;
    u.xpWorth = spec.xp;
    u.respawnMax = spec.respawn;
    u.leash = spec.leash;
    u.sense = spec.sense;
    u.range = 86;
    u.period = 1.05;
    u.ms = 200;
    u.melee = true;
    u.color = spec.tier === "ancient" ? "#c4161c" : spec.tier === "major" ? "#f0c14a" : spec.fir ? "#3ec8c1" : "#c9a24a";
    u.dead = false;
    u.target = null;
    u.path = [];
  }

  private onObjectiveDown(t: Unit, src?: Unit): void {
    const team = src && !src.wild ? src.team : undefined;
    let gold = t.gold || 80;
    const behind = team ? this.towersLeft(team) < this.towersLeft(team === "home" ? "away" : "home") : false;
    if (behind) gold = Math.round(gold * BATTLEFIELD.behindGold);
    if (src && team && (src.kind === "hero" || src.kind === "minion")) {
      const hero = src.kind === "hero" ? src : this.units.find((u) => u.kind === "hero" && u.team === team && !u.dead);
      if (hero) {
        hero.gold += gold;
        this.popGold(hero, gold, true);
      }
      this.giveXp(t.x, t.y, team, t.xpWorth || 120);
      const spec = campById(t.objectiveId);
      const share = Math.round((spec?.teamGold ?? 0) * (behind ? BATTLEFIELD.behindGold : 1));
      const boon = spec?.boon ?? 0;
      const boonDmg = spec?.boonDamage ?? 0;
      for (const u of this.units) {
        if (u.kind !== "hero" || u.dead || u.team !== team) continue;
        if (share > 0 && (!hero || u.id !== hero.id)) {
          u.gold += share;
          if (u.player) this.popGold(u, share, true);
        }
        if (boon > 0) {
          u.boonT = Math.max(u.boonT, boon);
          u.boonDmg = Math.max(u.boonDmg, boonDmg);
        }
      }
    }
    const line = behind ? `${t.name} is down. The trailing side takes the bounty.` : `${t.name} is down.`;
    this.bfQueue.push(line);
    this.pushFeed(line);
    this.burst(t.x, t.y, "#f0c14a", 28);
    this.shake = Math.max(this.shake, 0.5);
    this.sfx.tower(this.hear(t));
  }

  private towersLeft(team: Team): number {
    let n = 0;
    for (const u of this.units) if (u.kind === "tower" && u.team === team && !u.dead) n += 1;
    return n;
  }

  private tickWards(dt: number): void {
    this.wards = this.wards.filter((w) => {
      w.life -= dt;
      return w.life > 0;
    });
  }

  private useConsume(u: Unit, kind: "ward" | "smoke"): void {
    if (kind === "ward") {
      this.wards.push({ x: u.x, y: u.y, team: u.team, life: BATTLEFIELD.wardLife, r: BATTLEFIELD.wardRadius });
      this.floats.push({ x: u.x, y: u.y - 24, text: "WARD", life: 0.8, color: "#f0c14a" });
      this.burst(u.x, u.y, "#ffe08a", 8);
      return;
    }
    u.stealthT = 5;
    this.floats.push({ x: u.x, y: u.y - 24, text: "SMOKE", life: 0.8, color: "#d0d4dc" });
  }

  private touchShrine(u: Unit): void {
    for (const s of SHRINE_SPOTS) {
      if (dist(u, s) > BATTLEFIELD.shrineRadius) continue;
      u.shrineCd = BATTLEFIELD.shrineCd;
      u.fx.shield = Math.max(u.fx.shield, BATTLEFIELD.shrineShield);
      this.floats.push({ x: u.x, y: u.y - 30, text: s.name.toUpperCase(), life: 0.8, color: "#f0c14a" });
      this.burst(u.x, u.y, "#f0c14a", 10);
      return;
    }
  }

  private shelfNote(): string {
    if (this.bf.shopPhase === "end") return "End shelf is open.";
    if (this.bf.shopPhase === "late") return "Late shelf is open.";
    if (this.bf.shopPhase === "mid") return "Mid shelf is open. Wards, smoke, and actives.";
    return "Opening shelf. Plates, splash, crit, bash.";
  }

  private objectiveLine(): string {
    const live = this.units.find((u) => u.objectiveId && !u.dead);
    if (live) return `${live.name} is up`;
    const dead = this.units.find((u) => u.objectiveId && u.dead);
    if (dead) return `${dead.name} · ${Math.ceil(dead.respawn)}s`;
    if (this.bf.fired.has("ancient-warn") && !this.bf.fired.has("ancient")) return "The Ancient is waking";
    if (this.bf.fired.has("shrine-warn") && !this.bf.fired.has("shrines")) return "Shrines are stirring";
    return "";
  }

  private nearRuin(u: Unit): boolean {
    for (const t of this.units) {
      if (t.kind !== "tower" || !t.dead) continue;
      if (dist(u, t) <= BATTLEFIELD.routeRadius) return true;
    }
    return false;
  }

  private hillArmor(u: Unit): number {
    const hill = ancientPos[u.team];
    if (dist(u, hill) > BATTLEFIELD.hillRadius) return 0;
    const behind = this.towersLeft(u.team) < this.towersLeft(u.team === "home" ? "away" : "home");
    return BATTLEFIELD.hillArmor + (behind ? BATTLEFIELD.behindArmor : 0);
  }

  private offerMile(u: Unit): void {
    const pair = perksFor(u.level, heroById(u.heroId ?? "riot").attr);
    if (!pair) return;
    if (u.perks.some((id) => id === pair[0].id || id === pair[1].id)) return;
    const auto = !u.player || this.autoplay || this.watch || this.spec || this.demo;
    if (auto) {
      const attr = heroById(u.heroId ?? "riot").attr;
      this.applyPerk(u, attr === "agi" ? pair[1] : pair[0]);
      return;
    }
    if (this.mile && this.mile.id === u.id) this.applyPerk(u, this.mile.a);
    this.mile = { id: u.id, a: pair[0], b: pair[1] };
  }

  private applyPerk(u: Unit, perk: Perk): void {
    if (u.perks.includes(perk.id)) return;
    u.perks.push(perk.id);
    this.applyItems(u);
    this.burst(u.x, u.y, "#f0c14a", 12);
    if (u.player) this.pushFeed(`${u.name} · ${perk.name}`);
  }

  private foldPerks(u: Unit): void {
    u.spellAmp = 1;
    u.ultAmp = 1;
    u.cdMul = 1;
    u.castHeal = 0;
    u.slowOnHit = 0;
    for (const id of u.perks) {
      const perk = perkById(id);
      if (!perk) continue;
      u.maxHp += perk.hp ?? 0;
      u.damage += perk.damage ?? 0;
      u.armor += perk.armor ?? 0;
      u.baseMs += perk.ms ?? 0;
      u.manaRegen += perk.manaRegen ?? 0;
      if (perk.spellAmp) u.spellAmp *= perk.spellAmp;
      if (perk.ultAmp) u.ultAmp *= perk.ultAmp;
      if (perk.cdMul) u.cdMul *= perk.cdMul;
      u.castHeal += perk.castHeal ?? 0;
      u.slowOnHit = Math.max(u.slowOnHit, perk.slowOnHit ?? 0);
    }
    u.hp = Math.min(u.hp, u.maxHp);
  }

  private revealedAt(x: number, y: number, team: Team): boolean {
    for (const u of this.units) {
      if (u.dead || u.team !== team) continue;
      if (u.kind === "hero" && dist(u, { x, y }) <= BATTLEFIELD.woodsReveal) return true;
      if (u.kind === "hero" && u.trueSight > 0 && dist(u, { x, y }) <= u.trueSight) return true;
      if ((u.kind === "tower" || u.kind === "ancient") && dist(u, { x, y }) <= BATTLEFIELD.towerVision) return true;
    }
    for (const w of this.wards) {
      if (w.team === team && Math.hypot(w.x - x, w.y - y) <= w.r) return true;
    }
    for (const u of this.units) {
      if (u.dead || !u.objectiveId) continue;
      if (dist(u, { x, y }) <= BATTLEFIELD.objectiveVision) return true;
    }
    if (this.bf.shrines) {
      const f = fountain[team];
      if (dist({ x, y }, f) <= BATTLEFIELD.shrineRadius + 80) return true;
    }
    return false;
  }

  private veiled(seeker: Unit, target: Unit): boolean {
    if (target.kind !== "hero" || target.dead || target.team === seeker.team) return false;
    const hidden =
      target.stealthT > 0 ||
      (this.bf.phase !== "early" && Boolean(inWoods(target.x, target.y))) ||
      hideoutBreaksSight(seeker.x, seeker.y, target.x, target.y);
    if (!hidden) return false;
    if (this.revealedAt(target.x, target.y, seeker.team)) return false;
    return dist(seeker, target) > 86;
  }

  private veiledFromViewer(target: Unit): boolean {
    if (this.watch || this.spec || this.demo) return false;
    const viewer = this.player();
    if (!viewer) return false;
    return this.veiled(viewer, target);
  }

  private drawBattlefield(): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const viewer = this.viewTeam();
    if (this.bf.shrines) {
      for (const s of SHRINE_SPOTS) {
        if (!this.explored(viewer, s.x, s.y)) continue;
        const pulse = 8 + Math.round((Math.sin(this.time * 3 + s.x) + 1) * 2);
        ctx.fillStyle = "rgba(240, 193, 74, 0.85)";
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.fillRect(Math.round(s.x + Math.cos(a) * 36) - 2, Math.round(s.y + Math.sin(a) * 18) - 2, pulse > 9 && i % 2 === 0 ? 6 : 4, 4);
        }
      }
    }
    if ((this.bf.warnPit || this.units.some((u) => u.objectiveId)) && this.explored(viewer, 1300, 1300)) {
      const x = 1300;
      const y = 1300;
      ctx.fillStyle = this.bf.phase === "end" ? "#c4161c" : "#f0c14a";
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + this.time * 0.4;
        ctx.fillRect(Math.round(x + Math.cos(a) * 48) - 3, Math.round(y + Math.sin(a) * 28) - 3, 6, 6);
      }
    }
    for (const w of this.wards) {
      if (w.team !== viewer && !this.visibleNow(viewer, w.x, w.y)) continue;
      ctx.fillStyle = w.team === "home" ? "#f0c14a" : "#3ec8c1";
      ctx.fillRect(Math.round(w.x) - 3, Math.round(w.y) - 10, 6, 10);
      ctx.fillStyle = "#fff8e0";
      ctx.fillRect(Math.round(w.x) - 2, Math.round(w.y) - 14, 4, 4);
    }
    ctx.restore();
  }

  private resetFog(): void {
    this.fogStampAt = -1;
    this.sightCache.home = null;
    this.sightCache.away = null;
    for (const team of ["home", "away"] as const) {
      this.fogSeen[team].fill(0);
      this.fogNow[team].fill(0);
      this.fogAlpha[team].fill(0.86);
    }
  }

  private tickFog(dt: number): void {
    const stamp = this.fogStampAt < 0 || this.time - this.fogStampAt >= 0.1;
    if (stamp) {
      this.fogStampAt = this.time;
      this.sightCache.home = null;
      this.sightCache.away = null;
      for (const team of ["home", "away"] as const) {
        const now = this.fogNow[team];
        now.fill(0);
        const seen = this.fogSeen[team];
        for (const sight of this.sightsFor(team)) this.stampDisc(now, seen, sight.x, sight.y, sight.r);
      }
    }
    const k = 1 - Math.exp(-dt * 5);
    for (const team of ["home", "away"] as const) {
      const now = this.fogNow[team];
      const seen = this.fogSeen[team];
      const alpha = this.fogAlpha[team];
      for (let i = 0; i < alpha.length; i++) {
        const target = now[i] ? 0 : seen[i] ? 0.46 : 0.86;
        const next = alpha[i]! + (target - alpha[i]!) * k;
        alpha[i] = next;
      }
    }
  }

  private stampDisc(now: Uint8Array, seen: Uint8Array, x: number, y: number, r: number): void {
    if (!(r > 0)) return;
    const cr = Math.ceil(r / CELL);
    const ccx = Math.floor(x / CELL);
    const ccy = Math.floor(y / CELL);
    const r2 = r * r;
    for (let cy = ccy - cr; cy <= ccy + cr; cy++) {
      if (cy < 0 || cy >= CELLS) continue;
      for (let cx = ccx - cr; cx <= ccx + cr; cx++) {
        if (cx < 0 || cx >= CELLS) continue;
        const wx = cx * CELL + CELL / 2;
        const wy = cy * CELL + CELL / 2;
        const dx = wx - x;
        const dy = wy - y;
        if (dx * dx + dy * dy > r2) continue;
        const i = cy * CELLS + cx;
        now[i] = 1;
        seen[i] = 1;
      }
    }
  }

  private fogIndex(x: number, y: number): number {
    const cx = Math.floor(x / CELL);
    const cy = Math.floor(y / CELL);
    if (cx < 0 || cy < 0 || cx >= CELLS || cy >= CELLS) return -1;
    return cy * CELLS + cx;
  }

  private visibleNow(team: Team, x: number, y: number): boolean {
    const i = this.fogIndex(x, y);
    return i >= 0 && this.fogNow[team][i] === 1;
  }

  private explored(team: Team, x: number, y: number): boolean {
    const i = this.fogIndex(x, y);
    return i >= 0 && this.fogSeen[team][i] === 1;
  }

  private viewTeam(): Team {
    const player = this.player();
    if (player) return player.team;
    const focus = this.camTarget();
    return focus?.team ?? "home";
  }

  private viewerSeesUnit(u: Unit): boolean {
    const team = this.viewTeam();
    if (u.wild) return this.visibleNow(team, u.x, u.y);
    if (u.team === team) return true;
    if (u.kind === "tower" || u.kind === "ancient") return this.explored(team, u.x, u.y);
    if (u.kind === "hero" && this.veiledFromViewer(u)) return false;
    return this.visibleNow(team, u.x, u.y);
  }

  private ensureFogSheet(): ImageData | null {
    if (this.fogPixels && this.fogCanvas && this.fogCtx) return this.fogPixels;
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = CELLS;
    c.height = CELLS;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) return null;
    this.fogCanvas = c;
    this.fogCtx = g;
    this.fogPixels = g.createImageData(CELLS, CELLS);
    return this.fogPixels;
  }

  /** One reused ImageData. The world and minimap both blit this sheet. */
  private paintFogSheet(team: Team): boolean {
    const img = this.ensureFogSheet();
    const g = this.fogCtx;
    if (!img || !g) return false;
    const alpha = this.fogAlpha[team];
    const data = img.data;
    for (let i = 0; i < alpha.length; i++) {
      const a = alpha[i] ?? 0;
      const o = i * 4;
      data[o] = 4;
      data[o + 1] = 8;
      data[o + 2] = 14;
      data[o + 3] = a < 0.04 ? 0 : Math.round(a * 255);
    }
    g.putImageData(img, 0, 0);
    return true;
  }

  private drawFog(): void {
    if (!this.paintFogSheet(this.viewTeam()) || !this.fogCanvas) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.fogCanvas, 0, 0, WORLD, WORLD);
    ctx.restore();
  }

  private paintMinimapFog(size: number): void {
    if (!this.fogCanvas) this.paintFogSheet(this.viewTeam());
    if (!this.fogCanvas) return;
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.fogCanvas, 0, 0, size, size);
  }

  private drawPhaseWash(): void {
    if (this.bf.phase === "early") return;
    const ctx = this.ctx;
    ctx.save();
    const band = this.bf.phase === "end" ? 46 : this.bf.phase === "late" ? 34 : 18;
    ctx.fillStyle = this.bf.phase === "end" ? "rgba(18, 8, 28, 0.28)" : this.bf.phase === "late" ? "rgba(8, 16, 28, 0.2)" : "rgba(40, 28, 8, 0.12)";
    ctx.fillRect(0, 0, this.w, band);
    ctx.fillRect(0, this.h - band, this.w, band);
    ctx.restore();
  }
}
