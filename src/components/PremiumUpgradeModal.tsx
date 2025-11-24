import React from 'react';
import { X, CheckCircle, Star, Image as ImageIcon, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden relative animate-scaleIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <Star className="w-24 h-24 absolute -top-4 -left-4" />
                        <Zap className="w-32 h-32 absolute -bottom-8 -right-8" />
                    </div>

                    <div className="relative z-10">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Mejora tu Plan</h2>
                        <p className="text-emerald-100">Desbloquea todo el potencial de EstuArriendo</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-2">Has alcanzado el límite de imágenes de tu plan gratuito.</p>
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

                    <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                            Beneficios Premium
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Carga hasta <strong>10 imágenes</strong> y <strong>1 video</strong></span>
                            </li>
                            <li className="flex items-start text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span><strong>Sello de Verificación</strong> para mayor confianza</span>
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

                    <div className="text-center mb-6">
                        <span className="text-3xl font-bold text-gray-900">$20.000</span>
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
                        className="block w-full text-center py-3 text-gray-500 hover:text-gray-700 text-sm mt-2"
                    >
                        Continuar con Plan Gratuito
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumUpgradeModal;
