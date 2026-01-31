import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createAIContextSchema, createAISessionSchema, sendAIMessageSchema } from '../middleware/schemas.js';
import { AIContextSnapshot, AISession, AIMessage, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/ai/context-snapshots:
 *   post:
 *     summary: Create AI Context Snapshot
 *     description: Create a snapshot of patient context for AI analysis
 *     tags:
 *       - AI
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
 *               - context_json
 *             properties:
 *               patient_id:
 *                 type: integer
 *               visit_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               context_json:
 *                 type: object
 *     responses:
 *       201:
 *         description: Context snapshot created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/context-snapshots', authMiddleware, validateRequest(createAIContextSchema), async (req: Request, res: Response) => {
    try {
        const { patient_id, visit_id, doctor_id, context_json } = req.body;

        const snapshot = await Database.queryOne<AIContextSnapshot>(
            `INSERT INTO ai_context_snapshots (patient_id, visit_id, doctor_id, context_json)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [patient_id, visit_id, doctor_id, JSON.stringify(context_json)]
        );

        res.status(201).json({ success: true, data: snapshot } as ApiResponse<any>);
    } catch (error) {
        console.error('Create AI context error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/ai/sessions:
 *   post:
 *     summary: Start AI Session
 *     description: Start a new AI-assisted consultation session
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - patient_id
 *             properties:
 *               doctor_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               visit_id:
 *                 type: integer
 *               last_context_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: AI session started
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/sessions', authMiddleware, validateRequest(createAISessionSchema), async (req: Request, res: Response) => {
    try {
        const { doctor_id, patient_id, visit_id, last_context_id } = req.body;

        const session = await Database.queryOne<AISession>(
            `INSERT INTO ai_sessions (doctor_id, patient_id, visit_id, last_context_id, started_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             RETURNING *`,
            [doctor_id, patient_id, visit_id, last_context_id]
        );

        const context = last_context_id
            ? await Database.queryOne('SELECT * FROM ai_context_snapshots WHERE id = $1', [last_context_id])
            : null;

        res.status(201).json({
            success: true,
            data: { ...session, context_snapshot: context },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('Create AI session error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

/**
 * @swagger
 * /api/ai/sessions/{session_id}/messages:
 *   post:
 *     summary: Send Message to AI
 *     description: Send a question or message to AI for analysis and recommendations
 *     tags:
 *       - AI
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: session_id
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
 *               - question_text
 *               - sender_type
 *             properties:
 *               question_text:
 *                 type: string
 *               sender_type:
 *                 type: string
 *                 enum: [DOCTOR, AI]
 *     responses:
 *       201:
 *         description: AI response received
 *       404:
 *         description: Session not found
 *       401:
 *         description: Unauthorized
 */
router.post('/sessions/:session_id/messages', authMiddleware, validateRequest(sendAIMessageSchema), async (req: Request, res: Response) => {
    try {
        const { session_id } = req.params;
        const { question_text, sender_type } = req.body;

        // Simulate AI response (in production, call actual AI service)
        const ai_response = {
            recommendations: [
                {
                    option: 'Treatment Option 1',
                    evidence_based: true,
                    pros: ['Benefit 1', 'Benefit 2'],
                    cons: ['Consideration 1'],
                },
            ],
            disclaimer: 'This is AI-assisted guidance. Clinical judgment is final',
        };

        const message = await Database.queryOne<AIMessage>(
            `INSERT INTO ai_messages (ai_session_id, sender_type, question_text, response_json)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [session_id, sender_type, question_text, JSON.stringify(ai_response)]
        );

        res.status(201).json({ success: true, data: message } as ApiResponse<any>);
    } catch (error) {
        console.error('Send AI message error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/ai/sessions/:id/messages - Get AI session messages
router.get('/sessions/:id/messages', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const messages = await Database.queryMany(
            'SELECT * FROM ai_messages WHERE ai_session_id = $1 ORDER BY created_at ASC',
            [id]
        );

        res.json({ success: true, data: messages } as ApiResponse<any>);
    } catch (error) {
        console.error('Get AI messages error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// PUT /api/ai/sessions/:id/end - End AI session
router.put('/sessions/:id/end', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const session = await Database.queryOne<AISession>(
            `UPDATE ai_sessions SET ended_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );

        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' } as ApiResponse<null>);
            return;
        }

        const messageCount = await Database.queryOne<{ count: number }>(
            'SELECT COUNT(*) as count FROM ai_messages WHERE ai_session_id = $1',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...session,
                total_messages: messageCount?.count || 0,
            },
        } as ApiResponse<any>);
    } catch (error) {
        console.error('End AI session error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

// GET /api/ai/sessions - Get doctor's AI session history
router.get('/sessions', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { doctor_id, limit = 10 } = req.query;

        let query = 'SELECT * FROM ai_sessions WHERE 1=1';
        const values: any[] = [];

        if (doctor_id) {
            query += ' AND doctor_id = $' + (values.length + 1);
            values.push(doctor_id);
        }

        const sessions = await Database.queryMany(
            query + ` ORDER BY started_at DESC LIMIT $${values.length + 1}`,
            [...values, limit]
        );

        for (const session of sessions) {
            const messageCount = await Database.queryOne<{ count: number }>(
                'SELECT COUNT(*) as count FROM ai_messages WHERE ai_session_id = $1',
                [session.id]
            );
            session.message_count = messageCount?.count || 0;
        }

        res.json({ success: true, data: sessions } as ApiResponse<any>);
    } catch (error) {
        console.error('Get AI sessions error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' } as ApiResponse<null>);
    }
});

export default router;
