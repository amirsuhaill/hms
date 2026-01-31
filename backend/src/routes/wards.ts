import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createWardSchema, createBedsSchema } from '../middleware/schemas.js';
import { Ward, Bed, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/wards:
 *   post:
 *     summary: Create Ward
 *     description: Create a new hospital ward
 *     tags:
 *       - Wards
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
 *               - ward_type
 *               - total_beds
 *             properties:
 *               name:
 *                 type: string
 *               ward_type:
 *                 type: string
 *                 enum: [GENERAL, SEMI_PRIVATE, PRIVATE]
 *               floor:
 *                 type: string
 *               total_beds:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Ward created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createWardSchema), async (req: Request, res: Response) => {
    try {
        const { name, ward_type, floor, total_beds } = req.body;

        const ward = await Database.queryOne<Ward>(
            `INSERT INTO wards (name, ward_type, floor, total_beds)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, ward_type, floor, total_beds]
        );

        res.status(201).json({ success: true, data: ward } as ApiResponse<any>);
    } catch (error) {
        console.error('Create ward error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/wards:
 *   get:
 *     summary: Get All Wards
 *     description: Retrieve list of all hospital wards with bed availability
 *     tags:
 *       - Wards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wards
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { ward_type } = req.query;

        let query = 'SELECT * FROM wards WHERE 1=1';
        const values: any[] = [];

        if (ward_type) {
            query += ' AND ward_type = $' + (values.length + 1);
            values.push(ward_type);
        }

        const wards = await Database.queryMany(query + ' ORDER BY name', values);
        res.json({ success: true, data: wards } as ApiResponse<any>);
    } catch (error) {
        console.error('Get wards error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// POST /api/wards/:ward_id/beds - Create beds for ward
router.post('/:ward_id/beds', authMiddleware, validateRequest(createBedsSchema), async (req: Request, res: Response) => {
    try {
        const { ward_id } = req.params;
        const { bed_numbers } = req.body;

        const beds: Bed[] = [];
        for (const bed_number of bed_numbers) {
            const bed = await Database.queryOne<Bed>(
                `INSERT INTO beds (ward_id, bed_number, status)
                 VALUES ($1, $2, 'AVAILABLE')
                 RETURNING *`,
                [ward_id, bed_number]
            );
            if (bed) {
                beds.push(bed);
            }
        }

        res.status(201).json({ success: true, data: beds } as ApiResponse<any>);
    } catch (error) {
        console.error('Create beds error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/beds - Get available beds
router.get('/beds', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { ward_id, status } = req.query;

        let query = 'SELECT * FROM beds WHERE 1=1';
        const values: any[] = [];

        if (ward_id) {
            query += ' AND ward_id = $' + (values.length + 1);
            values.push(ward_id);
        }

        if (status) {
            query += ' AND status = $' + (values.length + 1);
            values.push(status);
        }

        const beds = await Database.queryMany(query + ' ORDER BY bed_number', values);
        res.json({ success: true, data: beds } as ApiResponse<any>);
    } catch (error) {
        console.error('Get beds error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/beds/:id - Get bed status
router.get('/beds/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const bed = await Database.queryOne<any>(
            `SELECT b.*, w.name as ward_name, a.patient_id FROM beds b
             LEFT JOIN wards w ON b.ward_id = w.id
             LEFT JOIN admissions a ON b.id = a.bed_id AND a.status = 'ACTIVE'
             WHERE b.id = $1`,
            [id]
        );

        if (!bed) {
            res.status(404).json({ success: false, error: 'Bed not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: bed } as ApiResponse<any>);
    } catch (error) {
        console.error('Get bed error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
