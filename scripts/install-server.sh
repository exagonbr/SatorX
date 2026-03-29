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

echo "== SatorX: instalação no servidor =="
need_node
need_npm

echo "-> npm ci (apenas dependências de produção)"
npm ci --omit=dev

echo "-> Diretórios de dados"
mkdir -p data/replays

echo "-> Base SQLite de aprendizado (IA)"
node scripts/init-ai-db.js

echo ""
echo "Instalação concluída."
echo "  Iniciar API:  npm run server"
echo "  Porta:        PORT=3000 (ou defina PORT no ambiente)"
echo "  Dados:        $ROOT/data (replays, nnWeights.json, ai_learning.db)"
