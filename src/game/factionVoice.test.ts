import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ANTIFA_NAZI_LINE,
  ANTIFA_VOICE_TRIGGER,
  FACTION_VOICE_LINES,
  MAGA_GRAB_LINE,
  MAGA_VOICE_TRIGGER,
  VOICE_CONFIDENCE_THRESHOLD,
  VOICE_COOLDOWN_MS,
  acceptVoice,
  classifyVoiceClip,
  recordedKillClip,
  resetFactionVoiceState,
  VOICE_LINE_GAIN,
  voiceLineGain,
} from "./factionVoice.ts";

const nazi = FACTION_VOICE_LINES.find((line) => line.audioUrl.endsWith("/NAzi_b284.mp3"));
const grab = FACTION_VOICE_LINES.find((line) => line.audioUrl.endsWith("/grab_them_4104.mp3"));
assert.ok(nazi);
assert.ok(grab);
assert.equal(nazi.voiceLineId, ANTIFA_NAZI_LINE);
assert.equal(grab.voiceLineId, MAGA_GRAB_LINE);
assert.equal(nazi.faction, "away");
assert.equal(nazi.triggerEvent, ANTIFA_VOICE_TRIGGER);
assert.notEqual(nazi.faction, "home");
assert.notEqual(nazi.triggerEvent, MAGA_VOICE_TRIGGER);
assert.equal(grab.faction, "home");
assert.equal(grab.triggerEvent, MAGA_VOICE_TRIGGER);
assert.notEqual(grab.faction, "away");
assert.notEqual(grab.triggerEvent, ANTIFA_VOICE_TRIGGER);
assert.notEqual(nazi.audioUrl, grab.audioUrl);

const naziClass = classifyVoiceClip(ANTIFA_NAZI_LINE);
const grabClass = classifyVoiceClip(MAGA_GRAB_LINE);
assert.equal(naziClass, classifyVoiceClip(ANTIFA_NAZI_LINE));
assert.equal(grabClass, classifyVoiceClip(MAGA_GRAB_LINE));
assert.equal(naziClass?.faction, "away");
assert.equal(grabClass?.faction, "home");
assert.notEqual(naziClass?.faction, grabClass?.faction);

assert.equal(classifyVoiceClip("not-a-clip"), null);
assert.equal(classifyVoiceClip("not-a-clip"), null);
resetFactionVoiceState();
const unknown = acceptVoice({ voiceLineId: "not-a-clip", confidence: 1, now: 0 });
assert.equal(unknown.fired, false);
assert.equal(unknown.faction, null);
assert.equal(unknown.triggerEvent, null);
assert.equal(unknown.audioUrl, null);
assert.equal(unknown.status, "unknown");

resetFactionVoiceState();
assert.equal(VOICE_CONFIDENCE_THRESHOLD, 0.82);
const low = acceptVoice({ voiceLineId: MAGA_GRAB_LINE, confidence: 0.81, now: 1_000 });
assert.equal(low.fired, false);
assert.equal(low.status, "below-threshold");
assert.equal(low.faction, null);
assert.equal(low.triggerEvent, null);
const heardLow = acceptVoice({ transcript: "You fucking nazi", confidence: 0.819, now: 1_100 });
assert.equal(heardLow.fired, false);
assert.equal(heardLow.status, "below-threshold");
assert.equal(heardLow.faction, null);
const heardOk = acceptVoice({ transcript: "You fucking nazi", confidence: VOICE_CONFIDENCE_THRESHOLD, now: 1_100 });
assert.equal(heardOk.fired, true);
assert.equal(heardOk.faction, "away");
assert.equal(heardOk.triggerEvent, ANTIFA_VOICE_TRIGGER);
assert.equal(heardOk.voiceLineId, ANTIFA_NAZI_LINE);

resetFactionVoiceState();
const first = acceptVoice({ voiceLineId: MAGA_GRAB_LINE, confidence: 1, now: 5_000 });
const duplicate = acceptVoice({ voiceLineId: MAGA_GRAB_LINE, confidence: 1, now: 5_000 + VOICE_COOLDOWN_MS - 1 });
const other = acceptVoice({ voiceLineId: ANTIFA_NAZI_LINE, confidence: 1, now: 5_000 + 10 });
const after = acceptVoice({ voiceLineId: MAGA_GRAB_LINE, confidence: 1, now: 5_000 + VOICE_COOLDOWN_MS });
assert.equal(first.fired, true);
assert.equal(first.faction, "home");
assert.equal(first.triggerEvent, MAGA_VOICE_TRIGGER);
assert.equal(duplicate.fired, false);
assert.equal(duplicate.status, "cooldown");
assert.equal(duplicate.triggerEvent, null);
assert.equal(other.fired, true);
assert.equal(other.faction, "away");
assert.equal(after.fired, true);
assert.equal(after.triggerEvent, MAGA_VOICE_TRIGGER);

assert.equal(recordedKillClip("Grab them by the pussy!")?.voiceLineId, MAGA_GRAB_LINE);
assert.equal(recordedKillClip("Who the fook is that guy?"), null);
assert.equal(recordedKillClip("You fucking nazi"), null);

const gameSrc = readFileSync(new URL("./game.ts", import.meta.url), "utf8");
const updateStart = gameSrc.indexOf("update(dt: number): void");
const updateEnd = gameSrc.indexOf("private forwardRemote", updateStart);
const updateBody = gameSrc.slice(updateStart, updateEnd);
assert.ok(updateStart > 0 && updateEnd > updateStart);
assert.match(updateBody, /tickKillVoice\(\)/);
assert.doesNotMatch(updateBody, /classifyVoiceClip|acceptVoice|decodeAudioData|FACTION_VOICE_LINES|recordedKillClip/);
const tickStart = gameSrc.indexOf("private tickKillVoice(): void");
const tickEnd = gameSrc.indexOf("private revive", tickStart);
const tickBody = gameSrc.slice(tickStart, tickEnd);
assert.match(tickBody, /speakKill\(/);
assert.doesNotMatch(tickBody, /classifyVoiceClip|acceptVoice|decodeAudioData|recordedKillClip/);
assert.doesNotMatch(gameSrc, /classifyVoiceClip|decodeAudioData|from \"\.\/factionVoice/);

const audioSrc = readFileSync(new URL("./audio.ts", import.meta.url), "utf8");
const speakStart = audioSrc.indexOf("speakKill(line: string, home: boolean)");
const speakEnd = audioSrc.indexOf("fakeNews(): void", speakStart);
const speakBody = audioSrc.slice(speakStart, speakEnd);
const recordedAt = speakBody.indexOf("recordedKillClip");
const synthAt = speakBody.indexOf("SpeechSynthesisUtterance");
assert.ok(recordedAt > 0 && synthAt > recordedAt);
const deathStart = audioSrc.indexOf("private deathVo(home: boolean)");
const deathEnd = audioSrc.indexOf("private warmVoices", deathStart);
const deathBody = audioSrc.slice(deathStart, deathEnd);
assert.match(deathBody, /ANTIFA_NAZI_LINE/);
assert.match(deathBody, /MAGA_DEATH/);
assert.doesNotMatch(readFileSync(new URL("./factionVoice.ts", import.meta.url), "utf8"), /decodeAudioData|AudioContext|requestAnimationFrame/);

assert.equal(Object.prototype.hasOwnProperty.call(VOICE_LINE_GAIN, ANTIFA_NAZI_LINE), true);
assert.equal(Object.prototype.hasOwnProperty.call(VOICE_LINE_GAIN, MAGA_GRAB_LINE), true);
assert.equal(voiceLineGain(ANTIFA_NAZI_LINE), 0.657);
assert.equal(voiceLineGain(MAGA_GRAB_LINE), 0.642);
assert.equal(voiceLineGain(ANTIFA_NAZI_LINE), VOICE_LINE_GAIN[ANTIFA_NAZI_LINE]);
assert.equal(voiceLineGain(MAGA_GRAB_LINE), VOICE_LINE_GAIN[MAGA_GRAB_LINE]);
assert.deepEqual(Object.keys(VOICE_LINE_GAIN).sort(), [ANTIFA_NAZI_LINE, MAGA_GRAB_LINE].sort());
for (const id of ["conor_kill", "fake_news", "maga_death", "intro", ""]) {
  assert.equal(Object.prototype.hasOwnProperty.call(VOICE_LINE_GAIN, id), false);
  assert.equal(voiceLineGain(id), 1);
  assert.notEqual(voiceLineGain(id), voiceLineGain(ANTIFA_NAZI_LINE));
  assert.notEqual(voiceLineGain(id), voiceLineGain(MAGA_GRAB_LINE));
}

const deskStart = audioSrc.indexOf("private startDeskFile");
const deskEnd = audioSrc.indexOf("fakeNews(): void", deskStart);
const deskBody = audioSrc.slice(deskStart, deskEnd);
assert.match(deskBody, /voiceLineGain\(voiceLineId\)/);
assert.doesNotMatch(deskBody, /playbackRate|detune/);
assert.match(audioSrc, /u\.volume = this\.deskVol/);
assert.match(audioSrc, /KILL_VOICE\.volume \* this\.deskVol/);

console.log("faction voice tests passed");
