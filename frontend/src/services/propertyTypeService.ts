import apiClient from '../lib/axios';
import { PropertyTypeEntity } from '../types';

/**
 * Property Type Service
 * Handles fetching property type reference data from the backend
 */

/**
 * Fetch all property types from the backend
 * @returns Promise with array of property types
 */
export const fetchPropertyTypes = async (): Promise<PropertyTypeEntity[]> => {
    try {
        const response = await apiClient.get<PropertyTypeEntity[]>('/property-types');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching property types:', error);
        throw new Error(error.response?.data?.error || 'Error al cargar los tipos de propiedad');
    }
};

/**
 * Get property type ID by name
 * @param types - Array of property types
 * @param name - Property type name to search for
 * @returns Property type ID or null if not found
 */
export const getPropertyTypeIdByName = (
    types: PropertyTypeEntity[],
    name: string
): number | null => {
    const type = types.find(t => t.name.toLowerCase() === name.toLowerCase());
    return type ? type.id : null;
};

/**
 * Get property type name by ID
 * @param types - Array of property types
 * @param id - Property type ID to search for
 * @returns Property type name or null if not found
 */
export const getPropertyTypeNameById = (
    types: PropertyTypeEntity[],
    id: number
): string | null => {
    const type = types.find(t => t.id === id);
    return type ? type.name : null;
};

export default {
    fetchPropertyTypes,
    getPropertyTypeIdByName,
    getPropertyTypeNameById
};
