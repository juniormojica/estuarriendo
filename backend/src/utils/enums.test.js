import { describe, expect, it } from 'vitest';
import { PropertyReportStatus, ReportActivityAction, UserType, getEnumValues } from './enums.js';

describe('UserType enum contract', () => {
    it('SUPER_ADMIN resolves to super_admin', () => {
        expect(UserType.SUPER_ADMIN).toBe('super_admin');
    });

    it('ADMIN resolves to admin', () => {
        expect(UserType.ADMIN).toBe('admin');
    });

    it('OWNER resolves to owner', () => {
        expect(UserType.OWNER).toBe('owner');
    });

    it('TENANT resolves to tenant', () => {
        expect(UserType.TENANT).toBe('tenant');
    });

    it('all UserType values match expected set', () => {
        const values = getEnumValues(UserType);
        expect(values).toContain('super_admin');
        expect(values).toContain('admin');
        expect(values).toContain('owner');
        expect(values).toContain('tenant');
    });
});

describe('Report enums contract', () => {
    it('PropertyReportStatus includes investigating', () => {
        const values = getEnumValues(PropertyReportStatus);
        expect(values).toContain('investigating');
    });

    it('ReportActivityAction has expected workflow actions', () => {
        const values = getEnumValues(ReportActivityAction);
        expect(values).toContain('contact_attempt');
        expect(values).toContain('note_added');
        expect(values).toContain('owner_contacted');
        expect(values).toContain('owner_confirmed_rented');
        expect(values).toContain('owner_denied');
        expect(values).toContain('confirmed');
        expect(values).toContain('rejected');
    });
});
