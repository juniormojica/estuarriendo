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
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onContinue}
                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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
