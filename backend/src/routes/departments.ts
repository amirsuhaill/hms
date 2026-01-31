import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../middleware/schemas.js';
import { Department, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create Department
 *     description: Create a new hospital department (Admin only)
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               floor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created
 *       403:
 *         description: Only admins can create departments
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createDepartmentSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Only admins can create departments' } as ApiResponse<null>);
            return;
        }

        const { name, code, floor } = req.body;

        const dept = await Database.queryOne<Department>(
            `INSERT INTO departments (name, code, floor) VALUES ($1, $2, $3) RETURNING *`,
            [name, code, floor]
        );

        res.status(201).json({ success: true, data: dept } as ApiResponse<any>);
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get All Departments
 *     description: Retrieve list of all hospital departments
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const depts = await Database.queryMany('SELECT * FROM departments ORDER BY name');
        res.json({ success: true, data: depts } as ApiResponse<any>);
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get Department Details
 *     description: Retrieve detailed information for a specific department
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Department details
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const dept = await Database.queryOne<Department>('SELECT * FROM departments WHERE id = $1', [id]);

        if (!dept) {
            res.status(404).json({ success: false, error: 'Department not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: dept } as ApiResponse<any>);
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/departments/:id - Update department
router.put('/:id', authMiddleware, validateRequest(updateDepartmentSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Only admins can update departments' } as ApiResponse<null>);
            return;
        }

        const { id } = req.params;
        const { name, code, floor } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (code !== undefined) {
            updates.push(`code = $${paramCount++}`);
            values.push(code);
        }
        if (floor !== undefined) {
            updates.push(`floor = $${paramCount++}`);
            values.push(floor);
        }

        values.push(id);

        const dept = await Database.queryOne<Department>(
            `UPDATE departments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!dept) {
            res.status(404).json({ success: false, error: 'Department not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: dept } as ApiResponse<any>);
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
