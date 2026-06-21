import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import type { UserRoleValue } from "../../shared/enums/domain.enums";

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRoleValue;
  subscriptionStatus: string;
};

export const jwtService = {
  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    return decoded;
  },
};
