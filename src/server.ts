import app from "./app";
import { env } from "./config/env";
import { prisma } from "./infrastructure/prisma/prisma.client";

const server = app.listen(env.port, () => {
  console.log(
    `RandomFates API running on http://localhost:${env.port}${env.apiPrefix}`,
  );
});

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Closing RandomFates API...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
