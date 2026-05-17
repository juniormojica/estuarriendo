const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
    console.log('⚠️  Skipping DB smoke check: missing env vars ->', missing.join(', '));
    console.log('   Provide backend DB env vars and rerun: npm run db:smoke:migrations');
    process.exit(0);
}

const { sequelize } = await import('../src/config/database.js');

const expectedIndexes = [
    ['properties', 'owner_id'],
    ['properties', 'location_id'],
    ['properties', 'type_id'],
    ['notifications', 'user_id'],
    ['activity_log', 'user_id'],
    ['student_requests', 'city_id'],
    ['contact_unlocks', 'owner_id']
];

try {
    await sequelize.authenticate();
    console.log('✅ DB connection established for smoke check.');

    const [metaRows] = await sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name;');
    console.log(`✅ SequelizeMeta entries: ${metaRows.length}`);

    for (const [table, field] of expectedIndexes) {
        const [rows] = await sequelize.query(
            `SELECT 1
             FROM pg_indexes
             WHERE tablename = :table
               AND indexdef ILIKE :fieldMatch
             LIMIT 1;`,
            {
                replacements: {
                    table,
                    fieldMatch: `%(${field}%)%`
                }
            }
        );

        if (!rows.length) {
            throw new Error(`Missing index smoke check: ${table}(${field})`);
        }
    }

    console.log('✅ Migration/index smoke checks passed.');
    process.exit(0);
} catch (error) {
    console.error('❌ DB smoke check failed:', error.message);
    process.exit(1);
} finally {
    await sequelize.close();
}
