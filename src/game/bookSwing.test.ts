import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RANGED_BASIC_MIN, heroById } from "./heroes.ts";
import { pixelKit } from "./pixelRoster.ts";
import { BORIS_PAL } from "./borisSheet.ts";
import { armLayer, attackLimb, posePriority, resolveBasicAttack, type AttackSubject } from "./attackPose.ts";
import { bookSwingAmount, kitHoldsSwungBook, placeBookPixel, redBookPixels } from "./bookSwing.ts";

function subject(id: string): AttackSubject {
  const hero = heroById(id);
  return {
    kind: "hero",
    heroId: hero.id,
    wing: hero.wing,
    role: hero.role,
    prop: pixelKit(hero.id).prop,
    melee: hero.melee,
    attackIndex: 0,
  };
}

function tipX(pose: string, frame: number): number {
  const book = redBookPixels();
  let x = 0;
  let best = book[0];
  for (const p of book) if (!best || p.x < best.x) best = p;
  if (!best) return 0;
  x = placeBookPixel(best, pose, frame).x;
  return x;
}

const boris = heroById("maga-boris");
assert.equal(boris.id, "maga-boris");
assert.equal(boris.wing, "maga");
assert.notEqual(boris.wing, "mma");
assert.equal(boris.melee, true);
assert.equal(boris.range, 145);
assert.ok(boris.range >= 140 && boris.range <= 165);
assert.ok(boris.range < RANGED_BASIC_MIN);
assert.equal(boris.damage, 48);
assert.equal(boris.hp, 860);
assert.deepEqual(
  boris.abilities.map((a) => [a.key, a.fx, a.cd, a.mana]),
  [
    ["Q", "cone", 8, 70],
    ["W", "dash", 12, 70],
    ["E", "shield", 14, 70],
    ["R", "nova", 78, 145],
  ],
);

const kit = pixelKit("maga-boris");
assert.equal(kit.prop, "book");
assert.equal(kit.body, "tory");
assert.equal(kitHoldsSwungBook(kit), true);

const attack = resolveBasicAttack(subject("maga-boris"));
assert.equal(attack.kind, "book");
assert.equal(attack.side, null);
assert.equal(attack.spawnsAmmo, false);
assert.equal(attack.suppressesRun, true);
assert.notEqual(attack.kind, "punch");
assert.notEqual(attack.kind, "shoot");
assert.notEqual(attack.kind, "rifle");
assert.notEqual(attack.kind, "pistol");
assert.notEqual(attack.kind, "shotgun");
const limb = attackLimb(attack);
assert.equal(limb?.fist, null);
assert.equal(limb?.weapon, "book");

const pal = new Set(BORIS_PAL.map((c) => c.toLowerCase()));
const book = redBookPixels();
assert.ok(book.length > 80);
let cover = 0;
for (const p of book) {
  assert.ok(pal.has(p.color.toLowerCase()), p.color);
  if (p.color.toLowerCase() === "#a20b11") cover += 1;
}
assert.ok(cover > 60);

assert.equal(bookSwingAmount("idle", 5), 0);
assert.equal(bookSwingAmount("walk", 3), 0);
assert.equal(bookSwingAmount("cast", 5), 0);
assert.equal(bookSwingAmount("attack", 5), 1);
assert.equal(bookSwingAmount("attack", 11), 0);
const idleTip = tipX("idle", 2);
const walkTip = tipX("walk", 4);
const hitTip = tipX("attack", 5);
const backTip = tipX("attack", 11);
assert.equal(walkTip, idleTip);
assert.ok(hitTip > idleTip + 8);
assert.ok(Math.abs(backTip - idleTip) < 0.01);

assert.equal(posePriority({ dead: false, ultimate: false, casting: false, attacking: true, running: true }), "attack");
assert.equal(armLayer({ attacking: true, running: true }), "attack");
assert.notEqual(armLayer({ attacking: true, running: true }), "run");
assert.equal(armLayer({ attacking: false, running: true }), "run");

const others = ["maga-tommy", "maga-steers", "maga-grumptor", "lw-harass", "wild-karen", "mma-macgregor", "maga-hooli"];
for (const id of others) {
  const other = resolveBasicAttack(subject(id));
  assert.notEqual(other.kind, "book", id);
  assert.equal(kitHoldsSwungBook(pixelKit(id)), false, id);
  assert.notEqual(attackLimb(other)?.weapon, "book", id);
}
assert.equal(resolveBasicAttack(subject("mma-macgregor")).kind, "punch");
assert.notEqual(resolveBasicAttack(subject("maga-steers")).kind, "book");

const sheet = readFileSync(new URL("./sheetPaint.ts", import.meta.url), "utf8");
assert.match(sheet, /if \(kitHoldsSwungBook\(kit\)\) paintSwungBook\(ctx, bodyX, upperY, pose, frame\)/);
const swingSrc = readFileSync(new URL("./bookSwing.ts", import.meta.url), "utf8");
assert.match(swingSrc, /if \(pose !== "attack"\) return;/);
const ink = readFileSync(new URL("./heroInk.ts", import.meta.url), "utf8");
assert.match(ink, /paintHeroSheet\(ctx, sheet, pose, frame, skinId, limb\)/);
const gameSrc = readFileSync(new URL("./game.ts", import.meta.url), "utf8");
const swingFn = gameSrc.slice(gameSrc.indexOf("private swing(u: Unit, t: Unit)"));
assert.match(swingFn, /this\.keepRedBookMelee\(u\)/);
assert.ok(swingFn.indexOf("this.keepRedBookMelee(u)") < swingFn.indexOf("this.landHit(u, t, raw, crit)"));
assert.ok(swingFn.indexOf("this.landHit(u, t, raw, crit)") < swingFn.indexOf("this.launchShot(u, t.id, t.x, t.y, raw, crit, true)"));
assert.match(gameSrc, /if \(u\.melee\) this\.landHit\(u, t, raw, crit\)/);

console.log("ok boris book swing");
