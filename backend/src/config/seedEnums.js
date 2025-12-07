import { sequelize } from './database.js';

/**
 * Seeds all required PostgreSQL ENUM types for the database
 * This function is idempotent - it can be run multiple times safely
 * It will only create ENUMs if they don't already exist
 */
export const seedEnums = async () => {
    try {
        console.log('🌱 Seeding database ENUM types...');

        // Define all ENUM types with their values
        const enumDefinitions = [
            {
                name: 'enum_users_id_type',
                values: ['CC', 'NIT', 'CE', 'Pasaporte'],
                comment: 'Types of identification documents'
            },
            {
                name: 'enum_users_owner_role',
                values: ['individual', 'agency'],
                comment: 'Owner types: individual or agency'
            },
            {
                name: 'enum_users_user_type',
                values: ['owner', 'tenant', 'admin', 'superAdmin'],
                comment: 'User roles in the system'
            },
            {
                name: 'enum_users_payment_preference',
                values: ['PSE', 'CreditCard', 'Nequi', 'Daviplata', 'BankTransfer'],
                comment: 'Available payment methods'
            },
            {
                name: 'enum_users_verification_status',
                values: ['not_submitted', 'pending', 'verified', 'rejected'],
                comment: 'User verification status'
            },
            {
                name: 'enum_users_plan',
                values: ['free', 'premium'],
                comment: 'Subscription plan types'
            },
            {
                name: 'enum_users_plan_type',
                values: ['weekly', 'monthly', 'quarterly'],
                comment: 'Subscription duration types'
            },
            {
                name: 'enum_properties_type',
                values: ['pension', 'habitacion', 'apartamento', 'aparta-estudio'],
                comment: 'Types of properties available'
            },
            {
                name: 'enum_properties_status',
                values: ['pending', 'approved', 'rejected'],
                comment: 'Property approval status'
            },
            {
                name: 'enum_payment_requests_plan_type',
                values: ['weekly', 'monthly', 'quarterly'],
                comment: 'Subscription duration types for payment requests'
            },
            {
                name: 'enum_payment_requests_status',
                values: ['pending', 'verified', 'rejected'],
                comment: 'Payment request processing status'
            },
            {
                name: 'enum_notifications_type',
                values: ['property_interest', 'payment_verified', 'property_approved', 'property_rejected'],
                comment: 'Types of user notifications'
            },
            {
                name: 'enum_student_requests_property_type_desired',
                values: ['pension', 'habitacion', 'apartamento', 'aparta-estudio'],
                comment: 'Desired property type for student requests'
            },
            {
                name: 'enum_student_requests_status',
                values: ['open', 'closed'],
                comment: 'Student request status'
            }
        ];

        // Create each ENUM type if it doesn't exist
        for (const enumDef of enumDefinitions) {
            // Check if ENUM already exists
            const [results] = await sequelize.query(`
                SELECT EXISTS (
                    SELECT 1 
                    FROM pg_type 
                    WHERE typname = '${enumDef.name}'
                );
            `);

            const exists = results[0].exists;

            if (!exists) {
                // Create the ENUM type
                const valuesString = enumDef.values.map(v => `'${v}'`).join(', ');
                await sequelize.query(`CREATE TYPE ${enumDef.name} AS ENUM (${valuesString});`);

                // Add comment
                await sequelize.query(`COMMENT ON TYPE ${enumDef.name} IS '${enumDef.comment}';`);

                console.log(`  ✅ Created ENUM: ${enumDef.name}`);
            } else {
                console.log(`  ⏭️  ENUM already exists: ${enumDef.name}`);
            }
        }

        console.log('✅ ENUM seeding completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error seeding ENUMs:', error);
        throw error;
    }
};

/**
 * Drops all ENUM types (useful for development/testing)
 * WARNING: This will cascade delete - use with caution!
 */
export const dropAllEnums = async () => {
    try {
        console.log('🗑️  Dropping all ENUM types...');

        const enumNames = [
            'enum_users_id_type',
            'enum_users_owner_role',
            'enum_users_user_type',
            'enum_users_payment_preference',
            'enum_users_verification_status',
            'enum_users_plan',
            'enum_users_plan_type',
            'enum_properties_type',
            'enum_properties_status',
            'enum_payment_requests_plan_type',
            'enum_payment_requests_status',
            'enum_notifications_type',
            'enum_student_requests_property_type_desired',
            'enum_student_requests_status'
        ];

        for (const enumName of enumNames) {
            await sequelize.query(`DROP TYPE IF EXISTS ${enumName} CASCADE;`);
            console.log(`  ✅ Dropped ENUM: ${enumName}`);
        }

        console.log('✅ All ENUMs dropped successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error dropping ENUMs:', error);
        throw error;
    }
};
