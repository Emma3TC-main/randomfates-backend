import { prisma } from "../../../infrastructure/prisma/prisma.client";
import { Prisma } from "../../../generated/prisma/client";
import { DomainEvent } from "../../../infrastructure/events/domain-events";
import {
  PaymentStatus,
  SubscriptionStatus,
  UserRole,
} from "../../../shared/enums/domain.enums";
import {
  ConflictException,
  NotFoundException,
} from "../../../shared/exceptions/http.exception";
import type {
  ApprovePaymentInput,
  CreatePlanInput,
  SubscribeInput,
} from "../validators/billing.schemas";

export const billingService = {
  async createPlan(input: CreatePlanInput) {
    return prisma.plan.create({
      data: {
        name: input.name,
        price: input.price,
        features: input.features as Prisma.InputJsonValue,
      },
    });
  },

  async listPlans() {
    return prisma.plan.findMany({ orderBy: { price: "asc" } });
  },

  async subscribe(userId: string, input: SubscribeInput) {
    const plan = await prisma.plan.findUnique({ where: { id: input.planId } });
    if (!plan) throw new NotFoundException("Plan no encontrado");

    const active = await prisma.subscription.findFirst({
      where: { userId, isActive: true, endsAt: { gt: new Date() } },
    });
    if (active)
      throw new ConflictException("El usuario ya tiene una suscripción activa");

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + input.months);

    return prisma.subscription.create({
      data: {
        userId,
        planId: input.planId,
        startsAt,
        endsAt,
        isActive: false,
      },
      include: { plan: true },
    });
  },

  async getActiveSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, isActive: true, endsAt: { gt: new Date() } },
      include: { plan: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async approvePayment(input: ApprovePaymentInput) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: input.subscriptionId },
      include: { plan: true, user: true },
    });
    if (!subscription) throw new NotFoundException("Suscripción no encontrada");

    const payment = await prisma.$transaction(async (tx: any) => {
      const createdPayment = await tx.payment.create({
        data: {
          subscriptionId: subscription.id,
          transactionReference: input.transactionReference,
          amount: subscription.plan.price,
          currency: "PEN",
          status: PaymentStatus.SUCCESS,
          gatewayResponse: input.gatewayResponse as Prisma.InputJsonValue,
        },
      });

      await tx.subscription.update({
        where: { id: subscription.id },
        data: { isActive: true },
      });
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          role: UserRole.PREMIUM,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: subscription.userId,
          entityType: "Subscription",
          entityId: subscription.id,
          action: DomainEvent.PaymentApproved,
          payload: {
            paymentId: createdPayment.id,
            transactionReference: input.transactionReference,
          } as Prisma.InputJsonValue,
        },
      });

      return createdPayment;
    });

    return payment;
  },
};
