'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRegistrationPayload } from '../types';
import { CheckCircle, Eye, EyeOff, AlertCircle, Building2, User as UserIcon, LogIn } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError, googleLogin, googleCompleteRegistration, setGooglePendingData } from '../store/slices/authSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormValues } from '../lib/validations';
import GoogleSignInButton from '../components/GoogleSignInButton';
import GoogleRegistrationModal from '../components/GoogleRegistrationModal';
import type { GoogleRegistrationData } from '../services/authService';

const RegistrationPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, loading, error, googlePendingData } = useAppSelector((state) => state.auth);

    const [userType, setUserType] = useState<'owner' | 'tenant'>('owner');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [googleModalError, setGoogleModalError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Some fields like role, idType, idNumber aren't in the base schema because they 
    // depend on userType. We'll track them manually or they could be nested in Zod.
    // To keep it simple, we use local state for owner-specific fields not in Zod yet.
    const [ownerData, setOwnerData] = useState({
        role: 'individual',
        idType: 'CC',
        idNumber: ''
    });

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            whatsapp: '',
            password: '',
            confirmPassword: ''
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
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        }
    }, [user, router]);

    const handleOwnerInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setOwnerData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (data: RegisterFormValues) => {
        // Owner specific manual validation since it's not in the generic zod schema yet
        if (userType === 'owner' && !ownerData.idNumber) {
            alert("Por favor ingresa tu número de documento.");
            return;
        }

        // Prepare registration data for backend
        const registrationData: any = {
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            userType: userType,
            whatsapp: data.whatsapp || data.phone
        };

        if (userType === 'owner') {
            registrationData.role = ownerData.role;
            registrationData.idType = ownerData.idType;
            registrationData.idNumber = ownerData.idNumber;
        }

        // Register user via Redux
        await dispatch(registerUser(registrationData));
    };

    const handleGoogleSuccess = async (credential: string) => {
        setGoogleModalError(null);
        await dispatch(googleLogin({ credential }));
    };

    const handleGoogleModalSubmit = async (data: { userType: 'owner' | 'tenant'; phone: string; whatsapp: string }) => {
        if (!googlePendingData) return;
        setGoogleLoading(true);
        setGoogleModalError(null);
        try {
            const result = await dispatch(googleCompleteRegistration({
                googleId: googlePendingData.googleId,
                email: googlePendingData.email,
                name: googlePendingData.name,
                picture: googlePendingData.picture,
                userType: data.userType,
                phone: data.phone,
                whatsapp: data.whatsapp,
            } as GoogleRegistrationData));

            if (googleCompleteRegistration.rejected.match(result)) {
                setGoogleModalError(result.payload as string);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleCloseGoogleModal = () => {
        dispatch(setGooglePendingData(null));
        setGoogleModalError(null);
    };

    return (
        <>
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
            {/* Left side: Solid Color + Branding (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-between p-12 xl:p-20 text-white relative overflow-hidden">
                {/* Decorative subtle element */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-white blur-3xl mix-blend-overlay"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-white blur-3xl mix-blend-overlay"></div>
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-white p-2 rounded-xl">
                            <LogIn className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">EstuArriendo</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                        Únete a nuestra comunidad.
                    </h1>
                    <p className="text-lg text-blue-100 max-w-md leading-relaxed">
                        Encuentra tu alojamiento ideal o publica tu propiedad para miles de estudiantes buscando hogar.
                    </p>
                </div>
                <div className="text-sm text-blue-200 relative z-10 font-medium">
                    &copy; {new Date().getFullYear()} EstuArriendo. Todos los derechos reservados.
                </div>
            </div>

            {/* Right side: Form */}
            <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-12 xl:px-16 bg-gray-50 lg:bg-white relative z-10 overflow-y-auto">
                
                {/* Mobile/Tablet Header */}
                <div className="lg:hidden flex justify-center mb-6">
                    <div className="flex items-center gap-2 text-blue-600">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <LogIn className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900">EstuArriendo</span>
                    </div>
                </div>

                <div className="w-full max-w-xl mx-auto">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                            {userType === 'owner' ? 'Registra tu Inmueble' : 'Crea tu cuenta'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Ingresa aquí
                            </Link>
                        </p>
                    </div>

                    {/* Role Toggle - Redesigned */}
                    <div className="flex justify-center lg:justify-start mb-8">
                        <div className="bg-gray-100/80 p-1.5 rounded-2xl shadow-inner inline-flex relative w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setUserType('owner')}
                                className={`flex-1 sm:flex-none flex items-center justify-center min-h-[48px] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative z-10 ${userType === 'owner'
                                    ? 'text-blue-700 shadow-sm bg-white'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                            >
                                <Building2 className={`w-4 h-4 mr-2 transition-colors ${userType === 'owner' ? 'text-blue-600' : 'text-gray-400'}`} />
                                Soy Propietario
                            </button>
                            <button
                                type="button"
                                onClick={() => setUserType('tenant')}
                                className={`flex-1 sm:flex-none flex items-center justify-center min-h-[48px] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative z-10 ${userType === 'tenant'
                                    ? 'text-blue-700 shadow-sm bg-white'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                            >
                                <UserIcon className={`w-4 h-4 mr-2 transition-colors ${userType === 'tenant' ? 'text-blue-600' : 'text-gray-400'}`} />
                                Busco Inmueble
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Google Button At the Top */}
                        <div className="transform transition-all duration-300 hover:-translate-y-0.5">
                            <GoogleSignInButton onSuccess={handleGoogleSuccess} text="signup_with" />
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-gray-50 lg:bg-white text-gray-500 font-medium">O regístrate con correo</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {userType === 'owner' && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Perfil</label>
                                        <select
                                            name="role"
                                            value={ownerData.role}
                                            onChange={handleOwnerInputChange}
                                            className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white border-gray-300 hover:border-gray-400"
                                        >
                                            <option value="individual">Propietario Individual</option>
                                            <option value="agency">Inmobiliaria / Administrador</option>
                                        </select>
                                    </div>
                                )}

                                <div className={userType === 'tenant' ? "sm:col-span-2" : "animate-in fade-in slide-in-from-top-2"}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo</label>
                                    <input
                                        type="text"
                                        {...register('name')}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                                        placeholder="Ej: Juan Pérez"
                                    />
                                    {errors.name && <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.name.message}</p>}
                                </div>

                                {userType === 'owner' && (
                                    <>
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Documento</label>
                                            <select
                                                name="idType"
                                                value={ownerData.idType}
                                                onChange={handleOwnerInputChange}
                                                className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white border-gray-300 hover:border-gray-400"
                                            >
                                                <option value="CC">Cédula de Ciudadanía</option>
                                                <option value="NIT">NIT</option>
                                                <option value="CE">Cédula de Extranjería</option>
                                            </select>
                                        </div>

                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número de Documento</label>
                                            <input
                                                type="text"
                                                name="idNumber"
                                                required
                                                value={ownerData.idNumber}
                                                onChange={handleOwnerInputChange}
                                                className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white border-gray-300 hover:border-gray-400"
                                                placeholder="Ej: 1020304050"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                                        placeholder="tu@correo.com"
                                    />
                                    {errors.email && <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono (WhatsApp)</label>
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                                        placeholder="Ej: 3001234567"
                                    />
                                    {errors.phone && <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.phone.message}</p>}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register('password')}
                                            className={`appearance-none block w-full px-4 py-3 pr-10 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.password.message}</p>}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            {...register('confirmPassword')}
                                            className={`appearance-none block w-full px-4 py-3 pr-10 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {loading ? 'Registrando...' : 'Registrarse'}
                                    <CheckCircle className="ml-2 h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        {/* Google Registration Modal */}
        {googlePendingData && (
                <GoogleRegistrationModal
                    googleData={googlePendingData}
                    onSubmit={handleGoogleModalSubmit}
                    onClose={handleCloseGoogleModal}
                    loading={googleLoading}
                    error={googleModalError}
                />
            )}
        </>
    );
};

export default RegistrationPage;
