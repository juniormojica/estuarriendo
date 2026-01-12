import { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import type { PropertyUnit, RoomType, Amenity } from '../types';
import { useAppSelector } from '../store/hooks';

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
        monthlyRent: 0,
        deposit: 0,
        area: 0,
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
        const isSelected = amenityIds.some(a => typeof a === 'object' ? a.id === amenity.id : a === amenity.id.toString());

        if (isSelected) {
            setFormData(prev => ({
                ...prev,
                amenities: amenityIds.filter(a => typeof a === 'object' ? a.id !== amenity.id : a !== amenity.id.toString())
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                amenities: [...amenityIds, amenity]
            }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), reader.result as string]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.length < 5) {
            newErrors.title = 'El título debe tener al menos 5 caracteres';
        }

        if (!formData.monthlyRent || formData.monthlyRent <= 0) {
            newErrors.monthlyRent = 'El precio mensual es obligatorio';
        }

        if (formData.roomType === 'shared' && (!formData.bedsInRoom || formData.bedsInRoom < 2)) {
            newErrors.bedsInRoom = 'Una habitación compartida debe tener al menos 2 camas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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

                    {/* Price and Deposit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Precio Mensual * (COP)
                            </label>
                            <input
                                type="number"
                                value={formData.monthlyRent}
                                onChange={(e) => handleChange('monthlyRent', parseInt(e.target.value) || 0)}
                                className={`w-full px-4 py-2 border rounded-lg ${errors.monthlyRent ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="800000"
                            />
                            {errors.monthlyRent && <p className="mt-1 text-sm text-red-600">{errors.monthlyRent}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Depósito (COP)
                            </label>
                            <input
                                type="number"
                                value={formData.deposit}
                                onChange={(e) => handleChange('deposit', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="800000"
                            />
                        </div>
                    </div>

                    {/* Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Área (m²)
                        </label>
                        <input
                            type="number"
                            value={formData.area}
                            onChange={(e) => handleChange('area', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="12"
                        />
                    </div>

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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {amenities.filter(a => ['bed', 'closet', 'desk', 'bathroom', 'balcony', 'ac'].includes(a.slug || '')).map(amenity => {
                                const isSelected = (formData.amenities || []).some(a =>
                                    typeof a === 'object' ? a.id === amenity.id : a === amenity.id.toString()
                                );

                                return (
                                    <label
                                        key={amenity.id}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleAmenityToggle(amenity)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">{amenity.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imágenes (máx. 5)
                        </label>
                        <div className="space-y-4">
                            {(formData.images || []).length < 5 && (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">Subir imagen</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}

                            {(formData.images || []).length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                    {(formData.images || []).map((img, index) => (
                                        <div key={index} className="relative group">
                                            <img src={typeof img === 'string' ? img : ''} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {initialData?.id ? 'Guardar Cambios' : 'Agregar Habitación'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnitForm;
