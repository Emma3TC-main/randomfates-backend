import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../../shared/middlewares/auth.middleware";
import { UserRole } from "../../../shared/enums/domain.enums";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { billingController } from "../controllers/billing.controller";

export const billingRouter = Router();

billingRouter.get("/billing/plans", asyncHandler(billingController.listPlans));
billingRouter.post(
  "/billing/plans",
  authenticate,
  authorize(UserRole.ADMIN),
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
  authorize(UserRole.ADMIN),
  asyncHandler(billingController.approvePayment),
);
