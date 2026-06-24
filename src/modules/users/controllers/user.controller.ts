import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { userService } from "../services/user.service";
import {
  listUsersQuerySchema,
  updateUserStatusSchema,
} from "../validators/user.schemas";

import { auditService } from "../../audit/services/audit.service";
import { idParamSchema } from "../../../shared/validators/common.schemas";

export const userController = {
  async list(req: Request, res: Response): Promise<void> {
    const query = listUsersQuerySchema.parse(req.query);
    const data = await userService.list(query);
    res.json(
      successResponse("Usuarios obtenidos", data.items, {
        pagination: data.pagination,
      }),
    );
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = idParamSchema.parse(req.params);
    const data = await userService.getById(id);
    res.json(successResponse("Usuario obtenido", data));
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const input = updateUserStatusSchema.parse(req.body);

    const { id } = idParamSchema.parse(req.params);
    const data = await userService.updateStatus(id, input);

    void auditService
      .register({
        userId: req.authUser?.id,
        entityType: "User",
        entityId: data.id,
        action: "ADMIN_UPDATE_USER_STATUS",
        payload: {
          targetUserId: data.id,
          changes: input,
        },
        req,
      })
      .catch(console.error);

    res.json(successResponse("Usuario actualizado", data));
  },
};
