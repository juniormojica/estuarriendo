import { sequelize } from '../config/database.js';

// Import all models
import User from './User.js';
import UserVerificationDocuments from './UserVerificationDocuments.js';
import Amenity from './Amenity.js';
import Property from './Property.js';
import PropertyAmenity from './PropertyAmenity.js';
import PaymentRequest from './PaymentRequest.js';
import StudentRequest from './StudentRequest.js';
import Notification from './Notification.js';
import ActivityLog from './ActivityLog.js';
import SystemConfig from './SystemConfig.js';

/**
 * Define Model Associations
 */

// User <-> UserVerificationDocuments (One-to-One)
User.hasOne(UserVerificationDocuments, {
    foreignKey: 'userId',
    as: 'verificationDocuments',
    onDelete: 'CASCADE'
});
UserVerificationDocuments.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> Property (One-to-Many)
User.hasMany(Property, {
    foreignKey: 'ownerId',
    as: 'properties',
    onDelete: 'CASCADE'
});
Property.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner'
});

// Property <-> Amenity (Many-to-Many through PropertyAmenity)
Property.belongsToMany(Amenity, {
    through: PropertyAmenity,
    foreignKey: 'propertyId',
    otherKey: 'amenityId',
    as: 'amenities'
});
Amenity.belongsToMany(Property, {
    through: PropertyAmenity,
    foreignKey: 'amenityId',
    otherKey: 'propertyId',
    as: 'properties'
});

// User <-> PaymentRequest (One-to-Many)
User.hasMany(PaymentRequest, {
    foreignKey: 'userId',
    as: 'paymentRequests',
    onDelete: 'CASCADE'
});
PaymentRequest.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> StudentRequest (One-to-Many, nullable)
User.hasMany(StudentRequest, {
    foreignKey: 'studentId',
    as: 'studentRequests',
    onDelete: 'SET NULL'
});
StudentRequest.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'student'
});

// User <-> Notification (One-to-Many)
User.hasMany(Notification, {
    foreignKey: 'userId',
    as: 'notifications',
    onDelete: 'CASCADE'
});
Notification.belongsTo(User, {
    foreignKey: 'userId',
    as: 'recipient'
});

// Property <-> Notification (One-to-Many, nullable)
Property.hasMany(Notification, {
    foreignKey: 'propertyId',
    as: 'notifications',
    onDelete: 'SET NULL'
});
Notification.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property'
});

// InterestedUser <-> Notification (for tracking who generated the notification)
Notification.belongsTo(User, {
    foreignKey: 'interestedUserId',
    as: 'interestedUser'
});

// User <-> ActivityLog (One-to-Many, nullable)
User.hasMany(ActivityLog, {
    foreignKey: 'userId',
    as: 'activityLogs',
    onDelete: 'SET NULL'
});
ActivityLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Property <-> ActivityLog (One-to-Many, nullable)
Property.hasMany(ActivityLog, {
    foreignKey: 'propertyId',
    as: 'activityLogs',
    onDelete: 'SET NULL'
});
ActivityLog.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property'
});

/**
 * Export all models and sequelize instance
 */
export {
    sequelize,
    User,
    UserVerificationDocuments,
    Amenity,
    Property,
    PropertyAmenity,
    PaymentRequest,
    StudentRequest,
    Notification,
    ActivityLog,
    SystemConfig
};

export default {
    sequelize,
    User,
    UserVerificationDocuments,
    Amenity,
    Property,
    PropertyAmenity,
    PaymentRequest,
    StudentRequest,
    Notification,
    ActivityLog,
    SystemConfig
};
