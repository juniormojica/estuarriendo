import React from 'react';
import { X } from 'lucide-react';
import { Property } from '../../types';
import PropertyEditForm from '../forms/PropertyEditForm';

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
                    <PropertyEditForm
                        property={property}
                        onSuccess={async () => {
                            await onSave();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default PropertyEditModal;
