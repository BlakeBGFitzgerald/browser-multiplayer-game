import type { ChatKind } from "./lobby";

export function isChatTestMode(): boolean {
  if (typeof location === "undefined") return false;
  const q = new URLSearchParams(location.search);
  return q.get("chat-test") === "1" || location.hash === "#chat-sandbox";
}

export const CHAT_TEST_PLAYERS: { name: string; team: "maga" | "antifa" }[] = [
  { name: "Player01", team: "maga" },
  { name: "Player02", team: "maga" },
  { name: "Player03", team: "maga" },
  { name: "Player04", team: "maga" },
  { name: "Player05", team: "maga" },
  { name: "Player06", team: "antifa" },
  { name: "Player07", team: "antifa" },
  { name: "Player08", team: "antifa" },
  { name: "Player09", team: "antifa" },
  { name: "Player10", team: "antifa" },
];

export const CHAT_TEST_LINES: { who: string; text: string; kind: ChatKind; channel?: "team" | "all" }[] = [
  { who: "Player01", text: "Hello", kind: "type" },
  { who: "Player02", text: "Push mid", kind: "type" },
  { who: "Player03", text: "On my way", kind: "type" },
  { who: "Player04", text: "Need help", kind: "talk", channel: "team" },
  { who: "Player05", text: "Nice play", kind: "type" },
  { who: "Player06", text: "Retreat", kind: "talk", channel: "all" },
  { who: "Player07", text: "Ultimate ready", kind: "type" },
  { who: "Player08", text: "ward river", kind: "type" },
  { who: "Player09", text: "I have mid", kind: "talk", channel: "team" },
  { who: "Player10", text: "gg", kind: "talk", channel: "all" },
];
