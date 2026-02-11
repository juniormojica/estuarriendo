import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import { FileText, Calendar, User as UserIcon, ChevronRight } from 'lucide-react';
import { VerificationReviewModal } from './VerificationReviewModal';

interface VerificationsAdminProps {
    pendingVerifications: User[];
    onRefresh: () => Promise<void>;
}

const VerificationsAdmin: React.FC<VerificationsAdminProps> = ({ pendingVerifications, onRefresh }) => {
    const toast = useToast();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const handleReviewClick = (user: User) => {
        setSelectedUser(user);
        setIsReviewOpen(true);
    };

    const handleApprove = async (userId: string) => {
        const success = await api.updateVerificationStatus(userId, 'verified');
        if (success) {
            toast.success('Usuario verificado exitosamente');
            await onRefresh();
        } else {
            toast.error('Error al verificar usuario');
        }
    };

    const handleReject = async (userId: string, reason: string) => {
        const success = await api.updateVerificationStatus(userId, 'rejected', reason);
        if (success) {
            toast.success('Verificación rechazada');
            await onRefresh();
        } else {
            toast.error('Error al rechazar verificación');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Verificaciones Pendientes</h2>
            {pendingVerifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <div className="bg-gray-50 text-gray-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Todo al día</h3>
                    <p className="text-gray-500 mt-2">No hay solicitudes de verificación pendientes por revisar.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingVerifications.map((user) => (
                        <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={user.name}>{user.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1" title={user.email}>{user.email}</p>
                                </div>
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    Pendiente
                                </span>
                            </div>

                            {user.verificationSubmittedAt && (
                                <div className="text-xs text-gray-500 mb-4 flex items-center gap-1 bg-gray-50 p-2 rounded">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Enviado: {new Date(user.verificationSubmittedAt).toLocaleDateString('es-CO', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            )}

                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        Documentos:
                                    </span>
                                    <span className="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                        {[
                                            user.verificationDocuments?.idFront,
                                            user.verificationDocuments?.idBack,
                                            user.verificationDocuments?.selfie,
                                            user.verificationDocuments?.utilityBill
                                        ].filter(Boolean).length} archivos
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleReviewClick(user)}
                                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group"
                                >
                                    Revisar Solicitud
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <VerificationReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                user={selectedUser}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
};

export default VerificationsAdmin;
