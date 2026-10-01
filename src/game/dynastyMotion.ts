/**
 * The Reality Dynasty on her supplied plate.
 * Walk bobs from the feet and swings one arm. Idle is still.
 * The basic is ranged: the bottle arm cocks, snaps to the flash muzzle, then tucks.
 * The bolt is the existing selfie-flash shot. This file does not fire it.
 * Stun and death draw none of this. The plate lean does not stand in for the arm.
 */

import { SUPPLIED_HERO_FOOT } from "./heroHeight.ts";
import { heroWeapon, weaponDrawParams } from "./heroWeapons.ts";

export const DYNASTY_ID = "wild-dynasty";

export type DynastyAttackPhase = "none" | "windup" | "release" | "recover";

type Pt = { x: number; y: number };

/** Plate-space tip of the flash. Phase 0 is the shot the bolt already leaves from. */
function flashTip(phase: number): Pt {
  const spec = heroWeapon(DYNASTY_ID);
  if (!spec) return { x: 26, y: -22 };
  const draw = weaponDrawParams(spec.motion, phase);
  const cos = Math.cos(draw.angle);
  const sin = Math.sin(draw.angle);
  return {
    x: draw.x + spec.muzzle.x * cos - spec.muzzle.y * sin,
    y: draw.y + spec.muzzle.x * sin + spec.muzzle.y * cos,
  };
}

/** Where the existing bolt leaves the hand, in plate pixels before the field scale. */
export function dynastyReleaseHand(): Pt {
  return flashTip(0);
}

function windupHand(): Pt {
  const shot = dynastyReleaseHand();
  return { x: shot.x - 46, y: shot.y - 16 };
}

function recoverHand(): Pt {
  return flashTip(0.5);
}

export function dynastyAttackPhase(pose: string, frame: number, beaten = false): DynastyAttackPhase {
  if (beaten || pose !== "attack") return "none";
  const local = frame - 4;
  if (local <= 0 || local >= 7) return "none";
  if (local <= 2) return "windup";
  if (local <= 4) return "release";
  return "recover";
}

/** 0 off the attack. Release, at frame 8, is the full snap. */
export function dynastyAttackAmount(pose: string, frame: number, beaten = false): number {
  const phase = dynastyAttackPhase(pose, frame, beaten);
  if (phase === "windup") return 0.55;
  if (phase === "release") return 1;
  if (phase === "recover") return 0.42;
  return 0;
}

export function dynastyAttackHand(pose: string, frame: number, beaten = false): Pt | null {
  const phase = dynastyAttackPhase(pose, frame, beaten);
  if (phase === "windup") return windupHand();
  if (phase === "release") return dynastyReleaseHand();
  if (phase === "recover") return recoverHand();
  return null;
}

/**
 * Hip and arm walk. Non-zero on a walk frame.
 * Idle, death, stun, and the attack pose are 0, so the swing replaces the stride.
 */
export function dynastyMoveGait(pose: string, frame: number, beaten = false): number {
  if (beaten || pose !== "walk") return 0;
  const step = Math.sin((((Math.abs(frame) % 8) + 0.5) * Math.PI) / 4);
  return step;
}

/** Scale and shear around the foot line. Feet stay on SUPPLIED_HERO_FOOT. */
export function applyDynastyBob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pose: string,
  frame: number,
  beaten = false,
): void {
  const gait = dynastyMoveGait(pose, frame, beaten);
  if (gait === 0) return;
  const footY = y + SUPPLIED_HERO_FOOT;
  ctx.translate(x, footY);
  ctx.scale(1, 1 + gait * 0.08);
  ctx.transform(1, 0, gait * 0.12, 1, 0, 0);
  ctx.translate(-x, -footY);
}

function limb(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, width: number, color: string): void {
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
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}

function bottle(ctx: CanvasRenderingContext2D, at: Pt, flash: boolean): void {
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(-0.4);
  ctx.fillStyle = "#1a120c";
  ctx.fillRect(-6, -16, 12, 22);
  ctx.fillStyle = "#ff8ab8";
  ctx.fillRect(-5, -14, 10, 18);
  ctx.fillStyle = "#fff6e4";
  ctx.fillRect(-4, -16, 8, 5);
  if (flash) {
    ctx.fillStyle = "rgba(255, 254, 248, 0.95)";
    ctx.beginPath();
    ctx.arc(8, -8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath();
    ctx.arc(8, -8, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawArm(ctx: CanvasRenderingContext2D, shoulder: Pt, hand: Pt, color: string): void {
  const elbow = {
    x: shoulder.x + (hand.x - shoulder.x) * 0.5,
    y: shoulder.y + (hand.y - shoulder.y) * 0.5 + 8,
  };
  limb(ctx, shoulder, elbow, 8, color);
  limb(ctx, elbow, hand, 7, color);
  ctx.beginPath();
  ctx.arc(hand.x, hand.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#e8b896";
  ctx.fill();
  ctx.strokeStyle = "#1a120c";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/**
 * Overlay on the plate, in the same scaled space as the blit.
 * Walk arm only while the gait is up. The bottle snap replaces it.
 */
export function drawDynastyMotion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flip: number,
  pose: string,
  frame: number,
  beaten = false,
): void {
  if (beaten) return;
  const gait = dynastyMoveGait(pose, frame, false);
  const phase = dynastyAttackPhase(pose, frame, false);
  const hand = dynastyAttackHand(pose, frame, false);
  if (gait === 0 && !hand) return;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(flip, 1);
  if (hand && phase !== "none") {
    const shoulder = { x: 8, y: -50 };
    drawArm(ctx, shoulder, hand, "#ff6fae");
    bottle(ctx, hand, phase === "release");
  } else if (gait !== 0) {
    const shoulder = { x: -12, y: -48 };
    const swing = { x: shoulder.x + gait * 22, y: -24 - Math.abs(gait) * 6 };
    drawArm(ctx, shoulder, swing, "#ff9ec4");
  }
  ctx.restore();
}
