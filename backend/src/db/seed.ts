import { Database } from './queries.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

async function seed() {
    try {
        console.log('🌱 Starting database seed...');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', config.bcrypt.rounds);
        const admin = await Database.queryOne(
            `INSERT INTO users (email, password_hash, role, is_active)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (email) DO NOTHING
             RETURNING *`,
            ['admin@hms.com', adminPassword, 'ADMIN']
        );
        console.log('✓ Admin user created');

        // Create doctor user
        const doctorPassword = await bcrypt.hash('doctor123', config.bcrypt.rounds);
        let doctor = await Database.queryOne(
            `INSERT INTO users (email, password_hash, role, is_active)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
             RETURNING *`,
            ['doctor@hms.com', doctorPassword, 'DOCTOR']
        );
        
        // If still null, get existing user
        if (!doctor) {
            doctor = await Database.queryOne('SELECT * FROM users WHERE email = $1', ['doctor@hms.com']);
        }
        console.log('✓ Doctor user created');

        // Create staff user
        const staffPassword = await bcrypt.hash('staff123', config.bcrypt.rounds);
        const staff = await Database.queryOne(
            `INSERT INTO users (email, password_hash, role, is_active)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (email) DO NOTHING
             RETURNING *`,
            ['staff@hms.com', staffPassword, 'STAFF']
        );
        console.log('✓ Staff user created');

        // Create patient user
        const patientPassword = await bcrypt.hash('patient123', config.bcrypt.rounds);
        const patient = await Database.queryOne(
            `INSERT INTO users (email, password_hash, role, is_active)
             VALUES ($1, $2, $3, true)
             ON CONFLICT (email) DO NOTHING
             RETURNING *`,
            ['patient@hms.com', patientPassword, 'PATIENT']
        );
        console.log('✓ Patient user created');

        // Create departments
        await Database.query(
            `INSERT INTO departments (name, code, floor)
             VALUES ($1, $2, $3)
             ON CONFLICT (code) DO NOTHING`,
            ['Dentistry', 'DENT', '2']
        );

        await Database.query(
            `INSERT INTO departments (name, code, floor)
             VALUES ($1, $2, $3)
             ON CONFLICT (code) DO NOTHING`,
            ['General Medicine', 'GM', '1']
        );

        console.log('✓ Departments created');

        // Create doctor profile
        if (doctor) {
            console.log('Doctor user found:', doctor.id);
            const existingDoctor = await Database.queryOne('SELECT id FROM doctors WHERE user_id = $1', [doctor.id]);
            console.log('Existing doctor:', existingDoctor);
            if (!existingDoctor) {
                const newDoctor = await Database.queryOne(
                    `INSERT INTO doctors (user_id, registration_no, specialization, department_id, consult_fee, experience_years, first_name, last_name)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                    [doctor.id, 'DMC-001', 'Dentistry', 1, 500, 10, 'Sarah', 'Johnson']
                );
                console.log('✓ Doctor profile created:', newDoctor);
            } else {
                console.log('✓ Doctor profile already exists');
            }
        } else {
            console.log('No doctor user found');
        }

        // Create staff profile
        if (staff) {
            await Database.query(
                `INSERT INTO staff (user_id, staff_type, department_id)
                 VALUES ($1, $2, $3)
                 ON CONFLICT DO NOTHING`,
                [staff.id, 'RECEPTIONIST', 1]
            );
            console.log('✓ Staff profile created');
        }

        // Create patient
        if (patient) {
            await Database.query(
                `INSERT INTO patients (user_id, hospital_mrn, first_name, last_name, dob, gender, phone, email, blood_group)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 ON CONFLICT (hospital_mrn) DO NOTHING`,
                [patient.id, 'HMS-001-2025', 'John', 'Doe', '1990-05-15', 'M', '9876543210', 'patient@hms.com', 'O+']
            );
            console.log('✓ Patient created');
        }

        // Create lab tests
        await Database.query(
            `INSERT INTO lab_tests_master (code, name, category, default_price)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (code) DO NOTHING`,
            ['CBC', 'Complete Blood Count', 'PATHOLOGY', 500]
        );

        await Database.query(
            `INSERT INTO lab_tests_master (code, name, category, default_price)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (code) DO NOTHING`,
            ['RBS', 'Random Blood Sugar', 'BIOCHEMISTRY', 150]
        );

        console.log('✓ Lab tests created');

        // Create procedures
        await Database.query(
            `INSERT INTO procedures_master (code, name, category, default_duration_minutes, default_cost)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (code) DO NOTHING`,
            ['RC001', 'Root Canal', 'ENDODONTICS', 60, 3000]
        );

        await Database.query(
            `INSERT INTO procedures_master (code, name, category, default_duration_minutes, default_cost)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (code) DO NOTHING`,
            ['FILL001', 'Filling', 'RESTORATIVE', 30, 1000]
        );

        console.log('✓ Procedures created');

        // Create materials
        await Database.query(
            `INSERT INTO materials_master (name, unit, stock_qty, unit_cost, reorder_level)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (name) DO NOTHING`,
            ['Gutta Percha', 'piece', 100, 50, 20]
        );

        await Database.query(
            `INSERT INTO materials_master (name, unit, stock_qty, unit_cost, reorder_level)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (name) DO NOTHING`,
            ['Composite Resin', 'syringe', 50, 200, 10]
        );

        console.log('✓ Materials created');

        // Create wards
        await Database.query(
            `INSERT INTO wards (name, ward_type, floor, total_beds)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            ['General Ward A', 'GENERAL', '3', 10]
        );

        console.log('✓ Wards created');

        // Create beds
        const ward = await Database.queryOne('SELECT id FROM wards LIMIT 1');
        if (ward) {
            for (let i = 1; i <= 5; i++) {
                await Database.query(
                    `INSERT INTO beds (ward_id, bed_number, status)
                     VALUES ($1, $2, 'AVAILABLE')
                     ON CONFLICT (ward_id, bed_number) DO NOTHING`,
                    [ward.id, `A-${String(i).padStart(3, '0')}`]
                );
            }
            console.log('✓ Beds created');
        }

        // Create sample appointments
        const doctorProfile = await Database.queryOne('SELECT id FROM doctors LIMIT 1');
        const patientProfile = await Database.queryOne('SELECT id FROM patients LIMIT 1');
        
        if (doctorProfile && patientProfile) {
            // Create a few sample appointments
            const appointments = [
                {
                    scheduled_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                    visit_type: 'OPD',
                    reason: 'Regular checkup',
                    status: 'SCHEDULED'
                },
                {
                    scheduled_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
                    visit_type: 'FOLLOW_UP',
                    reason: 'Follow-up consultation',
                    status: 'SCHEDULED'
                },
                {
                    scheduled_datetime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                    visit_type: 'OPD',
                    reason: 'Dental cleaning',
                    status: 'COMPLETED'
                }
            ];

            for (const apt of appointments) {
                await Database.query(
                    `INSERT INTO appointments (patient_id, doctor_id, scheduled_datetime, visit_type, reason, status, created_by)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT DO NOTHING`,
                    [patientProfile.id, doctorProfile.id, apt.scheduled_datetime, apt.visit_type, apt.reason, apt.status, staff?.id]
                );
            }
            console.log('✓ Sample appointments created');
        }

        console.log('✅ Database seed completed successfully!');
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seed();
