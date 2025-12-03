const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
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

module.exports = models;
