import { Router } from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { prizeController } from "../controllers/prize.controller";

export const prizeRouter = Router();

prizeRouter.post(
  "/raffles/:raffleId/prizes",
  authenticate,
  asyncHandler(prizeController.create),
);
prizeRouter.get(
  "/raffles/:raffleId/prizes",
  authenticate,
  asyncHandler(prizeController.list),
);
prizeRouter.delete(
  "/raffles/:raffleId/prizes/:prizeId",
  authenticate,
  asyncHandler(prizeController.remove),
);
