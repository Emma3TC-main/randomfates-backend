import type { Request } from "express";
import { prisma } from "../../../infrastructure/prisma/prisma.client";

export const auditService = {
  async register(params: {
    userId?: string | null;
    entityType: string;
    entityId: string;
    action: string;
    payload?: unknown;
    req?: Request;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        payload: params.payload ?? {},
        ipAddress: params.req?.ip,
        userAgent: params.req?.headers["user-agent"] ?? null,
      },
    });
  },

  async list(params: { page: number; limit: number; entityType?: string }) {
    const skip = (params.page - 1) * params.limit;
    const where = params.entityType ? { entityType: params.entityType } : {};
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
      },
    };
  },

  async kpis() {
    const [users, raffles, executions, results, participants] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.raffle.count({ where: { deletedAt: null } }),
        prisma.execution.count(),
        prisma.result.count(),
        prisma.participant.count({ where: { deletedAt: null } }),
      ]);
    return { users, raffles, executions, results, participants };
  },
};
