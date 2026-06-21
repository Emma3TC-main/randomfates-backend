import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { DomainEvent } from "../../../infrastructure/events/domain-events";
import { realtimeService } from "../../../infrastructure/websocket/realtime.service";
import {
  ExecutionStatus,
  RaffleState,
} from "../../../shared/enums/domain.enums";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../../shared/exceptions/http.exception";
import { randomEngine } from "../engine/random-engine";

const runningStatuses = [
  ExecutionStatus.PENDING,
  ExecutionStatus.VALIDATING,
  ExecutionStatus.IN_PROGRESS,
  ExecutionStatus.EMITTING_RESULT,
];

export const executionService = {
  async execute(raffleId: string, userId: string, role?: string) {
    const startedAt = Date.now();

    const raffle = await prisma.raffle.findFirst({
      where: { id: raffleId, deletedAt: null },
      include: {
        participants: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
        },
        prizes: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!raffle) throw new NotFoundException("Sorteo no encontrado");
    if (role !== "ADMIN" && raffle.userId !== userId)
      throw new ForbiddenException("No puedes ejecutar este sorteo");
    if (
      raffle.state === RaffleState.FINISHED ||
      raffle.state === RaffleState.CANCELLED
    ) {
      throw new ConflictException(
        "El sorteo no puede ejecutarse en su estado actual",
      );
    }
    if (raffle.participants.length < 1)
      throw new ConflictException("El sorteo no tiene participantes válidos");
    if (raffle.prizes.length < 1)
      throw new ConflictException("El sorteo no tiene premios configurados");

    const activeExecution = await prisma.execution.findFirst({
      where: { raffleId, status: { in: runningStatuses } },
    });
    if (activeExecution)
      throw new ConflictException(
        "Ya existe una ejecución activa para este sorteo",
      );

    const execution = await prisma.execution.create({
      data: { raffleId, status: ExecutionStatus.PENDING },
    });

    try {
      await prisma.execution.update({
        where: { id: execution.id },
        data: { status: ExecutionStatus.VALIDATING },
      });
      await realtimeService.emit(execution.id, DomainEvent.ExecutionStarted, {
        raffleId,
        status: ExecutionStatus.VALIDATING,
      });

      const { seed, seedHash } = randomEngine.generateSeed();

      const result = await prisma.$transaction(async (tx: any) => {
        await tx.execution.update({
          where: { id: execution.id },
          data: { status: ExecutionStatus.IN_PROGRESS, seedHash },
        });

        await tx.raffle.update({
          where: { id: raffleId },
          data: { state: RaffleState.ACTIVE },
        });

        const winners = randomEngine.selectWinners({
          seed,
          participants: raffle.participants.map((participant: any) => ({
            id: participant.id,
            identifier: participant.identifier,
            fullName: participant.fullName,
          })),
          prizes: raffle.prizes.map((prize: any) => ({
            id: prize.id,
            quantity: prize.quantity,
          })),
        });

        const verificationHash = randomEngine.buildVerificationHash({
          seedHash,
          raffleId,
          executionId: execution.id,
          participantIds: raffle.participants.map(
            (participant: any) => participant.id,
          ),
          winners,
        });

        const createdResult = await tx.result.create({
          data: {
            executionId: execution.id,
            verificationHash,
            winners: {
              create: winners.map((winner) => ({
                participantId: winner.participantId,
                prizeId: winner.prizeId,
                position: winner.position,
              })),
            },
          },
          include: {
            winners: {
              include: {
                participant: true,
                prize: true,
              },
              orderBy: { position: "asc" },
            },
          },
        });

        await tx.execution.update({
          where: { id: execution.id },
          data: { status: ExecutionStatus.EMITTING_RESULT },
        });

        await tx.raffle.update({
          where: { id: raffleId },
          data: {
            state: RaffleState.FINISHED,
            metrics: {
              participants: raffle.participants.length,
              prizes: raffle.prizes.length,
              winners: winners.length,
              lastExecutionId: execution.id,
            },
          },
        });

        return createdResult;
      });

      await realtimeService.emit(execution.id, DomainEvent.ResultGenerated, {
        resultId: result.id,
        verificationHash: result.verificationHash,
      });
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.SUCCESS,
          durationMs: Date.now() - startedAt,
          finishedAt: new Date(),
        },
      });
      await realtimeService.emit(execution.id, DomainEvent.ExecutionFinished, {
        status: ExecutionStatus.SUCCESS,
      });

      return prisma.execution.findUnique({
        where: { id: execution.id },
        include: {
          raffle: true,
          result: {
            include: {
              winners: {
                include: { participant: true, prize: true },
                orderBy: { position: "asc" },
              },
            },
          },
          events: true,
        },
      });
    } catch (error) {
      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.FAILED,
          durationMs: Date.now() - startedAt,
          finishedAt: new Date(),
        },
      });
      await realtimeService.emit(execution.id, "ExecutionFailed", {
        message: error instanceof Error ? error.message : "unknown",
      });
      throw error;
    }
  },

  async listByRaffle(
    raffleId: string,
    userId: string,
    role: string | undefined,
    params: { page: number; limit: number },
  ) {
    const raffle = await prisma.raffle.findFirst({
      where: { id: raffleId, deletedAt: null },
    });
    if (!raffle) throw new NotFoundException("Sorteo no encontrado");
    if (role !== "ADMIN" && raffle.userId !== userId)
      throw new ForbiddenException("No puedes consultar este sorteo");

    const skip = (params.page - 1) * params.limit;
    const where = { raffleId };
    const [items, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        include: { result: true },
        skip,
        take: params.limit,
        orderBy: { startedAt: "desc" },
      }),
      prisma.execution.count({ where }),
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

  async getById(id: string, userId: string, role?: string) {
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        raffle: true,
        events: true,
        result: {
          include: {
            winners: {
              include: { participant: true, prize: true },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });
    if (!execution) throw new NotFoundException("Ejecución no encontrada");
    if (role !== "ADMIN" && execution.raffle.userId !== userId)
      throw new ForbiddenException("No puedes consultar esta ejecución");
    return execution;
  },
};
