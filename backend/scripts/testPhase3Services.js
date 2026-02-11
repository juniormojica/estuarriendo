/**
 * Test Script for Phase 3: Container Services
 * Verifies that container service functions work correctly
 */

import containerService from '../src/services/containerService.js';
import { propertyService } from '../src/services/index.js';
import { sequelize, Property, CommonArea } from '../src/models/index.js';

async function testContainerServices() {
    console.log('\n🧪 Testing Phase 3: Container Services');
    console.log('='.repeat(60));

    const transaction = await sequelize.transaction();

    try {
        // Get a real user for testing
        console.log('\n0️⃣  Getting real user for testing...');
        const { User } = await import('../src/models/index.js');
        const testUser = await User.findOne();

        if (!testUser) {
            throw new Error('No users found in database. Please create a user first.');
        }

        console.log('✅ Using user:', testUser.id);

        // Test 1: Create a container (pension)
        console.log('\n1️⃣  Testing createContainer...');

        const containerData = {
            ownerId: testUser.id,
            typeId: 3, // Assuming 3 is pension
            locationId: 1, // Assuming location exists
            title: 'Test Pension Container',
            description: 'A test pension for container services',
            monthlyRent: 0, // Container itself has no rent
            currency: 'COP',
            status: 'pending',
            rentalMode: 'by_unit',
            requiresDeposit: true,
            minimumContractMonths: 6,
            services: [
                {
                    serviceType: 'breakfast',
                    isIncluded: true,
                    additionalCost: 0,
                    description: 'Breakfast included'
                },
                {
                    serviceType: 'wifi',
                    isIncluded: true,
                    additionalCost: 0
                }
            ],
            rules: [
                {
                    ruleType: 'curfew',
                    isAllowed: true,
                    value: '23:00',
                    description: 'Curfew at 11pm'
                },
                {
                    ruleType: 'smoking',
                    isAllowed: false,
                    description: 'No smoking allowed'
                }
            ],
            commonAreaIds: [1, 2, 3] // Cocina, Sala, Comedor
        };

        const container = await containerService.createContainer(containerData, transaction);
        console.log('✅ Container created:', {
            id: container.id,
            title: container.title,
            isContainer: container.isContainer,
            rentalMode: container.rentalMode,
            totalUnits: container.totalUnits
        });

        // Test 2: Create units in the container
        console.log('\n2️⃣  Testing createUnit...');

        const unit1Data = {
            title: 'Habitación 1 - Con baño privado',
            description: 'Habitación individual con baño privado',
            monthlyRent: 800000,
            deposit: 800000,
            currency: 'COP',
            area: 15,
            roomType: 'individual',
            bedsInRoom: 1,
            status: 'pending'
        };

        const unit1 = await containerService.createUnit(container.id, unit1Data, transaction);
        console.log('✅ Unit 1 created:', {
            id: unit1.id,
            title: unit1.title,
            parentId: unit1.parentId,
            roomType: unit1.roomType,
            monthlyRent: unit1.monthlyRent
        });

        const unit2Data = {
            title: 'Habitación 2 - Compartida',
            description: 'Habitación compartida con 2 camas',
            monthlyRent: 550000,
            deposit: 550000,
            currency: 'COP',
            area: 18,
            roomType: 'shared',
            bedsInRoom: 2,
            status: 'pending'
        };

        const unit2 = await containerService.createUnit(container.id, unit2Data, transaction);
        console.log('✅ Unit 2 created:', {
            id: unit2.id,
            title: unit2.title,
            roomType: unit2.roomType,
            bedsInRoom: unit2.bedsInRoom
        });

        // Test 3: Verify container was updated
        console.log('\n3️⃣  Testing container update after adding units...');

        const updatedContainer = await Property.findByPk(container.id, { transaction });
        console.log('✅ Container updated:', {
            totalUnits: updatedContainer.totalUnits,
            availableUnits: updatedContainer.availableUnits
        });

        if (updatedContainer.totalUnits !== 2) {
            throw new Error('Container totalUnits should be 2');
        }
        if (updatedContainer.availableUnits !== 2) {
            throw new Error('Container availableUnits should be 2');
        }

        // Test 4: Update unit rental status
        console.log('\n4️⃣  Testing updateUnitRentalStatus...');

        await containerService.updateUnitRentalStatus(unit1.id, true, transaction);
        console.log('✅ Unit 1 marked as rented');

        const containerAfterRent = await Property.findByPk(container.id, { transaction });
        console.log('✅ Container availability updated:', {
            availableUnits: containerAfterRent.availableUnits
        });

        if (containerAfterRent.availableUnits !== 1) {
            throw new Error('Container availableUnits should be 1 after renting one unit');
        }

        // Test 5: Find container with units
        console.log('\n5️⃣  Testing findContainerWithUnits...');

        // Commit the transaction to persist data
        await transaction.commit();

        // Now test findContainerWithUnits with the persisted container
        const containerWithUnits = await containerService.findContainerWithUnits(container.id);

        console.log('✅ Container with units found:', {
            id: containerWithUnits.id,
            title: containerWithUnits.title,
            unitsCount: containerWithUnits.units.length,
            servicesCount: containerWithUnits.services.length,
            rulesCount: containerWithUnits.rules.length,
            commonAreasCount: containerWithUnits.commonAreas.length
        });

        if (containerWithUnits.units.length !== 2) {
            throw new Error('Container should have 2 units');
        }

        // Cleanup - delete the test container
        await Property.destroy({ where: { id: container.id } });
        console.log('✅ Test data cleaned up');

        console.log('\n' + '='.repeat(60));
        console.log('🎉 All container service tests passed!');
        console.log('='.repeat(60));

    } catch (error) {
        // Only rollback if transaction is still active
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        console.error('\n❌ Test failed:');
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

testContainerServices();
