import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import { FileText } from 'lucide-react';

interface VerificationsAdminProps {
    pendingVerifications: User[];
    onRefresh: () => Promise<void>;
}

const VerificationsAdmin: React.FC<VerificationsAdminProps> = ({ pendingVerifications, onRefresh }) => {
    const toast = useToast();
    const [verificationModal, setVerificationModal] = useState<{
        isOpen: boolean;
        userId: string | null;
        action: 'approve' | 'reject' | null;
    }>({
        isOpen: false,
        userId: null,
        action: null
    });
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApproveClick = (userId: string) => {
        setVerificationModal({ isOpen: true, userId, action: 'approve' });
    };

    const handleRejectClick = (userId: string) => {
        setVerificationModal({ isOpen: true, userId, action: 'reject' });
        setRejectionReason('');
    };

    const handleConfirmAction = async () => {
        if (!verificationModal.userId) return;

        setIsProcessing(true);
        try {
            if (verificationModal.action === 'approve') {
                const success = await api.updateVerificationStatus(verificationModal.userId, 'verified');
                if (success) {
                    toast.success('Usuario verificado exitosamente');
                    await onRefresh();
                } else {
                    toast.error('Error al verificar usuario');
                }
            } else if (verificationModal.action === 'reject') {
                if (!rejectionReason.trim()) {
                    toast.error('Debes proporcionar una razón para el rechazo');
                    setIsProcessing(false);
                    return;
                }
                const success = await api.updateVerificationStatus(verificationModal.userId, 'rejected', rejectionReason);
                if (success) {
                    toast.success('Verificación rechazada');
                    await onRefresh();
                } else {
                    toast.error('Error al rechazar verificación');
                }
            }
        } catch (error) {
            console.error('Error processing verification:', error);
            toast.error('Error al procesar la solicitud');
        } finally {
            setIsProcessing(false);
            setVerificationModal({ isOpen: false, userId: null, action: null });
            setRejectionReason('');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Verificaciones Pendientes</h2>
            {pendingVerifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                    No hay verificaciones pendientes.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingVerifications.map((user) => (
                        <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                {user.verificationSubmittedAt && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Enviado: {new Date(user.verificationSubmittedAt).toLocaleDateString('es-CO')}
                                    </p>
                                )}
                            </div>

                            {user.verificationDocuments && (
                                <div className="space-y-3 mb-4">
                                    <h4 className="text-sm font-medium text-gray-700">Documentos:</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <a
                                            href={user.verificationDocuments.idFront}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                        >
                                            <FileText className="w-3 h-3 mr-1" />
                                            Cédula Frente
                                        </a>
                                        <a
                                            href={user.verificationDocuments.idBack}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                        >
                                            <FileText className="w-3 h-3 mr-1" />
                                            Cédula Atrás
                                        </a>
                                        {user.verificationDocuments.selfie && (
                                            <a
                                                href={user.verificationDocuments.selfie}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                            >
                                                <FileText className="w-3 h-3 mr-1" />
                                                Selfie
                                            </a>
                                        )}
                                        {user.verificationDocuments.utilityBill && (
                                            <a
                                                href={user.verificationDocuments.utilityBill}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                            >
                                                <FileText className="w-3 h-3 mr-1" />
                                                Recibo
                                            </a>
                                        )}

                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleApproveClick(user.id || '')}
                                    className="flex-1 py-2 px-3 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                                >
                                    Aprobar
                                </button>
                                <button
                                    onClick={() => handleRejectClick(user.id || '')}
                                    className="flex-1 py-2 px-3 bg-white text-red-600 border border-red-200 text-sm font-medium rounded hover:bg-red-50 transition-colors"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Verification Action Modal */}
            {verificationModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {verificationModal.action === 'approve'
                                ? 'Aprobar Verificación'
                                : 'Rechazar Verificación'}
                        </h3>

                        {verificationModal.action === 'approve' ? (
                            <p className="text-gray-600 mb-6">
                                ¿Estás seguro de que deseas aprobar la verificación de este usuario?
                                Se le notificará por correo electrónico y tendrá acceso a funciones verificadas.
                            </p>
                        ) : (
                            <div className="mb-6">
                                <p className="text-gray-600 mb-3">
                                    Por favor indica la razón del rechazo para notificar al usuario:
                                </p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Ej: La foto de la cédula no es legible..."
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setVerificationModal({ isOpen: false, userId: null, action: null })}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                disabled={isProcessing}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                disabled={isProcessing}
                                className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${verificationModal.action === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationsAdmin;
