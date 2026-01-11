-- Migration: Create property_services and property_rules tables
-- Date: 2026-01-10
-- Description: Add support for property-specific services and rules

-- Create property_services table
CREATE TABLE IF NOT EXISTS property_services (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN (
        'breakfast',
        'lunch',
        'dinner',
        'housekeeping',
        'laundry',
        'wifi',
        'utilities'
    )),
    is_included BOOLEAN NOT NULL DEFAULT TRUE,
    additional_cost DECIMAL(10, 2),
    description TEXT,
    CONSTRAINT fk_property_service_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_property_service
        UNIQUE (property_id, service_type)
);

-- Create indexes for property_services
CREATE INDEX idx_property_services_property_id ON property_services(property_id);
CREATE INDEX idx_property_services_service_type ON property_services(service_type);

-- Create property_rules table
CREATE TABLE IF NOT EXISTS property_rules (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
        'visits',
        'pets',
        'smoking',
        'noise',
        'curfew',
        'tenant_profile',
        'couples',
        'children'
    )),
    is_allowed BOOLEAN NOT NULL,
    value VARCHAR(255),
    description TEXT,
    CONSTRAINT fk_property_rule_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_property_rule
        UNIQUE (property_id, rule_type)
);

-- Create indexes for property_rules
CREATE INDEX idx_property_rules_property_id ON property_rules(property_id);
CREATE INDEX idx_property_rules_rule_type ON property_rules(rule_type);

-- Add comments to tables
COMMENT ON TABLE property_services IS 'Services included with properties (mainly for pension type)';
COMMENT ON TABLE property_rules IS 'Rules and restrictions for properties (mainly for habitacion and pension types)';

-- Add comments to columns
COMMENT ON COLUMN property_services.service_type IS 'Type of service provided';
COMMENT ON COLUMN property_services.is_included IS 'Whether the service is included in the base price';
COMMENT ON COLUMN property_services.additional_cost IS 'Extra cost if service is optional (in COP)';

COMMENT ON COLUMN property_rules.rule_type IS 'Type of rule or restriction';
COMMENT ON COLUMN property_rules.is_allowed IS 'Whether this rule allows or restricts the activity';
COMMENT ON COLUMN property_rules.value IS 'For rules that need a value (e.g., curfew time: "22:00", tenant_profile: "solo_mujeres")';
