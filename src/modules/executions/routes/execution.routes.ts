import { Router } from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { executionController } from "../controllers/execution.controller";

export const executionRouter = Router();

executionRouter.post(
  "/raffles/:raffleId/executions",
  authenticate,
  asyncHandler(executionController.execute),
);
executionRouter.get(
  "/raffles/:raffleId/executions",
  authenticate,
  asyncHandler(executionController.listByRaffle),
);
executionRouter.get(
  "/executions/:id",
  authenticate,
  asyncHandler(executionController.getById),
);
