import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/inventory/transactions:
 *   post:
 *     summary: Record Inventory Transaction
 *     description: Record an inventory transaction (IN, OUT, ADJUSTMENT, RETURN)
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - material_id
 *               - transaction_type
 *               - quantity
 *             properties:
 *               material_id:
 *                 type: integer
 *               transaction_type:
 *                 type: string
 *                 enum: [IN, OUT, ADJUSTMENT, RETURN]
 *               quantity:
 *                 type: number
 *               reference_type:
 *                 type: string
 *               reference_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction recorded
 */
router.post('/transactions', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = (req as any).user?.id;
        const { material_id, transaction_type, quantity, reference_type, reference_id, notes } = req.body;

        if (!material_id || !transaction_type || !quantity) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        if (!['IN', 'OUT', 'ADJUSTMENT', 'RETURN'].includes(transaction_type)) {
            res.status(400).json({
                success: false,
                error: 'Invalid transaction type',
            });
            return;
        }

        // Record transaction
        const transaction = await Database.queryOne(
            `INSERT INTO inventory_transactions (material_id, transaction_type, quantity, reference_type, reference_id, notes, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [material_id, transaction_type, quantity, reference_type || null, reference_id || null, notes || null, user_id]
        );

        // Update material stock
        const multiplier = ['IN', 'ADJUSTMENT', 'RETURN'].includes(transaction_type) ? 1 : -1;
        await Database.query(
            `UPDATE materials_master SET stock_qty = stock_qty + ($1 * $2), updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
            [quantity, multiplier, material_id]
        );

        res.status(201).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        console.error('Error recording transaction:', error);
        res.status(500).json({ success: false, error: 'Failed to record transaction' });
        return;
    }
});

/**
 * @swagger
 * /api/inventory/transactions:
 *   get:
 *     summary: Get Inventory Transactions
 *     description: Get inventory transactions with filtering
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: material_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: transaction_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
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
 *         description: List of transactions
 */
router.get('/transactions', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { material_id, transaction_type, days = 30, page = 1, limit = 20 } = req.query;

        let query = `SELECT it.*, m.name as material_name, u.email as created_by_email 
                     FROM inventory_transactions it
                     JOIN materials_master m ON it.material_id = m.id
                     LEFT JOIN users u ON it.created_by = u.id
                     WHERE it.created_at >= NOW() - INTERVAL '${days} days'`;
        const params: any[] = [];

        if (material_id) {
            query += ` AND it.material_id = $${params.length + 1}`;
            params.push(material_id);
        }

        if (transaction_type) {
            query += ` AND it.transaction_type = $${params.length + 1}`;
            params.push(transaction_type);
        }

        query += ` ORDER BY it.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, (parseInt(page as string) - 1) * parseInt(limit as string));

        const transactions = await Database.query(query, params);

        res.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
        return;
    }
});

/**
 * @swagger
 * /api/inventory/stock-status:
 *   get:
 *     summary: Get Stock Status
 *     description: Get current stock status and low stock alerts
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock status
 */
router.get('/stock-status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        // All materials with stock info
        const allMaterials = await Database.query(
            `SELECT id, name, stock_qty, reorder_level, unit_cost, unit 
             FROM materials_master 
             ORDER BY name ASC`
        );

        // Low stock items
        const lowStock = await Database.query(
            `SELECT id, name, stock_qty, reorder_level, unit_cost, unit 
             FROM materials_master 
             WHERE stock_qty <= reorder_level 
             ORDER BY stock_qty ASC`
        );

        // Out of stock items
        const outOfStock = await Database.query(
            `SELECT id, name, stock_qty, reorder_level, unit_cost, unit 
             FROM materials_master 
             WHERE stock_qty = 0`
        );

        // Total inventory value
        const inventoryValue = await Database.queryOne(
            `SELECT SUM(stock_qty * unit_cost) as total_value FROM materials_master`
        );

        res.json({
            success: true,
            data: {
                all_materials: allMaterials.rows,
                low_stock_count: lowStock.rows.length,
                low_stock_items: lowStock.rows,
                out_of_stock_count: outOfStock.rows.length,
                out_of_stock_items: outOfStock.rows,
                total_inventory_value: inventoryValue?.total_value || 0,
            },
        });
    } catch (error) {
        console.error('Error fetching stock status:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stock status' });
        return;
    }
});

/**
 * @swagger
 * /api/inventory/maintenance:
 *   post:
 *     summary: Schedule Equipment Maintenance
 *     description: Schedule maintenance for equipment/materials
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - material_id
 *               - maintenance_type
 *               - scheduled_date
 *             properties:
 *               material_id:
 *                 type: integer
 *               maintenance_type:
 *                 type: string
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Maintenance scheduled
 */
router.post('/maintenance', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { material_id, maintenance_type, scheduled_date, notes } = req.body;

        if (!material_id || !maintenance_type || !scheduled_date) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        const maintenance = await Database.queryOne(
            `INSERT INTO equipment_maintenance (material_id, maintenance_type, scheduled_date, notes, status)
             VALUES ($1, $2, $3, $4, 'PENDING')
             RETURNING *`,
            [material_id, maintenance_type, scheduled_date, notes || null]
        );

        res.status(201).json({
            success: true,
            data: maintenance,
        });
    } catch (error) {
        console.error('Error scheduling maintenance:', error);
        res.status(500).json({ success: false, error: 'Failed to schedule maintenance' });
        return;
    }
});

/**
 * @swagger
 * /api/inventory/maintenance:
 *   get:
 *     summary: Get Maintenance Schedule
 *     description: Get equipment maintenance schedule
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Maintenance schedule
 */
router.get('/maintenance', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.query;

        let query = `SELECT em.*, m.name as material_name, u.email as performed_by_email 
                     FROM equipment_maintenance em
                     JOIN materials_master m ON em.material_id = m.id
                     LEFT JOIN users u ON em.performed_by = u.id`;
        const params: any[] = [];

        if (status) {
            query += ` WHERE em.status = $1`;
            params.push(status);
        }

        query += ` ORDER BY em.scheduled_date ASC`;

        const maintenance = await Database.query(query, params);

        res.json({
            success: true,
            data: maintenance,
        });
    } catch (error) {
        console.error('Error fetching maintenance:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch maintenance' });
        return;
    }
});

/**
 * @swagger
 * /api/inventory/maintenance/{id}/complete:
 *   patch:
 *     summary: Complete Maintenance
 *     description: Mark maintenance as completed
 *     tags:
 *       - Inventory
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Maintenance completed
 */
router.patch('/maintenance/:id/complete', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;
        const { notes } = req.body;

        const maintenance = await Database.queryOne(
            `UPDATE equipment_maintenance 
             SET status = 'COMPLETED', completed_date = CURRENT_DATE, performed_by = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 RETURNING *`,
            [user_id, notes || null, id]
        );

        if (!maintenance) {
            res.status(404).json({ success: false, error: 'Maintenance record not found' });
            return;
        }

        res.json({
            success: true,
            data: maintenance,
        });
    } catch (error) {
        console.error('Error completing maintenance:', error);
        res.status(500).json({ success: false, error: 'Failed to complete maintenance' });
        return;
    }
});

export default router;
