'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { X, PlusCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

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
        router.push('/registro');
    };

    const handleBrowse = () => {
        handleClose();
        router.push('/?scrollToSearch=true');
    };

    const handleLogin = () => {
        handleClose();
        router.push('/login');
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
                            className="relative bg-white dark:bg-brand-dark rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-white/10"
                        >
                            {/* Close Button - Touch Friendly */}
                            <button
                                onClick={handleClose}
                                className="sticky top-3 right-3 float-right p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20 transition-colors z-10 bg-white/90 dark:bg-brand-dark/90 backdrop-blur-sm shadow-md dark:shadow-none border border-transparent dark:border-white/10"
                                aria-label="Cerrar"
                            >
                                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>

                            {/* Header with brand colors - Responsive */}
                            <div className="relative px-4 sm:px-6 py-6 sm:py-8 text-brand-dark dark:text-white rounded-t-xl sm:rounded-t-2xl border-b border-gray-100 dark:border-white/10">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-lime rounded-t-2xl" />
                                
                                <div className="relative pt-6 sm:pt-8">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                                        ¡Bienvenido a EstuArriendo! 🏠
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                        Tu plataforma ideal para alojamiento estudiantil
                                    </p>
                                </div>
                            </div>

                            {/* Content - Responsive */}
                            <div className="p-4 sm:p-6">
                                <p className="text-gray-600 dark:text-gray-400 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
                                    ¿Qué te gustaría hacer hoy?
                                </p>

                                {/* CTA Buttons - Touch Friendly */}
                                <div className="space-y-3">
                                    {/* Browse Properties */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleBrowse}
                                        className="group w-full min-h-[56px] relative overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-left transition-all hover:border-brand-blue hover:shadow-md dark:hover:border-brand-blue/50"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />

                                        <div className="relative flex items-start gap-3">
                                            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-brand-blue rounded-lg group-hover:scale-110 transition-transform">
                                                <Search className="h-5 w-5 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                    Buscar Alojamiento
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                                                    Explora opciones cerca de tu universidad
                                                </p>

                                                <div className="flex items-center text-brand-blue font-semibold text-xs">
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
                                        className="group w-full min-h-[56px] relative overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-left transition-all hover:border-brand-lime hover:shadow-md dark:hover:border-brand-lime/50"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-lime/10 dark:bg-brand-lime/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform" />

                                        <div className="relative flex items-start gap-3">
                                            <div className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-brand-lime rounded-lg group-hover:scale-110 transition-transform">
                                                <PlusCircle className="h-5 w-5 text-brand-dark" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                    Publicar Inmueble
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
                                                    Anuncia tu propiedad fácil y rápido
                                                </p>

                                                <div className="flex items-center text-brand-dark dark:text-brand-lime font-semibold text-xs">
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
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        ¿Ya tienes cuenta?{' '}
                                        <button
                                            onClick={handleLogin}
                                            className="font-bold text-brand-dark dark:text-brand-lime hover:opacity-80 transition-opacity underline"
                                        >
                                            Ingresar
                                        </button>
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className="text-xl font-bold text-brand-dark dark:text-white mb-0.5">100+</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Propiedades</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-brand-dark dark:text-white mb-0.5">24/7</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Soporte</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-brand-dark dark:text-white mb-0.5">100%</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Verificado</div>
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
