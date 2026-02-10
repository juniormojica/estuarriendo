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
    onCancelDelete?: () => void;
    onViewInterests: (id: string, title: string) => void;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    isDeleting?: boolean;
}

const OwnerPropertyCard: React.FC<OwnerPropertyCardProps> = ({
    property,
    onToggleRented,
    onDelete,
    onCancelDelete,
    onViewInterests,
    isExpanded = false,
    onToggleExpand,
    isDeleting = false
}) => {
    const getStatusDisplay = () => {
        switch (property.status) {
            case 'approved':
                return {
                    text: '✓ Aprobada',
                    className: 'text-green-700 font-semibold uppercase tracking-wide text-xs'
                };
            case 'pending':
                return {
                    text: '○ Pendiente',
                    className: 'text-amber-700 font-semibold uppercase tracking-wide text-xs'
                };
            case 'rejected':
                return {
                    text: '⨯ Rechazada',
                    className: 'text-red-800 font-semibold uppercase tracking-wide text-xs'
                };
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

    const statusDisplay = getStatusDisplay();

    return (
        <div className={`bg-white border rounded-lg shadow-sm transition-all ${isExpanded ? 'border-primary-500 ring-1 ring-primary-500 shadow-md' : 'border-gray-200 hover:shadow-md'
            }`}>
            <div className="p-5">
                {/* Type Badge & Status */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {isContainer ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                <Building2 size={12} className="mr-1.5" />
                                Contenedor
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                <MapPin size={12} className="mr-1.5" />
                                Propiedad Individual
                            </span>
                        )}
                        <span className="text-xs text-gray-400 font-medium">#{property.id}</span>
                    </div>
                    <div className={statusDisplay.className}>
                        {statusDisplay.text}
                    </div>
                </div>

                {/* Main Content Row */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                            {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <MapPin size={14} className="mr-1 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{getLocationDisplay()}</span>
                        </div>
                    </div>

                    {/* Price or Unit Count */}
                    <div className="text-right flex-shrink-0">
                        {!isContainer ? (
                            <div className="text-xl font-bold text-gray-900 tabular-nums">
                                {formatPrice(property.monthlyRent)}
                                <span className="text-sm font-normal text-gray-500 ml-1">/mes</span>
                            </div>
                        ) : (
                            <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                    {totalUnits} Habitaciones
                                </div>
                                <div className="text-xs text-gray-500">
                                    {pendingUnits > 0 && <span className="text-amber-600 font-medium">{pendingUnits} Pendientes</span>}
                                    {pendingUnits > 0 && rentedUnits > 0 && <span className="mx-1">•</span>}
                                    {rentedUnits > 0 && <span className="text-green-600 font-medium">{rentedUnits} Rentadas</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rejection Reason */}
                {property.status === 'rejected' && property.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                        <XCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-red-900">Motivo de rechazo:</p>
                            <p className="text-xs text-red-700 mt-0.5">{property.rejectionReason}</p>
                        </div>
                    </div>
                )}

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <Link
                            to={`/editar-propiedad/${property.id}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Edit size={14} className="mr-1.5" />
                            Editar
                        </Link>

                        {/* Public View */}
                        <Link
                            to={`/propiedad/${property.id}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                        >
                            <Eye size={14} className="mr-1.5" />
                            Ver
                        </Link>

                        {/* Toggle Status (Only for Approved Single Properties) */}
                        {property.status === 'approved' && !isContainer && (
                            <button
                                onClick={() => onToggleRented(String(property.id))}
                                className={`
                                    inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                                    ${property.isRented
                                        ? 'text-gray-600 hover:bg-gray-50'
                                        : 'text-primary-600 hover:bg-primary-50'
                                    }
                                `}
                            >
                                <DoorOpen size={14} className="mr-1.5" />
                                {property.isRented ? 'Marcar Disponible' : 'Marcar Rentada'}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Delete Button */}
                        {isDeleting ? (
                            <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-md animate-fadeIn">
                                <span className="text-xs text-red-700 font-medium">¿Confirmar?</span>
                                <button
                                    onClick={() => onDelete(String(property.id))}
                                    className="text-xs bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 transition-colors"
                                >
                                    Si
                                </button>
                                <button
                                    onClick={onCancelDelete}
                                    className="text-xs bg-white text-gray-600 border border-gray-200 px-2 py-0.5 rounded hover:bg-gray-50 transition-colors"
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onDelete(String(property.id))}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar Propiedad"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                        {/* Expand/Collapse Button (Main Action for Containers) */}
                        {isContainer && totalUnits > 0 && onToggleExpand && (
                            <button
                                onClick={onToggleExpand}
                                className={`
                                    flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ml-2
                                    ${isExpanded
                                        ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp size={16} />
                                        Ocultar Habitaciones
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={16} />
                                        Ver Habitaciones ({totalUnits})
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerPropertyCard;

