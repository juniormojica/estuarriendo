import bcrypt from 'bcryptjs';
import { sequelize } from '../src/config/database.js';
import User from '../src/models/User.js';
import Department from '../src/models/Department.js';
import City from '../src/models/City.js';
import Amenity from '../src/models/Amenity.js';
import { UserType, VerificationStatus } from '../src/utils/enums.js';

const createSuperAdmin = async () => {
    try {
        console.log('🚀 Starting Super Admin creation...\n');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Sync models
        await sequelize.sync();
        console.log('✅ Models synced\n');

        const superAdminData = {
            id: 'super-admin-001',
            name: 'Junior Mojica',
            email: 'juniormojica26@gmail.com',
            phone: '+57 300 000 0000',
            whatsapp: '+57 300 000 0000',
            password: 'Admin123!',
            userType: UserType.SUPER_ADMIN,
            plan: 'premium',
            verificationStatus: VerificationStatus.VERIFIED,
            isActive: true,
            joinedAt: new Date()
        };

        const existingAdmin = await User.findOne({
            where: { email: superAdminData.email }
        });

        if (existingAdmin) {
            console.log('⚠️  Super Admin already exists. Skipping creation.');
            process.exit(0);
        } else {
            await createInitialData();
            await createAdmin(superAdminData);
        }

    } catch (error) {
        console.error('❌ Error creating Super Admin:', error);
        process.exit(1);
    }
};

const createInitialData = async () => {
    console.log('📍 Creating initial location data...\n');

    let cesarDept = await Department.findOne({ where: { code: 'CES' } });
    if (!cesarDept) {
        cesarDept = await Department.create({
            name: 'Cesar',
            code: 'CES',
            slug: 'cesar'
        });
        console.log('✅ Department "Cesar" created');
    }

    let valledupar = await City.findOne({ where: { name: 'Valledupar' } });
    if (!valledupar) {
        valledupar = await City.create({
            name: 'Valledupar',
            slug: 'valledupar',
            departmentId: cesarDept.id
        });
        console.log('✅ City "Valledupar" created');
    }

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

    for (const amenityData of basicAmenities) {
        const existing = await Amenity.findOne({ where: { name: amenityData.name } });
        if (!existing) await Amenity.create(amenityData);
    }
    console.log('✅ Amenities checked/created');
};

const createAdmin = async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const superAdmin = await User.create({ ...data, password: hashedPassword });
    console.log('✅ Super Admin created successfully!');
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`🔑 Password: Admin123!`);
    process.exit(0);
};

createSuperAdmin();
