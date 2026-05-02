'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError, googleLogin, googleCompleteRegistration, setGooglePendingData } from '../store/slices/authSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../lib/validations';
import GoogleSignInButton from '../components/GoogleSignInButton';
import GoogleRegistrationModal from '../components/GoogleRegistrationModal';
import type { GoogleRegistrationData } from '../services/authService';

const LoginPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, loading, error, googlePendingData } = useAppSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [googleModalError, setGoogleModalError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    // Clear error when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.userType === 'owner') {
                router.push('/dashboard');
            } else if (user.userType === 'admin' || user.userType === 'superAdmin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        }
    }, [user, router]);

    const onSubmit = async (data: LoginFormValues) => {
        await dispatch(loginUser({ email: data.email, password: data.password }));
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
                            Bienvenido de nuevo a tu próximo hogar.
                        </h1>
                        <p className="text-lg text-blue-100 max-w-md leading-relaxed">
                            Accede a tu cuenta para continuar explorando alojamientos o gestionando tus propiedades.
                        </p>
                    </div>
                    <div className="text-sm text-blue-200 relative z-10 font-medium">
                        &copy; {new Date().getFullYear()} EstuArriendo. Todos los derechos reservados.
                    </div>
                </div>

                {/* Right side: Form */}
                <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gray-50 lg:bg-white relative z-10">
                    
                    {/* Mobile/Tablet Header */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="flex items-center gap-2 text-blue-600">
                            <div className="bg-blue-100 p-2 rounded-xl">
                                <LogIn className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-gray-900">EstuArriendo</span>
                        </div>
                    </div>

                    <div className="w-full max-w-sm mx-auto">
                        <div className="mb-8 text-center lg:text-left">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                                Inicia sesión
                            </h2>
                            <p className="text-sm text-gray-600">
                                ¿No tienes cuenta?{' '}
                                <Link href="/registro" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                    Regístrate gratis
                                </Link>
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Google Button At the Top */}
                            <div className="transform transition-all duration-300 hover:-translate-y-0.5">
                                <GoogleSignInButton onSuccess={handleGoogleSuccess} text="signin_with" />
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-gray-50 lg:bg-white text-gray-500 font-medium">O continúa con correo</span>
                                </div>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center text-red-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        {...register('email')}
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                                        placeholder="tu@correo.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            {...register('password')}
                                            className={`appearance-none block w-full px-4 py-3 pr-10 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'}`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-sm text-red-600 font-medium animate-in fade-in">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between lg:justify-end">
                                    <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </button>
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

export default LoginPage;
