import { sequelize } from './src/config/database.js';

async function runMigration() {
    try {
        console.log('Starting migration...');

        await sequelize.query(`
            ALTER TYPE "enum_users_verification_status" ADD VALUE IF NOT EXISTS 'in_progress';
        `).catch(e => console.log('Enum users verification_status value already exists or error:', e.message));

        await sequelize.query(`
            ALTER TYPE "enum_user_verification_verification_status" ADD VALUE IF NOT EXISTS 'in_progress';
        `).catch(e => console.log('Enum user_verification verification_status value already exists or error:', e.message));

        const enumValues = "('not_submitted', 'pending', 'approved', 'rejected')";
        
        // Create the new ENUM type for individual document statuses
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "enum_user_verification_documents_status" AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Make existing document columns nullable
        await sequelize.query(`ALTER TABLE user_verification_documents ALTER COLUMN id_front DROP NOT NULL;`);
        await sequelize.query(`ALTER TABLE user_verification_documents ALTER COLUMN id_back DROP NOT NULL;`);
        await sequelize.query(`ALTER TABLE user_verification_documents ALTER COLUMN selfie DROP NOT NULL;`);

        // Add new individual document status columns
        const addColumns = [
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS id_front_status "enum_user_verification_documents_status" NOT NULL DEFAULT 'not_submitted';`,
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS id_front_rejection_reason TEXT;`,
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS id_back_status "enum_user_verification_documents_status" NOT NULL DEFAULT 'not_submitted';`,
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS id_back_rejection_reason TEXT;`,
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS selfie_status "enum_user_verification_documents_status" NOT NULL DEFAULT 'not_submitted';`,
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS selfie_rejection_reason TEXT;`,
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS utility_bill_status "enum_user_verification_documents_status" NOT NULL DEFAULT 'not_submitted';`,
            `ALTER TABLE user_verification_documents ADD COLUMN IF NOT EXISTS utility_bill_rejection_reason TEXT;`
        ];

        for (const query of addColumns) {
            await sequelize.query(query).catch(e => console.log('Notice:', e.message));
        }

        // Migrate data
        await sequelize.query(`
            UPDATE user_verification_documents uvd
            SET 
                id_front_status = (CASE WHEN id_front IS NOT NULL THEN 'approved'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END),
                id_back_status = (CASE WHEN id_back IS NOT NULL THEN 'approved'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END),
                selfie_status = (CASE WHEN selfie IS NOT NULL THEN 'approved'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END),
                utility_bill_status = (CASE WHEN utility_bill IS NOT NULL THEN 'approved'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END)
            FROM users u
            WHERE uvd.user_id = u.id AND u.verification_status = 'verified';
        `);

        await sequelize.query(`
            UPDATE user_verification_documents uvd
            SET 
                id_front_status = (CASE WHEN id_front IS NOT NULL THEN 'pending'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END),
                id_back_status = (CASE WHEN id_back IS NOT NULL THEN 'pending'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END),
                selfie_status = (CASE WHEN selfie IS NOT NULL THEN 'pending'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END),
                utility_bill_status = (CASE WHEN utility_bill IS NOT NULL THEN 'pending'::"enum_user_verification_documents_status" ELSE 'not_submitted'::"enum_user_verification_documents_status" END)
            FROM users u
            WHERE uvd.user_id = u.id AND u.verification_status = 'pending';
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

runMigration();
