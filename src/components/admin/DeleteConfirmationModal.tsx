import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isProcessing?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Eliminar Propiedad',
    message = '¿Estás seguro de que deseas eliminar esta propiedad permanentemente? Esta acción no se puede deshacer.',
    isProcessing = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full shadow-xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={24} />
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isProcessing}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                        disabled={isProcessing}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
