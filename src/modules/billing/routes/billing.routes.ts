import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../../shared/middlewares/auth.middleware";
import { UserRole } from "../../../shared/enums/domain.enums";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { billingController } from "../controllers/billing.controller";
import { requireRecentMfa } from "../../../shared/middlewares/admin-security.middleware";
import { adminRateLimit } from "../../../shared/middlewares/rate-limit-middleware";

export const billingRouter = Router();

billingRouter.get("/billing/plans", asyncHandler(billingController.listPlans));
billingRouter.post(
  "/billing/plans",
  authenticate,
  adminRateLimit,
  authorize(UserRole.ADMIN),
  requireRecentMfa(15),
  asyncHandler(billingController.createPlan),
);
billingRouter.post(
  "/billing/subscribe",
  authenticate,
  asyncHandler(billingController.subscribe),
);
billingRouter.get(
  "/billing/subscription",
  authenticate,
  asyncHandler(billingController.activeSubscription),
);
billingRouter.post(
  "/billing/payments/mock-approve",
  authenticate,
  adminRateLimit,
  authorize(UserRole.ADMIN),
  requireRecentMfa(15),
  asyncHandler(billingController.approvePayment),
);
