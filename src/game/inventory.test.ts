import assert from "node:assert/strict";
import { giftById } from "./giftShop.ts";
import {
  MSG_FULL,
  MSG_GOLD,
  SELL_RATIO,
  SLOT_COUNT,
  activate,
  buy,
  emptyCarrier,
  sell,
  sellValueOf,
  stackLabel,
  type Stock,
} from "./inventory.ts";

const boot: Stock = { id: "boot", cost: 100, sellValue: 40 };
const plate: Stock = { id: "plate", cost: 200 };
const tonic: Stock = { id: "tonic", cost: 80, stackable: true, maxStack: 4, active: "haste", activeCd: 12 };
const kit: Stock = { id: "kit", cost: 60, recipe: ["a", "b", "c"] };
const partA: Stock = { id: "a", cost: 20 };
const partB: Stock = { id: "b", cost: 20 };
const partC: Stock = { id: "c", cost: 20 };
const junk: Stock = { id: "junk", cost: 5, sellValue: 2 };

function ids(hero: ReturnType<typeof emptyCarrier>): Array<string | null> {
  return hero.slots.map((slot) => (slot ? `${slot.id}x${slot.count}` : null));
}

const solo = [boot];

{
  const hero = emptyCarrier(500);
  const result = buy(hero, "boot", solo);
  assert.equal(result.ok, true);
  assert.equal(hero.slots[0]?.id, "boot");
  assert.equal(hero.slots[0]?.count, 1);
  assert.equal(hero.slots[1], null);
  assert.equal(hero.gold, 400);
}

{
  const hero = emptyCarrier(10000);
  for (let i = 0; i < SLOT_COUNT; i++) {
    const result = buy(hero, "boot", solo);
    assert.equal(result.ok, true, `slot ${i}`);
  }
  assert.equal(hero.slots.filter((slot) => slot).length, SLOT_COUNT);
  assert.equal(hero.gold, 10000 - boot.cost * SLOT_COUNT);
}

{
  const hero = emptyCarrier(50);
  const before = ids(hero);
  const result = buy(hero, "boot", solo);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "gold");
    assert.equal(result.message, MSG_GOLD);
  }
  assert.equal(hero.gold, 50);
  assert.deepEqual(ids(hero), before);
}

{
  const hero = emptyCarrier(10000);
  for (let i = 0; i < SLOT_COUNT; i++) buy(hero, "boot", solo);
  const gold = hero.gold;
  const before = ids(hero);
  const result = buy(hero, "boot", solo);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "full");
    assert.equal(result.message, MSG_FULL);
  }
  assert.equal(hero.gold, gold);
  assert.deepEqual(ids(hero), before);
}

{
  const catalog: Stock[] = [
    { id: "s0", cost: 100, sellValue: 11 },
    { id: "s1", cost: 100, sellValue: 22 },
    { id: "s2", cost: 100, sellValue: 33 },
    { id: "s3", cost: 100, sellValue: 44 },
    { id: "s4", cost: 100, sellValue: 55 },
    { id: "s5", cost: 100, sellValue: 66 },
  ];
  const hero = emptyCarrier(5000);
  for (const item of catalog) {
    const result = buy(hero, item.id, catalog);
    assert.equal(result.ok, true);
  }
  for (let i = 0; i < SLOT_COUNT; i++) {
    const before = hero.gold;
    const result = sell(hero, i, catalog);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.refund, catalog[i]!.sellValue);
    assert.equal(hero.gold, before + catalog[i]!.sellValue!);
    assert.equal(hero.slots[i], null);
  }
  const again = buy(hero, "s0", catalog);
  assert.equal(again.ok, true);
  assert.equal(hero.slots[0]?.id, "s0");
  assert.equal(hero.slots[0]?.count, 1);
}

{
  const hero = emptyCarrier(500);
  const catalog = [tonic];
  assert.equal(buy(hero, "tonic", catalog).ok, true);
  assert.equal(buy(hero, "tonic", catalog).ok, true);
  assert.equal(hero.slots[0]?.id, "tonic");
  assert.equal(hero.slots[0]?.count, 2);
  assert.equal(stackLabel(hero.slots[0]!.count), "2");
  assert.equal(hero.slots[1], null);
  assert.equal(hero.gold, 500 - tonic.cost * 2);
}

{
  const hero = emptyCarrier(500);
  assert.equal(buy(hero, "boot", solo).ok, true);
  assert.equal(buy(hero, "boot", solo).ok, true);
  assert.equal(hero.slots[0]?.id, "boot");
  assert.equal(hero.slots[0]?.count, 1);
  assert.equal(hero.slots[1]?.id, "boot");
  assert.equal(hero.slots[1]?.count, 1);
}

{
  const hero = emptyCarrier(500);
  const catalog = [tonic];
  buy(hero, "tonic", catalog);
  buy(hero, "tonic", catalog);
  const fired = activate(hero, 0, catalog);
  assert.equal(fired.ok, true);
  assert.equal(hero.buff?.kind, "haste");
  assert.equal(hero.buff?.slot, 0);
  assert.ok((hero.slots[0]?.cd ?? 0) > 0);
  const sold = sell(hero, 0, catalog);
  assert.equal(sold.ok, true);
  if (sold.ok) assert.equal(sold.clearedBuff, true);
  assert.equal(hero.buff, null);
  assert.equal(hero.slots[0]?.count, 1);
  assert.equal(hero.slots[0]?.cd, 0);
}

{
  const a = emptyCarrier(2000);
  const b = emptyCarrier(2000);
  const catalog = [plate];
  assert.equal(buy(a, "plate", catalog).ok, true);
  assert.equal(a.slots[0]?.id, "plate");
  assert.equal(a.gold, 1800);
  assert.equal(b.gold, 2000);
  assert.equal(b.slots.every((slot) => slot === null), true);
  sell(a, 0, catalog);
  assert.equal(b.slots[0], null);
  assert.equal(b.gold, 2000);
}

{
  assert.equal(sellValueOf({ cost: 320 }), Math.floor(320 * SELL_RATIO));
  assert.equal(sellValueOf({ cost: 321, sellValue: 100 }), 100);
  assert.equal(SELL_RATIO, 0.5);
}

{
  const catalog = [partA, partB, partC, kit, junk];
  const hero = emptyCarrier(500);
  for (let i = 0; i < 5; i++) assert.equal(buy(hero, "junk", catalog).ok, true);
  const gold = hero.gold;
  const before = ids(hero);
  const result = buy(hero, "kit", catalog);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "full");
  assert.equal(hero.gold, gold);
  assert.deepEqual(ids(hero), before);

  const open = emptyCarrier(500);
  const placed = buy(open, "kit", catalog);
  assert.equal(placed.ok, true);
  assert.equal(open.gold, 440);
  assert.deepEqual(
    open.slots.slice(0, 3).map((slot) => slot?.id),
    ["a", "b", "c"],
  );
  assert.equal(open.slots[3], null);
}

{
  const flare = giftById("flare");
  const smoke = giftById("smoke");
  assert.ok(flare);
  assert.ok(smoke);
  assert.equal(flare?.stackable, true);
  assert.equal(smoke?.stackable, true);
  assert.ok((flare?.maxStack ?? 0) > 1);
  assert.equal(sellValueOf({ cost: flare!.cost, sellValue: flare!.sellValue }), Math.floor(flare!.cost * SELL_RATIO));
  const banner = giftById("banner");
  assert.equal(banner?.cast, "haste");
  assert.equal(sellValueOf({ cost: banner!.cost, sellValue: banner!.sellValue }), Math.floor(banner!.cost * SELL_RATIO));
  const juice = giftById("juice");
  assert.equal(juice?.cast, "heal");
  assert.equal(juice?.stackable, true);
  assert.ok((juice?.maxStack ?? 0) > 1);
  assert.equal(sellValueOf({ cost: juice?.cost ?? 0, sellValue: juice?.sellValue }), Math.floor((juice?.cost ?? 0) * SELL_RATIO));
}

console.log("inventory tests ok");
