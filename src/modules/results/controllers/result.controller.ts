import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { UnauthorizedException } from "../../../shared/exceptions/http.exception";
import { resultService } from "../services/result.service";

const requireUser = (req: Request) => {
  if (!req.authUser) throw new UnauthorizedException();
  return req.authUser;
};

export const resultController = {
  async getById(req: Request, res: Response): Promise<void> {
    const user = requireUser(req);
    const data = await resultService.getById(
      String(req.params.id),
      user.id,
      user.role,
    );
    res.json(successResponse("Resultado obtenido", data));
  },

  async getPublicByHash(req: Request, res: Response): Promise<void> {
    const data = await resultService.getPublicByHash(
      String(req.params.verificationHash),
    );
    res.json(successResponse("Resultado público obtenido", data));
  },

  async verify(req: Request, res: Response): Promise<void> {
    const data = await resultService.verify(
      String(req.params.verificationHash),
    );
    res.json(successResponse("Resultado verificado", data));
  },
};
