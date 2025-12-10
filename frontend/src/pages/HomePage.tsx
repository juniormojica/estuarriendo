import React, { useState, useEffect, useRef } from 'react';
import { SearchFilters } from '../types';
import { api } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProperties, setFilters } from '../store/slices/propertiesSlice';
import SearchFiltersComponent from '../components/SearchFilters';
import PropertyGrid from '../components/PropertyGrid';
import WelcomeModal from '../components/WelcomeModal';
import { ChevronDown } from 'lucide-react';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: properties, loading: isLoading, error } = useAppSelector((state) => state.properties);

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const loadAvailableCities = async () => {
    try {
      const cities = await api.getAvailableCities();
      setAvailableCities(cities);
    } catch (err) {
      console.error('Error loading available cities:', err);
    }
  };

  useEffect(() => {
    dispatch(fetchProperties());
    loadAvailableCities();
  }, [dispatch]);

  const handleFiltersChange = (filters: SearchFilters) => {
    setSelectedCity(filters.city);
    dispatch(setFilters(filters));
    dispatch(fetchProperties(filters));
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    const filters = { city };
    dispatch(setFilters(filters));
    dispatch(fetchProperties(filters));
  };

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Modal */}
      <WelcomeModal />

      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Valledupar City View"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/75" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Encuentra tu <span className="text-accent-400">alojamiento universitario</span> ideal
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 font-light">
              Apartamentos, habitaciones y pensiones cerca de tu universidad en Valledupar. Diseñado para estudiantes.
            </p>
            <button
              onClick={scrollToSearch}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <span>Ver Publicaciones Disponibles</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={searchSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Available Cities Section */}
        {availableCities.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ciudades Disponibles</h2>
            <div className="flex flex-wrap gap-3">
              {availableCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${selectedCity === city
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700'
                    }`}
                >
                  {city}
                </button>
              ))}
              {selectedCity && (
                <button
                  onClick={() => {
                    setSelectedCity(undefined);
                    dispatch(setFilters({}));
                    dispatch(fetchProperties());
                  }}
                  className="px-4 py-2 rounded-full font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                >
                  ✕ Limpiar filtro
                </button>
              )}
            </div>
          </div>
        )}

        <SearchFiltersComponent
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />
        <PropertyGrid
          properties={properties}
          isLoading={isLoading}
          error={error || undefined}
        />
      </div>
    </div>
  );
};

export default HomePage;