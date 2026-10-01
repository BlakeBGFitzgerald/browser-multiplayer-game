import "../server/dom-stub";
import assert from "node:assert/strict";
import { Game } from "./game";
import { Input } from "./input";
import { Sfx } from "./audio";
import { CAST_AWAY, CAST_HOME, HEROES, HOOLI_ID, HUMAN_FREE_HEROES, heroById, isDevAiOnlyHero, isMmaHero } from "./heroes";
import { MATCH_SEATS, PLAYERS_PER_TEAM } from "../lobby";
import { MatchDraft, freeBotIds, uniqueSideKits } from "./draftPick";

let failed = 0;

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(err);
  }
}

function roster(): string[] {
  return freeBotIds().filter((id) => id !== HOOLI_ID);
}

function makeGame(): Game {
  const canvas = {
    width: 1280,
    height: 720,
    hidden: true,
    style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720, x: 0, y: 0, toJSON() {} }),
    getContext: () => null,
    addEventListener() {},
    removeEventListener() {},
  } as unknown as HTMLCanvasElement;
  const input = new Input(canvas, () => ({ x: 0, y: 0, zoom: 1 }), false);
  const sfx = new Sfx();
  sfx.muted = true;
  return new Game(canvas, null as unknown as CanvasRenderingContext2D, input, sfx, true, true);
}

function heroIds(game: Game): string[] {
  return game.heroCard().map((h) => h.heroId);
}

check("pool covers a full match", () => {
  assert.ok(freeBotIds().length >= MATCH_SEATS);
  assert.equal(PLAYERS_PER_TEAM * 2, MATCH_SEATS);
});

check("hooli and a second seat", () => {
  const [hero1, hero2] = roster();
  assert.ok(hero1 && hero2);
  const draft = new MatchDraft();
  if (isDevAiOnlyHero(HOOLI_ID)) {
    const human = draft.accept("human", HOOLI_ID, { human: true, allowDevAi: false });
    assert.equal(human.ok, false);
    if (!human.ok) assert.equal(human.reason, "locked");
    assert.equal(draft.heroOf("human"), "");
    assert.equal(draft.accept("a", hero1, { human: true }).ok, true);
    assert.equal(draft.accept("b", hero2, { human: true }).ok, true);
    assert.equal(draft.accept("ai", HOOLI_ID).ok, true);
  } else {
    assert.equal(draft.accept("a", HOOLI_ID, { human: true, allowDevAi: false }).ok, true);
  }
  const second = draft.accept("other", HOOLI_ID);
  assert.equal(second.ok, false);
  if (!second.ok) assert.equal(second.reason, "already-picked");
  assert.equal(draft.takenIds().filter((id) => id === HOOLI_ID).length, 1);
});

check("two different heroes both lock", () => {
  const [hero1, hero2] = roster();
  assert.ok(hero1 && hero2);
  const draft = new MatchDraft();
  const a = draft.accept("a", hero1);
  const b = draft.accept("b", hero2);
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(draft.heroOf("a"), hero1);
  assert.equal(draft.heroOf("b"), hero2);
});

check("simultaneous orders keep one", () => {
  const [hero1] = roster();
  assert.ok(hero1);
  const draft = new MatchDraft();
  const results = draft.acceptOrders([
    { seat: "a", heroId: hero1 },
    { seat: "b", heroId: hero1 },
  ]);
  assert.equal(results[0]?.ok, true);
  assert.equal(results[1]?.ok, false);
  if (results[1] && !results[1].ok) assert.equal(results[1].reason, "already-picked");
  assert.equal(draft.takenIds().filter((id) => id === hero1).length, 1);
});

check("random skips a reserved id", () => {
  const pool = roster().slice(0, 6);
  const hero1 = pool[0];
  assert.ok(hero1);
  const draft = new MatchDraft();
  assert.equal(draft.accept("a", hero1).ok, true);
  for (let i = 0; i < 40; i++) {
    const rolled = draft.randomHero(pool, () => (i % 2 === 0 ? 0 : 0.999));
    assert.notEqual(rolled, hero1);
    assert.ok(rolled);
  }
});

check("bot skips the player's hero", () => {
  const [hero1] = roster();
  assert.ok(hero1);
  const draft = new MatchDraft();
  assert.equal(draft.accept("player", hero1, { human: true }).ok, true);
  const bot = draft.assignBot("bot", freeBotIds(), () => 0);
  assert.equal(bot.ok, true);
  if (bot.ok) assert.notEqual(bot.heroId, hero1);
  const hooli = new MatchDraft();
  assert.equal(hooli.accept("player", HOOLI_ID, { human: !isDevAiOnlyHero(HOOLI_ID), allowDevAi: true }).ok, true);
  const botHooli = hooli.assignBot("bot", freeBotIds(), () => 0);
  assert.equal(botHooli.ok, true);
  if (botHooli.ok) assert.notEqual(botHooli.heroId, HOOLI_ID);
});

check("new match clears the pool", () => {
  const [hero1] = roster();
  assert.ok(hero1);
  const draft = new MatchDraft();
  assert.equal(draft.accept("a", hero1).ok, true);
  draft.clear();
  assert.deepEqual(draft.takenIds(), []);
  assert.equal(draft.accept("b", hero1).ok, true);
  const first = uniqueSideKits(hero1);
  const second = uniqueSideKits(hero1);
  assert.equal(first.home[0], hero1);
  assert.equal(second.home[0], hero1);
});

check("repick frees the old id", () => {
  const [hero1, hero2] = roster();
  assert.ok(hero1 && hero2);
  const draft = new MatchDraft();
  assert.equal(draft.accept("a", hero1).ok, true);
  assert.equal(draft.accept("a", hero2).ok, true);
  assert.equal(draft.heroOf("a"), hero2);
  assert.equal(draft.ownerOf(hero1), "");
  assert.equal(draft.accept("b", hero1).ok, true);
  assert.equal(draft.ownerOf(hero2), "a");
});

check("stale clients: one accept", () => {
  const [hero1] = roster();
  assert.ok(hero1);
  const draft = new MatchDraft();
  const first = draft.accept("stale-a", hero1);
  const second = draft.accept("stale-b", hero1);
  assert.equal(first.ok, true);
  assert.equal(second.ok, false);
  if (!second.ok) assert.equal(second.reason, "already-picked");
  assert.equal(draft.takenIds().filter((id) => id === hero1).length, 1);
});

check("disconnect and reconnect keep one reservation", () => {
  const [hero1] = roster();
  assert.ok(hero1);
  const draft = new MatchDraft();
  assert.equal(draft.accept("a", hero1).ok, true);
  assert.equal(draft.hold("a"), hero1);
  assert.equal(draft.hold("a"), hero1);
  assert.equal(draft.takenIds().length, 1);
  assert.equal(draft.accept("b", hero1).ok, false);
  assert.equal(draft.accept("a", hero1).ok, true);
  assert.equal(draft.takenIds().length, 1);
});

check("timeout keeps a reserved kit and otherwise rolls open", () => {
  const [hero1, hero2] = roster();
  assert.ok(hero1 && hero2);
  const held = new MatchDraft();
  assert.equal(held.accept("s", hero1).ok, true);
  const kept = held.assignTimeout("s", [hero2]);
  assert.equal(kept.ok, true);
  if (kept.ok) assert.equal(kept.heroId, hero1);
  const empty = new MatchDraft();
  assert.equal(empty.accept("other", hero1).ok, true);
  const rolled = empty.assignTimeout("empty", [hero1, hero2], () => 0);
  assert.equal(rolled.ok, true);
  if (rolled.ok) assert.equal(rolled.heroId, hero2);
});

check("full draft roster is unique", () => {
  const draft = new MatchDraft();
  const pool = freeBotIds();
  assert.equal(draft.accept("s0", pool[0]!).ok, true);
  for (let i = 1; i < MATCH_SEATS; i++) {
    const res = draft.assignBot(`s${i}`, pool, () => 0);
    assert.equal(res.ok, true);
  }
  const ids = draft.takenIds();
  assert.equal(ids.length, MATCH_SEATS);
  assert.equal(new Set(ids).size, MATCH_SEATS);
});

check("normal lineup is unique and does not warn", () => {
  const [hero1] = roster();
  assert.ok(hero1);
  const warns: string[] = [];
  const orig = console.warn;
  console.warn = (...args: unknown[]) => {
    warns.push(args.map(String).join(" "));
  };
  try {
    const line = uniqueSideKits(hero1);
    const all = [...line.home, ...line.away];
    assert.equal(all.length, MATCH_SEATS);
    assert.equal(new Set(all).size, MATCH_SEATS);
    assert.equal(line.home[0], hero1);
    assert.equal(all.filter((id) => id === hero1).length, 1);
    assert.deepEqual(warns, []);
    const cast = uniqueSideKits(CAST_HOME[0]!, CAST_HOME, CAST_AWAY);
    assert.deepEqual(cast.home, [...CAST_HOME]);
    assert.deepEqual(cast.away, [...CAST_AWAY]);
    assert.deepEqual(warns, []);
  } finally {
    console.warn = orig;
  }
});

check("duplicate kit orders are logged and split", () => {
  const ids = freeBotIds();
  const warns: string[] = [];
  const orig = console.warn;
  console.warn = (...args: unknown[]) => {
    warns.push(args.map(String).join(" "));
  };
  try {
    const home = [ids[0]!, ids[0]!, ids[1]!, ids[2]!, ids[3]!];
    const away = [ids[0]!, ids[4]!, ids[5]!, ids[6]!, ids[7]!];
    const line = uniqueSideKits(ids[0]!, home, away);
    const all = [...line.home, ...line.away];
    assert.equal(new Set(all).size, MATCH_SEATS);
    assert.equal(all.filter((id) => id === ids[0]).length, 1);
    assert.equal(line.home[0], ids[0]);
    assert.ok(warns.some((w) => w.includes(`duplicate hero ${ids[0]}`)));
  } finally {
    console.warn = orig;
  }
});

check("game start spawns a unique roster and reconnect keeps it", () => {
  const [hero1, hero2] = roster();
  assert.ok(hero1 && hero2);
  const game = makeGame();
  game.pick(hero1);
  game.start({
    home: ["A", "B", "C", "D", "E"],
    away: ["F", "G", "H", "I", "J"],
    humans: ["A"],
  });
  const ids = heroIds(game);
  assert.equal(ids.length, MATCH_SEATS);
  assert.equal(new Set(ids).size, MATCH_SEATS);
  assert.equal(ids.filter((id) => id === hero1).length, 1);
  game.openSeats();
  const seat0 = game.heroAtSeat(0);
  assert.equal(seat0, hero1);
  game.releaseSeat(0);
  assert.equal(game.heroAtSeat(0), seat0);
  assert.equal(heroIds(game).filter((id) => id === seat0).length, 1);
  game.halt();
  game.pick(hero1);
  game.start({
    home: ["A", "B", "C", "D", "E"],
    away: ["F", "G", "H", "I", "J"],
    humans: ["A"],
  });
  const again = heroIds(game);
  assert.equal(again.length, MATCH_SEATS);
  assert.equal(new Set(again).size, MATCH_SEATS);
  assert.ok(again.includes(hero1));
  game.halt();
});

check("game start rejects a duplicated forced roster", () => {
  const ids = freeBotIds();
  const warns: string[] = [];
  const orig = console.warn;
  console.warn = (...args: unknown[]) => {
    warns.push(args.map(String).join(" "));
  };
  try {
    const game = makeGame();
    game.start({
      home: ["A", "B", "C", "D", "E"],
      away: ["F", "G", "H", "I", "J"],
      watch: true,
      kits: [ids[0]!, ids[0]!, ids[1]!, ids[2]!, ids[3]!],
      awayKits: [ids[0]!, ids[4]!, ids[5]!, ids[6]!, ids[7]!],
      humans: [],
    });
    const spawned = heroIds(game);
    assert.equal(spawned.length, MATCH_SEATS);
    assert.equal(new Set(spawned).size, MATCH_SEATS);
    assert.equal(spawned.filter((id) => id === ids[0]).length, 1);
    assert.ok(warns.some((w) => w.includes("duplicate hero")));
    game.halt();
  } finally {
    console.warn = orig;
  }
});

check("bots roll every registered hero including dlc", () => {
  const ids = freeBotIds();
  const set = new Set(ids);
  assert.equal(set.size, HEROES.length);
  const dlc = HEROES.filter((h) => h.dlc);
  const standard = HEROES.filter((h) => !h.dlc);
  assert.ok(dlc.length > 0);
  assert.ok(standard.length > 0);
  for (const h of HEROES) assert.ok(set.has(h.id), h.id);
  for (const h of HUMAN_FREE_HEROES) {
    assert.equal(h.dlc, false, h.id);
    assert.equal(isMmaHero(h.id), false, h.id);
  }
  for (const h of dlc) {
    assert.equal(HUMAN_FREE_HEROES.some((x) => x.id === h.id), false, h.id);
    assert.ok(ids.includes(h.id), h.id);
  }
});

check("omitted ai seats vary and stay mixed with standard heroes", () => {
  const pick = HEROES.find((h) => !h.dlc && h.id !== HOOLI_ID);
  assert.ok(pick);
  const signatures = new Set<string>();
  let sawDlc = false;
  let sawOtherStandard = false;
  for (let i = 0; i < 40; i++) {
    const line = uniqueSideKits(pick.id);
    const all = [...line.home, ...line.away];
    assert.equal(all.length, MATCH_SEATS);
    assert.equal(new Set(all).size, MATCH_SEATS);
    assert.equal(line.home[0], pick.id);
    const counts = { str: 0, agi: 0, int: 0 };
    for (const id of line.home) counts[heroById(id).attr] += 1;
    assert.ok(counts.str >= 1 && counts.str <= 2);
    assert.ok(counts.agi >= 1 && counts.agi <= 2);
    assert.ok(counts.int >= 1 && counts.int <= 2);
    assert.ok(all.some((id) => !heroById(id).dlc));
    if (all.some((id) => heroById(id).dlc)) sawDlc = true;
    if (all.some((id) => id !== pick.id && !heroById(id).dlc)) sawOtherStandard = true;
    signatures.add(all.join("|"));
  }
  assert.ok(signatures.size > 1);
  assert.ok(sawDlc);
  assert.ok(sawOtherStandard);
});

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("draft pick tests passed");
