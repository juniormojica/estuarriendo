import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Filter, Check } from 'lucide-react';
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
    const [showTypeFilter, setShowTypeFilter] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowTypeFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search institutions with debounce
    useEffect(() => {
        const searchInstitutions = async () => {
            // ... existing search logic ...
            if (query.length < 2 && !selectedType) {
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
        setShowTypeFilter(false);
    };

    const handleClear = () => {
        onSelect(null);
        setQuery('');
        setResults([]);
        setSelectedType('');
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type === selectedType ? '' : type);
        setShowTypeFilter(false);
        // If we have a query, re-search automatically via effect
        // If no query but type selected, we might want to trigger search? 
        // Current logic requires query length >= 2 OR selectedType to search
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
                    {/* Search Input with Floating Filter Button */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => (query.length >= 2 || selectedType) && setIsOpen(true)}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        />

                        {/* Loading Spinner */}
                        {isLoading && (
                            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {/* Filter Trigger Button */}
                        <div ref={filterRef} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <button
                                onClick={() => setShowTypeFilter(!showTypeFilter)}
                                className={`p-1.5 rounded-md transition-colors ${selectedType
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                                title="Filtrar por tipo"
                            >
                                <Filter className="h-4 w-4" />
                            </button>

                            {/* Custom Type Filter Dropdown */}
                            {showTypeFilter && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-[60] overflow-hidden">
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Filtrar por tipo
                                    </div>
                                    <div className="max-h-60 overflow-y-auto py-1">
                                        <button
                                            onClick={() => handleTypeSelect('')}
                                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${!selectedType ? 'text-emerald-600 font-medium bg-emerald-50/50' : 'text-gray-700'
                                                }`}
                                        >
                                            <span>Todos</span>
                                            {!selectedType && <Check className="h-3 w-3" />}
                                        </button>
                                        {institutionTypes?.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => handleTypeSelect(type)}
                                                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${selectedType === type ? 'text-emerald-600 font-medium bg-emerald-50/50' : 'text-gray-700'
                                                    }`}
                                            >
                                                <span className="truncate mr-2" title={type}>{type}</span>
                                                {selectedType === type && <Check className="h-3 w-3 flex-shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Results Dropdown */}
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
                    {isOpen && (query.length >= 2 || selectedType) && results.length === 0 && !isLoading && (
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
