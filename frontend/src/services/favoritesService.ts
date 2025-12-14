import apiClient from '../lib/axios';
import { Property } from '../types';

/**
 * Favorites Service
 * Handles all favorites-related API calls to the backend
 */
export const favoritesService = {
    /**
     * Get all favorite properties for the authenticated user
     */
    async getFavorites(): Promise<Property[]> {
        const response = await apiClient.get<Property[]>('/favorites');
        return response.data;
    },

    /**
     * Add a property to favorites
     */
    async addFavorite(propertyId: string | number): Promise<{ message: string; propertyId: string | number }> {
        const response = await apiClient.post(`/favorites/${propertyId}`);
        return response.data;
    },

    /**
     * Remove a property from favorites
     */
    async removeFavorite(propertyId: string | number): Promise<{ message: string; propertyId: string | number }> {
        const response = await apiClient.delete(`/favorites/${propertyId}`);
        return response.data;
    },

    /**
     * Check if a property is favorited by the user
     */
    async checkFavorite(propertyId: string | number): Promise<{ isFavorite: boolean; propertyId: string | number }> {
        const response = await apiClient.get(`/favorites/check/${propertyId}`);
        return response.data;
    }
};

export default favoritesService;
