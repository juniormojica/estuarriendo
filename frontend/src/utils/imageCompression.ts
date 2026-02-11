import imageCompression from 'browser-image-compression';

// Perfiles de compresión por caso de uso
export const COMPRESSION_PROFILES = {
    // Fotos de propiedades: calidad alta, resolución para web
    property: {
        maxSizeMB: 0.3,          // ~300KB meta per image
        maxWidthOrHeight: 1920,  // Full HD limit
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8,
    },
    // Comprobantes de pago: legibilidad > estética
    payment: {
        maxSizeMB: 0.5,          // Higher limit for text readability
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
    },
    // Documentos de identidad: máxima legibilidad
    verification: {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
    },
} as const;

export type CompressionProfile = keyof typeof COMPRESSION_PROFILES;

/**
 * Comprime una imagen según el perfil especificado
 */
export async function compressImage(
    file: File,
    profileKey: CompressionProfile = 'property'
): Promise<File> {
    try {
        const options = COMPRESSION_PROFILES[profileKey];
        // Ensure the file is an image
        if (!file.type.startsWith('image/')) {
            throw new Error('El archivo no es una imagen válida');
        }

        // compressFile returns a Promise<File>
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

/**
 * Comprime una imagen y retorna base64 para envío al backend
 */
export async function compressImageToBase64(
    file: File,
    profileKey: CompressionProfile = 'property'
): Promise<string> {
    try {
        const compressedFile = await compressImage(file, profileKey);
        return await imageCompression.getDataUrlFromFile(compressedFile);
    } catch (error) {
        console.error('Error converting compressed image to base64:', error);
        throw error;
    }
}

/**
 * Formatea bytes a texto legible (ej: "2.4 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
