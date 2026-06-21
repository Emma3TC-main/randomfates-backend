import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { RaffleState } from "../../../shared/enums/domain.enums";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../../shared/exceptions/http.exception";
import type {
  BulkParticipantsInput,
  CreateParticipantInput,
} from "../validators/participant.schemas";

const ensureRaffleCanChangeParticipants = async (
  raffleId: string,
  userId: string,
  role?: string,
) => {
  const raffle = await prisma.raffle.findFirst({
    where: { id: raffleId, deletedAt: null },
  });
  if (!raffle) throw new NotFoundException("Sorteo no encontrado");
  if (role !== "ADMIN" && raffle.userId !== userId)
    throw new ForbiddenException("No puedes modificar este sorteo");
  if (
    raffle.state === RaffleState.FINISHED ||
    raffle.state === RaffleState.CANCELLED
  ) {
    throw new ConflictException(
      "No se pueden modificar participantes en un sorteo finalizado o cancelado",
    );
  }

  const activeExecution = await prisma.execution.findFirst({
    where: {
      raffleId,
      status: {
        in: ["PENDING", "VALIDATING", "IN_PROGRESS", "EMITTING_RESULT"],
      },
    },
  });
  if (activeExecution)
    throw new ConflictException(
      "No se pueden modificar participantes durante una ejecución activa",
    );
  return raffle;
};

export const participantService = {
  async create(
    raffleId: string,
    userId: string,
    role: string | undefined,
    input: CreateParticipantInput,
  ) {
    await ensureRaffleCanChangeParticipants(raffleId, userId, role);
    try {
      return await prisma.participant.create({
        data: {
          raffleId,
          fullName: input.fullName,
          identifier: input.identifier,
          email: input.email,
          source: input.source,
          metadata: input.metadata ?? {},
        },
      });
    } catch (error) {
      throw new ConflictException(
        "El identificador del participante ya existe dentro del sorteo",
        error,
      );
    }
  },

  async list(
    raffleId: string,
    userId: string,
    role: string | undefined,
    params: { page: number; limit: number; search?: string },
  ) {
    const raffle = await prisma.raffle.findFirst({
      where: { id: raffleId, deletedAt: null },
    });
    if (!raffle) throw new NotFoundException("Sorteo no encontrado");
    if (role !== "ADMIN" && raffle.userId !== userId)
      throw new ForbiddenException("No puedes consultar este sorteo");

    const skip = (params.page - 1) * params.limit;
    const where = {
      raffleId,
      deletedAt: null,
      ...(params.search
        ? {
            OR: [
              { fullName: { contains: params.search, mode: "insensitive" } },
              { identifier: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.participant.count({ where }),
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

  async bulkCreate(
    raffleId: string,
    userId: string,
    role: string | undefined,
    input: BulkParticipantsInput,
  ) {
    await ensureRaffleCanChangeParticipants(raffleId, userId, role);

    const seen = new Set<string>();
    const duplicatesInPayload: string[] = [];
    for (const participant of input.participants) {
      if (seen.has(participant.identifier))
        duplicatesInPayload.push(participant.identifier);
      seen.add(participant.identifier);
    }
    if (duplicatesInPayload.length > 0) {
      throw new BadRequestException(
        "La carga contiene identificadores duplicados",
        duplicatesInPayload,
      );
    }

    const existing = await prisma.participant.findMany({
      where: {
        raffleId,
        identifier: { in: input.participants.map((p) => p.identifier) },
        deletedAt: null,
      },
      select: { identifier: true },
    });
    if (existing.length > 0) {
      throw new ConflictException(
        "Algunos identificadores ya existen en el sorteo",
        existing.map((p: any) => p.identifier),
      );
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const importJob = await tx.importJob.create({
        data: {
          raffleId,
          filename: input.filename,
          status: "PROCESSING",
          totalRecords: input.participants.length,
          processedRecords: 0,
          errors: [],
        },
      });

      await tx.participant.createMany({
        data: input.participants.map((participant) => ({
          raffleId,
          fullName: participant.fullName,
          identifier: participant.identifier,
          email: participant.email,
          source: participant.source,
          metadata: participant.metadata ?? {},
        })),
      });

      const completedJob = await tx.importJob.update({
        where: { id: importJob.id },
        data: {
          status: "COMPLETED",
          processedRecords: input.participants.length,
        },
      });

      return completedJob;
    });

    return result;
  },

  async softDelete(
    raffleId: string,
    participantId: string,
    userId: string,
    role?: string,
  ) {
    await ensureRaffleCanChangeParticipants(raffleId, userId, role);
    const participant = await prisma.participant.findFirst({
      where: { id: participantId, raffleId, deletedAt: null },
    });
    if (!participant) throw new NotFoundException("Participante no encontrado");
    return prisma.participant.update({
      where: { id: participantId },
      data: { deletedAt: new Date() },
    });
  },
};
