import { Amenity } from '../src/models/index.js';
import { sequelize } from '../src/config/database.js';

/**
 * Seed script to add new amenities for property type-specific features
 * These amenities are used for:
 * - Habitación: baño privado/compartido, escritorio, cama, closet, cocina compartida
 * - Pensión: sala de estudio, comedor común
 */

const newAmenities = [
    // Habitación - Privacidad
    {
        name: 'Baño Privado',
        slug: 'bano_privado',
        icon: 'bathroom',
        category: 'habitacion',
        description: 'Baño privado en la habitación'
    },
    {
        name: 'Baño Compartido',
        slug: 'bano_compartido',
        icon: 'bathroom',
        category: 'habitacion',
        description: 'Baño compartido con otros inquilinos'
    },

    // Habitación - Mobiliario
    {
        name: 'Escritorio',
        slug: 'escritorio',
        icon: 'desk',
        category: 'habitacion',
        description: 'Escritorio de estudio en la habitación'
    },
    {
        name: 'Cama',
        slug: 'cama',
        icon: 'bed',
        category: 'habitacion',
        description: 'Cama incluida'
    },
    {
        name: 'Clóset',
        slug: 'closet',
        icon: 'closet',
        category: 'habitacion',
        description: 'Clóset o armario para guardar ropa'
    },

    // Habitación - Acceso
    {
        name: 'Cocina Compartida',
        slug: 'cocina_compartida',
        icon: 'kitchen',
        category: 'habitacion',
        description: 'Acceso a cocina compartida'
    },

    // Pensión - Zonas Comunes
    {
        name: 'Sala de Estudio',
        slug: 'sala_estudio',
        icon: 'book',
        category: 'pension',
        description: 'Sala de estudio común para estudiantes'
    },
    {
        name: 'Comedor Común',
        slug: 'comedor_comun',
        icon: 'dining',
        category: 'pension',
        description: 'Comedor compartido'
    }
];

async function seedNewAmenities() {
    try {
        console.log('🌱 Iniciando seed de nuevas amenidades...');

        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        let created = 0;
        let existing = 0;

        for (const amenityData of newAmenities) {
            const [amenity, wasCreated] = await Amenity.findOrCreate({
                where: { slug: amenityData.slug },
                defaults: amenityData
            });

            if (wasCreated) {
                console.log(`  ✅ Creada: ${amenityData.name} (${amenityData.slug})`);
                created++;
            } else {
                console.log(`  ⏭️  Ya existe: ${amenityData.name} (${amenityData.slug})`);
                existing++;
            }
        }

        console.log('\n📊 Resumen:');
        console.log(`  - Amenidades creadas: ${created}`);
        console.log(`  - Amenidades existentes: ${existing}`);
        console.log(`  - Total procesadas: ${newAmenities.length}`);
        console.log('\n✅ Seed de amenidades completado exitosamente');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al ejecutar seed de amenidades:', error);
        process.exit(1);
    }
}

// Ejecutar el seed
seedNewAmenities();
