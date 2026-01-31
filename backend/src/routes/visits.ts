import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createVisitSchema, updateVisitSchema, createPrecheckSchema } from '../middleware/schemas.js';
import { Visit, Precheck, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/visits:
 *   post:
 *     summary: Start Patient Visit
 *     description: Create a new patient visit record (OPD or IPD)
 *     tags:
 *       - Visits
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
 *               - visit_type
 *             properties:
 *               appointment_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               visit_type:
 *                 type: string
 *                 enum: [OPD, IPD]
 *               chief_complaint:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visit created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createVisitSchema), async (req: Request, res: Response) => {
    try {
        const { appointment_id, patient_id, doctor_id, visit_type, chief_complaint } = req.body;

        const visit = await Database.queryOne<Visit>(
            `INSERT INTO visits (appointment_id, patient_id, doctor_id, visit_type, visit_started_at, chief_complaint)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
             RETURNING *`,
            [appointment_id, patient_id, doctor_id, visit_type, chief_complaint]
        );

        res.status(201).json({ success: true, data: visit } as ApiResponse<any>);
    } catch (error) {
        console.error('Create visit error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/visits/{id}:
 *   put:
 *     summary: Update Visit with SOAP Notes
 *     description: Add SOAP notes and complete a patient visit
 *     tags:
 *       - Visits
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
 *               notes_soap:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Visit updated successfully
 *       404:
 *         description: Visit not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authMiddleware, validateRequest(updateVisitSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { notes_soap, chief_complaint } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (notes_soap !== undefined) {
            updates.push(`notes_soap = $${paramCount++}`);
            values.push(notes_soap);
        }
        if (chief_complaint !== undefined) {
            updates.push(`chief_complaint = $${paramCount++}`);
            values.push(chief_complaint);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const visit = await Database.queryOne<Visit>(
            `UPDATE visits SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!visit) {
            res.status(404).json({ success: false, error: 'Visit not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: visit } as ApiResponse<any>);
    } catch (error) {
        console.error('Update visit error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/visits/:id/complete - End visit
router.put('/:id/complete', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { notes_soap } = req.body;

        const visit = await Database.queryOne<Visit>(
            `UPDATE visits SET status = 'COMPLETED', visit_ended_at = CURRENT_TIMESTAMP, notes_soap = COALESCE($1, notes_soap), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [notes_soap, id]
        );

        if (!visit) {
            res.status(404).json({ success: false, error: 'Visit not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: visit } as ApiResponse<any>);
    } catch (error) {
        console.error('Complete visit error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/visits/:id - Get visit details
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const visit = await Database.queryOne<any>(
            `SELECT v.*, p.first_name, p.last_name, d.specialization FROM visits v
             JOIN patients p ON v.patient_id = p.id
             JOIN doctors d ON v.doctor_id = d.id
             WHERE v.id = $1`,
            [id]
        );

        if (!visit) {
            res.status(404).json({ success: false, error: 'Visit not found' } as ApiResponse<null>);
            return;
        }

        const diagnoses = await Database.queryMany('SELECT * FROM diagnoses WHERE visit_id = $1', [id]);
        const findings = await Database.queryMany('SELECT * FROM clinical_findings WHERE appointment_id = $1', [visit.appointment_id]);
        const precheck = await Database.queryOne('SELECT * FROM prechecks WHERE appointment_id = $1 ORDER BY created_at DESC LIMIT 1', [visit.appointment_id]);

        res.json({ success: true, data: { ...visit, diagnoses, findings, precheck } } as ApiResponse<any>);
    } catch (error) {
        console.error('Get visit error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// POST /api/prechecks - Record precheck/vitals
router.post('/prechecks', authMiddleware, validateRequest(createPrecheckSchema), async (req: Request, res: Response) => {
    try {
        const { appointment_id, height_cm, weight_kg, temperature_c, pulse_rate, systolic_bp, diastolic_bp, spo2, notes } = req.body;

        const precheck = await Database.queryOne<Precheck>(
            `INSERT INTO prechecks (appointment_id, recorded_by, height_cm, weight_kg, temperature_c, pulse_rate, systolic_bp, diastolic_bp, spo2, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [appointment_id, req.user?.userId, height_cm, weight_kg, temperature_c, pulse_rate, systolic_bp, diastolic_bp, spo2, notes]
        );

        res.status(201).json({ success: true, data: precheck } as ApiResponse<any>);
    } catch (error) {
        console.error('Create precheck error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/prechecks/appointment/:appointment_id - Get latest precheck
router.get('/prechecks/appointment/:appointment_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { appointment_id } = req.params;

        const precheck = await Database.queryOne<Precheck>(
            'SELECT * FROM prechecks WHERE appointment_id = $1 ORDER BY created_at DESC LIMIT 1',
            [appointment_id]
        );

        if (!precheck) {
            res.status(404).json({ success: false, error: 'Precheck not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: precheck } as ApiResponse<any>);
    } catch (error) {
        console.error('Get precheck error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/visits/patient/:patient_id - Get visit history
router.get('/patient/:patient_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.params;
        const { limit = 10 } = req.query;

        const visits = await Database.queryMany(
            `SELECT v.*, d.specialization FROM visits v
             JOIN doctors d ON v.doctor_id = d.id
             WHERE v.patient_id = $1
             ORDER BY v.visit_started_at DESC
             LIMIT $2`,
            [patient_id, limit]
        );

        res.json({ success: true, data: visits } as ApiResponse<any>);
    } catch (error) {
        console.error('Get visit history error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
