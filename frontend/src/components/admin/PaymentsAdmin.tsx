import React, { useState } from 'react';
import { PaymentRequest } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface PaymentsAdminProps {
    paymentRequests: PaymentRequest[];
    onRefresh: () => Promise<void>;
}

const PaymentsAdmin: React.FC<PaymentsAdminProps> = ({ paymentRequests, onRefresh }) => {
    const toast = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'verify' | 'reject';
        requestId: string;
        userName: string;
    } | null>(null);

    const pendingPayments = paymentRequests.filter(r => r.status === 'pending');

    const handleVerifyClick = (requestId: string) => {
        const request = paymentRequests.find(r => r.id === requestId);
        if (!request) return;

        setConfirmModal({
            isOpen: true,
            type: 'verify',
            requestId,
            userName: request.user?.name || 'Usuario'
        });
    };

    const handleRejectClick = (requestId: string) => {
        const request = paymentRequests.find(r => r.id === requestId);
        if (!request) return;

        setConfirmModal({
            isOpen: true,
            type: 'reject',
            requestId,
            userName: request.user?.name || 'Usuario'
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal) return;

        setIsProcessing(true);
        try {
            const { type, requestId } = confirmModal;

            if (type === 'verify') {
                const success = await api.verifyPaymentRequest(requestId);
                if (success) {
                    toast.success('✅ Pago verificado exitosamente');
                    await onRefresh();
                } else {
                    toast.error('❌ Error al verificar el pago');
                }
            } else {
                const success = await api.rejectPaymentRequest(requestId);
                if (success) {
                    toast.success('✅ Pago rechazado');
                    await onRefresh();
                } else {
                    toast.error('❌ Error al rechazar el pago');
                }
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('❌ Error al procesar el pago');
        } finally {
            setIsProcessing(false);
            setConfirmModal(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Pago</h2>
            {pendingPayments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                    No hay solicitudes de pago pendientes.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingPayments.map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {request.referenceCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {request.user?.name || 'Usuario desconocido'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {request.planType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${request.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {request.proofImageUrl ? (
                                                <a
                                                    href={request.proofImageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                                >
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    Ver Comprobante
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Sin comprobante</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleVerifyClick(request.id)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                                title="Verificar Pago"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(request.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Rechazar Pago"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal && (
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.type === 'verify' ? 'Confirmar Verificación' : 'Rechazar Pago'}
                    message={
                        confirmModal.type === 'verify'
                            ? `¿Estás seguro de que deseas aprobar el pago de ${confirmModal.userName}?`
                            : `¿Estás seguro de que deseas rechazar el pago de ${confirmModal.userName}?`
                    }
                    confirmText={confirmModal.type === 'verify' ? 'Verificar' : 'Rechazar'}
                    type={confirmModal.type === 'verify' ? 'success' : 'danger'}
                    onConfirm={handleConfirmAction}
                    onClose={() => setConfirmModal(null)}
                />
            )}
        </div>
    );
};

export default PaymentsAdmin;
