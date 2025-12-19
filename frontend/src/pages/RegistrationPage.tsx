import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRegistrationPayload } from '../types';
import { CheckCircle, Eye, EyeOff, AlertCircle, Building2, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError } from '../store/slices/authSlice';

const RegistrationPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, loading, error } = useAppSelector((state) => state.auth);

    const [userType, setUserType] = useState<'owner' | 'tenant'>('owner');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState<Partial<UserRegistrationPayload>>({
        userType: 'owner',
        role: 'individual', // Default for owner, will be overwritten or ignored for tenant
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

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Redirect after successful registration
    useEffect(() => {
        if (user) {
            if (user.userType === 'owner') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): string | null => {
        // Common validation
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            return 'Por favor completa todos los campos obligatorios.';
        }

        // Owner specific validation
        if (userType === 'owner') {
            if (!formData.idNumber) {
                return 'Por favor ingresa tu número de documento.';
            }
        }

        if (formData.password !== formData.confirmPassword) {
            return 'Las contraseñas no coinciden.';
        }

        if (formData.password.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres.';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            // Validation errors will be shown via Redux error state if needed
            // For now, just return without submitting
            return;
        }

        // Prepare registration data for backend
        const registrationData = {
            name: formData.name!,
            email: formData.email!,
            password: formData.password!,
            phone: formData.phone!,
            userType: userType,
            whatsapp: formData.phone // Use phone as whatsapp by default
        };

        // Register user via Redux
        await dispatch(registerUser(registrationData));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {userType === 'owner' ? 'Registra tu Inmueble' : 'Encuentra tu próximo hogar'}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        {userType === 'owner'
                            ? 'Publica tus propiedades y llega a miles de estudiantes.'
                            : 'Regístrate para guardar favoritos y contactar propietarios.'}
                    </p>
                </div>

                {/* User Type Toggle - Responsive */}
                <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
                        <button
                            type="button"
                            onClick={() => setUserType('owner')}
                            className={`flex items-center min-h-[44px] px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors active:scale-95 ${userType === 'owner'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 active:bg-gray-100'
                                }`}
                        >
                            <Building2 className="w-4 h-4 mr-1.5 sm:mr-2" />
                            <span className="hidden xs:inline">Soy </span>Propietario
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('tenant')}
                            className={`flex items-center min-h-[44px] px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors active:scale-95 ${userType === 'tenant'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 active:bg-gray-100'
                                }`}
                        >
                            <UserIcon className="w-4 h-4 mr-1.5 sm:mr-2" />
                            Busco Inmueble
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userType === 'owner' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo de Perfil</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border text-sm sm:text-base"
                                    >
                                        <option value="individual">Propietario Individual</option>
                                        <option value="agency">Inmobiliaria / Administrador</option>
                                    </select>
                                </div>
                            )}

                            <div className={userType === 'tenant' ? "md:col-span-2" : ""}>
                                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border text-sm sm:text-base"
                                />
                            </div>

                            {userType === 'owner' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                                        <select
                                            name="idType"
                                            value={formData.idType}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border text-sm sm:text-base"
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
                                            className="mt-1 block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border text-sm sm:text-base"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border text-sm sm:text-base"
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
                                    className="mt-1 block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border text-sm sm:text-base"
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
                                        className="block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border pr-10 text-sm sm:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px] text-gray-400 hover:text-gray-600 active:text-gray-700"
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
                                        className="block w-full min-h-[44px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2.5 border pr-10 text-sm sm:text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px] text-gray-400 hover:text-gray-600 active:text-gray-700"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center min-h-[48px] px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Registrando...' : 'Registrarse'}
                                <CheckCircle className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Ingresa aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
