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
    ActivityLog
} from '../src/models/index.js';
import {
    IdType,
    OwnerRole,
    UserType,
    PaymentMethod,
    VerificationStatus,
    PlanType,
    SubscriptionType,
    PropertyType,
    PropertyStatus,
    PaymentRequestStatus,
    NotificationType,
    StudentRequestStatus
} from '../src/utils/enums.js';

// Configure Faker to use Spanish locale
faker.locale = 'es';

/**
 * Clear all data from the database
 */
const clearDatabase = async () => {
    console.log('🗑️  Clearing database...\n');

    await ActivityLog.destroy({ where: {}, truncate: true, cascade: true });
    await Notification.destroy({ where: {}, truncate: true, cascade: true });
    await StudentRequest.destroy({ where: {}, truncate: true, cascade: true });
    await PaymentRequest.destroy({ where: {}, truncate: true, cascade: true });
    await PropertyAmenity.destroy({ where: {}, truncate: true, cascade: true });
    await Property.destroy({ where: {}, truncate: true, cascade: true });
    await Amenity.destroy({ where: {}, truncate: true, cascade: true });
    await UserVerificationDocuments.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    console.log('✅ Database cleared\n');
};

/**
 * Seed Users
 */
const seedUsers = async () => {
    console.log('👥 Seeding users...');

    const users = [];

    // Create 1 Super Admin
    users.push({
        id: 'superadmin-001',
        name: 'Super Administrador',
        email: 'superadmin@estuarriendo.com',
        phone: '+57 300 123 4567',
        whatsapp: '+57 300 123 4567',
        userType: UserType.SUPER_ADMIN,
        isActive: true,
        joinedAt: new Date('2024-01-01'),
        isVerified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        plan: PlanType.FREE
    });

    // Create 2 Admins
    for (let i = 1; i <= 2; i++) {
        users.push({
            id: `admin-00${i}`,
            name: faker.person.fullName(),
            email: `admin${i}@estuarriendo.com`,
            phone: faker.phone.number('+57 3## ### ####'),
            whatsapp: faker.phone.number('+57 3## ### ####'),
            userType: UserType.ADMIN,
            isActive: true,
            joinedAt: faker.date.past({ years: 1 }),
            isVerified: true,
            verificationStatus: VerificationStatus.VERIFIED,
            plan: PlanType.FREE
        });
    }

    // Create 10 Owners (5 individual, 5 agency)
    for (let i = 1; i <= 10; i++) {
        const isAgency = i > 5;
        const isPremium = i <= 3;
        const planStarted = isPremium ? faker.date.recent({ days: 30 }) : null;

        users.push({
            id: `owner-${String(i).padStart(3, '0')}`,
            name: isAgency ? faker.company.name() : faker.person.fullName(),
            email: `owner${i}@example.com`,
            phone: faker.phone.number('+57 3## ### ####'),
            whatsapp: faker.phone.number('+57 3## ### ####'),
            userType: UserType.OWNER,
            isActive: true,
            joinedAt: faker.date.past({ years: 2 }),
            idType: faker.helpers.arrayElement([IdType.CC, IdType.NIT, IdType.CE]),
            idNumber: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
            ownerRole: isAgency ? OwnerRole.AGENCY : OwnerRole.INDIVIDUAL,
            isVerified: i <= 7,
            verificationStatus: i <= 7 ? VerificationStatus.VERIFIED :
                i <= 9 ? VerificationStatus.PENDING :
                    VerificationStatus.NOT_SUBMITTED,
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
            },
            availableForVisit: faker.datatype.boolean(),
            plan: isPremium ? PlanType.PREMIUM : PlanType.FREE,
            planType: isPremium ? faker.helpers.arrayElement([
                SubscriptionType.WEEKLY,
                SubscriptionType.MONTHLY,
                SubscriptionType.QUARTERLY
            ]) : null,
            planStartedAt: planStarted,
            planExpiresAt: isPremium ? new Date(planStarted.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
            premiumSince: isPremium ? planStarted : null,
            propertiesCount: 0,
            approvedCount: 0,
            pendingCount: 0,
            rejectedCount: 0
        });
    }

    // Create 15 Tenants (students)
    for (let i = 1; i <= 15; i++) {
        users.push({
            id: `tenant-${String(i).padStart(3, '0')}`,
            name: faker.person.fullName(),
            email: `student${i}@example.com`,
            phone: faker.phone.number('+57 3## ### ####'),
            whatsapp: faker.phone.number('+57 3## ### ####'),
            userType: UserType.TENANT,
            isActive: true,
            joinedAt: faker.date.past({ years: 1 }),
            isVerified: false,
            verificationStatus: VerificationStatus.NOT_SUBMITTED,
            plan: PlanType.FREE
        });
    }

    await User.bulkCreate(users);
    console.log(`  ✅ Created ${users.length} users`);

    return users;
};

/**
 * Seed Amenities
 */
const seedAmenities = async () => {
    console.log('🏠 Seeding amenities...');

    const amenities = [
        { name: 'WiFi', icon: 'wifi' },
        { name: 'Aire Acondicionado', icon: 'ac_unit' },
        { name: 'Calefacción', icon: 'whatshot' },
        { name: 'Cocina Equipada', icon: 'kitchen' },
        { name: 'Lavadora', icon: 'local_laundry_service' },
        { name: 'Secadora', icon: 'dry' },
        { name: 'Parqueadero', icon: 'local_parking' },
        { name: 'Gimnasio', icon: 'fitness_center' },
        { name: 'Piscina', icon: 'pool' },
        { name: 'Zona BBQ', icon: 'outdoor_grill' },
        { name: 'Seguridad 24/7', icon: 'security' },
        { name: 'Ascensor', icon: 'elevator' },
        { name: 'Balcón', icon: 'balcony' },
        { name: 'Terraza', icon: 'deck' },
        { name: 'Amoblado', icon: 'weekend' },
        { name: 'Mascotas Permitidas', icon: 'pets' },
        { name: 'Zona de Estudio', icon: 'menu_book' },
        { name: 'Sala de Juegos', icon: 'sports_esports' },
        { name: 'Portería', icon: 'meeting_room' },
        { name: 'Zona Verde', icon: 'park' }
    ];

    const createdAmenities = await Amenity.bulkCreate(amenities);
    console.log(`  ✅ Created ${createdAmenities.length} amenities`);

    return createdAmenities;
};

/**
 * Seed Properties
 */
const seedProperties = async (owners, amenities) => {
    console.log('🏘️  Seeding properties...');

    const properties = [];
    const ownerUsers = owners.filter(u => u.userType === UserType.OWNER);

    const neighborhoods = [
        'Chapinero', 'Usaquén', 'Teusaquillo', 'La Candelaria', 'Engativá',
        'Suba', 'Fontibón', 'Kennedy', 'Puente Aranda', 'Ciudad Bolívar'
    ];

    // Create 30 properties
    for (let i = 1; i <= 30; i++) {
        const owner = faker.helpers.arrayElement(ownerUsers);
        const propertyType = faker.helpers.arrayElement([
            PropertyType.PENSION,
            PropertyType.HABITACION,
            PropertyType.APARTAMENTO,
            PropertyType.APARTA_ESTUDIO
        ]);

        const statusRandom = Math.random();
        const status = statusRandom < 0.6 ? PropertyStatus.APPROVED :
            statusRandom < 0.9 ? PropertyStatus.PENDING :
                PropertyStatus.REJECTED;

        const neighborhood = faker.helpers.arrayElement(neighborhoods);
        const submittedAt = faker.date.past({ years: 1 });

        properties.push({
            ownerId: owner.id,
            type: propertyType,
            title: `${propertyType} en ${neighborhood}`,
            description: faker.lorem.paragraph(3),
            monthlyRent: faker.number.int({ min: 500000, max: 2500000 }),
            deposit: faker.number.int({ min: 500000, max: 2500000 }),
            currency: 'COP',
            street: faker.location.streetAddress(),
            neighborhood: neighborhood,
            city: 'Bogotá',
            department: 'Cundinamarca',
            zipCode: faker.location.zipCode('#####'),
            latitude: faker.location.latitude({ min: 4.5, max: 4.8 }),
            longitude: faker.location.longitude({ min: -74.2, max: -74.0 }),
            bedrooms: propertyType === PropertyType.HABITACION ? 1 : faker.number.int({ min: 1, max: 4 }),
            bathrooms: faker.number.int({ min: 1, max: 3 }),
            area: faker.number.int({ min: 20, max: 120 }),
            floor: faker.number.int({ min: 1, max: 15 }),
            allowsPets: faker.datatype.boolean(),
            isFurnished: faker.datatype.boolean(),
            hasParking: faker.datatype.boolean(),
            images: [
                `https://picsum.photos/seed/${i}-1/800/600`,
                `https://picsum.photos/seed/${i}-2/800/600`,
                `https://picsum.photos/seed/${i}-3/800/600`
            ],
            nearbyUniversities: faker.helpers.arrayElements([
                'Universidad Nacional',
                'Universidad de los Andes',
                'Universidad Javeriana',
                'Universidad del Rosario',
                'Universidad Externado'
            ], faker.number.int({ min: 1, max: 3 })),
            contactName: owner.name,
            contactPhone: owner.phone,
            contactEmail: owner.email,
            contactWhatsapp: owner.whatsapp,
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
        });
    }

    const createdProperties = await Property.bulkCreate(properties);
    console.log(`  ✅ Created ${createdProperties.length} properties`);

    // Assign random amenities to properties
    console.log('🔗 Linking amenities to properties...');
    for (const property of createdProperties) {
        const numAmenities = faker.number.int({ min: 3, max: 10 });
        const selectedAmenities = faker.helpers.arrayElements(amenities, numAmenities);
        await property.addAmenities(selectedAmenities);
    }
    console.log('  ✅ Amenities linked');

    // Update owner property counts
    for (const owner of ownerUsers) {
        const ownerProperties = createdProperties.filter(p => p.ownerId === owner.id);
        const approved = ownerProperties.filter(p => p.status === PropertyStatus.APPROVED).length;
        const pending = ownerProperties.filter(p => p.status === PropertyStatus.PENDING).length;
        const rejected = ownerProperties.filter(p => p.status === PropertyStatus.REJECTED).length;

        await User.update({
            propertiesCount: ownerProperties.length,
            approvedCount: approved,
            pendingCount: pending,
            rejectedCount: rejected
        }, {
            where: { id: owner.id }
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

            paymentRequests.push({
                userId: owner.id,
                planType: owner.planType,
                amount: owner.planType === SubscriptionType.WEEKLY ? 15000 :
                    owner.planType === SubscriptionType.MONTHLY ? 50000 : 120000,
                proofImage: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
                status: status,
                submittedAt: submittedAt,
                reviewedAt: status !== PaymentRequestStatus.PENDING ?
                    faker.date.between({ from: submittedAt, to: new Date() }) : null,
                rejectionReason: status === PaymentRequestStatus.REJECTED ?
                    'El comprobante de pago no es legible' : null
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
const seedStudentRequests = async (tenants) => {
    console.log('🎓 Seeding student requests...');

    const studentRequests = [];
    const tenantUsers = tenants.filter(u => u.userType === UserType.TENANT);

    for (let i = 0; i < 10; i++) {
        const tenant = faker.helpers.arrayElement(tenantUsers);
        const createdAt = faker.date.past({ months: 6 });

        studentRequests.push({
            studentId: tenant.id,
            propertyTypeDesired: faker.helpers.arrayElement([
                PropertyType.PENSION,
                PropertyType.HABITACION,
                PropertyType.APARTAMENTO,
                PropertyType.APARTA_ESTUDIO
            ]),
            maxBudget: faker.number.int({ min: 500000, max: 1500000 }),
            desiredNeighborhoods: faker.helpers.arrayElements([
                'Chapinero', 'Usaquén', 'Teusaquillo', 'La Candelaria'
            ], faker.number.int({ min: 1, max: 3 })),
            moveInDate: faker.date.future({ months: 3 }),
            additionalRequirements: faker.lorem.sentence(),
            contactName: tenant.name,
            contactPhone: tenant.phone,
            contactEmail: tenant.email,
            status: faker.helpers.arrayElement([StudentRequestStatus.OPEN, StudentRequestStatus.CLOSED]),
            createdAt: createdAt,
            viewsCount: faker.number.int({ min: 0, max: 100 })
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

    // Property interest notifications
    for (let i = 0; i < 20; i++) {
        const property = faker.helpers.arrayElement(approvedProperties);
        const tenant = faker.helpers.arrayElement(tenants);
        const owner = users.find(u => u.id === property.ownerId);

        notifications.push({
            userId: owner.id,
            type: NotificationType.PROPERTY_INTEREST,
            message: `${tenant.name} está interesado en tu propiedad "${property.title}"`,
            propertyId: property.id,
            interestedUserId: tenant.id,
            isRead: faker.datatype.boolean(),
            createdAt: faker.date.recent({ days: 30 })
        });
    }

    // Property approved notifications
    for (const property of approvedProperties.slice(0, 10)) {
        const owner = users.find(u => u.id === property.ownerId);

        notifications.push({
            userId: owner.id,
            type: NotificationType.PROPERTY_APPROVED,
            message: `Tu propiedad "${property.title}" ha sido aprobada`,
            propertyId: property.id,
            isRead: faker.datatype.boolean(),
            createdAt: property.reviewedAt
        });
    }

    // Property rejected notifications
    for (const property of rejectedProperties) {
        const owner = users.find(u => u.id === property.ownerId);

        notifications.push({
            userId: owner.id,
            type: NotificationType.PROPERTY_REJECTED,
            message: `Tu propiedad "${property.title}" ha sido rechazada`,
            propertyId: property.id,
            isRead: faker.datatype.boolean(),
            createdAt: property.reviewedAt
        });
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
    const actions = [
        'user_registered',
        'user_login',
        'property_created',
        'property_updated',
        'property_viewed',
        'property_approved',
        'property_rejected',
        'payment_submitted',
        'notification_sent'
    ];

    for (let i = 0; i < 100; i++) {
        const user = faker.helpers.arrayElement(users);
        const action = faker.helpers.arrayElement(actions);
        const property = action.includes('property') ? faker.helpers.arrayElement(properties) : null;

        activityLogs.push({
            userId: user.id,
            action: action,
            details: faker.lorem.sentence(),
            ipAddress: faker.internet.ipv4(),
            userAgent: faker.internet.userAgent(),
            propertyId: property?.id || null,
            timestamp: faker.date.past({ years: 1 })
        });
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
        const properties = await seedProperties(users, amenities);
        const paymentRequests = await seedPaymentRequests(users);
        const studentRequests = await seedStudentRequests(users);
        const notifications = await seedNotifications(users, properties);
        const activityLogs = await seedActivityLogs(users, properties);

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Amenities: ${amenities.length}`);
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
