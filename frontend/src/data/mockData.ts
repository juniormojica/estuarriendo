import { Property, Amenity } from '../types';

export const mockAmenities: Amenity[] = [
  { id: 'wifi', name: 'WiFi', icon: 'wifi' },
  { id: 'parking', name: 'Parqueadero', icon: 'parking' },
  { id: 'pool', name: 'Piscina', icon: 'pool' },
  { id: 'gym', name: 'Gimnasio', icon: 'gym' },
  { id: 'laundry', name: 'Lavandería', icon: 'laundry' },
  { id: 'security', name: 'Seguridad 24h', icon: 'security' },
  { id: 'elevator', name: 'Ascensor', icon: 'elevator' },
  { id: 'balcony', name: 'Balcón', icon: 'balcony' },
  { id: 'furnished', name: 'Amoblado', icon: 'furnished' },
  { id: 'ac', name: 'Aire Acondicionado', icon: 'ac' },
  { id: 'heating', name: 'Calefacción', icon: 'heating' },
  { id: 'kitchen', name: 'Cocina Equipada', icon: 'kitchen' },
  // Room-specific amenities
  { id: 'private-bathroom', name: 'Baño Interno', icon: 'private-bathroom' },
  { id: 'closet', name: 'Closet', icon: 'closet' },
  { id: 'fan', name: 'Abanico', icon: 'fan' },
  { id: 'desk', name: 'Escritorio', icon: 'desk' },
  { id: 'window', name: 'Ventana Exterior', icon: 'window' },
  { id: 'bed', name: 'Cama Incluida', icon: 'bed' },
  { id: 'tv', name: 'TV', icon: 'tv' },
];

export const universities = [
  { id: 'upc', name: 'Universidad Popular del Cesar - Sabanas', lat: 10.4594, lng: -73.2625 },
  { id: 'udes', name: 'Universidad de Santander - UDES', lat: 10.4851, lng: -73.2438 },
  { id: 'areandina', name: 'Fundación Universitaria del Área Andina', lat: 10.4792, lng: -73.2456 },
  { id: 'unad', name: 'Universidad Nacional Abierta y a Distancia - UNAD', lat: 10.4631, lng: -73.2532 },
];

export const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Apartamento Moderno cerca a UPC Sabanas',
    description: 'Hermoso apartamento completamente amoblado a solo 5 minutos de la Universidad Popular del Cesar. Cuenta con acabados de primera calidad, amplios espacios y una ubicación privilegiada cerca de supermercados, restaurantes y transporte público.',
    ownerId: 'owner1',
    type: { id: 1, name: 'apartamento' },
    monthlyRent: 1200000,
    currency: 'COP',
    location: {
      id: 1,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 16B #15-45, Sabanas',
      postalCode: '200001'
    },
    bedrooms: 2,
    bathrooms: 2,
    area: 65,
    images: [
      { id: 1, propertyId: 1, url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg', displayOrder: 1, isPrimary: true },
      { id: 2, propertyId: 1, url: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg', displayOrder: 2, isPrimary: false },
      { id: 3, propertyId: 1, url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg', displayOrder: 3, isPrimary: false },
      { id: 4, propertyId: 1, url: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg', displayOrder: 4, isPrimary: false }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'parking', name: 'Parqueadero', icon: 'parking' },
      { id: 'security', name: 'Seguridad 24h', icon: 'security' },
      { id: 'furnished', name: 'Amoblado', icon: 'furnished' },
      { id: 'ac', name: 'Aire Acondicionado', icon: 'ac' }
    ],
    institutions: [{ id: 1, name: 'Universidad Popular del Cesar - Sabanas', cityId: 1, type: 'universidad' }],
    createdAt: '2024-01-15',
    isFeatured: true,
    status: 'approved',
    viewsCount: 150,
    interestsCount: 12,
    isVerified: true,
    isRented: false,
    isContainer: false
  },
  {
    id: 2,
    title: 'Habitación Cómoda para Estudiantes - Los Cortijos',
    description: 'Habitación perfecta para estudiantes universitarios. Ubicada en Los Cortijos, cerca de UDES y Areandina. Incluye servicios públicos, internet de alta velocidad y ambiente tranquilo para estudiar.',
    ownerId: 'owner2',
    type: { id: 2, name: 'habitacion' },
    monthlyRent: 450000,
    currency: 'COP',
    location: {
      id: 2,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Carrera 9 #18-23, Los Cortijos',
      postalCode: '200002'
    },
    bedrooms: 1,
    bathrooms: 1,
    area: 18,
    images: [
      { id: 5, propertyId: 2, url: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg', displayOrder: 1, isPrimary: true },
      { id: 6, propertyId: 2, url: 'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg', displayOrder: 2, isPrimary: false }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'furnished', name: 'Amoblado', icon: 'furnished' },
      { id: 'laundry', name: 'Lavandería', icon: 'laundry' },
      { id: 'security', name: 'Seguridad 24h', icon: 'security' }
    ],
    institutions: [
      { id: 2, name: 'Universidad de Santander - UDES', cityId: 1, type: 'universidad' },
      { id: 3, name: 'Fundación Universitaria del Área Andina', cityId: 1, type: 'universidad' }
    ],
    createdAt: '2024-01-10',
    isFeatured: false,
    status: 'approved',
    viewsCount: 85,
    interestsCount: 5,
    isVerified: true,
    isRented: false,
    isContainer: false
  },
  {
    id: 3,
    title: 'Pensión Familiar en el Centro',
    description: 'Acogedora pensión familiar con ambiente hogareño en el centro de Valledupar. Incluye desayuno y cena, servicio de lavandería y espacios comunes para socializar. Ideal para estudiantes de UNAD.',
    ownerId: 'owner3',
    type: { id: 3, name: 'pension' },
    monthlyRent: 650000,
    currency: 'COP',
    location: {
      id: 3,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 16 #5-67, Centro',
      postalCode: '200001'
    },
    bedrooms: 1,
    bathrooms: 1,
    images: [
      { id: 7, propertyId: 3, url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg', displayOrder: 1, isPrimary: true },
      { id: 8, propertyId: 3, url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg', displayOrder: 2, isPrimary: false }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'laundry', name: 'Lavandería', icon: 'laundry' },
      { id: 'kitchen', name: 'Cocina Equipada', icon: 'kitchen' },
      { id: 'furnished', name: 'Amoblado', icon: 'furnished' }
    ],
    institutions: [{ id: 4, name: 'Universidad Nacional Abierta y a Distancia - UNAD', cityId: 1, type: 'universidad' }],
    createdAt: '2024-01-08',
    isFeatured: false,
    status: 'approved',
    viewsCount: 210,
    interestsCount: 18,
    isVerified: true,
    isRented: false,
    isContainer: true
  },
  {
    id: 4,
    title: 'Aparta-estudio Ejecutivo - Novalito',
    description: 'Moderno aparta-estudio ideal para estudiantes de posgrado o profesionales. Completamente equipado con cocina integral, área de trabajo y excelente ubicación en Novalito, cerca de todas las universidades.',
    ownerId: 'owner1',
    type: { id: 4, name: 'aparta-estudio' },
    monthlyRent: 900000,
    currency: 'COP',
    location: {
      id: 4,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 19 #12-34, Novalito',
      postalCode: '200003'
    },
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    images: [
      { id: 9, propertyId: 4, url: 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg', displayOrder: 1, isPrimary: true },
      { id: 10, propertyId: 4, url: 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg', displayOrder: 2, isPrimary: false },
      { id: 11, propertyId: 4, url: 'https://images.pexels.com/photos/2080018/pexels-photo-2080018.jpeg', displayOrder: 3, isPrimary: false }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'parking', name: 'Parqueadero', icon: 'parking' },
      { id: 'security', name: 'Seguridad 24h', icon: 'security' },
      { id: 'furnished', name: 'Amoblado', icon: 'furnished' },
      { id: 'ac', name: 'Aire Acondicionado', icon: 'ac' }
    ],
    institutions: [
      { id: 1, name: 'Universidad Popular del Cesar - Sabanas', cityId: 1, type: 'universidad' },
      { id: 2, name: 'Universidad de Santander - UDES', cityId: 1, type: 'universidad' }
    ],
    createdAt: '2024-01-12',
    isFeatured: true,
    status: 'approved',
    viewsCount: 300,
    interestsCount: 45,
    isVerified: true,
    isRented: false,
    isContainer: false
  },
  {
    id: 5,
    title: 'Apartamento Amplio en La Arizona',
    description: 'Espacioso apartamento en conjunto cerrado en La Arizona. Perfecto para compartir entre estudiantes. Cuenta con áreas verdes, parqueadero y seguridad 24 horas. Cerca de UPC.',
    ownerId: 'owner2',
    type: { id: 1, name: 'apartamento' },
    monthlyRent: 1500000,
    currency: 'COP',
    location: {
      id: 5,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Carrera 20 #25-89, La Arizona',
      postalCode: '200004'
    },
    bedrooms: 3,
    bathrooms: 2,
    area: 85,
    images: [
      { id: 12, propertyId: 5, url: 'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg', displayOrder: 1, isPrimary: true },
      { id: 13, propertyId: 5, url: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg', displayOrder: 2, isPrimary: false },
      { id: 14, propertyId: 5, url: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg', displayOrder: 3, isPrimary: false }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'parking', name: 'Parqueadero', icon: 'parking' },
      { id: 'pool', name: 'Piscina', icon: 'pool' },
      { id: 'security', name: 'Seguridad 24h', icon: 'security' },
      { id: 'balcony', name: 'Balcón', icon: 'balcony' }
    ],
    institutions: [{ id: 1, name: 'Universidad Popular del Cesar - Sabanas', cityId: 1, type: 'universidad' }],
    createdAt: '2024-01-05',
    isFeatured: false,
    status: 'approved',
    viewsCount: 120,
    interestsCount: 8,
    isVerified: true,
    isRented: false,
    isContainer: false
  },
  {
    id: 6,
    title: 'Habitación Premium cerca de UDES',
    description: 'Habitación premium con balcón y excelente iluminación. Ideal para estudiantes de UDES que buscan comodidad y tranquilidad. Incluye escritorio amplio y closet.',
    ownerId: 'owner3',
    type: { id: 2, name: 'habitacion' },
    monthlyRent: 550000,
    currency: 'COP',
    location: {
      id: 6,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 10 #8-45, Los Cortijos',
      postalCode: '200002'
    },
    bedrooms: 1,
    bathrooms: 1,
    area: 22,
    images: [
      { id: 15, propertyId: 6, url: 'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg', displayOrder: 1, isPrimary: true },
      { id: 16, propertyId: 6, url: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg', displayOrder: 2, isPrimary: false }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'balcony', name: 'Balcón', icon: 'balcony' },
      { id: 'furnished', name: 'Amoblado', icon: 'furnished' },
      { id: 'ac', name: 'Aire Acondicionado', icon: 'ac' },
      { id: 'security', name: 'Seguridad 24h', icon: 'security' }
    ],
    institutions: [{ id: 2, name: 'Universidad de Santander - UDES', cityId: 1, type: 'universidad' }],
    createdAt: '2024-01-03',
    isFeatured: false,
    status: 'approved',
    viewsCount: 95,
    interestsCount: 7,
    isVerified: true,
    isRented: false,
    isContainer: false
  },
  {
    id: 7,
    title: 'Pensión Estudiantil cerca de Areandina',
    description: 'Pensión especialmente diseñada para estudiantes de Areandina. Ambiente familiar, comidas incluidas y espacios de estudio compartidos. Excelente relación calidad-precio.',
    ownerId: 'owner1',
    type: { id: 3, name: 'pension' },
    monthlyRent: 700000,
    currency: 'COP',
    location: {
      id: 7,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Carrera 8 #17-12, Los Cortijos',
      postalCode: '200002'
    },
    bathrooms: 2,
    images: [
      { id: 17, propertyId: 7, url: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg', displayOrder: 1, isPrimary: true },
      { id: 18, propertyId: 7, url: 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg', displayOrder: 2, isPrimary: false }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'laundry', name: 'Lavandería', icon: 'laundry' },
      { id: 'kitchen', name: 'Cocina Equipada', icon: 'kitchen' },
      { id: 'furnished', name: 'Amoblado', icon: 'furnished' },
      { id: 'security', name: 'Seguridad 24h', icon: 'security' }
    ],
    institutions: [{ id: 3, name: 'Fundación Universitaria del Área Andina', cityId: 1, type: 'universidad' }],
    createdAt: '2024-01-06',
    isFeatured: false,
    status: 'approved',
    viewsCount: 180,
    interestsCount: 14,
    isVerified: true,
    isRented: false,
    isContainer: true
  },
  {
    id: 8,
    title: 'Habitación Económica - Centro',
    description: 'Habitación económica en el centro de Valledupar. Perfecta para estudiantes que buscan ahorrar. Cerca de transporte público y comercios. Acceso a todas las universidades.',
    ownerId: 'owner2',
    type: { id: 2, name: 'habitacion' },
    monthlyRent: 380000,
    currency: 'COP',
    location: {
      id: 8,
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 15 #6-23, Centro',
      postalCode: '200001'
    },
    bedrooms: 1,
    bathrooms: 1,
    area: 15,
    images: [
      { id: 19, propertyId: 8, url: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg', displayOrder: 1, isPrimary: true }
    ],
    amenities: [
      { id: 'wifi', name: 'WiFi', icon: 'wifi' },
      { id: 'furnished', name: 'Amoblado', icon: 'furnished' },
      { id: 'laundry', name: 'Lavandería', icon: 'laundry' }
    ],
    institutions: [
      { id: 4, name: 'Universidad Nacional Abierta y a Distancia - UNAD', cityId: 1, type: 'universidad' },
      { id: 1, name: 'Universidad Popular del Cesar - Sabanas', cityId: 1, type: 'universidad' },
      { id: 2, name: 'Universidad de Santander - UDES', cityId: 1, type: 'universidad' },
      { id: 3, name: 'Fundación Universitaria del Área Andina', cityId: 1, type: 'universidad' }
    ],
    createdAt: '2024-01-02',
    isFeatured: false,
    status: 'approved',
    viewsCount: 320,
    interestsCount: 25,
    isVerified: true,
    isRented: false,
    isContainer: false
  }
];