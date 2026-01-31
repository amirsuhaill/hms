import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/analytics/user-sessions:
 *   post:
 *     summary: Track User Session
 *     description: Record a user session for analytics
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_type
 *             properties:
 *               device_type:
 *                 type: string
 *               ip_address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session tracked
 */
router.post('/user-sessions', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        const { device_type, ip_address } = req.body;

        const session = await Database.queryOne(
            `INSERT INTO user_analytics (user_id, session_start, device_type, ip_address)
             VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
             RETURNING *`,
            [user_id, device_type || null, ip_address || null]
        );

        res.status(201).json({
            success: true,
            data: session,
        });
    } catch (error) {
        console.error('Error tracking session:', error);
        res.status(500).json({ success: false, error: 'Failed to track session' });
    }
});

/**
 * @swagger
 * /api/analytics/user-sessions/{id}/end:
 *   patch:
 *     summary: End User Session
 *     description: End a user session and record page views
 *     tags:
 *       - Analytics
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
 *               page_views:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Session ended
 */
router.patch('/user-sessions/:id/end', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { page_views } = req.body;

        const session = await Database.queryOne(
            `UPDATE user_analytics SET session_end = CURRENT_TIMESTAMP, page_views = $1 WHERE id = $2 RETURNING *`,
            [page_views || 0, id]
        );

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        res.json({
            success: true,
            data: session,
        });
    } catch (error) {
        console.error('Error ending session:', error);
        res.status(500).json({ success: false, error: 'Failed to end session' });
    }
});

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get Analytics Dashboard
 *     description: Get comprehensive analytics dashboard data
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Analytics dashboard data
 */
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 30;

        // Total users
        const totalUsers = await Database.queryOne(
            `SELECT COUNT(*) as count FROM users`
        );

        // Active users (last 30 days)
        const activeUsers = await Database.queryOne(
            `SELECT COUNT(DISTINCT user_id) as count FROM user_analytics 
             WHERE session_start >= NOW() - INTERVAL '${days} days'`
        );

        // New users (last 30 days)
        const newUsers = await Database.queryOne(
            `SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '${days} days'`
        );

        // Average session time
        const avgSessionTime = await Database.queryOne(
            `SELECT AVG(EXTRACT(EPOCH FROM (session_end - session_start))/60) as avg_minutes 
             FROM user_analytics 
             WHERE session_end IS NOT NULL AND session_start >= NOW() - INTERVAL '${days} days'`
        );

        // Device breakdown
        const deviceBreakdown = await Database.query(
            `SELECT device_type, COUNT(*) as count FROM user_analytics 
             WHERE session_start >= NOW() - INTERVAL '${days} days' 
             GROUP BY device_type`
        );

        // User roles breakdown
        const roleBreakdown = await Database.query(
            `SELECT role, COUNT(*) as count FROM users GROUP BY role`
        );

        // Appointments (last 30 days)
        const appointments = await Database.queryOne(
            `SELECT COUNT(*) as count FROM appointments 
             WHERE created_at >= NOW() - INTERVAL '${days} days'`
        );

        // Completed appointments
        const completedAppointments = await Database.queryOne(
            `SELECT COUNT(*) as count FROM appointments 
             WHERE status = 'COMPLETED' AND created_at >= NOW() - INTERVAL '${days} days'`
        );

        // Lab tests
        const labTests = await Database.queryOne(
            `SELECT COUNT(*) as count FROM lab_test_orders 
             WHERE created_at >= NOW() - INTERVAL '${days} days'`
        );

        // Prescriptions
        const prescriptions = await Database.queryOne(
            `SELECT COUNT(*) as count FROM prescriptions 
             WHERE created_at >= NOW() - INTERVAL '${days} days'`
        );

        res.json({
            success: true,
            data: {
                summary: {
                    total_users: totalUsers?.count || 0,
                    active_users: activeUsers?.count || 0,
                    new_users: newUsers?.count || 0,
                    avg_session_time_minutes: Math.round(avgSessionTime?.avg_minutes || 0),
                },
                appointments: {
                    total: appointments?.count || 0,
                    completed: completedAppointments?.count || 0,
                },
                clinical: {
                    lab_tests: labTests?.count || 0,
                    prescriptions: prescriptions?.count || 0,
                },
                breakdown: {
                    by_device: deviceBreakdown,
                    by_role: roleBreakdown,
                },
                period_days: days,
            },
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});

/**
 * @swagger
 * /api/analytics/system-metrics:
 *   post:
 *     summary: Record System Metric
 *     description: Record system performance metric (CPU, Memory, Storage, etc.)
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metric_type
 *               - metric_value
 *             properties:
 *               metric_type:
 *                 type: string
 *                 enum: [CPU_USAGE, MEMORY_USAGE, STORAGE_USAGE, NETWORK_LATENCY, ACTIVE_USERS, API_REQUESTS]
 *               metric_value:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Metric recorded
 */
router.post('/system-metrics', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { metric_type, metric_value, unit } = req.body;

        if (!metric_type || metric_value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        const metric = await Database.queryOne(
            `INSERT INTO system_metrics (metric_type, metric_value, unit, recorded_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             RETURNING *`,
            [metric_type, metric_value, unit || null]
        );

        res.status(201).json({
            success: true,
            data: metric,
        });
    } catch (error) {
        console.error('Error recording system metric:', error);
        res.status(500).json({ success: false, error: 'Failed to record metric' });
    }
});

/**
 * @swagger
 * /api/analytics/system-metrics:
 *   get:
 *     summary: Get System Metrics
 *     description: Get system performance metrics
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metric_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *     responses:
 *       200:
 *         description: System metrics
 */
router.get('/system-metrics', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { metric_type, hours = 24 } = req.query;

        let query = `SELECT * FROM system_metrics WHERE recorded_at >= NOW() - INTERVAL '${hours} hours'`;
        const params: any[] = [];

        if (metric_type) {
            query += ` AND metric_type = $1`;
            params.push(metric_type);
        }

        query += ` ORDER BY recorded_at DESC`;

        const metrics = await Database.query(query, params);

        res.json({
            success: true,
            data: metrics,
            filters: {
                metric_type: metric_type || 'all',
                hours,
            },
        });
    } catch (error) {
        console.error('Error fetching system metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
    }
});

/**
 * @swagger
 * /api/analytics/user-satisfaction:
 *   get:
 *     summary: Get User Satisfaction Metrics
 *     description: Get user satisfaction and engagement metrics
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User satisfaction data
 */
router.get('/user-satisfaction', authMiddleware, async (req: Request, res: Response) => {
    try {
        // Return rate (users with multiple sessions)
        const returnRate = await Database.queryOne(
            `SELECT COUNT(DISTINCT user_id) as returning_users,
                    (SELECT COUNT(DISTINCT user_id) FROM user_analytics WHERE session_start >= NOW() - INTERVAL '30 days') as total_active
             FROM user_analytics 
             WHERE user_id IN (
                SELECT user_id FROM user_analytics GROUP BY user_id HAVING COUNT(*) > 1
             ) AND session_start >= NOW() - INTERVAL '30 days'`
        );

        // Mobile vs Desktop
        const deviceUsage = await Database.query(
            `SELECT device_type, COUNT(*) as sessions, COUNT(DISTINCT user_id) as users
             FROM user_analytics 
             WHERE session_start >= NOW() - INTERVAL '30 days'
             GROUP BY device_type`
        );

        // Peak usage times
        const peakUsage = await Database.query(
            `SELECT EXTRACT(HOUR FROM session_start) as hour, COUNT(*) as sessions
             FROM user_analytics 
             WHERE session_start >= NOW() - INTERVAL '7 days'
             GROUP BY EXTRACT(HOUR FROM session_start)
             ORDER BY sessions DESC LIMIT 5`
        );

        res.json({
            success: true,
            data: {
                return_rate: returnRate,
                device_usage: deviceUsage,
                peak_usage_hours: peakUsage,
            },
        });
    } catch (error) {
        console.error('Error fetching satisfaction metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
    }
});

export default router;
