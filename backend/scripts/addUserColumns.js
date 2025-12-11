#!/usr/bin/env node

/**
 * Add missing columns to users table
 */

import { sequelize } from '../src/config/database.js';

const addColumns = async () => {
    try {
        console.log('🔧 Adding missing columns to users table...\n');

        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Add plan column
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free';
        `);
        console.log('✅ Added plan column');

        // Add verification_status column
        await sequelize.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'not_submitted';
        `);
        console.log('✅ Added verification_status column');

        console.log('\n✅ Columns added successfully!');
        console.log('📝 You can now run: npm run seed:data:reset\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await sequelize.close();
    }
};

addColumns()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
