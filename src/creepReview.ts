import { drawCreepPix, type CreepSprite } from "./game/creepPix";
import { drawPixelHero } from "./game/pixelPaint";

export function isCreepReviewMode(): boolean {
  if (typeof location === "undefined") return false;
  return new URLSearchParams(location.search).get("creep-review") === "1";
}

type Row = {
  label: string;
  base: Omit<CreepSprite, "x" | "y" | "time" | "swing" | "walk" | "stride" | "hurt" | "dead" | "barkT" | "facing">;
};

const ROWS: Row[] = [
  { label: "MAGA infantry", base: { team: "home", caster: false, name: "Infantry", color: "#6a90c4", r: 15, id: 1 } },
  { label: "Antifa infantry", base: { team: "away", caster: false, name: "Infantry", color: "#c45c5c", r: 15, id: 2 } },
  { label: "MAGA archer", base: { team: "home", caster: true, name: "Archer", color: "#c9e4a8", r: 12, id: 3 } },
  { label: "Antifa archer", base: { team: "away", caster: true, name: "Archer", color: "#e8c08a", r: 12, id: 4 } },
  { label: "Mall boar pup", base: { team: "home", caster: false, wild: true, name: "Mall Oaks pup", color: "#8a5a28", r: 13, id: 5 } },
  { label: "Mall boar", base: { team: "home", caster: false, wild: true, name: "Mall Oaks", color: "#8a5a28", r: 18, id: 6 } },
  { label: "Grove fawn", base: { team: "home", caster: false, wild: true, name: "Reflecting Grove pup", color: "#8a5a28", r: 13, id: 7 } },
  { label: "Grove stag", base: { team: "home", caster: false, wild: true, name: "Reflecting Grove", color: "#8a5a28", r: 18, id: 8 } },
  { label: "Rainier cub", base: { team: "home", caster: false, wild: true, name: "Rainier Stand pup", color: "#4a7a62", r: 13, id: 9 } },
  { label: "Rainier bear", base: { team: "home", caster: false, wild: true, name: "Rainier Stand", color: "#4a7a62", r: 18, id: 10 } },
  { label: "Elliott kit", base: { team: "home", caster: false, wild: true, name: "Elliott Thicket pup", color: "#4a7a62", r: 13, id: 11 } },
  { label: "Elliott cat", base: { team: "home", caster: false, wild: true, name: "Elliott Thicket", color: "#4a7a62", r: 18, id: 12 } },
  { label: "River Warden", base: { team: "home", caster: false, wild: true, name: "River Warden", objectiveId: "warden", color: "#f0c14a", r: 26, id: 13 } },
  { label: "The Ancient", base: { team: "home", caster: false, wild: true, name: "The Ancient", objectiveId: "ancient-beast", color: "#c4161c", r: 32, id: 14 } },
  { label: "Capitol Alpha", base: { team: "home", caster: false, wild: true, name: "Capitol Alpha", objectiveId: "capitol-alpha", color: "#c9a24a", r: 20, id: 15 } },
  { label: "Bay Alpha", base: { team: "home", caster: false, wild: true, name: "Bay Alpha", objectiveId: "bay-alpha", color: "#3ec8c1", r: 20, id: 16 } },
];

function hideChrome(): void {
  document.querySelectorAll<HTMLElement>(".page").forEach((el) => {
    el.hidden = true;
  });
  const hud = document.getElementById("hud");
  if (hud) hud.hidden = true;
  const flag = document.getElementById("flag");
  if (flag) flag.style.display = "none";
  const rubble = document.getElementById("rubble");
  if (rubble) rubble.style.display = "none";
  const rail = document.getElementById("rail");
  if (rail) rail.hidden = true;
}

export function bootCreepReview(): void {
  hideChrome();
  const canvas = document.querySelector<HTMLCanvasElement>("#view");
  if (!canvas) return;
  canvas.hidden = false;
  canvas.width = 1680;
  canvas.height = 980;
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = "40";
  canvas.style.background = "#142018";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const poseName = new URLSearchParams(location.search).get("pose") ?? "walk";
  const pose =
    poseName === "idle"
      ? { swing: 1, walk: false, stride: 0, hurt: 0, dead: false, barkT: 0 }
      : poseName === "strike"
        ? { swing: 0.42, walk: true, stride: 1, hurt: 0, dead: false, barkT: 0 }
        : poseName === "hurt"
          ? { swing: 1, walk: false, stride: 0, hurt: 0.16, dead: false, barkT: 0 }
          : poseName === "down"
            ? { swing: 1, walk: false, stride: 0, hurt: 0, dead: true, barkT: 0.12 }
            : { swing: 1, walk: true, stride: 1, hurt: 0, dead: false, barkT: 0 };

  const paint = (t: number) => {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#142018";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff6e4";
    ctx.font = "700 16px 'IBM Plex Mono', monospace";
    ctx.fillText(`Creep roster · ${poseName} · Grump is the height benchmark`, 24, 28);
    drawPixelHero(ctx, "maga-grumptor", 80, 168, pose.walk ? "walk" : "idle", pose.walk ? Math.floor(t * 14) % 8 : 0, 1);
    ctx.fillStyle = "#c9a24a";
    ctx.font = "12px 'IBM Plex Mono', monospace";
    ctx.fillText("Grump", 58, 188);

    ROWS.forEach((row, i) => {
      const col = i % 8;
      const line = Math.floor(i / 8);
      const x = 240 + col * 175;
      const y = 230 + line * 370;
      ctx.fillStyle = "#243228";
      ctx.fillRect(x - 50, y + (row.base.r ?? 14) + 5, 100, 3);
      ctx.fillStyle = "#efe6d6";
      ctx.font = "700 12px 'IBM Plex Mono', monospace";
      ctx.fillText(row.label, x - 54, y - 130);
      const sprite: CreepSprite = {
        ...row.base,
        x,
        y,
        time: t,
        facing: 0,
        walk: pose.walk,
        walkRate: 0.93,
        stride: pose.stride,
        swing: pose.swing,
        hurt: pose.hurt,
        dead: pose.dead,
        barkT: pose.barkT,
      };
      drawCreepPix(ctx, sprite);
    });
  };

  let last = 0;
  const loop = (now: number) => {
    last = now / 1000;
    paint(last);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
