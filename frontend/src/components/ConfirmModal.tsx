import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'success' | 'warning' | 'danger';
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-12 h-12 text-emerald-600" />;
            case 'danger':
                return <AlertTriangle className="w-12 h-12 text-red-600" />;
            default:
                return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-emerald-600 hover:bg-emerald-700';
            case 'danger':
                return 'bg-red-600 hover:bg-red-700';
            default:
                return 'bg-yellow-600 hover:bg-yellow-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black bg-opacity-50 animate-fadeIn">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full animate-slideUp">
                <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                            {getIcon()}
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    <p className="text-gray-600 mb-6 ml-15">{message}</p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 min-h-[48px] px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 active:bg-gray-400 font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 min-h-[48px] px-4 py-3 text-white rounded-lg font-medium transition-colors ${getButtonColor()}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
