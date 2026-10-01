import assert from "node:assert/strict";
import {
  HEROES,
  HOOLI_ID,
  MMA_LIVE_IDS,
  heroById,
} from "./heroes.ts";
import { pixelKit } from "./pixelRoster.ts";
import { runningArmSwing } from "./runArms.ts";
import {
  armLayer,
  attackLimb,
  equippedWeapon,
  existingAttackKind,
  isInfantrySubject,
  isMmaSubject,
  posePriority,
  resolveBasicAttack,
  usesWheelchair,
  weaponAttackPose,
  weaponMotion,
  type AttackSubject,
} from "./attackPose.ts";

const MMA = [
  "mma-macgregor",
  "mma-nurmagoat",
  "mma-jonesy",
  "mma-adesanyaish",
  "mma-poirierish",
  "mma-diazish",
] as const;

const WEAPONS = ["rifle", "pistol", "shotgun", "sword", "bat", "spear", "melee"] as const;

function subject(id: string, attackIndex = 0): AttackSubject {
  const hero = heroById(id);
  return {
    kind: "hero",
    heroId: hero.id,
    wing: hero.wing,
    role: hero.role,
    prop: pixelKit(hero.id).prop,
    melee: hero.melee,
    attackIndex,
  };
}

const live = HEROES.filter((h) => h.wing === "mma").map((h) => h.id).sort();
assert.deepEqual(live, [...MMA].sort());
assert.deepEqual([...MMA_LIVE_IDS].sort(), [...MMA].sort());

for (const id of MMA) {
  const left = resolveBasicAttack(subject(id, 0));
  const right = resolveBasicAttack(subject(id, 1));
  const third = resolveBasicAttack(subject(id, 2));
  const fourth = resolveBasicAttack(subject(id, 3));
  assert.equal(left.kind, "punch", id);
  assert.equal(right.kind, "punch", id);
  assert.equal(third.kind, "punch", id);
  assert.equal(fourth.kind, "punch", id);
  assert.equal(left.side, "left", id);
  assert.equal(right.side, "right", id);
  assert.equal(third.side, "left", id);
  assert.equal(fourth.side, "right", id);
  assert.equal(left.spawnsAmmo, false, id);
  assert.equal(fourth.spawnsAmmo, false, id);
  assert.equal(left.suppressesRun, true, id);
  assert.equal(attackLimb(left)?.fist, "left", id);
  assert.equal(attackLimb(right)?.fist, "right", id);
  assert.equal(attackLimb(left)?.weapon, null, id);
}

for (const hero of HEROES) {
  const sides = [0, 1, 2, 3].map((i) => resolveBasicAttack(subject(hero.id, i)).side);
  if (hero.wing === "mma") {
    assert.deepEqual(sides, ["left", "right", "left", "right"], hero.id);
  } else {
    assert.deepEqual(sides, [null, null, null, null], hero.id);
  }
}

const future = resolveBasicAttack({
  kind: "hero",
  heroId: "future-striker",
  wing: "mma",
  melee: false,
  attackIndex: 2,
});
assert.equal(future.kind, "punch");
assert.equal(future.side, "left");
assert.equal(future.spawnsAmmo, false);
assert.equal(isMmaSubject({ wing: "mma", heroId: "future-striker" }), true);
assert.equal(isMmaSubject({ wing: "wild", heroId: "mma-macgregor" }), false);
assert.equal(resolveBasicAttack(subject("maga-tommy", 0)).side, null);
assert.equal(resolveBasicAttack(subject("maga-tommy", 1)).side, null);

const spoof = resolveBasicAttack({ ...subject("mma-adesanyaish", 1), melee: false, wing: "mma" });
assert.equal(spoof.kind, "punch");
assert.equal(spoof.side, "right");
assert.equal(spoof.spawnsAmmo, false);

const alex = resolveBasicAttack(subject("maga-alexgroans", 2));
assert.equal(alex.kind, existingAttackKind("maga-alexgroans"));
assert.equal(alex.kind, "shout");
assert.equal(alex.side, null);
assert.equal(attackLimb(alex), null);

const tommy = resolveBasicAttack(subject("maga-tommy"));
assert.equal(tommy.kind, existingAttackKind("maga-tommy"));
assert.equal(tommy.side, null);
assert.notEqual(heroById("maga-tommy").wing, "mma");
assert.equal(isInfantrySubject(subject("maga-tommy")), false);

const journalist = resolveBasicAttack(subject("lw-journalist"));
assert.equal(journalist.kind, existingAttackKind("lw-journalist"));
assert.equal(isInfantrySubject(subject("lw-journalist")), false);

const hooli = resolveBasicAttack(subject(HOOLI_ID, 1));
assert.equal(hooli.kind, existingAttackKind(HOOLI_ID));
assert.equal(hooli.side, null);
assert.notEqual(hooli.kind, "punch");

for (const weapon of WEAPONS) {
  assert.equal(weaponAttackPose(weapon), weapon);
  const byTommy = resolveBasicAttack({ kind: "hero", heroId: "maga-tommy", role: "Infantry", weapon, melee: true });
  const byScout = resolveBasicAttack({ kind: "hero", heroId: "lw-journalist", role: "Lane Infantry", weapon, melee: false });
  assert.equal(byTommy.kind, weapon, weapon);
  assert.equal(byScout.kind, weapon, weapon);
  assert.equal(byTommy.spawnsAmmo, false, weapon);
  assert.equal(attackLimb(byTommy)?.weapon, weapon);
  assert.equal(attackLimb(byTommy)?.fist, null);
}
assert.equal(weaponMotion("spear"), "thrust");
assert.equal(weaponMotion("rifle"), "fire");
assert.equal(weaponMotion("pistol"), "fire");
assert.equal(weaponMotion("shotgun"), "fire");
assert.equal(weaponMotion("sword"), "swing");
assert.equal(weaponMotion("bat"), "swing");
assert.equal(weaponMotion("melee"), "swing");

const rifle = resolveBasicAttack({ kind: "hero", heroId: "maga-tommy", role: "Infantry", weapon: "rifle" });
const sword = resolveBasicAttack({ kind: "hero", heroId: "maga-tommy", role: "Infantry", weapon: "sword" });
assert.notEqual(rifle.kind, sword.kind);
assert.equal(rifle.kind, weaponAttackPose("rifle"));
assert.equal(sword.kind, weaponAttackPose("sword"));

const home = resolveBasicAttack({ kind: "minion", job: "infantry", name: "Infantry", team: "home" });
const away = resolveBasicAttack({ kind: "minion", job: "infantry", name: "Infantry", team: "away" });
assert.equal(home.kind, weaponAttackPose(equippedWeapon({ kind: "minion", job: "infantry", team: "home" })));
assert.equal(away.kind, weaponAttackPose(equippedWeapon({ kind: "minion", job: "infantry", team: "away" })));
assert.equal(home.kind, "bat");
assert.equal(away.kind, "melee");
assert.equal(home.spawnsAmmo, false);
assert.equal(away.spawnsAmmo, false);

const archer = resolveBasicAttack({ kind: "minion", job: "archer", caster: true, name: "Archer", weapon: "rifle" });
assert.equal(isInfantrySubject({ kind: "minion", job: "archer", caster: true, name: "Archer" }), false);
assert.notEqual(archer.kind, "rifle");

assert.equal(posePriority({ dead: true, ultimate: true, casting: true, attacking: true, running: true }), "death");
assert.equal(posePriority({ dead: true, ultimate: true, casting: true, attacking: true, running: true, stunned: true }), "death");
assert.equal(posePriority({ dead: false, ultimate: true, casting: true, attacking: true, running: true }), "ult");
assert.equal(posePriority({ dead: false, ultimate: true, casting: false, attacking: true, running: true, stunned: true }), "ult");
assert.equal(posePriority({ dead: false, ultimate: false, casting: false, attacking: true, running: true }), "attack");
assert.equal(posePriority({ dead: false, ultimate: false, casting: false, attacking: true, running: true, stunned: true }), "idle");
assert.equal(posePriority({ dead: false, ultimate: false, casting: false, attacking: false, running: true }), "run");
assert.equal(posePriority({ dead: false, ultimate: false, casting: false, attacking: false, running: true, stunned: true }), "idle");
assert.equal(posePriority({ dead: false, ultimate: false, casting: false, attacking: false, running: false }), "idle");

assert.equal(armLayer({ attacking: true, running: true }), "attack");
assert.equal(armLayer({ attacking: false, running: true }), "run");
assert.notEqual(armLayer({ attacking: true, running: true }), "run");
assert.equal(armLayer({ attacking: true, running: true, wheelchair: true }), "attack");
assert.equal(armLayer({ attacking: false, running: true, wheelchair: true }), "idle");
assert.equal(usesWheelchair("maga-ricky"), true);
assert.equal(usesWheelchair("lw-hocking"), true);
assert.equal(usesWheelchair("mma-macgregor"), false);

const onFoot = pixelKit("maga-vestyt");
assert.equal(runningArmSwing(onFoot, "walk", true).swing, true);
assert.equal(runningArmSwing(onFoot, "attack", true).swing, false);
assert.equal(runningArmSwing(onFoot, "attack", false).swing, false);
const chair = pixelKit("maga-ricky");
assert.equal(runningArmSwing(chair, "walk", true).swing, false);
assert.equal(runningArmSwing(chair, "attack", true).swing, false);

const mac = resolveBasicAttack(subject("mma-macgregor", 0));
const groans = resolveBasicAttack(subject("maga-alexgroans", 0));
assert.notEqual(mac.kind, groans.kind);
assert.notEqual(mac.side, groans.side);
const macAgain = resolveBasicAttack(subject("mma-macgregor", 0));
const groansAgain = resolveBasicAttack(subject("maga-alexgroans", 2));
assert.equal(macAgain.kind, mac.kind);
assert.equal(macAgain.side, mac.side);
assert.equal(groansAgain.kind, groans.kind);
assert.equal(groansAgain.side, null);
assert.equal(resolveBasicAttack(subject("mma-jonesy", 1)).side, "right");
assert.equal(resolveBasicAttack(subject("mma-diazish", 0)).side, "left");
assert.notEqual(resolveBasicAttack(subject("mma-jonesy", 1)).side, resolveBasicAttack(subject("mma-diazish", 0)).side);

console.log("ok attack pose");
