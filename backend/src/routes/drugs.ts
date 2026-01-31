import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/drugs:
 *   post:
 *     summary: Create Drug Master
 *     description: Add a new drug to the drug master database
 *     tags:
 *       - Drugs
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
 *               - dosage_form
 *               - strength
 *             properties:
 *               name:
 *                 type: string
 *               generic_name:
 *                 type: string
 *               category:
 *                 type: string
 *               dosage_form:
 *                 type: string
 *               strength:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Drug created successfully
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, generic_name, category, dosage_form, strength, manufacturer, price } = req.body;

        if (!name || !dosage_form || !strength) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: name, dosage_form, strength',
            });
            return;
        }

        const drug = await Database.queryOne(
            `INSERT INTO drugs_master (name, generic_name, category, dosage_form, strength, manufacturer, price)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, generic_name || null, category || null, dosage_form, strength, manufacturer || null, price || null]
        );

        res.status(201).json({
            success: true,
            data: drug,
        });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({ success: false, error: 'Drug already exists' });
            return;
        }
        console.error('Error creating drug:', error);
        res.status(500).json({ success: false, error: 'Failed to create drug' });
        return;
    }
});

/**
 * @swagger
 * /api/drugs:
 *   get:
 *     summary: Get All Drugs
 *     description: Get list of all drugs with pagination
 *     tags:
 *       - Drugs
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of drugs
 */
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;

        let query = `SELECT * FROM drugs_master WHERE is_active = true`;
        const params: any[] = [];

        if (search) {
            query += ` AND (name ILIKE $1 OR generic_name ILIKE $1)`;
            params.push(`%${search}%`);
        }

        const offset = (page - 1) * limit;
        query += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const drugs = await Database.query(query, params);

        const countResult = await Database.queryOne(
            `SELECT COUNT(*) as count FROM drugs_master WHERE is_active = true ${search ? `AND (name ILIKE $1 OR generic_name ILIKE $1)` : ''}`,
            search ? [`%${search}%`] : []
        );

        res.json({
            success: true,
            data: drugs,
            pagination: {
                total: countResult?.count || 0,
                page,
                limit,
            },
        });
    } catch (error) {
        console.error('Error fetching drugs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch drugs' });
        return;
    }
});

/**
 * @swagger
 * /api/drugs/{id}:
 *   get:
 *     summary: Get Drug Details
 *     description: Get details of a specific drug
 *     tags:
 *       - Drugs
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
 *         description: Drug details
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const drug = await Database.queryOne(
            `SELECT * FROM drugs_master WHERE id = $1`,
            [id]
        );

        if (!drug) {
            res.status(404).json({ success: false, error: 'Drug not found' });
            return;
        }

        res.json({
            success: true,
            data: drug,
        });
    } catch (error) {
        console.error('Error fetching drug:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch drug' });
        return;
    }
});

/**
 * @swagger
 * /api/drugs/interactions/check:
 *   post:
 *     summary: Check Drug Interactions
 *     description: Check for interactions between multiple drugs
 *     tags:
 *       - Drugs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drug_ids
 *             properties:
 *               drug_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Interaction check results
 */
router.post('/interactions/check', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { drug_ids } = req.body;

        if (!drug_ids || !Array.isArray(drug_ids) || drug_ids.length < 2) {
            res.status(400).json({
                success: false,
                error: 'Provide at least 2 drug IDs',
            });
            return;
        }

        const interactions: any[] = [];

        for (let i = 0; i < drug_ids.length; i++) {
            for (let j = i + 1; j < drug_ids.length; j++) {
                const interaction = await Database.queryOne(
                    `SELECT di.*, d1.name as drug1_name, d2.name as drug2_name
                     FROM drug_interactions di
                     JOIN drugs_master d1 ON di.drug_id_1 = d1.id
                     JOIN drugs_master d2 ON di.drug_id_2 = d2.id
                     WHERE (di.drug_id_1 = $1 AND di.drug_id_2 = $2) 
                     OR (di.drug_id_1 = $2 AND di.drug_id_2 = $1)`,
                    [drug_ids[i], drug_ids[j]]
                );

                if (interaction) {
                    interactions.push(interaction);
                }
            }
        }

        res.json({
            success: true,
            data: {
                drug_ids,
                interactions,
                has_interactions: interactions.length > 0,
                severity_levels: interactions.map(i => i.severity),
            },
        });
    } catch (error) {
        console.error('Error checking interactions:', error);
        res.status(500).json({ success: false, error: 'Failed to check interactions' });
        return;
    }
});

/**
 * @swagger
 * /api/drugs/interactions:
 *   post:
 *     summary: Add Drug Interaction
 *     description: Add a known interaction between two drugs
 *     tags:
 *       - Drugs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drug_id_1
 *               - drug_id_2
 *               - severity
 *               - description
 *             properties:
 *               drug_id_1:
 *                 type: integer
 *               drug_id_2:
 *                 type: integer
 *               severity:
 *                 type: string
 *                 enum: [MILD, MODERATE, SEVERE, CONTRAINDICATED]
 *               description:
 *                 type: string
 *               management_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Interaction added successfully
 */
router.post('/interactions', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { drug_id_1, drug_id_2, severity, description, management_notes } = req.body;

        if (!drug_id_1 || !drug_id_2 || !severity || !description) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        if (!['MILD', 'MODERATE', 'SEVERE', 'CONTRAINDICATED'].includes(severity)) {
            res.status(400).json({
                success: false,
                error: 'Invalid severity level',
            });
            return;
        }

        const interaction = await Database.queryOne(
            `INSERT INTO drug_interactions (drug_id_1, drug_id_2, severity, description, management_notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [drug_id_1, drug_id_2, severity, description, management_notes || null]
        );

        res.status(201).json({
            success: true,
            data: interaction,
        });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({ success: false, error: 'Interaction already exists' });
            return;
        }
        console.error('Error adding interaction:', error);
        res.status(500).json({ success: false, error: 'Failed to add interaction' });
        return;
    }
});

/**
 * @swagger
 * /api/drugs/{id}/interactions:
 *   get:
 *     summary: Get Drug Interactions
 *     description: Get all known interactions for a specific drug
 *     tags:
 *       - Drugs
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
 *         description: List of interactions
 */
router.get('/:id/interactions', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const interactions = await Database.query(
            `SELECT di.*, d1.name as drug1_name, d2.name as drug2_name
             FROM drug_interactions di
             JOIN drugs_master d1 ON di.drug_id_1 = d1.id
             JOIN drugs_master d2 ON di.drug_id_2 = d2.id
             WHERE di.drug_id_1 = $1 OR di.drug_id_2 = $1`,
            [id]
        );

        res.json({
            success: true,
            data: interactions,
        });
    } catch (error) {
        console.error('Error fetching interactions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch interactions' });
        return;
    }
});

export default router;
