import { readFileSync } from "node:fs";
import { MATCH_SEATS, SPEC_SEATS } from "../lobby";

export type ServerConfig = {
  host: string;
  port: number;
  /** Steps per second. The browser caps a frame at 0.033s, so the default is 30. */
  tickRate: number;
  /** Sim step, never above the client frame cap of 0.033s. */
  tickDt: number;
  maxPlayers: number;
  specSeats: number;
  minPlayers: number;
  /** Seconds a dropped seat stays reserved before AI takes the kit. */
  matchTimeoutSec: number;
  logLevel: "debug" | "info" | "warn" | "error";
  /** Accepted and ignored. This build has no database. */
  databaseUrl: string;
  /** Pepper for session tokens. Empty means a new random pepper each boot. */
  authSecret: string;
  buildVersion: string;
  environment: string;
  playerCodes: string[];
  adminCodes: string[];
  /** True only for a loopback bind outside production, when no codes were configured. */
  devCodes: boolean;
};

const LEVELS = new Set(["debug", "info", "warn", "error"]);

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function intEnv(name: string, fallback: number, lo: number, hi: number): number {
  const raw = env(name);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, Math.floor(n)));
}

function splitCodes(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 80);
}

function fileCodes(path: string): { players: string[]; admins: string[] } {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { playerCodes?: unknown; adminCodes?: unknown };
    const players = Array.isArray(parsed.playerCodes) ? parsed.playerCodes.filter((c): c is string => typeof c === "string") : [];
    const admins = Array.isArray(parsed.adminCodes) ? parsed.adminCodes.filter((c): c is string => typeof c === "string") : [];
    return { players: players.map((c) => c.trim()).filter(Boolean), admins: admins.map((c) => c.trim()).filter(Boolean) };
  } catch {
    return { players: [], admins: [] };
  }
}

function loopback(host: string): boolean {
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

export function loadConfig(): ServerConfig {
  // Render injects PORT and can only reach 0.0.0.0. SERVER_HOST still selects
  // loopback for local beta when PORT is unset.
  const renderPort = env("PORT");
  const host = renderPort ? "0.0.0.0" : env("SERVER_HOST") || "0.0.0.0";
  const port = renderPort ? intEnv("PORT", 10000, 1, 65535) : intEnv("SERVER_PORT", 43148, 1, 65535);
  const environment = env("ENVIRONMENT") || env("NODE_ENV") || "development";
  const file = fileCodes(env("BETA_FILE") || "config/beta.json");
  const playerCodes = [...splitCodes(env("BETA_CODES")), ...file.players];
  const adminCodes = [...splitCodes(env("BETA_ADMIN")), ...file.admins];
  const devCodes = playerCodes.length === 0 && adminCodes.length === 0 && environment !== "production" && loopback(host);
  const tickRate = intEnv("SERVER_TICK_RATE", 30, 10, 60);
  return {
    host,
    port,
    tickRate,
    tickDt: Math.min(0.033, 1 / tickRate),
    maxPlayers: intEnv("MAX_PLAYERS", MATCH_SEATS, 1, MATCH_SEATS),
    specSeats: SPEC_SEATS,
    minPlayers: intEnv("BETA_MIN_PLAYERS", 2, 1, MATCH_SEATS),
    matchTimeoutSec: intEnv("MATCH_TIMEOUT", 20, 5, 120),
    logLevel: LEVELS.has(env("LOG_LEVEL")) ? (env("LOG_LEVEL") as ServerConfig["logLevel"]) : "info",
    databaseUrl: env("DATABASE_URL"),
    authSecret: env("AUTH_SECRET"),
    buildVersion: env("BUILD_VERSION") || "1.0.0",
    environment,
    playerCodes,
    adminCodes,
    devCodes,
  };
}
