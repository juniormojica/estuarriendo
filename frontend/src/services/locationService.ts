import apiClient from '../lib/axios';

export interface Department {
    id: number;
    name: string;
    code: string;
    slug: string;
    isActive: boolean;
}

export interface City {
    id: number;
    name: string;
    slug: string;
    departmentId: number;
    department?: Department;
    isActive: boolean;
}

/**
 * Get all departments
 */
export const getDepartments = async (): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/locations/departments');
    return response.data;
};

/**
 * Get cities by department ID
 */
export const getCitiesByDepartment = async (departmentId: number): Promise<City[]> => {
    const response = await apiClient.get<City[]>('/locations/cities', {
        params: { departmentId }
    });
    return response.data;
};

/**
 * Search cities by query (autocomplete)
 */
export const searchCities = async (query: string): Promise<City[]> => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const response = await apiClient.get<City[]>('/locations/cities/search', {
        params: { q: query.trim() }
    });
    return response.data;
};

/**
 * Get city by ID
 */
export const getCityById = async (id: number): Promise<City> => {
    const response = await apiClient.get<City>(`/locations/cities/${id}`);
    return response.data;
};
