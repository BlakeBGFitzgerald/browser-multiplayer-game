import { MAGA_DEATH } from "./barks";
import {
  ANTIFA_NAZI_LINE,
  FACTION_VOICE_LINES,
  RECORDED_VOICE_HOLD_MS,
  acceptVoice,
  recordedKillClip,
  voiceLineGain,
  type VoiceDecision,
} from "./factionVoice.ts";
import { type KillSoundId } from "./killNotice.ts";
import { KILL_VOICE } from "./killVoice";
import { Anthem } from "./anthem";
import { BattleDrums } from "./battleMusic";
import { artilleryHero, BattleBank, gunHero, type SampleGroup } from "./battleSamples";
import { playCreepVoice, playKitVoice, type CreepKind, type KitKind } from "./kitSounds";

export type FightPhase = "early" | "mid" | "late" | "end";

/** Spoken match intro. speechSynthesis allows 0–1. This line used the desk fader (default 0.9). */
export const INTRO_VOICE_VOLUME = 1;

/** Bell, gong, and the match-start fanfare under that spoken intro. */
const INTRO_STING_SCALE = 0.4;

/** Anthem bus while the intro is speaking. Restored when the desk finishes. */
const INTRO_MUSIC_DUCK = 0.22;

type BusName = "combat" | "desk";

let sharedCtx: AudioContext | null = null;

function getSharedCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") sharedCtx = new Ctx();
  return sharedCtx;
}

/** Looping rumble under a fight. Oscillators and noise only — no samples. */
class BattleBed {
  private ctx: AudioContext;
  private dest: GainNode;
  private noiseGain: GainNode;
  private noiseSrc: AudioBufferSourceNode;
  private droneGains: GainNode[] = [];
  private drones: OscillatorNode[] = [];
  private pingAt = 0;
  private intensity = 0;
  private duckUntil = 0;
  private stopped = false;
  private raf = 0;
  private phase: FightPhase = "early";
  private nextAmb = 0;
  private ambience: ((kind: "distant" | "boom") => void) | null = null;

  constructor(ctx: AudioContext, dest: GainNode) {
    this.ctx = ctx;
    this.dest = dest;
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, Math.floor(sr * 2), sr);
    const data = buf.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = brown * 0.96 + (Math.random() * 2 - 1) * 0.07;
      data[i] = Math.max(-1, Math.min(1, brown));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "lowpass";
    bp.frequency.value = 220;
    bp.Q.value = 0.7;
    const ng = ctx.createGain();
    ng.gain.value = 0.0001;
    src.connect(bp);
    bp.connect(ng);
    ng.connect(dest);
    src.start();
    this.noiseSrc = src;
    this.noiseGain = ng;

    const freqs = [52, 78, 104];
    for (const f of freqs) {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.0001;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 140;
      o.connect(lp);
      lp.connect(g);
      g.connect(dest);
      o.start();
      this.drones.push(o);
      this.droneGains.push(g);
    }

    this.pingAt = ctx.currentTime + 0.35;
    this.nextAmb = ctx.currentTime + 6;
    this.raf = requestAnimationFrame(() => this.tick());
  }

  setPhase(phase: FightPhase): void {
    this.phase = phase;
  }

  setAmbience(fn: (kind: "distant" | "boom") => void): void {
    this.ambience = fn;
  }

  set(n: number): void {
    if (this.stopped) return;
    this.intensity = Math.max(0, Math.min(1, n));
    const t = this.ctx.currentTime;
    const x = this.intensity;
    const d = this.ctx.currentTime < this.duckUntil ? 0.4 : 1;
    this.noiseGain.gain.setTargetAtTime((0.008 + x * 0.018) * d, t, 0.28);
    this.droneGains[0]?.gain.setTargetAtTime((0.014 + x * 0.026) * d, t, 0.32);
    this.droneGains[1]?.gain.setTargetAtTime((0.01 + x * 0.018) * d, t, 0.32);
    this.droneGains[2]?.gain.setTargetAtTime((0.006 + x * 0.012) * d, t, 0.32);
  }

  duck(seconds: number): void {
    if (this.stopped) return;
    this.duckUntil = Math.max(this.duckUntil, this.ctx.currentTime + seconds);
    this.set(this.intensity);
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    const t = this.ctx.currentTime;
    for (const g of [this.noiseGain, ...this.droneGains]) {
      g.gain.setTargetAtTime(0.0001, t, 0.12);
    }
    window.setTimeout(() => {
      try {
        this.noiseSrc.stop();
        this.noiseSrc.disconnect();
      } catch {
        /* already stopped */
      }
      for (const o of this.drones) {
        try {
          o.stop();
          o.disconnect();
        } catch {
          /* already stopped */
        }
      }
      this.noiseGain.disconnect();
      for (const g of this.droneGains) g.disconnect();
    }, 400);
  }

  private tick(): void {
    if (this.stopped) return;
    const now = this.ctx.currentTime;
    if (this.intensity > 0.45 && now >= this.pingAt) {
      this.ping();
      this.pingAt = now + 0.85 + Math.random() * (1.6 - this.intensity * 0.4);
    }
    this.tickAmbience(now);
    this.raf = requestAnimationFrame(() => this.tick());
  }

  /** Distant cracks and the odd far blast. Density follows the fight, not the master gain. */
  private tickAmbience(now: number): void {
    if (!this.ambience || now < this.nextAmb) return;
    const quiet = this.intensity < 0.22;
    const base = this.phase === "early" ? 9 : this.phase === "mid" ? 5.2 : this.phase === "late" ? 3.4 : 2.8;
    const gap = base * (quiet ? 2.6 : 1) * (1.2 - this.intensity * 0.35);
    this.nextAmb = now + gap * (0.75 + Math.random() * 0.65);
    if (this.intensity < 0.1) return;
    if (!quiet && this.intensity > 0.62 && Math.random() < 0.2) this.ambience("boom");
    else this.ambience("distant");
  }

  private ping(): void {
    const t = this.ctx.currentTime;
    const vol = 0.045 + this.intensity * 0.06;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    const f = 520 + Math.random() * 280;
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, f * 0.55), t + 0.09);
    gain.gain.setValueAtTime(Math.max(vol, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(gain);
    gain.connect(this.dest);
    osc.start(t);
    osc.stop(t + 0.12);
  }
}

export class Sfx {
  muted = false;
  combatVol = 1;
  deskVol = 0.9;
  musicVol = 1;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private combat: GainNode | null = null;
  private desk: GainNode | null = null;
  private music: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private bins = new Uint8Array(32);
  private drone: OscillatorNode | null = null;
  private bed: BattleBed | null = null;
  private anthem: Anthem | null = null;
  private wantAnthem = false;
  private last: Record<string, number> = {};
  private noiseUntil: number[] = [];
  private voiceAt: number[] = [];
  private ring = false;
  private deskId = 0;
  private streamDest: MediaStreamAudioDestinationNode | null = null;
  private mixEl: HTMLAudioElement | null = null;
  private bank = new BattleBank();
  private drums: BattleDrums | null = null;
  private fightPhase: FightPhase = "early";
  private killCoolUntil = 0;
  private killSpeakUntil = 0;
  private killPending = false;
  private killToken = 0;
  private voiceBuffers = new Map<string, AudioBuffer>();
  private voiceLoads = new Map<string, Promise<AudioBuffer | null>>();
  private musicDuckUntil = 0;
  private musicDuckAmt = 1;

  /** Call from a click or key. Browsers keep the context suspended until then. */
  unlock(): Promise<void> {
    const ctx = getSharedCtx();
    if (!ctx) return Promise.resolve();
    if (!this.ctx) {
      const master = ctx.createGain();
      const makeup = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      const analyser = ctx.createAnalyser();
      const combat = ctx.createGain();
      const desk = ctx.createGain();
      const music = ctx.createGain();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.68;
      comp.threshold.value = -14;
      comp.knee.value = 18;
      comp.ratio.value = 2.4;
      comp.attack.value = 0.008;
      comp.release.value = 0.22;
      makeup.gain.value = 1;
      const air = ctx.createBiquadFilter();
      air.type = "highshelf";
      air.frequency.value = 5200;
      air.gain.value = -4;
      const limit = ctx.createDynamicsCompressor();
      limit.threshold.value = -3;
      limit.knee.value = 2;
      limit.ratio.value = 12;
      limit.attack.value = 0.002;
      limit.release.value = 0.06;
      combat.connect(comp);
      desk.connect(comp);
      music.connect(comp);
      comp.connect(air);
      air.connect(makeup);
      makeup.connect(limit);
      limit.connect(master);
      makeup.connect(analyser);
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.analyser = analyser;
      this.combat = combat;
      this.desk = desk;
      this.music = music;
      this.bins = new Uint8Array(analyser.frequencyBinCount);
      this.applyGains();
      this.startDrone();
      this.warmVoices();
      this.bank.load(ctx);
      this.preloadFactionClips();
      this.drums = new BattleDrums(ctx, music);
      this.drums.load();
      this.tapMix();
      ctx.addEventListener("statechange", () => {
        const st = String(ctx.state);
        if (st === "suspended" || st === "interrupted") void ctx.resume();
      });
    }
    this.applyGains();
    this.tapMix();
    if (typeof speechSynthesis !== "undefined") {
      try {
        speechSynthesis.resume();
      } catch {
        /* Safari throws if speech is not ready. */
      }
    }
    const state = String(this.ctx.state);
    if (state === "suspended" || state === "interrupted") {
      return this.ctx.resume().then(() => undefined).catch(() => undefined);
    }
    return Promise.resolve();
  }

  ready(): boolean {
    return !!this.ctx && String(this.ctx.state) === "running" && !this.muted;
  }

  setCombatVol(n: number): void {
    this.combatVol = clamp01(n);
    this.applyGains();
  }

  setDeskVol(n: number): void {
    this.deskVol = clamp01(n);
    this.applyGains();
  }

  setMusicVol(n: number): void {
    this.musicVol = clamp01(n);
    this.applyGains();
  }

  hookMix(el: HTMLAudioElement): void {
    this.mixEl = el;
    this.tapMix();
  }

  clearBusy(): void {
    this.last = {};
  }

  wake(): void {
    if (this.muted) return;
    this.tone(880, 0.2, "square", 0.58);
    this.tone(440, 0.24, "sawtooth", 0.38);
    this.tone(220, 0.18, "sine", 0.28);
  }

  private tapMix(): void {
    if (!this.ctx || !this.master || !this.mixEl) return;
    if (!this.streamDest) {
      this.streamDest = this.ctx.createMediaStreamDestination();
      this.master.connect(this.streamDest);
    }
    if (this.mixEl.srcObject !== this.streamDest.stream) this.mixEl.srcObject = this.streamDest.stream;
    this.mixEl.muted = false;
    this.mixEl.volume = 1;
    const play = this.mixEl.play();
    if (play && typeof play.then === "function") play.catch(() => undefined);
  }

  playAnthem(): void {
    this.wantAnthem = true;
    this.drums?.setAnthem(true);
    void this.unlock().then(() => {
      if (!this.wantAnthem || !this.ctx || !this.music || this.muted) return;
      if (this.anthem) return;
      this.anthem = new Anthem(this.ctx, this.music);
    });
  }

  stopAnthem(): void {
    this.wantAnthem = false;
    this.anthem?.stop();
    this.anthem = null;
    this.drums?.setAnthem(false);
  }

  restartAnthem(): void {
    if (this.anthem) {
      this.anthem.restart();
      return;
    }
    this.playAnthem();
  }

  peak(): number {
    if (!this.analyser || !this.ready()) return 0;
    this.analyser.getByteTimeDomainData(this.bins);
    let m = 0;
    for (const v of this.bins) {
      const a = Math.abs(v - 128) / 128;
      if (a > m) m = a;
    }
    return m;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyGains();
    if (muted) this.stopRing();
    else void this.unlock();
  }

  private applyGains(): void {
    if (this.master) this.master.gain.value = this.muted ? 0 : 1;
    if (this.combat) this.combat.gain.value = this.combatVol;
    if (this.desk) this.desk.gain.value = this.deskVol;
    let music = this.muted ? 0 : this.musicVol * 1.2;
    if (!this.muted && this.ctx && this.ctx.currentTime < this.musicDuckUntil) music *= this.musicDuckAmt;
    else if (!this.muted) this.musicDuckAmt = 1;
    if (this.music) this.music.gain.value = music;
  }

  click(): void {
    void this.unlock().then(() => {
      this.tone(480, 0.08, "square", 0.28);
    });
  }

  attack(): void {
    this.swing();
  }

  swing(): void {
    if (this.muted) return;
    if (this.busy("swing", 42)) return;
    if (!this.admit(1)) return;
    this.sweep(280, 70, 0.12, 0.32);
    this.tone(88, 0.1, "square", 0.22);
    this.noise(0.04, 0.1, 900, "combat", 2);
  }

  arrow(): void {
    if (this.muted) return;
    if (this.busy("arrow", 42)) return;
    if (!this.admit(1)) return;
    this.sample("whoosh", 0.85, 1);
    this.tone(740, 0.06, "triangle", 0.18);
    this.sweep(1100, 240, 0.11, 0.16);
    this.noise(0.025, 0.06, 1400, "combat", 1);
  }

  /** Tower and ancient shots. Heavy launch, separate from a rifle. */
  towerShot(vol = 1): void {
    if (this.muted) return;
    if (this.busy("towerShot", 90)) return;
    if (!this.admit(2)) return;
    const played = this.sample("heavy", vol, 2);
    this.tone(96, 0.09, "triangle", (played ? 0.06 : 0.12) * vol);
    this.noise(0.05, 0.05 * vol, 420, "combat", 2);
  }

  kitSwing(heroId: string, vol = 1, melee = true, priority = 2): void {
    this.kit(heroId, "swing", vol, melee, priority);
  }

  kitHit(heroId: string, vol = 1): void {
    this.kit(heroId, "hit", vol);
  }

  kitCast(heroId: string, ult = false, vol = 1): void {
    this.bed?.duck(ult ? 0.45 : 0.28);
    this.drums?.duck(ult ? 0.7 : 0.35, ult ? 0.5 : 0.72);
    this.kit(heroId, ult ? "ult" : "cast", vol);
    if (ult) this.ability(true);
  }

  minionHit(kind: CreepKind, vol = 1): void {
    if (this.muted) return;
    if (this.busy(`creep-${kind}`, kind === "wild" ? 70 : 20)) return;
    if (!this.admit(kind === "wild" ? 2 : 1)) return;
    const bus = this.live();
    if (!bus) return;
    playCreepVoice(bus, kind, vol);
  }

  private kit(heroId: string, kind: KitKind, vol: number, melee = true, priority?: number): void {
    if (this.muted) return;
    if (this.busy(`kit-${heroId}-${kind}`, kind === "cast" || kind === "ult" ? 72 : 26)) return;
    const pri = priority ?? (kind === "ult" || kind === "cast" ? 3 : 2);
    if (!this.admit(pri)) return;
    const bus = this.live();
    if (!bus) return;
    playKitVoice(bus, heroId, kind, vol);
    if (kind === "swing") {
      if (gunHero(heroId)) this.sample("tommy", vol, pri, 0, 1, true);
      else if (artilleryHero(heroId)) this.sample("heavy", vol * 0.85, pri);
      else if (!melee) this.sample("whoosh", vol * 0.7, 1);
    } else if (kind === "ult") {
      this.sample("boomLarge", vol, 3);
    }
  }

  /** Steel-on-steel. Heroes hit heavier; minions tick faster. */
  clink(tier: "hero" | "minion" = "minion", vol = 1): void {
    if (this.muted) return;
    const heavy = tier === "hero";
    if (this.busy(heavy ? "hclink" : "mclink", heavy ? 38 : 18)) return;
    const f = heavy ? 1680 + Math.random() * 420 : 2280 + Math.random() * 780;
    this.metal(f, heavy ? 0.16 : 0.09, (heavy ? 0.72 : 0.42) * vol);
  }

  /** Blade ping / arrow tick on impact. */
  ting(tier: "hero" | "minion" = "minion", vol = 1): void {
    if (this.muted) return;
    const hero = tier === "hero";
    if (this.busy(hero ? "hting" : "mting", hero ? 36 : 16)) return;
    const f = hero ? 2650 + Math.random() * 500 : 3100 + Math.random() * 900;
    this.metal(f, hero ? 0.11 : 0.065, (hero ? 0.55 : 0.36) * vol);
    this.tone(f * 0.5, 0.05, "sine", 0.22 * vol);
  }

  clash(): void {
    this.clink("hero");
  }

  ability(high = false): void {
    if (this.muted) return;
    this.bed?.duck(high ? 0.4 : 0.22);
    if (high) {
      this.sweep(180, 760, 0.28, 0.3);
      this.tone(220, 0.24, "triangle", 0.2);
      this.tone(330, 0.3, "triangle", 0.16);
      this.noise(0.12, 0.12, 520, "combat", 3);
    } else {
      this.sweep(240, 560, 0.16, 0.24);
      this.tone(170, 0.12, "square", 0.16);
      this.noise(0.06, 0.08, 700, "combat", 2);
    }
  }

  crit(vol = 1): void {
    if (this.muted) return;
    if (this.busy("crit", 70)) return;
    this.tone(880, 0.12, "square", 0.28 * vol);
    this.tone(1320, 0.16, "triangle", 0.22 * vol);
    this.sweep(400, 1180, 0.14, 0.24 * vol);
    this.noise(0.05, 0.1 * vol, 1400, "combat", 3);
  }

  bash(vol = 1): void {
    if (this.muted) return;
    if (this.busy("bash", 80)) return;
    this.sample("heavyImpact", vol, 3);
    this.tone(58, 0.2, "square", 0.28 * vol);
    this.tone(46, 0.24, "sawtooth", 0.2 * vol);
    this.noise(0.08, 0.1 * vol, 260, "combat", 3);
    this.metal(390, 0.12, 0.22 * vol);
  }

  splash(vol = 1): void {
    if (this.muted) return;
    if (this.busy("splash", 64)) return;
    this.sample("boomSmall", vol, 2);
    this.noise(0.1, 0.08 * vol, 700, "combat", 2);
    this.sweep(560, 130, 0.18, 0.16 * vol);
  }

  /** Impact by surface. Distance is the hear() volume, not the master fader. */
  hit(vol = 1, surface: "flesh" | "armor" | "structure" = "flesh"): void {
    if (this.muted) return;
    if (this.busy("hit", 28)) return;
    const g = Math.max(0.08, Math.min(1, vol));
    const group: SampleGroup = surface === "structure" ? "heavyImpact" : surface === "armor" ? "metal" : "body";
    const played = this.sample(group, g, g > 0.72 ? 2 : 1);
    const duck = played ? 0.5 : 1;
    this.tone(140, 0.08, "sawtooth", 0.22 * g * duck);
    this.tone(90, 0.07, "square", 0.18 * g * duck);
    this.noise(0.03, 0.07 * g * duck, 800, "combat", 1);
  }

  grunt(home: boolean): void {
    if (this.busy("grunt", 160)) return;
    if (home) {
      this.tone(118, 0.11, "sawtooth", 0.07);
      this.noise(0.06, 0.035, 420, "combat", 1);
    } else {
      this.tone(210, 0.09, "square", 0.06);
      this.noise(0.05, 0.03, 700, "combat", 1);
    }
  }

  hog(): void {
    if (this.busy("hog", 180)) return;
    this.sweep(90, 45, 0.16, 0.08);
    this.noise(0.08, 0.04, 280, "combat", 1);
  }

  wave(): void {
    if (this.busy("wave", 800)) return;
    this.noise(0.1, 0.03, 420, "combat", 2);
    this.tone(160, 0.12, "triangle", 0.04);
  }

  speak(line: string, home: boolean): void {
    if (this.muted || this.deskVol <= 0 || this.ring || typeof speechSynthesis === "undefined") return;
    if (this.busy("speak", 1600)) return;
    if (speechSynthesis.speaking) return;
    const u = new SpeechSynthesisUtterance(line);
    u.rate = home ? 0.95 : 1.12;
    u.pitch = home ? 0.68 : 1.22;
    u.volume = this.deskVol;
    const voice = this.pickVoice(home);
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
    this.bed?.duck(1.1);
    this.grunt(home);
  }

  /**
   * Hero multi-kill line. False while the global slot is cooling so the cue retries.
   * Headless and missing speech consume the cue so it cannot stick.
   */
  speakKill(line: string, home: boolean): boolean {
    const now = this.nowMs();
    if (now < this.killCoolUntil) return false;
    const recorded = recordedKillClip(line);
    if (recorded) return this.speakRecordedKill(recorded.voiceLineId, now);
    if (
      this.muted ||
      this.deskVol <= 0 ||
      typeof speechSynthesis === "undefined" ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      this.killCoolUntil = now + KILL_VOICE.cooldown * 1000;
      return true;
    }
    try {
      const u = new SpeechSynthesisUtterance(line);
      u.rate = home ? 0.95 : 1.12;
      u.pitch = home ? 0.68 : 1.22;
      u.volume = Math.max(0, Math.min(1, KILL_VOICE.volume * this.deskVol));
      const voice = this.pickVoice(home);
      if (voice) u.voice = voice;
      const hold = Math.max(1100, line.length * 80);
      const token = (this.killToken += 1);
      this.killPending = true;
      this.killSpeakUntil = now + hold;
      this.killCoolUntil = now + KILL_VOICE.cooldown * 1000;
      const clear = (): void => {
        if (token !== this.killToken) return;
        this.killPending = false;
        this.killSpeakUntil = 0;
      };
      u.onstart = () => {
        if (token !== this.killToken) return;
        this.killSpeakUntil = this.nowMs() + hold;
      };
      u.onend = clear;
      u.onerror = clear;
      speechSynthesis.speak(u);
      if (typeof window !== "undefined") window.setTimeout(clear, hold + 3200);
      this.bed?.duck(1.1);
      this.grunt(home);
    } catch {
      this.killPending = false;
      this.killSpeakUntil = 0;
      return true;
    }
    return true;
  }

  /** Live mic transcript. The phrase map picks the faction. Low confidence does not play. */
  hearFactionPhrase(transcript: string, confidence: number): void {
    if (this.muted || this.deskVol <= 0 || this.ring) return;
    this.playDecision(acceptVoice({ transcript, confidence, now: this.nowMs() }));
  }

  private speakRecordedKill(voiceLineId: string, now: number): boolean {
    if (this.muted || this.deskVol <= 0) {
      this.killCoolUntil = now + KILL_VOICE.cooldown * 1000;
      return true;
    }
    const hold = RECORDED_VOICE_HOLD_MS;
    const token = (this.killToken += 1);
    this.killPending = true;
    this.killSpeakUntil = now + hold;
    this.killCoolUntil = now + KILL_VOICE.cooldown * 1000;
    const clear = (): void => {
      if (token !== this.killToken) return;
      this.killPending = false;
      this.killSpeakUntil = 0;
    };
    if (typeof window !== "undefined") window.setTimeout(clear, hold + 400);
    this.playFactionClip(voiceLineId, 1);
    return true;
  }

  private playFactionClip(voiceLineId: string, confidence: number): void {
    if (this.muted || this.deskVol <= 0) return;
    this.playDecision(acceptVoice({ voiceLineId, confidence, now: this.nowMs() }));
  }

  private playDecision(decision: VoiceDecision): void {
    if (!decision.fired || !decision.audioUrl || !decision.voiceLineId) return;
    this.bed?.duck(RECORDED_VOICE_HOLD_MS / 1000);
    this.startDeskFile(decision.voiceLineId, decision.audioUrl);
  }

  private preloadFactionClips(): void {
    for (const line of FACTION_VOICE_LINES) void this.loadVoiceBuffer(line.audioUrl);
  }

  private loadVoiceBuffer(url: string): Promise<AudioBuffer | null> {
    const cached = this.voiceBuffers.get(url);
    if (cached) return Promise.resolve(cached);
    const pending = this.voiceLoads.get(url);
    if (pending) return pending;
    const job = (async (): Promise<AudioBuffer | null> => {
      const ctx = this.ctx;
      if (!ctx) return null;
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const raw = await res.arrayBuffer();
        if (ctx.state === "suspended") await ctx.resume().catch(() => undefined);
        const buf = await ctx.decodeAudioData(raw.slice(0));
        this.voiceBuffers.set(url, buf);
        return buf;
      } catch {
        return null;
      }
    })();
    this.voiceLoads.set(url, job);
    void job.then((buf) => {
      if (!buf) this.voiceLoads.delete(url);
    });
    return job;
  }

  /** Desk bus. Original mp3 bytes. No second encode. Gain is per line id. */
  private startDeskFile(voiceLineId: string, url: string): void {
    void this.unlock().then(() => {
      void this.loadVoiceBuffer(url).then((buf) => {
        if (!buf || this.muted || this.deskVol <= 0) return;
        const bus = this.live("desk");
        if (!bus) return;
        const src = bus.ctx.createBufferSource();
        const clip = bus.ctx.createGain();
        src.buffer = buf;
        clip.gain.value = voiceLineGain(voiceLineId);
        src.connect(clip);
        clip.connect(bus.dest);
        const t = bus.ctx.currentTime;
        src.start(t);
        const dur = Number.isFinite(buf.duration) && buf.duration > 0 ? buf.duration : RECORDED_VOICE_HOLD_MS / 1000;
        src.stop(t + dur + 0.05);
        src.onended = () => {
          try {
            src.disconnect();
            clip.disconnect();
          } catch {
            /* already disconnected */
          }
        };
      });
    });
  }

  fakeNews(): void {
    this.deathVo(true);
  }

  nazi(): void {
    this.deathVo(false);
  }

  kill(): void {
    this.sample("boomSmall", 0.7, 3);
    this.sweep(520, 160, 0.3, 0.32);
    this.tone(196, 0.22, "triangle", 0.24);
    this.noise(0.1, 0.12, 480, "combat", 3);
  }

  /**
   * One desk cue for a kill banner. First blood is a rising sting.
   * A normal kill is a short hit. Streaks and a broken streak each have their own shape.
   * Mute and a closed desk fader skip it. Call once per notice, not per frame.
   */
  playKillNotice(sound: KillSoundId): void {
    if (this.muted || this.deskVol <= 0) return;
    switch (sound) {
      case "sting-first-blood":
        this.bed?.duck(0.7);
        this.sweep(160, 640, 0.46, 0.28, "desk");
        this.tone(523, 0.16, "square", 0.18, "desk", 0);
        this.tone(659, 0.16, "square", 0.16, "desk", 0.11);
        this.tone(784, 0.2, "triangle", 0.18, "desk", 0.22);
        this.tone(1046, 0.42, "sine", 0.22, "desk", 0.33);
        break;
      case "hit-kill":
        this.tone(196, 0.07, "square", 0.1, "desk");
        this.noise(0.04, 0.045, 640, "desk", 2);
        break;
      case "sting-two":
        this.tone(523, 0.1, "triangle", 0.13, "desk", 0);
        this.tone(659, 0.14, "sine", 0.12, "desk", 0.09);
        break;
      case "sting-hat":
        this.tone(392, 0.09, "triangle", 0.12, "desk", 0);
        this.tone(494, 0.09, "triangle", 0.12, "desk", 0.08);
        this.tone(587, 0.16, "sine", 0.14, "desk", 0.16);
        break;
      case "sting-quad":
        this.tone(349, 0.08, "square", 0.1, "desk", 0);
        this.tone(440, 0.08, "square", 0.1, "desk", 0.07);
        this.tone(523, 0.08, "triangle", 0.11, "desk", 0.14);
        this.tone(698, 0.16, "sine", 0.13, "desk", 0.21);
        break;
      case "sting-fire":
        this.sweep(280, 880, 0.24, 0.16, "desk");
        this.tone(988, 0.18, "square", 0.11, "desk", 0.12);
        break;
      case "sting-unstoppable":
        this.sweep(140, 520, 0.28, 0.18, "desk");
        this.tone(196, 0.2, "sawtooth", 0.1, "desk", 0);
        this.tone(784, 0.22, "triangle", 0.12, "desk", 0.16);
        break;
      case "sting-godlike":
        this.tone(110, 0.45, "sawtooth", 0.12, "desk");
        this.tone(220, 0.4, "square", 0.08, "desk");
        this.tone(440, 0.28, "triangle", 0.1, "desk", 0.08);
        this.tone(880, 0.22, "sine", 0.11, "desk", 0.16);
        break;
      case "sting-shutdown":
        this.sweep(480, 90, 0.32, 0.16, "desk");
        this.tone(146, 0.28, "triangle", 0.11, "desk", 0.06);
        break;
      default: {
        const missed: never = sound;
        void missed;
      }
    }
  }

  coin(vol = 1, heap = false): void {
    if (this.muted) return;
    if (this.busy("coin", 48)) return;
    const v = Math.max(0.55, vol);
    this.tone(988, 0.1, "sine", 0.32 * v);
    this.tone(1319, 0.14, "triangle", 0.28 * v);
    this.tone(1760, 0.22, "sine", 0.2 * v);
    if (heap) this.tone(784, 0.24, "triangle", 0.22 * v);
  }

  /** Short tick when a creep dies — lighter than a hero shutdown. */
  minionDown(vol = 1): void {
    if (this.muted) return;
    if (this.busy("mdown", 28)) return;
    this.tone(390 + Math.random() * 80, 0.05, "square", 0.06 * vol);
    this.noise(0.03, 0.02 * vol, 900, "combat", 1);
  }

  tower(vol = 1): void {
    const g = Math.max(0.35, Math.min(1, vol));
    this.drums?.duck(0.55, 0.68);
    this.sample("boomLarge", g, 3, g < 0.7 ? 2400 : 0);
    this.noise(0.18, 0.08 * g, 360, "combat", 2);
    this.tone(72, 0.42, "triangle", 0.11 * g);
    this.tone(48, 0.55, "sine", 0.09 * g);
    this.sweep(170, 38, 0.4, 0.08 * g);
  }

  /** Major objective coming up. One blast, not a music sting. */
  objective(vol = 1): void {
    if (this.muted) return;
    if (this.busy("objective", 1400)) return;
    this.drums?.duck(0.9, 0.55);
    const g = Math.max(0.5, Math.min(1, vol));
    this.sample("boomMid", g, 3);
    this.tone(78, 0.32, "triangle", 0.07 * g);
  }

  /** Fountain return. Quiet air, not a second death sting. */
  respawn(vol = 1): void {
    if (this.muted) return;
    if (this.busy("respawn", 500)) return;
    this.sample("whoosh", vol * 0.55, 2, 0, 1.03);
    this.tone(520, 0.1, "sine", 0.05 * vol);
  }

  death(): void {
    this.sweep(280, 46, 0.55, 0.15);
    this.noise(0.12, 0.05, 340, "combat", 2);
  }

  win(): void {
    this.setBattle(0);
    this.tone(523, 0.18, "square", 0.08);
    this.tone(659, 0.22, "square", 0.07);
    this.tone(784, 0.34, "triangle", 0.06);
    this.tone(1046, 0.42, "sine", 0.05);
  }

  lose(): void {
    this.setBattle(0);
    this.sweep(300, 70, 0.75, 0.13);
    this.tone(98, 0.5, "sawtooth", 0.08);
  }

  startBattle(): void {
    if (!this.ctx || !this.combat) {
      void this.unlock().then(() => {
        if (!this.ctx || !this.combat || this.muted) return;
        this.attachBed();
        this.bed?.set(0.2);
      });
      return;
    }
    this.attachBed();
    this.bed?.set(0.2);
  }

  stopBattle(): void {
    this.bed?.stop();
    this.bed = null;
  }

  /** Drum bed. score is battlefield activity, separate from the rumble floor. */
  setDrumFight(score: number, phase?: FightPhase): void {
    if (phase) this.fightPhase = phase;
    this.drums?.setFight(score, this.fightPhase, this.wantAnthem);
  }

  setBattle(n: number, phase?: FightPhase): void {
    if (phase) this.fightPhase = phase;
    if (n <= 0) this.drums?.setFight(0, this.fightPhase, this.wantAnthem);
    if (!this.ctx || !this.combat) return;
    if (!this.bed) {
      if (n <= 0) return;
      this.attachBed();
    }
    this.bed?.setPhase(this.fightPhase);
    this.bed?.set(n);
  }

  /** Sound-card proof: kit voices, then the fight bed. */
  previewFight(): void {
    void this.unlock().then(() => {
      if (this.muted) return;
      this.startBattle();
      this.setBattle(0.9);
      this.kitSwing("riot", 1);
      this.kitHit("riot", 1);
      window.setTimeout(() => {
        if (this.muted) return;
        this.kitHit("foil", 1);
        this.kitCast("foil", false, 1);
      }, 160);
      window.setTimeout(() => {
        if (this.muted) return;
        this.kitHit("chem", 1);
        this.minionHit("melee", 1);
      }, 320);
      window.setTimeout(() => {
        if (this.muted) return;
        this.kitHit("bass", 1);
        this.coin(1, true);
      }, 480);
      window.setTimeout(() => {
        if (!this.muted) this.ability(true);
      }, 640);
      window.setTimeout(() => this.setBattle(0.2), 1600);
    });
  }

  fanfare(): void {
    void this.unlock().then(() => {
      // Match start calls this, then announceIntro sets ring before the unlock resolves.
      this.playFanfare(this.ring ? INTRO_STING_SCALE : 1);
    });
  }

  /** First click on the enter page: bell, sting, gong. Browsers keep the mixer dead until that click. */
  entrance(): void {
    void this.unlock().then(() => {
      if (this.muted) return;
      this.ringBell();
      this.playFanfare();
      window.setTimeout(() => {
        if (!this.muted) this.gong();
      }, 280);
    });
  }

  private playFanfare(scale = 1): void {
    if (this.muted) return;
    const s = scale > 0 ? scale : 0;
    this.sweep(70, 260, 0.62, 0.38 * s);
    this.tone(98, 0.5, "sawtooth", 0.32 * s);
    this.tone(147, 0.58, "triangle", 0.24 * s);
    this.tone(196, 0.34, "square", 0.2 * s);
    this.tone(294, 0.22, "square", 0.16 * s);
  }

  stopRing(): void {
    this.deskId += 1;
    this.ring = false;
    this.killToken += 1;
    this.killPending = false;
    this.killSpeakUntil = 0;
    this.killCoolUntil = 0;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    this.releaseIntroDuck();
  }

  announceIntro(lines: string[], onLine: (line: string) => void): void {
    if (this.muted || this.deskVol <= 0 || !lines.length) return;
    const id = (this.deskId += 1);
    this.ring = true;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    const seconds = this.introHold(lines);
    this.duckForIntro(seconds);
    void this.unlock().then(() => {
      if (id !== this.deskId || this.muted) {
        if (id === this.deskId) this.ring = false;
        return;
      }
      this.duckForIntro(seconds);
      this.ringBell(INTRO_STING_SCALE);
      const next = (i: number): void => {
        if (id !== this.deskId || this.muted) {
          if (id === this.deskId) this.ring = false;
          return;
        }
        if (i >= lines.length) {
          this.ring = false;
          return;
        }
        const line = lines[i]!;
        onLine(line);
        if (/fight/i.test(line)) this.gong(INTRO_STING_SCALE);
        else this.deskHit();
        this.speakDesk(line, () => next(i + 1), Math.max(850, line.length * 72), INTRO_VOICE_VOLUME);
      };
      window.setTimeout(() => next(0), 70);
    });
  }

  announceNow(line: string): void {
    if (this.muted || this.deskVol <= 0) return;
    if (this.killLineActive()) {
      if (typeof window !== "undefined") window.setTimeout(() => this.announceNow(line), 120);
      return;
    }
    const id = (this.deskId += 1);
    this.ring = true;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    void this.unlock().then(() => {
      if (id !== this.deskId || this.muted) {
        if (id === this.deskId) this.ring = false;
        return;
      }
      if (/fight|first blood|winner/i.test(line)) this.gong();
      else this.deskHit();
      this.speakDesk(line, () => {
        if (id === this.deskId) this.ring = false;
      }, Math.max(900, line.length * 70));
    });
  }

  private deathVo(home: boolean): void {
    if (this.muted || this.deskVol <= 0 || this.ring) return;
    if (!home) {
      if (!this.killLineActive() && typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
      this.playFactionClip(ANTIFA_NAZI_LINE, 1);
      return;
    }
    if (typeof speechSynthesis === "undefined") return;
    if (!this.killLineActive()) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(MAGA_DEATH);
    u.rate = home ? 0.84 : 1.18;
    u.pitch = home ? 0.48 : 1.18;
    u.volume = this.deskVol;
    const voice = this.pickVoice(home);
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
    this.sweep(140, 70, 0.22, 0.1);
    this.tone(96, 0.18, "sawtooth", 0.08);
  }

  private warmVoices(): void {
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", () => speechSynthesis.getVoices());
  }

  private nowMs(): number {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  }

  /** True while a hero kill line is queued, speaking, or inside its hold. */
  private killLineActive(): boolean {
    return this.killPending || this.nowMs() < this.killSpeakUntil;
  }

  private busy(key: string, ms: number): boolean {
    const now = performance.now();
    if (now - (this.last[key] ?? 0) < ms) return true;
    this.last[key] = now;
    return false;
  }

  private pickVoice(home: boolean): SpeechSynthesisVoice | undefined {
    if (typeof speechSynthesis === "undefined") return undefined;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return undefined;
    const scored = voices
      .map((v) => ({ v, s: this.voiceScore(v, home) }))
      .sort((a, b) => b.s - a.s);
    const top = scored[0];
    return top && top.s > -20 ? top.v : undefined;
  }

  private voiceScore(v: SpeechSynthesisVoice, home: boolean): number {
    const n = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    let s = 0;
    if (lang.startsWith("en-us")) s += 6;
    else if (lang.startsWith("en")) s += 3;
    else s -= 8;
    const male = /david|alex|daniel|fred|guy|mark|george|james|tom|male|english united states/.test(n);
    const female = /zira|samantha|karen|hazel|susan|female|victoria|moira/.test(n);
    if (home) {
      if (male) s += 10;
      if (female) s -= 12;
    } else {
      if (female) s += 8;
      if (male) s -= 4;
    }
    return s;
  }

  private pickRingVoice(): SpeechSynthesisVoice | undefined {
    if (typeof speechSynthesis === "undefined") return undefined;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return this.pickVoice(true);
    const scored = voices
      .map((v) => ({ v, s: this.ringScore(v) }))
      .sort((a, b) => b.s - a.s);
    const top = scored[0];
    return top && top.s > -20 ? top.v : this.pickVoice(true);
  }

  private ringScore(v: SpeechSynthesisVoice): number {
    const n = v.name.toLowerCase();
    let s = this.voiceScore(v, true);
    if (/daniel|david|alex|fred|mark|george|james|google uk|uk english male|english male/.test(n)) s += 10;
    if (/zira|samantha|karen|hazel|susan|victoria|moira|female/.test(n)) s -= 18;
    return s;
  }

  private speakDesk(line: string, done: () => void, hold: number, volume = this.deskVol): void {
    let fired = false;
    const finish = (): void => {
      if (fired) return;
      fired = true;
      window.clearTimeout(timer);
      done();
    };
    const timer = window.setTimeout(finish, hold);
    if (typeof speechSynthesis === "undefined") return;
    const u = new SpeechSynthesisUtterance(line);
    u.rate = 0.72;
    u.pitch = 0.38;
    u.volume = Math.max(0, Math.min(1, volume));
    const voice = this.pickRingVoice();
    if (voice) u.voice = voice;
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);
  }

  /** Seconds the match intro holds the desk, including the short lead-in. */
  private introHold(lines: string[]): number {
    let ms = 70;
    for (const line of lines) ms += Math.max(850, line.length * 72);
    return ms / 1000 + 0.35;
  }

  /** Pull the fight bed and anthem down for the intro only. */
  private duckForIntro(seconds: number): void {
    this.bed?.duck(seconds);
    this.duckMusic(seconds, INTRO_MUSIC_DUCK);
  }

  private duckMusic(seconds: number, amount: number): void {
    if (!this.ctx || this.muted || seconds <= 0) return;
    const until = this.ctx.currentTime + seconds;
    if (until > this.musicDuckUntil) this.musicDuckUntil = until;
    this.musicDuckAmt = Math.min(this.musicDuckAmt, amount);
    this.applyGains();
    const wait = Math.max(0, (this.musicDuckUntil - this.ctx.currentTime) * 1000 + 60);
    window.setTimeout(() => this.applyGains(), wait);
  }

  private releaseIntroDuck(): void {
    this.musicDuckUntil = 0;
    this.musicDuckAmt = 1;
    this.applyGains();
  }

  ringBell(scale = 1): void {
    if (this.muted) return;
    const s = scale > 0 ? scale : 0;
    this.tone(523, 0.85, "sine", 0.36 * s, "desk");
    this.tone(659, 1.1, "sine", 0.24 * s, "desk");
    this.tone(784, 1.35, "sine", 0.16 * s, "desk");
    this.sweep(140, 48, 0.35, 0.22 * s, "desk");
  }

  gong(scale = 1): void {
    if (this.muted) return;
    const s = scale > 0 ? scale : 0;
    this.tone(58, 1.15, "sine", 0.48 * s, "desk");
    this.tone(87, 0.9, "triangle", 0.28 * s, "desk");
    this.tone(116, 0.55, "square", 0.14 * s, "desk");
    this.noise(0.08, 0.1 * s, 220, "desk", 3);
  }

  /** Battlefield phase sting. Desk gong plus a low sweep. */
  phase(): void {
    if (this.muted) return;
    this.gong();
    this.sweep(90, 40, 0.7, 0.16, "desk");
  }

  deskHit(): void {
    if (this.muted) return;
    this.tone(196, 0.12, "triangle", 0.07, "desk");
    this.tone(392, 0.18, "sine", 0.05, "desk");
  }

  private metal(freq: number, dur: number, gainValue: number): void {
    this.tone(freq, dur, "square", gainValue);
    this.tone(freq * 2.73, dur * 0.65, "triangle", gainValue * 0.42);
    this.tone(freq * 4.07, dur * 0.38, "sine", gainValue * 0.14);
    this.noise(Math.min(0.02, dur * 0.35), gainValue * 0.1, 1200, "combat", 2);
  }

  private startDrone(): void {
    if (!this.ctx || !this.combat || this.drone) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 46;
    gain.gain.value = 0.008;
    osc.connect(gain);
    gain.connect(this.combat);
    osc.start();
    this.drone = osc;
  }

  private attachBed(): void {
    if (!this.ctx || !this.combat || this.bed) return;
    this.bed = new BattleBed(this.ctx, this.combat);
    this.bed.setPhase(this.fightPhase);
    this.bed.setAmbience((kind) => this.farFight(kind));
  }

  /** Background layer. Skipped when the combat bus is already full. */
  private farFight(kind: "distant" | "boom"): void {
    if (this.muted) return;
    const now = performance.now();
    const live = this.voiceAt.filter((t) => now - t < 90).length;
    if (live >= 5) return;
    if (kind === "boom") this.sample("boomSmall", 0.45, 0, 1500);
    else this.sample("distant", 0.8, 0, 1900);
  }

  private sample(group: SampleGroup, vol: number, priority = 1, lowpass = 0, rate?: number, steady = false): boolean {
    const bus = this.live();
    if (!bus) return false;
    return this.bank.play(bus.ctx, bus.dest, group, vol, {
      priority,
      lowpass: lowpass > 0 ? lowpass : undefined,
      rate,
      steady,
    });
  }

  private live(which: BusName = "combat"): { ctx: AudioContext; dest: GainNode } | null {
    if (this.muted) return null;
    if (!this.ctx) {
      void this.unlock();
      return null;
    }
    const dest = which === "desk" ? this.desk : this.combat;
    if (!dest) return null;
    const ctx = this.ctx;
    const state = String(ctx.state);
    if (state === "suspended" || state === "interrupted") void ctx.resume().catch(() => undefined);
    return { ctx, dest };
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gainValue: number,
    which: BusName = "combat",
    delay = 0,
  ): void {
    const bus = this.live(which);
    if (gainValue <= 0 || !bus) return;
    const t = bus.ctx.currentTime + (delay > 0 ? delay : 0);
    const osc = bus.ctx.createOscillator();
    const gain = bus.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(Math.max(gainValue, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    this.shape(bus.ctx, osc, gain, type);
    gain.connect(bus.dest);
    osc.start(t);
    osc.stop(t + dur);
  }

  private sweep(from: number, to: number, dur: number, gainValue: number, which: BusName = "combat"): void {
    const bus = this.live(which);
    if (gainValue <= 0 || !bus) return;
    const t = bus.ctx.currentTime;
    const osc = bus.ctx.createOscillator();
    const gain = bus.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + dur);
    gain.gain.setValueAtTime(Math.max(gainValue, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    this.shape(bus.ctx, osc, gain, "sawtooth");
    gain.connect(bus.dest);
    osc.start(t);
    osc.stop(t + dur);
  }

  /** Drop extra hits when a fight is already full. Abilities outrank swings, swings outrank creeps. */
  private admit(priority: number): boolean {
    const now = performance.now();
    this.voiceAt = this.voiceAt.filter((t) => now - t < 90);
    const cap = priority >= 3 ? 8 : priority >= 2 ? 5 : 3;
    if (this.voiceAt.length >= cap) return false;
    this.voiceAt.push(now);
    return true;
  }

  private shape(ctx: AudioContext, osc: OscillatorNode, gain: GainNode, type: OscillatorType): void {
    if (type !== "square" && type !== "sawtooth") {
      osc.connect(gain);
      return;
    }
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = type === "square" ? 4200 : 2800;
    lp.Q.value = 0.55;
    osc.connect(lp);
    lp.connect(gain);
  }

  private allowNoise(priority: number): boolean {
    if (!this.ctx) return true;
    const now = this.ctx.currentTime;
    this.noiseUntil = this.noiseUntil.filter((t) => t > now);
    const cap = priority >= 3 ? 8 : priority >= 2 ? 6 : 4;
    if (this.noiseUntil.length >= cap) return false;
    this.noiseUntil.push(now + 0.09);
    return true;
  }

  private noise(dur: number, gainValue: number, cutoff = 700, which: BusName = "combat", priority = 1): void {
    const bus = this.live(which);
    if (gainValue <= 0 || !bus) return;
    if (!this.allowNoise(priority)) return;
    const t = bus.ctx.currentTime;
    const frames = Math.floor(bus.ctx.sampleRate * dur);
    const buffer = bus.ctx.createBuffer(1, frames, bus.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < frames; i++) {
      brown = brown * 0.9 + (Math.random() * 2 - 1) * 0.18;
      data[i] = Math.max(-1, Math.min(1, brown));
    }
    const src = bus.ctx.createBufferSource();
    const gain = bus.ctx.createGain();
    const filter = bus.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = Math.min(Math.max(cutoff, 160), 1400);
    filter.Q.value = 0.7;
    src.buffer = buffer;
    gain.gain.setValueAtTime(Math.max(gainValue, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(bus.dest);
    src.start(t);
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
