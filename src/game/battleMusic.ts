import type { FightPhase } from "./audio";

/**
 * One looping copy of the provided battle-drum recording.
 * The file was trimmed to the drum body (about 0.05s–37.1s), peak-scaled
 * off the clip, and given a 140ms equal-power wrap so the loop join is
 * the same size as a normal sample step. Playback never restarts the buffer.
 */

const URL = "/audio/music/battle_drums.flac";

export class BattleDrums {
  private ctx: AudioContext;
  private gain: GainNode;
  private src: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  private loading = false;
  private score = 0;
  private phase: FightPhase = "early";
  private anthem = false;
  private engaged = false;
  private hotSince = -1;
  private coldSince = -1;
  private level = 0;
  private duckUntil = 0;
  private duckAmt = 1;
  private timer = 0;
  private rampFrom = 0;
  private rampTo = 0;
  private rampAt = 0;
  private rampDur = 0;
  private nextFade = 0;

  constructor(ctx: AudioContext, music: GainNode) {
    this.ctx = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(music);
    this.gain = gain;
  }

  load(): void {
    if (this.loading || this.buffer) return;
    this.loading = true;
    void fetch(URL)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.arrayBuffer();
      })
      .then((raw) => this.ctx.decodeAudioData(raw.slice(0)))
      .then((buf) => {
        this.buffer = buf;
        this.ensure();
        this.pump();
      })
      .catch(() => {
        /* music stays silent; combat sounds are untouched */
      });
  }

  setFight(score: number, phase: FightPhase, anthem: boolean): void {
    this.score = Math.max(0, Math.min(1, score));
    this.phase = phase;
    this.anthem = anthem;
    this.arm();
    this.pump();
  }

  setAnthem(on: boolean): void {
    this.anthem = on;
    this.pump();
  }

  /** Brief dip under an ability, blast, or objective. The loop keeps running. */
  duck(seconds: number, amount = 0.62): void {
    const t = this.ctx.currentTime;
    this.duckUntil = Math.max(this.duckUntil, t + seconds);
    this.duckAmt = Math.min(this.duckAmt, amount);
    this.nextFade = 0.12;
    this.pump();
    window.setTimeout(() => {
      this.nextFade = 0.7;
      this.pump();
    }, seconds * 1000 + 40);
  }

  private arm(): void {
    if (this.timer) return;
    this.timer = window.setInterval(() => this.pump(), 200);
  }

  private ensure(): void {
    if (this.src || !this.buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.loop = true;
    src.connect(this.gain);
    src.start();
    this.src = src;
  }

  private pump(): void {
    const now = this.ctx.currentTime;
    const hot = this.score >= 0.4;
    const cold = this.score < 0.28;
    if (hot) {
      if (this.hotSince < 0) this.hotSince = now;
      this.coldSince = -1;
      if (!this.engaged && now - this.hotSince >= 0.55) this.engaged = true;
    } else if (cold) {
      if (this.coldSince < 0) this.coldSince = now;
      this.hotSince = -1;
      if (this.engaged && now - this.coldSince >= 0.8) this.engaged = false;
    } else {
      this.hotSince = -1;
      this.coldSince = -1;
    }
    if (now >= this.duckUntil) this.duckAmt = 1;
    let level = 0;
    if (this.engaged && !this.anthem) {
      const ceil = this.phase === "early" ? 0.1 : this.phase === "mid" ? 0.14 : this.phase === "late" ? 0.16 : 0.18;
      const lift = this.score >= 0.9 ? 1.15 : this.score >= 0.65 ? 1.06 : 1;
      level = Math.min(0.22, ceil * lift);
      if (now < this.duckUntil) level *= this.duckAmt;
    } else if (this.anthem && this.level > 0) {
      this.nextFade = this.nextFade || 1.4;
    }
    this.fadeTo(level);
  }

  private heard(): number {
    if (this.rampDur <= 0) return this.rampTo;
    const u = Math.min(1, (this.ctx.currentTime - this.rampAt) / this.rampDur);
    return this.rampFrom + (this.rampTo - this.rampFrom) * u;
  }

  private fadeTo(level: number): void {
    if (!this.buffer) return;
    this.ensure();
    if (Math.abs(level - this.level) < 0.008 && this.nextFade === 0) return;
    const rising = level > this.heard();
    this.level = level;
    const t = this.ctx.currentTime;
    const current = this.heard();
    const seconds = this.nextFade || (rising ? 2 : 3.2);
    this.nextFade = 0;
    this.rampFrom = current;
    this.rampTo = level;
    this.rampAt = t;
    this.rampDur = seconds;
    this.gain.gain.cancelScheduledValues(t);
    this.gain.gain.setValueAtTime(current, t);
    this.gain.gain.linearRampToValueAtTime(level, t + seconds);
  }
}
