import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { JWTPayload } from '../types/index.js';

declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ success: false, error: 'No token provided' });
            return;
        }

        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
}

export function generateToken(payload: JWTPayload): string {
    // @ts-ignore - config.jwt.expire is compatible with expiresIn
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expire
    });
}
