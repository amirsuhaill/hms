import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hospital Management System API',
            version: '1.0.0',
            description: 'Comprehensive REST API for Hospital Management System with patient management, appointments, lab tests, treatments, and more.',
            contact: {
                name: 'HMS Support',
                email: 'support@hms.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development Server',
            },
            {
                url: 'https://api.hms.com',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token for authentication',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['ADMIN', 'STAFF', 'DOCTOR', 'PATIENT'] },
                        is_active: { type: 'boolean' },
                        last_login_at: { type: 'string', format: 'date-time' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                Patient: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        hospital_mrn: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        dob: { type: 'string', format: 'date' },
                        gender: { type: 'string', enum: ['M', 'F', 'Other'] },
                        phone: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        address: { type: 'string' },
                        blood_group: { type: 'string' },
                        emergency_name: { type: 'string' },
                        emergency_phone: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                Doctor: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        registration_no: { type: 'string' },
                        specialization: { type: 'string' },
                        department_id: { type: 'integer' },
                        consult_fee: { type: 'number', format: 'decimal' },
                        experience_years: { type: 'integer' },
                        signature_url: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                Appointment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        patient_id: { type: 'integer' },
                        doctor_id: { type: 'integer' },
                        scheduled_datetime: { type: 'string', format: 'date-time' },
                        visit_type: { type: 'string', enum: ['OPD', 'FOLLOW_UP', 'EMERGENCY'] },
                        status: { type: 'string', enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] },
                        reason: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                Visit: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        patient_id: { type: 'integer' },
                        doctor_id: { type: 'integer' },
                        appointment_id: { type: 'integer' },
                        visit_type: { type: 'string', enum: ['OPD', 'IPD'] },
                        visit_started_at: { type: 'string', format: 'date-time' },
                        visit_ended_at: { type: 'string', format: 'date-time' },
                        chief_complaint: { type: 'string' },
                        notes_soap: { type: 'string' },
                        status: { type: 'string', enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                LabTest: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        code: { type: 'string' },
                        name: { type: 'string' },
                        category: { type: 'string' },
                        default_price: { type: 'number', format: 'decimal' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Appointment_Response: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { $ref: '#/components/schemas/Appointment' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        error: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
