#!/usr/bin/env bash
# Run on the Linux VM, as root, after you mean to publish the beta.
# Opens SSH and the game port. Does not open UDP. Does not run from the dev checkout.
set -euo pipefail
PORT="${SERVER_PORT:-43148}"
if [[ "${1:-}" != "--apply" ]]; then
  echo "Dry run. Re-run with --apply on the server to change the firewall."
  echo "ufw default deny incoming"
  echo "ufw default allow outgoing"
  echo "ufw allow OpenSSH"
  echo "ufw allow ${PORT}/tcp"
  echo "ufw deny ${PORT}/udp"
  echo "ufw enable"
  exit 0
fi
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow "${PORT}/tcp"
ufw deny "${PORT}/udp"
ufw --force enable
ufw status verbose
