import { PropertyType } from '../src/models/index.js';

async function checkPropertyTypes() {
    try {
        const types = await PropertyType.findAll({
            order: [['id', 'ASC']]
        });

        console.log('\n=== Property Types in Database ===');
        types.forEach(t => {
            console.log(`  ID: ${t.id} | Name: ${t.name}`);
        });
        console.log('==================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPropertyTypes();
