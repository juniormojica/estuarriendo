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
        },
        {
            key: 'pending' as const,
            label: 'Pendientes',
            count: counts.pending,
            icon: Clock,
        },
        {
            key: 'approved' as const,
            label: 'Aprobadas',
            count: counts.approved,
            icon: CheckCircle,
        },
        {
            key: 'rejected' as const,
            label: 'Rechazadas',
            count: counts.rejected,
            icon: XCircle,
        }
    ];

    return (
        <div className="mb-6">
            {/* Segmented Control - Desktop */}
            <div className="hidden sm:inline-flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                {filters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.key;

                    return (
                        <button
                            key={filter.key}
                            onClick={() => onChange(filter.key)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }
                            `}
                        >
                            <Icon size={16} />
                            <span>{filter.label}</span>
                            {filter.count > 0 && (
                                <span className={`
                                    ml-1 px-2 py-0.5 rounded-full text-xs font-bold tabular-nums
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {filter.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Mobile - Stacked buttons */}
            <div className="sm:hidden space-y-2">
                {filters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.key;

                    return (
                        <button
                            key={filter.key}
                            onClick={() => onChange(filter.key)}
                            className={`
                                w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all
                                ${isActive
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={18} />
                                <span className="font-medium">{filter.label}</span>
                            </div>
                            {filter.count > 0 && (
                                <span className={`
                                    px-2.5 py-1 rounded-full text-xs font-bold tabular-nums
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}
                                `}>
                                    {filter.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PropertyStatusFilters;

