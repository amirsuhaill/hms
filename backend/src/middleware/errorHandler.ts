import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}

export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): void {
    console.error('Error:', err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ success: false, error: err.message });
        return;
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
}
