import { useState } from 'react';
import { Home, Users, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import type { RentalMode } from '../types';

interface RentalModeSelectorProps {
    onNext: (mode: RentalMode) => void;
    onBack: () => void;
    initialMode?: RentalMode;
}

const RentalModeSelector: React.FC<RentalModeSelectorProps> = ({ onNext, onBack, initialMode }) => {
    const [selectedMode, setSelectedMode] = useState<RentalMode>(initialMode || 'by_unit');

    const handleSubmit = () => {
        onNext(selectedMode);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 2 de 8</span>
                        <span className="text-sm text-gray-500">Modo de Arriendo</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        ¿Cómo se arrienda?
                    </h1>
                    <p className="text-gray-600">
                        Selecciona el modo de arriendo para tu propiedad
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-4 mb-8">
                    {/* By Unit */}
                    <label
                        className={`
              flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all
              ${selectedMode === 'by_unit'
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                            }
            `}
                    >
                        <input
                            type="radio"
                            name="rentalMode"
                            value="by_unit"
                            checked={selectedMode === 'by_unit'}
                            onChange={(e) => setSelectedMode(e.target.value as RentalMode)}
                            className="mt-1 mr-4 w-5 h-5 text-blue-600"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="w-6 h-6 text-blue-600" />
                                <div className="font-semibold text-lg text-gray-900">
                                    Por habitaciones (estudiantes)
                                </div>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Cada habitación se arrienda independientemente a diferentes personas que no se conocen
                            </p>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                    ℹ️ Esto incluye:
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Definir servicios compartidos (alimentación, limpieza, etc.)</li>
                                    <li>• Establecer reglas de convivencia</li>
                                    <li>• Especificar áreas comunes</li>
                                    <li>• Agregar cada habitación con su precio individual</li>
                                </ul>
                            </div>
                        </div>
                    </label>

                    {/* Complete */}
                    <label
                        className={`
              flex items-start p-6 border-2 rounded-xl cursor-pointer transition-all
              ${selectedMode === 'complete'
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                            }
            `}
                    >
                        <input
                            type="radio"
                            name="rentalMode"
                            value="complete"
                            checked={selectedMode === 'complete'}
                            onChange={(e) => setSelectedMode(e.target.value as RentalMode)}
                            className="mt-1 mr-4 w-5 h-5 text-blue-600"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Home className="w-6 h-6 text-blue-600" />
                                <div className="font-semibold text-lg text-gray-900">
                                    Completo (grupo/familia)
                                </div>
                            </div>
                            <p className="text-gray-600 mb-3">
                                Se arrienda toda la propiedad a un solo grupo de personas que se conocen
                            </p>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                    ℹ️ Esto incluye:
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Servicios y reglas son opcionales</li>
                                    <li>• Agregar habitaciones para mostrar distribución</li>
                                    <li>• Precio total de la propiedad completa</li>
                                    <li>• Todas las habitaciones se arriendan juntas</li>
                                </ul>
                            </div>
                        </div>
                    </label>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <p className="font-medium mb-1">💡 Consejo</p>
                            <p>
                                {selectedMode === 'by_unit'
                                    ? 'El modo "Por habitaciones" es ideal para pensiones y apartamentos compartidos donde cada inquilino paga su habitación.'
                                    : 'El modo "Completo" es ideal cuando arriendes a un grupo de amigos o familia que ya se conocen.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Atrás
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Siguiente
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalModeSelector;
