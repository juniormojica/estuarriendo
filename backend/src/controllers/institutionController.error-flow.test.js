import { afterEach, describe, expect, it, vi } from 'vitest';
import * as institutionController from './institutionController.js';
import { Institution, City } from '../models/index.js';
import { errorHandler } from '../middleware/errorHandler.js';

const createResponse = () => {
    const res = {};
    res.headersSent = false;
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

    const statusCallsBeforeHandler = res.status.mock.calls.length;
    const jsonCallsBeforeHandler = res.json.mock.calls.length;

    errorHandler(capturedError, req, res, vi.fn());

    return { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler };
};

describe('institutionController incremental migration -> centralized errorHandler', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('delegates search short-query validation to standardized 400 contract', async () => {
        const req = { query: { q: 'a' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            institutionController.searchInstitutions,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Query parameter "q" must be at least 2 characters',
            message: 'Query parameter "q" must be at least 2 characters',
            code: 'INSTITUTION_SEARCH_QUERY_TOO_SHORT'
        });
    });

    it('delegates create invalid-latitude validation to standardized 400 contract', async () => {
        vi.spyOn(City, 'findByPk').mockResolvedValue({ id: 1 });
        vi.spyOn(Institution, 'findOne').mockResolvedValue(null);

        const req = {
            body: {
                name: 'Uni Test',
                cityId: 1,
                type: 'universidad',
                latitude: '91'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            institutionController.createInstitution,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Invalid latitude. Must be between -90 and 90',
            message: 'Invalid latitude. Must be between -90 and 90',
            code: 'INSTITUTION_INVALID_LATITUDE'
        });
    });

    it('delegates create duplicate-name flow to standardized 409 contract', async () => {
        vi.spyOn(City, 'findByPk').mockResolvedValue({ id: 1 });
        vi.spyOn(Institution, 'findOne').mockResolvedValue({ id: 44, name: 'Uni Test', cityId: 1 });

        const req = {
            body: {
                name: 'Uni Test',
                cityId: 1,
                type: 'universidad'
            }
        };

        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            institutionController.createInstitution,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Institution with this name already exists in this city',
            message: 'Institution with this name already exists in this city',
            code: 'INSTITUTION_NAME_EXISTS'
        });
    });

    it('delegates delete foreign-key conflict flow to standardized 409 contract', async () => {
        const fkError = Object.assign(new Error('fk constraint'), { name: 'SequelizeForeignKeyConstraintError' });
        vi.spyOn(Institution, 'findByPk').mockResolvedValue({ id: 10, destroy: vi.fn().mockRejectedValue(fkError) });

        const req = { params: { id: '10' } };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            institutionController.deleteInstitution,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: 'This institution is referenced by properties or student requests',
            message: 'This institution is referenced by properties or student requests',
            code: 'INSTITUTION_IN_USE'
        });
    });

    it('delegates unexpected list errors to internal-error contract', async () => {
        vi.spyOn(Institution, 'findAll').mockRejectedValue(new Error('Sequelize auth=secret'));

        const req = { query: {} };
        const { res, capturedError, statusCallsBeforeHandler, jsonCallsBeforeHandler } = await runThroughErrorHandler(
            institutionController.getAllInstitutions,
            { req }
        );

        expect(capturedError).toBeInstanceOf(Error);
        expect(statusCallsBeforeHandler).toBe(0);
        expect(jsonCallsBeforeHandler).toBe(0);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Error interno del servidor',
            message: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });
});
