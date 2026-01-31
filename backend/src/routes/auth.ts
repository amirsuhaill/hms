import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Database } from '../db/queries.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { loginSchema } from '../middleware/schemas.js';
import { User, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticate user with email and password to receive JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@hms.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         is_active:
 *                           type: boolean
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User account is inactive
 */
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await Database.queryOne<User>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            } as ApiResponse<null>);
            return;
        }

        if (!user.is_active) {
            res.status(403).json({
                success: false,
                error: 'User account is inactive',
            } as ApiResponse<null>);
            return;
        }

        // Update last login
        await Database.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active,
                },
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User Logout
 *     description: Logout the authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authMiddleware, (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
    } as ApiResponse<null>);
});

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh JWT Token
 *     description: Generate a new JWT token using existing valid token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.post('/refresh-token', authMiddleware, (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'No user in request',
            } as ApiResponse<null>);
            return;
        }

        const token = generateToken({
            userId: req.user.userId,
            email: req.user.email,
            role: req.user.role,
        });

        res.json({
            success: true,
            data: { token },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

export default router;
