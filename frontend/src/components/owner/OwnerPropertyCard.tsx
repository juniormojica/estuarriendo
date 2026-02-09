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
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow transition-shadow">
            <div className="p-6">
                {/* Header - Title + Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-stone-900 truncate">
                                {property.title}
                            </h3>
                            {isContainer && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                                    <Building2 size={12} className="mr-1" />
                                    Contenedor
                                </span>
                            )}
                        </div>
                        <div className="flex items-center text-sm text-stone-500 mb-1">
                            <MapPin size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{getLocationDisplay()}</span>
                        </div>
                    </div>

                    {/* Status - Subtle, right-aligned */}
                    <div className={statusDisplay.className}>
                        {statusDisplay.text}
                    </div>
                </div>

                {/* Price (if not container) */}
                {!isContainer && (
                    <div className="text-xl font-bold text-stone-900 tabular-nums mb-4">
                        {formatPrice(property.monthlyRent)}
                    </div>
                )}

                {/* Container Stats */}
                {isContainer && totalUnits > 0 && (
                    <div className="grid grid-cols-3 gap-3 pt-4 mb-4 border-t border-stone-200">
                        {/* Total Units */}
                        <div>
                            <div className="text-2xl font-bold text-stone-900 tabular-nums">
                                {totalUnits}
                            </div>
                            <div className="text-xs text-stone-500 uppercase tracking-wide">
                                Habitaciones
                            </div>
                        </div>

                        {/* Pending */}
                        <div>
                            <div className="text-2xl font-bold text-amber-700 tabular-nums">
                                {pendingUnits}
                            </div>
                            <div className="text-xs text-stone-500 uppercase tracking-wide">
                                Pendientes
                            </div>
                        </div>

                        {/* Rented */}
                        <div>
                            <div className="text-2xl font-bold text-green-700 tabular-nums">
                                {rentedUnits}
                            </div>
                            <div className="text-xs text-stone-500 uppercase tracking-wide">
                                Rentadas
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Reason */}
                {property.status === 'rejected' && property.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs font-semibold text-red-900 mb-1">
                            Razón de rechazo:
                        </p>
                        <p className="text-xs text-red-700">
                            {property.rejectionReason}
                        </p>
                    </div>
                )}

                {/* Actions - Grouped Hierarchy */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    {/* Primary Actions (left) */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Toggle */}
                        {property.status === 'approved' && !isContainer && (
                            <button
                                onClick={() => onToggleRented(String(property.id))}
                                className={`
                                    px-3 py-1.5 rounded-md text-xs font-medium border transition-all
                                    ${property.isRented
                                        ? 'border-stone-300 text-stone-700 bg-stone-50 hover:bg-stone-100'
                                        : 'border-teal-600 text-teal-700 bg-teal-50 hover:bg-teal-100'
                                    }
                                `}
                            >
                                <DoorOpen size={14} className="inline mr-1" />
                                {property.isRented ? 'Rentada' : 'Disponible'}
                            </button>
                        )}

                        {/* Edit (destacado si rechazada) */}
                        <Link
                            to={`/editar-propiedad/${property.id}`}
                            className={`
                                px-3 py-1.5 rounded-md text-xs font-medium border transition-all inline-flex items-center
                                ${property.status === 'rejected'
                                    ? 'border-orange-500 text-orange-700 bg-orange-50 hover:bg-orange-100 shadow-sm'
                                    : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                                }
                            `}
                        >
                            <Edit size={14} className="mr-1" />
                            Editar
                        </Link>
                    </div>

                    {/* Secondary Actions (right) */}
                    <div className="flex items-center gap-1">
                        <Link
                            to={`/propiedad/${property.id}`}
                            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                            title="Ver Propiedad"
                        >
                            <Eye size={16} />
                        </Link>

                        <button
                            onClick={() => onViewInterests(String(property.id), property.title)}
                            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                            title="Ver Interesados"
                        >
                            <Users size={16} />
                        </button>

                        {/* Destructive (separado visualmente) */}
                        <div className="ml-2 pl-2 border-l border-stone-200">
                            {isDeleting ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-red-600 font-medium">¿Eliminar?</span>
                                    <button
                                        onClick={() => onDelete(String(property.id))}
                                        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >
                                        Sí
                                    </button>
                                    <button
                                        onClick={() => {/* Cancel handled by parent */ }}
                                        className="text-xs bg-stone-200 text-stone-700 px-3 py-1 rounded hover:bg-stone-300"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onDelete(String(property.id))}
                                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        {/* Expand Button for Containers */}
                        {isContainer && totalUnits > 0 && onToggleExpand && (
                            <button
                                onClick={onToggleExpand}
                                className="ml-2 pl-2 border-l border-stone-200 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors rounded-md"
                                title={isExpanded ? 'Ocultar habitaciones' : 'Ver habitaciones'}
                            >
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerPropertyCard;

