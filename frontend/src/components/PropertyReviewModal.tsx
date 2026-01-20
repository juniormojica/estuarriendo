import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ChevronLeft, ChevronRight, MapPin, Home, Maximize, User, Phone, Mail, Clock, Calendar, DollarSign, Users, Coffee, Utensils, Wifi, Droplets, ShowerHead, Sofa, CheckCircle, XCircle, Building, Shield } from 'lucide-react';
import { Property } from '../types';
import ConfirmationModal from './ConfirmationModal';
import ReadOnlyMap from './ReadOnlyMap';

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
    // Helper to get city/department name from object or string
    const getLocationValue = (value: any): string => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value.name) return value.name;
        return '';
    };
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [localImages, setLocalImages] = useState(property.images || []);

    // Confirmation modals state
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);

    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Handle lightbox keyboard navigation
            if (showLightbox) {
                if (event.key === 'Escape') {
                    setShowLightbox(false);
                } else if (event.key === 'ArrowLeft') {
                    setLightboxImageIndex((prev) => (prev - 1 + localImages.length) % localImages.length);
                } else if (event.key === 'ArrowRight') {
                    setLightboxImageIndex((prev) => (prev + 1) % localImages.length);
                }
                return;
            }

            // Handle modal keyboard navigation
            if (event.key === 'Escape') {
                if (showRejectionInput) {
                    setShowRejectionInput(false);
                } else if (showApproveConfirm || showRejectConfirm || showDeleteImageConfirm) {
                    setShowApproveConfirm(false);
                    setShowRejectConfirm(false);
                    setShowDeleteImageConfirm(false);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, showRejectionInput, showApproveConfirm, showRejectConfirm, showDeleteImageConfirm, showLightbox, localImages.length]);

    const handleApproveClick = () => {
        setShowApproveConfirm(true);
    };

    const handleConfirmApprove = async () => {
        setIsProcessing(true);
        try {
            await onApprove(String(property.id));
            setShowApproveConfirm(false);
            onClose();
        } catch (error) {
            console.error('Error approving property:', error);
            setIsProcessing(false);
        }
    };

    const handleRejectClick = () => {
        setShowRejectionInput(true);
    };

    const handleConfirmRejectClick = () => {
        if (!rejectionReason.trim()) {
            return;
        }
        setShowRejectConfirm(true);
    };

    const handleConfirmReject = async () => {
        setIsProcessing(true);
        try {
            await onReject(String(property.id), rejectionReason);
            setShowRejectConfirm(false);
            setShowRejectionInput(false);
            onClose();
        } catch (error) {
            console.error('Error rejecting property:', error);
            setIsProcessing(false);
        }
    };

    const handleDeleteImageClick = (index: number) => {
        setImageToDelete(index);
        setShowDeleteImageConfirm(true);
    };

    const handleConfirmDeleteImage = async () => {
        if (imageToDelete === null) return;

        setIsProcessing(true);
        try {
            await onDeleteImage(String(property.id), imageToDelete);
            const newImages = localImages.filter((_, i) => i !== imageToDelete);
            setLocalImages(newImages);

            // Adjust current image index if necessary
            if (currentImageIndex >= newImages.length && newImages.length > 0) {
                setCurrentImageIndex(newImages.length - 1);
            } else if (newImages.length === 0) {
                setCurrentImageIndex(0);
            }

            setShowDeleteImageConfirm(false);
            setImageToDelete(null);
        } catch (error) {
            console.error('Error deleting image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % localImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + localImages.length) % localImages.length);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Header - Mobile optimized */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Revisar Propiedad</h2>
                    <button
                        onClick={onClose}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 sm:p-6">
                    {/* Property Header - Title and Price */}
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Home size={18} className="text-gray-500" />
                                        <span className="text-gray-700 capitalize font-medium">
                                            {typeof property.type === 'object' ? property.type?.name : property.type}
                                        </span>
                                    </div>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-sm text-gray-600">
                                        Publicado: {property.createdAt}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Precio Mensual</p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {new Intl.NumberFormat('es-CO', {
                                        style: 'currency',
                                        currency: property.currency
                                    }).format(property.monthlyRent || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Images (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Images Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Maximize size={20} className="text-emerald-600" />
                                    Imágenes ({localImages.length})
                                </h4>

                                {localImages.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* Main Image */}
                                        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video cursor-pointer group"
                                            onClick={() => {
                                                setLightboxImageIndex(currentImageIndex);
                                                setShowLightbox(true);
                                            }}
                                        >
                                            <img
                                                src={typeof localImages[currentImageIndex] === 'string' ? localImages[currentImageIndex] : localImages[currentImageIndex]?.url}
                                                alt={`${property.title} - ${currentImageIndex + 1}`}
                                                className="w-full h-full object-contain bg-black"
                                            />

                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Maximize size={48} className="text-white drop-shadow-lg" />
                                                </div>
                                            </div>

                                            {/* Image Counter */}
                                            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                {currentImageIndex + 1} / {localImages.length}
                                            </div>

                                            {/* Delete Current Image Button */}
                                            <button
                                                onClick={() => handleDeleteImageClick(currentImageIndex)}
                                                disabled={isProcessing}
                                                className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
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
                                            <div className="grid grid-cols-5 gap-2">
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
                                                            src={typeof image === 'string' ? image : image?.url}
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

                            {/* Description Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h4>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{property.description}</p>
                            </div>

                            {/* Location & Map Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin size={20} className="text-emerald-600" />
                                    Ubicación
                                </h4>

                                <div className="space-y-4">
                                    {/* Address */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="font-medium text-gray-900">{property.location?.street}</p>
                                        <p className="text-gray-600">{getLocationValue(property.location?.city)}, {getLocationValue(property.location?.department)}</p>
                                        {property.location?.postalCode && <p className="text-sm text-gray-500">CP: {property.location.postalCode}</p>}
                                    </div>

                                    {/* Map Display */}
                                    {property.location?.latitude && property.location?.longitude ? (
                                        <ReadOnlyMap
                                            latitude={typeof property.location.latitude === 'string'
                                                ? parseFloat(property.location.latitude)
                                                : property.location.latitude}
                                            longitude={typeof property.location.longitude === 'string'
                                                ? parseFloat(property.location.longitude)
                                                : property.location.longitude}
                                            address={`${property.location.street}, ${getLocationValue(property.location.city)}`}
                                        />
                                    ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Esta propiedad no tiene coordenadas de ubicación. Considera solicitar al propietario que actualice la ubicación.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Property Details (1/3 width) */}
                        <div className="space-y-6">
                            {/* Property Features */}
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Características</h4>

                                <div className="space-y-3">
                                    {/* Only show bedrooms if not a single room (habitacion) */}
                                    {property.bedrooms !== undefined && property.type?.name !== 'habitacion' && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Habitaciones</span>
                                            <span className="font-semibold text-gray-900">{property.bedrooms}</span>
                                        </div>
                                    )}

                                    {property.bathrooms !== undefined && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Baños</span>
                                            <span className="font-semibold text-gray-900">{property.bathrooms}</span>
                                        </div>
                                    )}

                                    {property.area !== undefined && (
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">Área</span>
                                            <span className="font-semibold text-gray-900">{property.area} m²</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Amenities */}
                            {property.amenities && property.amenities.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                        {property.type?.name === 'habitacion' ? 'Características' : 'Comodidades'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {property.amenities.map((amenity, index) => (
                                            <span
                                                key={typeof amenity === 'string' ? amenity : amenity.id || index}
                                                className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-medium"
                                            >
                                                {typeof amenity === 'string' ? amenity : amenity.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Nearby Institutions */}
                            {property.institutions && property.institutions.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Instituciones Cercanas</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {property.institutions.map((institution) => (
                                            <span
                                                key={institution.id}
                                                className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                                            >
                                                {institution.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services Section */}
                            {property.services && property.services.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Coffee size={20} className="text-emerald-600" />
                                        Servicios
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {property.services.map((service, index) => {
                                            const serviceLabels: Record<string, string> = {
                                                breakfast: 'Desayuno',
                                                lunch: 'Almuerzo',
                                                dinner: 'Cena',
                                                housekeeping: 'Aseo',
                                                laundry: 'Lavandería',
                                                wifi: 'WiFi',
                                                utilities: 'Servicios públicos'
                                            };
                                            return (
                                                <div
                                                    key={service.id || index}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${service.isIncluded
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-gray-50 text-gray-500'
                                                        }`}
                                                >
                                                    {service.isIncluded ? (
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    ) : (
                                                        <XCircle size={16} className="text-gray-400" />
                                                    )}
                                                    <span className="font-medium">
                                                        {serviceLabels[service.serviceType] || service.serviceType}
                                                    </span>
                                                    {service.additionalCost && service.additionalCost > 0 && (
                                                        <span className="text-xs text-gray-500">
                                                            (+${service.additionalCost.toLocaleString()})
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Rules Section */}
                            {property.rules && property.rules.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Shield size={20} className="text-emerald-600" />
                                        Reglas de la Propiedad
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {property.rules.map((rule, index) => {
                                            const ruleLabels: Record<string, string> = {
                                                visits: 'Visitas',
                                                pets: 'Mascotas',
                                                smoking: 'Fumar',
                                                noise: 'Ruido',
                                                curfew: 'Hora límite',
                                                tenant_profile: 'Perfil inquilino',
                                                couples: 'Parejas',
                                                children: 'Niños'
                                            };
                                            return (
                                                <div
                                                    key={rule.id || index}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${rule.isAllowed
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-red-50 text-red-700'
                                                        }`}
                                                >
                                                    {rule.isAllowed ? (
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    ) : (
                                                        <XCircle size={16} className="text-red-500" />
                                                    )}
                                                    <span className="font-medium">
                                                        {ruleLabels[rule.ruleType] || rule.ruleType}
                                                    </span>
                                                    {rule.value && (
                                                        <span className="text-xs text-gray-500">({rule.value})</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Common Areas Section (for containers) */}
                            {property.isContainer && property.commonAreas && property.commonAreas.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Sofa size={20} className="text-emerald-600" />
                                        Zonas Comunes
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {property.commonAreas.map((area) => (
                                            <span
                                                key={area.id}
                                                className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium"
                                            >
                                                {area.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Container Details Section */}
                            {property.isContainer && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Building size={20} className="text-emerald-600" />
                                        Detalles del Contenedor
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {property.rentalMode && (
                                            <div className="flex items-center gap-2">
                                                <Home size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Modo:</span>
                                                <span className="text-sm font-medium text-gray-900 capitalize">
                                                    {property.rentalMode === 'by_unit' ? 'Por habitación' : property.rentalMode}
                                                </span>
                                            </div>
                                        )}
                                        {property.totalUnits !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <Users size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Total unidades:</span>
                                                <span className="text-sm font-medium text-gray-900">{property.totalUnits}</span>
                                            </div>
                                        )}
                                        {property.minimumContractMonths !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Contrato mínimo:</span>
                                                <span className="text-sm font-medium text-gray-900">{property.minimumContractMonths} mes(es)</span>
                                            </div>
                                        )}
                                        {property.requiresDeposit !== undefined && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Requiere depósito:</span>
                                                <span className={`text-sm font-medium ${property.requiresDeposit ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {property.requiresDeposit ? 'Sí' : 'No'}
                                                </span>
                                            </div>
                                        )}
                                        {property.deposit !== undefined && property.deposit > 0 && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">Depósito:</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: property.currency }).format(property.deposit)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Owner/Contact Information */}
                            {(property.owner || property.contact) && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <User size={20} className="text-emerald-600" />
                                        Información del Propietario
                                    </h4>
                                    <div className="space-y-3">
                                        {property.owner && (
                                            <>
                                                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                                    <User size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Nombre</p>
                                                        <p className="font-medium text-gray-900">{property.owner.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                                    <Mail size={18} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Correo</p>
                                                        <p className="font-medium text-gray-900">{property.owner.email}</p>
                                                    </div>
                                                </div>
                                                {property.owner.phone && (
                                                    <div className="flex items-center gap-3 py-2">
                                                        <Phone size={18} className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Teléfono</p>
                                                            <p className="font-medium text-gray-900">{property.owner.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {property.contact && !property.owner && (
                                            <>
                                                {property.contact.contactName && (
                                                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                                        <User size={18} className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Contacto</p>
                                                            <p className="font-medium text-gray-900">{property.contact.contactName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {property.contact.email && (
                                                    <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                                                        <Mail size={18} className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Correo</p>
                                                            <p className="font-medium text-gray-900">{property.contact.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {property.contact.phone && (
                                                    <div className="flex items-center gap-3 py-2">
                                                        <Phone size={18} className="text-gray-400" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Teléfono</p>
                                                            <p className="font-medium text-gray-900">{property.contact.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                    onClick={handleConfirmRejectClick}
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!showRejectionInput && (
                        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
                            <button
                                onClick={handleApproveClick}
                                disabled={isProcessing || localImages.length === 0}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check size={20} />
                                Aprobar Propiedad
                            </button>
                            <button
                                onClick={handleRejectClick}
                                disabled={isProcessing}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X size={20} />
                                Rechazar Propiedad
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

            {/* Image Lightbox */}
            {showLightbox && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-[60] flex items-center justify-center"
                    onClick={() => setShowLightbox(false)}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        >
                            <X size={32} />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                            {lightboxImageIndex + 1} / {localImages.length}
                        </div>

                        {/* Main Image */}
                        <img
                            src={typeof localImages[lightboxImageIndex] === 'string' ? localImages[lightboxImageIndex] : localImages[lightboxImageIndex]?.url}
                            alt={`${property.title} - ${lightboxImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Navigation Arrows */}
                        {localImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxImageIndex((prev) => (prev - 1 + localImages.length) % localImages.length);
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxImageIndex((prev) => (prev + 1) % localImages.length);
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        {/* Keyboard hint */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm opacity-70">
                            Usa las flechas ← → para navegar | ESC para cerrar
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showApproveConfirm}
                onClose={() => setShowApproveConfirm(false)}
                onConfirm={handleConfirmApprove}
                title="¿Aprobar esta propiedad?"
                message={`Estás a punto de aprobar "${property.title}". La propiedad será visible públicamente en el sitio.`}
                type="approve"
                confirmText="Sí, Aprobar"
                cancelText="Cancelar"
                isProcessing={isProcessing}
            />

            <ConfirmationModal
                isOpen={showRejectConfirm}
                onClose={() => setShowRejectConfirm(false)}
                onConfirm={handleConfirmReject}
                title="¿Rechazar esta propiedad?"
                message={`Estás a punto de rechazar "${property.title}". El propietario recibirá una notificación con la razón: "${rejectionReason}"`}
                type="reject"
                confirmText="Sí, Rechazar"
                cancelText="Volver"
                isProcessing={isProcessing}
            />

            <ConfirmationModal
                isOpen={showDeleteImageConfirm}
                onClose={() => setShowDeleteImageConfirm(false)}
                onConfirm={handleConfirmDeleteImage}
                title="¿Eliminar esta imagen?"
                message="Esta acción no se puede deshacer. La imagen será eliminada permanentemente de la propiedad."
                type="delete"
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default PropertyReviewModal;
