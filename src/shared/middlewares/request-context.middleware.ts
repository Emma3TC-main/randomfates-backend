import type { NextFunction, Request, Response } from "express";

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.setHeader(
    "X-RandomFates-Request",
    `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  next();
};
