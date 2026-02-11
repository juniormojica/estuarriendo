-- Migration: Add Property Container Architecture
-- Date: 2026-01-11
-- Description: Adds hierarchical structure to properties (containers and units)
--              Adds room types, contract terms, and common areas support

-- ============================================================================
-- PART 1: Add new columns to properties table
-- ============================================================================

-- Add hierarchical structure fields
ALTER TABLE properties
ADD COLUMN parent_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
ADD COLUMN is_container BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN rental_mode VARCHAR(20) CHECK (rental_mode IN ('complete', 'by_unit', 'single')),
ADD COLUMN total_units INTEGER DEFAULT 0,
ADD COLUMN available_units INTEGER DEFAULT 0;

-- Add room type fields (for units only)
ALTER TABLE properties
ADD COLUMN room_type VARCHAR(20) CHECK (room_type IN ('individual', 'shared')),
ADD COLUMN beds_in_room INTEGER;

-- Add contract terms fields
ALTER TABLE properties
ADD COLUMN requires_deposit BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN minimum_contract_months INTEGER;

-- ============================================================================
-- PART 2: Create indexes for performance
-- ============================================================================

CREATE INDEX idx_properties_parent_id ON properties(parent_id);
CREATE INDEX idx_properties_is_container ON properties(is_container);
CREATE INDEX idx_properties_room_type ON properties(room_type);
CREATE INDEX idx_properties_rental_mode ON properties(rental_mode);

-- ============================================================================
-- PART 3: Add constraints
-- ============================================================================

-- Constraint: room_type only applies to units (not containers)
ALTER TABLE properties
ADD CONSTRAINT chk_room_type_for_units
CHECK (
    (is_container = true AND room_type IS NULL) OR
    (is_container = false)
);

-- Constraint: beds_in_room must be >= 2 for shared rooms
ALTER TABLE properties
ADD CONSTRAINT chk_beds_in_shared_room
CHECK (
    (room_type = 'shared' AND beds_in_room >= 2) OR
    (room_type = 'individual' AND (beds_in_room IS NULL OR beds_in_room = 1)) OR
    (room_type IS NULL)
);

-- Constraint: rental_mode only applies to containers
ALTER TABLE properties
ADD CONSTRAINT chk_rental_mode_for_containers
CHECK (
    (is_container = true AND rental_mode IS NOT NULL) OR
    (is_container = false AND rental_mode IS NULL)
);

-- Constraint: minimum_contract_months must be positive
ALTER TABLE properties
ADD CONSTRAINT chk_minimum_contract_positive
CHECK (minimum_contract_months IS NULL OR minimum_contract_months > 0);

-- ============================================================================
-- PART 4: Update existing data
-- ============================================================================

-- Mark all existing properties as non-containers (independent units)
UPDATE properties
SET is_container = false,
    room_type = 'individual',
    beds_in_room = 1
WHERE parent_id IS NULL;

-- Set default values for contract terms
UPDATE properties
SET requires_deposit = true,
    minimum_contract_months = 6
WHERE requires_deposit IS NULL;

-- ============================================================================
-- PART 5: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN properties.parent_id IS 'Reference to parent property (container). NULL for independent units or containers.';
COMMENT ON COLUMN properties.is_container IS 'TRUE if this property is a container (pension, apartment), FALSE if it is a unit (room).';
COMMENT ON COLUMN properties.rental_mode IS 'How the container can be rented: complete (all units), by_unit (individual rooms), single (independent room).';
COMMENT ON COLUMN properties.total_units IS 'Total number of units in the container.';
COMMENT ON COLUMN properties.available_units IS 'Number of available (not rented) units in the container.';
COMMENT ON COLUMN properties.room_type IS 'Type of room: individual (1 person) or shared (2+ people). Only for units.';
COMMENT ON COLUMN properties.beds_in_room IS 'Number of beds in the room. Required for shared rooms.';
COMMENT ON COLUMN properties.requires_deposit IS 'Whether a security deposit is required.';
COMMENT ON COLUMN properties.minimum_contract_months IS 'Minimum contract duration in months.';
