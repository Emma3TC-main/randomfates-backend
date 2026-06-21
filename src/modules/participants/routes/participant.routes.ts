import { Router } from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { participantController } from "../controllers/participant.controller";

export const participantRouter = Router();

participantRouter.post(
  "/raffles/:raffleId/participants",
  authenticate,
  asyncHandler(participantController.create),
);
participantRouter.get(
  "/raffles/:raffleId/participants",
  authenticate,
  asyncHandler(participantController.list),
);
participantRouter.post(
  "/raffles/:raffleId/participants/bulk",
  authenticate,
  asyncHandler(participantController.bulk),
);
participantRouter.delete(
  "/raffles/:raffleId/participants/:participantId",
  authenticate,
  asyncHandler(participantController.remove),
);
