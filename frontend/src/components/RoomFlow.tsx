import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Users, Ban, Volume2, Coffee, Utensils, Home, Wifi, Zap, Droplet, Wind, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createProperty } from '../store/slices/propertiesSlice';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import { roomCompleteSchema, type RoomFormData } from '../lib/schemas/room.schema';
import { FormInput, FormTextarea, FormCurrencyInput, FormNumericInput } from './forms';
import ImageUploader from './ImageUploader';
import CityAutocomplete from './CityAutocomplete';
import InstitutionAutocomplete from './InstitutionAutocomplete';
import LocationPicker from './LocationPicker';
import LoadingSpinner from './LoadingSpinner';
import type { City, Institution, PropertyRule, Amenity, PropertyService } from '../types';

const RoomFlow: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { items: amenities } = useAppSelector((state) => state.amenities);

    const [currentStep, setCurrentStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string>('');

    // UI-only states
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [tempInstitution, setTempInstitution] = useState<Institution | null>(null);
    const [tempDistance, setTempDistance] = useState<string>('');

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RoomFormData>({
        resolver: zodResolver(roomCompleteSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            title: '',
            description: '',
            monthlyRent: 0,
            cityId: 0,
            departmentId: 0,
            street: '',
            neighborhood: '',
            coordinates: { lat: 0, lng: 0 },
            area: undefined,
            nearbyInstitutions: [],
            amenities: [],
            services: [],
            rules: [],
            images: [],
        },
    });

    // useFieldArray for dynamic arrays
    const { fields: institutionFields, append: appendInstitution, remove: removeInstitution } = useFieldArray({
        control,
        name: 'nearbyInstitutions',
    });

    const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
        control,
        name: 'services',
    });

    const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
        control,
        name: 'rules',
    });

    // Watch values
    const title = watch('title');
    const description = watch('description');
    const street = watch('street');
    const neighborhood = watch('neighborhood');
    const coordinates = watch('coordinates');
    const amenitiesValue = watch('amenities');
    const images = watch('images');

    // Load amenities on mount
    React.useEffect(() => {
        dispatch(fetchAmenities());
    }, [dispatch]);

    // Helper function to get fields to validate for each step
    const getFieldsForStep = (step: number): (keyof RoomFormData)[] => {
        switch (step) {
            case 1: return ['title', 'description', 'monthlyRent'];
            case 2: return ['cityId', 'street', 'neighborhood', 'coordinates'];
            case 3: return ['nearbyInstitutions']; // area is optional
            case 4: return ['amenities'];
            case 5: return ['services'];
            case 6: return ['rules'];
            case 7: return ['images'];
            default: return [];
        }
    };

    const handleNext = async () => {
        // Auto-add institution if user selected one but didn't click add
        if (currentStep === 3 && tempInstitution) {
            appendInstitution({
                institutionId: tempInstitution.id,
                distance: tempDistance ? parseInt(tempDistance) : null,
            });
            setTempInstitution(null);
            setTempDistance('');
        }

        const fieldsToValidate = getFieldsForStep(currentStep);
        const isValid = await trigger(fieldsToValidate as any);

        if (isValid) {
            setCurrentStep(prev => prev + 1);
            setError('');
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setError('');
        window.scrollTo(0, 0);
    };

    const onSubmit = async (data: RoomFormData) => {
        setError('');

        try {
            const propertyData = {
                title: data.title,
                description: data.description,
                typeName: 'habitacion',
                monthlyRent: data.monthlyRent,
                location: {
                    cityId: data.cityId,
                    departmentId: data.departmentId,
                    street: data.street,
                    neighborhood: data.neighborhood,
                    latitude: data.coordinates.lat,
                    longitude: data.coordinates.lng
                },
                area: data.area || null,
                amenityIds: data.amenities || [],
                services: data.services || [],
                rules: data.rules || [],
                nearbyInstitutions: data.nearbyInstitutions || [],
                images: data.images
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
        }
    };

    // Service handlers
    const toggleService = (serviceType: PropertyService['serviceType']) => {
        const existingIndex = serviceFields.findIndex(field => field.serviceType === serviceType);
        if (existingIndex >= 0) {
            removeService(existingIndex);
        } else {
            appendService({ serviceType, isIncluded: true, additionalCost: 0 });
        }
    };

    const isServiceSelected = (serviceType: PropertyService['serviceType']) => {
        return serviceFields.some(field => field.serviceType === serviceType);
    };

    const getServiceIndex = (serviceType: PropertyService['serviceType']) => {
        return serviceFields.findIndex(field => field.serviceType === serviceType);
    };

    // Rule handlers
    const toggleRule = (ruleType: PropertyRule['ruleType']) => {
        const existingIndex = ruleFields.findIndex(field => field.ruleType === ruleType);
        if (existingIndex >= 0) {
            removeRule(existingIndex);
        } else {
            appendRule({ ruleType, isAllowed: true });
        }
    };

    const isRuleSelected = (ruleType: PropertyRule['ruleType']) => {
        return ruleFields.some(field => field.ruleType === ruleType);
    };

    const getRuleIndex = (ruleType: PropertyRule['ruleType']) => {
        return ruleFields.findIndex(field => field.ruleType === ruleType);
    };

    // Service options
    const serviceOptions: Array<{
        serviceType: PropertyService['serviceType'];
        label: string;
        icon: React.ReactNode;
        category: 'food' | 'utilities' | 'other';
    }> = [
            { serviceType: 'breakfast', label: 'Desayuno', icon: <Coffee className="w-5 h-5" />, category: 'food' },
            { serviceType: 'lunch', label: 'Almuerzo', icon: <Utensils className="w-5 h-5" />, category: 'food' },
            { serviceType: 'dinner', label: 'Cena', icon: <Utensils className="w-5 h-5" />, category: 'food' },
            { serviceType: 'wifi', label: 'WiFi', icon: <Wifi className="w-5 h-5" />, category: 'utilities' },
            { serviceType: 'utilities', label: 'Servicios Públicos', icon: <Zap className="w-5 h-5" />, category: 'utilities' },
            { serviceType: 'laundry', label: 'Lavandería', icon: <Droplet className="w-5 h-5" />, category: 'other' },
            { serviceType: 'housekeeping', label: 'Limpieza', icon: <Wind className="w-5 h-5" />, category: 'other' },
        ];

    // Rule options
    const ruleOptions: Array<{
        ruleType: PropertyRule['ruleType'];
        label: string;
        icon: React.ReactNode;
        hasValue: boolean;
        placeholder?: string;
    }> = [
            { ruleType: 'curfew', label: 'Hora límite de llegada', icon: <Clock className="w-5 h-5" />, hasValue: true, placeholder: 'Ej: 23:00' },
            { ruleType: 'noise', label: 'Horario de silencio', icon: <Volume2 className="w-5 h-5" />, hasValue: true, placeholder: 'Ej: 22:00 - 07:00' },
            { ruleType: 'visits', label: 'Visitas', icon: <Users className="w-5 h-5" />, hasValue: true, placeholder: 'Ej: Hasta las 21:00' },
            { ruleType: 'smoking', label: 'Fumar', icon: <Ban className="w-5 h-5" />, hasValue: false },
            { ruleType: 'pets', label: 'Mascotas', icon: <Ban className="w-5 h-5" />, hasValue: false },
        ];

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
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso {currentStep} de 7</span>
                        <span className="text-sm text-gray-500">
                            {currentStep === 1 && 'Información Básica'}
                            {currentStep === 2 && 'Ubicación'}
                            {currentStep === 3 && 'Detalles'}
                            {currentStep === 4 && 'Amenidades'}
                            {currentStep === 5 && 'Servicios'}
                            {currentStep === 6 && 'Reglas'}
                            {currentStep === 7 && 'Imágenes'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(currentStep / 7) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-600" role="alert">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Básica</h2>
                                <p className="text-gray-600 mb-6">Cuéntanos sobre tu habitación</p>

                                <div className="space-y-4">
                                    <FormInput
                                        label="Título de la publicación"
                                        {...register('title')}
                                        error={errors.title}
                                        helperText={`${title?.length || 0}/100 caracteres`}
                                        required
                                    />

                                    <FormTextarea
                                        label="Descripción"
                                        {...register('description')}
                                        error={errors.description}
                                        helperText={`${description?.length || 0}/500 caracteres`}
                                        required
                                    />

                                    <FormCurrencyInput
                                        label="Precio mensual (COP)"
                                        {...register('monthlyRent', { valueAsNumber: true })}
                                        error={errors.monthlyRent}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h2>
                                <p className="text-gray-600 mb-6">¿Dónde está ubicada tu habitación?</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ciudad <span className="text-red-500">*</span>
                                        </label>
                                        <CityAutocomplete
                                            selectedCity={selectedCity}
                                            onCityChange={(city) => {
                                                setSelectedCity(city);
                                                if (city) {
                                                    setValue('cityId', city.id, { shouldValidate: true });
                                                    setValue('departmentId', city.departmentId, { shouldValidate: true });
                                                }
                                            }}
                                        />
                                        {errors.cityId && (
                                            <p className="mt-1 text-sm text-red-600" role="alert">
                                                {errors.cityId.message}
                                            </p>
                                        )}
                                    </div>

                                    <FormInput
                                        label="Dirección (Calle)"
                                        {...register('street')}
                                        error={errors.street}
                                        required
                                    />

                                    <FormInput
                                        label="Barrio"
                                        {...register('neighborhood')}
                                        error={errors.neighborhood}
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ubicación en el mapa <span className="text-red-500">*</span>
                                        </label>
                                        <LocationPicker
                                            address={{
                                                street: street || '',
                                                neighborhood: neighborhood || ''
                                            }}
                                            coordinates={coordinates}
                                            onCoordinatesChange={(coords) => {
                                                setValue('coordinates', coords, { shouldValidate: true });
                                            }}
                                        />
                                        {(errors.coordinates?.lat || errors.coordinates?.lng) && (
                                            <p className="mt-1 text-sm text-red-600" role="alert">
                                                {errors.coordinates.lat?.message || errors.coordinates.lng?.message || 'Debes seleccionar la ubicación en el mapa'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalles</h2>
                                <p className="text-gray-600 mb-6">Información adicional sobre la habitación</p>

                                <div className="space-y-4">
                                    <FormNumericInput
                                        label="Área (m²) - Opcional"
                                        {...register('area', { valueAsNumber: true })}
                                        error={errors.area}
                                        helperText="Si no conoces el área exacta, puedes dejarlo en blanco"
                                        placeholder="Ej: 25"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Instituciones Cercanas
                                        </label>

                                        {institutionFields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                                                <input type="hidden" {...register(`nearbyInstitutions.${index}.institutionId`)} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Institución ID: {field.institutionId}</p>
                                                </div>
                                                <FormNumericInput
                                                    label=""
                                                    placeholder="Distancia (m)"
                                                    {...register(`nearbyInstitutions.${index}.distance`, { valueAsNumber: true })}
                                                    className="w-32"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeInstitution(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <InstitutionAutocomplete
                                            selectedInstitution={tempInstitution}
                                            onInstitutionChange={setTempInstitution}
                                            distance={tempDistance}
                                            onDistanceChange={setTempDistance}
                                            onAdd={() => {
                                                if (tempInstitution) {
                                                    appendInstitution({
                                                        institutionId: tempInstitution.id,
                                                        distance: tempDistance ? parseInt(tempDistance) : null,
                                                    });
                                                    setTempInstitution(null);
                                                    setTempDistance('');
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Amenities */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Amenidades</h2>
                                <p className="text-gray-600 mb-6">¿Qué comodidades tiene la habitación?</p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {amenities.map(amenity => (
                                        <label
                                            key={amenity.id}
                                            className={`
                                                flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all
                                                ${amenitiesValue?.includes(amenity.id)
                                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-blue-300'
                                                }
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={amenitiesValue?.includes(amenity.id) || false}
                                                onChange={(e) => {
                                                    const current = amenitiesValue || [];
                                                    const newAmenities = e.target.checked
                                                        ? [...current, amenity.id]
                                                        : current.filter(id => id !== amenity.id);
                                                    setValue('amenities', newAmenities, { shouldValidate: true });
                                                }}
                                                className="sr-only"
                                            />
                                            <Home className="w-8 h-8 mb-2 text-gray-700" />
                                            <span className="text-sm font-medium text-center">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Services */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Servicios Incluidos</h2>
                                <p className="text-gray-600 mb-6">Selecciona los servicios que ofreces</p>

                                <div className="space-y-3">
                                    {serviceOptions.map(option => {
                                        const isSelected = isServiceSelected(option.serviceType);
                                        const serviceIndex = getServiceIndex(option.serviceType);
                                        const service = serviceIndex >= 0 ? serviceFields[serviceIndex] : null;

                                        return (
                                            <div key={option.serviceType} className="border rounded-lg p-4">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleService(option.serviceType)}
                                                        className="mr-3 w-5 h-5"
                                                    />
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {option.icon}
                                                        <span className="font-medium">{option.label}</span>
                                                    </div>
                                                </label>

                                                {isSelected && service && serviceIndex >= 0 && (
                                                    <div className="mt-3 ml-8 space-y-2">
                                                        <input type="hidden" {...register(`services.${serviceIndex}.serviceType`)} />

                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                {...register(`services.${serviceIndex}.isIncluded`)}
                                                                className="w-4 h-4"
                                                            />
                                                            <span className="text-sm">Incluido en el precio</span>
                                                        </label>

                                                        {!service.isIncluded && (
                                                            <FormCurrencyInput
                                                                label=""
                                                                placeholder="Costo adicional"
                                                                {...register(`services.${serviceIndex}.additionalCost`, { valueAsNumber: true })}
                                                                className="w-full"
                                                            />
                                                        )}

                                                        <input
                                                            type="text"
                                                            placeholder="Descripción (opcional)"
                                                            {...register(`services.${serviceIndex}.description`)}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Rules */}
                    {currentStep === 6 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reglas de Convivencia</h2>
                                <p className="text-gray-600 mb-6">Define las reglas para una buena convivencia</p>

                                <div className="space-y-3">
                                    {ruleOptions.map(option => {
                                        const isSelected = isRuleSelected(option.ruleType);
                                        const ruleIndex = getRuleIndex(option.ruleType);
                                        const rule = ruleIndex >= 0 ? ruleFields[ruleIndex] : null;

                                        return (
                                            <div key={option.ruleType} className="border rounded-lg p-4">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleRule(option.ruleType)}
                                                        className="mr-3 w-5 h-5"
                                                    />
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {option.icon}
                                                        <span className="font-medium">{option.label}</span>
                                                    </div>
                                                </label>

                                                {isSelected && rule && ruleIndex >= 0 && (
                                                    <div className="mt-3 ml-8 space-y-2">
                                                        <input type="hidden" {...register(`rules.${ruleIndex}.ruleType`)} />

                                                        {option.hasValue && (
                                                            <input
                                                                type="text"
                                                                placeholder={option.placeholder}
                                                                {...register(`rules.${ruleIndex}.value`)}
                                                                className="w-full px-4 py-2 border rounded-lg"
                                                            />
                                                        )}

                                                        {!option.hasValue && (
                                                            <div className="flex gap-4">
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        value="true"
                                                                        {...register(`rules.${ruleIndex}.isAllowed`)}
                                                                        className="mr-2"
                                                                    />
                                                                    <span>Permitido</span>
                                                                </label>
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="radio"
                                                                        value="false"
                                                                        {...register(`rules.${ruleIndex}.isAllowed`)}
                                                                        className="mr-2"
                                                                    />
                                                                    <span>No permitido</span>
                                                                </label>
                                                            </div>
                                                        )}

                                                        <input
                                                            type="text"
                                                            placeholder="Descripción adicional (opcional)"
                                                            {...register(`rules.${ruleIndex}.description`)}
                                                            className="w-full px-4 py-2 border rounded-lg text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Images */}
                    {currentStep === 7 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Imágenes</h2>
                                <p className="text-gray-600 mb-6">Agrega fotos de tu habitación (mínimo 1, máximo 10)</p>

                                <ImageUploader
                                    maxImages={10}
                                    onImagesChange={(newImages) => {
                                        setValue('images', newImages, { shouldValidate: true });
                                    }}
                                    images={images || []}
                                />

                                {errors.images && (
                                    <p className="mt-2 text-sm text-red-600" role="alert">
                                        {errors.images.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Atrás
                            </button>
                        )}

                        {currentStep < 7 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="ml-auto flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Siguiente
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="ml-auto flex items-center gap-2 px-8 py-3 min-h-[44px] bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        Enviar a Revisión
                                        <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomFlow;
