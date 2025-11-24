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

export type AdminSection = 'dashboard' | 'pending' | 'all-properties' | 'users' | 'config' | 'activity' | 'payments';

export type IdType = 'CC' | 'NIT' | 'CE';
export type OwnerRole = 'individual' | 'agency';
export type PaymentMethod = 'PSE' | 'CreditCard' | 'Nequi' | 'Daviplata';

export interface BankDetails {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
}

export interface BillingDetails {
  taxId: string;
  billingAddress: string;
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  idType?: IdType;
  idNumber?: string;
  role?: OwnerRole;
  userType?: 'owner' | 'tenant';
  password?: string;
  confirmPassword?: string;
  isVerified?: boolean;
  verificationDocuments?: string[];
  availableForVisit?: boolean;
  paymentPreference?: PaymentMethod;
  bankDetails?: BankDetails;
  billingDetails?: BillingDetails;
  propertiesCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  joinedAt: string;
  plan?: 'free' | 'premium';
  paymentRequestId?: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  referenceCode: string;
  proofImage: string; // base64
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  processedAt?: string;
}