import React from 'react';
import { Users, TrendingUp, UserCheck, UserPlus } from 'lucide-react';
import { User } from '../../types';

interface UserStatsCardProps {
    users: User[];
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ users }) => {
    // Calculate statistics
    const totalUsers = users.length;

    // Users created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = users.filter(user => {
        const joinedDate = new Date(user.joinedAt || user.createdAt || '');
        return joinedDate >= sevenDaysAgo;
    }).length;

    // User type breakdown
    const owners = users.filter(u => u.userType === 'owner').length;
    const tenants = users.filter(u => u.userType === 'tenant').length;
    const admins = users.filter(u => u.userType === 'admin' || u.userType === 'superAdmin').length;

    // Verified users
    const verifiedUsers = users.filter(u => u.verificationStatus === 'verified' || u.isVerified).length;
    const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

    // Active users (not soft-deleted)
    const activeUsers = users.filter(u => u.isActive !== false).length;

    const stats = [
        {
            label: 'Total Activos',
            value: activeUsers,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Nuevos (7 días)',
            value: newUsersThisWeek,
            icon: UserPlus,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            trend: newUsersThisWeek > 0 ? 'up' : null
        },
        {
            label: 'Verificados',
            value: verifiedUsers,
            icon: UserCheck,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            subtitle: `${verificationRate}% del total`
        },
        {
            label: 'Propietarios',
            value: owners,
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            subtitle: `${tenants} arrendatarios`
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    Estadísticas de Usuarios
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`p-4 rounded-lg ${stat.bgColor}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <Icon size={20} className={stat.color} />
                                {stat.trend === 'up' && (
                                    <TrendingUp size={16} className="text-green-500" />
                                )}
                            </div>
                            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                                {stat.value}
                            </div>
                            <div className="text-xs font-medium text-gray-600">
                                {stat.label}
                            </div>
                            {stat.subtitle && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {stat.subtitle}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Additional breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Distribución de roles:</span>
                    <div className="flex gap-3">
                        <span className="text-orange-600 font-medium">
                            {owners} propietarios
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600 font-medium">
                            {tenants} arrendatarios
                        </span>
                        {admins > 0 && (
                            <>
                                <span className="text-gray-400">•</span>
                                <span className="text-purple-600 font-medium">
                                    {admins} admins
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStatsCard;
