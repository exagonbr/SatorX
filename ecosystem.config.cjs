/**
 * PM2 — produção: pm2 start ecosystem.config.cjs --env production
 * DATABASE_URL relativo a prisma/schema.prisma (pasta prisma/).
 */
const root = __dirname;
const databaseUrl = "file:../data/ai_learning.db";

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
        DATABASE_URL: databaseUrl
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
        DATABASE_URL: process.env.DATABASE_URL || databaseUrl
      }
    }
  ]
};
