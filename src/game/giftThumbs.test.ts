import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { GIFT_ITEMS } from "./giftShop.ts";
import { THUMB_N, thumbGrid, thumbPainterFn, thumbPainterIds, thumbRgba } from "./giftThumbs.ts";

const BG = "#24180f";
const ids = GIFT_ITEMS.map((it) => it.id);
assert.equal(new Set(ids).size, ids.length, "shop ids should be unique");

const painterIds = thumbPainterIds();
assert.deepEqual([...painterIds].sort(), [...ids].sort(), "every shop id has its own painter");

assert.throws(() => thumbRgba("missing-gift-thumb"), /missing gift thumb: missing-gift-thumb/);
assert.throws(() => thumbGrid("missing-gift-thumb"), /missing gift thumb: missing-gift-thumb/);

function pixelHash(rgba: Uint8ClampedArray): string {
  return createHash("sha256").update(rgba).digest("hex");
}

const fns: NonNullable<ReturnType<typeof thumbPainterFn>>[] = [];
const hashes = new Map<string, string>();
for (const it of GIFT_ITEMS) {
  assert.equal(it.painter, it.id, `${it.id} painter field`);
  assert.ok(!/placeholder|item\d|^test/i.test(it.id), it.id);
  const fn = thumbPainterFn(it.id);
  assert.equal(typeof fn, "function", it.id);
  assert.equal(fn?.name, it.id, `${it.id} painter function`);
  fns.push(fn!);
  const rgba = thumbRgba(it.id, BG);
  assert.equal(rgba.length, THUMB_N * THUMB_N * 4, it.id);
  let opaque = 0;
  let minL = 9999;
  let maxL = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i]!;
    const g = rgba[i + 1]!;
    const b = rgba[i + 2]!;
    const blank = r === 0x24 && g === 0x18 && b === 0x0f;
    if (blank) continue;
    opaque++;
    const L = r + g + b;
    if (L < minL) minL = L;
    if (L > maxL) maxL = L;
  }
  assert.ok(opaque >= 120, `${it.id} empty art (${opaque})`);
  assert.ok(maxL - minL >= 60, `${it.id} flat lighting`);
  const hash = pixelHash(rgba);
  assert.equal(hash.length, 64, it.id);
  for (const [other, prev] of hashes) {
    assert.notEqual(hash, prev, `${it.id} shares a bitmap with ${other}`);
  }
  hashes.set(it.id, hash);
  const grid = thumbGrid(it.id);
  assert.equal(grid.length, THUMB_N, it.id);
  assert.ok(grid.every((row) => row.length === THUMB_N * 6), it.id);
  for (const part of it.components) {
    const partHash = hashes.get(part) ?? pixelHash(thumbRgba(part, BG));
    assert.notEqual(hash, partHash, `${it.id} copies ${part}`);
  }
}

assert.equal(new Set(fns).size, fns.length, "no two ids share a painter function");
assert.equal(hashes.size, ids.length, "thumbnail hashes differ");

console.log(`gift thumbs ok · ${ids.length} unique painters`);
