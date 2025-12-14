import apiClient from '../lib/axios';
import { City } from './locationService';

export interface Institution {
    id: number;
    name: string;
    cityId: number;
    city?: City;
    type: 'universidad' | 'corporacion' | 'instituto';
    createdAt?: string;
    updatedAt?: string;
}

export interface InstitutionFilters {
    cityId?: number;
    type?: 'universidad' | 'corporacion' | 'instituto';
}

/**
 * Get institutions with optional filters
 */
export const getInstitutions = async (filters?: InstitutionFilters): Promise<Institution[]> => {
    const response = await apiClient.get<Institution[]>('/institutions', {
        params: filters
    });
    return response.data;
};

/**
 * Search institutions by query (autocomplete)
 */
export const searchInstitutions = async (query: string, cityId?: number): Promise<Institution[]> => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const params: any = { q: query.trim() };
    if (cityId) {
        params.cityId = cityId;
    }

    const response = await apiClient.get<Institution[]>('/institutions/search', { params });
    return response.data;
};

/**
 * Get institution by ID
 */
export const getInstitutionById = async (id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/${id}`);
    return response.data;
};

/**
 * Create new institution (requires authentication)
 */
export const createInstitution = async (data: {
    name: string;
    cityId: number;
    type: 'universidad' | 'corporacion' | 'instituto';
}): Promise<Institution> => {
    const response = await apiClient.post<Institution>('/institutions', data);
    return response.data;
};
