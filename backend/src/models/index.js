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
import Favorite from './Favorite.js';

// Import property normalized models
import Location from './Location.js';
import Contact from './Contact.js';
import PropertyFeature from './PropertyFeature.js';
import PropertyImage from './PropertyImage.js';
import PropertyService from './PropertyService.js';
import PropertyRule from './PropertyRule.js';
import PropertyType from './PropertyType.js';
import Institution from './Institution.js';
import PropertyInstitution from './PropertyInstitution.js';
import CommonArea from './CommonArea.js';
import PropertyCommonArea from './PropertyCommonArea.js';


// Import location normalized models
import Department from './Department.js';
import City from './City.js';

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

// Department <-> City (One-to-Many)
Department.hasMany(City, {
    foreignKey: 'departmentId',
    as: 'cities',
    onDelete: 'RESTRICT'
});
City.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'department'
});

// City <-> Location (One-to-Many)
City.hasMany(Location, {
    foreignKey: 'cityId',
    as: 'locations',
    onDelete: 'RESTRICT'
});
Location.belongsTo(City, {
    foreignKey: 'cityId',
    as: 'city'
});

// Department <-> Location (One-to-Many)
Department.hasMany(Location, {
    foreignKey: 'departmentId',
    as: 'locations',
    onDelete: 'RESTRICT'
});
Location.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'department'
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

// City <-> Institution (One-to-Many)
City.hasMany(Institution, {
    foreignKey: 'cityId',
    as: 'institutions',
    onDelete: 'RESTRICT'
});
Institution.belongsTo(City, {
    foreignKey: 'cityId',
    as: 'city'
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

// Property <-> PropertyService (One-to-Many)
Property.hasMany(PropertyService, {
    foreignKey: 'propertyId',
    as: 'services',
    onDelete: 'CASCADE'
});
PropertyService.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property'
});

// Property <-> PropertyRule (One-to-Many)
Property.hasMany(PropertyRule, {
    foreignKey: 'propertyId',
    as: 'rules',
    onDelete: 'CASCADE'
});
PropertyRule.belongsTo(Property, {
    foreignKey: 'propertyId',
    as: 'property'
});

// Property <-> Property (Self-referential for Container-Unit hierarchy)
// Container has many Units
Property.hasMany(Property, {
    foreignKey: 'parentId',
    as: 'units',
    onDelete: 'CASCADE'
});
// Unit belongs to Container
Property.belongsTo(Property, {
    foreignKey: 'parentId',
    as: 'container'
});

// Property <-> CommonArea (Many-to-Many through PropertyCommonArea)
Property.belongsToMany(CommonArea, {
    through: PropertyCommonArea,
    foreignKey: 'propertyId',
    otherKey: 'commonAreaId',
    as: 'commonAreas'
});
CommonArea.belongsToMany(Property, {
    through: PropertyCommonArea,
    foreignKey: 'commonAreaId',
    otherKey: 'propertyId',
    as: 'properties'
});

// City <-> StudentRequest (One-to-Many)
City.hasMany(StudentRequest, {
    foreignKey: 'cityId',
    as: 'studentRequests',
    onDelete: 'RESTRICT'
});
StudentRequest.belongsTo(City, {
    foreignKey: 'cityId',
    as: 'city'
});

// Institution <-> StudentRequest (One-to-Many)
Institution.hasMany(StudentRequest, {
    foreignKey: 'institutionId',
    as: 'studentRequests',
    onDelete: 'SET NULL'
});
StudentRequest.belongsTo(Institution, {
    foreignKey: 'institutionId',
    as: 'institution'
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

// User <-> Property Favorites (Many-to-Many through Favorite)
User.belongsToMany(Property, {
    through: Favorite,
    foreignKey: 'userId',
    otherKey: 'propertyId',
    as: 'favoriteProperties'
});
Property.belongsToMany(User, {
    through: Favorite,
    foreignKey: 'propertyId',
    otherKey: 'userId',
    as: 'favoritedBy'
});

// Direct associations for Favorite model
Favorite.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
Favorite.belongsTo(Property, {
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
    Favorite,
    // Property normalized models
    Location,
    Contact,
    PropertyFeature,
    PropertyImage,
    PropertyService,
    PropertyRule,
    PropertyType,
    Institution,
    PropertyInstitution,
    CommonArea,
    PropertyCommonArea,
    // Location normalized models
    Department,
    City,
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
    Favorite,
    // Property normalized models
    Location,
    Contact,
    PropertyFeature,
    PropertyImage,
    PropertyService,
    PropertyRule,
    PropertyType,
    Institution,
    PropertyInstitution,
    CommonArea,
    PropertyCommonArea,
    // Location normalized models
    Department,
    City,
    // User normalized models
    UserIdentificationDetails,
    UserVerification,
    UserPasswordReset,
    UserBillingDetails,
    Subscription,
    UserStats
};
