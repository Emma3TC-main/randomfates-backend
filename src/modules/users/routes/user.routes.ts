import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../../shared/middlewares/auth.middleware";
import { UserRole } from "../../../shared/enums/domain.enums";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { userController } from "../controllers/user.controller";
import { requireRecentMfa } from "../../../shared/middlewares/admin-security.middleware";
import { adminRateLimit } from "../../../shared/middlewares/rate-limit-middleware";

export const userRouter = Router();

userRouter.get(
  "/users",
  authenticate,
  adminRateLimit,
  authorize(UserRole.ADMIN),
  requireRecentMfa(15),
  asyncHandler(userController.list),
);

userRouter.get(
  "/users/:id",
  authenticate,
  adminRateLimit,
  authorize(UserRole.ADMIN),
  requireRecentMfa(15),
  asyncHandler(userController.getById),
);

userRouter.patch(
  "/users/:id/status",
  authenticate,
  adminRateLimit,
  authorize(UserRole.ADMIN),
  requireRecentMfa(15),
  asyncHandler(userController.updateStatus),
);
