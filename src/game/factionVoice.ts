/**
 * Known faction clips. home is MAGA. away is Antifa.
 *
 * Classification is a clip-id lookup when a voice event is selected or a clip
 * starts. The result is cached. This module does not read samples and it is
 * not called from the match frame loop.
 *
 * The live desk mic (T team / G all) is the existing Web Speech recognizer.
 * A heard phrase fires only when that recognizer reports confidence at or
 * above the threshold (default 0.82). A missing or non-finite score counts as
 * 0 and does not fire. There is no second speech-to-text engine and no
 * offline read of the mp3 bytes. Browsers that omit confidence never trip the
 * live path. Supplied clips still play, because the game classifies them by id
 * at confidence 1.
 */

export type VoiceFaction = "home" | "away";

export const MAGA_VOICE_TRIGGER = "MAGA_VOICE_TRIGGER";
export const ANTIFA_VOICE_TRIGGER = "ANTIFA_VOICE_TRIGGER";

export type VoiceTriggerEvent = typeof MAGA_VOICE_TRIGGER | typeof ANTIFA_VOICE_TRIGGER;

export const ANTIFA_NAZI_LINE = "antifa_nazi_line";
export const MAGA_GRAB_LINE = "maga_grab_line";

/**
 * Desk-bus multipliers for the two supplied masters only.
 * Per-channel integrated loudness was -18.3 LUFS (nazi) and -18.1 LUFS (grab).
 * Synthesized desk speech at the same rate, pitch, and volume sat near -22 LUFS
 * (-22.7 death bark, -21.2 kill line). These gains close that gap.
 * Peaks stay under -1 dBFS. Every other id is unity.
 */
export const VOICE_LINE_GAIN: Readonly<Record<string, number>> = Object.freeze({
  [ANTIFA_NAZI_LINE]: 0.657,
  [MAGA_GRAB_LINE]: 0.642,
});

/** Playback gain for one voice line. Ids without an entry stay at 1. */
export function voiceLineGain(voiceLineId: string): number {
  if (!Object.prototype.hasOwnProperty.call(VOICE_LINE_GAIN, voiceLineId)) return 1;
  const gain = VOICE_LINE_GAIN[voiceLineId];
  return typeof gain === "number" && Number.isFinite(gain) && gain > 0 ? gain : 1;
}

export const VOICE_CONFIDENCE_THRESHOLD = 0.82;
export const VOICE_COOLDOWN_MS = 1500;

/** Both supplied masters probe at about 4.56s. Hold the desk across the clip. */
export const RECORDED_VOICE_HOLD_MS = 4800;

export type FactionVoiceLine = {
  voiceLineId: string;
  /** home is MAGA. away is Antifa. */
  faction: VoiceFaction;
  audioUrl: string;
  triggerEvent: VoiceTriggerEvent;
  /** Normalized live-mic phrase. Clip identity does not use this. */
  phrase: string;
};

export const FACTION_VOICE_LINES: readonly FactionVoiceLine[] = Object.freeze([
  Object.freeze({
    voiceLineId: ANTIFA_NAZI_LINE,
    faction: "away",
    audioUrl: "/audio/voice/NAzi_b284.mp3",
    triggerEvent: ANTIFA_VOICE_TRIGGER,
    phrase: "you fucking nazi",
  }),
  Object.freeze({
    voiceLineId: MAGA_GRAB_LINE,
    faction: "home",
    audioUrl: "/audio/voice/grab_them_4104.mp3",
    triggerEvent: MAGA_VOICE_TRIGGER,
    phrase: "grab them by the pussy",
  }),
]);

export type VoiceStatus = "fired" | "below-threshold" | "cooldown" | "unknown" | "failed";

export type VoiceDecision = {
  fired: boolean;
  status: VoiceStatus;
  voiceLineId: string | null;
  faction: VoiceFaction | null;
  triggerEvent: VoiceTriggerEvent | null;
  audioUrl: string | null;
  confidence: number;
};

const classCache = new Map<string, FactionVoiceLine | null>();
const lastFired = new Map<string, number>();
let voiceThreshold = VOICE_CONFIDENCE_THRESHOLD;

export function voiceConfidenceThreshold(): number {
  return voiceThreshold;
}

export function setVoiceConfidenceThreshold(n: number): void {
  if (!Number.isFinite(n)) return;
  voiceThreshold = Math.min(1, Math.max(0, n));
}

export function resetFactionVoiceState(): void {
  lastFired.clear();
  voiceThreshold = VOICE_CONFIDENCE_THRESHOLD;
}

/** ?voice=1. Off when the page has no query. */
export function voiceDebug(): boolean {
  const search = globalThis.location?.search;
  if (!search) return false;
  return new URLSearchParams(search).get("voice") === "1";
}

export function normalizeVoicePhrase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Deterministic id lookup. Unknown ids cache as no line. */
export function classifyVoiceClip(voiceLineId: string): FactionVoiceLine | null {
  const key = voiceLineId.trim();
  if (classCache.has(key)) return classCache.get(key) ?? null;
  const found = FACTION_VOICE_LINES.find((line) => line.voiceLineId === key) ?? null;
  classCache.set(key, found);
  return found;
}

export function matchFactionPhrase(transcript: string): FactionVoiceLine | null {
  const phrase = normalizeVoicePhrase(transcript);
  if (!phrase) return null;
  return FACTION_VOICE_LINES.find((line) => phrase.includes(line.phrase)) ?? null;
}

/** Grump's single-kill sentence. Other kill lines, including Conor's, stay synthesized. */
export function recordedKillClip(line: string): FactionVoiceLine | null {
  const grab = classifyVoiceClip(MAGA_GRAB_LINE);
  if (!grab) return null;
  return normalizeVoicePhrase(line) === grab.phrase ? grab : null;
}

export function factionVoiceLabel(faction: VoiceFaction): string {
  return faction === "home" ? "home MAGA" : "away ANTIFA";
}

function blank(status: VoiceStatus, confidence: number, voiceLineId: string | null = null): VoiceDecision {
  return {
    fired: false,
    status,
    voiceLineId,
    faction: null,
    triggerEvent: null,
    audioUrl: null,
    confidence,
  };
}

function logVoice(decision: VoiceDecision): void {
  if (!voiceDebug()) return;
  if (decision.fired && decision.voiceLineId && decision.faction && decision.triggerEvent) {
    console.info(`Detected Voice: ${decision.voiceLineId}`);
    console.info(`Detected Faction: ${factionVoiceLabel(decision.faction)}`);
    console.info(`Confidence: ${decision.confidence}`);
    console.info(`Gameplay Event: ${decision.triggerEvent}`);
    return;
  }
  console.info("VOICE RECOGNITION FAILED");
  if (decision.status === "below-threshold") console.info("Confidence below threshold");
  else if (decision.status === "unknown" || decision.status === "failed") console.info("No faction assigned");
}

/**
 * Known clip ids classify at confidence 1 unless the caller passes a score.
 * Live transcripts must bring their own score. Below the threshold, on
 * cooldown, or with no matching line: no faction trigger.
 */
export function acceptVoice(input: {
  voiceLineId?: string;
  transcript?: string;
  confidence?: number;
  now?: number;
}): VoiceDecision {
  const now = Number.isFinite(input.now) ? (input.now as number) : Date.now();
  const byId = input.voiceLineId !== undefined;
  const line = byId ? classifyVoiceClip(input.voiceLineId ?? "") : matchFactionPhrase(input.transcript ?? "");
  const supplied = input.confidence;
  const confidence =
    typeof supplied === "number" && Number.isFinite(supplied) ? supplied : byId && line ? 1 : 0;
  if (!line) {
    const decision = blank(input.transcript || input.voiceLineId ? "unknown" : "failed", confidence);
    logVoice(decision);
    return decision;
  }
  if (confidence < voiceThreshold) {
    const decision = blank("below-threshold", confidence, line.voiceLineId);
    logVoice(decision);
    return decision;
  }
  const prev = lastFired.get(line.voiceLineId);
  if (prev !== undefined && now - prev < VOICE_COOLDOWN_MS) {
    const decision = blank("cooldown", confidence, line.voiceLineId);
    logVoice(decision);
    return decision;
  }
  lastFired.set(line.voiceLineId, now);
  const decision: VoiceDecision = {
    fired: true,
    status: "fired",
    voiceLineId: line.voiceLineId,
    faction: line.faction,
    triggerEvent: line.triggerEvent,
    audioUrl: line.audioUrl,
    confidence,
  };
  logVoice(decision);
  return decision;
}
