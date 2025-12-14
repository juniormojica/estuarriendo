import React, { useState, useEffect, useRef } from 'react';
import { Search, GraduationCap, Building2, School, X, Loader2 } from 'lucide-react';
import { searchInstitutions, getInstitutions, Institution } from '../services/institutionService';

interface InstitutionAutocompleteProps {
    cityId: number | null;
    value: Institution | null;
    onChange: (institution: Institution | null) => void;
    placeholder?: string;
    disabled?: boolean;
    type?: 'universidad' | 'corporacion' | 'instituto';
}

const InstitutionAutocomplete: React.FC<InstitutionAutocompleteProps> = ({
    cityId,
    value,
    onChange,
    placeholder = 'Buscar institución...',
    disabled = false,
    type
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Institution[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

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

    // Load all institutions when opening dropdown (if no query)
    const loadInstitutions = async () => {
        if (!cityId) return;

        setIsLoading(true);
        try {
            const filters: any = { cityId };
            if (type) filters.type = type;

            const institutions = await getInstitutions(filters);
            setResults(institutions);
        } catch (err) {
            console.error('Error loading institutions:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!cityId) {
            setResults([]);
            return;
        }

        if (query.trim().length === 0) {
            // Load all institutions if no query
            if (isOpen) {
                loadInstitutions();
            }
            return;
        }

        if (query.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const institutions = await searchInstitutions(query, cityId);
                setResults(type ? institutions.filter(i => i.type === type) : institutions);
                setIsOpen(true);
            } catch (err) {
                console.error('Error searching institutions:', err);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, cityId, type, isOpen]);

    const handleSelect = (institution: Institution) => {
        onChange(institution);
        setQuery('');
        setIsOpen(false);
        setResults([]);
    };

    const handleClear = () => {
        onChange(null);
        setQuery('');
        setResults([]);
    };

    const getIcon = (instType: string) => {
        switch (instType) {
            case 'universidad':
                return <GraduationCap className="h-4 w-4 text-emerald-600" />;
            case 'corporacion':
                return <Building2 className="h-4 w-4 text-blue-600" />;
            case 'instituto':
                return <School className="h-4 w-4 text-purple-600" />;
            default:
                return <GraduationCap className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTypeBadge = (instType: string) => {
        const badges = {
            universidad: 'bg-emerald-100 text-emerald-700',
            corporacion: 'bg-blue-100 text-blue-700',
            instituto: 'bg-purple-100 text-purple-700'
        };
        return badges[instType as keyof typeof badges] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div ref={wrapperRef} className="relative">
            {value ? (
                // Selected institution display
                <div className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getIcon(value.type)}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{value.name}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${getTypeBadge(value.type)}`}>
                                {value.type.charAt(0).toUpperCase() + value.type.slice(1)}
                            </span>
                        </div>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ) : (
                // Search input
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5 text-gray-400" />
                        )}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (!cityId) return;
                            setIsOpen(true);
                            if (query.length === 0) {
                                loadInstitutions();
                            }
                        }}
                        placeholder={!cityId ? 'Primero selecciona una ciudad' : placeholder}
                        disabled={disabled || !cityId}
                        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow ${disabled || !cityId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                            }`}
                    />

                    {/* Dropdown */}
                    {isOpen && results.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {results.map((institution) => (
                                <button
                                    key={institution.id}
                                    type="button"
                                    onClick={() => handleSelect(institution)}
                                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-0"
                                >
                                    {getIcon(institution.type)}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {institution.name}
                                        </div>
                                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${getTypeBadge(institution.type)}`}>
                                            {institution.type.charAt(0).toUpperCase() + institution.type.slice(1)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {isOpen && !isLoading && cityId && query.length >= 2 && results.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                            No se encontraron instituciones
                        </div>
                    )}

                    {/* No city selected message */}
                    {!cityId && isOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                            Selecciona una ciudad primero
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InstitutionAutocomplete;
