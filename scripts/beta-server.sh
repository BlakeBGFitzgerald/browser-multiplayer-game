#!/usr/bin/env bash
# Closed-beta process control. One Node host. No database.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p "$ROOT/run" "$ROOT/logs" "$ROOT/dist"
PID="$ROOT/run/beta-server.pid"
SUP="$ROOT/run/beta-supervisor.pid"
LOG="$ROOT/logs/beta-server.log"
HALT="$ROOT/run/beta-server.halt"
STOP="$ROOT/run/beta-server.stop"
PORT="${SERVER_PORT:-43148}"
HOST="${SERVER_HOST:-127.0.0.1}"

alive() {
  [[ -f "$1" ]] && kill -0 "$(cat "$1")" 2>/dev/null
}

stop_server() {
  echo "stop" >"$STOP"
  if alive "$PID"; then
    kill "$(cat "$PID")" 2>/dev/null || true
  fi
  if alive "$SUP"; then
    kill "$(cat "$SUP")" 2>/dev/null || true
    wait "$(cat "$SUP")" 2>/dev/null || true
  fi
  if alive "$PID"; then
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      alive "$PID" || break
      sleep 0.3
    done
    if alive "$PID"; then
      kill -9 "$(cat "$PID")" 2>/dev/null || true
    fi
  fi
  rm -f "$PID" "$SUP" "$STOP"
}

start_server() {
  if [[ -f "$HALT" ]]; then
    echo "Refusing to start. Remove $HALT after you fix the crash."
    exit 1
  fi
  if alive "$SUP"; then
    echo "Beta server already running (supervisor $(cat "$SUP"))."
    exit 0
  fi
  if [[ ! -f "$ROOT/dist/server/host.js" ]]; then
    npm run server:build
  fi
  (
    restarts=0
    window_start=$(date +%s)
    while true; do
      if [[ -f "$STOP" ]]; then
        rm -f "$PID"
        exit 0
      fi
      node "$ROOT/dist/server/host.js" >>"$LOG" 2>&1 &
      echo $! >"$PID"
      set +e
      wait "$(cat "$PID")"
      code=$?
      set -e
      now=$(date +%s)
      if (( now - window_start > 60 )); then
        restarts=0
        window_start=$now
      fi
      restarts=$((restarts + 1))
      echo "{\"ts\":\"$(date -Iseconds)\",\"level\":\"error\",\"msg\":\"server exited\",\"code\":$code,\"restarts\":$restarts}" >>"$LOG"
      if (( restarts >= 5 )); then
        echo "{\"ts\":\"$(date -Iseconds)\",\"level\":\"error\",\"msg\":\"halted after repeated crashes\"}" >>"$LOG"
        echo "halted $(date -Iseconds)" >"$HALT"
        rm -f "$PID"
        exit 1
      fi
      sleep 2
    done
  ) &
  echo $! >"$SUP"
  echo "Beta server starting. Log: $LOG"
}

health() {
  curl -fsS "http://${HOST}:${PORT}/health"
  echo
}

case "${1:-}" in
  start) start_server ;;
  stop) stop_server; echo "Beta server stopped." ;;
  restart) stop_server; start_server ;;
  logs) touch "$LOG"; tail -n "${2:-80}" -f "$LOG" ;;
  health) health ;;
  update)
    if [[ -d "$ROOT/dist/server" ]]; then
      rm -rf "$ROOT/dist/server.prev"
      cp -a "$ROOT/dist/server" "$ROOT/dist/server.prev"
    fi
    git pull --ff-only
    npm ci
    npm run server:build
    stop_server || true
    rm -f "$HALT"
    start_server
    sleep 0.5
    health
    ;;
  rollback)
    if [[ ! -d "$ROOT/dist/server.prev" ]]; then
      echo "No previous server build at dist/server.prev"
      exit 1
    fi
    stop_server || true
    rm -rf "$ROOT/dist/server"
    cp -a "$ROOT/dist/server.prev" "$ROOT/dist/server"
    rm -f "$HALT"
    start_server
    ;;
  *)
    echo "Usage: scripts/beta-server.sh {start|stop|restart|logs|health|update|rollback}"
    exit 1
    ;;
esac
