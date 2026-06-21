import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { RaffleState } from "../../../shared/enums/domain.enums";
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../../shared/exceptions/http.exception";
import type { CreatePrizeInput } from "../validators/prize.schemas";

const ensureRaffleCanChangePrizes = async (
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
      "No se pueden modificar premios en un sorteo finalizado o cancelado",
    );
  }
  return raffle;
};

export const prizeService = {
  async create(
    raffleId: string,
    userId: string,
    role: string | undefined,
    input: CreatePrizeInput,
  ) {
    await ensureRaffleCanChangePrizes(raffleId, userId, role);
    return prisma.prize.create({ data: { raffleId, ...input } });
  },

  async list(
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
    const [items, total] = await Promise.all([
      prisma.prize.findMany({
        where: { raffleId },
        skip,
        take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.prize.count({ where: { raffleId } }),
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

  async remove(
    raffleId: string,
    prizeId: string,
    userId: string,
    role?: string,
  ) {
    await ensureRaffleCanChangePrizes(raffleId, userId, role);
    const prize = await prisma.prize.findFirst({
      where: { id: prizeId, raffleId },
    });
    if (!prize) throw new NotFoundException("Premio no encontrado");
    return prisma.prize.delete({ where: { id: prizeId } });
  },
};
