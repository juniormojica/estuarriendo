import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType, Department } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import { api } from '../services/api';
import InstitutionSearch from './InstitutionSearch';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  isLoading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange, isLoading }) => {
  const dispatch = useAppDispatch();
  const { items: amenities } = useAppSelector((state) => state.amenities);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);

  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [institutionTypes, setInstitutionTypes] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFiltersType>({
    priceMin: undefined,
    priceMax: undefined
  });

  // Local state for price inputs to prevent re-renders
  const [priceMinInput, setPriceMinInput] = useState<string>('');
  const [priceMaxInput, setPriceMaxInput] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');

  // Initial Data Load (Amenities, Departments, Institution Types)
  useEffect(() => {
    dispatch(fetchAmenities());

    const loadInitialData = async () => {
      try {
        // Load Departments
        const deptsData = await api.getDepartments();
        // Sort alphabetically
        const sortedDepts = deptsData
          .filter((d: any) => d.isActive !== false)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setDepartments(sortedDepts);

        // Load Institution Types (distinct from API)
        const instData = await api.getInstitutions();
        // Extract unique types using Set
        const types = [...new Set(instData.map((i: any) => i.type))].sort();
        setInstitutionTypes(types);

      } catch (error) {
        console.error('Error loading initial filter data:', error);
      }
    };

    loadInitialData();
  }, [dispatch]);

  // Load cities whenever department changes (or initially)
  useEffect(() => {
    const loadCities = async () => {
      try {
        const params = filters.departmentId ? { departmentId: filters.departmentId } : undefined;
        const citiesData = await api.getCities(params);

        // Extract unique city names and sort them
        const cityNames = citiesData
          .filter((city: any) => city.isActive !== false)
          .map((city: any) => city.name)
          .sort();
        setCities(cityNames);
      } catch (error) {
        console.error('Error loading cities:', error);
      }
    };
    loadCities();
  }, [filters.departmentId]);

  const handleFilterChange = useCallback((key: keyof SearchFiltersType, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };

      // Special handling for cascading resets
      if (key === 'departmentId') {
        // When department changes, reset city
        newFilters.city = undefined;
      }

      onFiltersChange(newFilters);
      return newFilters;
    });
  }, [onFiltersChange]);

  // Handle price input changes WITHOUT auto-search
  const handlePriceInputChange = useCallback((type: 'min' | 'max', value: string) => {
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, '');

    if (type === 'min') {
      setPriceMinInput(numericValue);
    } else {
      setPriceMaxInput(numericValue);
    }

    // Clear previous error
    setPriceError('');
  }, []);

  // Apply price filters when user clicks the button
  const applyPriceFilters = useCallback(() => {
    const parsedMin = priceMinInput ? parseInt(priceMinInput) : undefined;
    const parsedMax = priceMaxInput ? parseInt(priceMaxInput) : undefined;

    // Validate range
    if (parsedMin !== undefined && parsedMax !== undefined && parsedMin > parsedMax) {
      setPriceError('El precio mínimo no puede ser mayor al máximo');
      return;
    }

    // Clear error and apply filters
    setPriceError('');
    const newFilters = {
      ...filters,
      priceMin: parsedMin,
      priceMax: parsedMax
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [priceMinInput, priceMaxInput, filters, onFiltersChange]);

  const handleAmenityToggle = (amenityId: number) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter(id => id !== amenityId)
      : [...currentAmenities, amenityId];

    handleFilterChange('amenities', newAmenities);
  };

  const handleInstitutionSelect = (institution: any) => {
    setSelectedInstitution(institution);
    handleFilterChange('institutionId', institution?.id);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFiltersType = {
      priceMin: undefined,
      priceMax: undefined
    };
    setSelectedInstitution(null);
    setFilters(emptyFilters);

    // Clear price input states
    setPriceMinInput('');
    setPriceMaxInput('');
    setPriceError('');

    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Buscar Propiedades</h2>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1.5 sm:space-x-2 min-w-[44px] min-h-[44px] px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">{showFilters ? 'Ocultar Filtros' : 'Más Filtros'}</span>
          <span className="sm:hidden">{showFilters ? 'Ocultar' : 'Filtros'}</span>
        </button>
      </div>

      {/* Basic Filters - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {/* Department Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Departamento</label>
          <select
            value={filters.departmentId || ''}
            onChange={(e) => handleFilterChange('departmentId', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Ciudad</label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">{filters.departmentId ? 'Todas las ciudades del depto.' : 'Todas las ciudades'}</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tipo de Institución</label>
          <select
            value={filters.institutionType || ''}
            onChange={(e) => handleFilterChange('institutionType', e.target.value || undefined)}
            className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Todas</option>
            {institutionTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Todos los tipos</option>
            <option value="apartamento">Apartamento</option>
            <option value="habitacion">Habitación</option>
            <option value="pension">Pensión</option>
            <option value="aparta-estudio">Aparta-estudio</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Buscar Institución</label>
          <InstitutionSearch
            onSelect={handleInstitutionSelect}
            selectedInstitution={selectedInstitution}
            placeholder="Buscar universidad o instituto..."
            type={filters.institutionType as any}
          />
        </div>

        {hasActiveFilters && (
          <div className="sm:col-span-2 lg:col-span-4 flex justify-start sm:justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1.5 min-w-[44px] min-h-[44px] px-4 py-2.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span>Limpiar Filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters - Mobile Optimized */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Rango de Precio (COP)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 500,000"
                  value={priceMinInput ? parseInt(priceMinInput).toLocaleString('es-CO') : ''}
                  onChange={(e) => handlePriceInputChange('min', e.target.value)}
                  className="min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 w-full"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Precio mínimo</p>
              </div>
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 1,500,000"
                  value={priceMaxInput ? parseInt(priceMaxInput).toLocaleString('es-CO') : ''}
                  onChange={(e) => handlePriceInputChange('max', e.target.value)}
                  className="min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 w-full"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Precio máximo</p>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-3">
              <button
                onClick={applyPriceFilters}
                disabled={isLoading || (!priceMinInput && !priceMaxInput)}
                className="w-full min-h-[44px] px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Aplicar Rango de Precio</span>
              </button>
            </div>

            {priceError && (
              <div className="mt-2 flex items-center space-x-1 text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">{priceError}</span>
              </div>
            )}
            {filters.priceMin !== undefined && filters.priceMax !== undefined && !priceError && (
              <div className="mt-2 flex items-center space-x-1 text-emerald-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">
                  Filtrando entre ${filters.priceMin.toLocaleString('es-CO')} y ${filters.priceMax.toLocaleString('es-CO')}
                </span>
              </div>
            )}
          </div>

          {/* Rooms and Bathrooms */}
          {filters.type !== 'habitacion' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Habitaciones mínimas</label>
                <select
                  value={filters.rooms || ''}
                  onChange={(e) => handleFilterChange('rooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={isLoading}
                >
                  <option value="">Cualquier cantidad</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Baños mínimos</label>
                <select
                  value={filters.bathrooms || ''}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={isLoading}
                >
                  <option value="">Cualquier cantidad</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
            </div>
          )}

          {/* Amenities */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Comodidades</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-2">
              {amenities.map(amenity => (
                <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer min-h-[44px] p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={(filters.amenities || []).includes(Number(amenity.id))}
                    onChange={() => handleAmenityToggle(Number(amenity.id))}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 min-w-[20px] min-h-[20px]"
                    disabled={isLoading}
                  />
                  <span className="text-xs sm:text-sm text-gray-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;