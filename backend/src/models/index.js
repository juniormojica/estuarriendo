import { sequelize } from '../config/database.js';

// Import models
import User from './User.js';
// const Property = require('./Property');
// const StudentRequest = require('./StudentRequest');

// Define associations here
// User.hasMany(Property, { foreignKey: 'owner_id', as: 'properties' });
// Property.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

const models = {
    User,
    // Property,
    // StudentRequest,
    sequelize
};

export default models;
