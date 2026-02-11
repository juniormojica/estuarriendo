import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { sequelize } from '../src/config/database.js';

async function migrate() {
    try {
        console.log('Starting migration to add verification notification types...');

        // Add verification_submitted
        try {
            await sequelize.query("ALTER TYPE enum_notifications_type ADD VALUE 'verification_submitted'");
            console.log("Added 'verification_submitted' to enum");
        } catch (e) {
            console.log("'verification_submitted' might already exist or error:", e.message);
        }

        // Add verification_approved
        try {
            await sequelize.query("ALTER TYPE enum_notifications_type ADD VALUE 'verification_approved'");
            console.log("Added 'verification_approved' to enum");
        } catch (e) {
            console.log("'verification_approved' might already exist or error:", e.message);
        }

        // Add verification_rejected
        try {
            await sequelize.query("ALTER TYPE enum_notifications_type ADD VALUE 'verification_rejected'");
            console.log("Added 'verification_rejected' to enum");
        } catch (e) {
            console.log("'verification_rejected' might already exist or error:", e.message);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
