/** PCM WAV helpers. HTMLAudioElement often reaches speakers when AudioContext.destination does not. */

export function toneWavUrl(freq: number, seconds: number, sampleRate = 22050): string {
  const n = Math.max(1, Math.floor(sampleRate * seconds));
  const pcm = new Int16Array(n);
  const fade = Math.floor(sampleRate * 0.012);
  for (let i = 0; i < n; i++) {
    const env = i < fade ? i / fade : i > n - fade ? (n - i) / fade : 1;
    const sq = Math.sign(Math.sin((2 * Math.PI * freq * i) / sampleRate)) || 1;
    pcm[i] = Math.max(-32767, Math.min(32767, Math.round(sq * 24000 * env)));
  }
  return encodeWav(pcm, sampleRate);
}

export function bufferToWavUrl(buffer: AudioBuffer): string {
  const ch = buffer.getChannelData(0);
  const pcm = new Int16Array(ch.length);
  for (let i = 0; i < ch.length; i++) {
    const s = Math.max(-1, Math.min(1, ch[i] ?? 0));
    pcm[i] = Math.round(s * 30000);
  }
  return encodeWav(pcm, buffer.sampleRate);
}

export function playWavUrl(url: string, el: HTMLAudioElement, maxMs = 700): Promise<void> {
  return new Promise((resolve) => {
    let doneOnce = false;
    const done = (): void => {
      if (doneOnce) return;
      doneOnce = true;
      el.removeEventListener("ended", done);
      el.removeEventListener("error", done);
      resolve();
    };
    el.addEventListener("ended", done);
    el.addEventListener("error", done);
    el.src = url;
    el.muted = false;
    el.volume = 1;
    const p = el.play();
    if (p && typeof p.then === "function") p.catch(() => done());
    window.setTimeout(done, Math.max(120, maxMs));
  });
}

function encodeWav(pcm: Int16Array, sampleRate: number): string {
  const bytes = pcm.length * 2;
  const buf = new ArrayBuffer(44 + bytes);
  const view = new DataView(buf);
  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + bytes, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, "data");
  view.setUint32(40, bytes, true);
  let o = 44;
  for (let i = 0; i < pcm.length; i++) {
    view.setInt16(o, pcm[i]!, true);
    o += 2;
  }
  const blob = new Blob([buf], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

function writeStr(view: DataView, offset: number, s: string): void {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
}
