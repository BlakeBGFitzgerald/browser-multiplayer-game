import "../server/dom-stub";
import assert from "node:assert/strict";
import { Game } from "./game";
import { Input } from "./input";
import { Sfx } from "./audio";
import {
  HEROES,
  HOOLI_ID,
  MMA_MELEE_RANGE,
  RANGED_BASIC_MIN,
  heroById,
  withMmaMeleeBasic,
} from "./heroes";

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

const mma = HEROES.filter((h) => h.wing === "mma");

check("every MMA hero is classified by wing and strikes in melee", () => {
  assert.ok(mma.length >= 6);
  for (const h of mma) {
    assert.equal(h.wing, "mma", h.id);
    assert.equal(h.melee, true, h.id);
    assert.ok(h.range < RANGED_BASIC_MIN, `${h.id} range ${h.range}`);
    assert.ok(h.range > 0, h.id);
  }
  const style = heroById("mma-adesanyaish");
  assert.equal(style.melee, true);
  assert.equal(style.range, MMA_MELEE_RANGE);
  assert.equal(style.abilities[0]?.fx, "bolt");
  assert.equal(style.abilities[2]?.fx, "dash");
  assert.equal(style.abilities[3]?.fx, "bolt");
  const reach = heroById("mma-jonesy");
  assert.equal(reach.melee, true);
  assert.equal(reach.range, 165);
});

check("a future MMA kit picks up melee from the wing", () => {
  const scout = heroById("lw-journalist");
  const future = withMmaMeleeBasic({ ...scout, id: "mma-future", wing: "mma", melee: false, range: 440 });
  assert.equal(future.melee, true);
  assert.equal(future.range, MMA_MELEE_RANGE);
  assert.equal(scout.melee, false);
  assert.equal(scout.range, 440);
  const kept = withMmaMeleeBasic(heroById("mma-macgregor"));
  assert.equal(kept.melee, true);
  assert.equal(kept.range, 145);
  const wild = withMmaMeleeBasic(heroById("wild-dynasty"));
  assert.equal(wild.melee, false);
  assert.equal(wild.range, 420);
});

check("a ranged non-MMA hero stays ranged", () => {
  const hooli = heroById(HOOLI_ID);
  assert.equal(hooli.wing, "maga");
  assert.equal(hooli.melee, false);
  assert.equal(hooli.range, 460);
  const scout = heroById("lw-journalist");
  assert.equal(scout.melee, false);
  assert.equal(scout.range, 440);
});

check("a non-MMA melee hero is unchanged", () => {
  const tommy = heroById("maga-tommy");
  assert.equal(tommy.melee, true);
  assert.equal(tommy.range, 140);
  assert.equal(tommy.wing, "maga");
  const sand = heroById("lw-sandbags");
  assert.equal(sand.melee, true);
  assert.equal(sand.range, 140);
});

check("MMA basic attacks close and strike with no projectile", () => {
  const game = makeGame();
  for (const h of mma) {
    const fight = game.rehearseBasic(h.id, 320);
    assert.equal(fight.melee, true, h.id);
    assert.ok(fight.range < RANGED_BASIC_MIN, h.id);
    assert.equal(fight.basicShots, 0, h.id);
    assert.ok(fight.startDist > fight.range + 40, `${h.id} start ${fight.startDist} range ${fight.range}`);
    assert.ok(fight.dealt, `${h.id} did not land a melee hit`);
    assert.ok(fight.dist <= fight.range + 28, `${h.id} ended at ${fight.dist}`);
  }
  const spoof = game.rehearseBasic("mma-adesanyaish", 320, true);
  assert.equal(spoof.melee, true);
  assert.ok(spoof.range < RANGED_BASIC_MIN);
  assert.equal(spoof.basicShots, 0);
  assert.ok(spoof.dealt);
  assert.ok(spoof.dist <= spoof.range + 28);
  game.halt();
});

check("a ranged hero still fires and a melee hero does not", () => {
  const game = makeGame();
  const hooli = game.rehearseBasic(HOOLI_ID, 320);
  assert.equal(hooli.melee, false);
  assert.equal(hooli.range, 460);
  assert.ok(hooli.basicShots >= 3, `hooli shots ${hooli.basicShots}`);
  assert.ok(hooli.dealt);
  const tommy = game.rehearseBasic("maga-tommy", 320);
  assert.equal(tommy.melee, true);
  assert.equal(tommy.range, 140);
  assert.equal(tommy.basicShots, 0);
  assert.ok(tommy.dealt);
  assert.ok(tommy.dist <= tommy.range + 28);
  game.halt();
});

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("mma melee tests passed");
