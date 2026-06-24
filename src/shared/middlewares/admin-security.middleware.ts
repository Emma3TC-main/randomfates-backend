import type { NextFunction, Request, Response } from "express";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../exceptions/http.exception";

export const requireRecentMfa = (maxAgeMinutes = 15) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      throw new UnauthorizedException();
    }

    const mfaVerifiedAt = req.authUser.mfaVerifiedAt;

    if (!mfaVerifiedAt) {
      throw new ForbiddenException(
        "Se requiere verificación OTP reciente para acceso administrativo",
      );
    }

    const verifiedAtMs = Date.parse(mfaVerifiedAt);

    if (!Number.isFinite(verifiedAtMs)) {
      throw new ForbiddenException("Verificación OTP inválida");
    }

    const maxAgeMs = maxAgeMinutes * 60 * 1000;

    if (Date.now() - verifiedAtMs > maxAgeMs) {
      throw new ForbiddenException(
        "La verificación administrativa expiró. Vuelve a iniciar sesión",
      );
    }

    next();
  };
};
