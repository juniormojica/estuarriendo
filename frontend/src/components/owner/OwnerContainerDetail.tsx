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
        <div className="mt-4 space-y-3 pl-4 border-l-4 border-blue-200">
            <div className="text-sm font-medium text-gray-700 mb-3">
                Habitaciones ({container.units.length})
            </div>
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
    );
};

export default OwnerContainerDetail;
