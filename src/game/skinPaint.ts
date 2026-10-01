import type { SkinLook } from "../dlc";

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const six =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.slice(0, 6);
  const n = parseInt(six, 16);
  if (Number.isNaN(n)) return [196, 162, 74];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shade(hex: string, mul: number): string {
  const [r, g, b] = parseHex(hex);
  return `#${clampByte(r * mul).toString(16).padStart(2, "0")}${clampByte(g * mul)
    .toString(16)
    .padStart(2, "0")}${clampByte(b * mul).toString(16).padStart(2, "0")}`;
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function ink(ctx: CanvasRenderingContext2D, s: number, a = 0.94): void {
  ctx.strokeStyle = `rgba(8, 6, 4, ${a})`;
  ctx.lineWidth = Math.max(0.95, 1.92 * s);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
}

function cloth(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  tint: string,
): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, shade(tint, 1.58));
  g.addColorStop(0.2, shade(tint, 1.22));
  g.addColorStop(0.46, tint);
  g.addColorStop(0.74, shade(tint, 0.55));
  g.addColorStop(1, shade(tint, 0.3));
  return g;
}

function velvet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tint: string,
): CanvasGradient {
  const r = Math.max(rx, ry);
  const g = ctx.createRadialGradient(
    cx - rx * 0.32,
    cy - ry * 0.36,
    Math.max(0.4, r * 0.08),
    cx,
    cy,
    r * 1.08,
  );
  g.addColorStop(0, shade(tint, 1.62));
  g.addColorStop(0.24, shade(tint, 1.16));
  g.addColorStop(0.55, tint);
  g.addColorStop(0.82, shade(tint, 0.5));
  g.addColorStop(1, shade(tint, 0.28));
  return g;
}

function asVolume(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
): string | CanvasGradient {
  if (typeof fill === "string" && fill.startsWith("#") && fill.length >= 4) {
    return velvet(ctx, x, y, rx, ry, fill);
  }
  return fill;
}

function fillStroke(ctx: CanvasRenderingContext2D, s: number, fill: string | CanvasGradient): void {
  ctx.save();
  ctx.fillStyle = "rgba(8, 6, 4, 0.28)";
  ctx.translate(0.55 * s, 0.95 * s);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = fill;
  ctx.fill();
  ink(ctx, s);
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255, 236, 200, 0.36)";
  ctx.lineWidth = Math.max(0.48, 0.68 * s);
  ctx.stroke();
  ctx.restore();
}

function gleam(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot = -0.5,
  a = 0.56,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `rgba(255, 236, 200, ${a})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function oval(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
  s: number,
  rot = 0,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  fillStroke(ctx, s, asVolume(ctx, x, y, rx, ry, fill));
}

function disc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string | CanvasGradient,
  s: number,
): void {
  oval(ctx, x, y, r, r, fill, s);
}

function slab(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string | CanvasGradient,
  s: number,
  rad = 0,
): void {
  ctx.beginPath();
  if (rad > 0) ctx.roundRect(x, y, w, h, rad);
  else ctx.rect(x, y, w, h);
  fillStroke(ctx, s, fill);
}

function poly(
  ctx: CanvasRenderingContext2D,
  pts: Array<[number, number]>,
  fill: string | CanvasGradient,
  s: number,
): void {
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.closePath();
  fillStroke(ctx, s, fill);
}

function weave(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(8, 6, 4, 0.14)";
  ctx.lineWidth = Math.max(0.28, 0.38 * s);
  for (let i = -7; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y + i * 1.2 * s);
    ctx.lineTo(x + 10 * s, y + i * 1.2 * s + 2.4 * s);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255, 236, 200, 0.08)";
  for (let i = -6; i <= 7; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 10 * s + i * 1.4 * s, y - 8 * s);
    ctx.lineTo(x - 6 * s + i * 1.4 * s, y + 14 * s);
    ctx.stroke();
  }
  ctx.restore();
}

function wash(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tint: string): void {
  ctx.fillStyle = velvet(ctx, x - 2 * s, y, 10.6 * s, 13 * s, tint);
  ctx.globalAlpha = 0.42;
  ctx.beginPath();
  ctx.ellipse(x, y + 3.6 * s, 10.6 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y + 3.6 * s, 10.6 * s, 13 * s, 0, 0, Math.PI * 2);
  ctx.clip();
  weave(ctx, x, y + 4 * s, s);
  ctx.restore();
  ctx.strokeStyle = rgba(tint, 0.55);
  ctx.lineWidth = 1.55 * s;
  ctx.beginPath();
  ctx.moveTo(x - 7.4 * s, y - 2 * s);
  ctx.lineTo(x + 7.4 * s, y - 1.5 * s);
  ctx.lineTo(x + 5.6 * s, y + 2 * s);
  ctx.lineTo(x - 5.6 * s, y + 1.8 * s);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = rgba("#1a120c", 0.32);
  ctx.lineWidth = 0.78 * s;
  ctx.beginPath();
  ctx.moveTo(x - 6.2 * s, y + 3.2 * s);
  ctx.lineTo(x + 5.4 * s, y + 4.4 * s);
  ctx.moveTo(x - 5.4 * s, y + 7.4 * s);
  ctx.lineTo(x + 4.6 * s, y + 8.4 * s);
  ctx.stroke();
}

function cape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  tint: string,
  time: number,
  wide: boolean,
): void {
  const f = Math.sin(time * 3.15) * (wide ? 2.7 : 2) * s;
  const hang = (wide ? 21.5 : 18.8) * s;
  const w = (wide ? 16.2 : 14) * s;
  ctx.beginPath();
  ctx.moveTo(x - 6.2 * s, y - 1.2 * s);
  ctx.quadraticCurveTo(x - w + f, y + 7 * s, x - w - 0.6 * s + f, y + hang);
  ctx.quadraticCurveTo(
    x + f * 0.2,
    y + hang + 4.6 * s + Math.sin(time * 2.15) * 1.3 * s,
    x + w + 0.6 * s + f * 0.34,
    y + hang,
  );
  ctx.quadraticCurveTo(x + w * 0.22 + f * 0.12, y + 7 * s, x + 6.2 * s, y - 1.2 * s);
  ctx.closePath();
  fillStroke(ctx, s, cloth(ctx, x - w, y, x + w * 0.4, y + hang, tint));
  ctx.save();
  ctx.clip();
  weave(ctx, x, y + 8 * s, s);
  ctx.fillStyle = rgba("#1a120c", 0.2);
  ctx.beginPath();
  ctx.ellipse(x + f * 0.15, y + hang * 0.7, w * 0.62, 5.4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = rgba("#1a120c", 0.42);
  ctx.lineWidth = 1.15 * s;
  ctx.beginPath();
  ctx.moveTo(x - 2.4 * s, y + 1.8 * s);
  ctx.quadraticCurveTo(x - 6.8 * s + f, y + 10 * s, x - 5.6 * s + f, y + hang - 2 * s);
  ctx.moveTo(x - 0.4 * s, y + 2.4 * s);
  ctx.quadraticCurveTo(x - 1.6 * s + f * 0.4, y + 12 * s, x - 0.8 * s, y + hang - 3.4 * s);
  ctx.stroke();
  ctx.strokeStyle = rgba("#fff6e0", 0.4);
  ctx.lineWidth = 1.12 * s;
  ctx.beginPath();
  ctx.moveTo(x + 1.4 * s, y + 1.4 * s);
  ctx.quadraticCurveTo(x + 4.8 * s + f * 0.25, y + 9 * s, x + 3.6 * s, y + hang - 3.2 * s);
  ctx.stroke();
  disc(ctx, x, y - 0.2 * s, 2.25 * s, shade(tint, 1.2), s);
  disc(ctx, x, y - 0.2 * s, 0.95 * s, "#c9a24a", s);
  gleam(ctx, x - 4.6 * s, y + 3.8 * s, 4.2 * s, 2.6 * s, -0.45, 0.36);
}

function visorHat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  brim: string,
  crown: string,
): void {
  ctx.fillStyle = "rgba(8, 6, 4, 0.32)";
  ctx.beginPath();
  ctx.ellipse(x, y - 10.4 * s, 8.6 * s, 2.4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y - 13.2 * s, 12.4 * s, 4.8 * s, 0.05, 0, Math.PI * 2);
  fillStroke(ctx, s, cloth(ctx, x, y - 17 * s, x, y - 9 * s, brim));
  ctx.beginPath();
  ctx.ellipse(x, y - 12.2 * s, 10.4 * s, 3.2 * s, 0.05, 0, Math.PI * 2);
  fillStroke(ctx, s, shade(brim, 0.62));
  slab(ctx, x - 7.4 * s, y - 21.2 * s, 14.8 * s, 7.6 * s, cloth(ctx, x, y - 22 * s, x, y - 13 * s, crown), s, 1.7 * s);
  ctx.fillStyle = rgba("#fff6e0", 0.36);
  ctx.fillRect(x - 6.6 * s, y - 20.2 * s, 13.2 * s, 1.45 * s);
  disc(ctx, x + 6.2 * s, y - 16.4 * s, 1.2 * s, "#c9a24a", s);
  gleam(ctx, x - 3.6 * s, y - 16.2 * s, 4 * s, 1.45 * s, -0.2, 0.4);
}

function lenses(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  glass: string,
  strap: string,
): void {
  slab(ctx, x - 16.2 * s, y - 10.6 * s, 4.4 * s, 2.2 * s, shade(strap, 0.42), s, 0.6 * s);
  slab(ctx, x + 11.8 * s, y - 10.6 * s, 4.4 * s, 2.2 * s, shade(strap, 0.42), s, 0.6 * s);
  slab(ctx, x - 11.8 * s, y - 12.8 * s, 23.6 * s, 6.8 * s, shade(strap, 0.5), s, 1.5 * s);
  const gL = velvet(ctx, x - 5.1 * s, y - 9.2 * s, 4.6 * s, 3.5 * s, glass);
  const gR = velvet(ctx, x + 5.1 * s, y - 9.2 * s, 4.6 * s, 3.5 * s, glass);
  oval(ctx, x - 5.1 * s, y - 9.2 * s, 4.6 * s, 3.5 * s, gL, s);
  oval(ctx, x + 5.1 * s, y - 9.2 * s, 4.6 * s, 3.5 * s, gR, s);
  slab(ctx, x - 1.3 * s, y - 10.2 * s, 2.6 * s, 2.1 * s, shade(strap, 0.7), s, 0.4 * s);
  ctx.fillStyle = "rgba(230, 250, 255, 0.22)";
  ctx.beginPath();
  ctx.ellipse(x - 5.1 * s, y - 9.2 * s, 3.2 * s, 2.2 * s, -0.2, 0, Math.PI * 2);
  ctx.ellipse(x + 5.1 * s, y - 9.2 * s, 3.2 * s, 2.2 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();
  gleam(ctx, x - 6.6 * s, y - 10.6 * s, 1.9 * s, 1.15 * s, -0.5, 0.62);
  gleam(ctx, x + 3.6 * s, y - 10.6 * s, 1.9 * s, 1.15 * s, -0.5, 0.62);
}

function pieEye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, s: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  fillStroke(ctx, s, "#111111");
  ctx.fillStyle = "#f6ead2";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r * 0.92, -0.72, 2.38);
  ctx.closePath();
  ctx.fill();
  gleam(ctx, x - r * 0.28, y - r * 0.32, r * 0.22, r * 0.16, -0.4, 0.5);
}

function finish(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tint: string): void {
  ctx.fillStyle = "rgba(8, 6, 4, 0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y - 4.4 * s, 5.8 * s, 2.1 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(8, 6, 4, 0.32)";
  ctx.beginPath();
  ctx.ellipse(x + 0.6 * s, y + 16.8 * s, 12.2 * s, 3.6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y + 4.8 * s, 12.6 * s, 14.8 * s, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = rgba("#120c08", 0.14);
  ctx.lineWidth = 0.42 * s;
  for (let i = -9; i <= 9; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 1.55 * s - 10 * s, y - 14 * s);
    ctx.lineTo(x + i * 1.55 * s + 10 * s, y + 20 * s);
    ctx.stroke();
  }
  ctx.restore();
  gleam(ctx, x - 5.4 * s, y - 1.8 * s, 4.8 * s, 6.6 * s, -0.42, 0.26);
  gleam(ctx, x + 3.2 * s, y + 8.4 * s, 2.4 * s, 1.4 * s, 0.3, 0.16);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(tint, 0.5);
  ctx.lineWidth = Math.max(0.78, 1.12 * s);
  ctx.beginPath();
  ctx.ellipse(x - 1.2 * s, y + 4.6 * s, 12 * s, 14.2 * s, -0.22, Math.PI * 0.72, Math.PI * 1.52);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 236, 200, 0.28)";
  ctx.lineWidth = Math.max(0.5, 0.72 * s);
  ctx.beginPath();
  ctx.ellipse(x - 2.4 * s, y + 3.2 * s, 10.4 * s, 12.6 * s, -0.28, Math.PI * 0.78, Math.PI * 1.4);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "rgba(201, 162, 74, 0.42)";
  ctx.lineWidth = Math.max(0.45, 0.62 * s);
  ctx.beginPath();
  ctx.ellipse(x, y + 5 * s, 13.2 * s, 15.4 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Shared DLC overlay for in-match sprites (`paintPlayableSkin`) and 128px portraits
 * (`paintSkinGraphic` at scale ~2.36). C17 volume: cloth grain, contact shadow,
 * gold rim, and a second specular. `time` drives cape flutter.
 */
export function paintSkinLook(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  look: SkinLook,
  tint: string,
  scale = 1,
  time = 0,
): void {
  const s = scale;
  ctx.save();
  wash(ctx, x, y, s, tint);

  if (look === "cape" || look === "parade") cape(ctx, x, y, s, tint, time, look === "parade");
  if (look === "eagle" || look === "parade") {
    visorHat(ctx, x, y, s, "#efe6d6", look === "eagle" ? "#c4161c" : tint);
    poly(
      ctx,
      [
        [x - 1.6 * s, y - 22.4 * s],
        [x, y - 26.2 * s],
        [x + 1.6 * s, y - 22.4 * s],
      ],
      look === "eagle" ? "#c9a24a" : shade(tint, 1.2),
      s,
    );
  }
  if (look === "mask" || look === "spine") {
    const shell = look === "spine" ? "#2a1038" : "#121018";
    slab(ctx, x - 12.2 * s, y - 11.2 * s, 4.2 * s, 3.2 * s, shade(shell, 0.7), s, 0.8 * s);
    slab(ctx, x + 8 * s, y - 11.2 * s, 4.2 * s, 3.2 * s, shade(shell, 0.7), s, 0.8 * s);
    slab(ctx, x - 11.2 * s, y - 14.2 * s, 22.4 * s, 9.4 * s, cloth(ctx, x, y - 15 * s, x, y - 5 * s, shell), s, 2.6 * s);
    oval(ctx, x - 4.8 * s, y - 9.6 * s, 3.9 * s, 2.7 * s, velvet(ctx, x - 5 * s, y - 10 * s, 3.9 * s, 2.7 * s, tint), s);
    oval(ctx, x + 4.8 * s, y - 9.6 * s, 3.9 * s, 2.7 * s, velvet(ctx, x + 5 * s, y - 10 * s, 3.9 * s, 2.7 * s, tint), s);
    poly(
      ctx,
      [
        [x - 1.4 * s, y - 7.2 * s],
        [x, y - 4.6 * s],
        [x + 1.4 * s, y - 7.2 * s],
      ],
      shade(shell, 1.15),
      s,
    );
    gleam(ctx, x - 6.2 * s, y - 10.8 * s, 1.6 * s, 1 * s, -0.5, 0.58);
    gleam(ctx, x + 3.2 * s, y - 10.8 * s, 1.6 * s, 1 * s, -0.5, 0.58);
  }
  if (look === "stamp") {
    disc(ctx, x + 8.2 * s, y - 3.4 * s, 5.4 * s, cloth(ctx, x + 5 * s, y - 8 * s, x + 11 * s, y + 2 * s, tint), s);
    ctx.strokeStyle = rgba("#efe6d6", 0.55);
    ctx.lineWidth = 0.9 * s;
    ctx.beginPath();
    ctx.arc(x + 8.2 * s, y - 3.4 * s, 3.4 * s, 0, Math.PI * 2);
    ctx.stroke();
    gleam(ctx, x + 6.4 * s, y - 5.2 * s, 1.6 * s, 1.1 * s, -0.4, 0.4);
  }
  if (look === "visor") visorHat(ctx, x, y, s, "#0b0b0b", tint);
  if (look === "crown") {
    disc(ctx, x, y - 21.4 * s, 7.4 * s, cloth(ctx, x - 6 * s, y - 28 * s, x + 6 * s, y - 14 * s, tint), s);
    poly(
      ctx,
      [
        [x - 7.8 * s, y - 20 * s],
        [x - 4.8 * s, y - 30.2 * s],
        [x - 2.2 * s, y - 21.2 * s],
        [x, y - 32.2 * s],
        [x + 2.2 * s, y - 21.2 * s],
        [x + 4.8 * s, y - 30.2 * s],
        [x + 7.8 * s, y - 20 * s],
      ],
      cloth(ctx, x, y - 33 * s, x, y - 18 * s, shade(tint, 1.12)),
      s,
    );
    disc(ctx, x - 4.8 * s, y - 29.4 * s, 1.15 * s, "#efe6d6", s);
    disc(ctx, x, y - 31.4 * s, 1.35 * s, "#c4161c", s);
    disc(ctx, x + 4.8 * s, y - 29.4 * s, 1.15 * s, "#efe6d6", s);
    gleam(ctx, x - 2.4 * s, y - 24 * s, 2.8 * s, 1.8 * s, -0.4, 0.48);
  }
  if (look === "hide") {
    oval(ctx, x, y + 7.6 * s, 15.2 * s, 13 * s, cloth(ctx, x - 8 * s, y - 2 * s, x + 10 * s, y + 18 * s, tint), s);
    oval(ctx, x, y + 9.2 * s, 8.4 * s, 7.2 * s, shade(tint, 1.18), s);
    oval(ctx, x - 11.2 * s, y + 1.2 * s, 5.6 * s, 6.8 * s, shade(tint, 0.72), s, -0.35);
    oval(ctx, x + 11.2 * s, y + 1.2 * s, 5.6 * s, 6.8 * s, shade(tint, 0.72), s, 0.35);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y + 7.6 * s, 15.2 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = rgba("#1a120c", 0.34);
    ctx.lineWidth = 0.85 * s;
    ctx.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const ox = (i - 3.5) * 3.2 * s;
      ctx.beginPath();
      ctx.moveTo(x + ox, y + 0.6 * s);
      ctx.quadraticCurveTo(x + ox + 1.8 * s, y + 7 * s, x + ox + 0.6 * s, y + 14 * s);
      ctx.stroke();
    }
    ctx.restore();
    gleam(ctx, x - 4.2 * s, y + 2 * s, 4.4 * s, 2.6 * s, -0.35, 0.28);
  }
  if (look === "sash") {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 11.4 * s, y - 8.4 * s);
    ctx.lineTo(x + 10.6 * s, y + 12.6 * s);
    ctx.strokeStyle = shade(tint, 0.42);
    ctx.lineWidth = 5.4 * s;
    ctx.stroke();
    ctx.strokeStyle = cloth(ctx, x - 12 * s, y - 10 * s, x + 12 * s, y + 14 * s, tint);
    ctx.lineWidth = 4.2 * s;
    ctx.stroke();
    ctx.strokeStyle = rgba("#fff6e0", 0.35);
    ctx.lineWidth = 1.05 * s;
    ctx.beginPath();
    ctx.moveTo(x - 10.2 * s, y - 8.8 * s);
    ctx.lineTo(x + 8.8 * s, y + 10.6 * s);
    ctx.stroke();
  }
  if (look === "hood") {
    ctx.beginPath();
    ctx.arc(x, y - 13.4 * s, 12.2 * s, Math.PI, 0);
    ctx.lineTo(x + 12.2 * s, y - 4.2 * s);
    ctx.quadraticCurveTo(x, y - 8 * s, x - 12.2 * s, y - 4.2 * s);
    ctx.closePath();
    fillStroke(ctx, s, cloth(ctx, x, y - 26 * s, x, y - 2 * s, tint));
    ctx.fillStyle = rgba("#0a0806", 0.38);
    ctx.beginPath();
    ctx.arc(x, y - 12.2 * s, 8.4 * s, Math.PI + 0.15, -0.15);
    ctx.fill();
    slab(ctx, x - 12.4 * s, y - 13.6 * s, 4.8 * s, 11.2 * s, shade(tint, 0.62), s, 1.2 * s);
    slab(ctx, x + 7.6 * s, y - 13.6 * s, 4.8 * s, 11.2 * s, shade(tint, 0.62), s, 1.2 * s);
    gleam(ctx, x - 4 * s, y - 18 * s, 3.2 * s, 1.6 * s, -0.3, 0.28);
  }
  if (look === "goggles") lenses(ctx, x, y, s, tint, "#1a120c");
  if (look === "band") {
    slab(ctx, x - 11.6 * s, y - 16.6 * s, 23.2 * s, 5.2 * s, cloth(ctx, x, y - 18 * s, x, y - 11 * s, tint), s, 1.5 * s);
    ctx.strokeStyle = rgba("#fff6e0", 0.28);
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y - 15.4 * s);
    ctx.lineTo(x + 10 * s, y - 15.4 * s);
    ctx.stroke();
  }
  if (look === "badge") {
    poly(
      ctx,
      [
        [x + 3.2 * s, y - 3.4 * s],
        [x + 12.2 * s, y - 3.4 * s],
        [x + 11.4 * s, y + 5.6 * s],
        [x + 7.7 * s, y + 8.4 * s],
        [x + 4 * s, y + 5.6 * s],
      ],
      cloth(ctx, x + 4 * s, y - 4 * s, x + 12 * s, y + 8 * s, tint),
      s,
    );
    slab(ctx, x + 5.8 * s, y - 1.2 * s, 4.4 * s, 4.4 * s, "#efe6d6", s, 0.6 * s);
    gleam(ctx, x + 6.4 * s, y - 2.2 * s, 1.8 * s, 1.1 * s, -0.4, 0.45);
  }
  if (look === "plume") {
    visorHat(ctx, x, y, s, "#1a120c", shade(tint, 0.55));
    ctx.beginPath();
    ctx.moveTo(x + 4.2 * s, y - 18.4 * s);
    ctx.quadraticCurveTo(x + 16.4 * s, y - 33 * s, x + 8.4 * s, y - 37.4 * s);
    ctx.quadraticCurveTo(x + 1.6 * s, y - 25 * s, x + 4.2 * s, y - 18.4 * s);
    fillStroke(ctx, s, cloth(ctx, x + 4 * s, y - 38 * s, x + 12 * s, y - 16 * s, tint));
    gleam(ctx, x + 8 * s, y - 28 * s, 2.2 * s, 4 * s, 0.4, 0.28);
  }
  if (look === "wrap") {
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(x, y + 6.4 * s + i * 2.1 * s, 11.4 * s - i * 0.6 * s, 4.4 * s, 0.08, 0.15, Math.PI - 0.15);
      ctx.strokeStyle = i % 2 === 0 ? tint : shade(tint, 0.7);
      ctx.lineWidth = 2.4 * s;
      ctx.stroke();
      ink(ctx, s, 0.45);
      ctx.lineWidth = 0.55 * s;
      ctx.stroke();
    }
  }
  if (look === "halo") {
    ctx.save();
    ctx.shadowColor = rgba(tint, 0.65);
    ctx.shadowBlur = 6 * s;
    ctx.strokeStyle = cloth(ctx, x - 10 * s, y - 28 * s, x + 10 * s, y - 20 * s, tint);
    ctx.lineWidth = 2.15 * s;
    ctx.beginPath();
    ctx.ellipse(x, y - 24.2 * s, 9.4 * s, 3.35 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ink(ctx, s, 0.5);
    ctx.lineWidth = 0.7 * s;
    ctx.beginPath();
    ctx.ellipse(x, y - 24.2 * s, 9.4 * s, 3.35 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    gleam(ctx, x - 4 * s, y - 25.6 * s, 2.4 * s, 1.1 * s, -0.2, 0.5);
  }
  if (look === "gloves") {
    oval(ctx, x - 13.6 * s, y + 2.2 * s, 6.2 * s, 5.1 * s, cloth(ctx, x - 18 * s, y - 2 * s, x - 8 * s, y + 8 * s, tint), s, -0.42);
    oval(ctx, x + 13.6 * s, y + 2.2 * s, 6.2 * s, 5.1 * s, cloth(ctx, x + 8 * s, y - 2 * s, x + 18 * s, y + 8 * s, tint), s, 0.42);
    slab(ctx, x - 16.2 * s, y - 0.4 * s, 5.4 * s, 3.2 * s, "#1a120c", s, 0.8 * s);
    slab(ctx, x + 10.8 * s, y - 0.4 * s, 5.4 * s, 3.2 * s, "#1a120c", s, 0.8 * s);
    gleam(ctx, x - 15.4 * s, y + 0.6 * s, 2.2 * s, 1.3 * s, -0.5, 0.35);
    gleam(ctx, x + 11.6 * s, y + 0.6 * s, 2.2 * s, 1.3 * s, -0.5, 0.35);
  }
  if (look === "belt") {
    slab(ctx, x - 12.4 * s, y + 5.6 * s, 24.8 * s, 5.2 * s, cloth(ctx, x, y + 5 * s, x, y + 12 * s, "#1a120c"), s, 1 * s);
    poly(
      ctx,
      [
        [x - 5.2 * s, y + 3.6 * s],
        [x + 5.2 * s, y + 3.6 * s],
        [x + 4.2 * s, y + 13.2 * s],
        [x - 4.2 * s, y + 13.2 * s],
      ],
      cloth(ctx, x, y + 3 * s, x, y + 14 * s, tint),
      s,
    );
    gleam(ctx, x - 1.6 * s, y + 5.4 * s, 2.4 * s, 1.2 * s, -0.3, 0.5);
  }
  if (look === "ear") {
    oval(ctx, x - 11.2 * s, y - 10.2 * s, 4.4 * s, 5.7 * s, cloth(ctx, x - 14 * s, y - 16 * s, x - 8 * s, y - 4 * s, tint), s, -0.28);
    oval(ctx, x + 11.2 * s, y - 10.2 * s, 4.4 * s, 5.7 * s, cloth(ctx, x + 8 * s, y - 16 * s, x + 14 * s, y - 4 * s, tint), s, 0.28);
    oval(ctx, x - 11.2 * s, y - 10.2 * s, 2.1 * s, 2.8 * s, shade(tint, 0.7), s, -0.28);
    oval(ctx, x + 11.2 * s, y - 10.2 * s, 2.1 * s, 2.8 * s, shade(tint, 0.7), s, 0.28);
  }
  if (look === "shorts") {
    slab(ctx, x - 11.6 * s, y + 7.4 * s, 23.2 * s, 9.4 * s, cloth(ctx, x, y + 7 * s, x, y + 18 * s, tint), s, 1.4 * s);
    slab(ctx, x - 2.2 * s, y + 7.4 * s, 4.4 * s, 9.4 * s, "#efe6d6", s);
    ctx.strokeStyle = rgba("#fff6e0", 0.3);
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y + 8.6 * s);
    ctx.lineTo(x + 10 * s, y + 8.6 * s);
    ctx.stroke();
  }
  if (look === "tape") {
    slab(ctx, x - 16.4 * s, y - 1.4 * s, 8.4 * s, 5.2 * s, cloth(ctx, x - 16 * s, y - 2 * s, x - 8 * s, y + 4 * s, tint), s, 1 * s);
    slab(ctx, x + 8 * s, y - 1.4 * s, 8.4 * s, 5.2 * s, cloth(ctx, x + 8 * s, y - 2 * s, x + 16 * s, y + 4 * s, tint), s, 1 * s);
    ctx.strokeStyle = "#1a120c";
    ctx.lineWidth = 0.85 * s;
    ctx.beginPath();
    ctx.moveTo(x - 15.2 * s, y + 1.2 * s);
    ctx.lineTo(x - 9.2 * s, y + 1.2 * s);
    ctx.moveTo(x + 9.2 * s, y + 1.2 * s);
    ctx.lineTo(x + 15.2 * s, y + 1.2 * s);
    ctx.stroke();
  }
  if (look === "cowl") {
    poly(
      ctx,
      [
        [x - 8.4 * s, y - 15.4 * s],
        [x - 5.2 * s, y - 28.6 * s],
        [x - 0.6 * s, y - 15.4 * s],
      ],
      cloth(ctx, x - 8 * s, y - 30 * s, x, y - 14 * s, tint),
      s,
    );
    poly(
      ctx,
      [
        [x + 0.6 * s, y - 15.4 * s],
        [x + 5.2 * s, y - 28.6 * s],
        [x + 8.4 * s, y - 15.4 * s],
      ],
      cloth(ctx, x, y - 30 * s, x + 8 * s, y - 14 * s, tint),
      s,
    );
    slab(ctx, x - 11.4 * s, y - 15.2 * s, 22.8 * s, 6.4 * s, cloth(ctx, x, y - 16 * s, x, y - 8 * s, shade(tint, 0.72)), s, 1.6 * s);
    gleam(ctx, x - 3 * s, y - 22 * s, 1.6 * s, 2.8 * s, 0.2, 0.28);
  }
  if (look === "web") {
    ctx.strokeStyle = shade(tint, 0.45);
    ctx.lineWidth = 2.05 * s;
    ctx.beginPath();
    ctx.arc(x, y - 1.6 * s, 7.4 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.35 * s;
    ctx.beginPath();
    ctx.arc(x, y - 1.6 * s, 7.4 * s, 0, Math.PI * 2);
    ctx.moveTo(x - 7.4 * s, y - 1.6 * s);
    ctx.lineTo(x + 7.4 * s, y - 1.6 * s);
    ctx.moveTo(x, y - 9 * s);
    ctx.lineTo(x, y + 5.8 * s);
    ctx.moveTo(x - 5.4 * s, y - 6.8 * s);
    ctx.lineTo(x + 5.4 * s, y + 3.6 * s);
    ctx.moveTo(x + 5.4 * s, y - 6.8 * s);
    ctx.lineTo(x - 5.4 * s, y + 3.6 * s);
    ctx.stroke();
    disc(ctx, x, y - 1.6 * s, 1.7 * s, shade(tint, 0.55), s);
    gleam(ctx, x - 2.2 * s, y - 3.4 * s, 1.5 * s, 1 * s, -0.4, 0.4);
  }
  if (look === "shield") {
    disc(ctx, x - 13.6 * s, y + 2.2 * s, 8.6 * s, cloth(ctx, x - 20 * s, y - 6 * s, x - 8 * s, y + 10 * s, tint), s);
    disc(ctx, x - 13.6 * s, y + 2.2 * s, 4.6 * s, "#efe6d6", s);
    disc(ctx, x - 13.6 * s, y + 2.2 * s, 2.2 * s, "#c9a24a", s);
    gleam(ctx, x - 16.2 * s, y - 0.4 * s, 2.4 * s, 1.5 * s, -0.5, 0.45);
  }
  if (look === "hammer") {
    slab(ctx, x + 10.2 * s, y - 7.4 * s, 3.2 * s, 18.6 * s, cloth(ctx, x + 10 * s, y - 8 * s, x + 14 * s, y + 12 * s, "#5a4a3a"), s, 0.7 * s);
    slab(ctx, x + 5.4 * s, y - 14.8 * s, 12.8 * s, 8.2 * s, cloth(ctx, x + 6 * s, y - 16 * s, x + 18 * s, y - 6 * s, tint), s, 1.2 * s);
    gleam(ctx, x + 7.4 * s, y - 13.2 * s, 3.2 * s, 1.4 * s, -0.2, 0.4);
  }
  if (look === "bolt") {
    poly(
      ctx,
      [
        [x + 2.2 * s, y - 20.4 * s],
        [x + 8.4 * s, y - 8.2 * s],
        [x + 3.2 * s, y - 8.2 * s],
        [x + 10.4 * s, y + 6.4 * s],
        [x + 1 * s, y - 3.8 * s],
        [x + 6.2 * s, y - 3.8 * s],
      ],
      cloth(ctx, x + 2 * s, y - 22 * s, x + 10 * s, y + 8 * s, tint),
      s,
    );
    gleam(ctx, x + 4.4 * s, y - 14 * s, 1.6 * s, 3.2 * s, 0.4, 0.45);
  }
  if (look === "lasso") {
    ctx.lineCap = "round";
    ctx.strokeStyle = shade(tint, 0.5);
    ctx.lineWidth = 2.8 * s;
    ctx.beginPath();
    ctx.ellipse(x + 10.4 * s, y - 5.6 * s, 7.4 * s, 9.4 * s, 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.85 * s;
    ctx.stroke();
    ctx.strokeStyle = rgba("#1a120c", 0.35);
    ctx.lineWidth = 0.7 * s;
    ctx.setLineDash([1.6 * s, 1.4 * s]);
    ctx.stroke();
    ctx.setLineDash([]);
    gleam(ctx, x + 6 * s, y - 10 * s, 2 * s, 1.2 * s, -0.3, 0.3);
  }
  if (look === "lantern") {
    ctx.save();
    ctx.shadowColor = rgba(tint, 0.7);
    ctx.shadowBlur = 8 * s;
    disc(ctx, x + 12.2 * s, y - 3.6 * s, 6.2 * s, cloth(ctx, x + 8 * s, y - 10 * s, x + 16 * s, y + 4 * s, tint), s);
    ctx.restore();
    ctx.strokeStyle = "#efe6d6";
    ctx.lineWidth = 1.55 * s;
    ctx.beginPath();
    ctx.arc(x + 12.2 * s, y - 3.6 * s, 3.5 * s, 0, Math.PI * 2);
    ctx.stroke();
    slab(ctx, x + 10.6 * s, y - 11.4 * s, 3.2 * s, 3.4 * s, "#5a4a3a", s, 0.5 * s);
    gleam(ctx, x + 10.2 * s, y - 5.6 * s, 1.8 * s, 1.2 * s, -0.4, 0.55);
  }
  if (look === "claws") {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const blades: Array<[number, number, number, number]> = [
      [x + 12 * s, y + 1.6 * s, x + 22.4 * s, y - 6.4 * s],
      [x + 12 * s, y + 4 * s, x + 23.2 * s, y + 2 * s],
      [x + 12 * s, y + 6.4 * s, x + 21.4 * s, y + 10.4 * s],
    ];
    for (const [ax, ay, bx, by] of blades) {
      ctx.strokeStyle = shade(tint, 0.45);
      ctx.lineWidth = 2.55 * s;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.strokeStyle = tint;
      ctx.lineWidth = 1.55 * s;
      ctx.stroke();
      gleam(ctx, (ax + bx) / 2, (ay + by) / 2, 1.2 * s, 0.7 * s, 0, 0.4);
    }
  }
  if (look === "gauntlet") {
    oval(ctx, x + 13.8 * s, y + 2.2 * s, 7.2 * s, 6.1 * s, cloth(ctx, x + 8 * s, y - 4 * s, x + 20 * s, y + 8 * s, tint), s, 0.28);
    disc(ctx, x + 13.8 * s, y + 1.2 * s, 2.55 * s, cloth(ctx, x + 12 * s, y - 1 * s, x + 16 * s, y + 4 * s, "#c9a24a"), s);
    gleam(ctx, x + 12 * s, y, 2.2 * s, 1.3 * s, -0.4, 0.5);
  }
  if (look === "mouse") {
    const inkCol = tint || "#111111";
    const cream = "#f6ead2";
    disc(ctx, x - 10.4 * s, y - 21.8 * s, 6.9 * s, cloth(ctx, x - 14 * s, y - 28 * s, x - 6 * s, y - 16 * s, inkCol), s);
    disc(ctx, x + 10.4 * s, y - 21.8 * s, 6.9 * s, cloth(ctx, x + 6 * s, y - 28 * s, x + 14 * s, y - 16 * s, inkCol), s);
    disc(ctx, x - 10.4 * s, y - 21.8 * s, 3.4 * s, "#3a2018", s);
    disc(ctx, x + 10.4 * s, y - 21.8 * s, 3.4 * s, "#3a2018", s);
    oval(ctx, x, y - 9.8 * s, 9.8 * s, 8.8 * s, cloth(ctx, x - 6 * s, y - 18 * s, x + 6 * s, y - 2 * s, cream), s);
    pieEye(ctx, x - 3.8 * s, y - 11.2 * s, 3 * s, s);
    pieEye(ctx, x + 3.8 * s, y - 11.2 * s, 3 * s, s);
    disc(ctx, x, y - 6.4 * s, 1.85 * s, inkCol, s);
    ctx.strokeStyle = shade(inkCol, 0.7);
    ctx.lineWidth = 1.7 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 8.4 * s, y + 8 * s);
    ctx.quadraticCurveTo(x + 18 * s, y + 6 * s, x + 16.4 * s, y - 2.2 * s);
    ctx.stroke();
    slab(ctx, x - 10.6 * s, y + 4.4 * s, 21.2 * s, 8.6 * s, cream, s, 1.3 * s);
    disc(ctx, x - 3.4 * s, y + 8.8 * s, 1.55 * s, inkCol, s);
    disc(ctx, x + 3.4 * s, y + 8.8 * s, 1.55 * s, inkCol, s);
    gleam(ctx, x - 4.2 * s, y + 7.6 * s, 0.7 * s, 0.5 * s, -0.4, 0.45);
    gleam(ctx, x + 2.6 * s, y + 7.6 * s, 0.7 * s, 0.5 * s, -0.4, 0.45);
    oval(ctx, x - 7.4 * s, y + 16.6 * s, 5.9 * s, 2.9 * s, inkCol, s, -0.14);
    oval(ctx, x + 7.4 * s, y + 16.6 * s, 5.9 * s, 2.9 * s, inkCol, s, 0.14);
    gleam(ctx, x - 3 * s, y - 13.2 * s, 2.6 * s, 1.6 * s, -0.4, 0.34);
  }
  if (look === "minnie") {
    disc(ctx, x - 9.4 * s, y - 21.6 * s, 6.1 * s, "#111111", s);
    disc(ctx, x + 9.4 * s, y - 21.6 * s, 6.1 * s, "#111111", s);
    disc(ctx, x - 9.4 * s, y - 21.6 * s, 2.8 * s, "#3a2018", s);
    disc(ctx, x + 9.4 * s, y - 21.6 * s, 2.8 * s, "#3a2018", s);
    oval(ctx, x - 4.1 * s, y - 26.2 * s, 4.8 * s, 3.2 * s, cloth(ctx, x - 8 * s, y - 30 * s, x, y - 22 * s, tint), s, -0.4);
    oval(ctx, x + 4.1 * s, y - 26.2 * s, 4.8 * s, 3.2 * s, cloth(ctx, x, y - 30 * s, x + 8 * s, y - 22 * s, tint), s, 0.4);
    disc(ctx, x, y - 24.4 * s, 2.2 * s, tint, s);
    oval(ctx, x, y - 9.8 * s, 8.5 * s, 7.6 * s, cloth(ctx, x, y - 16 * s, x, y - 2 * s, "#f6ead2"), s);
    pieEye(ctx, x - 3.2 * s, y - 10.6 * s, 2.35 * s, s);
    pieEye(ctx, x + 3.2 * s, y - 10.6 * s, 2.35 * s, s);
    slab(ctx, x - 9.8 * s, y + 4.4 * s, 19.6 * s, 7.8 * s, cloth(ctx, x, y + 4 * s, x, y + 13 * s, tint), s, 1.3 * s);
    gleam(ctx, x - 2.4 * s, y - 13 * s, 2.2 * s, 1.3 * s, -0.4, 0.32);
  }
  if (look === "pooh") {
    disc(ctx, x - 8.1 * s, y - 19.6 * s, 4.6 * s, cloth(ctx, x - 12 * s, y - 24 * s, x - 4 * s, y - 14 * s, tint), s);
    disc(ctx, x + 8.1 * s, y - 19.6 * s, 4.6 * s, cloth(ctx, x + 4 * s, y - 24 * s, x + 12 * s, y - 14 * s, tint), s);
    oval(ctx, x, y + 1.6 * s, 12.2 * s, 11.2 * s, cloth(ctx, x - 8 * s, y - 10 * s, x + 8 * s, y + 14 * s, tint), s);
    oval(ctx, x, y + 3.8 * s, 5.2 * s, 4.2 * s, "#efe6d6", s);
    disc(ctx, x - 3.4 * s, y - 3.6 * s, 1.35 * s, "#111111", s);
    disc(ctx, x + 3.4 * s, y - 3.6 * s, 1.35 * s, "#111111", s);
    disc(ctx, x, y + 1.8 * s, 1.7 * s, "#5a4a3a", s);
    slab(ctx, x + 8.2 * s, y + 3.6 * s, 6.4 * s, 8.4 * s, cloth(ctx, x + 8 * s, y + 3 * s, x + 15 * s, y + 12 * s, "#c9a24a"), s, 1 * s);
    slab(ctx, x + 9.2 * s, y + 5.2 * s, 4.4 * s, 2.2 * s, "#efe6d6", s);
    gleam(ctx, x - 3.6 * s, y - 2 * s, 3.2 * s, 2.2 * s, -0.4, 0.22);
  }
  if (look === "tigger") {
    disc(ctx, x - 7.2 * s, y - 19.8 * s, 3.8 * s, cloth(ctx, x - 10 * s, y - 24 * s, x - 4 * s, y - 16 * s, tint), s);
    disc(ctx, x + 7.2 * s, y - 19.8 * s, 3.8 * s, cloth(ctx, x + 4 * s, y - 24 * s, x + 10 * s, y - 16 * s, tint), s);
    ctx.strokeStyle = "#1a120c";
    ctx.lineWidth = 2.05 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 8.2 * s, y - 1.6 * s);
    ctx.lineTo(x + 8.2 * s, y + 2.2 * s);
    ctx.moveTo(x - 7.2 * s, y + 5.8 * s);
    ctx.lineTo(x + 8.2 * s, y + 8.8 * s);
    ctx.moveTo(x - 4.4 * s, y + 12.2 * s);
    ctx.lineTo(x + 6.6 * s, y + 13.6 * s);
    ctx.stroke();
    ctx.strokeStyle = tint;
    ctx.lineWidth = 3.1 * s;
    ctx.beginPath();
    ctx.moveTo(x + 8.2 * s, y + 8.2 * s);
    ctx.quadraticCurveTo(x + 18.4 * s, y + 2.2 * s, x + 14.4 * s, y - 4.2 * s);
    ctx.stroke();
    ink(ctx, s, 0.5);
    ctx.lineWidth = 0.7 * s;
    ctx.stroke();
    disc(ctx, x + 14.4 * s, y - 4.2 * s, 2.2 * s, tint, s);
    gleam(ctx, x + 12 * s, y - 2 * s, 1.6 * s, 1 * s, -0.3, 0.3);
  }
  if (look === "alice") {
    slab(ctx, x - 11.4 * s, y - 18.4 * s, 22.8 * s, 4.4 * s, cloth(ctx, x, y - 20 * s, x, y - 14 * s, tint), s, 1.2 * s);
    slab(ctx, x - 8.4 * s, y - 2.2 * s, 16.8 * s, 12.6 * s, cloth(ctx, x, y - 3 * s, x, y + 12 * s, "#efe6d6"), s, 1.4 * s);
    ctx.strokeStyle = tint;
    ctx.lineWidth = 1.45 * s;
    ctx.strokeRect(x - 8.4 * s, y - 2.2 * s, 16.8 * s, 12.6 * s);
    slab(ctx, x - 2.4 * s, y + 2.2 * s, 4.8 * s, 4.8 * s, "#c4161c", s, 0.5 * s);
    gleam(ctx, x - 5 * s, y - 0.4 * s, 2.4 * s, 1.4 * s, -0.4, 0.28);
  }
  if (look === "hatter") {
    slab(ctx, x - 11.6 * s, y - 14.4 * s, 23.2 * s, 3.7 * s, cloth(ctx, x, y - 16 * s, x, y - 10 * s, "#1a120c"), s, 0.8 * s);
    slab(ctx, x - 6.2 * s, y - 28.4 * s, 12.4 * s, 16.4 * s, cloth(ctx, x, y - 30 * s, x, y - 12 * s, tint), s, 1.2 * s);
    slab(ctx, x + 4.2 * s, y - 24.6 * s, 8.4 * s, 6.2 * s, "#efe6d6", s, 0.8 * s);
    ctx.fillStyle = "#1a120c";
    ctx.font = `${Math.max(5, 4.6 * s)}px 'IBM Plex Mono', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("10/6", x + 8.4 * s, y - 21.4 * s);
    gleam(ctx, x - 2.4 * s, y - 24 * s, 2.4 * s, 1.4 * s, -0.3, 0.3);
  }
  if (look === "grin") {
    disc(ctx, x - 8.2 * s, y - 19.8 * s, 4.4 * s, cloth(ctx, x - 12 * s, y - 24 * s, x - 4 * s, y - 16 * s, tint), s);
    disc(ctx, x + 8.2 * s, y - 19.8 * s, 4.4 * s, cloth(ctx, x + 4 * s, y - 24 * s, x + 12 * s, y - 16 * s, tint), s);
    pieEye(ctx, x - 3.6 * s, y - 10.4 * s, 2.4 * s, s);
    pieEye(ctx, x + 3.6 * s, y - 10.4 * s, 2.4 * s, s);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.25 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, y - 5.6 * s, 8.2 * s, 0.22, Math.PI - 0.22);
    ctx.stroke();
    gleam(ctx, x, y - 16 * s, 3 * s, 1.6 * s, 0, 0.22);
  }
  if (look === "holmes") {
    poly(
      ctx,
      [
        [x - 12.4 * s, y - 9.6 * s],
        [x - 3.2 * s, y - 22.4 * s],
        [x + 3.2 * s, y - 22.4 * s],
        [x + 12.4 * s, y - 9.6 * s],
      ],
      cloth(ctx, x, y - 24 * s, x, y - 8 * s, tint),
      s,
    );
    slab(ctx, x - 5.2 * s, y - 26.6 * s, 10.4 * s, 5.2 * s, shade(tint, 0.72), s, 1 * s);
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.7 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 3.2 * s, y - 5.6 * s);
    ctx.quadraticCurveTo(x + 12.4 * s, y - 1.6 * s, x + 14.4 * s, y - 10.2 * s);
    ctx.stroke();
    disc(ctx, x + 14.6 * s, y - 10.6 * s, 1.7 * s, "#3a2a18", s);
    gleam(ctx, x - 2 * s, y - 16 * s, 2.6 * s, 1.4 * s, -0.3, 0.28);
  }
  if (look === "drac") {
    poly(
      ctx,
      [
        [x - 13.4 * s, y - 3.6 * s],
        [x - 6.2 * s, y - 18.4 * s],
        [x, y - 5.6 * s],
        [x + 6.2 * s, y - 18.4 * s],
        [x + 13.4 * s, y - 3.6 * s],
      ],
      cloth(ctx, x, y - 20 * s, x, y - 2 * s, "#111111"),
      s,
    );
    poly(
      ctx,
      [
        [x - 3.2 * s, y - 1.6 * s],
        [x - 1.4 * s, y + 6.4 * s],
        [x + 0.6 * s, y - 1.6 * s],
      ],
      tint,
      s,
    );
    poly(
      ctx,
      [
        [x + 1.4 * s, y - 1.6 * s],
        [x + 3.4 * s, y + 6.4 * s],
        [x + 5.4 * s, y - 1.6 * s],
      ],
      tint,
      s,
    );
    gleam(ctx, x - 4 * s, y - 10 * s, 2.2 * s, 1.4 * s, -0.4, 0.2);
  }
  if (look === "neckbolts") {
    slab(ctx, x - 10.4 * s, y - 24.6 * s, 20.8 * s, 6.4 * s, cloth(ctx, x, y - 26 * s, x, y - 18 * s, "#3a4a3a"), s, 1.2 * s);
    disc(ctx, x - 12.2 * s, y - 8.2 * s, 3.15 * s, cloth(ctx, x - 14 * s, y - 11 * s, x - 10 * s, y - 5 * s, "#c9a24a"), s);
    disc(ctx, x + 12.2 * s, y - 8.2 * s, 3.15 * s, cloth(ctx, x + 10 * s, y - 11 * s, x + 14 * s, y - 5 * s, "#c9a24a"), s);
    gleam(ctx, x - 13.2 * s, y - 9.4 * s, 1.2 * s, 0.8 * s, -0.4, 0.5);
    gleam(ctx, x + 11.2 * s, y - 9.4 * s, 1.2 * s, 0.8 * s, -0.4, 0.5);
  }
  if (look === "felix") {
    disc(ctx, x - 8.1 * s, y - 20.2 * s, 5 * s, cloth(ctx, x - 12 * s, y - 26 * s, x - 4 * s, y - 14 * s, tint), s);
    disc(ctx, x + 8.1 * s, y - 20.2 * s, 5 * s, cloth(ctx, x + 4 * s, y - 26 * s, x + 12 * s, y - 14 * s, tint), s);
    oval(ctx, x, y - 10.4 * s, 9 * s, 8.2 * s, cloth(ctx, x, y - 18 * s, x, y - 2 * s, tint), s);
    disc(ctx, x - 3.5 * s, y - 11.2 * s, 2.5 * s, "#efe6d6", s);
    disc(ctx, x + 3.5 * s, y - 11.2 * s, 2.5 * s, "#efe6d6", s);
    disc(ctx, x - 3.5 * s, y - 11.2 * s, 1.05 * s, "#111111", s);
    disc(ctx, x + 3.5 * s, y - 11.2 * s, 1.05 * s, "#111111", s);
    ctx.strokeStyle = "#efe6d6";
    ctx.lineWidth = 1.65 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, y - 5.6 * s, 4.6 * s, 0.18, Math.PI - 0.18);
    ctx.stroke();
    gleam(ctx, x - 3 * s, y - 14 * s, 2.4 * s, 1.5 * s, -0.4, 0.28);
  }
  if (look === "oz") {
    ctx.lineCap = "round";
    ctx.strokeStyle = shade(tint, 0.5);
    ctx.lineWidth = 3.7 * s;
    ctx.beginPath();
    ctx.moveTo(x - 10.2 * s, y - 8.2 * s);
    ctx.lineTo(x + 9.2 * s, y + 12.4 * s);
    ctx.moveTo(x + 9.2 * s, y - 8.2 * s);
    ctx.lineTo(x - 10.2 * s, y + 12.4 * s);
    ctx.stroke();
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2.35 * s;
    ctx.stroke();
    oval(ctx, x - 7.2 * s, y + 16.2 * s, 5.2 * s, 2.3 * s, cloth(ctx, x - 10 * s, y + 14 * s, x - 4 * s, y + 18 * s, "#c0c8d0"), s, -0.1);
    oval(ctx, x + 7.2 * s, y + 16.2 * s, 5.2 * s, 2.3 * s, cloth(ctx, x + 4 * s, y + 14 * s, x + 10 * s, y + 18 * s, "#c0c8d0"), s, 0.1);
    gleam(ctx, x, y + 2 * s, 2.2 * s, 1.4 * s, 0, 0.25);
  }
  if (look === "robin") {
    ctx.beginPath();
    ctx.ellipse(x, y - 15.6 * s, 10.4 * s, 6.2 * s, 0, Math.PI, 0);
    ctx.lineTo(x + 10.4 * s, y - 12.2 * s);
    ctx.lineTo(x - 10.4 * s, y - 12.2 * s);
    ctx.closePath();
    fillStroke(ctx, s, cloth(ctx, x, y - 22 * s, x, y - 10 * s, tint));
    slab(ctx, x - 10.4 * s, y - 16.2 * s, 20.8 * s, 4.2 * s, shade(tint, 0.72), s, 0.8 * s);
    ctx.beginPath();
    ctx.moveTo(x + 6.2 * s, y - 18.2 * s);
    ctx.quadraticCurveTo(x + 16.4 * s, y - 30.4 * s, x + 10.2 * s, y - 32.6 * s);
    ctx.quadraticCurveTo(x + 3.6 * s, y - 22.4 * s, x + 6.2 * s, y - 18.2 * s);
    fillStroke(ctx, s, cloth(ctx, x + 6 * s, y - 34 * s, x + 14 * s, y - 16 * s, "#efe6d6"));
    gleam(ctx, x - 3 * s, y - 17 * s, 2.6 * s, 1.3 * s, -0.2, 0.3);
  }

  finish(ctx, x, y, s, tint);
  ctx.restore();
}

const FULL_COSTUME: ReadonlySet<SkinLook> = new Set([
  "mouse",
  "minnie",
  "pooh",
  "tigger",
  "hide",
  "cape",
  "parade",
  "felix",
  "grin",
  "alice",
  "oz",
  "drac",
  "hatter",
  "holmes",
  "robin",
]);

function paintCostumePlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tint: string,
  s = 1,
): void {
  const coat = velvet(ctx, x - 2 * s, y + 2 * s, 12.4 * s, 14.4 * s, tint);
  ctx.beginPath();
  ctx.ellipse(x, y + 5 * s, 12.4 * s, 14.4 * s, 0, 0, Math.PI * 2);
  fillStroke(ctx, s, coat);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y + 5 * s, 12.4 * s, 14.4 * s, 0, 0, Math.PI * 2);
  ctx.clip();
  weave(ctx, x, y + 5 * s, s);
  ctx.restore();
  ctx.fillStyle = rgba(tint, 0.82);
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y + 2 * s);
  ctx.lineTo(x + 9 * s, y + 4 * s);
  ctx.lineTo(x + 6 * s, y + 20 * s);
  ctx.lineTo(x - 12 * s, y + 16 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = shade(tint, 1.32);
  ctx.beginPath();
  ctx.moveTo(x - 6.8 * s, y - 5.2 * s);
  ctx.lineTo(x + 6.8 * s, y - 5.2 * s);
  ctx.lineTo(x + 4.4 * s, y + 0.6 * s);
  ctx.lineTo(x - 4.4 * s, y + 0.6 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba("#efe6d6", 0.58);
  ctx.fillRect(x - 7.2 * s, y + 1 * s, 14.4 * s, 2.1 * s);
  ctx.fillRect(x - 5.2 * s, y + 5.2 * s, 10.4 * s, 1.5 * s);
  ctx.fillStyle = "#c9a24a";
  ctx.fillRect(x - 1.6 * s, y + 4.6 * s, 3.2 * s, 2.6 * s);
  ctx.fillStyle = "rgba(255, 236, 200, 0.45)";
  ctx.fillRect(x - 1.2 * s, y + 4.8 * s, 1.4 * s, 1.1 * s);
  ctx.strokeStyle = "rgba(40, 18, 10, 0.34)";
  ctx.lineWidth = 0.78 * s;
  ctx.beginPath();
  ctx.moveTo(x - 6.2 * s, y + 3.2 * s);
  ctx.lineTo(x + 5.2 * s, y + 4.2 * s);
  ctx.moveTo(x - 5.2 * s, y + 7.2 * s);
  ctx.lineTo(x + 4.2 * s, y + 8.2 * s);
  ctx.stroke();
  oval(ctx, x - 12.2 * s, y + 2 * s, 3.7 * s, 8.4 * s, shade(tint, 0.82), s, -0.5);
  oval(ctx, x + 12.2 * s, y + 2 * s, 3.7 * s, 8.4 * s, shade(tint, 0.82), s, 0.5);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255, 236, 200, 0.34)";
  ctx.beginPath();
  ctx.ellipse(x - 4.2 * s, y - 1 * s, 5.4 * s, 7.4 * s, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 220, 160, 0.52)";
  ctx.lineWidth = 1.55 * s;
  ctx.beginPath();
  ctx.ellipse(x - 2 * s, y + 4 * s, 11.6 * s, 13 * s, -0.25, Math.PI * 0.7, Math.PI * 1.55);
  ctx.stroke();
  ctx.restore();
}

/**
 * Equipped skin at kit density. `costume` paints the tinted coat under accessory looks.
 */
export function paintSkinGraphic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  look: SkinLook,
  tint: string,
  scale: number,
  time: number,
  costume: boolean,
): void {
  ctx.save();
  if (costume && !FULL_COSTUME.has(look)) paintCostumePlate(ctx, x, y, tint, scale);
  paintSkinLook(ctx, x, y, look, tint, scale, time);
  ctx.restore();
}

/**
 * In-match equipped skin. C17 kit-weight coat, grain, and gleam, then the look at
 * sprite density so a cape or visor reads as Quad Engine cloth, not a sticker.
 */
export function paintPlayableSkin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  look: SkinLook,
  tint: string,
  time = 0,
): void {
  const scale = FULL_COSTUME.has(look) ? 1.34 : 1.22;
  paintSkinGraphic(ctx, x, y, look, tint, scale, time, true);
}
