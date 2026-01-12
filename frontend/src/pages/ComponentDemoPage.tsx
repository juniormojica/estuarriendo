import { useState } from 'react';
import PropertyTypeSelector from '../components/PropertyTypeSelector';
import ContainerBasicInfo, { ContainerBasicInfoData } from '../components/ContainerBasicInfo';
import ContainerServices from '../components/ContainerServices';
import type { PropertyService } from '../types';

const ComponentDemoPage = () => {
    const [currentStep, setCurrentStep] = useState<'selector' | 'basic' | 'services'>('selector');
    const [basicInfoData, setBasicInfoData] = useState<ContainerBasicInfoData | undefined>();
    const [servicesData, setServicesData] = useState<PropertyService[]>([]);

    const handleBasicInfoNext = (data: ContainerBasicInfoData) => {
        setBasicInfoData(data);
        setCurrentStep('services');
    };

    const handleServicesNext = (services: PropertyService[]) => {
        setServicesData(services);
        alert('Demo completado! Datos guardados en consola.');
        console.log('Basic Info:', basicInfoData);
        console.log('Services:', services);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Demo Controls */}
            <div className="bg-blue-600 text-white py-4 px-6 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">🎨 Demo de Componentes - Fase 6</h1>
                        <p className="text-sm text-blue-100">Sprint 1: Selector y Formulario Básico</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentStep('selector')}
                            className={`px-4 py-2 rounded-lg transition-colors ${currentStep === 'selector'
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-500 hover:bg-blue-400'
                                }`}
                        >
                            1. Selector
                        </button>
                        <button
                            onClick={() => setCurrentStep('basic')}
                            className={`px-4 py-2 rounded-lg transition-colors ${currentStep === 'basic'
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-500 hover:bg-blue-400'
                                }`}
                        >
                            2. Info Básica
                        </button>
                        <button
                            onClick={() => setCurrentStep('services')}
                            className={`px-4 py-2 rounded-lg transition-colors ${currentStep === 'services'
                                    ? 'bg-white text-blue-600'
                                    : 'bg-blue-500 hover:bg-blue-400'
                                }`}
                        >
                            3. Servicios
                        </button>
                    </div>
                </div>
            </div>

            {/* Component Display */}
            <div className="pb-20">
                {currentStep === 'selector' && <PropertyTypeSelector />}

                {currentStep === 'basic' && (
                    <ContainerBasicInfo
                        onNext={handleBasicInfoNext}
                        initialData={basicInfoData}
                    />
                )}

                {currentStep === 'services' && (
                    <ContainerServices
                        onNext={handleServicesNext}
                        onBack={() => setCurrentStep('basic')}
                        initialData={servicesData}
                    />
                )}
            </div>

            {/* Info Panel */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white py-3 px-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
                    <div>
                        <span className="font-semibold">Paso actual:</span>{' '}
                        {currentStep === 'selector' && 'PropertyTypeSelector.tsx'}
                        {currentStep === 'basic' && 'ContainerBasicInfo.tsx'}
                        {currentStep === 'services' && 'ContainerServices.tsx'}
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <span className="text-gray-400">Componentes creados:</span>{' '}
                            <span className="font-semibold text-green-400">3/15</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Fase:</span>{' '}
                            <span className="font-semibold text-blue-400">6 - Sprint 1</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentDemoPage;
