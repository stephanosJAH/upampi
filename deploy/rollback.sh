#!/usr/bin/env bash
# Vuelve a la release anterior.  Uso: VPS_HOST=1.2.3.4 VPS_USER=deploy ./deploy/rollback.sh
set -euo pipefail
VPS_HOST="${VPS_HOST:?Define VPS_HOST}"; VPS_USER="${VPS_USER:-deploy}"; VPS_PORT="${VPS_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/upampi}"; SERVICE="${SERVICE:-upampi-contact}"; WEB_SERVER="${WEB_SERVER:-caddy}"
ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" bash -s -- "$REMOTE_DIR" "$SERVICE" "$WEB_SERVER" <<'REMOTE'
set -euo pipefail
REMOTE_DIR="$1"; SERVICE="$2"; WEB_SERVER="$3"
CUR="$(readlink -f "$REMOTE_DIR/current")"
PREV="$(ls -1dt "$REMOTE_DIR"/releases/*/ | sed 's#/$##' | grep -vx "$CUR" | head -n1)"
[[ -n "$PREV" ]] || { echo "✗ No hay release anterior"; exit 1; }
ln -sfn "$PREV" "$REMOTE_DIR/current.tmp" && mv -Tf "$REMOTE_DIR/current.tmp" "$REMOTE_DIR/current"
sudo systemctl restart "$SERVICE"
if [[ "$WEB_SERVER" == "nginx" ]]; then sudo systemctl reload nginx; else sudo systemctl reload caddy; fi
echo "✓ Rollback a $PREV"
REMOTE
