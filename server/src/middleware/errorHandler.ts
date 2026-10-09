import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]`, err.message || err);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
