import bcrypt from "bcrypt";
import { env } from "../../../config/env";
import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { jwtService } from "../../../infrastructure/security/jwt.service";
import {
  ConflictException,
  UnauthorizedException,
} from "../../../shared/exceptions/http.exception";
import {
  SubscriptionStatus,
  UserRole,
} from "../../../shared/enums/domain.enums";
import { generateRefreshToken, sha256 } from "../../../shared/utils/tokens";
import type { LoginInput, RegisterInput } from "../validators/auth.schemas";

const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  subscriptionStatus: true,
  isActive: true,
  createdAt: true,
};

const buildTokens = async (user: any) => {
  const accessToken = jwtService.signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = sha256(refreshToken);
  const expiresAt = new Date(
    Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000,
  );

  await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: env.jwtExpiresIn,
  };
};

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException("Ya existe una cuenta con ese correo");
    }

    const passwordHash = await bcrypt.hash(
      input.password,
      env.bcryptSaltRounds,
    );
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: UserRole.USER,
        subscriptionStatus: SubscriptionStatus.EXPIRED,
      },
      select: safeUserSelect,
    });

    const tokens = await buildTokens(user);
    return { user, tokens };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const tokens = await buildTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      tokens,
    };
  },

  async refresh(refreshToken: string) {
    const refreshTokenHash = sha256(refreshToken);
    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || !session.user?.isActive || session.user.deletedAt) {
      throw new UnauthorizedException("Refresh token inválido o expirado");
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await buildTokens(session.user);

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        subscriptionStatus: session.user.subscriptionStatus,
      },
      tokens,
    };
  },

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.session.updateMany({
        where: {
          userId,
          refreshTokenHash: sha256(refreshToken),
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
      return { revoked: "current_session" };
    }

    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { revoked: "all_sessions" };
  },

  async me(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: safeUserSelect,
    });
  },
};
