import { Router } from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { resultController } from "../controllers/result.controller";

export const resultRouter = Router();

resultRouter.get(
  "/results/:id",
  authenticate,
  asyncHandler(resultController.getById),
);
resultRouter.get(
  "/public/results/:verificationHash",
  asyncHandler(resultController.getPublicByHash),
);
resultRouter.get(
  "/public/results/:verificationHash/verify",
  asyncHandler(resultController.verify),
);
