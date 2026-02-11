/**
 * Migration Runner Script
 * Executes database migrations for property container architecture
 * 
 * Usage: node runMigrations.js
 */

import { sequelize } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// Migrations to run in order
const MIGRATIONS = [
    '20260111_add_property_container_architecture.sql',
    '20260111_create_common_areas.sql'
];

async function runMigration(filename) {
    console.log(`\n📄 Running migration: ${filename}`);
    console.log('─'.repeat(60));

    const filePath = path.join(MIGRATIONS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found: ${filePath}`);
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    try {
        await sequelize.query(sql);
        console.log(`✅ Migration completed successfully: ${filename}`);
    } catch (error) {
        console.error(`❌ Migration failed: ${filename}`);
        throw error;
    }
}

async function runAllMigrations() {
    console.log('\n🚀 Starting Database Migrations');
    console.log('='.repeat(60));

    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Run migrations in order
        for (const migration of MIGRATIONS) {
            await runMigration(migration);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 All migrations completed successfully!');
        console.log('='.repeat(60));

        // Verify changes
        console.log('\n📊 Verifying database structure...');
        const [results] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'properties'
            AND column_name IN (
                'parent_id', 'is_container', 'rental_mode', 
                'room_type', 'requires_deposit', 'minimum_contract_months'
            )
            ORDER BY column_name;
        `);

        console.log('\n✅ New columns in properties table:');
        console.table(results);

        const [commonAreas] = await sequelize.query(`
            SELECT id, name, slug FROM common_areas LIMIT 5;
        `);

        console.log('\n✅ Sample common areas:');
        console.table(commonAreas);

    } catch (error) {
        console.error('\n❌ Migration failed with error:');
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run migrations
runAllMigrations();
