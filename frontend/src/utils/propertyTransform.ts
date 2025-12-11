import { PropertyFormData, Property, User, PropertyTypeEntity } from '../types';

/**
 * Transform form data to backend format for property creation/update
 * @param formData - Form data from the property form
 * @param user - Current user object
 * @param propertyTypes - Array of property types from the backend
 */
export const transformPropertyForBackend = (
    formData: PropertyFormData,
    user: User,
    propertyTypes: PropertyTypeEntity[]
): any => {
    // Get typeId from type name by looking it up in the provided array
    const propertyType = propertyTypes.find(
        pt => pt.name.toLowerCase() === formData.type.toLowerCase()
    );

    if (!propertyType) {
        throw new Error(
            `Tipo de propiedad no válido: ${formData.type}. ` +
            `Los tipos válidos son: ${propertyTypes.map(pt => pt.name).join(', ')}`
        );
    }

    return {
        // Core property fields
        ownerId: formData.ownerId || user.id,
        typeId: propertyType.id,
        title: formData.title,
        description: formData.description,
        monthlyRent: formData.monthlyRent || formData.price || 0,
        deposit: formData.deposit || null,
        currency: formData.currency || 'COP',
        bedrooms: formData.bedrooms || formData.rooms || null,
        bathrooms: formData.bathrooms || null,
        area: formData.area || null,
        floor: formData.floor || null,
        availableFrom: formData.availableFrom || null,

        // Location object
        location: {
            city: formData.address.city,
            department: formData.address.department,
            street: formData.address.street,
            neighborhood: formData.address.neighborhood || null,
            postalCode: formData.address.postalCode || null,
            latitude: formData.coordinates?.lat || null,
            longitude: formData.coordinates?.lng || null
        },

        // Contact object (use user's contact info)
        contact: {
            phone: user.phone || null,
            whatsapp: user.whatsapp || null,
            email: user.email || null,
            availableHours: null
        },

        // Features object (default values for now)
        features: {
            furnished: false,
            petsAllowed: false,
            smokingAllowed: false,
            parking: false,
            elevator: false,
            security: false,
            gym: false,
            pool: false,
            laundry: false,
            storage: false,
            balcony: false,
            terrace: false,
            garden: false
        },

        // Images array
        images: (formData.images || []).map((img, index) => {
            if (typeof img === 'string') {
                return {
                    url: img,
                    caption: null,
                    displayOrder: index,
                    isPrimary: index === 0
                };
            }
            return img; // If already an object, return as is
        }),

        // Institutions (universities) - empty for now, can be added later
        institutions: formData.nearbyUniversities || [],

        // Amenities - convert to numbers if needed
        amenityIds: (formData.amenities || []).map(id =>
            typeof id === 'string' ? parseInt(id) : id
        )
    };
};

/**
 * Transform backend property data to form format for editing
 */
export const transformPropertyFromBackend = (property: Property): PropertyFormData => {
    return {
        title: property.title,
        description: property.description,
        type: property.type?.name || 'apartamento',
        monthlyRent: property.monthlyRent,
        price: property.monthlyRent, // Keep for backwards compatibility
        deposit: property.deposit,
        currency: property.currency,
        address: {
            country: 'Colombia',
            department: property.location?.department || '',
            city: property.location?.city || '',
            street: property.location?.street || '',
            postalCode: property.location?.postalCode || '',
            neighborhood: property.location?.neighborhood || ''
        },
        coordinates: property.location?.latitude && property.location?.longitude
            ? {
                lat: property.location.latitude,
                lng: property.location.longitude
            }
            : { lat: 0, lng: 0 },
        bedrooms: property.bedrooms,
        rooms: property.bedrooms, // Keep for backwards compatibility
        bathrooms: property.bathrooms,
        area: property.area,
        floor: property.floor,
        amenities: (property.amenities || []).map(a =>
            typeof a === 'string' ? a : String(a.id)
        ),
        images: (property.images || []).map(img =>
            typeof img === 'string' ? img : img.url
        ),
        nearbyUniversities: (property.institutions || []).map(i =>
            typeof i === 'string' ? i : i.name
        ),
        ownerId: property.ownerId,
        availableFrom: property.availableFrom
    };
};
