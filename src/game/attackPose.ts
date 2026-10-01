import { kitHoldsSwungBook } from "./bookSwing.ts";
import { heroById, isMmaHero } from "./heroes.ts";
import type { AttackLimb } from "./pixelC32.ts";
import { pixelKit, type PixelKit } from "./pixelRoster.ts";

/**
 * Basic-attack pose. MMA punches and infantry weapon strikes are chosen from
 * the unit's own wing, role, job, and equipped weapon. One hero's config
 * never selects another hero's pose.
 */

export type WeaponType = "rifle" | "pistol" | "shotgun" | "sword" | "bat" | "spear" | "melee";

export type AttackKind =
  | "punch"
  | "rifle"
  | "pistol"
  | "shotgun"
  | "sword"
  | "bat"
  | "spear"
  | "melee"
  | "book"
  | "shoot"
  | "swing"
  | "shout";

export type PunchSide = "left" | "right" | "hook";

export type WeaponMotion = "swing" | "thrust" | "fire";

export type AttackSubject = {
  kind?: string;
  heroId?: string;
  wing?: string;
  role?: string;
  job?: string;
  name?: string;
  caster?: boolean;
  wild?: boolean;
  team?: string;
  /** Live equipped weapon. Wins over the authored prop. */
  weapon?: string;
  prop?: string;
  melee?: boolean;
  /** 0 is the first basic attack. */
  attackIndex?: number;
};

export type AttackDecision = {
  kind: AttackKind;
  side: PunchSide | null;
  /** Basic attack should not create a weapon prop or a new projectile. */
  spawnsAmmo: boolean;
  /** Attack replaces the on-foot running-arm pose. */
  suppressesRun: boolean;
};

const WEAPON_TYPES: readonly WeaponType[] = ["rifle", "pistol", "shotgun", "sword", "bat", "spear", "melee"];

const WEAPON_KINDS: ReadonlySet<string> = new Set(WEAPON_TYPES);

/**
 * Authored lane-infantry weapons. MAGA's painted stick is a bat.
 * Antifa's painted stick is a generic melee club. Not a hero id list.
 */
export const LANE_INFANTRY_WEAPON: Record<"home" | "away", WeaponType> = {
  home: "bat",
  away: "melee",
};

export function isWeaponType(value: string | undefined): value is WeaponType {
  return !!value && (WEAPON_TYPES as readonly string[]).includes(value);
}

export function weaponAttackPose(weapon: string): AttackKind {
  switch (weapon) {
    case "rifle":
      return "rifle";
    case "pistol":
      return "pistol";
    case "shotgun":
      return "shotgun";
    case "sword":
      return "sword";
    case "bat":
      return "bat";
    case "spear":
      return "spear";
    default:
      return "melee";
  }
}

export function weaponMotion(kind: string): WeaponMotion {
  if (kind === "spear") return "thrust";
  if (kind === "rifle" || kind === "pistol" || kind === "shotgun") return "fire";
  return "swing";
}

/** Chair body or roll gait. Same rule as the running-arm guard. */
export function usesWheelchair(id: string): boolean {
  const kit = pixelKit(id);
  return kit.body === "chair" || kit.gait === "roll";
}

export function isMmaSubject(subject: AttackSubject): boolean {
  if (subject.wing === "mma") return true;
  if (subject.wing !== undefined) return false;
  if (!subject.heroId) return false;
  if (isMmaHero(subject.heroId)) return true;
  const hero = heroById(subject.heroId);
  return hero.id === subject.heroId && hero.wing === "mma";
}

export function isInfantrySubject(subject: AttackSubject): boolean {
  if (subject.job === "archer" || subject.caster === true || subject.wild === true) return false;
  if (subject.job === "infantry") return true;
  if (typeof subject.role === "string" && /\binfantry\b/i.test(subject.role)) return true;
  if (subject.kind === "minion" && subject.name === "Infantry") return true;
  return false;
}

/**
 * Red hardcover on the tory suit. The equipped prop is the book.
 * A passed prop wins, so another kit's book does not borrow this swing.
 */
export function swingsRedBook(subject: AttackSubject): boolean {
  if (subject.kind === "minion" || isMmaSubject(subject) || isInfantrySubject(subject)) return false;
  const kit = subject.heroId ? pixelKit(subject.heroId) : undefined;
  const prop = subject.prop ?? kit?.prop ?? "";
  const body = kit?.body ?? "";
  return kitHoldsSwungBook({ prop, body });
}

/** Equipped weapon, then authored prop, then the lane infantry stick. */
export function equippedWeapon(subject: AttackSubject): WeaponType {
  if (isWeaponType(subject.weapon)) return subject.weapon;
  if (isWeaponType(subject.prop)) return subject.prop;
  if (subject.team === "away") return LANE_INFANTRY_WEAPON.away;
  if (subject.team === "home" || subject.kind === "minion" || subject.job === "infantry") return LANE_INFANTRY_WEAPON.home;
  return "melee";
}

/** Same prop rules as strikeOf. Non-MMA basics keep this kind. */
export function existingAttackKind(heroId: string): "punch" | "swing" | "shoot" | "shout" {
  return strikeFromKit(pixelKit(heroId));
}

function strikeFromKit(kit: PixelKit): "punch" | "swing" | "shoot" | "shout" {
  if (kitHoldsSwungBook(kit)) return "swing";
  if (kit.prop === "mic" || kit.prop === "megaphone") return "shout";
  if (
    kit.prop === "rocket" ||
    kit.prop === "flask" ||
    kit.prop === "globe" ||
    kit.prop === "staff" ||
    kit.prop === "brush" ||
    kit.prop === "camera" ||
    kit.prop === "file" ||
    kit.prop === "book" ||
    kit.prop === "stud"
  ) {
    return "shoot";
  }
  if (kit.gait === "fight" || kit.body === "shorts" || kit.prop === "glove" || kit.prop === "tape") return "punch";
  return "swing";
}

/**
 * Attack 1 left, 2 right, 3 left, 4 right.
 * Index 0 is the first basic. The swing clock itself does not grow.
 * A hook is still a painter side. The beat does not select it.
 */
export function punchSideForAttack(index: number): PunchSide {
  const n = Math.trunc(Number.isFinite(index) ? index : 0);
  const slot = ((n % 2) + 2) % 2;
  return slot === 0 ? "left" : "right";
}

export function resolveBasicAttack(subject: AttackSubject): AttackDecision {
  if (subject.kind !== "minion" && isMmaSubject(subject)) {
    return {
      kind: "punch",
      side: punchSideForAttack(subject.attackIndex ?? 0),
      spawnsAmmo: false,
      suppressesRun: true,
    };
  }
  if (isInfantrySubject(subject)) {
    return {
      kind: weaponAttackPose(equippedWeapon(subject)),
      side: null,
      spawnsAmmo: false,
      suppressesRun: true,
    };
  }
  if (swingsRedBook(subject)) {
    return {
      kind: "book",
      side: null,
      spawnsAmmo: false,
      suppressesRun: true,
    };
  }
  const kind = subject.heroId ? existingAttackKind(subject.heroId) : "swing";
  return {
    kind,
    side: null,
    spawnsAmmo: subject.melee === false,
    suppressesRun: true,
  };
}

/** Procedural limbs only. A null limb keeps the authored attack drawing. */
export function attackLimb(decision: AttackDecision | null): AttackLimb | null {
  if (!decision) return null;
  if (decision.side) return { fist: decision.side, weapon: null };
  if (decision.kind === "book") return { fist: null, weapon: "book" };
  if (WEAPON_KINDS.has(decision.kind)) return { fist: null, weapon: decision.kind };
  return null;
}

/**
 * Body priority: Death, ultimate, cast, attack, run, idle.
 * Hurt stays on the existing painter clock and is not part of this ladder.
 */
export function posePriority(state: {
  dead: boolean;
  ultimate: boolean;
  casting: boolean;
  attacking: boolean;
  running: boolean;
  stunned?: boolean;
}): "death" | "ult" | "cast" | "attack" | "run" | "idle" {
  if (state.dead) return "death";
  if (state.ultimate) return "ult";
  if (state.casting) return "cast";
  if (state.stunned) return "idle";
  if (state.attacking) return "attack";
  if (state.running) return "run";
  return "idle";
}

/**
 * On-foot running arms. An attack replaces them.
 * A wheelchair never takes that arm swing. Its roll stays on the walk pose.
 */
export function armLayer(state: { attacking: boolean; running: boolean; wheelchair?: boolean }): "attack" | "run" | "idle" {
  if (state.attacking) return "attack";
  if (state.wheelchair) return "idle";
  if (state.running) return "run";
  return "idle";
}
