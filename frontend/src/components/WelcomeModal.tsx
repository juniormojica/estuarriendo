import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, PlusCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user has seen the welcome modal in this session
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');

        if (!hasSeenWelcome) {
            // Show modal after a short delay for better UX
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, []);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenWelcome', 'true');
    };

    const handlePublish = () => {
        handleClose();
        navigate('/registro');
    };

    const handleBrowse = () => {
        handleClose();
        navigate('/', { state: { scrollToSearch: true } });
    };

    const handleLogin = () => {
        handleClose();
        navigate('/login');
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

                    {/* Modal - Responsive */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* Close Button - Touch Friendly */}
                            <button
                                onClick={handleClose}
                                className="sticky top-3 right-3 float-right p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors z-10 bg-white/90 backdrop-blur-sm shadow-md"
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>

                            {/* Header with gradient - Responsive */}
                            <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-4 sm:px-6 py-6 sm:py-8 text-white rounded-t-xl sm:rounded-t-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -mr-16 sm:-mr-24 -mt-16 sm:-mt-24" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16" />

                                <div className="relative pt-6 sm:pt-8">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                                        ¡Bienvenido a EstuArriendo! 🏠
                                    </h2>
                                    <p className="text-emerald-50 text-xs sm:text-sm">
                                        Tu plataforma ideal para alojamiento estudiantil
                                    </p>
                                </div>
                            </div>

                            {/* Content - Responsive */}
                            <div className="p-4 sm:p-6">
                                <p className="text-gray-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
                                    ¿Qué te gustaría hacer hoy?
                                </p>

                                {/* CTA Buttons - Touch Friendly */}
                                <div className="space-y-3">
                                    {/* Browse Properties */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleBrowse}
                                        className="group w-full min-h-[56px] relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 text-left transition-all hover:border-blue-400 hover:shadow-md active:border-blue-500"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />

                                        <div className="relative flex items-start gap-3">
                                            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                                                <Search className="h-5 w-5 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    Buscar Alojamiento
                                                </h3>
                                                <p className="text-gray-600 text-xs mb-2">
                                                    Explora opciones cerca de tu universidad
                                                </p>

                                                <div className="flex items-center text-blue-600 font-semibold text-xs">
                                                    Ver propiedades
                                                    <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>

                                    {/* Publish Property */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePublish}
                                        className="group w-full min-h-[56px] relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 text-left transition-all hover:border-emerald-400 hover:shadow-md active:border-emerald-500"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />

                                        <div className="relative flex items-start gap-3">
                                            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                                                <PlusCircle className="h-5 w-5 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                    Publicar Inmueble
                                                </h3>
                                                <p className="text-gray-600 text-xs mb-2">
                                                    Anuncia tu propiedad fácil y rápido
                                                </p>

                                                <div className="flex items-center text-emerald-600 font-semibold text-xs">
                                                    Comenzar ahora
                                                    <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                </div>

                                {/* Login Link for Existing Users */}
                                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                    <p className="text-sm text-gray-600">
                                        ¿Ya tienes cuenta?{' '}
                                        <button
                                            onClick={handleLogin}
                                            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline"
                                        >
                                            Ingresar
                                        </button>
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className="text-xl font-bold text-emerald-600 mb-0.5">100+</div>
                                            <div className="text-xs text-gray-500">Propiedades</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-emerald-600 mb-0.5">24/7</div>
                                            <div className="text-xs text-gray-500">Soporte</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-emerald-600 mb-0.5">100%</div>
                                            <div className="text-xs text-gray-500">Verificado</div>
                                        </div>
                                    </div>
                                </div>



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

export default WelcomeModal;
