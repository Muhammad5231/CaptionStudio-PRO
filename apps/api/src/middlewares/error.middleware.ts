import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Unhandled API Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload.',
        details: err.flatten().fieldErrors,
        statusCode: 400,
      },
      timestamp: new Date().toISOString(),
    });
  }

  const statusCode = (err as { statusCode?: number })?.statusCode || 500;
  const message =
    statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : (err as Error).message || 'Request failed';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: (err as { code?: string })?.code || 'INTERNAL_SERVER_ERROR',
      message,
      statusCode,
    },
    timestamp: new Date().toISOString(),
  });
}

