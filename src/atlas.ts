import {
  BACK_TRACKS,
  JUNGLE_CAMPS,
  LANES,
  WOODS,
  WORLD,
  ancientPos,
  fountain,
  lanePath,
  trackRank,
  towers,
} from "./game/map";

/** Labeled campus map for the enter page. Fills the rail. MAGA DC bottom-left, Antifa Seattle top-right. */
export function drawAtlas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sides: { maga: string; antifa: string } = { maga: "@blake", antifa: "@lilhooligan" },
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0c100e";
  ctx.fillRect(0, 0, w, h);
  const pad = 6;
  const bw = Math.max(80, w - pad * 2);
  const bh = Math.max(80, h - pad * 2);
  const sx = bw / WORLD;
  const sy = bh / WORLD;
  const mark = Math.max(sx, sy);

  ctx.save();
  ctx.translate(pad, pad);
  const lawn = ctx.createLinearGradient(0, bh, bw, 0);
  lawn.addColorStop(0, "#3a5a32");
  lawn.addColorStop(0.5, "#243828");
  lawn.addColorStop(1, "#16302c");
  ctx.fillStyle = lawn;
  ctx.fillRect(0, 0, bw, bh);
  ctx.fillStyle = "rgba(110, 150, 60, 0.18)";
  for (let i = 0; i < 90; i++) {
    const n = (i * 17.3) % 1;
    ctx.beginPath();
    ctx.ellipse(((i * 47) % 1000) / 1000 * bw, ((i * 31) % 1000) / 1000 * bh, 8 + n * 10, 4, n, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(240,193,74,0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0.5, 0.5, bw - 1, bh - 1);

  ctx.save();
  ctx.translate(1300 * sx, 1300 * sy);
  ctx.rotate(Math.PI / 4);
  const span = Math.hypot(bw, bh);
  ctx.fillStyle = "#1a3a44";
  ctx.fillRect(-span * 0.55, -14, span * 1.1, 28);
  ctx.fillStyle = "#2a6a78";
  ctx.fillRect(-span * 0.52, -8, span * 1.04, 16);
  ctx.restore();

  for (const w of WOODS) {
    ctx.save();
    ctx.translate(w.x * sx, w.y * sy);
    ctx.rotate(w.rot);
    ctx.fillStyle = w.fir ? "rgba(8, 36, 32, 0.72)" : "rgba(22, 48, 16, 0.7)";
    ctx.beginPath();
    ctx.ellipse(0, 0, w.rx * sx, w.ry * sy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = w.fir ? "rgba(40, 90, 78, 0.55)" : "rgba(70, 110, 40, 0.5)";
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const rad = 0.2 + (i % 5) * 0.14;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * w.rx * sx * rad, Math.sin(a) * w.ry * sy * rad, Math.max(1.1, mark * 3.2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = w.fir ? "rgba(120, 200, 180, 0.18)" : "rgba(140, 180, 70, 0.16)";
    ctx.beginPath();
    ctx.ellipse(0, 0, w.rx * sx * 0.85, w.ry * sy * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const t of BACK_TRACKS) {
    const rank = trackRank(t.name);
    const fir = t.path[0]!.x + t.path[0]!.y > WORLD;
    ctx.strokeStyle = rank === "primary" ? (fir ? "#3ec8c1" : "#c9a24a") : "#6a4a28";
    ctx.lineWidth = Math.max(rank === "primary" ? 5 : rank === "gank" ? 3.2 : 2, mark * (rank === "primary" ? 16 : 9));
    ctx.setLineDash(rank === "primary" ? [] : [6, 5]);
    ctx.beginPath();
    ctx.moveTo(t.path[0]!.x * sx, t.path[0]!.y * sy);
    for (let i = 1; i < t.path.length; i++) ctx.lineTo(t.path[i]!.x * sx, t.path[i]!.y * sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = "#c4a06a";
  ctx.lineWidth = Math.max(6, mark * 42);
  ctx.lineJoin = "round";
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    ctx.beginPath();
    ctx.moveTo(path[0]!.x * sx, path[0]!.y * sy);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x * sx, path[i]!.y * sy);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(232, 196, 74, 0.55)";
  ctx.lineWidth = Math.max(1.2, mark * 4);
  ctx.setLineDash([5, 6]);
  for (const lane of LANES) {
    const path = lanePath.home[lane];
    ctx.beginPath();
    ctx.moveTo(path[0]!.x * sx, path[0]!.y * sy);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i]!.x * sx, path[i]!.y * sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.fillStyle = "#8a6a38";
  for (const t of towers) {
    const r = (t.tier === "inner" ? 8 : t.tier === "middle" ? 6.4 : 5) * Math.max(1, mark * 12);
    ctx.fillRect(t.pos.x * sx - r / 2, t.pos.y * sy - r / 2, r, r);
  }

  const town = Math.max(8, mark * 28);
  ctx.fillStyle = "#c4161c";
  ctx.beginPath();
  ctx.arc(ancientPos.home.x * sx, ancientPos.home.y * sy, town, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3ec8c1";
  ctx.beginPath();
  ctx.arc(ancientPos.away.x * sx, ancientPos.away.y * sy, town, 0, Math.PI * 2);
  ctx.fill();

  const pool = Math.max(10, mark * 32);
  ctx.fillStyle = "rgba(142, 198, 232, 0.95)";
  ctx.beginPath();
  ctx.arc(fountain.home.x * sx, fountain.home.y * sy, pool, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(62, 200, 193, 0.95)";
  ctx.beginPath();
  ctx.arc(fountain.away.x * sx, fountain.away.y * sy, pool, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(239, 230, 214, 0.7)";
  ctx.lineWidth = Math.max(1, mark * 2.4);
  for (const f of [fountain.home, fountain.away]) {
    ctx.beginPath();
    ctx.arc(f.x * sx, f.y * sy, pool * 1.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(f.x * sx, f.y * sy, pool * 1.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(f.x * sx, f.y * sy, pool * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(f.x * sx, f.y * sy, pool * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#3a2c22";
  const halls: Array<[number, number, number, number]> = [
    [48, 1640, 90, 64],
    [48, 1748, 78, 52],
    [640, 2496, 110, 44],
    [980, 2496, 86, 40],
  ];
  for (const [x, y, w0, h0] of halls) ctx.fillRect(x * sx, y * sy, w0 * sx, h0 * sy);
  ctx.fillStyle = "#243040";
  const north: Array<[number, number, number, number]> = [
    [2496, 700, 84, 56],
    [2496, 796, 70, 46],
    [1680, 48, 110, 44],
    [1488, 48, 86, 40],
  ];
  for (const [x, y, w0, h0] of north) ctx.fillRect(x * sx, y * sy, w0 * sx, h0 * sy);

  ctx.fillStyle = "#8a6a28";
  for (const c of JUNGLE_CAMPS) {
    ctx.beginPath();
    ctx.arc(c.x * sx, c.y * sy, Math.max(5, mark * 16), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#c9b48a";
  ctx.fillRect(80 * sx, 2280 * sy, 120 * sx, 28 * sy);
  ctx.fillStyle = "#8ec8e8";
  ctx.fillRect(90 * sx, 2210 * sy, 22 * sx, 50 * sy);
  ctx.fillStyle = "#1a5868";
  ctx.beginPath();
  ctx.moveTo(2180 * sx, 40 * sy);
  ctx.lineTo(2560 * sx, 40 * sy);
  ctx.lineTo(2560 * sx, 210 * sy);
  ctx.lineTo(2220 * sx, 210 * sy);
  ctx.closePath();
  ctx.fill();

  const title = Math.max(13, Math.floor(Math.min(bw, bh) * 0.032));
  ctx.font = `600 ${title}px 'IBM Plex Mono', monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#c4161c";
  ctx.fillText("WASHINGTON DC", fountain.home.x * sx + 28, fountain.home.y * sy - 22);
  ctx.fillText("MAGA", fountain.home.x * sx + 28, fountain.home.y * sy - 6);
  ctx.fillStyle = "#3ec8c1";
  ctx.fillText("SEATTLE", fountain.away.x * sx - 16, fountain.away.y * sy - 24);
  ctx.fillText("ANTIFA", fountain.away.x * sx - 16, fountain.away.y * sy - 8);

  ctx.fillStyle = "#efe6d6";
  ctx.fillText("TOP", 240 * sx, 210 * sy);
  ctx.fillText("MID", 1300 * sx, 1240 * sy);
  ctx.fillText("BOT", 2340 * sx, 2340 * sy);
  ctx.fillText("RIVER", 1500 * sx, 1160 * sy);

  const camp = Math.max(11, Math.floor(Math.min(bw, bh) * 0.024));
  ctx.font = `600 ${camp}px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = "#c9a24a";
  for (const c of JUNGLE_CAMPS) {
    ctx.fillText(c.name.toUpperCase(), c.x * sx, c.y * sy - 14);
  }
  const wood = Math.max(10, Math.floor(Math.min(bw, bh) * 0.02));
  ctx.font = `600 ${wood}px 'IBM Plex Mono', monospace`;
  for (const w of WOODS) {
    ctx.fillStyle = w.fir ? "#3ec8c1" : "#c9a24a";
    ctx.fillText("WOODS", w.x * sx, w.y * sy + 6);
  }
  ctx.fillStyle = "#a07840";
  ctx.font = `600 ${Math.max(9, Math.floor(Math.min(bw, bh) * 0.018))}px 'IBM Plex Mono', monospace`;
  for (const t of BACK_TRACKS) {
    const p = t.path[Math.floor(t.path.length / 2)]!;
    ctx.fillText("BACK TRACK", p.x * sx, p.y * sy + 4);
  }

  ctx.fillStyle = "#8ad8d4";
  ctx.font = `600 ${Math.max(10, Math.floor(Math.min(bw, bh) * 0.022))}px 'IBM Plex Mono', monospace`;
  ctx.fillText("FOUNTAIN", fountain.home.x * sx + 28, fountain.home.y * sy + 38);
  ctx.fillText("FOUNTAIN", fountain.away.x * sx - 10, fountain.away.y * sy + 36);
  ctx.fillStyle = "#f0c14a";
  ctx.font = `600 ${Math.max(12, Math.floor(Math.min(bw, bh) * 0.026))}px 'IBM Plex Mono', monospace`;
  ctx.fillText(sides.maga, fountain.home.x * sx + 48, fountain.home.y * sy + 24);
  ctx.fillText(sides.antifa, fountain.away.x * sx - 10, fountain.away.y * sy + 22);
  ctx.restore();
}
