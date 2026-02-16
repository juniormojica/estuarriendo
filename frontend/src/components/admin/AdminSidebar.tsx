import React from 'react';
import { AdminSection } from '../../types';
import { LayoutDashboard, Clock, Home, Users, Settings, Activity, CreditCard, ShieldCheck, FileText, X, PlusCircle } from 'lucide-react';

interface AdminSidebarProps {
    currentSection: AdminSection;
    onSectionChange: (section: AdminSection) => void;
    pendingCount: number;
    paymentCount?: number;
    verificationCount?: number;
    isOpen?: boolean;
    onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    currentSection,
    onSectionChange,
    pendingCount,
    paymentCount = 0,
    verificationCount = 0,
    isOpen = false,
    onClose
}) => {
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
            id: 'create-property' as AdminSection,
            label: 'Crear Propiedad',
            icon: PlusCircle,
            badge: null
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
            id: 'student-requests' as AdminSection,
            label: 'Solicitudes',
            icon: FileText,
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

    const SidebarContent = () => (
        <div className="h-full flex flex-col">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Panel Admin</h2>
                    <p className="text-sm text-gray-500">EstuArriendo</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onSectionChange(item.id);
                                if (onClose) onClose();
                            }}
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

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block bg-white border-r border-gray-200 w-64 min-h-screen p-4 sticky top-0 h-screen overflow-y-auto scrollbar-thin">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={onClose}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform p-4">
                        <SidebarContent />
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminSidebar;
