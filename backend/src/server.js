import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

async function start() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL");

    const server = app.listen(env.port, () => {
      console.log(`Chit API running on http://localhost:${env.port}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
