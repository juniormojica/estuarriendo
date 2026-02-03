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

// ===== CONTAINER ARCHITECTURE TYPES =====
// Rental modes for properties
export type RentalMode = 'complete' | 'by_unit' | 'single';

// Room types for units
export type RoomType = 'individual' | 'shared';


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
  latitude?: number;
  longitude?: number;
  PropertyInstitution?: {
    distance?: number | null;
  };
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
  contactName?: string;
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

// Property Service (for pension type)
export interface PropertyService {
  id?: number;
  propertyId?: number;
  serviceType: 'breakfast' | 'lunch' | 'dinner' | 'housekeeping' | 'laundry' | 'wifi' | 'utilities';
  isIncluded: boolean;
  additionalCost?: number;
  description?: string;
}

// Property Rule (for habitacion and pension types)
export interface PropertyRule {
  id?: number;
  propertyId?: number;
  ruleType: 'visits' | 'pets' | 'smoking' | 'noise' | 'curfew' | 'tenant_profile' | 'couples' | 'children';
  isAllowed: boolean;
  value?: string;
  description?: string;
}

// ===== CONTAINER ARCHITECTURE INTERFACES =====

// Common Area (shared spaces in containers)
export interface CommonArea {
  id: number;
  name: string;
  icon?: string;
  slug?: string;
  description?: string;
  createdAt?: string;
}

// Property Unit (room/unit within a container)
export interface PropertyUnit {
  id: number;
  status: PropertyStatus; // Added status field
  parentId: number;
  title: string;
  description?: string;
  monthlyRent: number;
  deposit?: number;
  currency?: string;
  area?: number;
  isRented: boolean;
  availableFrom?: string;
  roomType: RoomType;  // 'individual' or 'shared'
  bedsInRoom?: number;  // Number of beds if shared
  amenities?: Amenity[];
  images?: PropertyImage[];
  createdAt: string;
  updatedAt?: string;
}

// Property Container (pension, apartment, aparta-estudio with units)
export interface PropertyContainer {
  id: number;
  title: string;
  description: string;
  typeId: number;
  type?: PropertyTypeEntity;
  isContainer: true;
  rentalMode: RentalMode;
  totalUnits: number;
  availableUnits: number;
  requiresDeposit: boolean;
  minimumContractMonths?: number;
  location?: Location;
  contact?: PropertyContact;
  services?: PropertyService[];
  rules?: PropertyRule[];
  commonAreas?: CommonArea[];
  units?: PropertyUnit[];
  images?: PropertyImage[];
  owner?: User;
  createdAt: string;
  updatedAt?: string;
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

  // ===== CONTAINER ARCHITECTURE FIELDS =====
  parentId?: number;  // Reference to parent container (if this is a unit)
  isContainer: boolean;  // TRUE if this is a container, FALSE if unit or independent
  rentalMode?: RentalMode;  // 'complete', 'by_unit', 'single'
  totalUnits?: number;  // Total number of units (for containers)
  availableUnits?: number;  // Available units (for containers)
  roomType?: RoomType;  // 'individual' or 'shared' (for units)
  bedsInRoom?: number;  // Number of beds if shared room
  requiresDeposit?: boolean;  // Whether deposit is required (container level)
  minimumContractMonths?: number;  // Minimum contract duration (container level)

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

  // Calculated fields (via backend attributes)
  minUnitRent?: number;

  // Relations (populated by backend includes)
  location?: Location;
  type?: PropertyTypeEntity;
  contact?: PropertyContact;
  features?: PropertyFeatures;
  images?: PropertyImage[];
  institutions?: Institution[];
  amenities?: Amenity[];
  services?: PropertyService[];
  rules?: PropertyRule[];
  owner?: User; // If included

  // ===== CONTAINER ARCHITECTURE RELATIONS =====
  units?: PropertyUnit[];  // Child units (if this is a container)
  container?: PropertyContainer;  // Parent container (if this is a unit)
  commonAreas?: CommonArea[];  // Shared spaces (if this is a container)
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
  id: number;  // Changed from string to number to match database
  name: string;
  icon: string;
  slug?: string;
  category?: 'general' | 'habitacion' | 'pension';
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
  amenities?: number[];  // Changed from string[] to number[] to match Amenity.id
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
  services?: PropertyService[];  // NEW: services for pension type
  rules?: PropertyRule[];  // NEW: rules for habitacion and pension types

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
