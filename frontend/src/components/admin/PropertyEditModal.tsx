import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Property, PropertyTypeEntity } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAmenities } from '../../store/slices/amenitiesSlice';
import { updateProperty } from '../../store/slices/propertiesSlice';
import { useToast } from '../ToastProvider';
import ImageUploader from '../ImageUploader';
import { departments, getCitiesByDepartment } from '../../data/colombiaLocations';
import LoadingSpinner from '../LoadingSpinner';
import { fetchPropertyTypes } from '../../services/propertyTypeService';
import LocationPicker from '../LocationPicker';

interface PropertyEditModalProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => Promise<void>;
}

interface EditFormData {
    title: string;
    description: string;
    typeId: number;
    monthlyRent: number;
    deposit?: number;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    floor?: number;
    locationId?: number;
    department: string;
    city: string;
    street: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    amenityIds: number[];
    imageUrls: string[];
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
    property,
    isOpen,
    onClose,
    onSave
}) => {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { items: amenities } = useAppSelector((state) => state.amenities);

    const [formData, setFormData] = useState<EditFormData>({
        title: '',
        description: '',
        typeId: 1,
        monthlyRent: 0,
        department: '',
        city: '',
        street: '',
        amenityIds: [],
        imageUrls: []
    });
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>('');
    const [propertyTypes, setPropertyTypes] = useState<PropertyTypeEntity[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);

    // Fetch property types on mount
    useEffect(() => {
        const loadPropertyTypes = async () => {
            try {
                setIsLoadingTypes(true);
                const types = await fetchPropertyTypes();
                setPropertyTypes(types);
            } catch (err) {
                console.error('Error loading property types:', err);
                toast.error('Error al cargar los tipos de propiedad');
                // Fallback to default types if fetch fails
                setPropertyTypes([
                    { id: 1, name: 'apartamento' },
                    { id: 2, name: 'habitacion' },
                    { id: 3, name: 'pension' },
                    { id: 4, name: 'aparta-estudio' }
                ]);
            } finally {
                setIsLoadingTypes(false);
            }
        };

        loadPropertyTypes();
    }, [toast]);

    useEffect(() => {
        if (isOpen && property) {
            // Initialize form with property data
            const amenityIds = property.amenities?.map(a =>
                typeof a === 'object' ? Number(a.id) : Number(a)
            ) || [];

            const imageUrls = property.images?.map(img =>
                typeof img === 'object' ? img.url : img
            ) || [];

            // Handle city and department - can be string or object with name
            const cityValue = typeof property.location?.city === 'object'
                ? (property.location.city as any)?.name || ''
                : property.location?.city || '';

            const deptValue = typeof property.location?.department === 'object'
                ? (property.location.department as any)?.name || ''
                : property.location?.department || '';

            setFormData({
                title: property.title || '',
                description: property.description || '',
                typeId: property.type?.id || 1,
                monthlyRent: property.monthlyRent || 0,
                deposit: property.deposit,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                area: property.area,
                floor: property.floor,
                locationId: property.location?.id,
                department: deptValue,
                city: cityValue,
                street: property.location?.street || '',
                neighborhood: property.location?.neighborhood,
                latitude: property.location?.latitude,
                longitude: property.location?.longitude,
                amenityIds,
                imageUrls
            });

            dispatch(fetchAmenities());

            // Initialize available cities
            if (property.location?.department) {
                const deptName = typeof property.location.department === 'object'
                    ? (property.location.department as any)?.name
                    : property.location.department;

                const dept = departments.find(d => d.name === deptName);
                if (dept) {
                    const cities = getCitiesByDepartment(dept.id);
                    setAvailableCities(cities.map(c => c.name));
                }
            }
        }
    }, [isOpen, property, dispatch]);

    const handleInputChange = (field: keyof EditFormData, value: any) => {
        if (field === 'department') {
            const dept = departments.find(d => d.id === value);
            const deptName = dept ? dept.name : '';
            const cities = getCitiesByDepartment(value);
            setAvailableCities(cities.map(c => c.name));
            setFormData(prev => ({
                ...prev,
                department: deptName,
                city: ''
            }));
        } else if (field === 'typeId') {
            const typeId = Number(value);
            const isRoom = propertyTypes.find(t => t.id === typeId)?.name === 'habitacion';
            setFormData(prev => ({
                ...prev,
                typeId,
                bedrooms: isRoom ? 1 : prev.bedrooms,
                bathrooms: isRoom ? undefined : prev.bathrooms
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleAmenityToggle = (amenityId: number) => {
        setFormData(prev => ({
            ...prev,
            amenityIds: prev.amenityIds.includes(amenityId)
                ? prev.amenityIds.filter(id => id !== amenityId)
                : [...prev.amenityIds, amenityId]
        }));
    };

    const handleImagesChange = (images: string[]) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: images
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            // Find the type name from the typeId
            const selectedType = propertyTypes.find(t => t.id === formData.typeId);
            if (!selectedType) {
                throw new Error('Tipo de propiedad no válido');
            }

            // Prepare update payload in the format the backend expects
            const updateData = {
                // Core property fields
                typeName: selectedType.name, // Send name instead of ID
                title: formData.title,
                description: formData.description,
                monthlyRent: formData.monthlyRent,
                deposit: formData.deposit || null,
                currency: 'COP',
                bedrooms: formData.bedrooms || null,
                bathrooms: formData.bathrooms || null,
                area: formData.area || null,
                floor: formData.floor || null,

                // Location object - backend expects these specific fields
                location: {
                    city: formData.city,
                    department: formData.department,
                    street: formData.street,
                    neighborhood: formData.neighborhood || null,
                    postalCode: null,
                    latitude: formData.latitude || null,
                    longitude: formData.longitude || null
                },

                // Amenities - send as array of IDs
                amenityIds: formData.amenityIds,

                // Images - send as array of objects with url and metadata
                images: formData.imageUrls.map((url, index) => ({
                    url,
                    caption: null,
                    displayOrder: index,
                    isPrimary: index === 0
                }))
            };

            const resultAction = await dispatch(updateProperty({
                id: String(property.id),
                data: updateData
            }));

            if (updateProperty.fulfilled.match(resultAction)) {
                toast.success('✅ Propiedad actualizada exitosamente');
                await onSave();
                onClose();
            } else {
                const errorMessage = resultAction.payload as string || 'No se pudo actualizar la propiedad';
                setError(errorMessage);
                toast.error(`❌ ${errorMessage}`);
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Error al guardar los cambios';
            setError(errorMsg);
            toast.error(`❌ ${errorMsg}`);
            console.error('Error updating property:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const selectedType = propertyTypes.find(t => t.id === formData.typeId);
    const isRoom = selectedType?.name === 'habitacion';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">Editar Propiedad</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 text-red-700">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                required
                                value={formData.typeId}
                                onChange={(e) => handleInputChange('typeId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                {propertyTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mensual</label>
                            <input
                                type="number"
                                required
                                value={formData.monthlyRent}
                                onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Depósito (Opcional)</label>
                            <input
                                type="number"
                                value={formData.deposit || ''}
                                onChange={(e) => handleInputChange('deposit', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                <select
                                    required
                                    value={departments.find(d => d.name === formData.department)?.id || ''}
                                    onChange={(e) => handleInputChange('department', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                                <select
                                    required
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    disabled={!formData.department}
                                >
                                    <option value="">Selecciona una ciudad</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.street}
                                    onChange={(e) => handleInputChange('street', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Barrio (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.neighborhood || ''}
                                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            {/* Map Location Picker - Only show if address is filled */}
                            {formData.department && formData.city && formData.street && (
                                <div className="col-span-2 mt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">📍 Ubicación en el Mapa</h4>
                                    <p className="text-xs text-gray-600 mb-2">
                                        Ajusta el marcador para indicar la ubicación exacta de la propiedad
                                    </p>
                                    <LocationPicker
                                        address={{
                                            street: formData.street,
                                            city: formData.city,
                                            department: formData.department,
                                            country: 'Colombia'
                                        }}
                                        coordinates={{
                                            lat: formData.latitude || 0,
                                            lng: formData.longitude || 0
                                        }}
                                        onCoordinatesChange={(lat, lng) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: lat,
                                                longitude: lng
                                            }));
                                        }}
                                    />
                                </div>
                            )}

                            {/* Show message if address is incomplete */}
                            {(!formData.department || !formData.city || !formData.street) && (
                                <div className="col-span-2 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-700">
                                        💡 Completa el departamento, ciudad y dirección para poder editar la ubicación en el mapa
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {!isRoom && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                                        <input
                                            type="number"
                                            value={formData.bedrooms || ''}
                                            onChange={(e) => handleInputChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                                        <input
                                            type="number"
                                            value={formData.bathrooms || ''}
                                            onChange={(e) => handleInputChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²)</label>
                                <input
                                    type="number"
                                    value={formData.area || ''}
                                    onChange={(e) => handleInputChange('area', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Piso (Opcional)</label>
                                <input
                                    type="number"
                                    value={formData.floor || ''}
                                    onChange={(e) => handleInputChange('floor', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {isRoom ? 'Características' : 'Comodidades'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {amenities.map(amenity => (
                                <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.amenityIds.includes(Number(amenity.id))}
                                        onChange={() => handleAmenityToggle(Number(amenity.id))}
                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">{amenity.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Imágenes</h3>
                        <ImageUploader
                            images={formData.imageUrls}
                            onChange={handleImagesChange}
                            maxImages={10}
                            maxSizeMB={5}
                            folder="properties"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <LoadingSpinner size="sm" /> : <Save size={20} />}
                            <span>Guardar Cambios</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyEditModal;
