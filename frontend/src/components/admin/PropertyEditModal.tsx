import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Property, Amenity } from '../../types';
import { api } from '../../services/api';
import ImageUploader from '../ImageUploader';
import { departments, getCitiesByDepartment } from '../../data/colombiaLocations';
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
    const [formData, setFormData] = useState<Property>(property);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setFormData(property);
            api.getAmenities().then(setAmenities);

            // Initialize available cities based on current department
            const dept = departments.find(d => d.name === property.address.department);
            if (dept) {
                const cities = getCitiesByDepartment(dept.id);
                setAvailableCities(cities.map(c => c.name));
            }
        }
    }, [isOpen, property]);

    const handleInputChange = (field: string, value: any) => {
        if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];

            if (addressField === 'department') {
                const dept = departments.find(d => d.id === value);
                const deptName = dept ? dept.name : '';
                const cities = getCitiesByDepartment(value);
                setAvailableCities(cities.map(c => c.name));
                setFormData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        department: deptName,
                        city: ''
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        [addressField]: value
                    }
                }));
            }
        } else {
            if (field === 'type') {
                setFormData(prev => ({
                    ...prev,
                    [field]: value,
                    rooms: value === 'habitacion' ? 1 : undefined,
                    bathrooms: value === 'habitacion' ? undefined : prev.bathrooms
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [field]: value
                }));
            }
        }
    };

    const handleAmenityToggle = (amenityId: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenityId)
                ? prev.amenities.filter(id => id !== amenityId)
                : [...prev.amenities, amenityId]
        }));
    };

    const handleImagesChange = (images: string[]) => {
        setFormData(prev => ({
            ...prev,
            images: images
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        try {
            const success = await api.updateProperty(property.id, formData);
            if (success) {
                await onSave();
                onClose();
            } else {
                setError('No se pudo actualizar la propiedad');
            }
        } catch (err) {
            setError('Error al guardar los cambios');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

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

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 text-red-700">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="apartamento">Apartamento</option>
                                <option value="habitacion">Habitación</option>
                                <option value="pension">Pensión</option>
                                <option value="aparta-estudio">Aparta-estudio</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <input
                                type="number"
                                required
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                <select
                                    required
                                    value={departments.find(d => d.name === formData.address.department)?.id || ''}
                                    onChange={(e) => handleInputChange('address.department', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                                <select
                                    required
                                    value={formData.address.city}
                                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    disabled={!formData.address.department}
                                >
                                    <option value="">Selecciona una ciudad</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address.street}
                                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {formData.type !== 'habitacion' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                                        <input
                                            type="number"
                                            value={formData.rooms || ''}
                                            onChange={(e) => handleInputChange('rooms', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                                        <input
                                            type="number"
                                            value={formData.bathrooms || ''}
                                            onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Área (m²)</label>
                                <input
                                    type="number"
                                    value={formData.area || ''}
                                    onChange={(e) => handleInputChange('area', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {formData.type === 'habitacion' ? 'Características' : 'Comodidades'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {amenities.map(amenity => (
                                <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity.id)}
                                        onChange={() => handleAmenityToggle(amenity.id)}
                                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-gray-700">{amenity.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Imágenes</h3>
                        <ImageUploader
                            images={formData.images}
                            onChange={handleImagesChange}
                            maxImages={10}
                            maxSizeMB={5}
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <LoadingSpinner size="sm" /> : <Save size={20} />}
                            <span>Guardar Cambios</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyEditModal;
