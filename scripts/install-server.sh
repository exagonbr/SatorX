#!/usr/bin/env bash
# Instalação do SatorX num servidor (Linux/macOS, bash).
# Uso: bash scripts/install-server.sh
# Ou: chmod +x scripts/install-server.sh && ./scripts/install-server.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

need_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "Erro: Node.js não encontrado. Instale Node.js 18 ou superior (https://nodejs.org/)." >&2
    exit 1
  fi
  local major
  major="$(node -p "parseInt(process.versions.node.split('.')[0], 10)")"
  if [ "$major" -lt 18 ]; then
    echo "Erro: Node.js 18+ necessário (encontrado: $(node -v))." >&2
    exit 1
  fi
}

need_npm() {
  if ! command -v npm >/dev/null 2>&1; then
    echo "Erro: npm não encontrado." >&2
    exit 1
  fi
}

need_openssl() {
  if ! command -v openssl >/dev/null 2>&1; then
    echo "Erro: openssl não encontrado (necessário para HTTPS/PWA)." >&2
    exit 1
  fi
}

echo "== SatorX: instalação no servidor =="
need_node
need_npm
need_openssl

echo "-> npm ci (inclui Prisma para migrações / build)"
npm ci

echo "-> Diretórios de dados"
mkdir -p data/replays

echo "-> Certificado TLS autoassinado (HTTPS / PWA)"
bash scripts/gen-selfsigned-cert.sh

echo "-> Prisma migrate deploy + generate"
node scripts/init-ai-db.js

echo "-> npm run build"
npm run build

echo ""
echo "Instalação concluída."
echo "  Produção PM2: pm2 start ecosystem.config.cjs --env production"
echo "  Ou direto:    NODE_ENV=production npm run server"
echo "  Porta prod:   443 (HTTPS via PM2); dev local: 3000"
echo "  Porta 443:    se EACCES → sudo bash scripts/enable-node-bind-443.sh"
echo "  Dados:        PostgreSQL (DATABASE_URL); ficheiros em $ROOT/data (nnWeights.json, certs/)"
