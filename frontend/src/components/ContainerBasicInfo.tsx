import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'react-router-dom';
import { Home, ArrowLeft, ArrowRight } from 'lucide-react';
import { containerBasicInfoSchema, type ContainerBasicInfoData } from '../lib/schemas/container.schema';
import { FormInput, FormTextarea } from './forms';


interface ContainerBasicInfoProps {
    onNext: (data: ContainerBasicInfoData) => void;
    onBack: () => void;
    initialData?: ContainerBasicInfoData;
    propertyType?: string;
}

const ContainerBasicInfo: React.FC<ContainerBasicInfoProps> = ({ onNext, onBack, initialData, propertyType: propPropertyType }) => {
    const location = useLocation();
    // Prioritize prop over location.state, with fallback to 'pension'
    const propertyType = propPropertyType || location.state?.propertyType || 'pension';

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ContainerBasicInfoData>({
        resolver: zodResolver(containerBasicInfoSchema) as any,
        mode: 'onBlur', // Validate on blur for better UX
        defaultValues: initialData || {
            title: '',
            description: '',
            typeId: propertyType === 'pension' ? 3 : propertyType === 'apartamento' ? 1 : 4,
            typeName: propertyType as 'pension' | 'apartamento' | 'aparta-estudio',
            rentalMode: 'by_unit',
            requiresDeposit: true,
            minimumContractMonths: 6,
        },
    });

    // Set typeId and typeName when propertyType changes
    useEffect(() => {
        const typeId = propertyType === 'pension' ? 3 : propertyType === 'apartamento' ? 1 : 4;
        const typeName = propertyType as 'pension' | 'apartamento' | 'aparta-estudio';
        setValue('typeId', typeId);
        setValue('typeName', typeName);
    }, [propertyType, setValue]);

    const onSubmit = (data: ContainerBasicInfoData) => {
        onNext(data);
    };

    // Watch values for character counters
    const title = watch('title');
    const description = watch('description');
    const rentalMode = watch('rentalMode');


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
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-6"
                >
                    {/* Hidden fields for typeId and typeName */}
                    <input type="hidden" {...register('typeId')} />
                    <input type="hidden" {...register('typeName')} />

                    {/* Title */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <FormInput
                            label="Título de la publicación"
                            {...register('title')}
                            error={errors.title}
                            helperText={`${title?.length || 0}/100 caracteres`}
                            placeholder="Ej: Pensión Universitaria Central - Cerca de Universidades"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <FormTextarea
                            label="Descripción"
                            {...register('description')}
                            error={errors.description}
                            helperText={`${description?.length || 0}/500 caracteres`}
                            placeholder="Describe tu propiedad, sus características principales y lo que la hace especial..."
                            rows={6}
                            required
                        />
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
                                    value="by_unit"
                                    {...register('rentalMode')}
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
                                    value="complete"
                                    {...register('rentalMode')}
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

                        {rentalMode === 'by_unit' && (
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
                                    {...register('requiresDeposit')}
                                    className="mr-3 w-5 h-5 text-blue-600"
                                />
                                <span className="text-gray-700">Requiere depósito</span>
                            </label>

                            <div>
                                <FormInput
                                    label="Duración mínima del contrato (meses)"
                                    type="number"
                                    {...register('minimumContractMonths')}
                                    error={errors.minimumContractMonths}
                                    placeholder="6"
                                    min="1"
                                    max="24"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Atrás
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Guardando...' : 'Siguiente'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ContainerBasicInfo;
