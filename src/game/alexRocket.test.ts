import "../server/dom-stub.ts";
import assert from "node:assert/strict";
import { Game } from "./game.ts";
import { Input } from "./input.ts";
import { Sfx } from "./audio.ts";
import { heroById } from "./heroes.ts";
import { heroWeaponMuzzle } from "./heroWeapons.ts";
import { HOOLI_BURST_AT, HOOLI_BURST_END } from "./hooliBurst.ts";
import {
  ALEX_GROANS_ID,
  ALEX_ROCKET_END,
  ALEX_ROCKET_FIRE,
  AlexRocketFire,
  alexRocketPresentation,
  isNerfColor,
  nerfMuzzle,
} from "./nerf.ts";

type Pellet = { at: number; event?: string; fired: boolean; dmg: number };
type Actor = {
  id: number;
  kind: string;
  heroId?: string;
  team: string;
  x: number;
  y: number;
  face: number;
  atk: number;
  period: number;
  ms: number;
  hp: number;
  dead: boolean;
  respawn: number;
  target: number | null;
  burstAge: number;
  volley?: Pellet[];
  damage: number;
  player?: boolean;
};
type Shot = {
  x: number;
  y: number;
  speed: number;
  dmg: number;
  from: number;
  target: number;
  heroId?: string;
  ammo?: string;
  procs?: boolean;
  crit: boolean;
};
type Probe = {
  units: Actor[];
  shots: Shot[];
  guard: number;
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

function probe(game: Game): Probe {
  return game as unknown as Probe;
}

function alexShots(game: Probe, id: number): Shot[] {
  return game.shots.filter((s) => s.from === id && s.heroId === ALEX_GROANS_ID);
}

function arm(game: Game): { alex: Actor; foe: Actor } {
  const box = probe(game);
  game.pick(ALEX_GROANS_ID);
  game.start({
    home: ["Alex", "B", "C", "D", "E"],
    away: ["F", "G", "H", "I", "J"],
    humans: ["Alex"],
    kits: [ALEX_GROANS_ID, "maga-grumptor", "lw-journalist", "mma-macgregor", "wild-icon"],
    awayKits: ["lw-bitenten", "maga-tommy", "lw-sandbags", "mma-jonesy", "wild-karen"],
  });
  const alex = box.units.find((u) => u.heroId === ALEX_GROANS_ID);
  const foe = box.units.find((u) => u.kind === "hero" && u.team === "away");
  if (!alex || !foe) throw new Error("missing alex duel");
  alex.x = 1200;
  alex.y = 1200;
  alex.ms = 0;
  alex.atk = 0;
  alex.target = foe.id;
  foe.x = 1400;
  foe.y = 1200;
  foe.hp = 50000;
  for (const u of box.units) {
    if (u.id === alex.id) continue;
    u.atk = 30;
    u.ms = 0;
    u.target = null;
  }
  return { alex, foe };
}

const period = heroById(ALEX_GROANS_ID).aspd ?? 0;
assert.equal(AlexRocketFire, "AlexRocketFire");
assert.ok(ALEX_ROCKET_FIRE > 0);
assert.ok(period > ALEX_ROCKET_FIRE, `period ${period}`);
assert.notEqual(ALEX_ROCKET_END, HOOLI_BURST_END);
assert.deepEqual([...HOOLI_BURST_AT], [0.018, 0.108, 0.198]);
assert.equal(HOOLI_BURST_END, 0.3);

const raised = alexRocketPresentation(0.04);
assert.equal(raised.pose, "idle");
assert.ok(raised.lean < 0);
const braced = alexRocketPresentation(ALEX_ROCKET_FIRE);
assert.equal(braced.pose, "attack");
assert.equal(braced.frame, 4);
assert.equal(braced.lean, 0);
const recoil = alexRocketPresentation((ALEX_ROCKET_FIRE + ALEX_ROCKET_END) / 2);
assert.equal(recoil.pose, "attack");
assert.ok(recoil.frame > 4);

const live = makeGame();
const liveBox = probe(live);
const { alex, foe } = arm(live);
live.update(0.05);
assert.equal(alexShots(liveBox, alex.id).length, 0);
assert.equal(alex.volley?.length, 1);
assert.equal(alex.volley?.[0]?.event, AlexRocketFire);
assert.equal(alex.volley?.[0]?.at, ALEX_ROCKET_FIRE);
assert.ok(alex.volley[0]!.at > 0 && alex.volley[0]!.at < alex.period);
assert.equal(alex.atk, alex.period);
assert.equal(alex.volley[0]!.dmg, alex.damage);

while (alex.burstAge + 0.02 < ALEX_ROCKET_FIRE) live.update(0.02);
assert.equal(alexShots(liveBox, alex.id).length, 0);
assert.ok(alex.burstAge > 0 && alex.burstAge < ALEX_ROCKET_FIRE);

const face = Math.atan2(foe.y - alex.y, foe.x - alex.x);
const muzzle = heroWeaponMuzzle(ALEX_GROANS_ID, alex.x, alex.y, face, "attack");
const nerf = nerfMuzzle(alex.x, alex.y, face, "attack");
assert.ok(Math.hypot(muzzle.x - nerf.x, muzzle.y - nerf.y) < 0.01);
assert.ok(Math.hypot(muzzle.x - alex.x, muzzle.y - alex.y) > 20);

const dt = ALEX_ROCKET_FIRE - alex.burstAge + 0.005;
live.update(dt);
const fired = alexShots(liveBox, alex.id);
assert.equal(fired.length, 1);
const shot = fired[0]!;
assert.equal(shot.speed, 480);
assert.equal(shot.dmg, alex.damage);
assert.equal(shot.crit, false);
assert.equal(shot.procs, true);
assert.equal(shot.target, foe.id);
assert.ok(isNerfColor(shot.ammo));
const step = 480 * dt;
const dx = foe.x - muzzle.x;
const dy = foe.y - muzzle.y;
const n = Math.hypot(dx, dy) || 1;
const ex = muzzle.x + (dx / n) * step;
const ey = muzzle.y + (dy / n) * step;
assert.ok(Math.hypot(shot.x - ex, shot.y - ey) < 1.5, `shot ${shot.x},${shot.y} expected ${ex},${ey}`);
assert.ok(Math.hypot(shot.x - alex.x, shot.y - alex.y) > 20);
live.halt();

const doomed = makeGame();
const doomedBox = probe(doomed);
const windup = arm(doomed);
doomed.update(0.05);
assert.equal(alexShots(doomedBox, windup.alex.id).length, 0);
assert.ok(windup.alex.volley?.some((pellet) => !pellet.fired));
doomedBox.guard = 0;
doomedBox.hurt(windup.alex, 999999);
assert.equal(windup.alex.dead, true);
doomed.update(0.4);
assert.equal(alexShots(doomedBox, windup.alex.id).length, 0);
assert.equal(windup.alex.volley, undefined);
doomed.halt();

console.log("alex rocket tests passed");
