/**
 * PM2 — produção: pm2 start ecosystem.config.cjs --env production
 * DATABASE_URL: connection string PostgreSQL (obrigatória; use .env na raiz ou variável de ambiente).
 * HTTPS na porta 443 em produção (sem :3000 no URL).
 * Certificados em data/certs/ (deploy: gen-selfsigned-cert.sh).
 * Se PM2 falhar com EACCES na 443: sudo bash scripts/enable-node-bind-443.sh
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const root = __dirname;
const sslKeyPath = path.join(root, "data", "certs", "selfsigned.key");
const sslCertPath = path.join(root, "data", "certs", "selfsigned.crt");

module.exports = {
  apps: [
    {
      name: "satorx",
      cwd: root,
      script: "src/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        DATABASE_URL: process.env.DATABASE_URL
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 443,
        DATABASE_URL: process.env.DATABASE_URL,
        HTTPS_ENABLED: "1",
        SSL_KEY_PATH: process.env.SSL_KEY_PATH || sslKeyPath,
        SSL_CERT_PATH: process.env.SSL_CERT_PATH || sslCertPath
      }
    }
  ]
};
