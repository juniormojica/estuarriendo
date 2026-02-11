import React, { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadSingleImage, CloudinaryFolder, CLOUDINARY_FOLDERS } from '../services/uploadService';
import { compressImageToBase64, formatFileSize } from '../utils/imageCompression';

interface ImageUploaderProps {
    images: string[]; // Cloudinary URLs
    onChange: (images: string[]) => void;
    maxImages?: number;
    maxSizeMB?: number; // Maximum upload size before compression (default 10MB)
    onLimitReached?: () => void;
    folder?: CloudinaryFolder; // Cloudinary folder for organization
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    images,
    onChange,
    maxImages = 10,
    maxSizeMB = 10, // Increased default to 10MB since we compress
    onLimitReached,
    folder = CLOUDINARY_FOLDERS.PROPERTIES
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);

        // Check if adding these files would exceed the limit
        if (images.length + fileArray.length > maxImages) {
            if (onLimitReached) {
                onLimitReached();
            } else {
                alert(`Solo puedes subir un máximo de ${maxImages} imágenes.`);
            }
        }

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) return;

        const filesToProcess = fileArray.slice(0, remainingSlots);

        setIsUploading(true);
        const newUrls: string[] = [];

        for (let i = 0; i < filesToProcess.length; i++) {
            const file = filesToProcess[i];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} no es una imagen válida`);
                continue;
            }

            // Validate file size
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
                alert(`${file.name} excede el tamaño máximo de ${maxSizeMB}MB`);
                continue;
            }

            try {
                // Compress and convert to base64
                setUploadProgress(prev => ({ ...prev, [i]: 10 }));
                // Use 'property' profile for best balance of quality/size for listings
                const base64 = await compressImageToBase64(file, 'property');

                // Upload to Cloudinary
                setUploadProgress(prev => ({ ...prev, [i]: 50 }));
                const result = await uploadSingleImage(base64, folder);

                // Add Cloudinary URL to array
                newUrls.push(result.url);
                setUploadProgress(prev => ({ ...prev, [i]: 100 }));

            } catch (error: any) {
                console.error('Error uploading image:', error);
                alert(`Error al subir ${file.name}: ${error.message}`);
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[i];
                    return newProgress;
                });
            }
        }

        // Update parent component with new Cloudinary URLs
        onChange([...images, ...newUrls]);

        // Reset upload state
        setIsUploading(false);
        setUploadProgress({});
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    // Drag and drop reordering
    const handleImageDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleImageDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleImageDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newImages = [...images];
        const [draggedImage] = newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedImage);

        onChange(newImages);
        setDraggedIndex(null);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onClick={!isUploading ? handleClick : undefined}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 transition-all ${isUploading
                    ? 'border-blue-400 bg-blue-50 cursor-wait'
                    : isDragging
                        ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                        : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50 cursor-pointer'
                    }`}
            >
                <div className="text-center">
                    {isUploading ? (
                        <>
                            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                            <div className="text-sm text-blue-600 font-medium mb-2">
                                Subiendo imágenes a Cloudinary...
                            </div>
                            <p className="text-xs text-gray-500">
                                Por favor espera mientras se procesan las imágenes
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium text-emerald-600">Haz clic para subir</span> o arrastra y suelta
                            </div>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, GIF hasta {maxSizeMB}MB cada una (máximo {maxImages} imágenes)
                            </p>
                            {images.length > 0 && (
                                <p className="text-sm text-emerald-600 font-medium mt-2">
                                    {images.length} de {maxImages} imágenes cargadas
                                </p>
                            )}
                        </>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    disabled={isUploading}
                />
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700">
                            Imágenes ({images.length})
                        </h3>
                        <p className="text-xs text-gray-500 hidden sm:inline">Arrastra para reordenar</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={(e) => handleImageDragStart(e, index)}
                                onDragOver={handleImageDragOver}
                                onDrop={(e) => handleImageDrop(e, index)}
                                className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-move ${draggedIndex === index
                                    ? 'border-emerald-500 opacity-50'
                                    : 'border-gray-200 hover:border-emerald-300'
                                    }`}
                            >
                                <div className="aspect-square bg-gray-100">
                                    <img
                                        src={image}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Order Badge */}
                                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    {index + 1}
                                </div>

                                {/* Delete Button - Always visible on mobile, hover on desktop */}
                                <button
                                    type="button"
                                    onClick={() => handleDelete(index)}
                                    className="absolute top-2 right-2 min-w-[32px] min-h-[32px] bg-red-600 text-white p-1.5 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-700 active:bg-red-800"
                                    title="Eliminar imagen"
                                    aria-label="Eliminar imagen"
                                >
                                    <X size={16} />
                                </button>

                                {/* Drag Indicator */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                                    <ImageIcon className="text-white opacity-0 group-hover:opacity-70 transition-opacity" size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {images.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay imágenes cargadas</p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
