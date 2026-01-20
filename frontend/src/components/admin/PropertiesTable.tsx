import React, { useState } from 'react';
import { Property, User } from '../../types';
import { Search, Filter, Eye, CheckCircle, XCircle, Trash2, Star, Edit } from 'lucide-react';

interface PropertiesTableProps {
    properties: Property[];
    onView: (property: Property) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit?: (property: Property) => void;
    onToggleFeatured: (id: string) => void;
    showActions?: boolean;
    users?: User[];
    defaultFilter?: 'all' | 'pending' | 'approved' | 'rejected';
}

const PropertiesTable: React.FC<PropertiesTableProps> = ({
    properties,
    onView,
    onApprove,
    onReject,
    onDelete,
    onEdit,
    onToggleFeatured,
    showActions = true,
    users = [],
    defaultFilter = 'all'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(defaultFilter);
    const [filterUser, setFilterUser] = useState<string>('all');
    const [filterCity, setFilterCity] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get unique cities from properties (handling both string and object formats)
    const cities = Array.from(new Set(
        properties.map(p => {
            const city = p.location?.city;
            if (typeof city === 'object') return (city as any)?.name;
            return city || p.location?.neighborhood;
        }).filter(Boolean)
    )).sort() as string[];

    const getOwner = (ownerId?: string): User | undefined => {
        if (!ownerId) return undefined;
        return users.find(u => u.id === ownerId);
    };

    const getOwnerName = (ownerId?: string) => {
        const owner = getOwner(ownerId);
        return owner?.name || owner?.email || 'Desconocido';
    };

    const getOwnerEmail = (ownerId?: string) => {
        const owner = getOwner(ownerId);
        return owner?.email || '';
    };

    const getLocationDisplay = (property: Property): string => {
        const parts: string[] = [];

        // Handle neighborhood
        if (property.location?.neighborhood) {
            parts.push(property.location.neighborhood);
        }

        // Handle city - can be string or object with name
        const cityName = typeof property.location?.city === 'object'
            ? (property.location.city as any)?.name
            : property.location?.city;
        if (cityName) {
            parts.push(cityName);
        }

        // Handle department - can be string or object with name  
        const deptName = typeof property.location?.department === 'object'
            ? (property.location.department as any)?.name
            : property.location?.department;
        if (deptName && deptName !== cityName) {
            parts.push(deptName);
        }

        return parts.length > 0 ? parts.join(', ') : 'Sin ubicación';
    };

    // Filter properties
    const filteredProperties = properties.filter(property => {
        const ownerName = getOwnerName(property.ownerId);
        const ownerEmail = getOwnerEmail(property.ownerId);
        const locationStr = getLocationDisplay(property);
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = searchTerm === '' ||
            property.title.toLowerCase().includes(searchLower) ||
            locationStr.toLowerCase().includes(searchLower) ||
            (property.type?.name || '').toLowerCase().includes(searchLower) ||
            ownerName.toLowerCase().includes(searchLower) ||
            ownerEmail.toLowerCase().includes(searchLower) ||
            String(property.id).includes(searchLower);

        const matchesStatus = filterStatus === 'all' || property.status === filterStatus;

        // Fix: Compare with actual ownerId instead of artificial ID
        const matchesUser = filterUser === 'all' || property.ownerId === filterUser;

        const matchesCity = filterCity === 'all' || (() => {
            const cityName = typeof property.location?.city === 'object'
                ? (property.location.city as any)?.name
                : property.location?.city;
            return cityName === filterCity || property.location?.neighborhood === filterCity;
        })();

        return matchesSearch && matchesStatus && matchesUser && matchesCity;
    });

    // Pagination
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

    const getStatusBadge = (status: Property['status']) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };

        const labels = {
            pending: 'Pendiente',
            approved: 'Aprobada',
            rejected: 'Rechazada'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Search and Filter Bar */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por título, ciudad, tipo o propietario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="approved">Aprobadas</option>
                            <option value="rejected">Rechazadas</option>
                        </select>

                        <select
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Todas las ciudades</option>
                            {cities.map(city => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>

                        {users.length > 0 && (
                            <select
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-[200px]"
                            >
                                <option value="all">Todos los usuarios</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    Mostrando {paginatedProperties.length} de {filteredProperties.length} propiedades
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Propiedad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Propietario
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ubicación
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            {showActions && (
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedProperties.map((property) => (
                            <tr
                                key={property.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => onView(property)}
                            >
                                <td className="px-4 py-4">
                                    <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                                        {property.title}
                                        {property.isFeatured && (
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                        )}
                                        {property.isContainer && (
                                            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded border border-blue-200">
                                                Contenedor
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900">
                                    <div className="font-medium">{getOwnerName(property.ownerId)}</div>
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900">
                                    {getLocationDisplay(property)}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-900 capitalize">
                                    {property.type?.name || property.type}
                                </td>
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                    {new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: property.currency
                                    }).format(property.monthlyRent || property.price || 0)}
                                </td>
                                <td className="px-4 py-4">
                                    {getStatusBadge(property.status)}
                                </td>
                                {showActions && (
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2 relative z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(property);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {property.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onApprove(String(property.id));
                                                        }}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Aprobar"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onReject(String(property.id));
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Rechazar"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleFeatured(String(property.id));
                                                }}
                                                disabled={property.status !== 'approved'}
                                                className={`p-2 rounded-lg transition-colors ${property.status !== 'approved'
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : property.isFeatured
                                                        ? 'text-yellow-600 hover:bg-yellow-50'
                                                        : 'text-gray-400 hover:bg-gray-50'
                                                    }`}
                                                title={
                                                    property.status !== 'approved'
                                                        ? 'Solo se pueden destacar propiedades aprobadas'
                                                        : property.isFeatured
                                                            ? 'Quitar destacado'
                                                            : 'Destacar'
                                                }
                                            >
                                                <Star size={18} className={property.isFeatured ? 'fill-yellow-600' : ''} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(String(property.id));
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {onEdit && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(property);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <span className="text-sm text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {paginatedProperties.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No se encontraron propiedades</p>
                </div>
            )}
        </div>
    );
};

export default PropertiesTable;
