import { sequelize } from './src/config/database.js';
import models from './src/models/index.js';

async function setup() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();

        console.log('Altering enum...');
        try {
            await sequelize.query(`ALTER TYPE "enum_property_reports_status" ADD VALUE IF NOT EXISTS 'investigating';`);
        } catch (e) {
            console.log('Enum value investigating might exist. Error:', e.message);
        }

        console.log('Creating ENUM type for actions...');
        try {
            await sequelize.query(`CREATE TYPE "enum_report_activity_logs_action" AS ENUM('contact_attempt', 'note_added', 'owner_contacted', 'owner_confirmed_rented', 'owner_denied', 'confirmed', 'rejected');`);
        } catch (e) {
            console.log('Enum type action might exist. Error:', e.message);
        }

        console.log('Creating ReportActivityLog table directly...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS report_activity_logs (
                id SERIAL PRIMARY KEY,
                report_id INTEGER NOT NULL REFERENCES property_reports(id) ON DELETE CASCADE ON UPDATE CASCADE,
                admin_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                action enum_report_activity_logs_action NOT NULL,
                notes TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error('Setup failed:', e);
        process.exit(1);
    }
}

setup();
