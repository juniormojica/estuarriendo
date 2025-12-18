import { sequelize } from '../src/config/database.js';

/**
 * Add Cloudinary columns to payment_requests table
 * Removes base64 storage, uses Cloudinary URLs instead
 */
async function updatePaymentRequestsTable() {
    try {
        console.log('🔄 Updating payment_requests table for Cloudinary integration...');

        // Add new columns
        await sequelize.query(`
            ALTER TABLE payment_requests 
            ADD COLUMN IF NOT EXISTS proof_image_url VARCHAR(500) DEFAULT '',
            ADD COLUMN IF NOT EXISTS proof_image_public_id VARCHAR(255) DEFAULT '';
        `);

        console.log('✅ Added proof_image_url and proof_image_public_id columns');

        // Add comments
        await sequelize.query(`
            COMMENT ON COLUMN payment_requests.proof_image_url IS 'Cloudinary URL of payment proof';
        `);
        await sequelize.query(`
            COMMENT ON COLUMN payment_requests.proof_image_public_id IS 'Cloudinary public_id for deletion';
        `);

        console.log('✅ Added column comments');

        console.log('✅ Migration completed successfully!');
        console.log('ℹ️  Note: Old columns (user_name, proof_image) kept for backward compatibility');
        console.log('ℹ️  You can drop them manually after migrating existing data');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating payment_requests table:', error);
        process.exit(1);
    }
}

updatePaymentRequestsTable();
