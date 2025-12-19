import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchFilters } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProperties, setFilters } from '../store/slices/propertiesSlice';
import SearchFiltersComponent from '../components/SearchFilters';
import PropertyGrid from '../components/PropertyGrid';
import WelcomeModal from '../components/WelcomeModal';
import { ChevronDown } from 'lucide-react';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { items: properties, loading: isLoading, error } = useAppSelector((state) => state.properties);

  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const availableCities = Array.from(new Set(
    (properties || [])
      .filter(p => p && p.location?.city)
      .map(p => p.location?.city)
      .filter((city): city is string => city !== undefined)
  )).sort();

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    const state = location.state as { scrollToSearch?: boolean } | null;
    if (state?.scrollToSearch) {
      setTimeout(() => {
        searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location]);

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
      <WelcomeModal />

      {/* Hero Section - Mobile Optimized */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Valledupar City View"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/75" />
        </div>

        {/* Responsive padding and text sizes */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="text-center">
            {/* Responsive heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight">
              Encuentra tu <span className="text-accent-400">alojamiento universitario</span> ideal
            </h1>

            {/* Responsive subheading */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-3xl mx-auto mb-6 sm:mb-8 font-light px-4">
              Apartamentos, habitaciones y pensiones cerca de tu universidad en Valledupar. Diseñado para estudiantes.
            </p>

            {/* Touch-friendly CTA button */}
            <button
              onClick={scrollToSearch}
              className="inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-base sm:text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 active:scale-95 min-h-[48px]"
            >
              <span className="hidden sm:inline">Ver Publicaciones Disponibles</span>
              <span className="sm:hidden">Ver Propiedades</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={searchSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Available Cities Section - Mobile Optimized */}
        {availableCities.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Ciudades Disponibles
            </h2>

            {/* Scrollable city buttons on mobile */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {availableCities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all min-h-[44px] active:scale-95 ${selectedCity === city
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
                  className="px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all min-h-[44px] active:scale-95"
                >
                  ✕ Limpiar
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