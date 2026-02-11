import { sequelize } from '../src/config/database.js';
import UserProfile from '../src/models/UserProfile.js';
import User from '../src/models/User.js';
import Institution from '../src/models/Institution.js';
import City from '../src/models/City.js';

const syncUserProfile = async () => {
    try {
        console.log('Authenticating database connection...');
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        console.log('Syncing UserProfile model...');
        // Sync specifically the UserProfile model
        // Using alter to add columns if table exists, or create if not
        await UserProfile.sync({ alter: true });

        console.log('UserProfile table synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to sync UserProfile table:', error);
        process.exit(1);
    }
};

syncUserProfile();
