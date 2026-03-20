import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isSaving?: boolean;
}

const ConfirmReviewModal: React.FC<ConfirmReviewModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Enviar a revisión?',
    message = 'Al guardar estos cambios, tu propiedad volverá a estado pendiente de revisión por un administrador. Asegúrate de haber completado todas las ediciones en las demás pestañas antes de confirmar.',
    isSaving = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 opacity-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors disabled:opacity-50"
                        aria-label="Cerrar modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-gray-600 leading-relaxed text-sm">
                    {message.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 pt-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                Guardando...
                            </>
                        ) : 'Confirmar y Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmReviewModal;
