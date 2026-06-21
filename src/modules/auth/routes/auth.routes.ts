import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { authController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/auth/register", asyncHandler(authController.register));
authRouter.post("/auth/login", asyncHandler(authController.login));
authRouter.post("/auth/refresh", asyncHandler(authController.refresh));
authRouter.post(
  "/auth/logout",
  authenticate,
  asyncHandler(authController.logout),
);
authRouter.get("/auth/me", authenticate, asyncHandler(authController.me));
