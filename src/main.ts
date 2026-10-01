import "./style.css";
import { syncShell } from "./shell";
import { clanLabel, drawSix, hitCount, HOUSE_CLANS, LOTTO_TICKET_MLX, lottoPrize, type Clan, type Ticket } from "./campus";
import { bootLottoSandbox, isLottoTestMode } from "./lottoSandbox";
import { bootWheelSandbox, isWheelTestMode } from "./wheelSandbox";
import { bootAnimSandbox, bootSkinReel, isAnimMatchMode, isAnimTestMode, isSkinReelMode } from "./animSandbox";
import { bootCreepReview, isCreepReviewMode } from "./creepReview";
import { humanMayControlHooli, isHooliTestMode } from "./hooliSandbox";
import { assignMatchColors, CHAT_CAP, chatNameColor, chatTeamTag, resetChatColors, type ChatPerson } from "./chatColor";
import { CHAT_TEST_LINES, CHAT_TEST_PLAYERS, isChatTestMode } from "./chatSandbox";
import { BUNDLE_ID, DLC, bundleMlx, bundlePence, dlcHeroIds, formatGbp, isWildSkin, mlxAmt, mlxFiat, mlxOffLabel, MMA_PACK_ID, mmaPackMlx, mmaPackPence, mmaSkins, pdSkins, SKIN_PENCE, skinById, skinMlx, skinsForHero, SPEC_ID, SPEC_MLX, SPEC_NAME, WILD_PACK_ID, wildPackMlx, wildPackPence, wildSkins } from "./dlc";
import { campusDay, clampWheelIndex, drawWheel, easeOutCubic, isWheelMiss, wheelLocked, wheelSlices, wheelStop, wheelWaitLabel, WHEEL_OWNED_COINS } from "./wheel";
import { millixInvoice, millixTxId, millixAddrOk, millixPayId, MILLIX_NODE, PAYPAL_EMAIL, cardDest, payDest, clearedCopy, invoiceRail, shortNode, waitCopy, devCutOf, devCredit, netAfterDevCut, type MillixInvoice, type PayRail } from "./millix";
import { drawAtlas } from "./atlas";
import { drawFlag } from "./flag";
import { Sfx } from "./game/audio";
import { Game, type Hud } from "./game/game";
import { drawDag } from "./dag";
import { MatchDraft, freeBotIds } from "./game/draftPick";
import { CAST_AWAY, CAST_HOME, DEFAULT_KIT, HEROES, HUMAN_HEROES, ITEMS, attrLabel, authorizeHumanHero, dlcMatchKits, heroById, isDevAiOnlyHero, isMmaHero, liveHeroId, wingHeroes } from "./game/heroes";
import { bandLabel, diffLabel, diffStars, kitPatch } from "./game/kits";
import { abilityImg, artImg, heroArtUrl, itemName, promoImg } from "./game/art";
import { giftThumbUrl } from "./game/giftArt";
import { MSG_FULL, sellValueOf, stackLabel } from "./game/inventory";
import {
  GIFT_ITEMS,
  SHOP_TABS,
  activeCastNote,
  buildForHero,
  buildsInto,
  flourishLine,
  giftById,
  quotePurchase,
  searchGift,
  shopThemeForTeam,
  statSummary,
  totalCost,
  type ShopTheme,
} from "./game/giftShop";
import { drawHeroSide } from "./game/pixelPaint";
import { BetaLink } from "./betaClient";
import { Input } from "./game/input";
import { Mic, type MicChannel } from "./mic";
import { canExpertAuto, cleanHandle, defaultExpertAuto, displayHandle, handleOf } from "./handles";
import { holdPasteFocus, lastTypedField, pasteInto, typingTarget, wirePageClip, writeClip } from "./clip";
import {
  accountLine,
  handleFromAccount,
  loginEmail,
  loginSocial,
  providerLabel,
  readSession,
  signupEmail,
  type AccountSession,
} from "./account";
import { campusSides, emptySeats, emptySpecSeats, isCampusSeat, JOIN_SCRIPT, joinedCount, lockCampus, MATCH_SEATS, PLAYERS_PER_TEAM, restoreCampus, rosterWithCampus, rosterWithStars, SPEC_SCRIPT, SPEC_SEATS, specCount, type ChatLine, type ChatKind, type Seat } from "./lobby";
import { bumpRow, cleanKirk, cleanRows, emptyKirk, emptyRow, leagueKdr, leaguePts, mergeTangledBoard, parseKda, type KirkCup, type TangledRow } from "./league";
import { findIdle, hasVoted, isIdle, voteNeed, voters, VOTE_SECS, type KickVote } from "./kick";
import { FAQ, type FaqGroup } from "./faq";
import { playbookHtml } from "./playbook";
import { howtoHtml } from "./howto";
import { PATCHES, type Patch } from "./patches";
import { cleanQuests, questLine, rollQuests, streakBonus, tickQuests, FIRST_WIN_COIN, LOSS_COIN, WIN_COIN, type HeatQuest } from "./quests";
import { isTangledBrowser, tangledGoldMin, baseGoldMin, enterGoldLine, cleanTangledList } from "./tangled";
import { closeRadioList, isRadioListOpen, mountRadio, radioGesture, radioTick, setRadioMuted, SPOTIFY_LINK_GOLD } from "./radio";
import { closeDesk, isDeskOpen, mountDesk } from "./desk";
import { closeSound, isSoundOpen, mountSound, soundTick } from "./sound";
import { dismissSoundcheck, isSoundcheckOpen, mountSoundcheck, stopSoundcheck } from "./soundcheck";
import { askPrice, boardOf, clampAsk, goodsBlurb, goodsName, goodsTint, makeListing, NPC_BUY_MS, parseSku, skuKey, type Listing } from "./market";
import {
  drawHour,
  formatCountdown,
  hourEnd,
  hourId,
  hourLabel,
  hourPot,
  MLX_STAKE,
  MLX_WINNERS,
  NPC_MILLIX,
  placeWord,
  placedWinners,
  sameMillix,
  npcMillixAddr,
  payoutWord,
  type MlxDraw,
  type MlxEntry,
  type MlxPayout,
} from "./millixLotto";
import {
  ODDS,
  BET_STAKE,
  BETS_PER_MATCH,
  BETS_PER_HOUR,
  betHits,
  betHourEnd,
  betsInHour,
  markets,
  newId,
  payoutOf,
  sides,
  slipLine,
  type BetMarket,
  type BetRail,
  type BetRecord,
  type LiveBet,
} from "./bets";

const view = document.querySelector<HTMLCanvasElement>("#view")!;
const flag = document.querySelector<HTMLCanvasElement>("#flag")!;
const demoView = document.querySelector<HTMLCanvasElement>("#demo")!;
const atlasView = document.querySelector<HTMLCanvasElement>("#atlas")!;
const dagView = document.querySelector<HTMLCanvasElement>("#dag-view")!;
const fctx = flag.getContext("2d")!;
const vctx = view.getContext("2d");
const dctx = demoView.getContext("2d");
const actx = atlasView.getContext("2d")!;
const dagCtxRaw = dagView.getContext("2d");
if (!vctx || !dctx || !dagCtxRaw) throw new Error("Canvas is not available");
const dagCtx = dagCtxRaw;

syncShell();
window.addEventListener("resize", syncShell);
window.addEventListener("orientationchange", syncShell);

const sfx = new Sfx();
const demoSfx = new Sfx();
demoSfx.setMuted(true);
const mic = new Mic();
let soundArmed = false;
let entrancePlayed = false;
let holdTeam = false;
let holdAll = false;
let specMicWarn = 0;
let lastMicLine = "";

function hideEnterGate(): void {
  const gate = $("enter-gate");
  if (gate) gate.hidden = true;
}

function armSound(ev?: Event): void {
  const first = !soundArmed;
  soundArmed = true;
  hideEnterGate();
  const t = (ev?.target as HTMLElement | null) ?? null;
  const matchClick = Boolean(t?.closest("#btn-play, #btn-practice, #btn-watch, #btn-watch-wait"));
  const typing = Boolean(t?.closest("input, textarea, [contenteditable], #desk"));
  radioGesture();
  const mix = document.querySelector("#mix-out") as HTMLAudioElement | null;
  if (mix) {
    mix.muted = false;
    mix.volume = 1;
    sfx.hookMix(mix);
    const play = mix.play();
    if (play && typeof play.then === "function") play.catch(() => undefined);
  }
  void sfx.unlock().then(() => {
    if (!first || entrancePlayed || matchClick || typing) return;
    entrancePlayed = true;
    sfx.entrance();
  });
  if (page === "enter" && demoLive) {
    demoSfx.setMuted(false);
    void demoSfx.unlock().then(() => {
      demoSfx.startBattle();
      if (first) demoSfx.kitHit("riot", 1);
    });
  } else if (page !== "enter") {
    demoSfx.setMuted(true);
  }
  paintDemoCap();
}

function bootMatchAudio(): void {
  soundArmed = true;
  hideEnterGate();
  radioGesture();
  const mix = document.querySelector("#mix-out") as HTMLAudioElement | null;
  if (mix) {
    mix.muted = false;
    mix.volume = 1;
    sfx.hookMix(mix);
    const play = mix.play();
    if (play && typeof play.then === "function") play.catch(() => undefined);
  }
  demoSfx.setMuted(true);
  void sfx.unlock();
}
document.addEventListener("pointerdown", (e) => armSound(e));
document.addEventListener("keydown", (e) => armSound(e));
document.querySelector("#btn-enter-sound")?.addEventListener("click", (e) => {
  e.stopPropagation();
  armSound(e);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible" || !soundArmed) return;
  void sfx.unlock();
  if (page === "enter") void demoSfx.unlock();
});
let game: Game;
let demo: Game;
const input = new Input(view, () => game.cam());
const demoInput = new Input(demoView, () => demo.cam(), false);
game = new Game(view, vctx, input, sfx);
demo = new Game(demoView, dctx, demoInput, demoSfx, true);
let demoLive = false;
let draftBack: Page = "wait";

const DEMO_HOME = ["[AI] Rally Crimson", "[RC] Stickers", "[AI] Parade Sand", "[AI] Lawn Kelly"];
const DEMO_AWAY = ["[BRB] BikeLock", "[WPP] ZineKid", "[BRB] SprayCan", "[AI] Ice Cyan"];

type Page =
  | "enter"
  | "wait"
  | "draft"
  | "store"
  | "market"
  | "clans"
  | "lotto"
  | "lotto-sandbox"
  | "wheel-sandbox"
  | "anim-sandbox"
  | "millix"
  | "league"
  | "patch"
  | "faq"
  | "playbook"
  | "howto"
  | "play";

type Wallet = {
  coins: number;
  mlx: number;
  skins: string[];
  clan: string;
  handle: string;
  equipped: Record<string, string>;
  clans: Clan[];
  tickets: Ticket[];
  invoices: MillixInvoice[];
  devCoins: number;
  devMlx: number;
  devPaypal: number;
  devCard: number;
  specSeats: number;
  tangledUser: string;
  tangledVerified: boolean;
  tangledSaved: string[];
  tangledClaimed: string[];
  googleSignup: boolean;
  account: AccountSession | null;
  mlxHourly: MlxEntry[];
  mlxDraws: MlxDraw[];
  mlxPay: string;
  mlxEscrow: number;
  mlxPayouts: MlxPayout[];
  mlxCarry: number;
  mlxCarryFor: number;
  wheelDay: string;
  wheelDone: boolean;
  wheelLast: string;
  wheelPending: number;
  liveBets: LiveBet[];
  bets: BetRecord[];
  betLocked: boolean;
  listings: Listing[];
  stash: string[];
  marketGone: string[];
  bundleExpanded: boolean;
  kirkCup: KirkCup;
  tangledLeague: TangledRow[];
  blakeMaga: boolean;
  spotifyLinked: boolean;
  winStreak: number;
  bestWinStreak: number;
  lastWinDay: string;
  heatDay: string;
  heatQuests: HeatQuest[];
  heatMatches: number;
};

function loadMlxDraws(raw: MlxDraw[] | undefined): MlxDraw[] {
  return (raw ?? []).map((d) => ({
    hour: d.hour,
    pot: d.pot ?? 0,
    carry: d.carry ?? 0,
    roll: d.roll ?? 0,
    winners: d.winners ?? [],
  }));
}

function loadMlxCarry(parsed: Partial<Wallet>): { mlxCarry: number; mlxCarryFor: number } {
  const now = hourId();
  const carry =
    typeof parsed.mlxCarry === "number" && Number.isFinite(parsed.mlxCarry) ? Math.max(0, Math.round(parsed.mlxCarry)) : 0;
  if (typeof parsed.mlxCarryFor === "number" && Number.isFinite(parsed.mlxCarryFor)) {
    return { mlxCarry: carry, mlxCarryFor: Math.min(now, Math.max(0, Math.floor(parsed.mlxCarryFor))) };
  }
  const unpaid = (parsed.mlxHourly ?? []).filter((e) => !e.paid).map((e) => e.hour);
  const start = unpaid.length ? Math.min(now, ...unpaid) : now;
  return { mlxCarry: 0, mlxCarryFor: start };
}

function loadMlxEscrow(parsed: Partial<Wallet>): number {
  if (typeof parsed.mlxEscrow === "number" && Number.isFinite(parsed.mlxEscrow)) {
    return Math.max(0, parsed.mlxEscrow);
  }
  const unpaid = (parsed.mlxHourly ?? []).filter((e) => !e.paid).length * MLX_STAKE;
  const held = (parsed.mlxPayouts ?? [])
    .filter((p) => p.status !== "cleared")
    .reduce((sum, p) => sum + p.prize, 0);
  return unpaid + held;
}

function loadWallet(): Wallet {
  const empty: Wallet = {
    coins: 600,
    mlx: 0,
    skins: [],
    clan: "",
    handle: "",
    equipped: {},
    clans: HOUSE_CLANS.map((c) => ({ ...c })),
    tickets: [],
    invoices: [],
    devCoins: 0,
    devMlx: 0,
    devPaypal: 0,
    devCard: 0,
    specSeats: 0,
    tangledUser: "",
    tangledVerified: false,
    tangledSaved: [],
    tangledClaimed: [],
    googleSignup: false,
    account: null,
    mlxHourly: [],
    mlxDraws: [],
    mlxPay: "",
    mlxEscrow: 0,
    mlxPayouts: [],
    mlxCarry: 0,
    mlxCarryFor: hourId(),
    wheelDay: "",
    wheelDone: false,
    wheelLast: "",
    wheelPending: -1,
    liveBets: [],
    bets: [],
    betLocked: false,
    listings: [],
    stash: [],
    marketGone: [],
    bundleExpanded: false,
    kirkCup: emptyKirk(),
    tangledLeague: [],
    blakeMaga: true,
    spotifyLinked: false,
    winStreak: 0,
    bestWinStreak: 0,
    lastWinDay: "",
    heatDay: campusDay(),
    heatQuests: rollQuests(campusDay()),
    heatMatches: 0,
  };
  try {
    const raw = localStorage.getItem("cu-wallet");
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Wallet>;
    const saved = cleanTangledList(parsed.tangledSaved);
    const claimed = cleanTangledList(parsed.tangledClaimed);
    const carry = loadMlxCarry(parsed);
    return {
      coins: parsed.coins ?? 600,
      mlx: parsed.mlx ?? 0,
      skins: parsed.skins ?? [],
      clan: parsed.clan ?? "",
      handle: cleanHandle(parsed.handle ?? ""),
      equipped: parsed.equipped ?? {},
      clans: parsed.clans?.length ? parsed.clans : empty.clans,
      tickets: parsed.tickets ?? [],
      invoices: (parsed.invoices ?? []).map((inv) => ({
        ...inv,
        rail: inv.rail ?? "mlx",
      })),
      devCoins: parsed.devCoins ?? 0,
      devMlx: parsed.devMlx ?? 0,
      devPaypal: parsed.devPaypal ?? 0,
      devCard: parsed.devCard ?? 0,
      specSeats: parsed.specSeats ?? 0,
      tangledUser: "",
      tangledVerified: false,
      tangledSaved: saved,
      tangledClaimed: claimed,
      googleSignup: parsed.googleSignup === true,
      account: readSession((parsed as { account?: AccountSession }).account),
      mlxHourly: parsed.mlxHourly ?? [],
      mlxDraws: loadMlxDraws(parsed.mlxDraws),
      mlxPay: millixAddrOk(parsed.mlxPay ?? "") ? (parsed.mlxPay ?? "").trim() : "",
      mlxEscrow: loadMlxEscrow(parsed),
      mlxPayouts: parsed.mlxPayouts ?? [],
      mlxCarry: carry.mlxCarry,
      mlxCarryFor: carry.mlxCarryFor,
      wheelDay: parsed.wheelDay ?? "",
      wheelDone: parsed.wheelDay === campusDay() && parsed.wheelDone === true,
      wheelLast: parsed.wheelLast ?? "",
      wheelPending:
        parsed.wheelDay === campusDay() && typeof parsed.wheelPending === "number" && parsed.wheelPending >= 0
          ? Math.floor(parsed.wheelPending)
          : -1,
      liveBets: parsed.liveBets ?? [],
      bets: parsed.bets ?? [],
      betLocked: parsed.betLocked ?? false,
      listings: parsed.listings ?? [],
      stash: parsed.stash ?? [],
      marketGone: parsed.marketGone ?? [],
      bundleExpanded: parsed.bundleExpanded === true,
      kirkCup: cleanKirk(parsed.kirkCup),
      tangledLeague: cleanRows(parsed.tangledLeague),
      blakeMaga: parsed.blakeMaga !== false,
      spotifyLinked: parsed.spotifyLinked === true,
      winStreak: Math.max(0, parsed.winStreak ?? 0),
      bestWinStreak: Math.max(0, parsed.bestWinStreak ?? 0),
      lastWinDay: parsed.lastWinDay ?? "",
      heatDay: parsed.heatDay === campusDay() ? campusDay() : campusDay(),
      heatQuests:
        parsed.heatDay === campusDay() ? cleanQuests(parsed.heatQuests, campusDay()) : rollQuests(campusDay()),
      heatMatches: parsed.heatDay === campusDay() ? Math.max(0, parsed.heatMatches ?? 0) : 0,
    };
  } catch {
    return empty;
  }
}

function saveWallet(): void {
  localStorage.setItem("cu-wallet", JSON.stringify(wallet));
}

const wallet = loadWallet();

function blakeOnMaga(): boolean {
  return wallet.blakeMaga !== false;
}

function seatCampus(you = ""): void {
  lockCampus(seats, you, blakeOnMaga());
}

function campusNow(): { maga: string; antifa: string } {
  return campusSides(blakeOnMaga());
}

function campusSitLine(): string {
  const blakeSide = blakeOnMaga() ? "MAGA" : "Antifa";
  const lilSide = blakeOnMaga() ? "Antifa" : "MAGA";
  return `@blake sits ${blakeSide} this game. @lilhooligan sits ${lilSide}. @blake plays when he wants — P for expert AI.`;
}

function flipCampusSides(): void {
  wallet.blakeMaga = !blakeOnMaga();
  saveWallet();
}

let demoBlakeMaga = blakeOnMaga();

function paintCampusCopy(): void {
  const pair = campusNow();
  $("wait-maga-h").textContent = `MAGA · Washington DC · 4 + ${pair.maga}`;
  $("wait-antifa-h").textContent = `ANTIFA · Seattle · 4 + ${pair.antifa}`;
  $("atlas-key-maga").textContent = `holds Washington DC. Healing pool. ${pair.maga} sits this game.`;
  $("atlas-key-antifa").textContent = `holds Seattle. Healing pool. ${pair.antifa} sits this game.`;
  $("play-campus").textContent =
    `MAGA holds Washington DC. Antifa holds Seattle. Five seats a side. @blake and @lilhooligan sit campus and swap after each real match or Watch AI. Gallery watches do not swap. @blake has the keyboard when he logs in — P if he wants expert AI. Demo and Watch AI put a hero fight on mid.`;
}

function expandBundleOnce(): void {
  if (!wallet.skins.includes(BUNDLE_ID)) return;
  let added = false;
  for (const s of DLC) {
    if (!wallet.skins.includes(s.id)) {
      wallet.skins.push(s.id);
      added = true;
    }
  }
  if (!wallet.skins.includes(WILD_PACK_ID)) {
    wallet.skins.push(WILD_PACK_ID);
    added = true;
  }
  if (!wallet.skins.includes(MMA_PACK_ID)) {
    wallet.skins.push(MMA_PACK_ID);
    added = true;
  }
  if (!wallet.bundleExpanded || added) {
    wallet.bundleExpanded = true;
    saveWallet();
  }
}

expandBundleOnce();
let page: Page = "enter";
let navReady = false;
let navSilent = false;
const navStack: Page[] = [];
const pageScroll = new Map<string, number>();
const HISTORY_PAGES: readonly Page[] = [
  "draft",
  "store",
  "market",
  "clans",
  "lotto",
  "millix",
  "league",
  "patch",
  "faq",
  "playbook",
  "howto",
];
let seats: Seat[] = emptySeats();
let specs: Seat[] = emptySpecSeats();
let chat: ChatLine[] = [];
let waitT = 0;
let joinI = 0;
let specJoinI = 0;
let spectating = false;
let kickVote: KickVote | null = null;
let lastIdleSig = "";
let picked = DEFAULT_KIT;
let matchDraft: MatchDraft | null = null;
let mmaWanted = "";
let lottoPicks: number[] = [];
let dlcShelf = "all";
let playbookAttr: "all" | "str" | "agi" | "int" | "maga" | "antifa" | "wild" = "all";
let patchTab = "play";
let prevPatchId = "";
let bookMsg = "";
let lastSettleNote = "";
let lastHeatNote = "";
let bookMatchId = newId("match");
let marketMsg = "";
let salvaged = false;
let leagueLogged = false;
let liveWatch = false;
let restockT = 0;
let marketPulse = 0;
let leagueTab: "kirk" | "tangled" = "kirk";

const $ = <T extends HTMLElement>(id: string) => document.querySelector<T>(`#${id}`)!;
wirePageClip();

function showPage(id: Page): void {
  if (!navSilent && id !== page) {
    const prior = navStack.lastIndexOf(id);
    if (prior >= 0) navStack.length = prior;
    else if (page !== "play" && navStack[navStack.length - 1] !== page) navStack.push(page);
  }
  navSilent = false;
  if (id === "enter") navStack.length = 0;
  if (id !== page) {
    const cur = document.getElementById(page);
    if (cur) pageScroll.set(page, cur.scrollTop);
  }
  const from = page;
  page = id;
  if (id === "draft" || id === "play") hideEnterGate();
  const pages = ["enter", "wait", "draft", "store", "market", "clans", "lotto", "lotto-sandbox", "wheel-sandbox", "anim-sandbox", "millix", "league", "patch", "faq", "playbook", "howto", "paused", "victory", "defeat"];
  for (const p of pages) $(p).hidden = p !== id;
  view.hidden = id !== "play";
  flag.style.display = id === "enter" ? "block" : "none";
  $("rubble").style.display = id === "enter" ? "block" : "none";
  $("rail").hidden = id !== "enter";
  $("hud").hidden = id !== "play";
  if (id !== "play") $("rage-box").hidden = true;
  document.body.classList.toggle("in-play", id === "play");
  syncShell();
  if (id !== "wait" && id !== "draft" && id !== "play") dropMic();
  if (id !== "play") {
    game.clearMute();
    setRadioMuted(false);
    $("btn-mute").textContent = "Mute";
  }
  if (id === "play") {
    bootMatchAudio();
  }
  if (id === "enter") {
    paintCampusCopy();
    if (!demoLive || demoBlakeMaga !== blakeOnMaga()) startDemo();
    if (soundArmed && demoLive) {
      demoSfx.setMuted(false);
      void demoSfx.unlock().then(() => demoSfx.startBattle());
    }
  } else {
    demoSfx.setMuted(true);
  }
  if (id !== from) {
    const nextEl = document.getElementById(id);
    const y = pageScroll.get(id);
    if (nextEl && y !== undefined) nextEl.scrollTop = y;
  }
  refreshNav();
}

function goBack(): void {
  const prev = navStack.pop() ?? "enter";
  navSilent = true;
  showPage(prev);
}

function leaveDraft(): void {
  showPage(draftBack);
}

function layerOpen(id: string): boolean {
  const el = document.getElementById(id);
  return Boolean(el && !el.hasAttribute("hidden"));
}

function refreshNav(): void {
  if (!navReady) return;
  const history = HISTORY_PAGES.includes(page);
  const sandbox =
    layerOpen("lotto-sandbox") || layerOpen("wheel-sandbox") || layerOpen("anim-sandbox") || isCreepReviewMode();
  const overlay =
    isSoundOpen() ||
    isDeskOpen() ||
    isSoundcheckOpen() ||
    isRadioListOpen() ||
    layerOpen("paybox") ||
    layerOpen("mma-unlock");
  const queued = betaLink !== null && page !== "play";
  const betaForm = page === "enter" && Boolean(betaBox && !betaBox.hidden);
  const cancel = document.querySelector<HTMLButtonElement>("#beta-cancel");
  if (cancel) cancel.hidden = !queued;
  const show = page !== "play" && (history || sandbox || overlay || queued || betaForm);
  const btn = document.querySelector<HTMLButtonElement>("#nav-back");
  if (btn) btn.hidden = !show;
  document.body.classList.toggle("has-back", show);
}

function focusInField(): boolean {
  const el = document.activeElement;
  return Boolean(el instanceof HTMLElement && el.closest("input, textarea, select, [contenteditable]"));
}

function retreat(): boolean {
  if (layerOpen("rage-box")) {
    $("rage-box").hidden = true;
    sfx.click();
    refreshNav();
    return true;
  }
  if (layerOpen("paybox")) {
    closePay();
    storeMsg("Payment cancelled.");
    sfx.click();
    refreshNav();
    return true;
  }
  if (layerOpen("social-box")) {
    closeSocial();
    sfx.click();
    refreshNav();
    return true;
  }
  if (layerOpen("mma-unlock")) {
    closeMmaUnlock();
    sfx.click();
    refreshNav();
    return true;
  }
  if (isSoundcheckOpen()) {
    dismissSoundcheck();
    sfx.click();
    refreshNav();
    return true;
  }
  if (isDeskOpen()) {
    closeDesk();
    sfx.click();
    refreshNav();
    return true;
  }
  if (isSoundOpen()) {
    closeSound();
    sfx.click();
    refreshNav();
    return true;
  }
  if (isRadioListOpen()) {
    closeRadioList();
    sfx.click();
    refreshNav();
    return true;
  }
  if (page === "enter" && betaBox && !betaBox.hidden) {
    if (betaLink) cancelBeta();
    else betaBox.hidden = true;
    sfx.click();
    refreshNav();
    return true;
  }
  if (page === "play" && game.shopOpen) {
    game.shopOpen = false;
    const search = document.getElementById("shop-search");
    if (search instanceof HTMLElement) search.blur();
    sfx.click();
    return true;
  }
  if (focusInField()) return false;
  if (layerOpen("lotto-sandbox")) {
    document.querySelector<HTMLButtonElement>("#sb-back")?.click();
    sfx.click();
    return true;
  }
  if (layerOpen("wheel-sandbox")) {
    document.querySelector<HTMLButtonElement>("#wh-back")?.click();
    sfx.click();
    return true;
  }
  if (layerOpen("anim-sandbox")) {
    document.querySelector<HTMLButtonElement>("#an-back")?.click();
    sfx.click();
    return true;
  }
  if (isCreepReviewMode()) {
    location.href = location.pathname;
    sfx.click();
    return true;
  }
  if (page === "play") return false;
  if (page === "draft") {
    leaveDraft();
    sfx.click();
    return true;
  }
  if (HISTORY_PAGES.includes(page)) {
    goBack();
    sfx.click();
    return true;
  }
  if (page === "wait") {
    document.querySelector("#btn-cancel-search")?.dispatchEvent(new Event("click"));
    sfx.click();
    return true;
  }
  if (page === "enter" && betaLink) {
    cancelBeta();
    sfx.click();
    return true;
  }
  return false;
}

function econLine(): string {
  return `${wallet.coins} coins · ${wallet.mlx} MLX · 1,000,000 MLX = $0.18 (fiatleak). Matches are free.`;
}

function takeDevCut(amount: number, rail: "coins" | "mlx" | "paypal" | "card"): number {
  const cut = devCutOf(amount);
  if (cut <= 0) return 0;
  if (rail === "mlx") wallet.devMlx += cut;
  else if (rail === "paypal") wallet.devPaypal += cut;
  else if (rail === "card") wallet.devCard += cut;
  else wallet.devCoins += cut;
  return cut;
}

/** 1% of Millix or coins moving into or out of campus escrow. */
function takeEscrowCut(amount: number, rail: "mlx" | "coins"): number {
  return takeDevCut(amount, rail);
}

function takeBetCut(amount: number, rail: BetRail): { cut: number; net: number } {
  const { cut, net } = netAfterDevCut(amount);
  takeDevCut(amount, rail);
  return { cut, net };
}

function reverseDevCut(amount: number, rail: BetRail): void {
  const cut = devCutOf(amount);
  if (rail === "mlx") wallet.devMlx = Math.max(0, wallet.devMlx - cut);
  else wallet.devCoins = Math.max(0, wallet.devCoins - cut);
}

function creditRail(amount: number, rail: BetRail): void {
  if (rail === "mlx") wallet.mlx += amount;
  else wallet.coins += amount;
}

function refundBet(bet: LiveBet): void {
  creditRail(bet.stake, bet.rail);
  reverseDevCut(bet.stake, bet.rail);
}

function devCutLine(): string {
  return `1% to ${devCredit()} · collected ${wallet.devCoins} coins · ${wallet.devMlx} MLX · PayPal ${wallet.devPaypal} · card ${wallet.devCard}.`;
}

function renderPatch(p: Patch): string {
  const toc = p.sections
    .map((s) => `<a href="#gp-${s.id}">${s.heading}</a>`)
    .join("");
  const body = p.sections
    .map((s) => {
      const blocks = s.blocks
        .map((b) => {
          const lines = b.lines.map((line) => `<li>${line}</li>`).join("");
          return `${b.name ? `<h4>${b.name}</h4>` : ""}<ul>${lines}</ul>`;
        })
        .join("");
      return `<section class="gp-sec" id="gp-${s.id}"><h3>${s.heading}</h3>${blocks}</section>`;
    })
    .join("");
  return `<header class="gp-head">
      <p class="kicker">Gameplay Update</p>
      <h2>${p.id}</h2>
      <p class="date">${p.date}</p>
      <p class="title">${p.headline}</p>
    </header>
    <nav class="gp-toc">${toc}</nav>
    ${body}`;
}

function paintFaq(): void {
  $("faq-toc").innerHTML = FAQ.map((g) => `<a href="#faq-${g.id}">${g.heading}</a>`).join("");
  $("faq-view").innerHTML = FAQ.map(
    (g: FaqGroup) =>
      `<section class="faq-group" id="faq-${g.id}">
        <h3>${g.heading}</h3>
        ${g.items
          .map(
            (i) =>
              `<details class="faq-item"><summary>${i.q}</summary><p>${i.a}</p></details>`,
          )
          .join("")}
      </section>`,
  ).join("");
}

function filterPlaybook(): void {
  const q = (document.querySelector<HTMLInputElement>("#playbook-q")?.value ?? "").trim().toLowerCase();
  let shown = 0;
  for (const card of $("playbook-view").querySelectorAll<HTMLElement>("[data-kit]")) {
    const hay = card.dataset.search ?? "";
    const matchAttr =
      playbookAttr === "all" || card.dataset.attr === playbookAttr || card.dataset.wing === playbookAttr;
    const on = matchAttr && (!q || hay.includes(q));
    card.hidden = !on;
    const wrap = card.closest<HTMLElement>("[id^='kit-']");
    if (wrap) wrap.hidden = !on;
    if (on) shown += 1;
  }
  for (const group of $("playbook-view").querySelectorAll<HTMLElement>("[data-group]")) {
    group.hidden = ![...group.querySelectorAll<HTMLElement>("[data-kit]")].some((c) => !c.hidden);
  }
  const count = document.querySelector("#playbook-count");
  if (count) count.textContent = `${shown} kit${shown === 1 ? "" : "s"}`;
  const empty = document.querySelector<HTMLElement>("#playbook-empty");
  if (empty) empty.hidden = shown > 0;
  for (const btn of $("playbook-filter").querySelectorAll<HTMLButtonElement>("[data-attr]")) {
    btn.className = (btn.dataset.attr ?? "all") === playbookAttr ? "gold" : "thin";
  }
}

function paintPlaybook(): void {
  $("playbook-view").innerHTML = playbookHtml();
  filterPlaybook();
}

function paintHowto(): void {
  $("howto-view").innerHTML = howtoHtml();
}

function paintMillix(): void {
  $("millix-node").textContent = MILLIX_NODE;
  $("millix-node-note").textContent =
    `Send MLX here. ${shortNode()} · 1% of every Millix send to ${devCredit()}. 1,000,000 MLX = $0.18 (fiatleak).`;
}

function paintPatches(): void {
  const latest = PATCHES[0]!;
  $("latest-patch").textContent = `Gameplay Update ${latest.id} — ${latest.headline}`;
  for (const el of $("patch-tabs").querySelectorAll("button[data-ptab]")) {
    const on = (el as HTMLElement).dataset.ptab === patchTab;
    el.className = on ? "gold" : "thin";
  }
  if (patchTab === "play") {
    $("patch-view").innerHTML = `<div class="patches">${renderPatch(latest)}</div>`;
    return;
  }
  const older = PATCHES.slice(1);
  const open = older.find((p) => p.id === prevPatchId) ?? older[0];
  const list = older
    .map(
      (p) =>
        `<button type="button" class="prev-item${open && p.id === open.id ? " on" : ""}" data-pid="${p.id}">
          <b>${p.id}</b><span>${p.date}</span><i>${p.headline}</i>
        </button>`,
    )
    .join("");
  $("patch-view").innerHTML = `<div class="prev-list">${list}</div>${open ? `<div class="patches">${renderPatch(open)}</div>` : ""}`;
}

function paintHandle(): void {
  const shown = displayHandle(wallet.handle);
  ($("handle-in") as HTMLInputElement).value = shown;
  $("handle-form").hidden = false;
  $("handle-you").textContent = shown
    ? handleOf(shown) === "blake"
      ? `${shown} · you have the keyboard. P if you want expert AI.`
      : defaultExpertAuto(shown)
        ? `${shown} · expert autoplay on (P in-match).`
        : canExpertAuto(shown)
          ? `${shown} · P hands the kit to expert AI.`
          : `${shown} on MAGA seat 1.`
    : wallet.account
      ? `${accountLine(wallet.account)} MAGA seat 1 uses that locker.`
      : "No handle yet. Log in with Facebook or Gmail, sign up with email, or set a local handle.";
  paintAccount();
}

function paintAccount(): void {
  const session = wallet.account;
  $("account-in").hidden = !session;
  $("account-out").hidden = !!session;
  $("account-you").textContent = session ? accountLine(session) : "";
}

function applyAccount(session: AccountSession): void {
  wallet.account = session;
  if (session.provider === "gmail") wallet.googleSignup = true;
  if (!wallet.handle) {
    wallet.handle = handleFromAccount(session.email, session.name);
  }
  saveWallet();
  paintWallet();
  if (!canSelectHero(picked)) {
    picked = DEFAULT_KIT;
    game.pick(DEFAULT_KIT);
  }
  paintPicks();
}

function setAccountMsg(text: string, fail = false): void {
  const el = $("account-msg");
  el.textContent = text;
  el.classList.toggle("fail", fail);
}

function setSocialMsg(text: string, fail = false): void {
  const el = $("social-msg");
  el.textContent = text;
  el.classList.toggle("fail", fail);
}

let socialProvider: "facebook" | "gmail" = "facebook";

function openSocial(provider: "facebook" | "gmail"): void {
  socialProvider = provider;
  const label = providerLabel(provider);
  $("social-kicker").textContent = label;
  $("social-title").textContent = `Log in with ${label}`;
  $("social-lede").textContent =
    provider === "gmail"
      ? "This tab does not open Google and does not take a Google password. Type the @gmail.com on that account, then continue. First time makes a locker. Next time is the same email."
      : "This tab does not open Facebook and does not take a Facebook password. Type the email on that Facebook, then continue. First time makes a locker. Next time is the same email.";
  ($("social-email") as HTMLInputElement).value = "";
  ($("social-name") as HTMLInputElement).value = "";
  ($("social-email") as HTMLInputElement).placeholder = provider === "gmail" ? "you@gmail.com" : "Email on that Facebook";
  setSocialMsg("");
  $("social-box").hidden = false;
  ($("social-email") as HTMLInputElement).focus();
}

function closeSocial(): void {
  $("social-box").hidden = true;
  setSocialMsg("");
  refreshNav();
}

function claimSpotifyGold(): void {
  if (wallet.spotifyLinked) return;
  wallet.spotifyLinked = true;
  wallet.coins += SPOTIFY_LINK_GOLD;
  saveWallet();
  sfx.coin();
  if (page === "play") game.grantGold(SPOTIFY_LINK_GOLD);
  paintWallet();
  if (page === "store") storeMsg(`Spotify linked · +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold. One claim.`);
}

function paintWallet(): void {
  paintMmaUnlock();
  $("econ").textContent = econLine();
  $("store-econ").textContent =
    econLine() +
    ` ${devCutLine()} Millix node ${shortNode()}. PayPal ${PAYPAL_EMAIL}. Card ${cardDest()}. DLC activates when Millix, PayPal, or that account clears.`;
  $("lotto-econ").textContent =
    econLine() + ` Escrow ${mlxAmt(wallet.mlxEscrow)} MLX on the campus node. 1% of every escrow in and out. ${devCutLine()}`;
  $("clan-you").textContent = wallet.clan ? `Your clan: ${wallet.clan}` : "No clan yet. Found one or tap a house clan.";
  const nodeEl = document.querySelector("#mlx-node-show");
  if (nodeEl) nodeEl.textContent = MILLIX_NODE;
  const ppEl = document.querySelector("#pp-show");
  if (ppEl) ppEl.textContent = PAYPAL_EMAIL;
  const ppBlurb = document.querySelector("#pp-blurb");
  if (ppBlurb) ppBlurb.textContent = `PayPal £1.99 a skin to ${PAYPAL_EMAIL}. 1% of every PayPal payment to ${devCredit()}. When it clears, the DLC activates.`;
  const cardEl = document.querySelector("#card-show");
  if (cardEl) cardEl.textContent = cardDest();
  const cardBlurb = document.querySelector("#card-blurb");
  if (cardBlurb) cardBlurb.textContent = `${cardDest()}. £1.99 a skin. 1% of every card charge to ${devCredit()}. When that account clears, the DLC activates.`;
  paintHandle();
  $("tangled-line").textContent = enterGoldLine(wallet.googleSignup);
  $("spotify-line").textContent = wallet.spotifyLinked
    ? `Spotify is linked · +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold claimed on this locker.`
    : `Link Spotify on the music bar. Open Spotify, come back, and this locker pays +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold once.`;
  paintMillixCountdown();
  paintBook();
  paintHeatBoard();
}

function refreshHeat(): void {
  const day = campusDay();
  if (wallet.heatDay === day && wallet.heatQuests.length === 3) return;
  wallet.heatDay = day;
  wallet.heatQuests = rollQuests(day);
  wallet.heatMatches = 0;
  saveWallet();
}

function paintHeatBoard(): void {
  refreshHeat();
  const done = wallet.heatQuests.filter((q) => q.paid).length;
  const streak = wallet.winStreak;
  const first = wallet.lastWinDay === campusDay() ? "First win today is in." : `First win today +${FIRST_WIN_COIN} coins.`;
  $("heat-board-line").textContent =
    streak > 1
      ? `${streak} win streak · best ${wallet.bestWinStreak}. ${first} Quests ${done}/3.`
      : `Win +${WIN_COIN} coins. Loss still pays +${LOSS_COIN}. ${first} Quests ${done}/3.`;
  $("heat-quests").innerHTML = wallet.heatQuests
    .map((q) => `<li class="${q.paid ? "done" : ""}">${questLine(q)}</li>`)
    .join("");
}

function millixYou(): string {
  return displayHandle(wallet.handle) || displayHandle(wallet.tangledUser) || wallet.account?.name || "You";
}

function isMillixUser(): boolean {
  if (wallet.mlx > 0 || wallet.mlxEscrow > 0 || millixAddrOk(wallet.mlxPay) || wallet.tangledUser) return true;
  return wallet.invoices.some((i) => invoiceRail(i) === "mlx" && i.status === "cleared");
}

function enteredHour(id: number): boolean {
  return wallet.mlxHourly.some((e) => e.hour === id);
}

const PAYOUT_CLEAR_MS = 1600;
let payoutClearTimer = 0;

function queuePayoutClear(): void {
  if (payoutClearTimer) return;
  payoutClearTimer = window.setTimeout(() => {
    payoutClearTimer = 0;
    if (!flushPayouts()) return;
    saveWallet();
    if (page === "lotto") paintLotto();
    else paintWallet();
  }, PAYOUT_CLEAR_MS + 100);
}

function millixPrizePayout(hour: number, place: number, prize: number): MlxPayout {
  const to = millixAddrOk(wallet.mlxPay) ? wallet.mlxPay.trim() : "";
  return {
    id: millixPayId(),
    hour,
    place,
    prize,
    to,
    tx: to ? millixTxId() : "",
    status: to ? "sent" : "escrow",
    at: Date.now(),
  };
}

function flushPayouts(): boolean {
  let changed = false;
  const now = Date.now();
  let sent = false;
  for (const p of wallet.mlxPayouts) {
    if (p.status === "escrow" && millixAddrOk(wallet.mlxPay)) {
      p.to = wallet.mlxPay.trim();
      p.tx = millixTxId();
      p.status = "sent";
      p.at = now;
      changed = true;
      sent = true;
    }
    if (p.status === "sent" && now - p.at >= PAYOUT_CLEAR_MS) {
      p.status = "cleared";
      wallet.mlx += p.prize;
      wallet.mlxEscrow = Math.max(0, wallet.mlxEscrow - p.prize);
      changed = true;
    }
  }
  if (sent || wallet.mlxPayouts.some((p) => p.status === "sent")) queuePayoutClear();
  return changed;
}

function settleMillixHours(): void {
  const now = hourId();
  let changed = false;
  let h = wallet.mlxCarryFor;
  while (h < now) {
    const youIn = enteredHour(h);
    const draw = drawHour(h, youIn ? millixYou() : undefined, wallet.mlxCarry);
    if (!wallet.mlxDraws.some((d) => d.hour === draw.hour)) {
      wallet.mlxDraws.unshift(draw);
      if (youIn) {
        takeEscrowCut(NPC_MILLIX.length * MLX_STAKE, "mlx");
        const you = millixYou();
        for (const w of placedWinners(draw)) {
          if (sameMillix(w.name, you)) continue;
          takeEscrowCut(w.prize, "mlx");
        }
      }
    }
    const entry = wallet.mlxHourly.find((e) => e.hour === h);
    if (entry && !entry.paid) {
      entry.paid = true;
      wallet.mlxEscrow = Math.max(0, wallet.mlxEscrow - MLX_STAKE);
      const hit = placedWinners(draw).find((w) => sameMillix(w.name, millixYou()));
      if (hit && !wallet.mlxPayouts.some((p) => p.hour === draw.hour && p.place === hit.place)) {
        const { net } = netAfterDevCut(hit.prize);
        takeEscrowCut(hit.prize, "mlx");
        wallet.mlxPayouts.unshift(millixPrizePayout(draw.hour, hit.place, net));
        wallet.mlxEscrow += net;
      }
    }
    wallet.mlxCarry = draw.roll;
    h += 1;
    wallet.mlxCarryFor = h;
    changed = true;
  }
  for (const entry of wallet.mlxHourly) {
    if (entry.paid || entry.hour >= now) continue;
    entry.paid = true;
    wallet.mlxEscrow = Math.max(0, wallet.mlxEscrow - MLX_STAKE);
    changed = true;
  }
  wallet.mlxDraws = wallet.mlxDraws.slice(0, 24);
  wallet.mlxPayouts = wallet.mlxPayouts.slice(0, 48);
  if (flushPayouts()) changed = true;
  if (changed) saveWallet();
}

function millixPlaceNote(hour: number, name: string, place: number, mine: boolean): string {
  if (mine) {
    const p = wallet.mlxPayouts.find((x) => x.hour === hour && x.place === place);
    if (!p) return " · you";
    if (p.status === "escrow") return " · you · held in escrow";
    if (p.status === "sent") return ` · you · paid from escrow · tx ${p.tx}`;
    return ` · you · cleared to ${shortNode(p.to)} · tx ${p.tx}`;
  }
  return ` · paid from escrow · ${shortNode(npcMillixAddr(name))}`;
}

function paintMillixCountdown(): void {
  const left = hourEnd(hourId()) - Date.now();
  const text = `Next Millix Hourly in ${formatCountdown(left)} · up to ${MLX_WINNERS} winners · unclaimed Millix rolls over · escrow on ${shortNode()}.`;
  $("mlx-hour-line").textContent = text;
  const cd = document.querySelector("#mlx-cd");
  if (cd) cd.textContent = text;
}

function paintMillixWallet(): void {
  $("mlx-escrow-line").textContent = millixAddrOk(wallet.mlxPay)
    ? `Escrow ${mlxAmt(wallet.mlxEscrow)} MLX on the campus node. 1% of every escrow in and every escrow out to ${devCredit()}. Paying 1st / 2nd / 3rd to ${shortNode(wallet.mlxPay)}.`
    : `Escrow ${mlxAmt(wallet.mlxEscrow)} MLX on the campus node. 1% of every escrow in and every escrow out to ${devCredit()}. Save a Millix wallet — prizes stay in escrow until they can pay 1st, 2nd, and 3rd.`;
  $("mlx-escrow-node").textContent = MILLIX_NODE;
  const payIn = $("mlx-pay-in") as HTMLInputElement;
  if (document.activeElement !== payIn) payIn.value = wallet.mlxPay;
  if (!wallet.mlxPay) {
    $("mlx-pay-status").textContent =
      "No personal Millix wallet yet. The node holds the pot. 1st, 2nd, and 3rd auto-pay when you save an address.";
  } else if (wallet.mlxPayouts.some((p) => p.status === "escrow" || p.status === "sent")) {
    $("mlx-pay-status").textContent = `Paying ${shortNode(wallet.mlxPay)}. Uncleared prizes are still on the node.`;
  } else {
    $("mlx-pay-status").textContent = `Winnings auto-pay ${shortNode(wallet.mlxPay)} from escrow when you place 1st, 2nd, or 3rd.`;
  }
  if (!wallet.mlxPayouts.length) {
    $("mlx-pays").innerHTML = "<li>No Hourly payouts yet. Place 1st, 2nd, or 3rd and escrow sends this wallet.</li>";
  } else {
    $("mlx-pays").innerHTML = wallet.mlxPayouts
      .slice(0, 12)
      .map((p) => {
        const dest = p.to ? shortNode(p.to) : "no wallet yet";
        const tx = p.tx ? ` · tx ${p.tx}` : "";
        return `<li>${hourLabel(p.hour)} · ${placeWord(p.place)} · ${mlxAmt(p.prize)} MLX · ${payoutWord(p.status)} · ${dest}${tx}</li>`;
      })
      .join("");
  }
}

function paintMillixHourly(): void {
  settleMillixHours();
  const now = hourId();
  const inNow = enteredHour(now);
  const you = millixYou();
  const pot = hourPot(inNow, wallet.mlxCarry);
  const carryNote = wallet.mlxCarry > 0 ? ` including ${mlxAmt(wallet.mlxCarry)} MLX rolled over` : "";
  $("mlx-pot").textContent = `This hour ${hourLabel(now)} · pot ${mlxAmt(pot)} MLX in escrow${carryNote} · stake ${MLX_STAKE} MLX · 1st 50% · 2nd 30% · 3rd 20% · no winner on a place and that Millix rolls into the next hour · 1% of every escrow in and every escrow out to ${devCredit()}.`;
  const btn = $("btn-mlx-enter") as HTMLButtonElement;
  if (!isMillixUser()) {
    $("mlx-status").textContent =
      "Millix users only. Hold MLX, clear a Millix payment, or log in on Tangled, then stake 50 MLX. The stake sits in escrow until the draw.";
    btn.disabled = true;
  } else if (inNow) {
    $("mlx-status").textContent = `${you} is in this hour. ${mlxAmt(MLX_STAKE)} MLX in escrow on the node. Draw at the top of the hour. Vacant places roll Millix over.`;
    btn.disabled = true;
  } else if (wallet.mlx < MLX_STAKE) {
    $("mlx-status").textContent = `Need ${MLX_STAKE} MLX to stake this hour. Load Millix in the store.`;
    btn.disabled = true;
  } else {
    $("mlx-status").textContent = "Stake 50 MLX to enter this hour. One entry per hour. The stake sits in escrow. If a place has no winner, that Millix rolls into the next hour.";
    btn.disabled = false;
  }
  paintMillixWallet();
  const lastId = now - 1;
  const last = wallet.mlxDraws.find((d) => d.hour === lastId) ?? drawHour(lastId, enteredHour(lastId) ? you : undefined, 0);
  if (!placedWinners(last).length) {
    $("mlx-winners").innerHTML = `<li>No winners · ${mlxAmt(last.roll || last.pot)} MLX rolls into this hour.</li>`;
  } else {
    $("mlx-winners").innerHTML = last.winners
      .map((w) => {
        if (!w.name) {
          return `<li class="place-${w.place}"><b>${placeWord(w.place)}</b> No winner · ${mlxAmt(w.prize)} MLX rolls over</li>`;
        }
        const mine = sameMillix(w.name, you) && enteredHour(lastId);
        return `<li class="place-${w.place}${mine ? " on" : ""}"><b>${placeWord(w.place)}</b> ${w.name} · ${mlxAmt(w.prize)} MLX${millixPlaceNote(lastId, w.name, w.place, mine)}</li>`;
      })
      .join("");
  }
  if (!wallet.mlxDraws.length) {
    $("mlx-hist").innerHTML = "<li>No settled hours yet. Last hour is above. Unclaimed Millix rolls into the next pot.</li>";
  } else {
    $("mlx-hist").innerHTML = wallet.mlxDraws
      .slice(0, 8)
      .map((d) => {
        const hits = placedWinners(d);
        const names = hits.length ? hits.map((w) => `${placeWord(w.place)} ${w.name}`).join(" · ") : "no winners";
        const mine = hits.find((w) => sameMillix(w.name, you));
        const roll = d.roll ? ` · ${mlxAmt(d.roll)} MLX rolled over` : "";
        return `<li>${hourLabel(d.hour)} · pot ${mlxAmt(d.pot)} MLX in escrow · ${names}${roll}${mine ? ` · you ${placeWord(mine.place)}` : ""}</li>`;
      })
      .join("");
  }
  paintMillixCountdown();
}

function bookHourLeft(): number {
  return Math.max(0, betHourEnd() - Date.now());
}

function hourBetCount(): number {
  return betsInHour(wallet.liveBets, wallet.bets);
}

function canAddSlip(market: BetMarket): boolean {
  if (wallet.betLocked) return false;
  if (wallet.liveBets.some((b) => b.market === market)) return true;
  if (wallet.liveBets.length >= BETS_PER_MATCH) return false;
  return hourBetCount() < BETS_PER_HOUR;
}

function paintBook(): void {
  const hourUsed = hourBetCount() >= BETS_PER_HOUR;
  const left = bookHourLeft();
  $("book-econ").textContent = `${econLine()} ${devCutLine()} Even ${ODDS.toFixed(2)}.`;
  $("book-stakes").innerHTML = `<p class="lede">Three markets · ${BET_STAKE} gold a slip · one bet per hour · 1% of every stake and every payout to ${devCredit()}.</p>`;
  const locked = wallet.betLocked;
  $("book-markets").innerHTML = markets()
    .map((m) => {
      const live = wallet.liveBets.find((b) => b.market === m.id);
      const shut = locked || (!live && !canAddSlip(m.id));
      const picks = sides(m.id)
        .map((s) => {
          const on = live?.side === s.id ? " on" : "";
          return `<button type="button" class="thin book-side${on}" data-book="side" data-market="${m.id}" data-side="${s.id}" ${shut ? "disabled" : ""}><span>${s.label}</span><b>${ODDS.toFixed(2)}</b></button>`;
        })
        .join("");
      const slip = live ? `<i>${slipLine(live)}</i>` : "";
      return `<div class="book-mkt"><h4>${m.label}</h4><p>${m.line}</p>${picks}${slip}</div>`;
    })
    .join("");
  if (locked) {
    $("book-lede").textContent = "Campus Book is locked for this match. Pays when a town falls.";
  } else if (hourUsed && !wallet.liveBets.length) {
    $("book-lede").textContent = `One bet per hour. You already booked this hour. Next slip in ${formatCountdown(left)}.`;
  } else if (hourUsed) {
    $("book-lede").textContent = `This hour’s bet is in. Replace it until the match starts, or wait ${formatCountdown(left)} for another. ${BET_STAKE} gold. 1% to ${devCredit()}.`;
  } else {
    $("book-lede").textContent =
      `Three markets each match. ${BET_STAKE} gold a slip. One bet per hour. Replace until the match starts. The book locks when the match starts and pays when a town falls. Leave the wait room and the stake comes back. ${devCredit()} take 1% of every bet — every stake and every payout.`;
  }
  $("book-msg").textContent = bookMsg;
  const hist = wallet.bets.slice(0, 4);
  $("book-hist").innerHTML = hist.length
    ? hist
        .map((b) => `<div class="${b.status}">${b.status.toUpperCase()} · ${slipLine(b)}${b.status === "won" ? ` · +${b.payout} ${b.rail}` : ""}</div>`)
        .join("")
    : "<div>No settled slips yet.</div>";
}

function paintBetSlip(): void {
  const live = wallet.liveBets;
  $("bet-slip").hidden = live.length === 0;
  $("bet-slip-list").innerHTML = live.map((b) => `<div>${slipLine(b)}</div>`).join("");
}

function paintEndBets(): void {
  const note = lastSettleNote;
  $("win-bet").hidden = !note;
  $("lose-bet").hidden = !note;
  $("win-bet").textContent = note;
  $("lose-bet").textContent = note;
}

function placeBet(market: BetMarket, side: string): void {
  if (wallet.betLocked) {
    bookMsg = "Book is locked. Slips stay until a town falls.";
    paintBook();
    return;
  }
  const existing = wallet.liveBets.find((b) => b.market === market);
  if (existing && existing.side === side && existing.stake === BET_STAKE && existing.rail === "coins") return;
  if (!existing && wallet.liveBets.length >= BETS_PER_MATCH) {
    bookMsg = `Three slips max this match.`;
    paintBook();
    return;
  }
  if (!existing && hourBetCount() >= BETS_PER_HOUR) {
    bookMsg = `One bet per hour. Next slip in ${formatCountdown(bookHourLeft())}.`;
    paintBook();
    return;
  }
  const refund = existing && existing.rail === "coins" ? existing.stake : 0;
  const bal = wallet.coins + refund;
  if (bal < BET_STAKE) {
    bookMsg = `Need ${BET_STAKE} gold for that slip. You have ${wallet.coins}.`;
    paintBook();
    return;
  }
  if (existing) {
    refundBet(existing);
    wallet.liveBets = wallet.liveBets.filter((b) => b.id !== existing.id);
  }
  wallet.coins -= BET_STAKE;
  const cut = takeDevCut(BET_STAKE, "coins");
  const bet: LiveBet = {
    id: newId("bet"),
    matchId: bookMatchId,
    market,
    side,
    stake: BET_STAKE,
    rail: "coins",
    odds: ODDS,
    placed: Date.now(),
  };
  wallet.liveBets.push(bet);
  saveWallet();
  bookMsg = `Slip on ${slipLine(bet)}. 1% (${cut} gold) to ${devCredit()}. Replace until the match starts.`;
  sys(`Campus Book: ${slipLine(bet)}.`);
  paintSeats();
  paintWallet();
}

function lockBook(): void {
  if (!wallet.liveBets.length) {
    wallet.betLocked = false;
    saveWallet();
    return;
  }
  wallet.betLocked = true;
  saveWallet();
  sys(`Campus Book locked · ${wallet.liveBets.length} slip${wallet.liveBets.length === 1 ? "" : "s"}.`);
}

function voidLiveBets(reason?: string): void {
  if (!wallet.liveBets.length) {
    wallet.betLocked = false;
    return;
  }
  for (const bet of wallet.liveBets) {
    refundBet(bet);
    wallet.bets.unshift({ ...bet, status: "void", payout: bet.stake, settled: Date.now() });
  }
  wallet.liveBets = [];
  wallet.betLocked = false;
  wallet.bets = wallet.bets.slice(0, 48);
  saveWallet();
  if (reason) {
    lastSettleNote = reason;
    bookMsg = reason;
  }
  paintWallet();
}

function settleLiveBets(result: { winner: "home" | "away" | ""; clock: number; firstTower: "home" | "away" | "" }): void {
  if (!wallet.liveBets.length || !result.winner) return;
  const notes: string[] = [];
  for (const bet of wallet.liveBets) {
    if (bet.market === "tower" && !result.firstTower) {
      refundBet(bet);
      wallet.bets.unshift({ ...bet, status: "void", payout: bet.stake, settled: Date.now() });
      notes.push(`${slipLine(bet)} voided — no tower fell. Stake back.`);
      continue;
    }
    if (betHits(bet, result)) {
      const gross = payoutOf(bet.stake);
      const { cut, net } = takeBetCut(gross, bet.rail);
      creditRail(net, bet.rail);
      wallet.bets.unshift({ ...bet, status: "won", payout: net, settled: Date.now() });
      notes.push(`${slipLine(bet)} hit. +${net} ${bet.rail} after 1% (${cut}) to ${devCredit()}.`);
    } else {
      wallet.bets.unshift({ ...bet, status: "lost", payout: 0, settled: Date.now() });
      notes.push(`${slipLine(bet)} missed. 1% of the stake stays with ${devCredit()}.`);
    }
  }
  wallet.liveBets = [];
  wallet.betLocked = false;
  wallet.bets = wallet.bets.slice(0, 48);
  saveWallet();
  lastSettleNote = notes.join(" ");
  paintWallet();
}

function youLabel(spec: boolean): string {
  const who = displayHandle(wallet.handle) || "You";
  const tag = wallet.clan ? wallet.clan.split(" ")[0] ?? wallet.clan : "";
  const base = tag ? `${tag} ${who}` : who;
  return spec ? `[SPEC] ${base}` : base;
}

function isSpecYou(): boolean {
  return specs.some((s) => s.status === "YOU");
}

function ownsSpec(): boolean {
  return wallet.specSeats > 0;
}

function ownsSkin(id: string): boolean {
  return wallet.skins.includes(id);
}

function marketSeller(): string {
  return millixYou();
}

function stashLine(): string {
  const skins = DLC.filter((s) => ownsSkin(s.id)).map((s) => s.name);
  const items = wallet.stash.map((id) => ITEMS.find((i) => i.id === id)?.name ?? id);
  const listed = wallet.listings.map((l) => `${goodsName(l.kind, l.sku)} (listed)`);
  const parts = [...skins, ...items, ...listed];
  return parts.length ? parts.join(" · ") : "Empty. Buy a skin in the DLC Store, or finish a match with fountain items.";
}

function listableOptions(): { value: string; label: string }[] {
  const listed = new Set(wallet.listings.map((l) => skuKey(l.kind, l.sku)));
  const out: { value: string; label: string }[] = [];
  for (const s of DLC) {
    if (s.id === BUNDLE_ID || !ownsSkin(s.id) || listed.has(skuKey("skin", s.id))) continue;
    out.push({ value: skuKey("skin", s.id), label: `Skin · ${s.name}` });
  }
  for (const id of wallet.stash) {
    if (listed.has(skuKey("item", id))) continue;
    const it = ITEMS.find((i) => i.id === id);
    if (!it) continue;
    out.push({ value: skuKey("item", id), label: `Item · ${it.name}` });
  }
  return out;
}

function listingCard(l: Listing, yours: boolean): string {
  const hero = l.kind === "skin" ? HEROES.find((h) => h.id === (DLC.find((s) => s.id === l.sku)?.hero ?? ""))?.name ?? "Skin" : "Fountain";
  const art = l.kind === "skin"
    ? artImg("hero", DLC.find((s) => s.id === l.sku)?.hero ?? "riot", goodsName(l.kind, l.sku), "hero-art", l.sku)
    : artImg("item", l.sku, goodsName(l.kind, l.sku), "item-art");
  return `<div class="sku">
    ${art}
    <span>${l.kind === "skin" ? "DLC skin" : "Fountain item"} · ${hero}</span>
    <i class="swatch fat" style="background:${goodsTint(l.kind, l.sku)}"></i>
    <b>${goodsName(l.kind, l.sku)}</b>
    <i>${goodsBlurb(l.kind, l.sku)}</i>
    <p>${l.price} coins · seller ${l.seller} · 1% of the sale to ${devCredit()}</p>
    ${yours
      ? `<button type="button" class="thin" data-pull="${l.id}">Pull listing</button>`
      : `<button type="button" class="gold" data-buy="${l.id}">Buy · ${l.price} coins</button>`}
  </div>`;
}

function paintMarket(): void {
  $("market-econ").textContent = econLine() + ` ${devCutLine()}`;
  $("market-stash").textContent = stashLine();
  $("market-msg").textContent = marketMsg;
  const opts = listableOptions();
  const sel = $("market-sku") as HTMLSelectElement;
  const keep = sel.value;
  sel.innerHTML = opts.length
    ? opts.map((o) => `<option value="${o.value}">${o.label}</option>`).join("")
    : `<option value="">Nothing to list</option>`;
  if (opts.some((o) => o.value === keep)) sel.value = keep;
  const parsed = parseSku(sel.value);
  const price = $("market-price") as HTMLInputElement;
  if (!price.value && parsed) price.value = String(askPrice(parsed.kind, parsed.sku));
  $("btn-market-list").toggleAttribute("disabled", !opts.length);
  $("market-mine").innerHTML = wallet.listings.length
    ? wallet.listings.map((l) => listingCard(l, true)).join("")
    : `<p class="lede">No listings yet. Pick a skin or item above.</p>`;
  const board = boardOf(wallet.listings, wallet.marketGone).filter((l) => !wallet.listings.some((y) => y.id === l.id));
  $("market-board").innerHTML = board.length
    ? board.map((l) => listingCard(l, false)).join("")
    : `<p class="lede">Board is empty. Pull a listing or wait for a campus restock.</p>`;
}

function takeListing(kind: "skin" | "item", sku: string): boolean {
  if (kind === "skin") {
    if (!ownsSkin(sku)) return false;
    wallet.skins = wallet.skins.filter((id) => id !== sku);
    for (const [hero, id] of Object.entries(wallet.equipped)) {
      if (id === sku) delete wallet.equipped[hero];
    }
    return true;
  }
  const i = wallet.stash.indexOf(sku);
  if (i < 0) return false;
  wallet.stash.splice(i, 1);
  return true;
}

function giveGoods(kind: "skin" | "item", sku: string): void {
  if (kind === "skin") {
    if (!wallet.skins.includes(sku)) wallet.skins.push(sku);
    return;
  }
  if (!wallet.stash.includes(sku) && wallet.stash.length < 4) wallet.stash.push(sku);
}

function listGoods(): void {
  const parsed = parseSku(($("market-sku") as HTMLSelectElement).value);
  if (!parsed) {
    marketMsg = "Nothing to list. Buy a skin or finish a match with fountain items.";
    paintMarket();
    return;
  }
  if (wallet.listings.some((l) => l.kind === parsed.kind && l.sku === parsed.sku)) {
    marketMsg = "That is already on the board.";
    paintMarket();
    return;
  }
  const price = clampAsk(Number(($("market-price") as HTMLInputElement).value));
  if (!takeListing(parsed.kind, parsed.sku)) {
    marketMsg = "You do not have that in the locker.";
    paintMarket();
    return;
  }
  wallet.listings.unshift(makeListing(parsed.kind, parsed.sku, price, marketSeller()));
  saveWallet();
  sfx.click();
  marketMsg = `Listed ${goodsName(parsed.kind, parsed.sku)} for ${price} coins. 1% of the sale goes to ${devCredit()}.`;
  ($("market-price") as HTMLInputElement).value = "";
  paintMarket();
  paintWallet();
}

function pullListing(id: string): void {
  const l = wallet.listings.find((x) => x.id === id);
  if (!l) return;
  wallet.listings = wallet.listings.filter((x) => x.id !== id);
  giveGoods(l.kind, l.sku);
  saveWallet();
  sfx.click();
  marketMsg = `Pulled ${goodsName(l.kind, l.sku)} back to your locker.`;
  paintMarket();
  paintWallet();
}

function buyListing(id: string): void {
  const l = boardOf(wallet.listings, wallet.marketGone).find((x) => x.id === id);
  if (!l) return;
  if (wallet.listings.some((x) => x.id === id)) {
    marketMsg = "That is your listing. Pull it if you want it back.";
    paintMarket();
    return;
  }
  if (l.kind === "skin" && ownsSkin(l.sku)) {
    marketMsg = `You already have ${goodsName(l.kind, l.sku)}.`;
    paintMarket();
    return;
  }
  if (l.kind === "item" && (wallet.stash.includes(l.sku) || wallet.stash.length >= 4)) {
    marketMsg = wallet.stash.includes(l.sku)
      ? `You already have ${goodsName(l.kind, l.sku)} in the locker.`
      : "Locker holds four fountain items. Sell or pull one first.";
    paintMarket();
    return;
  }
  if (wallet.coins < l.price) {
    marketMsg = `Need ${l.price} coins. You have ${wallet.coins}.`;
    paintMarket();
    return;
  }
  wallet.coins -= l.price;
  const cut = takeEscrowCut(l.price, "coins");
  giveGoods(l.kind, l.sku);
  wallet.marketGone.push(l.id);
  saveWallet();
  sfx.coin();
  marketMsg = `Bought ${goodsName(l.kind, l.sku)} from ${l.seller} for ${l.price} coins. 1% (${cut}) to ${devCredit()}.`;
  paintMarket();
  paintWallet();
  paintStore();
}

function npcBuy(l: Listing): void {
  wallet.listings = wallet.listings.filter((x) => x.id !== l.id);
  const cut = takeEscrowCut(l.price, "coins");
  const net = Math.max(0, l.price - cut);
  wallet.coins += net;
  saveWallet();
  sfx.coin();
  marketMsg = `${l.seller === marketSeller() ? "A campus buyer" : l.seller} bought your ${goodsName(l.kind, l.sku)} for ${l.price} coins. You took ${net} after 1% (${cut}) to ${devCredit()}.`;
}

function tickMarket(): void {
  const now = Date.now();
  const ripe = wallet.listings.find((l) => now - l.listed >= NPC_BUY_MS);
  if (ripe) npcBuy(ripe);
  restockT += 1;
  if (restockT >= 18 && wallet.marketGone.length) {
    restockT = 0;
    wallet.marketGone.shift();
    if (!ripe) marketMsg = "A campus listing came back on the board.";
    saveWallet();
  }
}

function salvageBag(): void {
  if (salvaged) return;
  salvaged = true;
  if (liveWatch || spectating) return;
  const next: string[] = [];
  for (const id of game.bag()) {
    if (!next.includes(id) && next.length < 4) next.push(id);
  }
  wallet.stash = next;
  saveWallet();
}

function recordLeague(h: Hud): void {
  if (leagueLogged) return;
  if (h.screen !== "victory" && h.screen !== "defeat") return;
  leagueLogged = true;
  if (liveWatch || spectating) {
    lastHeatNote = "Watch and the gallery do not take locker coins.";
    return;
  }
  const win = h.screen === "victory";
  const { k, d, a } = parseKda(h.kda);
  if (win) wallet.kirkCup.maga += 1;
  else wallet.kirkCup.antifa += 1;
  if (win) wallet.kirkCup.youWins += 1;
  else wallet.kirkCup.youLosses += 1;
  wallet.kirkCup.kills += k;
  wallet.kirkCup.deaths += d;
  wallet.kirkCup.assists += a;
  const user = wallet.tangledVerified ? wallet.tangledUser : "";
  if (user) {
    const i = wallet.tangledLeague.findIndex((r) => r.user === user);
    const cur = i >= 0 ? wallet.tangledLeague[i]! : emptyRow(user);
    const next = bumpRow(cur, win, k, d, a);
    if (i >= 0) wallet.tangledLeague[i] = next;
    else wallet.tangledLeague.unshift(next);
  }
  refreshHeat();
  const notes: string[] = [];
  let coins = win ? WIN_COIN : LOSS_COIN;
  notes.push(win ? `Win +${WIN_COIN}` : `Show up +${LOSS_COIN}`);
  if (win) {
    wallet.winStreak += 1;
    wallet.bestWinStreak = Math.max(wallet.bestWinStreak, wallet.winStreak);
    const extra = streakBonus(wallet.winStreak);
    if (extra > 0) {
      coins += extra;
      notes.push(`${wallet.winStreak} streak +${extra}`);
    }
    if (wallet.lastWinDay !== campusDay()) {
      coins += FIRST_WIN_COIN;
      notes.push(`First win +${FIRST_WIN_COIN}`);
      wallet.lastWinDay = campusDay();
    }
  } else {
    wallet.winStreak = 0;
  }
  const quested = tickQuests(wallet.heatQuests, {
    cs: h.cs,
    kills: k,
    towers: h.towers,
    win,
  });
  wallet.heatQuests = quested.quests;
  coins += quested.coins;
  notes.push(...quested.notes);
  wallet.heatMatches += 1;
  wallet.coins += coins;
  lastHeatNote = `${notes.join(" · ")} · locker +${coins} coins.`;
  saveWallet();
}

function openLeague(tab: "kirk" | "tangled"): void {
  leagueTab = tab;
  paintLeague();
  showPage("league");
  sfx.click();
}

function paintLeague(): void {
  for (const el of $("league-tabs").querySelectorAll("button[data-ltab]")) {
    const on = (el as HTMLElement).dataset.ltab === leagueTab;
    el.className = on ? "gold" : "thin";
  }
  $("league-kirk").hidden = leagueTab !== "kirk";
  $("league-tangled").hidden = leagueTab !== "tangled";
  const k = wallet.kirkCup;
  $("kirk-split").textContent = `MAGA Washington DC ${k.maga} · Antifa Seattle ${k.antifa}. Spectators and Watch AI do not count.`;
  const you = displayHandle(wallet.handle) || displayHandle(wallet.tangledUser) || "You";
  $("kirk-board").innerHTML = `
    <li class="on"><b>—</b><span>${you}</span><em>${k.youWins}-${k.youLosses}</em><em>K/D/A ${k.kills} / ${k.deaths} / ${k.assists} · K.D.R ${leagueKdr(k.kills, k.deaths)}</em></li>
    <li><b>—</b><span class="maga">MAGA · Washington DC</span><em>${k.maga} wins</em></li>
    <li><b>—</b><span class="antifa">Antifa · Seattle</span><em>${k.antifa} wins</em></li>`;
  const youT = wallet.tangledVerified ? wallet.tangledUser : "";
  $("tangled-league-you").textContent = "Campus circuit board. Your locker handle sits Kirk Cup.";
  const board = mergeTangledBoard(wallet.tangledSaved, wallet.tangledLeague);
  $("tangled-board").innerHTML = board
    .map((r, i) => {
      const on = r.user === youT;
      return `<li class="${on ? "on" : ""}"><b>${i + 1}</b><span>${displayHandle(r.user)}</span><em>${r.wins}-${r.losses} · ${leaguePts(r)} pts</em><em>K/D/A ${r.kills} / ${r.deaths} / ${r.assists} · K.D.R ${leagueKdr(r.kills, r.deaths)}</em></li>`;
    })
    .join("");
}

function openMarket(): void {
  sfx.click();
  paintMarket();
  showPage("market");
}

function matchPeople(): ChatPerson[] {
  const out: ChatPerson[] = [];
  seats.forEach((s, i) => {
    if (s.status === "OPEN") return;
    out.push({ id: `seat-${s.team}-${i}`, name: s.name, team: s.team });
  });
  specs.forEach((s, i) => {
    if (s.status === "OPEN") return;
    out.push({ id: `spec-${i}`, name: s.name, team: "spec" });
  });
  return out;
}

function syncChatColors(): void {
  assignMatchColors(matchPeople());
}

function lineHtml(c: ChatLine): string {
  if (c.sys || c.kind === "sys") return `<div class="line sys">${escChat(c.text)}</div>`;
  const kind: ChatKind = c.kind === "talk" ? "talk" : "type";
  const ch = c.channel === "team" ? " team" : c.channel === "all" ? " all" : "";
  const tag = c.channel === "team" ? "team" : c.channel === "all" ? "all" : kind === "talk" ? "talk" : "";
  const side = chatTeamTag(c.who);
  const sideHtml = side ? `<span class="side">[${side}]</span>` : "";
  const tagHtml = tag ? ` <em>${tag}</em>` : "";
  return `<div class="line ${kind}${ch}">${sideHtml}<b class="who" style="color:${chatNameColor(c.who)}">${escChat(c.who)}</b>: <span class="msg">${escChat(c.text)}</span>${tagHtml}</div>`;
}

function escChat(s: string): string {
  return s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] ?? ch);
}

function chatNearBottom(box: HTMLElement): boolean {
  return box.scrollHeight - box.scrollTop - box.clientHeight < 28;
}

function paintChatBox(box: HTMLElement, more: HTMLElement | null): void {
  const stick = chatNearBottom(box);
  box.innerHTML = chat.map(lineHtml).join("");
  if (stick) {
    box.scrollTop = box.scrollHeight;
    if (more) more.hidden = true;
  } else if (more) {
    more.hidden = false;
  }
}

function paintChat(): void {
  if (chat.length > CHAT_CAP) chat.splice(0, chat.length - CHAT_CAP);
  paintChatBox($("chat"), document.getElementById("chat-new"));
  paintChatBox($("live-log"), document.getElementById("live-new"));
}

function paintChatControls(): void {
  const spec = isSpectator();
  $("chat-talk").hidden = spec;
  $("mic-row").hidden = spec;
  ($("chat-in") as HTMLInputElement).placeholder = spec
    ? "Type message..."
    : "Type message...";
  $("btn-draft").textContent = spec ? "Watch this match" : "Enter draft";
  $("btn-sit-spec").textContent = ownsSpec() ? "Sit in gallery" : "Buy gallery seat · 100,000 MLX";
  $("live-chat").hidden = page !== "play";
  $("live-form").hidden = true;
  $("live-kicker").textContent = spectating
    ? "Spectator · type only · no mic"
    : "Type · /concede if MAGA is losing · T team mic · G all mic";
  ($("live-in") as HTMLInputElement).placeholder = "Type message...";
}

function isSpectator(): boolean {
  return spectating || isSpecYou();
}

function canMicTalk(): boolean {
  if (isSpectator()) return false;
  return page === "wait" || page === "draft" || page === "play";
}

function dropMic(): void {
  holdTeam = false;
  holdAll = false;
  lastMicLine = "";
  mic.hangup();
  paintMic();
}

function paintMic(): void {
  const on = canMicTalk() && !!mic.channel;
  $("mic-hud").hidden = !on;
  if (!on) return;
  $("mic-hud").classList.toggle("all", mic.channel === "all");
  $("mic-tag").textContent = mic.channel === "all" ? "ALL MIC · everyone · hold G" : "TEAM MIC · MAGA · hold T";
  $("mic-level").style.transform = `scaleX(${Math.max(0.08, mic.level)})`;
}

function warnSpecMic(): void {
  const now = performance.now();
  if (now - specMicWarn < 4000) return;
  specMicWarn = now;
  sys("Spectators type. They cannot Talk on the mic.");
  paintChat();
}

function postMicOpen(channel: MicChannel): void {
  if (!canMicTalk()) return;
  const line = channel === "all" ? "all mic" : "team mic";
  const key = `${channel}:${line}`;
  if (lastMicLine === key) return;
  lastMicLine = key;
  bumpYouAct();
  chat.push({ who: youLabel(false), text: line, kind: "talk", channel });
  paintChat();
}

async function syncMic(): Promise<void> {
  const channel: MicChannel | null = holdAll ? "all" : holdTeam ? "team" : null;
  if (!channel) {
    lastMicLine = "";
    mic.release();
    paintMic();
    return;
  }
  if (!canMicTalk()) {
    dropMic();
    if (isSpectator()) warnSpecMic();
    return;
  }
  armSound();
  const was = mic.channel;
  const result = await mic.press(channel);
  if (!canMicTalk()) {
    dropMic();
    if (isSpectator()) warnSpecMic();
    return;
  }
  if (result === "denied") {
    dropMic();
    sys(mic.error || "Allow the microphone to Talk. T is team. G is everyone.");
    paintChat();
    return;
  }
  if (result === "ok" && mic.channel && mic.channel !== was) postMicOpen(mic.channel);
  paintMic();
}

function setMicKey(channel: MicChannel, down: boolean): void {
  if (!canMicTalk()) {
    dropMic();
    if (down && isSpectator()) warnSpecMic();
    return;
  }
  if (channel === "team") holdTeam = down;
  else holdAll = down;
  void syncMic();
}

mic.heard((text, channel, confidence) => {
  if (!canMicTalk()) {
    dropMic();
    return;
  }
  bumpYouAct();
  if (page === "play") game.keepAlive();
  sfx.hearFactionPhrase(text, confidence);
  chat.push({ who: youLabel(false), text, kind: "talk", channel });
  paintChat();
});

function specStatus(s: Seat): string {
  if (s.status === "YOU") return "YOU";
  if (s.status === "OPEN" && !ownsSpec()) return "LOCKED";
  return s.status;
}

function paintSeats(): void {
  const maga = seats.filter((s) => s.team === "maga");
  const antifa = seats.filter((s) => s.team === "antifa");
  const row = (s: Seat, i: number, kind: "maga" | "antifa" | "spec") => {
    const locked = kind === "spec" && s.status === "OPEN" && !ownsSpec();
    const idx = kind === "spec" ? i : seats.indexOf(s);
    const idle = kind !== "spec" && isIdle(s, waitT);
    const voting = kind !== "spec" && kickVote?.name === s.name;
    const campus = kind !== "spec" && isCampusSeat(s);
    const attr =
      kind === "spec"
        ? `data-spec="${i}"`
        : kind === "maga" && i === 0
          ? `data-maga="0"`
          : idle || voting
            ? `data-kick="${idx}"`
            : "";
    const tag = locked || idle || voting ? "button" : "div";
    const typeAttr = tag === "button" ? ` type="button"` : "";
    const mark = voting ? "KICK" : idle ? "IDLE" : campus ? "IN" : kind === "spec" ? specStatus(s) : s.status;
    return `
    <${tag} class="seat${s.status === "YOU" ? " you" : ""}${locked ? " locked" : ""}${idle ? " idle" : ""}${voting ? " kick" : ""}${campus ? " campus" : ""}" ${attr}${typeAttr}>
      <i class="swatch" style="background:${s.hex}"></i>
      <div><b>${s.name}</b><i>${s.color}</i></div>
      <em>${mark}</em>
    </${tag}>`;
  };
  $("seats-maga").innerHTML = maga.map((s, i) => row(s, i, "maga")).join("");
  $("seats-antifa").innerHTML = antifa.map((s, i) => row(s, i, "antifa")).join("");
  $("seats-spec").innerHTML = specs.map((s, i) => row(s, i, "spec")).join("");
  const party = `${joinedCount(seats)}/${MATCH_SEATS}`;
  $("wait-sub").textContent = `${party} on the field · five seats a side · @blake and @lilhooligan already in · @blake plays when he wants. Idle seats: click to kick, or /kick name.`;
  const queueParty = document.querySelector("#queue-party");
  const queueSearch = document.querySelector("#queue-search");
  if (queueParty) queueParty.textContent = `Party ${party} · MAGA seat 1 is you`;
  if (queueSearch) {
    queueSearch.textContent = joinedCount(seats) >= MATCH_SEATS ? "Lobby full · enter draft" : "Searching for match…";
  }
  paintCampusCopy();
  $("spec-lede").textContent = ownsSpec()
    ? `You own a spectator seat. Sit in the gallery to type — no Talk, no mic. ${mlxAmt(SPEC_MLX)} MLX Millix only.`
    : `Gallery seats cost ${mlxAmt(SPEC_MLX)} MLX. Millix only. Spectators type in chat and cannot Talk on the mic.`;
  syncChatColors();
  paintChat();
  paintChatControls();
  paintKick();
}

function sys(text: string): void {
  chat.push({ who: "SYS", text, sys: true, kind: "sys" });
}

function paintKick(): void {
  $("kick-box").hidden = false;
  if (!kickVote) {
    const idle = seats.filter((s) => isIdle(s, waitT)).map((s) => s.name);
    $("kick-lede").textContent = idle.length
      ? `Idle: ${idle.join(", ")}. Click a seat or type /kick name. Majority of the room (at least 2).`
      : "Players who sit silent for 8 seconds go idle. Click an IDLE seat or type /kick name. Spectators cannot vote. @blake and @lilhooligan cannot be kicked.";
    $("btn-kick-yes").hidden = true;
    $("btn-kick-no").hidden = true;
    return;
  }
  $("btn-kick-yes").hidden = false;
  $("btn-kick-no").hidden = false;
  $("kick-lede").textContent = `Kick ${kickVote.name} for idle? ${kickVote.yes.length}/${kickVote.need} yes · ${kickVote.no.length} no. /yes or /no.`;
}

function bumpYouAct(): void {
  const you = seats.find((s) => s.status === "YOU");
  if (you) you.acted = waitT;
}

function startKick(raw: string): void {
  if (isSpecYou()) {
    sys("Spectators cannot start a kick vote.");
    return;
  }
  if (kickVote) {
    sys(`A kick vote on ${kickVote.name} is already open.`);
    return;
  }
  const seat = findIdle(seats, raw, waitT);
  if (!seat) {
    sys("No idle player by that name. They have to sit silent first.");
    return;
  }
  if (isCampusSeat(seat)) {
    sys("@blake and @lilhooligan sit campus every match. They cannot be kicked.");
    return;
  }
  const who = youLabel(false);
  kickVote = {
    name: seat.name,
    yes: [who],
    no: [],
    need: voteNeed(seats, seat.name),
    start: waitT,
    pulse: 0,
  };
  sys(`Kick vote on ${seat.name} for idle. ${kickVote.yes.length}/${kickVote.need} to pass.`);
  finishKickIfReady();
}

function castKick(side: "yes" | "no"): void {
  if (!kickVote) {
    sys("No kick vote open.");
    return;
  }
  if (isSpecYou()) {
    sys("Spectators cannot vote.");
    return;
  }
  const who = youLabel(false);
  if (hasVoted(kickVote, who)) {
    sys("You already voted.");
    return;
  }
  if (side === "yes") kickVote.yes.push(who);
  else kickVote.no.push(who);
  sys(`${who} voted ${side} on kicking ${kickVote.name}. ${kickVote.yes.length}/${kickVote.need}.`);
  finishKickIfReady();
}

function finishKickIfReady(): void {
  if (!kickVote) return;
  if (kickVote.yes.length >= kickVote.need) {
    const name = kickVote.name;
    const seat = seats.find((s) => s.name === name);
    kickVote = null;
    if (seat) {
      if (isCampusSeat(seat)) {
        sys("@blake and @lilhooligan sit campus every match.");
        paintSeats();
        return;
      }
      seat.status = "BOT";
      seat.name = `[AI] ${seat.color}`;
      seat.acted = waitT;
    }
    sys(`${name} was kicked for idle. A bot sat.`);
    return;
  }
  const left = voters(seats, kickVote.name).filter((n) => !hasVoted(kickVote!, n)).length;
  if (kickVote.yes.length + left < kickVote.need) {
    sys(`Kick vote on ${kickVote.name} failed.`);
    kickVote = null;
  }
}

function autoKickVote(): void {
  if (!kickVote) return;
  const who = voters(seats, kickVote.name).find((n) => !hasVoted(kickVote!, n) && n !== youLabel(false));
  if (!who) return;
  kickVote.yes.push(who);
  sys(`${who} voted yes on kicking ${kickVote.name}. ${kickVote.yes.length}/${kickVote.need}.`);
  finishKickIfReady();
}

function handleConcedeChat(text: string): boolean {
  if (page !== "play") return false;
  const line = text.trim();
  if (/^\/(?:concede|gg|ff)$/iu.test(line)) {
    if (isSpectator() || spectating) {
      sys("Spectators cannot call concede.");
      paintChat();
      return true;
    }
    game.callConcede();
    sys("Concede vote sent. Every MAGA player must vote yes.");
    paintChat();
    return true;
  }
  if (/^\/yes$/iu.test(line)) {
    if (isSpectator() || spectating) {
      sys("Spectators cannot vote on concede.");
      paintChat();
      return true;
    }
    game.voteConcede(true);
    return true;
  }
  if (/^\/no$/iu.test(line)) {
    if (isSpectator() || spectating) {
      sys("Spectators cannot vote on concede.");
      paintChat();
      return true;
    }
    game.voteConcede(false);
    return true;
  }
  return false;
}

function handleKickChat(text: string): boolean {
  if (page !== "wait") return false;
  const line = text.trim();
  const kick = line.match(/^\/kick(?:\s+(.*))?$/iu);
  if (kick) {
    startKick(kick[1] ?? "");
    return true;
  }
  if (/^\/yes$/iu.test(line)) {
    castKick("yes");
    return true;
  }
  if (/^\/no$/iu.test(line)) {
    castKick("no");
    return true;
  }
  return false;
}

function postChat(text: string, kind: ChatKind): void {
  const line = text.trim();
  if (!line) return;
  if (handleKickChat(line)) return;
  if (handleConcedeChat(line)) return;
  if (kind === "talk" && isSpectator()) return;
  bumpYouAct();
  const who = isChatTestMode()
    ? (seats.find((s) => s.status === "YOU")?.name ?? youLabel(isSpecYou() || spectating))
    : youLabel(isSpecYou() || spectating);
  chat.push({ who, text: line, kind });
}

function vacateYou(): void {
  for (const s of seats) {
    if (s.status === "YOU") restoreCampus(s, blakeOnMaga());
  }
  for (const s of specs) {
    if (s.status === "YOU") {
      s.status = "OPEN";
      s.name = s.color;
    }
  }
}

function nameYou(): void {
  const you = seats.find((s) => s.status === "YOU") ?? specs.find((s) => s.status === "YOU");
  if (!you) return;
  you.name = youLabel(you.team === "spec");
}

function sitMaga(): void {
  if (seats.some((s) => s.team === "maga" && s.status === "YOU")) {
    spectating = false;
    paintSeats();
    return;
  }
  seatCampus(youLabel(false));
  if (!seats.some((s) => s.team === "maga" && s.status === "OPEN")) {
    sys("MAGA is full.");
    paintSeats();
    return;
  }
  vacateYou();
  seatCampus(youLabel(false));
  const seat = seats.find((s) => s.team === "maga" && s.status === "OPEN");
  if (!seat) {
    sys("MAGA is full.");
    paintSeats();
    return;
  }
  seat.status = "YOU";
  nameYou();
  spectating = false;
  sys(`You joined MAGA. ${campusSitLine()} Talk or Type.`);
  paintSeats();
}

function openGalleryStore(): void {
  dlcShelf = "gallery";
  paintStore();
  showPage("store");
  storeMsg(`Spectator seats are ${mlxAmt(SPEC_MLX)} MLX. Millix only. Type in chat. You cannot Talk on the mic.`);
}

function sitSpec(index: number): void {
  if (!ownsSpec()) {
    openGalleryStore();
    return;
  }
  let seat: Seat | undefined = specs[index];
  if (!seat || (seat.status !== "OPEN" && seat.status !== "YOU")) {
    seat = specs.find((s) => s.status === "OPEN") ?? specs.find((s) => s.status === "BOT");
  }
  if (!seat) {
    sys("Gallery is full.");
    paintSeats();
    return;
  }
  vacateYou();
  seatCampus("");
  seat.status = "YOU";
  nameYou();
  spectating = true;
  dropMic();
  sys(`${seat.name} sat in the gallery. Type in chat. You cannot Talk on the mic.`);
  paintSeats();
}

function openWait(): void {
  hideEnterGate();
  stopDemo();
  stopSoundcheck();
  bootMatchAudio();
  void sfx.unlock();
  sfx.click();
  if (wallet.liveBets.length) voidLiveBets();
  lastSettleNote = "";
  bookMsg = "";
  bookMatchId = newId("match");
  matchDraft = null;
  seats = emptySeats();
  specs = emptySpecSeats();
  nameYou();
  seatCampus(youLabel(false));
  resetChatColors();
  chat = [];
  waitT = 0;
  joinI = 0;
  specJoinI = 0;
  spectating = false;
  kickVote = null;
  lastIdleSig = "";
  sys("You joined MAGA.");
  sys(`${campusSitLine()} They swap sides after each game. Five seats a side. Ten on the field.`);
  sys("Hold T to talk with MAGA on the mic. Hold G to talk to everyone.");
  chat.push({ who: "@lilhooligan", text: "mid.", kind: "talk" });
  if (wallet.clan) sys(`Clan tag on: ${wallet.clan}.`);
  if (handleOf(wallet.handle) === "blake") sys("@blake has the keyboard. P hands it to expert AI when you want.");
  else if (defaultExpertAuto(wallet.handle)) sys("Expert AI will play for you. P toggles the keyboard.");
  else if (canExpertAuto(wallet.handle)) sys("P hands the kit to expert AI when you want.");
  if (isTangledBrowser()) sys(`Tangled browser · ${tangledGoldMin()} gold per minute.`);
  else if (wallet.account) sys(`${wallet.account.provider === "gmail" ? "Gmail" : wallet.account.provider === "facebook" ? "Facebook" : "Email"} locker · ${baseGoldMin()} gold per minute.`);
  sys("Map: Washington DC (MAGA) vs Seattle (Antifa). Both towns start in their healing pool.");
  sys(
    ownsSpec()
      ? `Wait room is open. Sit in the gallery to type — no Talk, no mic. This tab runs all ten seats. Five seats a side; ${campusSitLine()}`
      : `Wait room is open. Chat while MAGA and Antifa seats fill. ${campusSitLine()} Spectator gallery is ${mlxAmt(SPEC_MLX)} MLX — type only, no Talk, no mic.`,
  );
  sys("Campus Book is open. Three markets. 100 gold a slip. One bet per hour.");
  sys("Idle seats can be kicked. Click IDLE or type /kick name.");
  showPage("wait");
  paintSeats();
  paintBook();
}

function seatTaken(handle: string): boolean {
  const h = handleOf(handle);
  if (!h) return false;
  return seats.some((s) => s.status !== "OPEN" && handleOf(s.name) === h);
}

function fillSpecBots(): void {
  for (const s of specs) {
    if (s.status === "OPEN") {
      s.status = "BOT";
      s.name = `[SPEC] ${s.color}`;
      s.acted = waitT;
    }
  }
}

function fillBots(): void {
  seatCampus(youLabel(false));
  for (const s of seats) {
    if (s.status === "OPEN") {
      s.status = "BOT";
      s.name = `[AI] ${s.color}`;
      s.acted = waitT;
    }
  }
  fillSpecBots();
  sys(`Remaining seats filled with bots. ${campusSitLine()} Gallery spectators type. They cannot Talk on the mic.`);
  paintSeats();
}

function pickTag(h: (typeof HEROES)[number]): string {
  const kit = kitPatch(h.id);
  const role = `${bandLabel(kit.band)} · ${h.role}`;
  if (h.wing === "mma") return `MMA DLC · ${role}`;
  if (h.dlc) return `DLC · ${role}`;
  if (h.wing === "maga") return `Liberty / Tradition · ${role}`;
  if (h.wing === "antifa") return `Progress / Equality · ${role}`;
  return `${attrLabel(h.attr)} · ${role}`;
}

function pickTip(h: (typeof HEROES)[number]): string {
  const kit = kitPatch(h.id);
  const pas = `Passive · ${kit.passive.name}: ${kit.passive.blurb}`;
  const abs = h.abilities.map((a) => `${a.key} ${a.name}: ${a.blurb}`).join(" · ");
  return `${h.name} — ${h.title}. ${pickTag(h)}. ${diffLabel(kit.difficulty)}. ${kit.bio} ${pas} ${abs}`.trim();
}

function youSeat(): string {
  const i = seats.findIndex((s) => s.status === "YOU");
  return `s${i >= 0 ? i : 0}`;
}

function pickButton(h: (typeof HEROES)[number]): string {
  const locked = h.wing === "mma" && !ownsMmaPack();
  const taken = !!matchDraft?.takenByOther(h.id, youSeat());
  const wear = wallet.equipped[h.id];
  const badge = isDevAiOnlyHero(h.id)
    ? `<em class="dlc-badge">DEV</em>`
    : locked
      ? `<em class="dlc-badge">DLC</em>`
    : h.wing === "mma" && ownsMmaPack()
      ? `<em class="dlc-badge owned">OWNED</em>`
      : h.dlc
        ? `<em class="dlc-badge">DLC</em>`
        : "";
  const kit = kitPatch(h.id);
  const basics = h.abilities.filter((a) => a.key !== "R").map((a) => `${a.key} ${a.name}`).join(" · ");
  const ult = h.abilities.find((a) => a.key === "R");
  return `
      <button type="button" class="pick${h.dlc ? " dlc" : ""}${h.wing === "maga" ? " liberty" : ""}${h.wing === "antifa" ? " progress" : ""}${h.wing === "mma" ? " mma" : ""}${locked ? " locked" : ""}${taken ? " taken" : ""}${h.id === picked ? " on" : ""}" data-id="${h.id}" title="${pickTip(h)}">
        ${taken ? `<em class="pick-taken">TAKEN</em>` : ""}
        ${badge}
        ${artImg("hero", h.id, h.name, "hero-art", wear)}
        <span class="pick-model">C42 PIXEL · ${h.role.toUpperCase()}</span>
        <span>${pickTag(h)}</span>
        <span class="pick-diff">${diffStars(kit.difficulty)} ${diffLabel(kit.difficulty)}</span>
        <b>${h.name}</b>
        <i>${h.title}</i>
        <em class="pick-bio">${kit.bio}</em>
        <small class="pick-kit"><b>P</b> ${kit.passive.name} · ${basics}${ult ? ` · <b>R</b> ${ult.name}` : ""}</small>
        <i class="dlc-line" data-dlc="${h.id}"></i>
      </button>`;
}

function pickGroup(title: string, cls: string, kits: typeof HEROES): string {
  const id = cls === "maga" ? "pick-liberty" : cls === "antifa" ? "pick-progress" : cls === "mma" ? "pick-mma" : cls === "wild" ? "pick-dlc" : "";
  const mmaState = cls === "mma" ? (ownsMmaPack() ? " mma-card mma-owned" : " mma-card mma-locked") : "";
  const banner =
    cls === "mma"
      ? promoImg("mma-macgregor", ownsMmaPack() ? "dlc" : "millix", "MMA Fighters DLC")
      : cls === "wild"
        ? promoImg("wild-icon", "dlc", "Wildcard DLC")
        : cls === "maga"
          ? promoImg("maga-grumptor", "spotlight", "Liberty / Tradition")
          : cls === "antifa"
            ? promoImg("lw-bitenten", "ultimate", "Progress / Equality")
            : "";
  return `
  <div class="pick-group${cls === "wild" ? " wild-dlc" : ""}${mmaState}"${id ? ` id="${id}"` : ""}>
    <h3 class="${cls}">${title} · ${kits.length}</h3>
    ${banner ? `<div class="promo-row">${banner}</div>` : ""}
    <div class="picks">${kits.map(pickButton).join("")}</div>
  </div>`;
}

function paintPicks(): void {
  const mmaOwned = ownsMmaPack();
  const allowDev = humanMayControlHooli(wallet.handle);
  const pool = allowDev ? HEROES : HUMAN_HEROES;
  const note = allowDev
    ? `<p class="kicker" id="dev-hooli-note">DEV MODE · HERO SELECT · Hooli is available for this locker and AI seats.</p>`
    : "";
  $("picks").innerHTML = [
    note,
    `<div class="roster-band" id="pick-standard"><h2>FREE TO PLAY</h2></div>`,
    pickGroup("Liberty / Tradition — Red", "maga", wingHeroes("maga", pool)),
    pickGroup("Progress / Equality — Blue", "antifa", wingHeroes("antifa", pool)),
    `<div class="roster-band" id="pick-mma-band"><h2>MMA DLC${mmaOwned ? " · OWNED" : ""}</h2></div>`,
    pickGroup(mmaOwned ? "MMA DLC · owned" : "MMA DLC · locked", "mma", wingHeroes("mma", pool)),
    `<div class="roster-band" id="pick-wild-band"><h2>WILDCARDS</h2></div>`,
    pickGroup("WILDCARDS · Unclassified DLC", "wild", wingHeroes("wild", pool)),
  ].join("");
  paintDraftDlc();
}

function paintDraftDlc(): void {
  for (const h of HEROES) {
    const line = document.querySelector<HTMLElement>(`[data-dlc="${h.id}"]`);
    if (!line) continue;
    if (h.dlc) {
      const pas = h.passive ? `${h.passive.name}. ${h.passive.blurb} ` : "";
      line.textContent = `${pas}DLC · unclassified / wildcard · playable`;
      continue;
    }
    if (h.wing === "maga") {
      line.textContent = h.passive
        ? `${h.passive.name}. ${h.passive.blurb} Liberty / Tradition. Parody.`
        : "Liberty / Tradition kit. Parody.";
      continue;
    }
    if (h.wing === "antifa") {
      line.textContent = h.passive
        ? `${h.passive.name}. ${h.passive.blurb} Progress / Equality. Parody.`
        : "Progress / Equality kit. Parody.";
      continue;
    }
    if (h.wing === "mma") {
      const owned = ownsMmaPack();
      line.textContent = h.passive
        ? `${h.passive.name}. ${h.passive.blurb} MMA DLC. ${owned ? "OWNED." : "Locked — buy the pack."} Parody.`
        : owned
          ? "MMA DLC. OWNED. Parody."
          : "MMA DLC. Locked — buy the pack. Parody.";
      continue;
    }
    const eq = wallet.equipped[h.id];
    const skin = eq ? skinById(eq) : undefined;
    const owned = DLC.filter((s) => s.hero === h.id && wallet.skins.includes(s.id)).length;
    line.textContent = skin ? `DLC on: ${skin.name}` : owned ? `${owned} extra skins owned` : "Base kit · buy extra skins in the store";
  }
}

paintPicks();
paintKitSheet(picked);
document.querySelector(".draft-jump")?.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest("a");
  if (!a?.hash) return;
  e.preventDefault();
  document.getElementById(a.hash.slice(1))?.scrollIntoView({ block: "start", behavior: "smooth" });
});

function paintKitSheet(id: string): void {
  const sheet = document.querySelector("#kit-sheet");
  if (!sheet) return;
  const h = HEROES.find((k) => k.id === id) ?? HEROES[0]!;
  const kit = kitPatch(h.id);
  const abs = h.abilities
    .map((a) => `<li><kbd>${a.key}</kbd> <b>${a.name}</b> — ${a.blurb}</li>`)
    .join("");
  const wear = wallet.equipped[h.id];
  sheet.innerHTML = `
    ${artImg("hero", h.id, h.name, "kit-art", wear)}
    <div class="kit-sheet-icons">${["P", "Q", "W", "E", "R"].map((k) => abilityImg(h.id, k as "P" | "Q" | "W" | "E" | "R", k)).join("")}</div>
    <p class="kicker">${pickTag(h)} · ${diffStars(kit.difficulty)} ${diffLabel(kit.difficulty)}${h.dlc ? " · DLC" : ""}</p>
    <h3>${h.name}</h3>
    <p class="kit-title">${h.title}</p>
    <p>${kit.bio}</p>
    <p class="kit-passive"><b>Passive · ${kit.passive.name}</b> ${kit.passive.blurb}</p>
    <p class="lede">${kit.personality} ${kit.style}</p>
    <ul class="kit-sheet-abs">${abs}</ul>
    <p class="econ">${h.hp} HP · ${kit.hpRegen}/s · ${h.mana} mana · ${kit.manaRegen}/s · ${h.damage} dmg · ${h.range} range · ${h.ms} MS · ${h.armor} armor · ${kit.mr} MR</p>
  `;
}

function syncPickCards(): void {
  const you = youSeat();
  for (const el of $("picks").querySelectorAll<HTMLElement>(".pick")) {
    const id = el.dataset.id ?? "";
    const taken = !!matchDraft?.takenByOther(id, you);
    el.classList.toggle("on", id === picked);
    el.classList.toggle("taken", taken);
    let tag = el.querySelector(".pick-taken");
    if (taken) {
      if (!tag) {
        tag = document.createElement("em");
        tag.className = "pick-taken";
        tag.textContent = "TAKEN";
        el.appendChild(tag);
      }
    } else if (tag) tag.remove();
  }
}

function markPicked(id: string): boolean {
  const allow = humanMayControlHooli(wallet.handle);
  const next = authorizeHumanHero(id, allow);
  if (matchDraft) {
    const res = matchDraft.accept(youSeat(), next, { human: true, allowDevAi: allow });
    if (!res.ok) return false;
    picked = res.heroId;
  } else {
    picked = next;
  }
  game.pick(picked, wallet.handle);
  syncPickCards();
  paintKitSheet(picked);
  return true;
}

$("picks").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-id]");
  if (!btn?.dataset.id) return;
  const id = btn.dataset.id;
  if (matchDraft?.takenByOther(id, youSeat())) {
    matchDraft.accept(youSeat(), id, { human: true, allowDevAi: humanMayControlHooli(wallet.handle) });
    sfx.click();
    return;
  }
  if (!canSelectHero(id)) {
    sfx.click();
    if (isDevAiOnlyHero(id)) return;
    openMmaUnlock(id);
    return;
  }
  if (!markPicked(id)) return;
  sfx.click();
});

document.querySelector("#btn-random-kit")?.addEventListener("click", () => {
  const you = youSeat();
  const pool = selectableHeroes().filter((h) => !matchDraft || !matchDraft.takenByOther(h.id, you));
  if (!pool.length) return;
  const next = pool[Math.floor(Math.random() * pool.length)]!;
  if (!markPicked(next.id)) return;
  document.getElementById(next.wing === "wild" ? "pick-dlc" : next.wing === "maga" ? "pick-liberty" : next.wing === "antifa" ? "pick-progress" : next.wing === "mma" ? "pick-mma" : "pick-standard")
    ?.scrollIntoView({ block: "start", behavior: "smooth" });
  sfx.click();
});

function isDlcAiMode(): boolean {
  if (typeof location === "undefined") return false;
  return new URLSearchParams(location.search).get("dlc-ai") === "1";
}

function isCastAiMode(): boolean {
  if (typeof location === "undefined") return false;
  return new URLSearchParams(location.search).get("cast-ai") === "1";
}

function beginMatchDraft(): void {
  if (matchDraft) return;
  matchDraft = new MatchDraft();
  const you = youSeat();
  const allowDevAi = humanMayControlHooli(wallet.handle);
  if (canSelectHero(picked)) {
    const res = matchDraft.accept(you, picked, { human: true, allowDevAi });
    if (res.ok) picked = res.heroId;
  }
  if (!matchDraft.heroOf(you)) {
    const open = matchDraft.randomHero(selectableHeroes().map((h) => h.id));
    const id = open && canSelectHero(open) ? open : DEFAULT_KIT;
    const res = matchDraft.accept(you, id, { human: true, allowDevAi });
    if (res.ok) picked = res.heroId;
  }
  game.pick(picked, wallet.handle);
  const pool = freeBotIds();
  for (let i = 0; i < MATCH_SEATS; i++) {
    const seat = `s${i}`;
    if (seat === you) continue;
    matchDraft.assignBot(seat, pool);
  }
}

function draftLineup(): { home: string[]; away: string[] } | null {
  if (!matchDraft) return null;
  const pool = freeBotIds();
  for (let i = 0; i < MATCH_SEATS; i++) {
    if (!matchDraft.heroOf(`s${i}`)) matchDraft.assignBot(`s${i}`, pool);
  }
  const home: string[] = [];
  const away: string[] = [];
  for (let i = 0; i < seats.length && i < MATCH_SEATS; i++) {
    const id = matchDraft.heroOf(`s${i}`);
    if (!id) return null;
    if (seats[i]!.team === "maga") home.push(id);
    else if (seats[i]!.team === "antifa") away.push(id);
  }
  if (home.length !== PLAYERS_PER_TEAM || away.length !== PLAYERS_PER_TEAM) return null;
  return { home, away };
}

function startMatch(watch = false, aiStars = false, kits?: string[]): void {
  if (!watch && !spectating) {
    picked = authorizeHumanHero(picked, humanMayControlHooli(wallet.handle));
    if (!canSelectHero(picked)) {
      sfx.click();
      if (isDevAiOnlyHero(picked)) {
        picked = DEFAULT_KIT;
        game.pick(DEFAULT_KIT);
        return;
      }
      openMmaUnlock(picked);
      return;
    }
  }
  bootMatchAudio();
  sfx.unlock();
  sfx.click();
  lockBook();
  salvaged = false;
  leagueLogged = false;
  lastHeatNote = "";
  const spec = spectating;
  liveWatch = watch || spec;
  if (spec) dropMic();
  const drafted = !kits && !watch && !spec ? draftLineup() : null;
  if (drafted) {
    const mine = matchDraft?.heroOf(youSeat());
    if (mine) picked = mine;
  }
  game.pick(picked, wallet.handle);
  game.wear(wallet.equipped[picked] ?? "");
  showPage("play");
  const homeNames = seats.filter((s) => s.team === "maga").map((s) => s.name);
  const awayNames = seats.filter((s) => s.team === "antifa").map((s) => s.name);
  const roster = aiStars
    ? rosterWithStars(homeNames, awayNames, blakeOnMaga())
    : rosterWithCampus(homeNames, awayNames, blakeOnMaga());
  game.start({
    home: roster.home,
    away: roster.away,
    watch: watch || spec,
    spec,
    stash: watch || spec ? [] : wallet.stash,
    followStars: (watch && !spec) || aiStars,
    kits: kits ?? drafted?.home,
    awayKits: drafted?.away,
    humans: seats
      .filter((s) => s.team === "maga" && (s.status === "YOU" || s.status === "JOINED"))
      .map((s) => s.name),
  });
  matchDraft = null;
  if (!spec) flipCampusSides();
  paintChatControls();
}

function bootChatTest(): void {
  document.body.classList.add("chat-test-open");
  const banners = document.querySelectorAll<HTMLElement>(".chat-test-banner");
  banners.forEach((el) => {
    el.hidden = false;
  });
  seats = emptySeats();
  specs = emptySpecSeats();
  resetChatColors();
  const maga = seats.filter((s) => s.team === "maga");
  const antifa = seats.filter((s) => s.team === "antifa");
  CHAT_TEST_PLAYERS.filter((p) => p.team === "maga").forEach((p, i) => {
    const seat = maga[i];
    if (!seat) return;
    seat.name = p.name;
    seat.status = i === 0 ? "YOU" : "JOINED";
    seat.reserved = false;
    seat.acted = 0;
  });
  CHAT_TEST_PLAYERS.filter((p) => p.team === "antifa").forEach((p, i) => {
    const seat = antifa[i];
    if (!seat) return;
    seat.name = p.name;
    seat.status = "JOINED";
    seat.reserved = false;
    seat.acted = 0;
  });
  chat = [];
  sys("CHAT TEST MODE. Fake 10-player match. Name colours stay put. Live locker is unused.");
  for (const line of CHAT_TEST_LINES) chat.push({ ...line });
  assignMatchColors(matchPeople());
  picked = DEFAULT_KIT;
  const blake = wallet.blakeMaga;
  startMatch(true, true);
  if (wallet.blakeMaga !== blake) {
    wallet.blakeMaga = blake;
    saveWallet();
  }
  paintSeats();
  (window as unknown as { __chatColorAudit?: () => { who: string; color: string; team: string }[] }).__chatColorAudit =
    () =>
      CHAT_TEST_PLAYERS.map((p) => ({
        who: p.name,
        color: chatNameColor(p.name),
        team: chatTeamTag(p.name),
      }));
  window.setTimeout(() => {
    chat.push({ who: "Player01", text: "Hello again", kind: "type" });
    chat.push({ who: "Player04", text: "Need help still", kind: "talk", channel: "team" });
    paintChat();
  }, 700);
}

function watchAi(): void {
  stopSoundcheck();
  bootMatchAudio();
  spectating = false;
  voidLiveBets();
  seats = emptySeats();
  specs = emptySpecSeats();
  resetChatColors();
  nameYou();
  fillBots();
  picked = DEFAULT_KIT;
  startMatch(true, true);
}

function watchCastAi(): void {
  stopSoundcheck();
  bootMatchAudio();
  spectating = false;
  voidLiveBets();
  seats = emptySeats();
  specs = emptySpecSeats();
  resetChatColors();
  nameYou();
  fillBots();
  const home = [...CAST_HOME];
  const away = [...CAST_AWAY];
  picked = home[0] ?? DEFAULT_KIT;
  game.pick(picked, wallet.handle);
  showPage("play");
  liveWatch = true;
  const homeNames = ["Hooli", "Ricky", "Steven Hawkin", "Joe Rogan", "The Icon"];
  const awayNames = away.map((id) => heroById(id).name);
  game.start({
    home: homeNames,
    away: awayNames,
    watch: true,
    followStars: true,
    kits: home,
    awayKits: [...away],
  });
  paintChatControls();
  (window as unknown as { __castAudit?: () => ReturnType<Game["heroCard"]> }).__castAudit = () => game.heroCard();
}

function watchDlcAi(): void {
  stopSoundcheck();
  bootMatchAudio();
  spectating = false;
  voidLiveBets();
  seats = emptySeats();
  specs = emptySpecSeats();
  resetChatColors();
  nameYou();
  fillBots();
  const kits = dlcMatchKits();
  picked = kits[0]?.id ?? DEFAULT_KIT;
  startMatch(true, true, kits.map((h) => h.id));
}

function startDemo(): void {
  demoLive = true;
  demo.pick(DEFAULT_KIT);
  demoBlakeMaga = blakeOnMaga();
  const roster = rosterWithStars([...DEMO_HOME], [...DEMO_AWAY], demoBlakeMaga);
  if (soundArmed) {
    demoSfx.setMuted(false);
    void demoSfx.unlock();
  }
  demo.start({
    home: roster.home,
    away: roster.away,
    watch: true,
    demo: true,
    followStars: true,
  });
  paintDemoCap();
  paintCampusCopy();
}

function stopDemo(): void {
  demoLive = false;
  demo.halt();
  game.halt();
  liveWatch = false;
  paintDemoCap();
}

function paintDemoCap(): void {
  const line = !demoLive
    ? "Demo paused · roster work · click Watch AI when you want a match"
    : soundArmed
      ? `LIVE · 5v5 · hero fight on mid · following ${demo.starTag()} · click to watch`
      : `LIVE · 5v5 · hero fight on mid · click to enter with sound`;
  if ($("demo-cap").textContent !== line) $("demo-cap").textContent = line;
}

document.querySelector("#btn-full")!.addEventListener("click", () => {
  if (!document.fullscreenElement) void document.documentElement.requestFullscreen();
  else void document.exitFullscreen();
});
function leaveMatch(): void {
  $("rage-box").hidden = true;
  salvageBag();
  matchDraft = null;
  spectating = false;
  liveWatch = false;
  voidLiveBets("You left campus. Stakes returned.");
  game.halt();
  game.show("title");
  showPage("enter");
  paintChatControls();
}

function openPractice(): void {
  hideEnterGate();
  stopDemo();
  bootMatchAudio();
  openWait();
  fillBots();
  beginMatchDraft();
  paintPicks();
  paintKitSheet(picked);
  draftBack = "wait";
  showPage("draft");
}

document.querySelector("#btn-play")!.addEventListener("click", openWait);

const betaBox = document.querySelector<HTMLElement>("#beta-box");
const betaStatusEl = document.querySelector<HTMLElement>("#beta-status");
const betaStartBtn = document.querySelector<HTMLButtonElement>("#beta-start");
let betaLink: BetaLink | null = null;
navReady = true;

function cancelBeta(): void {
  if (page === "play") return;
  betaLink?.leave();
  betaLink = null;
  if (betaStartBtn) betaStartBtn.hidden = true;
  setBetaStatus("Left the beta queue.");
  refreshNav();
}

function setBetaStatus(line: string): void {
  if (betaStatusEl) betaStatusEl.textContent = line;
}

document.querySelector("#btn-beta")?.addEventListener("click", () => {
  if (!betaBox) return;
  betaBox.hidden = !betaBox.hidden;
  sfx.click();
  refreshNav();
});

document.querySelector("#beta-join")?.addEventListener("click", () => {
  const code = document.querySelector<HTMLInputElement>("#beta-code")?.value.trim() ?? "";
  const name = document.querySelector<HTMLInputElement>("#beta-name")?.value.trim() || "Tester";
  if (!code) {
    setBetaStatus("Enter the invite code.");
    return;
  }
  sfx.unlock();
  sfx.click();
  betaLink = new BetaLink({
    status: setBetaStatus,
    authed: (role) => {
      if (betaStartBtn) betaStartBtn.hidden = role !== "admin";
      setBetaStatus(role === "admin" ? "Admin code accepted. Waiting for the queue." : "Code accepted. Waiting for the queue.");
    },
    queue: (players, need) => setBetaStatus(`In queue. ${players} of ${need} ready.`),
    start: (msg) => {
      bootMatchAudio();
      sfx.unlock();
      showPage("play");
      const kit = msg.seat >= 5 ? msg.awayKits[msg.seat - 5] : msg.homeKits[Math.max(0, msg.seat)];
      if (kit) game.pick(kit, name);
      game.start({
        home: msg.homeNames,
        away: msg.awayNames,
        watch: msg.seat < 0,
        spec: msg.seat < 0,
        kits: msg.homeKits,
        awayKits: msg.awayKits,
        humans: [name],
      });
      game.followServer(msg.seat);
      game.onRemoteOrder = (order) => betaLink?.order(order);
      setBetaStatus(msg.seat < 0 ? "Watching the beta match." : `Seat ${msg.seat + 1}. The server runs the match.`);
    },
    snap: (msg) => game.applySnap(msg.snap),
    end: (winner) => setBetaStatus(winner ? `Match over. ${winner === "home" ? "Washington DC" : "Seattle"} took the town.` : "Match over."),
    lobby: () => {
      showPage("enter");
      if (betaBox) betaBox.hidden = false;
      setBetaStatus("Back in the queue. Join again when you are ready.");
    },
    denied: () => {
      if (betaStartBtn) betaStartBtn.hidden = true;
    },
  });
  betaLink.connect(code, name);
  refreshNav();
});

document.querySelector("#beta-cancel")?.addEventListener("click", () => {
  sfx.click();
  cancelBeta();
});

betaStartBtn?.addEventListener("click", () => {
  sfx.click();
  betaLink?.admin("start");
  setBetaStatus("Asking the server to start the match.");
});
document.querySelector("#btn-practice")!.addEventListener("click", () => {
  sfx.click();
  openPractice();
});
document.querySelector("#btn-store-wild")!.addEventListener("click", () => {
  dlcShelf = "wild";
  paintStore();
  showPage("store");
});
document.querySelector("#btn-cancel-search")!.addEventListener("click", () => {
  document.querySelector("#btn-leave")?.dispatchEvent(new Event("click"));
});
function openRoster(back: Page = "enter"): void {
  hideEnterGate();
  stopDemo();
  draftBack = back;
  matchDraft = null;
  paintPicks();
  showPage("draft");
}

document.querySelector("#btn-roster")!.addEventListener("click", () => {
  sfx.click();
  openRoster("enter");
});
document.querySelector("#btn-watch")!.addEventListener("click", watchAi);
$("demo-wrap").addEventListener("click", watchAi);
$("handle-form").addEventListener("submit", (e) => {
  e.preventDefault();
  wallet.handle = cleanHandle(($("handle-in") as HTMLInputElement).value);
  saveWallet();
  paintHandle();
  if (!canSelectHero(picked)) {
    picked = DEFAULT_KIT;
    game.pick(DEFAULT_KIT);
  }
  paintPicks();
  sfx.click();
});
$("btn-facebook").addEventListener("click", () => {
  sfx.click();
  openSocial("facebook");
});
$("btn-gmail").addEventListener("click", () => {
  sfx.click();
  openSocial("gmail");
});
$("btn-social-cancel").addEventListener("click", () => {
  sfx.click();
  closeSocial();
});
$("social-box").addEventListener("click", (e) => {
  if (e.target === $("social-box")) closeSocial();
});

function paintScore(): void {
  const rows = game.scoreboard();
  const line = (r: (typeof rows)[number]) =>
    `<p class="score-row${r.dead ? " dead" : ""}"><span>${r.hero}</span><b>${r.level}</b><span>${r.k}/${r.d}/${r.a}</span><span>${r.cs} cs</span></p>`;
  $("score-home").innerHTML = rows.filter((r) => r.team === "home").map(line).join("");
  $("score-away").innerHTML = rows.filter((r) => r.team === "away").map(line).join("");
  $("score").hidden = false;
}

document.addEventListener("keydown", (e) => {
  if (e.code !== "Tab" || page !== "play") return;
  const target = e.target;
  if (target instanceof Element && target.closest("input, textarea, [contenteditable]")) return;
  e.preventDefault();
  paintScore();
});
document.addEventListener("keyup", (e) => {
  if (e.code !== "Tab") return;
  $("score").hidden = true;
});
$("social-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = ($("social-email") as HTMLInputElement).value;
  const name = ($("social-name") as HTMLInputElement).value;
  const out = loginSocial(socialProvider, email, name);
  if (!out.ok) {
    setSocialMsg(out.reason, true);
    return;
  }
  closeSocial();
  setAccountMsg(`Logged in with ${providerLabel(out.session.provider)}.`);
  applyAccount(out.session);
  sfx.unlock();
});
$("email-signup").addEventListener("submit", (e) => {
  e.preventDefault();
  void (async () => {
    const out = await signupEmail(
      ($("email-new") as HTMLInputElement).value,
      ($("email-pass") as HTMLInputElement).value,
      ($("email-pass2") as HTMLInputElement).value,
      ($("email-name") as HTMLInputElement).value,
    );
    if (!out.ok) {
      setAccountMsg(out.reason, true);
      return;
    }
    ($("email-pass") as HTMLInputElement).value = "";
    ($("email-pass2") as HTMLInputElement).value = "";
    setAccountMsg("Account created on this locker.");
    applyAccount(out.session);
    sfx.unlock();
  })();
});
$("btn-show-email-in").addEventListener("click", () => {
  const form = $("email-login");
  form.hidden = !form.hidden;
  $("btn-show-email-in").textContent = form.hidden
    ? "Already have an email locker? Log in"
    : "Hide email login";
  sfx.click();
});
$("email-login").addEventListener("submit", (e) => {
  e.preventDefault();
  void (async () => {
    const out = await loginEmail(
      ($("email-in") as HTMLInputElement).value,
      ($("email-in-pass") as HTMLInputElement).value,
    );
    if (!out.ok) {
      setAccountMsg(out.reason, true);
      return;
    }
    ($("email-in-pass") as HTMLInputElement).value = "";
    setAccountMsg("Logged in with email.");
    applyAccount(out.session);
    sfx.unlock();
  })();
});
$("btn-account-out").addEventListener("click", () => {
  wallet.account = null;
  saveWallet();
  setAccountMsg("Logged out of this locker. Coins and skins stay.");
  paintWallet();
  sfx.click();
});
document.querySelector("#btn-leave")!.addEventListener("click", () => {
  voidLiveBets("Left the wait room. Stakes returned.");
  showPage("enter");
});
$("book").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-book]");
  if (!btn?.dataset.book) return;
  if (btn.dataset.book === "side") {
    const market = btn.dataset.market as BetMarket | undefined;
    const side = btn.dataset.side;
    if (!market || !side) return;
    sfx.click();
    placeBet(market, side);
  }
});
document.querySelector("#btn-fill")!.addEventListener("click", () => {
  sfx.click();
  fillBots();
});
document.querySelector("#btn-draft")!.addEventListener("click", () => {
  sfx.click();
  if (isSpecYou()) {
    if (joinedCount(seats) < MATCH_SEATS) fillBots();
    else fillSpecBots();
    spectating = true;
    picked = DEFAULT_KIT;
    startMatch(true);
    return;
  }
  if (joinedCount(seats) < MATCH_SEATS) fillBots();
  beginMatchDraft();
  paintPicks();
  paintKitSheet(picked);
  draftBack = "wait";
  showPage("draft");
});
document.querySelector("#btn-watch-wait")!.addEventListener("click", () => {
  spectating = false;
  if (joinedCount(seats) < MATCH_SEATS) fillBots();
  picked = DEFAULT_KIT;
  startMatch(true);
});
document.querySelector("#btn-draft-back")!.addEventListener("click", () => {
  sfx.click();
  leaveDraft();
});
document.querySelector("#btn-lock")!.addEventListener("click", () => startMatch());
document.querySelector("#btn-mma-mlx")?.addEventListener("click", () => {
  sfx.click();
  buyMmaWithMillix();
});
document.querySelector("#btn-mma-std")?.addEventListener("click", () => {
  sfx.click();
  buyMmaStandard();
});
document.querySelector("#btn-mma-cancel")?.addEventListener("click", () => {
  sfx.click();
  closeMmaUnlock();
});
document.querySelector("#btn-store")!.addEventListener("click", () => {
  paintStore();
  showPage("store");
});
document.querySelector("#btn-market")!.addEventListener("click", openMarket);
$("btn-store-market").addEventListener("click", openMarket);
document.querySelector("#btn-clans")!.addEventListener("click", () => {
  paintClans();
  showPage("clans");
});
document.querySelector("#btn-lotto")!.addEventListener("click", () => {
  paintLotto();
  showPage("lotto");
});
document.querySelector("#btn-millix")!.addEventListener("click", () => {
  paintMillix();
  showPage("millix");
});
document.querySelector("#btn-league")!.addEventListener("click", () => openLeague("kirk"));
document.querySelector("#btn-tangled-league")!.addEventListener("click", () => openLeague("tangled"));
$("league-tabs").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-ltab]");
  if (!btn?.dataset.ltab) return;
  leagueTab = btn.dataset.ltab === "tangled" ? "tangled" : "kirk";
  paintLeague();
});
document.querySelector("#btn-patch")!.addEventListener("click", () => {
  patchTab = "play";
  paintPatches();
  showPage("patch");
});
document.querySelector("#btn-faq")!.addEventListener("click", () => {
  paintFaq();
  showPage("faq");
});
document.querySelector("#btn-howto")!.addEventListener("click", () => {
  paintHowto();
  showPage("howto");
});
document.querySelector("#btn-playbook")!.addEventListener("click", () => {
  paintPlaybook();
  showPage("playbook");
});
$("howto-view").addEventListener("click", (e) => {
  const jump = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
  if (jump?.hash) {
    e.preventDefault();
    document.getElementById(jump.hash.slice(1))?.scrollIntoView({ block: "start" });
    return;
  }
  const go = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-howto]");
  if (!go?.dataset.howto) return;
  const next = go.dataset.howto;
  if (next === "play") {
    openWait();
    return;
  }
  if (next === "watch") {
    watchAi();
    return;
  }
  if (next === "skills") {
    paintPlaybook();
    showPage("playbook");
    return;
  }
  if (next === "faq") {
    paintFaq();
    showPage("faq");
  }
});
$("faq-toc").addEventListener("click", (e) => {
  const jump = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#faq-']");
  if (!jump?.hash) return;
  e.preventDefault();
  document.getElementById(jump.hash.slice(1))?.scrollIntoView({ block: "start" });
});
$("playbook-view").addEventListener("click", (e) => {
  const jump = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
  if (jump?.hash) {
    e.preventDefault();
    document.getElementById(jump.hash.slice(1))?.scrollIntoView({ block: "start" });
    return;
  }
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-attr]");
  if (!btn?.dataset.attr) return;
  const next = btn.dataset.attr;
  playbookAttr =
    next === "str" || next === "agi" || next === "int" || next === "maga" || next === "antifa" || next === "wild"
      ? next
      : "all";
  filterPlaybook();
});
$("playbook-view").addEventListener("input", (e) => {
  if ((e.target as HTMLElement).id === "playbook-q") filterPlaybook();
});
$("millix-toc").addEventListener("click", (e) => {
  const jump = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#millix-']");
  if (!jump?.hash) return;
  e.preventDefault();
  document.getElementById(jump.hash.slice(1))?.scrollIntoView({ block: "start" });
});
$("patch-tabs").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-ptab]");
  if (!btn?.dataset.ptab) return;
  patchTab = btn.dataset.ptab === "prev" ? "prev" : "play";
  if (patchTab === "prev" && !prevPatchId) prevPatchId = PATCHES[1]?.id ?? "";
  paintPatches();
});
$("patch-view").addEventListener("click", (e) => {
  const jump = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#gp-']");
  if (jump?.hash) {
    e.preventDefault();
    document.getElementById(jump.hash.slice(1))?.scrollIntoView({ block: "start" });
    return;
  }
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-pid]");
  if (!btn?.dataset.pid) return;
  prevPatchId = btn.dataset.pid;
  paintPatches();
});
document.querySelector("#nav-back")!.addEventListener("click", () => {
  retreat();
});

$("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = $("chat-in") as HTMLInputElement;
  postChat(inp.value, "type");
  inp.value = "";
  paintSeats();
});
$("chat-talk").addEventListener("click", () => {
  const inp = $("chat-in") as HTMLInputElement;
  postChat(inp.value, "talk");
  inp.value = "";
  paintSeats();
});
function bindMicHold(id: string, channel: MicChannel): void {
  const btn = $(id);
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    setMicKey(channel, true);
  });
  btn.addEventListener("pointerup", () => setMicKey(channel, false));
  btn.addEventListener("pointercancel", () => setMicKey(channel, false));
}
bindMicHold("chat-team", "team");
bindMicHold("chat-all", "all");
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (typingTarget(e)) return;
  if (document.body.classList.contains("desk-open")) return;
  if (e.code === "KeyT") {
    e.preventDefault();
    setMicKey("team", true);
  }
  if (e.code === "KeyG") {
    e.preventDefault();
    setMicKey("all", true);
  }
});
window.addEventListener("keyup", (e) => {
  if (e.code === "KeyT") setMicKey("team", false);
  if (e.code === "KeyG") setMicKey("all", false);
});
window.addEventListener("blur", () => {
  holdTeam = false;
  holdAll = false;
  void syncMic();
});
function jumpChat(boxId: string, moreId: string): void {
  const box = $(boxId);
  box.scrollTop = box.scrollHeight;
  const more = document.getElementById(moreId);
  if (more) more.hidden = true;
}
document.getElementById("chat-new")?.addEventListener("click", () => jumpChat("chat", "chat-new"));
document.getElementById("live-new")?.addEventListener("click", () => jumpChat("live-log", "live-new"));
$("live-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = $("live-in") as HTMLInputElement;
  postChat(inp.value, "type");
  inp.value = "";
  paintChat();
});
$("seats-spec").addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-spec]");
  if (el?.dataset.spec == null) return;
  sitSpec(Number(el.dataset.spec));
});
$("seats-maga").addEventListener("click", (e) => {
  const kickEl = (e.target as HTMLElement).closest<HTMLElement>("[data-kick]");
  if (kickEl?.dataset.kick != null) {
    startKick(seats[Number(kickEl.dataset.kick)]?.name ?? "");
    paintSeats();
    return;
  }
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-maga]");
  if (!el) return;
  if (isSpecYou()) sitMaga();
});
$("seats-antifa").addEventListener("click", (e) => {
  const kickEl = (e.target as HTMLElement).closest<HTMLElement>("[data-kick]");
  if (kickEl?.dataset.kick == null) return;
  startKick(seats[Number(kickEl.dataset.kick)]?.name ?? "");
  paintSeats();
});
$("btn-kick-yes").addEventListener("click", () => {
  sfx.click();
  castKick("yes");
  paintSeats();
});
$("btn-kick-no").addEventListener("click", () => {
  sfx.click();
  castKick("no");
  paintSeats();
});
$("btn-sit-spec").addEventListener("click", () => {
  sfx.click();
  if (!ownsSpec()) {
    openGalleryStore();
    return;
  }
  const i = specs.findIndex((s) => s.status === "OPEN");
  sitSpec(i < 0 ? 0 : i);
});
$("btn-sit-maga").addEventListener("click", () => {
  sfx.click();
  sitMaga();
});

function grantSkin(id: string): void {
  if (!wallet.skins.includes(id)) wallet.skins.push(id);
  const skin = skinById(id);
  if (skin && skin.hero !== "all") wallet.equipped[skin.hero] = id;
  paintPicks();
}

function grantBundle(): void {
  for (const s of DLC) grantSkin(s.id);
  if (!wallet.skins.includes(BUNDLE_ID)) wallet.skins.push(BUNDLE_ID);
  if (!wallet.skins.includes(WILD_PACK_ID)) wallet.skins.push(WILD_PACK_ID);
  if (!wallet.skins.includes(MMA_PACK_ID)) wallet.skins.push(MMA_PACK_ID);
  wallet.bundleExpanded = true;
}

function grantWildPack(): void {
  for (const s of wildSkins()) grantSkin(s.id);
  if (!wallet.skins.includes(WILD_PACK_ID)) wallet.skins.push(WILD_PACK_ID);
}

function grantMmaPack(): void {
  if (!wallet.skins.includes(MMA_PACK_ID)) wallet.skins.push(MMA_PACK_ID);
}

function ownsWildPack(): boolean {
  return ownsSkin(WILD_PACK_ID) || wildSkins().every((s) => ownsSkin(s.id));
}

function ownsMmaPack(): boolean {
  return ownsSkin(MMA_PACK_ID) || ownsSkin(BUNDLE_ID);
}

function canSelectHero(id: string): boolean {
  if (!HEROES.some((h) => h.id === id)) return false;
  if (isDevAiOnlyHero(id) && !humanMayControlHooli(wallet.handle)) return false;
  if (isMmaHero(id)) return ownsMmaPack();
  return true;
}

function selectableHeroes(): typeof HEROES {
  return (humanMayControlHooli(wallet.handle) ? HEROES : HUMAN_HEROES).filter((h) => canSelectHero(h.id));
}

function mmaUnlockEl(): HTMLElement | null {
  return document.querySelector("#mma-unlock");
}

function paintMmaUnlock(): void {
  const box = mmaUnlockEl();
  if (!box || box.hidden) return;
  const pence = mmaPackPence();
  const mlx = mmaPackMlx();
  const short = wallet.mlx < mlx;
  const names = wingHeroes("mma");
  const list = box.querySelector("#mma-unlock-names");
  if (list) list.innerHTML = names.map((h) => `<li>${h.name}</li>`).join("");
  const std = box.querySelector("#mma-unlock-std");
  if (std) std.textContent = formatGbp(pence);
  const mlxEl = box.querySelector("#mma-unlock-mlx");
  if (mlxEl) mlxEl.textContent = `${mlxAmt(mlx)} MLX (${mlxFiat(mlx)})`;
  const bal = box.querySelector("#mma-unlock-bal");
  if (bal) bal.textContent = `Your Millix: ${mlxAmt(wallet.mlx)} MLX`;
  const off = box.querySelector("#mma-unlock-off");
  if (off) off.textContent = mlxOffLabel();
  const msg = box.querySelector("#mma-unlock-msg");
  if (msg) msg.textContent = short ? "INSUFFICIENT MILLIX" : "";
  const buy = box.querySelector<HTMLButtonElement>("#btn-mma-mlx");
  if (buy) {
    buy.disabled = short || ownsMmaPack();
    buy.classList.toggle("unavailable", short);
  }
}

function openMmaUnlock(id: string): void {
  if (ownsMmaPack()) {
    if (canSelectHero(id)) markPicked(id);
    return;
  }
  mmaWanted = isMmaHero(id) ? id : wingHeroes("mma")[0]?.id ?? "";
  const box = mmaUnlockEl();
  if (!box) return;
  box.hidden = false;
  paintMmaUnlock();
  box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  refreshNav();
}

function closeMmaUnlock(): void {
  const box = mmaUnlockEl();
  if (box) box.hidden = true;
  refreshNav();
}

function buyMmaWithMillix(): void {
  if (ownsMmaPack()) {
    closeMmaUnlock();
    if (mmaWanted && canSelectHero(mmaWanted)) markPicked(mmaWanted);
    return;
  }
  const mlx = mmaPackMlx();
  if (wallet.mlx < mlx) {
    paintMmaUnlock();
    return;
  }
  pending = { id: MMA_PACK_ID, how: "mlx" };
  queueCharge(mlx, "mlx");
  paintMmaUnlock();
}

function buyMmaStandard(): void {
  if (ownsMmaPack()) {
    closeMmaUnlock();
    return;
  }
  openPay(MMA_PACK_ID, "card");
  const pay = document.querySelector("#paybox");
  if (pay) {
    (pay as HTMLElement).hidden = false;
    pay.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

function storeMsg(text: string): void {
  $("store-msg").textContent = text;
}

let pending: { id: string; how: PayRail } | null = null;

function grantSpec(): void {
  wallet.specSeats += 1;
}

function skuMeta(id: string): { pence: number; name: string; mlx: number; millixOnly?: boolean } | null {
  if (id === SPEC_ID) return { pence: 0, name: SPEC_NAME, mlx: SPEC_MLX, millixOnly: true };
  if (id === BUNDLE_ID) return { pence: bundlePence(), name: "Kit Bundle", mlx: bundleMlx() };
  if (id === WILD_PACK_ID) return { pence: wildPackPence(), name: "Wildcard Pack", mlx: wildPackMlx() };
  if (id === MMA_PACK_ID) return { pence: mmaPackPence(), name: "MMA DLC", mlx: mmaPackMlx() };
  const s = skinById(id);
  return s ? { pence: SKIN_PENCE, name: s.name, mlx: skinMlx() } : null;
}

function closePay(): void {
  pending = null;
  $("paybox").hidden = true;
  $("mlx-invoice").hidden = true;
  $("card-form").hidden = true;
  $("pp-form").hidden = true;
  $("mlx-watch").textContent = "";
  refreshNav();
}

function openPay(id: string, how: PayRail): void {
  const meta = skuMeta(id);
  if (!meta) return;
  if (meta.millixOnly && how !== "mlx") {
    storeMsg(`${meta.name} is Millix only.`);
    return;
  }
  pending = { id, how };
  $("paybox").hidden = false;
  $("pay-title").textContent = meta.name;
  const mlx = meta.mlx;
  $("mlx-watch").textContent = "";
  $("pay-mlx").hidden = how !== "mlx";
  $("card-form").hidden = how !== "card";
  $("pp-form").hidden = how !== "paypal";
  $("mlx-invoice").hidden = false;
  if (how === "mlx") {
    $("pay-rail").textContent = meta.millixOnly ? "Millix node · gallery" : `Millix node · 40% off ${formatGbp(meta.pence)}`;
    $("pay-deal").textContent = meta.millixOnly
      ? `Send ${mlxAmt(mlx)} MLX (${mlxFiat(mlx)}) to the Millix node. Millix only. Type in chat. You cannot Talk on the mic. Seat activates when the node clears.${wallet.mlx < mlx ? " Send from your Millix wallet if this tab is short." : ""}`
      : `Send ${mlxAmt(mlx)} MLX (${mlxFiat(mlx)}) to the Millix node. 40% off ${formatGbp(meta.pence)}. DLC activates when the node clears.${wallet.mlx < mlx ? " Send from your Millix wallet if this tab is short." : ""}`;
    $("pay-dest-label").textContent = "Pay this Millix node";
    $("mlx-node").textContent = MILLIX_NODE;
    $("pay-mlx").textContent = `Send ${mlxAmt(mlx)} MLX to node`;
  } else if (how === "paypal") {
    $("pay-rail").textContent = `PayPal · ${formatGbp(meta.pence)}`;
    $("pay-deal").textContent =
      `Pay ${formatGbp(meta.pence)} via PayPal to ${PAYPAL_EMAIL}. ${devCredit()} take 1% (${formatGbp(devCutOf(meta.pence))}) of this payment. DLC activates when PayPal clears.`;
    $("pay-dest-label").textContent = "PayPal inbox";
    $("mlx-node").textContent = PAYPAL_EMAIL;
    $("pay-pp-btn").textContent = `Send ${formatGbp(meta.pence)} via PayPal`;
  } else {
    $("pay-rail").textContent = `Card · ${formatGbp(meta.pence)}`;
    $("pay-deal").textContent =
      `${formatGbp(meta.pence)} full price. Charge the card. Funds go to ${cardDest()}. ${devCredit()} take 1% (${formatGbp(devCutOf(meta.pence))}) of this charge. DLC activates when that account clears.`;
    $("pay-dest-label").textContent = "Pay this account · D A Cornish";
    $("mlx-node").textContent = cardDest();
    $("pay-card-btn").textContent = `Charge ${formatGbp(meta.pence)}`;
  }
  $("paybox").scrollIntoView({ block: "nearest" });
  refreshNav();
}

const watching = new Set<string>();

function activateCleared(inv: MillixInvoice): void {
  if (inv.status === "cleared") return;
  inv.status = "cleared";
  if (inv.sku === SPEC_ID) grantSpec();
  else if (inv.sku === BUNDLE_ID) grantBundle();
  else if (inv.sku === WILD_PACK_ID) grantWildPack();
  else if (inv.sku === MMA_PACK_ID) grantMmaPack();
  else grantSkin(inv.sku);
  saveWallet();
  sfx.coin();
  storeMsg(clearedCopy(inv));
  closePay();
  paintStore();
  if (inv.sku === MMA_PACK_ID) {
    closeMmaUnlock();
    paintPicks();
    const want = mmaWanted && canSelectHero(mmaWanted) ? mmaWanted : "";
    mmaWanted = "";
    if (want) markPicked(want);
  }
}

function watchInvoice(id: string): void {
  if (watching.has(id)) return;
  const inv = wallet.invoices.find((i) => i.id === id);
  if (!inv || inv.status === "cleared") return;
  watching.add(id);
  $("mlx-watch").textContent = waitCopy(invoiceRail(inv), inv.tx || "…");
  window.setTimeout(() => {
    const cur = wallet.invoices.find((i) => i.id === id);
    if (cur && cur.status !== "cleared") activateCleared(cur);
    watching.delete(id);
  }, 2200);
}

function resumeMillix(): void {
  for (const inv of wallet.invoices) {
    if (inv.status === "sent") watchInvoice(inv.id);
  }
}

function queueCharge(amount: number, rail: PayRail): boolean {
  if (!pending) return false;
  const meta = skuMeta(pending.id);
  if (!meta) return false;
  if (meta.millixOnly && rail !== "mlx") {
    storeMsg(`${meta.name} is Millix only.`);
    return false;
  }
  if (rail === "mlx") {
    if (wallet.mlx < amount) {
      if (pending.id === MMA_PACK_ID) {
        storeMsg("INSUFFICIENT MILLIX");
        paintMmaUnlock();
        return false;
      }
    } else {
      wallet.mlx = Math.max(0, wallet.mlx - amount);
    }
  }
  const cut = takeDevCut(amount, rail);
  const inv = millixInvoice(pending.id, meta.name, amount, rail);
  inv.status = "sent";
  inv.tx = millixTxId();
  wallet.invoices.unshift(inv);
  saveWallet();
  const fee = cut
    ? rail === "mlx"
      ? ` 1% (${mlxAmt(cut)} MLX) to ${devCredit()}.`
      : ` 1% (${formatGbp(cut)}) to ${devCredit()}.`
    : ` 1% to ${devCredit()}.`;
  storeMsg(
    rail === "mlx"
      ? `Sent ${mlxAmt(amount)} MLX to ${shortNode()}.${fee} Waiting for the node to clear…`
      : rail === "paypal"
        ? `PayPal ${formatGbp(amount)} to ${PAYPAL_EMAIL}.${fee} Waiting to clear…`
        : `Card charged ${formatGbp(amount)} to ${cardDest()}.${fee} Waiting to clear…`,
  );
  $("pay-mlx").hidden = true;
  $("card-form").hidden = true;
  $("pp-form").hidden = true;
  watchInvoice(inv.id);
  paintWallet();
  return true;
}

function settle(how: PayRail): boolean {
  if (!pending) return false;
  const meta = skuMeta(pending.id);
  if (!meta) return false;
  if (meta.millixOnly && how !== "mlx") {
    storeMsg(`${meta.name} is Millix only.`);
    return false;
  }
  const amount = how === "mlx" ? meta.mlx : meta.pence;
  return queueCharge(amount, how);
}

function parseRail(how: string | undefined): PayRail {
  if (how === "mlx" || how === "paypal" || how === "card") return how;
  return "card";
}

function specCard(): string {
  const owned = ownsSpec();
  return `<div class="sku">
    <span>Gallery · Millix only</span>
    <i class="swatch fat" style="background:#8a7a5a"></i>
    <b>${SPEC_NAME}</b>
    <i>Sit in the wait-room gallery. Type in chat. You cannot Talk on the mic. Players still Talk.</i>
    <p>Millix ${mlxAmt(SPEC_MLX)} MLX (${mlxFiat(SPEC_MLX)}). No PayPal. No card.</p>
    ${owned
      ? `<em>In locker · ${wallet.specSeats} seat${wallet.specSeats === 1 ? "" : "s"}</em>`
      : `<button data-buy="${SPEC_ID}" data-how="mlx" class="pay">Millix ${mlxAmt(SPEC_MLX)}</button>`}
  </div>`;
}

function skuCard(s: { id: string; name: string; blurb: string; coins?: number; tint?: string; hero?: string }): string {
  const pack = s.id === WILD_PACK_ID;
  const mmaPack = s.id === MMA_PACK_ID;
  const owned = pack ? ownsWildPack() : mmaPack ? ownsMmaPack() : ownsSkin(s.id);
  const on = s.hero ? wallet.equipped[s.hero] === s.id : false;
  const bundle = s.id === BUNDLE_ID;
  const pence = bundle ? bundlePence() : pack ? wildPackPence() : mmaPack ? mmaPackPence() : SKIN_PENCE;
  const mlx = bundle ? bundleMlx() : pack ? wildPackMlx() : mmaPack ? mmaPackMlx() : skinMlx();
  const playable = Boolean(s.id && isWildSkin(s.id));
  const hero = playable ? "playable hero" : pack ? "Wildcard pack" : mmaPack ? "MMA DLC" : s.hero ? HEROES.find((h) => h.id === s.hero)?.name ?? "DLC" : "Bundle";
  const short = mmaPack && wallet.mlx < mlx;
  return `<div class="sku${mmaPack ? " mma-dlc-card" : ""}">
    ${s.hero ? `${playable || pack ? promoImg(s.hero, "millix", s.name, "promo-art sku-promo") : ""}${artImg("hero", s.hero, s.name, "hero-art", s.id)}` : ""}
    <span>${mmaPack ? `MMA DLC · 6 heroes · ${mlxOffLabel()}` : playable || pack ? "DLC · unclassified / wildcard · Millix −40%" : `Downloadable content · ${hero}`}</span>
    <i class="swatch fat" style="background:${s.tint ?? "#c9a24a"}"></i>
    <b>${s.name}</b>
    <i>${s.blurb}</i>
    <p>PayPal / card ${formatGbp(pence)} · Millix ${mlxAmt(mlx)} MLX (${mlxFiat(mlx)}, −40%)</p>
    ${owned
      ? `<em>${mmaPack ? "OWNED" : on ? "In locker · equipped" : "In locker"}</em>${s.hero && !on ? `<button data-eq="${s.id}" class="gold">Equip</button>` : ""}`
      : `${short ? `<em class="mlx-short">INSUFFICIENT MILLIX</em>` : ""}
    <button data-buy="${s.id}" data-how="mlx" class="pay"${short ? " disabled" : ""}>${mmaPack ? "BUY WITH MILLIX" : "Millix −40%"}</button>
    <button data-buy="${s.id}" data-how="paypal" class="gold">PayPal ${formatGbp(pence)}</button>
    <button data-buy="${s.id}" data-how="card" class="red">${mmaPack ? "BUY STANDARD" : `Card ${formatGbp(pence)}`}</button>`}
  </div>`;
}

function mmaPackCard(): string {
  const owned = ownsMmaPack();
  const pence = mmaPackPence();
  const mlx = mmaPackMlx();
  const short = !owned && wallet.mlx < mlx;
  const names = wingHeroes("mma");
  return `<div class="sku mma-dlc-card">
    ${promoImg("mma-macgregor", "millix", "MMA Fighters")}
    <span>MMA FIGHTERS DLC · 6 HEROES</span>
    <b>MMA FIGHTERS</b>
    <i>6 HEROES</i>
    <div class="mma-thumbs">${names.map((h) => artImg("hero", h.id, h.name, "hero-art")).join("")}</div>
    <ul class="mma-roster">${names.map((h) => `<li>${h.name}</li>`).join("")}</ul>
    <p>Standard Price: ${formatGbp(pence)}</p>
    <p>MILLIX Price: ${mlxAmt(mlx)} MLX (${mlxFiat(mlx)})</p>
    <p class="mlx-off-banner">MILLIX OFFER · 40% OFF</p>
    <p class="econ">Your Millix: ${mlxAmt(wallet.mlx)} MLX</p>
    ${owned
      ? `<em>OWNED</em>`
      : `${short ? `<em class="mlx-short">INSUFFICIENT MILLIX</em>` : ""}
    <button data-buy="${MMA_PACK_ID}" data-how="mlx" class="pay"${short ? " disabled" : ""}>BUY WITH MILLIX</button>
    <button data-buy="${MMA_PACK_ID}" data-how="card" class="red">BUY STANDARD</button>`}
  </div>`;
}

let wheelAngle = 0;
let wheelSpin: { from: number; to: number; start: number; dur: number; index: number } | null = null;
let wheelRaf = 0;

function sizeWheel(): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const canvas = document.querySelector<HTMLCanvasElement>("#wheel");
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const css = Math.min(320, Math.floor(canvas.getBoundingClientRect().width) || 320);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const px = Math.max(1, Math.floor(css * dpr));
  if (canvas.width !== px || canvas.height !== px) {
    canvas.width = px;
    canvas.height = px;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: css, h: css };
}

function paintWheelCanvas(): void {
  const sized = sizeWheel();
  if (!sized) return;
  drawWheel(sized.ctx, sized.w, sized.h, wheelAngle, wheelSlices());
}

function paintWheelStatus(): void {
  const btn = $("btn-wheel") as HTMLButtonElement;
  if (wheelSpin) {
    $("wheel-status").textContent = "Spinning. Today’s free spin is already stamped. Not every spin is a winner.";
    btn.disabled = true;
    btn.textContent = "Spinning…";
    return;
  }
  if (wheelLocked(wallet.wheelDay, wallet.wheelDone)) {
    const wait = wheelWaitLabel();
    $("wheel-status").textContent = wallet.wheelLast
      ? `Today’s spin is in: ${wallet.wheelLast}. Next free spin in ${wait}.`
      : `Already spun today. One spin a day. Next free spin in ${wait}.`;
    btn.disabled = true;
    btn.textContent = `Next spin in ${wait}`;
    return;
  }
  $("wheel-status").textContent = "One free spin a day. Miss pays nothing. A new skin drops in the locker. A skin you already own pays 80 coins.";
  btn.disabled = false;
  btn.textContent = "Spin the campus wheel";
}

function landWheel(index: number): void {
  const slices = wheelSlices();
  const slice = slices[clampWheelIndex(index, slices.length)];
  wallet.wheelPending = -1;
  if (!slice) {
    wallet.wheelDay = campusDay();
    wallet.wheelDone = true;
    saveWallet();
    paintWheelStatus();
    return;
  }
  if (isWheelMiss(slice)) {
    wallet.wheelLast = "Miss. No skin. No coins.";
  } else if (ownsSkin(slice.id)) {
    wallet.coins += WHEEL_OWNED_COINS;
    wallet.wheelLast = `${slice.name} already in locker · +${WHEEL_OWNED_COINS} coins`;
  } else {
    grantSkin(slice.id);
    wallet.wheelLast = `${slice.name} · free DLC`;
  }
  wallet.wheelDay = campusDay();
  wallet.wheelDone = true;
  saveWallet();
  if (!isWheelMiss(slice)) sfx.coin();
  storeMsg(wallet.wheelLast);
  paintStore();
}

function tickWheel(now: number): void {
  wheelRaf = 0;
  const spin = wheelSpin;
  if (!spin) return;
  const t = easeOutCubic((now - spin.start) / spin.dur);
  wheelAngle = spin.from + (spin.to - spin.from) * t;
  paintWheelCanvas();
  if (t < 1) {
    wheelRaf = requestAnimationFrame(tickWheel);
    return;
  }
  wheelAngle = spin.to;
  wheelSpin = null;
  paintWheelCanvas();
  landWheel(spin.index);
}

function startWheelSpin(): void {
  if (wheelSpin) return;
  if (wheelLocked(wallet.wheelDay, wallet.wheelDone) && wallet.wheelPending < 0) {
    paintWheelStatus();
    return;
  }
  const slices = wheelSlices();
  const index = clampWheelIndex(wallet.wheelPending, slices.length);
  const turns = 5 + Math.floor(Math.random() * 3);
  const tau = Math.PI * 2;
  const from = wheelAngle;
  const dest = wheelStop(index, slices.length, 0);
  const fromN = ((from % tau) + tau) % tau;
  const destN = ((dest % tau) + tau) % tau;
  const extra = (destN - fromN + tau) % tau;
  const to = from + extra + turns * tau;
  wallet.wheelDay = campusDay();
  wallet.wheelDone = true;
  wallet.wheelPending = index;
  saveWallet();
  wheelSpin = { from, to, start: performance.now(), dur: 4400, index };
  sfx.click();
  paintWheelStatus();
  if (!wheelRaf) wheelRaf = requestAnimationFrame(tickWheel);
}

function paintStore(): void {
  if (wallet.wheelPending >= 0 && !wheelSpin) {
    landWheel(wallet.wheelPending);
    return;
  }
  paintWallet();
  const ownedNames = DLC.filter((s) => ownsSkin(s.id)).map((s) => s.name);
  if (ownsSpec()) ownedNames.unshift(`Spectator seat × ${wallet.specSeats}`);
  const clearing = wallet.invoices.filter((i) => i.status === "sent").map((i) => {
    const r = invoiceRail(i);
    const rail = r === "mlx" ? "Millix node" : r === "paypal" ? "PayPal" : "card";
    return `${i.name} clearing on ${rail}`;
  });
  const bits = [...clearing, ...ownedNames];
  $("locker-list").textContent = bits.length
    ? bits.join(" · ")
    : "Locker empty. Buy extra skins or a spectator seat below. Matches stay free.";
  const tabs = [
    ["all", "All DLC"],
    ["str", "Strength"],
    ["agi", "Agility"],
    ["int", "Intelligence"],
    ["pd", "Public domain"],
    ["mma", "MMA DLC"],
    ["wild", "DLC / Wildcards"],
    ["gallery", "Gallery"],
    ["bundle", "Bundle"],
  ];
  $("store-tabs").innerHTML = tabs
    .map(
      ([id, label]) =>
        `<button type="button" class="${dlcShelf === id ? "gold" : "thin"}" data-shelf="${id}">${label}</button>`,
    )
    .join("");
  const heroShelves = dlcHeroIds().map((id) => {
    const hero = HEROES.find((h) => h.id === id);
    const skins = skinsForHero(id);
    const n = skins.length;
    return {
      id,
      attr: hero?.attr ?? "str",
      title: `${hero?.name ?? id} · ${n} extra skin${n === 1 ? "" : "s"}`,
      body: skins.map(skuCard).join(""),
    };
  });
  const extraShelves = [
    {
      id: "gallery",
      attr: "",
      title: "Spectator gallery",
      body: specCard(),
    },
    {
      id: "bundle",
      attr: "",
      title: "Kit bundle",
      body: skuCard({
        id: BUNDLE_ID,
        name: "Kit Bundle",
        blurb: "Unlock every extra skin still locked — the MMA Fighters DLC (six playable parody fighters), MMA walkouts, Marvel and DC parodies, public-domain looks, and the eight unclassified wildcard heroes (The Icon, The Cartoons, The Reality Dynasty, and the rest of the bottom bar). Half the £1.99 shelf, then Millix still knocks 40% off.",
      }),
    },
  ];
  const pdShelf = {
    id: "pd",
    attr: "",
    title: "Public domain",
    body: pdSkins().map(skuCard).join(""),
  };
  const mmaShelf = {
    id: "mma",
    attr: "",
    title: "MMA FIGHTERS DLC · 6 heroes · 40% OFF WITH MILLIX",
    body: [mmaPackCard(), ...mmaSkins().map(skuCard)].join(""),
  };
  const wildShelf = {
    id: "wild",
    attr: "",
    title: "Unclassified wildcards · eight playable DLC · Millix −40%",
    body: [
      skuCard({
        id: WILD_PACK_ID,
        name: "Wildcard Pack",
        blurb: "Unlock all eight unclassified playable DLC heroes. Half the £1.99 shelf, then Millix still knocks 40% off.",
      }),
      ...wildSkins().map(skuCard),
    ].join(""),
  };
  const show =
    dlcShelf === "gallery" || dlcShelf === "bundle"
      ? extraShelves.filter((s) => s.id === dlcShelf)
      : dlcShelf === "pd"
        ? [pdShelf]
        : dlcShelf === "mma"
          ? [mmaShelf]
          : dlcShelf === "wild"
            ? [wildShelf]
          : dlcShelf === "str" || dlcShelf === "agi" || dlcShelf === "int"
            ? heroShelves.filter((s) => s.attr === dlcShelf)
            : [...heroShelves, mmaShelf, wildShelf, pdShelf, ...extraShelves];
  const promoLead =
    dlcShelf === "mma"
      ? promoImg("mma-macgregor", "millix", "MMA Fighters DLC")
      : dlcShelf === "wild"
        ? promoImg("wild-icon", "dlc", "Wildcard Pack")
        : dlcShelf === "bundle"
          ? promoImg("maga-grumptor", "spotlight", "Kit Bundle")
          : "";
  $("store-list").innerHTML =
    (promoLead ? `<div class="promo-row">${promoLead}</div>` : "") +
    show
      .map((s) => `<section class="shelf"><h3>${s.title}</h3><div class="store-list">${s.body}</div></section>`)
      .join("");
  paintWheelCanvas();
  paintWheelStatus();
}

$("btn-wheel").addEventListener("click", () => {
  startWheelSpin();
});

$("store-tabs").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-shelf]");
  if (!btn?.dataset.shelf) return;
  dlcShelf = btn.dataset.shelf;
  paintStore();
});

$("market-list-form").addEventListener("submit", (e) => {
  e.preventDefault();
  listGoods();
});
$("market-sku").addEventListener("change", () => {
  const parsed = parseSku(($("market-sku") as HTMLSelectElement).value);
  if (parsed) ($("market-price") as HTMLInputElement).value = String(askPrice(parsed.kind, parsed.sku));
});
$("market-mine").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-pull]");
  if (!btn?.dataset.pull) return;
  pullListing(btn.dataset.pull);
});
$("market-board").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-buy]");
  if (!btn?.dataset.buy) return;
  buyListing(btn.dataset.buy);
});

$("store-list").addEventListener("click", (e) => {
  const eq = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-eq]");
  if (eq?.dataset.eq) {
    const skin = skinById(eq.dataset.eq);
    if (!skin || skin.hero === "all") return;
    wallet.equipped[skin.hero] = skin.id;
    saveWallet();
    storeMsg(`${skin.name} equipped on ${HEROES.find((h) => h.id === skin.hero)?.name ?? "hero"}.`);
    paintStore();
    return;
  }
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-buy]");
  if (!btn?.dataset.buy || !btn.dataset.how || btn.disabled) return;
  openPay(btn.dataset.buy, parseRail(btn.dataset.how));
});

$("pay-mlx").addEventListener("click", () => {
  settle("mlx");
});

$("btn-copy-node").addEventListener("click", () => {
  const how = pending?.how ?? "mlx";
  const dest = payDest(how);
  const label = how === "paypal" ? "PayPal inbox copied." : how === "card" ? "Account copied." : "Millix node copied.";
  void writeClip(dest).then((ok) => storeMsg(ok ? label : dest));
});

$("pay-cancel").addEventListener("click", () => {
  sfx.click();
  closePay();
  storeMsg("Payment cancelled.");
});

$("pp-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = ($("pp-from") as HTMLInputElement).value.trim();
  if (!email.includes("@")) {
    storeMsg("Enter the PayPal email you sent from so we can match the transfer.");
    return;
  }
  settle("paypal");
  ($("pp-from") as HTMLInputElement).value = "";
});

$("card-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = ($("card-name") as HTMLInputElement).value.trim();
  const num = ($("card-num") as HTMLInputElement).value.replace(/\D/g, "");
  const exp = ($("card-exp") as HTMLInputElement).value.trim();
  const cvc = ($("card-cvc") as HTMLInputElement).value.replace(/\D/g, "");
  if (name.length < 2) {
    storeMsg("Card needs a name.");
    return;
  }
  if (num.length < 13 || num.length > 19) {
    storeMsg("Card number looks short. Use 13–19 digits.");
    return;
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
    storeMsg("Expiry must be MM/YY.");
    return;
  }
  if (cvc.length < 3) {
    storeMsg("CVC needs 3 or 4 digits.");
    return;
  }
  settle("card");
  ($("card-name") as HTMLInputElement).value = "";
  ($("card-num") as HTMLInputElement).value = "";
  ($("card-exp") as HTMLInputElement).value = "";
  ($("card-cvc") as HTMLInputElement).value = "";
});

($("card-num") as HTMLInputElement).addEventListener("input", () => {
  const el = $("card-num") as HTMLInputElement;
  const digits = el.value.replace(/\D/g, "").slice(0, 16);
  el.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
});

document.querySelector("#btn-mlx-pack")!.addEventListener("click", () => {
  if (wallet.coins < 100) {
    storeMsg("Need 100 coins to load a Millix micropayment pack.");
    return;
  }
  wallet.coins -= 100;
  const cut = takeDevCut(100, "coins");
  wallet.mlx += 500;
  saveWallet();
  sfx.coin();
  storeMsg(`Loaded 500 MLX. 1% (${cut} coins) to ${devCredit()}. Extra skins are £1.99, or 40% off with Millix.`);
  paintStore();
});

function paintClans(): void {
  paintWallet();
  $("clan-you").textContent = wallet.clan ? `Your clan: ${wallet.clan}` : "No clan yet. Found one or tap a house clan.";
  $("clan-list").innerHTML = wallet.clans
    .map((c) => {
      const on = wallet.clan === clanLabel(c);
      return `<li class="${on ? "on" : ""}">
        <button type="button" data-join="${c.tag}" class="${on ? "gold" : "thin"}">[${c.tag}] ${c.name}</button>
        <em>${c.members} on roster${on ? " · you" : ""}</em>
      </li>`;
    })
    .join("");
}

function joinClan(c: Clan): void {
  if (wallet.clan === clanLabel(c)) return;
  leaveClan(false);
  c.members += 1;
  wallet.clan = clanLabel(c);
  saveWallet();
  paintClans();
}

function leaveClan(repaint: boolean): void {
  if (!wallet.clan) return;
  const cur = wallet.clans.find((c) => clanLabel(c) === wallet.clan);
  if (cur) cur.members = Math.max(0, cur.members - 1);
  wallet.clan = "";
  saveWallet();
  if (repaint) paintClans();
}

$("clan-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const tag = ($("clan-tag") as HTMLInputElement).value.trim().toUpperCase().slice(0, 5);
  const name = ($("clan-name") as HTMLInputElement).value.trim();
  if (!tag || !name) return;
  const existing = wallet.clans.find((c) => c.tag === tag);
  if (existing) {
    existing.name = name;
    joinClan(existing);
    return;
  }
  const founded: Clan = { tag, name, members: 0 };
  wallet.clans.unshift(founded);
  joinClan(founded);
});

$("clan-list").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-join]");
  if (!btn?.dataset.join) return;
  const c = wallet.clans.find((x) => x.tag === btn.dataset.join);
  if (c) joinClan(c);
});

document.querySelector("#btn-clan-leave")!.addEventListener("click", () => {
  leaveClan(true);
});

function paintLotto(): void {
  paintWallet();
  paintMillixHourly();
  $("lotto-picks").textContent = `${lottoPicks.length} / 6 picked${lottoPicks.length ? ` · ${[...lottoPicks].sort((a, b) => a - b).join(" ")}` : ""}`;
  $("lotto-grid").innerHTML = Array.from({ length: 40 }, (_, i) => {
    const n = i + 1;
    const on = lottoPicks.includes(n);
    return `<button type="button" class="ball${on ? " on" : ""}" data-ball="${n}">${n}</button>`;
  }).join("");
  if (!wallet.tickets.length) {
    $("lotto-hist").innerHTML = "<li>No Quad Lotto tickets yet.</li>";
    return;
  }
  $("lotto-hist").innerHTML = wallet.tickets
    .slice(0, 8)
    .map(
      (t) =>
        `<li>Picked ${t.picks.join(" ")} · drew ${t.draw.join(" ")} · ${t.hits} hit${t.hits === 1 ? "" : "s"}${t.prize ? ` · +${mlxAmt(t.prize)} MLX` : " · miss"}</li>`,
    )
    .join("");
}

document.querySelector("#btn-mlx-enter")!.addEventListener("click", () => {
  settleMillixHours();
  const now = hourId();
  if (!isMillixUser()) {
    $("mlx-status").textContent = "Millix users only. Hold MLX, clear a Millix payment, or log in on Tangled.";
    return;
  }
  if (enteredHour(now)) {
    $("mlx-status").textContent = "Already in this hour.";
    return;
  }
  if (wallet.mlx < MLX_STAKE) {
    $("mlx-status").textContent = `Need ${MLX_STAKE} MLX to stake.`;
    return;
  }
  wallet.mlx -= MLX_STAKE;
  const cut = takeEscrowCut(MLX_STAKE, "mlx");
  wallet.mlxEscrow += MLX_STAKE;
  wallet.mlxHourly.unshift({ hour: now, paid: false });
  wallet.mlxHourly = wallet.mlxHourly.slice(0, 48);
  saveWallet();
  sfx.coin();
  $("mlx-status").textContent = `Staked ${MLX_STAKE} MLX into escrow on ${shortNode()}. 1% (${cut} MLX) of that escrow to ${devCredit()}. You're in. Vacant places roll Millix into the next hour.`;
  paintLotto();
});

$("mlx-pay-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const addr = ($("mlx-pay-in") as HTMLInputElement).value.trim();
  if (addr === MILLIX_NODE) {
    $("mlx-pay-status").textContent =
      "That is the campus escrow node. Save your personal Millix receive address.";
    return;
  }
  if (!millixAddrOk(addr)) {
    $("mlx-pay-status").textContent =
      "That is not a Millix address. It should start with 1 and be 41–81 characters.";
    return;
  }
  wallet.mlxPay = addr;
  const pending = wallet.mlxPayouts.filter((p) => p.status === "escrow").length;
  flushPayouts();
  saveWallet();
  sfx.coin();
  paintLotto();
  $("mlx-pay-status").textContent = pending
    ? `Saved ${shortNode(addr)}. Escrow is paying ${pending} prize${pending === 1 ? "" : "s"} to that wallet.`
    : `Saved ${shortNode(addr)}. 1st, 2nd, and 3rd auto-pay this wallet from escrow.`;
});

$("btn-copy-escrow").addEventListener("click", () => {
  void writeClip(MILLIX_NODE).then((ok) => {
    $("mlx-pay-status").textContent = ok ? "Campus escrow node copied. Paste puts it in this tab." : MILLIX_NODE;
  });
});
$("btn-copy-millix-node").addEventListener("click", () => {
  void writeClip(MILLIX_NODE).then((ok) => {
    $("millix-node-note").textContent = ok ? "Campus escrow node copied. Paste puts it in this tab." : MILLIX_NODE;
  });
});

$("lotto-grid").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-ball]");
  if (!btn?.dataset.ball) return;
  const n = Number(btn.dataset.ball);
  if (lottoPicks.includes(n)) lottoPicks = lottoPicks.filter((x) => x !== n);
  else if (lottoPicks.length < 6) lottoPicks.push(n);
  paintLotto();
});

document.querySelector("#btn-quick")!.addEventListener("click", () => {
  lottoPicks = drawSix();
  paintLotto();
});

document.querySelector("#btn-ticket")!.addEventListener("click", () => {
  if (lottoPicks.length !== 6) {
    $("lotto-out").textContent = "Pick six numbers, or hit Quick pick.";
    return;
  }
  if (wallet.mlx < LOTTO_TICKET_MLX) {
    $("lotto-out").textContent = `Need ${mlxAmt(LOTTO_TICKET_MLX)} MLX for a ticket. Load Millix in the store.`;
    return;
  }
  wallet.mlx -= LOTTO_TICKET_MLX;
  const ticketCut = takeDevCut(LOTTO_TICKET_MLX, "mlx");
  const picks = [...lottoPicks].sort((a, b) => a - b);
  const draw = drawSix();
  const hits = hitCount(picks, draw);
  const prize = lottoPrize(hits);
  const { cut: prizeCut, net: prizeNet } = takeBetCut(prize, "mlx");
  wallet.mlx += prizeNet;
  wallet.tickets.unshift({ picks, draw, hits, prize });
  wallet.tickets = wallet.tickets.slice(0, 24);
  saveWallet();
  sfx.coin();
  $("lotto-out").textContent = prize
    ? `Drew ${draw.join(" ")}. ${hits} hits. +${mlxAmt(prizeNet)} MLX after 1% (${mlxAmt(prizeCut)}) to ${devCredit()}.`
    : `Drew ${draw.join(" ")}. ${hits} hit${hits === 1 ? "" : "s"}. Miss. 1% (${mlxAmt(ticketCut)} MLX) of the ticket to ${devCredit()}.`;
  paintLotto();
});

document.querySelector("#btn-pause")!.addEventListener("click", () => game.show("paused"));
document.querySelector("#btn-resume")!.addEventListener("click", () => game.show("play"));
document.querySelector("#btn-quit")!.addEventListener("click", () => {
  $("rage-box").hidden = false;
  game.show("play");
});
document.querySelector("#btn-rage")!.addEventListener("click", () => {
  sfx.click();
  $("rage-box").hidden = false;
});
document.querySelector("#btn-rage-stay")!.addEventListener("click", () => {
  sfx.click();
  $("rage-box").hidden = true;
});
document.querySelector("#btn-rage-go")!.addEventListener("click", () => {
  sfx.click();
  leaveMatch();
});
document.querySelector("#btn-again-w")!.addEventListener("click", openWait);
document.querySelector("#btn-again-l")!.addEventListener("click", openWait);
document.querySelector("#btn-menu-w")!.addEventListener("click", () => showPage("enter"));
document.querySelector("#btn-menu-l")!.addEventListener("click", () => showPage("enter"));
document.querySelector("#btn-mute")!.addEventListener("click", () => {
  const muted = game.toggleMute();
  setRadioMuted(muted);
  $("btn-mute").textContent = muted ? "Unmute" : "Mute";
});
document.querySelector("#btn-auto")!.addEventListener("click", () => game.toggleAutoplay());
$("btn-kick-stay").addEventListener("click", () => {
  sfx.click();
  game.stayActive();
});
$("btn-concede").addEventListener("click", () => {
  sfx.click();
  game.callConcede();
});
$("btn-concede-yes").addEventListener("click", () => {
  sfx.click();
  game.voteConcede(true);
});
$("btn-concede-no").addEventListener("click", () => {
  sfx.click();
  game.voteConcede(false);
});
document.querySelector("#btn-shop")!.addEventListener("click", () => {
  if (game.hud().gallery) return;
  game.shopOpen = !game.shopOpen;
});
document.querySelector("#btn-shop-close")!.addEventListener("click", () => {
  game.shopOpen = false;
});

$("skills").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-slot]");
  const map: Record<string, number> = { Q: 0, W: 1, E: 2, R: 3 };
  if (!btn?.dataset.slot) return;
  game.castSlot(map[btn.dataset.slot] ?? 0);
});
$("touch-pad").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-touch]");
  if (!btn?.dataset.touch) return;
  sfx.click();
  if (btn.dataset.touch === "stop") game.input.requestStop();
  else if (btn.dataset.touch === "snap") game.input.requestCenter();
  else if (btn.dataset.touch === "lock") game.input.requestLock();
});
$("shop-cats").innerHTML = SHOP_TABS.map(
  (tab) => `<button type="button" class="shop-cat" data-shop-tab="${tab.id}">${tab.label}</button>`,
).join("");
$("shop-search").addEventListener("input", () => {
  shopQuery = ($("shop-search") as HTMLInputElement).value;
  shopPaintSig = "";
  paintGiftShop(game.hud());
});
$("shop-cats").addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-shop-tab]");
  if (!btn?.dataset.shopTab) return;
  shopTab = btn.dataset.shopTab;
  shopPaintSig = "";
  paintGiftShop(game.hud());
});
$("shop").addEventListener("click", (e) => {
  const pick = (e.target as HTMLElement).closest<HTMLElement>("[data-pick]");
  if (pick?.dataset.pick) {
    shopPick = pick.dataset.pick;
    shopPaintSig = "";
    paintGiftShop(game.hud());
    return;
  }
  const sell = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-sell-slot]");
  if (sell?.dataset.sellSlot) {
    game.sell(Number(sell.dataset.sellSlot));
    shopPaintSig = "";
    paintGiftShop(game.hud());
    return;
  }
  const buy = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-buy]");
  if (!buy?.dataset.buy || buy.disabled) return;
  game.buy(buy.dataset.buy);
  shopPaintSig = "";
});
$("bag").addEventListener("click", (e) => {
  const slot = (e.target as HTMLElement).closest<HTMLElement>("[data-bag]");
  if (!slot?.dataset.bag) return;
  const index = Number(slot.dataset.bag);
  if (game.shopOpen) {
    game.pickSell(index);
    const id = game.hud().slots[index]?.id;
    if (id) shopPick = id;
    shopPaintSig = "";
    paintGiftShop(game.hud());
    return;
  }
  game.useBag(index);
});
$("mile-a").addEventListener("click", () => game.chooseMile("a"));
$("mile-b").addEventListener("click", () => game.chooseMile("b"));

function paintSideArt(id: string, skinId: string | undefined, name: string, title: string): void {
  const canvas = document.getElementById("hero-side-art") as HTMLCanvasElement | null;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;
  drawHeroSide(ctx, id, performance.now() / 1000, skinId);
  $("hero-side-name").textContent = name;
  $("hero-side-title").textContent = title;
}

let shopTab = "all";
let shopQuery = "";
let shopPick = "chalk";
let shopPaintSig = "";

function escShop(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function giftImg(id: string, theme: ShopTheme, px: number, cls: string): string {
  const name = giftById(id)?.name ?? itemName(id);
  const label = escShop(name);
  return `<img class="${cls}" alt="${label}" title="${label}" src="${giftThumbUrl(id, theme, px)}" width="${px}" height="${px}" />`;
}

function shopPicks(ids: string[], theme: ShopTheme): string {
  const rows = ids
    .map((id) => giftById(id))
    .filter((it): it is NonNullable<typeof it> => Boolean(it));
  const shown = shopQuery.trim() ? searchGift(shopQuery, rows) : rows;
  if (!shown.length) return `<p class="shop-empty">Nothing in this row.</p>`;
  return `<div class="shop-tree">${shown
    .map((it) => {
      const on = it.id === shopPick ? " on" : "";
      return `<button type="button" class="shop-pick${on}" data-pick="${it.id}">${giftImg(it.id, theme, 32, "shop-thumb")} ${escShop(it.name)} · ${totalCost(it.id)}g</button>`;
    })
    .join("")}</div>`;
}

function paintGiftShop(h: Hud): void {
  const open = h.shopOpen && h.screen === "play";
  if (!open) return;
  const theme = shopThemeForTeam(h.team);
  $("shop").dataset.theme = theme;
  let pick = shopPick;
  const build = buildForHero(h.selected);
  const pool = shopTab === "all" || shopTab === "builds" ? GIFT_ITEMS : GIFT_ITEMS.filter((it) => it.category === shopTab);
  const found = shopTab === "builds" ? [] : searchGift(shopQuery, pool);
  if (shopTab !== "builds" && !found.some((it) => it.id === pick) && found[0]) pick = found[0].id;
  shopPick = pick;
  const sig = `${shopTab}|${shopQuery}|${shopPick}|${h.gold}|${h.slots.map((s) => `${s.id}:${s.count}:${Math.ceil(s.cd)}`).join()}|${h.sellIndex}|${h.inFountain ? 1 : 0}|${h.dead ? 1 : 0}|${theme}|${h.selected}|${h.invNote}`;
  if (sig === shopPaintSig) return;
  shopPaintSig = sig;
  $("shop-kicker").textContent = flourishLine(theme);
  $("shop-hint").textContent = h.dead
    ? "Down. The counter is closed until you are up."
    : h.inFountain
      ? "You are in the pool. Match gold only. B or Escape closes the shop."
      : "Walk home to the fountain pool to buy. You can still browse.";
  for (const btn of $("shop-cats").querySelectorAll<HTMLButtonElement>(".shop-cat")) {
    btn.classList.toggle("on", btn.dataset.shopTab === shopTab);
  }
  if (shopTab === "builds") {
    $("shop-grid").innerHTML = [
      ["Starting", build.startingItems],
      ["Early", build.earlyItems],
      ["Core", build.coreItems],
      ["Situational", build.situationalItems],
      ["Late/Luxury", build.luxuryItems],
    ]
      .map(([label, ids]) => `<section class="shop-sec"><h3>${label}</h3>${shopPicks(ids as string[], theme)}</section>`)
      .join("");
  } else {
    $("shop-grid").innerHTML = found.length
      ? found
          .map((it) => {
            const on = it.id === shopPick ? " on" : "";
            return `<button type="button" class="shop-card${on}" data-pick="${it.id}">${giftImg(it.id, theme, 48, "shop-thumb")}<span><b>${escShop(it.name)}</b><span>${totalCost(it.id)}g</span><i class="shop-muted">${escShop(statSummary(it))}</i></span></button>`;
          })
          .join("")
      : `<p class="shop-empty">No items match.</p>`;
  }
  const it = giftById(shopPick);
  $("shop-detail").innerHTML = it ? shopDetail(it, h, theme) : "";
}

function shopDetail(it: NonNullable<ReturnType<typeof giftById>>, h: Hud, theme: ShopTheme): string {
  const quote = quotePurchase({ gold: h.gold, items: h.items }, it.id);
  const row = h.shop.find((item) => item.id === it.id);
  const price = row?.cost ?? quote.spend;
  const room = row?.room || (h.slots.some((slot) => !slot.id) ? "slot free" : "inventory full");
  const can = Boolean(row ? row.can : quote.ok) && !h.dead;
  const why = h.dead ? "You are down." : !h.inFountain ? "Walk to your fountain." : !can ? (room === MSG_FULL ? MSG_FULL : quote.reason || "Cannot buy") : "";
  const refund = sellValueOf({ cost: totalCost(it.id), sellValue: it.sellValue });
  const owned = h.slots
    .map((slot, index) => ({ slot, index }))
    .filter((entry) => entry.slot.id === it.id);
  const parts = it.components
    .map((id) => giftById(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const ups = buildsInto(it.id)
    .map((id) => giftById(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const partBtns = parts.length
    ? parts.map((row) => `<button type="button" class="shop-pick" data-pick="${row.id}">${giftImg(row.id, theme, 28, "shop-thumb")} ${escShop(row.name)} · ${totalCost(row.id)}g</button>`).join("")
    : `<span class="shop-muted">None</span>`;
  const upBtns = ups.length
    ? ups.map((row) => `<button type="button" class="shop-pick" data-pick="${row.id}">${giftImg(row.id, theme, 28, "shop-thumb")} ${escShop(row.name)}</button>`).join("")
    : `<span class="shop-muted">Nothing</span>`;
  const cast = activeCastNote(it);
  return `<div class="shop-detail-copy">
    ${giftImg(it.id, theme, 96, "shop-detail-art")}
    <h3>${escShop(it.name)}</h3>
    <p class="shop-muted">${escShop(statSummary(it))}</p>
    <p>Assembly ${it.cost}g · Total ${totalCost(it.id)}g</p>
    <p>${escShop(it.description)}</p>
    ${it.passive ? `<p><b>Passive.</b> ${escShop(it.passive)}</p>` : ""}
    ${it.active ? `<p><b>Active.</b> ${escShop(it.active)}</p>` : ""}
    ${cast ? `<p class="shop-muted">${escShop(cast)}</p>` : ""}
    ${it.approx ? `<p class="shop-muted">${escShop(it.approx)}</p>` : ""}
    <p>Components</p>
    <div class="shop-tree">${partBtns}</div>
    <p>Builds into</p>
    <div class="shop-tree">${upBtns}</div>
    <p>You spend ${quote.spend}g${quote.consumed.length ? ` · uses ${quote.consumed.length} part${quote.consumed.length === 1 ? "" : "s"} you hold` : ""}.</p>
    <p>BUY ${price}g · gold ${h.gold} · ${escShop(room)}</p>
    <button type="button" class="gold shop-buy" data-buy="${it.id}" ${can ? "" : "disabled"}>${can ? `Purchase · ${price}g` : escShop(why || "Cannot buy")}</button>
    ${owned
      .map((entry) => {
        const after = h.gold + refund;
        const picked = h.sellIndex === entry.index ? " on" : "";
        return `<button type="button" class="shop-sell${picked}" data-sell-slot="${entry.index}">SELL ${escShop(it.name)} · ${refund}g · gold after ${after}</button>`;
      })
      .join("")}
  </div>`;
}

function paintPockets(h: Hud, theme: ShopTheme): void {
  if (typeof document === "undefined") return;
  const gold = document.getElementById("inv-gold");
  const note = document.getElementById("inv-note");
  const bag = document.getElementById("bag");
  if (gold) gold.textContent = `${h.gold}g`;
  if (note) {
    note.hidden = !h.invNote;
    note.textContent = h.invNote || "";
  }
  if (!bag) return;
  bag.innerHTML = h.slots
    .map((slot, i) => {
      const picked = h.sellIndex === i ? " picked" : "";
      if (!slot.id) return `<div class="slot empty${picked}" data-bag="${i}"><span class="slot-n">${i + 1}</span></div>`;
      const name = giftById(slot.id)?.name ?? itemName(slot.id);
      const count = stackLabel(slot.count);
      const cd = slot.cd > 0 ? `<i class="slot-cd">${Math.ceil(slot.cd)}</i>` : "";
      return `<div class="slot${picked}" data-bag="${i}" title="${escShop(name)}"><span class="slot-n">${i + 1}</span>${giftImg(slot.id, theme, 48, "item-art")}${count ? `<b class="slot-count">${count}</b>` : ""}${cd}</div>`;
    })
    .join("");
}

const skillCdMem = new Map<string, number>();

function paintHud(h: Hud): void {
  if (page !== "play") return;
  (window as unknown as { __burstAudit?: () => ReturnType<Game["burstReport"]> }).__burstAudit = () => game.burstReport();
  $("clock").textContent = h.clock;
  $("follow-tag").hidden = !h.followTag;
  $("follow-tag").textContent = h.followTag ? `Following ${h.followTag}` : "";
  $("kda").textContent = h.kda;
  $("kdr").textContent = h.kdr;
  $("win-kda").textContent = h.kda;
  $("win-kdr").textContent = h.kdr;
  $("lose-kda").textContent = h.kda;
  $("lose-kdr").textContent = h.kdr;
  $("gold").textContent = h.tangled
    ? `${h.gold}g · tangled ${Math.round(h.drip * 60)}/min`
    : `${h.gold}g`;
  $("heat-cs").textContent = `${h.cs}`;
  $("heat-line").textContent = h.heat;
  $("xp-fill").style.transform = `scaleX(${h.xpPct})`;
  $("xp-text").textContent = h.level >= 11 ? "MAX" : `${h.xpNeed} XP`;
  $("btn-mute").textContent = h.muted ? "Unmute" : "Mute";
  $("btn-auto").hidden = !h.canAutoplay;
  $("btn-auto").textContent = h.autoplay ? "Expert AI · on" : "Expert AI · off";
  $("btn-auto").className = h.autoplay ? "gold" : "thin";
  $("btn-shop").hidden = h.gallery;
  $("kick-match").hidden = !h.idleKick;
  $("kick-match-line").textContent = h.idleKick || "";
  $("btn-concede").hidden = h.concedeMode !== "call";
  $("concede-match").hidden = h.concedeMode !== "vote";
  $("concede-line").textContent = h.concedeLine || "";
  const heroDef = HEROES.find((x) => x.id === h.selected) ?? heroById(h.selected);
  const heroName = heroDef.name;
  $("hero-name").textContent = h.skin && h.skin !== heroName ? `${heroName} · ${h.skin}` : heroName;
  const art = $("hero-art") as HTMLImageElement;
  art.src = heroArtUrl(h.selected, wallet.equipped[h.selected], "face");
  art.alt = HEROES.find((x) => x.id === h.selected)?.name ?? "Hero";
  $("hero-target").textContent = h.targetLine || "Auto-attack";
  $("hero-lvl").textContent = `Lv ${h.level}`;
  $("hp-fill").style.transform = `scaleX(${h.maxHp ? h.hp / h.maxHp : 0})`;
  $("mp-fill").style.transform = `scaleX(${h.maxMana ? h.mana / h.maxMana : 0})`;
  $("hp-text").textContent = `${h.hp} / ${h.maxHp}`;
  $("mp-text").textContent = `${h.mana} / ${h.maxMana}`;
  $("respawn").textContent = Math.ceil(h.respawn).toString();
  const bannerEl = $("banner");
  const levelPop = /^Level \d+$/.test(h.banner);
  const bannerChanged = bannerEl.textContent !== h.banner;
  bannerEl.hidden = !h.banner;
  bannerEl.textContent = h.banner;
  if (!levelPop) bannerEl.classList.remove("level-center");
  else if (bannerChanged || !bannerEl.classList.contains("level-center")) {
    bannerEl.classList.remove("level-center");
    void bannerEl.offsetWidth;
    bannerEl.classList.add("level-center");
  }
  $("phase").textContent = h.phase;
  ($("base-dc") as HTMLElement).style.transform = `scaleX(${h.bases.home})`;
  ($("base-sea") as HTMLElement).style.transform = `scaleX(${h.bases.away})`;
  $("objective-line").hidden = !h.objective;
  $("objective-line").textContent = h.objective;
  $("mile").hidden = !h.mile;
  $("mile-line").textContent = h.mile;
  $("mile-a").textContent = h.mileA;
  $("mile-b").textContent = h.mileB;
  $("feed").innerHTML = h.feed.map((t) => `<div>${t}</div>`).join("");
  $("dead").hidden = !h.dead;
  $("shop").hidden = !(h.shopOpen && h.screen === "play");
  paintGiftShop(h);
  const bar = $("bar");
  bar.dataset.side = h.team === "away" ? "sea" : "dc";
  $("skills").innerHTML = h.abilities
    .map((a) => {
      const memKey = `${h.selected}:${a.key}`;
      const prevCd = skillCdMem.get(memKey);
      const pulse = prevCd != null && prevCd > 0 && a.cd <= 0;
      skillCdMem.set(memKey, a.cd);
      const locked = a.key === "R" && h.level < 6;
      const dry = h.mana < a.mana;
      const cooling = a.cd > 0;
      const spec = heroDef.abilities.find((x) => x.key === a.key);
      const reach = spec && spec.kind !== "self" && spec.range > 0 ? `${spec.range} range` : "self";
      const cls = [
        "skill",
        `skill-${a.fx}`,
        a.key === "R" ? "ult" : "",
        cooling ? "cooling" : "",
        !cooling && locked ? "locked" : "",
        !cooling && !locked && dry ? "dry" : "",
        a.ready ? "ready" : "wait",
        pulse ? "pulse" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const sweep = cooling ? Math.max(0, Math.min(1, a.cd / Math.max(0.01, a.max))) : 0;
      const veil = cooling
        ? `<i class="skill-sweep" style="--sweep:${sweep.toFixed(3)}"></i><b class="skill-cd">${Math.ceil(a.cd)}</b>`
        : "";
      const title = `${a.name}: ${a.blurb} · ${a.mana} mana · ${a.max}s · ${reach}`;
      return `<button type="button" class="${cls}" data-slot="${a.key}" title="${title}"><span class="skill-face">${abilityImg(h.selected, a.key as "Q" | "W" | "E" | "R", a.name)}${veil}</span><span class="skill-copy"><kbd>${a.key}</kbd> ${a.name}${cooling ? `<br>${Math.ceil(a.cd)}s` : ""}</span></button>`;
    })
    .join("");
  const theme = shopThemeForTeam(h.team);
  paintPockets(h, theme);
  $("paused").hidden = h.screen !== "paused";
  $("victory").hidden = h.screen !== "victory";
  $("defeat").hidden = h.screen !== "defeat";
  if (h.winner) settleLiveBets({ winner: h.winner, clock: h.clockSec, firstTower: h.firstTower });
  if (h.screen === "victory" || h.screen === "defeat") {
    salvageBag();
    recordLeague(h);
    $("win-heat").textContent = lastHeatNote || "Queue again for the next coin drop.";
    $("lose-heat").textContent = lastHeatNote || "Show up gold still pays. Queue MAGA again.";
  }
  paintBetSlip();
  paintEndBets();
}

function sizeFlag(): void {
  const dpr = 1;
  const w = Math.floor(innerWidth * dpr);
  const h = Math.floor(innerHeight * dpr);
  if (flag.width !== w || flag.height !== h) {
    flag.width = w;
    flag.height = h;
  }
  flag.style.width = `${innerWidth}px`;
  flag.style.height = `${innerHeight}px`;
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

let atlasSig = "";
function sizeAtlas(): void {
  const dpr = Math.min(devicePixelRatio || 1, 1.25);
  const r = atlasView.getBoundingClientRect();
  const w = Math.max(1, r.width);
  const h = Math.max(1, r.height);
  const sides = campusNow();
  const sig = `${Math.floor(w)}x${Math.floor(h)}:${dpr}:${sides.maga}:${sides.antifa}`;
  if (sig === atlasSig && atlasView.width) return;
  atlasSig = sig;
  if (atlasView.width !== Math.floor(w * dpr) || atlasView.height !== Math.floor(h * dpr)) {
    atlasView.width = Math.floor(w * dpr);
    atlasView.height = Math.floor(h * dpr);
  }
  actx.setTransform(dpr, 0, 0, dpr, 0, 0);
  actx.imageSmoothingEnabled = true;
  actx.imageSmoothingQuality = "medium";
  drawAtlas(actx, w, h, sides);
}

function sizeDag(t: number): void {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = dagView.getBoundingClientRect();
  const w = Math.max(1, r.width);
  const h = Math.max(1, r.height || 260);
  if (dagView.width !== Math.floor(w * dpr) || dagView.height !== Math.floor(h * dpr)) {
    dagView.width = Math.floor(w * dpr);
    dagView.height = Math.floor(h * dpr);
  }
  dagCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dagCtx.imageSmoothingEnabled = true;
  drawDag(dagCtx, w, h, t);
}

let last = performance.now();
let prev = "";
let lastHour = hourId();
let lastBookSec = 0;
let lastWheelSec = 0;
function frame(now: number): void {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  const hid = hourId();
  if (hid !== lastHour) {
    lastHour = hid;
    settleMillixHours();
    if (page === "lotto") paintLotto();
    else paintWallet();
  } else if (page === "enter" || page === "lotto") {
    paintMillixCountdown();
  }
  if (page === "store") {
    const sec = Math.floor(now / 1000);
    if (sec !== lastWheelSec) {
      lastWheelSec = sec;
      paintWheelStatus();
    }
  }
  if (page === "enter") {
    sizeFlag();
    drawFlag(fctx, innerWidth, innerHeight, now / 1000);
    sizeAtlas();
    if (demoLive) demo.update(dt);
    paintDemoCap();
    if (demoLive && demo.over()) startDemo();
  }
  if (page === "millix") sizeDag(now / 1000);
  if (page === "wait") {
    waitT += dt;
    const step = JOIN_SCRIPT[joinI];
    if (step && waitT >= step.at) {
      const seat = seats[step.seat];
      if (seat && seat.status === "OPEN" && !seat.reserved && !seatTaken(step.name)) {
        seat.status = "JOINED";
        seat.name = step.name;
        seat.acted = waitT;
        sys(`${step.name} joined ${seat.team === "maga" ? "MAGA" : "Antifa"} — ${joinedCount(seats)}/${MATCH_SEATS}.`);
        if (step.chat) chat.push({ who: step.name, text: step.chat, kind: "talk" });
        paintSeats();
      }
      joinI += 1;
    }
    const specStep = SPEC_SCRIPT[specJoinI];
    if (specStep && waitT >= specStep.at) {
      const seat = specs[specStep.seat];
      if (seat && seat.status === "OPEN" && !seatTaken(specStep.name)) {
        seat.status = "JOINED";
        seat.name = specStep.name;
        seat.acted = waitT;
        sys(`${specStep.name} sat in the gallery — ${specCount(specs)}/${SPEC_SEATS}. Type only.`);
        if (specStep.chat) chat.push({ who: specStep.name, text: specStep.chat, kind: "type" });
        paintSeats();
      }
      specJoinI += 1;
    }
    const idleSig = seats.map((s) => (isIdle(s, waitT) ? "1" : "0")).join("");
    if (idleSig !== lastIdleSig) {
      lastIdleSig = idleSig;
      paintSeats();
    }
    if (kickVote) {
      kickVote.pulse += dt;
      if (kickVote.pulse >= 0.7) {
        kickVote.pulse = 0;
        autoKickVote();
        paintSeats();
      }
      if (kickVote && waitT - kickVote.start > VOTE_SECS) {
        sys(`Kick vote on ${kickVote.name} timed out.`);
        kickVote = null;
        paintSeats();
      }
    }
    const sec = Math.floor(now / 1000);
    if (sec !== lastBookSec) {
      lastBookSec = sec;
      if (hourBetCount() >= BETS_PER_HOUR) paintBook();
    }
  }
  if (page === "play") {
    game.update(dt);
    const h = game.hud();
    const sideHero = HEROES.find((x) => x.id === h.selected) ?? heroById(h.selected);
    paintSideArt(h.selected, wallet.equipped[h.selected], sideHero.name, sideHero.title);
    const sig = `${h.clock}|${h.hp}|${h.mana}|${h.gold}|${h.kda}|${h.banner}|${h.cs}|${h.shopOpen ? 1 : 0}|${h.abilities.map((a) => Math.ceil(a.cd)).join()}|${h.slots.map((s) => `${s.id}:${s.count}:${Math.ceil(s.cd)}`).join()}|${h.invNote}|${h.sellIndex}|${h.idleKick}|${h.targetLine}|${h.heat}|${h.shop.map((s) => `${s.id}${s.can ? 1 : 0}${s.room}`).join("")}|${h.screen}|${h.dead ? 1 : 0}|${h.autoplay ? 1 : 0}|${h.feed[0] ?? ""}|${h.followTag}|${h.concedeLine}|${h.skin}|${h.level}|${h.phase}|${h.objective}|${h.mile}|${Math.round(h.bases.home * 100)}|${Math.round(h.bases.away * 100)}`;
    if (sig !== prev) {
      paintHud(h);
      prev = sig;
    }
  }
  if (page === "market") {
    marketPulse += dt;
    if (marketPulse >= 1) {
      marketPulse = 0;
      tickMarket();
      paintMarket();
    }
  }
  mic.tick();
  radioTick();
  soundTick(sfx, mic);
  if (mic.channel && !canMicTalk()) dropMic();
  else if (mic.channel) {
    bumpYouAct();
    if (page === "play") game.keepAlive();
    paintMic();
  }
  requestAnimationFrame(frame);
}

paintWallet();
paintPatches();
paintFaq();
paintPlaybook();
paintHowto();
resumeMillix();
settleMillixHours();
if (wallet.mlxPayouts.some((p) => p.status === "sent" || (p.status === "escrow" && millixAddrOk(wallet.mlxPay)))) {
  queuePayoutClear();
}
if (wallet.liveBets.length) voidLiveBets();
showPage("enter");
mountRadio({
  linked: () => wallet.spotifyLinked,
  onLinked: claimSpotifyGold,
  onLayer: refreshNav,
  music: {
    play: () => sfx.playAnthem(),
    stop: () => sfx.stopAnthem(),
    setVol: (n) => sfx.setMusicVol(n),
    restart: () => sfx.restartAnthem(),
  },
});
mountSound({ sfx, demo: demoSfx, mic, onArm: armSound, onLayer: refreshNav });
mountSoundcheck({ sfx, onArm: armSound, onLayer: refreshNav });
mountDesk({ onLayer: refreshNav });
window.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Escape" || e.repeat) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!retreat()) return;
    e.preventDefault();
    e.stopPropagation();
  },
  true,
);
function bootFromHash(): void {
  const hash = location.hash;
  if (hash === "#draft") {
    openRoster("enter");
    return;
  }
  const kit = liveHeroId(hash.startsWith("#kit=") ? hash.slice(5) : "");
  if (kit && HEROES.some((h) => h.id === kit) && hash.startsWith("#kit=")) {
    hideEnterGate();
    stopDemo();
    seats = emptySeats();
    specs = emptySpecSeats();
    nameYou();
    fillBots();
    if (!canSelectHero(kit)) {
      picked = DEFAULT_KIT;
      game.pick(DEFAULT_KIT);
      openRoster("enter");
      if (isMmaHero(kit)) openMmaUnlock(kit);
      return;
    }
    picked = kit;
    game.pick(kit, wallet.handle);
    startMatch(false, false);
  }
}

function pasteField(id: string, empty = "Nothing to paste. Copy in this tab first, then Paste."): void {
  void pasteInto($(id) as HTMLInputElement).then((ok) => {
    if (ok) return;
    if (id.startsWith("email") || id.startsWith("social") || id === "handle-in") setAccountMsg(empty, true);
    else if (id === "mlx-pay-in") $("mlx-pay-status").textContent = empty;
  });
}

function bindPasteBtn(id: string, onClick: () => void): void {
  const btn = $(id);
  holdPasteFocus(btn);
  let armed = false;
  btn.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    armed = true;
    onClick();
  });
  btn.addEventListener("pointerup", () => {
    window.setTimeout(() => {
      armed = false;
    }, 0);
  });
  btn.addEventListener("click", (e) => {
    if (armed) {
      armed = false;
      e.preventDefault();
      return;
    }
    onClick();
  });
}

bindPasteBtn("btn-account-paste", () => {
  const focus = lastTypedField();
  const box = focus?.closest("#account-box, #social-box, #handle-form");
  if (focus && box) {
    void pasteInto(focus).then((ok) => {
      if (!ok) setAccountMsg("Nothing to paste. Copy in this tab first, then Paste.", true);
    });
    return;
  }
  const open = !$("social-box").hidden;
  pasteField(open ? "social-email" : $("account-out").hidden ? "handle-in" : "email-new");
});
bindPasteBtn("btn-social-paste", () => pasteField("social-email"));
bindPasteBtn("btn-handle-paste", () => pasteField("handle-in"));
bindPasteBtn("btn-mlx-paste", () => pasteField("mlx-pay-in"));

wirePageClip();
if (isWheelTestMode()) {
  hideEnterGate();
  stopDemo();
  bootWheelSandbox();
} else if (isLottoTestMode()) {
  hideEnterGate();
  stopDemo();
  bootLottoSandbox();
} else if (isChatTestMode()) {
  hideEnterGate();
  stopDemo();
  bootChatTest();
} else if (isSkinReelMode()) {
  hideEnterGate();
  stopDemo();
  bootSkinReel();
} else if (isCreepReviewMode()) {
  hideEnterGate();
  stopDemo();
  bootCreepReview();
} else if (isAnimTestMode()) {
  hideEnterGate();
  stopDemo();
  bootAnimSandbox();
} else if (isAnimMatchMode()) {
  hideEnterGate();
  stopDemo();
  watchAi();
} else if (isDlcAiMode()) {
  hideEnterGate();
  stopDemo();
  watchDlcAi();
} else if (isCastAiMode()) {
  hideEnterGate();
  stopDemo();
  watchCastAi();
} else if (isHooliTestMode()) {
  hideEnterGate();
  stopDemo();
  picked = "maga-hooli";
  game.pick("maga-hooli", wallet.handle);
  seats = emptySeats();
  specs = emptySpecSeats();
  resetChatColors();
  nameYou();
  fillBots();
  startMatch(false, false);
} else {
  bootFromHash();
  if (page === "enter") startDemo();
}
refreshNav();
window.addEventListener("hashchange", () => {
  if (location.hash === "#draft") {
    openRoster("enter");
    return;
  }
  bootFromHash();
});
requestAnimationFrame(frame);
