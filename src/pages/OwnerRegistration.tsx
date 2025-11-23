import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, IdType, OwnerRole, PaymentMethod, BankDetails, BillingDetails } from '../types';
import { Building2, User as UserIcon, ShieldCheck, CreditCard, ArrowRight, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const OwnerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<Partial<User>>({
        role: 'individual',
        idType: 'CC',
        paymentPreference: 'PSE',
        bankDetails: {
            bankName: '',
            accountType: 'savings',
            accountNumber: '',
            accountHolder: ''
        },
        billingDetails: {
            address: '',
            rut: ''
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleNestedChange = (parent: 'bankDetails' | 'billingDetails', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent] as any, [field]: value }
        }));
    };

    const validatePhase1 = () => {
        if (!formData.name || !formData.idNumber || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError('Por favor completa todos los campos obligatorios.');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return false;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }

        return true;
    };

    const handlePhase1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePhase1()) {
            console.log('Phase 1 data:', formData);
            setStep(2);
        }
    };

    const handlePhase2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Save full profile
        const newUser: User = {
            ...formData as User,
            id: crypto.randomUUID(),
            joinedAt: new Date().toISOString(),
            propertiesCount: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0,
            isVerified: false // Pending verification
        };

        // Save to localStorage for mock auth
        localStorage.setItem('estuarriendo_user', JSON.stringify(newUser));

        // Redirect to dashboard or property submission
        navigate('/publicar');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {step === 1 ? 'Crea tu cuenta de Propietario' : 'Completa tu Perfil de Negocio'}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {step === 1
                            ? 'Empieza a publicar tus inmuebles gratis.'
                            : 'Habilita funciones premium y genera más confianza.'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex justify-center items-center space-x-4">
                    <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            1
                        </div>
                        <span className="ml-2 font-medium">Datos Básicos</span>
                    </div>
                    <div className="w-16 h-0.5 bg-gray-300" />
                    <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                            2
                        </div>
                        <span className="ml-2 font-medium">Perfil de Negocio</span>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-8">
                    {step === 1 ? (
                        <form onSubmit={handlePhase1Submit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo de Perfil</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    >
                                        <option value="individual">Propietario Individual</option>
                                        <option value="agency">Inmobiliaria / Administrador</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre Completo / Razón Social</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                                    <select
                                        name="idType"
                                        value={formData.idType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    >
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="NIT">NIT</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Número de Documento</label>
                                    <input
                                        type="text"
                                        name="idNumber"
                                        required
                                        value={formData.idNumber || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password || ''}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword || ''}
                                            onChange={handleInputChange}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Continuar
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePhase2Submit} className="space-y-8">
                            <div className="bg-blue-50 p-4 rounded-md mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <ShieldCheck className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Beneficios del Perfil de Negocio</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <ul className="list-disc pl-5 space-y-1">
                                                <li>Sello de Confianza en tus publicaciones</li>
                                                <li>Acceso a publicaciones destacadas</li>
                                                <li>Gestión de comisiones automatizada</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información Financiera</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Preferencia de Pago</label>
                                        <select
                                            name="paymentPreference"
                                            value={formData.paymentPreference}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        >
                                            <option value="PSE">PSE</option>
                                            <option value="CreditCard">Tarjeta de Crédito/Débito</option>
                                            <option value="Nequi">Nequi</option>
                                            <option value="Daviplata">Daviplata</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Banco</label>
                                        <input
                                            type="text"
                                            value={formData.bankDetails?.bankName}
                                            onChange={(e) => handleNestedChange('bankDetails', 'bankName', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tipo de Cuenta</label>
                                        <select
                                            value={formData.bankDetails?.accountType}
                                            onChange={(e) => handleNestedChange('bankDetails', 'accountType', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        >
                                            <option value="savings">Ahorros</option>
                                            <option value="checking">Corriente</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Número de Cuenta</label>
                                        <input
                                            type="text"
                                            value={formData.bankDetails?.accountNumber}
                                            onChange={(e) => handleNestedChange('bankDetails', 'accountNumber', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Titular de la Cuenta</label>
                                        <input
                                            type="text"
                                            value={formData.bankDetails?.accountHolder}
                                            onChange={(e) => handleNestedChange('bankDetails', 'accountHolder', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Verificación y Confianza</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="availableForVisit"
                                                name="availableForVisit"
                                                type="checkbox"
                                                checked={formData.availableForVisit || false}
                                                onChange={(e) => setFormData(prev => ({ ...prev, availableForVisit: e.target.checked }))}
                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="availableForVisit" className="font-medium text-gray-700">Disponible para Visita de Verificación</label>
                                            <p className="text-gray-500">Permitir que el equipo de EstuArriendo visite los inmuebles para otorgar el sello de "Verificado".</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Atrás
                                </button>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={handlePhase2Submit} // Skip for now/Save as basic
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Omitir por ahora
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Finalizar Registro
                                        <CheckCircle className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerRegistration;
