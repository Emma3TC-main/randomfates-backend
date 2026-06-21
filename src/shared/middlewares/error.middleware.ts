import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpException } from "../exceptions/http.exception";
import { errorResponse } from "../dto/api-response";
import { isProduction } from "../../config/env";

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new HttpException(
      404,
      `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      "ROUTE_NOT_FOUND",
    ),
  );
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res
      .status(400)
      .json(
        errorResponse("Error de validación", "VALIDATION_ERROR", err.issues),
      );
    return;
  }

  if (err instanceof HttpException) {
    res
      .status(err.statusCode)
      .json(errorResponse(err.message, err.code, err.details));
    return;
  }

  const message =
    err instanceof Error ? err.message : "Error interno del servidor";
  res
    .status(500)
    .json(
      errorResponse(
        isProduction ? "Error interno del servidor" : message,
        "INTERNAL_SERVER_ERROR",
        isProduction ? undefined : err,
      ),
    );
};
