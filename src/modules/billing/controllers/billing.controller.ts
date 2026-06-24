import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { UnauthorizedException } from "../../../shared/exceptions/http.exception";
import { billingService } from "../services/billing.service";
import {
  approvePaymentSchema,
  createPlanSchema,
  subscribeSchema,
} from "../validators/billing.schemas";
import { auditService } from "../../audit/services/audit.service";

const requireUser = (req: Request) => {
  if (!req.authUser) throw new UnauthorizedException();
  return req.authUser;
};

export const billingController = {
  async createPlan(req: Request, res: Response): Promise<void> {
    const input = createPlanSchema.parse(req.body);
    const data = await billingService.createPlan(input);

    void auditService
      .register({
        userId: req.authUser?.id,
        entityType: "Plan",
        entityId: data.id,
        action: "ADMIN_CREATE_PLAN",
        payload: {
          name: data.name,
          price: data.price,
        },
        req,
      })
      .catch(console.error);

    res.status(201).json(successResponse("Plan creado", data));
  },

  async listPlans(_req: Request, res: Response): Promise<void> {
    const data = await billingService.listPlans();
    res.json(successResponse("Planes obtenidos", data));
  },

  async subscribe(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const input = subscribeSchema.parse(req.body);
    const data = await billingService.subscribe(user.id, input);
    res
      .status(201)
      .json(successResponse("Suscripción creada pendiente de pago", data));
  },

  async activeSubscription(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await billingService.getActiveSubscription(user.id);
    res.json(successResponse("Suscripción activa consultada", data));
  },

  async approvePayment(req: Request, res: Response): Promise<void> {
    const input = approvePaymentSchema.parse(req.body);
    const data = await billingService.approvePayment(input);

    void auditService
      .register({
        userId: req.authUser?.id,
        entityType: "Payment",
        entityId: data.id,
        action: "ADMIN_APPROVE_PAYMENT",
        payload: {
          subscriptionId: data.subscriptionId,
          transactionReference: data.transactionReference,
        },
        req,
      })
      .catch(console.error);

    res.json(
      successResponse("Pago aprobado y beneficios premium activados", data),
    );
  },
};
