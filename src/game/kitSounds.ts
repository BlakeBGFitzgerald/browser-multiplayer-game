/** Kit voices stay oscillators. Recorded one-shots are layered in Sfx, not here. */

export type KitKind = "swing" | "hit" | "cast" | "ult";
export type CreepKind = "melee" | "ranged" | "wild";

export type SynthCtx = Pick<
  BaseAudioContext,
  "currentTime" | "sampleRate" | "createOscillator" | "createGain" | "createBuffer" | "createBufferSource" | "createBiquadFilter"
>;

export type Bus = { ctx: SynthCtx; dest: AudioNode };

type Layer = {
  f?: number;
  to?: number;
  d: number;
  w?: OscillatorType;
  g: number;
  cut?: number;
  hp?: boolean;
  wait?: number;
};

type Voice = { swing: Layer[]; hit: Layer[]; cast: Layer[]; ult?: Layer[] };

const VOICE_OF: Record<string, string> = {
  "maga-grumptor": "riot",
  "maga-kyleyle": "foil",
  "maga-alexgroans": "mail",
  "maga-rogentor": "radio",
  "maga-quirk": "intern",
  "maga-tommy": "pledge",
  "maga-elonmolk": "term",
  "maga-boris": "coach",
  "maga-brander": "debate",
  "maga-vestyt": "cadet",
  "maga-steers": "press",
  "maga-hooli": "maga-hooli",
  "maga-ricky": "pledge",
  "maga-bushed": "gavel",
  "lw-harass": "flyer",
  "lw-sandbags": "mascot",
  "lw-bitenten": "janitor",
  "lw-odramma": "lecture",
  "lw-youngturkey": "bike",
  "lw-hocking": "belfry",
  "lw-vakxie": "chem",
  "lw-climate": "ethics",
  "lw-journalist": "alto",
  "wild-icon": "desk",
  "wild-enigma": "counsel",
  "wild-cartoons": "sack",
  "wild-dynasty": "shot",
  "wild-legend": "spike",
  "wild-karen": "reg",
  "wild-vegan": "ta",
  "wild-butter": "snare",
  "wild-bruella": "ra",
  "wild-danny": "boiler",
  "wild-price": "mason",
  "wild-cezanne": "bass",
  "wild-slush": "sack",
  "wild-metalpak": "chef",
  "wild-hatty": "skate",
  "wild-octo": "bus",
  "wild-airosoul": "intern",
  "mma-macgregor": "foil",
  "mma-nurmagoat": "gavel",
  "mma-jonesy": "chef",
  "mma-adesanyaish": "skate",
  "mma-poirierish": "boiler",
  "mma-diazish": "pledge",
};

const missingVoice = new Set<string>();

export function playKitVoice(bus: Bus, heroId: string, kind: KitKind, vol: number): void {
  const v = Math.max(0.05, vol);
  const voice = KITS[heroId] ?? KITS[VOICE_OF[heroId] ?? ""] ?? KITS.riot;
  if (!KITS[heroId] && !KITS[VOICE_OF[heroId] ?? ""] && !missingVoice.has(heroId)) {
    missingVoice.add(heroId);
    console.warn(`[audio] missing kit voice for ${heroId}; using riot`);
  }
  const layers =
    kind === "ult"
      ? (voice!.ult ?? [
          ...voice!.cast,
          { f: 70, to: 32, d: 0.3, w: "sawtooth" as const, g: 0.3, wait: 0.04 },
          { d: 0.18, g: 0.26, cut: 480 },
        ])
      : voice![kind];
  fire(bus, layers, v);
}

export function playCreepVoice(bus: Bus, kind: CreepKind, vol: number): void {
  const v = Math.max(0.05, vol);
  fire(bus, CREEPS[kind], v);
}

function fire(bus: Bus, layers: Layer[], vol: number): void {
  for (const L of layers) {
    const t = bus.ctx.currentTime + (L.wait ?? 0);
    const g = Math.max(L.g * vol, 0.0001);
    if (L.cut != null) {
      noise(bus, t, L.d, g * 0.42, Math.min(L.cut, L.hp ? 1400 : 700), Boolean(L.hp));
      continue;
    }
    const f = L.f ?? 220;
    if (L.to != null) sweep(bus, t, f, L.to, L.d, L.w ?? "sawtooth", g);
    else tone(bus, t, f, L.d, L.w ?? "square", g);
  }
}

function tone(bus: Bus, t: number, freq: number, dur: number, type: OscillatorType, g: number): void {
  const osc = bus.ctx.createOscillator();
  const gain = bus.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, freq), t);
  gain.gain.setValueAtTime(g, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  shape(bus, osc, gain, type);
  gain.connect(bus.dest);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function sweep(
  bus: Bus,
  t: number,
  from: number,
  to: number,
  dur: number,
  type: OscillatorType,
  g: number,
): void {
  const osc = bus.ctx.createOscillator();
  const gain = bus.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, from), t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  gain.gain.setValueAtTime(g, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  shape(bus, osc, gain, type);
  gain.connect(bus.dest);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function shape(bus: Bus, osc: OscillatorNode, gain: GainNode, type: OscillatorType): void {
  if (type !== "square" && type !== "sawtooth") {
    osc.connect(gain);
    return;
  }
  const lp = bus.ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = type === "square" ? 4200 : 2800;
  lp.Q.value = 0.55;
  osc.connect(lp);
  lp.connect(gain);
}

function noise(bus: Bus, t: number, dur: number, g: number, cutoff: number, hp: boolean): void {
  const frames = Math.max(1, Math.floor(bus.ctx.sampleRate * dur));
  const buffer = bus.ctx.createBuffer(1, frames, bus.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < frames; i++) {
    brown = brown * 0.86 + (Math.random() * 2 - 1) * 0.2;
    data[i] = Math.max(-1, Math.min(1, brown));
  }
  const src = bus.ctx.createBufferSource();
  const gain = bus.ctx.createGain();
  const filter = bus.ctx.createBiquadFilter();
  filter.type = hp ? "bandpass" : "lowpass";
  filter.frequency.value = hp ? Math.min(cutoff, 1600) : Math.min(cutoff, 800);
  filter.Q.value = hp ? 0.7 : 0.6;
  src.buffer = buffer;
  gain.gain.setValueAtTime(g, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(bus.dest);
  src.start(t);
}

const CREEPS: Record<CreepKind, Layer[]> = {
  melee: [
    { f: 240, to: 90, d: 0.08, w: "sawtooth", g: 0.28 },
    { f: 1680, d: 0.05, w: "square", g: 0.18 },
    { d: 0.04, g: 0.16, cut: 2200, hp: true },
  ],
  ranged: [
    { f: 920, to: 340, d: 0.1, w: "triangle", g: 0.24 },
    { f: 2100, d: 0.04, w: "sine", g: 0.16 },
    { d: 0.03, g: 0.12, cut: 2800, hp: true },
  ],
  wild: [
    { f: 110, to: 55, d: 0.16, w: "sawtooth", g: 0.32 },
    { d: 0.12, g: 0.22, cut: 380 },
    { f: 70, d: 0.1, w: "square", g: 0.14 },
  ],
};

const KITS: Record<string, Voice> = {
  riot: {
    swing: [
      { f: 420, to: 90, d: 0.12, w: "sawtooth", g: 0.34 },
      { d: 0.05, g: 0.18, cut: 1600, hp: true },
    ],
    hit: [
      { f: 190, d: 0.1, w: "square", g: 0.38 },
      { f: 1480, d: 0.08, w: "triangle", g: 0.28 },
      { d: 0.05, g: 0.2, cut: 2400, hp: true },
    ],
    cast: [
      { f: 220, to: 880, d: 0.22, w: "sawtooth", g: 0.3 },
      { f: 110, d: 0.2, w: "square", g: 0.22 },
    ],
  },
  mascot: {
    swing: [
      { f: 180, to: 70, d: 0.14, w: "sine", g: 0.36 },
      { d: 0.08, g: 0.2, cut: 500 },
    ],
    hit: [
      { f: 140, d: 0.12, w: "sine", g: 0.4 },
      { f: 980, d: 0.07, w: "triangle", g: 0.22 },
      { d: 0.06, g: 0.18, cut: 900 },
    ],
    cast: [
      { f: 260, to: 520, d: 0.2, w: "triangle", g: 0.28 },
      { f: 90, d: 0.18, w: "sine", g: 0.24 },
    ],
  },
  gavel: {
    swing: [
      { f: 520, to: 160, d: 0.1, w: "triangle", g: 0.3 },
    ],
    hit: [
      { f: 210, d: 0.09, w: "square", g: 0.42 },
      { f: 105, d: 0.14, w: "sine", g: 0.3 },
      { d: 0.04, g: 0.16, cut: 1800, hp: true },
    ],
    cast: [
      { f: 160, d: 0.22, w: "square", g: 0.34 },
      { f: 80, d: 0.28, w: "sine", g: 0.26 },
    ],
  },
  boiler: {
    swing: [
      { d: 0.1, g: 0.28, cut: 900 },
      { f: 300, to: 80, d: 0.12, w: "sawtooth", g: 0.22 },
    ],
    hit: [
      { f: 90, d: 0.14, w: "square", g: 0.36 },
      { d: 0.14, g: 0.32, cut: 700 },
      { f: 1480, d: 0.06, w: "triangle", g: 0.16 },
    ],
    cast: [
      { d: 0.28, g: 0.36, cut: 1100 },
      { f: 60, to: 180, d: 0.3, w: "sawtooth", g: 0.28 },
    ],
  },
  mason: {
    swing: [
      { f: 90, to: 50, d: 0.12, w: "sine", g: 0.32 },
    ],
    hit: [
      { f: 70, d: 0.16, w: "square", g: 0.4 },
      { d: 0.1, g: 0.28, cut: 420 },
      { f: 340, d: 0.08, w: "triangle", g: 0.18 },
    ],
    cast: [
      { f: 55, d: 0.3, w: "sine", g: 0.36 },
      { d: 0.2, g: 0.24, cut: 300 },
    ],
  },
  janitor: {
    swing: [
      { f: 240, to: 90, d: 0.12, w: "triangle", g: 0.26 },
      { d: 0.08, g: 0.2, cut: 1400 },
    ],
    hit: [
      { f: 180, d: 0.1, w: "sine", g: 0.32 },
      { d: 0.1, g: 0.28, cut: 1600 },
      { f: 720, d: 0.05, w: "triangle", g: 0.16 },
    ],
    cast: [
      { d: 0.2, g: 0.3, cut: 1800 },
      { f: 140, to: 60, d: 0.18, w: "sine", g: 0.22 },
    ],
  },
  coach: {
    swing: [
      { f: 80, to: 40, d: 0.12, w: "sawtooth", g: 0.34 },
    ],
    hit: [
      { f: 110, d: 0.08, w: "square", g: 0.4 },
      { f: 220, d: 0.1, w: "triangle", g: 0.28 },
      { d: 0.05, g: 0.2, cut: 900, hp: true },
    ],
    cast: [
      { f: 55, d: 0.24, w: "square", g: 0.38 },
      { f: 330, d: 0.12, w: "triangle", g: 0.2, wait: 0.04 },
    ],
  },
  bus: {
    swing: [
      { d: 0.12, g: 0.3, cut: 500 },
      { f: 70, to: 40, d: 0.14, w: "sawtooth", g: 0.24 },
    ],
    hit: [
      { f: 90, d: 0.16, w: "square", g: 0.36 },
      { f: 370, d: 0.2, w: "sine", g: 0.22 },
      { d: 0.1, g: 0.22, cut: 400 },
    ],
    cast: [
      { f: 220, d: 0.35, w: "sawtooth", g: 0.28 },
      { f: 55, d: 0.3, w: "sine", g: 0.3 },
    ],
  },
  cadet: {
    swing: [
      { f: 480, to: 120, d: 0.1, w: "sawtooth", g: 0.3 },
    ],
    hit: [
      { f: 200, d: 0.08, w: "square", g: 0.36 },
      { f: 1600, d: 0.05, w: "triangle", g: 0.22 },
      { d: 0.04, g: 0.16, cut: 2200, hp: true },
    ],
    cast: [
      { f: 392, d: 0.12, w: "square", g: 0.28 },
      { f: 523, d: 0.14, w: "triangle", g: 0.22, wait: 0.08 },
      { f: 98, d: 0.2, w: "sine", g: 0.24 },
    ],
  },
  pledge: {
    swing: [
      { f: 160, to: 70, d: 0.12, w: "sawtooth", g: 0.3 },
    ],
    hit: [
      { f: 130, d: 0.12, w: "square", g: 0.38 },
      { f: 880, d: 0.08, w: "triangle", g: 0.2 },
      { d: 0.06, g: 0.18, cut: 700 },
    ],
    cast: [
      { f: 98, d: 0.22, w: "sawtooth", g: 0.32 },
      { f: 196, d: 0.16, w: "triangle", g: 0.2 },
    ],
  },
  bass: {
    swing: [
      { f: 70, to: 40, d: 0.12, w: "sine", g: 0.36 },
    ],
    hit: [
      { f: 58, d: 0.22, w: "sine", g: 0.5 },
      { f: 116, d: 0.12, w: "triangle", g: 0.22 },
      { d: 0.08, g: 0.2, cut: 220 },
    ],
    cast: [
      { f: 49, d: 0.4, w: "sine", g: 0.48 },
      { f: 98, d: 0.2, w: "square", g: 0.18 },
    ],
  },
  chef: {
    swing: [
      { f: 500, to: 180, d: 0.1, w: "triangle", g: 0.28 },
    ],
    hit: [
      { f: 420, d: 0.08, w: "square", g: 0.34 },
      { f: 1260, d: 0.06, w: "triangle", g: 0.2 },
      { d: 0.08, g: 0.22, cut: 2400 },
    ],
    cast: [
      { d: 0.2, g: 0.28, cut: 1800 },
      { f: 220, d: 0.16, w: "sawtooth", g: 0.24 },
    ],
  },
  spike: {
    swing: [
      { f: 880, to: 220, d: 0.09, w: "sawtooth", g: 0.28 },
    ],
    hit: [
      { f: 1480, d: 0.05, w: "square", g: 0.3 },
      { f: 240, d: 0.08, w: "triangle", g: 0.22 },
      { d: 0.03, g: 0.16, cut: 3000, hp: true },
    ],
    cast: [
      { f: 1320, d: 0.06, w: "square", g: 0.32 },
      { f: 90, to: 40, d: 0.16, w: "sawtooth", g: 0.24 },
    ],
  },
  foil: {
    swing: [
      { f: 2200, to: 600, d: 0.08, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 2400, d: 0.07, w: "triangle", g: 0.34 },
      { f: 3600, d: 0.04, w: "sine", g: 0.18 },
      { d: 0.03, g: 0.14, cut: 4200, hp: true },
    ],
    cast: [
      { f: 1760, to: 440, d: 0.16, w: "triangle", g: 0.3 },
      { f: 880, d: 0.1, w: "sine", g: 0.18 },
    ],
  },
  skate: {
    swing: [
      { d: 0.1, g: 0.24, cut: 2200, hp: true },
      { f: 200, to: 90, d: 0.1, w: "sawtooth", g: 0.2 },
    ],
    hit: [
      { f: 320, d: 0.06, w: "square", g: 0.3 },
      { d: 0.08, g: 0.26, cut: 1800, hp: true },
      { f: 90, d: 0.1, w: "sine", g: 0.2 },
    ],
    cast: [
      { d: 0.22, g: 0.3, cut: 1600, hp: true },
      { f: 140, to: 420, d: 0.2, w: "sawtooth", g: 0.24 },
    ],
  },
  shot: {
    swing: [
      { f: 1800, to: 400, d: 0.08, w: "sine", g: 0.22 },
    ],
    hit: [
      { d: 0.04, g: 0.36, cut: 500 },
      { f: 2400, d: 0.03, w: "square", g: 0.22 },
      { f: 120, d: 0.08, w: "sine", g: 0.2 },
    ],
    cast: [
      { d: 0.06, g: 0.4, cut: 400 },
      { f: 2000, d: 0.12, w: "sine", g: 0.22 },
      { f: 80, d: 0.1, w: "square", g: 0.16 },
    ],
  },
  flyer: {
    swing: [
      { f: 640, to: 180, d: 0.1, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 420, d: 0.07, w: "sine", g: 0.3 },
      { f: 1680, d: 0.08, w: "triangle", g: 0.2 },
      { d: 0.04, g: 0.14, cut: 2000, hp: true },
    ],
    cast: [
      { f: 784, d: 0.1, w: "triangle", g: 0.28 },
      { f: 1175, d: 0.12, w: "sine", g: 0.2, wait: 0.06 },
    ],
  },
  alto: {
    swing: [
      { f: 466, to: 233, d: 0.12, w: "sawtooth", g: 0.26 },
    ],
    hit: [
      { f: 349, d: 0.14, w: "sawtooth", g: 0.32 },
      { f: 698, d: 0.1, w: "triangle", g: 0.2 },
      { d: 0.05, g: 0.14, cut: 1600, hp: true },
    ],
    cast: [
      { f: 233, to: 466, d: 0.28, w: "sawtooth", g: 0.3 },
      { f: 117, d: 0.22, w: "sine", g: 0.2 },
    ],
  },
  mail: {
    swing: [
      { f: 200, to: 80, d: 0.1, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 160, d: 0.1, w: "square", g: 0.34 },
      { d: 0.06, g: 0.2, cut: 800 },
      { f: 640, d: 0.05, w: "triangle", g: 0.16 },
    ],
    cast: [
      { f: 120, d: 0.18, w: "square", g: 0.3 },
      { f: 480, d: 0.1, w: "sine", g: 0.18 },
    ],
  },
  intern: {
    swing: [
      { f: 300, to: 110, d: 0.09, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 880, d: 0.05, w: "square", g: 0.3 },
      { f: 220, d: 0.08, w: "triangle", g: 0.22 },
      { d: 0.04, g: 0.16, cut: 2500, hp: true },
    ],
    cast: [
      { f: 196, d: 0.12, w: "square", g: 0.28 },
      { f: 392, d: 0.16, w: "triangle", g: 0.2 },
    ],
  },
  bike: {
    swing: [
      { f: 600, to: 180, d: 0.1, w: "triangle", g: 0.24 },
      { d: 0.06, g: 0.16, cut: 2000, hp: true },
    ],
    hit: [
      { f: 1760, d: 0.12, w: "sine", g: 0.3 },
      { f: 140, d: 0.08, w: "square", g: 0.26 },
      { d: 0.04, g: 0.14, cut: 3000, hp: true },
    ],
    cast: [
      { f: 1480, d: 0.2, w: "sine", g: 0.28 },
      { f: 90, to: 40, d: 0.18, w: "sawtooth", g: 0.22 },
    ],
  },
  belfry: {
    swing: [
      { f: 392, to: 196, d: 0.12, w: "sine", g: 0.26 },
    ],
    hit: [
      { f: 523, d: 0.4, w: "sine", g: 0.36 },
      { f: 784, d: 0.28, w: "triangle", g: 0.18 },
      { f: 261, d: 0.35, w: "sine", g: 0.16 },
    ],
    cast: [
      { f: 392, d: 0.5, w: "sine", g: 0.4 },
      { f: 196, d: 0.45, w: "triangle", g: 0.22 },
      { f: 98, d: 0.3, w: "sine", g: 0.18 },
    ],
  },
  sack: {
    swing: [
      { f: 180, to: 80, d: 0.09, w: "sine", g: 0.26 },
    ],
    hit: [
      { f: 240, d: 0.07, w: "triangle", g: 0.32 },
      { d: 0.06, g: 0.22, cut: 900 },
      { f: 90, d: 0.08, w: "sine", g: 0.18 },
    ],
    cast: [
      { f: 160, to: 320, d: 0.16, w: "triangle", g: 0.28 },
      { d: 0.1, g: 0.2, cut: 700 },
    ],
  },
  snare: {
    swing: [
      { d: 0.04, g: 0.22, cut: 4000, hp: true },
      { f: 220, to: 90, d: 0.08, w: "triangle", g: 0.18 },
    ],
    hit: [
      { d: 0.06, g: 0.4, cut: 3500, hp: true },
      { f: 180, d: 0.08, w: "square", g: 0.24 },
      { f: 2200, d: 0.04, w: "triangle", g: 0.16 },
    ],
    cast: [
      { d: 0.16, g: 0.38, cut: 3200, hp: true },
      { f: 110, d: 0.14, w: "square", g: 0.22 },
    ],
  },
  desk: {
    swing: [
      { f: 340, to: 140, d: 0.09, w: "triangle", g: 0.24 },
    ],
    hit: [
      { f: 190, d: 0.08, w: "square", g: 0.34 },
      { f: 760, d: 0.12, w: "sine", g: 0.2 },
      { d: 0.04, g: 0.14, cut: 1800, hp: true },
    ],
    cast: [
      { f: 210, d: 0.1, w: "square", g: 0.3 },
      { f: 420, d: 0.18, w: "sine", g: 0.22 },
    ],
  },
  ra: {
    swing: [
      { f: 280, to: 110, d: 0.09, w: "triangle", g: 0.24 },
    ],
    hit: [
      { f: 880, d: 0.06, w: "square", g: 0.28 },
      { f: 220, d: 0.1, w: "sine", g: 0.22 },
      { d: 0.04, g: 0.14, cut: 2400, hp: true },
    ],
    cast: [
      { f: 523, d: 0.16, w: "sine", g: 0.28 },
      { f: 659, d: 0.14, w: "triangle", g: 0.18 },
    ],
  },
  chem: {
    swing: [
      { f: 1400, to: 400, d: 0.1, w: "sine", g: 0.22 },
    ],
    hit: [
      { f: 2100, d: 0.08, w: "sine", g: 0.3 },
      { d: 0.12, g: 0.28, cut: 2200 },
      { f: 180, d: 0.08, w: "triangle", g: 0.16 },
    ],
    cast: [
      { d: 0.24, g: 0.34, cut: 1800 },
      { f: 880, to: 220, d: 0.22, w: "sawtooth", g: 0.24 },
    ],
  },
  debate: {
    swing: [
      { f: 300, to: 120, d: 0.1, w: "triangle", g: 0.24 },
    ],
    hit: [
      { f: 200, d: 0.08, w: "square", g: 0.32 },
      { f: 800, d: 0.1, w: "sine", g: 0.2 },
      { d: 0.04, g: 0.14, cut: 2000, hp: true },
    ],
    cast: [
      { f: 160, d: 0.14, w: "square", g: 0.3 },
      { f: 320, d: 0.2, w: "triangle", g: 0.22 },
    ],
  },
  radio: {
    swing: [
      { d: 0.08, g: 0.26, cut: 2800, hp: true },
      { f: 400, to: 120, d: 0.09, w: "sawtooth", g: 0.18 },
    ],
    hit: [
      { d: 0.1, g: 0.32, cut: 2400, hp: true },
      { f: 880, d: 0.06, w: "square", g: 0.22 },
      { f: 440, d: 0.12, w: "sine", g: 0.18 },
    ],
    cast: [
      { d: 0.2, g: 0.34, cut: 2000, hp: true },
      { f: 660, d: 0.16, w: "sine", g: 0.24 },
    ],
  },
  counsel: {
    swing: [
      { f: 392, to: 196, d: 0.12, w: "sine", g: 0.22 },
    ],
    hit: [
      { f: 523, d: 0.16, w: "sine", g: 0.3 },
      { f: 659, d: 0.12, w: "triangle", g: 0.18 },
    ],
    cast: [
      { f: 392, d: 0.28, w: "sine", g: 0.32 },
      { f: 494, d: 0.24, w: "triangle", g: 0.2 },
    ],
  },
  ta: {
    swing: [
      { f: 900, to: 240, d: 0.09, w: "triangle", g: 0.24 },
    ],
    hit: [
      { f: 1400, d: 0.08, w: "sawtooth", g: 0.26 },
      { f: 280, d: 0.07, w: "square", g: 0.24 },
      { d: 0.05, g: 0.16, cut: 2600, hp: true },
    ],
    cast: [
      { f: 1100, to: 280, d: 0.2, w: "sawtooth", g: 0.28 },
      { f: 220, d: 0.12, w: "square", g: 0.2 },
    ],
  },
  press: {
    swing: [
      { f: 1100, d: 0.04, w: "square", g: 0.24 },
      { f: 200, to: 90, d: 0.08, w: "triangle", g: 0.16 },
    ],
    hit: [
      { f: 980, d: 0.04, w: "square", g: 0.32 },
      { f: 196, d: 0.08, w: "triangle", g: 0.2 },
      { d: 0.03, g: 0.14, cut: 3000, hp: true },
    ],
    cast: [
      { f: 880, d: 0.05, w: "square", g: 0.28 },
      { f: 660, d: 0.05, w: "square", g: 0.24, wait: 0.05 },
      { f: 440, d: 0.06, w: "square", g: 0.22, wait: 0.1 },
    ],
  },
  term: {
    swing: [
      { f: 1200, to: 400, d: 0.08, w: "square", g: 0.22 },
    ],
    hit: [
      { f: 880, d: 0.05, w: "square", g: 0.3 },
      { f: 1760, d: 0.04, w: "sine", g: 0.18 },
      { d: 0.04, g: 0.16, cut: 3200, hp: true },
    ],
    cast: [
      { f: 220, d: 0.08, w: "square", g: 0.28 },
      { f: 110, d: 0.2, w: "sawtooth", g: 0.24 },
      { d: 0.16, g: 0.22, cut: 1800, hp: true },
    ],
  },
  lecture: {
    swing: [
      { f: 2000, d: 0.05, w: "sine", g: 0.22 },
    ],
    hit: [
      { f: 1800, d: 0.06, w: "sine", g: 0.28 },
      { f: 200, d: 0.08, w: "triangle", g: 0.2 },
      { d: 0.04, g: 0.12, cut: 2800, hp: true },
    ],
    cast: [
      { f: 2400, to: 600, d: 0.22, w: "sine", g: 0.26 },
      { f: 150, d: 0.16, w: "square", g: 0.2 },
    ],
  },
  reg: {
    swing: [
      { f: 240, to: 100, d: 0.1, w: "triangle", g: 0.24 },
    ],
    hit: [
      { f: 170, d: 0.1, w: "square", g: 0.34 },
      { f: 85, d: 0.14, w: "sine", g: 0.22 },
      { d: 0.04, g: 0.14, cut: 1600, hp: true },
    ],
    cast: [
      { f: 130, d: 0.2, w: "square", g: 0.32 },
      { f: 260, d: 0.16, w: "triangle", g: 0.2 },
    ],
  },
  ethics: {
    swing: [
      { f: 330, to: 140, d: 0.1, w: "sine", g: 0.24 },
    ],
    hit: [
      { f: 196, d: 0.12, w: "triangle", g: 0.3 },
      { f: 392, d: 0.16, w: "sine", g: 0.22 },
    ],
    cast: [
      { f: 262, d: 0.22, w: "sine", g: 0.3 },
      { f: 330, d: 0.2, w: "triangle", g: 0.2 },
      { f: 98, d: 0.24, w: "sine", g: 0.18 },
    ],
  },
  "maga-grumptor": {
    swing: [
      { f: 140, to: 55, d: 0.14, w: "sawtooth", g: 0.36 },
      { d: 0.06, g: 0.2, cut: 900, hp: true },
    ],
    hit: [
      { f: 90, d: 0.14, w: "square", g: 0.42 },
      { f: 180, d: 0.1, w: "triangle", g: 0.24 },
      { d: 0.06, g: 0.22, cut: 700 },
    ],
    cast: [
      { f: 110, to: 440, d: 0.24, w: "sawtooth", g: 0.32 },
      { f: 55, d: 0.22, w: "square", g: 0.26 },
    ],
    ult: [
      { f: 70, to: 280, d: 0.18, w: "sawtooth", g: 0.36 },
      { f: 40, d: 0.36, w: "sine", g: 0.34, wait: 0.06 },
      { d: 0.22, g: 0.3, cut: 380 },
      { f: 880, d: 0.08, w: "square", g: 0.2, wait: 0.14 },
    ],
  },
  "maga-elonmolk": {
    swing: [
      { f: 1480, to: 420, d: 0.08, w: "square", g: 0.26 },
      { f: 2200, d: 0.04, w: "sine", g: 0.16 },
    ],
    hit: [
      { f: 880, d: 0.06, w: "square", g: 0.3 },
      { f: 1760, d: 0.05, w: "sine", g: 0.2 },
      { d: 0.04, g: 0.16, cut: 3200, hp: true },
    ],
    cast: [
      { f: 240, to: 960, d: 0.2, w: "square", g: 0.28 },
      { f: 120, d: 0.16, w: "sawtooth", g: 0.22 },
    ],
    ult: [
      { f: 80, to: 640, d: 0.28, w: "sawtooth", g: 0.32 },
      { f: 1320, d: 0.1, w: "square", g: 0.22, wait: 0.1 },
      { d: 0.2, g: 0.24, cut: 2200, hp: true },
    ],
  },
  "maga-rogentor": {
    swing: [
      { d: 0.08, g: 0.28, cut: 2600, hp: true },
      { f: 360, to: 110, d: 0.1, w: "sawtooth", g: 0.2 },
    ],
    hit: [
      { d: 0.1, g: 0.3, cut: 2200, hp: true },
      { f: 660, d: 0.08, w: "sine", g: 0.22 },
    ],
    cast: [
      { d: 0.22, g: 0.34, cut: 1800, hp: true },
      { f: 440, d: 0.18, w: "sine", g: 0.24 },
    ],
    ult: [
      { d: 0.16, g: 0.36, cut: 1600, hp: true },
      { f: 220, to: 880, d: 0.28, w: "sawtooth", g: 0.3 },
      { f: 110, d: 0.24, w: "triangle", g: 0.2, wait: 0.08 },
    ],
  },
  "maga-alexgroans": {
    swing: [
      { f: 200, to: 70, d: 0.12, w: "sawtooth", g: 0.32 },
      { d: 0.06, g: 0.2, cut: 1400, hp: true },
    ],
    hit: [
      { f: 150, d: 0.1, w: "square", g: 0.38 },
      { d: 0.08, g: 0.24, cut: 900 },
    ],
    cast: [
      { f: 90, to: 360, d: 0.2, w: "square", g: 0.34 },
      { f: 720, d: 0.1, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 60, to: 240, d: 0.22, w: "sawtooth", g: 0.38 },
      { d: 0.2, g: 0.32, cut: 600 },
      { f: 180, d: 0.16, w: "square", g: 0.26, wait: 0.1 },
    ],
  },
  "maga-boris": {
    swing: [
      { f: 160, to: 70, d: 0.12, w: "triangle", g: 0.3 },
    ],
    hit: [
      { f: 100, d: 0.12, w: "sine", g: 0.36 },
      { f: 200, d: 0.1, w: "triangle", g: 0.2 },
    ],
    cast: [
      { f: 80, d: 0.24, w: "sine", g: 0.32 },
      { f: 160, d: 0.18, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 55, d: 0.32, w: "sine", g: 0.4 },
      { f: 110, d: 0.2, w: "square", g: 0.22, wait: 0.08 },
      { d: 0.16, g: 0.2, cut: 400 },
    ],
  },
  "maga-brander": {
    swing: [
      { f: 280, to: 120, d: 0.1, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 190, d: 0.09, w: "square", g: 0.32 },
      { f: 760, d: 0.1, w: "sine", g: 0.2 },
    ],
    cast: [
      { f: 150, d: 0.16, w: "square", g: 0.3 },
      { f: 300, d: 0.18, w: "triangle", g: 0.22 },
    ],
    ult: [
      { f: 130, to: 390, d: 0.24, w: "triangle", g: 0.32 },
      { f: 65, d: 0.28, w: "sine", g: 0.26, wait: 0.06 },
    ],
  },
  "maga-vestyt": {
    swing: [
      { f: 500, to: 140, d: 0.1, w: "sawtooth", g: 0.3 },
    ],
    hit: [
      { f: 210, d: 0.08, w: "square", g: 0.36 },
      { f: 1680, d: 0.05, w: "triangle", g: 0.2 },
    ],
    cast: [
      { f: 392, d: 0.12, w: "square", g: 0.28 },
      { f: 523, d: 0.14, w: "triangle", g: 0.2, wait: 0.08 },
    ],
    ult: [
      { f: 98, d: 0.22, w: "sine", g: 0.3 },
      { f: 392, d: 0.16, w: "square", g: 0.26, wait: 0.06 },
      { f: 784, d: 0.12, w: "triangle", g: 0.18, wait: 0.14 },
    ],
  },
  "maga-steers": {
    swing: [
      { f: 1200, d: 0.04, w: "square", g: 0.26 },
      { f: 220, to: 90, d: 0.08, w: "triangle", g: 0.16 },
    ],
    hit: [
      { f: 980, d: 0.04, w: "square", g: 0.34 },
      { d: 0.03, g: 0.16, cut: 3000, hp: true },
    ],
    cast: [
      { f: 880, d: 0.05, w: "square", g: 0.28 },
      { f: 660, d: 0.05, w: "square", g: 0.24, wait: 0.05 },
      { f: 440, d: 0.06, w: "square", g: 0.22, wait: 0.1 },
    ],
    ult: [
      { f: 1320, d: 0.06, w: "square", g: 0.3 },
      { f: 220, to: 80, d: 0.22, w: "sawtooth", g: 0.28, wait: 0.08 },
      { d: 0.14, g: 0.22, cut: 2400, hp: true },
    ],
  },
  "maga-hooli": {
    swing: [
      { f: 1680, to: 420, d: 0.07, w: "square", g: 0.3 },
      { f: 880, d: 0.04, w: "triangle", g: 0.18 },
    ],
    hit: [
      { f: 220, d: 0.08, w: "square", g: 0.36 },
      { f: 1320, d: 0.05, w: "sine", g: 0.22 },
      { d: 0.05, g: 0.2, cut: 2800, hp: true },
    ],
    cast: [
      { f: 180, to: 720, d: 0.16, w: "sawtooth", g: 0.3 },
      { f: 980, d: 0.08, w: "square", g: 0.22, wait: 0.08 },
    ],
    ult: [
      { f: 90, to: 40, d: 0.22, w: "sine", g: 0.28 },
      { f: 1480, d: 0.06, w: "square", g: 0.34, wait: 0.2 },
      { f: 220, to: 80, d: 0.16, w: "sawtooth", g: 0.26, wait: 0.24 },
      { d: 0.18, g: 0.28, cut: 900, wait: 0.22 },
    ],
  },
  "lw-bitenten": {
    swing: [
      { f: 300, to: 140, d: 0.11, w: "sine", g: 0.26 },
    ],
    hit: [
      { f: 196, d: 0.12, w: "triangle", g: 0.3 },
      { f: 392, d: 0.1, w: "sine", g: 0.2 },
    ],
    cast: [
      { f: 262, to: 524, d: 0.22, w: "sine", g: 0.3 },
      { f: 131, d: 0.2, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 196, d: 0.28, w: "sine", g: 0.34 },
      { f: 392, d: 0.2, w: "triangle", g: 0.22, wait: 0.08 },
      { f: 784, d: 0.12, w: "sine", g: 0.16, wait: 0.16 },
    ],
  },
  "lw-sandbags": {
    swing: [
      { f: 90, to: 40, d: 0.14, w: "sine", g: 0.34 },
    ],
    hit: [
      { f: 70, d: 0.16, w: "square", g: 0.42 },
      { d: 0.12, g: 0.3, cut: 380 },
    ],
    cast: [
      { f: 50, d: 0.28, w: "sine", g: 0.38 },
      { d: 0.2, g: 0.24, cut: 280 },
    ],
    ult: [
      { f: 40, to: 90, d: 0.3, w: "sawtooth", g: 0.4 },
      { d: 0.24, g: 0.32, cut: 320 },
      { f: 28, d: 0.28, w: "sine", g: 0.3, wait: 0.08 },
    ],
  },
  "lw-odramma": {
    swing: [
      { f: 1800, d: 0.06, w: "sine", g: 0.24 },
    ],
    hit: [
      { f: 1600, d: 0.07, w: "sine", g: 0.28 },
      { f: 200, d: 0.08, w: "triangle", g: 0.2 },
    ],
    cast: [
      { f: 2200, to: 500, d: 0.22, w: "sine", g: 0.26 },
      { f: 140, d: 0.16, w: "square", g: 0.2 },
    ],
    ult: [
      { f: 880, to: 220, d: 0.26, w: "sine", g: 0.3 },
      { f: 110, d: 0.24, w: "triangle", g: 0.22, wait: 0.08 },
    ],
  },
  "lw-harass": {
    swing: [
      { f: 640, to: 180, d: 0.1, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 420, d: 0.07, w: "sine", g: 0.3 },
      { f: 1680, d: 0.08, w: "triangle", g: 0.2 },
    ],
    cast: [
      { f: 784, d: 0.1, w: "triangle", g: 0.28 },
      { f: 1175, d: 0.12, w: "sine", g: 0.2, wait: 0.06 },
    ],
    ult: [
      { f: 523, to: 1046, d: 0.22, w: "triangle", g: 0.3 },
      { f: 262, d: 0.2, w: "sine", g: 0.22, wait: 0.08 },
    ],
  },
  "lw-hocking": {
    swing: [
      { f: 392, to: 196, d: 0.12, w: "sine", g: 0.26 },
    ],
    hit: [
      { f: 523, d: 0.36, w: "sine", g: 0.36 },
      { f: 784, d: 0.24, w: "triangle", g: 0.18 },
    ],
    cast: [
      { f: 392, d: 0.46, w: "sine", g: 0.4 },
      { f: 196, d: 0.4, w: "triangle", g: 0.22 },
    ],
    ult: [
      { f: 261, d: 0.4, w: "sine", g: 0.38 },
      { f: 523, d: 0.32, w: "triangle", g: 0.24, wait: 0.1 },
      { f: 784, d: 0.2, w: "sine", g: 0.16, wait: 0.2 },
    ],
  },
  "lw-youngturkey": {
    swing: [
      { f: 620, to: 180, d: 0.1, w: "triangle", g: 0.24 },
      { d: 0.06, g: 0.16, cut: 2000, hp: true },
    ],
    hit: [
      { f: 1760, d: 0.1, w: "sine", g: 0.3 },
      { f: 140, d: 0.08, w: "square", g: 0.24 },
    ],
    cast: [
      { f: 1480, d: 0.18, w: "sine", g: 0.28 },
      { f: 90, to: 40, d: 0.16, w: "sawtooth", g: 0.22 },
    ],
    ult: [
      { f: 220, to: 880, d: 0.24, w: "sawtooth", g: 0.3 },
      { f: 1760, d: 0.1, w: "sine", g: 0.2, wait: 0.1 },
    ],
  },
  "lw-vakxie": {
    swing: [
      { f: 1400, to: 400, d: 0.1, w: "sine", g: 0.22 },
    ],
    hit: [
      { f: 2100, d: 0.08, w: "sine", g: 0.3 },
      { d: 0.12, g: 0.28, cut: 2200 },
    ],
    cast: [
      { d: 0.24, g: 0.34, cut: 1800 },
      { f: 880, to: 220, d: 0.22, w: "sawtooth", g: 0.24 },
    ],
    ult: [
      { d: 0.2, g: 0.36, cut: 1600 },
      { f: 110, to: 440, d: 0.28, w: "sawtooth", g: 0.3 },
      { f: 1760, d: 0.08, w: "sine", g: 0.18, wait: 0.12 },
    ],
  },
  "lw-climate": {
    swing: [
      { f: 330, to: 140, d: 0.1, w: "sine", g: 0.24 },
    ],
    hit: [
      { f: 196, d: 0.12, w: "triangle", g: 0.3 },
      { f: 98, d: 0.14, w: "sine", g: 0.2 },
    ],
    cast: [
      { f: 262, d: 0.22, w: "sine", g: 0.3 },
      { f: 330, d: 0.2, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 80, to: 240, d: 0.3, w: "sine", g: 0.32 },
      { d: 0.22, g: 0.24, cut: 500 },
      { f: 196, d: 0.18, w: "triangle", g: 0.2, wait: 0.1 },
    ],
  },
  "wild-icon": {
    swing: [
      { f: 340, to: 140, d: 0.1, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 190, d: 0.1, w: "square", g: 0.36 },
      { f: 760, d: 0.12, w: "sine", g: 0.2 },
    ],
    cast: [
      { f: 210, d: 0.12, w: "square", g: 0.3 },
      { f: 420, d: 0.18, w: "sine", g: 0.22 },
    ],
    ult: [
      { f: 90, to: 360, d: 0.26, w: "sawtooth", g: 0.34 },
      { f: 180, d: 0.2, w: "triangle", g: 0.22, wait: 0.08 },
    ],
  },
  "wild-enigma": {
    swing: [
      { f: 392, to: 180, d: 0.12, w: "sine", g: 0.22 },
    ],
    hit: [
      { f: 523, d: 0.14, w: "sine", g: 0.3 },
      { f: 659, d: 0.1, w: "triangle", g: 0.18 },
    ],
    cast: [
      { f: 392, d: 0.26, w: "sine", g: 0.32 },
      { f: 494, d: 0.22, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 196, d: 0.3, w: "sine", g: 0.34 },
      { f: 294, d: 0.24, w: "triangle", g: 0.2, wait: 0.1 },
      { d: 0.16, g: 0.18, cut: 900 },
    ],
  },
  "wild-cartoons": {
    swing: [
      { f: 180, to: 80, d: 0.09, w: "sine", g: 0.26 },
    ],
    hit: [
      { f: 240, d: 0.07, w: "triangle", g: 0.32 },
      { d: 0.06, g: 0.22, cut: 900 },
    ],
    cast: [
      { f: 160, to: 320, d: 0.16, w: "triangle", g: 0.28 },
      { d: 0.1, g: 0.2, cut: 700 },
    ],
    ult: [
      { f: 120, to: 480, d: 0.22, w: "triangle", g: 0.3 },
      { f: 90, d: 0.16, w: "sine", g: 0.22, wait: 0.08 },
    ],
  },
  "wild-dynasty": {
    swing: [
      { f: 1800, to: 400, d: 0.08, w: "sine", g: 0.22 },
    ],
    hit: [
      { d: 0.04, g: 0.36, cut: 500 },
      { f: 2400, d: 0.03, w: "square", g: 0.22 },
    ],
    cast: [
      { d: 0.06, g: 0.4, cut: 400 },
      { f: 2000, d: 0.12, w: "sine", g: 0.22 },
    ],
    ult: [
      { d: 0.08, g: 0.42, cut: 360 },
      { f: 80, to: 320, d: 0.24, w: "sawtooth", g: 0.3, wait: 0.06 },
      { f: 1760, d: 0.08, w: "sine", g: 0.18, wait: 0.14 },
    ],
  },
  "wild-legend": {
    swing: [
      { f: 220, to: 80, d: 0.1, w: "triangle", g: 0.28 },
      { d: 0.05, g: 0.16, cut: 1800, hp: true },
    ],
    hit: [
      { f: 160, d: 0.1, w: "square", g: 0.34 },
      { f: 90, d: 0.12, w: "sine", g: 0.22 },
    ],
    cast: [
      { f: 140, to: 70, d: 0.16, w: "sawtooth", g: 0.28 },
      { f: 880, d: 0.06, w: "square", g: 0.18 },
    ],
    ult: [
      { f: 70, to: 40, d: 0.26, w: "sawtooth", g: 0.34 },
      { d: 0.16, g: 0.26, cut: 500 },
      { f: 110, d: 0.14, w: "triangle", g: 0.2, wait: 0.1 },
    ],
  },
  "wild-karen": {
    swing: [
      { f: 240, to: 100, d: 0.1, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 170, d: 0.1, w: "square", g: 0.36 },
      { f: 85, d: 0.14, w: "sine", g: 0.22 },
    ],
    cast: [
      { f: 130, d: 0.2, w: "square", g: 0.34 },
      { f: 260, d: 0.16, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 100, to: 200, d: 0.22, w: "square", g: 0.36 },
      { f: 50, d: 0.26, w: "sine", g: 0.28, wait: 0.08 },
    ],
  },
  "wild-butter": {
    swing: [
      { d: 0.04, g: 0.24, cut: 4000, hp: true },
      { f: 220, to: 90, d: 0.08, w: "triangle", g: 0.18 },
    ],
    hit: [
      { d: 0.06, g: 0.4, cut: 3500, hp: true },
      { f: 180, d: 0.08, w: "square", g: 0.24 },
    ],
    cast: [
      { d: 0.16, g: 0.38, cut: 3200, hp: true },
      { f: 110, d: 0.14, w: "square", g: 0.22 },
    ],
    ult: [
      { d: 0.14, g: 0.4, cut: 2800, hp: true },
      { f: 70, to: 280, d: 0.24, w: "sawtooth", g: 0.3, wait: 0.06 },
    ],
  },
  "wild-cezanne": {
    swing: [
      { f: 70, to: 40, d: 0.12, w: "sine", g: 0.34 },
    ],
    hit: [
      { f: 58, d: 0.2, w: "sine", g: 0.46 },
      { f: 116, d: 0.12, w: "triangle", g: 0.2 },
    ],
    cast: [
      { f: 49, d: 0.36, w: "sine", g: 0.44 },
      { f: 98, d: 0.18, w: "square", g: 0.16 },
    ],
    ult: [
      { f: 40, d: 0.4, w: "sine", g: 0.46 },
      { f: 80, d: 0.22, w: "triangle", g: 0.22, wait: 0.1 },
      { d: 0.16, g: 0.2, cut: 240 },
    ],
  },
  "mma-macgregor": {
    swing: [
      { f: 2200, to: 500, d: 0.08, w: "triangle", g: 0.28 },
      { d: 0.04, g: 0.16, cut: 3600, hp: true },
    ],
    hit: [
      { f: 2400, d: 0.06, w: "triangle", g: 0.34 },
      { f: 180, d: 0.1, w: "square", g: 0.24 },
    ],
    cast: [
      { f: 1760, to: 360, d: 0.16, w: "triangle", g: 0.3 },
      { f: 90, d: 0.14, w: "sawtooth", g: 0.22 },
    ],
    ult: [
      { f: 80, to: 40, d: 0.22, w: "sawtooth", g: 0.36 },
      { f: 1760, d: 0.08, w: "triangle", g: 0.24, wait: 0.1 },
      { d: 0.14, g: 0.22, cut: 800 },
    ],
  },
  "mma-nurmagoat": {
    swing: [
      { f: 90, to: 45, d: 0.12, w: "sawtooth", g: 0.34 },
    ],
    hit: [
      { f: 70, d: 0.14, w: "square", g: 0.42 },
      { f: 140, d: 0.1, w: "sine", g: 0.26 },
    ],
    cast: [
      { f: 55, d: 0.24, w: "square", g: 0.36 },
      { f: 110, d: 0.18, w: "sine", g: 0.24 },
    ],
    ult: [
      { f: 40, d: 0.3, w: "sawtooth", g: 0.4 },
      { d: 0.2, g: 0.3, cut: 360 },
      { f: 80, d: 0.16, w: "square", g: 0.24, wait: 0.1 },
    ],
  },
  "mma-jonesy": {
    swing: [
      { f: 110, to: 50, d: 0.13, w: "sawtooth", g: 0.34 },
    ],
    hit: [
      { f: 80, d: 0.14, w: "square", g: 0.4 },
      { d: 0.1, g: 0.26, cut: 500 },
    ],
    cast: [
      { f: 60, d: 0.26, w: "sine", g: 0.36 },
      { f: 180, d: 0.14, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 45, to: 90, d: 0.28, w: "sawtooth", g: 0.38 },
      { d: 0.2, g: 0.28, cut: 400 },
    ],
  },
  "mma-adesanyaish": {
    swing: [
      { f: 880, to: 220, d: 0.09, w: "triangle", g: 0.26 },
    ],
    hit: [
      { f: 1480, d: 0.05, w: "square", g: 0.3 },
      { f: 240, d: 0.08, w: "triangle", g: 0.22 },
    ],
    cast: [
      { f: 1320, d: 0.08, w: "square", g: 0.3 },
      { f: 90, to: 40, d: 0.16, w: "sawtooth", g: 0.22 },
    ],
    ult: [
      { f: 660, to: 220, d: 0.2, w: "triangle", g: 0.3 },
      { f: 70, d: 0.22, w: "sine", g: 0.26, wait: 0.08 },
    ],
  },
  "mma-poirierish": {
    swing: [
      { d: 0.1, g: 0.28, cut: 900 },
      { f: 300, to: 80, d: 0.12, w: "sawtooth", g: 0.22 },
    ],
    hit: [
      { f: 90, d: 0.14, w: "square", g: 0.36 },
      { d: 0.12, g: 0.3, cut: 700 },
    ],
    cast: [
      { d: 0.24, g: 0.34, cut: 1100 },
      { f: 60, to: 180, d: 0.26, w: "sawtooth", g: 0.28 },
    ],
    ult: [
      { f: 50, to: 160, d: 0.28, w: "sawtooth", g: 0.36 },
      { d: 0.2, g: 0.3, cut: 600 },
      { f: 220, d: 0.1, w: "triangle", g: 0.18, wait: 0.12 },
    ],
  },
  "mma-diazish": {
    swing: [
      { f: 160, to: 70, d: 0.12, w: "sawtooth", g: 0.3 },
    ],
    hit: [
      { f: 130, d: 0.12, w: "square", g: 0.38 },
      { f: 880, d: 0.08, w: "triangle", g: 0.2 },
    ],
    cast: [
      { f: 98, d: 0.22, w: "sawtooth", g: 0.32 },
      { f: 196, d: 0.16, w: "triangle", g: 0.2 },
    ],
    ult: [
      { f: 70, d: 0.26, w: "sawtooth", g: 0.36 },
      { f: 140, d: 0.18, w: "triangle", g: 0.22, wait: 0.08 },
      { d: 0.14, g: 0.2, cut: 800 },
    ],
  },
};
