import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface RejectionWarningModalProps {
    isOpen: boolean;
    rejectionReason: string;
    propertyTitle: string;
    onClose: () => void;
    onContinue: () => void;
}

const RejectionWarningModal: React.FC<RejectionWarningModalProps> = ({
    isOpen,
    rejectionReason,
    propertyTitle,
    onClose,
    onContinue
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal - Responsive */}
                <div className="relative bg-white rounded-xl sm:rounded-lg shadow-xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 transform transition-all">
                    {/* Close button - Touch Friendly */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Icon */}
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                        Propiedad Rechazada
                    </h3>

                    {/* Property Title */}
                    <p className="text-sm text-gray-600 text-center mb-4">
                        "{propertyTitle}"
                    </p>

                    {/* Rejection Reason Box */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-xs font-semibold text-red-800 mb-2">
                            Motivo del rechazo:
                        </p>
                        <p className="text-sm text-red-700">
                            {rejectionReason}
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <strong>Instrucciones:</strong> Corrige los datos necesarios para enviar nuevamente a verificación tu propiedad.
                            Una vez guardes los cambios, tu propiedad volverá a estado "Pendiente" para revisión.
                        </p>
                    </div>

                    {/* Actions - Touch Friendly */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 min-h-[48px] px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onContinue}
                            className="flex-1 min-h-[48px] px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors font-medium"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectionWarningModal;
