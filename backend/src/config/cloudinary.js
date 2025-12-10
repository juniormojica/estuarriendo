import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Verify configuration
const isConfigured = () => {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    return !!(cloud_name && api_key && api_secret);
};

if (!isConfigured()) {
    console.warn('⚠️  Cloudinary is not properly configured. Please check your environment variables.');
} else {
    console.log('✅ Cloudinary configured successfully');
}

export default cloudinary;
