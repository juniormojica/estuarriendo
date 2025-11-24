import { Property, Amenity, SearchFilters, PropertyFormData } from '../types';
import { mockProperties, mockAmenities } from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get properties from localStorage or mockData
const getStoredProperties = (): Property[] => {
  const stored = localStorage.getItem('estuarriendo_properties');
  if (stored) {
    return JSON.parse(stored);
  }
  return mockProperties;
};

// Helper to save properties to localStorage
const saveProperties = (properties: Property[]) => {
  localStorage.setItem('estuarriendo_properties', JSON.stringify(properties));
};

export const api = {
  // Get all properties with optional filters
  async getProperties(filters?: SearchFilters): Promise<Property[]> {
    await delay(500);

    let properties = getStoredProperties();
    let filteredProperties = [...properties];

    // Default to showing only approved properties unless specified otherwise
    // For now, public search only shows approved properties
    filteredProperties = filteredProperties.filter(p => p.status === 'approved');

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
    const imageStrings = formData.images.map(img =>
      typeof img === 'string' ? img : 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    );

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
      ownerId: formData.ownerId
    };

    properties.unshift(newProperty);
    saveProperties(properties);

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
      return true;
    }
    return false;
  },

  async rejectProperty(id: string): Promise<boolean> {
    await delay(500);
    const properties = getStoredProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index].status = 'rejected';
      saveProperties(properties);
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
  async getPropertyStats(): Promise<import('../types').PropertyStats> {
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

  // Get users (extracted from properties)
  async getUsers(): Promise<import('../types').User[]> {
    await delay(500);
    const properties = getStoredProperties();

    // Create mock users from property data
    const userMap = new Map<string, import('../types').User>();

    properties.forEach(property => {
      // Use a simple hash of the property ID to create consistent user IDs
      const userId = `user-${property.id.substring(0, 3)}`;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          name: `Propietario ${userId.substring(5)}`,
          email: `propietario${userId.substring(5)}@example.com`,
          phone: `+57 300 ${Math.floor(Math.random() * 9000000 + 1000000)}`,
          whatsapp: `+57 300 ${Math.floor(Math.random() * 9000000 + 1000000)}`,
          propertiesCount: 0,
          approvedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
          joinedAt: property.createdAt
        });
      }

      const user = userMap.get(userId)!;
      user.propertiesCount++;

      if (property.status === 'approved') user.approvedCount++;
      if (property.status === 'pending') user.pendingCount++;
      if (property.status === 'rejected') user.rejectedCount++;
    });

    return Array.from(userMap.values());
  },

  // Get properties by user
  async getUserProperties(userId: string): Promise<Property[]> {
    await delay(300);
    const properties = getStoredProperties();
    // Filter properties that belong to this user
    return properties.filter(p => p.ownerId === userId || `user-${p.id.substring(0, 3)}` === userId);
  },

  // Get activity log
  async getActivityLog(): Promise<import('../types').ActivityLog[]> {
    await delay(300);

    // Get from localStorage or create default
    const stored = localStorage.getItem('estuarriendo_activity_log');
    if (stored) {
      return JSON.parse(stored);
    }

    // Create initial activity log based on properties
    const properties = getStoredProperties();
    const activities: import('../types').ActivityLog[] = [];

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
  async getSystemConfig(): Promise<import('../types').SystemConfig> {
    await delay(200);

    const stored = localStorage.getItem('estuarriendo_system_config');
    if (stored) {
      return JSON.parse(stored);
    }

    const defaultConfig: import('../types').SystemConfig = {
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
  async updateSystemConfig(config: import('../types').SystemConfig): Promise<boolean> {
    await delay(300);
    localStorage.setItem('estuarriendo_system_config', JSON.stringify(config));
    return true;
  },

  // Add amenity
  async addAmenity(amenity: Omit<import('../types').Amenity, 'id'>): Promise<boolean> {
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
  async createPaymentRequest(request: Omit<import('../types').PaymentRequest, 'id' | 'status' | 'createdAt'>): Promise<boolean> {
    await delay(500);
    const requests = getStoredPaymentRequests();
    const newRequest: import('../types').PaymentRequest = {
      id: Date.now().toString(),
      ...request,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requests.push(newRequest);
    savePaymentRequests(requests);

    // Update user with paymentRequestId
    const users = JSON.parse(localStorage.getItem('estuarriendo_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === request.userId);
    if (userIndex !== -1) {
      users[userIndex].paymentRequestId = newRequest.id;
      localStorage.setItem('estuarriendo_users', JSON.stringify(users));

      // Update current user if needed
      const currentUser = JSON.parse(localStorage.getItem('estuarriendo_current_user') || '{}');
      if (currentUser.id === request.userId) {
        currentUser.paymentRequestId = newRequest.id;
        localStorage.setItem('estuarriendo_current_user', JSON.stringify(currentUser));
      }
    }

    return true;
  },

  async getPaymentRequests(): Promise<import('../types').PaymentRequest[]> {
    await delay(500);
    return getStoredPaymentRequests();
  },

  async verifyPaymentRequest(requestId: string): Promise<boolean> {
    await delay(500);
    const requests = getStoredPaymentRequests();
    const index = requests.findIndex(r => r.id === requestId);

    if (index !== -1) {
      requests[index].status = 'verified';
      requests[index].processedAt = new Date().toISOString();
      savePaymentRequests(requests);

      // Upgrade user to premium
      const userId = requests[index].userId;
      const users = JSON.parse(localStorage.getItem('estuarriendo_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].plan = 'premium';
        users[userIndex].paymentRequestId = undefined; // Clear request id
        localStorage.setItem('estuarriendo_users', JSON.stringify(users));

        // Update current user if needed
        const currentUser = JSON.parse(localStorage.getItem('estuarriendo_current_user') || '{}');
        if (currentUser.id === userId) {
          currentUser.plan = 'premium';
          currentUser.paymentRequestId = undefined;
          localStorage.setItem('estuarriendo_current_user', JSON.stringify(currentUser));
        }
      }

      return true;
    }
    return false;
  },

  async rejectPaymentRequest(requestId: string): Promise<boolean> {
    await delay(500);
    const requests = getStoredPaymentRequests();
    const index = requests.findIndex(r => r.id === requestId);

    if (index !== -1) {
      requests[index].status = 'rejected';
      requests[index].processedAt = new Date().toISOString();
      savePaymentRequests(requests);

      // Clear paymentRequestId from user so they can try again
      const userId = requests[index].userId;
      const users = JSON.parse(localStorage.getItem('estuarriendo_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].paymentRequestId = undefined;
        localStorage.setItem('estuarriendo_users', JSON.stringify(users));

        // Update current user if needed
        const currentUser = JSON.parse(localStorage.getItem('estuarriendo_current_user') || '{}');
        if (currentUser.id === userId) {
          currentUser.paymentRequestId = undefined;
          localStorage.setItem('estuarriendo_current_user', JSON.stringify(currentUser));
        }
      }

      return true;
    }
    return false;
  }
};

// Helper for payment requests
const getStoredPaymentRequests = (): import('../types').PaymentRequest[] => {
  const stored = localStorage.getItem('estuarriendo_payment_requests');
  return stored ? JSON.parse(stored) : [];
};

const savePaymentRequests = (requests: import('../types').PaymentRequest[]) => {
  localStorage.setItem('estuarriendo_payment_requests', JSON.stringify(requests));
};