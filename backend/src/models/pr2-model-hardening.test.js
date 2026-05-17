import { describe, expect, it } from 'vitest';
import Property from './Property.js';
import Notification from './Notification.js';
import ActivityLog from './ActivityLog.js';
import StudentRequest from './StudentRequest.js';
import ContactUnlock from './ContactUnlock.js';
import City from './City.js';
import Department from './Department.js';
import Favorite from './Favorite.js';

const indexFields = model => (model.options.indexes ?? []).map(index => index.fields.join(','));

describe('PR2 model hardening', () => {
    it('adds operational index coverage for audited filters and foreign keys', () => {
        expect(indexFields(Property)).toEqual(expect.arrayContaining([
            'owner_id',
            'location_id',
            'type_id',
            'status',
            'is_container'
        ]));

        expect(indexFields(Notification)).toEqual(expect.arrayContaining([
            'user_id',
            'read',
            'user_id,read'
        ]));

        expect(indexFields(ActivityLog)).toEqual(expect.arrayContaining([
            'user_id',
            'type'
        ]));

        expect(indexFields(StudentRequest)).toEqual(expect.arrayContaining([
            'city_id',
            'status'
        ]));

        expect(indexFields(ContactUnlock)).toEqual(expect.arrayContaining([
            'owner_id',
            'status'
        ]));
    });

    it('preserves manual updatedAt intent for city/department', () => {
        expect(City.rawAttributes.updatedAt.allowNull).toBe(true);
        expect(City.rawAttributes.updatedAt.defaultValue).toBeUndefined();

        expect(Department.rawAttributes.updatedAt.allowNull).toBe(true);
        expect(Department.rawAttributes.updatedAt.defaultValue).toBeUndefined();
    });

    it('keeps Favorite uniqueness strategy unchanged in PR2', () => {
        expect(Favorite.primaryKeyAttributes).toEqual(expect.arrayContaining(['userId', 'propertyId']));
        expect(indexFields(Favorite)).toContain('user_id,property_id');
    });
});
