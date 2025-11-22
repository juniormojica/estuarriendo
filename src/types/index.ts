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
  isVerified?: boolean;
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

export interface PropertyStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  propertiesCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  joinedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'property_submitted' | 'property_approved' | 'property_rejected' | 'property_deleted' | 'property_featured' | 'user_registered' | 'config_updated';
  message: string;
  timestamp: string;
  userId?: string;
  propertyId?: string;
}

export interface SystemConfig {
  commissionRate: number;
  featuredPropertyPrice: number;
  maxImagesPerProperty: number;
  minPropertyPrice: number;
  maxPropertyPrice: number;
  autoApprovalEnabled: boolean;
}

export type AdminSection = 'dashboard' | 'pending' | 'all-properties' | 'users' | 'config' | 'activity';