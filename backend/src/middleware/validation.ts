import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const messages = error.details.map((detail) => detail.message);
            res.status(400).json({ success: false, error: 'Validation failed', details: messages });
            return;
        }

        req.body = value;
        next();
    };
}
