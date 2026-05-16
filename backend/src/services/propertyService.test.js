import { afterEach, describe, expect, it, vi } from 'vitest';
import { PropertyType, sequelize } from '../models/index.js';
import { createPropertyWithAssociations } from './propertyService.js';

describe('propertyService semantic errors', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('throws PROPERTY_TYPE_INVALID_NAME when typeName does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback });
        vi.spyOn(PropertyType, 'findOne').mockResolvedValue(null);

        await expect(createPropertyWithAssociations({ typeName: 'castillo' })).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'PROPERTY_TYPE_INVALID_NAME',
            message: 'Tipo de propiedad no válido: castillo. Los tipos válidos son: pension, habitacion, apartamento, aparta-estudio'
        });

        expect(rollback).toHaveBeenCalledTimes(1);
    });

    it('throws PROPERTY_TYPE_REQUIRED when neither typeId nor typeName is provided', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback });

        await expect(createPropertyWithAssociations({})).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 400,
            code: 'PROPERTY_TYPE_REQUIRED',
            message: 'Se requiere typeId o typeName para crear una propiedad'
        });

        expect(rollback).toHaveBeenCalledTimes(1);
    });

    it('throws PROPERTY_TYPE_NOT_FOUND when provided typeId does not exist', async () => {
        const rollback = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(sequelize, 'transaction').mockResolvedValue({ rollback });
        vi.spyOn(PropertyType, 'findByPk').mockResolvedValue(null);

        await expect(createPropertyWithAssociations({ typeId: 999 })).rejects.toMatchObject({
            name: 'AppError',
            statusCode: 404,
            code: 'PROPERTY_TYPE_NOT_FOUND',
            message: 'El tipo de propiedad con ID 999 no existe en la base de datos'
        });

        expect(rollback).toHaveBeenCalledTimes(1);
    });
});
