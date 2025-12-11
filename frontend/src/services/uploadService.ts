import apiClient from '../lib/axios';

/**
 * Upload Service
 * Handles image uploads to Cloudinary through backend API
 */

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    resourceType: string;
    createdAt: string;
}

/**
 * Cloudinary folder names for organizing uploads
 */
export const CLOUDINARY_FOLDERS = {
    PROPERTIES: 'properties',
    VERIFICATION: 'verification',
    PROFILES: 'profiles',
    DOCUMENTS: 'documents'
} as const;

export type CloudinaryFolder = typeof CLOUDINARY_FOLDERS[keyof typeof CLOUDINARY_FOLDERS];

/**
 * Upload a single image to Cloudinary
 * @param base64Image - Base64 encoded image string
 * @param folder - Cloudinary folder name (e.g., 'properties', 'verification')
 * @returns Upload result with URL and metadata
 */
export const uploadSingleImage = async (
    base64Image: string,
    folder: CloudinaryFolder = CLOUDINARY_FOLDERS.PROPERTIES
): Promise<CloudinaryUploadResult> => {
    try {
        const response = await apiClient.post('/upload/image', {
            image: base64Image,
            folder
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Upload failed');
        }

        return response.data.data;
    } catch (error: any) {
        console.error('Error uploading image:', error);
        throw new Error(error.response?.data?.message || 'Error al subir la imagen');
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param base64Images - Array of base64 encoded image strings
 * @param folder - Cloudinary folder name
 * @returns Array of upload results
 */
export const uploadMultipleImages = async (
    base64Images: string[],
    folder: CloudinaryFolder = CLOUDINARY_FOLDERS.PROPERTIES
): Promise<CloudinaryUploadResult[]> => {
    try {
        const response = await apiClient.post('/upload/images', {
            images: base64Images,
            folder
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Upload failed');
        }

        return response.data.data;
    } catch (error: any) {
        console.error('Error uploading images:', error);
        throw new Error(error.response?.data?.message || 'Error al subir las imágenes');
    }
};

/**
 * Delete an image from Cloudinary
 * @param url - Cloudinary image URL
 * @returns Deletion result
 */
export const deleteImage = async (url: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.delete('/upload/image', {
            data: { url }
        });

        return {
            success: response.data.success,
            message: response.data.message
        };
    } catch (error: any) {
        console.error('Error deleting image:', error);
        throw new Error(error.response?.data?.message || 'Error al eliminar la imagen');
    }
};

/**
 * Delete multiple images from Cloudinary
 * @param urls - Array of Cloudinary image URLs
 * @returns Deletion results
 */
export const deleteMultipleImages = async (urls: string[]): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.delete('/upload/images', {
            data: { urls }
        });

        return {
            success: response.data.success,
            message: response.data.message
        };
    } catch (error: any) {
        console.error('Error deleting images:', error);
        throw new Error(error.response?.data?.message || 'Error al eliminar las imágenes');
    }
};
