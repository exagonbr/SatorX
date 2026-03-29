#!/usr/bin/env bash
# Deploy completo: git (origin/main), dependências, Prisma, build, PM2 em produção.
# Requer: Node 18+, git, PM2 instalado globalmente (npm i -g pm2).
# Uso: bash scripts/deploy-prod.sh
#
# Requer DATABASE_URL com PostgreSQL (exporte antes do script ou use .env na raiz).
#
# Acesso pelo IP público (menos avisos no browser): exporte antes do deploy, por exemplo:
#   CERT_EXTRA_SAN="IP:203.0.113.5,DNS:meu.dominio"

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT/.env"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Erro: defina DATABASE_URL (PostgreSQL) no ambiente ou em .env" >&2
  exit 1
fi

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
echo "HTTPS em produção usa a porta 443 (https://<IP>/ sem sufixe de porta)."
echo "Se o processo não subir (EACCES), uma vez no servidor: sudo bash scripts/enable-node-bind-443.sh && pm2 restart satorx"
echo "Abra a porta 443 no firewall da cloud (ex.: GCP VPC / regra de firewall)."
echo "PWA: na primeira visita aceite o certificado autoassinado (ou Avançadas → continuar)."
