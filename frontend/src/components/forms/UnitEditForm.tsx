import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, X, Save } from 'lucide-react';
import type { PropertyUnit } from '../../types';
import { FormCurrencyInput } from './FormCurrencyInput';
import { useToast } from '../ToastProvider';
import ImageUploader from '../ImageUploader';

// We'll define a quick schema for the unit
const unitSchema = z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    monthlyRent: z.number().min(10000, 'El precio mensual no puede ser menor a $10.000'),
    deposit: z.number().optional().nullable(),
    area: z.number().optional().nullable(),
    roomType: z.enum(['individual', 'shared']),
    bedsInRoom: z.number().min(1, 'Debe haber al menos 1 cama').optional().nullable(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface UnitEditFormProps {
    unit?: Partial<PropertyUnit> | null;
    containerId: number;
    onSave: (data: UnitFormData, imageUrls: string[]) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
}

const UnitEditForm: React.FC<UnitEditFormProps> = ({
    unit,
    onSave,
    onCancel,
    isSaving = false
}) => {
    const toast = useToast();
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UnitFormData>({
        resolver: zodResolver(unitSchema),
        defaultValues: unit ? {
            title: unit.title,
            description: unit.description || '',
            monthlyRent: unit.monthlyRent,
            deposit: unit.deposit,
            area: unit.area,
            roomType: unit.roomType || 'individual',
            bedsInRoom: unit.bedsInRoom,
        } : {
            title: '',
            description: '',
            monthlyRent: 0,
            roomType: 'individual',
            bedsInRoom: 1,
        }
    });

    useEffect(() => {
        if (unit?.images) {
            setImageUrls(unit.images.map(img => typeof img === 'string' ? img : img.url));
        }
    }, [unit]);

    const handleFormSubmit = async (data: UnitFormData) => {
        if (imageUrls.length === 0) {
            toast.error('Debes agregar al menos una imagen de la habitación');
            return;
        }

        try {
            await onSave(data, imageUrls);
        } catch (error) {
            console.error('Error saving unit:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Home className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {unit ? 'Editar Habitación' : 'Nueva Habitación'}
                        </h2>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form id="unit-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                        {/* Imágenes */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Fotos de la Habitación <span className="text-red-500">*</span></h3>
                            <ImageUploader
                                images={imageUrls}
                                onChange={setImageUrls}
                                maxImages={6}
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título / Identificador <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Habitación 101, Cuarto Principal..."
                                    {...register('title')}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe las características principales de esta habitación..."
                                    {...register('description')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <FormCurrencyInput
                                    label="Precio Mensual"
                                    placeholder="Valor del arriendo mensual"
                                    required
                                    min={10000}
                                    {...register('monthlyRent', { valueAsNumber: true })}
                                    error={errors.monthlyRent}
                                />
                            </div>

                            <div>
                                <FormCurrencyInput
                                    label="Depósito (Opcional)"
                                    placeholder="Valor del depósito"
                                    {...register('deposit', { valueAsNumber: true })}
                                    error={errors.deposit as any}
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Área (m²)
                                </label>
                                <input
                                    type="number"
                                    {...register('area', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Habitación <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('roomType')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="individual">Individual</option>
                                    <option value="shared">Compartida</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Camas en Habitación <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    {...register('bedsInRoom', { valueAsNumber: true })}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.bedsInRoom ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.bedsInRoom && <p className="text-sm text-red-600 mt-1">{errors.bedsInRoom.message}</p>}
                            </div>
                        </div>

                        <div className="pt-6 border-t flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSaving}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="unit-form"
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Guardando...' : 'Guardar Habitación'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UnitEditForm;
