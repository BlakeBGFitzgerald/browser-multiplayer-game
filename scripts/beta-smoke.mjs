import { WebSocket } from "ws";

const host = process.env.SERVER_HOST || "127.0.0.1";
const port = process.env.SERVER_PORT || "43148";
const url = `ws://${host}:${port}/play`;
const healthUrl = `http://${host}:${port}/health`;

function connect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => reject(new Error("connect timeout")), 4000);
    ws.once("open", () => {
      clearTimeout(timer);
      resolve(ws);
    });
    ws.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function once(ws, pred, ms = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("message timeout")), ms);
    const onMsg = (buf) => {
      const msg = JSON.parse(buf.toString());
      if (!pred(msg)) return;
      clearTimeout(timer);
      ws.off("message", onMsg);
      resolve(msg);
    };
    ws.on("message", onMsg);
  });
}

async function auth(ws, code, name) {
  ws.send(JSON.stringify({ t: "auth", code, name }));
  return once(ws, (m) => m.t === "ok" || m.t === "deny");
}

const report = { denied: false, players: [], snaps: 0, health: null, reconnected: false, latencyMs: 0 };

const bad = await connect();
const denied = await auth(bad, "not-a-real-code", "Nope");
report.denied = denied.t === "deny" && denied.reason === "code";
bad.close();

const counts = [2, 4, 6, 8, 10];
let sockets = [];

async function ensure(n) {
  while (sockets.length < n) {
    const ws = await connect();
    const ok = await auth(ws, "local-beta", `Tester ${sockets.length + 1}`);
    if (ok.t !== "ok") throw new Error("auth failed");
    ws.send(JSON.stringify({ t: "ready" }));
    sockets.push({ ws, token: ok.token, seat: ok.seat, name: `Tester ${sockets.length + 1}` });
  }
}

for (const n of counts) {
  await ensure(n);
  const start = Date.now();
  let got = 0;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no snap at ${n}`)), 8000);
    const onSnap = (buf) => {
      const msg = JSON.parse(buf.toString());
      if (msg.t !== "snap") return;
      got += 1;
      if (got < 2) return;
      clearTimeout(timer);
      sockets[0].ws.off("message", onSnap);
      report.snaps += 1;
      report.players.push({
        n,
        units: msg.snap.units.length,
        heroes: msg.snap.units.filter((u) => u.kind === "hero").length,
        clock: msg.snap.clock,
        waitMs: Date.now() - start,
      });
      resolve();
    };
    sockets[0].ws.on("message", onSnap);
  });
  sockets[0].ws.send(JSON.stringify({ t: "order", order: { kind: "move", x: 400, y: 400, damage: 9999, gold: 9999 } }));
}

const healthRes = await fetch(healthUrl);
report.health = await healthRes.json();

const pingAt = Date.now();
sockets[0].ws.send(JSON.stringify({ t: "ping", n: pingAt }));
const pong = await once(sockets[0].ws, (m) => m.t === "pong");
report.latencyMs = Date.now() - pong.n;

const held = sockets[1];
const oldToken = held.token;
held.ws.close();
await new Promise((r) => setTimeout(r, 300));
const again = await connect();
again.send(JSON.stringify({ t: "auth", code: "", name: held.name, token: oldToken }));
const back = await once(again, (m) => m.t === "ok" || m.t === "deny");
report.reconnected = back.t === "ok" && back.seat >= 0;
report.resumedSeat = back.seat;

for (const s of sockets) s.ws.close();
again.close();

const ok =
  report.denied &&
  report.players.length === 5 &&
  report.players.every((p) => p.heroes === 10) &&
  report.health?.ok === true &&
  report.health.matches === 1 &&
  report.reconnected &&
  report.health.database === false;

console.log(JSON.stringify({ ok, report }, null, 2));
process.exit(ok ? 0 : 1);
