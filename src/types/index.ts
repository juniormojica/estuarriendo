export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'pension' | 'habitacion' | 'apartamento' | 'aparta-estudio';
  price: number;
  currency: string;
  address: {
    country: string;
    department: string;
    city: string;
    street: string;
    postalCode: string;
  };
  rooms?: number;
  bathrooms?: number;
  area?: number;
  images: string[];
  amenities: string[];
  nearbyUniversities?: string[];
  createdAt: string;
  featured?: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface SearchFilters {
  city?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  rooms?: number;
  bathrooms?: number;
  amenities?: string[];
  university?: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  type: Property['type'];
  price: number;
  currency: string;
  address: Property['address'];
  rooms?: number;
  bathrooms?: number;
  area?: number;
  amenities: string[];
  images: File[] | string[]; // Support both File objects and base64 strings
}