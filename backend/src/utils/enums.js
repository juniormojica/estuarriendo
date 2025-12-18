/**
 * Centralized Enum Definitions
 * Maps to PostgreSQL ENUM types defined in the database schema
 */

export const IdType = {
    CC: 'CC',
    NIT: 'NIT',
    CE: 'CE',
    PASAPORTE: 'Pasaporte'
};

export const OwnerRole = {
    INDIVIDUAL: 'individual',
    AGENCY: 'agency'
};

export const UserType = {
    OWNER: 'owner',
    TENANT: 'tenant',
    ADMIN: 'admin',
    SUPER_ADMIN: 'superAdmin'
};

export const PaymentMethod = {
    PSE: 'PSE',
    CREDIT_CARD: 'CreditCard',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    BANK_TRANSFER: 'BankTransfer'
};

export const AccountType = {
    SAVINGS: 'savings',
    CURRENT: 'current',
    CHECKING: 'checking'
};

export const PropertyType = {
    PENSION: 'pension',
    HABITACION: 'habitacion',
    APARTAMENTO: 'apartamento',
    APARTA_ESTUDIO: 'aparta-estudio'
};

export const PropertyStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

export const VerificationStatus = {
    NOT_SUBMITTED: 'not_submitted',
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
};

export const PlanType = {
    FREE: 'free',
    PREMIUM: 'premium'
};

export const SubscriptionType = {
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly'
};

export const PaymentRequestStatus = {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
};

export const NotificationType = {
    PROPERTY_INTEREST: 'property_interest',
    PAYMENT_VERIFIED: 'payment_verified',
    PAYMENT_REJECTED: 'payment_rejected',
    PAYMENT_SUBMITTED: 'payment_submitted',
    PROPERTY_SUBMITTED: 'property_submitted',
    PROPERTY_APPROVED: 'property_approved',
    PROPERTY_REJECTED: 'property_rejected'
};

export const StudentRequestStatus = {
    OPEN: 'open',
    CLOSED: 'closed'
};

// Helper function to get all values from an enum object
export const getEnumValues = (enumObj) => Object.values(enumObj);
