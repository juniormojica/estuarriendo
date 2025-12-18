import React from 'react';
import { Bell, FileText, CheckCircle, CreditCard, Users } from 'lucide-react';
import { AdminSection } from '../../types';

interface PendingActionsCardProps {
    pendingProperties: number;
    pendingVerifications: number;
    pendingPayments: number;
    pendingStudentRequests: number;
    onNavigate: (section: AdminSection) => void;
}

const PendingActionsCard: React.FC<PendingActionsCardProps> = ({
    pendingProperties,
    pendingVerifications,
    pendingPayments,
    pendingStudentRequests,
    onNavigate
}) => {
    const actions = [
        {
            label: 'Propiedades por Revisar',
            count: pendingProperties,
            icon: FileText,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            hoverColor: 'hover:bg-yellow-100',
            section: 'pending' as AdminSection,
            show: true
        },
        {
            label: 'Verificaciones Pendientes',
            count: pendingVerifications,
            icon: CheckCircle,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            hoverColor: 'hover:bg-blue-100',
            section: 'verifications' as AdminSection,
            show: true
        },
        {
            label: 'Pagos por Verificar',
            count: pendingPayments,
            icon: CreditCard,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            hoverColor: 'hover:bg-green-100',
            section: 'payments' as AdminSection,
            show: true
        },
        {
            label: 'Solicitudes de Estudiantes',
            count: pendingStudentRequests,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            hoverColor: 'hover:bg-purple-100',
            section: 'student-requests' as AdminSection,
            show: true
        }
    ];

    const totalPending = actions.reduce((sum, action) => sum + action.count, 0);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bell size={20} className="text-orange-500" />
                    Acciones Pendientes
                </h3>
                {totalPending > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                        {totalPending} total
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {actions.filter(action => action.show).map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => onNavigate(action.section)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${action.bgColor} ${action.hoverColor}`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={18} className={action.color} />
                                <span className="text-sm font-medium text-gray-700">
                                    {action.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${action.color}`}>
                                    {action.count}
                                </span>
                                <svg
                                    className={`w-4 h-4 ${action.color}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </button>
                    );
                })}
            </div>

            {totalPending === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">¡Todo al día!</p>
                    <p className="text-xs mt-1">No hay acciones pendientes</p>
                </div>
            )}
        </div>
    );
};

export default PendingActionsCard;
