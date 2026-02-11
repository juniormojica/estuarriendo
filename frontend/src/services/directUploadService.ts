import apiClient from '../lib/axios';
import axios from 'axios';

// Re-using folders from existing service or redefining for clarity
export const CLOUDINARY_FOLDERS = {
    PROPERTIES: 'properties',
    VERIFICATION: 'verification',
    PROFILES: 'profiles',
    DOCUMENTS: 'documents',
    PAYOUTS: 'payouts'
} as const;

export type CloudinaryFolder = typeof CLOUDINARY_FOLDERS[keyof typeof CLOUDINARY_FOLDERS];

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    resourceType: string;
    createdAt: string;
}

interface SignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

/**
 * Get a signature from the backend to authorize a direct upload
 */
const getUploadSignature = async (folder: string): Promise<SignatureResponse> => {
    const response = await apiClient.get<SignatureResponse>('/upload/signature', {
        params: { folder }
    });
    return response.data;
};

/**
 * Upload a single file directly to Cloudinary
 * 
 * @param file The file object to upload (can be compressed)
 * @param folder The target folder in Cloudinary
 * @param onProgress Optional callback for upload progress (0-100)
 */
export const directUpload = async (
    file: File,
    folder: CloudinaryFolder = CLOUDINARY_FOLDERS.PROPERTIES,
    onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> => {
    try {
        // 1. Get signature from backend
        const { signature, timestamp, apiKey, cloudName } = await getUploadSignature(folder);

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);

        // 3. Upload directly to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const response = await axios.post(cloudinaryUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // axios sets this automatically but good to be explicit or let it handle boundary
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        });

        const data = response.data;

        return {
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            resourceType: data.resource_type,
            createdAt: data.created_at
        };
    } catch (error) {
        console.error('Direct upload failed:', error);
        throw new Error('Failed to upload image directly to Cloudinary');
    }
};

/**
 * Upload multiple files concurrently
 * 
 * @param files Array of files to upload
 * @param folder Target folder
 * @param onProgress Optional callback for specific file progress
 */
export const directUploadMultiple = async (
    files: File[],
    folder: CloudinaryFolder = CLOUDINARY_FOLDERS.PROPERTIES,
    onProgress?: (fileIndex: number, percent: number) => void
): Promise<CloudinaryUploadResult[]> => {
    // We can fetch one signature and reuse it if the timestamp is fresh, 
    // but Cloudinary signatures include the folder and timestamp. 
    // Usually it's safer to get a signature per batch or per file if we want to be strict.
    // For simplicity and speed, let's fetch one signature per file to avoid any timestamp issues 
    // or just fetch one signature and use it for all if they go to the same folder within a short window.

    // However, the signature is signed on (folder + timestamp). 
    // If we use the same timestamp for all, it's valid.

    const uploadPromises = files.map((file, index) =>
        directUpload(file, folder, (percent) => {
            if (onProgress) onProgress(index, percent);
        })
    );

    return Promise.all(uploadPromises);
};
