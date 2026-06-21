import type { Request, Response } from "express";
import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { successResponse } from "../../../shared/dto/api-response";

export const healthController = {
  check(_req: Request, res: Response): void {
    res.json(
      successResponse("RandomFates API operativa", {
        service: "randomfates-backend",
        status: "ok",
        timestamp: new Date().toISOString(),
      }),
    );
  },

  async db(_req: Request, res: Response): Promise<void> {
    await prisma.$queryRaw`SELECT 1`;
    res.json(
      successResponse("Conexión a base de datos verificada", {
        database: "ok",
        timestamp: new Date().toISOString(),
      }),
    );
  },
};
