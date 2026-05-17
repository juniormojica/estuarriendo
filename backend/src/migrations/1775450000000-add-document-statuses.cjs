'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const hasColumn = async (tableName, columnName) => {
            const table = await queryInterface.describeTable(tableName);
            return Boolean(table[columnName]);
        };
        const hadStatusColumnsBefore = (
            await hasColumn('user_verification_documents', 'id_front_status') ||
            await hasColumn('user_verification_documents', 'id_back_status') ||
            await hasColumn('user_verification_documents', 'selfie_status') ||
            await hasColumn('user_verification_documents', 'utility_bill_status')
        );

        // 1. Add in_progress to verification_status enums (handle potential existing values gently)
        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_users_verification_status" ADD VALUE IF NOT EXISTS 'in_progress';
        `).catch(e => console.log('Enum users verification_status value already exists or error:', e.message));

        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_user_verification_verification_status" ADD VALUE IF NOT EXISTS 'in_progress';
        `).catch(e => console.log('Enum user_verification verification_status value already exists or error:', e.message));

        // 2. Make existing document columns nullable
        const documentColumns = ['id_front', 'id_back', 'selfie'];
        for (const col of documentColumns) {
            await queryInterface.changeColumn('user_verification_documents', col, {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        // 3. Add individual document status columns
        const enumValues = ['not_submitted', 'pending', 'approved', 'rejected'];
        
        if (!(await hasColumn('user_verification_documents', 'id_front_status'))) {
            await queryInterface.addColumn('user_verification_documents', 'id_front_status', {
                type: Sequelize.ENUM(...enumValues),
                allowNull: false,
                defaultValue: 'not_submitted'
            });
        }
        
        if (!(await hasColumn('user_verification_documents', 'id_front_rejection_reason'))) {
            await queryInterface.addColumn('user_verification_documents', 'id_front_rejection_reason', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        if (!(await hasColumn('user_verification_documents', 'id_back_status'))) {
            await queryInterface.addColumn('user_verification_documents', 'id_back_status', {
                type: Sequelize.ENUM(...enumValues),
                allowNull: false,
                defaultValue: 'not_submitted'
            });
        }

        if (!(await hasColumn('user_verification_documents', 'id_back_rejection_reason'))) {
            await queryInterface.addColumn('user_verification_documents', 'id_back_rejection_reason', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        if (!(await hasColumn('user_verification_documents', 'selfie_status'))) {
            await queryInterface.addColumn('user_verification_documents', 'selfie_status', {
                type: Sequelize.ENUM(...enumValues),
                allowNull: false,
                defaultValue: 'not_submitted'
            });
        }

        if (!(await hasColumn('user_verification_documents', 'selfie_rejection_reason'))) {
            await queryInterface.addColumn('user_verification_documents', 'selfie_rejection_reason', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        if (!(await hasColumn('user_verification_documents', 'utility_bill_status'))) {
            await queryInterface.addColumn('user_verification_documents', 'utility_bill_status', {
                type: Sequelize.ENUM(...enumValues),
                allowNull: false,
                defaultValue: 'not_submitted'
            });
        }

        if (!(await hasColumn('user_verification_documents', 'utility_bill_rejection_reason'))) {
            await queryInterface.addColumn('user_verification_documents', 'utility_bill_rejection_reason', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        // 4. Data Migration: Automatically set statuses for existing documents
        // If status columns were pre-existing, skip to avoid enum-type mismatches in legacy schemas.
        if (!hadStatusColumnsBefore) {
            // Approve documents for verified users
            await queryInterface.sequelize.query(`
            UPDATE user_verification_documents uvd
            SET 
                id_front_status = (CASE WHEN id_front IS NOT NULL THEN 'approved' ELSE 'not_submitted' END),
                id_back_status = (CASE WHEN id_back IS NOT NULL THEN 'approved' ELSE 'not_submitted' END),
                selfie_status = (CASE WHEN selfie IS NOT NULL THEN 'approved' ELSE 'not_submitted' END),
                utility_bill_status = (CASE WHEN utility_bill IS NOT NULL THEN 'approved' ELSE 'not_submitted' END)
            FROM users u
            WHERE uvd.user_id = u.id AND u.verification_status = 'verified';
        `);

            // Pend documents for pending users
            await queryInterface.sequelize.query(`
            UPDATE user_verification_documents uvd
            SET 
                id_front_status = (CASE WHEN id_front IS NOT NULL THEN 'pending' ELSE 'not_submitted' END),
                id_back_status = (CASE WHEN id_back IS NOT NULL THEN 'pending' ELSE 'not_submitted' END),
                selfie_status = (CASE WHEN selfie IS NOT NULL THEN 'pending' ELSE 'not_submitted' END),
                utility_bill_status = (CASE WHEN utility_bill IS NOT NULL THEN 'pending' ELSE 'not_submitted' END)
            FROM users u
            WHERE uvd.user_id = u.id AND u.verification_status = 'pending';
        `);
        }
    },

    async down(queryInterface, Sequelize) {
        // Rollback new columns
        const columns = [
            'id_front_status', 'id_front_rejection_reason',
            'id_back_status', 'id_back_rejection_reason',
            'selfie_status', 'selfie_rejection_reason',
            'utility_bill_status', 'utility_bill_rejection_reason'
        ];

        for (const col of columns) {
            await queryInterface.removeColumn('user_verification_documents', col);
        }

        // Restore allowNull: false for original document columns
        const documentColumns = ['id_front', 'id_back', 'selfie'];
        for (const col of documentColumns) {
            await queryInterface.changeColumn('user_verification_documents', col, {
                type: Sequelize.TEXT,
                allowNull: true // Keeping true to prevent rollback errors on null rows
            });
        }
        
        // Note: Cannot revert ENUM values via query easily
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_user_verification_documents_id_front_status";`).catch(() => {});
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_user_verification_documents_id_back_status";`).catch(() => {});
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_user_verification_documents_selfie_status";`).catch(() => {});
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_user_verification_documents_utility_bill_status";`).catch(() => {});
    }
};
