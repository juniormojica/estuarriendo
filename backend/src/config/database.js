import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Sequelize Database Configuration
 * Configures connection to PostgreSQL with snake_case naming for DB
 */
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,

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
