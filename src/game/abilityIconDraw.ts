/**
 * Pixel stamps for ability icons. Light from the top-left, ink on the shadow edge.
 * Scenes live in abilityIcons.ts. This file only draws.
 */

export const ABILITY_N = 64;

const N = ABILITY_N;

export type MatName =
  | "red"
  | "gold"
  | "green"
  | "blue"
  | "teal"
  | "pink"
  | "orange"
  | "violet"
  | "steel"
  | "black"
  | "wood"
  | "paper"
  | "leather"
  | "navy"
  | "cream"
  | "olive"
  | "tan"
  | "ice"
  | "flame"
  | "white";

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

export const MATS: Record<MatName, Mat> = {
  red: mat("#3a0c10", "#ffd0c8", "#ff7a72", "#d42028", "#8c1418", "#4c080c"),
  gold: mat("#4a300c", "#fff6c8", "#ffe08a", "#f0c14a", "#b88820", "#6a4c10"),
  green: mat("#102818", "#e8ffd0", "#b0e080", "#3e9a48", "#1f6a30", "#0e3418"),
  blue: mat("#101828", "#e8f2ff", "#b0c8ee", "#3d6ea6", "#244878", "#101828"),
  teal: mat("#083038", "#d8fff8", "#80e0d0", "#2aa198", "#146860", "#082820"),
  pink: mat("#4a1830", "#ffe8f0", "#ff9ec4", "#e05090", "#a02860", "#4a1830"),
  orange: mat("#4a2208", "#ffe4c0", "#ffc080", "#e07020", "#a04410", "#4a2208"),
  violet: mat("#241448", "#f0e4ff", "#c8b0f0", "#7050b0", "#402878", "#1c1038"),
  steel: mat("#1a2026", "#ffffff", "#e4eaf0", "#b0bac4", "#6a7580", "#343c44"),
  black: mat("#08080c", "#c8c8d2", "#6a6a76", "#2c2c34", "#16161c", "#08080c"),
  wood: mat("#3a2410", "#ffe0b8", "#e8c090", "#b07840", "#6a4020", "#3a2410"),
  paper: mat("#3a2814", "#fffef8", "#fff4e4", "#f0d8b4", "#c4a078", "#7a5a38"),
  leather: mat("#30080c", "#ffb0a4", "#c04840", "#8a2018", "#50100c", "#280808"),
  navy: mat("#10101c", "#d0d4ee", "#8890c0", "#2a3878", "#161e40", "#0c1020"),
  cream: mat("#4a4030", "#fffef8", "#fff6e4", "#f0e2c8", "#c8b498", "#7a6a50"),
  olive: mat("#1c2410", "#e4f0c8", "#a8c070", "#5c7a3a", "#3a4e22", "#1c2410"),
  tan: mat("#3a2c1c", "#fff0dc", "#f0d0a8", "#c4a078", "#8a6848", "#4a3424"),
  ice: mat("#103040", "#ffffff", "#e4fbff", "#b8e8f4", "#78c0d8", "#3a7898"),
  flame: mat("#6a2808", "#fffef0", "#ffe080", "#ffb020", "#e05810", "#8a2808"),
  white: mat("#3a3834", "#ffffff", "#f7f4ee", "#e4e0d8", "#b8b4ac", "#6e6a64"),
};

type Pt = readonly [number, number];

export class Icon {
  buf: (string | null)[][];

  constructor() {
    this.buf = Array.from({ length: N }, () => Array.from({ length: N }, () => null));
  }

  px(x: number, y: number, color: string): void {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 2 || yi < 2 || xi >= N - 2 || yi >= N - 2) return;
    this.buf[yi]![xi] = color;
  }

  get(x: number, y: number): string | null {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= N || yi >= N) return null;
    return this.buf[yi]![xi];
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
      if (Math.min(rx, ry) > 5) {
        const sx = Math.round(cx + (cx - gx) * 0.85);
        const sy = Math.round(cy + (cy - gy) * 0.85);
        if (this.get(sx, sy)) this.px(sx, sy, m.ink);
      }
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
        const u = (qx - x0) / Math.max(1, w);
        const v = (qy - y0) / Math.max(1, h);
        const light = (1 - u) * 0.58 + (1 - v) * 0.42;
        let col = light > 0.62 ? m.hi : light > 0.4 ? m.mid : light > 0.22 ? m.lo : m.deep;
        if ((right || bot) && !(left && top)) col = m.ink;
        else if (left || top) col = light > 0.45 ? m.spec : m.hi;
        this.px(px, py, col);
      }
    }
  }

  poly(pts: readonly Pt[], m: Mat): void {
    if (pts.length < 3) return;
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

  over(x: number, y: number, w: number, h: number, color: string): void {
    for (let py = Math.floor(y); py < y + h; py++) {
      for (let px = Math.floor(x); px < x + w; px++) {
        if (this.get(px, py)) this.px(px, py, color);
      }
    }
  }

  /** Nearest-neighbor scale so a small scene still fills the icon. */
  fit(pad = 7): void {
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
    if (maxX < 0) return;
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const dest = N - pad * 2;
    const scale = Math.min(dest / bw, dest / bh);
    const dw = Math.max(1, Math.round(bw * scale));
    const dh = Math.max(1, Math.round(bh * scale));
    const ox = Math.round((N - dw) / 2);
    const oy = Math.round((N - dh) / 2);
    const next: (string | null)[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => null));
    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const sx = minX + Math.min(bw - 1, Math.floor(x / scale));
        const sy = minY + Math.min(bh - 1, Math.floor(y / scale));
        const color = this.buf[sy]![sx];
        if (color) next[oy + y]![ox + x] = color;
      }
    }
    this.buf = next;
  }

  /**
   * Beveled metal rim in the margin around the picture.
   * Ultimates get a heavier gold lip and extra studs. The picture size stays.
   */
  frame(slot: "P" | "Q" | "W" | "E" | "R"): void {
    const ult = slot === "R";
    const passive = slot === "P";
    const hi = ult ? "#ffe7a8" : passive ? "#8e8880" : "#d4cdc4";
    const mid = ult ? "#e2b84a" : passive ? "#5a544c" : "#8a847c";
    const lo = ult ? "#5c4818" : passive ? "#2a2622" : "#2c2824";
    const lip = ult ? "#3a2c10" : passive ? "#1a1614" : "#1c1814";
    const catchC = ult ? "#f0d78a" : passive ? "#4a443c" : "#5c564e";
    const studHi = ult ? "#fff6d0" : passive ? "#9a948c" : "#f4f0e8";
    const studLo = ult ? "#6a5420" : passive ? "#3a342c" : "#3a342e";
    for (let i = 0; i < N; i++) {
      this.buf[0]![i] = hi;
      this.buf[N - 1]![i] = lo;
      this.buf[i]![0] = hi;
      this.buf[i]![N - 1] = lo;
    }
    for (let i = 1; i < N - 1; i++) {
      const corner = i < 3 || i > N - 4;
      this.buf[1]![i] = corner ? hi : mid;
      this.buf[N - 2]![i] = lo;
      this.buf[i]![1] = corner ? hi : mid;
      this.buf[i]![N - 2] = lo;
    }
    for (let i = 2; i < N - 2; i++) {
      this.buf[2]![i] = ult ? "#8a6a28" : lo;
      this.buf[i]![2] = ult ? "#8a6a28" : lo;
      this.buf[N - 3]![i] = ult ? "#6a5420" : lo;
      this.buf[i]![N - 3] = ult ? "#6a5420" : lo;
    }
    for (let i = 3; i < N - 3; i++) {
      this.buf[3]![i] = lip;
      this.buf[i]![3] = lip;
      this.buf[N - 4]![i] = catchC;
      this.buf[i]![N - 4] = catchC;
    }
    const stud = (x: number, y: number) => {
      this.buf[y]![x] = studHi;
      this.buf[y]![x + 1] = studLo;
      this.buf[y + 1]![x] = studLo;
      this.buf[y + 1]![x + 1] = studLo;
    };
    stud(2, 2);
    stud(N - 4, 2);
    stud(2, N - 4);
    stud(N - 4, N - 4);
    if (!ult) return;
    stud(28, 2);
    stud(2, 28);
    stud(N - 4, 28);
    stud(28, N - 4);
    for (let i = 4; i < 12; i++) {
      this.buf[2]![i] = "#ffe7a8";
      this.buf[2]![N - 1 - i] = "#ffe7a8";
      this.buf[i]![2] = "#ffe7a8";
      this.buf[N - 1 - i]![2] = "#ffe7a8";
    }
  }

  /** Hard local contrast so the picture reads at HUD size. No blur. */
  etch(): void {
    const src = this.buf;
    const next: (string | null)[][] = Array.from({ length: N }, (_, y) => src[y]!.slice());
    for (let y = 1; y < N - 1; y++) {
      for (let x = 1; x < N - 1; x++) {
        const c = src[y]![x];
        if (!c) continue;
        let sum = 0;
        let n = 0;
        for (let yy = -1; yy <= 1; yy++) {
          for (let xx = -1; xx <= 1; xx++) {
            if (xx === 0 && yy === 0) continue;
            const o = src[y + yy]![x + xx];
            if (!o) continue;
            sum += lumHex(o);
            n++;
          }
        }
        if (n < 3) continue;
        const [r, g, b] = hexOf(c);
        const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const d = L - sum / n;
        if (Math.abs(d) < 12) continue;
        const gain = d > 0 ? 1.1 : 0.88;
        next[y]![x] = rgbHex(r * gain, g * gain, b * gain);
      }
    }
    this.buf = next;
  }

  /** Push existing paints apart. Hard steps, same hue, no blur. */
  punch(): void {
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const c = this.buf[y]![x];
        if (!c) continue;
        this.buf[y]![x] = punchHex(c);
      }
    }
  }

  /** One-pixel ink around the subject. Same weight for every faction. */
  outline(kind: FactionKind): void {
    const ink = kind === "maga" ? "#2a100c" : kind === "antifa" ? "#140c18" : "#100c0a";
    const add: Pt[] = [];
    for (let y = 2; y < N - 2; y++) {
      for (let x = 2; x < N - 2; x++) {
        if (this.buf[y]![x]) continue;
        let touch = false;
        for (let yy = -1; yy <= 1 && !touch; yy++) {
          for (let xx = -1; xx <= 1; xx++) {
            if (xx === 0 && yy === 0) continue;
            if (this.buf[y + yy]![x + xx]) {
              touch = true;
              break;
            }
          }
        }
        if (touch) add.push([x, y]);
      }
    }
    for (const [x, y] of add) this.buf[y]![x] = ink;
  }

  /**
   * Faction field behind the subject. Three hard light steps from the top-left.
   * Ultimates get the same seven motes; only the hue changes.
   */
  underpaint(kind: FactionKind, elaborate: boolean): void {
    const pal = GROUND[kind];
    const ground = new Uint8Array(N * N);
    for (let y = 2; y < N - 2; y++) {
      for (let x = 2; x < N - 2; x++) {
        if (this.buf[y]![x]) continue;
        const light = (1 - x / (N - 1)) * 0.58 + (1 - y / (N - 1)) * 0.42;
        this.buf[y]![x] = light > 0.62 ? pal.hi : light > 0.4 ? pal.mid : pal.deep;
        ground[y * N + x] = 1;
      }
    }
    if (elaborate) {
      const motes: Pt[] = [
        [6, 4],
        [8, 4],
        [6, 6],
        [N - 8, 5],
        [N - 7, 7],
        [7, N - 8],
        [N - 8, N - 8],
      ];
      for (const [x, y] of motes) {
        const i = y * N + x;
        if (!ground[i]) continue;
        this.buf[y]![x] = pal.mote;
        ground[i] = 0;
      }
    }
    for (let y = 2; y < N - 2; y++) {
      for (let x = 2; x < N - 2; x++) {
        const i = y * N + x;
        if (ground[i]) continue;
        const here = this.buf[y]![x];
        if (!here || here === pal.mote) continue;
        const se = ground[(y + 1) * N + (x + 1)];
        if (se) this.buf[y]![x] = mixHex(here, pal.shadow, 0.28);
      }
    }
    for (let y = 2; y < N - 2; y++) {
      for (let x = 2; x < N - 2; x++) {
        const here = this.buf[y]![x];
        if (!here || ground[y * N + x] || here === pal.mote) continue;
        if (!ground[(y - 1) * N + (x - 1)]) continue;
        this.buf[y]![x] = mixHex(here, "#fff6e4", 0.16);
      }
    }
  }

  /**
   * Frame accents only. Ultimates keep the gold frame and add a longer corner run.
   * Passives stay a muted inner edge. No hotkey is drawn.
   */
  factionAccent(kind: FactionKind, slot: "P" | "Q" | "W" | "E" | "R"): void {
    if (slot === "R") this.ultRuns(kind === "maga" ? "#ffb0a4" : kind === "antifa" ? "#c8b0f0" : "#ffe08a");
    if (kind === "neutral") return;
    if (slot === "P") {
      const muted = kind === "maga" ? "#6a5c4c" : "#524c5c";
      for (let i = 0; i < N; i++) {
        this.buf[1]![i] = muted;
        this.buf[N - 2]![i] = muted;
        this.buf[i]![1] = muted;
        this.buf[i]![N - 2] = muted;
      }
      return;
    }
    const ult = slot === "R";
    if (kind === "maga") {
      const gold = ult ? "#ffe08a" : "#e0b44a";
      const red = ult ? "#ff7a72" : "#a81820";
      const navy = ult ? "#2a3878" : "#1a2448";
      this.paintAt(
        [
          [2, 1],
          [3, 1],
          [1, 2],
        ],
        gold,
      );
      this.paintAt(
        [
          [N - 3, 1],
          [N - 4, 1],
          [N - 2, 2],
        ],
        red,
      );
      this.paintAt(
        [
          [2, N - 2],
          [3, N - 2],
          [1, N - 3],
        ],
        navy,
      );
      this.paintAt(
        [
          [N - 3, N - 2],
          [N - 4, N - 2],
          [N - 2, N - 3],
        ],
        gold,
      );
      return;
    }
    const violet = ult ? "#d8c8ff" : "#7050b0";
    const red = ult ? "#ff6a78" : "#c03048";
    for (let i = 0; i < 5; i++) this.buf[1]![28 + i] = violet;
    for (let i = 0; i < 3; i++) this.buf[N - 2]![30 + i] = red;
    this.buf[30]![1] = "#2a1218";
    this.buf[31]![1] = violet;
    this.buf[30]![N - 2] = red;
    this.buf[31]![N - 2] = violet;
  }

  private ultRuns(color: string): void {
    const len = 8;
    for (let i = 2; i < 2 + len; i++) {
      this.buf[1]![i] = color;
      this.buf[i]![1] = color;
      this.buf[1]![N - 1 - i] = color;
      this.buf[N - 1 - i]![1] = color;
      this.buf[N - 2]![i] = color;
      this.buf[i]![N - 2] = color;
      this.buf[N - 2]![N - 1 - i] = color;
      this.buf[N - 1 - i]![N - 2] = color;
    }
  }

  private paintAt(pts: readonly Pt[], color: string): void {
    for (const [x, y] of pts) this.buf[y]![x] = color;
  }
}

export type FactionKind = "maga" | "antifa" | "neutral";

const GROUND: Record<FactionKind, { deep: string; mid: string; hi: string; mote: string; shadow: string }> = {
  maga: { deep: "#10080c", mid: "#24141c", hi: "#4a2c22", mote: "#c49840", shadow: "#050304" },
  antifa: { deep: "#0a0a10", mid: "#14121c", hi: "#2e2844", mote: "#8060c8", shadow: "#05050a" },
  neutral: { deep: "#100e0c", mid: "#1c1814", hi: "#342c24", mote: "#6a5c48", shadow: "#060504" },
};

function punchHex(c: string): string {
  const [r, g, b] = hexOf(c);
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const t = l / 255;
  let gain = 1;
  if (t < 0.22) gain = 0.72;
  else if (t < 0.42) gain = 0.86;
  else if (t > 0.78) gain = 1.18;
  else if (t > 0.58) gain = 1.08;
  const sat = 1.2;
  const rr = l + (r - l) * sat;
  const gg = l + (g - l) * sat;
  const bb = l + (b - l) * sat;
  return rgbHex(rr * gain, gg * gain, bb * gain);
}

function hexOf(c: string): [number, number, number] {
  const h = c.startsWith("#") ? c.slice(1) : c;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbHex(r: number, g: number, b: number): string {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function lumHex(c: string): number {
  const [r, g, b] = hexOf(c);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mixHex(c: string, t: string, amt: number): string {
  const [r, g, b] = hexOf(c);
  const [tr, tg, tb] = hexOf(t);
  return rgbHex(r + (tr - r) * amt, g + (tg - g) * amt, b + (tb - b) * amt);
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
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1) + xi;
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

function M(name: MatName): Mat {
  return MATS[name];
}

export type Op =
  | ["glove", number, number, MatName, number, number]
  | ["elbow", number, number, MatName, number]
  | ["wedge", number, number, MatName, number, number]
  | ["chevs", number, number, string, number, number]
  | ["shield", number, number, MatName, number]
  | ["bricks", number, number, MatName, number, number]
  | ["chair", number, number, MatName]
  | ["stars", number, number, number]
  | ["bolt", number, number, MatName, number, number]
  | ["stud", number, number, number]
  | ["rocket", number, number, MatName]
  | ["drone", number, number, MatName]
  | ["mic", number, number, MatName]
  | ["mega", number, number, MatName]
  | ["smoke", number, number, MatName]
  | ["heal", number, number, MatName, number]
  | ["drops", number, number, MatName, number]
  | ["burst", number, number, MatName, number]
  | ["papers", number, number, MatName, number]
  | ["bomb", number, number, MatName]
  | ["spiral", number, number, MatName]
  | ["hole", number, number, number]
  | ["beam", number, number, number, number, MatName]
  | ["plant", number, number, MatName]
  | ["syringe", number, number, MatName]
  | ["heart", number, number, MatName, number]
  | ["tape", number, number, MatName]
  | ["bell", number, number, MatName]
  | ["camera", number, number, MatName]
  | ["hat", number, number, MatName]
  | ["anvil", number, number, MatName]
  | ["peel", number, number, MatName]
  | ["gem", number, number, MatName, number]
  | ["fence", number, number, MatName]
  | ["mat", number, number, MatName]
  | ["torso", number, number, MatName]
  | ["boot", number, number, MatName]
  | ["gear", number, number, MatName]
  | ["book", number, number, MatName]
  | ["sneaker", number, number, MatName, number]
  | ["scoop", number, number]
  | ["sun", number, number, MatName]
  | ["leaf", number, number, MatName, number]
  | ["vines", number, number, MatName]
  | ["folder", number, number, MatName]
  | ["pins", number, number]
  | ["phone", number, number, MatName]
  | ["palette", number, number]
  | ["brush", number, number, MatName]
  | ["coins", number, number, MatName]
  | ["mug", number, number, MatName]
  | ["flame", number, number, number]
  | ["arch", number, number, MatName]
  | ["ranch", number, number, MatName]
  | ["chalk", number, number, MatName]
  | ["record", number, number, MatName]
  | ["rifle", number, number, number]
  | ["belt", number, number, MatName]
  | ["ghost", number, number, MatName]
  | ["hook", number, number, MatName]
  | ["heel", number, number, MatName]
  | ["bubble", number, number]
  | ["receipt", number, number, MatName]
  | ["dome", number, number, MatName]
  | ["thermo", number, number, MatName]
  | ["orbit", number, number, MatName]
  | ["tally", number, number, MatName, number, number]
  | ["banners", number, number, MatName]
  | ["cable", number, number]
  | ["paw", number, number, MatName]
  | ["rays", number, number, MatName]
  | ["car", number, number, MatName]
  | ["hood", number, number, MatName]
  | ["chain", number, number, MatName]
  | ["cracks", number, number, MatName]
  | ["flask", number, number, MatName]
  | ["chart", number, number, MatName]
  | ["map", number, number, MatName]
  | ["rose", number, number]
  | ["mitten", number, number, MatName]
  | ["podium", number, number, MatName]
  | ["ribbons", number, number, MatName]
  | ["eclipse", number, number]
  | ["stairs", number, number, MatName]
  | ["glass", number, number, MatName]
  | ["scroll", number, number, MatName]
  | ["candle", number, number]
  | ["board", number, number, MatName]
  | ["wrench", number, number, MatName]
  | ["server", number, number, MatName]
  | ["speed", number, number, string]
  | ["sparks", number, number, string, number, number]
  | ["gavel", number, number, MatName]
  | ["case", number, number, MatName]
  | ["legs", number, number, MatName]
  | ["arm", number, number, MatName]
  | ["slick", number, number, MatName]
  | ["pips", number, number, MatName, number]
  | ["stack", number, number, MatName]
  | ["laser", number, number, MatName];

export function drawOp(g: Icon, op: Op): void {
  switch (op[0]) {
    case "glove":
      glove(g, op[1], op[2], M(op[3]), op[4], op[5]);
      return;
    case "elbow":
      elbow(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "wedge":
      wedge(g, op[1], op[2], M(op[3]), op[4], op[5]);
      return;
    case "chevs":
      chevs(g, op[1], op[2], op[3], op[4], op[5]);
      return;
    case "shield":
      shield(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "bricks":
      bricks(g, op[1], op[2], M(op[3]), op[4], op[5]);
      return;
    case "chair":
      chair(g, op[1], op[2], M(op[3]));
      return;
    case "stars":
      stars(g, op[1], op[2], op[3]);
      return;
    case "bolt":
      bolt(g, op[1], op[2], M(op[3]), op[4], op[5]);
      return;
    case "stud":
      stud(g, op[1], op[2], op[3]);
      return;
    case "rocket":
      rocket(g, op[1], op[2], M(op[3]));
      return;
    case "drone":
      drone(g, op[1], op[2], M(op[3]));
      return;
    case "mic":
      mic(g, op[1], op[2], M(op[3]));
      return;
    case "mega":
      mega(g, op[1], op[2], M(op[3]));
      return;
    case "smoke":
      smoke(g, op[1], op[2], M(op[3]));
      return;
    case "heal":
      heal(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "drops":
      drops(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "burst":
      burst(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "papers":
      papers(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "bomb":
      bomb(g, op[1], op[2], M(op[3]));
      return;
    case "spiral":
      spiral(g, op[1], op[2], M(op[3]));
      return;
    case "hole":
      hole(g, op[1], op[2], op[3]);
      return;
    case "beam":
      beam(g, op[1], op[2], op[3], op[4], M(op[5]));
      return;
    case "plant":
      plant(g, op[1], op[2], M(op[3]));
      return;
    case "syringe":
      syringe(g, op[1], op[2], M(op[3]));
      return;
    case "heart":
      heart(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "tape":
      tape(g, op[1], op[2], M(op[3]));
      return;
    case "bell":
      bell(g, op[1], op[2], M(op[3]));
      return;
    case "camera":
      camera(g, op[1], op[2], M(op[3]));
      return;
    case "hat":
      hat(g, op[1], op[2], M(op[3]));
      return;
    case "anvil":
      anvil(g, op[1], op[2], M(op[3]));
      return;
    case "peel":
      peel(g, op[1], op[2], M(op[3]));
      return;
    case "gem":
      gem(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "fence":
      fence(g, op[1], op[2], M(op[3]));
      return;
    case "mat":
      matFloor(g, op[1], op[2], M(op[3]));
      return;
    case "torso":
      torso(g, op[1], op[2], M(op[3]));
      return;
    case "boot":
      boot(g, op[1], op[2], M(op[3]));
      return;
    case "gear":
      gear(g, op[1], op[2], M(op[3]));
      return;
    case "book":
      book(g, op[1], op[2], M(op[3]));
      return;
    case "sneaker":
      sneaker(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "scoop":
      scoop(g, op[1], op[2]);
      return;
    case "sun":
      sun(g, op[1], op[2], M(op[3]));
      return;
    case "leaf":
      leaf(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "vines":
      vines(g, op[1], op[2], M(op[3]));
      return;
    case "folder":
      folder(g, op[1], op[2], M(op[3]));
      return;
    case "pins":
      pins(g, op[1], op[2]);
      return;
    case "phone":
      phone(g, op[1], op[2], M(op[3]));
      return;
    case "palette":
      palette(g, op[1], op[2]);
      return;
    case "brush":
      brush(g, op[1], op[2], M(op[3]));
      return;
    case "coins":
      coins(g, op[1], op[2], M(op[3]));
      return;
    case "mug":
      mug(g, op[1], op[2], M(op[3]));
      return;
    case "flame":
      flame(g, op[1], op[2], op[3]);
      return;
    case "arch":
      arch(g, op[1], op[2], M(op[3]));
      return;
    case "ranch":
      ranch(g, op[1], op[2], M(op[3]));
      return;
    case "chalk":
      chalk(g, op[1], op[2], M(op[3]));
      return;
    case "record":
      record(g, op[1], op[2], M(op[3]));
      return;
    case "rifle":
      rifle(g, op[1], op[2], op[3]);
      return;
    case "belt":
      belt(g, op[1], op[2], M(op[3]));
      return;
    case "ghost":
      ghost(g, op[1], op[2], M(op[3]));
      return;
    case "hook":
      hook(g, op[1], op[2], M(op[3]));
      return;
    case "heel":
      heel(g, op[1], op[2], M(op[3]));
      return;
    case "bubble":
      bubble(g, op[1], op[2]);
      return;
    case "receipt":
      receipt(g, op[1], op[2], M(op[3]));
      return;
    case "dome":
      dome(g, op[1], op[2], M(op[3]));
      return;
    case "thermo":
      thermo(g, op[1], op[2], M(op[3]));
      return;
    case "orbit":
      orbit(g, op[1], op[2], M(op[3]));
      return;
    case "tally":
      tally(g, op[1], op[2], M(op[3]), op[4], op[5]);
      return;
    case "banners":
      banners(g, op[1], op[2], M(op[3]));
      return;
    case "cable":
      cable(g, op[1], op[2]);
      return;
    case "paw":
      paw(g, op[1], op[2], M(op[3]));
      return;
    case "rays":
      rays(g, op[1], op[2], M(op[3]));
      return;
    case "car":
      car(g, op[1], op[2], M(op[3]));
      return;
    case "hood":
      hood(g, op[1], op[2], M(op[3]));
      return;
    case "chain":
      chain(g, op[1], op[2], M(op[3]));
      return;
    case "cracks":
      cracks(g, op[1], op[2], M(op[3]));
      return;
    case "flask":
      flask(g, op[1], op[2], M(op[3]));
      return;
    case "chart":
      chart(g, op[1], op[2], M(op[3]));
      return;
    case "map":
      mapFold(g, op[1], op[2], M(op[3]));
      return;
    case "rose":
      rose(g, op[1], op[2]);
      return;
    case "mitten":
      mitten(g, op[1], op[2], M(op[3]));
      return;
    case "podium":
      podium(g, op[1], op[2], M(op[3]));
      return;
    case "ribbons":
      ribbons(g, op[1], op[2], M(op[3]));
      return;
    case "eclipse":
      eclipse(g, op[1], op[2]);
      return;
    case "stairs":
      stairs(g, op[1], op[2], M(op[3]));
      return;
    case "glass":
      glass(g, op[1], op[2], M(op[3]));
      return;
    case "scroll":
      scroll(g, op[1], op[2], M(op[3]));
      return;
    case "candle":
      candle(g, op[1], op[2]);
      return;
    case "board":
      board(g, op[1], op[2], M(op[3]));
      return;
    case "wrench":
      wrench(g, op[1], op[2], M(op[3]));
      return;
    case "server":
      server(g, op[1], op[2], M(op[3]));
      return;
    case "speed":
      speed(g, op[1], op[2], op[3]);
      return;
    case "sparks":
      sparks(g, op[1], op[2], op[3], op[4], op[5]);
      return;
    case "gavel":
      gavel(g, op[1], op[2], M(op[3]));
      return;
    case "case":
      brief(g, op[1], op[2], M(op[3]));
      return;
    case "legs":
      legs(g, op[1], op[2], M(op[3]));
      return;
    case "arm":
      arm(g, op[1], op[2], M(op[3]));
      return;
    case "slick":
      slick(g, op[1], op[2], M(op[3]));
      return;
    case "pips":
      pips(g, op[1], op[2], M(op[3]), op[4]);
      return;
    case "stack":
      stack(g, op[1], op[2], M(op[3]));
      return;
    case "laser":
      laser(g, op[1], op[2], M(op[3]));
      return;
    default:
      return;
  }
}

function glove(g: Icon, x: number, y: number, m: Mat, flip: number, s: number): void {
  const k = (n: number) => n * s;
  g.disc(x, y, k(9), k(7.4), m);
  g.disc(x + flip * k(7), y - k(5.2), k(3.5), k(2.7), m);
  g.disc(x + flip * k(8.6), y - k(0.2), k(3.2), k(2.5), m);
  g.disc(x + flip * k(7.2), y + k(4.6), k(3), k(2.4), m);
  g.disc(x - flip * k(5.2), y + k(1.2), k(3.3), k(4.2), m);
  g.box(x - k(5), y + k(5), k(11), k(6), m, 2);
  g.over(x - k(4), y + k(6.4), k(8), 2, "#f4efe6");
  g.line(x - flip * k(1), y - k(1), x + flip * k(5), y - k(2.2), m.deep, 1.6);
  g.px(x - flip * k(1), y - k(2), m.spec);
}

function elbow(g: Icon, x: number, y: number, m: Mat, len: number): void {
  g.rod(x, y, x + len, y - len * 0.35, 3.2, m);
  g.poly(
    [
      [x + len - 2, y - len * 0.35 - 3],
      [x + len + 10, y - len * 0.35],
      [x + len - 2, y - len * 0.35 + 4],
    ],
    m,
  );
  g.disc(x, y, 4, 3.4, M("tan"));
}

function wedge(g: Icon, x: number, y: number, m: Mat, reach: number, spread: number): void {
  g.poly(
    [
      [x, y - 3],
      [x + reach, y - spread],
      [x + reach + 4, y],
      [x + reach, y + spread],
      [x, y + 3],
    ],
    m,
  );
  g.line(x + 4, y, x + reach - 2, y, m.spec, 2);
  g.line(x + 6, y - 1, x + reach * 0.72, y - spread * 0.42, m.hi, 1.6);
  g.line(x + 6, y + 2, x + reach * 0.78, y + spread * 0.48, m.deep, 1.6);
}

function chevs(g: Icon, x: number, y: number, color: string, n: number, gap: number): void {
  for (let i = 0; i < n; i++) {
    const ox = x + i * gap;
    g.line(ox, y - 7, ox + 8, y, color, 2.2);
    g.line(ox + 8, y, ox, y + 7, color, 2.2);
  }
}

function shield(g: Icon, x: number, y: number, m: Mat, s: number): void {
  const w = 16 * s;
  const h = 22 * s;
  g.poly(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h * 0.62],
      [x + w / 2, y + h],
      [x, y + h * 0.62],
    ],
    m,
  );
  g.line(x + w / 2, y + 3, x + w / 2, y + h * 0.7, m.spec, 1.8);
  g.disc(x + w * 0.4, y + h * 0.34, Math.max(2.4, 2.6 * s), Math.max(2.1, 2.2 * s), m);
  g.line(x + w * 0.22, y + h * 0.16, x + w * 0.62, y + h * 0.16, m.spec, 1.6);
}

function bricks(g: Icon, x: number, y: number, m: Mat, cols: number, rows: number): void {
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? 4 : 0;
    for (let c = 0; c < cols; c++) g.box(x + off + c * 10, y + r * 6, 9, 5, m, 1);
  }
}

function chair(g: Icon, x: number, y: number, seat: Mat): void {
  g.ring(x + 6, y + 16, 10, 10, 2.3, M("steel"));
  g.disc(x + 6, y + 16, 1.7, 1.7, M("gold"));
  g.line(x + 6, y + 8, x + 6, y + 24, M("steel").hi, 1.2);
  g.line(x - 2, y + 16, x + 14, y + 16, M("steel").hi, 1.2);
  g.ring(x + 26, y + 20, 4.4, 4.4, 1.7, M("steel"));
  g.rod(x + 4, y + 8, x + 24, y + 16, 1.5, M("steel"));
  g.box(x + 4, y + 4, 14, 4, seat, 1);
  g.box(x + 2, y - 10, 3, 16, seat, 1);
  g.rod(x + 16, y + 8, x + 28, y + 18, 1.3, M("steel"));
  g.box(x + 26, y + 16, 6, 2, M("steel"), 0);
}

function stars(g: Icon, x: number, y: number, spin: number): void {
  const pts: Pt[] = [
    [0, -9],
    [8, -3],
    [-7, 2],
    [6, 7],
    [-3, 8],
  ];
  for (let i = 0; i < pts.length; i++) {
    const a = spin + i * 0.4;
    const dx = Math.cos(a) * pts[i]![0] - Math.sin(a) * pts[i]![1];
    const dy = Math.sin(a) * pts[i]![0] + Math.cos(a) * pts[i]![1];
    g.disc(x + dx * 0.15 + pts[i]![0], y + dy * 0.15 + pts[i]![1], 2.3, 2.3, M("gold"));
    g.px(x + pts[i]![0], y + pts[i]![1] - 1, "#fffef8");
  }
}

function bolt(g: Icon, x: number, y: number, m: Mat, len: number, ang: number): void {
  const x1 = x + Math.cos(ang) * len;
  const y1 = y + Math.sin(ang) * len;
  g.rod(x, y, x1, y1, 2.4, m);
  g.poly(
    [
      [x1, y1 - 4],
      [x1 + Math.cos(ang) * 8, y1 + Math.sin(ang) * 8],
      [x1, y1 + 4],
    ],
    m,
  );
  g.disc(x, y, 3, 3, M("cream"));
}

function stud(g: Icon, x: number, y: number, ang: number): void {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  g.poly(
    [
      [x, y],
      [x + c * 16 - s * 3, y + s * 16 + c * 3],
      [x + c * 20, y + s * 20],
      [x + c * 16 + s * 3, y + s * 16 - c * 3],
    ],
    M("steel"),
  );
  g.px(x + c * 6, y + s * 6, "#ffffff");
}

function rocket(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x + 6, y],
      [x + 28, y + 6],
      [x + 6, y + 12],
    ],
    m,
  );
  g.box(x, y + 1, 16, 10, M("steel"), 2);
  g.disc(x + 6, y + 6, 2.2, 2.2, M("ice"));
  flame(g, x - 2, y + 6, 0.8);
}

function drone(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x + 8, y + 6, 12, 6, m, 1);
  g.rod(x, y + 4, x + 14, y + 8, 1.3, M("steel"));
  g.rod(x + 22, y + 8, x + 34, y + 4, 1.3, M("steel"));
  g.disc(x + 2, y + 4, 4, 1.6, M("black"));
  g.disc(x + 32, y + 4, 4, 1.6, M("black"));
  g.disc(x + 14, y + 14, 2, 2, M("green"));
}

function mic(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x + 6, y + 6, 5, 7, m);
  g.over(x + 3, y + 3, 6, 2, m.spec);
  g.rod(x + 6, y + 12, x + 6, y + 24, 1.6, M("steel"));
  g.rod(x, y + 24, x + 12, y + 24, 1.4, M("steel"));
}

function mega(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 4, 8, 10, m, 1);
  g.poly(
    [
      [x + 8, y + 2],
      [x + 24, y - 4],
      [x + 24, y + 18],
      [x + 8, y + 14],
    ],
    m,
  );
  g.line(x + 26, y - 2, x + 32, y - 8, m.hi, 2);
  g.line(x + 26, y + 8, x + 34, y + 8, m.hi, 2);
  g.line(x + 26, y + 16, x + 32, y + 22, m.hi, 2);
}

function smoke(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x, y + 6, 8, 6, m);
  g.disc(x + 10, y, 7, 5, m);
  g.disc(x + 8, y + 10, 6, 4, m);
  g.disc(x - 2, y - 2, 3, 3, M("white"));
}

function heal(g: Icon, x: number, y: number, m: Mat, s: number): void {
  g.box(x, y + 4 * s, 14 * s, 6 * s, m, 1);
  g.box(x + 4 * s, y, 6 * s, 14 * s, m, 1);
  g.px(x + 6 * s, y + 5 * s, m.spec);
}

function drops(g: Icon, x: number, y: number, m: Mat, n: number): void {
  for (let i = 0; i < n; i++) {
    const dx = (i % 4) * 8;
    const dy = Math.floor(i / 4) * 9 + (i % 2) * 3;
    g.disc(x + dx, y + dy, 2.4, 3.4, m);
    g.px(x + dx - 1, y + dy - 1, m.spec);
  }
}

function burst(g: Icon, x: number, y: number, m: Mat, r: number): void {
  g.ring(x, y, r, r * 0.82, 3, m);
  g.ring(x, y, r * 0.55, r * 0.45, 2.2, M("cream"));
  g.disc(x, y, 3.4, 3.4, m);
  g.px(x - 1, y - 1, m.spec);
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
    const inner = r * 0.62;
    const outer = r * (i % 2 === 0 ? 1.05 : 0.9);
    g.line(
      x + Math.cos(a) * inner,
      y + Math.sin(a) * inner * 0.82,
      x + Math.cos(a) * outer,
      y + Math.sin(a) * outer * 0.82,
      i % 2 === 0 ? m.hi : m.deep,
      1.8,
    );
  }
}

function papers(g: Icon, x: number, y: number, m: Mat, n: number): void {
  for (let i = 0; i < n; i++) {
    const dx = (i % 3) * 9;
    const dy = Math.floor(i / 3) * 8 + (i % 2) * 2;
    g.box(x + dx, y + dy, 8, 10, m, 1);
    g.over(x + dx + 1, y + dy + 2, 5, 1, m.ink);
    g.over(x + dx + 1, y + dy + 4, 4, 1, m.lo);
  }
}

function bomb(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x + 10, y + 12, 10, 10, m);
  g.rod(x + 16, y + 6, x + 24, y - 2, 1.4, M("wood"));
  flame(g, x + 26, y - 4, 0.7);
  g.px(x + 6, y + 8, m.spec);
}

function spiral(g: Icon, x: number, y: number, m: Mat): void {
  for (let i = 0; i < 18; i++) {
    const a = i * 0.55;
    const r = 3 + i * 0.9;
    g.disc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 2.1, 2.1, i % 3 === 0 ? M("gold") : m);
  }
  g.disc(x, y, 3.6, 3, m);
  g.px(x - 1, y - 1, m.spec);
}

function hole(g: Icon, x: number, y: number, r: number): void {
  g.ring(x, y, r + 7, r * 0.5, 3.2, M("violet"));
  g.ring(x, y, r + 9, r * 0.38, 1.5, M("gold"));
  g.disc(x, y, r, r, M("black"));
  g.disc(x - r * 0.2, y - r * 0.2, r * 0.28, r * 0.22, M("steel"));
}

function beam(g: Icon, x0: number, y0: number, x1: number, y1: number, m: Mat): void {
  g.rod(x0, y0, x1, y1, 3.4, m);
  g.line(x0, y0, x1, y1, m.spec, 1.8);
  g.disc(x0, y0, 3.6, 3.6, m);
  g.disc(x1, y1, 5, 5, M("cream"));
  g.px(x1 - 1, y1 - 1, "#fffef8");
}

function plant(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x + 6, y + 8, x + 6, y + 22, 1.5, M("green"));
  g.disc(x + 6, y + 8, 5, 4, m);
  g.disc(x + 1, y + 12, 3.5, 2.4, m);
  g.disc(x + 11, y + 12, 3.5, 2.4, m);
}

function syringe(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x + 4, y + 6, 18, 6, M("ice"), 1);
  g.over(x + 8, y + 7, 8, 4, m.mid);
  g.rod(x + 22, y + 9, x + 32, y + 9, 1.2, M("steel"));
  g.box(x, y + 5, 5, 8, M("steel"), 1);
}

function heart(g: Icon, x: number, y: number, m: Mat, s: number): void {
  g.disc(x + 4 * s, y + 4 * s, 4 * s, 4 * s, m);
  g.disc(x + 10 * s, y + 4 * s, 4 * s, 4 * s, m);
  g.poly(
    [
      [x, y + 6 * s],
      [x + 14 * s, y + 6 * s],
      [x + 7 * s, y + 16 * s],
    ],
    m,
  );
}

function tape(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 28, 6, m, 1);
  g.box(x + 4, y + 8, 28, 6, M("gold"), 1);
  g.over(x + 2, y + 2, 6, 2, "#111");
  g.over(x + 14, y + 10, 6, 2, "#111");
}

function bell(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x + 2, y + 4],
      [x + 18, y + 4],
      [x + 15, y + 16],
      [x + 5, y + 16],
    ],
    m,
  );
  g.box(x, y + 16, 20, 3, m, 1);
  g.disc(x + 10, y + 22, 2.2, 2.2, M("gold"));
  g.rod(x + 10, y - 2, x + 10, y + 4, 1.3, M("steel"));
}

function camera(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 4, 24, 16, m, 2);
  g.box(x + 4, y, 8, 5, M("black"), 1);
  g.disc(x + 13, y + 12, 5, 5, m);
  g.disc(x + 13, y + 12, 2.4, 2.4, M("ice"));
  g.disc(x + 20, y + 8, 1.4, 1.4, M("red"));
}

function hat(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x + 6, y, 12, 8, m, 1);
  g.box(x, y + 8, 24, 4, m, 1);
  g.over(x + 8, y + 2, 8, 2, m.spec);
}

function anvil(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x, y + 6],
      [x + 28, y + 6],
      [x + 24, y + 12],
      [x + 4, y + 12],
    ],
    m,
  );
  g.box(x + 8, y + 12, 10, 8, m, 1);
  g.box(x + 4, y + 20, 18, 3, M("black"), 1);
}

function peel(g: Icon, x: number, y: number, m: Mat): void {
  arc(g, x + 8, y + 10, 8, 0.2, 2.4, m.mid, 3);
  arc(g, x + 8, y + 10, 8, 2.8, 4.4, m.hi, 3);
  g.disc(x + 8, y + 8, 3, 2, m);
}

function gem(g: Icon, x: number, y: number, m: Mat, s: number): void {
  g.poly(
    [
      [x + 8 * s, y],
      [x + 16 * s, y + 6 * s],
      [x + 8 * s, y + 18 * s],
      [x, y + 6 * s],
    ],
    m,
  );
  g.line(x + 8 * s, y + 2, x + 8 * s, y + 14 * s, m.spec, 1.2);
}

function fence(g: Icon, x: number, y: number, m: Mat): void {
  for (let i = 0; i < 4; i++) g.rod(x + i * 8, y, x + i * 8, y + 22, 1.4, m);
  g.rod(x, y + 6, x + 24, y + 6, 1.3, m);
  g.rod(x, y + 14, x + 24, y + 14, 1.3, m);
}

function matFloor(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 30, 16, m, 2);
  g.over(x + 2, y + 6, 26, 2, M("cream").mid);
}

function torso(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x + 4, y],
      [x + 16, y + 2],
      [x + 18, y + 20],
      [x, y + 18],
    ],
    m,
  );
  g.disc(x + 6, y + 10, 2, 2, M("red"));
}

function boot(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x + 4, y, 8, 12, m, 1);
  g.box(x, y + 10, 18, 6, m, 2);
  g.over(x + 2, y + 12, 8, 2, m.spec);
}

function gear(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x, y, 8, 8, m);
  g.disc(x, y, 3, 3, M("black"));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g.box(x + Math.cos(a) * 8 - 2, y + Math.sin(a) * 8 - 2, 4, 4, m, 0);
  }
}

function book(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 16, 20, m, 1);
  g.box(x + 14, y + 1, 8, 18, M("paper"), 1);
  g.over(x + 3, y + 4, 10, 2, M("gold").mid);
  g.over(x + 3, y + 8, 8, 1, m.ink);
}

function sneaker(g: Icon, x: number, y: number, m: Mat, flip: number): void {
  const dir = flip < 0 ? -1 : 1;
  g.box(x, y + 6, 20, 7, m, 2);
  g.poly(
    [
      [x + (dir > 0 ? 8 : 0), y + 6],
      [x + (dir > 0 ? 20 : 12), y + 6],
      [x + (dir > 0 ? 16 : 4), y],
      [x + (dir > 0 ? 8 : 0), y + 2],
    ],
    m,
  );
  g.box(x, y + 12, 22, 3, M("white"), 1);
}

function scoop(g: Icon, x: number, y: number): void {
  g.poly(
    [
      [x + 4, y + 10],
      [x + 16, y + 10],
      [x + 10, y + 26],
    ],
    M("tan"),
  );
  g.disc(x + 10, y + 8, 7, 6, M("pink"));
  g.disc(x + 6, y + 4, 4, 3.5, M("cream"));
}

function sun(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x, y, 7, 7, m);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.line(x + Math.cos(a) * 9, y + Math.sin(a) * 9, x + Math.cos(a) * 15, y + Math.sin(a) * 15, m.hi, 2);
  }
}

function leaf(g: Icon, x: number, y: number, m: Mat, rot: number): void {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const p = (px: number, py: number): Pt => [x + px * c - py * s, y + px * s + py * c];
  g.poly([p(0, 0), p(12, -4), p(16, 0), p(12, 4)], m);
  g.line(x, y, x + c * 12, y + s * 12, m.deep, 1);
}

function vines(g: Icon, x: number, y: number, m: Mat): void {
  arc(g, x, y + 10, 12, -1.2, 1.2, m.mid, 2.4);
  arc(g, x + 10, y + 16, 10, 2, 4.2, m.hi, 2.2);
  g.disc(x + 4, y + 4, 3, 2.2, m);
  g.disc(x + 16, y + 12, 3, 2.2, m);
}

function folder(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 4, 22, 16, m, 1);
  g.box(x, y, 10, 6, m, 1);
  g.over(x + 4, y + 10, 14, 2, m.ink);
  g.over(x + 4, y + 14, 10, 1, m.lo);
}

function pins(g: Icon, x: number, y: number): void {
  g.disc(x, y, 2.2, 2.2, M("red"));
  g.disc(x + 16, y + 10, 2.2, 2.2, M("red"));
  g.disc(x + 6, y + 18, 2.2, 2.2, M("gold"));
  g.line(x, y, x + 16, y + 10, M("red").mid, 1.3);
  g.line(x + 16, y + 10, x + 6, y + 18, M("red").mid, 1.3);
  g.line(x + 6, y + 18, x, y, M("gold").mid, 1.3);
}

function phone(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 14, 22, m, 2);
  g.box(x + 2, y + 3, 10, 14, M("ice"), 1);
  g.disc(x + 7, y + 19, 1.4, 1.4, M("black"));
}

function palette(g: Icon, x: number, y: number): void {
  g.disc(x + 12, y + 10, 12, 9, M("wood"));
  g.disc(x + 16, y + 12, 3, 3, M("cream"));
  g.disc(x + 6, y + 8, 2.2, 2.2, M("red"));
  g.disc(x + 10, y + 5, 2.2, 2.2, M("blue"));
  g.disc(x + 16, y + 6, 2.2, 2.2, M("gold"));
  g.disc(x + 8, y + 14, 2.2, 2.2, M("green"));
}

function brush(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x, y + 16, x + 18, y, 1.8, M("wood"));
  g.box(x + 16, y - 2, 8, 6, m, 1);
  g.line(x + 20, y + 6, x + 28, y + 14, m.mid, 2);
}

function coins(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x + 6, y + 12, 6, 3, m);
  g.disc(x + 6, y + 8, 6, 3, m);
  g.disc(x + 14, y + 6, 6, 3, M("gold"));
  g.disc(x + 14, y + 3, 6, 3, M("gold"));
}

function mug(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 14, 16, m, 2);
  g.ring(x + 14, y + 8, 5, 5, 1.8, m);
  g.over(x + 2, y + 3, 10, 3, M("cream").mid);
}

function flame(g: Icon, x: number, y: number, s: number): void {
  g.disc(x, y + 4 * s, 3.2 * s, 5 * s, M("flame"));
  g.disc(x, y + 2 * s, 2 * s, 3.4 * s, M("gold"));
  g.disc(x, y, 1.1 * s, 1.8 * s, M("cream"));
}

function arch(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 8, 6, 18, m, 1);
  g.box(x + 20, y + 8, 6, 18, m, 1);
  g.box(x, y + 4, 26, 6, m, 1);
  arc(g, x + 13, y + 10, 8, Math.PI, Math.PI * 2, m.hi, 2);
}

function ranch(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x, y, x, y + 20, 2, M("wood"));
  g.rod(x + 22, y, x + 22, y + 20, 2, M("wood"));
  g.rod(x, y + 6, x + 22, y + 6, 1.5, m);
  g.rod(x, y + 12, x + 22, y + 12, 1.5, m);
}

function chalk(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x, y, x + 28, y + 8, 1.6, m);
  g.box(x + 24, y + 4, 8, 3, M("white"), 1);
  g.disc(x + 4, y + 2, 1.5, 1.5, M("white"));
}

function record(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x, y, 12, 12, M("black"));
  g.ring(x, y, 8, 8, 1.4, m);
  g.disc(x, y, 2.2, 2.2, m);
}

function rifle(g: Icon, x: number, y: number, long: number): void {
  const w = long > 0 ? 36 : 24;
  g.box(x, y, w, 4, M("black"), 1);
  g.box(x + w - 6, y - 2, 8, 3, M("steel"), 0);
  g.box(x + 8, y + 3, 3, 7, M("wood"), 0);
  g.box(x + 4, y - 3, 10, 3, M("black"), 0);
  if (long > 0) g.line(x + w, y + 2, x + w + 10, y + 2, "#fff6e4", 1.4);
}

function belt(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 6, 28, 8, M("leather"), 2);
  g.box(x + 10, y + 4, 8, 12, m, 1);
  g.disc(x + 14, y + 10, 2, 2, M("gold"));
}

function ghost(g: Icon, x: number, y: number, m: Mat): void {
  glove(g, x, y, m, 1, 0.85);
  for (let i = 0; i < 4; i++) g.line(x + 8, y - 6 + i * 4, x + 18, y - 8 + i * 4, m.hi, 1.3);
}

function hook(g: Icon, x: number, y: number, m: Mat): void {
  arc(g, x, y, 14, -0.4, 2.2, m.mid, 4);
  g.disc(x + 12, y - 6, 5, 4, m);
  g.disc(x - 2, y + 8, 3, 3, M("tan"));
}

function heel(g: Icon, x: number, y: number, m: Mat): void {
  arc(g, x + 8, y + 10, 14, 3.4, 5.4, m.hi, 3);
  g.disc(x + 20, y + 8, 4, 3, m);
  g.rod(x + 4, y + 16, x + 12, y + 22, 2, m);
}

function bubble(g: Icon, x: number, y: number): void {
  g.disc(x + 12, y + 10, 12, 9, M("white"));
  g.poly(
    [
      [x + 8, y + 16],
      [x + 4, y + 24],
      [x + 14, y + 16],
    ],
    M("white"),
  );
}

function receipt(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x, y],
      [x + 16, y],
      [x + 16, y + 18],
      [x + 12, y + 22],
      [x + 8, y + 18],
      [x + 4, y + 22],
      [x, y + 18],
    ],
    M("paper"),
  );
  g.over(x + 3, y + 4, 10, 1, m.ink);
  g.over(x + 3, y + 7, 8, 1, m.lo);
  g.over(x + 3, y + 10, 10, 1, m.ink);
}

function dome(g: Icon, x: number, y: number, m: Mat): void {
  arc(g, x, y + 10, 20, Math.PI, Math.PI * 2, m.hi, 3.2);
  g.line(x - 20, y + 10, x + 20, y + 10, m.mid, 2.2);
  g.disc(x, y + 2, 4.4, 3.4, m);
  g.line(x - 10, y + 4, x - 6, y - 6, m.spec, 1.8);
  g.line(x + 6, y - 2, x + 12, y + 6, m.deep, 1.8);
  g.px(x - 2, y - 1, m.spec);
}

function thermo(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x + 4, y, 6, 20, M("white"), 2);
  g.over(x + 6, y + 8, 2, 10, m.mid);
  g.disc(x + 7, y + 22, 5, 5, m);
}

function orbit(g: Icon, x: number, y: number, m: Mat): void {
  g.ring(x, y, 14, 6, 1.6, m);
  g.disc(x + 12, y - 2, 2.4, 2.4, M("gold"));
  g.disc(x - 8, y + 3, 1.8, 1.8, M("ice"));
}

function tally(g: Icon, x: number, y: number, m: Mat, n: number, hot: number): void {
  for (let i = 0; i < n; i++) {
    const use = i === n - 1 && hot > 0 ? M("gold") : m;
    g.box(x + i * 6, y, 4, 18, use, 1);
  }
}

function banners(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x + 4, y, x + 4, y + 22, 1.4, M("wood"));
  g.poly(
    [
      [x + 4, y + 2],
      [x + 18, y + 4],
      [x + 16, y + 12],
      [x + 4, y + 10],
    ],
    m,
  );
  g.rod(x + 20, y + 2, x + 20, y + 22, 1.4, M("wood"));
  g.poly(
    [
      [x + 20, y + 6],
      [x + 34, y + 8],
      [x + 32, y + 16],
      [x + 20, y + 14],
    ],
    M("gold"),
  );
}

function cable(g: Icon, x: number, y: number): void {
  g.line(x, y, x + 30, y + 16, M("steel").hi, 1.6);
  g.box(x + 12, y + 4, 8, 6, M("red"), 1);
  g.disc(x, y, 2, 2, M("steel"));
  g.disc(x + 30, y + 16, 2, 2, M("steel"));
}

function paw(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x + 8, y + 10, 7, 6, m);
  g.disc(x + 2, y + 4, 2.4, 2.4, m);
  g.disc(x + 7, y + 2, 2.4, 2.4, m);
  g.disc(x + 12, y + 3, 2.4, 2.4, m);
  g.disc(x + 16, y + 7, 2.2, 2.2, m);
}

function rays(g: Icon, x: number, y: number, m: Mat): void {
  for (let i = 0; i < 7; i++) {
    const a = -0.8 + i * 0.26;
    g.line(x, y, x + Math.cos(a) * 22, y + Math.sin(a) * 18, i % 2 ? m.hi : m.mid, 2);
  }
}

function car(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 8, 32, 8, m, 2);
  g.poly(
    [
      [x + 6, y + 8],
      [x + 12, y],
      [x + 24, y],
      [x + 28, y + 8],
    ],
    M("ice"),
  );
  g.disc(x + 8, y + 16, 4, 4, M("black"));
  g.disc(x + 24, y + 16, 4, 4, M("black"));
}

function hood(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x + 12, y],
      [x + 24, y + 10],
      [x + 20, y + 22],
      [x + 4, y + 22],
      [x, y + 10],
    ],
    m,
  );
  g.box(x + 6, y + 12, 12, 4, M("black"), 1);
}

function chain(g: Icon, x: number, y: number, m: Mat): void {
  for (let i = 0; i < 4; i++) g.ring(x + i * 8, y + (i % 2) * 3, 4, 5, 1.8, m);
}

function cracks(g: Icon, x: number, y: number, m: Mat): void {
  g.line(x, y, x + 10, y + 8, m.hi, 1.6);
  g.line(x + 10, y + 8, x + 6, y + 16, m.mid, 1.6);
  g.line(x + 10, y + 8, x + 22, y + 14, m.hi, 1.6);
  g.line(x + 22, y + 14, x + 28, y + 8, m.mid, 1.4);
}

function flask(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x + 6, y],
      [x + 12, y],
      [x + 16, y + 18],
      [x + 2, y + 18],
    ],
    M("ice"),
  );
  g.over(x + 4, y + 10, 10, 8, m.mid);
  g.box(x + 6, y - 2, 6, 4, M("steel"), 0);
}

function chart(g: Icon, x: number, y: number, m: Mat): void {
  g.line(x, y + 16, x + 24, y + 16, M("white").mid, 1.4);
  g.line(x, y + 16, x, y, M("white").mid, 1.4);
  g.line(x, y + 12, x + 8, y + 10, m.mid, 2);
  g.line(x + 8, y + 10, x + 14, y + 14, m.hi, 2);
  g.line(x + 14, y + 14, x + 24, y + 4, m.mid, 2);
}

function mapFold(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 24, 16, M("paper"), 1);
  g.over(x + 8, y, 2, 16, m.lo);
  g.over(x + 16, y, 2, 16, m.lo);
  g.line(x + 2, y + 6, x + 7, y + 8, m.mid, 1.4);
  g.disc(x + 18, y + 8, 2, 2, M("red"));
}

function rose(g: Icon, x: number, y: number): void {
  g.disc(x + 8, y + 8, 5, 5, M("red"));
  g.disc(x + 8, y + 8, 2.2, 2.2, M("pink"));
  g.rod(x + 8, y + 12, x + 8, y + 24, 1.3, M("green"));
  g.disc(x + 4, y + 16, 3, 2, M("green"));
}

function mitten(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x + 4, y + 6, 12, 14, m, 3);
  g.disc(x + 4, y + 10, 4, 5, m);
  g.box(x + 6, y + 18, 8, 3, M("white"), 1);
}

function podium(g: Icon, x: number, y: number, m: Mat): void {
  g.poly(
    [
      [x + 2, y],
      [x + 22, y],
      [x + 18, y + 8],
      [x + 6, y + 8],
    ],
    m,
  );
  g.box(x + 10, y + 8, 4, 14, M("wood"), 0);
}

function ribbons(g: Icon, x: number, y: number, m: Mat): void {
  arc(g, x + 8, y + 10, 10, 0.4, 2.4, m.hi, 2.4);
  arc(g, x + 16, y + 16, 12, 2.2, 4.4, M("gold").hi, 2.2);
  arc(g, x + 6, y + 20, 8, 3.6, 5.6, M("violet").hi, 2);
}

function eclipse(g: Icon, x: number, y: number): void {
  g.disc(x, y, 12, 12, M("navy"));
  g.disc(x + 6, y - 2, 10, 10, M("gold"));
  g.disc(x + 8, y - 3, 7, 7, M("green"));
}

function stairs(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 16, 10, 6, m, 0);
  g.box(x + 8, y + 10, 10, 6, m, 0);
  g.box(x + 16, y + 4, 10, 6, m, 0);
}

function glass(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 22, 16, M("black"), 1);
  g.box(x + 2, y + 2, 18, 12, m, 1);
  g.over(x + 4, y + 4, 8, 1, M("white").hi);
}

function scroll(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x + 4, y, 16, 20, M("paper"), 1);
  g.disc(x + 4, y + 4, 4, 4, m);
  g.disc(x + 4, y + 16, 4, 4, m);
  g.over(x + 8, y + 6, 8, 1, m.ink);
  g.over(x + 8, y + 10, 7, 1, m.lo);
}

function candle(g: Icon, x: number, y: number): void {
  g.box(x, y + 8, 6, 14, M("cream"), 1);
  flame(g, x + 3, y + 4, 0.8);
}

function board(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 20, 14, m, 1);
  g.rod(x + 10, y + 14, x + 10, y + 22, 1.4, M("wood"));
  g.over(x + 3, y + 4, 12, 2, M("white").mid);
}

function wrench(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x + 4, y + 16, x + 20, y + 2, 2, m);
  g.disc(x + 4, y + 18, 4, 4, m);
  g.disc(x + 22, y + 2, 3, 3, m);
}

function server(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 18, 24, m, 1);
  g.over(x + 2, y + 3, 14, 2, M("green").mid);
  g.over(x + 2, y + 8, 14, 2, M("gold").mid);
  g.over(x + 2, y + 13, 14, 2, M("red").mid);
  g.disc(x + 14, y + 20, 1.3, 1.3, M("green"));
}

function speed(g: Icon, x: number, y: number, color: string): void {
  arc(g, x, y, 8, -1, 1, color, 2);
  arc(g, x, y, 13, -0.8, 0.8, color, 2);
  arc(g, x, y, 18, -0.55, 0.55, color, 1.6);
}

function sparks(g: Icon, x: number, y: number, color: string, n: number, spin: number): void {
  for (let i = 0; i < n; i++) {
    const a = spin + (i / n) * Math.PI * 2;
    const len = 7 + (i % 3) * 3;
    g.line(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, color, i % 2 ? 2.2 : 1.4);
  }
  g.px(Math.round(x), Math.round(y), "#fffef8");
}

function gavel(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x, y + 10, x + 16, y, 2, M("wood"));
  g.box(x + 12, y - 4, 14, 7, m, 1);
  g.box(x - 2, y + 12, 16, 3, M("wood"), 1);
}

function brief(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y + 4, 20, 14, m, 2);
  g.rod(x + 6, y + 4, x + 6, y, 1.3, M("steel"));
  g.rod(x + 14, y + 4, x + 14, y, 1.3, M("steel"));
  g.rod(x + 6, y, x + 14, y, 1.3, M("steel"));
  g.box(x + 8, y + 9, 4, 4, M("gold"), 0);
}

function legs(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x + 6, y, x + 2, y + 20, 3.2, m);
  g.rod(x + 12, y, x + 24, y + 18, 3.2, m);
  g.disc(x + 9, y + 2, 6, 4, m);
  g.box(x, y + 18, 7, 3, M("black"), 1);
  g.box(x + 20, y + 16, 8, 3, M("black"), 1);
}

function arm(g: Icon, x: number, y: number, m: Mat): void {
  g.rod(x, y, x + 22, y - 6, 4, m);
  g.disc(x + 24, y - 6, 5, 4.2, M("tan"));
}

function slick(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x + 14, y + 8, 16, 5, m);
  g.line(x + 4, y + 6, x + 24, y + 10, m.spec, 1.2);
}

function pips(g: Icon, x: number, y: number, m: Mat, n: number): void {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    g.disc(x + Math.cos(a) * 16, y + Math.sin(a) * 14, 3, 3, m);
  }
}

function stack(g: Icon, x: number, y: number, m: Mat): void {
  g.disc(x + 8, y + 14, 8, 3, m);
  g.disc(x + 8, y + 9, 7, 3, M("cream"));
  g.disc(x + 8, y + 5, 6, 2.6, m);
}

function laser(g: Icon, x: number, y: number, m: Mat): void {
  g.box(x, y, 8, 6, M("black"), 1);
  g.rod(x + 8, y + 3, x + 30, y + 3, 1.3, m);
  g.disc(x + 32, y + 3, 2.4, 2.4, m);
}
