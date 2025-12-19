import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import { getAllCityNames } from '../data/colombiaLocations';
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
  const [filters, setFilters] = useState<SearchFiltersType>({
    priceMin: undefined,
    priceMax: undefined
  });

  useEffect(() => {
    dispatch(fetchAmenities());
  }, [dispatch]);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAmenityToggle = (amenityId: string) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Ciudad</label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Todas las ciudades</option>
            {getAllCityNames().map(city => (
              <option key={city} value={city}>{city}</option>
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

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Tipo de Institución</label>
          <select
            value={filters.institutionType || ''}
            onChange={(e) => handleFilterChange('institutionType', e.target.value || undefined)}
            className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Todas</option>
            <option value="universidad">Universidades</option>
            <option value="instituto">Institutos Técnicos</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Buscar Institución</label>
          <InstitutionSearch
            onSelect={handleInstitutionSelect}
            selectedInstitution={selectedInstitution}
            placeholder="Buscar universidad o instituto..."
            type={filters.institutionType as any}
          />
        </div>

        {hasActiveFilters && (
          <div className="sm:col-span-2 lg:col-span-3 flex justify-start sm:justify-end">
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
              <input
                type="number"
                placeholder="Precio mínimo"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              />
              <input
                type="number"
                placeholder="Precio máximo"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              />
            </div>
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
          {/* Amenities - Mobile Optimized */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Comodidades</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-2">
              {amenities.map(amenity => (
                <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer min-h-[44px] p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={(filters.amenities || []).includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
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