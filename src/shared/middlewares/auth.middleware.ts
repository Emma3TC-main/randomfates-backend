import type { NextFunction, Request, Response } from "express";
import { jwtService } from "../../infrastructure/security/jwt.service";
import {
  UnauthorizedException,
  ForbiddenException,
} from "../exceptions/http.exception";
import type { UserRoleValue } from "../enums/domain.enums";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedException("Token JWT no enviado");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new UnauthorizedException("Token JWT vacío");
  }

  try {
    const payload = jwtService.verifyAccessToken(token);
    req.authUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      subscriptionStatus: payload.subscriptionStatus,
      mfaVerifiedAt: payload.mfaVerifiedAt,
    };
    next();
  } catch (_error) {
    throw new UnauthorizedException("Token JWT inválido o expirado");
  }
};

export const authorize = (...roles: UserRoleValue[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      throw new UnauthorizedException();
    }

    if (!roles.includes(req.authUser.role)) {
      throw new ForbiddenException(
        "Tu rol no tiene permisos para esta operación",
      );
    }

    next();
  };
};
