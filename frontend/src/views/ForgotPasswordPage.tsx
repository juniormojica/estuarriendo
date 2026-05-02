'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormValues } from '../lib/validations';

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' }
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const response = await authService.forgotPassword(data.email);
            setSuccess(true);
            setSuccessMessage(response.message || 'Instrucciones enviadas');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al solicitar recuperación de contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-brand-blue" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-jakarta font-extrabold text-gray-900">
                    Recuperar Contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 font-lato">
                    Ingresa tu correo electrónico y te enviaremos instrucciones para resetear tu contraseña.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
                    {!success ? (
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4 flex flex-col items-start text-red-700 text-sm">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                        <span className="font-medium">Atención</span>
                                    </div>
                                    <p className="mt-2 ml-7 leading-relaxed">{error}</p>
                                    {error.includes('no está registrado') && (
                                        <Link
                                            href="/register"
                                            className="mt-4 ml-7 inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors duration-200"
                                        >
                                            Crear una cuenta nueva
                                        </Link>
                                    )}
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
                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all sm:text-sm bg-white ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        placeholder="tu@email.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-jakarta font-bold text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link href="/login" className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start text-green-700 text-sm">
                                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">¡Instrucciones enviadas!</p>
                                    <p className="mt-1">
                                        {successMessage}
                                    </p>
                                </div>
                            </div>

                            <div className="text-center pt-4">
                                <Link href="/login" className="text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
