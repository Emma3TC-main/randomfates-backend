import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../../shared/middlewares/auth.middleware";
import { UserRole } from "../../../shared/enums/domain.enums";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { userController } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.get(
  "/users",
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(userController.list),
);
userRouter.get(
  "/users/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(userController.getById),
);
userRouter.patch(
  "/users/:id/status",
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(userController.updateStatus),
);
