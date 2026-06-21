import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { healthController } from "../controllers/health.controller";

export const healthRouter = Router();

healthRouter.get("/health", healthController.check);
healthRouter.get("/health/db", asyncHandler(healthController.db));
