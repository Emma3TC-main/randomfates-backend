import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { RaffleState } from "../../../shared/enums/domain.enums";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../../shared/exceptions/http.exception";
import { generatePublicToken } from "../../../shared/utils/tokens";
import type {
  CreateRaffleInput,
  UpdateRaffleInput,
} from "../validators/raffle.schemas";

const includeRaffle = {
  prizes: true,
  _count: {
    select: {
      participants: true,
      executions: true,
    },
  },
};

const ensureOwnership = (raffle: any, userId: string, role?: string) => {
  if (role === "ADMIN") return;
  if (raffle.userId !== userId) {
    throw new ForbiddenException(
      "No puedes operar un sorteo de otro organizador",
    );
  }
};

export const raffleService = {
  async create(userId: string, input: CreateRaffleInput) {
    return prisma.raffle.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        type: input.type,
        configuration: input.configuration,
        isPublic: input.isPublic ?? false,
        publicToken: input.isPublic ? generatePublicToken() : null,
        state: RaffleState.DRAFT,
        metrics: { participants: 0, executions: 0 },
      },
      include: includeRaffle,
    });
  },

  async list(
    userId: string,
    role: string,
    params: { page: number; limit: number; state?: string },
  ) {
    const skip = (params.page - 1) * params.limit;
    const where = {
      deletedAt: null,
      ...(role === "ADMIN" ? {} : { userId }),
      ...(params.state ? { state: params.state } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.raffle.findMany({
        where,
        include: includeRaffle,
        skip,
        take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.raffle.count({ where }),
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
    const raffle = await prisma.raffle.findFirst({
      where: { id, deletedAt: null },
      include: includeRaffle,
    });
    if (!raffle) throw new NotFoundException("Sorteo no encontrado");
    ensureOwnership(raffle, userId, role);
    return raffle;
  },

  async getPublic(publicToken: string) {
    const raffle = await prisma.raffle.findFirst({
      where: { publicToken, isPublic: true, deletedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        state: true,
        createdAt: true,
        prizes: true,
        _count: { select: { participants: true } },
      },
    });
    if (!raffle) throw new NotFoundException("Sorteo público no encontrado");
    return raffle;
  },

  async update(
    id: string,
    userId: string,
    role: string | undefined,
    input: UpdateRaffleInput,
  ) {
    const raffle = await this.getById(id, userId, role);
    if (
      raffle.state !== RaffleState.DRAFT &&
      raffle.state !== RaffleState.ACTIVE
    ) {
      throw new ConflictException("El sorteo ya no permite modificaciones");
    }

    return prisma.raffle.update({
      where: { id },
      data: {
        ...input,
        publicToken:
          input.isPublic === true && !raffle.publicToken
            ? generatePublicToken()
            : raffle.publicToken,
      },
      include: includeRaffle,
    });
  },

  async publish(id: string, userId: string, role?: string) {
    const raffle = await this.getById(id, userId, role);
    const [participantsCount, prizesCount] = await Promise.all([
      prisma.participant.count({ where: { raffleId: id, deletedAt: null } }),
      prisma.prize.count({ where: { raffleId: id } }),
    ]);

    if (
      raffle.state === RaffleState.CANCELLED ||
      raffle.state === RaffleState.FINISHED
    ) {
      throw new ConflictException(
        "El sorteo no puede publicarse en su estado actual",
      );
    }
    if (participantsCount < 1) {
      throw new ConflictException(
        "No se puede publicar un sorteo sin participantes",
      );
    }
    if (prizesCount < 1) {
      throw new ConflictException("No se puede publicar un sorteo sin premios");
    }

    return prisma.raffle.update({
      where: { id },
      data: {
        state: RaffleState.ACTIVE,
        isPublic: true,
        publicToken: raffle.publicToken ?? generatePublicToken(),
        metrics: { participants: participantsCount, prizes: prizesCount },
      },
      include: includeRaffle,
    });
  },

  async cancel(id: string, userId: string, role?: string) {
    const raffle = await this.getById(id, userId, role);
    if (raffle.state === RaffleState.FINISHED) {
      throw new ConflictException("No se puede cancelar un sorteo finalizado");
    }

    return prisma.raffle.update({
      where: { id },
      data: { state: RaffleState.CANCELLED },
      include: includeRaffle,
    });
  },

  async softDelete(id: string, userId: string, role?: string) {
    const raffle = await this.getById(id, userId, role);
    if (raffle.state === RaffleState.FINISHED) {
      throw new ConflictException(
        "No se elimina un sorteo finalizado; conserva trazabilidad histórica",
      );
    }
    return prisma.raffle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
