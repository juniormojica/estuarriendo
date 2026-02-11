import { sequelize } from '../src/config/database.js';

async function runMigration() {
    try {
        console.log('Starting migration...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // Run raw SQL to alter the column
        await sequelize.query('ALTER TABLE user_verification_documents ALTER COLUMN utility_bill DROP NOT NULL;');

        console.log('✅ Migration successful: utility_bill is now nullable');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
