import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, clearError } from '../store/slices/authSlice';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultTab?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, defaultTab = 'login' }) => {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Login form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register form
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // Clear error when modal opens/closes or tab changes
    useEffect(() => {
        if (isOpen) {
            dispatch(clearError());
        }
    }, [isOpen, activeTab, dispatch]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    // Watch for successful auth
    const { user } = useAppSelector((state) => state.auth);
    useEffect(() => {
        if (user && isOpen) {
            onSuccess();
        }
    }, [user, isOpen, onSuccess]);

    const handleClose = () => {
        dispatch(clearError());
        setLoginEmail('');
        setLoginPassword('');
        setRegisterData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        });
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(loginUser({ email: loginEmail, password: loginPassword }));
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            return;
        }

        await dispatch(registerUser({
            name: registerData.name,
            email: registerData.email,
            password: registerData.password,
            phone: registerData.phone,
            userType: 'tenant',
            whatsapp: registerData.phone
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors z-10"
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>

                            {/* Header */}
                            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-6 py-8 text-white rounded-t-2xl">
                                <h2 className="text-2xl font-bold mb-2">
                                    {activeTab === 'login' ? '¡Bienvenido de nuevo!' : '¡Únete a EstuArriendo!'}
                                </h2>
                                <p className="text-blue-50 text-sm">
                                    {activeTab === 'login'
                                        ? 'Inicia sesión para guardar tus favoritos'
                                        : 'Crea una cuenta para guardar propiedades'}
                                </p>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 px-6">
                                <button
                                    onClick={() => setActiveTab('login')}
                                    className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'login'
                                            ? 'text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <LogIn className="h-4 w-4 inline mr-2" />
                                    Iniciar Sesión
                                    {activeTab === 'login' && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('register')}
                                    className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'register'
                                            ? 'text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <UserPlus className="h-4 w-4 inline mr-2" />
                                    Registrarse
                                    {activeTab === 'register' && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {error && (
                                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start text-red-700 text-sm">
                                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {activeTab === 'login' ? (
                                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Correo Electrónico
                                            </label>
                                            <input
                                                id="login-email"
                                                type="email"
                                                required
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="tu@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Contraseña
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="login-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre Completo
                                            </label>
                                            <input
                                                id="register-name"
                                                type="text"
                                                required
                                                value={registerData.name}
                                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Juan Pérez"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Correo Electrónico
                                            </label>
                                            <input
                                                id="register-email"
                                                type="email"
                                                required
                                                value={registerData.email}
                                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="tu@email.com"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono (WhatsApp)
                                            </label>
                                            <input
                                                id="register-phone"
                                                type="tel"
                                                required
                                                value={registerData.phone}
                                                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="3001234567"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Contraseña
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="register-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={registerData.password}
                                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirmar Contraseña
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="register-confirm-password"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    required
                                                    value={registerData.confirmPassword}
                                                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Repite tu contraseña"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            {registerData.password && registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || registerData.password !== registerData.confirmPassword}
                                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? 'Registrando...' : 'Crear Cuenta'}
                                        </button>
                                    </form>
                                )}

                                {/* ESC hint */}
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Presiona ESC para cerrar
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
