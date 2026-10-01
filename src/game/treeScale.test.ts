import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FOLIAGE_V, TREE_HEIGHT_BUMP, TREE_V, TREE_V_PRIOR, foliageH, foliageY } from "./treeScale.ts";

const read = (name: string) => readFileSync(new URL(name, import.meta.url), "utf8");

const prior = FOLIAGE_V * TREE_V_PRIOR;
assert.equal(prior, 1.75 * 1.2);
assert.equal(TREE_HEIGHT_BUMP, 1.18);
assert.ok(TREE_HEIGHT_BUMP >= 1.1 && TREE_HEIGHT_BUMP <= 1.25);
assert.equal(TREE_V, prior * TREE_HEIGHT_BUMP);
assert.equal(TREE_V / prior, TREE_HEIGHT_BUMP);

const firTrunk = 20;
const oakTrunk = 16;
for (const trunkH of [firTrunk, oakTrunk]) {
  const trunkTop = 100;
  const base = trunkTop + trunkH;
  const top = foliageY(base, trunkTop, TREE_V);
  const height = foliageH(trunkH, TREE_V);
  assert.equal(top + height, base, "trunk stays on the ground contact");
  assert.equal(height, foliageH(trunkH, prior) * TREE_HEIGHT_BUMP);
  assert.ok(top < trunkTop, "crown and trunk grow upward");
}

assert.equal(foliageH(10), 10 * FOLIAGE_V);
assert.notEqual(foliageH(10), 10 * TREE_V);

const pix = read("./worldPix.ts");
const treeFn = pix.slice(pix.indexOf("export function drawPixTree"), pix.indexOf("export function drawPixBush"));
const bushFn = pix.slice(pix.indexOf("export function drawPixBush"), pix.indexOf("const ROCK_HI"));
assert.ok(treeFn.includes("TREE_V"));
assert.equal(treeFn.includes("fir ?") && !/TREE_V\s*\*\s*[0-9]/.test(treeFn), true);
assert.doesNotMatch(treeFn, /FOLIAGE_V/);
assert.match(treeFn, /foliageY\(base, py, TREE_V\)/);
assert.doesNotMatch(bushFn, /TREE_V/);

const quad = read("./quad.ts");
assert.match(quad, /for \(const t of TREES\) drawPixTree\(ctx, t\)/);
assert.match(quad, /drawPixTree\(ctx, \{ x: t\.x, y: t\.y, r: t\.kind === "sapling" \? 14 : 18, fir: t\.fir \}\)/);
assert.match(quad, /for \(const t of FRINGE_TREES\)/);

console.log(`ok trees ${prior} -> ${TREE_V} (${Math.round((TREE_HEIGHT_BUMP - 1) * 100)}% taller)`);
