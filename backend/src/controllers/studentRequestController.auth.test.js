import { afterEach, describe, expect, it, vi } from 'vitest';
import * as studentRequestController from './studentRequestController.js';
import { StudentRequest, User } from '../models/index.js';
import { UserType } from '../utils/enums.js';

const createRes = () => {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const OWNER = { id: 'u-student' };
const ATTACKER = { id: 'u-attacker' };
const ADMIN = { id: 'u-admin' };

const mockUserFindByPk = (overrides) =>
    vi.spyOn(User, 'findByPk').mockImplementation((id) => {
        if (id === OWNER.id) return Promise.resolve({ id: OWNER.id, userType: 'tenant' });
        if (id === ATTACKER.id) return Promise.resolve({ id: ATTACKER.id, userType: 'tenant' });
        if (id === ADMIN.id) return Promise.resolve({ id: ADMIN.id, userType: UserType.ADMIN });
        return overrides?.(id) ?? Promise.resolve(null);
    });

describe('studentRequestController auth/IDOR guards', () => {
    afterEach(() => vi.restoreAllMocks());

    // ---------- getAllStudentRequests (route-protected listing) ----------
    describe('getAllStudentRequests', () => {
        it('returns data when called directly (auth is enforced by route middleware)', async () => {
            const data = [{ id: 1, studentId: OWNER.id, city: 'Bogotá' }];
            vi.spyOn(StudentRequest, 'findAll').mockResolvedValue(data);

            const req = { query: {} };
            const res = createRes();

            await studentRequestController.getAllStudentRequests(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('passes query filters to findAll', async () => {
            vi.spyOn(StudentRequest, 'findAll').mockResolvedValue([]);

            const req = { query: { status: 'open', city: 'Bogotá' } };
            const res = createRes();

            await studentRequestController.getAllStudentRequests(req, res, vi.fn());

            expect(StudentRequest.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: 'open',
                        city: 'Bogotá'
                    })
                })
            );
        });
    });

    // ---------- getStudentRequestsByStudentId ----------
    describe('getStudentRequestsByStudentId', () => {
        it('returns 403 when a different user queries another student\'s requests', async () => {
            vi.spyOn(StudentRequest, 'findAll').mockResolvedValue([]);
            mockUserFindByPk();

            const req = { params: { studentId: OWNER.id }, auth: { userId: ATTACKER.id } };
            const res = createRes();

            await studentRequestController.getStudentRequestsByStudentId(req, res, (err) => {
                res.status(err.statusCode);
                res.json({ error: err.message, code: err.code });
            });

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'STUDENT_REQUEST_FORBIDDEN' })
            );
        });

        it('returns 200 when student queries their own requests', async () => {
            const data = [{ id: 1, studentId: OWNER.id }];
            vi.spyOn(StudentRequest, 'findAll').mockResolvedValue(data);
            mockUserFindByPk();

            const req = { params: { studentId: OWNER.id }, auth: { userId: OWNER.id } };
            const res = createRes();

            await studentRequestController.getStudentRequestsByStudentId(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('returns 200 when admin queries any student\'s requests', async () => {
            const data = [{ id: 1, studentId: OWNER.id }];
            vi.spyOn(StudentRequest, 'findAll').mockResolvedValue(data);
            mockUserFindByPk();

            const req = { params: { studentId: OWNER.id }, auth: { userId: ADMIN.id } };
            const res = createRes();

            await studentRequestController.getStudentRequestsByStudentId(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(data);
        });
    });

    // ---------- createStudentRequest ----------
    describe('createStudentRequest', () => {
        it('uses auth.userId as studentId (ignores client-provided value)', async () => {
            mockUserFindByPk();
            vi.spyOn(StudentRequest, 'create').mockResolvedValue({ id: 'sr-1', studentId: OWNER.id });

            const req = {
                auth: { userId: OWNER.id },
                body: {
                    studentId: ATTACKER.id,
                    cityId: 1,
                    budgetMax: 1000,
                    propertyTypeDesired: 'habitacion',
                    moveInDate: '2026-06-01'
                }
            };
            const res = createRes();

            await studentRequestController.createStudentRequest(req, res, vi.fn());

            expect(StudentRequest.create).toHaveBeenCalledWith(
                expect.objectContaining({ studentId: OWNER.id })
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    // ---------- updateStudentRequest ----------
    describe('updateStudentRequest', () => {
        it('returns 403 when attacker tries to update another student\'s request', async () => {
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({ id: 'sr-1', studentId: OWNER.id });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, body: { budgetMax: 9999 }, auth: { userId: ATTACKER.id } };
            const res = createRes();

            await studentRequestController.updateStudentRequest(req, res, (err) => {
                res.status(err.statusCode);
                res.json({ error: err.message, code: err.code });
            });

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'STUDENT_REQUEST_FORBIDDEN' })
            );
        });

        it('returns 200 when owner updates their own request', async () => {
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({ id: 'sr-1', studentId: OWNER.id, update: vi.fn().mockResolvedValue({}) });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, body: { budgetMax: 9999 }, auth: { userId: OWNER.id } };
            const res = createRes();

            await studentRequestController.updateStudentRequest(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'sr-1', studentId: OWNER.id })
            );
        });

        it('returns 200 when admin updates any request', async () => {
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({ id: 'sr-1', studentId: OWNER.id, update: vi.fn().mockResolvedValue({}) });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, body: {}, auth: { userId: ADMIN.id } };
            const res = createRes();

            await studentRequestController.updateStudentRequest(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'sr-1', studentId: OWNER.id })
            );
        });
    });

    // ---------- closeStudentRequest ----------
    describe('closeStudentRequest', () => {
        it('returns 403 when attacker closes another student\'s request', async () => {
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({ id: 'sr-1', studentId: OWNER.id });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, auth: { userId: ATTACKER.id } };
            const res = createRes();

            await studentRequestController.closeStudentRequest(req, res, (err) => {
                res.status(err.statusCode);
                res.json({ error: err.message, code: err.code });
            });

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('returns 200 when owner closes their own request', async () => {
            const updated = { id: 'sr-1', studentId: OWNER.id, status: 'closed' };
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({
                id: 'sr-1', studentId: OWNER.id, update: vi.fn().mockResolvedValue(updated)
            });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, auth: { userId: OWNER.id } };
            const res = createRes();

            await studentRequestController.closeStudentRequest(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Student request closed successfully' })
            );
        });
    });

    // ---------- deleteStudentRequest ----------
    describe('deleteStudentRequest', () => {
        it('returns 403 when attacker deletes another student\'s request', async () => {
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({ id: 'sr-1', studentId: OWNER.id });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, auth: { userId: ATTACKER.id } };
            const res = createRes();

            await studentRequestController.deleteStudentRequest(req, res, (err) => {
                res.status(err.statusCode);
                res.json({ error: err.message, code: err.code });
            });

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('returns 200 when owner deletes their own request', async () => {
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({
                id: 'sr-1', studentId: OWNER.id, destroy: vi.fn().mockResolvedValue({})
            });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, auth: { userId: OWNER.id } };
            const res = createRes();

            await studentRequestController.deleteStudentRequest(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Student request deleted successfully' })
            );
        });

        it('returns 200 when admin deletes any request', async () => {
            vi.spyOn(StudentRequest, 'findByPk').mockResolvedValue({
                id: 'sr-1', studentId: OWNER.id, destroy: vi.fn().mockResolvedValue({})
            });
            mockUserFindByPk();

            const req = { params: { id: 'sr-1' }, auth: { userId: ADMIN.id } };
            const res = createRes();

            await studentRequestController.deleteStudentRequest(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Student request deleted successfully' })
            );
        });
    });
});
