import { Router, Request, Response } from 'express';
import { Database } from '../db/queries.js';
import { authMiddleware } from '../middleware/auth.js';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/health-metrics/devices:
 *   post:
 *     summary: Connect Health Device
 *     description: Connect a health tracking device (Apple Watch, Fitbit, etc.)
 *     tags:
 *       - Health Metrics
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
 *               - device_type
 *               - device_name
 *             properties:
 *               patient_id:
 *                 type: integer
 *               device_type:
 *                 type: string
 *                 enum: [APPLE_WATCH, FITBIT, GARMIN, OURA_RING, CONTINUOUS_GLUCOSE_MONITOR]
 *               device_name:
 *                 type: string
 *               device_id:
 *                 type: string
 *               access_token:
 *                 type: string
 *     responses:
 *       201:
 *         description: Device connected successfully
 */
router.post('/devices', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { patient_id, device_type, device_name, device_id, access_token } = req.body;

        if (!patient_id || !device_type || !device_name) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        const device = await Database.queryOne(
            `INSERT INTO connected_devices (patient_id, device_type, device_name, device_id, access_token)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [patient_id, device_type, device_name, device_id || null, access_token || null]
        );

        res.status(201).json({
            success: true,
            data: device,
        });
    } catch (error) {
        console.error('Error connecting device:', error);
        res.status(500).json({ success: false, error: 'Failed to connect device' });
    }
});

/**
 * @swagger
 * /api/health-metrics/devices/{patient_id}:
 *   get:
 *     summary: Get Connected Devices
 *     description: Get all connected health devices for a patient
 *     tags:
 *       - Health Metrics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of connected devices
 */
router.get('/devices/:patient_id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { patient_id } = req.params;

        const devices = await Database.query(
            `SELECT id, patient_id, device_type, device_name, is_active, last_sync_at, created_at 
             FROM connected_devices WHERE patient_id = $1 ORDER BY created_at DESC`,
            [patient_id]
        );

        res.json({
            success: true,
            data: devices,
        });
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch devices' });
    }
});

/**
 * @swagger
 * /api/health-metrics/devices/{id}/disconnect:
 *   patch:
 *     summary: Disconnect Device
 *     description: Disconnect a health device
 *     tags:
 *       - Health Metrics
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
 *         description: Device disconnected
 */
router.patch('/devices/:id/disconnect', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const device = await Database.queryOne(
            `UPDATE connected_devices SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );

        if (!device) {
            return res.status(404).json({ success: false, error: 'Device not found' });
        }

        res.json({
            success: true,
            data: device,
        });
    } catch (error) {
        console.error('Error disconnecting device:', error);
        res.status(500).json({ success: false, error: 'Failed to disconnect device' });
    }
});

/**
 * @swagger
 * /api/health-metrics:
 *   post:
 *     summary: Record Health Metric
 *     description: Record a health metric (heart rate, blood pressure, blood sugar, etc.)
 *     tags:
 *       - Health Metrics
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
 *               - metric_type
 *               - value
 *             properties:
 *               patient_id:
 *                 type: integer
 *               device_id:
 *                 type: integer
 *               metric_type:
 *                 type: string
 *                 enum: [HEART_RATE, BLOOD_PRESSURE_SYSTOLIC, BLOOD_PRESSURE_DIASTOLIC, BLOOD_SUGAR, TEMPERATURE, BMI, STEPS, SLEEP, OXYGEN_SATURATION]
 *               value:
 *                 type: number
 *               unit:
 *                 type: string
 *               recorded_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Metric recorded successfully
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { patient_id, device_id, metric_type, value, unit, recorded_at } = req.body;

        if (!patient_id || !metric_type || value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        const metric = await Database.queryOne(
            `INSERT INTO health_metrics (patient_id, device_id, metric_type, value, unit, recorded_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [patient_id, device_id || null, metric_type, value, unit || null, recorded_at || new Date()]
        );

        // Check for health alerts
        await checkHealthAlerts(patient_id, metric_type, value);

        res.status(201).json({
            success: true,
            data: metric,
        });
    } catch (error) {
        console.error('Error recording metric:', error);
        res.status(500).json({ success: false, error: 'Failed to record metric' });
    }
});

/**
 * @swagger
 * /api/health-metrics/{patient_id}:
 *   get:
 *     summary: Get Patient Health Metrics
 *     description: Get health metrics for a patient with optional filtering
 *     tags:
 *       - Health Metrics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: metric_type
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
 *           default: 50
 *     responses:
 *       200:
 *         description: List of health metrics
 */
router.get('/:patient_id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { patient_id } = req.params;
        const { metric_type, days = 30, page = 1, limit = 50 } = req.query;

        let query = `SELECT * FROM health_metrics WHERE patient_id = $1 AND recorded_at >= NOW() - INTERVAL '${days} days'`;
        const params: any[] = [patient_id];

        if (metric_type) {
            query += ` AND metric_type = $2`;
            params.push(metric_type);
        }

        query += ` ORDER BY recorded_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, (parseInt(page as string) - 1) * parseInt(limit as string));

        const metrics = await Database.query(query, params);

        res.json({
            success: true,
            data: metrics,
            filters: {
                patient_id,
                metric_type: metric_type || 'all',
                days,
            },
        });
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
    }
});

/**
 * @swagger
 * /api/health-metrics/alerts/{patient_id}:
 *   get:
 *     summary: Get Health Alerts
 *     description: Get health alerts for a patient
 *     tags:
 *       - Health Metrics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: unacknowledged_only
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of health alerts
 */
router.get('/alerts/:patient_id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { patient_id } = req.params;
        const { unacknowledged_only } = req.query;

        let query = `SELECT * FROM health_alerts WHERE patient_id = $1`;
        const params: any[] = [patient_id];

        if (unacknowledged_only === 'true') {
            query += ` AND is_acknowledged = false`;
        }

        query += ` ORDER BY created_at DESC`;

        const alerts = await Database.query(query, params);

        res.json({
            success: true,
            data: alerts,
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
    }
});

/**
 * @swagger
 * /api/health-metrics/alerts/{id}/acknowledge:
 *   patch:
 *     summary: Acknowledge Health Alert
 *     description: Mark a health alert as acknowledged
 *     tags:
 *       - Health Metrics
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
 *         description: Alert acknowledged
 */
router.patch('/alerts/:id/acknowledge', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const alert = await Database.queryOne(
            `UPDATE health_alerts SET is_acknowledged = true, acknowledged_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );

        if (!alert) {
            return res.status(404).json({ success: false, error: 'Alert not found' });
        }

        res.json({
            success: true,
            data: alert,
        });
    } catch (error) {
        console.error('Error acknowledging alert:', error);
        res.status(500).json({ success: false, error: 'Failed to acknowledge alert' });
    }
});

// Helper function to check health alerts
async function checkHealthAlerts(patient_id: number, metric_type: string, value: number) {
    const thresholds: any = {
        HEART_RATE: { low: 60, high: 100 },
        BLOOD_PRESSURE_SYSTOLIC: { low: 90, high: 140 },
        BLOOD_PRESSURE_DIASTOLIC: { low: 60, high: 90 },
        BLOOD_SUGAR: { low: 70, high: 180 },
        TEMPERATURE: { low: 36.1, high: 37.5 },
        BMI: { low: 18.5, high: 24.9 },
        OXYGEN_SATURATION: { low: 95, high: 100 },
    };

    const threshold = thresholds[metric_type];
    if (!threshold) return;

    let severity = 'LOW';
    let message = '';

    if (value < threshold.low) {
        severity = value < threshold.low * 0.9 ? 'HIGH' : 'MEDIUM';
        message = `${metric_type} is low: ${value}`;
    } else if (value > threshold.high) {
        severity = value > threshold.high * 1.1 ? 'HIGH' : 'MEDIUM';
        message = `${metric_type} is high: ${value}`;
    } else {
        return; // Within normal range
    }

    // Create alert
    await Database.query(
        `INSERT INTO health_alerts (patient_id, alert_type, severity, message, metric_value, threshold_value)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [patient_id, metric_type, severity, message, value, threshold.high]
    );
}

export default router;
