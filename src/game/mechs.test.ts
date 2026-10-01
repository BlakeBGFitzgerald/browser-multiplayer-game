import assert from "node:assert/strict";
import { HEROES, HOOLI_ID, isDevAiOnlyHero, isHooliId } from "./heroes.ts";
import { MECHS, mechSignature } from "./mechs.ts";

assert.equal(isDevAiOnlyHero(HOOLI_ID), true);
assert.equal(isDevAiOnlyHero("maga-grumptor"), false);
assert.equal(isHooliId(HOOLI_ID), true);

const seen = new Map<string, string>();
let counted = 0;

for (const hero of HEROES) {
  for (const ability of hero.abilities) {
    if (isHooliId(hero.id)) {
      assert.equal(ability.mech, undefined, `${hero.id} ${ability.key} stays off the mechanic table`);
      continue;
    }
    assert.ok(ability.mech, `${hero.id} ${ability.key} needs a mechanic`);
    const spec = MECHS[ability.mech];
    assert.ok(spec, `missing mechanic ${ability.mech}`);
    const sig = mechSignature(spec!);
    const prior = seen.get(sig);
    assert.equal(prior, undefined, `${ability.mech} repeats ${prior} (${sig})`);
    seen.set(sig, ability.mech);
    counted += 1;
  }
}

assert.equal(counted, seen.size);
assert.ok(counted >= 140, `expected the live roster, saw ${counted}`);
console.log(`mechanics ok · ${counted} unique`);
