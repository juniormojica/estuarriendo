import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resetToken, setResetToken] = useState(''); // For development only

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            setSuccess(true);

            // In development, show the token
            if (response.token) {
                setResetToken(response.token);
            }
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
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Recuperar Contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ingresa tu correo electrónico y te enviaremos instrucciones para resetear tu contraseña.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!success ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
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
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start text-green-700 text-sm">
                                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Instrucciones enviadas</p>
                                    <p className="mt-1">
                                        Si el correo existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña.
                                    </p>
                                </div>
                            </div>

                            {/* Development only - show token */}
                            {resetToken && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 text-sm">
                                    <p className="font-medium mb-2">🔧 Modo Desarrollo:</p>
                                    <p className="mb-2">Token de reset:</p>
                                    <code className="block bg-white p-2 rounded text-xs break-all">
                                        {resetToken}
                                    </code>
                                    <Link
                                        to={`/reset-password?token=${resetToken}`}
                                        className="mt-2 inline-block text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        → Ir a resetear contraseña
                                    </Link>
                                </div>
                            )}

                            <div className="text-center pt-4">
                                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
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
