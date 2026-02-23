import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropertyTypeSelectorStep from './PropertyTypeSelectorStep';
import ContainerBasicInfo from './ContainerBasicInfo';
import ContainerLocation from './ContainerLocation';
import ContainerServices from './ContainerServices';
import ContainerRules from './ContainerRules';
import ContainerCommonAreas from './ContainerCommonAreas';
import UnitBuilder from './UnitBuilder';
import ImageUploader from './ImageUploader';
import LoadingSpinner from './LoadingSpinner';
import type { RentalMode, PropertyUnit } from '../types';
import { createContainer, updateContainer, adminCreateContainer } from '../services/containerService';
import { useAppDispatch } from '../store/hooks';
import { fetchAmenities } from '../store/slices/amenitiesSlice';

interface ContainerFlowProps {
    propertyId?: string; // For editing
    initialPropertyType?: string; // Skip type selector if already selected
    adminMode?: boolean; // If true, enables admin creation mode
    targetOwnerId?: string; // Required if adminMode is true
    onAdminComplete?: () => void; // Callback after admin creates property
}

interface ContainerData {
    // Step 1: Basic Info
    title: string;
    description: string;
    typeId: number;
    typeName: string;
    locationId: number;
    cityId: number;
    departmentId: number;
    street: string;
    neighborhood: string;
    coordinates: { lat: number; lng: number };
    nearbyInstitutions: Array<{ institutionId: number; distance: number | null }>;
    rentalMode: RentalMode;
    requiresDeposit: boolean;
    minimumContractMonths: number;

    // Step 2-4: Container config (only if by_unit)
    services: any[];
    rules: any[];
    commonAreaIds: number[];

    // Step 5: Units
    units: Partial<PropertyUnit>[];

    // Step 6: Images
    images: string[];
}

const ContainerFlow: React.FC<ContainerFlowProps> = ({
    propertyId,
    initialPropertyType,
    adminMode = false,
    targetOwnerId,
    onAdminComplete
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Load amenities on mount
    useEffect(() => {
        dispatch(fetchAmenities());
    }, [dispatch]);

    const savedDraftStr = sessionStorage.getItem('containerFlowDraft');
    const savedDraft = savedDraftStr ? JSON.parse(savedDraftStr) : null;

    // If initialPropertyType is provided, start at step 1 (skip type selector)
    const [currentStep, setCurrentStep] = useState(savedDraft?.step ?? (initialPropertyType ? 1 : 0));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState<string>(savedDraft?.selectedPropertyType || initialPropertyType || 'pension');

    const propertyTypeIds: Record<string, number> = {
        'habitacion': 1,
        'pension': 2,
        'apartamento': 3,
        'aparta-estudio': 4
    };

    const [containerData, setContainerData] = useState<Partial<ContainerData>>(savedDraft?.data || {
        typeId: propertyTypeIds[selectedPropertyType] || 2, // Default to pension (2)
        coordinates: { lat: 0, lng: 0 },
        nearbyInstitutions: [],
        rentalMode: 'by_unit',
        requiresDeposit: true,
        minimumContractMonths: 6,
        services: [],
        rules: [],
        commonAreaIds: [],
        units: [],
        images: []
    });

    useEffect(() => {
        if (!isSubmitting && !propertyId) {
            const draft = {
                step: currentStep,
                data: containerData,
                selectedPropertyType
            };
            sessionStorage.setItem('containerFlowDraft', JSON.stringify(draft));
        }
    }, [currentStep, containerData, selectedPropertyType, isSubmitting, propertyId]);

    // Update typeId when selectedPropertyType changes
    useEffect(() => {
        const typeId = propertyTypeIds[selectedPropertyType] || 2;
        setContainerData(prev => ({ ...prev, typeId }));
    }, [selectedPropertyType]);

    // Load existing container data if editing
    useEffect(() => {
        if (propertyId) {
            // TODO: Load container data from API
            // const data = await getContainerById(propertyId);
            // setContainerData(data);
        }
    }, [propertyId]);

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            // Prepare data for backend
            const payload = {
                // Basic info
                title: containerData.title,
                description: containerData.description,
                typeId: containerData.typeId || 2, // Default to pension (2)
                locationId: containerData.locationId || 0, // Will be created by backend
                currency: 'COP',
                status: 'pending',
                rentalMode: containerData.rentalMode,
                requiresDeposit: containerData.requiresDeposit,
                minimumContractMonths: containerData.minimumContractMonths,

                // Location
                location: {
                    street: containerData.street,
                    neighborhood: containerData.neighborhood,
                    cityId: containerData.cityId,
                    departmentId: containerData.departmentId,
                    latitude: containerData.coordinates?.lat,
                    longitude: containerData.coordinates?.lng
                },

                // Nearby institutions
                nearbyInstitutions: containerData.nearbyInstitutions || [],

                // Container config (if by_unit)
                ...(containerData.rentalMode === 'by_unit' && {
                    services: containerData.services,
                    rules: containerData.rules,
                    commonAreaIds: containerData.commonAreaIds
                }),

                // Units - replicate container coordinates to each unit
                units: containerData.units?.map(unit => ({
                    ...unit,
                    amenityIds: unit.amenities, // Backend expects amenityIds
                    latitude: containerData.coordinates?.lat,
                    longitude: containerData.coordinates?.lng
                })),

                // Images
                images: containerData.images
            };

            if (propertyId) {
                await updateContainer(parseInt(propertyId), payload as any);
            } else {
                if (adminMode && targetOwnerId) {
                    await adminCreateContainer({ ...payload, targetOwnerId } as any);
                } else {
                    await createContainer(payload as any);
                }
            }

            // Success - redirect or callback
            sessionStorage.removeItem('containerFlowDraft');
            if (adminMode && onAdminComplete) {
                onAdminComplete();
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Error submitting container:', err);
            setError(err.message || 'Error al publicar la propiedad');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                // Property Type Selector
                return (
                    <PropertyTypeSelectorStep
                        onSelect={(type) => {
                            // Store the selected property type
                            setSelectedPropertyType(type);
                            // Move to next step
                            setCurrentStep(1);
                        }}
                        selectedType={selectedPropertyType as any}
                    />
                );

            case 1:
                // Container Basic Info
                return (
                    <ContainerBasicInfo
                        onNext={(data) => {
                            setContainerData(prev => ({ ...prev, ...data }));
                            setCurrentStep(2); // Go to Location
                        }}
                        onBack={() => setCurrentStep(0)}
                        initialData={containerData as any}
                        propertyType={selectedPropertyType}
                    />
                );

            case 2:
                // Container Location
                return (
                    <ContainerLocation
                        onNext={(data) => {
                            setContainerData(prev => ({ ...prev, ...data }));

                            // Navigate based on rental mode
                            if (containerData.rentalMode === 'by_unit') {
                                setCurrentStep(3); // Go to Services
                            } else {
                                setCurrentStep(6); // Skip to UnitBuilder
                            }
                        }}
                        onBack={() => setCurrentStep(1)}
                        initialData={containerData.cityId ? {
                            cityId: containerData.cityId,
                            departmentId: containerData.departmentId || 0,
                            street: containerData.street || '',
                            neighborhood: containerData.neighborhood || '',
                            coordinates: containerData.coordinates || { lat: 0, lng: 0 },
                            nearbyInstitutions: containerData.nearbyInstitutions || []
                        } : undefined}
                    />
                );

            case 3:
                // Container Services (only if by_unit)
                return (
                    <ContainerServices
                        onNext={(services) => {
                            setContainerData(prev => ({ ...prev, services }));
                            setCurrentStep(4);
                        }}
                        onBack={() => setCurrentStep(2)}
                        initialData={containerData.services || []}
                    />
                );

            case 4:
                // Container Rules (only if by_unit)
                return (
                    <ContainerRules
                        onNext={(rules) => {
                            setContainerData(prev => ({ ...prev, rules }));
                            setCurrentStep(5);
                        }}
                        onBack={() => setCurrentStep(3)}
                        initialData={containerData.rules || []}
                    />
                );

            case 5:
                // Container Common Areas (only if by_unit)
                return (
                    <ContainerCommonAreas
                        onNext={(areaIds) => {
                            setContainerData(prev => ({ ...prev, commonAreaIds: areaIds }));
                            setCurrentStep(6);
                        }}
                        onBack={() => setCurrentStep(4)}
                        initialData={containerData.commonAreaIds || []}
                    />
                );

            case 6:
                // Unit Builder
                return (
                    <UnitBuilder
                        onNext={(units) => {
                            setContainerData(prev => ({ ...prev, units }));
                            setCurrentStep(7);
                        }}
                        onBack={() => {
                            if (containerData.rentalMode === 'by_unit') {
                                setCurrentStep(5); // Back to Common Areas
                            } else {
                                setCurrentStep(2); // Back to Location
                            }
                        }}
                        initialData={containerData.units || []}
                    />
                );

            case 7:
                // Container Images
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-900">Galería de Imágenes del Contenedor</h2>
                        <p className="text-gray-600">
                            Sube fotos de la fachada, áreas comunes y espacios generales de la propiedad.
                            Las fotos de cada habitación ya fueron agregadas en el paso anterior.
                        </p>

                        <ImageUploader
                            images={containerData.images || []}
                            onChange={(images) => {
                                setContainerData(prev => ({ ...prev, images }));
                            }}
                            maxImages={10}
                        />

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t">
                            <button
                                onClick={() => setCurrentStep(6)}
                                disabled={isSubmitting}
                                className="flex items-center space-x-2 px-6 py-3 min-h-[44px] rounded-lg font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Anterior</span>
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || (containerData.images?.length || 0) === 0}
                                className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span>{propertyId ? 'Actualizando...' : 'Publicando...'}</span>
                                    </>
                                ) : (
                                    <span>{propertyId ? 'Actualizar Propiedad' : 'Publicar Propiedad'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
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
                        {propertyId ? 'Editar Propiedad' : 'Publicar Nueva Propiedad'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Completa la información de tu pensión/residencia
                    </p>
                </div>

                {/* Progress Indicator */}
                {currentStep > 0 && (
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
                )}

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default ContainerFlow;
