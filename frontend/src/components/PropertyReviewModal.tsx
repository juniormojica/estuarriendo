import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ChevronLeft, ChevronRight, MapPin, Home, Maximize } from 'lucide-react';
import { Property } from '../types';

interface PropertyReviewModalProps {
    property: Property;
    onClose: () => void;
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string, reason: string) => Promise<void>;
    onDeleteImage: (propertyId: string, imageIndex: number) => Promise<void>;
}

const PropertyReviewModal: React.FC<PropertyReviewModalProps> = ({
    property,
    onClose,
    onApprove,
    onReject,
    onDeleteImage
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [localImages, setLocalImages] = useState(property.images);

    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showRejectionInput) {
                    setShowRejectionInput(false);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, showRejectionInput]);

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(property.id);
            onClose();
        } catch (error) {
            console.error('Error approving property:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectClick = () => {
        setShowRejectionInput(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Por favor ingresa una razón para el rechazo.');
            return;
        }

        setIsProcessing(true);
        try {
            await onReject(property.id, rejectionReason);
            onClose();
        } catch (error) {
            console.error('Error rejecting property:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteImage = async (index: number) => {
        if (!confirm('¿Eliminar esta imagen?')) return;

        try {
            await onDeleteImage(property.id, index);
            const newImages = localImages.filter((_, i) => i !== index);
            setLocalImages(newImages);

            // Adjust current image index if necessary
            if (currentImageIndex >= newImages.length && newImages.length > 0) {
                setCurrentImageIndex(newImages.length - 1);
            } else if (newImages.length === 0) {
                setCurrentImageIndex(0);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % localImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + localImages.length) % localImages.length);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Revisar Propiedad</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Images */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Imágenes ({localImages.length})
                            </h3>

                            {localImages.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Main Image */}
                                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                                        <img
                                            src={localImages[currentImageIndex]}
                                            alt={`${property.title} - ${currentImageIndex + 1}`}
                                            className="w-full h-full object-contain bg-black"
                                        />

                                        {/* Image Counter */}
                                        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            {currentImageIndex + 1} / {localImages.length}
                                        </div>

                                        {/* Delete Current Image Button */}
                                        <button
                                            onClick={() => handleDeleteImage(currentImageIndex)}
                                            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                                            title="Eliminar esta imagen"
                                        >
                                            <Trash2 size={20} />
                                        </button>

                                        {/* Navigation Arrows */}
                                        {localImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Thumbnail Strip */}
                                    {localImages.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {localImages.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                                                        ? 'border-emerald-500 ring-2 ring-emerald-200'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                                    <Maximize className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                    <p>No hay imágenes disponibles</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Property Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Propiedad</h3>

                            <div className="space-y-4">
                                {/* Title and Price */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Título</label>
                                    <p className="text-lg font-bold text-gray-900">{property.title}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500">Precio</label>
                                    <p className="text-xl font-bold text-emerald-600">
                                        {new Intl.NumberFormat('es-CO', {
                                            style: 'currency',
                                            currency: property.currency
                                        }).format(property.price)}
                                        <span className="text-sm text-gray-500 font-normal"> / mes</span>
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Descripción</label>
                                    <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
                                </div>

                                {/* Property Type */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Tipo</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Home size={16} className="text-gray-400" />
                                            <p className="text-gray-900 capitalize">{property.type}</p>
                                        </div>
                                    </div>

                                    {/* Only show rooms if not a single room (habitacion) */}
                                    {property.rooms !== undefined && property.type !== 'habitacion' && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Habitaciones</label>
                                            <p className="text-gray-900 mt-1">{property.rooms}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    {property.bathrooms !== undefined && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Baños</label>
                                            <p className="text-gray-900 mt-1">{property.bathrooms}</p>
                                        </div>
                                    )}

                                    {property.area !== undefined && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Área</label>
                                            <p className="text-gray-900 mt-1">{property.area} m²</p>
                                        </div>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Ubicación</label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                                        <div className="text-gray-900">
                                            <p>{property.address.street}</p>
                                            <p>{property.address.city}, {property.address.department}</p>
                                            {property.address.postalCode && <p>{property.address.postalCode}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Amenities */}
                                {property.amenities && property.amenities.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                                            {property.type === 'habitacion' ? 'Características' : 'Comodidades'}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {property.amenities.map((amenity) => (
                                                <span
                                                    key={amenity}
                                                    className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                                                >
                                                    {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Nearby Universities */}
                                {property.nearbyUniversities && property.nearbyUniversities.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 mb-2 block">Universidades Cercanas</label>
                                        <div className="flex flex-wrap gap-2">
                                            {property.nearbyUniversities.map((uni) => (
                                                <span
                                                    key={uni}
                                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                >
                                                    {uni}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Created Date */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Fecha de Publicación</label>
                                    <p className="text-gray-900 mt-1">{property.createdAt}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rejection Input Section */}
                    {showRejectionInput && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                            <h4 className="text-md font-semibold text-red-800 mb-2">Razón del Rechazo</h4>
                            <p className="text-sm text-red-600 mb-3">
                                Por favor indica por qué se rechaza esta propiedad. Esta información será enviada al propietario.
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full p-3 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                rows={3}
                                placeholder="Ej: Las fotos no son claras, la dirección es incorrecta..."
                            />
                            <div className="flex justify-end gap-3 mt-3">
                                <button
                                    onClick={() => setShowRejectionInput(false)}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmReject}
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {isProcessing ? 'Rechazando...' : 'Confirmar Rechazo'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!showRejectionInput && (
                        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing || localImages.length === 0}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Aprobar Propiedad
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleRejectClick}
                                disabled={isProcessing}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <X size={20} />
                                        Rechazar Propiedad
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {localImages.length === 0 && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <p className="text-yellow-800 text-sm">
                                ⚠️ Esta propiedad no tiene imágenes. No se puede aprobar sin al menos una imagen.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyReviewModal;
