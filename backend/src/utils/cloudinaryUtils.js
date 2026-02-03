import cloudinary from '../config/cloudinary.js';

/**
 * Upload a single image to Cloudinary
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} folder - Cloudinary folder name (e.g., 'properties', 'users')
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadImage = async (base64Image, folder = 'estuarriendo') => {
    try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 1200, height: 800, crop: 'limit' }, // Limit max size
                { quality: 'auto:good' }, // Auto quality optimization
                { fetch_format: 'auto' } // Auto format (WebP for supported browsers)
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            resourceType: result.resource_type,
            createdAt: result.created_at
        };
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<string>} base64Images - Array of base64 encoded images
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<Object>>} - Array of upload results
 */
export const uploadMultipleImages = async (base64Images, folder = 'estuarriendo') => {
    try {
        const uploadPromises = base64Images.map(image => uploadImage(image, folder));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw new Error('Failed to upload images');
    }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public_id of the image
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw new Error('Failed to delete image');
    }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of Cloudinary public_ids
 * @returns {Promise<Array<Object>>} - Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
    try {
        const deletePromises = publicIds.map(publicId => deleteImage(publicId));
        const results = await Promise.all(deletePromises);
        return results;
    } catch (error) {
        console.error('Error deleting multiple images:', error);
        throw new Error('Failed to delete images');
    }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const extractPublicId = (url) => {
    try {
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
        // Extract: folder/image
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // Get everything after 'upload/v123456789/'
        const pathParts = parts.slice(uploadIndex + 2);
        const filename = pathParts.join('/');

        // Remove file extension
        return filename.replace(/\.[^/.]+$/, '');
    } catch (error) {
        console.error('Error extracting public_id from URL:', error);
        return null;
    }
};
