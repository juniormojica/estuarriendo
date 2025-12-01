import React from 'react';
import { AdminSection } from '../../types';
import { LayoutDashboard, Clock, Home, Users, Settings, Activity, CreditCard, ShieldCheck } from 'lucide-react';

interface AdminSidebarProps {
    currentSection: AdminSection;
    onSectionChange: (section: AdminSection) => void;
    pendingCount: number;
    paymentCount?: number;
    verificationCount?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentSection, onSectionChange, pendingCount, paymentCount = 0, verificationCount = 0 }) => {
    const menuItems = [
        {
            id: 'dashboard' as AdminSection,
            label: 'Dashboard',
            icon: LayoutDashboard,
            badge: null
        },
        {
            id: 'pending' as AdminSection,
            label: 'Pendientes',
            icon: Clock,
            badge: pendingCount > 0 ? pendingCount : null
        },
        {
            id: 'payments' as AdminSection,
            label: 'Pagos',
            icon: CreditCard,
            badge: paymentCount > 0 ? paymentCount : null
        },
        {
            id: 'verifications' as AdminSection,
            label: 'Verificaciones',
            icon: ShieldCheck,
            badge: verificationCount > 0 ? verificationCount : null
        },
        {
            id: 'all-properties' as AdminSection,
            label: 'Todas las Propiedades',
            icon: Home,
            badge: null
        },
        {
            id: 'users' as AdminSection,
            label: 'Usuarios',
            icon: Users,
            badge: null
        },
        {
            id: 'activity' as AdminSection,
            label: 'Actividad',
            icon: Activity,
            badge: null
        },
        {
            id: 'config' as AdminSection,
            label: 'Configuración',
            icon: Settings,
            badge: null
        }
    ];

    return (
        <div className="bg-white border-r border-gray-200 w-64 min-h-screen p-4">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Panel Admin</h2>
                <p className="text-sm text-gray-500">EstuArriendo</p>
            </div>

            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSectionChange(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all ${isActive
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge !== null && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default AdminSidebar;
