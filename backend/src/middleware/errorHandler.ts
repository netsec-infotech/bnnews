import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'ચકાસણી ભૂલ (Validation Error)',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'સર્વર આંતરિક ભૂલ (Internal Server Error)';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
