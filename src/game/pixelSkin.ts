import type { SkinLook } from "../dlc";

const WHITE = "#fff6e4";
const INK = "#1a1008";

export type PixelPlot = {
  set(x: number, y: number, c: string): void;
  rect(x: number, y: number, w: number, h: number, c: string): void;
  dot(x: number, y: number, c: string): void;
  block(x: number, y: number, w: number, h: number, mid: string, hi: string, lo: string): void;
};

export type SkinRig = {
  cx: number;
  hy: number;
  ty: number;
  pose: string;
  frame: number;
};

function clamp255(n: number): number {
  return n < 0 ? 0 : n > 255 ? 255 : n;
}

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexOf(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp255(v).toString(16).padStart(2, "0")).join("")}`;
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgbOf(a);
  const [br, bg, bb] = rgbOf(b);
  return hexOf(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function hi(c: string): string {
  return mix(c, WHITE, 0.38);
}

function lo(c: string): string {
  return mix(c, INK, 0.42);
}

/** C32 skins: same looks, retargeted to 64-space (cx ≈ 32). */
export function paintPixelSkin(g: PixelPlot, look: SkinLook, tint: string, r: SkinRig): void {
  const s = (n: number) => Math.round((n * 4) / 3);
  const { cx, hy, ty } = r;
  const t = tint || "#c9a24a";
  const th = hi(t);
  const tl = lo(t);
  const flutter = r.pose === "walk" || r.pose === "idle" ? (r.frame % 2 ? 1 : 0) : 0;

  switch (look) {
    case "cape":
    case "parade":
      g.block(cx - s(12), ty + s(1), s(6), s(16), t, th, tl);
      g.block(cx + s(7), ty + s(1), s(6), s(16) + flutter, t, th, tl);
      g.rect(cx - s(10), ty + s(3), s(3), s(12), th);
      g.rect(cx + s(9), ty + s(3) + flutter, s(2), s(11), tl);
      if (look === "parade") {
        g.rect(cx - s(12), ty + s(14), s(6), s(3), "#c4161c");
        g.rect(cx + s(7), ty + s(14) + flutter, s(6), s(3), "#c4161c");
      }
      break;
    default:
      break;
  }

  if (look === "eagle" || look === "parade") {
    g.block(cx - s(8), hy + s(1), s(16), s(4), "#efe6d6", WHITE, "#8a8070");
    g.rect(cx - s(7), hy + s(1), s(14), 1, t);
    g.dot(cx, hy, t);
    g.dot(cx - s(2), hy - 1, th);
    g.dot(cx + s(2), hy - 1, th);
    g.dot(cx, hy - s(2), WHITE);
  }
  if (look === "visor") {
    g.block(cx - s(8), hy + s(6), s(16), s(4), t, th, tl);
    g.rect(cx - s(7), hy + s(6), s(14), 1, WHITE);
    g.dot(cx + s(5), hy + s(8), th);
  }
  if (look === "mask" || look === "spine") {
    const shell = look === "spine" ? "#2a1038" : "#121018";
    g.block(cx - s(7), hy + s(6), s(14), s(6), shell, hi(shell), lo(shell));
    g.rect(cx - s(4), hy + s(7), s(3), s(3), t);
    g.rect(cx + 1, hy + s(7), s(3), s(3), t);
    g.dot(cx - s(3), hy + s(8), WHITE);
    g.dot(cx + s(3), hy + s(8), WHITE);
  }
  if (look === "crown") {
    g.rect(cx - s(7), hy + 1, s(14), s(3), t);
    g.dot(cx - s(7), hy, th);
    g.dot(cx, hy - s(2), WHITE);
    g.dot(cx + s(7), hy, th);
    g.rect(cx - s(4), hy + s(3), s(8), 1, th);
  }
  if (look === "hide") {
    g.block(cx - s(11), ty, s(22), s(16), t, th, tl);
    g.rect(cx - s(8), ty + s(3), s(16), s(3), th);
  }
  if (look === "stamp") {
    g.rect(cx - s(6), ty + s(3), s(12), s(8), t);
    g.rect(cx - s(5), ty + s(4), s(10), s(6), tl);
    g.dot(cx, ty + s(7), th);
  }
  if (look === "sash") {
    g.rect(cx - s(8), ty + s(4), s(18), s(3), t);
    g.rect(cx + s(3), ty + s(3), s(3), s(12), t);
    g.dot(cx, ty + s(4), th);
  }
  if (look === "hood") {
    g.block(cx - s(10), hy, s(20), s(7), t, th, tl);
    g.rect(cx - s(8), hy + s(3), s(4), s(8), tl);
    g.rect(cx + s(4), hy + s(3), s(4), s(8), tl);
    g.rect(cx - s(6), hy + 1, s(12), s(3), th);
  }
  if (look === "goggles") {
    g.rect(cx - s(8), hy + s(6), s(16), s(4), INK);
    g.rect(cx - s(6), hy + s(6), s(4), s(4), t);
    g.rect(cx + s(2), hy + s(6), s(4), s(4), t);
    g.dot(cx - s(4), hy + s(7), WHITE);
    g.dot(cx + s(4), hy + s(7), WHITE);
  }
  if (look === "band") {
    g.rect(cx - s(7), hy + s(4), s(14), s(3), t);
    g.dot(cx, hy + s(4), th);
  }
  if (look === "badge") {
    g.block(cx + s(4), ty + s(3), s(5), s(5), t, th, tl);
    g.dot(cx + s(6), ty + s(4), WHITE);
  }
  if (look === "plume") {
    g.rect(cx + s(4), hy - s(3), s(3), s(7), WHITE);
    g.dot(cx + s(5), hy - s(4), t);
    g.dot(cx + s(7), hy - 1, th);
  }
  if (look === "wrap") {
    g.rect(cx - s(7), ty + s(8), s(14), s(3), t);
    g.rect(cx - s(8), ty + s(10), s(4), s(7), t);
    g.rect(cx + s(5), ty + s(10), s(4), s(7), t);
  }
  if (look === "halo") {
    g.rect(cx - s(8), hy - s(3), s(16), s(2), t);
    g.rect(cx - s(6), hy - s(4), s(12), 1, th);
    g.dot(cx, hy - s(5), WHITE);
  }
  if (look === "gloves") {
    g.block(cx - s(13), ty + s(8), s(7), s(7), t, th, tl);
    g.block(cx + s(7), ty + s(8), s(7), s(7), t, th, tl);
    g.dot(cx - s(10), ty + s(10), WHITE);
    g.dot(cx + s(10), ty + s(10), WHITE);
  }
  if (look === "belt") {
    g.rect(cx - s(7), ty + s(8), s(14), s(4), t);
    g.rect(cx - 1, ty + s(8), s(4), s(4), INK);
    g.dot(cx, ty + s(9), th);
  }
  if (look === "ear") {
    g.block(cx - s(10), hy + s(5), s(4), s(5), t, th, tl);
    g.block(cx + s(6), hy + s(5), s(4), s(5), t, th, tl);
    g.dot(cx - s(8), hy + s(6), th);
  }
  if (look === "shorts") {
    g.block(cx - s(7), ty + s(7), s(14), s(7), t, th, tl);
    g.rect(cx - s(3), ty + s(8), s(6), s(3), th);
  }
  if (look === "tape") {
    g.rect(cx - s(7), ty + 1, s(14), s(3), t);
    g.rect(cx - s(8), ty + s(3), s(4), s(8), t);
    g.rect(cx + s(5), ty + s(3), s(4), s(8), t);
    g.dot(cx - s(6), ty + s(4), WHITE);
  }
  if (look === "cowl") {
    g.block(cx - s(8), hy + 1, s(16), s(11), t, th, tl);
    g.rect(cx - s(5), hy + s(5), s(4), s(3), INK);
    g.rect(cx + 1, hy + s(5), s(4), s(3), INK);
    g.dot(cx - s(3), hy + s(6), th);
    g.dot(cx + s(3), hy + s(6), th);
  }
  if (look === "web") {
    g.rect(cx - s(8), ty + s(3), s(16), 1, t);
    g.rect(cx - 1, ty, s(3), s(14), t);
    g.dot(cx - s(6), ty + s(6), th);
    g.dot(cx + s(6), ty + s(8), th);
  }
  if (look === "shield") {
    g.block(cx - s(14), ty + s(2), s(8), s(12), t, th, tl);
    g.rect(cx - s(12), ty + s(5), s(5), s(5), WHITE);
    g.dot(cx - s(10), ty + s(7), "#c4161c");
  }
  if (look === "hammer") {
    g.rect(cx + s(10), ty - s(3), s(3), s(14), "#6b4a2a");
    g.block(cx + s(7), ty - s(7), s(8), s(5), t, th, tl);
  }
  if (look === "bolt") {
    g.rect(cx + s(10), hy + s(2), s(3), s(12), t);
    g.dot(cx + s(11), hy + 1, WHITE);
    g.dot(cx + s(13), hy + s(5), th);
  }
  if (look === "lasso") {
    g.rect(cx + s(10), ty, s(3), s(13), t);
    g.rect(cx + s(8), ty - s(4), s(7), s(4), th);
  }
  if (look === "lantern") {
    g.block(cx + s(10), ty + 1, s(7), s(8), t, th, tl);
    g.rect(cx + s(11), ty, s(4), s(2), INK);
    g.dot(cx + s(13), ty + s(4), WHITE);
  }
  if (look === "claws") {
    g.rect(cx + s(12), ty + s(6), 1, s(7), t);
    g.rect(cx + s(14), ty + s(5), 1, s(8), th);
    g.rect(cx - s(13), ty + s(6), 1, s(7), t);
  }
  if (look === "gauntlet") {
    g.block(cx + s(8), ty + s(5), s(8), s(8), t, th, tl);
    g.dot(cx + s(11), ty + s(7), WHITE);
    g.dot(cx + s(14), ty + s(6), th);
  }
  if (look === "mouse" || look === "minnie") {
    g.block(cx - s(11), hy + 1, s(7), s(6), INK, "#3a2418", INK);
    g.block(cx + s(4), hy + 1, s(7), s(6), INK, "#3a2418", INK);
    g.rect(cx - s(4), hy + s(8), s(3), s(3), WHITE);
    g.rect(cx + 1, hy + s(8), s(3), s(3), WHITE);
    g.dot(cx - s(3), hy + s(9), INK);
    g.dot(cx + s(3), hy + s(9), INK);
    if (look === "minnie") {
      g.rect(cx + s(5), hy, s(5), s(3), t);
      g.dot(cx + s(8), hy - 1, th);
    }
  }
  if (look === "pooh") {
    g.block(cx - s(8), hy + 1, s(5), s(4), t, th, tl);
    g.block(cx + s(3), hy + 1, s(5), s(4), t, th, tl);
    g.block(cx + s(10), ty + s(5), s(6), s(7), "#c9a24a", "#ffe08a", "#8a6a18");
    g.dot(cx + s(12), ty + s(7), WHITE);
  }
  if (look === "tigger") {
    g.rect(cx - s(6), ty + s(3), s(12), s(3), INK);
    g.rect(cx - s(6), ty + s(8), s(12), s(3), INK);
    g.rect(cx - s(8), hy + s(2), s(3), s(6), t);
    g.rect(cx + s(5), hy + s(2), s(3), s(6), t);
  }
  if (look === "alice") {
    g.rect(cx - s(7), hy + s(2), s(14), s(3), t);
    g.rect(cx - s(6), ty + s(5), s(12), s(8), WHITE);
    g.rect(cx - s(3), ty + s(6), s(6), s(5), t);
  }
  if (look === "hatter") {
    g.block(cx - s(8), hy - s(3), s(16), s(5), t, th, tl);
    g.rect(cx - s(5), hy - s(7), s(10), s(4), tl);
    g.rect(cx + s(3), hy - s(5), s(4), s(3), WHITE);
    g.dot(cx + s(5), hy - s(4), INK);
  }
  if (look === "grin") {
    g.rect(cx - s(6), hy + s(10), s(12), s(3), t);
    g.dot(cx - s(4), hy + s(10), WHITE);
    g.dot(cx + s(4), hy + s(10), WHITE);
    g.rect(cx - s(3), hy + s(12), s(6), 1, INK);
  }
  if (look === "holmes") {
    g.block(cx - s(8), hy + 1, s(16), s(4), t, th, tl);
    g.rect(cx - s(3), hy, s(6), s(2), tl);
    g.rect(cx + s(8), hy + s(10), s(4), s(3), "#6b4a2a");
    g.dot(cx + s(10), hy + s(10), "#c9a24a");
  }
  if (look === "drac") {
    g.rect(cx - s(10), ty, s(5), s(14), t);
    g.rect(cx + s(5), ty, s(5), s(14), t);
    g.dot(cx - s(3), hy + s(11), WHITE);
    g.dot(cx + s(3), hy + s(11), WHITE);
  }
  if (look === "neckbolts") {
    g.block(cx - s(10), hy + s(10), s(4), s(4), "#cfd8dc", WHITE, "#6a767c");
    g.block(cx + s(6), hy + s(10), s(4), s(4), "#cfd8dc", WHITE, "#6a767c");
    g.rect(cx - s(4), hy + 1, s(8), s(3), t);
  }
  if (look === "felix") {
    g.block(cx - s(10), hy + 1, s(6), s(6), INK, "#3a2418", INK);
    g.block(cx + s(4), hy + 1, s(6), s(6), INK, "#3a2418", INK);
    g.rect(cx - s(4), hy + s(10), s(8), s(3), WHITE);
    g.dot(cx, hy + s(10), INK);
  }
  if (look === "oz") {
    g.rect(cx - s(7), hy + s(2), s(14), s(3), t);
    g.rect(cx - s(5), ty + s(10), s(4), s(3), "#cfd8dc");
    g.rect(cx + 1, ty + s(10), s(4), s(3), "#cfd8dc");
  }
  if (look === "robin") {
    g.block(cx - s(7), hy + 1, s(14), s(4), t, th, tl);
    g.rect(cx + s(5), hy - s(2), s(3), s(6), WHITE);
    g.dot(cx + s(6), hy - s(3), th);
  }
}
