import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, X } from 'lucide-react';
import { Property, PropertyTypeEntity, Institution } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAmenities } from '../../store/slices/amenitiesSlice';
import { updateProperty } from '../../store/slices/propertiesSlice';
import { useToast } from '../ToastProvider';
import ImageUploader from '../ImageUploader';
import LoadingSpinner from '../LoadingSpinner';
import { fetchPropertyTypes } from '../../services/propertyTypeService';
import LocationPicker from '../LocationPicker';
import InstitutionAutocomplete from '../InstitutionAutocomplete';
import CityAutocomplete from '../CityAutocomplete';
import { City as LocationCity } from '../../services/locationService';
import { FormNumericInput } from './FormNumericInput';

export interface PropertyEditFormProps {
    property: Property;
    onSuccess?: () => void;
    onCancel?: () => void;
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
    cityId: number;
    departmentId: number;
    street: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    amenityIds: number[];
    imageUrls: string[];
    nearbyInstitutions: Array<{ institutionId: number; distance: number | null }>;
}

const PropertyEditForm: React.FC<PropertyEditFormProps> = ({
    property,
    onSuccess,
    onCancel
}) => {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { items: amenities } = useAppSelector((state) => state.amenities);

    const [formData, setFormData] = useState<EditFormData>({
        title: '',
        description: '',
        typeId: 1,
        monthlyRent: 0,
        cityId: 0,
        departmentId: 0,
        street: '',
        amenityIds: [],
        imageUrls: [],
        nearbyInstitutions: []
    });
    const [selectedCity, setSelectedCity] = useState<LocationCity | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>('');
    const [propertyTypes, setPropertyTypes] = useState<PropertyTypeEntity[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);

    // Temp state for adding new institutions
    const [tempInstitution, setTempInstitution] = useState<Institution | null>(null);
    const [tempDistance, setTempDistance] = useState<string>('');
    const [institutionNames, setInstitutionNames] = useState<Record<number, string>>({});

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
        if (property) {
            // Initialize form with property data
            const amenityIds = property.amenities?.map(a =>
                typeof a === 'object' ? Number(a.id) : Number(a)
            ) || [];

            const imageUrls = property.images?.map(img =>
                typeof img === 'object' ? img.url : img
            ) || [];

            const initInstitutionNames: Record<number, string> = {};
            const institutions = property.institutions?.map(i => {
                const id = typeof i === 'object' ? i.id : Number(i);
                if (typeof i === 'object') {
                    initInstitutionNames[id] = i.name;
                }
                return {
                    institutionId: id,
                    distance: typeof i === 'object' ? (i as any).PropertyInstitution?.distance || null : null
                };
            }) || [];

            setInstitutionNames(initInstitutionNames);

            // Initialize selected city from property.location (backend returns city/department as objects)
            const locationCity = property.location?.city;
            const locationDept = property.location?.department;
            let cityId = 0;
            let departmentId = 0;

            if (typeof locationCity === 'object' && locationCity !== null) {
                cityId = (locationCity as any).id || 0;
                departmentId = (locationCity as any).departmentId || 0;
                // Build a City object for CityAutocomplete
                setSelectedCity({
                    id: cityId,
                    name: (locationCity as any).name || '',
                    slug: (locationCity as any).slug || '',
                    departmentId: departmentId,
                    department: typeof locationDept === 'object' && locationDept !== null
                        ? {
                            id: (locationDept as any).id || 0,
                            name: (locationDept as any).name || '',
                            code: (locationDept as any).code || '',
                            slug: (locationDept as any).slug || '',
                            isActive: true
                        }
                        : undefined,
                    isActive: true
                } as LocationCity);
            } else if (typeof locationDept === 'object' && locationDept !== null) {
                departmentId = (locationDept as any).id || 0;
            }

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
                cityId,
                departmentId,
                street: property.location?.street || '',
                neighborhood: property.location?.neighborhood,
                latitude: property.location?.latitude ? Number(property.location.latitude) : undefined,
                longitude: property.location?.longitude ? Number(property.location.longitude) : undefined,
                amenityIds,
                imageUrls,
                nearbyInstitutions: institutions
            });

            dispatch(fetchAmenities());
        }
    }, [property, dispatch]);

    const handleCityChange = (city: LocationCity | null) => {
        setSelectedCity(city);
        if (city) {
            setFormData(prev => ({
                ...prev,
                cityId: city.id,
                departmentId: city.departmentId
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                cityId: 0,
                departmentId: 0
            }));
        }
    };

    const handleInputChange = (field: keyof EditFormData, value: any) => {
        if (field === 'typeId') {
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
                deposit: (formData.deposit || null) as any,
                currency: 'COP',
                bedrooms: (formData.bedrooms || null) as any,
                bathrooms: (formData.bathrooms || null) as any,
                area: (formData.area || null) as any,
                floor: (formData.floor || null) as any,

                // Location object - send IDs so findOrCreateLocation resolves correctly
                location: {
                    cityId: formData.cityId,
                    departmentId: formData.departmentId,
                    street: formData.street,
                    neighborhood: formData.neighborhood || null,
                    postalCode: null,
                    latitude: formData.latitude || null,
                    longitude: formData.longitude || null
                } as any,

                // Amenities - send as array of IDs
                amenityIds: formData.amenityIds,

                // Institutions - backend expects "institutions" key
                institutions: formData.nearbyInstitutions,

                // Images - send as array of objects with url and metadata
                images: formData.imageUrls.map((url, index) => ({
                    url,
                    caption: null,
                    displayOrder: index,
                    isPrimary: index === 0
                })) as any
            };

            const resultAction = await dispatch(updateProperty({
                id: String(property.id),
                data: updateData
            }));

            if (updateProperty.fulfilled.match(resultAction)) {
                toast.success('✅ Propiedad actualizada exitosamente');
                if (onSuccess) {
                    onSuccess();
                }
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

    const selectedType = propertyTypes.find(t => t.id === formData.typeId);
    const isRoom = selectedType?.name === 'habitacion';

    if (isLoadingTypes) {
        return <LoadingSpinner size="lg" />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="col-span-2">
                        <CityAutocomplete
                            value={selectedCity}
                            onChange={handleCityChange}
                            placeholder="Buscar ciudad..."
                            required
                        />
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
                    {selectedCity && formData.street && (
                        <div className="col-span-2 mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">📍 Ubicación en el Mapa</h4>
                            <p className="text-xs text-gray-600 mb-2">
                                Ajusta el marcador para indicar la ubicación exacta de la propiedad
                            </p>
                            <LocationPicker
                                address={{
                                    street: formData.street,
                                    city: selectedCity.name,
                                    department: selectedCity.department?.name || '',
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
                    {(!selectedCity || !formData.street) && (
                        <div className="col-span-2 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                                💡 Selecciona una ciudad y completa la dirección para poder editar la ubicación en el mapa
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Institutions */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Instituciones Cercanas</h3>
                <div className="space-y-4">
                    {formData.nearbyInstitutions.map((inst, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm font-medium">{institutionNames[inst.institutionId] || `Institución API ID: ${inst.institutionId}`}</p>
                            </div>
                            <div className="w-32">
                                <FormNumericInput
                                    label=""
                                    value={inst.distance || undefined}
                                    placeholder="Distancia (m)"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newInstitutions = [...formData.nearbyInstitutions];
                                        newInstitutions[index].distance = e.target.value ? Number(e.target.value) : null;
                                        setFormData(prev => ({ ...prev, nearbyInstitutions: newInstitutions }));
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const newInstitutions = [...formData.nearbyInstitutions];
                                    newInstitutions.splice(index, 1);
                                    setFormData(prev => ({ ...prev, nearbyInstitutions: newInstitutions }));
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <InstitutionAutocomplete
                                value={tempInstitution}
                                onChange={setTempInstitution}
                                cityId={formData.cityId}
                                placeholder="Buscar institución..."
                                disabled={!formData.cityId}
                            />
                        </div>
                        <div className="w-32">
                            <FormNumericInput
                                label=""
                                value={tempDistance}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempDistance(e.target.value)}
                                placeholder="Distancia (m)"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (tempInstitution) {
                                    setFormData(prev => ({
                                        ...prev,
                                        nearbyInstitutions: [...prev.nearbyInstitutions, {
                                            institutionId: tempInstitution.id,
                                            distance: tempDistance ? parseInt(tempDistance) : null
                                        }]
                                    }));
                                    setInstitutionNames(prev => ({
                                        ...prev,
                                        [tempInstitution.id]: tempInstitution.name
                                    }));
                                    setTempInstitution(null);
                                    setTempDistance('');
                                }
                            }}
                            disabled={!tempInstitution}
                            className="px-4 py-2 mt-6 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            </div>

            {/* Details - Only show for individual rooms, not containers */}
            {isRoom && (
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            )}

            {/* Amenities - Only show for individual rooms, not containers */}
            {isRoom && (
                <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Características</h3>
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
            )}

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
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <LoadingSpinner size="sm" /> : <Save size={20} />}
                    <span>Guardar Cambios</span>
                </button>
            </div>
        </form >
    );
};

export default PropertyEditForm;
