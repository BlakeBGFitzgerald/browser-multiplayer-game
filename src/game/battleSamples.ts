/**
 * Recorded one-shots layered on the existing combat bus.
 * Kit voices stay synthesized. These clips are trimmed hits from the
 * Pixabay previews that were actually playable in the saved pages.
 */

export type SampleGroup =
  | "rifle"
  | "tommy"
  | "heavy"
  | "distant"
  | "whoosh"
  | "body"
  | "metal"
  | "heavyImpact"
  | "boomSmall"
  | "boomMid"
  | "boomLarge";

const FILES: Record<SampleGroup, string[]> = {
  rifle: [1, 2, 3, 4, 5].map((n) => `/audio/battle/weapons/rifle/rifle_shot_0${n}.wav`),
  tommy: ["/audio/battle/weapons/tommy/tommy_burst.wav"],
  heavy: ["/audio/battle/weapons/heavy/heavy_shot_01.wav"],
  distant: [1, 2, 3, 4].map((n) => `/audio/battle/weapons/rifle/distant_shot_0${n}.wav`),
  whoosh: ["/audio/battle/movement/whoosh_01.wav", "/audio/battle/movement/whoosh_02.wav"],
  body: [1, 2, 3].map((n) => `/audio/battle/impacts/body_impact_0${n}.wav`),
  metal: [1, 2, 3, 4].map((n) => `/audio/battle/impacts/metal_impact_0${n}.wav`),
  heavyImpact: ["/audio/battle/impacts/heavy_impact_01.wav"],
  boomSmall: [
    "/audio/battle/explosions/explosion_small_01.wav",
    "/audio/battle/explosions/explosion_small_02.wav",
  ],
  boomMid: ["/audio/battle/explosions/explosion_medium_01.wav"],
  boomLarge: ["/audio/battle/explosions/explosion_large_01.wav"],
};

/** Marksman with a rifle on the sheet. */
const GUNS = new Set(["maga-hooli"]);
/** Ranged artillery. A heavier shot, not a rifle crack. */
const ARTILLERY = new Set(["maga-alexgroans", "wild-butter", "lw-hocking"]);

const GAIN: Record<SampleGroup, number> = {
  rifle: 0.5,
  tommy: 0.4,
  heavy: 0.46,
  distant: 0.22,
  whoosh: 0.22,
  body: 0.36,
  metal: 0.28,
  heavyImpact: 0.4,
  boomSmall: 0.4,
  boomMid: 0.48,
  boomLarge: 0.55,
};

type Cap = { n: number; window: number; pri: number };

const CAP: Record<string, Cap> = {
  rifle: { n: 4, window: 120, pri: 6 },
  tommy: { n: 1, window: 400, pri: 1 },
  heavy: { n: 3, window: 140, pri: 4 },
  distant: { n: 1, window: 220, pri: 1 },
  whoosh: { n: 3, window: 140, pri: 4 },
  body: { n: 5, window: 110, pri: 6 },
  metal: { n: 3, window: 120, pri: 4 },
  heavyImpact: { n: 3, window: 160, pri: 4 },
  boom: { n: 2, window: 420, pri: 3 },
};

function family(group: SampleGroup): string {
  if (group === "boomSmall" || group === "boomMid" || group === "boomLarge") return "boom";
  return group;
}

export function gunHero(id: string): boolean {
  return GUNS.has(id);
}

export function artilleryHero(id: string): boolean {
  return ARTILLERY.has(id);
}

export class BattleBank {
  private buffers = new Map<SampleGroup, AudioBuffer[]>();
  private last = new Map<SampleGroup, number>();
  private slots: { t: number; family: string }[] = [];
  private loading: Promise<void> | null = null;

  load(ctx: AudioContext): void {
    if (this.loading) return;
    const groups = Object.keys(FILES) as SampleGroup[];
    this.loading = Promise.all(
      groups.map(async (group) => {
        const clips: AudioBuffer[] = [];
        for (const url of FILES[group]) {
          try {
            const res = await fetch(url);
            if (!res.ok) continue;
            const raw = await res.arrayBuffer();
            const buf = await ctx.decodeAudioData(raw.slice(0));
            clips.push(buf);
          } catch {
            /* skip a bad file; synth voices still play */
          }
        }
        if (clips.length) this.buffers.set(group, clips);
      }),
    ).then(() => undefined);
  }

  ready(group: SampleGroup): boolean {
    return (this.buffers.get(group)?.length ?? 0) > 0;
  }

  /**
   * Play one variation. Returns false when the bank is empty or the
   * concurrency cap dropped the sound.
   */
  play(
    ctx: AudioContext,
    dest: AudioNode,
    group: SampleGroup,
    vol: number,
    opts?: { priority?: number; lowpass?: number; rate?: number; steady?: boolean },
  ): boolean {
    const clips = this.buffers.get(group);
    if (!clips?.length || vol <= 0.02) return false;
    const priority = opts?.priority ?? 1;
    const fam = family(group);
    const cap = CAP[fam] ?? CAP.body!;
    const nowMs = performance.now();
    const limit = priority >= 3 ? cap.pri : cap.n;
    this.slots = this.slots.filter((s) => nowMs - s.t < 500);
    const live = this.slots.filter((s) => s.family === fam && nowMs - s.t < cap.window);
    if (live.length >= limit) return false;

    let idx = Math.floor(Math.random() * clips.length);
    const prev = this.last.get(group);
    if (clips.length > 1 && idx === prev) idx = (idx + 1) % clips.length;
    this.last.set(group, idx);

    const spread = opts?.steady || group === "whoosh" || group === "distant" ? 0.012 : 0.03;
    const jitter = opts?.steady ? 1 : 1 - spread + Math.random() * spread * 2;
    const rate = (opts?.rate ?? 1) * jitter;
    const src = ctx.createBufferSource();
    src.buffer = clips[idx]!;
    src.playbackRate.value = Math.max(0.9, Math.min(1.1, rate));
    const gain = ctx.createGain();
    const g = Math.max(0.0001, GAIN[group] * Math.min(1, vol));
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(g, t);
    let node: AudioNode = src;
    const cutoff = opts?.lowpass ?? (vol < 0.45 && group !== "boomLarge" ? 1600 + vol * 2800 : 0);
    if (cutoff > 0) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = Math.max(700, Math.min(8000, cutoff));
      lp.Q.value = 0.6;
      src.connect(lp);
      node = lp;
    }
    node.connect(gain);
    gain.connect(dest);
    src.start(t);
    const dur = (clips[idx]!.duration / Math.max(0.5, src.playbackRate.value)) + 0.05;
    src.stop(t + dur);
    this.slots.push({ t: nowMs, family: fam });
    src.onended = () => {
      try {
        src.disconnect();
        gain.disconnect();
        if (node !== src) node.disconnect();
      } catch {
        /* already disconnected */
      }
    };
    return true;
  }
}
