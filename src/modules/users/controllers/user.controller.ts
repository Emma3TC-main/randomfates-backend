import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { userService } from "../services/user.service";
import {
  listUsersQuerySchema,
  updateUserStatusSchema,
} from "../validators/user.schemas";

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
    const data = await userService.getById(String(req.params.id));
    res.json(successResponse("Usuario obtenido", data));
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const input = updateUserStatusSchema.parse(req.body);
    const data = await userService.updateStatus(String(req.params.id), input);
    res.json(successResponse("Usuario actualizado", data));
  },
};
