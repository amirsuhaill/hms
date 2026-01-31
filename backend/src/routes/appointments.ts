import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createAppointmentSchema, updateAppointmentSchema } from '../middleware/schemas.js';
import { Appointment, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create Appointment
 *     description: Schedule a new appointment between patient and doctor
 *     tags:
 *       - Appointments
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
 *               - scheduled_datetime
 *               - visit_type
 *             properties:
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               scheduled_datetime:
 *                 type: string
 *                 format: date-time
 *               visit_type:
 *                 type: string
 *                 enum: [OPD, FOLLOW_UP, EMERGENCY]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createAppointmentSchema), async (req: Request, res: Response) => {
    try {
        const { patient_id, doctor_id, scheduled_datetime, visit_type, reason } = req.body;

        const appt = await Database.queryOne<Appointment>(
            `INSERT INTO appointments (patient_id, doctor_id, scheduled_datetime, visit_type, reason, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [patient_id, doctor_id, scheduled_datetime, visit_type, reason, req.user?.userId]
        );

        res.status(201).json({ success: true, data: appt } as ApiResponse<any>);
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get All Appointments
 *     description: Retrieve list of appointments with filtering and pagination
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, COMPLETED, CANCELLED, NO_SHOW]
 *       - in: query
 *         name: doctor_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: visit_type
 *         schema:
 *           type: string
 *           enum: [OPD, FOLLOW_UP, EMERGENCY]
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of appointments
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { status, doctor_id, visit_type, date_from, date_to, page = 1, limit = 10 } = req.query;
        const offset = ((Number(page) - 1) * Number(limit));

        let query = `SELECT a.*, 
                            p.first_name as patient_first_name, 
                            p.last_name as patient_last_name,
                            p.hospital_mrn,
                            d.first_name as doctor_first_name,
                            d.last_name as doctor_last_name,
                            d.specialization
                     FROM appointments a
                     JOIN patients p ON a.patient_id = p.id
                     JOIN doctors d ON a.doctor_id = d.id
                     WHERE 1=1`;
        const values: any[] = [];

        if (status) {
            query += ` AND a.status = $${values.length + 1}`;
            values.push(status);
        }
        if (doctor_id) {
            query += ` AND a.doctor_id = $${values.length + 1}`;
            values.push(doctor_id);
        }
        if (visit_type) {
            query += ` AND a.visit_type = $${values.length + 1}`;
            values.push(visit_type);
        }
        if (date_from) {
            query += ` AND a.scheduled_datetime >= $${values.length + 1}`;
            values.push(date_from);
        }
        if (date_to) {
            query += ` AND a.scheduled_datetime <= $${values.length + 1}`;
            values.push(date_to);
        }

        const countResult = await Database.queryOne<{ count: number }>(
            query.replace('SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, p.hospital_mrn, d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization', 'SELECT COUNT(*) as count'),
            values
        );

        const appts = await Database.queryMany(
            query + ` ORDER BY a.scheduled_datetime DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            [...values, limit, offset]
        );

        // Transform the data to include patient_name and doctor_name for frontend compatibility
        const transformedAppts = appts.map((apt: any) => ({
            ...apt,
            patient_name: `${apt.patient_first_name} ${apt.patient_last_name}`,
            doctor_name: `Dr. ${apt.doctor_first_name} ${apt.doctor_last_name}`
        }));

        res.json({
            success: true,
            data: transformedAppts,
            pagination: { total: countResult?.count || 0, page: Number(page), limit: Number(limit) },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const appt = await Database.queryOne<any>(
            `SELECT a.*, p.first_name, p.last_name, p.hospital_mrn, d.specialization
             FROM appointments a
             JOIN patients p ON a.patient_id = p.id
             JOIN doctors d ON a.doctor_id = d.id
             WHERE a.id = $1`,
            [id]
        );

        if (!appt) {
            res.status(404).json({ success: false, error: 'Appointment not found' } as ApiResponse<null>);
            return;
        }

        const precheck = await Database.queryOne(
            'SELECT * FROM prechecks WHERE appointment_id = $1 ORDER BY created_at DESC LIMIT 1',
            [id]
        );

        res.json({ success: true, data: { ...appt, precheck } } as ApiResponse<any>);
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', authMiddleware, validateRequest(updateAppointmentSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { scheduled_datetime, status, reason } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (scheduled_datetime !== undefined) {
            updates.push(`scheduled_datetime = $${paramCount++}`);
            values.push(scheduled_datetime);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }
        if (reason !== undefined) {
            updates.push(`reason = $${paramCount++}`);
            values.push(reason);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const appt = await Database.queryOne<Appointment>(
            `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!appt) {
            res.status(404).json({ success: false, error: 'Appointment not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: appt } as ApiResponse<any>);
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/appointments/:id/cancel - Cancel appointment
router.put('/:id/cancel', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const appt = await Database.queryOne<Appointment>(
            `UPDATE appointments SET status = 'CANCELLED', reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [reason, id]
        );

        if (!appt) {
            res.status(404).json({ success: false, error: 'Appointment not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: appt } as ApiResponse<any>);
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/appointments/doctor/:doctor_id/schedule - Get doctor's schedule
router.get('/doctor/:doctor_id/schedule', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { doctor_id } = req.params;
        const { date } = req.query;

        let query = `SELECT a.*, p.first_name, p.last_name FROM appointments a
                     JOIN patients p ON a.patient_id = p.id
                     WHERE a.doctor_id = $1 AND a.status != 'CANCELLED'`;
        const values: any[] = [doctor_id];

        if (date) {
            query += ` AND DATE(a.scheduled_datetime) = $${values.length + 1}`;
            values.push(date);
        }

        query += ' ORDER BY a.scheduled_datetime';

        const schedule = await Database.queryMany(query, values);

        res.json({ success: true, data: schedule } as ApiResponse<any>);
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
