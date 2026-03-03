-- 20260303_create_credits_system.sql
-- Migration file for the new Tenant Credits and Property Reports System

-- IMPORTANT: ALTER TYPE ... ADD VALUE statements cannot be run inside a transaction block in older PostgreSQL versions
-- If you run into issues, try running these outside of a transaction or splitting the script.

-- 1. Update Enums for Subscription and PaymentRequest plan types
ALTER TYPE "enum_subscriptions_plan_type" ADD VALUE IF NOT EXISTS '5_credits';
ALTER TYPE "enum_subscriptions_plan_type" ADD VALUE IF NOT EXISTS '10_credits';
ALTER TYPE "enum_subscriptions_plan_type" ADD VALUE IF NOT EXISTS 'unlimited';

ALTER TYPE "enum_payment_requests_plan_type" ADD VALUE IF NOT EXISTS '5_credits';
ALTER TYPE "enum_payment_requests_plan_type" ADD VALUE IF NOT EXISTS '10_credits';
ALTER TYPE "enum_payment_requests_plan_type" ADD VALUE IF NOT EXISTS 'unlimited';

-- Update NotificationType Enum
ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'credit_purchased';
ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'credit_used';
ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'credit_refunded';
ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'property_reported';
ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'report_resolved';

-- 2. Add columns to payment_requests for Mercado Pago
CREATE TYPE "enum_payment_requests_payment_method" AS ENUM ('bank_transfer', 'mercado_pago');

ALTER TABLE "payment_requests" 
ADD COLUMN IF NOT EXISTS "payment_method" "enum_payment_requests_payment_method" DEFAULT 'bank_transfer' NOT NULL;

ALTER TABLE "payment_requests" 
ADD COLUMN IF NOT EXISTS "mercado_pago_payment_id" VARCHAR(255) DEFAULT NULL;

-- 3. Create credit_balances table
CREATE TABLE IF NOT EXISTS "credit_balances" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(255) NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE,
    "available_credits" INTEGER NOT NULL DEFAULT 0,
    "total_purchased" INTEGER NOT NULL DEFAULT 0,
    "total_used" INTEGER NOT NULL DEFAULT 0,
    "total_refunded" INTEGER NOT NULL DEFAULT 0,
    "unlimited_until" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE
);

-- 4. Create credit_transactions table
CREATE TYPE "enum_credit_transactions_type" AS ENUM ('purchase', 'use', 'refund', 'expire');

CREATE TABLE IF NOT EXISTS "credit_transactions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(255) NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "type" "enum_credit_transactions_type" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference_id" INTEGER,
    "reference_type" VARCHAR(50),
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Create contact_unlocks table
CREATE TYPE "enum_contact_unlocks_status" AS ENUM ('active', 'refunded');

CREATE TABLE IF NOT EXISTS "contact_unlocks" (
    "id" SERIAL PRIMARY KEY,
    "tenant_id" VARCHAR(255) NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "property_id" INTEGER NOT NULL REFERENCES "properties" ("id") ON DELETE CASCADE,
    "owner_id" VARCHAR(255) NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "credit_transaction_id" INTEGER REFERENCES "credit_transactions" ("id") ON DELETE SET NULL,
    "status" "enum_contact_unlocks_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_tenant_property_unlock" UNIQUE ("tenant_id", "property_id")
);

-- 6. Create property_reports table
CREATE TYPE "enum_property_reports_reason" AS ENUM ('already_rented', 'incorrect_info', 'scam', 'other');
CREATE TYPE "enum_property_reports_status" AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE IF NOT EXISTS "property_reports" (
    "id" SERIAL PRIMARY KEY,
    "reporter_id" VARCHAR(255) NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "property_id" INTEGER NOT NULL REFERENCES "properties" ("id") ON DELETE CASCADE,
    "contact_unlock_id" INTEGER REFERENCES "contact_unlocks" ("id") ON DELETE CASCADE,
    "reason" "enum_property_reports_reason" NOT NULL,
    "description" TEXT,
    "status" "enum_property_reports_status" NOT NULL DEFAULT 'pending',
    "credit_refunded" BOOLEAN NOT NULL DEFAULT FALSE,
    "admin_notes" TEXT,
    "processed_by" VARCHAR(255) REFERENCES "users" ("id") ON DELETE SET NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "processed_at" TIMESTAMP WITH TIME ZONE
);
