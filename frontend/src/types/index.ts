/**
 * =================================================================================
 * A. TIPOS AUXILIARES Y UNIONES (ENUM-LIKE STRINGS)
 * =================================================================================
 */

// Tipos de Documento
export type IdType = 'CC' | 'NIT' | 'CE' | 'Pasaporte';

// Roles del Propietario (Owner)
export type OwnerRole = 'individual' | 'agency';

// Tipos de Usuario Principal
export type UserType = 'owner' | 'tenant' | 'admin' | 'superAdmin';

// Métodos de Pago
export type PaymentMethod = 'PSE' | 'CreditCard' | 'Nequi' | 'Daviplata' | 'BankTransfer';

// Tipos de Cuenta Bancaria
export type AccountType = 'savings' | 'current' | 'checking';

// Tipos de Inmueble
export type PropertyType = 'pension' | 'habitacion' | 'apartamento' | 'aparta-estudio';

// Estado de la Propiedad (Aprobación)
export type PropertyStatus = 'pending' | 'approved' | 'rejected';

// Estado de Verificación de Usuario
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

// Tipos de Plan de Suscripción
export type PlanType = 'free' | 'premium';
export type SubscriptionType = 'weekly' | 'monthly' | 'quarterly';

// Tipos de Eventos en el Log de Actividad
export type ActivityLogType =
  | 'property_submitted'
  | 'property_approved'
  | 'property_rejected'
  | 'property_deleted'
  | 'property_featured'
  | 'user_registered'
  | 'config_updated'
  | 'payment_verified';

// Secciones de Navegación del Panel de Administración
export type AdminSection = 'dashboard' | 'pending' | 'all-properties' | 'users' | 'config' | 'activity' | 'payments' | 'verifications' | 'student-requests';

// Estados de la Solicitud de Pago
export type PaymentRequestStatus = 'pending' | 'verified' | 'rejected';

// Tipos de Notificación
export type NotificationType = 'property_interest' | 'payment_verified' | 'payment_rejected' | 'payment_submitted' | 'property_approved' | 'property_rejected';

// Estados de la Solicitud de Estudiante
export type StudentRequestStatus = 'open' | 'closed';


/**
 * =================================================================================
 * B. INTERFACES AUXILIARES Y COMPONENTES
 * =================================================================================
 */

export interface Address {
  country: string;
  cityId?: number;  // NEW: normalized city ID
  departmentId?: number;  // NEW: normalized department ID
  department: string;  // Keep for backward compatibility
  city: string;  // Keep for backward compatibility
  street: string;
  postalCode: string;
  neighborhood?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BankDetails {
  bankName: string;
  accountType: AccountType; // Uso el tipo más estricto
  accountNumber: string;
  holderName: string; // Coincide con el campo del usuario
}

export interface BillingDetails {
  taxId: string; // RUT
  billingAddress: string;
  city: string;
}

export interface VerificationDocuments {
  idFront: string;  // base64
  idBack: string;   // base64
  selfie: string;   // base64
  utilityBill: string; // base64
}

/**
 * =================================================================================
 * B2. NORMALIZED LOCATION AND INSTITUTION TYPES
 * =================================================================================
 */

// Department (normalized)
export interface Department {
  id: number;
  name: string;
  code: string;
  slug: string;
  isActive: boolean;
}

// City (normalized)
export interface City {
  id: number;
  name: string;
  slug: string;
  departmentId: number;
  department?: Department;
  isActive: boolean;
}

// Institution (universities, corporations, institutes)
export interface Institution {
  id: number;
  name: string;
  cityId: number;
  city?: City;
  type: 'universidad' | 'corporacion' | 'instituto';
  createdAt?: string;
  updatedAt?: string;
}

// Property-Institution relationship (for nearby institutions)
export interface PropertyInstitution {
  institutionId: number;
  distance?: number | null;  // Distance in meters (optional)
}

/**
 * =================================================================================
 * B3. LEGACY INTERFACES FOR NORMALIZED PROPERTY STRUCTURE
 * =================================================================================
 */

// Location (normalized from address)
export interface Location {
  id: number;
  cityId?: number;  // NEW
  departmentId?: number;  // NEW
  city: string;  // Keep for backward compat
  department: string;  // Keep for backward compat
  street: string;
  neighborhood?: string;
  postalCode?: string;
  zipCode?: string;  // Alias for postalCode
  latitude?: number;
  longitude?: number;
}

// PropertyType entity (normalized from string type)
export interface PropertyTypeEntity {
  id: number;
  name: string; // 'pension' | 'habitacion' | 'apartamento' | 'aparta-estudio'
}

// Property Contact information
export interface PropertyContact {
  id: number;
  propertyId: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  availableHours?: string;
}

// Property Features
export interface PropertyFeatures {
  id: number;
  propertyId: number;
  furnished: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  parking: boolean;
  elevator: boolean;
  security: boolean;
  gym: boolean;
  pool: boolean;
  laundry: boolean;
  storage: boolean;
  balcony: boolean;
  terrace: boolean;
  garden: boolean;
}

// Property Image
export interface PropertyImage {
  id: number;
  propertyId: number;
  url: string;
  caption?: string;
  displayOrder: number;
  isPrimary: boolean;
}


/**
 * =================================================================================
 * C. INTERFACES DE ENTIDADES PRINCIPALES 
 * =================================================================================
 */

export interface Property {
  // Core fields
  id: number; // Changed from string to number
  ownerId: string;
  title: string;
  description: string;

  // Pricing
  monthlyRent: number; // Renamed from price
  deposit?: number;
  currency: string;

  // Characteristics
  bedrooms?: number; // Renamed from rooms
  bathrooms?: number;
  area?: number;
  floor?: number;

  // Status
  status: PropertyStatus;
  isFeatured: boolean; // Renamed from featured
  isVerified: boolean;
  isRented: boolean; // Renamed from is_rented

  // Metrics
  viewsCount: number;
  interestsCount: number;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  availableFrom?: string;

  // Relations (populated by backend includes)
  location?: Location;
  type?: PropertyTypeEntity;
  contact?: PropertyContact;
  features?: PropertyFeatures;
  images?: PropertyImage[];
  institutions?: Institution[];
  amenities?: Amenity[];
  owner?: User; // If included
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  userType: UserType;

  // Detalles de Identificación (Owner/Verificación)
  idType?: IdType;
  idNumber?: string;
  role?: OwnerRole; // Si es 'owner', 'individual' o 'agency'

  // Estado y Auditoría
  isActive: boolean;
  joinedAt: string;
  updatedAt?: string;

  // Verificación
  isVerified?: boolean;
  verificationStatus: VerificationStatus;
  verificationDocuments?: VerificationDocuments;
  verificationSubmittedAt?: string;
  verificationProcessedAt?: string;
  verificationRejectionReason?: string;

  // Detalles de Pago/Facturación
  paymentPreference?: PaymentMethod;
  bankDetails?: BankDetails;
  billingDetails?: BillingDetails;
  availableForVisit?: boolean;

  // Estadísticas Desnormalizadas
  propertiesCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;

  // Planes/Suscripción
  plan?: PlanType;
  planType?: SubscriptionType;
  planStartedAt?: string;
  planExpiresAt?: string;
  paymentRequestId?: string;
  premiumSince?: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  planType: SubscriptionType;
  planDuration: number; // days
  referenceCode: string;
  proofImageUrl: string; // Cloudinary URL
  proofImagePublicId: string; // Cloudinary public ID
  status: PaymentRequestStatus;
  createdAt: string;
  processedAt?: string;
}

export interface StudentRequest {
  id: string;
  studentId: string;
  studentName?: string;  // Optional - populated from User relation
  studentEmail?: string;  // Optional - populated from User relation
  studentPhone?: string;  // Optional - populated from User relation
  studentWhatsapp?: string;  // Optional - populated from User relation
  cityId: number;  // Required - normalized city ID
  city?: string;  // Optional - city name populated by backend
  institutionId?: number;  // Optional - normalized institution ID
  institution?: Institution;  // Optional - populated by backend
  universityTarget?: string;  // Optional - fallback for institutions not in database
  budgetMax: number;
  propertyTypeDesired: PropertyType;
  requiredAmenities: string[];
  dealBreakers?: string[];
  moveInDate: string;
  contractDuration?: number; // meses
  additionalNotes?: string;
  status: StudentRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  interestedUserId?: string;
  interestedUserName?: string;
  read: boolean;
  createdAt: string;
}


/**
 * =================================================================================
 * D. INTERFACES DE FORMULARIO Y UTILIDAD (DTOs)
 * =================================================================================
 */

// DTO para la solicitud de registro inicial (Frontend -> Backend)
export interface UserRegistrationPayload {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  userType: UserType;
  password: string;
  confirmPassword: string; // Solo para validación en el frontend

  // Campos específicos de Owner/Verificación (si aplica)
  role?: OwnerRole;
  idType?: IdType;
  idNumber?: string;

  // Campos de Pago/Facturación (si aplica)
  paymentPreference?: PaymentMethod;
  bankDetails?: BankDetails;
  billingDetails?: BillingDetails;
}

export interface SearchFilters {
  city?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  rooms?: number;
  bathrooms?: number;
  university?: string;
  amenities?: string[];
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  // Institution filters
  institutionId?: number;
  institutionType?: 'universidad' | 'instituto';
  maxDistance?: number;
}

export interface PropertyFormData {
  // Basic info
  title: string;
  description: string;
  type: PropertyType;

  // Pricing (support both old and new names)
  monthlyRent?: number;
  price?: number; // Deprecated, use monthlyRent
  deposit?: number;
  currency: string;

  // Location
  address: Address;
  coordinates?: Coordinates;

  // Characteristics (support both old and new names)
  bedrooms?: number;
  rooms?: number; // Deprecated, use bedrooms
  bathrooms?: number;
  area?: number;
  floor?: number;

  // Relations
  amenities: (string | number)[];
  images: (string | File)[];
  nearbyInstitutions?: PropertyInstitution[];  // NEW: institutions near the property
  nearbyUniversities?: string[];  // Deprecated, use nearbyInstitutions

  // Optional
  ownerId?: string;
  availableFrom?: string;
}

export interface PropertyStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
  totalRevenue: number;
}

export interface ActivityLog {
  id: string;
  type: ActivityLogType;
  message: string;
  timestamp: string;
  userId?: string;
  propertyId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  property?: {
    id: number;
    title: string;
    type: string;
  };
}

export interface ActivityStatistics {
  totalLogs: number;
  activityByType: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: number;
}

export interface SystemConfig {
  commissionRate: number;
  featuredPropertyPrice: number;
  maxImagesPerProperty: number;
  minPropertyPrice: number;
  maxPropertyPrice: number;
  autoApprovalEnabled: boolean;
}
