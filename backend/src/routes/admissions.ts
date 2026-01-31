import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createAdmissionSchema, dischargePatientSchema } from '../middleware/schemas.js';
import { Admission, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/admissions:
 *   post:
 *     summary: Admit Patient to Ward
 *     description: Create a new patient admission record and assign to a bed
 *     tags:
 *       - Admissions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - doctor_id
 *               - bed_id
 *             properties:
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               visit_id:
 *                 type: integer
 *               bed_id:
 *                 type: integer
 *               admission_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient admitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createAdmissionSchema), async (req: Request, res: Response) => {
    try {
        const { patient_id, doctor_id, visit_id, bed_id, admission_reason } = req.body;

        const admission = await Database.queryOne<Admission>(
            `INSERT INTO admissions (patient_id, doctor_id, visit_id, bed_id, admission_date, admission_reason)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
             RETURNING *`,
            [patient_id, doctor_id, visit_id, bed_id, admission_reason]
        );

        // Update bed status
        await Database.query(
            `UPDATE beds SET status = 'OCCUPIED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [bed_id]
        );

        res.status(201).json({ success: true, data: admission } as ApiResponse<any>);
    } catch (error) {
        console.error('Create admission error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/admissions/{id}/discharge:
 *   put:
 *     summary: Discharge Patient
 *     description: Discharge a patient from hospital and free up the bed
 *     tags:
 *       - Admissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discharge_notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient discharged successfully
 *       404:
 *         description: Admission not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/discharge', authMiddleware, validateRequest(dischargePatientSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { discharge_summary } = req.body;

        const admission = await Database.queryOne<Admission>(
            `UPDATE admissions SET status = 'DISCHARGED', discharge_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );

        if (!admission) {
            res.status(404).json({ success: false, error: 'Admission not found' } as ApiResponse<null>);
            return;
        }

        // Update bed status
        await Database.query(
            `UPDATE beds SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [admission.bed_id]
        );

        res.json({ success: true, data: admission } as ApiResponse<any>);
    } catch (error) {
        console.error('Discharge patient error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/admissions/patient/:patient_id - Get patient admission history
router.get('/patient/:patient_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.params;

        const admissions = await Database.queryMany(
            `SELECT a.*, b.bed_number, w.name as ward_name FROM admissions a
             JOIN beds b ON a.bed_id = b.id
             JOIN wards w ON b.ward_id = w.id
             WHERE a.patient_id = $1
             ORDER BY a.admission_date DESC`,
            [patient_id]
        );

        res.json({ success: true, data: admissions } as ApiResponse<any>);
    } catch (error) {
        console.error('Get admission history error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
