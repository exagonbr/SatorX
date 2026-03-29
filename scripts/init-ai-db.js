#!/usr/bin/env node
/**
 * Aplica migrações Prisma e gera o client (idempotente em deploy: migrate deploy).
 * Desenvolvimento: use `npx prisma migrate dev` para criar novas migrações.
 * Requer DATABASE_URL (PostgreSQL) no ambiente ou no .env na raiz do projeto.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
process.chdir(root);

const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");

function runPrisma(args) {
  const r = spawnSync(process.execPath, [prismaCli, ...args], {
    stdio: "inherit",
    cwd: root,
    env: process.env
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!process.env.DATABASE_URL) {
  console.error("Erro: defina DATABASE_URL (PostgreSQL) no .env ou no ambiente.");
  process.exit(1);
}

runPrisma(["migrate", "deploy"]);
runPrisma(["generate"]);
console.log("Base Prisma pronta (PostgreSQL).");
