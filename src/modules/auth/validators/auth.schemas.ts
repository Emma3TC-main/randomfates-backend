import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Correo inválido").toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Correo inválido").toLowerCase(),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(20).optional(),
});

export const verifyOtpSchema = z.object({
  challengeToken: z.string().min(32, "Challenge token inválido"),
  otp: z.string().regex(/^\d{6}$/, "El OTP debe tener 6 dígitos"),
});

export const resendOtpSchema = z.object({
  challengeToken: z.string().min(32, "Challenge token inválido"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
