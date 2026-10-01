import type { Sfx } from "./game/audio";
import { HEROES } from "./game/heroes";
import { playCreepVoice, playKitVoice, type CreepKind, type KitKind } from "./game/kitSounds";
import { bufferToWavUrl, playWavUrl, toneWavUrl } from "./wav";

type Clip = {
  name: string;
  ms: number;
  run: (sfx: Sfx) => void;
  kit?: { id: string; kind: KitKind };
  creep?: CreepKind;
  beep?: number;
};

let running = false;
let token = 0;
let onArm: () => void = () => undefined;
let sfxRef: Sfx | null = null;

function $(id: string): HTMLElement {
  return document.querySelector(`#${id}`)!;
}

function clips(): Clip[] {
  const list: Clip[] = [
    { name: "Proof beep", ms: 450, beep: 880, run: (s) => s.wake() },
    { name: "Mixer live", ms: 500, beep: 440, run: (s) => s.wake() },
    { name: "Entrance bell", ms: 900, beep: 523, run: (s) => s.ringBell() },
    { name: "Gong", ms: 800, beep: 58, run: (s) => s.gong() },
    { name: "Entrance sting", ms: 700, beep: 196, run: (s) => s.entrance() },
    { name: "The Star-Spangled Banner", ms: 3200, beep: 392, run: (s) => s.playAnthem() },
    { name: "Coin drop", ms: 500, beep: 1319, run: (s) => s.coin(1, false) },
    { name: "Coin heap", ms: 550, beep: 1760, run: (s) => s.coin(1, true) },
    { name: "Minion infantry", ms: 480, creep: "melee", run: (s) => s.minionHit("melee", 1) },
    { name: "Minion archer", ms: 480, creep: "ranged", run: (s) => s.minionHit("ranged", 1) },
    { name: "Jungle hog", ms: 520, creep: "wild", run: (s) => s.minionHit("wild", 1) },
    { name: "Minion down", ms: 420, beep: 390, run: (s) => s.minionDown(1) },
    { name: "Crit", ms: 480, beep: 880, run: (s) => s.crit(1) },
    { name: "Bash", ms: 500, beep: 58, run: (s) => s.bash(1) },
    { name: "Splash", ms: 480, beep: 560, run: (s) => s.splash(1) },
    { name: "Hog grunt", ms: 500, beep: 90, run: (s) => s.hog() },
  ];
  for (const h of HEROES) {
    list.push({ name: `${h.name} · swing`, ms: 480, kit: { id: h.id, kind: "swing" }, run: (s) => s.kitSwing(h.id, 1) });
    list.push({ name: `${h.name} · hit`, ms: 500, kit: { id: h.id, kind: "hit" }, run: (s) => s.kitHit(h.id, 1) });
    list.push({ name: `${h.name} · skill`, ms: 560, kit: { id: h.id, kind: "cast" }, run: (s) => s.kitCast(h.id, false, 1) });
  }
  list.push({ name: "Desk hit", ms: 450, beep: 392, run: (s) => s.deskHit() });
  list.push({ name: "Anthem back on", ms: 800, beep: 523, run: (s) => s.playAnthem() });
  return list;
}

let onSoundcheckLayer: () => void = () => undefined;

function setOpen(on: boolean): void {
  const panel = $("soundcheck");
  panel.hidden = !on;
  panel.classList.toggle("open", on);
  onSoundcheckLayer();
}

function paint(name: string, i: number, total: number, live: boolean): void {
  $("soundcheck-now").textContent = name;
  $("soundcheck-pos").textContent = `${i + 1} / ${total}`;
  $("soundcheck-status").textContent = live
    ? "Playing through this tab — Web Audio and an HTML audio element. Watch the native player below."
    : "Stopped.";
}

export function stopSoundcheck(): void {
  running = false;
  token += 1;
  setOpen(false);
  const el = document.querySelector("#soundcheck-el") as HTMLAudioElement | null;
  if (el) {
    el.pause();
    el.removeAttribute("src");
  }
}

export function isSoundcheckOpen(): boolean {
  const panel = document.querySelector("#soundcheck");
  return Boolean(panel && !panel.hasAttribute("hidden"));
}

export function dismissSoundcheck(): boolean {
  if (!isSoundcheckOpen()) return false;
  stopSoundcheck();
  sfxRef?.playAnthem();
  return true;
}

async function renderKit(id: string, kind: KitKind, seconds: number): Promise<string | null> {
  const Offline = window.OfflineAudioContext;
  if (!Offline) return null;
  const sr = 22050;
  const ctx = new Offline(1, Math.max(1, Math.floor(sr * seconds)), sr);
  const g = ctx.createGain();
  g.gain.value = 1.8;
  g.connect(ctx.destination);
  playKitVoice({ ctx, dest: g }, id, kind, 1);
  const buf = await ctx.startRendering();
  return bufferToWavUrl(buf);
}

async function renderCreep(kind: CreepKind, seconds: number): Promise<string | null> {
  const Offline = window.OfflineAudioContext;
  if (!Offline) return null;
  const sr = 22050;
  const ctx = new Offline(1, Math.max(1, Math.floor(sr * seconds)), sr);
  const g = ctx.createGain();
  g.gain.value = 1.8;
  g.connect(ctx.destination);
  playCreepVoice({ ctx, dest: g }, kind, 1);
  const buf = await ctx.startRendering();
  return bufferToWavUrl(buf);
}

async function playClip(sfx: Sfx, clip: Clip, el: HTMLAudioElement): Promise<void> {
  sfx.clearBusy();
  sfx.setMuted(false);
  clip.run(sfx);
  let url = "";
  try {
    if (clip.kit) url = (await renderKit(clip.kit.id, clip.kit.kind, clip.ms / 1000)) ?? "";
    else if (clip.creep) url = (await renderCreep(clip.creep, clip.ms / 1000)) ?? "";
    else if (clip.beep) url = toneWavUrl(clip.beep, Math.min(0.35, clip.ms / 1000));
  } catch {
    url = clip.beep ? toneWavUrl(clip.beep, 0.25) : "";
  }
  if (url) {
    await playWavUrl(url, el, clip.ms + 80);
    URL.revokeObjectURL(url);
    return;
  }
  await new Promise<void>((resolve) => window.setTimeout(resolve, clip.ms));
}

export async function startSoundcheck(): Promise<void> {
  const sfx = sfxRef;
  if (!sfx) return;
  onArm();
  running = true;
  const my = (token += 1);
  setOpen(true);
  const el = $("soundcheck-el") as HTMLAudioElement;
  el.muted = false;
  el.volume = 1;
  const list = clips();
  $("soundcheck-total").textContent = `${list.length} clips`;
  sfx.setMuted(false);
  sfx.setCombatVol(1);
  sfx.setDeskVol(1);
  sfx.setMusicVol(1);
  void sfx.unlock();
  sfx.stopAnthem();
  for (let i = 0; i < list.length; i++) {
    if (!running || my !== token) return;
    const clip = list[i]!;
    paint(clip.name, i, list.length, true);
    const t0 = Date.now();
    await playClip(sfx, clip, el);
    if (!running || my !== token) return;
    const wait = Math.max(80, clip.ms - (Date.now() - t0));
    await new Promise<void>((resolve) => window.setTimeout(resolve, wait));
    if (clip.name === "The Star-Spangled Banner") sfx.stopAnthem();
  }
  if (my === token) {
    running = false;
    paint("Catalog done", list.length - 1, list.length, false);
    $("soundcheck-status").textContent = "Catalog done. The anthem stays on. Hit Play every sound to hear it again.";
    sfx.playAnthem();
  }
}

export function mountSoundcheck(opts: { sfx: Sfx; onArm: () => void; onLayer?: () => void }): void {
  sfxRef = opts.sfx;
  onArm = opts.onArm;
  onSoundcheckLayer = opts.onLayer ?? (() => undefined);
  const mix = document.querySelector("#mix-out") as HTMLAudioElement | null;
  if (mix) opts.sfx.hookMix(mix);
  $("soundcheck-play").addEventListener("click", () => {
    void startSoundcheck();
  });
  $("soundcheck-stop").addEventListener("click", () => {
    stopSoundcheck();
    opts.sfx.playAnthem();
  });
  $("soundcheck-back").addEventListener("click", () => {
    opts.sfx.click();
    dismissSoundcheck();
  });
  document.querySelector("#btn-soundcheck")?.addEventListener("click", () => {
    void startSoundcheck();
  });
  document.querySelector("#sound-test-all")?.addEventListener("click", () => {
    void startSoundcheck();
  });
}
