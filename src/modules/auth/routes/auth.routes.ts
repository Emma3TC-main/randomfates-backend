import {
  authRateLimit,
  otpRateLimit,
} from "../../../shared/middlewares/rate-limit-middleware";

import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/auth/register", asyncHandler(authController.register));
authRouter.post(
  "/auth/login",
  authRateLimit,
  asyncHandler(authController.login),
);
authRouter.post(
  "/auth/otp/verify",
  otpRateLimit,
  asyncHandler(authController.verifyOtp),
);
authRouter.post(
  "/auth/otp/resend",
  otpRateLimit,
  asyncHandler(authController.resendOtp),
);
authRouter.post("/auth/refresh", asyncHandler(authController.refresh));

authRouter.post(
  "/auth/logout",
  authenticate,
  asyncHandler(authController.logout),
);

authRouter.get("/auth/me", authenticate, asyncHandler(authController.me));
