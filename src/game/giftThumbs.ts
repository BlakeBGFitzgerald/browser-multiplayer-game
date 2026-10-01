/**
 * Gift Shop thumbnails. One painter per item id.
 * 48×48 pixel icons, light from the top-left, ink on the shadow edge.
 * A missing id throws. Theme only tints the backdrop in giftArt.
 */

export const THUMB_N = 48;

const N = THUMB_N;

type Mat = {
  ink: string;
  spec: string;
  hi: string;
  mid: string;
  lo: string;
  deep: string;
};

function mat(ink: string, spec: string, hi: string, mid: string, lo: string, deep: string): Mat {
  return { ink, spec, hi, mid, lo, deep };
}

const M = {
  paper: mat("#3a2814", "#fffef8", "#fff4e4", "#f0d8b4", "#c4a078", "#7a5a38"),
  chalk: mat("#5a5348", "#ffffff", "#f7f4ee", "#e0d8c8", "#b2a894", "#6e685c"),
  gold: mat("#4a300c", "#fff6c8", "#ffe08a", "#f0c14a", "#b88820", "#6a4c10"),
  red: mat("#3a0c10", "#ffd0c8", "#ff7a72", "#d42028", "#8c1418", "#4c080c"),
  leather: mat("#30080c", "#ffb0a4", "#e05850", "#a81820", "#6a1016", "#3a080c"),
  black: mat("#08080c", "#c8c8d2", "#6a6a76", "#2c2c34", "#16161c", "#08080c"),
  steel: mat("#1a2026", "#ffffff", "#e4eaf0", "#b0bac4", "#6a7580", "#343c44"),
  brass: mat("#3a280c", "#fff0c0", "#ffd878", "#e0a840", "#a07020", "#5c4010"),
  wood: mat("#3a2410", "#ffe0b8", "#e8c090", "#c08848", "#7a5028", "#4a3014"),
  glass: mat("#102838", "#ffffff", "#e4f6ff", "#8ec8e4", "#3a7898", "#163848"),
  juice: mat("#5a2808", "#fff0c8", "#ffd080", "#f09020", "#c05810", "#6a3008"),
  coffee: mat("#140c08", "#e0b090", "#8a5840", "#4a2820", "#2a1610", "#140c08"),
  pink: mat("#4a1830", "#ffe8f0", "#ffc0d4", "#f090b0", "#c05078", "#6a2848"),
  orange: mat("#4a2208", "#ffe4c0", "#ffc080", "#f07818", "#c04808", "#6a2808"),
  green: mat("#102818", "#e8ffd0", "#b0e080", "#58a848", "#287028", "#103018"),
  blue: mat("#101828", "#e8f2ff", "#b0c8ee", "#5080c8", "#284878", "#142038"),
  rubber: mat("#101014", "#b0b0ba", "#5a5a66", "#32323c", "#1a1a22", "#0a0a0e"),
  wax: mat("#4a1010", "#ffd0c8", "#ff6868", "#e02020", "#a01014", "#58080c"),
  cloth: mat("#3a3a44", "#ffffff", "#f4f4f8", "#d0d0dc", "#9898a8", "#585868"),
  gum: mat("#5a2040", "#ffe4ee", "#ffc0d4", "#ee88aa", "#c45880", "#6a2848"),
  foil: mat("#2a3038", "#ffffff", "#f4f7fb", "#d0d8e0", "#9098a4", "#505860"),
  lemon: mat("#4a4010", "#fffce0", "#fff0a0", "#f0d040", "#c0a020", "#6a5810"),
  smoke: mat("#2a2a30", "#ffffff", "#e8e8ee", "#b0b0ba", "#707078", "#404048"),
  flame: mat("#6a2808", "#fffef0", "#ffe080", "#ffb020", "#e05810", "#8a2808"),
  slime: mat("#143018", "#f0ffe4", "#c8f090", "#68c050", "#308028", "#143018"),
  cardb: mat("#3a2814", "#fff0d4", "#e8c8a0", "#c49860", "#8a6238", "#4a3018"),
  navy: mat("#10101c", "#d0d4ee", "#8888b0", "#3a3a58", "#222236", "#10101c"),
  plastic: mat("#103040", "#e8fbff", "#b8e8f4", "#78c0d8", "#3a88a4", "#1a5060"),
  ceramic: mat("#3a3834", "#ffffff", "#f4f0ea", "#e4d8cc", "#b0a090", "#6a5c50"),
  violet: mat("#2a1848", "#f0e4ff", "#d0b8f0", "#8868c0", "#503888", "#2a1848"),
  stone: mat("#2a2824", "#e8e4dc", "#c8c4ba", "#98948c", "#68645c", "#3a3834"),
};

const GLOW = {
  gold: "#7a5a18",
  red: "#8a3030",
  pink: "#8a4068",
  blue: "#2a6890",
  green: "#2a6840",
  violet: "#604888",
};

type Pt = readonly [number, number];

class Icon {
  buf: (string | null)[][];
  rimColor: string | null = null;

  constructor() {
    this.buf = Array.from({ length: N }, () => Array.from({ length: N }, () => null));
  }

  px(x: number, y: number, color: string): void {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= N || yi >= N) return;
    this.buf[yi]![xi] = color;
  }

  get(x: number, y: number): string | null {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= N || yi >= N) return null;
    return this.buf[yi]![xi];
  }

  rim(color: string): void {
    this.rimColor = color;
  }

  disc(cx: number, cy: number, rx: number, ry: number, m: Mat): void {
    if (rx < 0.8 || ry < 0.8) {
      this.px(cx, cy, m.mid);
      return;
    }
    const x0 = Math.floor(cx - rx - 1);
    const x1 = Math.ceil(cx + rx + 1);
    const y0 = Math.floor(cy - ry - 1);
    const y1 = Math.ceil(cy + ry + 1);
    let gx = cx;
    let gy = cy;
    let best = -2;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        const d = Math.hypot(dx, dy);
        if (d > 1) continue;
        const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const nx = dx / (d || 1);
        const ny = dy / (d || 1);
        const light = nx * -0.74 + ny * -0.64;
        const rim = dist > Math.min(rx, ry) - 1.15 || d > 0.86;
        const inner = !rim && (dist > Math.min(rx, ry) - 2.4 || d > 0.72);
        let col = m.mid;
        if (rim) col = light > 0.08 ? m.lo : m.ink;
        else if (inner && light > 0.25) col = m.hi;
        else if (inner && light < -0.25) col = m.deep;
        else if (light > 0.45) col = m.hi;
        else if (light > 0.05) col = m.mid;
        else if (light > -0.4) col = m.lo;
        else col = m.deep;
        this.px(x, y, col);
        if (!rim && light > best) {
          best = light;
          gx = x;
          gy = y;
        }
      }
    }
    if (Math.min(rx, ry) > 4 && best > 0) {
      this.px(gx, gy, m.spec);
      this.px(gx + 1, gy, m.hi);
      this.px(gx, gy + 1, m.hi);
    }
  }

  box(x: number, y: number, w: number, h: number, m: Mat, rad = 2): void {
    const r = Math.max(0, Math.min(rad, w / 2, h / 2));
    const x0 = x;
    const y0 = y;
    const x1 = x + w;
    const y1 = y + h;
    for (let py = Math.floor(y0); py < Math.ceil(y1); py++) {
      for (let px = Math.floor(x0); px < Math.ceil(x1); px++) {
        const qx = px + 0.5;
        const qy = py + 0.5;
        if (!inRound(qx, qy, x0, y0, x1, y1, r)) continue;
        const left = qx < x0 + 2.1;
        const top = qy < y0 + 2.1;
        const right = qx > x1 - 2.1;
        const bot = qy > y1 - 2.1;
        const u = (qx - x0) / w;
        const v = (qy - y0) / h;
        const light = (1 - u) * 0.58 + (1 - v) * 0.42;
        let col = light > 0.62 ? m.hi : light > 0.4 ? m.mid : light > 0.22 ? m.lo : m.deep;
        if ((right || bot) && !(left && top)) col = m.ink;
        else if (left || top) col = light > 0.45 ? m.spec : m.hi;
        this.px(px, py, col);
      }
    }
    if (w > 8 && h > 8) {
      this.px(x0 + 3, y0 + 3, m.spec);
      this.px(x0 + 4, y0 + 3, m.hi);
    }
  }

  poly(pts: readonly Pt[], m: Mat): void {
    if (pts.length < 3) throw new Error("gift thumb poly");
    let minX = N;
    let minY = N;
    let maxX = 0;
    let maxY = 0;
    for (const [x, y] of pts) {
      minX = Math.min(minX, Math.floor(x));
      minY = Math.min(minY, Math.floor(y));
      maxX = Math.max(maxX, Math.ceil(x));
      maxY = Math.max(maxY, Math.ceil(y));
    }
    const mask: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => false));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x < 0 || y < 0 || x >= N || y >= N) continue;
        if (inside(x + 0.5, y + 0.5, pts)) mask[y]![x] = true;
      }
    }
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x < 0 || y < 0 || x >= N || y >= N || !mask[y]![x]) continue;
        let nearest = 99;
        let ox = 0;
        let oy = 0;
        for (let yy = -3; yy <= 3; yy++) {
          for (let xx = -3; xx <= 3; xx++) {
            const sx = x + xx;
            const sy = y + yy;
            const out = sx < 0 || sy < 0 || sx >= N || sy >= N || !mask[sy]![sx];
            if (!out) continue;
            const d = Math.hypot(xx, yy);
            if (d < nearest) {
              nearest = d;
              ox = xx;
              oy = yy;
            }
          }
        }
        const u = (x - minX) / bw;
        const v = (y - minY) / bh;
        const light = (1 - u) * 0.58 + (1 - v) * 0.42;
        const outLight = ox * -0.7 + oy * -0.62;
        let col = light > 0.62 ? m.hi : light > 0.42 ? m.mid : light > 0.24 ? m.lo : m.deep;
        if (nearest < 1.2) col = outLight > 0 ? m.lo : m.ink;
        else if (nearest < 2.25 && outLight > 0.2) col = m.hi;
        else if (nearest < 2.25 && outLight < -0.2) col = m.deep;
        this.px(x, y, col);
      }
    }
  }

  rod(x0: number, y0: number, x1: number, y1: number, r: number, m: Mat): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len2 = dx * dx + dy * dy || 1;
    const minX = Math.floor(Math.min(x0, x1) - r - 1);
    const maxX = Math.ceil(Math.max(x0, x1) + r + 1);
    const minY = Math.floor(Math.min(y0, y1) - r - 1);
    const maxY = Math.ceil(Math.max(y0, y1) + r + 1);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        let t = ((px - x0) * dx + (py - y0) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        const cx = x0 + dx * t;
        const cy = y0 + dy * t;
        const ox = px - cx;
        const oy = py - cy;
        const dist = Math.hypot(ox, oy);
        if (dist > r) continue;
        const nx = dist > 0.01 ? ox / r : 0;
        const ny = dist > 0.01 ? oy / r : -1;
        const light = nx * -0.74 + ny * -0.64;
        const rim = dist > r - 1.15;
        let col = m.mid;
        if (rim) col = light > 0.05 ? m.lo : m.ink;
        else if (light > 0.48) col = m.hi;
        else if (light > 0.08) col = m.mid;
        else if (light > -0.35) col = m.lo;
        else col = m.deep;
        this.px(x, y, col);
      }
    }
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string, width = 2): void {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist * 2));
    const r = width / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.blob(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, color);
    }
  }

  blob(cx: number, cy: number, r: number, color: string): void {
    const x0 = Math.floor(cx - r - 1);
    const x1 = Math.ceil(cx + r + 1);
    const y0 = Math.floor(cy - r - 1);
    const y1 = Math.ceil(cy + r + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) this.px(x, y, color);
      }
    }
  }

  ring(cx: number, cy: number, rx: number, ry: number, thick: number, m: Mat): void {
    const x0 = Math.floor(cx - rx - 1);
    const x1 = Math.ceil(cx + rx + 1);
    const y0 = Math.floor(cy - ry - 1);
    const y1 = Math.ceil(cy + ry + 1);
    const irx = Math.max(0.5, rx - thick);
    const iry = Math.max(0.5, ry - thick);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const outer = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        const inner = (dx * dx) / (irx * irx) + (dy * dy) / (iry * iry);
        if (outer > 1 || inner < 1) continue;
        const light = dx * -0.7 + dy * -0.6;
        const col = light > 4 ? m.hi : light > 0 ? m.mid : light > -4 ? m.lo : m.ink;
        this.px(x, y, col);
      }
    }
  }

  eraseDisc(cx: number, cy: number, rx: number, ry: number): void {
    const x0 = Math.floor(cx - rx - 1);
    const x1 = Math.ceil(cx + rx + 1);
    const y0 = Math.floor(cy - ry - 1);
    const y1 = Math.ceil(cy + ry + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.clear(x, y);
      }
    }
  }

  clear(x: number, y: number): void {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= N || yi >= N) return;
    this.buf[yi]![xi] = null;
  }

  /** Recolor pixels that are already drawn. */
  over(x: number, y: number, w: number, h: number, color: string): void {
    for (let py = Math.floor(y); py < y + h; py++) {
      for (let px = Math.floor(x); px < x + w; px++) {
        if (this.get(px, py)) this.px(px, py, color);
      }
    }
  }

  bounds(): { minX: number; minY: number; maxX: number; maxY: number; ok: boolean } {
    let minX = N;
    let minY = N;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (!this.buf[y]![x]) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    return { minX, minY, maxX, maxY, ok: maxX >= 0 };
  }

  shift(dx: number, dy: number): void {
    if (!dx && !dy) return;
    const next: (string | null)[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => null));
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const c = this.buf[y]![x];
        if (!c) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
        next[ny]![nx] = c;
      }
    }
    this.buf = next;
  }

  align(): void {
    const b = this.bounds();
    if (!b.ok) return;
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    let dx = Math.round(N / 2 - 0.5 - cx);
    let dy = Math.round((N - 6) / 2 - cy);
    if (b.minX + dx < 1) dx = 1 - b.minX;
    if (b.maxX + dx > N - 2) dx = N - 2 - b.maxX;
    if (b.minY + dy < 1) dy = 1 - b.minY;
    if (b.maxY + dy > N - 5) dy = N - 5 - b.maxY;
    this.shift(dx, dy);
  }

  applyRim(): void {
    if (!this.rimColor) return;
    const color = this.rimColor;
    const b = this.bounds();
    if (!b.ok) return;
    const adds: Pt[] = [];
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (this.buf[y]![x]) continue;
        if (y > b.maxY - 2) continue;
        const right = x + 1 < N && this.buf[y]![x + 1];
        const below = y + 1 < N && this.buf[y + 1]![x];
        if (!right && !below) continue;
        if (((x + y) & 1) !== 0) continue;
        adds.push([x, y]);
      }
    }
    for (const [x, y] of adds.slice(0, 16)) this.buf[y]![x] = color;
  }

  contact(): void {
    const b = this.bounds();
    if (!b.ok) return;
    const cx = (b.minX + b.maxX) / 2;
    const w = Math.max(4, (b.maxX - b.minX) * 0.42);
    const y = Math.min(N - 1, b.maxY + 1);
    for (let x = 0; x < N; x++) {
      const dx = (x - cx) / w;
      if (dx * dx > 1) continue;
      const a = 1 - dx * dx;
      if (!this.buf[y]![x]) this.buf[y]![x] = a > 0.35 ? "#0c0908" : "#16110e";
      if (a > 0.55 && y + 1 < N && !this.buf[y + 1]![x]) this.buf[y + 1]![x] = "#0a0706";
    }
  }
}

function inRound(px: number, py: number, x0: number, y0: number, x1: number, y1: number, r: number): boolean {
  const cx = Math.min(Math.max(px, x0 + r), x1 - r);
  const cy = Math.min(Math.max(py, y0 + r), y1 - r);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r + 0.01;
}

function inside(x: number, y: number, pts: readonly Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i]![0];
    const yi = pts[i]![1];
    const xj = pts[j]![0];
    const yj = pts[j]![1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) hit = !hit;
  }
  return hit;
}

function arc(d: Icon, cx: number, cy: number, r: number, a0: number, a1: number, color: string, width: number): void {
  const steps = Math.max(4, Math.ceil(Math.abs(a1 - a0) * r));
  for (let i = 0; i < steps; i++) {
    const t0 = a0 + ((a1 - a0) * i) / steps;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
    d.line(cx + Math.cos(t0) * r, cy + Math.sin(t0) * r, cx + Math.cos(t1) * r, cy + Math.sin(t1) * r, color, width);
  }
}

function flame(d: Icon, x: number, y: number): void {
  d.disc(x, y + 5, 3.2, 4.2, M.flame);
  d.disc(x, y + 3, 2.1, 3.2, mat(M.flame.ink, "#fffef4", "#fff0a0", "#ffc040", "#f08018", "#c05010"));
  d.disc(x, y + 1, 1.1, 1.8, mat(M.flame.ink, "#ffffff", "#fff8d0", "#ffe080", "#ffd060", "#ffb040"));
}

function steam(d: Icon, x: number, y: number): void {
  arc(d, x, y, 4, Math.PI * 0.15, Math.PI * 0.85, M.smoke.hi, 2);
  arc(d, x + 5, y - 6, 3.2, Math.PI * 1.1, Math.PI * 1.8, M.smoke.mid, 2);
}

function note(d: Icon, x: number, y: number, m: Mat): void {
  d.disc(x, y, 2.6, 2, m);
  d.line(x + 2, y - 1, x + 2, y - 12, m.ink, 2);
  d.line(x + 2, y - 12, x + 8, y - 9, m.ink, 2);
}

function heart(d: Icon, x: number, y: number, s: number, m: Mat): void {
  d.disc(x - s * 0.32, y, s * 0.42, s * 0.42, m);
  d.disc(x + s * 0.32, y, s * 0.42, s * 0.42, m);
  d.poly(
    [
      [x - s * 0.72, y + s * 0.1],
      [x + s * 0.72, y + s * 0.1],
      [x, y + s * 1.15],
    ],
    m,
  );
}

function miniShield(d: Icon, x: number, y: number, w: number, h: number, m: Mat): void {
  d.poly(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h * 0.62],
      [x + w / 2, y + h],
      [x, y + h * 0.62],
    ],
    m,
  );
}

function chevrons(d: Icon, x: number, y: number, color: string): void {
  for (let i = 0; i < 3; i++) {
    const yy = y + i * 6;
    d.line(x, yy, x + 5, yy + 3, color, 2);
    d.line(x + 5, yy + 3, x, yy + 6, color, 2);
  }
}

function wire(d: Icon, pts: readonly Pt[], m: Mat, width: number): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    d.line(a[0], a[1], b[0], b[1], m.ink, width + 1.6);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    d.line(a[0], a[1], b[0], b[1], m.mid, width);
    d.line(a[0] - 0.6, a[1] - 0.6, b[0] - 0.6, b[1] - 0.6, m.hi, Math.max(1.2, width * 0.45));
  }
}

function chalk(d: Icon): void {
  d.rod(12, 34, 34, 12, 4.2, M.chalk);
  d.disc(12, 34, 4.4, 4.4, M.chalk);
  d.disc(34, 12, 2.4, 2.4, mat(M.chalk.ink, M.chalk.hi, M.chalk.mid, M.chalk.lo, "#8a8074", "#5a5348"));
  d.px(10, 38, M.chalk.lo);
  d.px(16, 40, M.chalk.mid);
  d.px(36, 16, M.chalk.lo);
  d.px(38, 14, M.chalk.hi);
}

function pamphlet(d: Icon): void {
  d.box(8, 8, 32, 30, M.paper, 2);
  d.line(24, 10, 24, 36, M.paper.deep, 2);
  d.over(10, 14, 10, 2, M.paper.ink);
  d.over(10, 19, 12, 2, M.paper.lo);
  d.over(10, 24, 8, 2, M.paper.ink);
  d.over(27, 14, 10, 2, M.paper.ink);
  d.over(27, 19, 8, 2, M.paper.lo);
  d.over(27, 24, 11, 2, M.paper.ink);
  d.poly(
    [
      [32, 8],
      [40, 12],
      [32, 16],
    ],
    M.paper,
  );
}

function gum(d: Icon): void {
  d.box(8, 16, 30, 16, M.foil, 2);
  d.box(22, 14, 16, 18, M.gum, 2);
  d.over(24, 18, 10, 3, M.gum.hi);
  d.line(18, 18, 18, 30, M.foil.hi, 2);
  d.poly(
    [
      [8, 16],
      [16, 14],
      [16, 32],
      [8, 32],
    ],
    M.foil,
  );
}

function lace(d: Icon): void {
  d.poly(
    [
      [8, 18],
      [16, 12],
      [22, 18],
      [14, 22],
    ],
    M.cloth,
  );
  d.poly(
    [
      [26, 18],
      [34, 12],
      [40, 18],
      [32, 22],
    ],
    M.cloth,
  );
  d.disc(24, 20, 3, 3, M.cloth);
  wire(
    d,
    [
      [16, 24],
      [12, 32],
      [18, 38],
    ],
    M.cloth,
    2.6,
  );
  wire(
    d,
    [
      [32, 24],
      [36, 32],
      [30, 40],
    ],
    M.cloth,
    2.6,
  );
  d.box(14, 36, 6, 4, M.gold, 1);
  d.box(28, 38, 6, 4, M.gold, 1);
}

function pencil(d: Icon): void {
  d.rod(14, 36, 36, 10, 3.6, M.lemon);
  d.rod(14, 36, 18, 31, 3.8, M.steel);
  d.disc(13, 37, 4, 4, M.pink);
  d.rod(32, 15, 38, 8, 2.2, M.wood);
  d.disc(38, 8, 1.6, 1.6, M.black);
  d.line(20, 28, 30, 16, M.lemon.spec, 1.4);
}

function clip(d: Icon): void {
  wire(
    d,
    [
      [20, 10],
      [16, 14],
      [16, 34],
      [22, 40],
      [30, 34],
      [30, 16],
      [26, 12],
      [26, 30],
      [22, 34],
      [20, 20],
    ],
    M.steel,
    2.2,
  );
}

function flare(d: Icon): void {
  d.rod(24, 18, 24, 40, 5, M.red);
  d.box(18, 16, 12, 4, M.steel, 1);
  flame(d, 24, 6);
  d.px(14, 12, M.flame.hi);
  d.px(34, 10, M.flame.mid);
  d.px(36, 16, M.gold.hi);
  d.px(12, 18, M.flame.lo);
}

function smoke(d: Icon): void {
  d.disc(16, 14, 6, 4.5, M.smoke);
  d.disc(28, 12, 7, 5, M.smoke);
  d.disc(22, 8, 4, 3, M.smoke);
  d.rod(24, 20, 24, 40, 6, M.steel);
  d.box(17, 22, 14, 4, M.red, 1);
  d.disc(24, 34, 2, 2, M.black);
}

function juice(d: Icon): void {
  d.box(10, 14, 26, 28, M.juice, 2);
  d.box(14, 20, 18, 14, mat(M.juice.ink, "#fff6e0", "#ffe0a8", "#ffb050", "#e08820", "#a05810"), 1);
  d.rod(30, 16, 36, 8, 1.6, M.cloth);
  d.disc(36, 8, 1.8, 1.8, M.red);
  heart(d, 23, 26, 5, M.red);
}

function espresso(d: Icon): void {
  d.poly(
    [
      [16, 18],
      [32, 18],
      [36, 40],
      [12, 40],
    ],
    M.cloth,
  );
  d.over(14, 24, 20, 8, M.cardb.mid);
  d.disc(24, 16, 10, 3.6, M.cloth);
  d.disc(24, 16, 7, 2.2, M.coffee);
  d.disc(29, 16, 1.5, 1, M.black);
  steam(d, 18, 6);
}

function wipe(d: Icon): void {
  d.box(6, 18, 26, 18, M.cloth, 5);
  d.over(8, 20, 18, 3, M.blue.hi);
  d.disc(32, 26, 9, 8, M.lemon);
  d.poly(
    [
      [30, 18],
      [34, 12],
      [38, 18],
    ],
    M.green,
  );
  d.px(28, 24, M.lemon.spec);
  d.poly(
    [
      [12, 36],
      [16, 36],
      [14, 42],
    ],
    M.blue,
  );
}

function sticker(d: Icon): void {
  d.box(6, 12, 34, 24, M.cloth, 2);
  d.over(8, 14, 30, 4, M.red.mid);
  miniShield(d, 16, 20, 14, 12, M.gold);
  d.poly(
    [
      [30, 12],
      [42, 16],
      [32, 22],
    ],
    M.paper,
  );
  d.line(32, 14, 40, 17, M.paper.hi, 1.5);
}

function socks(d: Icon): void {
  d.box(8, 8, 12, 28, M.cloth, 3);
  d.box(26, 10, 12, 28, M.cloth, 3);
  d.poly(
    [
      [8, 32],
      [20, 32],
      [22, 40],
      [8, 40],
    ],
    M.cloth,
  );
  d.poly(
    [
      [26, 34],
      [38, 34],
      [40, 42],
      [26, 42],
    ],
    M.cloth,
  );
  for (const x of [8, 26]) {
    d.over(x, 14, 12, 3, M.red.mid);
    d.over(x, 20, 12, 3, M.gold.mid);
    d.over(x, 26, 12, 3, M.blue.mid);
  }
}

function cleats(d: Icon): void {
  d.poly(
    [
      [8, 32],
      [42, 28],
      [44, 36],
      [6, 40],
    ],
    M.rubber,
  );
  d.poly(
    [
      [10, 30],
      [14, 18],
      [20, 14],
      [28, 16],
      [36, 20],
      [42, 28],
      [40, 34],
      [12, 34],
    ],
    M.red,
  );
  d.poly(
    [
      [30, 22],
      [42, 28],
      [40, 34],
      [28, 32],
    ],
    M.cloth,
  );
  d.poly(
    [
      [14, 16],
      [24, 15],
      [22, 24],
      [14, 24],
    ],
    M.black,
  );
  d.line(16, 20, 26, 22, M.cloth.spec, 2);
  d.line(16, 24, 28, 26, M.cloth.spec, 2);
  d.line(18, 28, 30, 28, M.cloth.spec, 2);
  for (const x of [12, 20, 28, 36]) {
    d.poly(
      [
        [x, 38],
        [x + 4, 38],
        [x + 2, 44],
      ],
      M.steel,
    );
  }
}

function guards(d: Icon): void {
  d.box(20, 6, 10, 26, M.cloth, 2);
  d.over(20, 10, 10, 3, M.red.mid);
  d.over(20, 16, 10, 3, M.gold.mid);
  d.over(20, 22, 10, 3, M.blue.mid);
  d.poly(
    [
      [16, 30],
      [34, 30],
      [38, 38],
      [14, 40],
    ],
    M.cloth,
  );
  d.poly(
    [
      [12, 8],
      [34, 6],
      [36, 26],
      [14, 30],
    ],
    M.foil,
  );
  d.box(10, 12, 26, 3, M.black, 1);
  d.box(12, 22, 24, 3, M.black, 1);
  d.line(22, 10, 24, 26, M.foil.spec, 2);
}

function parade(d: Icon): void {
  d.poly(
    [
      [16, 6],
      [28, 6],
      [30, 20],
      [40, 26],
      [42, 34],
      [36, 38],
      [12, 38],
      [10, 28],
      [14, 18],
    ],
    M.leather,
  );
  d.poly(
    [
      [10, 36],
      [42, 34],
      [42, 42],
      [10, 42],
    ],
    M.rubber,
  );
  d.poly(
    [
      [32, 28],
      [41, 30],
      [40, 36],
      [30, 34],
    ],
    M.gold,
  );
  d.box(16, 4, 12, 5, M.paper, 1);
  d.disc(22, 14, 2.1, 2.1, M.gold);
  d.disc(22, 21, 2.1, 2.1, M.gold);
  d.disc(22, 28, 2.1, 2.1, M.gold);
  d.line(16, 10, 16, 32, M.leather.hi, 1.5);
}

function quiet(d: Icon): void {
  d.poly(
    [
      [4, 32],
      [44, 30],
      [44, 40],
      [4, 42],
    ],
    M.rubber,
  );
  d.poly(
    [
      [6, 32],
      [8, 18],
      [16, 16],
      [22, 22],
      [34, 18],
      [44, 26],
      [42, 34],
      [8, 36],
    ],
    M.black,
  );
  d.poly(
    [
      [10, 18],
      [18, 16],
      [20, 24],
      [12, 26],
    ],
    mat("#000000", "#32323c", "#18181e", "#0c0c10", "#08080c", "#000000"),
  );
  d.line(24, 22, 38, 26, M.black.hi, 2);
  d.disc(40, 28, 2, 2, M.black);
}

function kicks(d: Icon): void {
  d.poly(
    [
      [8, 28],
      [12, 16],
      [26, 14],
      [38, 20],
      [42, 30],
      [36, 34],
      [10, 36],
    ],
    M.leather,
  );
  d.poly(
    [
      [8, 32],
      [42, 30],
      [44, 40],
      [6, 42],
    ],
    M.gold,
  );
  d.disc(14, 26, 5.5, 5.5, M.steel);
  d.disc(14, 26, 2.2, 2.2, M.black);
  d.line(30, 18, 36, 12, M.gold.hi, 2);
  d.line(34, 22, 42, 16, M.gold.mid, 2);
  d.line(36, 28, 44, 24, M.gold.hi, 2);
  d.rim(GLOW.gold);
}

function text(d: Icon): void {
  d.poly(
    [
      [4, 14],
      [22, 10],
      [22, 38],
      [4, 40],
    ],
    M.paper,
  );
  d.poly(
    [
      [26, 10],
      [44, 14],
      [44, 40],
      [26, 38],
    ],
    M.paper,
  );
  d.rod(24, 8, 24, 40, 2, M.leather);
  d.over(8, 20, 12, 2, M.red.mid);
  d.over(8, 26, 10, 2, M.chalk.hi);
  d.over(30, 20, 10, 2, M.red.mid);
  d.over(30, 26, 12, 2, M.chalk.hi);
  d.px(12, 34, M.chalk.mid);
  d.px(34, 34, M.chalk.lo);
}

function chip(d: Icon): void {
  d.disc(24, 24, 16, 16, M.steel);
  d.disc(24, 24, 10, 10, M.gold);
  d.disc(24, 24, 4, 4, M.black);
  d.line(30, 14, 38, 8, M.steel.ink, 2);
  d.line(34, 18, 40, 16, M.steel.deep, 2);
  d.ring(24, 24, 16, 16, 2.2, M.brass);
}

function dean(d: Icon): void {
  d.box(10, 14, 28, 22, M.paper, 1);
  d.disc(10, 24, 6, 8, M.paper);
  d.disc(38, 24, 6, 8, M.paper);
  d.over(16, 18, 16, 2, M.gold.mid);
  d.over(16, 23, 12, 2, M.paper.ink);
  d.over(16, 28, 14, 2, M.paper.lo);
  d.disc(24, 30, 5, 5, M.gold);
  d.poly(
    [
      [24, 26],
      [26, 30],
      [24, 34],
      [22, 30],
    ],
    M.red,
  );
  d.poly(
    [
      [20, 36],
      [24, 34],
      [22, 42],
    ],
    M.red,
  );
  d.poly(
    [
      [28, 36],
      [24, 34],
      [26, 42],
    ],
    M.red,
  );
}

function horn(d: Icon): void {
  d.poly(
    [
      [6, 18],
      [18, 14],
      [36, 8],
      [40, 14],
      [40, 30],
      [36, 36],
      [18, 30],
      [6, 26],
    ],
    M.red,
  );
  d.box(4, 16, 8, 12, M.black, 2);
  d.line(22, 16, 34, 14, M.steel.hi, 2);
  d.line(22, 22, 36, 22, M.steel.mid, 2);
  d.line(22, 28, 34, 30, M.steel.hi, 2);
  d.ring(38, 22, 6, 8, 2, M.gold);
}

function rant(d: Icon): void {
  d.box(8, 16, 22, 16, M.paper, 1);
  d.box(14, 12, 22, 16, M.paper, 1);
  d.box(18, 8, 22, 18, M.pink, 1);
  d.over(22, 12, 14, 2, M.pink.ink);
  d.over(22, 16, 10, 2, M.paper.ink);
  d.rod(12, 22, 36, 18, 1.8, M.black);
}

function crown(d: Icon): void {
  d.poly(
    [
      [6, 28],
      [10, 12],
      [14, 22],
      [18, 8],
      [24, 20],
      [30, 8],
      [34, 22],
      [38, 12],
      [42, 28],
      [38, 36],
      [10, 36],
    ],
    M.gold,
  );
  d.over(10, 30, 28, 5, M.red.mid);
  d.box(8, 34, 32, 4, M.cardb, 1);
  d.disc(18, 16, 2.4, 2.4, M.red);
  d.disc(24, 14, 2.6, 2.6, M.blue);
  d.disc(30, 16, 2.4, 2.4, M.red);
  d.line(14, 26, 34, 26, M.gold.spec, 1.4);
  d.rim(GLOW.gold);
}

function meal(d: Icon): void {
  d.box(4, 14, 40, 24, M.steel, 2);
  d.box(8, 18, 14, 16, M.cardb, 1);
  d.disc(15, 26, 5, 4, M.wood);
  d.disc(15, 24, 4, 2.2, M.green);
  d.box(26, 18, 14, 8, M.juice, 1);
  d.box(26, 28, 14, 6, M.gum, 1);
  d.disc(12, 18, 2.2, 2.2, M.red);
}

function coat(d: Icon): void {
  d.poly(
    [
      [16, 8],
      [32, 8],
      [36, 16],
      [40, 40],
      [8, 40],
      [12, 16],
    ],
    M.cloth,
  );
  d.poly(
    [
      [20, 10],
      [24, 28],
      [18, 28],
    ],
    M.blue,
  );
  d.poly(
    [
      [28, 10],
      [30, 28],
      [24, 28],
    ],
    M.cloth,
  );
  d.disc(24, 14, 1.6, 1.6, M.gold);
  d.disc(24, 20, 1.6, 1.6, M.gold);
  d.disc(24, 26, 1.6, 1.6, M.gold);
  d.box(14, 30, 8, 6, M.cloth, 1);
  d.line(16, 12, 12, 38, M.cloth.hi, 1.6);
}

function plate(d: Icon): void {
  d.box(6, 8, 36, 32, M.steel, 2);
  d.line(24, 12, 24, 36, M.steel.hi, 3);
  d.disc(12, 14, 2.2, 2.2, M.brass);
  d.disc(36, 14, 2.2, 2.2, M.brass);
  d.disc(12, 34, 2.2, 2.2, M.brass);
  d.disc(36, 34, 2.2, 2.2, M.brass);
  d.box(16, 20, 16, 10, M.cloth, 1);
}

function vest(d: Icon): void {
  d.poly(
    [
      [16, 8],
      [32, 8],
      [38, 16],
      [36, 42],
      [12, 42],
      [10, 16],
    ],
    M.orange,
  );
  d.eraseDisc(24, 10, 6, 4);
  d.line(16, 18, 32, 36, M.foil.hi, 3);
  d.line(32, 18, 16, 36, M.foil.hi, 3);
  d.box(20, 8, 8, 4, M.orange, 1);
}

function aegis(d: Icon): void {
  miniShield(d, 8, 6, 32, 36, M.steel);
  d.line(24, 12, 24, 34, M.cloth.hi, 2);
  d.line(14, 22, 34, 22, M.cloth.hi, 2);
  d.line(16, 14, 16, 18, M.steel.ink, 2);
  d.line(32, 14, 32, 18, M.steel.ink, 2);
  d.line(18, 30, 18, 36, M.steel.ink, 2);
  d.disc(16, 14, 1.5, 1.5, M.gold);
  d.disc(32, 16, 1.5, 1.5, M.gold);
  d.disc(24, 22, 3, 3, M.gold);
  d.rim(GLOW.gold);
}

function hourglass(d: Icon): void {
  d.box(10, 6, 28, 5, M.wood, 1);
  d.box(10, 36, 28, 5, M.wood, 1);
  d.disc(24, 18, 10, 8, M.glass);
  d.disc(24, 30, 10, 8, M.glass);
  d.rod(24, 20, 24, 28, 2, M.glass);
  d.disc(24, 33, 6, 4, M.gum);
  d.rod(24, 24, 24, 30, 1.3, M.gum);
  d.box(14, 20, 20, 4, M.paper, 1);
  miniShield(d, 20, 19, 8, 7, M.steel);
  d.rim(GLOW.blue);
}

function hoodie(d: Icon): void {
  d.poly(
    [
      [2, 24],
      [12, 18],
      [14, 36],
      [4, 40],
    ],
    M.black,
  );
  d.poly(
    [
      [46, 24],
      [36, 18],
      [34, 36],
      [44, 40],
    ],
    M.black,
  );
  d.box(12, 20, 24, 22, M.black, 3);
  d.poly(
    [
      [14, 22],
      [16, 10],
      [24, 6],
      [32, 10],
      [34, 22],
    ],
    M.black,
  );
  d.poly(
    [
      [18, 14],
      [30, 14],
      [28, 24],
      [20, 24],
    ],
    mat("#3a2418", "#f0d2b4", "#d8b090", "#a88068", "#6a5040", "#3a2418"),
  );
  d.box(16, 30, 16, 8, M.black, 2);
  d.line(16, 30, 32, 30, M.black.hi, 2);
  d.line(20, 16, 18, 28, M.pink.mid, 2);
  d.line(28, 16, 30, 28, M.pink.mid, 2);
  d.disc(18, 29, 1.4, 1.4, M.gold);
  d.disc(30, 29, 1.4, 1.4, M.gold);
}

function bandage(d: Icon): void {
  d.poly(
    [
      [8, 30],
      [20, 18],
      [34, 22],
      [42, 16],
      [44, 22],
      [32, 30],
      [18, 26],
      [10, 36],
    ],
    M.cloth,
  );
  d.disc(16, 28, 8, 10, M.cloth);
  d.line(12, 24, 20, 32, M.cloth.deep, 2);
  d.line(12, 28, 20, 28, M.red.mid, 2.4);
  d.line(16, 24, 16, 32, M.red.mid, 2.4);
  d.box(38, 14, 5, 6, M.steel, 1);
}

function bead(d: Icon): void {
  arc(d, 24, 28, 16, Math.PI * 1.15, Math.PI * 1.85, M.wood.mid, 2.4);
  d.disc(24, 30, 9, 9, M.pink);
  d.disc(24, 30, 3.4, 3.4, M.blue);
  d.px(21, 27, M.pink.spec);
  arc(d, 38, 22, 6, -0.5, 0.9, M.blue.hi, 1.8);
  arc(d, 40, 28, 5, -0.3, 1, M.blue.mid, 1.6);
}

function pom(d: Icon): void {
  d.rod(16, 40, 16, 22, 2, M.wood);
  d.rod(32, 40, 32, 22, 2, M.wood);
  d.disc(16, 16, 8, 8, M.red);
  d.disc(12, 14, 4, 4, M.red);
  d.disc(20, 18, 4, 4, M.gold);
  d.disc(32, 16, 8, 8, M.gold);
  d.disc(28, 14, 4, 4, M.gold);
  d.disc(36, 18, 4, 4, M.red);
}

function care(d: Icon): void {
  d.box(8, 16, 32, 24, M.cardb, 2);
  d.line(8, 16, 24, 28, M.red.mid, 2);
  d.line(40, 16, 24, 28, M.red.mid, 2);
  d.line(24, 16, 24, 40, M.red.mid, 2);
  d.disc(34, 14, 6, 6, M.red);
  d.box(12, 12, 8, 8, M.cloth, 1);
  heart(d, 24, 30, 4, M.red);
}

function buddy(d: Icon): void {
  d.rod(12, 8, 12, 42, 2.2, M.wood);
  d.poly(
    [
      [14, 8],
      [40, 12],
      [36, 22],
      [40, 30],
      [14, 28],
    ],
    M.pink,
  );
  d.over(16, 14, 18, 4, M.black.mid);
  d.disc(28, 20, 3.2, 3.2, M.green);
  d.box(14, 24, 8, 4, M.cloth, 1);
  d.rim(GLOW.pink);
}

function choir(d: Icon): void {
  d.box(10, 8, 28, 32, M.paper, 2);
  note(d, 18, 28, M.blue);
  note(d, 28, 32, M.gold);
  d.over(14, 12, 20, 3, M.blue.mid);
}

function compass(d: Icon): void {
  d.disc(24, 24, 16, 16, M.brass);
  d.disc(24, 24, 12, 12, M.paper);
  d.ring(24, 24, 16, 16, 3, M.brass);
  d.poly(
    [
      [24, 10],
      [27, 24],
      [24, 22],
      [21, 24],
    ],
    M.red,
  );
  d.poly(
    [
      [24, 38],
      [21, 24],
      [24, 26],
      [27, 24],
    ],
    M.steel,
  );
  d.disc(24, 24, 2.2, 2.2, M.gold);
  d.px(24, 12, M.gold.hi);
  d.px(36, 24, M.gold.mid);
  d.px(12, 24, M.gold.mid);
  d.px(24, 36, M.gold.lo);
}

function lantern(d: Icon): void {
  arc(d, 24, 10, 8, Math.PI * 1.05, Math.PI * 1.95, M.brass.mid, 2.4);
  d.box(16, 12, 16, 4, M.brass, 1);
  d.box(14, 16, 20, 20, M.brass, 2);
  d.box(18, 20, 12, 12, mat("#6a4010", "#fff6c8", "#ffd060", "#f0a028", "#c07018", "#7a4010"), 1);
  d.box(14, 36, 20, 4, M.brass, 1);
  d.line(20, 22, 20, 30, M.gold.spec, 1.4);
  d.rim(GLOW.gold);
}

function map(d: Icon): void {
  d.box(6, 10, 36, 28, M.paper, 2);
  d.line(18, 10, 18, 38, M.paper.deep, 2);
  d.line(10, 30, 16, 22, M.green.mid, 2);
  d.line(16, 22, 28, 26, M.blue.mid, 2);
  d.line(28, 26, 36, 16, M.red.mid, 2);
  d.disc(36, 16, 2.4, 2.4, M.red);
  d.ring(14, 18, 4, 4, 1.4, M.brass);
  d.line(14, 15, 16, 20, M.red.mid, 1.4);
}

function whistle(d: Icon): void {
  d.rod(16, 26, 30, 26, 6, M.brass);
  d.poly(
    [
      [28, 22],
      [42, 20],
      [42, 30],
      [30, 32],
    ],
    M.brass,
  );
  d.disc(20, 26, 2.4, 2.4, M.black);
  d.ring(10, 18, 5, 5, 2, M.gold);
  d.line(34, 16, 42, 10, M.gold.hi, 2);
  d.line(36, 20, 44, 16, M.gold.mid, 2);
}

function banner(d: Icon): void {
  d.rod(10, 6, 10, 44, 2.2, M.wood);
  d.poly(
    [
      [12, 8],
      [40, 8],
      [36, 18],
      [40, 28],
      [12, 28],
    ],
    M.red,
  );
  chevrons(d, 20, 10, M.gold.hi);
  d.line(16, 22, 28, 22, M.chalk.hi, 2);
  d.rim(GLOW.red);
}

function walkie(d: Icon): void {
  d.box(14, 12, 20, 30, M.plastic, 3);
  d.rod(24, 12, 24, 4, 1.6, M.steel);
  d.disc(24, 4, 2.2, 2.2, M.steel);
  d.box(18, 16, 12, 8, M.black, 1);
  d.over(20, 18, 8, 2, M.green.hi);
  d.disc(24, 30, 2.4, 2.4, M.red);
  d.disc(18, 36, 1.4, 1.4, M.steel);
  d.disc(24, 36, 1.4, 1.4, M.steel);
  d.disc(30, 36, 1.4, 1.4, M.steel);
  arc(d, 36, 14, 5, -0.6, 0.8, M.green.hi, 1.5);
}

function card(d: Icon): void {
  d.box(10, 8, 28, 32, M.paper, 2);
  d.over(12, 10, 24, 4, M.blue.mid);
  d.over(14, 18, 20, 2, M.paper.ink);
  d.over(14, 23, 16, 2, M.paper.lo);
  d.over(14, 28, 18, 2, M.paper.ink);
  d.disc(32, 34, 2.2, 2.2, M.gold);
}

function thesis(d: Icon): void {
  d.box(8, 18, 26, 20, M.paper, 1);
  d.box(12, 14, 26, 20, M.paper, 1);
  d.box(16, 10, 26, 22, M.paper, 1);
  d.poly(
    [
      [34, 10],
      [42, 14],
      [34, 18],
    ],
    M.paper,
  );
  d.over(20, 16, 16, 2, M.paper.ink);
  d.over(20, 21, 12, 2, M.blue.lo);
  wire(
    d,
    [
      [14, 12],
      [12, 16],
      [14, 22],
    ],
    M.steel,
    1.6,
  );
}

function candle(d: Icon): void {
  d.rod(24, 20, 24, 40, 6, M.paper);
  d.line(20, 28, 22, 34, M.paper.deep, 2);
  flame(d, 24, 8);
  d.disc(24, 20, 2.4, 1.4, M.black);
  d.box(16, 38, 16, 4, M.brass, 1);
}

function chant(d: Icon): void {
  d.box(6, 10, 30, 28, M.paper, 2);
  note(d, 14, 30, M.pink);
  note(d, 24, 32, M.black);
  arc(d, 30, 18, 8, -0.8, 0.6, M.pink.mid, 2);
  wire(
    d,
    [
      [34, 12],
      [38, 16],
      [36, 24],
    ],
    M.steel,
    1.6,
  );
}

function orb(d: Icon): void {
  d.poly(
    [
      [14, 36],
      [34, 36],
      [38, 42],
      [10, 42],
    ],
    M.brass,
  );
  d.rod(24, 34, 24, 40, 3, M.brass);
  d.disc(24, 20, 14, 14, M.glass);
  d.disc(27, 22, 5, 5, mat("#5a4018", "#fff8d8", "#ffe090", "#f0b848", "#c08028", "#6a4818"));
  d.rim(GLOW.blue);
}

function prism(d: Icon): void {
  d.poly(
    [
      [8, 36],
      [24, 8],
      [40, 36],
    ],
    M.glass,
  );
  d.line(40, 16, 46, 12, M.red.mid, 2);
  d.line(40, 22, 46, 22, M.gold.mid, 2);
  d.line(40, 28, 46, 32, M.blue.mid, 2);
  flame(d, 10, 6);
  d.rim(GLOW.violet);
}

function metro(d: Icon): void {
  d.poly(
    [
      [24, 4],
      [42, 38],
      [6, 38],
    ],
    M.wood,
  );
  d.poly(
    [
      [24, 12],
      [34, 34],
      [14, 34],
    ],
    M.paper,
  );
  d.line(24, 16, 24, 22, M.paper.ink, 1.6);
  d.line(20, 24, 28, 24, M.paper.ink, 1.4);
  d.line(18, 30, 30, 30, M.paper.ink, 1.4);
  d.rod(24, 10, 34, 30, 1.8, M.steel);
  d.disc(34, 30, 3.2, 3.2, M.gold);
  d.box(12, 38, 24, 4, M.gold, 1);
}

function pen(d: Icon): void {
  d.rod(12, 38, 36, 10, 3.2, M.red);
  d.rod(12, 38, 16, 33, 3.4, M.gold);
  d.rod(32, 14, 40, 6, 2.2, M.steel);
  d.disc(40, 6, 1.5, 1.5, M.black);
  d.line(18, 30, 28, 18, M.red.spec, 1.4);
  d.px(14, 34, M.gold.hi);
}

function tray(d: Icon): void {
  d.box(4, 12, 40, 26, M.steel, 3);
  d.box(8, 16, 14, 10, M.juice, 1);
  d.box(26, 16, 14, 10, M.gum, 1);
  d.box(8, 28, 32, 6, M.green, 1);
  d.disc(8, 10, 2.2, 2.6, M.blue);
  d.disc(40, 8, 2.4, 2.8, M.blue);
  d.disc(44, 18, 1.8, 2.2, M.blue);
  d.px(6, 8, M.blue.mid);
}

function ulock(d: Icon): void {
  d.rod(16, 22, 16, 10, 3.4, M.steel);
  d.rod(32, 22, 32, 10, 3.4, M.steel);
  d.rod(16, 10, 32, 10, 3.4, M.steel);
  d.box(10, 20, 28, 18, M.black, 2);
  d.disc(24, 28, 3, 3, M.gold);
  d.line(18, 24, 30, 24, M.steel.hi, 2);
}

function sticks(d: Icon): void {
  d.rod(10, 40, 30, 8, 2.6, M.wood);
  d.rod(16, 8, 40, 40, 2.6, M.wood);
  d.rod(26, 14, 32, 8, 2.8, M.red);
  d.disc(30, 8, 2.2, 2.2, M.gold);
  d.line(14, 34, 18, 28, M.wood.hi, 1.4);
}

function chain(d: Icon): void {
  d.box(4, 6, 14, 10, M.steel, 1);
  d.line(8, 8, 14, 12, M.steel.ink, 2);
  const pts: Pt[] = [
    [14, 14],
    [20, 20],
    [18, 28],
    [26, 32],
    [34, 28],
    [40, 36],
  ];
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i]!;
    d.ring(x, y, 5.5, 3.6, 2.2, i === 2 ? M.red : M.steel);
  }
  d.disc(44, 40, 2.2, 2.4, M.gold);
  d.disc(46, 32, 1.6, 2, M.blue);
}

function slam(d: Icon): void {
  d.poly(
    [
      [14, 18],
      [30, 18],
      [34, 42],
      [10, 42],
    ],
    M.wood,
  );
  d.poly(
    [
      [8, 14],
      [36, 8],
      [38, 16],
      [12, 22],
    ],
    M.wood,
  );
  d.box(16, 10, 14, 6, M.paper, 1);
  d.line(18, 13, 28, 13, M.red.mid, 1.6);
  d.box(30, 10, 8, 8, M.steel, 1);
  d.line(38, 6, 46, 2, M.gold.hi, 2);
  d.line(40, 12, 48, 10, M.gold.mid, 2);
  d.line(36, 18, 44, 20, M.gold.hi, 2);
}

function jar(d: Icon): void {
  d.box(16, 8, 16, 5, M.steel, 1);
  d.rod(24, 14, 24, 38, 8, M.glass);
  d.disc(24, 30, 6.5, 5, M.slime);
  d.rod(24, 34, 24, 40, 1.6, M.slime);
  d.disc(28, 42, 2.4, 2, M.slime);
  d.line(20, 18, 20, 32, M.glass.spec, 1.5);
}

function stamp(d: Icon): void {
  d.rod(24, 6, 24, 18, 3.2, M.wood);
  d.box(12, 18, 24, 8, M.red, 2);
  d.box(10, 26, 28, 6, M.black, 1);
  d.disc(24, 38, 8, 5, M.wax);
  d.poly(
    [
      [24, 34],
      [27, 38],
      [24, 42],
      [21, 38],
    ],
    M.gold,
  );
  d.rim(GLOW.red);
}

function seal(d: Icon): void {
  d.disc(24, 26, 14, 12, M.wax);
  d.disc(16, 22, 6, 5, M.wax);
  d.disc(32, 30, 5, 4, M.wax);
  d.ring(24, 26, 7, 6, 2, M.gold);
  d.disc(24, 26, 2.2, 2.2, M.gold);
}

function relic(d: Icon): void {
  d.poly(
    [
      [8, 32],
      [40, 32],
      [44, 42],
      [4, 42],
    ],
    M.stone,
  );
  d.box(14, 26, 20, 8, M.stone, 1);
  d.disc(24, 16, 10, 9, M.wax);
  d.ring(24, 16, 5, 4.5, 1.6, M.gold);
  d.rim(GLOW.red);
}

function filibuster(d: Icon): void {
  d.box(4, 10, 36, 14, M.wood, 2);
  d.box(4, 10, 7, 14, M.gold, 1);
  d.box(33, 10, 7, 14, M.gold, 1);
  d.box(18, 12, 6, 10, M.gold, 1);
  d.rod(22, 24, 22, 44, 3.2, M.wood);
  d.rod(22, 24, 22, 30, 3.5, M.gold);
  d.disc(16, 16, 2.2, 2.2, M.red);
  d.line(40, 12, 46, 8, M.gold.hi, 2);
  d.line(42, 18, 48, 18, M.gold.mid, 2);
  d.rim(GLOW.gold);
}

function consensus(d: Icon): void {
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const x = 24 + Math.cos(a) * 14;
    const y = 24 + Math.sin(a) * 14;
    d.disc(x, y - 4, 3.2, 3.2, M.paper);
    d.box(x - 3.5, y - 1, 7, 8, i % 2 ? M.black : M.pink, 1);
  }
  d.ring(24, 24, 8, 8, 2, M.green);
  d.disc(24, 24, 3, 3, M.gold);
  d.rim(GLOW.pink);
}

function mug(d: Icon): void {
  d.poly(
    [
      [10, 14],
      [32, 14],
      [34, 40],
      [8, 40],
    ],
    M.ceramic,
  );
  d.disc(21, 14, 11, 3.2, M.coffee);
  arc(d, 32, 26, 8, -1.1, 1.1, M.ceramic.mid, 3.2);
  arc(d, 32, 26, 8, -1.1, 1.1, M.ceramic.hi, 1.4);
  d.eraseDisc(14, 16, 2.2, 1.6);
  d.line(12, 16, 16, 20, M.ceramic.deep, 1.6);
  miniShield(d, 16, 22, 10, 10, M.steel);
  steam(d, 16, 8);
  d.over(12, 36, 18, 3, M.gold.mid);
  d.rim(GLOW.gold);
}

function syllabus(d: Icon): void {
  d.box(10, 8, 28, 34, M.navy, 2);
  d.box(14, 12, 20, 26, M.paper, 1);
  d.over(16, 16, 16, 2, M.violet.mid);
  d.over(16, 21, 12, 2, M.paper.ink);
  d.over(16, 26, 14, 2, M.gold.mid);
  d.poly(
    [
      [34, 8],
      [40, 14],
      [34, 22],
    ],
    M.red,
  );
  d.eraseDisc(12, 36, 4, 3);
  d.px(10, 34, M.cloth.hi);
  d.px(14, 38, M.cloth.hi);
  d.disc(30, 18, 3, 3, M.glass);
  d.rim(GLOW.violet);
}

function podium(d: Icon): void {
  d.poly(
    [
      [12, 20],
      [36, 20],
      [42, 42],
      [6, 42],
    ],
    M.wood,
  );
  d.box(10, 16, 28, 6, M.red, 1);
  d.poly(
    [
      [16, 16],
      [22, 8],
      [40, 10],
      [36, 18],
      [18, 18],
    ],
    M.red,
  );
  d.disc(36, 13, 3.2, 3.2, M.black);
  d.ring(36, 13, 3.2, 3.2, 1.3, M.gold);
  d.over(14, 28, 18, 4, M.gold.mid);
  d.line(28, 4, 34, 2, M.gold.hi, 2);
  d.rim(GLOW.red);
}

function zine(d: Icon): void {
  d.poly(
    [
      [8, 34],
      [14, 12],
      [24, 14],
      [18, 38],
    ],
    M.paper,
  );
  d.poly(
    [
      [14, 36],
      [22, 8],
      [34, 12],
      [26, 40],
    ],
    M.paper,
  );
  d.poly(
    [
      [20, 34],
      [30, 10],
      [42, 16],
      [32, 40],
    ],
    M.pink,
  );
  d.over(30, 16, 8, 8, M.black.mid);
  note(d, 32, 30, M.black);
  d.line(16, 16, 16, 32, M.steel.hi, 2);
  d.line(14, 22, 20, 22, M.steel.mid, 2);
  d.rim(GLOW.pink);
}

const PAINTERS: Record<string, (g: Icon) => void> = {
  chalk,
  pamphlet,
  gum,
  lace,
  pencil,
  clip,
  flare,
  smoke,
  juice,
  espresso,
  wipe,
  sticker,
  socks,
  cleats,
  guards,
  parade,
  quiet,
  kicks,
  text,
  chip,
  dean,
  horn,
  rant,
  crown,
  meal,
  coat,
  plate,
  vest,
  aegis,
  hourglass,
  hoodie,
  bandage,
  bead,
  pom,
  care,
  buddy,
  choir,
  compass,
  lantern,
  map,
  whistle,
  banner,
  walkie,
  card,
  thesis,
  candle,
  chant,
  orb,
  prism,
  metro,
  pen,
  tray,
  ulock,
  sticks,
  chain,
  slam,
  jar,
  stamp,
  seal,
  relic,
  filibuster,
  consensus,
  mug,
  syllabus,
  podium,
  zine,
};

function render(id: string): Icon {
  const paint = PAINTERS[id];
  if (!paint) throw new Error(`missing gift thumb: ${id}`);
  const icon = new Icon();
  paint(icon);
  icon.align();
  icon.applyRim();
  icon.contact();
  return icon;
}

export function thumbPainterIds(): string[] {
  return Object.keys(PAINTERS);
}

/** The painter function for this item id. Each id has its own function. */
export function thumbPainterFn(id: string): ((g: Icon) => void) | undefined {
  return PAINTERS[id];
}

export function thumbRgba(id: string, bg = "#24180f"): Uint8ClampedArray {
  const icon = render(id);
  const [br, bgc, bb] = hexRgb(bg);
  const out = new Uint8ClampedArray(N * N * 4);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const c = icon.buf[y]![x];
      const [r, g, b] = c ? hexRgb(c) : [br, bgc, bb];
      const i = (y * N + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
    }
  }
  return out;
}

export function thumbGrid(painterId: string): string[] {
  const rgba = thumbRgba(painterId);
  const rows: string[] = [];
  for (let y = 0; y < N; y++) {
    let row = "";
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      row += rgba[i]!.toString(16).padStart(2, "0");
      row += rgba[i + 1]!.toString(16).padStart(2, "0");
      row += rgba[i + 2]!.toString(16).padStart(2, "0");
    }
    rows.push(row);
  }
  return rows;
}

function hexRgb(c: string): [number, number, number] {
  const h = c.startsWith("#") ? c.slice(1) : c;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
