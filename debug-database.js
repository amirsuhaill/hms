const { Pool } = require('pg');

// Database connection (update with your actual database credentials)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hms_db',
    password: 'password',
    port: 5432,
});

async function debugDatabase() {
    try {
        console.log('=== DATABASE DEBUG ===\n');

        // Check all treatment plans
        console.log('1. All treatment plans:');
        const allPlans = await pool.query(`
            SELECT tp.id, tp.plan_name, tp.status, tp.patient_id, tp.doctor_id,
                   p.first_name, p.last_name, p.hospital_mrn
            FROM treatment_plans tp
            JOIN patients p ON tp.patient_id = p.id
            ORDER BY tp.created_at DESC
        `);
        console.table(allPlans.rows);

        // Check all patients
        console.log('\n2. All patients:');
        const allPatients = await pool.query(`
            SELECT id, first_name, last_name, hospital_mrn
            FROM patients
            ORDER BY first_name
        `);
        console.table(allPatients.rows);

        // Check all doctors
        console.log('\n3. All doctors:');
        const allDoctors = await pool.query(`
            SELECT d.id, d.user_id, u.email
            FROM doctors d
            JOIN users u ON d.user_id = u.id
        `);
        console.table(allDoctors.rows);

        // Check specific patient "Adba Akhtar"
        console.log('\n4. Looking for Adba Akhtar:');
        const adbaPatient = await pool.query(`
            SELECT id, first_name, last_name, hospital_mrn
            FROM patients
            WHERE first_name ILIKE '%adba%' OR last_name ILIKE '%akhtar%'
        `);
        console.table(adbaPatient.rows);

        // Check treatment plans with CANCELLED status
        console.log('\n5. Treatment plans with CANCELLED status:');
        const cancelledPlans = await pool.query(`
            SELECT tp.id, tp.plan_name, tp.status, tp.patient_id,
                   p.first_name, p.last_name
            FROM treatment_plans tp
            JOIN patients p ON tp.patient_id = p.id
            WHERE tp.status = 'CANCELLED'
        `);
        console.table(cancelledPlans.rows);

        // Test the exact query that should be running
        console.log('\n6. Testing filter query (assuming doctor_id = 1):');
        const filterTest = await pool.query(`
            SELECT tp.*, p.first_name, p.last_name, p.hospital_mrn 
            FROM treatment_plans tp
            JOIN patients p ON tp.patient_id = p.id
            WHERE tp.doctor_id = $1 AND tp.status = $2
            ORDER BY tp.created_at DESC
        `, [1, 'CANCELLED']);
        console.table(filterTest.rows);

    } catch (error) {
        console.error('Database debug error:', error);
    } finally {
        await pool.end();
    }
}

debugDatabase();