import { prisma } from "../../../infrastructure/prisma/prisma.client";
import {
  ForbiddenException,
  NotFoundException,
} from "../../../shared/exceptions/http.exception";

const resultInclude = {
  execution: { include: { raffle: true } },
  winners: {
    include: { participant: true, prize: true },
    orderBy: { position: "asc" },
  },
};

export const resultService = {
  async getById(id: string, userId: string, role?: string) {
    const result = await prisma.result.findUnique({
      where: { id },
      include: resultInclude,
    });
    if (!result) throw new NotFoundException("Resultado no encontrado");
    if (role !== "ADMIN" && result.execution.raffle.userId !== userId) {
      throw new ForbiddenException("No puedes consultar este resultado");
    }
    return result;
  },

  async getPublicByHash(verificationHash: string) {
    const result = await prisma.result.findFirst({
      where: { verificationHash },
      include: resultInclude,
    });
    if (!result || !result.execution.raffle.isPublic)
      throw new NotFoundException("Resultado público no encontrado");
    return {
      id: result.id,
      verificationHash: result.verificationHash,
      createdAt: result.createdAt,
      raffle: {
        id: result.execution.raffle.id,
        title: result.execution.raffle.title,
        type: result.execution.raffle.type,
      },
      winners: result.winners.map((winner: any) => ({
        position: winner.position,
        prize: winner.prize
          ? { id: winner.prize.id, name: winner.prize.name }
          : null,
        participant: {
          fullName: winner.participant.fullName,
          identifier: winner.participant.identifier,
        },
      })),
    };
  },

  async verify(verificationHash: string) {
    const result = await prisma.result.findFirst({
      where: { verificationHash },
      include: {
        execution: true,
        winners: {
          include: { participant: true, prize: true },
          orderBy: { position: "asc" },
        },
      },
    });
    if (!result)
      throw new NotFoundException("Hash de verificación no encontrado");

    return {
      valid: true,
      verificationHash: result.verificationHash,
      seedHash: result.execution.seedHash,
      executionStatus: result.execution.status,
      winnerCount: result.winners.length,
      generatedAt: result.createdAt,
    };
  },
};
