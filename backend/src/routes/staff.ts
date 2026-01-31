import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get All Staff
 *     description: Retrieve list of all hospital staff with optional filtering
 *     tags:
 *       - Staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: staff_type
 *         schema:
 *           type: string
 *           enum: [RECEPTIONIST, NURSE, LAB_TECHNICIAN, ADMIN]
 *     responses:
 *       200:
 *         description: List of staff members
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { department_id, staff_type } = req.query;

        let query = `SELECT s.*, u.email, dep.name as department_name FROM staff s
                     JOIN users u ON s.user_id = u.id
                     LEFT JOIN departments dep ON s.department_id = dep.id
                     WHERE 1=1`;
        const values: any[] = [];

        if (department_id) {
            query += ' AND s.department_id = $' + (values.length + 1);
            values.push(department_id);
        }

        if (staff_type) {
            query += ' AND s.staff_type = $' + (values.length + 1);
            values.push(staff_type);
        }

        const staff = await Database.queryMany(query, values);

        res.json({ success: true, data: staff } as ApiResponse<any>);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
