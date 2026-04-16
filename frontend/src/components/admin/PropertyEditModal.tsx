'use client';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Property } from '../../types';
import PropertyEditForm from '../forms/PropertyEditForm';
import { useAppDispatch } from '../../store/hooks';
import { fetchPropertyById } from '../../store/slices/propertiesSlice';
import LoadingSpinner from '../LoadingSpinner';

interface PropertyEditModalProps {
    property: Property;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => Promise<void>;
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
    property,
    isOpen,
    onClose,
    onSave
}) => {
    const dispatch = useAppDispatch();
    const [fullProperty, setFullProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && property) {
            setLoading(true);
            dispatch(fetchPropertyById(String(property.id)))
                .unwrap()
                .then(p => setFullProperty(p))
                .catch(err => console.error("Error fetching property details:", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, property, dispatch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">Editar Propiedad</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <LoadingSpinner />
                        </div>
                    ) : fullProperty ? (
                        <PropertyEditForm
                            property={fullProperty}
                            onSuccess={async () => {
                                await onSave();
                                onClose();
                            }}
                            onCancel={onClose}
                            isAdmin
                        />
                    ) : (
                        <div className="text-center text-red-500 py-8">
                            Error al cargar los detalles de la propiedad.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyEditModal;
