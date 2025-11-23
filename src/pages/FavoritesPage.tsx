import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { api } from '../services/api';
import { Property } from '../types';
import PropertyGrid from '../components/PropertyGrid';
import LoadingSpinner from '../components/LoadingSpinner';

const FavoritesPage: React.FC = () => {
    const { favorites } = useFavorites();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                setIsLoading(true);
                // In a real API we would have an endpoint like /properties?ids=1,2,3
                // For now we fetch all and filter client-side, or fetch one by one
                // Fetching all is more efficient with the current mock API structure
                const allProperties = await api.getProperties();
                const favoriteProperties = allProperties.filter(p => favorites.includes(p.id));
                setProperties(favoriteProperties);
            } catch (err) {
                setError('Error al cargar tus favoritos.');
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, [favorites]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner text="Cargando tus favoritos..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver al inicio</span>
                    </Link>
                </div>

                <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 bg-red-100 rounded-full">
                        <Heart className="h-6 w-6 text-red-600 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
                        <p className="text-gray-600">
                            {properties.length} {properties.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
                        </p>
                    </div>
                </div>

                {properties.length > 0 ? (
                    <PropertyGrid properties={properties} />
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No tienes favoritos aún</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Guarda las propiedades que te interesen haciendo clic en el corazón para verlas aquí.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
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
