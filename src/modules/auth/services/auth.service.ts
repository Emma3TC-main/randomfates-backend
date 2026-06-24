import bcrypt from "bcrypt";
import { env } from "../../../config/env";
import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { jwtService } from "../../../infrastructure/security/jwt.service";
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "../../../shared/exceptions/http.exception";
import {
  SubscriptionStatus,
  UserRole,
} from "../../../shared/enums/domain.enums";
import { generateRefreshToken, sha256 } from "../../../shared/utils/tokens";
import type {
  LoginInput,
  RegisterInput,
  ResendOtpInput,
  VerifyOtpInput,
} from "../validators/auth.schemas";

import {
  generateChallengeToken,
  generateOtpCode,
  hashOtp,
  maskEmail,
} from "../../../shared/utils/otp";
import { mailService } from "../../../infrastructure/mail/mail.service";

const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  subscriptionStatus: true,
  isActive: true,
  createdAt: true,
};

const buildTokens = async (user: any, options?: { mfaVerifiedAt?: string }) => {
  const accessToken = jwtService.signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
    ...(options?.mfaVerifiedAt ? { mfaVerifiedAt: options.mfaVerifiedAt } : {}),
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

const createLoginOtpChallenge = async (user: any) => {
  await prisma.authOtpChallenge.updateMany({
    where: {
      userId: user.id,
      purpose: "LOGIN_MFA",
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: {
      consumedAt: new Date(),
    },
  });

  const otp = generateOtpCode();
  const challengeToken = generateChallengeToken();

  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

  await prisma.authOtpChallenge.create({
    data: {
      userId: user.id,
      challengeToken,
      otpHash: hashOtp(otp, challengeToken),
      purpose: "LOGIN_MFA",
      attempts: 0,
      maxAttempts: env.otpMaxAttempts,
      expiresAt,
    },
  });

  await mailService.sendOtpEmail(user.email, otp);

  return {
    requiresOtp: true,
    challengeToken,
    expiresInSeconds: env.otpExpiresMinutes * 60,
    delivery: {
      channel: "EMAIL",
      destination: maskEmail(user.email),
    },
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

    const otpChallenge = await createLoginOtpChallenge(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      ...otpChallenge,
    };
  },

  async verifyOtp(input: VerifyOtpInput) {
    const challenge = await prisma.authOtpChallenge.findUnique({
      where: {
        challengeToken: input.challengeToken,
      },
      include: {
        user: true,
      },
    });

    // 🛡️ FIX SEGURIDAD 1: Verificar existencia primero
    if (!challenge) {
      throw new UnauthorizedException("OTP inválido o expirado");
    }

    // 🛡️ FIX SEGURIDAD 2: El candado de intentos máximos va ARRIBA del todo.
    // Si ya alcanzó o superó el máximo, se rechaza inmediatamente sin importar si el código ingresado es correcto.
    if (challenge.attempts >= challenge.maxAttempts) {
      throw new UnauthorizedException("OTP bloqueado por intentos fallidos");
    }

    if (challenge.consumedAt) {
      throw new UnauthorizedException("OTP ya fue utilizado");
    }

    if (challenge.expiresAt <= new Date()) {
      throw new UnauthorizedException("OTP expirado");
    }

    if (
      !challenge.user ||
      challenge.user.deletedAt ||
      !challenge.user.isActive
    ) {
      throw new UnauthorizedException("Usuario inválido");
    }

    const incomingHash = hashOtp(input.otp, challenge.challengeToken);

    if (incomingHash !== challenge.otpHash) {
      await prisma.authOtpChallenge.update({
        where: { id: challenge.id },
        data: {
          attempts: { increment: 1 },
        },
      });

      throw new UnauthorizedException("OTP inválido");
    }

    await prisma.authOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        consumedAt: new Date(),
      },
    });

    const tokens = await buildTokens(challenge.user, {
      mfaVerifiedAt: new Date().toISOString(),
    });

    return {
      user: {
        id: challenge.user.id,
        email: challenge.user.email,
        role: challenge.user.role,
        subscriptionStatus: challenge.user.subscriptionStatus,
        isActive: challenge.user.isActive,
        createdAt: challenge.user.createdAt,
      },
      tokens,
    };
  },

  async resendOtp(input: ResendOtpInput) {
    const challenge = await prisma.authOtpChallenge.findUnique({
      where: {
        challengeToken: input.challengeToken,
      },
      include: {
        user: true,
      },
    });

    if (!challenge || challenge.consumedAt) {
      throw new BadRequestException("No se puede reenviar este OTP");
    }

    if (
      !challenge.user ||
      challenge.user.deletedAt ||
      !challenge.user.isActive
    ) {
      throw new UnauthorizedException("Usuario inválido");
    }

    await prisma.authOtpChallenge.update({
      where: { id: challenge.id },
      data: {
        consumedAt: new Date(),
      },
    });

    const newChallenge = await createLoginOtpChallenge(challenge.user);

    return newChallenge;
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
