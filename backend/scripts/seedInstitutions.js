import { sequelize } from '../src/config/database.js';
import { Institution, City, Property, PropertyInstitution, Location } from '../src/models/index.js';

/**
 * Seed Institutions Script
 * Populates database with real educational institutions from Valledupar
 * and associates them with existing properties
 */

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // Distance in meters
}

const seedInstitutions = async () => {
    try {
        console.log('🎓 Starting institution seeding...');

        // Get Valledupar city ID
        const valledupar = await City.findOne({
            where: { name: 'Valledupar' }
        });

        if (!valledupar) {
            throw new Error('Valledupar city not found in database. Please run city seeding first.');
        }

        console.log(`✅ Found Valledupar (ID: ${valledupar.id})`);

        // Educational institutions data
        const institutions = [
            // UNIVERSIDADES
            {
                name: 'Universidad Popular del Cesar - UPC',
                acronym: 'UPC',
                type: 'universidad',
                cityId: valledupar.id,
                latitude: 10.4594,
                longitude: -73.2625
            },
            {
                name: 'Universidad de Santander - UDES',
                acronym: 'UDES',
                type: 'universidad',
                cityId: valledupar.id,
                latitude: 10.4851,
                longitude: -73.2438
            },
            {
                name: 'Fundación Universitaria del Área Andina',
                acronym: 'AREANDINA',
                type: 'universidad',
                cityId: valledupar.id,
                latitude: 10.4792,
                longitude: -73.2456
            },
            {
                name: 'Universidad Nacional Abierta y a Distancia - UNAD',
                acronym: 'UNAD',
                type: 'universidad',
                cityId: valledupar.id,
                latitude: 10.4631,
                longitude: -73.2532
            },
            {
                name: 'Universidad Antonio Nariño',
                acronym: 'UAN',
                type: 'universidad',
                cityId: valledupar.id,
                latitude: 10.4720,
                longitude: -73.2510
            },

            // INSTITUTOS TÉCNICOS Y CENTROS DE FORMACIÓN
            {
                name: 'SENA - Centro de Formación Valledupar',
                acronym: 'SENA',
                type: 'instituto',
                cityId: valledupar.id,
                latitude: 10.4700,
                longitude: -73.2500
            },
            {
                name: 'UPARSYSTEM - Universidad para el Desarrollo',
                acronym: 'UPARSYSTEM',
                type: 'instituto',
                cityId: valledupar.id,
                latitude: 10.4680,
                longitude: -73.2490
            },
            {
                name: 'INSTECOM - Instituto Técnico de Comercio',
                acronym: 'INSTECOM',
                type: 'instituto',
                cityId: valledupar.id,
                latitude: 10.4650,
                longitude: -73.2520
            },
            {
                name: 'Instituto Técnico Nacional de Comercio',
                acronym: 'ITNC',
                type: 'instituto',
                cityId: valledupar.id,
                latitude: 10.4640,
                longitude: -73.2530
            },
            {
                name: 'Politécnico de la Costa Atlántica',
                acronym: 'POLITECNICO',
                type: 'instituto',
                cityId: valledupar.id,
                latitude: 10.4710,
                longitude: -73.2480
            },
            {
                name: 'Instituto Técnico Agropecuario',
                acronym: 'ITA',
                type: 'instituto',
                cityId: valledupar.id,
                latitude: 10.4600,
                longitude: -73.2550
            }
        ];

        // Clear existing institutions for Valledupar (optional - for clean re-seeding)
        const existingCount = await Institution.count({
            where: { cityId: valledupar.id }
        });

        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing institutions in Valledupar`);
            console.log('   Skipping seeding to avoid duplicates.');
            console.log('   To re-seed, manually delete institutions first.');
            return;
        }

        // Create institutions
        console.log(`📝 Creating ${institutions.length} institutions...`);
        const createdInstitutions = await Institution.bulkCreate(institutions);
        console.log(`✅ Created ${createdInstitutions.length} institutions`);

        // Associate institutions with properties based on proximity
        console.log('🔗 Associating institutions with properties...');

        const properties = await Property.findAll({
            include: [
                {
                    model: Location,
                    as: 'location',
                    where: { cityId: valledupar.id }
                }
            ]
        });

        console.log(`   Found ${properties.length} properties in Valledupar`);

        const associations = [];
        const MAX_DISTANCE = 5000; // 5km - only associate if within this distance

        for (const property of properties) {
            if (!property.location || !property.location.latitude || !property.location.longitude) {
                console.log(`   ⚠️  Property ${property.id} has no coordinates, skipping`);
                continue;
            }

            for (const institution of createdInstitutions) {
                const distance = calculateDistance(
                    property.location.latitude,
                    property.location.longitude,
                    institution.latitude,
                    institution.longitude
                );

                // Only associate if within MAX_DISTANCE
                if (distance <= MAX_DISTANCE) {
                    associations.push({
                        propertyId: property.id,
                        institutionId: institution.id,
                        distance: distance
                    });
                }
            }
        }

        if (associations.length > 0) {
            await PropertyInstitution.bulkCreate(associations);
            console.log(`✅ Created ${associations.length} property-institution associations`);
        } else {
            console.log('   ℹ️  No properties found within range of institutions');
        }

        // Summary statistics
        console.log('\n📊 Seeding Summary:');
        console.log(`   Universidades: ${institutions.filter(i => i.type === 'universidad').length}`);
        console.log(`   Institutos: ${institutions.filter(i => i.type === 'instituto').length}`);
        console.log(`   Total: ${institutions.length}`);
        console.log(`   Property associations: ${associations.length}`);

        console.log('\n✅ Institution seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding institutions:', error);
        throw error;
    }
};

// Run seed
seedInstitutions()
    .then(() => {
        console.log('✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });

