import { useState } from 'react';
import {
    X, Upload, Trash2, Wind, Snowflake, Wifi, Tv, Bed, Bath, Briefcase,
    Waves, Dumbbell, Lock, Sun, Sofa, ChevronsUp, Utensils, Droplet, Zap, Home
} from 'lucide-react';
import type { PropertyUnit, RoomType, Amenity } from '../types';
import { getAmenityIcon } from '../lib/amenityIcons';
import { useAppSelector } from '../store/hooks';
import { FormCurrencyInput, FormNumericInput } from './forms';
import ImageUploader from './ImageUploader';

interface UnitFormProps {
    onSave: (unit: Partial<PropertyUnit>) => void;
    onClose: () => void;
    initialData?: Partial<PropertyUnit>;
    unitNumber: number;
}

const UnitForm: React.FC<UnitFormProps> = ({ onSave, onClose, initialData, unitNumber }) => {
    const { items: amenities } = useAppSelector((state) => state.amenities);

    const [formData, setFormData] = useState<Partial<PropertyUnit>>(initialData || {
        title: `Habitación ${unitNumber}`,
        description: '',
        monthlyRent: undefined,
        deposit: undefined,
        area: undefined,
        roomType: 'individual',
        bedsInRoom: 1,
        amenities: [],
        images: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof PropertyUnit, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleAmenityToggle = (amenity: Amenity) => {
        const amenityIds = formData.amenities || [];
        // Check if amenity ID is already in the array
        const isSelected = amenityIds.some(a =>
            typeof a === 'object' ? a.id === amenity.id : Number(a) === amenity.id
        );

        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                // Remove by ID
                amenities: amenityIds.filter(a =>
                    typeof a === 'object' ? a.id !== amenity.id : Number(a) !== amenity.id
                )
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                // Store only the ID, not the full object
                amenities: [...amenityIds, amenity.id]
            }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.length < 5) {
            newErrors.title = 'El título debe tener al menos 5 caracteres';
        }

        // Convertir a número para validación consistente
        const monthlyRent = typeof formData.monthlyRent === 'string'
            ? parseInt(formData.monthlyRent)
            : formData.monthlyRent;

        if (!monthlyRent || monthlyRent <= 0) {
            newErrors.monthlyRent = 'El precio mensual es obligatorio y debe ser mayor a 0';
        } else if (monthlyRent < 100000) {
            newErrors.monthlyRent = 'El precio mínimo es $100,000 COP';
        }

        // Validar depósito
        const deposit = typeof formData.deposit === 'string'
            ? parseInt(formData.deposit)
            : formData.deposit;

        if (deposit && deposit < 0) {
            newErrors.deposit = 'El depósito no puede ser negativo';
        }

        // Validar área
        const area = typeof formData.area === 'string'
            ? parseInt(formData.area)
            : formData.area;

        if (area && area < 0) {
            newErrors.area = 'El área no puede ser negativa';
        }

        if (formData.roomType === 'shared' && (!formData.bedsInRoom || formData.bedsInRoom < 2)) {
            newErrors.bedsInRoom = 'Una habitación compartida debe tener al menos 2 camas';
        }

        // Validate images
        const imageCount = (formData.images || []).length;
        if (imageCount < 1) {
            newErrors.images = 'Debes subir al menos 1 imagen de la habitación';
        } else if (imageCount > 10) {
            newErrors.images = 'No puedes subir más de 10 imágenes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        } else {
            // Scroll to top to show errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData?.id ? 'Editar Habitación' : `Agregar Habitación ${unitNumber}`}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Ej: Habitación 1 - Con baño privado"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="Describe las características especiales de esta habitación..."
                        />
                    </div>

                    {/* Images - Moved up for better visibility */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imágenes * (mín. 1, máx. 10)
                        </label>
                        <div className="space-y-4">
                            <ImageUploader
                                images={formData.images || []}
                                onChange={(newImages) => {
                                    setFormData(prev => ({ ...prev, images: newImages }));
                                    if (errors.images) {
                                        setErrors(prev => ({ ...prev, images: '' }));
                                    }
                                }}
                                maxImages={10}
                            />
                        </div>
                        {errors.images && (
                            <p className="mt-2 text-sm text-red-600 font-medium bg-red-50 p-2 rounded">{errors.images}</p>
                        )}
                    </div>

                    {/* Price and Deposit */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormCurrencyInput
                            label="Precio Mensual (COP)"
                            value={formData.monthlyRent || ''}
                            onValueChange={(value) => {
                                handleChange('monthlyRent', value);
                            }}
                            error={errors.monthlyRent ? { message: errors.monthlyRent } as any : undefined}
                            required
                        />
                        <FormCurrencyInput
                            label="Depósito (COP)"
                            value={formData.deposit || ''}
                            onValueChange={(value) => {
                                handleChange('deposit', value);
                            }}
                            error={errors.deposit ? { message: errors.deposit } as any : undefined}
                        />
                    </div>

                    {/* Area */}
                    <FormNumericInput
                        label="Área (m²) - Opcional"
                        value={formData.area?.toString() || ''}
                        onChange={(e) => {
                            const value = parseInt(e.target.value) || undefined;
                            handleChange('area', value);
                        }}
                        error={errors.area ? { message: errors.area } as any : undefined}
                        placeholder="Ej: 25"
                    />

                    {/* Room Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Habitación *
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={formData.roomType === 'individual'}
                                    onChange={() => {
                                        handleChange('roomType', 'individual' as RoomType);
                                        handleChange('bedsInRoom', 1);
                                    }}
                                    className="mr-2"
                                />
                                <span>Individual (1 persona)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={formData.roomType === 'shared'}
                                    onChange={() => handleChange('roomType', 'shared' as RoomType)}
                                    className="mr-2"
                                />
                                <span>Compartida (2+ personas)</span>
                            </label>
                        </div>
                    </div>

                    {/* Beds in Room */}
                    {formData.roomType === 'shared' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Camas *
                            </label>
                            <input
                                type="number"
                                min="2"
                                value={formData.bedsInRoom}
                                onChange={(e) => handleChange('bedsInRoom', parseInt(e.target.value) || 2)}
                                className={`w-full px-4 py-2 border rounded-lg ${errors.bedsInRoom ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.bedsInRoom && <p className="mt-1 text-sm text-red-600">{errors.bedsInRoom}</p>}
                        </div>
                    )}

                    {/* Amenities */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amenidades
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {amenities
                                .filter(a => a.category === 'habitacion' || a.category === 'general')
                                .map(amenity => {
                                    const isSelected = (formData.amenities || []).some(a =>
                                        typeof a === 'object' ? a.id === amenity.id : Number(a) === amenity.id
                                    );

                                    return (
                                        <label
                                            key={amenity.id}
                                            className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all h-24 text-center gap-2 ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleAmenityToggle(amenity)}
                                                className="sr-only" // Hide default checkbox
                                            />
                                            <div className={isSelected ? 'text-emerald-600' : 'text-gray-500'}>
                                                {getAmenityIcon(amenity.name)}
                                            </div>
                                            <span className="text-xs font-medium">{amenity.name}</span>
                                        </label>
                                    );
                                })}
                        </div>
                    </div>


                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {initialData?.id ? 'Guardar Cambios' : 'Agregar Habitación'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnitForm;
