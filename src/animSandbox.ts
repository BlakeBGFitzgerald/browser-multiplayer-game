import { DLC } from "./dlc";
import { HEROES } from "./game/heroes";
import { drawPixelHero, poseFrame, type PixelPose } from "./game/pixelPaint";
import { GAMEPLAY_POSES } from "./game/pixelC32";
import { skinMotionAudit } from "./game/skinMotion";

export function isAnimTestMode(): boolean {
  if (typeof location === "undefined") return false;
  const q = new URLSearchParams(location.search);
  return q.get("anim-test") === "1" || location.hash === "#anim-sandbox";
}

export function isSkinReelMode(): boolean {
  if (typeof location === "undefined") return false;
  return new URLSearchParams(location.search).get("skin-reel") === "1";
}

export function isAnimMatchMode(): boolean {
  if (typeof location === "undefined") return false;
  return new URLSearchParams(location.search).get("anim-match") === "1";
}

const HOLD: Record<PixelPose, number> = {
  idle: 1.1,
  walk: 1.6,
  attack: 1.15,
  cast: 1.05,
  ult: 1.25,
  hurt: 0.7,
  death: 1.15,
  victory: 0.8,
  portrait: 0.4,
};

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function hideLiveChrome(): void {
  document.querySelectorAll<HTMLElement>(".page").forEach((el) => {
    if (el.id !== "anim-sandbox") el.hidden = true;
  });
  const view = document.getElementById("view");
  if (view) view.hidden = true;
  const hud = document.getElementById("hud");
  if (hud) hud.hidden = true;
  const flag = document.getElementById("flag");
  if (flag) flag.style.display = "none";
  const rubble = document.getElementById("rubble");
  if (rubble) rubble.style.display = "none";
  const rail = document.getElementById("rail");
  if (rail) rail.hidden = true;
  document.body.classList.add("anim-sandbox-open");
}

function bindAnimBack(): void {
  const btn = document.querySelector<HTMLButtonElement>("#an-back");
  if (!btn || btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";
  btn.addEventListener("click", () => {
    location.href = location.pathname;
  });
}

export function bootAnimSandbox(): void {
  hideLiveChrome();
  bindAnimBack();
  $("anim-sandbox").hidden = false;
  const canvas = document.querySelector<HTMLCanvasElement>("#an-canvas")!;
  const ctx = canvas.getContext("2d")!;
  let heroI = 0;
  let poseI = 0;
  let t = 0;
  let hold = 0;
  let paused = false;
  const done = new Set<string>();

  const poses = GAMEPLAY_POSES;

  function paintList(): void {
    $("an-roster").innerHTML = HEROES.map((h, i) => {
      const on = i === heroI ? "on" : "";
      const mark = done.has(h.id) ? "done" : "";
      return `<li class="${on} ${mark}"><b>${h.name}</b> <em>${h.dlc ? "DLC" : "FREE"} · ${h.wing}</em></li>`;
    }).join("");
  }

  function paintHud(): void {
    const h = HEROES[heroI]!;
    const pose = poses[poseI]!;
    $("an-hero").textContent = `${heroI + 1} / ${HEROES.length}  ${h.name}  ${h.dlc ? "DLC" : "FREE"}  ${h.wing}`;
    $("an-pose").textContent = pose.toUpperCase();
    $("an-status").textContent = paused ? "Paused" : `Cycling every playable kit. ${done.size} / ${HEROES.length} finished.`;
  }

  let last = 0;
  function frame(now: number): void {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (!paused) {
      t += dt;
      hold += dt;
      const pose = poses[poseI]!;
      if (hold >= (HOLD[pose] ?? 1)) {
        hold = 0;
        t = 0;
        poseI += 1;
        if (poseI >= poses.length) {
          done.add(HEROES[heroI]!.id);
          poseI = 0;
          heroI = (heroI + 1) % HEROES.length;
        }
      }
    }
    const h = HEROES[heroI]!;
    const pose = poses[poseI]!;
    const swing = pose === "attack" ? Math.min(1, hold / (HOLD.attack ?? 1)) : pose === "cast" ? 0.38 - hold * 0.3 : pose === "ult" ? 0.55 - hold * 0.4 : 0;
    const fr = poseFrame(pose, t, Math.max(0, swing));
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0b0a08";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1610";
    ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);
    drawPixelHero(ctx, h.id, canvas.width / 2, canvas.height / 2 + 48, pose, fr, 1);
    ctx.fillStyle = "#efe6d6";
    ctx.font = "700 14px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${h.name} · ${pose} · f${fr}`, canvas.width / 2, 28);
    paintHud();
    paintList();
    requestAnimationFrame(frame);
  }

  $("an-pause").addEventListener("click", () => {
    paused = !paused;
    $("an-pause").textContent = paused ? "Resume" : "Pause";
  });
  $("an-next").addEventListener("click", () => {
    done.add(HEROES[heroI]!.id);
    heroI = (heroI + 1) % HEROES.length;
    poseI = 0;
    hold = 0;
    t = 0;
  });
  $("an-prev").addEventListener("click", () => {
    heroI = (heroI - 1 + HEROES.length) % HEROES.length;
    poseI = 0;
    hold = 0;
    t = 0;
  });
  $("an-match").addEventListener("click", () => {
    location.href = `${location.pathname}?anim-match=1`;
  });

  paintHud();
  paintList();
  requestAnimationFrame(frame);
}

/** Every shelf skin, idle / walk / attack / cast, on the same painter the match uses. */
export function bootSkinReel(): void {
  document.title = "skin-reel";
  hideLiveChrome();
  bindAnimBack();
  $("anim-sandbox").hidden = false;
  const canvas = document.querySelector<HTMLCanvasElement>("#an-canvas")!;
  const ctx = canvas.getContext("2d")!;
  const per = 6;
  const requested = Number(new URLSearchParams(location.search).get("page") ?? "0");
  let page = Number.isFinite(requested) ? Math.max(0, requested) : 0;
  const pages = Math.ceil(DLC.length / per);
  page = Math.min(page, pages - 1);
  const problems = skinMotionAudit();
  canvas.width = 1180;
  canvas.height = 860;

  function paint(now: number): void {
    const t = now / 1000;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0b0a08";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const rows = DLC.slice(page * per, page * per + per);
    ctx.fillStyle = "#efe6d6";
    ctx.font = "700 13px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `Skins ${page * per + 1}–${page * per + rows.length} / ${DLC.length}   ${problems.length ? problems[0] : "motion signatures ok"}`,
      16,
      22,
    );
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillText("base idle · skin idle · skin walk · skin attack · skin cast", 16, 40);
    rows.forEach((skin, i) => {
      const y = 150 + i * 130;
      const hero = skin.hero;
      ctx.fillStyle = "#241c14";
      ctx.fillRect(8, y - 100, canvas.width - 16, 120);
      drawPixelHero(ctx, hero, 90, y, "idle", poseFrame("idle", t, 0), 1);
      drawPixelHero(ctx, hero, 280, y, "idle", poseFrame("idle", t, 0), 1, skin.id);
      drawPixelHero(ctx, hero, 470, y, "walk", poseFrame("walk", t, 0), 1, skin.id);
      drawPixelHero(ctx, hero, 660, y, "attack", poseFrame("attack", t, 0.35), 1, skin.id);
      drawPixelHero(ctx, hero, 850, y, "cast", poseFrame("cast", t, 0.2), 1, skin.id);
      ctx.fillStyle = "#efe6d6";
      ctx.fillText(`${skin.name} · ${skin.look}`, 960, y - 20);
    });
    $("an-hero").textContent = `Skin reel ${page + 1} / ${pages}`;
    $("an-pose").textContent = problems.length ? `${problems.length} motion issues` : "Signatures differ";
    $("an-status").textContent = "Same painter as a match. Next page advances the shelf.";
    requestAnimationFrame(paint);
  }

  $("an-next").addEventListener("click", () => {
    page = (page + 1) % pages;
  });
  $("an-prev").addEventListener("click", () => {
    page = (page - 1 + pages) % pages;
  });
  requestAnimationFrame(paint);
}
