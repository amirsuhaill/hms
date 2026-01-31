import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createToothNodeSchema, updateToothNodeSchema } from '../middleware/schemas.js';
import { ToothNode, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/tooth-nodes:
 *   post:
 *     summary: Create Tooth Node
 *     description: Create a dental tooth node record for an appointment
 *     tags:
 *       - Dental
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointment_id
 *               - tooth_number
 *             properties:
 *               appointment_id:
 *                 type: integer
 *               tooth_number:
 *                 type: string
 *               surface:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tooth node created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createToothNodeSchema), async (req: Request, res: Response) => {
    try {
        const { appointment_id, tooth_number, surface, status } = req.body;

        const node = await Database.queryOne<ToothNode>(
            `INSERT INTO tooth_nodes (appointment_id, tooth_number, surface, status, created_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [appointment_id, tooth_number, surface, status, req.user?.userId]
        );

        res.status(201).json({ success: true, data: node } as ApiResponse<any>);
    } catch (error) {
        console.error('Create tooth node error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/tooth-nodes/appointment/{appointment_id}:
 *   get:
 *     summary: Get Tooth Nodes for Appointment
 *     description: Retrieve all tooth nodes for a specific dental appointment
 *     tags:
 *       - Dental
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointment_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of tooth nodes
 *       401:
 *         description: Unauthorized
 */
router.get('/appointment/:appointment_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { appointment_id } = req.params;

        const nodes = await Database.queryMany(
            'SELECT * FROM tooth_nodes WHERE appointment_id = $1 ORDER BY tooth_number',
            [appointment_id]
        );

        res.json({ success: true, data: nodes } as ApiResponse<any>);
    } catch (error) {
        console.error('Get tooth nodes error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/tooth-nodes/:id - Update tooth node
router.put('/:id', authMiddleware, validateRequest(updateToothNodeSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { surface, status } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (surface !== undefined) {
            updates.push(`surface = $${paramCount++}`);
            values.push(surface);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }

        values.push(id);

        const node = await Database.queryOne<ToothNode>(
            `UPDATE tooth_nodes SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!node) {
            res.status(404).json({ success: false, error: 'Tooth node not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: node } as ApiResponse<any>);
    } catch (error) {
        console.error('Update tooth node error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// DELETE /api/tooth-nodes/:id - Delete tooth node
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await Database.query('DELETE FROM tooth_nodes WHERE id = $1', [id]);

        res.json({ success: true, message: 'Tooth node deleted successfully' } as ApiResponse<null>);
    } catch (error) {
        console.error('Delete tooth node error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
