import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../errors/AppError.js';
import { Property } from '../models/index.js';
import {
    createUnit,
    deleteUnit,
    rentCompleteContainer,
    updateContainerAvailability
} from './containerService.js';

describe('containerService semantic errors', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws CONTAINER_NOT_FOUND when creating a unit for a missing container', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        await expect(createUnit('container-404', {})).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 404,
            code: 'CONTAINER_NOT_FOUND',
            message: 'Pensión/apartamento no encontrado'
        });
    });

    it('throws INVALID_CONTAINER_PARENT when creating a unit under a non-container property', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ isContainer: false });

        await expect(createUnit('property-1', {})).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'INVALID_CONTAINER_PARENT',
            message: 'La propiedad padre no es una pensión/apartamento'
        });
    });

    it('throws CONTAINER_UNITS_ALREADY_RENTED when complete-container rent conflicts with rented units', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({
            isContainer: true,
            units: [{ isRented: true }]
        });

        await expect(rentCompleteContainer('container-1')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 409,
            code: 'CONTAINER_UNITS_ALREADY_RENTED',
            message: 'No se puede alquilar la pensión/apartamento completa: algunas habitaciones ya están alquiladas'
        });
    });

    it('throws PROPERTY_NOT_UNIT when deleting a property that is not a unit', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue({ parentId: null });

        await expect(deleteUnit('property-1')).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'PROPERTY_NOT_UNIT',
            message: 'La propiedad no es una habitación'
        });
    });

    it('preserves semantic AppError instances instead of wrapping them as unexpected errors', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);
        const result = updateContainerAvailability('container-404');

        await expect(result).rejects.toBeInstanceOf(AppError);
        await expect(result).rejects.toMatchObject({
            statusCode: 404,
            code: 'CONTAINER_NOT_FOUND'
        });
    });
});
