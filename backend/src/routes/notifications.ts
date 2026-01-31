import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create Notification
 *     description: Create a notification for a user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - type
 *               - title
 *               - message
 *             properties:
 *               user_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [APPOINTMENT, LAB_RESULT, PRESCRIPTION, ADMISSION, DISCHARGE, MESSAGE, ALERT, SYSTEM]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               related_entity_type:
 *                 type: string
 *               related_entity_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, type, title, message, related_entity_type, related_entity_id } = req.body;

        if (!user_id || !type || !title || !message) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
            return;
        }

        const notification = await Database.queryOne(
            `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [user_id, type, title, message, related_entity_type || null, related_entity_id || null]
        );

        res.status(201).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ success: false, error: 'Failed to create notification' });
        return;
    }
});

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get Notifications
 *     description: Get all notifications for the current user
 *     tags:
 *       - Notifications
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
 *         description: List of notifications
 */
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = (req as any).user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const unread_only = req.query.unread_only === 'true';

        let query = `SELECT * FROM notifications WHERE user_id = $1`;
        const params: any[] = [user_id];

        if (unread_only) {
            query += ` AND is_read = false`;
        }

        query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        params.push(limit, (page - 1) * limit);

        const notifications = await Database.query(query, params);

        const countResult = await Database.queryOne(
            `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 ${unread_only ? 'AND is_read = false' : ''}`,
            [user_id]
        );

        res.json({
            success: true,
            data: notifications,
            pagination: {
                total: countResult?.count || 0,
                page,
                limit,
                unread_count: unread_only ? notifications.rows.length : (await Database.queryOne(
                    `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
                    [user_id]
                ))?.count || 0,
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
        return;
    }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get Notification Details
 *     description: Get a specific notification and mark as read
 *     tags:
 *       - Notifications
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
 *         description: Notification details
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        const notification = await Database.queryOne(
            `SELECT * FROM notifications WHERE id = $1 AND user_id = $2`,
            [id, user_id]
        );

        if (!notification) {
            res.status(404).json({ success: false, error: 'Notification not found' });
            return;
        }

        // Mark as read
        if (!notification.is_read) {
            await Database.query(
                `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [id]
            );
            notification.is_read = true;
        }

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notification' });
        return;
    }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark Notification as Read
 *     description: Mark a notification as read
 *     tags:
 *       - Notifications
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
 *         description: Notification marked as read
 */
router.patch('/:id/read', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        const notification = await Database.queryOne(
            `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP 
             WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, user_id]
        );

        if (!notification) {
            res.status(404).json({ success: false, error: 'Notification not found' });
            return;
        }

        res.json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
        return;
    }
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark All Notifications as Read
 *     description: Mark all unread notifications as read for the current user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/read-all', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = (req as any).user?.id;

        await Database.query(
            `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP 
             WHERE user_id = $1 AND is_read = false`,
            [user_id]
        );

        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
        return;
    }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete Notification
 *     description: Delete a notification
 *     tags:
 *       - Notifications
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
 *         description: Notification deleted
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user_id = (req as any).user?.id;

        const result = await Database.query(
            `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
            [id, user_id]
        );

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, error: 'Failed to delete notification' });
        return;
    }
});

export default router;
