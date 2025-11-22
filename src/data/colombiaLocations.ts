export interface Department {
    id: string;
    name: string;
}

export interface City {
    id: string;
    name: string;
    departmentId: string;
}

export const departments: Department[] = [
    { id: 'amazonas', name: 'Amazonas' },
    { id: 'antioquia', name: 'Antioquia' },
    { id: 'arauca', name: 'Arauca' },
    { id: 'atlantico', name: 'Atlántico' },
    { id: 'bolivar', name: 'Bolívar' },
    { id: 'boyaca', name: 'Boyacá' },
    { id: 'caldas', name: 'Caldas' },
    { id: 'caqueta', name: 'Caquetá' },
    { id: 'casanare', name: 'Casanare' },
    { id: 'cauca', name: 'Cauca' },
    { id: 'cesar', name: 'Cesar' },
    { id: 'choco', name: 'Chocó' },
    { id: 'cordoba', name: 'Córdoba' },
    { id: 'cundinamarca', name: 'Cundinamarca' },
    { id: 'guainia', name: 'Guainía' },
    { id: 'guaviare', name: 'Guaviare' },
    { id: 'huila', name: 'Huila' },
    { id: 'guajira', name: 'La Guajira' },
    { id: 'magdalena', name: 'Magdalena' },
    { id: 'meta', name: 'Meta' },
    { id: 'narino', name: 'Nariño' },
    { id: 'norte-santander', name: 'Norte de Santander' },
    { id: 'putumayo', name: 'Putumayo' },
    { id: 'quindio', name: 'Quindío' },
    { id: 'risaralda', name: 'Risaralda' },
    { id: 'san-andres', name: 'San Andrés y Providencia' },
    { id: 'santander', name: 'Santander' },
    { id: 'sucre', name: 'Sucre' },
    { id: 'tolima', name: 'Tolima' },
    { id: 'valle', name: 'Valle del Cauca' },
    { id: 'vaupes', name: 'Vaupés' },
    { id: 'vichada', name: 'Vichada' },
    { id: 'bogota', name: 'Bogotá D.C.' },
];

export const cities: City[] = [
    // Amazonas
    { id: 'leticia', name: 'Leticia', departmentId: 'amazonas' },
    { id: 'puerto-narino', name: 'Puerto Nariño', departmentId: 'amazonas' },

    // Antioquia
    { id: 'medellin', name: 'Medellín', departmentId: 'antioquia' },
    { id: 'bello', name: 'Bello', departmentId: 'antioquia' },
    { id: 'itagui', name: 'Itagüí', departmentId: 'antioquia' },
    { id: 'envigado', name: 'Envigado', departmentId: 'antioquia' },
    { id: 'apartado', name: 'Apartadó', departmentId: 'antioquia' },
    { id: 'turbo', name: 'Turbo', departmentId: 'antioquia' },
    { id: 'rionegro', name: 'Rionegro', departmentId: 'antioquia' },

    // Arauca
    { id: 'arauca-city', name: 'Arauca', departmentId: 'arauca' },
    { id: 'arauquita', name: 'Arauquita', departmentId: 'arauca' },

    // Atlántico
    { id: 'barranquilla', name: 'Barranquilla', departmentId: 'atlantico' },
    { id: 'soledad', name: 'Soledad', departmentId: 'atlantico' },
    { id: 'malambo', name: 'Malambo', departmentId: 'atlantico' },
    { id: 'sabanalarga', name: 'Sabanalarga', departmentId: 'atlantico' },

    // Bolívar
    { id: 'cartagena', name: 'Cartagena', departmentId: 'bolivar' },
    { id: 'magangue', name: 'Magangué', departmentId: 'bolivar' },
    { id: 'turbaco', name: 'Turbaco', departmentId: 'bolivar' },

    // Boyacá
    { id: 'tunja', name: 'Tunja', departmentId: 'boyaca' },
    { id: 'duitama', name: 'Duitama', departmentId: 'boyaca' },
    { id: 'sogamoso', name: 'Sogamoso', departmentId: 'boyaca' },
    { id: 'chiquinquira', name: 'Chiquinquirá', departmentId: 'boyaca' },

    // Caldas
    { id: 'manizales', name: 'Manizales', departmentId: 'caldas' },
    { id: 'villamaria', name: 'Villamaría', departmentId: 'caldas' },
    { id: 'chinchina', name: 'Chinchiná', departmentId: 'caldas' },

    // Caquetá
    { id: 'florencia', name: 'Florencia', departmentId: 'caqueta' },
    { id: 'san-vicente-caguan', name: 'San Vicente del Caguán', departmentId: 'caqueta' },

    // Casanare
    { id: 'yopal', name: 'Yopal', departmentId: 'casanare' },
    { id: 'aguazul', name: 'Aguazul', departmentId: 'casanare' },

    // Cauca
    { id: 'popayan', name: 'Popayán', departmentId: 'cauca' },
    { id: 'santander-quilichao', name: 'Santander de Quilichao', departmentId: 'cauca' },

    // Cesar
    { id: 'valledupar', name: 'Valledupar', departmentId: 'cesar' },
    { id: 'aguachica', name: 'Aguachica', departmentId: 'cesar' },
    { id: 'bosconia', name: 'Bosconia', departmentId: 'cesar' },

    // Chocó
    { id: 'quibdo', name: 'Quibdó', departmentId: 'choco' },
    { id: 'istmina', name: 'Istmina', departmentId: 'choco' },

    // Córdoba
    { id: 'monteria', name: 'Montería', departmentId: 'cordoba' },
    { id: 'lorica', name: 'Lorica', departmentId: 'cordoba' },
    { id: 'cerete', name: 'Cereté', departmentId: 'cordoba' },

    // Cundinamarca
    { id: 'soacha', name: 'Soacha', departmentId: 'cundinamarca' },
    { id: 'fusagasuga', name: 'Fusagasugá', departmentId: 'cundinamarca' },
    { id: 'facatativa', name: 'Facatativá', departmentId: 'cundinamarca' },
    { id: 'zipaquira', name: 'Zipaquirá', departmentId: 'cundinamarca' },
    { id: 'chia', name: 'Chía', departmentId: 'cundinamarca' },
    { id: 'madrid', name: 'Madrid', departmentId: 'cundinamarca' },
    { id: 'mosquera', name: 'Mosquera', departmentId: 'cundinamarca' },

    // Guainía
    { id: 'inirida', name: 'Inírida', departmentId: 'guainia' },

    // Guaviare
    { id: 'san-jose-guaviare', name: 'San José del Guaviare', departmentId: 'guaviare' },

    // Huila
    { id: 'neiva', name: 'Neiva', departmentId: 'huila' },
    { id: 'pitalito', name: 'Pitalito', departmentId: 'huila' },
    { id: 'garzon', name: 'Garzón', departmentId: 'huila' },

    // La Guajira
    { id: 'riohacha', name: 'Riohacha', departmentId: 'guajira' },
    { id: 'maicao', name: 'Maicao', departmentId: 'guajira' },

    // Magdalena
    { id: 'santa-marta', name: 'Santa Marta', departmentId: 'magdalena' },
    { id: 'cienaga', name: 'Ciénaga', departmentId: 'magdalena' },

    // Meta
    { id: 'villavicencio', name: 'Villavicencio', departmentId: 'meta' },
    { id: 'acacias', name: 'Acacías', departmentId: 'meta' },
    { id: 'granada', name: 'Granada', departmentId: 'meta' },

    // Nariño
    { id: 'pasto', name: 'Pasto', departmentId: 'narino' },
    { id: 'ipiales', name: 'Ipiales', departmentId: 'narino' },
    { id: 'tumaco', name: 'Tumaco', departmentId: 'narino' },

    // Norte de Santander
    { id: 'cucuta', name: 'Cúcuta', departmentId: 'norte-santander' },
    { id: 'ocana', name: 'Ocaña', departmentId: 'norte-santander' },
    { id: 'pamplona', name: 'Pamplona', departmentId: 'norte-santander' },

    // Putumayo
    { id: 'mocoa', name: 'Mocoa', departmentId: 'putumayo' },
    { id: 'puerto-asis', name: 'Puerto Asís', departmentId: 'putumayo' },

    // Quindío
    { id: 'armenia', name: 'Armenia', departmentId: 'quindio' },
    { id: 'calarca', name: 'Calarcá', departmentId: 'quindio' },
    { id: 'montenegro', name: 'Montenegro', departmentId: 'quindio' },

    // Risaralda
    { id: 'pereira', name: 'Pereira', departmentId: 'risaralda' },
    { id: 'dosquebradas', name: 'Dosquebradas', departmentId: 'risaralda' },
    { id: 'santa-rosa-cabal', name: 'Santa Rosa de Cabal', departmentId: 'risaralda' },

    // San Andrés y Providencia
    { id: 'san-andres', name: 'San Andrés', departmentId: 'san-andres' },
    { id: 'providencia', name: 'Providencia', departmentId: 'san-andres' },

    // Santander
    { id: 'bucaramanga', name: 'Bucaramanga', departmentId: 'santander' },
    { id: 'floridablanca', name: 'Floridablanca', departmentId: 'santander' },
    { id: 'giron', name: 'Girón', departmentId: 'santander' },
    { id: 'piedecuesta', name: 'Piedecuesta', departmentId: 'santander' },
    { id: 'barrancabermeja', name: 'Barrancabermeja', departmentId: 'santander' },

    // Sucre
    { id: 'sincelejo', name: 'Sincelejo', departmentId: 'sucre' },
    { id: 'corozal', name: 'Corozal', departmentId: 'sucre' },

    // Tolima
    { id: 'ibague', name: 'Ibagué', departmentId: 'tolima' },
    { id: 'espinal', name: 'Espinal', departmentId: 'tolima' },
    { id: 'melgar', name: 'Melgar', departmentId: 'tolima' },

    // Valle del Cauca
    { id: 'cali', name: 'Cali', departmentId: 'valle' },
    { id: 'palmira', name: 'Palmira', departmentId: 'valle' },
    { id: 'buenaventura', name: 'Buenaventura', departmentId: 'valle' },
    { id: 'tulua', name: 'Tuluá', departmentId: 'valle' },
    { id: 'cartago', name: 'Cartago', departmentId: 'valle' },
    { id: 'buga', name: 'Buga', departmentId: 'valle' },

    // Vaupés
    { id: 'mitu', name: 'Mitú', departmentId: 'vaupes' },

    // Vichada
    { id: 'puerto-carreno', name: 'Puerto Carreño', departmentId: 'vichada' },

    // Bogotá D.C.
    { id: 'bogota-city', name: 'Bogotá', departmentId: 'bogota' },
];

// Helper function to get cities by department
export const getCitiesByDepartment = (departmentId: string): City[] => {
    return cities.filter(city => city.departmentId === departmentId);
};

// Helper function to get all city names (for backwards compatibility)
export const getAllCityNames = (): string[] => {
    return cities.map(city => city.name).sort();
};
