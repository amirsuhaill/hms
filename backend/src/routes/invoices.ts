import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createInvoiceSchema, recordPaymentSchema } from '../middleware/schemas.js';
import { Invoice, InvoiceItem, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Generate Invoice
 *     description: Create an invoice from a treatment plan
 *     tags:
 *       - Invoices
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
 *               - treatment_plan_id
 *             properties:
 *               patient_id:
 *                 type: integer
 *               treatment_plan_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       404:
 *         description: Treatment plan not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createInvoiceSchema), async (req: Request, res: Response) => {
    try {
        const { patient_id, treatment_plan_id } = req.body;

        // Get treatment plan with procedures and materials
        const plan = await Database.queryOne<any>(
            'SELECT * FROM treatment_plans WHERE id = $1',
            [treatment_plan_id]
        );

        if (!plan) {
            res.status(404).json({ success: false, error: 'Treatment plan not found' } as ApiResponse<null>);
            return;
        }

        // Calculate total amount
        const procedures = await Database.queryMany(
            'SELECT * FROM treatment_plan_procedures WHERE treatment_plan_id = $1',
            [treatment_plan_id]
        );

        let total_amount = 0;
        for (const proc of procedures) {
            total_amount += proc.estimated_cost || 0;
        }

        const invoice = await Database.queryOne<Invoice>(
            `INSERT INTO invoices (patient_id, treatment_plan_id, total_amount, paid_amount, status)
             VALUES ($1, $2, $3, 0, 'UNPAID')
             RETURNING *`,
            [patient_id, treatment_plan_id, total_amount]
        );

        // Create invoice items
        for (const proc of procedures) {
            await Database.query(
                `INSERT INTO invoice_items (invoice_id, treatment_plan_procedure_id, description, quantity, unit_price, amount)
                 VALUES ($1, $2, $3, 1, $4, $4)`,
                [invoice?.id, proc.id, `Procedure ${proc.id}`, proc.estimated_cost]
            );
        }

        res.status(201).json({ success: true, data: invoice } as ApiResponse<any>);
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get Invoice Details
 *     description: Retrieve detailed information for a specific invoice including items
 *     tags:
 *       - Invoices
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
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const invoice = await Database.queryOne<any>(
            `SELECT i.*, p.first_name, p.last_name FROM invoices i
             JOIN patients p ON i.patient_id = p.id
             WHERE i.id = $1`,
            [id]
        );

        if (!invoice) {
            res.status(404).json({ success: false, error: 'Invoice not found' } as ApiResponse<null>);
            return;
        }

        const items = await Database.queryMany(
            'SELECT * FROM invoice_items WHERE invoice_id = $1',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...invoice,
                items,
                balance: invoice.total_amount - invoice.paid_amount,
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/invoices/:id/payment - Record payment
router.put('/:id/payment', authMiddleware, validateRequest(recordPaymentSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount_paid } = req.body;

        const invoice = await Database.queryOne<Invoice>(
            'SELECT * FROM invoices WHERE id = $1',
            [id]
        );

        if (!invoice) {
            res.status(404).json({ success: false, error: 'Invoice not found' } as ApiResponse<null>);
            return;
        }

        const new_paid_amount = invoice.paid_amount + amount_paid;
        let status = 'UNPAID';

        if (new_paid_amount >= invoice.total_amount) {
            status = 'PAID';
        } else if (new_paid_amount > 0) {
            status = 'PARTIAL';
        }

        const updated = await Database.queryOne<Invoice>(
            `UPDATE invoices SET paid_amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
            [new_paid_amount, status, id]
        );

        res.json({
            success: true,
            data: {
                ...updated,
                balance: updated?.total_amount! - updated?.paid_amount!,
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/invoices/patient/:patient_id - Get all invoices for patient
router.get('/patient/:patient_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.params;

        const invoices = await Database.queryMany(
            'SELECT * FROM invoices WHERE patient_id = $1 ORDER BY created_at DESC',
            [patient_id]
        );

        res.json({ success: true, data: invoices } as ApiResponse<any>);
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/invoices/report - Get billing summary report
router.get('/report', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { date_from, date_to } = req.query;

        let query = 'SELECT * FROM invoices WHERE 1=1';
        const values: any[] = [];

        if (date_from) {
            query += ' AND created_at >= $' + (values.length + 1);
            values.push(date_from);
        }

        if (date_to) {
            query += ' AND created_at <= $' + (values.length + 1);
            values.push(date_to);
        }

        const invoices = await Database.queryMany(query, values);

        const summary = {
            total_invoices: invoices.length,
            total_amount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
            total_paid: invoices.reduce((sum, inv) => sum + inv.paid_amount, 0),
            total_pending: invoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0),
            by_status: {
                UNPAID: invoices.filter(inv => inv.status === 'UNPAID').reduce((sum, inv) => sum + inv.total_amount, 0),
                PARTIAL: invoices.filter(inv => inv.status === 'PARTIAL').reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0),
                PAID: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.paid_amount, 0),
            },
        };

        res.json({ success: true, data: summary } as ApiResponse<any>);
    } catch (error) {
        console.error('Get billing report error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
