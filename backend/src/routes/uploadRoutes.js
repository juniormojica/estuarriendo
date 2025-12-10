import express from 'express';
import { uploadSingleImage, uploadImages, deleteSingleImage, deleteImages } from '../controllers/uploadController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image to Cloudinary
 * @access  Private (requires authentication)
 * @body    { image: "base64string", folder: "optional_folder_name" }
 */
router.post('/image', authMiddleware, uploadSingleImage);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Private (requires authentication)
 * @body    { images: ["base64string1", "base64string2"], folder: "optional_folder_name" }
 */
router.post('/images', authMiddleware, uploadImages);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete a single image from Cloudinary
 * @access  Private (requires authentication)
 * @body    { url: "cloudinary_url" } or { publicId: "public_id" }
 */
router.delete('/image', authMiddleware, deleteSingleImage);

/**
 * @route   DELETE /api/upload/images
 * @desc    Delete multiple images from Cloudinary
 * @access  Private (requires authentication)
 * @body    { urls: ["url1", "url2"] } or { publicIds: ["id1", "id2"] }
 */
router.delete('/images', authMiddleware, deleteImages);

export default router;
