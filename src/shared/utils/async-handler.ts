import type { NextFunction, Request, Response } from "express";

export type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = (controller: AsyncController) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void controller(req, res, next).catch(next);
  };
};
