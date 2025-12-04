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
export type AdminSection = 'dashboard' | 'pending' | 'all-properties' | 'users' | 'config' | 'activity' | 'payments' | 'verifications';

// Estados de la Solicitud de Pago
export type PaymentRequestStatus = 'pending' | 'verified' | 'rejected';

// Tipos de Notificación
export type NotificationType = 'property_interest' | 'payment_verified' | 'property_approved' | 'property_rejected';

// Estados de la Solicitud de Estudiante
export type StudentRequestStatus = 'open' | 'closed';


/**
 * =================================================================================
 * B. INTERFACES AUXILIARES Y COMPONENTES
 * =================================================================================
 */

export interface Address {
  country: string;
  department: string;
  city: string;
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
 * C. INTERFACES DE ENTIDADES PRINCIPALES 
 * =================================================================================
 */

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  currency: string;
  address: Address;
  rooms?: number;
  bathrooms?: number;
  area?: number;
  images: string[];
  amenities: string[];
  nearbyUniversities?: string[];
  createdAt: string;
  featured?: boolean;
  isVerified?: boolean;
  status: PropertyStatus;
  ownerId: string;
  coordinates?: Coordinates;
  rejectionReason?: string;
  is_rented?: boolean;
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
  userName: string;
  amount: number;
  planType: SubscriptionType;
  planDuration: number; // days
  referenceCode: string;
  proofImage: string; // base64
  status: PaymentRequestStatus;
  createdAt: string;
  processedAt?: string;
}

export interface StudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentWhatsapp: string;
  city: string;
  universityTarget: string;
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
}

export interface PropertyFormData {
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  currency: string;
  address: Address;
  rooms?: number;
  bathrooms?: number;
  area?: number;
  images: (string | File)[]; // Permite URLs o objetos File
  amenities: string[];
  nearbyUniversities?: string[];
  ownerId?: string;
  coordinates?: Coordinates;
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
}

export interface SystemConfig {
  commissionRate: number;
  featuredPropertyPrice: number;
  maxImagesPerProperty: number;
  minPropertyPrice: number;
  maxPropertyPrice: number;
  autoApprovalEnabled: boolean;
}
