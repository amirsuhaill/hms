import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createTreatmentPlanSchema, updateTreatmentPlanSchema, addProcedureSchema, addMaterialSchema, createProcedureMasterSchema, createMaterialMasterSchema, updateMaterialStockSchema } from '../middleware/schemas.js';
import { TreatmentPlan, TreatmentPlanProcedure, TreatmentProcedureMaterial, ProcedureMaster, MaterialMaster, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/treatment-plans:
 *   post:
 *     summary: Create Treatment Plan
 *     description: Create a new treatment plan for a patient
 *     tags:
 *       - Treatment Plans
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
 *               - plan_name
 *             properties:
 *               patient_id:
 *                 type: integer
 *               appointment_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               plan_name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED]
 *               total_estimated_cost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Treatment plan created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validateRequest(createTreatmentPlanSchema), async (req: Request, res: Response) => {
    try {
        const { patient_id, appointment_id, doctor_id, plan_name, status, total_estimated_cost } = req.body;

        console.log('Creating treatment plan with data:', { patient_id, appointment_id, doctor_id, plan_name, status, total_estimated_cost });

        const plan = await Database.queryOne<TreatmentPlan>(
            `INSERT INTO treatment_plans (patient_id, appointment_id, doctor_id, plan_name, status, total_estimated_cost)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [patient_id, appointment_id, doctor_id, plan_name, status, total_estimated_cost]
        );

        console.log('Created treatment plan:', plan);

        res.status(201).json({ success: true, data: plan } as ApiResponse<any>);
    } catch (error) {
        console.error('Create treatment plan error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/treatment-plans/{id}/procedures:
 *   post:
 *     summary: Add Procedure to Treatment Plan
 *     description: Add a procedure to an existing treatment plan
 *     tags:
 *       - Treatment Plans
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
 *             required:
 *               - procedure_id
 *             properties:
 *               procedure_id:
 *                 type: integer
 *               tooth_node_id:
 *                 type: integer
 *               custom_notes:
 *                 type: string
 *               estimated_cost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Procedure added
 *       404:
 *         description: Treatment plan not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/procedures', authMiddleware, validateRequest(addProcedureSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { procedure_id, tooth_node_id, custom_notes, estimated_cost, priority, scheduled_datetime } = req.body;

        const proc = await Database.queryOne<TreatmentPlanProcedure>(
            `INSERT INTO treatment_plan_procedures (treatment_plan_id, procedure_id, tooth_node_id, custom_notes, estimated_cost, priority, scheduled_datetime)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [id, procedure_id, tooth_node_id, custom_notes, estimated_cost, priority, scheduled_datetime]
        );

        res.status(201).json({ success: true, data: proc } as ApiResponse<any>);
    } catch (error) {
        console.error('Add procedure error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// POST /api/treatment-plans/procedures/:id/materials - Add material
router.post('/procedures/:id/materials', authMiddleware, validateRequest(addMaterialSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { material_id, quantity, unit_cost } = req.body;
        const total_cost = quantity * unit_cost;

        const material = await Database.queryOne<TreatmentProcedureMaterial>(
            `INSERT INTO treatment_procedure_materials (treatment_plan_procedure_id, material_id, quantity, unit_cost, total_cost)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [id, material_id, quantity, unit_cost, total_cost]
        );

        res.status(201).json({ success: true, data: material } as ApiResponse<any>);
    } catch (error) {
        console.error('Add material error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/treatment-plans/patient/:patient_id - Get all treatment plans
router.get('/patient/:patient_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.params;

        const plans = await Database.queryMany(
            'SELECT * FROM treatment_plans WHERE patient_id = $1 ORDER BY created_at DESC',
            [patient_id]
        );

        for (const plan of plans) {
            plan.procedures = await Database.queryMany(
                `SELECT tpp.*, pm.name, pm.code FROM treatment_plan_procedures tpp
                 JOIN procedures_master pm ON tpp.procedure_id = pm.id
                 WHERE tpp.treatment_plan_id = $1`,
                [plan.id]
            );
        }

        res.json({ success: true, data: plans } as ApiResponse<any>);
    } catch (error) {
        console.error('Get treatment plans error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/treatment-plans/doctor/:doctor_id - Get all treatment plans for a doctor
router.get('/doctor/:doctor_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { doctor_id } = req.params;

        console.log('Getting all treatment plans for doctor:', doctor_id);

        const plans = await Database.queryMany(
            `SELECT tp.*, p.first_name, p.last_name, p.hospital_mrn 
             FROM treatment_plans tp
             JOIN patients p ON tp.patient_id = p.id
             WHERE tp.doctor_id = $1 
             ORDER BY tp.created_at DESC`,
            [doctor_id]
        );

        console.log('Found treatment plans:', plans.length);

        for (const plan of plans) {
            plan.patient_name = `${plan.first_name} ${plan.last_name}`;
            plan.procedures = await Database.queryMany(
                `SELECT tpp.*, pm.name, pm.code FROM treatment_plan_procedures tpp
                 JOIN procedures_master pm ON tpp.procedure_id = pm.id
                 WHERE tpp.treatment_plan_id = $1`,
                [plan.id]
            );
        }

        res.json({ success: true, data: plans } as ApiResponse<any>);
    } catch (error) {
        console.error('Get doctor treatment plans error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/treatment-plans/:id - Get treatment plan details
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const plan = await Database.queryOne<any>(
            'SELECT * FROM treatment_plans WHERE id = $1',
            [id]
        );

        if (!plan) {
            res.status(404).json({ success: false, error: 'Treatment plan not found' } as ApiResponse<null>);
            return;
        }

        const procedures = await Database.queryMany(
            `SELECT tpp.*, pm.name, pm.code FROM treatment_plan_procedures tpp
             JOIN procedures_master pm ON tpp.procedure_id = pm.id
             WHERE tpp.treatment_plan_id = $1`,
            [id]
        );

        for (const proc of procedures) {
            proc.materials = await Database.queryMany(
                `SELECT tpm.*, mm.name, mm.unit FROM treatment_procedure_materials tpm
                 JOIN materials_master mm ON tpm.material_id = mm.id
                 WHERE tpm.treatment_plan_procedure_id = $1`,
                [proc.id]
            );
        }

        res.json({ success: true, data: { ...plan, procedures } } as ApiResponse<any>);
    } catch (error) {
        console.error('Get treatment plan error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/treatment-plans/:id - Update treatment plan
router.put('/:id', authMiddleware, validateRequest(updateTreatmentPlanSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { plan_name, status, total_estimated_cost } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (plan_name !== undefined) {
            updates.push(`plan_name = $${paramCount++}`);
            values.push(plan_name);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);
        }
        if (total_estimated_cost !== undefined) {
            updates.push(`total_estimated_cost = $${paramCount++}`);
            values.push(total_estimated_cost);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const plan = await Database.queryOne<TreatmentPlan>(
            `UPDATE treatment_plans SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (!plan) {
            res.status(404).json({ success: false, error: 'Treatment plan not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: plan } as ApiResponse<any>);
    } catch (error) {
        console.error('Update treatment plan error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/treatment-plans/procedures/:id - Update procedure status
router.put('/procedures/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const proc = await Database.queryOne<TreatmentPlanProcedure>(
            `UPDATE treatment_plan_procedures SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (!proc) {
            res.status(404).json({ success: false, error: 'Procedure not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: proc } as ApiResponse<any>);
    } catch (error) {
        console.error('Update procedure error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/treatment-plans/procedures-master - Get procedures master
router.get('/procedures-master', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let query = 'SELECT * FROM procedures_master WHERE 1=1';
        const values: any[] = [];

        if (category) {
            query += ' AND category = $' + (values.length + 1);
            values.push(category);
        }

        const procedures = await Database.queryMany(query + ' ORDER BY name', values);
        res.json({ success: true, data: procedures } as ApiResponse<any>);
    } catch (error) {
        console.error('Get procedures error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// POST /api/treatment-plans/procedures-master - Create procedure master
router.post('/procedures-master', authMiddleware, validateRequest(createProcedureMasterSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Only admins can create procedures' } as ApiResponse<null>);
            return;
        }

        const { code, name, category, default_duration_minutes, default_cost } = req.body;

        const proc = await Database.queryOne<ProcedureMaster>(
            `INSERT INTO procedures_master (code, name, category, default_duration_minutes, default_cost)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [code, name, category, default_duration_minutes, default_cost]
        );

        res.status(201).json({ success: true, data: proc } as ApiResponse<any>);
    } catch (error) {
        console.error('Create procedure error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/treatment-plans/materials-master - Get materials master
router.get('/materials-master', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { low_stock } = req.query;

        let query = 'SELECT * FROM materials_master WHERE 1=1';
        const values: any[] = [];

        if (low_stock === 'true') {
            query += ' AND stock_qty <= reorder_level';
        }

        const materials = await Database.queryMany(query + ' ORDER BY name', values);
        res.json({ success: true, data: materials } as ApiResponse<any>);
    } catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// POST /api/treatment-plans/materials-master - Create material master
router.post('/materials-master', authMiddleware, validateRequest(createMaterialMasterSchema), async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Only admins can create materials' } as ApiResponse<null>);
            return;
        }

        const { name, unit, stock_qty, unit_cost, reorder_level } = req.body;

        const material = await Database.queryOne<MaterialMaster>(
            `INSERT INTO materials_master (name, unit, stock_qty, unit_cost, reorder_level)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, unit, stock_qty, unit_cost, reorder_level]
        );

        res.status(201).json({ success: true, data: material } as ApiResponse<any>);
    } catch (error) {
        console.error('Create material error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/treatment-plans/materials-master/:id/stock - Update material stock
router.put('/materials-master/:id/stock', authMiddleware, validateRequest(updateMaterialStockSchema), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stock_qty } = req.body;

        const material = await Database.queryOne<MaterialMaster>(
            `UPDATE materials_master SET stock_qty = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [stock_qty, id]
        );

        if (!material) {
            res.status(404).json({ success: false, error: 'Material not found' } as ApiResponse<null>);
            return;
        }

        res.json({ success: true, data: material } as ApiResponse<any>);
    } catch (error) {
        console.error('Update material stock error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/treatment-plans/materials-master/alerts/low-stock - Get low stock materials
router.get('/materials-master/alerts/low-stock', authMiddleware, async (req: Request, res: Response) => {
    try {
        const materials = await Database.queryMany(
            'SELECT * FROM materials_master WHERE stock_qty <= reorder_level ORDER BY stock_qty ASC'
        );

        res.json({ success: true, data: materials } as ApiResponse<any>);
    } catch (error) {
        console.error('Get low stock materials error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
