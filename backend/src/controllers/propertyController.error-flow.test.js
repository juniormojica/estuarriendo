import { describe, expect, it, vi, afterEach } from 'vitest';
import * as propertyController from './propertyController.js';
import * as propertyService from '../services/propertyService.js';
import { Property, ActivityLog, User } from '../models/index.js';
import { notFound } from '../errors/AppError.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = ({ headersSent = false } = {}) => {
    const res = {};
    res.headersSent = headersSent;
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const runThroughErrorHandler = async (controllerAction, { req }) => {
    const res = createResponse();
    let capturedError;

    await controllerAction(req, res, (error) => {
        capturedError = error;
    });

    errorHandler(capturedError, req, res, vi.fn());
    return res;
};

describe('propertyController read-slice migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 404 JSON when getPropertyById forwards notFound AppError', async () => {
        vi.spyOn(propertyService, 'findPropertyWithAssociations').mockResolvedValue(null);

        const req = { params: { id: 'p-404' }, query: {} };
        const res = await runThroughErrorHandler(propertyController.getPropertyById, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propiedad no encontrada',
            message: 'Propiedad no encontrada',
            code: 'PROPERTY_NOT_FOUND'
        });
    });

    it('maps unexpected service failure from getAllProperties to standardized 500 contract', async () => {
        vi.spyOn(propertyService, 'findPropertiesWithAssociations').mockRejectedValue(new Error('db down'));

        const req = { query: {} };
        const res = await runThroughErrorHandler(propertyController.getAllProperties, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('preserves AppError details from getUserProperties via centralized handler', async () => {
        vi.spyOn(propertyService, 'findPropertiesWithAssociations').mockRejectedValue(
            notFound('Usuario propietario no encontrado', { code: 'OWNER_NOT_FOUND' })
        );

        const req = { params: { userId: 'u-404' } };
        const res = await runThroughErrorHandler(propertyController.getUserProperties, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Usuario propietario no encontrado',
            message: 'Usuario propietario no encontrado',
            code: 'OWNER_NOT_FOUND'
        });
    });
});

describe('propertyController toggle-status slice migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 404 JSON when toggleFeatured forwards property notFound AppError', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'p-404' } };
        const res = await runThroughErrorHandler(propertyController.toggleFeatured, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propiedad no encontrada',
            message: 'Propiedad no encontrada',
            code: 'PROPERTY_NOT_FOUND'
        });
    });

    it('maps unexpected update failure from toggleFeatured to standardized 500 contract', async () => {
        const update = vi.fn().mockRejectedValue(new Error('write failed'));
        vi.spyOn(Property, 'findByPk').mockResolvedValue({
            isFeatured: false,
            update
        });
        vi.spyOn(propertyService, 'findPropertyWithAssociations').mockResolvedValue({
            id: 'p-1',
            title: 'Depto',
            isFeatured: true
        });
        vi.spyOn(ActivityLog, 'create').mockResolvedValue({});

        const req = { params: { id: 'p-1' }, user: { id: 'u-1' } };
        const res = await runThroughErrorHandler(propertyController.toggleFeatured, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('maps unexpected lookup failure from toggleRentedStatus to standardized 500 contract', async () => {
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db down'));

        const req = { params: { id: 'p-1' } };
        const res = await runThroughErrorHandler(propertyController.toggleRentedStatus, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('propertyController moderation slice migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 404 JSON when approveProperty forwards property notFound AppError', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'p-404' } };
        const res = await runThroughErrorHandler(propertyController.approveProperty, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propiedad no encontrada',
            message: 'Propiedad no encontrada',
            code: 'PROPERTY_NOT_FOUND'
        });
    });

    it('maps unexpected lookup failure from approveProperty to standardized 500 contract', async () => {
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db down'));

        const req = { params: { id: 'p-1' } };
        const res = await runThroughErrorHandler(propertyController.approveProperty, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('returns standard 400 JSON when rejectProperty forwards missing reason AppError', async () => {
        const req = { params: { id: 'p-1' }, body: {} };
        const res = await runThroughErrorHandler(propertyController.rejectProperty, { req });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'El motivo de rechazo es requerido',
            message: 'El motivo de rechazo es requerido',
            code: 'REJECTION_REASON_REQUIRED'
        });
    });

    it('returns standard 404 JSON when rejectProperty forwards property notFound AppError', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'p-404' }, body: { reason: 'No cumple requisitos' } };
        const res = await runThroughErrorHandler(propertyController.rejectProperty, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propiedad no encontrada',
            message: 'Propiedad no encontrada',
            code: 'PROPERTY_NOT_FOUND'
        });
    });

    it('maps unexpected lookup failure from rejectProperty to standardized 500 contract', async () => {
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db down'));

        const req = { params: { id: 'p-1' }, body: { reason: 'No cumple requisitos' } };
        const res = await runThroughErrorHandler(propertyController.rejectProperty, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('propertyController delete slice migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 404 JSON when deleteProperty forwards property notFound AppError', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'p-404' } };
        const res = await runThroughErrorHandler(propertyController.deleteProperty, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propiedad no encontrada',
            message: 'Propiedad no encontrada',
            code: 'PROPERTY_NOT_FOUND'
        });
    });

    it('maps unexpected lookup failure from deleteProperty to standardized 500 contract', async () => {
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db down'));

        const req = { params: { id: 'p-1' } };
        const res = await runThroughErrorHandler(propertyController.deleteProperty, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('propertyController update slice migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 404 JSON when updateProperty forwards property notFound AppError', async () => {
        vi.spyOn(Property, 'findByPk').mockResolvedValue(null);

        const req = { params: { id: 'p-404' }, body: {} };
        const res = await runThroughErrorHandler(propertyController.updateProperty, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propiedad no encontrada',
            message: 'Propiedad no encontrada',
            code: 'PROPERTY_NOT_FOUND'
        });
    });

    it('maps unexpected lookup failure from updateProperty to standardized 500 contract', async () => {
        vi.spyOn(Property, 'findByPk').mockRejectedValue(new Error('db down'));

        const req = { params: { id: 'p-1' }, body: {} };
        const res = await runThroughErrorHandler(propertyController.updateProperty, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});

describe('propertyController create slice migrated flow -> errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns standard 404 JSON when createProperty forwards owner notFound AppError', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue(null);

        const req = { auth: { userId: 'u-404' }, body: { ownerId: 'u-404', images: ['img-1'] } };
        const res = await runThroughErrorHandler(propertyController.createProperty, { req });

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Propietario no encontrado',
            message: 'Propietario no encontrado',
            code: 'OWNER_NOT_FOUND'
        });
    });

    it('returns standard 400 JSON when createProperty forwards missing-images AppError', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1' });

        const req = { auth: { userId: 'u-1' }, body: { ownerId: 'u-1', images: [] } };
        const res = await runThroughErrorHandler(propertyController.createProperty, { req });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Debes agregar al menos una imagen de la propiedad',
            message: 'Debes agregar al menos una imagen de la propiedad',
            code: 'PROPERTY_IMAGES_REQUIRED'
        });
    });

    it('returns standard 400 JSON when createProperty forwards image-limit AppError', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1' });

        const req = { auth: { userId: 'u-1' }, body: { ownerId: 'u-1', images: new Array(11).fill('img') } };
        const res = await runThroughErrorHandler(propertyController.createProperty, { req });

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'El máximo de imágenes permitidas es 10',
            message: 'El máximo de imágenes permitidas es 10',
            code: 'PROPERTY_IMAGES_LIMIT_EXCEEDED'
        });
    });

    it('maps unexpected create failure from createProperty to standardized 500 contract', async () => {
        vi.spyOn(User, 'findByPk').mockResolvedValue({ id: 'u-1' });
        vi.spyOn(propertyService, 'createPropertyWithAssociations').mockRejectedValue(new Error('db down'));

        const req = { auth: { userId: 'u-1' }, body: { ownerId: 'u-1', images: ['img-1'], title: 'Depto Centro' } };
        const res = await runThroughErrorHandler(propertyController.createProperty, { req });

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});
