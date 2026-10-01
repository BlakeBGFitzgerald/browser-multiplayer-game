const STORE = "cu-radio";
const ARTIST_ID = "0SKIyzX22RVmwIjrATmxtV";
export const ARTIST_URL = `https://open.spotify.com/artist/${ARTIST_ID}`;
const IFRAME_API = "https://open.spotify.com/embed/iframe-api/v1";
/** One-time locker gold for linking Spotify. */
export const SPOTIFY_LINK_GOLD = 1000;
const SPOTIFY_LOGIN = `https://accounts.spotify.com/en/login?continue=${encodeURIComponent(ARTIST_URL)}`;

export type RadioTrack = {
  title: string;
  album: string;
  secs: number;
  uri: string;
};

/** Lil Hooligan only. Remasters of the same song are skipped. Campus holds the rights. */
export const HOOLIGAN_TRACKS: RadioTrack[] = [
  { title: "Good Night Kiss", album: "Good Night Kiss", secs: 205, uri: "spotify:track:2I1Vz4BHK0W9lZNT7m07AT" },
  { title: "Get Up", album: "Waste of Space", secs: 174, uri: "spotify:track:1gOtAdHE3azIWKYhECmgwv" },
  { title: "Don't Give A Fuck", album: "Waste of Space", secs: 177, uri: "spotify:track:6DNaI0LCeRj3VWP8xiPNXo" },
  { title: "Die Tonight", album: "Waste of Space", secs: 186, uri: "spotify:track:3ALhCQdQdyRfsT0sUqxmly" },
  { title: "Goth Girl", album: "Waste of Space", secs: 101, uri: "spotify:track:7hURoiZZ3UECpmPKUTnPb0" },
  { title: "This Shit Is Over", album: "Waste of Space", secs: 217, uri: "spotify:track:7MxkgnWY4JmqsIZPhKBIVL" },
  { title: "Rewind (feat. B-BOY-HOLDER) (Studio)", album: "Rewind (Studio)", secs: 104, uri: "spotify:track:0BUQj5vfvWNIxkOWihZCCk" },
  { title: "Can't Get Sober! (Studio)", album: "Wasted Potential", secs: 109, uri: "spotify:track:1dF9ghx4K7IQf0JZgA3r71" },
  { title: "All Outta Love", album: "Wasted Potential", secs: 126, uri: "spotify:track:4QrnGonv5mKUW77E4YOLvv" },
  { title: "Jaded", album: "Wasted Potential", secs: 192, uri: "spotify:track:35cWLKp7SHjZOn5fvRf5yb" },
  { title: "Sleep when It's Over!", album: "Wasted Potential", secs: 131, uri: "spotify:track:71mVuV7rgcugAofGNH6xuy" },
  { title: "Sick And I'm Bored!", album: "Wasted Potential", secs: 157, uri: "spotify:track:00qpV5UKhVdxOViIDSp09o" },
  { title: "Depth Charge", album: "Wasted Potential", secs: 166, uri: "spotify:track:3QKFUSFB4xc85HIGlTjgm0" },
  { title: "All Night", album: "Wasted Acoustics", secs: 154, uri: "spotify:track:0V8zuCzaDgTGpFmPsgXiYr" },
  { title: "Nothing", album: "Wasted Acoustics", secs: 180, uri: "spotify:track:7a3P8In80DP4nppCxx6nWt" },
  { title: "Make Me Smile", album: "Wasted Acoustics", secs: 192, uri: "spotify:track:4egAhCvZpbWusjSttZO2X4" },
  { title: "Asshole", album: "Wasted Acoustics", secs: 238, uri: "spotify:track:1A2CZRTCYv6mH4Eo9qyXBA" },
  { title: "Jennifer", album: "Wasted Acoustics", secs: 155, uri: "spotify:track:3MgVjBKvTcKNmb56k5OhvM" },
  { title: "Last Goodbye", album: "Wasted Acoustics", secs: 184, uri: "spotify:track:4fNr8N345MPaGSQTZ84BYf" },
  { title: "Meant To Be", album: "Wasted Acoustics", secs: 178, uri: "spotify:track:7pqIjMYKX1ZEjDA3ModSmi" },
  { title: "Hoes & Hooligans", album: "That's Not Punk?", secs: 183, uri: "spotify:track:5KGx8LrAyMflQdxC00BZEf" },
  { title: "Just A Memory", album: "That's Not Punk?", secs: 163, uri: "spotify:track:6FvHJCDdwMdMuvEisAbtbs" },
  { title: "How We Do!", album: "That's Not Punk?", secs: 75, uri: "spotify:track:1q8YmMV1Kzg57vczA5yvYT" },
  { title: "If I Ever (interlude)", album: "That's Not Punk?", secs: 28, uri: "spotify:track:24UVWNKT1qv5X2XyDSwPC5" },
  { title: "Open Season", album: "That's Not Punk?", secs: 174, uri: "spotify:track:67XHmy8s0CG4MpWwj52vNw" },
  { title: "Stitches Are For Bitches", album: "That's Not Punk?", secs: 157, uri: "spotify:track:26v4DvOArzp3zD6pnGX3qw" },
  { title: "The Unknown", album: "That's Not Punk?", secs: 92, uri: "spotify:track:6roTDsvU2saoHh8e26pDop" },
  { title: "Whats Your Problem?", album: "She Told Me To Chef Myself!", secs: 134, uri: "spotify:track:0ktM8gxc6RbqGJoRXObyDG" },
  { title: "Not The Same!", album: "She Told Me To Chef Myself!", secs: 135, uri: "spotify:track:5vZ5hoAjgFtBPu5Miz5Ms8" },
  { title: "Give Ya dog A Bone!", album: "She Told Me To Chef Myself!", secs: 282, uri: "spotify:track:77v7wt0U1v71dLcS1U9HgH" },
  { title: "Taste Of Lipstick", album: "She Told Me To Chef Myself!", secs: 217, uri: "spotify:track:7fnd99m8AowG9r60RraEYZ" },
  { title: "Coming Undone!", album: "She Told Me To Chef Myself!", secs: 278, uri: "spotify:track:3sBugQaIILAyK1RNGP3GdQ" },
];

const ALLOWED = new Set(HOOLIGAN_TRACKS.map((t) => t.uri));

type RadioSave = {
  on: boolean;
  day: string;
  done: boolean;
  index: number;
  vol: number;
};

type SpotifyPlayback = {
  isPaused?: boolean;
  duration?: number;
  position?: number;
  playingURI?: string;
  uri?: string;
};

type SpotifyController = {
  loadUri: (uri: string, preferVideo?: boolean, timestamp?: number) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  addListener: (event: string, handler: (e: { data: SpotifyPlayback }) => void) => void;
  iframeElement?: HTMLIFrameElement;
  sendMessageToEmbed?: (message: Record<string, unknown>) => void;
  setVolume?: (volume: number) => void;
};

type SpotifyIFrameApi = {
  createController: (
    el: HTMLElement,
    options: { uri: string; width?: number | string; height?: number | string; theme?: string },
    cb: (controller: SpotifyController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
  }
}

let save: RadioSave = loadSave();
let controller: SpotifyController | null = null;
let gestured = false;
let wantUri = "";
let durationSec = 0;
let openList = false;
let onRadioLayer: () => void = () => undefined;

export function isRadioListOpen(): boolean {
  return openList;
}

export function closeRadioList(): boolean {
  if (!openList) return false;
  openList = false;
  paint();
  onRadioLayer();
  return true;
}
let ending = false;
let snapAt = 0;
let hudMuted = false;
let playPos = 0;
let posAt = 0;
let playing = false;
let linkPending = false;
let linkLeft = false;
let linkHooks: { linked: () => boolean; onLinked: () => void } = {
  linked: () => false,
  onLinked: () => undefined,
};
let musicHook: {
  play: () => void;
  stop: () => void;
  setVol: (n: number) => void;
  restart: () => void;
} | null = null;

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function clampIndex(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), HOOLIGAN_TRACKS.length - 1);
}

function clampVol(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(1, n));
}

function loadSave(): RadioSave {
  const empty: RadioSave = { on: true, day: today(), done: false, index: 0, vol: 1 };
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<RadioSave>;
    const day = typeof parsed.day === "string" && parsed.day ? parsed.day : empty.day;
    const vol = parsed.vol === undefined ? empty.vol : clampVol(Number(parsed.vol) > 1 ? Number(parsed.vol) / 100 : Number(parsed.vol));
    return {
      on: parsed.on !== false,
      day,
      done: parsed.done === true && day === today(),
      index: clampIndex(parsed.index ?? 0),
      vol,
    };
  } catch {
    return empty;
  }
}

function persist(): void {
  localStorage.setItem(STORE, JSON.stringify(save));
}

function rollover(): boolean {
  const now = today();
  if (save.day === now) return false;
  save.day = now;
  save.done = false;
  save.index = 0;
  wantUri = "";
  ending = false;
  resetSkipClock();
  persist();
  return true;
}

function $(id: string): HTMLElement {
  return document.querySelector(`#${id}`)!;
}

function trackOf(): RadioTrack {
  return HOOLIGAN_TRACKS[save.index] ?? HOOLIGAN_TRACKS[0]!;
}

function playedSecs(): number {
  const extra = playing && save.on && !hudMuted && save.vol > 0 ? Math.max(0, (Date.now() - posAt) / 1000) : 0;
  return playPos + extra;
}

function stampPos(pos: number, isPlay: boolean): void {
  playPos = Math.max(0, pos);
  posAt = Date.now();
  playing = isPlay && save.on && !hudMuted && save.vol > 0;
}

function freezePlay(): void {
  playPos = playedSecs();
  playing = false;
  posAt = Date.now();
}

function resetSkipClock(): void {
  playPos = 0;
  posAt = Date.now();
  playing = false;
}

function canSkip(): boolean {
  return save.on && gestured && !hudMuted && save.vol > 0;
}

function paintSkip(): void {
  const btn = $("radio-next") as HTMLButtonElement;
  btn.disabled = !canSkip();
  if (btn.textContent !== "Next") btn.textContent = "Next";
  btn.title = "Restart the anthem";
}

function volPct(): number {
  return Math.round(save.vol * 100);
}

function applyVolume(): void {
  const vol = save.vol;
  const c = controller;
  if (!c) return;
  if (typeof c.setVolume === "function") c.setVolume(vol);
  const msg = { command: "SET_VOLUME", volume: vol };
  c.sendMessageToEmbed?.(msg);
  const win = c.iframeElement?.contentWindow;
  win?.postMessage(msg, "*");
  win?.postMessage({ command: vol <= 0 ? "MUTE" : "UNMUTE" }, "*");
  if (vol <= 0 || hudMuted) {
    freezePlay();
    c.pause();
  }
}

function paintVol(): void {
  const sl = $("radio-vol") as HTMLInputElement;
  const pct = volPct();
  if (document.activeElement !== sl) sl.value = String(pct);
  $("radio-vol-out").textContent = pct <= 0 ? "Muted" : `${pct}%`;
}

function nowLabel(): string {
  if (!save.on) return "Music off";
  const song = "The Star-Spangled Banner · public domain";
  if (hudMuted) return `Muted · ${song}`;
  if (save.vol <= 0) return `Volume 0 · ${song}`;
  return song;
}

function paintNow(): void {
  const host = $("radio-now");
  const label = nowLabel();
  const crawl = save.on;
  let copies = host.querySelectorAll(".radio-ticker-copy");
  if (copies.length < 2) {
    const track = document.createElement("span");
    track.className = "radio-ticker-track";
    for (let i = 0; i < 2; i++) {
      const s = document.createElement("span");
      s.className = "radio-ticker-copy";
      if (i === 1) s.setAttribute("aria-hidden", "true");
      track.append(s);
    }
    host.replaceChildren(track);
    copies = host.querySelectorAll(".radio-ticker-copy");
  }
  const inner = host.querySelector(".radio-ticker-track") as HTMLElement | null;
  const changed = copies[0]?.textContent !== label;
  for (const el of copies) el.textContent = label;
  host.classList.toggle("crawl", crawl);
  host.title = save.on ? "The Star-Spangled Banner · public domain" : "Music off";
  if (!inner) return;
  if (changed && crawl) {
    inner.style.animation = "none";
    void inner.offsetWidth;
    inner.style.animation = "";
  }
  inner.style.animationDuration = `${Math.max(14, label.length * 0.42)}s`;
}

function paint(): void {
  $("radio-toggle").textContent = save.on ? "Music Off" : "Music On";
  $("radio-toggle").className = save.on ? "gold" : "thin";
  paintSkip();
  paintNow();
  if (!gestured && save.on) {
    $("radio-status").textContent = "The Star-Spangled Banner plays in this tab — public domain, no download. Click once so the mixer can start.";
  } else if (!save.on) {
    $("radio-status").textContent = "Off. Music On plays the anthem in this tab. Combat still plays.";
  } else if (hudMuted) {
    $("radio-status").textContent = "Muted. Combat still plays. Unmute on the HUD brings the anthem back.";
  } else if (save.vol <= 0) {
    $("radio-status").textContent = "Volume at zero. Raise the slider — Mute on the HUD cuts music, not combat.";
  } else {
    $("radio-status").textContent = "The Star-Spangled Banner · public domain · looping in this tab. Next restarts it. Combat clinks and coin drops are royalty-free synth.";
  }
  if (linkHooks.linked()) {
    $("radio-status").textContent = `${$("radio-status").textContent} Spotify is linked · +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold claimed.`;
  } else if (linkPending) {
    $("radio-status").textContent = `Spotify is open. Come back to this tab for +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold. One claim.`;
  }
  $("radio").classList.toggle("open", openList);
  $("radio-list").textContent = openList ? "Hide tracks" : "Tracks";
  paintVol();
  paintList();
  paintLink();
}

function paintList(): void {
  const root = $("radio-tracks");
  root.replaceChildren();
  let album = "";
  HOOLIGAN_TRACKS.forEach((track, i) => {
    if (track.album !== album) {
      album = track.album;
      const head = document.createElement("p");
      head.className = "radio-album";
      head.textContent = album;
      root.appendChild(head);
    }
    const row = document.createElement("p");
    row.className = i === save.index ? "radio-track on" : "radio-track";
    row.textContent = track.title;
    root.appendChild(row);
  });
}

function asSeconds(n: number, other = 0): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n >= 1000) return n / 1000;
  const hint = Math.max(other, durationSec, trackOf().secs);
  // Spotify embed mixes ms and seconds. Values past this track's length are ms.
  if (hint > 0 && n > hint + 1.5) return n / 1000;
  return n;
}

function normalizeUri(raw: string): string {
  const s = String(raw || "").trim();
  const track = s.match(/track[/:]([A-Za-z0-9]{22})/);
  if (track) return `spotify:track:${track[1]}`;
  return s.split("?")[0] ?? "";
}

function uriOf(data: SpotifyPlayback | undefined): string {
  if (!data) return "";
  return normalizeUri(String(data.playingURI || data.uri || ""));
}

function finishPass(): void {
  ending = false;
  save.done = true;
  save.day = today();
  save.index = 0;
  wantUri = "";
  persist();
  resetSkipClock();
  controller?.pause();
  paint();
}

function syncMusic(): void {
  if (!musicHook) return;
  musicHook.setVol(save.vol);
  const on = gestured && save.on && !hudMuted && save.vol > 0;
  if (on) musicHook.play();
  else musicHook.stop();
}

function playLive(): void {
  syncMusic();
  controller?.pause();
  applyVolume();
  paintSkip();
}

function rejectForeign(): void {
  controller?.pause();
  if (Date.now() - snapAt < 800) return;
  playLive();
}

function goNext(): void {
  if (save.done || !save.on) return;
  if (save.index >= HOOLIGAN_TRACKS.length - 1) {
    finishPass();
    return;
  }
  save.index += 1;
  persist();
  paint();
  playLive();
}

function onStarted(data: SpotifyPlayback): void {
  if (!save.on || save.done || hudMuted || save.vol <= 0) {
    controller?.pause();
    return;
  }
  const uri = uriOf(data);
  if (!uri) return;
  if (uri === wantUri || ALLOWED.has(uri)) {
    wantUri = uri;
    ending = false;
    durationSec = asSeconds(data.duration ?? 0) || HOOLIGAN_TRACKS[save.index]?.secs || 0;
    stampPos(asSeconds(data.position ?? 0), true);
    applyVolume();
    paint();
    return;
  }
  rejectForeign();
}

function onUpdate(data: SpotifyPlayback): void {
  if (!save.on || save.done || hudMuted || save.vol <= 0) {
    if (data.isPaused === false) controller?.pause();
    return;
  }
  const playingUri = uriOf(data);
  if (playingUri && !ALLOWED.has(playingUri)) {
    rejectForeign();
    return;
  }
  const dur = asSeconds(data.duration ?? 0);
  if (dur > 0) durationSec = dur;
  const pos = asSeconds(data.position ?? 0);
  stampPos(pos, data.isPaused !== true);
  paintSkip();
  const end = durationSec || dur;
  const finished = end > 6 && pos >= Math.max(end - 0.9, end * 0.98);
  if (!ending && finished) {
    ending = true;
    goNext();
  }
}

function skipTrack(): void {
  if (!canSkip()) return;
  musicHook?.restart();
  paint();
}

function setOn(on: boolean): void {
  rollover();
  save.on = on;
  persist();
  paint();
  syncMusic();
  controller?.pause();
}

export function radioGesture(): void {
  gestured = true;
  paint();
  playLive();
}

export function radioTick(): void {
  paintSkip();
}

/** HUD Mute silences the anthem. Combat SFX stay up. */
export function radioVol(): number {
  return save.vol;
}

export function setRadioVolume(vol: number): void {
  save.vol = clampVol(vol);
  persist();
  paint();
  applyVolume();
  syncMusic();
}

export function setRadioMuted(muted: boolean): void {
  hudMuted = muted;
  paint();
  syncMusic();
  if (muted) controller?.pause();
}

function paintLink(): void {
  const btn = $("radio-link-sp") as HTMLButtonElement;
  const linked = linkHooks.linked();
  btn.hidden = false;
  if (linked) {
    btn.disabled = true;
    btn.className = "thin";
    btn.textContent = "Spotify linked";
    btn.title = `Linked. +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold already claimed on this locker.`;
    return;
  }
  btn.disabled = false;
  btn.className = "pay";
  btn.textContent = linkPending ? "Come back for gold" : `Link Spotify · +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold`;
  btn.title = linkPending
    ? "Open Spotify, then return to this tab. One claim."
    : `Open Spotify, then come back. +${SPOTIFY_LINK_GOLD.toLocaleString("en-US")} gold once.`;
}

function finishSpotifyLink(): void {
  if (!linkPending || linkHooks.linked()) {
    linkPending = false;
    linkLeft = false;
    paintLink();
    return;
  }
  linkPending = false;
  linkLeft = false;
  linkHooks.onLinked();
  paint();
}

function startSpotifyLink(): void {
  if (linkHooks.linked()) {
    paintLink();
    return;
  }
  linkPending = true;
  linkLeft = document.visibilityState === "hidden";
  const pop = window.open(SPOTIFY_LOGIN, "_blank", "noopener,noreferrer");
  if (!pop) {
    window.open(ARTIST_URL, "_blank", "noopener,noreferrer");
  }
  paint();
}

function bind(): void {
  $("radio-toggle").addEventListener("click", () => {
    setOn(!save.on);
  });
  $("radio-next").addEventListener("click", () => {
    rollover();
    skipTrack();
  });
  $("radio-list").addEventListener("click", () => {
    openList = !openList;
    paint();
    onRadioLayer();
  });
  $("radio-link-sp").addEventListener("click", () => {
    startSpotifyLink();
  });
  const sl = $("radio-vol") as HTMLInputElement;
  const onVol = (): void => {
    setRadioVolume(Number(sl.value) / 100);
  };
  sl.addEventListener("input", onVol);
  sl.addEventListener("change", onVol);
  const link = $("radio-open") as HTMLAnchorElement;
  link.href = ARTIST_URL;
}

function attachApi(api: SpotifyIFrameApi): void {
  const host = $("radio-embed");
  host.replaceChildren();
  api.createController(host, { uri: trackOf().uri, width: "100%", height: 152, theme: "dark" }, (c) => {
    controller = c;
    c.addListener("ready", () => {
      applyVolume();
      if (gestured && save.on && !save.done) playLive();
    });
    c.addListener("playback_started", (e) => onStarted(e.data));
    c.addListener("playback_update", (e) => onUpdate(e.data));
  });
}

function loadSpotify(): void {
  if (document.getElementById("spotify-iframe-api")) return;
  window.onSpotifyIframeApiReady = attachApi;
  const script = document.createElement("script");
  script.id = "spotify-iframe-api";
  script.src = IFRAME_API;
  script.async = true;
  script.onerror = () => {
    openList = true;
    $("radio-status").textContent = "Spotify did not load. The anthem still plays in this tab. Open Lil Hooligan on Spotify if you want the link-gold bonus.";
    paint();
    onRadioLayer();
  };
  document.body.appendChild(script);
}

export function mountRadio(hooks?: {
  linked: () => boolean;
  onLinked: () => void;
  onLayer?: () => void;
  music?: {
    play: () => void;
    stop: () => void;
    setVol: (n: number) => void;
    restart: () => void;
  };
}): void {
  if (hooks) {
    linkHooks = hooks;
    if (hooks.music) musicHook = hooks.music;
    if (hooks.onLayer) onRadioLayer = hooks.onLayer;
  }
  rollover();
  bind();
  paint();
  if (musicHook) musicHook.setVol(save.vol);
  if (gestured) playLive();
  loadSpotify();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (linkPending) linkLeft = true;
      return;
    }
    if (linkPending && linkLeft) finishSpotifyLink();
    if (rollover() && gestured && save.on && !save.done) playLive();
  });
  window.addEventListener("blur", () => {
    if (linkPending) linkLeft = true;
  });
  window.addEventListener("focus", () => {
    if (linkPending && linkLeft) finishSpotifyLink();
  });
}
