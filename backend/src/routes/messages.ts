import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send Message
 *     description: Send a message to another user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_id
 *               - content
 *             properties:
 *               recipient_id:
 *                 type: integer
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const sender_id = (req as any).user?.id;
        const { recipient_id, subject, content } = req.body;

        if (!recipient_id || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: recipient_id, content',
            });
        }

        if (sender_id === recipient_id) {
            return res.status(400).json({
                success: false,
                error: 'Cannot send message to yourself',
            });
        }

        // Create message
        const message = await Database.queryOne(
            `INSERT INTO messages (sender_id, recipient_id, subject, content)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [sender_id, recipient_id, subject || null, content]
        );

        // Update or create conversation
        const conversation = await Database.queryOne(
            `SELECT * FROM conversations 
             WHERE (user_id_1 = $1 AND user_id_2 = $2) 
             OR (user_id_1 = $2 AND user_id_2 = $1)`,
            [sender_id, recipient_id]
        );

        if (conversation) {
            await Database.query(
                `UPDATE conversations SET last_message_id = $1, last_message_at = CURRENT_TIMESTAMP 
                 WHERE id = $2`,
                [message.id, conversation.id]
            );
        } else {
            await Database.query(
                `INSERT INTO conversations (user_id_1, user_id_2, last_message_id, last_message_at)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
                [sender_id, recipient_id, message.id]
            );
        }

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

/**
 * @swagger
 * /api/messages/inbox:
 *   get:
 *     summary: Get Inbox Messages
 *     description: Get all messages received by the current user
 *     tags:
 *       - Messages
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
 *         name: unread_only
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/inbox', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const unread_only = req.query.unread_only === 'true';

        let query = `SELECT m.*, u.email as sender_email FROM messages m 
                     JOIN users u ON m.sender_id = u.id
                     WHERE m.recipient_id = $1`;
        const params: any[] = [user_id];

        if (unread_only) {
            query += ` AND m.is_read = false`;
        }

        query += ` ORDER BY m.created_at DESC LIMIT $2 OFFSET $3`;
        params.push(limit, (page - 1) * limit);

        const messages = await Database.query(query, params);

        const countResult = await Database.queryOne(
            `SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 ${unread_only ? 'AND is_read = false' : ''}`,
            [user_id]
        );

        res.json({
            success: true,
            data: messages,
            pagination: {
                total: countResult?.count || 0,
                page,
                limit,
            },
        });
    } catch (error) {
        console.error('Error fetching inbox:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch inbox' });
    }
});

/**
 * @swagger
 * /api/messages/sent:
 *   get:
 *     summary: Get Sent Messages
 *     description: Get all messages sent by the current user
 *     tags:
 *       - Messages
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
 *     responses:
 *       200:
 *         description: List of sent messages
 */
router.get('/sent', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const messages = await Database.query(
            `SELECT m.*, u.email as recipient_email FROM messages m 
             JOIN users u ON m.recipient_id = u.id
             WHERE m.sender_id = $1
             ORDER BY m.created_at DESC LIMIT $2 OFFSET $3`,
            [user_id, limit, (page - 1) * limit]
        );

        const countResult = await Database.queryOne(
            `SELECT COUNT(*) as count FROM messages WHERE sender_id = $1`,
            [user_id]
        );

        res.json({
            success: true,
            data: messages,
            pagination: {
                total: countResult?.count || 0,
                page,
                limit,
            },
        });
    } catch (error) {
        console.error('Error fetching sent messages:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch sent messages' });
    }
});

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get Message Details
 *     description: Get a specific message and mark as read
 *     tags:
 *       - Messages
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
 *         description: Message details
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        const message = await Database.queryOne(
            `SELECT m.*, u.email as sender_email FROM messages m 
             JOIN users u ON m.sender_id = u.id
             WHERE m.id = $1`,
            [id]
        );

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        // Mark as read if recipient
        if (message.recipient_id === user_id && !message.is_read) {
            await Database.query(
                `UPDATE messages SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [id]
            );
            message.is_read = true;
            message.read_at = new Date();
        }

        res.json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch message' });
    }
});

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get Conversations
 *     description: Get all conversations for the current user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;

        const conversations = await Database.query(
            `SELECT c.*, 
                    CASE WHEN c.user_id_1 = $1 THEN u2.email ELSE u1.email END as other_user_email,
                    CASE WHEN c.user_id_1 = $1 THEN u2.id ELSE u1.id END as other_user_id,
                    m.content as last_message_content
             FROM conversations c
             LEFT JOIN users u1 ON c.user_id_1 = u1.id
             LEFT JOIN users u2 ON c.user_id_2 = u2.id
             LEFT JOIN messages m ON c.last_message_id = m.id
             WHERE c.user_id_1 = $1 OR c.user_id_2 = $1
             ORDER BY c.last_message_at DESC`,
            [user_id]
        );

        res.json({
            success: true,
            data: conversations,
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
});

/**
 * @swagger
 * /api/messages/conversation/{user_id}:
 *   get:
 *     summary: Get Conversation with User
 *     description: Get all messages in a conversation with a specific user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Conversation messages
 */
router.get('/conversation/:user_id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const current_user_id = (req as any).user?.id;
        const { user_id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const messages = await Database.query(
            `SELECT m.*, u.email as sender_email FROM messages m 
             JOIN users u ON m.sender_id = u.id
             WHERE (m.sender_id = $1 AND m.recipient_id = $2) 
             OR (m.sender_id = $2 AND m.recipient_id = $1)
             ORDER BY m.created_at DESC LIMIT $3 OFFSET $4`,
            [current_user_id, user_id, limit, (page - 1) * limit]
        );

        // Mark all messages from the other user as read
        await Database.query(
            `UPDATE messages SET is_read = true, read_at = CURRENT_TIMESTAMP 
             WHERE sender_id = $1 AND recipient_id = $2 AND is_read = false`,
            [user_id, current_user_id]
        );

        res.json({
            success: true,
            data: messages.rows.reverse(),
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
    }
});

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete Message
 *     description: Delete a message (only sender can delete)
 *     tags:
 *       - Messages
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
 *         description: Message deleted
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        const message = await Database.queryOne(
            `SELECT * FROM messages WHERE id = $1`,
            [id]
        );

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        if (message.sender_id !== user_id) {
            return res.status(403).json({ success: false, error: 'Only sender can delete message' });
        }

        await Database.query(`DELETE FROM messages WHERE id = $1`, [id]);

        res.json({
            success: true,
            message: 'Message deleted',
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
});

export default router;
