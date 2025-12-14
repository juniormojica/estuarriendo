import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import { searchCities, City } from '../services/locationService';

interface CityAutocompleteProps {
    value: City | null;
    onChange: (city: City | null) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
    value,
    onChange,
    placeholder = 'Buscar ciudad...',
    required = false,
    error,
    disabled = false
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<City[]>([]);
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

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const cities = await searchCities(query);
                setResults(cities);
                setIsOpen(true);
            } catch (err) {
                console.error('Error searching cities:', err);
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
    }, [query]);

    const handleSelect = (city: City) => {
        onChange(city);
        setQuery('');
        setIsOpen(false);
        setResults([]);
    };

    const handleClear = () => {
        onChange(null);
        setQuery('');
        setResults([]);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad {required && <span className="text-red-500">*</span>}
            </label>

            {value ? (
                // Selected city display
                <div className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-lg bg-white">
                    <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <div>
                            <div className="text-sm font-medium text-gray-900">{value.name}</div>
                            {value.department && (
                                <div className="text-xs text-gray-500">{value.department.name}</div>
                            )}
                        </div>
                    </div>
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                            if (results.length > 0) setIsOpen(true);
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow ${error ? 'border-red-300' : 'border-gray-300'
                            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    />

                    {/* Dropdown */}
                    {isOpen && results.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {results.map((city) => (
                                <button
                                    key={city.id}
                                    type="button"
                                    onClick={() => handleSelect(city)}
                                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-0"
                                >
                                    <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {city.name}
                                        </div>
                                        {city.department && (
                                            <div className="text-xs text-gray-500 truncate">
                                                {city.department.name}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                            No se encontraron ciudades
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

export default CityAutocomplete;
