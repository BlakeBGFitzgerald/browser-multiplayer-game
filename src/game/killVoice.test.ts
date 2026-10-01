import assert from "node:assert/strict";
import { kitPatch } from "./kits.ts";
import {
  KILL_PACKS,
  KILL_VOICE,
  creditVoiceMulti,
  nextMultiCount,
  pickKillLine,
  queueKillCue,
  rankFor,
  type KillCredit,
  type KillCue,
  type KillRank,
  type MultiMark,
} from "./killVoice.ts";

const LIVE = [
  "maga-grumptor",
  "maga-quirk",
  "maga-tommy",
  "maga-elonmolk",
  "maga-rogentor",
  "maga-alexgroans",
  "maga-boris",
  "maga-brander",
  "maga-vestyt",
  "maga-steers",
  "maga-hooli",
  "maga-ricky",
  "maga-bushed",
  "lw-bitenten",
  "lw-sandbags",
  "lw-odramma",
  "lw-harass",
  "lw-hocking",
  "lw-youngturkey",
  "lw-vakxie",
  "lw-climate",
  "lw-journalist",
  "mma-macgregor",
  "mma-nurmagoat",
  "mma-jonesy",
  "mma-adesanyaish",
  "mma-poirierish",
  "mma-diazish",
  "wild-icon",
  "wild-enigma",
  "wild-cartoons",
  "wild-dynasty",
  "wild-legend",
  "wild-karen",
  "wild-butter",
  "wild-cezanne",
  "wild-vegan",
  "wild-slush",
] as const;

const RANKS: KillRank[] = ["kill", "double", "triple", "quad", "penta"];

function climb(n: number, step = 1): MultiMark {
  let mark: MultiMark | undefined;
  for (let i = 0; i < n; i++) mark = nextMultiCount(mark, i * step);
  if (!mark) throw new Error("climb");
  return mark;
}

function credit(
  role: "killer" | "assist",
  mark: MultiMark | undefined,
  now: number,
  queue: readonly KillCue[],
  cue: KillCredit,
): { mark: MultiMark | undefined; queue: readonly KillCue[] } {
  return creditVoiceMulti(role, mark, now, queue, cue);
}

assert.equal(KILL_VOICE.window, 12);
assert.equal(KILL_VOICE.settle, 0.45);
assert.equal(KILL_VOICE.cooldown, 2.6);
assert.equal(KILL_VOICE.volume, 1);
assert.equal(typeof KILL_VOICE.rng, "function");

assert.equal(climb(1).count, 1);
assert.equal(rankFor(1), "kill");
assert.equal(climb(2).count, 2);
assert.equal(rankFor(2), "double");
assert.equal(climb(3).count, 3);
assert.equal(rankFor(3), "triple");
assert.equal(climb(4).count, 4);
assert.equal(rankFor(4), "quad");
assert.equal(climb(5).count, 5);
assert.equal(rankFor(5), "penta");
assert.equal(climb(6).count, 6);
assert.equal(rankFor(6), "penta");
assert.equal(rankFor(9), "penta");

const pentaLine = pickKillLine("maga-grumptor", 6, () => 0);
assert.ok(KILL_PACKS["maga-grumptor"]!.penta.includes(pentaLine));

let burstMark: MultiMark | undefined;
let burstQueue: readonly KillCue[] = [];
for (let i = 0; i < 5; i++) {
  const now = i * 0.08;
  const step = credit("killer", burstMark, now, burstQueue, {
    unitId: 4,
    heroId: "mma-macgregor",
    home: true,
    playAt: now + KILL_VOICE.settle,
  });
  burstMark = step.mark;
  burstQueue = step.queue;
}
assert.equal(burstMark?.count, 5);
assert.equal(burstQueue.length, 1);
assert.equal(burstQueue[0]!.n, 5);
assert.equal(burstQueue[0]!.playAt, KILL_VOICE.settle);
assert.equal(rankFor(burstQueue[0]!.n), "penta");
const burstSpoken = pickKillLine(burstQueue[0]!.heroId, burstQueue[0]!.n, () => 0);
assert.equal(burstSpoken, KILL_PACKS["mma-macgregor"]!.penta[0]);

let expired = nextMultiCount(undefined, 0);
expired = nextMultiCount(expired, 3);
assert.equal(expired.count, 2);
expired = nextMultiCount(expired, 3 + 12.01);
assert.equal(expired.count, 1);
assert.equal(rankFor(expired.count), "kill");
const onTheDot = nextMultiCount({ count: 1, at: 0 }, 12);
assert.equal(onTheDot.count, 2);

const held = nextMultiCount(undefined, 1);
const assisted = credit("assist", held, 2, [], {
  unitId: 9,
  heroId: "lw-sandbags",
  home: false,
  playAt: 2.45,
});
assert.equal(assisted.mark, held);
assert.equal(assisted.mark?.count, 1);
assert.equal(assisted.queue.length, 0);

let alive = nextMultiCount(undefined, 1);
alive = nextMultiCount(alive, 2);
assert.equal(alive.count, 2);
const earned = queueKillCue(
  [],
  { unitId: 7, heroId: "maga-tommy", home: true, n: alive.count, playAt: 2 + KILL_VOICE.settle },
  2,
);
const afterDeath: MultiMark | undefined = undefined;
const reborn = nextMultiCount(afterDeath, 4);
assert.equal(earned.length, 1);
assert.equal(earned[0]!.n, 2);
assert.equal(reborn.count, 1);
assert.equal(rankFor(reborn.count), "kill");

assert.equal(pickKillLine("mma-macgregor", 4, () => 0, {}), "That's the one.");
assert.equal(
  pickKillLine("mma-macgregor", 5, () => 0, { triple: ["only triple"], kill: ["k"] }),
  "only triple",
);
assert.equal(pickKillLine("mma-macgregor", 3, () => 0, { kill: ["  ", ""], double: ["closer"] }), "closer");
assert.equal(pickKillLine("missing-hero", 5, () => 0), kitPatch("missing-hero").voice.kill);
assert.doesNotThrow(() => pickKillLine("missing-hero", -3, () => Number.NaN));
assert.equal(typeof pickKillLine("missing-hero", 99, () => 0.4), "string");

let markA: MultiMark | undefined;
let markB: MultiMark | undefined;
let split: readonly KillCue[] = [];
markA = nextMultiCount(markA, 5);
markA = nextMultiCount(markA, 6);
markB = nextMultiCount(markB, 6);
split = queueKillCue(
  split,
  { unitId: 1, heroId: "mma-macgregor", home: true, n: markA.count, playAt: 6 + KILL_VOICE.settle },
  6,
);
split = queueKillCue(
  split,
  { unitId: 2, heroId: "maga-alexgroans", home: false, n: markB.count, playAt: 6 + KILL_VOICE.settle },
  6,
);
split = queueKillCue(
  split,
  { unitId: 1, heroId: "mma-macgregor", home: true, n: 3, playAt: 6.2 + KILL_VOICE.settle },
  6.1,
);
assert.equal(markA.count, 2);
assert.equal(markB.count, 1);
assert.equal(split.length, 2);
assert.equal(split[0]!.unitId, 1);
assert.equal(split[0]!.heroId, "mma-macgregor");
assert.equal(split[0]!.n, 3);
assert.equal(split[1]!.unitId, 2);
assert.equal(split[1]!.heroId, "maga-alexgroans");
assert.equal(split[1]!.n, 1);
assert.equal(pickKillLine(split[1]!.heroId, split[1]!.n, () => 0), "The frogs are gay.");
assert.notEqual(pickKillLine(split[0]!.heroId, split[0]!.n, () => 0), "The frogs are gay.");

assert.deepEqual([...KILL_PACKS["maga-alexgroans"]!.kill], ["The frogs are gay."]);
assert.equal(pickKillLine("maga-alexgroans", 1, () => 0), "The frogs are gay.");
assert.equal(pickKillLine("maga-alexgroans", 1, () => 0.99), "The frogs are gay.");
assert.notEqual(pickKillLine("maga-alexgroans", 2, () => 0), "The frogs are gay.");

const GRAB = "Grab them by the pussy!";
const FOOK = "Who the fook is that guy?";

assert.deepEqual([...KILL_PACKS["maga-grumptor"]!.kill], [GRAB]);
assert.equal(pickKillLine("maga-grumptor", 1, () => 0), GRAB);
assert.equal(pickKillLine("maga-grumptor", 1, () => 0.99), GRAB);
const grumpKill = credit("killer", undefined, 1, [], {
  unitId: 11,
  heroId: "maga-grumptor",
  home: true,
  playAt: 1 + KILL_VOICE.settle,
});
assert.equal(grumpKill.queue.length, 1);
assert.equal(grumpKill.queue[0]!.n, 1);
assert.equal(pickKillLine(grumpKill.queue[0]!.heroId, grumpKill.queue[0]!.n, () => 0.4), GRAB);
assert.notEqual(pickKillLine("maga-grumptor", 2, () => 0), GRAB);

assert.deepEqual([...KILL_PACKS["mma-macgregor"]!.kill], [FOOK]);
assert.equal(pickKillLine("mma-macgregor", 1, () => 0), FOOK);
assert.equal(pickKillLine("mma-macgregor", 1, () => 0.5), FOOK);
assert.notEqual(pickKillLine("mma-macgregor", 5, () => 0), FOOK);
const macKill = credit("killer", undefined, 2, [], {
  unitId: 12,
  heroId: "mma-macgregor",
  home: false,
  playAt: 2 + KILL_VOICE.settle,
});
assert.equal(macKill.queue.length, 1);
assert.equal(pickKillLine(macKill.queue[0]!.heroId, macKill.queue[0]!.n, () => 0.2), FOOK);

const bystander = "lw-journalist";
for (const rank of RANKS) {
  for (const line of KILL_PACKS[bystander]![rank]) {
    assert.notEqual(line, GRAB, bystander);
    assert.notEqual(line, FOOK, bystander);
  }
}
assert.notEqual(pickKillLine(bystander, 1, () => 0), GRAB);
assert.notEqual(pickKillLine(bystander, 1, () => 0.99), FOOK);
assert.equal(credit("assist", undefined, 3, [], {
  unitId: 13,
  heroId: "maga-grumptor",
  home: true,
  playAt: 3 + KILL_VOICE.settle,
}).queue.length, 0);

const priorRng = KILL_VOICE.rng;
KILL_VOICE.rng = () => 0;
assert.equal(pickKillLine("maga-grumptor", 2), KILL_PACKS["maga-grumptor"]!.double[0]);
KILL_VOICE.rng = () => 0.99;
assert.equal(
  pickKillLine("maga-grumptor", 2),
  KILL_PACKS["maga-grumptor"]!.double[KILL_PACKS["maga-grumptor"]!.double.length - 1],
);
KILL_VOICE.rng = priorRng;

assert.equal(LIVE.length, 38);
assert.deepEqual(Object.keys(KILL_PACKS).sort(), [...LIVE].sort());
for (const id of LIVE) {
  const pack = KILL_PACKS[id];
  assert.ok(pack, id);
  for (const rank of RANKS) {
    assert.ok(pack[rank].length > 0, `${id} ${rank}`);
    for (const line of pack[rank]) assert.ok(line.trim().length > 0, `${id} ${rank}`);
  }
}

console.log("ok kill voice");
