import React from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, Edit, Trash2, Users, Eye,
    CheckCircle, Clock, XCircle, ChevronDown, ChevronUp,
    Building2, DoorOpen
} from 'lucide-react';
import { Property } from '../../types';

interface OwnerPropertyCardProps {
    property: Property;
    onToggleRented: (id: string) => void;
    onDelete: (id: string) => void;
    onViewInterests: (id: string, title: string) => void;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    isDeleting?: boolean;
}

const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({
    property,
    onToggleRented,
    onDelete,
    onViewInterests,
    isExpanded = false,
    onToggleExpand,
    isDeleting = false
}) => {
    const getStatusBadge = () => {
        switch (property.status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aprobada
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rechazada
                    </span>
                );
        }
    };

    const getLocationDisplay = (): string => {
        const parts: string[] = [];

        if (property.location?.neighborhood) {
            parts.push(property.location.neighborhood);
        }

        const cityName = typeof property.location?.city === 'object'
            ? (property.location.city as any)?.name
            : property.location?.city;
        if (cityName) {
            parts.push(cityName);
        }

        return parts.length > 0 ? parts.join(', ') : 'Sin ubicación';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: property.currency || 'COP',
            maximumFractionDigits: 0
        }).format(price);
    };

    const isContainer = property.isContainer;
    const pendingUnits = property.units?.filter(u => u.status === 'pending').length || 0;
    const rentedUnits = property.units?.filter(u => u.isRented).length || 0;
    const totalUnits = property.units?.length || 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {property.title}
                            </h3>
                            {isContainer && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    <Building2 size={12} className="mr-1" />
                                    Contenedor
                                </span>
                            )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{getLocationDisplay()}</span>
                        </div>
                        {!isContainer && (
                            <div className="text-lg font-bold text-blue-600">
                                {formatPrice(property.monthlyRent)}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Container Stats */}
                {isContainer && totalUnits > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold text-blue-700">{totalUnits}</div>
                            <div className="text-xs text-blue-600">Habitaciones</div>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold text-yellow-700">{pendingUnits}</div>
                            <div className="text-xs text-yellow-600">Pendientes</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold text-green-700">{rentedUnits}</div>
                            <div className="text-xs text-green-600">Rentadas</div>
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {property.status === 'rejected' && property.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-100">
                        <p className="text-xs text-red-700 font-medium mb-1">
                            Razón de rechazo:
                        </p>
                        <p className="text-xs text-red-600">
                            {property.rejectionReason}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Rental Status Toggle */}
                    {property.status === 'approved' && !isContainer && (
                        <button
                            onClick={() => onToggleRented(String(property.id))}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${property.isRented
                                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                }`}
                        >
                            <DoorOpen size={14} className="mr-1" />
                            {property.isRented ? 'Rentada' : 'Disponible'}
                        </button>
                    )}

                    {/* View Button */}
                    <Link
                        to={`/propiedad/${property.id}`}
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
                        title="Ver Propiedad"
                    >
                        <Eye className="h-4 w-4" />
                    </Link>

                    {/* Interests Button */}
                    <button
                        onClick={() => onViewInterests(String(property.id), property.title)}
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        title="Ver Interesados"
                    >
                        <Users className="h-4 w-4" />
                    </button>

                    {/* Edit Button */}
                    <Link
                        to={`/editar-propiedad/${property.id}`}
                        className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors rounded-lg ${property.status === 'rejected'
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 ring-2 ring-orange-300'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                        title={property.status === 'rejected' ? 'Editar y reenviar' : 'Editar'}
                    >
                        <Edit className="h-4 w-4" />
                    </Link>

                    {/* Delete Button */}
                    {isDeleting ? (
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-red-600 font-medium">¿Eliminar?</span>
                            <button
                                onClick={() => onDelete(String(property.id))}
                                className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                                Sí
                            </button>
                            <button
                                onClick={() => {/* Cancel handled by parent */ }}
                                className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onDelete(String(property.id))}
                            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ml-auto"
                            title="Eliminar"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}

                    {/* Expand Button for Containers */}
                    {isContainer && totalUnits > 0 && onToggleExpand && (
                        <button
                            onClick={onToggleExpand}
                            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
                            title={isExpanded ? 'Ocultar habitaciones' : 'Ver habitaciones'}
                        >
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerPropertyCard;
