import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createPatientSchema, updatePatientSchema } from '../middleware/schemas.js';
import { Patient, ApiResponse } from '../types/index.js';

const router = Router();

// Generate MRN
const generateMRN = async (): Promise<string> => {
    const year = new Date().getFullYear();
    const result = await Database.queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM patients WHERE hospital_mrn LIKE $1`,
        [`HMS-%-${year}`]
    );
    const count = (result?.count || 0) + 1;
    return `HMS-${String(count).padStart(3, '0')}-${year}`;
};

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Register New Patient
 *     description: Create a new patient record with personal and emergency contact information
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - dob
 *               - gender
 *               - phone
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-15
 *               gender:
 *                 type: string
 *                 enum: [M, F, Other]
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               blood_group:
 *                 type: string
 *                 example: O+
 *               emergency_name:
 *                 type: string
 *               emergency_phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createPatientSchema), async (req: Request, res: Response) => {
    try {
        const { first_name, last_name, dob, gender, phone, email, address, blood_group, emergency_name, emergency_phone } = req.body;

        const mrn = await generateMRN();

        const patient = await Database.queryOne<Patient>(
            `INSERT INTO patients (hospital_mrn, first_name, last_name, dob, gender, phone, email, address, blood_group, emergency_name, emergency_phone, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [mrn, first_name, last_name, dob, gender, phone, email, address, blood_group, emergency_name, emergency_phone, req.user?.userId]
        );

        res.status(201).json({
            success: true,
            data: patient,
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Create patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get All Patients
 *     description: Retrieve list of all patients with pagination and search support
 *     tags:
 *       - Patients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by first name, last name, or MRN
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of patients
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const offset = ((Number(page) - 1) * Number(limit));

        let query = 'SELECT * FROM patients WHERE 1=1';
        const values: any[] = [];

        if (search) {
            query += ` AND (first_name ILIKE $${values.length + 1} OR last_name ILIKE $${values.length + 1} OR hospital_mrn ILIKE $${values.length + 1})`;
            values.push(`%${search}%`);
        }

        const countResult = await Database.queryOne<{ count: number }>(
            query.replace('SELECT *', 'SELECT COUNT(*) as count'),
            values
        );

        const patients = await Database.queryMany(
            query + ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            [...values, limit, offset]
        );

        res.json({
            success: true,
            data: patients,
            pagination: {
                total: countResult?.count || 0,
                page: Number(page),
                limit: Number(limit),
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get Patient Details
 *     description: Retrieve detailed information for a specific patient including visits and appointments
 *     tags:
 *       - Patients
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
 *         description: Patient details
 *       404:
 *         description: Patient not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const patient = await Database.queryOne<Patient>(
            'SELECT * FROM patients WHERE id = $1',
            [id]
        );

        if (!patient) {
            res.status(404).json({
                success: false,
                error: 'Patient not found',
            } as ApiResponse<null>);
            return;
        }

        const appointments = await Database.queryMany(
            'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY scheduled_datetime DESC LIMIT 10',
            [id]
        );

        const visits = await Database.queryMany(
            'SELECT * FROM visits WHERE patient_id = $1 ORDER BY visit_started_at DESC LIMIT 10',
            [id]
        );

        const invoices = await Database.queryMany(
            'SELECT * FROM invoices WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 10',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...patient,
                appointments,
                visits,
                invoices,
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', authMiddleware, validateRequest(updatePatientSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone, email, address, blood_group, emergency_name, emergency_phone } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (first_name !== undefined) {
            updates.push(`first_name = $${paramCount++}`);
            values.push(first_name);
        }
        if (last_name !== undefined) {
            updates.push(`last_name = $${paramCount++}`);
            values.push(last_name);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone);
        }
        if (email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(email);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramCount++}`);
            values.push(address);
        }
        if (blood_group !== undefined) {
            updates.push(`blood_group = $${paramCount++}`);
            values.push(blood_group);
        }
        if (emergency_name !== undefined) {
            updates.push(`emergency_name = $${paramCount++}`);
            values.push(emergency_name);
        }
        if (emergency_phone !== undefined) {
            updates.push(`emergency_phone = $${paramCount++}`);
            values.push(emergency_phone);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const patient = await Database.queryOne<Patient>(
            `UPDATE patients SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!patient) {
            res.status(404).json({
                success: false,
                error: 'Patient not found',
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: patient,
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// GET /api/patients/search - Search patient by MRN or phone
router.get('/search', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { mrn, phone } = req.query;

        let query = 'SELECT * FROM patients WHERE 1=1';
        const values: any[] = [];

        if (mrn) {
            query += ' AND hospital_mrn = $' + (values.length + 1);
            values.push(mrn);
        }

        if (phone) {
            query += ' AND phone = $' + (values.length + 1);
            values.push(phone);
        }

        const patient = await Database.queryOne<Patient>(query, values);

        if (!patient) {
            res.status(404).json({
                success: false,
                error: 'Patient not found',
            } as ApiResponse<null>);
            return;
        }

        res.json({
            success: true,
            data: patient,
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Search patient error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

// GET /api/patients/:id/medical-history - Get patient medical history
router.get('/:id/medical-history', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const visits = await Database.queryMany(
            'SELECT * FROM visits WHERE patient_id = $1 ORDER BY visit_started_at DESC',
            [id]
        );

        const diagnoses = await Database.queryMany(
            `SELECT d.* FROM diagnoses d
             JOIN visits v ON d.visit_id = v.id
             WHERE v.patient_id = $1
             ORDER BY d.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                visits,
                diagnoses,
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get medical history error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        } as ApiResponse<null>);
    }
});

export default router;
