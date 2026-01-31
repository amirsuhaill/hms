import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createLabTestMasterSchema, createLabTestOrderSchema, updateLabTestItemSchema } from '../middleware/schemas.js';
import { LabTestMaster, LabTestOrder, LabTestOrderItem, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/lab-tests/master:
 *   get:
 *     summary: Get Lab Tests Master List
 *     description: Retrieve all available lab tests with optional category filtering
 *     tags:
 *       - Lab Tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of lab tests
 *       401:
 *         description: Unauthorized
 */
router.get('/master', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let query = 'SELECT * FROM lab_tests_master WHERE 1=1';
        const values: any[] = [];

        if (category) {
            query += ' AND category = $' + (values.length + 1);
            values.push(category);
        }

        const tests = await Database.queryMany(query + ' ORDER BY name', values);
        res.json({ success: true, data: tests } as ApiResponse<any>);
    } catch (error) {
        console.error('Get lab tests error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/lab-tests/master:
 *   post:
 *     summary: Create Lab Test Master
 *     description: Create a new lab test type (Admin only)
 *     tags:
 *       - Lab Tests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - default_price
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               default_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Lab test created
 *       403:
 *         description: Only admins can create lab tests
 *       401:
 *         description: Unauthorized
 */
router.post('/master', authMiddleware, validateRequest(createLabTestMasterSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Only admins can create lab tests' } as ApiResponse<null>);
            return;
        }

        const { code, name, category, default_price } = req.body;

        const test = await Database.queryOne<LabTestMaster>(
            `INSERT INTO lab_tests_master (code, name, category, default_price)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [code, name, category, default_price]
        );

        res.status(201).json({ success: true, data: test } as ApiResponse<any>);
    } catch (error) {
        console.error('Create lab test error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// POST /api/lab-tests/orders - Create lab test order
router.post('/orders', authMiddleware, validateRequest(createLabTestOrderSchema), async (req: Request, res: Response) => {
    try {
        const { appointment_id, patient_id, doctor_id, notes, test_ids } = req.body;

        console.log('Creating lab order with data:', { appointment_id, patient_id, doctor_id, notes, test_ids });

        const order = await Database.queryOne<LabTestOrder>(
            `INSERT INTO lab_test_orders (appointment_id, patient_id, doctor_id, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [appointment_id, patient_id, doctor_id, notes]
        );

        console.log('Created lab order:', order);

        if (!order) {
            res.status(500).json({ success: false, error: 'Failed to create order' } as ApiResponse<null>);
            return;
        }

        // Add test items
        for (const test_id of test_ids) {
            console.log('Adding test item:', test_id, 'to order:', order.id);
            await Database.query(
                `INSERT INTO lab_test_order_items (order_id, test_id) VALUES ($1, $2)`,
                [order.id, test_id]
            );
        }

        const items = await Database.queryMany(
            'SELECT * FROM lab_test_order_items WHERE order_id = $1',
            [order.id]
        );

        console.log('Lab order created successfully with items:', items.length);

        res.status(201).json({ success: true, data: { ...order, items } } as ApiResponse<any>);
    } catch (error) {
        console.error('Create lab order error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/lab-tests/orders/patient/:patient_id - Get lab orders for patient
router.get('/orders/patient/:patient_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.params;
        const { status } = req.query;

        let query = 'SELECT * FROM lab_test_orders WHERE patient_id = $1';
        const values: any[] = [patient_id];

        if (status) {
            query += ' AND status = $' + (values.length + 1);
            values.push(status);
        }

        const orders = await Database.queryMany(query + ' ORDER BY created_at DESC', values);

        for (const order of orders) {
            order.items = await Database.queryMany(
                `SELECT lti.*, lt.name, lt.code FROM lab_test_order_items lti
                 JOIN lab_tests_master lt ON lti.test_id = lt.id
                 WHERE lti.order_id = $1`,
                [order.id]
            );
        }

        res.json({ success: true, data: orders } as ApiResponse<any>);
    } catch (error) {
        console.error('Get lab orders error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/lab-tests/orders/doctor/:doctor_id - Get lab orders for doctor
router.get('/orders/doctor/:doctor_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { doctor_id } = req.params;

        console.log('Getting all lab orders for doctor:', doctor_id);

        const orders = await Database.queryMany(
            `SELECT lto.*, p.first_name, p.last_name, p.hospital_mrn 
             FROM lab_test_orders lto
             JOIN patients p ON lto.patient_id = p.id
             WHERE lto.doctor_id = $1
             ORDER BY lto.created_at DESC`,
            [doctor_id]
        );

        console.log('Found lab orders:', orders.length);

        for (const order of orders) {
            order.patient_name = `${order.first_name} ${order.last_name}`;
            order.items = await Database.queryMany(
                `SELECT lti.*, lt.name, lt.code FROM lab_test_order_items lti
                 JOIN lab_tests_master lt ON lti.test_id = lt.id
                 WHERE lti.order_id = $1`,
                [order.id]
            );
        }

        res.json({ success: true, data: orders } as ApiResponse<any>);
    } catch (error) {
        console.error('Get doctor lab orders error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/lab-tests/items/:id - Update lab test result
router.put('/items/:id', authMiddleware, validateRequest(updateLabTestItemSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { result_value, unit, ref_range, result_flag, status } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (result_value !== undefined) {
            updates.push(`result_value = $${paramCount++}`);
            values.push(result_value);
        }
        if (unit !== undefined) {
            updates.push(`unit = $${paramCount++}`);
            values.push(unit);
        }
        if (ref_range !== undefined) {
            updates.push(`ref_range = $${paramCount++}`);
            values.push(ref_range);
        }
        if (result_flag !== undefined) {
            updates.push(`result_flag = $${paramCount++}`);
            values.push(result_flag);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
            if (status === 'REPORTED') {
                updates.push(`reported_at = CURRENT_TIMESTAMP`);
            }
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const item = await Database.queryOne<LabTestOrderItem>(
            `UPDATE lab_test_order_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!item) {
            res.status(404).json({ success: false, error: 'Lab test item not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: item } as ApiResponse<any>);
    } catch (error) {
        console.error('Update lab test error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/lab-tests/items/:id/verify - Verify lab result
router.put('/items/:id/verify', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const item = await Database.queryOne<LabTestOrderItem>(
            `UPDATE lab_test_order_items SET status = 'VERIFIED', report_verified_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [req.user?.userId, id]
        );

        if (!item) {
            res.status(404).json({ success: false, error: 'Lab test item not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: item } as ApiResponse<any>);
    } catch (error) {
        console.error('Verify lab test error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/lab-tests/orders/:id - Get lab order details
router.get('/orders/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await Database.queryOne<any>(
            'SELECT * FROM lab_test_orders WHERE id = $1',
            [id]
        );

        if (!order) {
            res.status(404).json({ success: false, error: 'Lab order not found' } as ApiResponse<null>);
            return;
        }

        const items = await Database.queryMany(
            `SELECT lti.*, lt.name, lt.code FROM lab_test_order_items lti
             JOIN lab_tests_master lt ON lti.test_id = lt.id
             WHERE lti.order_id = $1`,
            [id]
        );

        res.json({ success: true, data: { ...order, items } } as ApiResponse<any>);
    } catch (error) {
        console.error('Get lab order error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/lab-tests/items/:id/assign - Assign lab technician
router.put('/items/:id/assign', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { assigned_lab_tech_id } = req.body;

        const item = await Database.queryOne<LabTestOrderItem>(
            `UPDATE lab_test_order_items SET assigned_lab_tech_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [assigned_lab_tech_id, id]
        );

        if (!item) {
            res.status(404).json({ success: false, error: 'Lab test item not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: item } as ApiResponse<any>);
    } catch (error) {
        console.error('Assign lab tech error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/lab-tests/orders - Get pending lab orders
router.get('/orders', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        let query = 'SELECT * FROM lab_test_orders WHERE 1=1';
        const values: any[] = [];

        if (status) {
            query += ' AND status = $' + (values.length + 1);
            values.push(status);
        }

        const orders = await Database.queryMany(query + ' ORDER BY created_at DESC', values);
        res.json({ success: true, data: orders } as ApiResponse<any>);
    } catch (error) {
        console.error('Get lab orders error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/lab-tests/orders/:id/cancel - Cancel lab order
router.put('/orders/:id/cancel', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const order = await Database.queryOne<LabTestOrder>(
            `UPDATE lab_test_orders SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );

        if (!order) {
            res.status(404).json({ success: false, error: 'Lab order not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: order } as ApiResponse<any>);
    } catch (error) {
        console.error('Cancel lab order error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
