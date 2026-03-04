import { sequelize } from '../src/config/database.js';

async function runMigration() {
    console.log('\n🚀 Starting Database Migration: Add Payment Request Columns');
    console.log('='.repeat(60));

    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // 1. Check if ENUM exists, if not create it
        const [enumCheck] = await sequelize.query(`
            SELECT 1 FROM pg_type WHERE typname = 'enum_payment_requests_payment_method';
        `);

        if (enumCheck.length === 0) {
            console.log('Creating ENUM enum_payment_requests_payment_method...');
            await sequelize.query(`
                CREATE TYPE enum_payment_requests_payment_method AS ENUM ('bank_transfer', 'mercado_pago');
            `);
        }

        // 2. Add columns if they don't exist
        const [colCheck] = await sequelize.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'payment_requests'
            AND column_name = 'payment_method';
        `);

        if (colCheck.length === 0) {
            console.log('Adding column payment_method...');
            await sequelize.query(`
                ALTER TABLE payment_requests
                ADD COLUMN payment_method enum_payment_requests_payment_method NOT NULL DEFAULT 'bank_transfer';
            `);
        }

        const [colCheck2] = await sequelize.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'payment_requests'
            AND column_name = 'mercado_pago_payment_id';
        `);

        if (colCheck2.length === 0) {
            console.log('Adding column mercado_pago_payment_id...');
            await sequelize.query(`
                ALTER TABLE payment_requests
                ADD COLUMN mercado_pago_payment_id VARCHAR(255);
            `);
        }

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed with error:');
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

runMigration();
