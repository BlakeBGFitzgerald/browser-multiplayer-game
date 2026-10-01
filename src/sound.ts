import type { Sfx } from "./game/audio";
import type { Mic } from "./mic";
import { radioVol, setRadioVolume } from "./radio";

const STORE = "cu-sound";

type SoundSave = { combat: number; desk: number };

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function loadSave(): SoundSave {
  const empty: SoundSave = { combat: 1, desk: 0.9 };
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<SoundSave>;
    return {
      combat: parsed.combat === undefined ? empty.combat : clamp01(Number(parsed.combat)),
      desk: parsed.desk === undefined ? empty.desk : clamp01(Number(parsed.desk)),
    };
  } catch {
    return empty;
  }
}

function $(id: string): HTMLElement {
  return document.querySelector(`#${id}`)!;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function meterHtml(level: number): string {
  const n = Math.max(0, Math.min(8, Math.round(level * 8)));
  return Array.from({ length: 8 }, (_, i) => `<i class="${i < n ? (i >= 6 ? "hot" : "on") : ""}"></i>`).join("");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function micOption(d: { id: string; label: string; kind: string }): string {
  const tag = d.kind === "usb" ? "USB" : d.kind === "phone" ? "Phone" : d.kind === "computer" ? "Computer" : "Mic";
  return `<option value="${esc(d.id)}">${tag} · ${esc(d.label)}</option>`;
}

export function isSoundOpen(): boolean {
  return document.body.classList.contains("sound-open");
}

let setSoundOpen: (on: boolean) => void = () => undefined;

export function closeSound(): boolean {
  if (!isSoundOpen()) return false;
  setSoundOpen(false);
  return true;
}

export function mountSound(opts: { sfx: Sfx; demo: Sfx; mic: Mic; onArm: () => void; onLayer?: () => void }): void {
  const save = loadSave();
  opts.sfx.setCombatVol(save.combat);
  opts.sfx.setDeskVol(save.desk);
  opts.sfx.setMusicVol(radioVol());
  opts.demo.setCombatVol(save.combat);
  opts.demo.setDeskVol(save.desk);
  opts.demo.setMusicVol(radioVol());

  const fab = $("sound-fab");
  const panel = $("sound");
  const status = $("sound-status");
  const start = $("sound-start") as HTMLButtonElement;
  const combat = $("sound-combat") as HTMLInputElement;
  const desk = $("sound-desk") as HTMLInputElement;
  const music = $("sound-music") as HTMLInputElement;
  const micSel = $("sound-mic") as HTMLSelectElement;

  function persist(): void {
    localStorage.setItem(STORE, JSON.stringify(save));
  }

  function applyCombat(): void {
    opts.sfx.setCombatVol(save.combat);
    opts.demo.setCombatVol(save.combat);
  }

  function applyDesk(): void {
    opts.sfx.setDeskVol(save.desk);
    opts.demo.setDeskVol(save.desk);
  }

  function paint(): void {
    const live = opts.sfx.ready();
    start.textContent = live ? "Audio live" : "Start audio";
    start.className = live ? "thin" : "gold";
    start.disabled = live;
    status.textContent = live
      ? "Combat, desk, and the anthem each have a fader. The mix is loud. Each kit has its own original hit. HUD Mute cuts the anthem. Combat keeps playing."
      : "Browsers keep this tab silent until a click. Enter with sound, then combat, desk, and the anthem play.";
    if (document.activeElement !== combat) combat.value = String(Math.round(save.combat * 100));
    if (document.activeElement !== desk) desk.value = String(Math.round(save.desk * 100));
    if (document.activeElement !== music) music.value = String(Math.round(radioVol() * 100));
    $("sound-combat-out").textContent = save.combat <= 0 ? "Off" : pct(save.combat);
    $("sound-desk-out").textContent = save.desk <= 0 ? "Off" : pct(save.desk);
    const mv = radioVol();
    $("sound-music-out").textContent = mv <= 0 ? "Off" : pct(mv);
    paintMicList();
  }

  function paintMicList(): void {
    const devices = opts.mic.devices;
    const cur = opts.mic.deviceId;
    const focused = document.activeElement === micSel;
    if (!focused) {
      micSel.innerHTML = devices.length
        ? devices.map((d) => micOption(d)).join("")
        : `<option value="">Allow the mic — then this list fills (USB codec, computer, phone)</option>`;
      if (cur && devices.some((d) => d.id === cur)) micSel.value = cur;
    }
    $("sound-mic-out").textContent = opts.mic.deviceLabel
      ? opts.mic.deviceLabel
      : devices.length
        ? "Pick an input"
        : "Not found";
  }

  function setOpen(on: boolean): void {
    panel.hidden = !on;
    panel.classList.toggle("open", on);
    document.body.classList.toggle("sound-open", on);
    fab.setAttribute("aria-expanded", on ? "true" : "false");
    fab.textContent = on ? "Close sound" : "Sound";
    if (on) paint();
    opts.onLayer?.();
  }
  setSoundOpen = setOpen;

  fab.addEventListener("click", () => setOpen(panel.hasAttribute("hidden")));
  $("sound-close").addEventListener("click", () => setOpen(false));
  document.querySelector("#btn-sound")?.addEventListener("click", () => {
    opts.onArm();
    setOpen(true);
  });
  start.addEventListener("click", () => {
    opts.onArm();
    setRadioVolume(radioVol());
    void opts.sfx.unlock().then(() => {
      opts.sfx.clink("hero", 0.8);
      paint();
    });
  });
  $("sound-test-combat").addEventListener("click", () => {
    opts.onArm();
    opts.sfx.previewFight();
  });
  $("sound-test-desk").addEventListener("click", () => {
    opts.onArm();
    opts.sfx.ringBell();
    window.setTimeout(() => opts.sfx.gong(), 220);
  });
  combat.addEventListener("input", () => {
    save.combat = clamp01(Number(combat.value) / 100);
    persist();
    applyCombat();
    paint();
  });
  desk.addEventListener("input", () => {
    save.desk = clamp01(Number(desk.value) / 100);
    persist();
    applyDesk();
    paint();
  });
  music.addEventListener("input", () => {
    const v = clamp01(Number(music.value) / 100);
    setRadioVolume(v);
    opts.sfx.setMusicVol(v);
    opts.demo.setMusicVol(v);
    paint();
  });
  $("sound-find-mic").addEventListener("click", () => {
    opts.onArm();
    void opts.mic.find().then(() => paint());
  });
  micSel.addEventListener("change", () => {
    const id = micSel.value;
    if (!id) return;
    opts.onArm();
    void opts.mic.pick(id).then(() => paint());
  });
  opts.mic.onList(() => {
    if (isSoundOpen()) paint();
  });

  paint();
}

export function soundTick(sfx: Sfx, talk?: Mic): void {
  const panel = document.querySelector("#sound");
  if (!panel || panel.hasAttribute("hidden")) return;
  const peak = sfx.peak();
  const combat = sfx.ready() ? Math.max(peak, sfx.combatVol > 0 ? peak : 0) : 0;
  $("sound-combat-meter").innerHTML = meterHtml(combat * (sfx.combatVol > 0 ? 1 : 0));
  $("sound-desk-meter").innerHTML = meterHtml(peak * (sfx.deskVol > 0 ? 1 : 0));
  $("sound-music-meter").innerHTML = meterHtml(radioVol() > 0 ? Math.max(0.12, radioVol() * 0.45 + peak * 0.7) : 0);
  const micMeter = document.querySelector("#sound-mic-meter");
  if (micMeter) micMeter.innerHTML = meterHtml(talk?.level ?? 0);
  const start = $("sound-start") as HTMLButtonElement;
  const live = sfx.ready();
  if (start.disabled !== live) {
    start.textContent = live ? "Audio live" : "Start audio";
    start.className = live ? "thin" : "gold";
    start.disabled = live;
  }
  $("sound-status").textContent = live
    ? "Combat, desk, and the anthem each have a fader. The mix is loud. Each kit has its own original hit. HUD Mute cuts the anthem. Combat keeps playing."
    : "Browsers keep this tab silent until a click. Enter with sound, then combat, desk, and the anthem play.";
}
