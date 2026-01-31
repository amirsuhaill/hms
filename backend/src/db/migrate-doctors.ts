import { Database } from './queries.js';

async function migrateDoctors() {
    try {
        console.log('🔄 Running doctors table migration...');

        // Add columns if they don't exist
        await Database.query(`
            ALTER TABLE doctors 
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)
        `);

        // Update existing doctors with sample names if they don't have names
        await Database.query(`
            UPDATE doctors 
            SET first_name = 'Sarah', last_name = 'Johnson'
            WHERE first_name IS NULL OR last_name IS NULL
        `);

        // Make the columns NOT NULL after updating (only if there are records)
        const doctorCount = await Database.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM doctors');
        if (doctorCount && doctorCount.count > 0) {
            await Database.query(`
                ALTER TABLE doctors 
                ALTER COLUMN first_name SET NOT NULL,
                ALTER COLUMN last_name SET NOT NULL
            `);
        }

        console.log('✅ Doctors table migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

migrateDoctors();