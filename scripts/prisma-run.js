#!/usr/bin/env node
/**
 * Executa o CLI do Prisma via Node (evita "Permission denied" em node_modules/.bin/prisma).
 * Uso: node scripts/prisma-run.js generate
 */
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");
const args = process.argv.slice(2);

const r = spawnSync(process.execPath, [prismaCli, ...args], {
  stdio: "inherit",
  cwd: root,
  env: process.env
});

process.exit(r.status ?? 1);
