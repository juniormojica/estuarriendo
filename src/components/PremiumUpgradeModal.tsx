import React, { useEffect } from 'react';
import { X, CheckCircle, Star, Image as ImageIcon, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full relative animate-scaleIn my-auto">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Header */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center relative overflow-hidden rounded-t-2xl">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <Star className="w-24 h-24 absolute -top-4 -left-4" />
                            <Zap className="w-32 h-32 absolute -bottom-8 -right-8" />
                        </div>

                        <div className="relative z-10">
                            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                            </div>
                            <h2 className="text-xl font-bold mb-1">Mejora tu Plan</h2>
                            <p className="text-emerald-100 text-sm">Desbloquea todo el potencial</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-center mb-5">
                            <p className="text-gray-600 mb-2 text-sm">Has alcanzado el límite de imágenes gratuito.</p>
                            <div className="flex items-center justify-center space-x-4 text-sm">
                                <div className="flex items-center text-gray-500">
                                    <span className="font-bold text-gray-700 mr-1">3</span> Gratis
                                </div>
                                <div className="h-4 w-px bg-gray-300"></div>
                                <div className="flex items-center text-emerald-600 font-medium">
                                    <span className="font-bold mr-1">10+</span> Premium
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                                <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                                Beneficios Premium
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Carga hasta <strong>10 imágenes</strong> y <strong>1 video</strong></span>
                                </li>
                                <li className="flex items-start text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span><strong>Sello de Verificación</strong></span>
                                </li>
                                <li className="flex items-start text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Mayor visibilidad en <strong>Destacados</strong></span>
                                </li>
                                <li className="flex items-start text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>Publicaciones <strong>ilimitadas</strong></span>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center mb-5">
                            <span className="text-3xl font-bold text-gray-900">$25.000</span>
                            <span className="text-gray-500 text-sm"> / mes</span>
                        </div>

                        <Link
                            to="/perfil"
                            className="block w-full bg-emerald-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Obtener Premium
                        </Link>

                        <button
                            onClick={onClose}
                            className="block w-full text-center py-3 text-gray-500 hover:text-gray-700 text-sm mt-1"
                        >
                            Continuar con Plan Gratuito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumUpgradeModal;
