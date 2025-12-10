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

// Import property normalized models
import Location from './Location.js';
import Contact from './Contact.js';
import PropertyFeature from './PropertyFeature.js';
import PropertyImage from './PropertyImage.js';
import PropertyType from './PropertyType.js';
import Institution from './Institution.js';
import PropertyInstitution from './PropertyInstitution.js';

// Import user normalized models
import UserIdentificationDetails from './UserIdentificationDetails.js';
import UserVerification from './UserVerification.js';
import UserPasswordReset from './UserPasswordReset.js';
import UserBillingDetails from './UserBillingDetails.js';
import Subscription from './Subscription.js';
import UserStats from './UserStats.js';

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

// User <-> UserIdentificationDetails (One-to-One)
User.hasOne(UserIdentificationDetails, {
    foreignKey: 'userId',
    as: 'identification',
    onDelete: 'CASCADE'
});
UserIdentificationDetails.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> UserVerification (One-to-One)
User.hasOne(UserVerification, {
    foreignKey: 'userId',
    as: 'verification',
    onDelete: 'CASCADE'
});
UserVerification.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> UserPasswordReset (One-to-One)
User.hasOne(UserPasswordReset, {
    foreignKey: 'userId',
    as: 'passwordReset',
    onDelete: 'CASCADE'
});
UserPasswordReset.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> UserBillingDetails (One-to-One)
User.hasOne(UserBillingDetails, {
    foreignKey: 'userId',
    as: 'billing',
    onDelete: 'CASCADE'
});
UserBillingDetails.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> Subscription (One-to-Many)
User.hasMany(Subscription, {
    foreignKey: 'userId',
    as: 'subscriptions',
    onDelete: 'CASCADE'
});
Subscription.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> UserStats (One-to-One)
User.hasOne(UserStats, {
    foreignKey: 'userId',
    as: 'stats',
    onDelete: 'CASCADE'
});
UserStats.belongsTo(User, {
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

// Property <-> Location (Many-to-One)
Property.belongsTo(Location, {
    foreignKey: 'locationId',
    as: 'location'
});
Location.hasMany(Property, {
    foreignKey: 'locationId',
    as: 'properties'
});

// Property <-> Contact (One-to-One)
Property.hasOne(Contact, {
    foreignKey: 'propertyId',
    as: 'contact',
    onDelete: 'CASCADE'
});
Contact.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property'
});

// Property <-> PropertyFeature (One-to-One)
Property.hasOne(PropertyFeature, {
    foreignKey: 'propertyId',
    as: 'features',
    onDelete: 'CASCADE'
});
PropertyFeature.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property'
});

// Property <-> PropertyImage (One-to-Many)
Property.hasMany(PropertyImage, {
    foreignKey: 'propertyId',
    as: 'images',
    onDelete: 'CASCADE'
});
PropertyImage.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property'
});

// Property <-> PropertyType (Many-to-One)
Property.belongsTo(PropertyType, {
    foreignKey: 'typeId',
    as: 'type'
});
PropertyType.hasMany(Property, {
    foreignKey: 'typeId',
    as: 'properties'
});

// Property <-> Institution (Many-to-Many through PropertyInstitution)
Property.belongsToMany(Institution, {
    through: PropertyInstitution,
    foreignKey: 'propertyId',
    otherKey: 'institutionId',
    as: 'institutions'
});
Institution.belongsToMany(Property, {
    through: PropertyInstitution,
    foreignKey: 'institutionId',
    otherKey: 'propertyId',
    as: 'properties'
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

// StudentRequest <-> User (Many-to-One)
StudentRequest.belongsTo(User, {
    foreignKey: 'studentId',
    as: 'student'
});
User.hasMany(StudentRequest, {
    foreignKey: 'studentId',
    as: 'studentRequests',
    onDelete: 'CASCADE'
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
    SystemConfig,
    // Property normalized models
    Location,
    Contact,
    PropertyFeature,
    PropertyImage,
    PropertyType,
    Institution,
    PropertyInstitution,
    // User normalized models
    UserIdentificationDetails,
    UserVerification,
    UserPasswordReset,
    UserBillingDetails,
    Subscription,
    UserStats
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
    SystemConfig,
    // Property normalized models
    Location,
    Contact,
    PropertyFeature,
    PropertyImage,
    PropertyType,
    Institution,
    PropertyInstitution,
    // User normalized models
    UserIdentificationDetails,
    UserVerification,
    UserPasswordReset,
    UserBillingDetails,
    Subscription,
    UserStats
};
