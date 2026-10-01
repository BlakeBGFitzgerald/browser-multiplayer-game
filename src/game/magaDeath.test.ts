import "../server/dom-stub.ts";
import assert from "node:assert/strict";
import { Game } from "./game.ts";
import { Input } from "./input.ts";
import { Sfx } from "./audio.ts";
import { ANTIFA_DEATH, MAGA_DEATH } from "./barks.ts";
import { HEROES } from "./heroes.ts";

type Actor = {
  id: number;
  kind: string;
  heroId?: string;
  team: string;
  name: string;
  hp: number;
  dead: boolean;
  bark: string;
  barkT: number;
  respawn: number;
  player?: boolean;
};
type Probe = {
  units: Actor[];
  guard: number;
  sfx: { fakeNews: () => void; nazi: () => void };
  hurt(t: Actor, raw: number): void;
};

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

for (const hero of HEROES) {
  if (hero.wing === "maga") assert.equal(hero.voice?.death, MAGA_DEATH, hero.id);
  else assert.notEqual(hero.voice?.death, MAGA_DEATH, hero.id);
}

const game = makeGame();
const box = game as unknown as Probe;
let news = 0;
let nazi = 0;
box.sfx.fakeNews = () => {
  news += 1;
};
box.sfx.nazi = () => {
  nazi += 1;
};
game.pick("lw-journalist");
game.start({
  home: ["A", "B", "C", "D", "E"],
  away: ["F", "G", "H", "I", "J"],
  humans: ["A"],
  kits: ["lw-journalist", "maga-grumptor", "maga-alexgroans", "mma-macgregor", "wild-icon"],
  awayKits: ["lw-bitenten", "maga-tommy", "lw-sandbags", "mma-jonesy", "wild-karen"],
});
box.guard = 0;

const grump = box.units.find((u) => u.heroId === "maga-grumptor");
const tommy = box.units.find((u) => u.heroId === "maga-tommy");
const ben = box.units.find((u) => u.heroId === "lw-bitenten");
if (!grump || !tommy || !ben) throw new Error("missing death cast");
assert.equal(grump.team, "home");
assert.equal(tommy.team, "away");
assert.notEqual(HEROES.find((h) => h.id === ben.heroId)?.wing, "maga");

for (const u of [grump, tommy, ben]) {
  u.bark = "";
  u.barkT = 0;
}

box.hurt(grump, 1);
assert.notEqual(grump.bark, MAGA_DEATH);
assert.equal(grump.dead, false);
assert.equal(news, 0);

box.hurt(grump, 999999);
assert.equal(grump.dead, true);
assert.equal(grump.bark, MAGA_DEATH);
assert.equal(news, 1);
assert.equal(nazi, 0);
box.hurt(grump, 999999);
assert.equal(news, 1);
assert.equal(grump.bark, MAGA_DEATH);

grump.bark = "";
grump.barkT = 0;
grump.respawn = 0.02;
game.update(0.05);
assert.equal(grump.dead, false);
assert.equal(grump.bark, "");
assert.equal(news, 1);

box.hurt(grump, 999999);
assert.equal(grump.dead, true);
assert.equal(grump.bark, MAGA_DEATH);
assert.equal(news, 2);

box.hurt(tommy, 1);
assert.notEqual(tommy.bark, MAGA_DEATH);
assert.equal(news, 2);
box.hurt(tommy, 999999);
assert.equal(tommy.bark, MAGA_DEATH);
assert.notEqual(tommy.bark, ANTIFA_DEATH);
assert.equal(news, 3);
assert.equal(nazi, 0);

box.hurt(ben, 999999);
assert.equal(ben.dead, true);
assert.equal(ben.bark, ANTIFA_DEATH);
assert.notEqual(ben.bark, MAGA_DEATH);
assert.equal(news, 3);
assert.equal(nazi, 1);

game.halt();
console.log("maga death tests passed");
