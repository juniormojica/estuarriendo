#!/usr/bin/env node

/**
 * Add Password Column to Users Table
 * Simple script to add the password column without altering ENUMs
 */

import { sequelize } from '../src/config/database.js';

const addPasswordColumn = async () => {
    try {
        console.log('🔄 Adding password column to users table...\n');

        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Add password column
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password VARCHAR(255);
        `);
        console.log('✅ Password column added\n');

        // Set default password for existing users (hashed 'password123')
        // This is a bcrypt hash with salt rounds 10
        const bcrypt = await import('bcryptjs');
        const defaultPasswordHash = await bcrypt.default.hash('password123', 10);

        await sequelize.query(`
            UPDATE users 
            SET password = :password
            WHERE password IS NULL;
        `, {
            replacements: { password: defaultPasswordHash }
        });
        console.log('✅ Default password set for existing users\n');

        // Make password NOT NULL
        await sequelize.query(`
            ALTER TABLE users 
            ALTER COLUMN password SET NOT NULL;
        `);
        console.log('✅ Password column set to NOT NULL\n');

        console.log('✅ Migration completed successfully!');
        console.log('   Default password for existing users: password123\n');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
};

addPasswordColumn();
