/** Live DAG sketch for the Millix page. Edges only run forward in time. */

type Node = { x: number; y: number; layer: number; label?: string };

type Edge = { a: number; b: number };

const LAYERS = [1, 3, 4, 4, 3, 2];
const LABELS = ["send", "proxy", "peers", "peers", "stable", "rest"];

function layout(w: number, h: number): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const padX = 36;
  const padY = 28;
  const inner = Math.max(120, w - padX * 2);
  const tall = Math.max(80, h - padY * 2);
  for (let layer = 0; layer < LAYERS.length; layer++) {
    const count = LAYERS[layer]!;
    const x = padX + (layer / (LAYERS.length - 1)) * inner;
    for (let i = 0; i < count; i++) {
      const y = count === 1 ? padY + tall / 2 : padY + (i / (count - 1)) * tall;
      nodes.push({
        x,
        y,
        layer,
        label: i === Math.floor((count - 1) / 2) ? LABELS[layer] : undefined,
      });
    }
  }
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const from = nodes[i]!;
    for (let j = i + 1; j < nodes.length; j++) {
      const to = nodes[j]!;
      if (to.layer !== from.layer + 1) continue;
      const sameBand = Math.abs(to.y - from.y) < tall * 0.62 || from.layer === 0 || to.layer === LAYERS.length - 1;
      if (!sameBand && (i + j) % 2 === 0) continue;
      edges.push({ a: i, b: j });
    }
  }
  return { nodes, edges };
}

function arrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string, width: number): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const sx = x1 + ux * 9;
  const sy = y1 + uy * 9;
  const ex = x2 - ux * 9;
  const ey = y2 - uy * 9;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - ux * 7 + uy * 3.4, ey - uy * 7 - ux * 3.4);
  ctx.lineTo(ex - ux * 7 - uy * 3.4, ey - uy * 7 + ux * 3.4);
  ctx.closePath();
  ctx.fill();
}

/** Draw a directed acyclic graph. Gold pulse is one transaction walking proxy → peers → rest. */
export function drawDag(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0b0a08";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(201,162,74,0.35)";
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  const { nodes, edges } = layout(w, h);
  const hop = Math.floor(t * 0.55) % (LAYERS.length - 1);
  const live = new Set<number>();
  for (const e of edges) {
    if (nodes[e.a]!.layer === hop && nodes[e.b]!.layer === hop + 1) live.add(e.a * 100 + e.b);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const e of edges) {
    const a = nodes[e.a]!;
    const b = nodes[e.b]!;
    const on = live.has(e.a * 100 + e.b);
    arrow(ctx, a.x, a.y, b.x, b.y, on ? "#c9a24a" : "rgba(62,200,193,0.28)", on ? 1.8 : 1);
  }
  ctx.font = "600 10px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]!;
    const on = n.layer === hop || n.layer === hop + 1;
    ctx.beginPath();
    ctx.fillStyle = on ? "#c9a24a" : n.layer === 0 ? "#c4161c" : n.layer === LAYERS.length - 1 ? "#3ec8c1" : "#8a7a5a";
    ctx.arc(n.x, n.y, on ? 6.5 : 4.6, 0, Math.PI * 2);
    ctx.fill();
    if (n.label) {
      ctx.fillStyle = on ? "#efe6d6" : "#b9a888";
      ctx.fillText(n.label, n.x, n.y - 10);
    }
  }
  const step =
    hop === 0
      ? "Sender picks a random node as proxy."
      : hop === 1
        ? "Proxy checks history. No double spend, then it fans out."
        : hop === 2 || hop === 3
          ? "Peers validate on their own and compare answers."
          : "The transaction stabilizes, then hibernates. It does not loop back.";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#c9a24a";
  ctx.font = "500 11px 'IBM Plex Mono', monospace";
  ctx.fillText(step, 12, h - 10);
}
