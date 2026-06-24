import rateLimit from "express-rate-limit";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos. Intenta nuevamente más tarde.",
    error: {
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
});

export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de OTP. Intenta nuevamente más tarde.",
    error: {
      code: "OTP_RATE_LIMIT_EXCEEDED",
    },
  },
});

export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas solicitudes administrativas.",
    error: {
      code: "ADMIN_RATE_LIMIT_EXCEEDED",
    },
  },
});
