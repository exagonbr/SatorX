#!/usr/bin/env bash
# Permite ao binário do Node escutar na porta 443 (e outras < 1024) sem correr como root.
# Executar UMA VEZ no servidor (requer sudo e o pacote libcap2-bin em Debian/Ubuntu).
#
# Uso: sudo bash scripts/enable-node-bind-443.sh
#
# Depois: pm2 restart satorx

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Execute com sudo: sudo bash $0" >&2
  exit 1
fi

if ! command -v setcap >/dev/null 2>&1; then
  echo "Instale libcap2-bin (ex.: apt install -y libcap2-bin)" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Mesmo Node que o PM2 usa (PATH atual; em deploy costuma ser o do sistema ou nvm)
NODE_BIN="$(command -v node)"
if [ -z "$NODE_BIN" ]; then
  echo "node não encontrado no PATH. Carregue nvm/shell e tente de novo." >&2
  exit 1
fi

if command -v realpath >/dev/null 2>&1; then
  NODE_REAL="$(realpath "$NODE_BIN")"
else
  NODE_REAL="$(readlink -f "$NODE_BIN" 2>/dev/null || echo "$NODE_BIN")"
fi

echo "Aplicando cap_net_bind_service em: $NODE_REAL"
setcap 'cap_net_bind_service=+ep' "$NODE_REAL"
getcap "$NODE_REAL" || true
echo "OK. Reinicie a app: cd $ROOT && pm2 restart satorx"
