import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import patientRoutes from './routes/patients.js';
import doctorRoutes from './routes/doctors.js';
import staffRoutes from './routes/staff.js';
import departmentRoutes from './routes/departments.js';
import appointmentRoutes from './routes/appointments.js';
import visitRoutes from './routes/visits.js';
import diagnosisRoutes from './routes/diagnoses.js';
import toothNodeRoutes from './routes/toothNodes.js';
import clinicalFindingRoutes from './routes/clinicalFindings.js';
import labTestRoutes from './routes/labTests.js';
import treatmentPlanRoutes from './routes/treatmentPlans.js';
import wardRoutes from './routes/wards.js';
import admissionRoutes from './routes/admissions.js';
import invoiceRoutes from './routes/invoices.js';
import aiRoutes from './routes/ai.js';
import prescriptionRoutes from './routes/prescriptions.js';
import drugRoutes from './routes/drugs.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import healthMetricsRoutes from './routes/healthMetrics.js';
import analyticsRoutes from './routes/analytics.js';
import inventoryRoutes from './routes/inventory.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));

// Rate limiting ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/tooth-nodes', toothNodeRoutes);
app.use('/api/clinical-findings', clinicalFindingRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/treatment-plans', treatmentPlanRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health-metrics', healthMetricsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inventory', inventoryRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Export for Vercel serverless
export default app;

// Start server locally (only when not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    app.listen(config.port, () => {
        console.log(`   🌐 API Server:        http://localhost:${config.port}`);
        console.log(`   📚 Swagger UI:        http://localhost:${config.port}/api-docs`);
        console.log(`   ✅ Health Check:      http://localhost:${config.port}/health`);
    });
}
