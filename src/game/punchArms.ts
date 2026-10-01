/**
 * Melee arms on the existing swing clock.
 * A still plate has no bones, so the punch is drawn on top of it.
 * Sheet fighters get the same arm on top of the painted body.
 * Procedural kits use attackArmPulse inside the limb painter.
 * Wing selects an MMA still. A hero id does not.
 */

import { attackSwingPulse } from "./attackLean.ts";
import { kitHoldsSwungBook } from "./bookSwing.ts";
import { LANE_CREEP_FOOT, laneCreepDrawHeight } from "./laneCreep.ts";
import { SUPPLIED_HERO_FOOT } from "./heroHeight.ts";
import { JUNGLE_CREEP_FOOT, JUNGLE_CREEP_HEIGHT, suppliedHasAttackCycle, suppliedHeroUrl } from "./suppliedArt.ts";
import { pixelKit } from "./pixelRoster.ts";
import type { PunchSide } from "./attackPose.ts";

/** Full fist travel in 96-plate pixels. The field scale keeps this readable. */
export const PUNCH_ARM_REACH = 52;

/** Procedural ink canvas. Stays inside the 128 sheet. */
export const INK_PUNCH_REACH = 40;

/** Lane infantry stick is back in the plate's hands after this swing age. */
export const LANE_SWING_END = 0.8;

export type ArmInk = {
  skin: string;
  skinHi: string;
  coat: string;
  coatHi: string;
  accent: string;
  bare: boolean;
};

export type StrikeProp = "fist" | "glove" | "mic" | "book";

export function attackArmPulse(pose: string, frame: number, stunned = false): number {
  if (stunned || pose !== "attack") return 0;
  return attackSwingPulse(pose, frame);
}

/**
 * Punching-side reach. 0 in guard, after the pulse, on a run, and while stunned.
 * The other arm is guardArmExtend.
 */
export function punchingArmExtend(pose: string, frame: number, side: PunchSide | null, stunned = false): number {
  if (stunned || !side) return 0;
  return attackArmPulse(pose, frame, false) * PUNCH_ARM_REACH;
}

/** The hand that is not punching stays in guard. */
export function guardArmExtend(): number {
  return 0;
}

/** Extension for one side. The guard side is 0 while the other arm is out. */
export function sideArmExtend(
  pose: string,
  frame: number,
  arm: PunchSide,
  punching: PunchSide | null,
  stunned = false,
): number {
  if (stunned || !punching || arm !== punching) return 0;
  return punchingArmExtend(pose, frame, punching, false);
}

/** MMA wing plus a still plate. Cycles already move. A later still uses the same rule. */
export function suppliedMmaStill(id: string, wing: string): boolean {
  if (wing !== "mma") return false;
  if (!suppliedHeroUrl(id)) return false;
  if (suppliedHasAttackCycle(id)) return false;
  return true;
}

/**
 * Painted sheet whose basic is melee and whose weapon is not already on its own swing.
 * Plates, cycles, and the red-book pixel swing are not this.
 * `painted` is the sheet rig. This file does not import the sheet table.
 */
export function sheetMeleeStrike(id: string, wing: string, melee: boolean, painted: boolean): boolean {
  if (!melee || !painted) return false;
  if (suppliedMmaStill(id, wing)) return false;
  if (suppliedHeroUrl(id)) return false;
  if (kitHoldsSwungBook(pixelKit(id))) return false;
  return true;
}

export function strikeProp(id: string): StrikeProp {
  const prop = pixelKit(id).prop;
  if (prop === "mic" || prop === "megaphone") return "mic";
  if (prop === "book") return "book";
  if (prop === "glove" || prop === "tape" || prop === "mittens") return "glove";
  return "fist";
}

export function armInk(id: string): ArmInk {
  const kit = pixelKit(id);
  return {
    skin: kit.skin,
    skinHi: kit.skinHi,
    coat: kit.coat,
    coatHi: kit.coatHi,
    accent: kit.accent,
    bare: kit.body === "shorts",
  };
}

export function laneMeleeSwing(swing: number): { active: boolean; extend: number; phase: number } {
  if (!(swing > 0) || swing >= LANE_SWING_END) return { active: false, extend: 0, phase: 0 };
  const phase = swing / LANE_SWING_END;
  const extend = Math.sin(phase * Math.PI);
  return { active: extend > 0.08, extend, phase };
}

type Pt = { x: number; y: number };

function mix(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function limb(
  ctx: CanvasRenderingContext2D,
  a: Pt,
  b: Pt,
  width: number,
  color: string,
  hi: string,
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (width / 2);
  const ny = (dx / len) * (width / 2);
  ctx.beginPath();
  ctx.moveTo(a.x + nx, a.y + ny);
  ctx.lineTo(b.x + nx, b.y + ny);
  ctx.lineTo(b.x - nx, b.y - ny);
  ctx.lineTo(a.x - nx, a.y - ny);
  ctx.closePath();
  ctx.fillStyle = "#1a120c";
  ctx.strokeStyle = "#1a120c";
  ctx.lineWidth = Math.max(2, width * 0.22);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(a.x, a.y, width / 2, 0, Math.PI * 2);
  ctx.arc(b.x, b.y, width / 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
  void hi;
}

function fistBlob(ctx: CanvasRenderingContext2D, at: Pt, radius: number, ink: ArmInk, glove: boolean): void {
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = "#1a120c";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = glove ? "#221810" : ink.skin;
  ctx.fill();
  ctx.fillStyle = glove ? "#efe6d6" : ink.skinHi;
  ctx.fillRect(at.x - radius * 0.55, at.y - radius * 0.35, radius * 1.1, Math.max(3, radius * 0.28));
  if (glove) {
    ctx.fillStyle = ink.accent;
    ctx.fillRect(at.x - radius * 0.2, at.y - radius * 0.15, radius * 0.35, Math.max(3, radius * 0.22));
  }
}

function propAt(ctx: CanvasRenderingContext2D, at: Pt, prop: StrikeProp, pulse: number, ink: ArmInk): void {
  if (prop === "fist" || prop === "glove") return;
  ctx.save();
  ctx.translate(at.x, at.y);
  if (prop === "mic") {
    ctx.rotate(-0.5 + pulse * 0.2);
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(-2.5, -4, 5, 18);
    ctx.beginPath();
    ctx.arc(0, -10, 7, 0, Math.PI * 2);
    ctx.fillStyle = ink.accent;
    ctx.fill();
    ctx.fillStyle = "#fff6e4";
    ctx.fillRect(-2, -13, 3, 4);
  } else {
    ctx.rotate(-1.15 + pulse * 1.7);
    ctx.fillStyle = "#9a1014";
    ctx.fillRect(-7, -20, 16, 22);
    ctx.fillStyle = "#efe6d6";
    ctx.fillRect(-5, -18, 4, 18);
    ctx.fillStyle = ink.accent;
    ctx.fillRect(-7, -6, 16, 3);
  }
  ctx.restore();
}

type ArmLayout = {
  shoulderY: number;
  leftX: number;
  rightX: number;
  reach: number;
  thick: number;
};

function layoutFor(space: "plate" | "sheet", chair: boolean): ArmLayout {
  if (space === "plate") {
    return { shoulderY: -54, leftX: -14, rightX: 10, reach: PUNCH_ARM_REACH, thick: 14 };
  }
  return {
    shoulderY: chair ? -58 : -96,
    leftX: chair ? -18 : -16,
    rightX: chair ? 14 : 14,
    reach: chair ? 46 : 54,
    thick: chair ? 14 : 16,
  };
}

/**
 * Guard arm stays tucked. The punching arm runs shoulder → elbow → fist toward +x
 * (the facing, before the flip). Pulse 0 draws nothing, so the plate shows again.
 */
export function drawAttackArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  footY: number,
  flip: number,
  side: PunchSide | null,
  pulse: number,
  ink: ArmInk,
  prop: StrikeProp,
  space: "plate" | "sheet",
  chair = false,
): void {
  if (!side || !(pulse > 0.08)) return;
  const layout = layoutFor(space, chair);
  const punchSide: "left" | "right" = side === "left" ? "left" : "right";
  ctx.save();
  ctx.translate(Math.round(x), Math.round(footY));
  ctx.scale(flip, 1);
  const sx0 = punchSide === "left" ? layout.leftX : layout.rightX;
  const sy0 = layout.shoulderY;
  const shoulder = { x: sx0, y: sy0 };
  const guardElbow = { x: sx0 + 7, y: sy0 + 11 };
  const guardFist = { x: sx0 + 9, y: sy0 + 1 };
  const fullElbow = { x: sx0 + layout.reach * 0.42, y: sy0 + 12 };
  const fullFist = { x: sx0 + 8 + layout.reach, y: sy0 + (side === "hook" ? -4 : 6) };
  const elbow = mix(guardElbow, fullElbow, pulse);
  const hand = mix(guardFist, fullFist, pulse);
  const sleeve = ink.bare ? "#c47a4a" : ink.coat;
  const sleeveHi = ink.bare ? "#e8b088" : ink.coatHi;
  limb(ctx, shoulder, elbow, layout.thick, sleeve, sleeveHi);
  limb(ctx, elbow, hand, layout.thick * 0.86, sleeve, sleeveHi);
  fistBlob(ctx, hand, layout.thick * 1.2, ink, ink.bare || prop === "glove");
  propAt(ctx, hand, prop, pulse, ink);
  ctx.restore();
}

/** Plate-space punch. Feet sit on the supplied foot line. */
export function drawPlatePunchArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: number,
  side: PunchSide | null,
  pose: string,
  frame: number,
  stunned: boolean,
  id: string,
): void {
  const pulse = attackArmPulse(pose, frame, stunned);
  drawAttackArms(ctx, x, y + SUPPLIED_HERO_FOOT, flip, side, pulse, armInk(id), "glove", "plate", false);
}

/** Sheet melee. The chair stays down. The arms travel above it. */
export function drawSheetStrikeArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: number,
  side: PunchSide | null,
  pose: string,
  frame: number,
  stunned: boolean,
  id: string,
  chair: boolean,
): void {
  const pulse = attackArmPulse(pose, frame, stunned);
  const foot = y + (chair ? 16 : 8);
  drawAttackArms(ctx, x, foot, flip, side, pulse, armInk(id), strikeProp(id), "sheet", chair);
}

function weaponColors(team: "home" | "away"): { shaft: string; head: string; mark: string; sleeve: string } {
  if (team === "home") {
    return { shaft: "#6a3a22", head: "#c4161c", mark: "#fff6e4", sleeve: "#2a2a2a" };
  }
  return { shaft: "#1a1a1a", head: "#101010", mark: "#3ec8c1", sleeve: "#141414" };
}

/**
 * The plate's crowbar stays at rest. This is that swing, large, then gone.
 * Home is the painted bat. Away is the painted club. Unarmed callers pass punch.
 */
export function drawCarriedSwing(
  ctx: CanvasRenderingContext2D,
  x: number,
  footY: number,
  height: number,
  flip: number,
  team: "home" | "away",
  swing: number,
  punch: boolean,
): void {
  const motion = laneMeleeSwing(swing);
  if (!motion.active) return;
  const colors = weaponColors(team);
  const shoulderY = -height * 0.62;
  const reach = height * (punch ? 0.42 : 0.62);
  const wind = { x: -height * 0.08, y: shoulderY - height * 0.22 };
  const strike = { x: reach, y: shoulderY + height * 0.08 };
  const hand = mix(wind, strike, motion.extend);
  const shoulder = { x: height * 0.06, y: shoulderY };
  const elbow = mix(shoulder, hand, 0.55);
  elbow.y += height * 0.06 * (1 - motion.extend);
  ctx.save();
  ctx.translate(Math.round(x), Math.round(footY));
  ctx.scale(flip, 1);
  limb(ctx, shoulder, elbow, Math.max(6, height * 0.09), colors.sleeve, "#4a4a4a");
  limb(ctx, elbow, hand, Math.max(5, height * 0.075), colors.sleeve, "#5a5a5a");
  ctx.beginPath();
  ctx.arc(hand.x, hand.y, Math.max(5, height * 0.07), 0, Math.PI * 2);
  ctx.fillStyle = "#c4a484";
  ctx.fill();
  if (!punch) {
    const ang = Math.atan2(hand.y - shoulder.y, hand.x - shoulder.x);
    const len = reach * (0.55 + motion.extend * 0.7);
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.rotate(ang);
    ctx.fillStyle = colors.shaft;
    ctx.fillRect(0, -3, len, 6);
    ctx.fillStyle = colors.head;
    ctx.fillRect(len - 2, -7, Math.max(10, height * 0.16), 14);
    ctx.fillStyle = colors.mark;
    ctx.fillRect(len, -4, Math.max(6, height * 0.08), 4);
    ctx.restore();
  }
  ctx.restore();
}

export function drawLaneMeleeSwing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: number,
  team: "home" | "away",
  swing: number,
  caster: boolean,
  dead: boolean,
): void {
  if (caster || dead) return;
  drawCarriedSwing(ctx, x, y + LANE_CREEP_FOOT, laneCreepDrawHeight(), flip, team, swing, false);
}

export function drawJungleMeleeSwing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: number,
  swing: number,
  dead: boolean,
): void {
  if (dead) return;
  drawCarriedSwing(ctx, x, y + JUNGLE_CREEP_FOOT, JUNGLE_CREEP_HEIGHT, flip, "home", swing, false);
}
