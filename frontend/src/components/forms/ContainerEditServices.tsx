import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coffee, Wifi, Zap, Droplet, Wind, Save } from 'lucide-react';
import { containerServicesSchema, type ContainerServicesData } from '../../lib/schemas/container.schema';
import { FormCurrencyInput } from './FormCurrencyInput';
import type { PropertyService, PropertyContainer } from '../../types';
import containerService from '../../services/containerService';
import { useToast } from '../ToastProvider';

interface ContainerEditServicesProps {
    container: PropertyContainer;
    onUpdate?: (updatedContainer: PropertyContainer) => void;
}

interface ServiceOption {
    serviceType: PropertyService['serviceType'];
    label: string;
    icon: React.ReactNode;
    category: 'food' | 'utilities' | 'other';
}

const ContainerEditServices: React.FC<ContainerEditServicesProps> = ({ container, onUpdate }) => {
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ContainerServicesData>({
        resolver: zodResolver(containerServicesSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            services: container.services || [],
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

    const onSubmit = async (data: ContainerServicesData) => {
        if (!container.id) return;

        setIsSaving(true);
        try {
            const updated = await containerService.updateContainer(container.id, {
                services: data.services
            });
            toast.success('Servicios actualizados correctamente');
            if (onUpdate) {
                onUpdate(updated);
            }
        } catch (error: any) {
            console.error('Error updating services:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar los servicios');
        } finally {
            setIsSaving(false);
        }
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alimentación</h3>
                <div className="space-y-3">
                    {groupedServices.food.map((option, idx) => renderServiceCard(option, idx))}
                </div>
            </div>

            {/* Servicios Básicos */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios Básicos</h3>
                <div className="space-y-3">
                    {groupedServices.utilities.map((option, idx) => renderServiceCard(option, idx))}
                </div>
            </div>

            {/* Servicios Adicionales */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
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

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Servicios'}
                </button>
            </div>
        </form>
    );
};

export default ContainerEditServices;
