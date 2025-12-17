import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'success';
    isProcessing?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning',
    isProcessing = false
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-red-100',
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            bg: 'bg-yellow-100',
            icon: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700'
        },
        success: {
            bg: 'bg-green-100',
            icon: 'text-green-600',
            button: 'bg-green-600 hover:bg-green-700'
        }
    };

    const currentColors = colors[type];

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full relative animate-scaleIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isProcessing}
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <div className={`w-12 h-12 rounded-full ${currentColors.bg} flex items-center justify-center mb-4`}>
                        {type === 'success' ? (
                            <CheckCircle className={`w-6 h-6 ${currentColors.icon}`} />
                        ) : (
                            <AlertTriangle className={`w-6 h-6 ${currentColors.icon}`} />
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`flex-1 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${currentColors.button}`}
                        >
                            {isProcessing ? 'Procesando...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
