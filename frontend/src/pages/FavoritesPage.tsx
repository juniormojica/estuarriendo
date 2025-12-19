import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import favoritesService from '../services/favoritesService';
import { Property } from '../types';
import PropertyGrid from '../components/PropertyGrid';
import LoadingSpinner from '../components/LoadingSpinner';

const FavoritesPage: React.FC = () => {
    const { removeFavorite: removeFavoriteFromContext } = useFavorites();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Load favorites from backend on mount
    useEffect(() => {
        // Scroll to top when page loads
        window.scrollTo(0, 0);

        const loadFavorites = async () => {
            try {
                setIsLoading(true);
                setError('');
                const favoriteProperties = await favoritesService.getFavorites();
                setProperties(favoriteProperties);
            } catch (err: any) {
                console.error('Error loading favorites:', err);
                if (err.response?.status === 401) {
                    setError('Debes iniciar sesión para ver tus favoritos.');
                } else {
                    setError('Error al cargar tus favoritos.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, []); // Only load on mount

    // Custom handler to remove favorite and update local state
    const handleRemoveFavorite = useCallback(async (propertyId: string) => {
        // Optimistically remove from local state
        setProperties(prev => prev.filter(p => String(p.id) !== propertyId));

        // Also remove from context (which handles the backend call)
        await removeFavoriteFromContext(propertyId);
    }, [removeFavoriteFromContext]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner text="Cargando tus favoritos..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8 sm:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 min-h-[44px] text-gray-600 hover:text-gray-900 active:text-gray-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">Volver al inicio</span>
                    </Link>
                </div>

                <div className="flex items-center space-x-2.5 sm:space-x-3 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                        <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 fill-current" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Favoritos</h1>
                        <p className="text-sm sm:text-base text-gray-600">
                            {properties.length} {properties.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
                        </p>
                    </div>
                </div>

                {properties.length > 0 ? (
                    <PropertyGrid properties={properties} showRemoveButton={true} onRemoveFavorite={handleRemoveFavorite} />
                ) : (
                    <div className="text-center py-12 sm:py-16 px-4 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
                        <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No tienes favoritos aún</h2>
                        <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
                            Guarda las propiedades que te interesen haciendo clic en el corazón para verlas aquí.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center min-h-[48px] px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
                        >
                            Explorar Propiedades
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
