import crypto from "crypto";
import { env } from "../../config/env";
import { sha256 } from "./tokens";

export const generateOtpCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateChallengeToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashOtp = (otp: string, challengeToken: string): string => {
  return sha256(`${otp}:${challengeToken}:${env.otpPepper}`);
};

export const maskEmail = (email: string): string => {
  const [name, domain] = email.split("@");

  if (!name || !domain) return "correo oculto";

  const safeName =
    name.length <= 2 ? `${name[0]}***` : `${name.slice(0, 2)}***`;

  return `${safeName}@${domain}`;
};
