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
    BANK_TRANSFER: 'BankTransfer',
    MERCADO_PAGO: 'MercadoPago'
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
    QUARTERLY: 'quarterly',
    CREDITS_5: '5_credits',
    CREDITS_10: '10_credits',
    CREDITS_20: '20_credits'
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
    PROPERTY_REJECTED: 'property_rejected',
    VERIFICATION_SUBMITTED: 'verification_submitted',
    VERIFICATION_APPROVED: 'verification_approved',
    VERIFICATION_REJECTED: 'verification_rejected',
    CREDIT_PURCHASED: 'credit_purchased',
    CREDIT_USED: 'credit_used',
    CREDIT_REFUNDED: 'credit_refunded',
    PROPERTY_REPORTED: 'property_reported',
    REPORT_RESOLVED: 'report_resolved'
};

export const StudentRequestStatus = {
    OPEN: 'open',
    CLOSED: 'closed'
};

export const CreditPlanType = {
    FIVE: '5_credits',
    TEN: '10_credits',
    TWENTY: '20_credits'
};

export const CreditTransactionType = {
    PURCHASE: 'purchase',
    USE: 'use',
    REFUND: 'refund',
    EXPIRE: 'expire'
};

export const ContactUnlockStatus = {
    ACTIVE: 'active',
    REFUNDED: 'refunded'
};

export const PropertyReportReason = {
    ALREADY_RENTED: 'already_rented',
    INCORRECT_INFO: 'incorrect_info',
    SCAM: 'scam',
    OTHER: 'other'
};

export const PropertyReportStatus = {
    PENDING: 'pending',
    INVESTIGATING: 'investigating',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected'
};

export const ReportActivityAction = {
    CONTACT_ATTEMPT: 'contact_attempt',
    NOTE_ADDED: 'note_added',
    OWNER_CONTACTED: 'owner_contacted',
    OWNER_CONFIRMED_RENTED: 'owner_confirmed_rented',
    OWNER_DENIED: 'owner_denied',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected'
};

// Helper function to get all values from an enum object
export const getEnumValues = (enumObj) => Object.values(enumObj);
