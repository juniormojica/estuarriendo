import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
    favorites: string[];
    addFavorite: (propertyId: string) => void;
    removeFavorite: (propertyId: string) => void;
    isFavorite: (propertyId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem('estuarriendo_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('estuarriendo_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addFavorite = (propertyId: string) => {
        setFavorites(prev => {
            if (prev.includes(propertyId)) return prev;
            return [...prev, propertyId];
        });
    };

    const removeFavorite = (propertyId: string) => {
        setFavorites(prev => prev.filter(id => id !== propertyId));
    };

    const isFavorite = (propertyId: string) => favorites.includes(propertyId);

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
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
