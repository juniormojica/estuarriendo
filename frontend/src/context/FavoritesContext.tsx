import React, { createContext, useContext, useState, useEffect } from 'react';
import favoritesService from '../services/favoritesService';
import { authService } from '../services/authService';

interface FavoritesContextType {
    favorites: string[];
    addFavorite: (propertyId: string) => Promise<void>;
    removeFavorite: (propertyId: string) => Promise<void>;
    isFavorite: (propertyId: string) => boolean;
    isLoading: boolean;
    error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load favorites from backend on mount
    useEffect(() => {
        const loadFavorites = async () => {
            // Only load if user is authenticated
            if (!authService.isAuthenticated()) {
                setFavorites([]);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const properties = await favoritesService.getFavorites();
                // Extract property IDs
                const favoriteIds = properties.map(p => String(p.id));
                setFavorites(favoriteIds);
            } catch (err: any) {
                console.error('Error loading favorites:', err);
                // If unauthorized, clear favorites
                if (err.response?.status === 401) {
                    setFavorites([]);
                } else {
                    setError('Error al cargar favoritos');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadFavorites();
    }, []);

    const addFavorite = async (propertyId: string) => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            setError('Debes iniciar sesión para agregar favoritos');
            return;
        }

        // Optimistic update
        setFavorites(prev => {
            if (prev.includes(propertyId)) return prev;
            return [...prev, propertyId];
        });

        try {
            await favoritesService.addFavorite(propertyId);
            setError(null);
        } catch (err: any) {
            console.error('Error adding favorite:', err);
            // Revert optimistic update
            setFavorites(prev => prev.filter(id => id !== propertyId));
            setError(err.response?.data?.message || 'Error al agregar a favoritos');
        }
    };

    const removeFavorite = async (propertyId: string) => {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
            setError('Debes iniciar sesión para gestionar favoritos');
            return;
        }

        // Optimistic update
        setFavorites(prev => prev.filter(id => id !== propertyId));

        try {
            await favoritesService.removeFavorite(propertyId);
            setError(null);
        } catch (err: any) {
            console.error('Error removing favorite:', err);
            // Revert optimistic update
            setFavorites(prev => [...prev, propertyId]);
            setError(err.response?.data?.message || 'Error al eliminar de favoritos');
        }
    };

    const isFavorite = (propertyId: string) => favorites.includes(propertyId);

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, isLoading, error }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
