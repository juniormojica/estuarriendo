import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Users, Ban, Volume2, Coffee, Utensils, Home, Wifi, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createProperty } from '../store/slices/propertiesSlice';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import ImageUploader from './ImageUploader';
import CityAutocomplete from './CityAutocomplete';
import InstitutionAutocomplete from './InstitutionAutocomplete';
import LocationPicker from './LocationPicker';
import LoadingSpinner from './LoadingSpinner';
import type { City, Institution, PropertyRule, Amenity, PropertyService } from '../types';

interface RoomFormData {
    // Step 1: Basic Info
    title: string;
    description: string;
    monthlyRent: number;

    // Step 2: Location
    cityId: number;
    city: string;
    department: string;
    departmentId: number;
    street: string;
    neighborhood: string;
    coordinates: { lat: number; lng: number };

    // Step 3: Details
    area: number;
    nearbyInstitutions: Array<{ institutionId: number; distance: number | null }>;

    // Step 4: Amenities
    amenities: number[];

    // Step 5: Services
    services: PropertyService[];

    // Step 6: Rules
    rules: PropertyRule[];

    // Step 7: Images
    images: string[];
}

const RoomFlow: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { items: amenities } = useAppSelector((state) => state.amenities);

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState<RoomFormData>({
        title: '',
        description: '',
        monthlyRent: 0,
        cityId: 0,
        city: '',
        department: '',
        departmentId: 0,
        street: '',
        neighborhood: '',
        coordinates: { lat: 0, lng: 0 },
        area: 0,
        nearbyInstitutions: [],
        amenities: [],
        services: [],
        rules: [],
        images: []
    });

    // Location state
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [nearbyInstitutions, setNearbyInstitutions] = useState<Array<{
        institution: Institution;
        distance: number | null;
    }>>([]);
    const [tempInstitution, setTempInstitution] = useState<Institution | null>(null);
    const [tempDistance, setTempDistance] = useState<string>('');

    // Load amenities on mount
    React.useEffect(() => {
        dispatch(fetchAmenities());
    }, [dispatch]);

    const handleChange = (field: keyof RoomFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const handleCityChange = (city: City | null) => {
        setSelectedCity(city);
        if (city) {
            setFormData(prev => ({
                ...prev,
                cityId: city.id,
                city: city.name,
                department: city.department?.name || '',
                departmentId: city.departmentId
            }));
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

    // Amenity handlers
    const handleAmenityToggle = (amenityId: number) => {
        const isSelected = formData.amenities.includes(amenityId);
        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                amenities: prev.amenities.filter(id => id !== amenityId)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, amenityId]
            }));
        }
    };

    // Rule handlers
    const toggleRule = (ruleType: PropertyRule['ruleType']) => {
        const exists = formData.rules.find(r => r.ruleType === ruleType);
        if (exists) {
            setFormData(prev => ({
                ...prev,
                rules: prev.rules.filter(r => r.ruleType !== ruleType)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                rules: [...prev.rules, { ruleType, isAllowed: true }]
            }));
        }
    };

    const updateRule = (ruleType: PropertyRule['ruleType'], field: keyof PropertyRule, value: any) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.map(r => r.ruleType === ruleType ? { ...r, [field]: value } : r)
        }));
    };

    // Service handlers
    const toggleService = (serviceType: PropertyService['serviceType']) => {
        const exists = formData.services.find(s => s.serviceType === serviceType);
        if (exists) {
            setFormData(prev => ({
                ...prev,
                services: prev.services.filter(s => s.serviceType !== serviceType)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                services: [...prev.services, { serviceType, isIncluded: true }]
            }));
        }
    };

    const updateService = (serviceType: PropertyService['serviceType'], field: keyof PropertyService, value: any) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.map(s => s.serviceType === serviceType ? { ...s, [field]: value } : s)
        }));
    };

    const validateStep = (): boolean => {
        switch (currentStep) {
            case 1:
                if (!formData.title || formData.title.length < 10) {
                    setError('El título debe tener al menos 10 caracteres');
                    return false;
                }
                if (!formData.description || formData.description.length < 50) {
                    setError('La descripción debe tener al menos 50 caracteres');
                    return false;
                }
                if (!formData.monthlyRent || formData.monthlyRent <= 0) {
                    setError('El precio mensual es requerido');
                    return false;
                }
                return true;

            case 2:
                if (!formData.city || !formData.street) {
                    setError('La ciudad y dirección son requeridas');
                    return false;
                }
                return true;

            case 3:
                return true; // Details are optional

            case 4:
                return true; // Amenities are optional

            case 5:
                return true; // Services are optional

            case 6:
                return true; // Rules are optional

            case 7:
                if (formData.images.length === 0) {
                    setError('Debes agregar al menos una imagen');
                    return false;
                }
                return true;

            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        // Validate step 7 (images) before submitting
        if (!validateStep()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Prepare data for backend
            const propertyData = {
                title: formData.title,
                description: formData.description,
                typeName: 'habitacion',
                monthlyRent: formData.monthlyRent,
                location: {
                    cityId: formData.cityId,
                    departmentId: formData.departmentId,
                    street: formData.street,
                    neighborhood: formData.neighborhood,
                    latitude: formData.coordinates.lat,
                    longitude: formData.coordinates.lng
                },
                area: formData.area,
                amenityIds: formData.amenities,
                services: formData.services,
                rules: formData.rules,
                nearbyInstitutions: nearbyInstitutions.map(ni => ({
                    institutionId: ni.institution.id,
                    distance: ni.distance
                })),
                images: formData.images
            };

            const resultAction = await dispatch(createProperty(propertyData as any));

            if (createProperty.fulfilled.match(resultAction)) {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError(resultAction.payload as string || 'Error al crear la propiedad');
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Error inesperado al crear la propiedad');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        ¡Propiedad Enviada a Revisión!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Tu habitación ha sido enviada exitosamente. Nuestro equipo la revisará y será publicada pronto.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Volver al Dashboard</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Publicar Habitación
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Completa la información en 7 sencillos pasos
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Paso {currentStep} de 7
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round((currentStep / 7) * 100)}% completado
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / 7) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                )}

                {/* Form Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título de la publicación *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="Ej: Habitación amplia cerca de la Universidad"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    {formData.title.length}/100 caracteres
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción *
                                </label>
                                <textarea
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe las características principales de tu habitación..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    {formData.description.length}/500 caracteres
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio mensual (COP) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.monthlyRent || ''}
                                    onChange={(e) => handleChange('monthlyRent', parseInt(e.target.value) || 0)}
                                    placeholder="Ej: 800000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Ubicación</h2>

                            <CityAutocomplete
                                value={selectedCity}
                                onChange={handleCityChange}
                                placeholder="Buscar ciudad..."
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dirección *
                                </label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => handleChange('street', e.target.value)}
                                    placeholder="Ej: Carrera 13 #85-32"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Barrio
                                </label>
                                <input
                                    type="text"
                                    value={formData.neighborhood}
                                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                                    placeholder="Ej: Chapinero"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            {/* Google Maps Location Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Ubicación en el Mapa
                                </label>
                                <LocationPicker
                                    address={{
                                        street: formData.street,
                                        city: formData.city,
                                        department: formData.department,
                                        country: 'Colombia',
                                        neighborhood: formData.neighborhood
                                    }}
                                    coordinates={formData.coordinates}
                                    onCoordinatesChange={(lat, lng) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            coordinates: { lat, lng }
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Detalles</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Área (m²)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.area || ''}
                                    onChange={(e) => handleChange('area', parseInt(e.target.value) || 0)}
                                    placeholder="Ej: 15"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Instituciones Cercanas
                                </label>

                                {nearbyInstitutions.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {nearbyInstitutions.map((ni, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{ni.institution.name}</p>
                                                    {ni.distance && (
                                                        <p className="text-sm text-gray-600">{ni.distance} metros</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveInstitution(index)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <InstitutionAutocomplete
                                        value={tempInstitution}
                                        onChange={setTempInstitution}
                                        cityId={formData.cityId}
                                        placeholder="Buscar institución..."
                                    />

                                    <input
                                        type="number"
                                        value={tempDistance}
                                        onChange={(e) => setTempDistance(e.target.value)}
                                        placeholder="Distancia en metros (opcional)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />

                                    <button
                                        onClick={handleAddInstitution}
                                        disabled={!tempInstitution}
                                        className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Agregar Institución
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Amenities */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Amenidades</h2>
                            <p className="text-gray-600">
                                Selecciona las amenidades que tiene tu habitación
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {amenities
                                    .filter(a => a.category === 'habitacion' || a.category === 'general')
                                    .map(amenity => {
                                        const isSelected = formData.amenities.includes(amenity.id);
                                        return (
                                            <label
                                                key={amenity.id}
                                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-emerald-300'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleAmenityToggle(amenity.id)}
                                                    className="mr-3 w-4 h-4 text-emerald-600"
                                                />
                                                <span className="text-sm font-medium text-gray-900">{amenity.name}</span>
                                            </label>
                                        );
                                    })}
                            </div>

                            {formData.amenities.length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                    Las amenidades son opcionales, pero ayudan a que tu habitación sea más atractiva
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 5: Services */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Servicios</h2>
                            <p className="text-gray-600">
                                Selecciona los servicios que ofreces con la habitación
                            </p>

                            <div className="space-y-4">
                                {[
                                    { serviceType: 'breakfast' as const, label: 'Desayuno', icon: <Coffee className="w-5 h-5" /> },
                                    { serviceType: 'lunch' as const, label: 'Almuerzo', icon: <Utensils className="w-5 h-5" /> },
                                    { serviceType: 'dinner' as const, label: 'Cena', icon: <Utensils className="w-5 h-5" /> },
                                    { serviceType: 'housekeeping' as const, label: 'Limpieza', icon: <Home className="w-5 h-5" /> },
                                    { serviceType: 'laundry' as const, label: 'Lavandería', icon: <Home className="w-5 h-5" /> },
                                    { serviceType: 'wifi' as const, label: 'WiFi', icon: <Wifi className="w-5 h-5" /> },
                                    { serviceType: 'utilities' as const, label: 'Servicios públicos', icon: <Zap className="w-5 h-5" /> },
                                ].map(option => {
                                    const service = formData.services.find(s => s.serviceType === option.serviceType);
                                    const isSelected = !!service;

                                    return (
                                        <div key={option.serviceType} className="bg-white border border-gray-200 rounded-lg p-4">
                                            <label className="flex items-center cursor-pointer mb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleService(option.serviceType)}
                                                    className="mr-3 w-5 h-5 text-emerald-600"
                                                />
                                                <div className="flex items-center gap-2 flex-1">
                                                    {option.icon}
                                                    <span className="font-medium text-lg text-gray-900">{option.label}</span>
                                                </div>
                                            </label>

                                            {isSelected && (
                                                <div className="ml-8 space-y-3">
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                checked={service.isIncluded === true}
                                                                onChange={() => updateService(option.serviceType, 'isIncluded', true)}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-gray-700">Incluido en el precio</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                checked={service.isIncluded === false}
                                                                onChange={() => updateService(option.serviceType, 'isIncluded', false)}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-gray-700">Costo adicional</span>
                                                        </label>
                                                    </div>
                                                    {service.isIncluded === false && (
                                                        <input
                                                            type="number"
                                                            placeholder="Costo adicional (COP)"
                                                            value={service.additionalCost || ''}
                                                            onChange={(e) => updateService(option.serviceType, 'additionalCost', parseInt(e.target.value) || 0)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                    )}
                                                    <input
                                                        type="text"
                                                        placeholder="Descripción adicional (opcional)"
                                                        value={service.description || ''}
                                                        onChange={(e) => updateService(option.serviceType, 'description', e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {formData.services.length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                    Los servicios son opcionales, pero pueden hacer tu habitación más atractiva
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 6: Rules */}
                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Reglas de Convivencia</h2>
                            <p className="text-gray-600">
                                Define las reglas para una buena convivencia
                            </p>

                            <div className="space-y-4">
                                {[
                                    { ruleType: 'smoking' as const, label: 'Fumar', icon: <Ban className="w-5 h-5" />, hasValue: false },
                                    { ruleType: 'pets' as const, label: 'Mascotas', icon: <Ban className="w-5 h-5" />, hasValue: false },
                                    { ruleType: 'visits' as const, label: 'Visitas', icon: <Users className="w-5 h-5" />, hasValue: true },
                                    { ruleType: 'noise' as const, label: 'Horario de silencio', icon: <Volume2 className="w-5 h-5" />, hasValue: true },
                                    { ruleType: 'curfew' as const, label: 'Hora límite de llegada', icon: <Clock className="w-5 h-5" />, hasValue: true },
                                ].map(option => {
                                    const rule = formData.rules.find(r => r.ruleType === option.ruleType);
                                    const isSelected = !!rule;

                                    return (
                                        <div key={option.ruleType} className="bg-white border border-gray-200 rounded-lg p-4">
                                            <label className="flex items-center cursor-pointer mb-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleRule(option.ruleType)}
                                                    className="mr-3 w-5 h-5 text-emerald-600"
                                                />
                                                <div className="flex items-center gap-2 flex-1">
                                                    {option.icon}
                                                    <span className="font-medium text-lg text-gray-900">{option.label}</span>
                                                </div>
                                            </label>

                                            {isSelected && (
                                                <div className="ml-8 space-y-3">
                                                    {option.hasValue && (
                                                        <input
                                                            type="text"
                                                            placeholder={`Ej: ${option.ruleType === 'curfew' ? '23:00' : option.ruleType === 'noise' ? '22:00 - 07:00' : 'Hasta las 21:00'}`}
                                                            value={rule.value || ''}
                                                            onChange={(e) => updateRule(option.ruleType, 'value', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        />
                                                    )}
                                                    {!option.hasValue && (
                                                        <div className="flex gap-4">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    checked={rule.isAllowed === true}
                                                                    onChange={() => updateRule(option.ruleType, 'isAllowed', true)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-gray-700">Permitido</span>
                                                            </label>
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="radio"
                                                                    checked={rule.isAllowed === false}
                                                                    onChange={() => updateRule(option.ruleType, 'isAllowed', false)}
                                                                    className="mr-2"
                                                                />
                                                                <span className="text-gray-700">No permitido</span>
                                                            </label>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="text"
                                                        placeholder="Descripción adicional (opcional)"
                                                        value={rule.description || ''}
                                                        onChange={(e) => updateRule(option.ruleType, 'description', e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {formData.rules.length === 0 && (
                                <p className="text-sm text-gray-500 italic">
                                    Las reglas son opcionales, pero ayudan a establecer expectativas claras
                                </p>
                            )}
                        </div>
                    )}

                    {/* Step 7: Images */}
                    {currentStep === 7 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900">Imágenes</h2>
                            <p className="text-gray-600">
                                Agrega fotos de tu habitación. La primera imagen será la principal.
                            </p>

                            {/* Inline error message for images */}
                            {error && formData.images.length === 0 && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-red-800">
                                                {error}
                                            </p>
                                            <p className="mt-1 text-xs text-red-700">
                                                Debes subir entre 1 y 10 imágenes para publicar tu habitación.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <ImageUploader
                                images={formData.images}
                                onChange={(images) => handleChange('images', images)}
                                maxImages={10}
                            />
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 mt-6 border-t">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                disabled={isSubmitting}
                                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Anterior</span>
                            </button>
                        )}

                        {currentStep < 7 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors ml-auto"
                            >
                                <span>Siguiente</span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span>Publicando...</span>
                                    </>
                                ) : (
                                    <span>Publicar Habitación</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomFlow;
