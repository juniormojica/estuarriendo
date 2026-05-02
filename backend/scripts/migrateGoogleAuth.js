import { sequelize } from '../src/config/database.js';

const runMigration = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const queryInterface = sequelize.getQueryInterface();

        // Add google_id column
        try {
            await queryInterface.addColumn('users', 'google_id', {
                type: 'VARCHAR(255)',
                allowNull: true,
                unique: true,
                comment: 'Google OAuth user ID (sub)'
            });
            console.log('✅ Added google_id column');
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('⚠️  google_id column already exists, skipping');
            } else throw e;
        }

        // Add avatar_url column
        try {
            await queryInterface.addColumn('users', 'avatar_url', {
                type: 'VARCHAR(500)',
                allowNull: true,
                comment: 'Profile picture URL (from Google or uploaded)'
            });
            console.log('✅ Added avatar_url column');
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('⚠️  avatar_url column already exists, skipping');
            } else throw e;
        }

        // Make password nullable
        await sequelize.query(`
            ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
        `);
        console.log('✅ Made password column nullable');

        // Create index on google_id
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
        `);
        console.log('✅ Created index on google_id');

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
