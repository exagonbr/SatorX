#!/usr/bin/env bash
# Deploy completo: git (origin/main), dependências, Prisma, build, PM2 em produção.
# Requer: Node 18+, git, PM2 instalado globalmente (npm i -g pm2).
# Uso: bash scripts/deploy-prod.sh
#
# Se já existia ai_learning.db criado fora do Prisma e migrate deploy falhar por
# tabelas duplicadas, uma vez: node scripts/prisma-run.js migrate resolve --applied 20250329120000_init
#
# Acesso pelo IP público (menos avisos no browser): exporte antes do deploy, por exemplo:
#   CERT_EXTRA_SAN="IP:203.0.113.5,DNS:meu.dominio"

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export DATABASE_URL="${DATABASE_URL:-file:../data/ai_learning.db}"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: '$1' não encontrado no PATH." >&2
    exit 1
  fi
}

need_cmd git
need_cmd node
need_cmd npm
need_cmd openssl

echo "== SatorX deploy (origin/main) =="
echo "-> DATABASE_URL=$DATABASE_URL"

echo "-> git fetch && reset --hard origin/main"
git fetch origin
git reset --hard origin/main

echo "-> npm install"
npm install

echo "-> data/"
mkdir -p data/replays

echo "-> Certificado TLS autoassinado (HTTPS / PWA)"
bash scripts/gen-selfsigned-cert.sh

echo "-> Prisma migrate deploy + prisma generate (scripts/init-ai-db.js)"
node scripts/init-ai-db.js

echo "-> npm run build"
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  echo "Aviso: pm2 não instalado. Instale com: npm i -g pm2" >&2
  echo "Arranque manual: NODE_ENV=production npm run server" >&2
  exit 0
fi

echo "-> PM2 (produção)"
if pm2 describe satorx >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production --update-env
else
  pm2 start ecosystem.config.cjs --env production
fi

pm2 save
echo "Concluído. Estado: pm2 status"
echo "PWA: aceda por https na porta definida em PORT (PM2); na primeira visita aceite o certificado autoassinado."
