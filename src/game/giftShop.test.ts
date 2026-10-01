import assert from "node:assert/strict";
import {
  BAND_TO_SHOP_ROLE,
  GIFT_ITEMS,
  HERO_BUILDS,
  buildsInto,
  giftById,
  missingComponentIds,
  numbersForTheme,
  purchase,
  quotePurchase,
  recipeCycle,
  searchGift,
  totalCost,
} from "./giftShop.ts";
import { THUMB_N, thumbGrid, thumbPainterIds } from "./giftThumbs.ts";

const ids = GIFT_ITEMS.map((it) => it.id);
assert.equal(new Set(ids).size, ids.length, "ids should be unique");

const painters = new Set(thumbPainterIds());
for (const it of GIFT_ITEMS) {
  assert.ok(it.name, it.id);
  assert.ok(it.cost >= 0, it.id);
  assert.ok(it.category, it.id);
  assert.ok(it.painter, it.id);
  assert.ok(painters.has(it.painter), it.painter);
  const grid = thumbGrid(it.painter);
  assert.equal(grid.length, THUMB_N, it.painter);
}

assert.deepEqual(missingComponentIds(), []);

for (const it of GIFT_ITEMS) {
  for (const c of it.components) assert.ok(buildsInto(c).includes(it.id), `${c} -> ${it.id}`);
  for (const up of buildsInto(it.id)) assert.ok(giftById(up)?.components.includes(it.id), `${it.id} builds ${up}`);
}

assert.equal(recipeCycle(), null);

const byName = searchGift("Track Cleats");
assert.ok(byName.some((it) => it.id === "cleats"));
const byComponent = searchGift("Spare Lace");
assert.ok(byComponent.some((it) => it.id === "cleats"));

const bought = purchase({ gold: 1000, items: [] }, "chalk");
assert.ok(bought);
assert.equal(bought.items.length, 1);
assert.equal(bought.items[0], "chalk");
assert.equal(bought.gold, 1000 - totalCost("chalk"));
assert.equal(purchase(bought, "chalk"), null);

const laced = purchase({ gold: 1000, items: [] }, "lace");
assert.ok(laced);
const cleats = quotePurchase(laced, "cleats");
assert.equal(cleats.ok, true);
assert.equal(cleats.spend, giftById("cleats")?.cost);
assert.deepEqual(cleats.next.items, ["cleats"]);
assert.equal(cleats.next.items.filter((id) => id === "cleats").length, 1);

for (const build of HERO_BUILDS) {
  const rec = [
    ...build.startingItems,
    ...build.earlyItems,
    ...build.coreItems,
    ...build.situationalItems,
    ...build.luxuryItems,
  ];
  for (const id of rec) assert.ok(giftById(id), `${build.hero} ${id}`);
}

const themes = ["NONE", "MAGA_PARODY", "ANTIFA_PARODY"] as const;
const base = numbersForTheme(ids, themes[0]);
for (const theme of themes) {
  assert.deepEqual(numbersForTheme(ids, theme), base);
  assert.deepEqual(numbersForTheme(["crown", "chant"], theme), numbersForTheme(["crown", "chant"], "NONE"));
}

assert.equal(BAND_TO_SHOP_ROLE.marksman, "marksman");
assert.equal(BAND_TO_SHOP_ROLE.tank, "tank");
assert.equal(BAND_TO_SHOP_ROLE.mage, "mage");
assert.equal(BAND_TO_SHOP_ROLE.support, "support");

const grids = GIFT_ITEMS.map((it) => thumbGrid(it.painter).join("|"));
assert.equal(new Set(grids).size, grids.length, "thumbnails should differ");

console.log(`gift shop ok · ${GIFT_ITEMS.length} items · ${HERO_BUILDS.length} builds`);
