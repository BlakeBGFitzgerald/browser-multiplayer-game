/** The Star-Spangled Banner. The composition is public domain. Played in this tab — no file, no Spotify. */

type Note = { f: number; beats: number };

const BEAT = 60 / 92;

/** First verse, transposed to C. f = 0 is a rest. */
const VERSE: Note[] = [
  { f: 392, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 330, beats: 0.75 },
  { f: 262, beats: 0.25 },
  { f: 330, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 523, beats: 1.5 },
  { f: 659, beats: 0.5 },
  { f: 587, beats: 0.75 },
  { f: 523, beats: 0.25 },
  { f: 330, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 523, beats: 2 },
  { f: 523, beats: 0.5 },
  { f: 523, beats: 0.5 },
  { f: 659, beats: 0.75 },
  { f: 587, beats: 0.25 },
  { f: 523, beats: 0.5 },
  { f: 330, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 523, beats: 2 },
  { f: 392, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 330, beats: 0.75 },
  { f: 262, beats: 0.25 },
  { f: 330, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 523, beats: 1.5 },
  { f: 659, beats: 0.5 },
  { f: 587, beats: 0.75 },
  { f: 523, beats: 0.25 },
  { f: 330, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 523, beats: 2 },
  { f: 659, beats: 0.5 },
  { f: 659, beats: 0.5 },
  { f: 698, beats: 0.75 },
  { f: 698, beats: 0.25 },
  { f: 698, beats: 0.5 },
  { f: 784, beats: 0.5 },
  { f: 784, beats: 1.5 },
  { f: 698, beats: 0.5 },
  { f: 659, beats: 0.75 },
  { f: 587, beats: 0.25 },
  { f: 523, beats: 0.5 },
  { f: 587, beats: 0.5 },
  { f: 659, beats: 1.5 },
  { f: 523, beats: 0.5 },
  { f: 523, beats: 0.5 },
  { f: 523, beats: 0.5 },
  { f: 659, beats: 1 },
  { f: 587, beats: 0.5 },
  { f: 523, beats: 0.5 },
  { f: 494, beats: 0.5 },
  { f: 523, beats: 1.5 },
  { f: 392, beats: 0.5 },
  { f: 330, beats: 0.75 },
  { f: 262, beats: 0.25 },
  { f: 330, beats: 0.5 },
  { f: 392, beats: 0.5 },
  { f: 523, beats: 2.5 },
  { f: 0, beats: 1.5 },
];

export class Anthem {
  private ctx: AudioContext;
  private dest: GainNode;
  private i = 0;
  private nextT = 0;
  private timer = 0;
  private stopped = false;

  constructor(ctx: AudioContext, dest: GainNode) {
    this.ctx = ctx;
    this.dest = dest;
    this.nextT = ctx.currentTime + 0.04;
    this.kick();
  }

  restart(): void {
    if (this.stopped) return;
    this.i = 0;
    this.nextT = this.ctx.currentTime + 0.02;
  }

  stop(): void {
    this.stopped = true;
    window.clearTimeout(this.timer);
  }

  private kick(): void {
    if (this.stopped) return;
    const now = this.ctx.currentTime;
    if (this.nextT < now - 0.02) this.nextT = now + 0.01;
    const ahead = now + 0.4;
    while (this.nextT < ahead) {
      const n = VERSE[this.i]!;
      if (n.f > 0) this.voice(n.f, n.beats);
      this.nextT += n.beats * BEAT;
      this.i = (this.i + 1) % VERSE.length;
    }
    this.timer = window.setTimeout(() => this.kick(), 100);
  }

  private voice(freq: number, beats: number): void {
    const t = this.nextT;
    const dur = Math.max(0.08, beats * BEAT * 0.92);
    brass(this.ctx, this.dest, freq, t, dur, 0.28);
    brass(this.ctx, this.dest, freq * 0.5, t, dur, 0.34);
    if (beats >= 1) brass(this.ctx, this.dest, freq * 1.5, t, dur * 0.55, 0.1);
    if (beats >= 1.4) thump(this.ctx, this.dest, t, 0.16);
  }
}

function brass(
  ctx: AudioContext,
  dest: GainNode,
  freq: number,
  t: number,
  dur: number,
  gainValue: number,
): void {
  const osc = ctx.createOscillator();
  const fifth = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  fifth.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, t);
  fifth.frequency.setValueAtTime(freq * 1.498, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(gainValue, 0.0001), t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  fifth.connect(gain);
  gain.connect(dest);
  osc.start(t);
  fifth.start(t);
  osc.stop(t + dur + 0.02);
  fifth.stop(t + dur + 0.02);
}

function thump(ctx: AudioContext, dest: GainNode, t: number, gainValue: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(92, t);
  osc.frequency.exponentialRampToValueAtTime(46, t + 0.14);
  gain.gain.setValueAtTime(Math.max(gainValue, 0.0001), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.18);
}
