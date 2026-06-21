import crypto from "crypto";

export const generatePublicToken = (): string =>
  crypto.randomBytes(24).toString("hex");
export const sha256 = (value: string): string =>
  crypto.createHash("sha256").update(value).digest("hex");
export const generateRefreshToken = (): string =>
  crypto.randomBytes(48).toString("hex");
