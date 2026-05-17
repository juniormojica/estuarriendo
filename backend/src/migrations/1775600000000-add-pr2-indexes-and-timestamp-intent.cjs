'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('properties', ['owner_id']);
        await queryInterface.addIndex('properties', ['location_id']);
        await queryInterface.addIndex('properties', ['type_id']);
        await queryInterface.addIndex('properties', ['status']);
        await queryInterface.addIndex('properties', ['is_container']);

        await queryInterface.addIndex('notifications', ['user_id']);
        await queryInterface.addIndex('notifications', ['read']);
        await queryInterface.addIndex('notifications', ['user_id', 'read']);

        await queryInterface.addIndex('activity_log', ['user_id']);
        await queryInterface.addIndex('activity_log', ['type']);

        await queryInterface.addIndex('student_requests', ['city_id']);
        await queryInterface.addIndex('student_requests', ['status']);

        await queryInterface.addIndex('contact_unlocks', ['owner_id']);
        await queryInterface.addIndex('contact_unlocks', ['status']);

        await queryInterface.changeColumn('cities', 'updated_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.changeColumn('departments', 'updated_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('properties', ['owner_id']);
        await queryInterface.removeIndex('properties', ['location_id']);
        await queryInterface.removeIndex('properties', ['type_id']);
        await queryInterface.removeIndex('properties', ['status']);
        await queryInterface.removeIndex('properties', ['is_container']);

        await queryInterface.removeIndex('notifications', ['user_id']);
        await queryInterface.removeIndex('notifications', ['read']);
        await queryInterface.removeIndex('notifications', ['user_id', 'read']);

        await queryInterface.removeIndex('activity_log', ['user_id']);
        await queryInterface.removeIndex('activity_log', ['type']);

        await queryInterface.removeIndex('student_requests', ['city_id']);
        await queryInterface.removeIndex('student_requests', ['status']);

        await queryInterface.removeIndex('contact_unlocks', ['owner_id']);
        await queryInterface.removeIndex('contact_unlocks', ['status']);

        await queryInterface.changeColumn('cities', 'updated_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: Sequelize.NOW
        });

        await queryInterface.changeColumn('departments', 'updated_at', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: Sequelize.NOW
        });
    }
};
