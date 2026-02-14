import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { api } from '../services/api';

interface Institution {
    id: number;
    name: string;
    type: string;
    cityId: number;
    city?: {
        id: number;
        name: string;
    };
}

interface InstitutionSearchProps {
    onSelect: (institution: Institution | null) => void;
    selectedInstitution?: Institution | null;
    placeholder?: string;
    cityId?: number;
    // Receive types list from parent instead of selected type
    institutionTypes?: string[];
}

const InstitutionSearch: React.FC<InstitutionSearchProps> = ({
    onSelect,
    selectedInstitution,
    placeholder = 'Buscar universidad o instituto...',
    cityId,
    institutionTypes = []
}) => {
    const [query, setQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [results, setResults] = useState<Institution[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search institutions with debounce
    useEffect(() => {
        const searchInstitutions = async () => {
            if (query.length < 2 && !selectedType) {
                setResults([]);
                return;
            }

            // Don't search if query is too short (unless type is selected perhaps? No, usually name is required)
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const params: any = { limit: 10 };
                if (cityId) params.cityId = cityId;
                if (selectedType) params.type = selectedType;

                const results = await api.searchInstitutions(query, params);
                setResults(results);
                setIsOpen(true);
            } catch (error) {
                console.error('Error searching institutions:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchInstitutions, 300);
        return () => clearTimeout(timeoutId);
    }, [query, cityId, selectedType]);

    const handleSelect = (institution: Institution) => {
        onSelect(institution);
        setQuery('');
        setIsOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setQuery('');
        setResults([]);
        setSelectedType('');
    };

    const getInstitutionIcon = (instType: string) => {
        if (!instType) return '🏛️';
        const lower = instType.toLowerCase();
        if (lower.includes('universidad')) return '🎓';
        if (lower.includes('tecnológica') || lower.includes('técnica') || lower.includes('instituto')) return '⚙️';
        return '📚';
    };

    const getInstitutionTypeLabel = (instType: string) => {
        return instType; // DB types are already formatted names
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            {/* Selected Institution Display */}
            {selectedInstitution ? (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-lg">{getInstitutionIcon(selectedInstitution.type)}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {selectedInstitution.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {getInstitutionTypeLabel(selectedInstitution.type)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="ml-2 p-1 hover:bg-emerald-100 rounded transition-colors flex-shrink-0"
                        aria-label="Limpiar selección"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
            ) : (
                <>
                    {/* Search Input with Integrated Type Filter */}
                    <div className="relative flex shadow-sm rounded-md">
                        <div className="relative flex-grow focus-within:z-10">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => query.length >= 2 && setIsOpen(true)}
                                placeholder={placeholder}
                                className="focus:ring-emerald-500 focus:border-emerald-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300 min-h-[44px]"
                            />
                        </div>
                        <div className="-ml-px relative">
                            <label htmlFor="type-filter" className="sr-only">Filtrar por tipo</label>
                            <select
                                id="type-filter"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="focus:ring-emerald-500 focus:border-emerald-500 relative block w-full rounded-none rounded-r-md bg-gray-50 text-xs sm:text-sm border-gray-300 min-h-[44px] pl-2 pr-8 text-gray-700 hover:bg-gray-100 cursor-pointer max-w-[100px] sm:max-w-[140px]"
                                title="Filtrar por tipo de institución"
                            >
                                <option value="">Todos</option>
                                {institutionTypes?.map((type) => (
                                    <option key={type} value={type}>
                                        {/* Shorten known long names for the small dropdown if needed, or CSS truncation */}
                                        {type.length > 20 ? type.substring(0, 18) + '...' : type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isLoading && (
                            <div className="absolute right-[110px] sm:right-[150px] top-1/2 transform -translate-y-1/2 z-20">
                                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Dropdown Results */}
                    {isOpen && results.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {results.map((institution) => (
                                <button
                                    key={institution.id}
                                    onClick={() => handleSelect(institution)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">{getInstitutionIcon(institution.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {institution.name}
                                            </p>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span>{getInstitutionTypeLabel(institution.type)}</span>
                                                {institution.city && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {institution.city.name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
                            <p className="text-sm text-gray-500 text-center">
                                No se encontraron instituciones{selectedType ? ' con este filtro' : ''}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default InstitutionSearch;
