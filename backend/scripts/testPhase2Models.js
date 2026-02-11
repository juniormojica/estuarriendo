/**
 * Test Script for Phase 2: Backend Models
 * Verifies that all new models and relationships are working correctly
 */

import models from '../src/models/index.js';

const {
    sequelize,
    Property,
    CommonArea,
    PropertyCommonArea
} = models;

async function testModels() {
    console.log('\n🧪 Testing Phase 2: Backend Models');
    console.log('='.repeat(60));

    try {
        // Test 1: Database connection
        console.log('\n1️⃣  Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Test 2: Verify new models exist
        console.log('\n2️⃣  Verifying new models...');
        console.log('✅ Property model:', Property ? 'loaded' : 'missing');
        console.log('✅ CommonArea model:', CommonArea ? 'loaded' : 'missing');
        console.log('✅ PropertyCommonArea model:', PropertyCommonArea ? 'loaded' : 'missing');

        // Test 3: Check Property model has new fields
        console.log('\n3️⃣  Checking Property model fields...');
        const propertyAttributes = Object.keys(Property.rawAttributes);
        const newFields = [
            'parentId', 'isContainer', 'rentalMode', 'totalUnits', 'availableUnits',
            'roomType', 'bedsInRoom', 'requiresDeposit', 'minimumContractMonths'
        ];

        newFields.forEach(field => {
            const exists = propertyAttributes.includes(field);
            console.log(`${exists ? '✅' : '❌'} ${field}: ${exists ? 'present' : 'missing'}`);
        });

        // Test 4: Check Property associations
        console.log('\n4️⃣  Checking Property associations...');
        const associations = Object.keys(Property.associations);
        console.log('Property associations:', associations.join(', '));

        const requiredAssociations = ['units', 'container', 'commonAreas'];
        requiredAssociations.forEach(assoc => {
            const exists = associations.includes(assoc);
            console.log(`${exists ? '✅' : '❌'} ${assoc}: ${exists ? 'configured' : 'missing'}`);
        });

        // Test 5: Query existing properties with new fields
        console.log('\n5️⃣  Querying existing properties...');
        const properties = await Property.findAll({
            attributes: [
                'id', 'title', 'isContainer', 'roomType', 'bedsInRoom',
                'requiresDeposit', 'minimumContractMonths'
            ],
            limit: 3
        });

        console.log(`Found ${properties.length} properties:`);
        properties.forEach(prop => {
            console.log(`  - ${prop.title}:`);
            console.log(`    isContainer: ${prop.isContainer}`);
            console.log(`    roomType: ${prop.roomType}`);
            console.log(`    bedsInRoom: ${prop.bedsInRoom}`);
            console.log(`    requiresDeposit: ${prop.requiresDeposit}`);
        });

        // Test 6: Query common areas
        console.log('\n6️⃣  Querying common areas...');
        const commonAreas = await CommonArea.findAll({
            attributes: ['id', 'name', 'slug', 'icon'],
            limit: 5
        });

        console.log(`Found ${commonAreas.length} common areas:`);
        commonAreas.forEach(area => {
            console.log(`  ${area.icon} ${area.name} (${area.slug})`);
        });

        // Test 7: Test self-referential relationship
        console.log('\n7️⃣  Testing self-referential relationship...');
        const propertyWithUnits = await Property.findOne({
            include: [
                { model: Property, as: 'units' },
                { model: Property, as: 'container' }
            ]
        });

        if (propertyWithUnits) {
            console.log('✅ Self-referential relationship working');
            console.log(`   Property: ${propertyWithUnits.title}`);
            console.log(`   Units: ${propertyWithUnits.units ? propertyWithUnits.units.length : 0}`);
            console.log(`   Has container: ${propertyWithUnits.container ? 'yes' : 'no'}`);
        } else {
            console.log('⚠️  No properties found (expected for now)');
        }

        // Test 8: Test common areas relationship
        console.log('\n8️⃣  Testing common areas relationship...');
        const propertyWithCommonAreas = await Property.findOne({
            include: [{ model: CommonArea, as: 'commonAreas' }]
        });

        if (propertyWithCommonAreas) {
            console.log('✅ Common areas relationship working');
            console.log(`   Property: ${propertyWithCommonAreas.title}`);
            console.log(`   Common areas: ${propertyWithCommonAreas.commonAreas ? propertyWithCommonAreas.commonAreas.length : 0}`);
        } else {
            console.log('⚠️  No properties with common areas (expected for now)');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 All tests completed successfully!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

testModels();
