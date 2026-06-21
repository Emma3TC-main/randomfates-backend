import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { NotFoundException } from "../../../shared/exceptions/http.exception";

const selectUser = {
  id: true,
  email: true,
  role: true,
  subscriptionStatus: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};

export const userService = {
  async list(params: { page: number; limit: number; search?: string }) {
    const skip = (params.page - 1) * params.limit;
    const where = {
      deletedAt: null,
      ...(params.search
        ? {
            email: {
              contains: params.search,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select: selectUser, skip, take: params.limit, orderBy: { createdAt: "desc" } }),
      prisma.user.count({ where }),
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

  async getById(id: string) {
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null }, select: selectUser });
    if (!user) throw new NotFoundException("Usuario no encontrado");
    return user;
  },

  async updateStatus(id: string, data: { isActive?: boolean; role?: string; subscriptionStatus?: string }) {
    await this.getById(id);
    return prisma.user.update({ where: { id }, data, select: selectUser });
  },
};
