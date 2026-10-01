export type MicChannel = "team" | "all";

export type MicInput = {
  id: string;
  label: string;
  kind: "usb" | "phone" | "computer" | "other";
};

type RecAlt = { transcript: string; confidence?: number };
type RecResult = { isFinal: boolean; 0?: RecAlt };
type RecEvent = { results: ArrayLike<RecResult> };
type Rec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: RecEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  abort(): void;
};

const STORE = "cu-mic";

function recCtor(): (new () => Rec) | null {
  const w = window as Window & { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function loadSavedId(): string {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { deviceId?: string };
    return String(parsed.deviceId || "");
  } catch {
    return "";
  }
}

function saveId(deviceId: string): void {
  localStorage.setItem(STORE, JSON.stringify({ deviceId }));
}

function kindOf(label: string): MicInput["kind"] {
  const n = label.toLowerCase();
  if (isUsbCodec(n)) return "usb";
  if (/iphone|ipad|android|phone mic|headset earpiece|built-in ear/.test(n)) return "phone";
  if (/built-in|internal|realtek|macbook|imac|webcam|camera|laptop|microphone \(/.test(n)) return "computer";
  return "other";
}

function isUsbCodec(label: string): boolean {
  return /usb|codec|class.compliant|audio interface|focusrite|scarlett|behringer|umc[0-9]|motu|steinberg|ur2[2-4]|audiobox|zoom u|quad-capture|ua-25|ag0[36]|vocaster|ssl 2|audient|komplete audio|2i2|4i4|solo gen|rode|yeti|blue ice|hyperx|steelseries|sennheiser|audio-technica|at2020|fifine|tonor|maono/.test(
    label.toLowerCase(),
  );
}

function isLoopback(label: string): boolean {
  return /stereo mix|what u hear|loopback|wave out|monitor of|hdmi|display audio|output/.test(label.toLowerCase());
}

function scoreMic(d: MicInput): number {
  const n = d.label.toLowerCase();
  if (isLoopback(n)) return -80;
  if (d.id === "communications") return -10;
  let s = 8;
  if (d.kind === "usb" || isUsbCodec(n)) s += 50;
  if (/microphone|headset|webcam|camera|mic\b/.test(n)) s += 16;
  if (/built-in|internal|iphone|android|phone/.test(n)) s += 12;
  if (d.id === "default") s -= 6;
  if (/default|communications/.test(n) && d.kind !== "usb") s -= 4;
  return s;
}

function prettyLabel(d: MediaDeviceInfo, index: number): string {
  const raw = d.label.trim();
  if (raw) return raw.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, "");
  return `Microphone ${index + 1}`;
}

export class Mic {
  channel: MicChannel | null = null;
  level = 0;
  error = "";
  denied = false;
  devices: MicInput[] = [];
  deviceId = "";
  deviceLabel = "";
  private want: MicChannel | null = null;
  private asking = false;
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private gain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private rec: Rec | null = null;
  private recOn = false;
  private samples = new Uint8Array(64);
  private onHeard: ((text: string, channel: MicChannel, confidence: number) => void) | null = null;
  private onDevices: (() => void) | null = null;

  constructor() {
    const md = navigator.mediaDevices;
    if (md?.addEventListener) {
      md.addEventListener("devicechange", () => {
        void this.onDeviceChange();
      });
    }
  }

  heard(fn: (text: string, channel: MicChannel, confidence: number) => void): void {
    this.onHeard = fn;
  }

  onList(fn: () => void): void {
    this.onDevices = fn;
  }

  async press(channel: MicChannel): Promise<"ok" | "denied" | "wait"> {
    this.want = channel;
    if (this.asking) return "wait";
    const ok = await this.ensure();
    if (!ok) {
      this.want = null;
      this.channel = null;
      return "denied";
    }
    if (!this.want) {
      this.hangup();
      return "ok";
    }
    this.channel = this.want;
    this.live();
    this.listen();
    return "ok";
  }

  release(): void {
    this.want = null;
    this.channel = null;
    this.quiet();
    this.silence();
  }

  hangup(): void {
    this.release();
    this.dropStream();
  }

  async find(): Promise<boolean> {
    return this.ensure();
  }

  async pick(deviceId: string): Promise<boolean> {
    this.deviceId = deviceId;
    saveId(deviceId);
    this.dropStream();
    const ok = await this.ensure();
    if (ok && this.want) {
      this.channel = this.want;
      this.live();
      this.listen();
    }
    return ok;
  }

  tick(): void {
    if (!this.analyser) {
      this.level = 0;
      return;
    }
    this.analyser.getByteTimeDomainData(this.samples as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (const n of this.samples) {
      const v = (n - 128) / 128;
      sum += v * v;
    }
    this.level = Math.min(1, Math.sqrt(sum / this.samples.length) * 3.4);
  }

  private async ensure(): Promise<boolean> {
    if (this.stream?.active) return true;
    if (this.denied && !navigator.mediaDevices?.getUserMedia) return false;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.denied = true;
      this.error = "This browser has no microphone.";
      return false;
    }
    this.asking = true;
    try {
      const saved = this.deviceId || loadSavedId();
      let stream = saved ? await this.openNamed(saved, "") : null;
      if (!stream) stream = await this.openAny();
      if (!stream) {
        this.denied = true;
        this.error = "Allow the microphone to Talk. T is team. G is everyone. Sound card lists computer, phone, and USB codec inputs.";
        return false;
      }
      this.denied = false;
      this.error = "";
      this.stream = stream;
      await this.refreshList();
      const trackId = stream.getAudioTracks()[0]?.getSettings().deviceId || saved;
      const best = this.bestId();
      if (best && best !== trackId && !saved) {
        const swapped = await this.openNamed(best, this.devices.find((d) => d.id === best)?.label || "");
        if (swapped) {
          this.dropTracks(stream);
          this.stream = swapped;
        }
      } else if (saved && trackId !== saved) {
        const forced = await this.openNamed(saved, this.devices.find((d) => d.id === saved)?.label || "");
        if (forced) {
          this.dropTracks(stream);
          this.stream = forced;
        }
      }
      this.rememberOpen();
      this.graph();
      return true;
    } catch {
      this.denied = true;
      this.error = "Allow the microphone to Talk. T is team. G is everyone. Plug in a USB codec if that is the desk mic.";
      return false;
    } finally {
      this.asking = false;
    }
  }

  private rememberOpen(): void {
    const id = this.stream?.getAudioTracks()[0]?.getSettings().deviceId || this.deviceId;
    const hit = this.devices.find((d) => d.id === id);
    this.deviceId = hit?.id || id || this.deviceId;
    this.deviceLabel = hit?.label || this.deviceLabel;
    if (this.deviceId) saveId(this.deviceId);
    this.onDevices?.();
  }

  private bestId(): string {
    return [...this.devices].sort((a, b) => scoreMic(b) - scoreMic(a))[0]?.id ?? "";
  }

  private async refreshList(): Promise<void> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      this.devices = [];
      return;
    }
    const all = await navigator.mediaDevices.enumerateDevices();
    const inputs = all.filter((d) => d.kind === "audioinput" && !isLoopback(d.label));
    this.devices = inputs
      .map((d, i) => {
        const label = prettyLabel(d, i);
        return { id: d.deviceId, label, kind: kindOf(label) };
      })
      .sort((a, b) => scoreMic(b) - scoreMic(a));
    this.onDevices?.();
  }

  private async openAny(): Promise<MediaStream | null> {
    const tries: MediaStreamConstraints[] = [
      { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } },
      { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } },
      { audio: true },
    ];
    for (const spec of tries) {
      try {
        return await navigator.mediaDevices.getUserMedia(spec);
      } catch {
        /* try the next constraint set */
      }
    }
    return null;
  }

  private async openNamed(deviceId: string, label: string): Promise<MediaStream | null> {
    if (!deviceId) return null;
    const usb = isUsbCodec(label) || kindOf(label) === "usb";
    const named: MediaTrackConstraints[] = usb
      ? [
          { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
          { deviceId: { exact: deviceId } },
          { deviceId: { ideal: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        ]
      : [
          { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
          { deviceId: { ideal: deviceId } },
        ];
    for (const audio of named) {
      try {
        return await navigator.mediaDevices.getUserMedia({ audio });
      } catch {
        /* USB codecs often reject echoCancellation; try the next shape */
      }
    }
    return null;
  }

  private async onDeviceChange(): Promise<void> {
    await this.refreshList();
    const saved = this.deviceId || loadSavedId();
    const still = saved && this.devices.some((d) => d.id === saved);
    if (this.stream?.active && still) return;
    const usb = this.devices.find((d) => d.kind === "usb");
    const next = still ? saved : usb?.id || this.bestId();
    if (!next) return;
    if (this.stream || this.want) await this.pick(next);
    else {
      this.deviceId = next;
      saveId(next);
    }
  }

  private dropTracks(stream: MediaStream): void {
    stream.getTracks().forEach((t) => t.stop());
  }

  private dropStream(): void {
    this.teardownGraph();
    if (this.stream) this.dropTracks(this.stream);
    this.stream = null;
  }

  private graph(): void {
    if (!this.stream) return;
    this.teardownGraph();
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(this.stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
    this.ctx = ctx;
    this.source = source;
    this.analyser = analyser;
    this.gain = gain;
  }

  private teardownGraph(): void {
    try {
      this.source?.disconnect();
    } catch {
      /* already down */
    }
    try {
      this.analyser?.disconnect();
    } catch {
      /* already down */
    }
    try {
      this.gain?.disconnect();
    } catch {
      /* already down */
    }
    this.source = null;
    this.analyser = null;
    this.gain = null;
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }

  private live(): void {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
    if (this.gain) this.gain.gain.value = 0.18;
  }

  private quiet(): void {
    if (this.gain) this.gain.gain.value = 0;
    this.level = 0;
  }

  private listen(): void {
    if (this.recOn) return;
    const Ctor = recCtor();
    if (!Ctor) return;
    const rec = this.rec ?? new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      if (!this.channel || !this.onHeard) return;
      const last = ev.results[ev.results.length - 1];
      if (!last?.isFinal) return;
      const alt = last[0];
      const text = alt?.transcript.trim();
      const confidence = typeof alt?.confidence === "number" && Number.isFinite(alt.confidence) ? alt.confidence : 0;
      if (text) this.onHeard(text, this.channel, confidence);
    };
    rec.onerror = () => undefined;
    rec.onend = () => {
      this.recOn = false;
      if (this.channel) this.listen();
    };
    this.rec = rec;
    try {
      rec.start();
      this.recOn = true;
    } catch {
      this.recOn = false;
    }
  }

  private silence(): void {
    if (!this.rec) return;
    try {
      recAbort(this.rec);
    } catch {
      /* already stopped */
    }
    this.recOn = false;
  }
}

function recAbort(rec: Rec): void {
  rec.abort();
}
