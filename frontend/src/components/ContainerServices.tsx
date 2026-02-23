import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Coffee, Wifi, Zap, Droplet, Wind } from 'lucide-react';
import { containerServicesSchema, type ContainerServicesData } from '../lib/schemas/container.schema';
import { FormCurrencyInput } from './forms';
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
    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ContainerServicesData>({
        resolver: zodResolver(containerServicesSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            services: initialData || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'services',
    });

    const serviceOptions: ServiceOption[] = [
        { serviceType: 'breakfast', label: 'Desayuno', icon: <Coffee className="w-5 h-5" />, category: 'food' },
        { serviceType: 'lunch', label: 'Almuerzo', icon: <Coffee className="w-5 h-5" />, category: 'food' },
        { serviceType: 'dinner', label: 'Cena', icon: <Coffee className="w-5 h-5" />, category: 'food' },
        { serviceType: 'wifi', label: 'WiFi', icon: <Wifi className="w-5 h-5" />, category: 'utilities' },
        { serviceType: 'utilities', label: 'Servicios Públicos', icon: <Zap className="w-5 h-5" />, category: 'utilities' },
        { serviceType: 'laundry', label: 'Lavandería', icon: <Droplet className="w-5 h-5" />, category: 'other' },
        { serviceType: 'housekeeping', label: 'Limpieza', icon: <Wind className="w-5 h-5" />, category: 'other' },
    ];

    const services = watch('services');

    const toggleService = (serviceType: PropertyService['serviceType']) => {
        const existingIndex = fields.findIndex(field => field.serviceType === serviceType);
        if (existingIndex >= 0) {
            remove(existingIndex);
        } else {
            append({ serviceType, isIncluded: true, additionalCost: 0 });
        }
    };

    const isServiceSelected = (serviceType: PropertyService['serviceType']) => {
        return fields.some(field => field.serviceType === serviceType);
    };

    const getServiceIndex = (serviceType: PropertyService['serviceType']) => {
        return fields.findIndex(field => field.serviceType === serviceType);
    };

    const onSubmit = (data: ContainerServicesData) => {
        onNext(data.services);
    };

    const groupedServices = {
        food: serviceOptions.filter(s => s.category === 'food'),
        utilities: serviceOptions.filter(s => s.category === 'utilities'),
        other: serviceOptions.filter(s => s.category === 'other'),
    };

    const renderServiceCard = (option: ServiceOption, index: number) => {
        const isSelected = isServiceSelected(option.serviceType);
        const serviceIndex = getServiceIndex(option.serviceType);
        const service = serviceIndex >= 0 ? services[serviceIndex] : null;

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
                        {/* Hidden field for serviceType */}
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

                        {(option.category === 'food' || option.category === 'other') && (
                            <input
                                type="text"
                                placeholder="Descripción (opcional)"
                                {...register(`services.${serviceIndex}.description`)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Servicios Incluidos</h1>
                <p className="text-gray-600 mb-6">Selecciona los servicios que ofreces</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alimentación</h3>
                        <div className="space-y-3">
                            {groupedServices.food.map((option, idx) => renderServiceCard(option, idx))}
                        </div>
                    </div>

                    {/* Servicios Básicos */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios Básicos</h3>
                        <div className="space-y-3">
                            {groupedServices.utilities.map((option, idx) => renderServiceCard(option, idx))}
                        </div>
                    </div>

                    {/* Servicios Adicionales */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios Adicionales</h3>
                        <div className="space-y-3">
                            {groupedServices.other.map((option, idx) => renderServiceCard(option, idx))}
                        </div>
                    </div>

                    {/* Error message */}
                    {errors.services && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600" role="alert">
                                {errors.services.message || 'Debes seleccionar al menos un servicio'}
                            </p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Atrás
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Guardando...' : 'Siguiente'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContainerServices;
