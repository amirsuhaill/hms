import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createDiagnosisSchema, updateDiagnosisSchema } from '../middleware/schemas.js';
import { Diagnosis, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/diagnoses:
 *   post:
 *     summary: Add Diagnosis
 *     description: Add a diagnosis record to a patient visit
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visit_id
 *               - code
 *               - description
 *             properties:
 *               visit_id:
 *                 type: integer
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               is_primary:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Diagnosis added
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createDiagnosisSchema), async (req: Request, res: Response) => {
    try {
        const { visit_id, code, description, is_primary } = req.body;

        const diagnosis = await Database.queryOne<Diagnosis>(
            `INSERT INTO diagnoses (visit_id, code, description, is_primary)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [visit_id, code, description, is_primary]
        );

        res.status(201).json({ success: true, data: diagnosis } as ApiResponse<any>);
    } catch (error) {
        console.error('Create diagnosis error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/diagnoses/visit/{visit_id}:
 *   get:
 *     summary: Get Diagnoses for Visit
 *     description: Retrieve all diagnoses for a specific patient visit
 *     tags:
 *       - Diagnoses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: visit_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of diagnoses
 *       401:
 *         description: Unauthorized
 */
router.get('/visit/:visit_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { visit_id } = req.params;

        const diagnoses = await Database.queryMany(
            'SELECT * FROM diagnoses WHERE visit_id = $1 ORDER BY is_primary DESC, created_at DESC',
            [visit_id]
        );

        res.json({ success: true, data: diagnoses } as ApiResponse<any>);
    } catch (error) {
        console.error('Get diagnoses error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/diagnoses/:id - Update diagnosis
router.put('/:id', authMiddleware, validateRequest(updateDiagnosisSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, description, is_primary } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (code !== undefined) {
            updates.push(`code = $${paramCount++}`);
            values.push(code);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }
        if (is_primary !== undefined) {
            updates.push(`is_primary = $${paramCount++}`);
            values.push(is_primary);
        }

        values.push(id);

        const diagnosis = await Database.queryOne<Diagnosis>(
            `UPDATE diagnoses SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!diagnosis) {
            res.status(404).json({ success: false, error: 'Diagnosis not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: diagnosis } as ApiResponse<any>);
    } catch (error) {
        console.error('Update diagnosis error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
