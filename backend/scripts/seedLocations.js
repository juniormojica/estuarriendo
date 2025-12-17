import { Department, City } from '../src/models/index.js';

/**
 * Seed all 32 Colombian Departments
 */
export const seedDepartments = async () => {
    console.log('🗺️  Seeding departments...');

    const departments = [
        { name: 'Amazonas', code: 'AMA', slug: 'amazonas', isActive: true },
        { name: 'Antioquia', code: 'ANT', slug: 'antioquia', isActive: true },
        { name: 'Arauca', code: 'ARA', slug: 'arauca', isActive: true },
        { name: 'Atlántico', code: 'ATL', slug: 'atlantico', isActive: true },
        { name: 'Bolívar', code: 'BOL', slug: 'bolivar', isActive: true },
        { name: 'Boyacá', code: 'BOY', slug: 'boyaca', isActive: true },
        { name: 'Caldas', code: 'CAL', slug: 'caldas', isActive: true },
        { name: 'Caquetá', code: 'CAQ', slug: 'caqueta', isActive: true },
        { name: 'Casanare', code: 'CAS', slug: 'casanare', isActive: true },
        { name: 'Cauca', code: 'CAU', slug: 'cauca', isActive: true },
        { name: 'Cesar', code: 'CES', slug: 'cesar', isActive: true },
        { name: 'Chocó', code: 'CHO', slug: 'choco', isActive: true },
        { name: 'Córdoba', code: 'COR', slug: 'cordoba', isActive: true },
        { name: 'Cundinamarca', code: 'CUN', slug: 'cundinamarca', isActive: true },
        { name: 'Guainía', code: 'GUA', slug: 'guainia', isActive: true },
        { name: 'Guaviare', code: 'GUV', slug: 'guaviare', isActive: true },
        { name: 'Huila', code: 'HUI', slug: 'huila', isActive: true },
        { name: 'La Guajira', code: 'LAG', slug: 'la-guajira', isActive: true },
        { name: 'Magdalena', code: 'MAG', slug: 'magdalena', isActive: true },
        { name: 'Meta', code: 'MET', slug: 'meta', isActive: true },
        { name: 'Nariño', code: 'NAR', slug: 'narino', isActive: true },
        { name: 'Norte de Santander', code: 'NSA', slug: 'norte-de-santander', isActive: true },
        { name: 'Putumayo', code: 'PUT', slug: 'putumayo', isActive: true },
        { name: 'Quindío', code: 'QUI', slug: 'quindio', isActive: true },
        { name: 'Risaralda', code: 'RIS', slug: 'risaralda', isActive: true },
        { name: 'San Andrés y Providencia', code: 'SAP', slug: 'san-andres-y-providencia', isActive: true },
        { name: 'Santander', code: 'SAN', slug: 'santander', isActive: true },
        { name: 'Sucre', code: 'SUC', slug: 'sucre', isActive: true },
        { name: 'Tolima', code: 'TOL', slug: 'tolima', isActive: true },
        { name: 'Valle del Cauca', code: 'VAL', slug: 'valle-del-cauca', isActive: true },
        { name: 'Vaupés', code: 'VAU', slug: 'vaupes', isActive: true },
        { name: 'Vichada', code: 'VID', slug: 'vichada', isActive: true }
    ];

    const created = await Department.bulkCreate(departments);
    console.log(`  ✅ Created ${created.length} departments`);

    return created;
};

/**
 * Seed all major Colombian Cities
 */
export const seedCities = async (departments) => {
    console.log('🏙️  Seeding cities...');

    // Helper to find department by code
    const getDept = (code) => departments.find(d => d.code === code);

    const cities = [
        // Amazonas
        { name: 'Leticia', departmentId: getDept('AMA').id, slug: 'leticia', isActive: true },

        // Antioquia
        { name: 'Medellín', departmentId: getDept('ANT').id, slug: 'medellin', isActive: true },
        { name: 'Bello', departmentId: getDept('ANT').id, slug: 'bello', isActive: true },
        { name: 'Itagüí', departmentId: getDept('ANT').id, slug: 'itagui', isActive: true },
        { name: 'Envigado', departmentId: getDept('ANT').id, slug: 'envigado', isActive: true },
        { name: 'Apartadó', departmentId: getDept('ANT').id, slug: 'apartado', isActive: true },
        { name: 'Turbo', departmentId: getDept('ANT').id, slug: 'turbo', isActive: true },
        { name: 'Rionegro', departmentId: getDept('ANT').id, slug: 'rionegro', isActive: true },
        { name: 'Sabaneta', departmentId: getDept('ANT').id, slug: 'sabaneta', isActive: true },
        { name: 'La Estrella', departmentId: getDept('ANT').id, slug: 'la-estrella', isActive: true },
        { name: 'Copacabana', departmentId: getDept('ANT').id, slug: 'copacabana', isActive: true },

        // Arauca
        { name: 'Arauca', departmentId: getDept('ARA').id, slug: 'arauca', isActive: true },

        // Atlántico
        { name: 'Barranquilla', departmentId: getDept('ATL').id, slug: 'barranquilla', isActive: true },
        { name: 'Soledad', departmentId: getDept('ATL').id, slug: 'soledad', isActive: true },
        { name: 'Malambo', departmentId: getDept('ATL').id, slug: 'malambo', isActive: true },
        { name: 'Sabanalarga', departmentId: getDept('ATL').id, slug: 'sabanalarga', isActive: true },
        { name: 'Puerto Colombia', departmentId: getDept('ATL').id, slug: 'puerto-colombia', isActive: true },

        // Bolívar
        { name: 'Cartagena', departmentId: getDept('BOL').id, slug: 'cartagena', isActive: true },
        { name: 'Magangué', departmentId: getDept('BOL').id, slug: 'magangue', isActive: true },
        { name: 'Turbaco', departmentId: getDept('BOL').id, slug: 'turbaco', isActive: true },
        { name: 'Arjona', departmentId: getDept('BOL').id, slug: 'arjona', isActive: true },

        // Boyacá
        { name: 'Tunja', departmentId: getDept('BOY').id, slug: 'tunja', isActive: true },
        { name: 'Duitama', departmentId: getDept('BOY').id, slug: 'duitama', isActive: true },
        { name: 'Sogamoso', departmentId: getDept('BOY').id, slug: 'sogamoso', isActive: true },
        { name: 'Chiquinquirá', departmentId: getDept('BOY').id, slug: 'chiquinquira', isActive: true },

        // Caldas
        { name: 'Manizales', departmentId: getDept('CAL').id, slug: 'manizales', isActive: true },
        { name: 'Villamaría', departmentId: getDept('CAL').id, slug: 'villamaria', isActive: true },
        { name: 'Chinchiná', departmentId: getDept('CAL').id, slug: 'chinchina', isActive: true },

        // Caquetá
        { name: 'Florencia', departmentId: getDept('CAQ').id, slug: 'florencia', isActive: true },

        // Casanare
        { name: 'Yopal', departmentId: getDept('CAS').id, slug: 'yopal', isActive: true },
        { name: 'Aguazul', departmentId: getDept('CAS').id, slug: 'aguazul', isActive: true },

        // Cauca
        { name: 'Popayán', departmentId: getDept('CAU').id, slug: 'popayan', isActive: true },
        { name: 'Santander de Quilichao', departmentId: getDept('CAU').id, slug: 'santander-de-quilichao', isActive: true },

        // Cesar
        { name: 'Valledupar', departmentId: getDept('CES').id, slug: 'valledupar', isActive: true },
        { name: 'Aguachica', departmentId: getDept('CES').id, slug: 'aguachica', isActive: true },
        { name: 'Codazzi', departmentId: getDept('CES').id, slug: 'codazzi', isActive: true },

        // Chocó
        { name: 'Quibdó', departmentId: getDept('CHO').id, slug: 'quibdo', isActive: true },

        // Córdoba
        { name: 'Montería', departmentId: getDept('COR').id, slug: 'monteria', isActive: true },
        { name: 'Cereté', departmentId: getDept('COR').id, slug: 'cerete', isActive: true },
        { name: 'Lorica', departmentId: getDept('COR').id, slug: 'lorica', isActive: true },
        { name: 'Sahagún', departmentId: getDept('COR').id, slug: 'sahagun', isActive: true },

        // Cundinamarca
        { name: 'Bogotá', departmentId: getDept('CUN').id, slug: 'bogota', isActive: true },
        { name: 'Soacha', departmentId: getDept('CUN').id, slug: 'soacha', isActive: true },
        { name: 'Chía', departmentId: getDept('CUN').id, slug: 'chia', isActive: true },
        { name: 'Zipaquirá', departmentId: getDept('CUN').id, slug: 'zipaquira', isActive: true },
        { name: 'Facatativá', departmentId: getDept('CUN').id, slug: 'facatativa', isActive: true },
        { name: 'Fusagasugá', departmentId: getDept('CUN').id, slug: 'fusagasuga', isActive: true },
        { name: 'Cajicá', departmentId: getDept('CUN').id, slug: 'cajica', isActive: true },
        { name: 'Madrid', departmentId: getDept('CUN').id, slug: 'madrid', isActive: true },
        { name: 'Mosquera', departmentId: getDept('CUN').id, slug: 'mosquera', isActive: true },
        { name: 'Funza', departmentId: getDept('CUN').id, slug: 'funza', isActive: true },
        { name: 'Girardot', departmentId: getDept('CUN').id, slug: 'girardot', isActive: true },

        // Guainía
        { name: 'Inírida', departmentId: getDept('GUA').id, slug: 'inirida', isActive: true },

        // Guaviare
        { name: 'San José del Guaviare', departmentId: getDept('GUV').id, slug: 'san-jose-del-guaviare', isActive: true },

        // Huila
        { name: 'Neiva', departmentId: getDept('HUI').id, slug: 'neiva', isActive: true },
        { name: 'Pitalito', departmentId: getDept('HUI').id, slug: 'pitalito', isActive: true },
        { name: 'Garzón', departmentId: getDept('HUI').id, slug: 'garzon', isActive: true },

        // La Guajira
        { name: 'Riohacha', departmentId: getDept('LAG').id, slug: 'riohacha', isActive: true },
        { name: 'Maicao', departmentId: getDept('LAG').id, slug: 'maicao', isActive: true },
        { name: 'Uribia', departmentId: getDept('LAG').id, slug: 'uribia', isActive: true },

        // Magdalena
        { name: 'Santa Marta', departmentId: getDept('MAG').id, slug: 'santa-marta', isActive: true },
        { name: 'Ciénaga', departmentId: getDept('MAG').id, slug: 'cienaga', isActive: true },
        { name: 'Fundación', departmentId: getDept('MAG').id, slug: 'fundacion', isActive: true },

        // Meta
        { name: 'Villavicencio', departmentId: getDept('MET').id, slug: 'villavicencio', isActive: true },
        { name: 'Acacías', departmentId: getDept('MET').id, slug: 'acacias', isActive: true },
        { name: 'Granada', departmentId: getDept('MET').id, slug: 'granada', isActive: true },

        // Nariño
        { name: 'Pasto', departmentId: getDept('NAR').id, slug: 'pasto', isActive: true },
        { name: 'Tumaco', departmentId: getDept('NAR').id, slug: 'tumaco', isActive: true },
        { name: 'Ipiales', departmentId: getDept('NAR').id, slug: 'ipiales', isActive: true },

        // Norte de Santander
        { name: 'Cúcuta', departmentId: getDept('NSA').id, slug: 'cucuta', isActive: true },
        { name: 'Ocaña', departmentId: getDept('NSA').id, slug: 'ocana', isActive: true },
        { name: 'Pamplona', departmentId: getDept('NSA').id, slug: 'pamplona', isActive: true },
        { name: 'Villa del Rosario', departmentId: getDept('NSA').id, slug: 'villa-del-rosario', isActive: true },

        // Putumayo
        { name: 'Mocoa', departmentId: getDept('PUT').id, slug: 'mocoa', isActive: true },

        // Quindío
        { name: 'Armenia', departmentId: getDept('QUI').id, slug: 'armenia', isActive: true },
        { name: 'Calarcá', departmentId: getDept('QUI').id, slug: 'calarca', isActive: true },
        { name: 'Montenegro', departmentId: getDept('QUI').id, slug: 'montenegro', isActive: true },

        // Risaralda
        { name: 'Pereira', departmentId: getDept('RIS').id, slug: 'pereira', isActive: true },
        { name: 'Dosquebradas', departmentId: getDept('RIS').id, slug: 'dosquebradas', isActive: true },
        { name: 'Santa Rosa de Cabal', departmentId: getDept('RIS').id, slug: 'santa-rosa-de-cabal', isActive: true },
        { name: 'La Virginia', departmentId: getDept('RIS').id, slug: 'la-virginia', isActive: true },

        // San Andrés y Providencia
        { name: 'San Andrés', departmentId: getDept('SAP').id, slug: 'san-andres', isActive: true },

        // Santander
        { name: 'Bucaramanga', departmentId: getDept('SAN').id, slug: 'bucaramanga', isActive: true },
        { name: 'Floridablanca', departmentId: getDept('SAN').id, slug: 'floridablanca', isActive: true },
        { name: 'Girón', departmentId: getDept('SAN').id, slug: 'giron', isActive: true },
        { name: 'Piedecuesta', departmentId: getDept('SAN').id, slug: 'piedecuesta', isActive: true },
        { name: 'Barrancabermeja', departmentId: getDept('SAN').id, slug: 'barrancabermeja', isActive: true },
        { name: 'San Gil', departmentId: getDept('SAN').id, slug: 'san-gil', isActive: true },

        // Sucre
        { name: 'Sincelejo', departmentId: getDept('SUC').id, slug: 'sincelejo', isActive: true },
        { name: 'Corozal', departmentId: getDept('SUC').id, slug: 'corozal', isActive: true },

        // Tolima
        { name: 'Ibagué', departmentId: getDept('TOL').id, slug: 'ibague', isActive: true },
        { name: 'Espinal', departmentId: getDept('TOL').id, slug: 'espinal', isActive: true },
        { name: 'Melgar', departmentId: getDept('TOL').id, slug: 'melgar', isActive: true },

        // Valle del Cauca
        { name: 'Cali', departmentId: getDept('VAL').id, slug: 'cali', isActive: true },
        { name: 'Palmira', departmentId: getDept('VAL').id, slug: 'palmira', isActive: true },
        { name: 'Buenaventura', departmentId: getDept('VAL').id, slug: 'buenaventura', isActive: true },
        { name: 'Tuluá', departmentId: getDept('VAL').id, slug: 'tulua', isActive: true },
        { name: 'Cartago', departmentId: getDept('VAL').id, slug: 'cartago', isActive: true },
        { name: 'Buga', departmentId: getDept('VAL').id, slug: 'buga', isActive: true },
        { name: 'Jamundí', departmentId: getDept('VAL').id, slug: 'jamundi', isActive: true },
        { name: 'Yumbo', departmentId: getDept('VAL').id, slug: 'yumbo', isActive: true },

        // Vaupés
        { name: 'Mitú', departmentId: getDept('VAU').id, slug: 'mitu', isActive: true },

        // Vichada
        { name: 'Puerto Carreño', departmentId: getDept('VID').id, slug: 'puerto-carreno', isActive: true }
    ];

    const created = await City.bulkCreate(cities);
    console.log(`  ✅ Created ${created.length} cities`);

    return created;
};
