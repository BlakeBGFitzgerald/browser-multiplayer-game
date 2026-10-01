import { parseClientMessage, type ServerMsg } from "./beta/protocol";
import type { Order } from "./game/input";

export type BetaHandlers = {
  status: (line: string) => void;
  authed: (role: "player" | "admin", match: "queue" | "live" | "over") => void;
  queue: (players: number, need: number) => void;
  start: (msg: Extract<ServerMsg, { t: "start" }>) => void;
  snap: (msg: Extract<ServerMsg, { t: "snap" }>) => void;
  end: (winner: "home" | "away" | "") => void;
  lobby: () => void;
  denied: (reason: string) => void;
};

const TOKEN_KEY = "cu-beta-token";

function betaUrl(): string {
  const fromEnv = import.meta.env.VITE_BETA_URL;
  if (typeof fromEnv === "string" && fromEnv.trim()) return fromEnv.trim();
  // Same origin as the page. Browsers upgrade http(s) to ws(s).
  return "/play";
}

export class BetaLink {
  private ws: WebSocket | null = null;
  private token = "";
  private ping = 0;
  private lastPong = 0;
  private pingTimer = 0;
  private name = "Tester";
  private retries = 0;
  private want = false;
  private generation = 0;
  role: "player" | "admin" = "player";

  private readonly handlers: BetaHandlers;

  constructor(handlers: BetaHandlers) {
    this.handlers = handlers;
    try {
      this.token = sessionStorage.getItem(TOKEN_KEY) ?? "";
    } catch {
      this.token = "";
    }
  }

  url(): string {
    return betaUrl();
  }

  connect(code: string, name: string): void {
    this.want = true;
    this.retries = 0;
    this.name = name || "Tester";
    this.open(code, this.name, "");
  }

  ready(): void {
    this.send({ t: "ready" });
  }

  order(order: Order): void {
    this.send({ t: "order", order });
  }

  admin(op: "start" | "stop"): void {
    this.send({ t: "admin", op });
  }

  leave(): void {
    this.want = false;
    this.send({ t: "leave" });
    this.close();
  }

  latencyMs(): number {
    if (!this.lastPong) return 0;
    return this.lastPong;
  }

  private send(body: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(body));
  }

  private open(code: string, name: string, token: string): void {
    this.close();
    const gen = this.generation;
    let ws: WebSocket;
    try {
      ws = new WebSocket(betaUrl());
    } catch {
      this.handlers.denied("bad");
      this.handlers.status("The beta server did not accept the socket.");
      return;
    }
    this.ws = ws;
    this.handlers.status(token ? "Reconnecting…" : "Connecting to the beta server…");
    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ t: "auth", code, name, token: token || undefined }));
    });
    ws.addEventListener("message", (ev) => {
      if (typeof ev.data !== "string") return;
      this.onFrame(ev.data);
    });
    ws.addEventListener("close", () => {
      if (gen !== this.generation || !this.want) return;
      if (!this.token || this.retries >= 3) {
        this.handlers.status("Disconnected from the beta server.");
        return;
      }
      this.retries += 1;
      window.setTimeout(() => this.open("", this.name, this.token), 600);
    });
    ws.addEventListener("error", () => {
      this.handlers.status("Could not reach the beta server.");
    });
  }

  private close(): void {
    this.generation += 1;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
  }

  private onFrame(raw: string): void {
    let data: ServerMsg;
    try {
      data = JSON.parse(raw) as ServerMsg;
    } catch {
      return;
    }
    if (!data || typeof data !== "object" || typeof data.t !== "string") return;
    if (data.t === "deny") {
      this.handlers.denied(data.reason);
      this.handlers.status(data.reason === "full" ? "The beta server is full." : "That invite code was refused.");
      return;
    }
    if (data.t === "ok") {
      this.role = data.role;
      this.token = data.token;
      try {
        sessionStorage.setItem(TOKEN_KEY, data.token);
      } catch {
        /* private mode */
      }
      this.retries = 0;
      this.handlers.authed(data.role, data.match);
      if (data.match === "queue") this.ready();
      return;
    }
    if (data.t === "queue") {
      this.handlers.queue(data.players, data.need);
      return;
    }
    if (data.t === "start") {
      this.handlers.start(data);
      this.armPing();
      return;
    }
    if (data.t === "snap") {
      this.handlers.snap(data);
      return;
    }
    if (data.t === "end") {
      this.handlers.end(data.winner);
      return;
    }
    if (data.t === "lobby") {
      this.handlers.lobby();
      return;
    }
    if (data.t === "pong") this.lastPong = Math.max(0, Date.now() - data.n);
  }

  private armPing(): void {
    if (this.pingTimer) return;
    this.pingTimer = window.setInterval(() => {
      this.ping = Date.now();
      this.send({ t: "ping", n: this.ping });
    }, 2000);
  }
}

export function clientMessageOk(raw: string): boolean {
  return parseClientMessage(raw) != null;
}
