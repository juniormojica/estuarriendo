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
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md mx-auto">
                <div className="flex justify-center">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 flex items-center justify-center">
                        <LogIn className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                    Inicia sesión en tu cuenta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    O{' '}
                    <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-500">
                        regístrate gratis
                    </Link>
                </p>
            </div>

            <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto">
                <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 shadow rounded-lg">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700 text-sm">
                                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo Electrónico
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    {...register('email')}
                                    className={`appearance-none block w-full min-h-[44px] px-3 py-2.5 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    {...register('password')}
                                    className={`appearance-none block w-full min-h-[44px] px-3 py-2.5 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px] text-gray-400 hover:text-gray-600 active:text-gray-700 focus:outline-none"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center min-h-[48px] py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>

                    {/* Google Sign-In Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-gray-500">O continúa con</span>
                        </div>
                    </div>

                    {/* Google Button */}
                    <GoogleSignInButton onSuccess={handleGoogleSuccess} text="continue_with" />
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
