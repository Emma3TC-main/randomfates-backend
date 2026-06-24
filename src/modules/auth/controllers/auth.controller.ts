import type { Request, Response } from "express";
import { successResponse } from "../../../shared/dto/api-response";
import { UnauthorizedException } from "../../../shared/exceptions/http.exception";
import { authService } from "../services/auth.service";
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resendOtpSchema,
  verifyOtpSchema,
} from "../validators/auth.schemas";

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const input = registerSchema.parse(req.body);
    const data = await authService.register(input);
    res
      .status(201)
      .json(successResponse("Usuario registrado correctamente", data));
  },

  async login(req: Request, res: Response): Promise<void> {
    const input = loginSchema.parse(req.body);
    const data = await authService.login(input);
    res.json(successResponse("Login correcto", data));
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const input = refreshSchema.parse(req.body);
    const data = await authService.refresh(input.refreshToken);
    res.json(successResponse("Token renovado", data));
  },

  async logout(req: Request, res: Response): Promise<void> {
    if (!req.authUser) throw new UnauthorizedException();
    const input = logoutSchema.parse(req.body ?? {});
    const data = await authService.logout(req.authUser.id, input.refreshToken);
    res.json(successResponse("Sesión cerrada", data));
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.authUser) throw new UnauthorizedException();
    const user = await authService.me(req.authUser.id);
    res.json(successResponse("Usuario autenticado", user));
  },

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const input = verifyOtpSchema.parse(req.body);
    const data = await authService.verifyOtp(input);
    res.json(successResponse("OTP verificado correctamente", data));
  },

  async resendOtp(req: Request, res: Response): Promise<void> {
    const input = resendOtpSchema.parse(req.body);
    const data = await authService.resendOtp(input);
    res.json(successResponse("OTP reenviado correctamente", data));
  },
};
