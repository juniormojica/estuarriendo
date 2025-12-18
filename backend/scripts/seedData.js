#!/usr/bin/env node

/**
 * Database Seeding Script
 * Populates the database with realistic test data using Faker.js
 * 
 * Usage:
 *   npm run seed:data        - Seed all data
 *   npm run seed:data:reset  - Clear and reseed all data
 */

import { faker } from '@faker-js/faker';
import { sequelize } from '../src/config/database.js';
import {
    User,
    UserVerificationDocuments,
    Amenity,
    Property,
    PropertyAmenity,
    PaymentRequest,
    StudentRequest,
    Notification,
    ActivityLog,
    // Property normalized models
    Location,
    Contact,
    PropertyFeature,
    PropertyImage,
    PropertyType,
    Institution,
    PropertyInstitution,
    // Location normalized models
    Department,
    City,
    // User normalized models
    UserIdentificationDetails,
    UserVerification,
    UserPasswordReset,
    UserBillingDetails,
    Subscription,
    UserStats
} from '../src/models/index.js';
import {
    IdType,
    OwnerRole,
    UserType,
    PaymentMethod,
    VerificationStatus,
    PlanType,
    SubscriptionType,
    PropertyStatus,
    PaymentRequestStatus,
    NotificationType,
    StudentRequestStatus
} from '../src/utils/enums.js';
import { hashPassword } from '../src/utils/passwordUtils.js';
import * as propertyService from '../src/services/propertyService.js';
import { seedDepartments, seedCities } from './seedLocations.js';

/**
 * Clear all data from the database
 */
const clearDatabase = async () => {
    console.log('🗑️  Clearing database...\n');

    await ActivityLog.destroy({ where: {}, truncate: true, cascade: true });
    await Notification.destroy({ where: {}, truncate: true, cascade: true });
    await StudentRequest.destroy({ where: {}, truncate: true, cascade: true });
    await PaymentRequest.destroy({ where: {}, truncate: true, cascade: true });
    await Subscription.destroy({ where: {}, truncate: true, cascade: true });
    await PropertyInstitution.destroy({ where: {}, truncate: true, cascade: true });
    await PropertyAmenity.destroy({ where: {}, truncate: true, cascade: true });
    await PropertyImage.destroy({ where: {}, truncate: true, cascade: true });
    await PropertyFeature.destroy({ where: {}, truncate: true, cascade: true });
    await Contact.destroy({ where: {}, truncate: true, cascade: true });
    await Property.destroy({ where: {}, truncate: true, cascade: true });
    await Location.destroy({ where: {}, truncate: true, cascade: true });
    await Institution.destroy({ where: {}, truncate: true, cascade: true });
    await City.destroy({ where: {}, truncate: true, cascade: true });
    await Department.destroy({ where: {}, truncate: true, cascade: true });
    await PropertyType.destroy({ where: {}, truncate: true, cascade: true });
    await Amenity.destroy({ where: {}, truncate: true, cascade: true });
    await UserStats.destroy({ where: {}, truncate: true, cascade: true });
    await UserBillingDetails.destroy({ where: {}, truncate: true, cascade: true });
    await UserPasswordReset.destroy({ where: {}, truncate: true, cascade: true });
    await UserVerification.destroy({ where: {}, truncate: true, cascade: true });
    await UserIdentificationDetails.destroy({ where: {}, truncate: true, cascade: true });
    await UserVerificationDocuments.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    console.log('✅ Database cleared\n');
};

/**
 * Seed Users
 */
const seedUsers = async () => {
    console.log('👥 Seeding users...');

    const createdUsers = [];

    // Default password for all test users
    const defaultPassword = await hashPassword('password123');

    // Create 1 Super Admin
    const superAdmin = await User.create({
        id: 'superadmin-001',
        name: 'Super Administrador',
        email: 'superadmin@estuarriendo.com',
        password: defaultPassword,
        phone: '+57 300 123 4567',
        whatsapp: '+57 300 123 4567',
        userType: UserType.SUPER_ADMIN,
        isActive: true,
        plan: PlanType.FREE,
        verificationStatus: VerificationStatus.VERIFIED,
        joinedAt: new Date('2024-01-01')
    });

    await UserVerification.create({
        userId: superAdmin.id,
        isVerified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date('2024-01-01')
    });

    await Subscription.create({
        userId: superAdmin.id,
        plan: PlanType.FREE,
        startedAt: new Date('2024-01-01'),
        status: 'active'
    });

    createdUsers.push(superAdmin);

    // Create 2 Admins
    for (let i = 1; i <= 2; i++) {
        const admin = await User.create({
            id: `admin-00${i}`,
            name: faker.person.fullName(),
            email: `admin${i}@estuarriendo.com`,
            password: defaultPassword,
            phone: faker.phone.number('+57 3## ### ####'),
            whatsapp: faker.phone.number('+57 3## ### ####'),
            userType: UserType.ADMIN,
            isActive: true,
            plan: PlanType.FREE,
            verificationStatus: VerificationStatus.VERIFIED,
            joinedAt: faker.date.past({ years: 1 })
        });

        await UserVerification.create({
            userId: admin.id,
            isVerified: true,
            verificationStatus: VerificationStatus.VERIFIED,
            verifiedAt: faker.date.past({ months: 6 })
        });

        await Subscription.create({
            userId: admin.id,
            plan: PlanType.FREE,
            startedAt: admin.joinedAt,
            status: 'active'
        });

        createdUsers.push(admin);
    }

    // Create 10 Owners (5 individual, 5 agency)
    for (let i = 1; i <= 10; i++) {
        const isAgency = i > 5;
        const isPremium = i <= 3;
        const joinedAt = faker.date.past({ years: 2 });

        const owner = await User.create({
            id: `owner-${String(i).padStart(3, '0')}`,
            name: isAgency ? faker.company.name() : faker.person.fullName(),
            email: `owner${i}@example.com`,
            password: defaultPassword,
            phone: faker.phone.number('+57 3## ### ####'),
            whatsapp: faker.phone.number('+57 3## ### ####'),
            userType: UserType.OWNER,
            isActive: true,
            plan: isPremium ? PlanType.PREMIUM : PlanType.FREE,
            verificationStatus: i <= 7 ? VerificationStatus.VERIFIED :
                i <= 9 ? VerificationStatus.PENDING :
                    VerificationStatus.NOT_SUBMITTED,
            joinedAt
        });

        // Create identification details
        await UserIdentificationDetails.create({
            userId: owner.id,
            idType: faker.helpers.arrayElement([IdType.CC, IdType.NIT, IdType.CE]),
            idNumber: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            ownerRole: isAgency ? OwnerRole.AGENCY : OwnerRole.INDIVIDUAL
        });

        // Create verification record
        const isVerified = i <= 7;
        await UserVerification.create({
            userId: owner.id,
            isVerified,
            verificationStatus: i <= 7 ? VerificationStatus.VERIFIED :
                i <= 9 ? VerificationStatus.PENDING :
                    VerificationStatus.NOT_SUBMITTED,
            availableForVisit: faker.datatype.boolean(),
            verifiedAt: isVerified ? faker.date.past({ months: 6 }) : null
        });

        // Create billing details
        await UserBillingDetails.create({
            userId: owner.id,
            paymentPreference: faker.helpers.arrayElement([
                PaymentMethod.PSE,
                PaymentMethod.BANK_TRANSFER,
                PaymentMethod.NEQUI
            ]),
            bankDetails: {
                bankName: faker.helpers.arrayElement(['Bancolombia', 'Davivienda', 'BBVA', 'Banco de Bogotá']),
                accountNumber: faker.finance.accountNumber(),
                accountType: faker.helpers.arrayElement(['Ahorros', 'Corriente']),
                accountHolderName: isAgency ? faker.company.name() : faker.person.fullName()
            }
        });

        // Create subscription
        if (isPremium) {
            const planStarted = faker.date.recent({ days: 30 });
            const planType = faker.helpers.arrayElement([
                SubscriptionType.WEEKLY,
                SubscriptionType.MONTHLY,
                SubscriptionType.QUARTERLY
            ]);
            const duration = planType === SubscriptionType.WEEKLY ? 7 :
                planType === SubscriptionType.MONTHLY ? 30 : 90;

            await Subscription.create({
                userId: owner.id,
                plan: PlanType.PREMIUM,
                planType,
                startedAt: planStarted,
                expiresAt: new Date(planStarted.getTime() + duration * 24 * 60 * 60 * 1000),
                status: 'active'
            });
        } else {
            await Subscription.create({
                userId: owner.id,
                plan: PlanType.FREE,
                startedAt: joinedAt,
                status: 'active'
            });
        }

        // Create stats (initialized to 0)
        await UserStats.create({
            userId: owner.id,
            propertiesCount: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0
        });

        createdUsers.push(owner);
    }

    // Create 15 Tenants (students)
    for (let i = 1; i <= 15; i++) {
        const joinedAt = faker.date.past({ years: 1 });

        const tenant = await User.create({
            id: `tenant-${String(i).padStart(3, '0')}`,
            name: faker.person.fullName(),
            email: `student${i}@example.com`,
            password: defaultPassword,
            phone: faker.phone.number('+57 3## ### ####'),
            whatsapp: faker.phone.number('+57 3## ### ####'),
            userType: UserType.TENANT,
            isActive: true,
            plan: PlanType.FREE,
            verificationStatus: VerificationStatus.NOT_SUBMITTED,
            joinedAt
        });

        // Create verification record (not verified)
        await UserVerification.create({
            userId: tenant.id,
            isVerified: false,
            verificationStatus: VerificationStatus.NOT_SUBMITTED
        });

        // Create free subscription
        await Subscription.create({
            userId: tenant.id,
            plan: PlanType.FREE,
            startedAt: joinedAt,
            status: 'active'
        });

        createdUsers.push(tenant);
    }

    console.log(`  ✅ Created ${createdUsers.length} users with all associations`);
    console.log(`  🔑 Default password for all users: password123`);

    return createdUsers;
};

/**
 * Seed Amenities
 */
const seedAmenities = async () => {
    console.log('🏠 Seeding amenities...');

    // Amenities matching frontend mockData
    const amenities = [
        { name: 'WiFi', icon: 'wifi' },
        { name: 'Parqueadero', icon: 'parking' },
        { name: 'Piscina', icon: 'pool' },
        { name: 'Gimnasio', icon: 'gym' },
        { name: 'Lavandería', icon: 'laundry' },
        { name: 'Seguridad 24h', icon: 'security' },
        { name: 'Ascensor', icon: 'elevator' },
        { name: 'Balcón', icon: 'balcony' },
        { name: 'Amoblado', icon: 'furnished' },
        { name: 'Aire Acondicionado', icon: 'ac' },
        { name: 'Calefacción', icon: 'heating' },
        { name: 'Cocina Equipada', icon: 'kitchen' },
        // Room-specific amenities
        { name: 'Baño Interno', icon: 'private-bathroom' },
        { name: 'Closet', icon: 'closet' },
        { name: 'Abanico', icon: 'fan' },
        { name: 'Escritorio', icon: 'desk' },
        { name: 'Ventana Exterior', icon: 'window' },
        { name: 'Cama Incluida', icon: 'bed' },
        { name: 'TV', icon: 'tv' }
    ];

    const created = await Amenity.bulkCreate(amenities);
    console.log(`  ✅ Created ${created.length} amenities`);

    return created;
};

/**
 * Seed Property Types
 */
const seedPropertyTypes = async () => {
    console.log('🏠 Seeding property types...');

    const propertyTypes = [
        { name: 'pension', description: 'Pensión estudiantil con servicios compartidos' },
        { name: 'habitacion', description: 'Habitación individual o compartida' },
        { name: 'apartamento', description: 'Apartamento completo' },
        { name: 'aparta-estudio', description: 'Apartaestudio tipo loft' }
    ];

    const createdTypes = await PropertyType.bulkCreate(propertyTypes);
    console.log(`  ✅ Created ${createdTypes.length} property types`);

    return createdTypes;
};

/**
 * Seed Institutions
 */
const seedInstitutions = async (cities) => {
    console.log('🎓 Seeding institutions...');

    // Helper to find city by slug
    const getCity = (slug) => cities.find(c => c.slug === slug);

    const institutions = [
        // VALLEDUPAR - Universidades
        {
            name: 'Universidad Popular del Cesar - UPC',
            acronym: 'UPC',
            cityId: getCity('valledupar').id,
            type: 'universidad',
            latitude: 10.4594,
            longitude: -73.2625
        },
        {
            name: 'Universidad de Santander - UDES',
            acronym: 'UDES',
            cityId: getCity('valledupar').id,
            type: 'universidad',
            latitude: 10.4851,
            longitude: -73.2438
        },
        {
            name: 'Fundación Universitaria del Área Andina',
            acronym: 'AREANDINA',
            cityId: getCity('valledupar').id,
            type: 'universidad',
            latitude: 10.4792,
            longitude: -73.2456
        },
        {
            name: 'Universidad Nacional Abierta y a Distancia - UNAD',
            acronym: 'UNAD',
            cityId: getCity('valledupar').id,
            type: 'universidad',
            latitude: 10.4631,
            longitude: -73.2532
        },
        {
            name: 'Universidad Antonio Nariño',
            acronym: 'UAN',
            cityId: getCity('valledupar').id,
            type: 'universidad',
            latitude: 10.4720,
            longitude: -73.2510
        },

        // VALLEDUPAR - Institutos Técnicos
        {
            name: 'SENA - Centro de Formación Valledupar',
            acronym: 'SENA',
            cityId: getCity('valledupar').id,
            type: 'instituto',
            latitude: 10.4700,
            longitude: -73.2500
        },
        {
            name: 'UPARSYSTEM - Universidad para el Desarrollo',
            acronym: 'UPARSYSTEM',
            cityId: getCity('valledupar').id,
            type: 'instituto',
            latitude: 10.4680,
            longitude: -73.2490
        },
        {
            name: 'INSTECOM - Instituto Técnico de Comercio',
            acronym: 'INSTECOM',
            cityId: getCity('valledupar').id,
            type: 'instituto',
            latitude: 10.4650,
            longitude: -73.2520
        },
        {
            name: 'Instituto Técnico Nacional de Comercio',
            acronym: 'ITNC',
            cityId: getCity('valledupar').id,
            type: 'instituto',
            latitude: 10.4640,
            longitude: -73.2530
        },
        {
            name: 'Politécnico de la Costa Atlántica',
            acronym: 'POLITECNICO',
            cityId: getCity('valledupar').id,
            type: 'instituto',
            latitude: 10.4710,
            longitude: -73.2480
        },
        {
            name: 'Instituto Técnico Agropecuario',
            acronym: 'ITA',
            cityId: getCity('valledupar').id,
            type: 'instituto',
            latitude: 10.4600,
            longitude: -73.2550
        },

        // BOGOTÁ - Universidades
        {
            name: 'Universidad Nacional de Colombia',
            acronym: 'UNAL',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6381,
            longitude: -74.0836
        },
        {
            name: 'Universidad de los Andes',
            acronym: 'UNIANDES',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6017,
            longitude: -74.0659
        },
        {
            name: 'Pontificia Universidad Javeriana',
            acronym: 'JAVERIANA',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6282,
            longitude: -74.0645
        },
        {
            name: 'Universidad del Rosario',
            acronym: 'UROSARIO',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6030,
            longitude: -74.0689
        },
        {
            name: 'Universidad Externado de Colombia',
            acronym: 'EXTERNADO',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6025,
            longitude: -74.0707
        },
        {
            name: 'Universidad de La Salle',
            acronym: 'LASALLE',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6311,
            longitude: -74.0701
        },
        {
            name: 'Universidad Santo Tomás',
            acronym: 'USTA',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6097,
            longitude: -74.0817
        },
        {
            name: 'Universidad Central',
            acronym: 'UCENTRAL',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6486,
            longitude: -74.0594
        },
        {
            name: 'Universidad Pedagógica Nacional',
            acronym: 'UPN',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6200,
            longitude: -74.1050
        },
        {
            name: 'Universidad Distrital Francisco José de Caldas',
            acronym: 'UD',
            cityId: getCity('bogota').id,
            type: 'universidad',
            latitude: 4.6575,
            longitude: -74.1040
        },

        // BOGOTÁ - Institutos
        {
            name: 'SENA - Bogotá',
            acronym: 'SENA',
            cityId: getCity('bogota').id,
            type: 'instituto',
            latitude: 4.6097,
            longitude: -74.0817
        },
        {
            name: 'Corporación Universitaria Minuto de Dios',
            acronym: 'UNIMINUTO',
            cityId: getCity('bogota').id,
            type: 'instituto',
            latitude: 4.7110,
            longitude: -74.0721
        },

        // MEDELLÍN - Institutos
        {
            name: 'Instituto Tecnológico Pascual Bravo',
            acronym: 'PASCUAL_BRAVO',
            cityId: getCity('medellin').id,
            type: 'instituto',
            latitude: 6.2476,
            longitude: -75.5658
        }
    ];

    const createdInstitutions = await Institution.bulkCreate(institutions);
    console.log(`  ✅ Created ${createdInstitutions.length} institutions`);

    return createdInstitutions;
};

/**
 * Seed Properties
 */
const seedProperties = async (owners, amenities, propertyTypes, institutions, cities) => {
    console.log('🏘️  Seeding properties...');

    const ownerUsers = owners.filter(u => u.userType === UserType.OWNER);

    // Get Bogotá city and Cundinamarca department
    const bogota = cities.find(c => c.slug === 'bogota');
    const cundinamarca = await Department.findOne({ where: { code: 'CUN' } });

    const neighborhoods = [
        'Chapinero', 'Usaquén', 'Teusaquillo', 'La Candelaria', 'Engativá',
        'Suba', 'Fontibón', 'Kennedy', 'Puente Aranda', 'Ciudad Bolívar'
    ];

    const createdProperties = [];

    // Create 30 properties
    for (let i = 1; i <= 30; i++) {
        const owner = faker.helpers.arrayElement(ownerUsers);
        const propertyType = faker.helpers.arrayElement(propertyTypes);

        const statusRandom = Math.random();
        const status = statusRandom < 0.6 ? PropertyStatus.APPROVED :
            statusRandom < 0.9 ? PropertyStatus.PENDING :
                PropertyStatus.REJECTED;

        const neighborhood = faker.helpers.arrayElement(neighborhoods);
        const submittedAt = faker.date.past({ years: 1 });

        // Prepare property data with nested associations
        const propertyData = {
            ownerId: owner.id,
            typeId: propertyType.id,
            title: `${propertyType.name} en ${neighborhood}`,
            description: faker.lorem.paragraph(3),
            monthlyRent: faker.number.int({ min: 500000, max: 2500000 }),
            deposit: faker.number.int({ min: 500000, max: 2500000 }),
            currency: 'COP',

            // Location data (will create or find existing location)
            location: {
                street: faker.location.streetAddress(),
                neighborhood: neighborhood,
                cityId: bogota.id,
                departmentId: cundinamarca.id,
                zipCode: faker.location.zipCode('#####'),
                latitude: faker.location.latitude({ min: 4.5, max: 4.8 }),
                longitude: faker.location.longitude({ min: -74.2, max: -74.0 })
            },

            // Contact data
            contact: {
                contactName: owner.name,
                contactPhone: owner.phone,
                contactEmail: owner.email,
                contactWhatsapp: owner.whatsapp
            },

            // Features data
            features: {
                isFurnished: faker.datatype.boolean(),
                hasParking: faker.datatype.boolean(),
                allowsPets: faker.datatype.boolean()
            },

            // Images data
            images: [
                { url: `https://picsum.photos/seed/${i}-1/800/600`, isFeatured: true, orderPosition: 0 },
                { url: `https://picsum.photos/seed/${i}-2/800/600`, isFeatured: false, orderPosition: 1 },
                { url: `https://picsum.photos/seed/${i}-3/800/600`, isFeatured: false, orderPosition: 2 }
            ],

            // Institutions (nearby universities)
            institutions: faker.helpers.arrayElements(institutions, faker.number.int({ min: 1, max: 3 }))
                .map(inst => ({ id: inst.id, distance: faker.number.int({ min: 500, max: 5000 }) })),

            // Property characteristics
            bedrooms: propertyType.name === 'habitacion' ? 1 : faker.number.int({ min: 1, max: 4 }),
            bathrooms: faker.number.int({ min: 1, max: 3 }),
            area: faker.number.int({ min: 20, max: 120 }),
            floor: faker.number.int({ min: 1, max: 15 }),
            availableFrom: faker.date.future({ years: 0.5 }),
            status: status,
            isFeatured: faker.datatype.boolean({ probability: 0.2 }),
            isVerified: status === PropertyStatus.APPROVED,
            isRented: false,
            submittedAt: submittedAt,
            reviewedAt: status !== PropertyStatus.PENDING ?
                faker.date.between({ from: submittedAt, to: new Date() }) : null,
            rejectionReason: status === PropertyStatus.REJECTED ?
                'La propiedad no cumple con los requisitos mínimos de calidad' : null,
            viewsCount: status === PropertyStatus.APPROVED ? faker.number.int({ min: 0, max: 500 }) : 0,
            interestsCount: status === PropertyStatus.APPROVED ? faker.number.int({ min: 0, max: 50 }) : 0,
            createdAt: submittedAt
        };

        try {
            const property = await propertyService.createPropertyWithAssociations(propertyData);
            createdProperties.push(property);

            // Add amenities (separate N:M relationship)
            const numAmenities = faker.number.int({ min: 3, max: 10 });
            const selectedAmenities = faker.helpers.arrayElements(amenities, numAmenities);
            const propertyInstance = await Property.findByPk(property.id);
            await propertyInstance.addAmenities(selectedAmenities);

        } catch (error) {
            console.error(`  ❌ Error creating property ${i}:`, error.message);
        }
    }

    console.log(`  ✅ Created ${createdProperties.length} properties with all associations`);

    // Update owner property counts in UserStats table
    for (const owner of ownerUsers) {
        const ownerProperties = createdProperties.filter(p => p.ownerId === owner.id);
        const approved = ownerProperties.filter(p => p.status === PropertyStatus.APPROVED).length;
        const pending = ownerProperties.filter(p => p.status === PropertyStatus.PENDING).length;
        const rejected = ownerProperties.filter(p => p.status === PropertyStatus.REJECTED).length;

        await UserStats.update({
            propertiesCount: ownerProperties.length,
            approvedCount: approved,
            pendingCount: pending,
            rejectedCount: rejected,
            lastUpdatedAt: new Date()
        }, {
            where: { userId: owner.id }
        });
    }


    return createdProperties;
};

/**
 * Seed Payment Requests
 */
const seedPaymentRequests = async (owners) => {
    console.log('💳 Seeding payment requests...');

    const paymentRequests = [];
    const ownerUsers = owners.filter(u => u.userType === UserType.OWNER && u.plan === PlanType.PREMIUM);

    for (const owner of ownerUsers) {
        const numRequests = faker.number.int({ min: 1, max: 3 });

        for (let i = 0; i < numRequests; i++) {
            const submittedAt = faker.date.past({ years: 1 });
            const status = faker.helpers.arrayElement([
                PaymentRequestStatus.VERIFIED,
                PaymentRequestStatus.PENDING,
                PaymentRequestStatus.REJECTED
            ]);

            // Calculate plan duration based on subscription type
            const planDuration = owner.planType === SubscriptionType.WEEKLY ? 7 :
                owner.planType === SubscriptionType.MONTHLY ? 30 : 90;

            paymentRequests.push({
                userId: owner.id,
                userName: owner.name,
                planType: owner.planType,
                planDuration: planDuration,
                amount: owner.planType === SubscriptionType.WEEKLY ? 15000 :
                    owner.planType === SubscriptionType.MONTHLY ? 50000 : 120000,
                referenceCode: `PAY-${faker.string.alphanumeric(10).toUpperCase()}`,
                proofImage: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
                status: status,
                createdAt: submittedAt,
                processedAt: status !== PaymentRequestStatus.PENDING ?
                    faker.date.between({ from: submittedAt, to: new Date() }) : null
            });
        }
    }

    const created = await PaymentRequest.bulkCreate(paymentRequests);
    console.log(`  ✅ Created ${created.length} payment requests`);

    return created;
};

/**
 * Seed Student Requests
 */
const seedStudentRequests = async (tenants, cities, institutions) => {
    console.log('🎓 Seeding student requests...');

    const studentRequests = [];
    const tenantUsers = tenants.filter(u => u.userType === UserType.TENANT);

    // Get Bogotá city
    const bogota = cities.find(c => c.slug === 'bogota');

    // Get some institutions for variety
    const bogotaInstitutions = institutions.filter(i => i.cityId === bogota.id);

    for (let i = 0; i < 10; i++) {
        const tenant = faker.helpers.arrayElement(tenantUsers);
        const createdAt = faker.date.past({ months: 6 });

        // Randomly assign institution or leave as free text
        const useInstitution = faker.datatype.boolean();
        const institution = useInstitution ? faker.helpers.arrayElement(bogotaInstitutions) : null;

        studentRequests.push({
            studentId: tenant.id,
            cityId: bogota.id,
            institutionId: institution?.id || null,
            universityTarget: !institution ? faker.helpers.arrayElement([
                'Universidad Nacional',
                'Universidad de los Andes',
                'Universidad Javeriana',
                'Universidad del Rosario',
                'Universidad Externado'
            ]) : null,
            budgetMax: faker.number.int({ min: 500000, max: 1500000 }),
            propertyTypeDesired: faker.helpers.arrayElement([
                'pension',
                'habitacion',
                'apartamento',
                'aparta-estudio'
            ]),
            requiredAmenities: faker.helpers.arrayElements([
                'WiFi', 'Cocina Equipada', 'Lavadora', 'Amoblado'
            ], faker.number.int({ min: 0, max: 3 })),
            dealBreakers: faker.helpers.arrayElements([
                'No mascotas', 'Fumadores'
            ], faker.number.int({ min: 0, max: 2 })),
            moveInDate: faker.date.future({ months: 3 }),
            contractDuration: faker.number.int({ min: 6, max: 12 }),
            additionalNotes: faker.lorem.sentence(),
            status: faker.helpers.arrayElement([StudentRequestStatus.OPEN, StudentRequestStatus.CLOSED]),
            createdAt: createdAt,
            updatedAt: createdAt
        });
    }

    const created = await StudentRequest.bulkCreate(studentRequests);
    console.log(`  ✅ Created ${created.length} student requests`);

    return created;
};

/**
 * Seed Notifications
 */
const seedNotifications = async (users, properties) => {
    console.log('🔔 Seeding notifications...');

    const notifications = [];
    const approvedProperties = properties.filter(p => p.status === PropertyStatus.APPROVED);
    const rejectedProperties = properties.filter(p => p.status === PropertyStatus.REJECTED);
    const tenants = users.filter(u => u.userType === UserType.TENANT);

    // Skip if no properties
    if (properties.length === 0) {
        console.log('  ⚠️  No properties found, skipping notifications');
        return [];
    }

    // Property interest notifications
    if (approvedProperties.length > 0 && tenants.length > 0) {
        for (let i = 0; i < Math.min(20, approvedProperties.length); i++) {
            const property = faker.helpers.arrayElement(approvedProperties);
            const tenant = faker.helpers.arrayElement(tenants);
            const owner = users.find(u => u.id === property.ownerId);

            notifications.push({
                userId: owner.id,
                type: NotificationType.PROPERTY_INTEREST,
                title: 'Nuevo interés en tu propiedad',
                message: `${tenant.name} está interesado en tu propiedad "${property.title}"`,
                propertyId: property.id,
                isRead: faker.datatype.boolean({ probability: 0.3 }),
                createdAt: faker.date.recent({ days: 30 })
            });
        }
    }

    // Property rejection notifications
    if (rejectedProperties.length > 0) {
        for (const property of rejectedProperties) {
            const owner = users.find(u => u.id === property.ownerId);

            notifications.push({
                userId: owner.id,
                type: NotificationType.PROPERTY_REJECTED,
                title: 'Propiedad rechazada',
                message: `Tu propiedad "${property.title}" ha sido rechazada. ${property.rejectionReason}`,
                propertyId: property.id,
                isRead: faker.datatype.boolean({ probability: 0.5 }),
                createdAt: property.reviewedAt
            });
        }
    }

    const created = await Notification.bulkCreate(notifications);
    console.log(`  ✅ Created ${created.length} notifications`);

    return created;
};

/**
 * Seed Activity Logs
 */
const seedActivityLogs = async (users, properties) => {
    console.log('📊 Seeding activity logs...');

    const activityLogs = [];
    const owners = users.filter(u => u.userType === UserType.OWNER);

    // Skip if no properties
    if (properties.length === 0) {
        console.log('  ⚠️  No properties found, skipping activity logs');
        return [];
    }

    // Property submission logs
    for (const property of properties) {
        activityLogs.push({
            userId: property.ownerId,
            type: 'property_submitted',
            message: `Propiedad "${property.title}" enviada para revisión`,
            propertyId: property.id,
            timestamp: property.submittedAt
        });

        if (property.status === PropertyStatus.APPROVED) {
            activityLogs.push({
                userId: property.ownerId,
                type: 'property_approved',
                message: `Propiedad "${property.title}" aprobada`,
                propertyId: property.id,
                timestamp: property.reviewedAt
            });
        } else if (property.status === PropertyStatus.REJECTED) {
            activityLogs.push({
                userId: property.ownerId,
                type: 'property_rejected',
                message: `Propiedad "${property.title}" rechazada`,
                propertyId: property.id,
                timestamp: property.reviewedAt
            });
        }
    }

    const created = await ActivityLog.bulkCreate(activityLogs);
    console.log(`  ✅ Created ${created.length} activity logs`);

    return created;
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        const users = await seedUsers();
        const amenities = await seedAmenities();
        const propertyTypes = await seedPropertyTypes();
        const departments = await seedDepartments();
        const cities = await seedCities(departments);
        const institutions = await seedInstitutions(cities);
        const properties = await seedProperties(users, amenities, propertyTypes, institutions, cities);
        const paymentRequests = await seedPaymentRequests(users);
        const studentRequests = await seedStudentRequests(users, cities, institutions);
        const notifications = await seedNotifications(users, properties);
        const activityLogs = await seedActivityLogs(users, properties);

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Amenities: ${amenities.length}`);
        console.log(`   - Property Types: ${propertyTypes.length}`);
        console.log(`   - Departments: ${departments.length}`);
        console.log(`   - Cities: ${cities.length}`);
        console.log(`   - Institutions: ${institutions.length}`);
        console.log(`   - Properties: ${properties.length}`);
        console.log(`   - Payment Requests: ${paymentRequests.length}`);
        console.log(`   - Student Requests: ${studentRequests.length}`);
        console.log(`   - Notifications: ${notifications.length}`);
        console.log(`   - Activity Logs: ${activityLogs.length}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

/**
 * CLI Handler
 */
const command = process.argv[2];

const runCommand = async () => {
    try {
        switch (command) {
            case 'seed':
                await seedDatabase();
                break;

            case 'clear':
                await clearDatabase();
                break;

            case 'reset':
                console.log('🔄 Resetting database...\n');
                await clearDatabase();
                await seedDatabase();
                break;

            default:
                console.log('📋 Database Seeding Tool\n');
                console.log('Available commands:');
                console.log('  npm run seed:data        - Seed all data');
                console.log('  npm run seed:data:clear  - Clear all data');
                console.log('  npm run seed:data:reset  - Clear and reseed all data\n');
                break;
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await sequelize.close();
        process.exit(1);
    }
};

runCommand();
