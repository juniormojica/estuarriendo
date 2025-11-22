import React from 'react';
import { PropertyStats } from '../../types';
import { Home, Clock, CheckCircle, XCircle, Star, DollarSign } from 'lucide-react';

interface AdminStatsProps {
    stats: PropertyStats;
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Propiedades',
            value: stats.total,
            icon: Home,
            color: 'bg-blue-500',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Pendientes',
            value: stats.pending,
            icon: Clock,
            color: 'bg-yellow-500',
            bgLight: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Aprobadas',
            value: stats.approved,
            icon: CheckCircle,
            color: 'bg-green-500',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'Rechazadas',
            value: stats.rejected,
            icon: XCircle,
            color: 'bg-red-500',
            bgLight: 'bg-red-50',
            textColor: 'text-red-600'
        },
        {
            title: 'Destacadas',
            value: stats.featured,
            icon: Star,
            color: 'bg-purple-500',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            title: 'Ingresos Estimados',
            value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(stats.totalRevenue),
            icon: DollarSign,
            color: 'bg-emerald-500',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            isMonetary: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${stat.bgLight} p-3 rounded-lg`}>
                                <Icon className={stat.textColor} size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                        <p className={`text-2xl font-bold ${stat.textColor}`}>
                            {stat.isMonetary ? stat.value : stat.value.toLocaleString()}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default AdminStats;
