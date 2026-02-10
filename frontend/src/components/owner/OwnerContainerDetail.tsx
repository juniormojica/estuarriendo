import React from 'react';
import { Property } from '../../types';
import OwnerUnitCard from './OwnerUnitCard';

interface OwnerContainerDetailProps {
    container: Property;
    onToggleUnitRented: (unitId: string) => void;
    onViewUnit: (unitId: string) => void;
}

const OwnerContainerDetail: React.FC<OwnerContainerDetailProps> = ({
    container,
    onToggleUnitRented,
    onViewUnit
}) => {
    if (!container.units || container.units.length === 0) {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500 text-sm">
                No hay habitaciones registradas en este contenedor.
            </div>
        );
    }

    // Sort units: pending first, then approved, then rejected
    const sortedUnits = [...container.units].sort((a, b) => {
        const statusOrder = { pending: 0, approved: 1, rejected: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    return (
        <div className="mt-[-8px] mx-4 bg-gray-50 border-x border-b border-gray-200 rounded-b-lg p-4 shadow-inner">
            <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Listado de Habitaciones
                </h4>
                <div className="text-xs text-gray-400">
                    Total: {container.units.length}
                </div>
            </div>

            <div className="space-y-3">
                {sortedUnits.map((unit) => (
                    <OwnerUnitCard
                        key={unit.id}
                        unit={unit}
                        containerId={container.id}
                        onToggleRented={onToggleUnitRented}
                        onView={onViewUnit}
                    />
                ))}
            </div>
        </div>
    );
};

export default OwnerContainerDetail;
