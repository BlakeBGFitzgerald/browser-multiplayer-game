# Closed beta server

The match in a normal browser tab is still local. Closed beta adds one Node process that runs that same `Game` with drawing, UI, input, and audio turned off. Testers connect over a WebSocket. Their browser draws the snapshots and plays battle audio from server events. The server decides damage, gold, XP, cooldowns, items, and the winner.

```
BROWSER
  → invite code on the enter page (Closed beta)
  → WebSocket /play
BETA HOST (one process, one match)
  → headless Game tick
  → snapshots
BROWSER draws the match
```

There is no database, no Redis, and no UDP. Accounts in the tab stay in `localStorage`. The hosted match does not read them.

## What the code already fixed

| Fact | Where it comes from |
| --- | --- |
| 10 heroes on the field | `MATCH_SEATS` in `src/lobby.ts` |
| 5 a side | `PLAYERS_PER_TEAM` |
| Up to 5 extra watchers | `SPEC_SEATS` |
| Server step | Browser frames are capped at `0.033`s in `src/main.ts`. Default `SERVER_TICK_RATE=30`, and each step is `min(0.033, 1/rate)`. |
| Hooli seat | Cast seat 0 is Hooli. A player code cannot drive him. An admin code can. |
| Reconnect hold | `MATCH_TIMEOUT` seconds (default 20). This is the beta seat hold, not an old combat constant. |
| Queue | Match starts when `BETA_MIN_PLAYERS` testers are ready (default 2). An admin can start sooner. |
| Measured headless cost | About 90 MB RSS and under 2 ms per tick for the cast match with bots, on this machine. That is a measurement, not a cloud SKU. |

## Configure

Copy `config/beta.example.json` to `config/beta.json` (gitignored) or set env vars. Never commit real codes.

| Variable | Default | Meaning |
| --- | --- | --- |
| `SERVER_HOST` | `127.0.0.1` | Bind address. Use `0.0.0.0` on a VM. |
| `SERVER_PORT` | `43148` | TCP port for `/health` and `/play`. |
| `SERVER_TICK_RATE` | `30` | Sim steps per second. |
| `MAX_PLAYERS` | `10` | Field seats. Cannot go above 10. |
| `BETA_MIN_PLAYERS` | `2` | Ready testers before the match starts. |
| `MATCH_TIMEOUT` | `20` | Seconds to keep a dropped seat. |
| `LOG_LEVEL` | `info` | `debug` `info` `warn` `error`. |
| `BETA_CODES` | empty | Comma-separated player invite codes. |
| `BETA_ADMIN` | empty | Comma-separated admin invite codes. |
| `BETA_FILE` | `config/beta.json` | Optional JSON file with the same codes. |
| `AUTH_SECRET` | empty | Pepper for session tokens. Empty mints a new pepper every boot, so tokens die on restart. |
| `BUILD_VERSION` | `1.0.0` | Reported by `/health`. |
| `ENVIRONMENT` | `development` | `production` disables the loopback dev codes. |
| `DATABASE_URL` | empty | Ignored. Logged once if set. |
| `VITE_BETA_URL` | `ws://127.0.0.1:43148/play` | Where the browser connects. |

On `127.0.0.1`, when `ENVIRONMENT` is not `production` and no codes are set, the server accepts `local-beta` (player) and `local-admin` (admin). Those codes do nothing if you bind a public address or set `ENVIRONMENT=production`.

## Commands

```bash
npm run server:check
bash scripts/beta-server.sh start
bash scripts/beta-server.sh health
bash scripts/beta-server.sh logs
bash scripts/beta-server.sh restart
bash scripts/beta-server.sh stop
bash scripts/beta-server.sh update
bash scripts/beta-server.sh rollback
```

`update` keeps the previous bundle in `dist/server.prev`. `rollback` restores it. The supervisor restarts a crash, and it stops after 5 exits inside 60 seconds (`run/beta-server.halt`). Delete that file before starting again.

Health: `GET /health` on the game port. It reports running state, build, players, the one match, tick time, CPU percent, and RSS. It does not report names, codes, or tokens.

Logs are JSON lines in `logs/beta-server.log`: connected, disconnected, queued, match started, match ended, auth failure, crash, tick stall, abnormal frames. Codes and tokens are not written.

## Tester steps

1. You run the beta server and give them an invite code.
2. They open the game (this tab, or a build whose `VITE_BETA_URL` points at your server).
3. **Closed beta** → invite code → name → **Join beta**.
4. They wait until the queue fills (or an admin presses **Start match**).
5. The cast match loads. They play the seat the server assigned. Hooli stays AI unless the code is an admin code.
6. When a town falls, the server sends them back to the queue.

Find Game is unchanged and still plays inside the tab.

## Firewall

Only TCP `43148` (or your `SERVER_PORT`) needs to be open, plus SSH. UDP is not used. `deploy/ufw-beta.sh` prints the rules. On the VM, `sudo bash deploy/ufw-beta.sh --apply` installs them. Do not expose a database port. There is no admin HTTP route. Admin actions ride the same authenticated socket, and a player code cannot use them.

## Deploy

Local:

```bash
npm ci
npm run server:build
ENVIRONMENT=production BETA_CODES=... BETA_ADMIN=... SERVER_HOST=127.0.0.1 bash scripts/beta-server.sh start
```

A VM later: copy the repo, install Node 22, put codes in `config/beta.env` (`KEY=value` lines sourced by systemd), and install `deploy/maga-beta.service`. Docker is optional: `docker build -t maga-beta .` then run it with the same env vars and publish TCP `43148` only. The image does not add a database.

This checkout cannot create a cloud account. Nothing here has been deployed to Oracle, AWS, or any other host.

## Hosting judgment

| Option | Verdict |
| --- | --- |
| Oracle Cloud Always Free Ampere VM | Best fit if you want it free. A VM can run this Node process, open TCP 43148, and stay up. An Always Free account still asks for a payment method. That is not a promise of a $0 bill if you create paid shapes, extra boot volumes, or outbound traffic past the allowance. Set a budget alert in the Oracle console before you create anything. |
| AWS Free Tier | Can run one small EC2 instance for a limited time. The 12-month free tier expires, and a t-series instance, an idle public IP, or extra disks can bill. Turn on a budget alarm and a $0 or low spending limit before launch. Not the default recommendation. |
| Vercel, Netlify, Cloudflare Workers, Lambda | Reject for this server. They do not keep a 30 Hz match process running. The static client can still be hosted there if `VITE_BETA_URL` points at a real VM. |
| A second database, Redis, or a load balancer | Do not add them. This server does not use them. |

## Limits

- One match at a time on one process. A second match needs a second process and a way to point testers at it. That is not built.
- Reconnect keeps the seat for `MATCH_TIMEOUT` seconds. A server restart drops every token unless you set `AUTH_SECRET` (tokens still only live in memory, so a restart still drops seats).
- The browser follows snapshots. It does not simulate combat. A stall looks like units catching up, not a second copy of damage.
- Concede stays on the local Find Game match. The hosted match is started as a watched sim with seated drivers, so the old MAGA concede vote does not run there.
- There is no siege unit in the spawn table. The beta server does not add one.
