import { uploadImage, uploadMultipleImages, deleteImage, extractPublicId } from '../utils/cloudinaryUtils.js';

/**
 * Upload a single image
 * POST /api/upload/image
 * Body: { image: "base64string", folder: "optional_folder_name" }
 */
export const uploadSingleImage = async (req, res) => {
    try {
        const { image, folder } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                message: 'Image data is required'
            });
        }

        const result = await uploadImage(image, folder);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in uploadSingleImage:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image'
        });
    }
};

/**
 * Upload multiple images
 * POST /api/upload/images
 * Body: { images: ["base64string1", "base64string2"], folder: "optional_folder_name" }
 */
export const uploadImages = async (req, res) => {
    try {
        const { images, folder } = req.body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Images array is required and must not be empty'
            });
        }

        // Limit to 10 images per request
        if (images.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 images allowed per request'
            });
        }

        const results = await uploadMultipleImages(images, folder);

        res.status(200).json({
            success: true,
            message: `${results.length} images uploaded successfully`,
            data: results
        });
    } catch (error) {
        console.error('Error in uploadImages:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload images'
        });
    }
};

/**
 * Delete an image
 * DELETE /api/upload/image
 * Body: { url: "cloudinary_url" } or { publicId: "public_id" }
 */
export const deleteSingleImage = async (req, res) => {
    try {
        const { url, publicId } = req.body;

        let imagePublicId = publicId;

        // If URL provided, extract public_id
        if (url && !publicId) {
            imagePublicId = extractPublicId(url);
        }

        if (!imagePublicId) {
            return res.status(400).json({
                success: false,
                message: 'Either URL or publicId is required'
            });
        }

        const result = await deleteImage(imagePublicId);

        if (result.result === 'ok' || result.result === 'not found') {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully',
                data: result
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to delete image',
                data: result
            });
        }
    } catch (error) {
        console.error('Error in deleteSingleImage:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete image'
        });
    }
};

/**
 * Delete multiple images
 * DELETE /api/upload/images
 * Body: { urls: ["url1", "url2"] } or { publicIds: ["id1", "id2"] }
 */
export const deleteImages = async (req, res) => {
    try {
        const { urls, publicIds } = req.body;

        let imagePublicIds = publicIds || [];

        // If URLs provided, extract public_ids
        if (urls && Array.isArray(urls) && urls.length > 0) {
            imagePublicIds = urls.map(url => extractPublicId(url)).filter(id => id !== null);
        }

        if (!imagePublicIds || imagePublicIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Either URLs or publicIds array is required'
            });
        }

        const results = await Promise.all(
            imagePublicIds.map(publicId => deleteImage(publicId))
        );

        res.status(200).json({
            success: true,
            message: `${results.length} images deleted successfully`,
            data: results
        });
    } catch (error) {
        console.error('Error in deleteImages:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete images'
        });
    }
};
