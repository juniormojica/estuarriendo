#!/usr/bin/env node

/**
 * Script to recreate the properties table with new structure
 */

import { sequelize } from '../src/config/database.js';

const recreatePropertiesTable = async () => {
    try {
        console.log('🔄 Recreating properties table...\n');

        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Drop properties table and related tables
        console.log('🗑️  Dropping related tables...');
        await sequelize.query('DROP TABLE IF EXISTS property_amenities CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS properties CASCADE;');
        console.log('✅ Tables dropped\n');

        // Import Property model to trigger table creation
        await import('../src/models/index.js');

        // Sync only Property model
        console.log('🔨 Creating properties table with new structure...');
        await sequelize.sync({ force: false });
        console.log('✅ Properties table created\n');

        console.log('✅ Done! You can now run: npm run seed:data');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
};

recreatePropertiesTable();
