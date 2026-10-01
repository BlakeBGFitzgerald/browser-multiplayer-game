import { HEROES, isPlayable, liveHeroId, RETIRE_MAP, type CastFx } from "./heroes";
import { paintHeroInk, INK_SIZE } from "./heroInk";
import { kitPatch } from "./kits";
import { PIXEL_INK as INK, poseFrameC32, type AttackLimb, type PixelPose } from "./pixelC32";
import { PIXEL_KITS, pixelKit, type PixelKit } from "./pixelRoster";
import { heroDrawScale, heroFootOffset, pixelHeroBlit, SUPPLIED_HERO_FOOT, TRUMP_DRAW_HEIGHT } from "./heroHeight";
import { drawHeroWeapon } from "./heroWeapons";
import { suppliedHeroFrame, suppliedHeroPlate, suppliedHeroUrl } from "./suppliedArt";
import { sheetDef } from "./sheetDefs";

/** C42 pixel bible: 128×128 native, nearest blit. Grump uses the supplied sheet. */
export const PIXEL_SIZE = INK_SIZE;
export const PIXEL_SCALE = 1.12;
export const PIXEL_INK = INK;
export type { PixelPose };

const WHITE = "#fff6e4";
const frameCache = new Map<string, HTMLCanvasElement>();

function keyOf(id: string, pose: PixelPose, frame: number, skinId?: string, limb?: AttackLimb | null): string {
  const tag = limb?.fist ? `:fist:${limb.fist}` : limb?.weapon ? `:wep:${limb.weapon}` : "";
  return `c42:${id}:${skinId || ""}:${pose}:${frame}${tag}`;
}

export function pixelFrame(id: string, pose: PixelPose, frame: number, skinId?: string, limb?: AttackLimb | null): HTMLCanvasElement {
  id = liveHeroId(id);
  const k = keyOf(id, pose, frame, skinId, limb);
  const hit = frameCache.get(k);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = PIXEL_SIZE;
  c.height = PIXEL_SIZE;
  const ctx = c.getContext("2d");
  if (ctx) paintHeroInk(ctx, pixelKit(id), pose, frame, skinId, limb);
  frameCache.set(k, c);
  return c;
}

export function poseFrame(pose: PixelPose, time: number, swing: number): number {
  return poseFrameC32(pose, time, swing);
}

/** Side art and body cards. The weapon uses the same foot anchor as the battlefield overlay. */
function overlayHeldWeapon(
  ctx: CanvasRenderingContext2D,
  id: string,
  centerX: number,
  bottom: number,
  height: number,
  plate: boolean,
): void {
  if (height < 8) return;
  const pixelsPerWorld = height / TRUMP_DRAW_HEIGHT;
  const originX = centerX;
  const originY = plate ? bottom - SUPPLIED_HERO_FOOT * pixelsPerWorld : bottom - 34 * pixelsPerWorld;
  ctx.save();
  ctx.translate(originX, originY);
  ctx.scale(pixelsPerWorld, pixelsPerWorld);
  ctx.translate(-originX, -originY);
  drawHeroWeapon(ctx, id, originX, originY, 1, "idle", 0);
  ctx.restore();
}

export function drawPixelHero(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number,
  y: number,
  pose: PixelPose,
  frame: number,
  flip: number,
  skinId?: string,
  limb?: AttackLimb | null,
): void {
  const live = liveHeroId(id);
  const sheet = pixelFrame(id, pose, frame, skinId, limb);
  const blit = pixelHeroBlit(live);
  const visual = heroDrawScale(live);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(flip, 1);
  if (visual !== 1) {
    const foot = heroFootOffset();
    ctx.translate(0, foot);
    ctx.scale(visual, visual);
    ctx.translate(0, -foot);
  }
  ctx.drawImage(sheet, -blit.w / 2, blit.top, blit.w, blit.h);
  ctx.restore();
}

function paintPixelBezel(ctx: CanvasRenderingContext2D, kit: PixelKit, size: number, gold = false): void {
  const rim = gold ? "#ffe08a" : kit.trim;
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, size, 5);
  ctx.fillRect(0, size - 5, size, 5);
  ctx.fillRect(0, 0, 5, size);
  ctx.fillRect(size - 5, 0, 5, size);
  ctx.fillStyle = kit.accent;
  ctx.fillRect(5, 5, size - 10, 3);
  ctx.fillStyle = kit.vfx;
  ctx.fillRect(5, size - 8, size - 10, 3);
  ctx.fillStyle = PIXEL_INK;
  ctx.fillRect(0, 0, 3, 3);
  ctx.fillRect(size - 3, 0, 3, 3);
  ctx.fillRect(0, size - 3, 3, 3);
  ctx.fillRect(size - 3, size - 3, 3, 3);
}

function washCard(ctx: CanvasRenderingContext2D, kit: PixelKit, size: number): void {
  ctx.imageSmoothingEnabled = false;
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, kit.coatHi);
  g.addColorStop(0.4, kit.coatLo);
  g.addColorStop(1, "#0c0a08");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "rgba(255, 246, 228, 0.08)";
  ctx.beginPath();
  ctx.ellipse(size * 0.3, size * 0.22, size * 0.28, size * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(16, 12, 8, 0.45)";
  ctx.beginPath();
  ctx.ellipse(size * 0.5, size - 22, size * 0.28, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPixelPortrait(ctx: CanvasRenderingContext2D, id: string, size = 256, skinId?: string): void {
  const kit = pixelKit(id);
  washCard(ctx, kit, size);
  ctx.imageSmoothingEnabled = false;
  const sheet = pixelFrame(id, "portrait", 0, skinId);
  const dw = Math.floor(size * 1.12);
  const ox = Math.floor((size - dw) / 2);
  const oy = Math.floor((size - dw) / 2) + 10;
  ctx.drawImage(sheet, ox, oy, dw, dw);
  overlayHeldWeapon(ctx, id, ox + dw / 2, oy + dw, dw, false);
  paintPixelBezel(ctx, kit, size);
}

export function drawPixelSelectCard(ctx: CanvasRenderingContext2D, id: string, size = 256, skinId?: string): void {
  const kit = pixelKit(id);
  washCard(ctx, kit, size);
  ctx.imageSmoothingEnabled = false;
  const sheet = pixelFrame(id, "idle", 2, skinId);
  const margin = 6;
  const dw = size - margin * 2;
  const ox = margin;
  const oy = margin;
  ctx.drawImage(sheet, ox, oy, dw, dw);
  overlayHeldWeapon(ctx, id, ox + dw / 2, oy + dw, dw, false);
  paintPixelBezel(ctx, kit, size);
}

export function pixelVfxColor(id: string): string {
  return pixelKit(id).vfx;
}

export type HeroArtSource = "sheet" | "kit" | "missing";

/** Loaded heroes keep their own id. Retired ids follow the save remap. Unknown ids stay missing. */
export function heroArtKind(rawId: string): { id: string; source: HeroArtSource } {
  const id = isPlayable(rawId) ? rawId : RETIRE_MAP[rawId];
  if (!id) return { id: rawId, source: "missing" };
  if (sheetDef(id)) return { id, source: "sheet" };
  if (PIXEL_KITS[id]) return { id, source: "kit" };
  return { id: rawId, source: "missing" };
}

/** Playable heroes with no sheet and no pixel kit. */
export function missingLoadedArt(): string[] {
  return HEROES.filter((h) => heroArtKind(h.id).source === "missing").map((h) => h.id);
}

/**
 * Left-panel artwork. The hero id selects the live C42 sheet or pixel kit.
 * Idle frames breathe. The sheet faces the right, toward center court.
 * A hero with no art stays an empty frame instead of borrowing another kit.
 */
export function drawHeroSide(ctx: CanvasRenderingContext2D, id: string, time: number, skinId?: string): void {
  const kind = heroArtKind(id);
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, "#24180f");
  wash.addColorStop(0.55, "#120e0b");
  wash.addColorStop(1, "#070604");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  const supplied = suppliedHeroUrl(kind.id);
  if (supplied) {
    const img = suppliedHeroFrame(kind.id, "idle", poseFrame("idle", time, 0)) ?? suppliedHeroPlate(kind.id);
    if (img && img.complete && img.naturalWidth > 0) {
      const maxW = w - 12;
      const maxH = h - 14;
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
      const dw = Math.round(img.naturalWidth * scale);
      const dh = Math.round(img.naturalHeight * scale);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, Math.round((w - dw) / 2), Math.round(h - dh - 8), dw, dh);
      overlayHeldWeapon(ctx, kind.id, Math.round((w - dw) / 2 + dw / 2), h - 8, dh, true);
      return;
    }
  }
  if (kind.source === "missing") {
    ctx.strokeStyle = "#f0c14a";
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "#efe6d6";
    ctx.font = "700 11px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("NO ART", w / 2, h / 2 - 6);
    ctx.fillStyle = "#f0c14a";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText(kind.id.slice(0, 16), w / 2, h / 2 + 12);
    return;
  }
  const kit = pixelKit(kind.id);
  ctx.fillStyle = kit.trim;
  ctx.globalAlpha = 0.18;
  ctx.fillRect(0, h - 18, w, 18);
  ctx.globalAlpha = 1;
  const frame = poseFrame("idle", time, 0);
  const sheet = pixelFrame(kind.id, "idle", frame, skinId);
  const maxW = w - 12;
  const maxH = h - 14;
  const scale = Math.min(maxW / sheet.width, maxH / sheet.height);
  const dw = Math.round(sheet.width * scale);
  const dh = Math.round(sheet.height * scale);
  const ox = Math.round((w - dw) / 2);
  const oy = Math.round(h - dh - 10);
  ctx.drawImage(sheet, ox, oy, dw, dh);
  overlayHeldWeapon(ctx, kind.id, ox + dw / 2, oy + dh, dh, false);
}

function fxHue(fx: CastFx): string {
  if (fx === "cone") return "#e07a3d";
  if (fx === "dash" || fx === "dashnova") return "#7ec8ff";
  if (fx === "aspd") return "#f0c14a";
  if (fx === "nova") return "#ff6b3a";
  if (fx === "bolt") return "#8ab4f8";
  if (fx === "slow") return "#80cbc4";
  if (fx === "stun") return "#ce93d8";
  if (fx === "shield") return "#cfd8dc";
  if (fx === "taunt") return "#ff6fae";
  if (fx === "heal") return "#5ad45a";
  return "#69f0ae";
}

function paintFxGlyph(ctx: CanvasRenderingContext2D, fx: CastFx, cx: number, cy: number, color: string, scale = 1): void {
  const s = (n: number) => n * scale;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (fx === "cone") {
    ctx.beginPath();
    ctx.moveTo(cx - s(2), cy + s(8));
    ctx.lineTo(cx + s(14), cy - s(10));
    ctx.lineTo(cx + s(14), cy + s(10));
    ctx.closePath();
    ctx.fill();
  } else if (fx === "dash" || fx === "dashnova") {
    ctx.lineWidth = s(3);
    ctx.beginPath();
    ctx.moveTo(cx - s(12), cy);
    ctx.lineTo(cx + s(10), cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s(4), cy - s(6));
    ctx.lineTo(cx + s(14), cy);
    ctx.lineTo(cx + s(4), cy + s(6));
    ctx.fill();
  } else if (fx === "nova" || fx === "rain") {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * s(10), cy + Math.sin(a) * s(8), s(2.2), s(2.2), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(cx, cy, s(3.5), s(3.5), 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (fx === "bolt") {
    ctx.beginPath();
    ctx.moveTo(cx - s(12), cy);
    ctx.lineTo(cx + s(6), cy - s(3));
    ctx.lineTo(cx + s(4), cy);
    ctx.lineTo(cx + s(14), cy);
    ctx.lineTo(cx + s(2), cy + s(4));
    ctx.lineTo(cx + s(4), cy + s(1));
    ctx.closePath();
    ctx.fill();
  } else if (fx === "slow") {
    ctx.lineWidth = s(2.5);
    ctx.beginPath();
    ctx.arc(cx, cy, s(8), 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (fx === "stun") {
    ctx.font = `700 ${s(18)}px Anton, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("!", cx, cy + s(6));
  } else if (fx === "shield") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s(10));
    ctx.lineTo(cx + s(9), cy - s(4));
    ctx.lineTo(cx + s(7), cy + s(8));
    ctx.lineTo(cx, cy + s(12));
    ctx.lineTo(cx - s(7), cy + s(8));
    ctx.lineTo(cx - s(9), cy - s(4));
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.35;
    ctx.fill();
  } else if (fx === "heal") {
    ctx.fillRect(cx - s(2.5), cy - s(10), s(5), s(20));
    ctx.fillRect(cx - s(10), cy - s(2.5), s(20), s(5));
  } else if (fx === "taunt") {
    ctx.beginPath();
    ctx.ellipse(cx, cy, s(9), s(6), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(cx - s(3), cy, s(1.6), s(1.6), 0, 0, Math.PI * 2);
    ctx.ellipse(cx + s(3), cy, s(1.6), s(1.6), 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (fx === "aspd") {
    ctx.lineWidth = s(3);
    ctx.beginPath();
    ctx.moveTo(cx - s(2), cy - s(10));
    ctx.lineTo(cx + s(4), cy);
    ctx.lineTo(cx - s(2), cy);
    ctx.lineTo(cx + s(4), cy + s(10));
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(cx, cy, s(7), s(7), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintPropMotif(ctx: CanvasRenderingContext2D, kit: PixelKit, x: number, y: number): void {
  ctx.fillStyle = kit.trim;
  if (kit.prop === "rocket") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(x, y, 5, 10);
    ctx.fillStyle = "#ff7043";
    ctx.fillRect(x + 1, y + 10, 3, 3);
  } else if (kit.prop === "mic") {
    ctx.fillStyle = PIXEL_INK;
    ctx.fillRect(x + 2, y + 4, 2, 8);
    ctx.fillStyle = kit.accent;
    ctx.fillRect(x, y, 6, 5);
  } else if (kit.prop === "megaphone") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(x, y + 3, 3, 6);
    ctx.fillRect(x + 3, y, 6, 12);
  } else if (kit.prop === "book") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(x, y, 8, 10);
    ctx.fillStyle = PIXEL_INK;
    ctx.fillRect(x + 1, y + 2, 6, 1);
  } else if (kit.prop === "flask") {
    ctx.fillStyle = "#7ec8ff";
    ctx.fillRect(x, y + 2, 6, 8);
    ctx.fillStyle = PIXEL_INK;
    ctx.fillRect(x + 2, y, 2, 3);
  } else if (kit.prop === "globe") {
    ctx.fillStyle = "#3d6ea6";
    ctx.fillRect(x, y, 8, 8);
    ctx.fillStyle = "#5ad45a";
    ctx.fillRect(x + 2, y + 2, 3, 3);
  } else if (kit.prop === "halo") {
    ctx.fillStyle = kit.trim;
    ctx.fillRect(x, y + 2, 10, 2);
  } else if (kit.prop === "glove" || kit.prop === "tape") {
    ctx.fillStyle = kit.accent;
    ctx.fillRect(x, y, 8, 8);
    ctx.fillStyle = WHITE;
    ctx.fillRect(x + 2, y + 2, 3, 3);
  } else if (kit.prop === "camera") {
    ctx.fillStyle = PIXEL_INK;
    ctx.fillRect(x, y, 10, 7);
    ctx.fillStyle = WHITE;
    ctx.fillRect(x + 6, y + 2, 3, 3);
  } else if (kit.prop === "stud") {
    ctx.fillStyle = "#c8c4bc";
    ctx.fillRect(x, y + 3, 10, 3);
    ctx.fillStyle = kit.vfx;
    ctx.fillRect(x + 8, y + 2, 4, 5);
  } else {
    ctx.fillRect(x, y, 6, 6);
    ctx.fillStyle = kit.vfx;
    ctx.fillRect(x + 2, y + 2, 2, 2);
  }
}

export function drawPixelAbilityIcon(
  ctx: CanvasRenderingContext2D,
  id: string,
  key: "Q" | "W" | "E" | "R" | "P",
  size = 64,
): void {
  const kit = pixelKit(id);
  const hero = HEROES.find((h) => h.id === id);
  const ab = hero?.abilities.find((a) => a.key === key);
  const fx: CastFx = ab?.fx ?? (key === "P" ? "shield" : "bolt");
  const ult = key === "R";
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = PIXEL_INK;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = kit.coatLo;
  ctx.fillRect(3, 3, size - 6, size - 6);
  ctx.fillStyle = kit.coat;
  ctx.fillRect(3, 3, size - 6, 10);
  ctx.fillStyle = ult ? "#ffe08a" : key === "P" ? "#efe6d6" : kit.trim;
  ctx.fillRect(0, 0, size, 3);
  ctx.fillRect(0, size - 3, size, 3);
  ctx.fillRect(0, 0, 3, size);
  ctx.fillRect(size - 3, 0, 3, size);
  ctx.fillStyle = kit.accent;
  ctx.fillRect(3, 3, size - 6, 2);
  if (ult) {
    ctx.fillStyle = kit.vfx;
    ctx.fillRect(4, size - 6, size - 8, 2);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.fillRect(Math.round(size / 2 + Math.cos(a) * 18) - 1, Math.round(size / 2 + Math.sin(a) * 16) - 1, 2, 2);
    }
  }
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  const hue = key === "P" ? kit.trim : fxHue(fx);
  const bust = pixelFrame(id, key === "R" ? "ult" : key === "P" ? "idle" : "cast", key === "R" ? 5 : 3);
  ctx.globalAlpha = 0.28;
  ctx.drawImage(bust, size * 0.18, size * 0.08, size * 0.7, size * 0.7);
  ctx.globalAlpha = 1;
  paintFxGlyph(ctx, fx, Math.floor(size / 2), Math.floor(size / 2) + 2, hue, size / 48);
  paintPropMotif(ctx, kit, 6, size - 16);
  ctx.fillStyle = WHITE;
  ctx.font = `700 ${Math.max(8, Math.floor(size * 0.22))}px 'IBM Plex Mono', monospace`;
  ctx.textAlign = "right";
  ctx.fillText(key, size - 5, size - 6);
}

export type PromoKind = "spotlight" | "ultimate" | "dlc" | "millix";

export function drawPixelPromo(
  ctx: CanvasRenderingContext2D,
  id: string,
  kind: PromoKind,
  w = 512,
  h = 288,
  skinId?: string,
): void {
  const kit = pixelKit(id);
  const hero = HEROES.find((k) => k.id === id);
  const ult = hero?.abilities.find((a) => a.key === "R");
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = PIXEL_INK;
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, kit.coat);
  g.addColorStop(0.45, kit.coatLo);
  g.addColorStop(1, "#0c0a08");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = kit.accent;
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 18; i++) ctx.fillRect(i * 22, 0, 8, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = kit.vfx;
  const pose: PixelPose = kind === "ultimate" ? "ult" : kind === "spotlight" ? "attack" : "victory";
  const frame = kind === "ultimate" ? 5 : kind === "spotlight" ? 3 : 2;
  const sheet = pixelFrame(id, pose, frame, skinId);
  const zoom = kind === "dlc" ? 1.7 : 2.05;
  const dw = PIXEL_SIZE * zoom;
  const ox = kind === "millix" ? 18 : 28;
  const oy = h - dw + 10;
  paintPromoVfx(ctx, kit, kind, w, h);
  ctx.drawImage(sheet, ox, oy, dw, dw);
  ctx.fillStyle = PIXEL_INK;
  ctx.fillRect(0, 0, w, 8);
  ctx.fillRect(0, h - 8, w, 8);
  ctx.fillStyle = kit.trim;
  ctx.fillRect(0, 0, w, 4);
  ctx.fillRect(0, h - 4, w, 4);
  ctx.fillStyle = WHITE;
  ctx.font = "700 28px Anton, Impact, sans-serif";
  ctx.textAlign = "left";
  const name = hero?.name ?? id;
  ctx.fillText(name, kind === "millix" ? 268 : 248, 56);
  ctx.fillStyle = kit.trim;
  ctx.font = "700 13px 'IBM Plex Mono', monospace";
  const wing =
    hero?.wing === "maga"
      ? "LIBERTY / TRADITION"
      : hero?.wing === "antifa"
        ? "PROGRESS / EQUALITY"
        : hero?.wing === "mma"
          ? "MMA DLC"
          : hero?.dlc
            ? "WILDCARD DLC"
            : "CAMPUS";
  ctx.fillText(`${wing} · ${hero?.role ?? "KIT"}`.toUpperCase(), kind === "millix" ? 268 : 248, 80);
  if (kind === "spotlight") {
    ctx.fillStyle = kit.vfx;
    ctx.font = "700 16px Anton, sans-serif";
    ctx.fillText((hero?.title ?? "Signature pose").toUpperCase(), 248, h - 36);
  } else if (kind === "ultimate") {
    ctx.fillStyle = "#ffe08a";
    ctx.font = "700 22px Anton, sans-serif";
    ctx.fillText((ult?.name ?? "ULTIMATE").toUpperCase(), 248, h - 48);
    ctx.fillStyle = WHITE;
    ctx.font = "600 12px 'IBM Plex Mono', monospace";
    ctx.fillText(ult?.blurb ?? "Ultimate", 248, h - 24);
  } else if (kind === "dlc") {
    ctx.fillStyle = "#ffe08a";
    ctx.font = "700 18px Anton, sans-serif";
    ctx.fillText(hero?.dlc || hero?.wing === "mma" ? "DLC · LOCKED UNTIL OWNED" : "PLAYABLE KIT", 248, h - 36);
  } else if (kind === "millix") {
    ctx.fillStyle = "#69f0ae";
    ctx.font = "700 26px Anton, sans-serif";
    ctx.fillText("MILLIX · 40% OFF", 268, 128);
    ctx.fillStyle = WHITE;
    ctx.font = "700 14px 'IBM Plex Mono', monospace";
    ctx.fillText("BUY WITH MILLIX", 268, 156);
    ctx.fillStyle = kit.accent;
    ctx.fillRect(268, 172, 168, 32);
    ctx.fillStyle = WHITE;
    ctx.font = "700 16px Anton, sans-serif";
    ctx.fillText("PURCHASE DLC", 284, 194);
  }
}

function paintPromoVfx(ctx: CanvasRenderingContext2D, kit: PixelKit, kind: PromoKind, _w: number, h: number): void {
  ctx.save();
  ctx.fillStyle = kit.vfx;
  const n = kind === "ultimate" ? 48 : 28;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rx = kind === "ultimate" ? 110 : 80;
    ctx.fillRect(Math.round(150 + Math.cos(a) * rx), Math.round(h * 0.55 + Math.sin(a) * 44), 3, 3);
  }
  ctx.fillStyle = WHITE;
  for (let i = 0; i < 14; i++) {
    ctx.fillRect(96 + i * 16, 48 + (i % 3) * 10, 2, 2);
  }
  if (kind === "ultimate") {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = kit.accent;
    ctx.beginPath();
    ctx.ellipse(156, h * 0.62, 110, 44, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPixelImpact(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  n: number,
  heroId?: string,
  look?: string,
): void {
  const kit = heroId ? pixelKit(heroId) : undefined;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  const shape = kit?.prop ?? "none";
  for (let i = 0; i < n; i++) {
    const a = i * 1.55;
    const rad = shape === "halo" || shape === "globe" ? 12 + i * 2 : 9 + i * 3;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * (6 + i) - 10;
    const s = shape === "glove" || shape === "tape" ? 4.4 : 3.4;
    ctx.beginPath();
    ctx.ellipse(px, py, s, s * 0.8, a, 0, Math.PI * 2);
    ctx.fill();
    if (i % 2 === 0) {
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.ellipse(px + 1, py - 1, 1.6, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
    }
    if (i % 3 === 0) {
      ctx.fillStyle = kit?.trim ?? WHITE;
      ctx.beginPath();
      ctx.ellipse(px - 2, py + 2, 1.8, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
    }
  }
  if (shape === "rocket") {
    ctx.fillStyle = "#ff7043";
    ctx.fillRect(Math.round(x + 8), Math.round(y + 2), 4, 4);
    ctx.fillStyle = "#ffcc80";
    ctx.fillRect(Math.round(x + 11), Math.round(y + 5), 3, 3);
    ctx.fillStyle = WHITE;
    ctx.fillRect(Math.round(x + 6), Math.round(y), 2, 2);
  } else if (shape === "megaphone") {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(x + 5 + i * 4), Math.round(y - 3 - i), 4, 3);
  } else if (shape === "brush") {
    ctx.fillStyle = "#3d6ea6";
    ctx.fillRect(Math.round(x + 4), Math.round(y - 5), 4, 4);
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(Math.round(x + 9), Math.round(y), 4, 4);
  } else if (shape === "camera") {
    ctx.fillStyle = WHITE;
    ctx.fillRect(Math.round(x - 3), Math.round(y - 8), 8, 8);
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y - 6), 3, 3);
  } else if (shape === "mic") {
    ctx.fillStyle = PIXEL_INK;
    ctx.fillRect(Math.round(x + 4), Math.round(y - 2), 3, 10);
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x + 2), Math.round(y - 8), 7, 6);
  } else if (shape === "book" || shape === "file") {
    ctx.fillStyle = WHITE;
    ctx.fillRect(Math.round(x - 4), Math.round(y - 6), 12, 10);
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x - 2), Math.round(y - 4), 8, 2);
  } else if (shape === "flask") {
    ctx.fillStyle = "#7ec8ff";
    ctx.fillRect(Math.round(x - 2), Math.round(y - 4), 8, 10);
    ctx.fillStyle = WHITE;
    ctx.fillRect(Math.round(x), Math.round(y - 2), 3, 3);
  } else if (shape === "globe") {
    ctx.fillStyle = "#3d6ea6";
    ctx.fillRect(Math.round(x - 4), Math.round(y - 6), 10, 10);
    ctx.fillStyle = "#5ad45a";
    ctx.fillRect(Math.round(x - 1), Math.round(y - 3), 4, 4);
  } else if (shape === "halo") {
    ctx.fillStyle = kit?.trim ?? "#ffe08a";
    ctx.fillRect(Math.round(x - 10), Math.round(y - 16), 20, 3);
  }
  if (look) paintLookImpact(ctx, x, y, color, look);
  ctx.restore();
}

function paintLookImpact(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, look: string): void {
  const px = (n: number) => Math.round(n);
  ctx.fillStyle = color;
  if (look === "hammer" || look === "gauntlet") {
    ctx.fillRect(px(x - 6), px(y - 4), 16, 6);
    ctx.fillRect(px(x + 6), px(y - 8), 4, 14);
  } else if (look === "claws") {
    for (let i = 0; i < 3; i++) ctx.fillRect(px(x + 2), px(y - 8 + i * 5), 12, 2);
  } else if (look === "shield") {
    ctx.fillRect(px(x - 8), px(y - 10), 10, 16);
    ctx.fillStyle = "#fff6e4";
    ctx.fillRect(px(x - 5), px(y - 6), 4, 6);
  } else if (look === "bolt") {
    ctx.fillRect(px(x - 16), px(y), 22, 3);
    ctx.fillStyle = "#fff6e4";
    ctx.fillRect(px(x - 16), px(y), 6, 2);
  } else if (look === "lasso") {
    ctx.fillRect(px(x - 8), px(y - 8), 3, 3);
    ctx.fillRect(px(x + 4), px(y - 2), 3, 3);
    ctx.fillRect(px(x - 2), px(y + 6), 3, 3);
    ctx.fillRect(px(x + 8), px(y + 2), 3, 3);
  } else if (look === "web") {
    ctx.fillRect(px(x - 10), px(y), 20, 1);
    ctx.fillRect(px(x), px(y - 10), 1, 20);
  } else if (look === "lantern" || look === "halo") {
    ctx.fillRect(px(x - 8), px(y - 14), 16, 3);
    ctx.fillStyle = "#fff6e4";
    ctx.fillRect(px(x - 2), px(y - 16), 4, 3);
  } else if (look === "gloves" || look === "tape" || look === "shorts") {
    ctx.fillRect(px(x + 4), px(y - 4), 8, 6);
    ctx.fillStyle = "#fff6e4";
    ctx.fillRect(px(x + 6), px(y - 2), 3, 2);
  }
}

export function drawPixelAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: "shield" | "stun" | "slow",
  time: number,
  color: string,
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  if (kind === "shield") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(x, y, 38, 44, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = color;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + time * 2;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 38, y + Math.sin(a) * 44, 2.4, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = WHITE;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + time * 2.4;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 28, y + Math.sin(a) * 30, 1.8, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "stun") {
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath();
    ctx.ellipse(x - 12, y - 86 + Math.sin(time * 10) * 3, 3.2, 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 10, y - 78 + Math.cos(time * 10) * 3, 3.2, 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(x, y - 94 + Math.sin(time * 8) * 3, 2.6, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.ellipse(x - 2, y - 80, 2.4, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = color;
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.ellipse(x - 18 + i * 5, y + 18 + ((i + Math.floor(time * 6)) % 2), 2.6, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawPixelTrail(ctx: CanvasRenderingContext2D, x: number, y: number, flip: number, color: string): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  for (let i = 1; i <= 10; i++) {
    ctx.globalAlpha = 0.58 - i * 0.05;
    ctx.beginPath();
    ctx.ellipse(x - flip * i * 8, y - 8 + (i % 2), 4, 8 - i * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = WHITE;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(x - flip * 8, y - 8, 2.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPixelCastRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  life: number,
  color: string,
  kind: "nova" | "cone" | "slow" | "heal" | "ult" | "dash",
  heroId?: string,
): void {
  const a = Math.max(0, Math.min(1, life));
  const rx = Math.round(r * (1.08 - a * 0.14));
  const ry = Math.round(r * 0.44 * (1.08 - a * 0.14));
  const kit = heroId ? pixelKit(heroId) : undefined;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = kind === "ult" ? 12 : 7;
  ctx.globalAlpha = 0.5 + a * 0.38;
  ctx.lineWidth = kind === "ult" ? 4 : 3;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = color;
  const n = kind === "ult" ? 28 : 18;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const s = kind === "ult" ? 3.2 : 2.4;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(t) * rx, y + Math.sin(t) * ry, s, s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (kind === "heal") {
    ctx.globalAlpha = 0.36 * a;
    ctx.fillStyle = "#80cbc4";
    for (let i = 0; i < 14; i++) ctx.fillRect(Math.round(x - 3 + (i % 6) * 4), Math.round(y - 16 - i * 3), 3, 4);
  } else if (kind === "slow") {
    ctx.globalAlpha = 0.46;
    for (let i = 0; i < 16; i++) {
      if (i % 2 === 0) continue;
      const t = (i / 16) * Math.PI * 2;
      ctx.fillRect(Math.round(x + Math.cos(t) * rx * 0.8) - 1, Math.round(y + Math.sin(t) * ry * 0.8) - 1, 3, 3);
    }
  } else if (kind === "dash") {
    ctx.globalAlpha = 0.55 * a;
    for (let i = 0; i < 9; i++) ctx.fillRect(Math.round(x - rx + i * 10), Math.round(y - 2), 5, 3);
  } else if (kind === "cone") {
    ctx.globalAlpha = 0.48 * a;
    for (let i = 0; i < 8; i++) ctx.fillRect(Math.round(x + 10 + i * 7), Math.round(y - 8 + i), 4, 4);
  } else if (kind === "ult") {
    ctx.globalAlpha = 0.26 * a;
    ctx.fillRect(Math.round(x - rx * 0.42), Math.round(y - ry * 0.42), Math.round(rx * 0.84), Math.round(ry * 0.84));
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.45 * a;
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * Math.PI * 2 + a * 4;
      ctx.fillRect(Math.round(x + Math.cos(t) * rx * 0.48), Math.round(y + Math.sin(t) * ry * 0.48), 3, 3);
    }
    if (kit) {
      ctx.fillStyle = kit.trim;
      ctx.globalAlpha = 0.55 * a;
      for (let i = 0; i < 8; i++) {
        const t = (i / 8) * Math.PI * 2 + a * 3;
        ctx.fillRect(Math.round(x + Math.cos(t) * rx * 0.3), Math.round(y + Math.sin(t) * ry * 0.3), 4, 4);
      }
      ctx.fillStyle = kit.vfx;
      ctx.globalAlpha = 0.4 * a;
      for (let i = 0; i < 6; i++) {
        const t = (i / 6) * Math.PI * 2 + a * 5;
        ctx.fillRect(Math.round(x + Math.cos(t) * rx * 0.7), Math.round(y + Math.sin(t) * ry * 0.7), 2, 2);
      }
    }
  } else if (kind === "nova") {
    ctx.globalAlpha = 0.26 * a;
    ctx.fillStyle = WHITE;
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * Math.PI * 2;
      ctx.fillRect(Math.round(x + Math.cos(t) * rx * 0.55), Math.round(y + Math.sin(t) * ry * 0.55), 3, 3);
    }
  }
  ctx.restore();
}

export function drawPixelBolt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tx: number,
  ty: number,
  color: string,
  heroId?: string,
): void {
  const ang = Math.atan2(ty - y, tx - x);
  const prop = heroId ? pixelKit(heroId).prop : "none";
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.lineCap = "round";
  if (prop === "rocket") {
    ctx.beginPath();
    ctx.roundRect(-28, -4, 40, 8, 3);
    ctx.fill();
    ctx.fillStyle = "#ff7043";
    ctx.beginPath();
    ctx.roundRect(-34, -5, 8, 10, 3);
    ctx.fill();
    ctx.fillStyle = "#ffcc80";
    ctx.beginPath();
    ctx.ellipse(-36, 0, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.fillRect(12, -2, 6, 4);
  } else if (prop === "megaphone") {
    for (let i = 0; i < 6; i++) ctx.fillRect(i * 6, -4 - i, 6, 8 + i * 2);
    ctx.fillStyle = WHITE;
    ctx.fillRect(30, -8, 5, 16);
  } else if (prop === "book") {
    ctx.fillRect(-18, -6, 32, 12);
    ctx.fillStyle = WHITE;
    ctx.fillRect(-14, -4, 24, 8);
    ctx.fillStyle = color;
    ctx.fillRect(14, -7, 7, 14);
  } else if (prop === "flask") {
    ctx.fillRect(-10, -7, 12, 14);
    ctx.fillStyle = WHITE;
    ctx.fillRect(-7, -5, 5, 5);
    ctx.fillStyle = color;
    ctx.fillRect(4, -4, 10, 8);
  } else if (prop === "globe") {
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = "#3d6ea6";
    ctx.fillRect(-6, -6, 12, 12);
    ctx.fillStyle = "#5ad45a";
    ctx.fillRect(-2, -3, 5, 5);
  } else if (prop === "camera") {
    ctx.fillRect(-12, -6, 22, 12);
    ctx.fillStyle = WHITE;
    ctx.fillRect(8, -4, 8, 8);
  } else if (prop === "brush") {
    ctx.fillRect(-20, -3, 28, 6);
    ctx.fillStyle = "#3d6ea6";
    ctx.fillRect(10, -6, 8, 12);
    ctx.fillStyle = "#c4161c";
    ctx.fillRect(16, -4, 5, 8);
  } else if (prop === "file") {
    ctx.fillRect(-14, -7, 24, 14);
    ctx.fillStyle = PIXEL_INK;
    ctx.fillRect(-10, -4, 16, 2);
    ctx.fillRect(-10, 1, 16, 2);
  } else if (prop === "mic") {
    ctx.fillRect(-22, -3, 26, 6);
    ctx.fillRect(6, -6, 12, 12);
    ctx.fillStyle = WHITE;
    ctx.fillRect(9, -3, 5, 5);
  } else if (prop === "glove" || prop === "tape") {
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = WHITE;
    ctx.fillRect(-3, -3, 6, 6);
  } else if (prop === "staff") {
    ctx.fillRect(-24, -2, 36, 4);
    ctx.fillStyle = WHITE;
    ctx.fillRect(12, -6, 10, 12);
  } else if (prop === "stud") {
    ctx.fillStyle = "#c8c4bc";
    for (let i = 0; i < 8; i++) ctx.fillRect(-26 + i * 5, -2, 5, 4);
    ctx.fillRect(10, -5, 12, 10);
    ctx.fillStyle = "#ff4da6";
    ctx.fillRect(16, -3, 8, 6);
    ctx.fillStyle = WHITE;
    ctx.fillRect(18, -1, 4, 3);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 6; i++) ctx.fillRect(-10 - i * 5, i % 2 === 0 ? -6 : 3, 3, 3);
  } else {
    for (let i = 0; i < 11; i++) ctx.fillRect(-34 + i * 5, -2, 5, 4);
    ctx.fillRect(14, -4, 11, 9);
    ctx.fillStyle = WHITE;
    ctx.fillRect(10, -1, 6, 4);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.75;
    for (let i = 0; i < 8; i++) ctx.fillRect(-14 - i * 5, i % 2 === 0 ? -5 : 4, 3, 3);
  }
  ctx.restore();
}

export function abilityNameOf(id: string, key: "Q" | "W" | "E" | "R" | "P"): string {
  if (key === "P") return kitPatch(id).passive.name;
  return HEROES.find((h) => h.id === id)?.abilities.find((a) => a.key === key)?.name ?? key;
}
