import { Router } from "express";
import { authenticate } from "../../../shared/middlewares/auth.middleware";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { raffleController } from "../controllers/raffle.controller";

export const raffleRouter = Router();

raffleRouter.get(
  "/public/raffles/:publicToken",
  asyncHandler(raffleController.getPublic),
);
raffleRouter.post(
  "/raffles",
  authenticate,
  asyncHandler(raffleController.create),
);
raffleRouter.get("/raffles", authenticate, asyncHandler(raffleController.list));
raffleRouter.get(
  "/raffles/:id",
  authenticate,
  asyncHandler(raffleController.getById),
);
raffleRouter.patch(
  "/raffles/:id",
  authenticate,
  asyncHandler(raffleController.update),
);
raffleRouter.post(
  "/raffles/:id/publish",
  authenticate,
  asyncHandler(raffleController.publish),
);
raffleRouter.post(
  "/raffles/:id/cancel",
  authenticate,
  asyncHandler(raffleController.cancel),
);
raffleRouter.delete(
  "/raffles/:id",
  authenticate,
  asyncHandler(raffleController.remove),
);
