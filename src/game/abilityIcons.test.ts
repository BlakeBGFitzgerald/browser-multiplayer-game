import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { ABILITY_N, abilityPainterIds, abilityRgba, hudCooldownRgba } from "./abilityIcons.ts";
import { HEROES } from "./heroes.ts";

const BG = "#14110e";

function slotsOf(hero: (typeof HEROES)[number]): string[] {
  const slots: string[] = [];
  if (hero.passive) slots.push("P");
  for (const ability of hero.abilities) slots.push(ability.key);
  return slots;
}

const needed: string[] = [];
for (const hero of HEROES) {
  for (const slot of slotsOf(hero)) needed.push(`${hero.id}:${slot}`);
}

assert.equal(new Set(needed).size, needed.length, "ability keys should be unique");
assert.deepEqual([...abilityPainterIds()].sort(), [...needed].sort(), "every ability has its own icon");
assert.throws(() => abilityRgba("missing-hero", "Q"), /missing ability icon: missing-hero:Q/);
assert.throws(() => abilityRgba(HEROES[0]!.id, "Z"), /missing ability icon:/);

function pixelHash(rgba: Uint8ClampedArray): string {
  return createHash("sha256").update(rgba).digest("hex");
}

function rgbAt(rgba: Uint8ClampedArray, x: number, y: number): string {
  const i = (y * ABILITY_N + x) * 4;
  return `${rgba[i]},${rgba[i + 1]},${rgba[i + 2]}`;
}

const hashes = new Map<string, string>();
for (const hero of HEROES) {
  const corners = new Map<string, string>();
  for (const slot of slotsOf(hero)) {
    const id = `${hero.id}:${slot}`;
    const rgba = abilityRgba(hero.id, slot, BG);
    assert.equal(rgba.length, ABILITY_N * ABILITY_N * 4, id);
    let ink = 0;
    let minL = 9999;
    let maxL = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const r = rgba[i]!;
      const g = rgba[i + 1]!;
      const b = rgba[i + 2]!;
      const blank = r === 0x14 && g === 0x11 && b === 0x0e;
      if (blank) continue;
      ink++;
      const L = r + g + b;
      if (L < minL) minL = L;
      if (L > maxL) maxL = L;
    }
    assert.ok(ink >= 650, `${id} empty art (${ink})`);
    assert.ok(maxL - minL >= 40, `${id} flat lighting`);
    const hash = pixelHash(rgba);
    for (const [other, prev] of hashes) {
      assert.notEqual(hash, prev, `${id} shares a bitmap with ${other}`);
    }
    hashes.set(id, hash);
    corners.set(slot, rgbAt(rgba, 0, 0));
  }
  assert.notEqual(corners.get("Q"), corners.get("R"), `${hero.id} ultimate frame`);
  assert.notEqual(corners.get("Q"), corners.get("P"), `${hero.id} passive frame`);
}

assert.equal(hashes.size, needed.length, "ability icon hashes differ");

const magaIcon = abilityRgba("maga-grumptor", "Q", BG);
const antifaIcon = abilityRgba("lw-harass", "W", BG);
assert.notEqual(pixelHash(magaIcon), pixelHash(antifaIcon), "MAGA and Antifa icons of different abilities match");
assert.notEqual(rgbAt(abilityRgba("maga-tommy", "Q", BG), 1, 2), rgbAt(abilityRgba("lw-sandbags", "E", BG), 1, 28), "faction frame accents match");

function lumAt(rgba: Uint8ClampedArray, x: number, y: number): number {
  const i = (y * ABILITY_N + x) * 4;
  return 0.2126 * rgba[i]! + 0.7152 * rgba[i + 1]! + 0.0722 * rgba[i + 2]!;
}

function leadAt(rgba: Uint8ClampedArray, x: number, y: number): number {
  const i = (y * ABILITY_N + x) * 4;
  const ch = [rgba[i]!, rgba[i + 1]!, rgba[i + 2]!];
  return ch.indexOf(Math.max(...ch));
}

function gapAt(rgba: Uint8ClampedArray, x: number, y: number): number {
  const i = (y * ABILITY_N + x) * 4;
  const ch = [rgba[i]!, rgba[i + 1]!, rgba[i + 2]!];
  return Math.max(...ch) - Math.min(...ch);
}

const cooldownSamples: [string, string][] = [
  ["maga-grumptor", "Q"],
  ["maga-grumptor", "R"],
  ["lw-harass", "W"],
  ["lw-hocking", "R"],
  ["mma-macgregor", "Q"],
];
for (const [id, slot] of cooldownSamples) {
  const ready = abilityRgba(id, slot, BG);
  const cool = hudCooldownRgba(ready);
  assert.equal(cool.length, ready.length, `${id}:${slot} cooldown size`);
  let brightest = 0;
  let coolest = 0;
  let best = -1;
  let bestCool = -1;
  for (let i = 0; i < ready.length; i += 4) {
    const L = ready[i]! + ready[i + 1]! + ready[i + 2]!;
    const C = cool[i]! + cool[i + 1]! + cool[i + 2]!;
    if (C > L + 1) assert.fail(`${id}:${slot} cooldown pixel got brighter`);
    if (L > best) {
      best = L;
      brightest = i;
    }
    if (C > bestCool) {
      bestCool = C;
      coolest = i;
    }
  }
  assert.equal(brightest, coolest, `${id}:${slot} cooldown moved the highlight`);
  for (const [x, y] of [
    [24, 24],
    [32, 30],
    [40, 28],
    [18, 36],
  ] as const) {
    if (gapAt(ready, x, y) > 18) {
      assert.equal(leadAt(ready, x, y), leadAt(cool, x, y), `${id}:${slot} subject changed at ${x},${y}`);
    }
    const readyL = lumAt(ready, x, y);
    if (readyL > 28) assert.ok(lumAt(cool, x, y) < readyL - 0.4, `${id}:${slot} not darkened at ${x},${y}`);
  }
}

console.log(`ability icons ok · ${HEROES.length} heroes · ${needed.length} icons`);
