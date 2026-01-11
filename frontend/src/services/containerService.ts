import axios from 'axios';
import type { PropertyContainer, PropertyUnit, CommonArea } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Container Service
 * Handles all API calls related to containers and units
 */

// ===== CONTAINER OPERATIONS =====

/**
 * Create a new container (pension, apartment, aparta-estudio)
 */
export const createContainer = async (containerData: {
    typeId: number;
    locationId: number;
    title: string;
    description: string;
    monthlyRent?: number;
    currency: string;
    status: string;
    rentalMode: 'complete' | 'by_unit';
    requiresDeposit: boolean;
    minimumContractMonths?: number;
    services?: Array<{
        serviceType: string;
        isIncluded: boolean;
        additionalCost?: number;
        description?: string;
    }>;
    rules?: Array<{
        ruleType: string;
        isAllowed: boolean;
        value?: string;
        description?: string;
    }>;
    commonAreaIds?: number[];
}): Promise<PropertyContainer> => {
    const response = await axios.post(`${API_URL}/containers`, containerData);
    return response.data.data;
};

/**
 * Get container with all units and associations
 */
export const getContainer = async (id: number): Promise<PropertyContainer> => {
    const response = await axios.get(`${API_URL}/containers/${id}`);
    return response.data.data;
};

/**
 * Update container information
 */
export const updateContainer = async (
    id: number,
    updateData: Partial<{
        title: string;
        description: string;
        services: Array<{
            serviceType: string;
            isIncluded: boolean;
            additionalCost?: number;
            description?: string;
        }>;
        rules: Array<{
            ruleType: string;
            isAllowed: boolean;
            value?: string;
            description?: string;
        }>;
        commonAreaIds: number[];
    }>
): Promise<PropertyContainer> => {
    const response = await axios.put(`${API_URL}/containers/${id}`, updateData);
    return response.data.data;
};

/**
 * Delete container and all its units
 */
export const deleteContainer = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/containers/${id}`);
};

/**
 * Rent complete container (all units marked as rented)
 */
export const rentCompleteContainer = async (id: number): Promise<PropertyContainer> => {
    const response = await axios.post(`${API_URL}/containers/${id}/rent-complete`);
    return response.data.data;
};

/**
 * Change rental mode
 */
export const changeRentalMode = async (
    id: number,
    mode: 'by_unit' | 'complete'
): Promise<PropertyContainer> => {
    const response = await axios.post(`${API_URL}/containers/${id}/change-mode`, { mode });
    return response.data.data;
};

// ===== UNIT OPERATIONS =====

/**
 * Create a new unit in a container
 */
export const createUnit = async (
    containerId: number,
    unitData: {
        title: string;
        description?: string;
        monthlyRent: number;
        deposit?: number;
        currency?: string;
        area?: number;
        roomType: 'individual' | 'shared';
        bedsInRoom?: number;
        status?: string;
    }
): Promise<PropertyUnit> => {
    const response = await axios.post(`${API_URL}/containers/${containerId}/units`, unitData);
    return response.data.data;
};

/**
 * Get all units of a container
 */
export const getContainerUnits = async (containerId: number): Promise<PropertyUnit[]> => {
    const response = await axios.get(`${API_URL}/containers/${containerId}/units`);
    return response.data.data;
};

/**
 * Update a unit
 */
export const updateUnit = async (
    id: number,
    updateData: Partial<{
        title: string;
        description: string;
        monthlyRent: number;
        deposit: number;
        area: number;
        roomType: 'individual' | 'shared';
        bedsInRoom: number;
    }>
): Promise<PropertyUnit> => {
    const response = await axios.put(`${API_URL}/units/${id}`, updateData);
    return response.data.data;
};

/**
 * Delete a unit
 */
export const deleteUnit = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/units/${id}`);
};

/**
 * Update unit rental status
 */
export const updateUnitRentalStatus = async (
    id: number,
    isRented: boolean
): Promise<PropertyUnit> => {
    const response = await axios.patch(`${API_URL}/units/${id}/rental-status`, { isRented });
    return response.data.data;
};

// ===== COMMON AREAS =====

/**
 * Get all available common areas
 */
export const getCommonAreas = async (): Promise<CommonArea[]> => {
    const response = await axios.get(`${API_URL}/common-areas`);
    return response.data.data;
};

// Export all functions as default
export default {
    // Container operations
    createContainer,
    getContainer,
    updateContainer,
    deleteContainer,
    rentCompleteContainer,
    changeRentalMode,

    // Unit operations
    createUnit,
    getContainerUnits,
    updateUnit,
    deleteUnit,
    updateUnitRentalStatus,

    // Common areas
    getCommonAreas,
};
