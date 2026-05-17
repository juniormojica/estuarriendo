import { sequelize } from './database.js';

/**
 * Seeds all required PostgreSQL ENUM types for the database
 * This function is idempotent - it can be run multiple times safely
 * It will only create ENUMs if they don't already exist
 */
export const enumDefinitions = [
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
        values: ['owner', 'tenant', 'admin', 'super_admin'],
        comment: 'User roles in the system'
    },
    {
        name: 'enum_users_payment_preference',
        values: ['PSE', 'CreditCard', 'Nequi', 'Daviplata', 'BankTransfer', 'MercadoPago'],
        comment: 'Available payment methods'
    },
    {
        name: 'enum_users_verification_status',
        values: ['not_submitted', 'in_progress', 'pending', 'verified', 'rejected'],
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
        values: [
            'property_interest',
            'payment_verified',
            'payment_rejected',
            'payment_submitted',
            'property_submitted',
            'property_approved',
            'property_rejected',
            'verification_doc_submitted',
            'verification_doc_approved',
            'verification_doc_rejected',
            'verification_submitted',
            'verification_approved',
            'verification_rejected',
            'credit_purchased',
            'credit_used',
            'credit_refunded',
            'property_reported',
            'report_resolved'
        ],
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
    },
    {
        name: 'enum_contact_unlocks_status',
        values: ['active', 'refunded'],
        comment: 'Contact unlock lifecycle status'
    },
    {
        name: 'enum_property_reports_reason',
        values: ['already_rented', 'incorrect_info', 'scam', 'other'],
        comment: 'Reasons users can report a property'
    },
    {
        name: 'enum_property_reports_status',
        values: ['pending', 'investigating', 'confirmed', 'rejected'],
        comment: 'Property report workflow status'
    },
    {
        name: 'enum_report_activity_logs_action',
        values: ['contact_attempt', 'note_added', 'owner_contacted', 'owner_confirmed_rented', 'owner_denied', 'confirmed', 'rejected'],
        comment: 'Admin actions logged for property report review'
    }
];

export const seedEnums = async () => {
    try {
        console.log('🌱 Seeding database ENUM types...');

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

        const enumNames = enumDefinitions.map(({ name }) => name);

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
