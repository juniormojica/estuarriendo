import { describe, expect, it } from 'vitest';
import { enumDefinitions } from '../config/seedEnums.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import UserBillingDetails from '../models/UserBillingDetails.js';
import { NotificationType, PaymentMethod, PropertyReportStatus, ReportActivityAction, UserType, VerificationStatus, getEnumValues } from './enums.js';

const asSorted = (values) => [...values].sort();
const enumValuesByName = Object.fromEntries(enumDefinitions.map(({ name, values }) => [name, values]));
const modelEnumValues = (model, fieldName) => model.rawAttributes[fieldName].type.options.values;

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

describe('Persisted enum parity audit', () => {
    it('keeps enum_notifications_type aligned across shared constants, model and seed definitions', () => {
        const expected = asSorted(getEnumValues(NotificationType));

        expect(asSorted(enumValuesByName.enum_notifications_type)).toEqual(expected);
        expect(asSorted(modelEnumValues(Notification, 'type'))).toEqual(expected);
    });

    it('keeps enum_users_verification_status aligned across shared constants, model and seed definitions', () => {
        const expected = asSorted(getEnumValues(VerificationStatus));

        expect(asSorted(enumValuesByName.enum_users_verification_status)).toEqual(expected);
        expect(asSorted(modelEnumValues(User, 'verificationStatus'))).toEqual(expected);
    });

    it('keeps enum_users_payment_preference aligned across shared constants, model and seed definitions', () => {
        const expected = asSorted(getEnumValues(PaymentMethod));

        expect(asSorted(enumValuesByName.enum_users_payment_preference)).toEqual(expected);
        expect(asSorted(modelEnumValues(UserBillingDetails, 'paymentPreference'))).toEqual(expected);
    });
});
