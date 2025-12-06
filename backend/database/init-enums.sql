-- ==============================================================================
-- EstuArriendo Database Initialization Script
-- This script creates all required ENUM types for the database
-- Run this script BEFORE starting the Node.js backend server
-- ==============================================================================

-- Drop existing types if they exist (for clean reinstall)
DROP TYPE IF EXISTS enum_users_id_type CASCADE;
DROP TYPE IF EXISTS enum_users_owner_role CASCADE;
DROP TYPE IF EXISTS enum_users_user_type CASCADE;
DROP TYPE IF EXISTS enum_users_payment_preference CASCADE;
DROP TYPE IF EXISTS enum_users_verification_status CASCADE;
DROP TYPE IF EXISTS enum_users_plan CASCADE;
DROP TYPE IF EXISTS enum_users_plan_type CASCADE;
DROP TYPE IF EXISTS enum_properties_type CASCADE;
DROP TYPE IF EXISTS enum_properties_status CASCADE;
DROP TYPE IF EXISTS enum_payment_requests_plan_type CASCADE;
DROP TYPE IF EXISTS enum_payment_requests_status CASCADE;
DROP TYPE IF EXISTS enum_notifications_type CASCADE;
DROP TYPE IF EXISTS enum_student_requests_property_type_desired CASCADE;
DROP TYPE IF EXISTS enum_student_requests_status CASCADE;

-- Create all ENUM types with Sequelize naming convention
CREATE TYPE enum_users_id_type AS ENUM ('CC', 'NIT', 'CE', 'Pasaporte');
CREATE TYPE enum_users_owner_role AS ENUM ('individual', 'agency');
CREATE TYPE enum_users_user_type AS ENUM ('owner', 'tenant', 'admin', 'superAdmin');
CREATE TYPE enum_users_payment_preference AS ENUM ('PSE', 'CreditCard', 'Nequi', 'Daviplata', 'BankTransfer');
CREATE TYPE enum_users_verification_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE enum_users_plan AS ENUM ('free', 'premium');
CREATE TYPE enum_users_plan_type AS ENUM ('weekly', 'monthly', 'quarterly');
CREATE TYPE enum_properties_type AS ENUM ('pension', 'habitacion', 'apartamento', 'aparta-estudio');
CREATE TYPE enum_properties_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE enum_payment_requests_plan_type AS ENUM ('weekly', 'monthly', 'quarterly');
CREATE TYPE enum_payment_requests_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE enum_notifications_type AS ENUM ('property_interest', 'payment_verified', 'property_approved', 'property_rejected');
CREATE TYPE enum_student_requests_property_type_desired AS ENUM ('pension', 'habitacion', 'apartamento', 'aparta-estudio');
CREATE TYPE enum_student_requests_status AS ENUM ('open', 'closed');

-- Create indexes will be handled by Sequelize
-- Tables will be created by Sequelize sync

COMMENT ON TYPE enum_users_id_type IS 'Types of identification documents';
COMMENT ON TYPE enum_users_owner_role IS 'Owner types: individual or agency';
COMMENT ON TYPE enum_users_user_type IS 'User roles in the system';
COMMENT ON TYPE enum_users_payment_preference IS 'Available payment methods';
COMMENT ON TYPE enum_users_verification_status IS 'User verification status';
COMMENT ON TYPE enum_users_plan IS 'Subscription plan types';
COMMENT ON TYPE enum_users_plan_type IS 'Subscription duration types';
COMMENT ON TYPE enum_properties_type IS 'Types of properties available';
COMMENT ON TYPE enum_properties_status IS 'Property approval status';
COMMENT ON TYPE enum_payment_requests_plan_type IS 'Subscription duration types for payment requests';
COMMENT ON TYPE enum_payment_requests_status IS 'Payment request processing status';
COMMENT ON TYPE enum_notifications_type IS 'Types of user notifications';
COMMENT ON TYPE enum_student_requests_property_type_desired IS 'Desired property type for student requests';
COMMENT ON TYPE enum_student_requests_status IS 'Student request status';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All ENUM types created successfully!';
    RAISE NOTICE 'You can now start the Node.js backend server.';
END $$;
