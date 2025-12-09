#!/usr/bin/env node

/**
 * Sync Database Schema
 * Adds missing columns to existing tables
 */

import { sequelize } from '../src/config/database.js';
import User from '../src/models/User.js';

const syncDatabase = async () => {
    try {
        console.log('🔄 Syncing database schema...\n');

        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Sync User model with alter: true to add missing columns
        await User.sync({ alter: true });
        console.log('✅ User table synced - password column added\n');

        console.log('✅ Database schema sync completed!');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing database:', error.message);
        await sequelize.close();
        process.exit(1);
    }
};

syncDatabase();
