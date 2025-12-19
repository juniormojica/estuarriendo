import {
  Property,
  Amenity,
  SearchFilters,
  PropertyFormData,
  User,
  PropertyStats,
  ActivityLog,
  ActivityStatistics,
  SystemConfig,
  PaymentRequest,
  StudentRequest,
  Notification,
  VerificationDocuments
} from '../types';
import { mockProperties, mockAmenities } from '../data/mockData';
import apiClient from '../lib/axios';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get properties from localStorage or mockData
const getStoredProperties = (): Property[] => {
  const stored = localStorage.getItem('estuarriendo_properties');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored properties:', e);
      return mockProperties;
    }
  }
  return mockProperties;
};

// Helper to save properties to localStorage
const saveProperties = (properties: Property[]) => {
  localStorage.setItem('estuarriendo_properties', JSON.stringify(properties));
};

// Helper for payment requests
const getStoredPaymentRequests = (): PaymentRequest[] => {
  const stored = localStorage.getItem('estuarriendo_payment_requests');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored payment requests:', e);
      return [];
    }
  }
  return [];
};

const savePaymentRequests = (requests: PaymentRequest[]) => {
  localStorage.setItem('estuarriendo_payment_requests', JSON.stringify(requests));
};

// Helper for users
const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem('estuarriendo_users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored users:', e);
      return [];
    }
  }
  return [];
};

const saveStoredUsers = (users: User[]) => {
  localStorage.setItem('estuarriendo_users', JSON.stringify(users));
};

// Helper for current user
const getStoredCurrentUser = (): User | any => {
  const stored = localStorage.getItem('estuarriendo_current_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored current user:', e);
      return {};
    }
  }
  return {};
};


export const api = {
  // Institution Methods
  async getAllInstitutions(params?: { type?: string; cityId?: number; limit?: number }): Promise<any[]> {
    try {
      const response = await apiClient.get('/institutions', { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return [];
    }
  },

  async searchInstitutions(query: string, params?: { type?: string; cityId?: number; limit?: number }): Promise<any[]> {
    try {
      const response = await apiClient.get('/institutions/search', {
        params: { q: query, ...params }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error searching institutions:', error);
      return [];
    }
  },

  // Get all properties with optional filters
  async getProperties(filters?: SearchFilters): Promise<Property[]> {
    await delay(500);

    let properties = getStoredProperties();
    let filteredProperties = [...properties];

    // Default to showing only approved properties unless specified otherwise
    // For now, public search only shows approved properties
    filteredProperties = filteredProperties.filter(p => !p.is_rented && p.status === 'approved');

    if (filters) {
      if (filters.city) {
        filteredProperties = filteredProperties.filter(p =>
          p.address.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }

      if (filters.type) {
        filteredProperties = filteredProperties.filter(p => p.type === filters.type);
      }

      if (filters.priceMin !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.priceMin!);
      }

      if (filters.priceMax !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.priceMax!);
      }

      if (filters.rooms !== undefined && filters.rooms > 0) {
        filteredProperties = filteredProperties.filter(p =>
          p.rooms !== undefined && p.rooms >= filters.rooms!
        );
      }

      if (filters.bathrooms !== undefined && filters.bathrooms > 0) {
        filteredProperties = filteredProperties.filter(p =>
          p.bathrooms !== undefined && p.bathrooms >= filters.bathrooms!
        );
      }

      if (filters.university) {
        filteredProperties = filteredProperties.filter(p =>
          p.nearbyUniversities && p.nearbyUniversities.includes(filters.university!)
        );
      }

      if (filters.amenities && filters.amenities.length > 0) {
        filteredProperties = filteredProperties.filter(p =>
          filters.amenities!.every(amenity => p.amenities.includes(amenity))
        );
      }
    }

    return filteredProperties.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  // Get single property by ID
  async getProperty(id: string): Promise<Property | null> {
    await delay(300);
    const properties = getStoredProperties();
    return properties.find(p => p.id === id) || null;
  },

  // Get owner contact details
  async getOwnerContactDetails(ownerId: string): Promise<{ name: string; whatsapp: string; email: string; plan: 'free' | 'premium' } | null> {
    await delay(300);
    const users = getStoredUsers();
    const owner = users.find(u => u.id === ownerId);

    if (owner) {
      return {
        name: owner.name,
        whatsapp: owner.whatsapp,
        email: owner.email,
        plan: owner.plan || 'free'
      };
    }

    // Fallback for mock data or if user not found
    return {
      name: 'Propietario EstuArriendo',
      whatsapp: '3000000000',
      email: 'contacto@estuarriendo.com',
      plan: 'free'
    };
  },

  // Get all amenities
  async getAmenities(): Promise<Amenity[]> {
    await delay(200);
    return mockAmenities;
  },

  // Submit new property
  async submitProperty(formData: PropertyFormData): Promise<{ success: boolean; message: string; id?: string }> {
    await delay(1000);

    // Simulate form validation
    if (!formData.title || !formData.description || !formData.price) {
      return { success: false, message: 'Por favor complete todos los campos requeridos.' };
    }

    if (!formData.images || formData.images.length === 0) {
      return { success: false, message: 'Por favor agregue al menos una imagen.' };
    }

    const properties = getStoredProperties();

    // Simulate successful submission
    const newId = (properties.length + 1).toString();

    // Convert images to array of strings (base64 or URLs)
    // We trust the browser's quota management to handle errors if it's too big
    const imageStrings = formData.images.map(img => {
      return typeof img === 'string' ? img : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg';
    });

    const newProperty: Property = {
      id: newId,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      price: formData.price,
      currency: formData.currency,
      address: formData.address,
      rooms: formData.rooms,
      bathrooms: formData.bathrooms,
      area: formData.area,
      images: imageStrings,
      amenities: formData.amenities,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      ownerId: formData.ownerId,
      coordinates: formData.coordinates
    };

    // Try to save with original images (or slightly filtered ones)
    properties.unshift(newProperty);

    try {
      saveProperties(properties);
    } catch (e) {
      console.warn('Storage quota exceeded, retrying with placeholder images', e);

      // Remove the failed property attempt
      properties.shift();

      // Create a fallback property with ALL placeholder images to ensure it saves
      const fallbackProperty: Property = {
        ...newProperty,
        images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg']
      };

      properties.unshift(fallbackProperty);

      try {
        saveProperties(properties);
      } catch (retryError) {
        console.error('Failed to save property even with placeholders', retryError);
        return {
          success: false,
          message: 'Error de almacenamiento: Tu navegador no tiene espacio suficiente. Intenta borrar datos de navegación.'
        };
      }
    }

    return {
      success: true,
      message: 'Propiedad publicada exitosamente. Será revisada por nuestro equipo.',
      id: newId
    };
  },

  // Admin methods
  async getPendingProperties(): Promise<Property[]> {
    await delay(500);
    const properties = getStoredProperties();
    return properties.filter(p => p.status === 'pending');
  },

  async approveProperty(id: string): Promise<boolean> {
    await delay(500);
    const properties = getStoredProperties();
    const property = properties.find(p => p.id === id);
    if (property) {
      property.status = 'approved';
      saveProperties(properties);

      // Create notification for owner
      const ownerId = property.ownerId;
      if (ownerId) {
        const notifications = localStorage.getItem('estuarriendo_notifications');
        let parsedNotifications: Notification[] = [];
        if (notifications) {
          try {
            parsedNotifications = JSON.parse(notifications);
          } catch (e) {
            console.error('Error parsing notifications', e);
          }
        }

        const newNotification: Notification = {
          id: Date.now().toString(),
          userId: ownerId,
          type: 'property_approved',
          title: 'Propiedad Aprobada',
          message: `Tu propiedad "${property.title}" ha sido aprobada y ya está visible para los estudiantes.`,
          propertyId: id,
          propertyTitle: property.title,
          read: false,
          createdAt: new Date().toISOString()
        };

        parsedNotifications.unshift(newNotification);
        localStorage.setItem('estuarriendo_notifications', JSON.stringify(parsedNotifications));
      }

      return true;
    }
    return false;
  },

  async rejectProperty(id: string, reason: string): Promise<boolean> {
    await delay(500);
    const properties = getStoredProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index].status = 'rejected';
      properties[index].rejectionReason = reason;
      saveProperties(properties);

      // Create notification for owner
      const ownerId = properties[index].ownerId;
      if (ownerId) {
        const notifications = localStorage.getItem('estuarriendo_notifications');
        let parsedNotifications: Notification[] = [];
        if (notifications) {
          try {
            parsedNotifications = JSON.parse(notifications);
          } catch (e) {
            console.error('Error parsing notifications', e);
          }
        }

        const newNotification: Notification = {
          id: Date.now().toString(),
          userId: ownerId,
          type: 'property_rejected',
          title: 'Propiedad Rechazada',
          message: `Tu propiedad "${properties[index].title}" ha sido rechazada. Razón: ${reason}`,
          propertyId: id,
          propertyTitle: properties[index].title,
          read: false,
          createdAt: new Date().toISOString()
        };

        parsedNotifications.unshift(newNotification);
        localStorage.setItem('estuarriendo_notifications', JSON.stringify(parsedNotifications));
      }

      return true;
    }
    return false;
  },

  // Get cities that have at least one approved property
  async getAvailableCities(): Promise<string[]> {
    await delay(300);
    const properties = getStoredProperties();
    const approvedProperties = properties.filter(p => p.status === 'approved');
    const cities = Array.from(new Set(approvedProperties.map(p => p.address.city)));
    return cities.sort();
  },

  // Delete a specific image from a property
  async deletePropertyImage(propertyId: string, imageIndex: number): Promise<boolean> {
    await delay(300);
    const properties = getStoredProperties();
    const property = properties.find(p => p.id === propertyId);

    if (property && property.images.length > imageIndex) {
      property.images.splice(imageIndex, 1);
      saveProperties(properties);
      return true;
    }

    return false;
  },

  // Get all properties for admin (no status filter)
  async getAllPropertiesAdmin(): Promise<Property[]> {
    await delay(500);
    const properties = getStoredProperties();
    return properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get property statistics
  async getPropertyStats(): Promise<PropertyStats> {
    await delay(300);
    const properties = getStoredProperties();

    const stats = {
      total: properties.length,
      pending: properties.filter(p => p.status === 'pending').length,
      approved: properties.filter(p => p.status === 'approved').length,
      rejected: properties.filter(p => p.status === 'rejected').length,
      featured: properties.filter(p => p.featured).length,
      totalRevenue: properties.filter(p => p.status === 'approved').length * 50000 // Simulated revenue
    };

    return stats;
  },

  // Update property
  async updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
    await delay(500);
    const properties = getStoredProperties();
    const index = properties.findIndex(p => p.id === id);

    if (index !== -1) {
      // If property was rejected and is being updated, reset to pending
      if (properties[index].status === 'rejected') {
        updates.status = 'pending';
        updates.rejectionReason = undefined;
      }

      properties[index] = { ...properties[index], ...updates };
      saveProperties(properties);
      return true;
    }

    return false;
  },

  // Delete property permanently
  async deleteProperty(id: string): Promise<boolean> {
    await delay(500);
    const properties = getStoredProperties();
    // Ensure we compare strings to avoid type mismatches
    const filteredProperties = properties.filter(p => String(p.id) !== String(id));

    if (filteredProperties.length < properties.length) {
      saveProperties(filteredProperties);
      return true;
    }

    return false;
  },

  // Toggle featured status
  async toggleFeaturedProperty(id: string): Promise<boolean> {
    await delay(300);
    const properties = getStoredProperties();
    const property = properties.find(p => p.id === id);

    if (property) {
      property.featured = !property.featured;
      saveProperties(properties);
      return true;
    }

    return false;
  },

  // Toggle rental status
  async togglePropertyRentalStatus(id: string): Promise<boolean> {
    await delay(300);
    const properties = getStoredProperties();
    const property = properties.find(p => p.id === id);
    if (property) {
      property.is_rented = !property.is_rented;
      saveProperties(properties);
      return true;
    }
    return false;
  },


  // Get users (actual registered users)
  async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<any[]>('/users');

      // Transform backend data to frontend format
      return response.data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        whatsapp: user.whatsapp,
        userType: user.userType || user.user_type,
        isActive: user.isActive ?? user.is_active ?? true,
        joinedAt: user.joinedAt || user.joined_at,
        plan: user.plan || 'free',
        verificationStatus: user.verificationStatus || user.verification_status || 'not_submitted',
        verificationSubmittedAt: user.verificationSubmittedAt || user.verification_submitted_at,
        verificationDocuments: user.verificationDocuments || user.verification_documents,
        propertiesCount: user.propertiesCount || user.properties_count || 0,
        approvedCount: user.approvedCount || user.approved_count || 0,
        pendingCount: user.pendingCount || user.pending_count || 0,
        rejectedCount: user.rejectedCount || user.rejected_count || 0
      }));
    } catch (error) {
      console.error('Error fetching users from backend:', error);
      return [];
    }
  },

  // Get properties by user
  async getUserProperties(userId: string): Promise<Property[]> {
    await delay(300);
    const properties = getStoredProperties();
    // Filter properties that belong to this user
    return properties.filter(p => p.ownerId === userId || `user-${p.id.substring(0, 3)}` === userId);
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      console.log('🔄 Updating user:', userId, 'with updates:', updates);
      const response = await apiClient.put(`/users/${userId}`, updates);
      console.log('✅ User update response:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      console.error('Error details:', error.response?.data);
      return false;
    }
  },

  // Soft delete / reactivate user
  async softDeleteUser(userId: string, isActive: boolean): Promise<boolean> {
    try {
      await apiClient.put(`/users/${userId}`, { isActive });
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  },

  // Update user verification status
  async updateVerificationStatus(
    userId: string,
    verificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected',
    verificationRejectionReason?: string
  ): Promise<boolean> {
    try {
      console.log('🔄 Frontend: Calling updateVerificationStatus');
      console.log('  - User ID:', userId);
      console.log('  - Status:', verificationStatus);
      console.log('  - Reason:', verificationRejectionReason);

      const response = await apiClient.put(`/users/${userId}/verification-status`, {
        verificationStatus,
        verificationRejectionReason
      });

      console.log('✅ Frontend: Update successful', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Frontend: Error updating verification status');
      console.error('  - Error:', error);
      console.error('  - Response:', error.response?.data);
      console.error('  - Status:', error.response?.status);
      return false;
    }
  },

  // Get activity log
  async getActivityLog(): Promise<ActivityLog[]> {
    await delay(300);

    // Get from localStorage or create default
    const stored = localStorage.getItem('estuarriendo_activity_log');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing activity log:', e);
        return [];
      }
    }

    // Create initial activity log based on properties
    const properties = getStoredProperties();
    const activities: ActivityLog[] = [];

    properties.forEach((property) => {
      activities.push({
        id: `activity-${property.id}-submitted`,
        type: 'property_submitted',
        message: `Nueva propiedad enviada: ${property.title}`,
        timestamp: property.createdAt,
        propertyId: property.id
      });

      if (property.status === 'approved') {
        activities.push({
          id: `activity-${property.id}-approved`,
          type: 'property_approved',
          message: `Propiedad aprobada: ${property.title}`,
          timestamp: property.createdAt,
          propertyId: property.id
        });
      }
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    localStorage.setItem('estuarriendo_activity_log', JSON.stringify(activities));
    return activities;
  },

  // Get system configuration
  async getSystemConfig(): Promise<SystemConfig> {
    await delay(200);

    const stored = localStorage.getItem('estuarriendo_system_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing system config:', e);
        // Fallback to default
      }
    }

    const defaultConfig: SystemConfig = {
      commissionRate: 10,
      featuredPropertyPrice: 50000,
      maxImagesPerProperty: 20,
      minPropertyPrice: 100000,
      maxPropertyPrice: 10000000,
      autoApprovalEnabled: false
    };

    localStorage.setItem('estuarriendo_system_config', JSON.stringify(defaultConfig));
    return defaultConfig;
  },

  // Update system configuration
  async updateSystemConfig(config: SystemConfig): Promise<boolean> {
    await delay(300);
    localStorage.setItem('estuarriendo_system_config', JSON.stringify(config));
    return true;
  },

  // Add amenity
  async addAmenity(amenity: Omit<Amenity, 'id'>): Promise<boolean> {
    await delay(300);
    const amenities = [...mockAmenities];
    const newId = (amenities.length + 1).toString();
    amenities.push({ id: newId, ...amenity });
    // In a real app, this would persist to a database
    return true;
  },

  // Delete amenity
  async deleteAmenity(): Promise<boolean> {
    await delay(300);
    // In a real app, this would delete from a database
    return true;
  },

  // Payment Requests
  async createPaymentRequest(request: {
    userId: string;
    amount: number;
    planType: string;
    planDuration: number;
    referenceCode: string;
    proofImageBase64: string;
  }): Promise<boolean> {
    try {
      console.log('📤 Creating payment request:', {
        userId: request.userId,
        amount: request.amount,
        planType: request.planType,
        planDuration: request.planDuration,
        referenceCode: request.referenceCode,
        imageSize: request.proofImageBase64.length
      });

      const response = await apiClient.post('/payment-requests', request);

      console.log('✅ Payment request created:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Error creating payment request:', error);
      console.error('  - Response:', error.response?.data);
      console.error('  - Status:', error.response?.status);
      throw error;
    }
  },

  async getPaymentRequests(): Promise<PaymentRequest[]> {
    try {
      const response = await apiClient.get<PaymentRequest[]>('/payment-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      return [];
    }
  },

  async verifyPaymentRequest(requestId: string): Promise<boolean> {
    try {
      await apiClient.put(`/payment-requests/${requestId}/verify`);
      return true;
    } catch (error) {
      console.error('Error verifying payment request:', error);
      return false;
    }
  },

  async rejectPaymentRequest(requestId: string): Promise<boolean> {
    try {
      await apiClient.put(`/payment-requests/${requestId}/reject`);
      return true;
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      return false;
    }
  },

  // Student Request Methods
  async createStudentRequest(request: Omit<StudentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<{ success: boolean; message: string; id?: string }> {
    await delay(500);

    // Check if student already has an open request
    const existingRequest = await this.getMyStudentRequest(request.studentId);
    if (existingRequest) {
      return { success: false, message: 'Ya tienes una solicitud activa. Cierra la actual antes de crear una nueva.' };
    }

    const requests = getStoredStudentRequests();
    const newRequest: StudentRequest = {
      id: Date.now().toString(),
      ...request,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    requests.push(newRequest);
    saveStudentRequests(requests);

    return { success: true, message: 'Solicitud creada exitosamente', id: newRequest.id };
  },

  async getStudentRequests(filters?: { universityTarget?: string; budgetMax?: number; propertyTypeDesired?: string }): Promise<StudentRequest[]> {
    try {
      // Build query parameters for backend API
      const params = new URLSearchParams();
      if (filters?.universityTarget) params.append('university', filters.universityTarget);
      if (filters?.budgetMax) params.append('maxBudget', filters.budgetMax.toString());
      if (filters?.propertyTypeDesired) params.append('propertyType', filters.propertyTypeDesired);
      params.append('status', 'open'); // Only fetch open requests

      // Call real backend API
      const response = await apiClient.get(`/student-requests?${params.toString()}`);

      // Transform backend response to frontend format
      // Backend returns normalized data with relations (student, city, institution)
      // Frontend expects flat structure with embedded student info
      return response.data.map((request: any) => ({
        id: request.id.toString(),
        studentId: request.studentId,
        studentName: request.student?.name || 'Estudiante',
        studentEmail: request.student?.email || '',
        studentPhone: request.student?.phone || '',
        studentWhatsapp: request.student?.whatsapp || '',
        cityId: request.cityId,
        city: request.city?.name || '',
        institutionId: request.institutionId,
        institution: request.institution,
        universityTarget: request.universityTarget || request.institution?.name || '',
        budgetMax: parseFloat(request.budgetMax),
        propertyTypeDesired: request.propertyTypeDesired,
        requiredAmenities: request.requiredAmenities || [],
        dealBreakers: request.dealBreakers || [],
        moveInDate: request.moveInDate,
        contractDuration: request.contractDuration,
        additionalNotes: request.additionalNotes,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching student requests from backend:', error);
      // Fallback to empty array on error instead of crashing
      return [];
    }
  },

  async getMyStudentRequest(studentId: string): Promise<StudentRequest | null> {
    await delay(300);
    const requests = getStoredStudentRequests();
    return requests.find(r => r.studentId === studentId && r.status === 'open') || null;
  },

  async updateStudentRequest(id: string, updates: Partial<StudentRequest>): Promise<boolean> {
    await delay(500);
    const requests = getStoredStudentRequests();
    const index = requests.findIndex(r => r.id === id);

    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveStudentRequests(requests);
      return true;
    }
    return false;
  },

  async deleteStudentRequest(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/student-requests/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting student request:', error);
      return false;
    }
  },

  // Notify owner of interest
  async notifyOwnerInterest(ownerId: string, propertyId: string, interestedUserId: string): Promise<boolean> {
    await delay(500);

    // Get property and user details
    const properties = getStoredProperties();
    const users = getStoredUsers();
    const property = properties.find(p => p.id === propertyId);
    const interestedUser = users.find(u => u.id === interestedUserId);

    if (!property || !interestedUser) {
      return false;
    }

    // Create notification
    const notifications = getStoredNotifications();
    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: ownerId,
      type: 'property_interest',
      title: 'Nuevo interés en tu propiedad',
      message: `${interestedUser.name} está interesado en "${property.title}"`,
      propertyId: propertyId,
      propertyTitle: property.title,
      interestedUserId: interestedUserId,
      interestedUserName: interestedUser.name,
      read: false,
      createdAt: new Date().toISOString()
    };

    notifications.push(newNotification);
    saveNotifications(notifications);

    console.log(`Notification created for owner ${ownerId} about property ${propertyId} from user ${interestedUserId}`);
    return true;
  },

  // Get interested users for a property
  async getPropertyInterests(propertyId: string): Promise<Notification[]> {
    await delay(300);
    const notifications = getStoredNotifications();
    return notifications
      .filter(n => n.propertyId === propertyId && n.type === 'property_interest')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get notifications for a user
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(`/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      await apiClient.put(`/notifications/user/${userId}/read-all`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Get unread notification count
  async getUnreadNotificationCount(userId: string): Promise<{ count: number }> {
    try {
      const response = await apiClient.get<{ count: number }>(`/notifications/user/${userId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { count: 0 };
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Verification Methods
  async submitVerification(userId: string, documents: VerificationDocuments): Promise<{ success: boolean; message: string }> {
    await delay(500);

    try {
      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, message: 'Usuario no encontrado.' };
      }

      // Update user with verification documents and status
      users[userIndex] = {
        ...users[userIndex],
        verificationDocuments: documents,
        verificationStatus: 'pending',
        verificationSubmittedAt: new Date().toISOString(),
        verificationProcessedAt: undefined,
        verificationRejectionReason: undefined
      };

      saveStoredUsers(users);

      // Update current user if it matches
      const currentUser = getStoredCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.verificationDocuments = documents;
        currentUser.verificationStatus = 'pending';
        currentUser.verificationSubmittedAt = new Date().toISOString();
        currentUser.verificationProcessedAt = undefined;
        currentUser.verificationRejectionReason = undefined;
        localStorage.setItem('estuarriendo_current_user', JSON.stringify(currentUser));
      }

      return { success: true, message: 'Documentos enviados correctamente. Tu verificación será revisada pronto.' };
    } catch (error) {
      console.error('Error submitting verification:', error);
      return { success: false, message: 'Error al enviar los documentos. Por favor intenta nuevamente.' };
    }
  },

  async getVerificationStatus(userId: string): Promise<User['verificationStatus']> {
    await delay(200);
    const users = getStoredUsers();
    const user = users.find(u => u.id === userId);
    return user?.verificationStatus || 'not_submitted';
  },


  async getPendingVerifications(): Promise<User[]> {
    await delay(300);
    const users = getStoredUsers();
    return users.filter(u => u.verificationStatus === 'pending');
  },

  // Activity Logs Methods
  async getActivityLogs(filters?: {
    type?: string;
    userId?: string;
    propertyId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<ActivityLog[]> {
    try {
      const response = await apiClient.get('/activity-logs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  },

  async getActivityStatistics(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ActivityStatistics> {
    try {
      const response = await apiClient.get('/activity-logs/statistics/summary', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity statistics:', error);
      return { totalLogs: 0, activityByType: [], recentActivity: 0 };
    }
  },

  async createActivityLog(log: {
    type: string;
    message: string;
    userId?: string;
    propertyId?: number;
  }): Promise<boolean> {
    try {
      await apiClient.post('/activity-logs', log);
      return true;
    } catch (error) {
      console.error('Error creating activity log:', error);
      return false;
    }
  }

}

// Helper for student requests
const getStoredStudentRequests = (): StudentRequest[] => {
  const stored = localStorage.getItem('estuarriendo_student_requests');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored student requests:', e);
      return [];
    }
  }
  return [];
};

const saveStudentRequests = (requests: StudentRequest[]) => {
  localStorage.setItem('estuarriendo_student_requests', JSON.stringify(requests));
};


// Helper for notifications
const getStoredNotifications = (): Notification[] => {
  const stored = localStorage.getItem('estuarriendo_notifications');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored notifications:', e);
      return [];
    }
  }
  return [];
};

const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem('estuarriendo_notifications', JSON.stringify(notifications));
};

