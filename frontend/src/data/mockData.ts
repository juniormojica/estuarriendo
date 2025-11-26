import { Property, Amenity } from '../types';

export const mockAmenities: Amenity[] = [
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'parking', name: 'Parqueadero', icon: '🚗' },
  { id: 'pool', name: 'Piscina', icon: '🏊' },
  { id: 'gym', name: 'Gimnasio', icon: '💪' },
  { id: 'laundry', name: 'Lavandería', icon: '👕' },
  { id: 'security', name: 'Seguridad 24h', icon: '🛡️' },
  { id: 'elevator', name: 'Ascensor', icon: '🛗' },
  { id: 'balcony', name: 'Balcón', icon: '🏡' },
  { id: 'furnished', name: 'Amoblado', icon: '🛋️' },
  { id: 'ac', name: 'Aire Acondicionado', icon: '❄️' },
  { id: 'heating', name: 'Calefacción', icon: '🔥' },
  { id: 'kitchen', name: 'Cocina Equipada', icon: '🍳' },
  // Room-specific amenities
  { id: 'private-bathroom', name: 'Baño Interno', icon: '🚿' },
  { id: 'closet', name: 'Closet', icon: '👔' },
  { id: 'fan', name: 'Abanico', icon: '🌀' },
  { id: 'desk', name: 'Escritorio', icon: '🪑' },
  { id: 'window', name: 'Ventana Exterior', icon: '🪟' },
  { id: 'bed', name: 'Cama Incluida', icon: '🛏️' },
  { id: 'tv', name: 'TV', icon: '📺' },
];

export const universities = [
  { id: 'upc', name: 'Universidad Popular del Cesar - Sabanas' },
  { id: 'udes', name: 'Universidad de Santander - UDES' },
  { id: 'areandina', name: 'Fundación Universitaria del Área Andina' },
  { id: 'unad', name: 'Universidad Nacional Abierta y a Distancia - UNAD' },
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Apartamento Moderno cerca a UPC Sabanas',
    description: 'Hermoso apartamento completamente amoblado a solo 5 minutos de la Universidad Popular del Cesar. Cuenta con acabados de primera calidad, amplios espacios y una ubicación privilegiada cerca de supermercados, restaurantes y transporte público.',
    type: 'apartamento',
    price: 1200000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 16B #15-45, Sabanas',
      postalCode: '200001'
    },
    rooms: 2,
    bathrooms: 2,
    area: 65,
    images: [
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
      'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg'
    ],
    amenities: ['wifi', 'parking', 'security', 'furnished', 'ac'],
    nearbyUniversities: ['upc'],
    createdAt: '2024-01-15',
    featured: true,
    status: 'approved'
  },
  {
    id: '2',
    title: 'Habitación Cómoda para Estudiantes - Los Cortijos',
    description: 'Habitación perfecta para estudiantes universitarios. Ubicada en Los Cortijos, cerca de UDES y Areandina. Incluye servicios públicos, internet de alta velocidad y ambiente tranquilo para estudiar.',
    type: 'habitacion',
    price: 450000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Carrera 9 #18-23, Los Cortijos',
      postalCode: '200002'
    },
    rooms: 1,
    bathrooms: 1,
    area: 18,
    images: [
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg',
      'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg'
    ],
    amenities: ['wifi', 'furnished', 'laundry', 'security'],
    nearbyUniversities: ['udes', 'areandina'],
    createdAt: '2024-01-10',
    status: 'approved'
  },
  {
    id: '3',
    title: 'Pensión Familiar en el Centro',
    description: 'Acogedora pensión familiar con ambiente hogareño en el centro de Valledupar. Incluye desayuno y cena, servicio de lavandería y espacios comunes para socializar. Ideal para estudiantes de UNAD.',
    type: 'pension',
    price: 650000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 16 #5-67, Centro',
      postalCode: '200001'
    },
    bathrooms: 1,
    images: [
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
      'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg'
    ],
    amenities: ['wifi', 'laundry', 'kitchen', 'furnished'],
    nearbyUniversities: ['unad'],
    createdAt: '2024-01-08',
    status: 'approved'
  },
  {
    id: '4',
    title: 'Aparta-estudio Ejecutivo - Novalito',
    description: 'Moderno aparta-estudio ideal para estudiantes de posgrado o profesionales. Completamente equipado con cocina integral, área de trabajo y excelente ubicación en Novalito, cerca de todas las universidades.',
    type: 'aparta-estudio',
    price: 900000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 19 #12-34, Novalito',
      postalCode: '200003'
    },
    rooms: 1,
    bathrooms: 1,
    area: 35,
    images: [
      'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg',
      'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg',
      'https://images.pexels.com/photos/2080018/pexels-photo-2080018.jpeg'
    ],
    amenities: ['wifi', 'parking', 'security', 'furnished', 'ac'],
    nearbyUniversities: ['upc', 'udes', 'areandina', 'unad'],
    createdAt: '2024-01-12',
    featured: true,
    status: 'approved'
  },
  {
    id: '5',
    title: 'Apartamento Amplio en La Arizona',
    description: 'Espacioso apartamento en conjunto cerrado en La Arizona. Perfecto para compartir entre estudiantes. Cuenta con áreas verdes, parqueadero y seguridad 24 horas. Cerca de UPC.',
    type: 'apartamento',
    price: 1500000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Carrera 20 #25-89, La Arizona',
      postalCode: '200004'
    },
    rooms: 3,
    bathrooms: 2,
    area: 85,
    images: [
      'https://images.pexels.com/photos/2062431/pexels-photo-2062431.jpeg',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
      'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg'
    ],
    amenities: ['wifi', 'parking', 'pool', 'security', 'balcony'],
    nearbyUniversities: ['upc'],
    createdAt: '2024-01-05',
    status: 'approved'
  },
  {
    id: '6',
    title: 'Habitación Premium cerca de UDES',
    description: 'Habitación premium con balcón y excelente iluminación. Ideal para estudiantes de UDES que buscan comodidad y tranquilidad. Incluye escritorio amplio y closet.',
    type: 'habitacion',
    price: 550000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 10 #8-45, Los Cortijos',
      postalCode: '200002'
    },
    rooms: 1,
    bathrooms: 1,
    area: 22,
    images: [
      'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg',
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'
    ],
    amenities: ['wifi', 'balcony', 'furnished', 'ac', 'security'],
    nearbyUniversities: ['udes'],
    createdAt: '2024-01-03',
    status: 'approved'
  },
  {
    id: '7',
    title: 'Pensión Estudiantil cerca de Areandina',
    description: 'Pensión especialmente diseñada para estudiantes de Areandina. Ambiente familiar, comidas incluidas y espacios de estudio compartidos. Excelente relación calidad-precio.',
    type: 'pension',
    price: 700000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Carrera 8 #17-12, Los Cortijos',
      postalCode: '200002'
    },
    bathrooms: 2,
    images: [
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
      'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg'
    ],
    amenities: ['wifi', 'laundry', 'kitchen', 'furnished', 'security'],
    nearbyUniversities: ['areandina'],
    createdAt: '2024-01-06',
    status: 'approved'
  },
  {
    id: '8',
    title: 'Habitación Económica - Centro',
    description: 'Habitación económica en el centro de Valledupar. Perfecta para estudiantes que buscan ahorrar. Cerca de transporte público y comercios. Acceso a todas las universidades.',
    type: 'habitacion',
    price: 380000,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: 'Cesar',
      city: 'Valledupar',
      street: 'Calle 15 #6-23, Centro',
      postalCode: '200001'
    },
    rooms: 1,
    bathrooms: 1,
    area: 15,
    images: [
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'
    ],
    amenities: ['wifi', 'furnished', 'laundry'],
    nearbyUniversities: ['unad', 'upc', 'udes', 'areandina'],
    createdAt: '2024-01-02',
    status: 'approved'
  }
];