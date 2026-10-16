#!/usr/bin/env bash
# UPAMPI — despliegue idempotente por releases con symlink atómico.
# Uso:  VPS_HOST=1.2.3.4 VPS_USER=deploy ./deploy/deploy.sh
# Requiere en tu máquina: bash, node/npm, rsync y ssh (en Windows usa WSL).
set -euo pipefail

VPS_HOST="${VPS_HOST:?Define VPS_HOST (IP o dominio del VPS)}"
VPS_USER="${VPS_USER:-deploy}"
VPS_PORT="${VPS_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/upampi}"
SERVICE="${SERVICE:-upampi-contact}"
WEB_SERVER="${WEB_SERVER:-caddy}"      # caddy | nginx
KEEP="${KEEP:-3}"
SKIP_BUILD="${SKIP_BUILD:-0}"

RELEASE="$(date -u +%Y%m%d%H%M%S)"
SSH=(ssh -p "$VPS_PORT" -o BatchMode=yes "$VPS_USER@$VPS_HOST")
cd "$(dirname "$0")/.."

echo "▸ Release $RELEASE → $VPS_USER@$VPS_HOST:$REMOTE_DIR"

if [[ "$SKIP_BUILD" != "1" ]]; then
  echo "▸ npm ci && npm run build"
  npm ci
  npm run build
fi
test -f dist/server/entry.mjs || { echo "✗ Falta dist/server/entry.mjs — ¿falló el build?"; exit 1; }

echo "▸ Preparando directorios remotos"
"${SSH[@]}" "mkdir -p '$REMOTE_DIR/releases/$RELEASE'"

echo "▸ Subiendo archivos (rsync)"
rsync -az --delete -e "ssh -p $VPS_PORT" \
  dist package.json package-lock.json \
  "$VPS_USER@$VPS_HOST:$REMOTE_DIR/releases/$RELEASE/"

echo "▸ Instalando dependencias de producción y activando release"
"${SSH[@]}" bash -s -- "$REMOTE_DIR" "$RELEASE" "$SERVICE" "$WEB_SERVER" "$KEEP" <<'REMOTE'
set -euo pipefail
REMOTE_DIR="$1"; RELEASE="$2"; SERVICE="$3"; WEB_SERVER="$4"; KEEP="$5"
cd "$REMOTE_DIR/releases/$RELEASE"
npm ci --omit=dev --no-audit --no-fund

# symlink atómico: crear temporal y renombrar encima de "current"
ln -sfn "$REMOTE_DIR/releases/$RELEASE" "$REMOTE_DIR/current.tmp"
mv -Tf "$REMOTE_DIR/current.tmp" "$REMOTE_DIR/current"

sudo systemctl restart "$SERVICE"
sleep 1
systemctl is-active --quiet "$SERVICE" || { echo "✗ $SERVICE no arrancó"; sudo journalctl -u "$SERVICE" -n 40 --no-pager; exit 1; }

if [[ "$WEB_SERVER" == "nginx" ]]; then
  sudo nginx -t && sudo systemctl reload nginx
else
  sudo systemctl reload caddy
fi

# conservar solo las últimas $KEEP releases
cd "$REMOTE_DIR/releases"
ls -1dt */ | tail -n +"$((KEEP + 1))" | xargs -r rm -rf --
echo "✓ Activa: $(readlink -f "$REMOTE_DIR/current")"
REMOTE

echo "▸ Comprobación rápida"
curl -fsS -o /dev/null -w "  https://upampi.com → %{http_code}\n" https://upampi.com/ || echo "  (no se pudo verificar desde aquí)"
echo "✓ Despliegue $RELEASE completo"
