import React, { useEffect, useState } from 'react';
import { Property } from '../types';
import { api } from '../services/api';
import { Check, Clock, MapPin, Home } from 'lucide-react';
import PropertyReviewModal from '../components/PropertyReviewModal';

const AdminDashboard = () => {
    const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    useEffect(() => {
        loadPendingProperties();
    }, []);

    const loadPendingProperties = async () => {
        try {
            const properties = await api.getPendingProperties();
            setPendingProperties(properties);
        } catch (error) {
            console.error('Error loading pending properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const success = await api.approveProperty(id);
            if (success) {
                setPendingProperties(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error approving property:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const success = await api.rejectProperty(id);
            if (success) {
                setPendingProperties(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error rejecting property:', error);
        }
    };

    const handleDeleteImage = async (propertyId: string, imageIndex: number) => {
        try {
            const success = await api.deletePropertyImage(propertyId, imageIndex);
            if (success) {
                // Update the local state to reflect the deleted image
                setPendingProperties(prev => prev.map(p => {
                    if (p.id === propertyId) {
                        return {
                            ...p,
                            images: p.images.filter((_, i) => i !== imageIndex)
                        };
                    }
                    return p;
                }));
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handlePropertyClick = (property: Property) => {
        setSelectedProperty(property);
    };

    const handleCloseModal = () => {
        setSelectedProperty(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium flex items-center gap-2">
                    <Clock size={20} />
                    {pendingProperties.length} Pendientes
                </div>
            </div>

            {pendingProperties.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="bg-green-100 text-green-600 p-4 rounded-full inline-block mb-4">
                        <Check size={48} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Todo al día!</h3>
                    <p className="text-gray-600">No hay propiedades pendientes de revisión.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingProperties.map((property) => (
                        <div
                            key={property.id}
                            onClick={() => handlePropertyClick(property)}
                            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col md:flex-row cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all"
                        >
                            <div className="md:w-1/3 h-48 md:h-auto relative">
                                <img
                                    src={property.images[0]}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">
                                    Pendiente
                                </div>
                                {property.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                                        +{property.images.length - 1} fotos
                                    </div>
                                )}
                            </div>

                            <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{property.title}</h3>
                                        <span className="text-xl font-bold text-blue-600">
                                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: property.currency }).format(property.price)}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} />
                                            {property.address.city}, {property.address.department}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Home size={16} />
                                            {property.type}
                                        </div>
                                        {property.rooms !== undefined && (
                                            <div className="flex items-center gap-2">
                                                🛏️ {property.rooms} Habitaciones
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-emerald-600 font-medium">
                                        👆 Haz clic para revisar en detalle
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Property Review Modal */}
            {selectedProperty && (
                <PropertyReviewModal
                    property={selectedProperty}
                    onClose={handleCloseModal}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDeleteImage={handleDeleteImage}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
