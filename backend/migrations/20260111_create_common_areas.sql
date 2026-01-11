-- Migration: Create Common Areas Tables
-- Date: 2026-01-11
-- Description: Creates tables for common areas (shared spaces in containers)

-- ============================================================================
-- PART 1: Create common_areas table
-- ============================================================================

CREATE TABLE common_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ============================================================================
-- PART 2: Create property_common_areas junction table
-- ============================================================================

CREATE TABLE property_common_areas (
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    common_area_id INTEGER NOT NULL REFERENCES common_areas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (property_id, common_area_id)
);

-- ============================================================================
-- PART 3: Create indexes
-- ============================================================================

CREATE INDEX idx_property_common_areas_property ON property_common_areas(property_id);
CREATE INDEX idx_property_common_areas_area ON property_common_areas(common_area_id);
CREATE INDEX idx_common_areas_slug ON common_areas(slug);

-- ============================================================================
-- PART 4: Seed initial common areas data
-- ============================================================================

INSERT INTO common_areas (name, icon, slug, description) VALUES
('Cocina compartida', '🍳', 'cocina-compartida', 'Cocina equipada para uso compartido entre residentes'),
('Sala de estar', '🛋️', 'sala-estar', 'Sala común para descanso y socialización'),
('Comedor', '🍽️', 'comedor', 'Espacio para comer en común'),
('Lavandería', '🧺', 'lavanderia', 'Área de lavado con lavadora y secadora'),
('Estacionamiento', '🚗', 'estacionamiento', 'Espacio de parqueadero para vehículos'),
('Terraza', '🌿', 'terraza', 'Terraza o balcón compartido'),
('Zona de estudio', '📚', 'zona-estudio', 'Espacio tranquilo para estudiar'),
('Gimnasio', '💪', 'gimnasio', 'Área de ejercicio con equipamiento básico'),
('Patio/Jardín', '🌳', 'patio-jardin', 'Espacio exterior con jardín'),
('Sala de TV', '📺', 'sala-tv', 'Sala con televisión y entretenimiento'),
('Zona BBQ', '🔥', 'zona-bbq', 'Área para asados y parrilladas'),
('Sala de juegos', '🎮', 'sala-juegos', 'Espacio recreativo con juegos de mesa y videojuegos');

-- ============================================================================
-- PART 5: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE common_areas IS 'Master table of common areas that can be shared in property containers';
COMMENT ON TABLE property_common_areas IS 'Junction table linking properties (containers) with their common areas';
COMMENT ON COLUMN common_areas.name IS 'Display name of the common area';
COMMENT ON COLUMN common_areas.icon IS 'Emoji or icon identifier for UI display';
COMMENT ON COLUMN common_areas.slug IS 'URL-friendly identifier';
