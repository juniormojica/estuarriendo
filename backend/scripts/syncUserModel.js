#!/usr/bin/env node

/**
 * Sync User Model with Database
 * Adds missing columns using Sequelize alter
 */

import { sequelize } from '../src/config/database.js';
import User from '../src/models/User.js';

const syncUserModel = async () => {
    try {
        console.log('🔄 Syncing User model with database...\n');

        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Use raw SQL to add columns to avoid ENUM issues
        console.log('Adding reset_password_token column...');
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);
        `);
        console.log('✅ reset_password_token column added\n');

        console.log('Adding reset_password_expires column...');
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
        `);
        console.log('✅ reset_password_expires column added\n');

        console.log('✅ User model sync completed successfully!');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
};

syncUserModel();
