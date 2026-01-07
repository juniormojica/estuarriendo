import bcrypt from 'bcryptjs';
import { sequelize } from '../src/config/database.js';
import {
    User,
    UserVerification,
    Subscription,
    Department,
    City,
    Amenity,
    PropertyType,
    Institution,
    SystemConfig
} from '../src/models/index.js';
import { UserType, VerificationStatus, PlanType } from '../src/utils/enums.js';

/**
 * Initialize Database with Essential Data
 * Creates:
 * - Super Admin user
 * - System Configuration
 * - Property Types
 * - Departments & Cities
 * - Institutions
 * - Amenities
 */

const initializeDatabase = async () => {
    try {
        console.log('🚀 Starting database initialization...\n');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Sync models
        await sequelize.sync();
        console.log('✅ Models synced\n');

        // Check if super admin already exists
        const existingAdmin = await User.findOne({
            where: { email: 'juniormojica26@gmail.com' }
        });

        if (existingAdmin) {
            console.log('⚠️  Super Admin already exists. Skipping user creation.');
        } else {
            await createSuperAdmin();
        }

        // Initialize all independent tables
        await initializeSystemConfig();
        await initializePropertyTypes();
        await initializeDepartmentsAndCities();
        await initializeInstitutions();
        await initializeAmenities();

        console.log('\n✅ Database initialization completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

/**
 * Create Super Admin User
 */
const createSuperAdmin = async () => {
    console.log('👤 Creating Super Admin...');

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const superAdmin = await User.create({
        id: 'super-admin-001',
        name: 'Junior Mojica',
        email: 'juniormojica26@gmail.com',
        phone: '+57 300 000 0000',
        whatsapp: '+57 300 000 0000',
        password: hashedPassword,
        userType: UserType.SUPER_ADMIN,
        plan: PlanType.PREMIUM,
        verificationStatus: VerificationStatus.VERIFIED,
        isActive: true,
        joinedAt: new Date()
    });

    // Create verification record
    await UserVerification.create({
        userId: superAdmin.id,
        isVerified: true,
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date()
    });

    // Create subscription
    await Subscription.create({
        userId: superAdmin.id,
        plan: PlanType.PREMIUM,
        startedAt: new Date(),
        status: 'active'
    });

    console.log('  ✅ Super Admin created');
    console.log(`  📧 Email: ${superAdmin.email}`);
    console.log(`  🔑 Password: Admin123!\n`);
};

/**
 * Initialize System Configuration
 */
const initializeSystemConfig = async () => {
    console.log('⚙️  Initializing System Configuration...');

    const existing = await SystemConfig.findOne({ where: { id: true } });

    if (!existing) {
        await SystemConfig.create({
            id: true,
            commissionRate: 0.10,
            featuredPropertyPrice: 50000,
            maxImagesPerProperty: 20,
            minPropertyPrice: 100000,
            maxPropertyPrice: 10000000,
            autoApprovalEnabled: false
        });
        console.log('  ✅ System configuration created\n');
    } else {
        console.log('  ⚠️  System configuration already exists\n');
    }
};

/**
 * Initialize Property Types
 */
const initializePropertyTypes = async () => {
    console.log('🏠 Initializing Property Types...');

    const propertyTypes = [
        { name: 'pension', description: 'Pensión estudiantil con servicios compartidos' },
        { name: 'habitacion', description: 'Habitación individual o compartida' },
        { name: 'apartamento', description: 'Apartamento completo' },
        { name: 'aparta-estudio', description: 'Apartaestudio tipo loft' }
    ];

    let created = 0;
    for (const typeData of propertyTypes) {
        const existing = await PropertyType.findOne({ where: { name: typeData.name } });
        if (!existing) {
            await PropertyType.create(typeData);
            created++;
        }
    }

    console.log(`  ✅ ${created} property types created (${propertyTypes.length - created} already existed)\n`);
};

/**
 * Initialize Departments and Cities
 */
const initializeDepartmentsAndCities = async () => {
    console.log('📍 Initializing Departments and Cities...');

    const departmentsData = [
        { name: 'Cesar', code: 'CES', slug: 'cesar' },
        { name: 'Cundinamarca', code: 'CUN', slug: 'cundinamarca' },
        { name: 'Antioquia', code: 'ANT', slug: 'antioquia' },
        { name: 'Valle del Cauca', code: 'VAC', slug: 'valle-del-cauca' },
        { name: 'Atlántico', code: 'ATL', slug: 'atlantico' }
    ];

    const departments = {};
    let deptCreated = 0;

    for (const deptData of departmentsData) {
        let dept = await Department.findOne({ where: { code: deptData.code } });
        if (!dept) {
            dept = await Department.create(deptData);
            deptCreated++;
        }
        departments[deptData.code] = dept;
    }

    console.log(`  ✅ ${deptCreated} departments created`);

    const citiesData = [
        { name: 'Valledupar', slug: 'valledupar', departmentCode: 'CES' },
        { name: 'Bogotá', slug: 'bogota', departmentCode: 'CUN' },
        { name: 'Medellín', slug: 'medellin', departmentCode: 'ANT' },
        { name: 'Cali', slug: 'cali', departmentCode: 'VAC' },
        { name: 'Barranquilla', slug: 'barranquilla', departmentCode: 'ATL' }
    ];

    let citiesCreated = 0;
    for (const cityData of citiesData) {
        const existing = await City.findOne({ where: { slug: cityData.slug } });
        if (!existing) {
            await City.create({
                name: cityData.name,
                slug: cityData.slug,
                departmentId: departments[cityData.departmentCode].id
            });
            citiesCreated++;
        }
    }

    console.log(`  ✅ ${citiesCreated} cities created\n`);
};

/**
 * Initialize Institutions
 */
const initializeInstitutions = async () => {
    console.log('🎓 Initializing Institutions...');

    // Get cities
    const valledupar = await City.findOne({ where: { slug: 'valledupar' } });
    const bogota = await City.findOne({ where: { slug: 'bogota' } });

    const institutions = [
        // Valledupar
        {
            name: 'Universidad Popular del Cesar - UPC',
            acronym: 'UPC',
            cityId: valledupar.id,
            type: 'universidad',
            latitude: 10.4594,
            longitude: -73.2625
        },
        {
            name: 'Universidad de Santander - UDES',
            acronym: 'UDES',
            cityId: valledupar.id,
            type: 'universidad',
            latitude: 10.4851,
            longitude: -73.2438
        },
        {
            name: 'Fundación Universitaria del Área Andina',
            acronym: 'AREANDINA',
            cityId: valledupar.id,
            type: 'universidad',
            latitude: 10.4792,
            longitude: -73.2456
        },
        {
            name: 'SENA - Centro de Formación Valledupar',
            acronym: 'SENA',
            cityId: valledupar.id,
            type: 'instituto',
            latitude: 10.4700,
            longitude: -73.2500
        },
        // Bogotá
        {
            name: 'Universidad Nacional de Colombia',
            acronym: 'UNAL',
            cityId: bogota.id,
            type: 'universidad',
            latitude: 4.6381,
            longitude: -74.0836
        },
        {
            name: 'Universidad de los Andes',
            acronym: 'UNIANDES',
            cityId: bogota.id,
            type: 'universidad',
            latitude: 4.6017,
            longitude: -74.0659
        },
        {
            name: 'Pontificia Universidad Javeriana',
            acronym: 'JAVERIANA',
            cityId: bogota.id,
            type: 'universidad',
            latitude: 4.6282,
            longitude: -74.0645
        },
        {
            name: 'SENA - Bogotá',
            acronym: 'SENA',
            cityId: bogota.id,
            type: 'instituto',
            latitude: 4.6097,
            longitude: -74.0817
        }
    ];

    let created = 0;
    for (const instData of institutions) {
        const existing = await Institution.findOne({
            where: {
                name: instData.name,
                cityId: instData.cityId
            }
        });
        if (!existing) {
            await Institution.create(instData);
            created++;
        }
    }

    console.log(`  ✅ ${created} institutions created (${institutions.length - created} already existed)\n`);
};

/**
 * Initialize Amenities
 */
const initializeAmenities = async () => {
    console.log('🏠 Initializing Amenities...');

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
        { name: 'Baño Privado', icon: 'private-bathroom' },
        { name: 'Closet', icon: 'closet' },
        { name: 'Abanico', icon: 'fan' },
        { name: 'Escritorio', icon: 'desk' },
        { name: 'Ventana Exterior', icon: 'window' },
        { name: 'Cama Incluida', icon: 'bed' },
        { name: 'TV', icon: 'tv' }
    ];

    let created = 0;
    for (const amenityData of amenities) {
        const existing = await Amenity.findOne({ where: { name: amenityData.name } });
        if (!existing) {
            await Amenity.create(amenityData);
            created++;
        }
    }

    console.log(`  ✅ ${created} amenities created (${amenities.length - created} already existed)\n`);
};

// Run initialization
initializeDatabase();
