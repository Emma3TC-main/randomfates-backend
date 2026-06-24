import dotenv from "dotenv";

dotenv.config();

const numberFromEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberFromEnv("PORT", 3000),
  apiPrefix: process.env.API_PREFIX ?? "/v1",
  databaseUrl: process.env.DATABASE_URL ?? "",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-randomfates-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  refreshTokenDays: numberFromEnv("REFRESH_TOKEN_DAYS", 7),
  bcryptSaltRounds: numberFromEnv("BCRYPT_SALT_ROUNDS", 10),
  otpExpiresMinutes: numberFromEnv("OTP_EXPIRES_MINUTES", 5),
  otpMaxAttempts: numberFromEnv("OTP_MAX_ATTEMPTS", 5),
  otpPepper: process.env.OTP_PEPPER ?? "dev-only-otp-pepper-change-me",
};

export const isProduction = env.nodeEnv === "production";
