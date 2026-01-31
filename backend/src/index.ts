import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import patientRoutes from './routes/patients';
import doctorRoutes from './routes/doctors';
import staffRoutes from './routes/staff';
import departmentRoutes from './routes/departments';
import appointmentRoutes from './routes/appointments';
import visitRoutes from './routes/visits';
import diagnosisRoutes from './routes/diagnoses';
import toothNodeRoutes from './routes/toothNodes';
import clinicalFindingRoutes from './routes/clinicalFindings';
import labTestRoutes from './routes/labTests';
import treatmentPlanRoutes from './routes/treatmentPlans';
import wardRoutes from './routes/wards';
import admissionRoutes from './routes/admissions';
import invoiceRoutes from './routes/invoices';
import aiRoutes from './routes/ai';
import prescriptionRoutes from './routes/prescriptions';
import drugRoutes from './routes/drugs';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import healthMetricsRoutes from './routes/healthMetrics';
import analyticsRoutes from './routes/analytics';
import inventoryRoutes from './routes/inventory';

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

// Start server
app.listen(config.port, () => {

    console.log(`   🌐 API Server:        http://localhost:${config.port}`);
    console.log(`   📚 Swagger UI:        http://localhost:${config.port}/api-docs`);
    console.log(`   ✅ Health Check:      http://localhost:${config.port}/health`);

});
