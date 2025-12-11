import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export type ConfirmationType = 'approve' | 'reject' | 'delete' | 'warning';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: ConfirmationType;
    confirmText?: string;
    cancelText?: string;
    isProcessing?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isProcessing = false
}) => {
    if (!isOpen) return null;

    const styles = {
        approve: {
            icon: <CheckCircle className="w-12 h-12 text-green-600" />,
            bg: 'bg-green-50',
            border: 'border-green-200',
            button: 'bg-green-600 hover:bg-green-700'
        },
        reject: {
            icon: <XCircle className="w-12 h-12 text-red-600" />,
            bg: 'bg-red-50',
            border: 'border-red-200',
            button: 'bg-red-600 hover:bg-red-700'
        },
        delete: {
            icon: <Trash2 className="w-12 h-12 text-red-600" />,
            bg: 'bg-red-50',
            border: 'border-red-200',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: <AlertTriangle className="w-12 h-12 text-yellow-600" />,
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            button: 'bg-yellow-600 hover:bg-yellow-700'
        }
    };

    const currentStyle = styles[type];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-lg max-w-md w-full shadow-xl animate-scaleIn">
                {/* Icon */}
                <div className={`flex justify-center pt-6 pb-4 ${currentStyle.bg} rounded-t-lg border-b ${currentStyle.border}`}>
                    {currentStyle.icon}
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentStyle.button}`}
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Procesando...
                                </div>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
