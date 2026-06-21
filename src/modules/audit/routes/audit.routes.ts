import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../../shared/middlewares/auth.middleware";
import { UserRole } from "../../../shared/enums/domain.enums";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { auditController } from "../controllers/audit.controller";

export const auditRouter = Router();

auditRouter.get(
  "/admin/audit-logs",
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(auditController.list),
);
auditRouter.get(
  "/admin/kpis",
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(auditController.kpis),
);
