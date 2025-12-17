import { sequelize } from '../src/config/database.js';

async function addPremiumSinceColumn() {
    try {
        console.log('Adding premium_since column to users table...');

        await sequelize.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP NULL;
        `);

        await sequelize.query(`
            COMMENT ON COLUMN users.premium_since IS 'When user first became premium';
        `);

        console.log('✅ Successfully added premium_since column');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error.message);
        process.exit(1);
    }
}

addPremiumSinceColumn();
