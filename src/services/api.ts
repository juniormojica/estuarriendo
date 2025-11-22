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
      status: 'pending'
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
  }
};