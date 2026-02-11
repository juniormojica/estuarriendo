import React from 'react';
import { Eye, CheckCircle, Clock, XCircle, Users, Bed, DoorOpen } from 'lucide-react';
import { PropertyUnit } from '../../types';

interface OwnerUnitCardProps {
    unit: PropertyUnit;
    containerId: number;
    onToggleRented: (unitId: string) => void;
    onView: (unitId: string) => void;
}

const OwnerUnitCard: React.FC<OwnerUnitCardProps> = ({
    unit,
    containerId,
    onToggleRented,
    onView
}) => {
    const getStatusBadge = () => {
        switch (unit.status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aprobada
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rechazada
                    </span>
                );
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: unit.currency || 'COP',
            maximumFractionDigits: 0
        }).format(price);
    };

    const getRoomTypeLabel = () => {
        if (unit.roomType === 'individual') return 'Individual';
        if (unit.roomType === 'shared') return `Compartida (${unit.bedsInRoom || 2} camas)`;
        return unit.roomType;
    };

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-colors shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Thumbnail */}
                <div className="w-full sm:w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    {unit.images && unit.images.length > 0 ? (
                        <img
                            src={typeof unit.images[0] === 'string' ? unit.images[0] : unit.images[0].url}
                            alt={unit.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Bed size={24} />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{unit.title}</h4>
                        {getStatusBadge()}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Users size={14} className="text-gray-400" />
                            <span>{getRoomTypeLabel()}</span>
                        </div>
                        <div className="font-semibold text-primary-600">
                            {formatPrice(unit.monthlyRent)}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Rental Status Toggle - Only for approved units */}
                    {unit.status === 'approved' && (
                        <button
                            onClick={() => onToggleRented(String(unit.id))}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${unit.isRented
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                }`}
                            title={unit.isRented ? 'Marcar como disponible' : 'Marcar como rentada'}
                        >
                            <DoorOpen size={14} className="mr-1.5" />
                            {unit.isRented ? 'Rentada' : 'Disponible'}
                        </button>
                    )}

                    {/* View Button */}
                    <button
                        onClick={() => onView(String(unit.id))}
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                        title="Ver detalles"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OwnerUnitCard;
