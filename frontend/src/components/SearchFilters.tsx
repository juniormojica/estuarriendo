import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import { universities } from '../data/mockData';
import { getAllCityNames } from '../data/colombiaLocations';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  isLoading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange, isLoading }) => {
  const dispatch = useAppDispatch();
  const { items: amenities } = useAppSelector((state) => state.amenities);

  const [showFilters, setShowFilters] = useState(false);
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

  const clearFilters = () => {
    const emptyFilters: SearchFiltersType = {
      priceMin: undefined,
      priceMax: undefined
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Buscar Propiedades</h2>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>{showFilters ? 'Ocultar Filtros' : 'Más Filtros'}</span>
        </button>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Todas las ciudades</option>
            {getAllCityNames().map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Cerca de Universidad</label>
          <select
            value={filters.university || ''}
            onChange={(e) => handleFilterChange('university', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            disabled={isLoading}
          >
            <option value="">Todas las universidades</option>
            {universities.map(uni => (
              <option key={uni.id} value={uni.id}>{uni.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precio (COP)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Precio mínimo"
                value={filters.priceMin || ''}
                onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              />
              <input
                type="number"
                placeholder="Precio máximo"
                value={filters.priceMax || ''}
                onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Rooms and Bathrooms */}
          {filters.type !== 'habitacion' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones mínimas</label>
                <select
                  value={filters.rooms || ''}
                  onChange={(e) => handleFilterChange('rooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Baños mínimos</label>
                <select
                  value={filters.bathrooms || ''}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Comodidades</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {amenities.map(amenity => (
                <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filters.amenities || []).includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-gray-700">{amenity.name}</span>
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