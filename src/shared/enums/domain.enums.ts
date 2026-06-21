export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
  PREMIUM: "PREMIUM",
} as const;

export const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export const RaffleState = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
  CANCELLED: "CANCELLED",
} as const;

export const RaffleType = {
  ROULETTE: "ROULETTE",
  SLOT: "SLOT",
  RANDOM_PICKER: "RANDOM_PICKER",
} as const;

export const ParticipantSource = {
  MANUAL: "MANUAL",
  CSV: "CSV",
  API: "API",
} as const;

export const ExecutionStatus = {
  PENDING: "PENDING",
  VALIDATING: "VALIDATING",
  IN_PROGRESS: "IN_PROGRESS",
  EMITTING_RESULT: "EMITTING_RESULT",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  ABORTED: "ABORTED",
} as const;

export const PaymentStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  PENDING: "PENDING",
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];
export type SubscriptionStatusValue =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
export type RaffleStateValue = (typeof RaffleState)[keyof typeof RaffleState];
export type RaffleTypeValue = (typeof RaffleType)[keyof typeof RaffleType];
export type ParticipantSourceValue =
  (typeof ParticipantSource)[keyof typeof ParticipantSource];
export type ExecutionStatusValue =
  (typeof ExecutionStatus)[keyof typeof ExecutionStatus];
export type PaymentStatusValue =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];
