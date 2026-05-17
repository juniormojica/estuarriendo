'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add investigating state to PropertyReportStatus enum
        // In PostgreSQL, adding an enum value must happen outside a transaction or block
        await queryInterface.sequelize.query(`
      ALTER TYPE "enum_property_reports_status" ADD VALUE IF NOT EXISTS 'investigating';
    `).catch(e => console.log('Enum value already exists or error:', e.message));

        // 2. Create the report_activity_logs table
        await queryInterface.createTable('report_activity_logs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            report_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'property_reports',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            admin_id: {
                type: Sequelize.STRING(255),
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            action: {
                type: Sequelize.ENUM('contact_attempt', 'note_added', 'owner_contacted', 'owner_confirmed_rented', 'owner_denied', 'confirmed', 'rejected'),
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 3. Add index
        await queryInterface.addIndex('report_activity_logs', ['report_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('report_activity_logs');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_report_activity_logs_action";');
        // Note: PostgreSQL doesn't allow removing values from an ENUM type easily.
        // It's usually safer to leave the 'investigating' value in the DB if rolling back.
    }
};
