#!/usr/bin/env node
/**
 * Cria data/ai_learning.db e tabelas. Idempotente.
 */
const path = require("path");
const { initSchema, closeDb, DB_PATH } = require(path.join(__dirname, "..", "src", "db", "aiLearningStore"));

try {
  initSchema();
  console.log("Base de aprendizado inicializada:", DB_PATH);
} finally {
  closeDb();
}
