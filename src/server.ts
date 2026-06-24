import app from "./app";
import { env } from "./config/env";
import { prisma } from "./infrastructure/prisma/prisma.client";
import { otpCleanupService } from "./modules/auth/services/otp-cleanup.service";

// 1. Levantar el servidor
const server = app.listen(env.port, () => {
  console.log(
    `RandomFates API running on http://localhost:${env.port}${env.apiPrefix}`,
  );
});

// 2. Iniciar el servicio de limpieza en segundo plano (cada 1 hora)
const otpCleanupInterval = setInterval(
  () => {
    void otpCleanupService.deleteOldChallenges().catch(console.error);
  },
  60 * 60 * 1000,
);

// Evita que este intervalo mantenga el proceso de Node.js vivo si el servidor se detiene
otpCleanupInterval.unref();

// 3. Manejo del Apagado Seguro (Graceful Shutdown)
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Closing RandomFates API...`);

  // Limpiar el intervalo para liberar memoria antes de cerrar el servidor
  clearInterval(otpCleanupInterval);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
