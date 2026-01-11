-- Rollback Migration: Property Container Architecture
-- Date: 2026-01-11
-- Description: Reverts changes made by 20260111_add_property_container_architecture.sql
-- WARNING: This will remove all container/unit relationships and new fields

-- ============================================================================
-- PART 1: Drop constraints
-- ============================================================================

ALTER TABLE properties DROP CONSTRAINT IF EXISTS chk_room_type_for_units;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS chk_beds_in_shared_room;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS chk_rental_mode_for_containers;
ALTER TABLE properties DROP CONSTRAINT IF EXISTS chk_minimum_contract_positive;

-- ============================================================================
-- PART 2: Drop indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_properties_parent_id;
DROP INDEX IF EXISTS idx_properties_is_container;
DROP INDEX IF EXISTS idx_properties_room_type;
DROP INDEX IF EXISTS idx_properties_rental_mode;

-- ============================================================================
-- PART 3: Drop columns
-- ============================================================================

ALTER TABLE properties DROP COLUMN IF EXISTS parent_id;
ALTER TABLE properties DROP COLUMN IF EXISTS is_container;
ALTER TABLE properties DROP COLUMN IF EXISTS rental_mode;
ALTER TABLE properties DROP COLUMN IF EXISTS total_units;
ALTER TABLE properties DROP COLUMN IF EXISTS available_units;
ALTER TABLE properties DROP COLUMN IF EXISTS room_type;
ALTER TABLE properties DROP COLUMN IF EXISTS beds_in_room;
ALTER TABLE properties DROP COLUMN IF EXISTS requires_deposit;
ALTER TABLE properties DROP COLUMN IF EXISTS minimum_contract_months;

-- ============================================================================
-- PART 4: Drop common areas tables
-- ============================================================================

DROP TABLE IF EXISTS property_common_areas;
DROP TABLE IF EXISTS common_areas;

-- ============================================================================
-- Note: This rollback will permanently delete:
-- - All container/unit hierarchies
-- - All common area associations
-- - All room type information
-- - All contract term information
-- 
-- Make sure you have a backup before running this!
-- ============================================================================
