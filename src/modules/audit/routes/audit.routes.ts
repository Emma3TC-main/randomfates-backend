import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../../shared/middlewares/auth.middleware";
import { UserRole } from "../../../shared/enums/domain.enums";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { auditController } from "../controllers/audit.controller";
import { requireRecentMfa } from "../../../shared/middlewares/admin-security.middleware";
import { adminRateLimit } from "../../../shared/middlewares/rate-limit-middleware";

export const auditRouter = Router();

auditRouter.get(
  "/admin/audit-logs",
  authenticate,
  adminRateLimit,
  authorize(UserRole.ADMIN),
  requireRecentMfa(15),
  asyncHandler(auditController.list),
);

auditRouter.get(
  "/admin/kpis",
  authenticate,
  adminRateLimit,
  authorize(UserRole.ADMIN),
  requireRecentMfa(15),
  asyncHandler(auditController.kpis),
);
