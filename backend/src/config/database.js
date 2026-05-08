import { Sequelize } from 'sequelize';
import { env } from './env.js';

/**
 * Sequelize Database Configuration
 * Configures connection to PostgreSQL with snake_case naming for DB
 */
const sequelize = new Sequelize(
    env.db.name,
    env.db.user,
    env.db.password,
    {
        host: env.db.host,
        port: env.db.port,
        dialect: 'postgres',
        logging: false, // Disabled SQL query logging

        // Naming conventions: snake_case in DB, camelCase in API responses
        define: {
            underscored: true, // Use snake_case for column names
            timestamps: true, // Add createdAt and updatedAt
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },

        // Prevent Sequelize from altering existing ENUM types
        sync: {
            alter: false
        }
    }
);

/**
 * Test database connection
 */
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

export { sequelize, testConnection };
