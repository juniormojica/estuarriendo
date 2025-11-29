import React, { useState } from 'react';
import { Calendar, DollarSign, Home, MapPin, Clock, FileText, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { mockAmenities } from '../data/mockData';
import { iconMap } from '../lib/icons';

interface FormData {
    city: string;
    isNearUniversity: boolean;
    universityTarget: string;
    budgetMax: string;
    propertyTypeDesired: '' | 'pension' | 'habitacion' | 'apartamento' | 'aparta-estudio';
    requiredAmenities: string[];
    dealBreakers: string[];
    moveInDate: string;
    contractDuration: string;
    additionalNotes: string;
}

interface StudentRequestFormStepsProps {
    initialData?: Partial<FormData>;
    onSubmit: (data: FormData) => void;
    onCancel?: () => void;
    submitting?: boolean;
    isEditing?: boolean;
}

const dealBreakerOptions = [
    { id: 'no-pets', name: 'Alérgico a mascotas', icon: '🐕' },
    { id: 'no-smoking', name: 'No fumadores', icon: '🚭' },
    { id: 'no-noise', name: 'Ambiente tranquilo', icon: '🔇' },
    { id: 'no-parties', name: 'Sin fiestas', icon: '🎉' },
    { id: 'vegetarian-friendly', name: 'Preferencia vegetariana/vegana', icon: '🥗' },
    { id: 'lgbtq-friendly', name: 'Ambiente LGBTQ+ friendly', icon: '🏳️‍🌈' },
    { id: 'female-only', name: 'Solo mujeres', icon: '👩' },
    { id: 'male-only', name: 'Solo hombres', icon: '👨' },
];

const StudentRequestFormSteps: React.FC<StudentRequestFormStepsProps> = ({
    initialData,
    onSubmit,
    onCancel,
    submitting = false,
    isEditing = false
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        city: initialData?.city || '',
        isNearUniversity: !!initialData?.universityTarget,
        universityTarget: initialData?.universityTarget || '',
        budgetMax: initialData?.budgetMax || '',
        propertyTypeDesired: initialData?.propertyTypeDesired || '',
        requiredAmenities: initialData?.requiredAmenities || [],
        dealBreakers: initialData?.dealBreakers || [],
        moveInDate: initialData?.moveInDate || '',
        contractDuration: initialData?.contractDuration || '',
        additionalNotes: initialData?.additionalNotes || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.city.trim()) {
                newErrors.city = 'La ciudad es requerida';
            }
            if (formData.isNearUniversity && !formData.universityTarget.trim()) {
                newErrors.universityTarget = 'Este campo es requerido';
            }
            if (!formData.budgetMax || parseFloat(formData.budgetMax) <= 0) {
                newErrors.budgetMax = 'Ingresa un presupuesto válido';
            }
            if (!formData.propertyTypeDesired) {
                newErrors.propertyTypeDesired = 'Selecciona un tipo de inmueble';
            }
        }

        if (step === 2) {
            if (!formData.moveInDate) {
                newErrors.moveInDate = 'Este campo es requerido';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const handlePrevious = (e: React.MouseEvent) => {
        e.preventDefault();
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < 4) {
            handleNext(e as unknown as React.MouseEvent);
        } else {
            if (validateStep(currentStep)) {
                onSubmit(formData);
            }
        }
    };

    const toggleAmenity = (amenityId: string) => {
        setFormData(prev => ({
            ...prev,
            requiredAmenities: prev.requiredAmenities.includes(amenityId)
                ? prev.requiredAmenities.filter(id => id !== amenityId)
                : [...prev.requiredAmenities, amenityId]
        }));
    };

    const toggleDealBreaker = (dealBreakerId: string) => {
        setFormData(prev => ({
            ...prev,
            dealBreakers: prev.dealBreakers.includes(dealBreakerId)
                ? prev.dealBreakers.filter(id => id !== dealBreakerId)
                : [...prev.dealBreakers, dealBreakerId]
        }));
    };

    const renderProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map(step => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep >= step
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step}
                            </div>
                            <span className="text-xs mt-1 text-gray-600 hidden sm:block">
                                {step === 1 && 'Básico'}
                                {step === 2 && 'Fechas'}
                                {step === 3 && 'Comodidades'}
                                {step === 4 && 'Preferencias'}
                            </span>
                        </div>
                        {step < 4 && (
                            <div className={`flex-1 h-1 mx-2 transition-colors ${currentStep > step ? 'bg-emerald-600' : 'bg-gray-200'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
                Paso {currentStep} de 4
            </p>
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Información Básica</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Ciudad de Interés *
                </label>
                <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Ej: Valledupar"
                />
                {errors.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.city}
                    </p>
                )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    ¿Buscas cerca de alguna universidad o corporación?
                </label>
                <div className="flex gap-4 mb-4">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isNearUniversity: true })}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${formData.isNearUniversity
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Sí
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isNearUniversity: false, universityTarget: '' })}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${!formData.isNearUniversity
                            ? 'bg-gray-600 text-white border-gray-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        No
                    </button>
                </div>

                {formData.isNearUniversity && (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Universidad o Corporación *
                        </label>
                        <input
                            type="text"
                            value={formData.universityTarget}
                            onChange={(e) => setFormData({ ...formData, universityTarget: e.target.value })}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.universityTarget ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Ej: Universidad Popular del Cesar"
                        />
                        {errors.universityTarget && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.universityTarget}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Presupuesto Máximo (COP/mes) *
                </label>
                <input
                    type="number"
                    min="0"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.budgetMax ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="500000"
                />
                {errors.budgetMax && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.budgetMax}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Home className="w-4 h-4 inline mr-2" />
                    Tipo de Inmueble *
                </label>
                <select
                    value={formData.propertyTypeDesired}
                    onChange={(e) => setFormData({ ...formData, propertyTypeDesired: e.target.value as any })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.propertyTypeDesired ? 'border-red-500' : 'border-gray-300'
                        }`}
                >
                    <option value="">Seleccionar...</option>
                    <option value="habitacion">Habitación</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="aparta-estudio">Aparta-estudio</option>
                    <option value="pension">Pensión</option>
                </select>
                {errors.propertyTypeDesired && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.propertyTypeDesired}
                    </p>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Fechas y Duración</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha de Mudanza *
                </label>
                <input
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.moveInDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors.moveInDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.moveInDate}
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Duración del Contrato (meses)
                </label>
                <input
                    type="number"
                    min="1"
                    value={formData.contractDuration}
                    onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="6"
                />
                <p className="mt-1 text-sm text-gray-500">Opcional: Indica cuántos meses planeas quedarte</p>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comodidades Requeridas</h2>
            <p className="text-gray-600 mb-4">Selecciona las comodidades que son importantes para ti</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mockAmenities.map(amenity => {
                    const IconComponent = iconMap[amenity.icon] || iconMap.default;
                    return (
                        <button
                            key={amenity.id}
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${formData.requiredAmenities.includes(amenity.id)
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                                }`}
                        >
                            <span className="text-3xl mb-2 block flex justify-center">
                                <IconComponent size={32} />
                            </span>
                            <span className="text-sm font-medium block">{amenity.name}</span>
                        </button>
                    );
                })}
            </div>

            {formData.requiredAmenities.length === 0 && (
                <p className="text-sm text-gray-500 text-center">
                    No has seleccionado ninguna comodidad (opcional)
                </p>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Preferencias Personales</h2>
            <p className="text-gray-600 mb-4">Indica tus preferencias o condiciones importantes</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dealBreakerOptions.map(option => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => toggleDealBreaker(option.id)}
                        className={`p-4 rounded-lg border-2 transition-all flex items-center ${formData.dealBreakers.includes(option.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                            }`}
                    >
                        <span className="text-2xl mr-3">{option.icon}</span>
                        <span className="text-sm font-medium">{option.name}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Notas Adicionales
                </label>
                <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ej: Prefiero zonas tranquilas, necesito parqueadero, busco compañeros de apartamento, etc."
                />
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {renderProgressBar()}

            <div className="min-h-[400px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors flex items-center justify-center"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Anterior
                    </button>
                )}

                {onCancel && isEditing && currentStep === 1 && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                )}

                {currentStep < 4 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center"
                    >
                        Siguiente
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Guardando...' : isEditing ? 'Actualizar Solicitud' : 'Publicar Solicitud'}
                    </button>
                )}
            </div>
        </form>
    );
};

export default StudentRequestFormSteps;
