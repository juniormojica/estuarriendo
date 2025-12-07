#!/usr/bin/env node

/**
 * Database Seeding CLI Tool
 * Allows manual execution of database seeds
 */

import { seedEnums, dropAllEnums } from '../src/config/seedEnums.js';
import { sequelize } from '../src/config/database.js';

const command = process.argv[2];

const runCommand = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        switch (command) {
            case 'seed':
                await seedEnums();
                break;

            case 'drop':
                await dropAllEnums();
                break;

            case 'reset':
                console.log('🔄 Resetting ENUMs...\n');
                await dropAllEnums();
                await seedEnums();
                break;

            default:
                console.log('📋 Database Seeding Tool\n');
                console.log('Available commands:');
                console.log('  npm run seed        - Create all ENUM types');
                console.log('  npm run seed:drop   - Drop all ENUM types');
                console.log('  npm run seed:reset  - Drop and recreate all ENUM types\n');
                break;
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
};

runCommand();
