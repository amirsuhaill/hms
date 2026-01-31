import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createUserSchema, updateUserSchema, createStaffSchema, updateStaffSchema } from '../middleware/schemas.js';
import { User, Staff, ApiResponse } from '../types/index.js';
import { config } from '../config/env.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create User
 *     description: Create a new system user (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [ADMIN, STAFF, DOCTOR, PATIENT]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created
 *       403:
 *         description: Only admins can create users
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createUserSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Only admins can create users',
            } as ApiResponse<null>);
            return;
        }

        const { email, password, role, is_active } = req.body;

        const existingUser = await Database.queryOne(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'Email already exists',
            } as ApiResponse<null>);
            return;
        }

        const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);

        const user = await Database.queryOne<User>(
            `INSERT INTO users (email, password_hash, role, is_active)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [email, passwordHash, role, is_active]
        );

        res.status(201).json({
            success: true,
            data: {
                id: user?.id,
                email: user?.email,
                role: user?.role,
                is_active: user?.is_active,
                created_at: user?.created_at,
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get All Users
 *     description: Retrieve list of all system users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Only admins can view users
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Only admins can view users',
            } as ApiResponse<null>);
            return;
        }

        const { role, page = 1, limit = 10 } = req.query;
        const offset = ((Number(page) - 1) * Number(limit));

        let query = 'SELECT id, email, role, is_active, created_at FROM users WHERE 1=1';
        const values: any[] = [];

        if (role) {
            query += ' AND role = $' + (values.length + 1);
            values.push(role);
        }

        const countResult = await Database.queryOne<{ count: number }>(
            query.replace('SELECT id, email, role, is_active, created_at', 'SELECT COUNT(*) as count'),
            values
        );

        const users = await Database.queryMany(
            query + ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            [...values, limit, offset]
        );

        res.json({
            success: true,
            data: users,
            pagination: {
                total: countResult?.count || 0,
                page: Number(page),
                limit: Number(limit),
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await Database.queryOne<User>(
            'SELECT id, email, role, is_active, created_at FROM users WHERE id = $1',
            [id]
        );

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: user,
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', authMiddleware, validateRequest(updateUserSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN' && req.user?.userId !== Number(req.params.id)) {
            res.status(403).json({
                success: false,
                error: 'Unauthorized',
            } as ApiResponse<null>);
            return;
        }

        const { id } = req.params;
        const { email, is_active } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(email);
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(is_active);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const user = await Database.queryOne<User>(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// DELETE /api/users/:id - Soft delete user
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Only admins can delete users',
            } as ApiResponse<null>);
            return;
        }

        const { id } = req.params;

        await Database.query(
            'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'User deactivated successfully',
        } as ApiResponse<null>);
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// POST /api/staff - Create staff member
router.post('/staff', authMiddleware, validateRequest(createStaffSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Only admins can create staff',
            } as ApiResponse<null>);
            return;
        }

        const { user_id, staff_type, department_id } = req.body;

        const staff = await Database.queryOne<Staff>(
            `INSERT INTO staff (user_id, staff_type, department_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [user_id, staff_type, department_id]
        );

        res.status(201).json({
            success: true,
            data: staff,
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// GET /api/staff - Get all staff
router.get('/staff', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { department_id, staff_type } = req.query;

        let query = 'SELECT * FROM staff WHERE 1=1';
        const values: any[] = [];

        if (department_id) {
            query += ' AND department_id = $' + (values.length + 1);
            values.push(department_id);
        }

        if (staff_type) {
            query += ' AND staff_type = $' + (values.length + 1);
            values.push(staff_type);
        }

        const staff = await Database.queryMany(query, values);

        res.json({
            success: true,
            data: staff,
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// PUT /api/staff/:id - Update staff member
router.put('/staff/:id', authMiddleware, validateRequest(updateStaffSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({
                success: false,
                error: 'Only admins can update staff',
            } as ApiResponse<null>);
            return;
        }

        const { id } = req.params;
        const { staff_type, department_id } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (staff_type !== undefined) {
            updates.push(`staff_type = $${paramCount++}`);
            values.push(staff_type);
        }

        if (department_id !== undefined) {
            updates.push(`department_id = $${paramCount++}`);
            values.push(department_id);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const staff = await Database.queryOne<Staff>(
            `UPDATE staff SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!staff) {
            res.status(404).json({
                success: false,
                error: 'Staff not found',
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: staff,
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Update staff error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

export default router;
