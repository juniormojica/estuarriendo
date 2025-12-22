import bcrypt from 'bcryptjs';
import { sequelize } from '../src/config/database.js';
import User from '../src/models/User.js';
import Department from '../src/models/Department.js';
import City from '../src/models/City.js';
import Amenity from '../src/models/Amenity.js';
import PropertyType from '../src/models/PropertyType.js';
import { UserType, VerificationStatus } from '../src/utils/enums.js';

/**
 * Script to create initial Super Admin user
 * Run with: npm run create:superadmin
 */

const createSuperAdmin = async () => {
    try {
        console.log('🚀 Starting Super Admin creation...\n');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Sync models
        await sequelize.sync();
        console.log('✅ Models synced\n');

        // Super Admin details
        const superAdminData = {
            id: 'super-admin-001',
            name: 'Junior Mojica',
            email: 'juniormojica26@gmail.com',
            phone: '+57 300 000 0000', // Required field
            whatsapp: '+57 300 000 0000',
            password: 'Admin123!', // Default password - CHANGE THIS AFTER FIRST LOGIN
            userType: UserType.SUPER_ADMIN,
            plan: 'premium',
            verificationStatus: VerificationStatus.VERIFIED,
            isActive: true,
            isVerified: true,
            joinedAt: new Date()
        };

        // Check if super admin already exists
        const existingAdmin = await User.findOne({
            where: { email: superAdminData.email }
        });

        if (existingAdmin) {
            console.log('⚠️  Super Admin already exists with this email!');
            console.log(`📧 Email: ${superAdminData.email}`);
            console.log(`👤 Name: ${existingAdmin.name}`);
            console.log(`🆔 ID: ${existingAdmin.id}\n`);

            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });

            return new Promise((resolve) => {
                readline.question('Do you want to delete and recreate? (yes/no): ', async (answer) => {
                    readline.close();

                    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                        await existingAdmin.destroy();
                        console.log('🗑️  Existing admin deleted\n');

                        // Create new super admin
                        await createAdmin(superAdminData);
                        resolve();
                    } else {
                        console.log('❌ Operation cancelled');
                        process.exit(0);
                    }
                });
            });
        } else {
            // Create initial data first
            await createInitialData();
            // Then create admin
            await createAdmin(superAdminData);
        }

    } catch (error) {
        console.error('❌ Error creating Super Admin:', error);
        process.exit(1);
    }
};

const createInitialData = async () => {
    console.log('📍 Creating initial location data...\n');

    // Create Cesar department
    let cesarDept = await Department.findOne({ where: { code: 'CES' } });

    if (!cesarDept) {
        cesarDept = await Department.create({
            name: 'Cesar',
            code: 'CES',
            slug: 'cesar'
        });
        console.log('✅ Department "Cesar" created');
    } else {
        console.log('ℹ️  Department "Cesar" already exists');
    }

    // Create Valledupar city
    let valledupar = await City.findOne({
        where: {
            name: 'Valledupar',
            departmentId: cesarDept.id
        }
    });

    if (!valledupar) {
        valledupar = await City.create({
            name: 'Valledupar',
            slug: 'valledupar',
            departmentId: cesarDept.id
        });
        console.log('✅ City "Valledupar" created');
    } else {
        console.log('ℹ️  City "Valledupar" already exists');
    }

    // Create basic amenities
    console.log('\n🏠 Creating basic amenities...');

    const basicAmenities = [
        { name: 'WiFi', icon: 'wifi', description: 'Internet inalámbrico' },
        { name: 'Parqueadero', icon: 'parking', description: 'Espacio para vehículos' },
        { name: 'Piscina', icon: 'pool', description: 'Piscina compartida o privada' },
        { name: 'Gimnasio', icon: 'gym', description: 'Gimnasio o área de ejercicio' },
        { name: 'Lavandería', icon: 'laundry', description: 'Lavadora y secadora' },
        { name: 'Seguridad 24h', icon: 'security', description: 'Vigilancia las 24 horas' },
        { name: 'Ascensor', icon: 'elevator', description: 'Ascensor en el edificio' },
        { name: 'Aire Acondicionado', icon: 'ac', description: 'Aire acondicionado' },
        { name: 'Calefacción', icon: 'heating', description: 'Sistema de calefacción' },
        { name: 'Balcón', icon: 'balcony', description: 'Balcón o terraza' },
        { name: 'Amoblado', icon: 'furnished', description: 'Completamente amoblado' },
        { name: 'Cocina Equipada', icon: 'kitchen', description: 'Cocina con electrodomésticos' },
        { name: 'Baño Privado', icon: 'bathroom', description: 'Baño privado en la habitación' },
        { name: 'Ventilador', icon: 'fan', description: 'Ventilador de techo o piso' },
        { name: 'Escritorio', icon: 'desk', description: 'Escritorio para estudiar' },
        { name: 'Closet', icon: 'closet', description: 'Closet o armario' }
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const amenityData of basicAmenities) {
        const existing = await Amenity.findOne({ where: { name: amenityData.name } });

        if (!existing) {
            await Amenity.create(amenityData);
            createdCount++;
        } else {
            existingCount++;
        }
    }

    if (createdCount > 0) {
        console.log(`✅ Created ${createdCount} new amenities`);
    }
    if (existingCount > 0) {
        console.log(`ℹ️  ${existingCount} amenities already exist`);
    }
    console.log('');
};

const createAdmin = async (data) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create super admin
    const superAdmin = await User.create({
        ...data,
        password: hashedPassword
    });

    console.log('✅ Super Admin created successfully!\n');
    console.log('📋 Super Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🆔 ID:       ${superAdmin.id}`);
    console.log(`👤 Name:     ${superAdmin.name}`);
    console.log(`📧 Email:    ${superAdmin.email}`);
    console.log(`🔑 Password: ${data.password}`);
    console.log(`👑 Type:     ${superAdmin.userType}`);
    console.log(`💎 Plan:     ${superAdmin.plan}`);
    console.log(`✅ Status:   ${superAdmin.verificationStatus}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Please change the password after first login!');
    console.log('   2. Use a strong password with at least 8 characters');
    console.log('   3. Keep these credentials secure\n');

    console.log('🎉 You can now login at: http://localhost:5173/login');
    console.log('📊 Access Super Admin Dashboard after login\n');

    process.exit(0);
};

// Run the script
createSuperAdmin();
