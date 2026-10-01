import "./dom-stub";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createReadStream, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { hostname } from "node:os";
import { extname, join, resolve, sep } from "node:path";
import { Game } from "../game/game";
import { Input } from "../game/input";
import { Sfx } from "../game/audio";
import { CAST_AWAY, CAST_HOME, heroById, isHooliId } from "../game/heroes";
import { parseClientMessage, type BetaRole, type ServerMsg } from "../beta/protocol";
import { loadConfig, type ServerConfig } from "./config";
import { WebSocketServer, type WebSocket } from "ws";

const CLIENT_ROOT = resolve(process.cwd(), "dist");

const FILE_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function isFile(file: string): boolean {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function clientPath(urlPath: string): string | null {
  let decoded = urlPath;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;
  if (decoded === "/server" || decoded.startsWith("/server/")) return null;
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const full = resolve(CLIENT_ROOT, rel);
  if (full !== CLIENT_ROOT && !full.startsWith(CLIENT_ROOT + sep)) return null;
  const serverDir = resolve(CLIENT_ROOT, "server");
  if (full === serverDir || full.startsWith(serverDir + sep)) return null;
  return full;
}

function sendFile(res: ServerResponse, file: string, method: string): void {
  const type = FILE_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  res.statusCode = 200;
  res.setHeader("Content-Type", type);
  if (extname(file).toLowerCase() === ".html") res.setHeader("Cache-Control", "no-cache");
  if (method === "HEAD") {
    res.end();
    return;
  }
  const stream = createReadStream(file);
  stream.on("error", () => {
    if (!res.headersSent) res.statusCode = 404;
    res.end();
  });
  stream.pipe(res);
}

/** Serves the Vite build from dist/ when it exists, so one process can host the page and /play. */
function serveClient(urlPath: string, method: string, res: ServerResponse): boolean {
  const index = join(CLIENT_ROOT, "index.html");
  if (!isFile(index)) return false;
  const file = clientPath(urlPath);
  if (file && isFile(file)) {
    sendFile(res, file, method);
    return true;
  }
  if (extname(urlPath)) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(method === "HEAD" ? "" : "Not found");
    return true;
  }
  sendFile(res, index, method);
  return true;
}

type Conn = {
  ws: WebSocket;
  authed: boolean;
  role: BetaRole;
  name: string;
  token: string;
  seat: number;
  ready: boolean;
  orders: number;
  windowAt: number;
  floods: number;
};

type Phase = "queue" | "live" | "ending";

const HOME_KITS = [...CAST_HOME];
const AWAY_KITS = [...CAST_AWAY];

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function codeOk(code: string, list: string[]): boolean {
  if (!code || list.length === 0) return false;
  const have = digest(code);
  return list.some((entry) => timingSafeEqual(have, digest(entry)));
}

function cleanName(raw: string): string {
  const name = raw.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 24);
  return name || "Tester";
}

function log(cfg: ServerConfig, level: ServerConfig["logLevel"], msg: string, extra?: Record<string, unknown>): void {
  const rank = { debug: 10, info: 20, warn: 30, error: 40 };
  if (rank[level] < rank[cfg.logLevel]) return;
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra });
  if (level === "error" || level === "warn") console.error(line);
  else console.log(line);
}

function send(ws: WebSocket, msg: ServerMsg): void {
  if (ws.readyState !== 1) return;
  ws.send(JSON.stringify(msg));
}

function stubCanvas(): HTMLCanvasElement {
  return {
    width: 1280,
    height: 720,
    hidden: true,
    style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720, x: 0, y: 0, toJSON() {} }),
    getContext: () => null,
    addEventListener() {},
    removeEventListener() {},
  } as unknown as HTMLCanvasElement;
}

export function makeGame(): Game {
  const canvas = stubCanvas();
  const input = new Input(canvas, () => ({ x: 0, y: 0, zoom: 1 }), false);
  const sfx = new Sfx();
  sfx.muted = true;
  return new Game(canvas, null as unknown as CanvasRenderingContext2D, input, sfx, true, true);
}

/** Headless cast match. Used by BETA_CHECK and by the live host. */
export function bootMatch(game: Game, names?: { home: string[]; away: string[] }): void {
  const home = names?.home ?? HOME_KITS.map((id) => heroById(id).name);
  const away = names?.away ?? AWAY_KITS.map((id) => heroById(id).name);
  game.start({
    home,
    away,
    watch: true,
    kits: HOME_KITS,
    awayKits: AWAY_KITS,
    humans: [],
  });
  game.openSeats();
}

export function runHeadlessCheck(): { ok: boolean; clock: number; groups: number; rssMb: number; tickMs: number; units: number } {
  const game = makeGame();
  bootMatch(game);
  const dt = 0.033;
  const steps = Math.round(14 / dt);
  const t0 = performance.now();
  for (let i = 0; i < steps; i++) game.update(dt);
  const tickMs = (performance.now() - t0) / steps;
  const bursts = game.burstReport();
  let groups = 0;
  for (let i = 0; i + 2 < bursts.length; i++) {
    const a = bursts[i]!;
    const b = bursts[i + 1]!;
    const c = bursts[i + 2]!;
    if (a.hero === "maga-hooli" && a.idx === 0 && b.idx === 1 && c.idx === 2) groups += 1;
  }
  const snap = game.worldSnap();
  const view = game.serverView();
  return {
    ok: view.heroes === 10 && snap.units.length > 10 && groups > 0 && view.clock > 10,
    clock: view.clock,
    groups,
    rssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    tickMs: Math.round(tickMs * 100) / 100,
    units: snap.units.length,
  };
}

function mintToken(pepper: Buffer): string {
  return createHmac("sha256", pepper).update(randomBytes(32)).digest("hex");
}

function main(): void {
  if (process.env.BETA_CHECK === "1") {
    const result = runHeadlessCheck();
    console.log(JSON.stringify({ check: "headless", ...result }));
    process.exit(result.ok ? 0 : 1);
  }

  const cfg = loadConfig();
  if (cfg.databaseUrl) {
    log(cfg, "warn", "DATABASE_URL is set and ignored. This server does not open a database.");
  }
  const pepper = cfg.authSecret ? Buffer.from(cfg.authSecret) : randomBytes(32);
  const devPlayer = "local-beta";
  const devAdmin = "local-admin";
  const startedAt = Date.now();
  const conns = new Set<Conn>();
  const resume = new Map<string, { role: BetaRole; name: string; seat: number; timer?: NodeJS.Timeout }>();
  let phase: Phase = "queue";
  let game: Game | null = null;
  let endingAt = 0;
  let ticks = 0;
  let lastTickMs = 0;
  let stalls = 0;
  let tickHealthy = true;
  let cpuPct = 0;
  let lastCpu = process.cpuUsage();
  let lastCpuAt = process.hrtime.bigint();
  let snapAcc = 0;
  let stopping = false;

  const server = createServer((req, res) => {
    const url = req.url?.split("?")[0] ?? "";
    if (req.method === "GET" && (url === "/health" || url === "/ready")) {
      writeHealth(res);
      return;
    }
    if ((req.method === "GET" || req.method === "HEAD") && serveClient(url, req.method, res)) return;
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false }));
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096 });

  function writeHealth(res: ServerResponse): void {
      const view = game?.serverView();
      const mem = process.memoryUsage();
      const authed = [...conns].filter((c) => c.authed);
      const body = {
        ok: true,
        status: stopping ? "stopping" : "running",
        buildVersion: cfg.buildVersion,
        environment: cfg.environment,
        host: hostname(),
        uptimeSec: Math.round((Date.now() - startedAt) / 1000),
        players: authed.filter((c) => c.seat >= 0).length,
        spectators: authed.filter((c) => c.seat < 0 && phase !== "queue").length,
        queued: phase === "queue" ? authed.length : 0,
      maxPlayers: cfg.maxPlayers,
      matches: phase === "live" || phase === "ending" ? 1 : 0,
      match: {
        state: phase,
        phase: view?.phase ?? "",
        clock: view?.clock ?? 0,
        winner: view?.winner ?? "",
        driven: view?.driven ?? 0,
        heroes: view?.heroes ?? 0,
      },
      tick: { rate: cfg.tickRate, lastMs: lastTickMs, stalls, healthy: tickHealthy, ticks },
      cpu: { percent: Math.round(cpuPct * 10) / 10 },
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
      },
      net: { clients: conns.size, protocol: "tcp", path: "/play" },
      database: false,
    };
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
  }

  function roleFor(code: string): BetaRole | null {
    if (codeOk(code, cfg.adminCodes) || (cfg.devCodes && code === devAdmin)) return "admin";
    if (codeOk(code, cfg.playerCodes) || (cfg.devCodes && code === devPlayer)) return "player";
    return null;
  }

  function broadcast(msg: ServerMsg, only?: (c: Conn) => boolean): void {
    for (const c of conns) {
      if (!c.authed) continue;
      if (only && !only(c)) continue;
      send(c.ws, msg);
    }
  }

  function startPayload(seat: number): ServerMsg {
    const homeNames = HOME_KITS.map((id, i) => seatedName(i) || heroById(id).name);
    const awayNames = AWAY_KITS.map((id, i) => seatedName(i + 5) || heroById(id).name);
    return { t: "start", seat, homeKits: HOME_KITS, awayKits: AWAY_KITS, homeNames, awayNames };
  }

  function seatedName(seat: number): string {
    for (const c of conns) {
      if (c.authed && c.seat === seat) return c.name;
    }
    return "";
  }

  function claim(conn: Conn): number {
    if (!game) return -1;
    if (conn.seat >= 0 && game.seatHeld(conn.seat)) return conn.seat;
    const saved = resume.get(conn.token);
    if (saved && saved.seat >= 0) {
      const hero = game.heroAtSeat(saved.seat);
      const blocked = isHooliId(hero) && conn.role !== "admin";
      const takenByOther = game.seatHeld(saved.seat) && ![...conns].some((c) => c !== conn && c.seat === saved.seat);
      if (!blocked && (takenByOther || !game.seatHeld(saved.seat)) && game.driveSeat(saved.seat, conn.name)) {
        if (saved.timer) clearTimeout(saved.timer);
        return saved.seat;
      }
    }
    for (let i = 0; i < cfg.maxPlayers; i++) {
      if (game.seatHeld(i)) continue;
      const hero = game.heroAtSeat(i);
      if (isHooliId(hero) && conn.role !== "admin") continue;
      if (game.driveSeat(i, conn.name)) return i;
    }
    return -1;
  }

  function beginMatch(): void {
    if (phase === "live") return;
    game = makeGame();
    bootMatch(game);
    phase = "live";
    endingAt = 0;
    for (const c of conns) {
      if (!c.authed) continue;
      c.seat = claim(c);
      c.ready = true;
    }
    for (const c of conns) {
      if (!c.authed) continue;
      send(c.ws, { t: "ok", role: c.role, seat: c.seat, token: c.token, match: "live" });
      send(c.ws, startPayload(c.seat));
    }
    log(cfg, "info", "match started", { players: [...conns].filter((c) => c.seat >= 0).length });
  }

  function endMatch(why: string): void {
    if (phase === "queue") return;
    const winner = game?.serverView().winner ?? "";
    phase = "ending";
    endingAt = Date.now();
    broadcast({ t: "end", winner });
    log(cfg, "info", "match ended", { why, winner });
  }

  function returnToQueue(): void {
    game?.halt();
    game = null;
    phase = "queue";
    for (const c of conns) {
      c.seat = -1;
      c.ready = false;
      if (c.authed) {
        send(c.ws, { t: "lobby" });
        send(c.ws, { t: "queue", players: readyCount(), need: cfg.minPlayers });
      }
    }
    log(cfg, "info", "match cleared");
  }

  function authedCount(): number {
    let n = 0;
    for (const c of conns) if (c.authed) n += 1;
    return n;
  }

  function readyCount(): number {
    let n = 0;
    for (const c of conns) if (c.authed && c.ready) n += 1;
    return n;
  }

  function maybeStart(): void {
    if (phase !== "queue") return;
    if (readyCount() >= cfg.minPlayers) beginMatch();
    else broadcast({ t: "queue", players: readyCount(), need: cfg.minPlayers });
  }

  function releaseLater(conn: Conn): void {
    const seat = conn.seat;
    const token = conn.token;
    if (seat < 0 || !game) return;
    game.seatOrder(seat, { kind: "stop" });
    const timer = setTimeout(() => {
      game?.releaseSeat(seat);
      const saved = resume.get(token);
      if (saved) saved.seat = -1;
      log(cfg, "info", "seat released", { seat });
    }, cfg.matchTimeoutSec * 1000);
    resume.set(token, { role: conn.role, name: conn.name, seat, timer });
  }

  function sampleCpu(): void {
    const now = process.hrtime.bigint();
    const cpu = process.cpuUsage(lastCpu);
    const wallMs = Number(now - lastCpuAt) / 1e6;
    lastCpu = process.cpuUsage();
    lastCpuAt = now;
    if (wallMs > 0) cpuPct = ((cpu.user + cpu.system) / 1000 / wallMs) * 100;
  }

  function tick(): void {
    if (stopping) return;
    const t0 = performance.now();
    if (phase === "live" && game) {
      game.update(cfg.tickDt);
      ticks += 1;
      snapAcc += cfg.tickDt;
      if (game.over()) endMatch("ancient");
      if (snapAcc >= 0.1) {
        snapAcc = 0;
        const snap = game.worldSnap();
        broadcast({ t: "snap", snap });
      }
    } else if (phase === "ending" && Date.now() - endingAt > 8000) {
      returnToQueue();
    }
    lastTickMs = Math.round((performance.now() - t0) * 100) / 100;
    if (lastTickMs > 50) {
      stalls += 1;
      tickHealthy = false;
      log(cfg, "warn", "tick stall", { ms: lastTickMs });
    } else if (stalls === 0) tickHealthy = true;
    if (ticks % cfg.tickRate === 0) sampleCpu();
  }

  server.on("upgrade", (req: IncomingMessage, socket, head) => {
    const url = req.url?.split("?")[0] ?? "";
    if (url !== "/play") {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      const conn: Conn = {
        ws,
        authed: false,
        role: "player",
        name: "Tester",
        token: "",
        seat: -1,
        ready: false,
        orders: 0,
        windowAt: Date.now(),
        floods: 0,
      };
      conns.add(conn);
      ws.on("message", (data, isBinary) => {
        if (isBinary) {
          log(cfg, "warn", "abnormal network", { why: "binary" });
          return;
        }
        const text = data.toString();
        if (text.length > 4096) {
          log(cfg, "warn", "abnormal network", { why: "oversize" });
          ws.close(1009);
          return;
        }
        const msg = parseClientMessage(text);
        if (!msg) {
          log(cfg, "warn", "abnormal network", { why: "bad-frame" });
          return;
        }
        onMessage(conn, msg);
      });
      ws.on("close", () => {
        conns.delete(conn);
        if (conn.authed) {
          log(cfg, "info", "player disconnected", { seat: conn.seat, role: conn.role });
          releaseLater(conn);
        }
      });
      ws.on("error", () => {
        log(cfg, "warn", "abnormal network", { why: "socket" });
      });
    });
  });

  function onMessage(conn: Conn, msg: ReturnType<typeof parseClientMessage>): void {
    if (!msg) return;
    if (msg.t === "ping") {
      send(conn.ws, { t: "pong", n: msg.n });
      return;
    }
    if (msg.t === "auth") {
      if (msg.code) {
        const role = roleFor(msg.code);
        if (!role) {
          log(cfg, "warn", "authentication failed");
          send(conn.ws, { t: "deny", reason: "code" });
          return;
        }
        if (authedCount() >= cfg.maxPlayers + cfg.specSeats) {
          send(conn.ws, { t: "deny", reason: "full" });
          return;
        }
        conn.authed = true;
        conn.role = role;
        conn.name = cleanName(msg.name);
        conn.token = mintToken(pepper);
        conn.seat = phase === "live" ? claim(conn) : -1;
        conn.ready = false;
        resume.set(conn.token, { role, name: conn.name, seat: conn.seat });
        send(conn.ws, { t: "ok", role, seat: conn.seat, token: conn.token, match: phase === "live" ? "live" : "queue" });
        log(cfg, "info", "player connected", { seat: conn.seat, role });
        if (phase === "live") {
          conn.ready = true;
          send(conn.ws, startPayload(conn.seat));
        } else {
          send(conn.ws, { t: "queue", players: readyCount(), need: cfg.minPlayers });
        }
        return;
      }
      const saved = msg.token ? resume.get(msg.token) : undefined;
      if (saved) {
        for (const other of conns) {
          if (other !== conn && other.token === msg.token) other.ws.close(4000);
        }
        if (saved.timer) clearTimeout(saved.timer);
        conn.authed = true;
        conn.role = saved.role;
        conn.name = saved.name;
        conn.token = msg.token ?? "";
        conn.seat = phase === "live" ? claim(conn) : -1;
        conn.ready = phase === "live";
        send(conn.ws, { t: "ok", role: conn.role, seat: conn.seat, token: conn.token, match: phase === "live" ? "live" : "queue" });
        if (phase === "live") send(conn.ws, startPayload(conn.seat));
        else send(conn.ws, { t: "queue", players: readyCount(), need: cfg.minPlayers });
        log(cfg, "info", "player reconnected", { seat: conn.seat, role: conn.role });
        return;
      }
      log(cfg, "warn", "authentication failed");
      send(conn.ws, { t: "deny", reason: "code" });
      return;
    }
    if (!conn.authed) {
      send(conn.ws, { t: "deny", reason: "closed" });
      return;
    }
    if (msg.t === "ready") {
      conn.ready = true;
      log(cfg, "info", "player queued", { role: conn.role });
      maybeStart();
      return;
    }
    if (msg.t === "admin") {
      if (conn.role !== "admin") {
        log(cfg, "warn", "authentication failed", { why: "admin" });
        return;
      }
      if (msg.op === "start") beginMatch();
      else endMatch("admin");
      return;
    }
    if (msg.t === "leave") {
      conn.ws.close(1000);
      return;
    }
    if (msg.t === "order") {
      if (phase !== "live" || conn.seat < 0 || !game) return;
      const now = Date.now();
      if (now - conn.windowAt > 1000) {
        conn.windowAt = now;
        conn.orders = 0;
      }
      conn.orders += 1;
      if (conn.orders > 40) {
        conn.floods += 1;
        if (conn.floods === 1 || conn.floods % 20 === 0) log(cfg, "warn", "abnormal network", { why: "order-flood", seat: conn.seat });
        return;
      }
      game.seatOrder(conn.seat, msg.order);
    }
  }

  const timer = setInterval(tick, Math.round(1000 / cfg.tickRate));

  function shutdown(sig: string): void {
    if (stopping) return;
    stopping = true;
    log(cfg, "info", "server stopping", { sig });
    clearInterval(timer);
    for (const c of conns) c.ws.close(1001);
    game?.halt();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    log(cfg, "error", "crash", { message: err.message });
    process.exit(1);
  });
  process.on("unhandledRejection", (err) => {
    log(cfg, "error", "crash", { message: err instanceof Error ? err.message : "rejection" });
    process.exit(1);
  });

  const host = process.env.PORT ? "0.0.0.0" : cfg.host;
  server.listen(cfg.port, host, () => {
    log(cfg, "info", "beta server listening", {
      host,
      port: cfg.port,
      tick: cfg.tickRate,
      minPlayers: cfg.minPlayers,
      devCodes: cfg.devCodes,
      version: cfg.buildVersion,
    });
  });
}

main();
