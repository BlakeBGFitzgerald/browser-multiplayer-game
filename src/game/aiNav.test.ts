import assert from "node:assert/strict";
import { enemyInTeamVision } from "./aiKnowledge.ts";
import {
  AI_ARMOR,
  AI_ROLE_BUILDS,
  aiRoleIds,
  nextAiBuy,
  planPurchase,
  treeCutItemId,
  type AiRole,
} from "./aiShopPlan.ts";
import { giftById, type Purse } from "./giftShop.ts";
import { junglerPath, pickLiveCamp, type CampSpot } from "./junglePlan.ts";
import { linkChain, routeBetween } from "./routeGraph.ts";

const roles: AiRole[] = ["melee", "ranged", "tank", "support", "mma"];

for (const role of roles) {
  const build = AI_ROLE_BUILDS[role];
  assert.ok(build.early.length > 0 && build.mid.length > 0 && build.late.length > 0, role);
  for (const id of aiRoleIds(role)) assert.ok(giftById(id), `${role} ${id}`);
  const armor = giftById(AI_ARMOR[role]);
  assert.ok(armor && (armor.armor ?? 0) > 0, `${role} armor`);
}

const signatures = roles.map((role) => aiRoleIds(role).slice().sort().join(","));
assert.equal(new Set(signatures).size, roles.length, "roles must not share one build");

function settle(role: AiRole): string[] {
  let purse: Purse = { gold: 80000, items: [] };
  for (let n = 0; n < 16; n++) {
    const step = nextAiBuy(purse, role, "late", { preferArmor: false, lowHp: false });
    if (!step) break;
    const planned = planPurchase(purse, step.buyId);
    assert.equal(planned.ok, true, `${role} ${step.buyId}`);
    if (!planned.ok) break;
    purse = planned.next;
  }
  return purse.items.slice().sort();
}

const bags = roles.map((role) => settle(role).join(","));
assert.equal(new Set(bags).size, roles.length, "finished bags differ by role");
for (const bag of bags) assert.ok(bag.length > 0);

const packed: Purse = {
  gold: 500,
  items: ["chalk", "gum", "socks", "lace", "clip", "pencil"],
};
const freed = planPurchase(packed, "metro");
assert.equal(freed.ok, true);
if (freed.ok) {
  assert.ok(freed.sold, "full bag sells a completed component");
  assert.ok(freed.next.items.includes("metro"));
  assert.ok(freed.next.items.length <= 6);
}

assert.equal(enemyInTeamVision({ x: 900, y: 0 }, [{ x: 0, y: 0, r: 100 }]), false);
assert.equal(enemyInTeamVision({ x: 40, y: 30 }, [{ x: 0, y: 0, r: 100 }]), true);
assert.equal(enemyInTeamVision({ x: 40, y: 0 }, []), false);

const lane = routeBetween(linkChain(["base", "lane-mid", "river"]), "base", "river");
assert.deepEqual(lane, ["base", "lane-mid", "river"]);
assert.ok(lane.length > 2, "intermediate lane node stays on the path");
assert.notDeepEqual(lane, ["base", "river"]);

assert.equal(treeCutItemId(), null);

const nearCamp: CampSpot = { id: "camp-mall-oaks", x: 120, y: 40, side: "home", live: true };
const farCamp: CampSpot = { id: "camp-grove", x: 1800, y: 40, side: "home", live: true };
const emptyCamp: CampSpot = { id: "camp-mall-oaks", x: 120, y: 40, side: "home", live: false };
const otherSide: CampSpot = { id: "camp-rainier", x: 90, y: 10, side: "away", live: true };

const nearWoods = pickLiveCamp({
  x: 80,
  y: 20,
  side: "home",
  jungler: true,
  laneEmergency: false,
  camps: [farCamp, otherSide, nearCamp],
});
assert.equal(nearWoods?.id, "camp-mall-oaks", "closer live camp on this side of the woods");

assert.equal(
  pickLiveCamp({
    x: 80,
    y: 20,
    side: "home",
    jungler: true,
    laneEmergency: false,
    camps: [emptyCamp],
  }),
  null,
  "an empty camp is not a destination",
);
assert.equal(
  pickLiveCamp({
    x: 80,
    y: 20,
    side: "home",
    jungler: true,
    laneEmergency: false,
    camps: [emptyCamp, farCamp],
  })?.id,
  "camp-grove",
);

assert.equal(
  pickLiveCamp({
    x: 80,
    y: 20,
    side: "home",
    jungler: false,
    laneEmergency: true,
    nearbyOnly: true,
    camps: [nearCamp],
  }),
  null,
  "a lane emergency keeps the hero out of the woods",
);
assert.equal(
  pickLiveCamp({
    x: 80,
    y: 20,
    side: "home",
    jungler: true,
    laneEmergency: true,
    camps: [nearCamp],
  })?.id,
  "camp-mall-oaks",
  "the jungler still farms when a lane is busy",
);

const woods = junglerPath(
  [...linkChain(["lane-enter", "cut-mall", "camp-near"]), { a: "lane-enter", b: "fountain-enemy" }],
  "lane-enter",
  "camp-near",
);
assert.ok(woods.includes("cut-mall"), "jungler path uses a jungle node");
assert.notDeepEqual(woods, ["lane-enter", "fountain-enemy"]);

console.log("ai nav tests ok");
