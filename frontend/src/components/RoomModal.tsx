'use client';
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Bed, Square, Users } from 'lucide-react';

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: {
        id: number;
        title: string;
        description?: string;
        monthlyRent: number;
        area?: number;
        roomType: 'individual' | 'shared';
        bedsInRoom?: number;
        images?: Array<{ url: string } | string>;
        amenities?: Array<{ id: number; name: string; icon?: string }>;
        isRented: boolean;
    };
}

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, room }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Handle ESC key press to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const images = room.images?.map(img => typeof img === 'string' ? img : img.url) || [];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4" onClick={onClose}>
                <div
                    className="relative w-full max-w-4xl bg-white dark:bg-brand-dark rounded-2xl shadow-2xl transform transition-all border border-transparent dark:border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-white dark:bg-brand-dark/80 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-white/10 dark:border dark:border-white/10 transition-colors"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-300" />
                    </button>

                    {/* Image Gallery */}
                    {images.length > 0 && (
                        <div className="relative h-64 sm:h-80 md:h-96 bg-gray-900 rounded-t-xl sm:rounded-t-2xl overflow-hidden">
                            <img
                                src={images[currentImageIndex]}
                                alt={`${room.title} - Imagen ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-brand-dark/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-brand-dark transition-all dark:border dark:border-white/10"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-white" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-brand-dark/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-brand-dark transition-all dark:border dark:border-white/10"
                                    >
                                        <ChevronRight className="h-6 w-6 text-gray-800 dark:text-white" />
                                    </button>

                                    {/* Image Counter */}
                                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm font-medium rounded-full">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${room.isRented
                                    ? 'bg-gray-800 text-white dark:border dark:border-white/20'
                                    : 'bg-brand-lime text-brand-dark'
                                    }`}>
                                    {room.isRented ? 'Rentada' : 'Disponible'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-4 sm:p-6 md:p-8 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
                        {/* Title and Price */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3">
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-white mb-2">{room.title}</h2>
                                {room.description && (
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{room.description}</p>
                                )}
                            </div>
                            <div className="sm:ml-4 text-left sm:text-right">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Precio/mes</p>
                                <p className="text-2xl sm:text-3xl font-bold text-brand-lime">{formatPrice(room.monthlyRent)}</p>
                            </div>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-brand-lime/10 p-4 rounded-xl border border-brand-lime/20 dark:border-brand-lime/10">
                                <div className="flex items-center space-x-2 text-brand-lime mb-2">
                                    <Users className="h-5 w-5" />
                                    <p className="text-sm font-medium">Tipo</p>
                                </div>
                                <p className="text-lg font-bold text-brand-dark dark:text-white">
                                    {room.roomType === 'individual' ? 'Individual' : 'Compartida'}
                                </p>
                            </div>

                            {room.area && (
                                <div className="bg-blue-50 dark:bg-brand-blue/10 p-4 rounded-xl border border-blue-100 dark:border-brand-blue/20">
                                    <div className="flex items-center space-x-2 text-brand-blue dark:text-blue-400 mb-2">
                                        <Square className="h-5 w-5" />
                                        <p className="text-sm font-medium">Área</p>
                                    </div>
                                    <p className="text-lg font-bold text-brand-dark dark:text-white">{room.area}m²</p>
                                </div>
                            )}

                            {room.roomType === 'shared' && room.bedsInRoom && (
                                <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-500/20">
                                    <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-2">
                                        <Bed className="h-5 w-5" />
                                        <p className="text-sm font-medium">Camas</p>
                                    </div>
                                    <p className="text-lg font-bold text-brand-dark dark:text-white">{room.bedsInRoom}</p>
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-brand-dark dark:text-white mb-4">Comodidades de la Habitación</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {room.amenities.map((amenity) => (
                                        <div
                                            key={amenity.id}
                                            className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-white dark:bg-brand-dark flex items-center justify-center shadow-sm dark:border dark:border-white/10">
                                                <div className="h-2 w-2 rounded-full bg-brand-lime" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 border-t border-gray-100 dark:border-white/10 pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                Cerrar
                            </button>
                            {!room.isRented && (
                                <button
                                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-lime text-brand-dark text-sm sm:text-base font-bold rounded-lg sm:rounded-xl hover:brightness-95 active:scale-95 transition-all"
                                >
                                    Contactar sobre esta habitación
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomModal;
