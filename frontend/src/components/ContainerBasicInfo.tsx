import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, ArrowLeft, ArrowRight } from 'lucide-react';
import type { RentalMode } from '../types';

interface ContainerBasicInfoProps {
    onNext: (data: ContainerBasicInfoData) => void;
    onBack: () => void;
    initialData?: ContainerBasicInfoData;
    propertyType?: string;
}

export interface ContainerBasicInfoData {
    title: string;
    description: string;
    typeId: number;
    typeName: string;
    rentalMode: RentalMode;
    requiresDeposit: boolean;
    minimumContractMonths?: number;
}

const ContainerBasicInfo: React.FC<ContainerBasicInfoProps> = ({ onNext, onBack, initialData, propertyType: propPropertyType }) => {
    const location = useLocation();
    // Prioritize prop over location.state, with fallback to 'pension'
    const propertyType = propPropertyType || location.state?.propertyType || 'pension';

    const [formData, setFormData] = useState<ContainerBasicInfoData>(
        initialData || {
            title: '',
            description: '',
            typeId: propertyType === 'pension' ? 3 : propertyType === 'apartamento' ? 1 : 4,
            typeName: propertyType,
            rentalMode: 'by_unit',
            requiresDeposit: true,
            minimumContractMonths: 6,
        }
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: keyof ContainerBasicInfoData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.length < 10) {
            newErrors.title = 'El título debe tener al menos 10 caracteres';
        }

        if (!formData.description || formData.description.length < 50) {
            newErrors.description = 'La descripción debe tener al menos 50 caracteres';
        }

        if (formData.minimumContractMonths && formData.minimumContractMonths < 1) {
            newErrors.minimumContractMonths = 'Debe ser al menos 1 mes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onNext(formData);
        }
    };

    const getPropertyTypeLabel = () => {
        switch (propertyType) {
            case 'pension':
                return 'Pensión / Residencia';
            case 'apartamento':
                return 'Apartamento';
            case 'aparta-estudio':
                return 'Aparta-estudio';
            default:
                return 'Propiedad';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 1 de 5</span>
                        <span className="text-sm text-gray-500">Información General</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Home className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Información General
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Cuéntanos sobre tu {getPropertyTypeLabel().toLowerCase()}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título de la publicación *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Ej: Pensión Universitaria Central - Cerca de Universidades"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            {(formData.title || '').length}/100 caracteres
                        </p>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe tu propiedad, sus características principales y lo que la hace especial..."
                            rows={6}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            {(formData.description || '').length}/500 caracteres
                        </p>
                    </div>

                    {/* Rental Mode */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            ¿Cómo se arrienda?
                        </h3>

                        <div className="space-y-3">
                            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                <input
                                    type="radio"
                                    name="rentalMode"
                                    value="by_unit"
                                    checked={formData.rentalMode === 'by_unit'}
                                    onChange={(e) => handleChange('rentalMode', e.target.value as RentalMode)}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        Por habitaciones (estudiantes)
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Cada habitación se arrienda independientemente a diferentes personas
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                <input
                                    type="radio"
                                    name="rentalMode"
                                    value="complete"
                                    checked={formData.rentalMode === 'complete'}
                                    onChange={(e) => handleChange('rentalMode', e.target.value as RentalMode)}
                                    className="mt-1 mr-3"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">
                                        Completo (grupo/familia)
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Se arrienda toda la propiedad a un solo grupo
                                    </div>
                                </div>
                            </label>
                        </div>

                        {formData.rentalMode === 'by_unit' && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    ℹ️ Al arrendar por habitaciones, deberás definir servicios, reglas y áreas comunes en los siguientes pasos.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contract Terms */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Términos del Contrato
                        </h3>

                        <div className="space-y-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.requiresDeposit}
                                    onChange={(e) => handleChange('requiresDeposit', e.target.checked)}
                                    className="mr-3 w-5 h-5 text-blue-600"
                                />
                                <span className="text-gray-700">Requiere depósito</span>
                            </label>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duración mínima del contrato (meses)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="24"
                                    value={formData.minimumContractMonths || ''}
                                    onChange={(e) => handleChange('minimumContractMonths', parseInt(e.target.value) || undefined)}
                                    placeholder="6"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.minimumContractMonths && (
                                    <p className="mt-1 text-sm text-red-600">{errors.minimumContractMonths}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Atrás
                        </button>

                        <button
                            type="submit"
                            className="flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Siguiente
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ContainerBasicInfo;
