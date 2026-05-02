'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SearchFilters } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProperties, setFilters } from '../store/slices/propertiesSlice';
import SearchFiltersComponent from '../components/SearchFilters';
import PropertyGrid from '../components/PropertyGrid';
import WelcomeModal from '../components/WelcomeModal';
import { ChevronDown } from 'lucide-react';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { items: properties, loading: isLoading, error } = useAppSelector((state) => state.properties);

  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const availableCities = Array.from(new Set(
    (properties || [])
      .filter(p => p && p.location?.city)
      .map(p => typeof p.location?.city === 'object' ? (p.location.city as any).name : p.location?.city)
      .filter((city): city is string => typeof city === 'string' && city.trim() !== '')
  )).sort();

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  useEffect(() => {
    // Scroll to search section if URL contains #search
    if (typeof window !== 'undefined' && window.location.hash === '#search') {
      setTimeout(() => {
        searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

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
      <div className="relative bg-brand-dark text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-illustration.png"
            alt="Estudiantes universitarios buscando apartamento"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-brand-dark/85" />
        </div>

        {/* Responsive padding and text sizes */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 lg:py-40">
          <div className="text-center">
            {/* Responsive heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-jakarta font-extrabold tracking-tight mb-6 leading-tight">
              Encuentra tu <span className="text-brand-lime">alojamiento universitario</span> ideal
            </h1>

            {/* Responsive subheading */}
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-lato px-4">
              Apartamentos, habitaciones y pensiones para estudiantes en América Latina. Seguro, fácil y pensado para ti.
            </p>

            {/* Touch-friendly CTA button */}
            <button
              onClick={scrollToSearch}
              className="inline-flex items-center justify-center space-x-2 px-8 sm:px-10 py-4 sm:py-5 bg-brand-lime text-brand-dark font-jakarta text-base sm:text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:bg-brand-lime/90 transition-all duration-200 active:scale-95 min-h-[48px]"
            >
              <span className="hidden sm:inline">Ver Opciones de Vivienda</span>
              <span className="sm:hidden">Ver Propiedades</span>
              <ChevronDown className="h-5 w-5 animate-bounce ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-jakarta font-extrabold text-brand-blue">500+</span>
              <span className="text-xs sm:text-sm text-gray-500 font-lato mt-1">Propiedades</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-jakarta font-extrabold text-brand-blue">12</span>
              <span className="text-xs sm:text-sm text-gray-500 font-lato mt-1">Ciudades</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-jakarta font-extrabold text-brand-lime">100%</span>
              <span className="text-xs sm:text-sm text-gray-500 font-lato mt-1">Verificadas</span>
            </div>
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
                  className={`px-4 sm:px-5 py-2 rounded-full text-sm sm:text-base font-jakarta font-medium transition-all min-h-[44px] active:scale-95 ${selectedCity === city
                    ? 'bg-brand-blue text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-brand-blue/10 hover:text-brand-blue'
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
                    dispatch(fetchProperties({}));
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