import { useState } from 'react';
import { MapPin, ArrowLeft, ArrowRight, School, X } from 'lucide-react';
import CityAutocomplete from './CityAutocomplete';
import InstitutionAutocomplete from './InstitutionAutocomplete';
import LocationPicker from './LocationPicker';
import type { City, Institution } from '../types';

interface ContainerLocationProps {
    onNext: (data: ContainerLocationData) => void;
    onBack: () => void;
    initialData?: ContainerLocationData;
}

export interface ContainerLocationData {
    cityId: number;
    departmentId: number;
    street: string;
    neighborhood: string;
    coordinates: { lat: number; lng: number };
    nearbyInstitutions: Array<{ institutionId: number; distance: number | null }>;
}

const ContainerLocation: React.FC<ContainerLocationProps> = ({ onNext, onBack, initialData }) => {
    const [formData, setFormData] = useState<ContainerLocationData>(
        initialData || {
            cityId: 0,
            departmentId: 0,
            street: '',
            neighborhood: '',
            coordinates: { lat: 0, lng: 0 },
            nearbyInstitutions: [],
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    // Nearby institutions state
    const [nearbyInstitutions, setNearbyInstitutions] = useState<Array<{
        institution: Institution;
        distance: number | null;
    }>>([]);
    const [tempInstitution, setTempInstitution] = useState<Institution | null>(null);
    const [tempDistance, setTempDistance] = useState<string>('');

    const handleChange = (field: keyof ContainerLocationData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAddInstitution = () => {
        if (tempInstitution) {
            setNearbyInstitutions(prev => [
                ...prev,
                {
                    institution: tempInstitution,
                    distance: tempDistance ? parseInt(tempDistance) : null
                }
            ]);
            setTempInstitution(null);
            setTempDistance('');
        }
    };

    const handleRemoveInstitution = (index: number) => {
        setNearbyInstitutions(prev => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.cityId) {
            newErrors.cityId = 'La ciudad es obligatoria';
        }

        if (!formData.street) {
            newErrors.street = 'La dirección es obligatoria';
        }

        if (!formData.neighborhood) {
            newErrors.neighborhood = 'El barrio es obligatorio';
        }

        if (!formData.coordinates.lat || !formData.coordinates.lng) {
            newErrors.coordinates = 'Debes seleccionar la ubicación en el mapa';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // Transform institutions data before passing to parent
            const dataToSubmit = {
                ...formData,
                nearbyInstitutions: nearbyInstitutions.map(ni => ({
                    institutionId: ni.institution.id,
                    distance: ni.distance
                }))
            };
            onNext(dataToSubmit);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 2 de 6</span>
                        <span className="text-sm text-gray-500">Ubicación</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Ubicación de la Propiedad
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Indica dónde se encuentra tu propiedad
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Location Information Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="space-y-4">
                            {/* City Autocomplete */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ciudad
                                </label>
                                <CityAutocomplete
                                    value={selectedCity}
                                    onChange={(city: City | null) => {
                                        if (city) {
                                            setSelectedCity(city);
                                            handleChange('cityId', city.id);
                                            handleChange('departmentId', city.departmentId);
                                        }
                                    }}
                                    placeholder="Buscar ciudad..."
                                    required
                                />
                                {errors.cityId && (
                                    <p className="mt-1 text-sm text-red-600">{errors.cityId}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección *
                                </label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => handleChange('street', e.target.value)}
                                    placeholder="Ej: Calle 85 #13-45"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.street ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.street && (
                                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Barrio *
                                </label>
                                <input
                                    type="text"
                                    value={formData.neighborhood}
                                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                                    placeholder="Ej: Chapinero"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.neighborhood ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.neighborhood && (
                                    <p className="mt-1 text-sm text-red-600">{errors.neighborhood}</p>
                                )}
                            </div>

                            {/* Location Picker */}
                            {selectedCity && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ubicación en el mapa *
                                    </label>
                                    <LocationPicker
                                        address={{
                                            street: formData.street,
                                            city: selectedCity.name,
                                            department: selectedCity.department?.name || '',
                                            country: 'Colombia',
                                            neighborhood: formData.neighborhood
                                        }}
                                        coordinates={formData.coordinates}
                                        onCoordinatesChange={(lat: number, lng: number) => {
                                            handleChange('coordinates', { lat, lng });
                                        }}
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Arrastra el marcador para seleccionar la ubicación exacta de tu propiedad
                                    </p>
                                    {errors.coordinates && (
                                        <p className="mt-1 text-sm text-red-600">{errors.coordinates}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nearby Institutions Card - Separate and Distinct */}
                    <div className="bg-white rounded-lg shadow-md border border-emerald-100 p-6">
                        {/* Header with Icon */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <School className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Instituciones Cercanas
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Agrega universidades, colegios u otras instituciones educativas
                                </p>
                            </div>
                        </div>

                        {/* List of Added Institutions */}
                        {nearbyInstitutions.length > 0 && (
                            <div className="space-y-3 mb-5 mt-5">
                                {nearbyInstitutions.map((ni, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-white border border-emerald-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <School className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{ni.institution.name}</p>
                                                {ni.distance && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{ni.distance} metros</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveInstitution(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                            aria-label="Eliminar institución"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Institution Form */}
                        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-5 border-2 border-dashed border-emerald-200 mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <span className="text-emerald-600">➕</span>
                                Agregar nueva institución
                            </p>
                            <div className="space-y-3">
                                <InstitutionAutocomplete
                                    value={tempInstitution}
                                    onChange={setTempInstitution}
                                    cityId={formData.cityId}
                                    placeholder="🔍 Buscar institución..."
                                />

                                <input
                                    type="number"
                                    value={tempDistance}
                                    onChange={(e) => setTempDistance(e.target.value)}
                                    placeholder="📏 Distancia en metros (opcional)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                />

                                <button
                                    type="button"
                                    onClick={handleAddInstitution}
                                    disabled={!tempInstitution}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                >
                                    Agregar Institución
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Atrás
                        </button>

                        <button
                            type="submit"
                            className="flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Siguiente
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ContainerLocation;
