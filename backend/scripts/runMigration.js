import { sequelize } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(migrationFile) {
    try {
        console.log(`📄 Running migration: ${migrationFile}`);

        const migrationPath = path.join(__dirname, '..', migrationFile);
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('🔄 Executing SQL...');
        await sequelize.query(sql);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
    console.error('❌ Please provide a migration file path');
    console.error('Usage: node scripts/runMigration.js migrations/your_migration.sql');
    process.exit(1);
}

runMigration(migrationFile);
