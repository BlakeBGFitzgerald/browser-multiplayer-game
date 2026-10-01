/** Hanging, sideways, ripped US flag burning on the right of the enter page. */

export function drawFlag(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.clearRect(0, 0, w, h);

  const poleX = Math.min(w - 28, Math.max(w * 0.86, w - 160));
  const attachY = h * 0.02;
  const len = Math.min(h * 0.34, 280);
  const hoist = Math.min(132, Math.max(92, w * 0.1));

  const glow = ctx.createRadialGradient(poleX - hoist * 0.35, attachY + len * 0.45, 10, poleX - 20, attachY + len * 0.5, len * 0.9);
  glow.addColorStop(0, "rgba(255, 92, 18, 0.42)");
  glow.addColorStop(0.45, "rgba(180, 30, 8, 0.14)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(poleX - hoist * 1.6, 0, hoist * 2.4, len + 80);

  ctx.fillStyle = "#3a2814";
  ctx.fillRect(poleX - 5, attachY - 10, 10, len + 36);
  ctx.fillStyle = "#1e140a";
  ctx.fillRect(poleX - 2, attachY - 10, 3, len + 36);
  ctx.beginPath();
  ctx.fillStyle = "#c9a24a";
  ctx.arc(poleX, attachY + 8, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(poleX - 2, attachY + 14);
  ctx.rotate(Math.PI / 2 + 0.16 + Math.sin(t * 1.15) * 0.05);

  const wave = (x: number, y: number) => Math.sin(t * 2.6 + x * 0.02 + y * 0.045) * 7;
  const tear = (x: number) => {
    const u = Math.max(0, (x - len * 0.42) / (len * 0.58));
    return u * (22 + Math.sin(x * 0.13) * 16 + Math.sin(x * 0.41 + 1.2) * 10);
  };

  clothOutline(ctx, len, hoist, wave, tear);
  ctx.save();
  ctx.clip();

  const stripeH = hoist / 13;
  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#b01018" : "#f3ead8";
    ctx.fillRect(-8, i * stripeH + wave(20, i * stripeH) * 0.2, len + 24, stripeH + 1.5);
  }

  const cantonW = len * 0.38;
  const cantonH = stripeH * 7;
  ctx.fillStyle = "#1a2f70";
  ctx.fillRect(0, 0, cantonW, cantonH);
  ctx.fillStyle = "#f3ead8";
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2) continue;
      star(ctx, 10 + c * (cantonW / 8.6), 8 + r * (cantonH / 6.4), 3.4);
    }
  }

  ctx.globalCompositeOperation = "multiply";
  const scorch = ctx.createLinearGradient(len * 0.45, 0, len, hoist);
  scorch.addColorStop(0, "rgba(40, 12, 6, 0)");
  scorch.addColorStop(0.55, "rgba(30, 8, 4, 0.35)");
  scorch.addColorStop(1, "rgba(8, 2, 0, 0.82)");
  ctx.fillStyle = scorch;
  ctx.fillRect(len * 0.4, -8, len * 0.7, hoist + 16);
  ctx.restore();

  ctx.globalCompositeOperation = "destination-out";
  ripHole(ctx, len * 0.72, hoist * 0.22, 18 + Math.sin(t) * 2, t);
  ripHole(ctx, len * 0.58, hoist * 0.78, 14, t + 1);
  ripHole(ctx, len * 0.88, hoist * 0.48, 22, t + 2);
  ctx.beginPath();
  ctx.moveTo(len * 0.62, hoist * 0.9);
  ctx.lineTo(len * 0.96, hoist * 0.55);
  ctx.lineTo(len * 1.02, hoist * 1.05);
  ctx.lineTo(len * 0.7, hoist * 1.12);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  clothOutline(ctx, len, hoist, wave, tear);
  ctx.strokeStyle = "rgba(20, 6, 2, 0.55)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  const flames = [
    { x: len * 0.78, y: hoist * 0.2 },
    { x: len * 0.9, y: hoist * 0.48 },
    { x: len * 0.7, y: hoist * 0.82 },
    { x: len * 0.97, y: hoist * 0.7 },
    { x: len * 0.55, y: hoist * 0.95 },
    { x: len * 0.84, y: hoist * 0.08 },
  ];
  for (let i = 0; i < flames.length; i++) {
    const f = flames[i]!;
    const flicker = 0.75 + Math.sin(t * 11 + i * 1.7) * 0.25;
    drawFlame(ctx, f.x + wave(f.x, f.y), f.y, 16 * flicker, 28 * flicker, t + i);
  }

  for (let i = 0; i < 28; i++) {
    const x = len * (0.55 + (i % 9) * 0.05) + Math.sin(t * 7 + i) * 6;
    const y = hoist * (0.1 + (i % 5) * 0.18) - (t * 40 + i * 13) % 70;
    ctx.globalAlpha = 0.12 + (i % 4) * 0.05;
    ctx.fillStyle = i % 2 ? "rgba(90, 80, 70, 0.9)" : "rgba(40, 32, 28, 0.8)";
    ctx.beginPath();
    ctx.ellipse(x, y, 10 + (i % 3) * 4, 7 + (i % 2) * 3, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 22; i++) {
    const x = len * 0.62 + (i * 17) % (len * 0.4) + Math.sin(t * 9 + i) * 8;
    const y = hoist * 0.15 + (i % 6) * 18 - ((t * 55 + i * 21) % 90);
    ctx.globalAlpha = 0.35 + (i % 5) * 0.1;
    ctx.fillStyle = i % 3 === 0 ? "#ffd56a" : i % 3 === 1 ? "#ff7a18" : "#ff3b00";
    ctx.beginPath();
    ctx.arc(x, y, 1.4 + (i % 3) * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function clothOutline(
  ctx: CanvasRenderingContext2D,
  len: number,
  hoist: number,
  wave: (x: number, y: number) => number,
  tear: (x: number) => number,
): void {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, hoist);
  for (let x = 0; x <= len; x += 8) {
    ctx.lineTo(x, hoist + wave(x, hoist) + tear(x) * 0.35);
  }
  let y = hoist;
  while (y > 0) {
    const j = Math.sin(y * 0.22) * 18 + Math.sin(y * 0.51) * 10;
    ctx.lineTo(len + wave(len, y) - Math.max(0, 8 + j) - tear(len) * 0.2, y);
    y -= 10;
  }
  for (let x = len; x >= 0; x -= 8) {
    ctx.lineTo(x, wave(x, 0) - tear(x) * 0.12);
  }
  ctx.closePath();
}

function ripHole(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + t * 0.05;
    const rr = r * (0.65 + (i % 2) * 0.45);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawFlame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bw: number,
  bh: number,
  t: number,
): void {
  const lean = Math.sin(t * 9) * 5;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.4 + Math.sin(t * 6) * 0.12);
  const g = ctx.createLinearGradient(0, bh * 0.3, lean, -bh);
  g.addColorStop(0, "rgba(255, 210, 80, 0.95)");
  g.addColorStop(0.4, "rgba(255, 90, 16, 0.85)");
  g.addColorStop(1, "rgba(120, 10, 0, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-bw * 0.5, 0);
  ctx.quadraticCurveTo(-bw * 0.15, -bh * 0.45, lean, -bh);
  ctx.quadraticCurveTo(bw * 0.2, -bh * 0.4, bw * 0.55, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255, 250, 210, 0.7)";
  ctx.beginPath();
  ctx.moveTo(-bw * 0.18, 0);
  ctx.quadraticCurveTo(0, -bh * 0.35, lean * 0.4, -bh * 0.45);
  ctx.quadraticCurveTo(bw * 0.12, -bh * 0.2, bw * 0.16, 0);
  ctx.fill();
  ctx.restore();
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * ((Math.PI * 2) / 5);
    const b = a + Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    ctx.lineTo(x + Math.cos(b) * r * 0.4, y + Math.sin(b) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}
