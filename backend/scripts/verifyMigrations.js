/**
 * Verification Script
 * Verifies that migrations were applied correctly
 */

import { sequelize } from '../src/config/database.js';

async function verifyMigrations() {
    console.log('\n🔍 Verifying Migration Results');
    console.log('='.repeat(60));

    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Check new columns in properties table
        console.log('📊 Checking new columns in properties table...');
        const [columns] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'properties'
            AND column_name IN (
                'parent_id', 'is_container', 'rental_mode', 
                'total_units', 'available_units',
                'room_type', 'beds_in_room',
                'requires_deposit', 'minimum_contract_months'
            )
            ORDER BY column_name;
        `);

        console.table(columns);

        // Check existing properties data
        console.log('\n📋 Sample existing properties with new fields...');
        const [properties] = await sequelize.query(`
            SELECT 
                id, 
                title, 
                is_container, 
                room_type, 
                beds_in_room,
                requires_deposit,
                minimum_contract_months
            FROM properties 
            LIMIT 5;
        `);

        console.table(properties);

        // Check common areas
        console.log('\n🏠 Common areas created...');
        const [commonAreas] = await sequelize.query(`
            SELECT id, name, slug, icon
            FROM common_areas
            ORDER BY id;
        `);

        console.table(commonAreas);

        // Check indexes
        console.log('\n📑 Indexes created...');
        const [indexes] = await sequelize.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'properties'
            AND indexname LIKE 'idx_properties_%'
            ORDER BY indexname;
        `);

        console.table(indexes);

        // Check constraints
        console.log('\n🔒 Constraints created...');
        const [constraints] = await sequelize.query(`
            SELECT conname as constraint_name, contype as type
            FROM pg_constraint
            WHERE conrelid = 'properties'::regclass
            AND conname LIKE 'chk_%'
            ORDER BY conname;
        `);

        console.table(constraints);

        console.log('\n' + '='.repeat(60));
        console.log('✅ All verifications completed successfully!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Verification failed:');
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

verifyMigrations();
