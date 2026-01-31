import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createClinicalFindingSchema, updateClinicalFindingSchema } from '../middleware/schemas.js';
import { ClinicalFinding, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/clinical-findings:
 *   post:
 *     summary: Add Clinical Findings
 *     description: Record clinical findings and observations for an appointment
 *     tags:
 *       - Clinical
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
 *               - doctor_id
 *               - summary
 *             properties:
 *               appointment_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               summary:
 *                 type: string
 *               detailed_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Clinical finding recorded
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createClinicalFindingSchema), async (req: Request, res: Response) => {
    try {
        const { appointment_id, doctor_id, summary, detailed_notes } = req.body;

        const finding = await Database.queryOne<ClinicalFinding>(
            `INSERT INTO clinical_findings (appointment_id, doctor_id, summary, detailed_notes)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [appointment_id, doctor_id, summary, detailed_notes]
        );

        res.status(201).json({ success: true, data: finding } as ApiResponse<any>);
    } catch (error) {
        console.error('Create clinical finding error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/clinical-findings/appointment/{appointment_id}:
 *   get:
 *     summary: Get Clinical Findings for Appointment
 *     description: Retrieve all clinical findings for a specific appointment
 *     tags:
 *       - Clinical
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
 *         description: List of clinical findings
 *       401:
 *         description: Unauthorized
 */
router.get('/appointment/:appointment_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { appointment_id } = req.params;

        const finding = await Database.queryOne<ClinicalFinding>(
            'SELECT * FROM clinical_findings WHERE appointment_id = $1',
            [appointment_id]
        );

        if (!finding) {
            res.status(404).json({ success: false, error: 'Clinical findings not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: finding } as ApiResponse<any>);
    } catch (error) {
        console.error('Get clinical findings error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/clinical-findings/:id - Update findings
router.put('/:id', authMiddleware, validateRequest(updateClinicalFindingSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { summary, detailed_notes } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (summary !== undefined) {
            updates.push(`summary = $${paramCount++}`);
            values.push(summary);
        }
        if (detailed_notes !== undefined) {
            updates.push(`detailed_notes = $${paramCount++}`);
            values.push(detailed_notes);
        }

        values.push(id);

        const finding = await Database.queryOne<ClinicalFinding>(
            `UPDATE clinical_findings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!finding) {
            res.status(404).json({ success: false, error: 'Clinical finding not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: finding } as ApiResponse<any>);
    } catch (error) {
        console.error('Update clinical finding error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
