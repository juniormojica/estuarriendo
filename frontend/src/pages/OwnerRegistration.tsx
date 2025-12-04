import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRegistrationPayload, User } from '../types';
import { CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

const OwnerRegistration = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<Partial<UserRegistrationPayload>>({
        userType: 'owner',
        role: 'individual',
        idType: 'CC',
        paymentPreference: 'PSE',
        password: '',
        confirmPassword: '',
        bankDetails: {
            bankName: '',
            accountType: 'savings',
            accountNumber: '',
            holderName: ''
        },
        billingDetails: {
            billingAddress: '',
            taxId: '',
            city: ''
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
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
            // Save basic profile immediately
            const newUser: User = {
                id: crypto.randomUUID(),
                name: formData.name!,
                email: formData.email!,
                phone: formData.phone!,
                whatsapp: formData.phone!,
                userType: 'owner',
                idType: formData.idType,
                idNumber: formData.idNumber,
                role: formData.role,
                isActive: true,
                joinedAt: new Date().toISOString(),
                verificationStatus: 'not_submitted',
                propertiesCount: 0,
                approvedCount: 0,
                pendingCount: 0,
                rejectedCount: 0,
                isVerified: false,
                paymentPreference: formData.paymentPreference,
                bankDetails: formData.bankDetails,
                billingDetails: formData.billingDetails
            };

            // Save to localStorage for mock auth
            localStorage.setItem('estuarriendo_user', JSON.stringify(newUser));

            // Redirect to property submission
            navigate('/publicar');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Crea tu cuenta de Propietario
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Empieza a publicar tus inmuebles gratis.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Ingresa aquí
                        </Link>
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-8">
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
                                Registrarse
                                <CheckCircle className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OwnerRegistration;
