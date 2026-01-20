import React from 'react';
import { CheckCircle, Clock, XCircle, List } from 'lucide-react';

interface PropertyStatusFiltersProps {
    counts: {
        all: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    activeFilter: 'all' | 'pending' | 'approved' | 'rejected';
    onChange: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void;
}

const PropertyStatusFilters: React.FC<PropertyStatusFiltersProps> = ({
    counts,
    activeFilter,
    onChange
}) => {
    const filters = [
        {
            key: 'all' as const,
            label: 'Todas',
            count: counts.all,
            icon: List,
            color: 'blue'
        },
        {
            key: 'pending' as const,
            label: 'Pendientes',
            count: counts.pending,
            icon: Clock,
            color: 'yellow'
        },
        {
            key: 'approved' as const,
            label: 'Aprobadas',
            count: counts.approved,
            icon: CheckCircle,
            color: 'green'
        },
        {
            key: 'rejected' as const,
            label: 'Rechazadas',
            count: counts.rejected,
            icon: XCircle,
            color: 'red'
        }
    ];

    const getColorClasses = (color: string, isActive: boolean) => {
        const colors = {
            blue: {
                active: 'bg-blue-100 text-blue-700 border-blue-300',
                inactive: 'bg-white text-gray-600 border-gray-200 hover:bg-blue-50'
            },
            yellow: {
                active: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                inactive: 'bg-white text-gray-600 border-gray-200 hover:bg-yellow-50'
            },
            green: {
                active: 'bg-green-100 text-green-700 border-green-300',
                inactive: 'bg-white text-gray-600 border-gray-200 hover:bg-green-50'
            },
            red: {
                active: 'bg-red-100 text-red-700 border-red-300',
                inactive: 'bg-white text-gray-600 border-gray-200 hover:bg-red-50'
            }
        };

        return isActive ? colors[color as keyof typeof colors].active : colors[color as keyof typeof colors].inactive;
    };

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilter === filter.key;

                return (
                    <button
                        key={filter.key}
                        onClick={() => onChange(filter.key)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg border-2 
                            transition-all duration-200 font-medium text-sm
                            ${getColorClasses(filter.color, isActive)}
                            ${isActive ? 'shadow-sm' : ''}
                        `}
                    >
                        <Icon size={16} />
                        <span>{filter.label}</span>
                        <span className={`
                            ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                            ${isActive ? 'bg-white/50' : 'bg-gray-100'}
                        `}>
                            {filter.count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default PropertyStatusFilters;
