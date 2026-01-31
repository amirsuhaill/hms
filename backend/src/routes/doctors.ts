import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createDoctorSchema, updateDoctorSchema } from '../middleware/schemas.js';
import { Doctor, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create Doctor Profile
 *     description: Create a new doctor profile (Admin only)
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - registration_no
 *               - specialization
 *               - consult_fee
 *             properties:
 *               user_id:
 *                 type: integer
 *               registration_no:
 *                 type: string
 *               specialization:
 *                 type: string
 *               department_id:
 *                 type: integer
 *               consult_fee:
 *                 type: number
 *               experience_years:
 *                 type: integer
 *               signature_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor profile created
 *       403:
 *         description: Only admins can create doctors
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createDoctorSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Only admins can create doctors' } as ApiResponse<null>);
            return;
        }

        const { user_id, registration_no, specialization, department_id, consult_fee, experience_years, signature_url } = req.body;

        const doctor = await Database.queryOne<Doctor>(
            `INSERT INTO doctors (user_id, registration_no, specialization, department_id, consult_fee, experience_years, signature_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [user_id, registration_no, specialization, department_id, consult_fee, experience_years, signature_url]
        );

        res.status(201).json({ success: true, data: doctor } as ApiResponse<any>);
    } catch (error) {
        console.error('Create doctor error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get All Doctors
 *     description: Retrieve list of all doctors with optional filtering by department or specialization
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of doctors
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { department_id, specialization } = req.query;

        let query = `SELECT d.*, u.email, dep.name as department_name FROM doctors d
                     JOIN users u ON d.user_id = u.id
                     LEFT JOIN departments dep ON d.department_id = dep.id
                     WHERE 1=1`;
        const values: any[] = [];

        if (department_id) {
            query += ' AND d.department_id = $' + (values.length + 1);
            values.push(department_id);
        }

        if (specialization) {
            query += ' AND d.specialization ILIKE $' + (values.length + 1);
            values.push(`%${specialization}%`);
        }

        const doctors = await Database.queryMany(query, values);

        res.json({ success: true, data: doctors } as ApiResponse<any>);
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/doctors/profile - Get current doctor profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'DOCTOR') {
            res.status(403).json({ success: false, error: 'Only doctors can access this endpoint' } as ApiResponse<null>);
            return;
        }

        const doctor = await Database.queryOne<any>(
            `SELECT d.*, u.email, dep.name as department_name FROM doctors d
             JOIN users u ON d.user_id = u.id
             LEFT JOIN departments dep ON d.department_id = dep.id
             WHERE d.user_id = $1`,
            [req.user.userId]
        );

        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor profile not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: doctor } as ApiResponse<any>);
    } catch (error) {
        console.error('Get doctor profile error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/doctors/:id - Get doctor profile
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const doctor = await Database.queryOne<any>(
            `SELECT d.*, u.email, dep.name as department_name FROM doctors d
             JOIN users u ON d.user_id = u.id
             LEFT JOIN departments dep ON d.department_id = dep.id
             WHERE d.id = $1`,
            [id]
        );

        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: doctor } as ApiResponse<any>);
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/doctors/:id - Update doctor profile
router.put('/:id', authMiddleware, validateRequest(updateDoctorSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { specialization, department_id, consult_fee, experience_years, signature_url } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (specialization !== undefined) {
            updates.push(`specialization = $${paramCount++}`);
            values.push(specialization);
        }
        if (department_id !== undefined) {
            updates.push(`department_id = $${paramCount++}`);
            values.push(department_id);
        }
        if (consult_fee !== undefined) {
            updates.push(`consult_fee = $${paramCount++}`);
            values.push(consult_fee);
        }
        if (experience_years !== undefined) {
            updates.push(`experience_years = $${paramCount++}`);
            values.push(experience_years);
        }
        if (signature_url !== undefined) {
            updates.push(`signature_url = $${paramCount++}`);
            values.push(signature_url);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const doctor = await Database.queryOne<Doctor>(
            `UPDATE doctors SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!doctor) {
            res.status(404).json({ success: false, error: 'Doctor not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: doctor } as ApiResponse<any>);
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
