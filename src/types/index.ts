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
  ownerId?: string;
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

export type IdType = 'CC' | 'NIT' | 'CE';
export type OwnerRole = 'individual' | 'agency';
export type PaymentMethod = 'PSE' | 'CreditCard' | 'Nequi' | 'Daviplata';

export interface BankDetails {
  bankName: string;
  accountType: 'savings' | 'checking';
  accountNumber: string;
  accountHolder: string;
}

export interface BillingDetails {
  address: string;
  rut: string;
}

export interface User {
  id: string;
  // Phase 1: Basic Info
  name: string; // Razón Social or Full Name
  email: string;
  phone: string;
  whatsapp: string;
  idType?: IdType;
  idNumber?: string;
  role?: OwnerRole;
  password?: string; // In a real app, this wouldn't be here, but for mock auth

  // Phase 2: Business Profile & Trust
  isVerified?: boolean;
  verificationDocuments?: string[]; // URLs to docs
  availableForVisit?: boolean;
  paymentPreference?: PaymentMethod;
  bankDetails?: BankDetails;
  billingDetails?: BillingDetails;

  // Stats
  propertiesCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  joinedAt: string;
}