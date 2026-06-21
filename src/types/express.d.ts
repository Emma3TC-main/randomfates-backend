import type { UserRoleValue } from "../shared/enums/domain.enums";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
        role: UserRoleValue;
        subscriptionStatus: string;
      };
    }
  }
}

export {};
