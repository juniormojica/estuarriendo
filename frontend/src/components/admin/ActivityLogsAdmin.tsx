import React, { useState, useEffect } from 'react';
import { ActivityLog, ActivityStatistics, ActivityLogType } from '../../types';
import { api } from '../../services/api';
import {
    Activity,
    Search,
    Filter,
    Download,
    Calendar,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const ActivityLogsAdmin: React.FC = () => {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [statistics, setStatistics] = useState<ActivityStatistics>({
        totalLogs: 0,
        activityByType: [],
        recentActivity: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        loadData();
    }, [selectedType, dateRange]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const filters: any = {};

            if (selectedType) filters.type = selectedType;

            // Calculate date range
            if (dateRange !== 'all') {
                const now = new Date();
                const startDate = new Date();

                if (dateRange === 'today') {
                    startDate.setHours(0, 0, 0, 0);
                } else if (dateRange === 'week') {
                    startDate.setDate(now.getDate() - 7);
                } else if (dateRange === 'month') {
                    startDate.setDate(now.getDate() - 30);
                }

                filters.startDate = startDate.toISOString();
            }

            const [logs, stats] = await Promise.all([
                api.getActivityLogs(filters),
                api.getActivityStatistics(dateRange !== 'all' ? { startDate: filters.startDate } : {})
            ]);

            setActivities(logs);
            setStatistics(stats);
        } catch (error) {
            console.error('Error loading activity data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const getActivityIcon = (type: ActivityLogType) => {
        const icons: Record<ActivityLogType, string> = {
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

    const getActivityColor = (type: ActivityLogType) => {
        const colors: Record<ActivityLogType, string> = {
            property_submitted: 'bg-blue-100 text-blue-700',
            property_approved: 'bg-green-100 text-green-700',
            property_rejected: 'bg-red-100 text-red-700',
            property_deleted: 'bg-gray-100 text-gray-700',
            property_featured: 'bg-yellow-100 text-yellow-700',
            user_registered: 'bg-purple-100 text-purple-700',
            config_updated: 'bg-orange-100 text-orange-700',
            payment_verified: 'bg-emerald-100 text-emerald-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            property_submitted: 'Propiedad Enviada',
            property_approved: 'Propiedad Aprobada',
            property_rejected: 'Propiedad Rechazada',
            property_deleted: 'Propiedad Eliminada',
            property_featured: 'Propiedad Destacada',
            user_registered: 'Usuario Registrado',
            config_updated: 'Configuración Actualizada',
            payment_verified: 'Pago Verificado'
        };
        return labels[type] || type;
    };

    // Filter activities by search query
    const filteredActivities = activities.filter(activity =>
        activity.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

    const handleExport = () => {
        const csv = [
            ['ID', 'Tipo', 'Mensaje', 'Usuario', 'Propiedad', 'Fecha'],
            ...filteredActivities.map(log => [
                log.id,
                formatTypeLabel(log.type),
                log.message,
                log.user?.name || 'N/A',
                log.property?.title || 'N/A',
                formatTimestamp(log.timestamp)
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity size={28} />
                        Registro de Actividad
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitorea todas las acciones del sistema
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Download size={18} />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total de Logs</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {statistics.totalLogs}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Activity size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Actividad Reciente (24h)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {statistics.recentActivity}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tipo Más Activo</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                                {statistics.activityByType.length > 0
                                    ? formatTypeLabel(statistics.activityByType[0].type)
                                    : 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {statistics.activityByType.length > 0
                                    ? `${statistics.activityByType[0].count} eventos`
                                    : ''}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Filter size={24} className="text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar en mensajes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="property_submitted">Propiedad Enviada</option>
                        <option value="property_approved">Propiedad Aprobada</option>
                        <option value="property_rejected">Propiedad Rechazada</option>
                        <option value="property_deleted">Propiedad Eliminada</option>
                        <option value="property_featured">Propiedad Destacada</option>
                        <option value="user_registered">Usuario Registrado</option>
                        <option value="config_updated">Configuración Actualizada</option>
                        <option value="payment_verified">Pago Verificado</option>
                    </select>

                    {/* Date Range */}
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todo el tiempo</option>
                        <option value="today">Hoy</option>
                        <option value="week">Última semana</option>
                        <option value="month">Último mes</option>
                    </select>
                </div>
            </div>

            {/* Activity Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando actividad...</p>
                    </div>
                ) : paginatedActivities.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No se encontraron registros de actividad
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mensaje
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedActivities.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getActivityColor(activity.type)}`}>
                                                    <span>{getActivityIcon(activity.type)}</span>
                                                    {formatTypeLabel(activity.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{activity.message}</p>
                                                {activity.property && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Propiedad: {activity.property.title}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {activity.user ? (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {activity.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {activity.user.email}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Sistema</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatTimestamp(activity.timestamp)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredActivities.length)} de {filteredActivities.length} registros
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-4 py-1 text-sm text-gray-700">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ActivityLogsAdmin;
