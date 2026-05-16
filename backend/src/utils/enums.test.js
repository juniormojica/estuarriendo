import { describe, expect, it } from 'vitest';
import { UserType, getEnumValues } from './enums.js';

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
