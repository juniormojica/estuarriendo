import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import { Clock, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface ActivityFeedProps {
    activities?: ActivityLog[];
    maxItems?: number;
    showViewAll?: boolean;
    onViewAll?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
    activities: propActivities,
    maxItems = 10,
    showViewAll = true,
    onViewAll
}) => {
    const [activities, setActivities] = useState<ActivityLog[]>(propActivities || []);
    const [isLoading, setIsLoading] = useState(!propActivities);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadActivities = async () => {
        if (propActivities) return; // Don't fetch if activities are provided as props

        try {
            const logs = await api.getActivityLogs({ limit: maxItems });
            setActivities(logs);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!propActivities) {
            loadActivities();
        }
    }, [propActivities, maxItems]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadActivities();
        setIsRefreshing(false);
    };

    const displayedActivities = activities.slice(0, maxItems);

    const getActivityIcon = (type: ActivityLog['type']) => {
        const icons = {
            property_submitted: '📝',
            property_approved: '✅',
            property_rejected: '❌',
            property_deleted: '🗑️',
            property_featured: '⭐',
            user_registered: '👤',
            config_updated: '⚙️',
            payment_verified: '💳'
        };
        return icons[type] || '📋';
    };

    const getActivityColor = (type: ActivityLog['type']) => {
        const colors = {
            property_submitted: 'text-blue-600',
            property_approved: 'text-green-600',
            property_rejected: 'text-red-600',
            property_deleted: 'text-gray-600',
            property_featured: 'text-yellow-600',
            user_registered: 'text-purple-600',
            config_updated: 'text-orange-600',
            payment_verified: 'text-emerald-600'
        };
        return colors[type] || 'text-gray-600';
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-CO');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={20} />
                    Actividad Reciente
                </h3>
                {!propActivities && (
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Actualizar"
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2">Cargando actividad...</p>
                    </div>
                ) : displayedActivities.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No hay actividad reciente
                    </div>
                ) : (
                    displayedActivities.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatTimestamp(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showViewAll && activities.length > 0 && (
                <div className="p-3 border-t border-gray-200 text-center">
                    <button
                        onClick={onViewAll}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Ver todas las actividades ({activities.length})
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
