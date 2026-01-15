import { useState } from 'react';
import { ArrowLeft, ArrowRight, Coffee, Wifi, Zap, Droplet, Wind } from 'lucide-react';
import type { PropertyService } from '../types';

interface ContainerServicesProps {
    onNext: (services: PropertyService[]) => void;
    onBack: () => void;
    initialData?: PropertyService[];
}

interface ServiceOption {
    serviceType: PropertyService['serviceType'];
    label: string;
    icon: React.ReactNode;
    category: 'food' | 'utilities' | 'other';
}

const ContainerServices: React.FC<ContainerServicesProps> = ({ onNext, onBack, initialData }) => {
    const [services, setServices] = useState<PropertyService[]>(initialData || []);

    const serviceOptions: ServiceOption[] = [
        { serviceType: 'breakfast', label: 'Desayuno', icon: <Coffee className="w-5 h-5" />, category: 'food' },
        { serviceType: 'lunch', label: 'Almuerzo', icon: <Coffee className="w-5 h-5" />, category: 'food' },
        { serviceType: 'dinner', label: 'Cena', icon: <Coffee className="w-5 h-5" />, category: 'food' },
        { serviceType: 'wifi', label: 'WiFi', icon: <Wifi className="w-5 h-5" />, category: 'utilities' },
        { serviceType: 'utilities', label: 'Servicios Públicos', icon: <Zap className="w-5 h-5" />, category: 'utilities' },
        { serviceType: 'laundry', label: 'Lavandería', icon: <Droplet className="w-5 h-5" />, category: 'other' },
        { serviceType: 'housekeeping', label: 'Limpieza', icon: <Wind className="w-5 h-5" />, category: 'other' },
    ];

    const toggleService = (serviceType: PropertyService['serviceType']) => {
        const exists = services.find(s => s.serviceType === serviceType);
        if (exists) {
            setServices(services.filter(s => s.serviceType !== serviceType));
        } else {
            setServices([...services, { serviceType, isIncluded: true, additionalCost: 0 }]);
        }
    };

    const updateService = (serviceType: PropertyService['serviceType'], field: keyof PropertyService, value: any) => {
        setServices(services.map(s =>
            s.serviceType === serviceType ? { ...s, [field]: value } : s
        ));
    };

    const handleSubmit = () => {
        if (services.length === 0) {
            alert('Debes seleccionar al menos un servicio');
            return;
        }
        onNext(services);
    };

    const groupedServices = {
        food: serviceOptions.filter(s => s.category === 'food'),
        utilities: serviceOptions.filter(s => s.category === 'utilities'),
        other: serviceOptions.filter(s => s.category === 'other'),
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 2 de 5</span>
                        <span className="text-sm text-gray-500">Servicios Incluidos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Servicios Incluidos</h1>
                    <p className="text-gray-600">Selecciona los servicios que ofreces</p>
                </div>

                {/* Alimentación */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Alimentación</h3>
                    <div className="space-y-3">
                        {groupedServices.food.map(option => {
                            const service = services.find(s => s.serviceType === option.serviceType);
                            const isSelected = !!service;

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

                                    {isSelected && (
                                        <div className="mt-3 ml-8 space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={service.isIncluded}
                                                    onChange={(e) => updateService(option.serviceType, 'isIncluded', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">Incluido en el precio</span>
                                            </label>

                                            {!service.isIncluded && (
                                                <input
                                                    type="number"
                                                    placeholder="Costo adicional"
                                                    value={service.additionalCost || ''}
                                                    onChange={(e) => updateService(option.serviceType, 'additionalCost', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                />
                                            )}

                                            <input
                                                type="text"
                                                placeholder="Descripción (opcional)"
                                                value={service.description || ''}
                                                onChange={(e) => updateService(option.serviceType, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Servicios Básicos */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios Básicos</h3>
                    <div className="space-y-3">
                        {groupedServices.utilities.map(option => {
                            const service = services.find(s => s.serviceType === option.serviceType);
                            const isSelected = !!service;

                            return (
                                <div key={option.serviceType} className="border rounded-lg p-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleService(option.serviceType)}
                                            className="mr-3 w-5 h-5"
                                        />
                                        <div className="flex items-center gap-2">
                                            {option.icon}
                                            <span className="font-medium">{option.label}</span>
                                        </div>
                                    </label>

                                    {isSelected && (
                                        <div className="mt-3 ml-8">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={service.isIncluded}
                                                    onChange={(e) => updateService(option.serviceType, 'isIncluded', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">Incluido en el precio</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Servicios Adicionales */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios Adicionales</h3>
                    <div className="space-y-3">
                        {groupedServices.other.map(option => {
                            const service = services.find(s => s.serviceType === option.serviceType);
                            const isSelected = !!service;

                            return (
                                <div key={option.serviceType} className="border rounded-lg p-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleService(option.serviceType)}
                                            className="mr-3 w-5 h-5"
                                        />
                                        <div className="flex items-center gap-2">
                                            {option.icon}
                                            <span className="font-medium">{option.label}</span>
                                        </div>
                                    </label>

                                    {isSelected && (
                                        <div className="mt-3 ml-8 space-y-2">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={service.isIncluded}
                                                    onChange={(e) => updateService(option.serviceType, 'isIncluded', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">Incluido en el precio</span>
                                            </label>

                                            {!service.isIncluded && (
                                                <input
                                                    type="number"
                                                    placeholder="Costo adicional"
                                                    value={service.additionalCost || ''}
                                                    onChange={(e) => updateService(option.serviceType, 'additionalCost', parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Atrás
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Siguiente
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContainerServices;
