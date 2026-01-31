import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create Prescription
 *     description: Create a new prescription for a patient with drug interaction checking
 *     tags:
 *       - Prescriptions
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
 *               - items
 *             properties:
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               visit_id:
 *                 type: integer
 *               appointment_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     drug_id:
 *                       type: integer
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration_days:
 *                       type: integer
 *                     instructions:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Invalid input or drug interactions detected
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { patient_id, doctor_id, visit_id, appointment_id, notes, items } = req.body;

        if (!patient_id || !doctor_id || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: patient_id, doctor_id, items',
            });
        }

        // Check for drug interactions
        const interactions: any[] = [];
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const interaction = await Database.queryOne(
                    `SELECT * FROM drug_interactions 
                     WHERE (drug_id_1 = $1 AND drug_id_2 = $2) 
                     OR (drug_id_1 = $2 AND drug_id_2 = $1)`,
                    [items[i].drug_id, items[j].drug_id]
                );
                if (interaction) {
                    interactions.push({
                        drug1_id: items[i].drug_id,
                        drug2_id: items[j].drug_id,
                        severity: interaction.severity,
                        description: interaction.description,
                    });
                }
            }
        }

        // Create prescription
        const prescription = await Database.queryOne(
            `INSERT INTO prescriptions (patient_id, doctor_id, visit_id, appointment_id, notes, status)
             VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
             RETURNING *`,
            [patient_id, doctor_id, visit_id || null, appointment_id || null, notes || null]
        );

        // Add prescription items
        for (const item of items) {
            await Database.query(
                `INSERT INTO prescription_items (prescription_id, drug_id, dosage, frequency, duration_days, instructions, quantity)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [prescription.id, item.drug_id, item.dosage, item.frequency, item.duration_days, item.instructions || null, item.quantity || null]
            );
        }

        res.status(201).json({
            success: true,
            data: {
                prescription,
                items,
                interactions: interactions.length > 0 ? interactions : null,
                warning: interactions.length > 0 ? 'Drug interactions detected' : null,
            },
        });
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ success: false, error: 'Failed to create prescription' });
    }
});

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get Prescription Details
 *     description: Get prescription with all items and drug information
 *     tags:
 *       - Prescriptions
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
 *         description: Prescription details
 *       404:
 *         description: Prescription not found
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const prescription = await Database.queryOne(
            `SELECT p.*, d.first_name, d.last_name, pat.hospital_mrn
             FROM prescriptions p
             JOIN doctors d ON p.doctor_id = d.id
             JOIN patients pat ON p.patient_id = pat.id
             WHERE p.id = $1`,
            [id]
        );

        if (!prescription) {
            return res.status(404).json({ success: false, error: 'Prescription not found' });
        }

        const items = await Database.query(
            `SELECT pi.*, dm.name, dm.generic_name, dm.strength
             FROM prescription_items pi
             JOIN drugs_master dm ON pi.drug_id = dm.id
             WHERE pi.prescription_id = $1`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...prescription,
                items,
            },
        });
    } catch (error) {
        console.error('Error fetching prescription:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch prescription' });
    }
});

/**
 * @swagger
 * /api/prescriptions/patient/{patient_id}:
 *   get:
 *     summary: Get Patient Prescriptions
 *     description: Get all prescriptions for a patient
 *     tags:
 *       - Prescriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
router.get('/patient/:patient_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { patient_id } = req.params;
        const { status } = req.query;

        let query = `SELECT * FROM prescriptions WHERE patient_id = $1`;
        const params: any[] = [patient_id];

        if (status) {
            query += ` AND status = $2`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const prescriptions = await Database.query(query, params);

        res.json({
            success: true,
            data: prescriptions,
        });
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch prescriptions' });
    }
});

/**
 * @swagger
 * /api/prescriptions/{id}/status:
 *   patch:
 *     summary: Update Prescription Status
 *     description: Update prescription status (ACTIVE, COMPLETED, CANCELLED, EXPIRED)
 *     tags:
 *       - Prescriptions
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *     responses:
 *       200:
 *         description: Prescription status updated
 */
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const prescription = await Database.queryOne(
            `UPDATE prescriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, id]
        );

        if (!prescription) {
            return res.status(404).json({ success: false, error: 'Prescription not found' });
        }

        res.json({
            success: true,
            data: prescription,
        });
    } catch (error) {
        console.error('Error updating prescription:', error);
        res.status(500).json({ success: false, error: 'Failed to update prescription' });
    }
});

export default router;
