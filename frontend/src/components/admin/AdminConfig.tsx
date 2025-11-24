import React, { useState } from 'react';
import { SystemConfig, Amenity } from '../../types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface AdminConfigProps {
    config: SystemConfig;
    amenities: Amenity[];
    onSaveConfig: (config: SystemConfig) => void;
    onAddAmenity: (amenity: Omit<Amenity, 'id'>) => void;
    onDeleteAmenity: (id: string) => void;
}

const AdminConfig: React.FC<AdminConfigProps> = ({
    config,
    amenities,
    onSaveConfig,
    onAddAmenity,
    onDeleteAmenity
}) => {
    const [editedConfig, setEditedConfig] = useState<SystemConfig>(config);
    const [newAmenityName, setNewAmenityName] = useState('');
    const [newAmenityIcon, setNewAmenityIcon] = useState('');

    const handleSaveConfig = () => {
        onSaveConfig(editedConfig);
    };

    const handleAddAmenity = () => {
        if (newAmenityName && newAmenityIcon) {
            onAddAmenity({ name: newAmenityName, icon: newAmenityIcon });
            setNewAmenityName('');
            setNewAmenityIcon('');
        }
    };

    return (
        <div className="space-y-6">
            {/* System Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Sistema</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tasa de Comisión (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={editedConfig.commissionRate}
                            onChange={(e) => setEditedConfig({ ...editedConfig, commissionRate: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Propiedad Destacada (COP)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={editedConfig.featuredPropertyPrice}
                            onChange={(e) => setEditedConfig({ ...editedConfig, featuredPropertyPrice: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Máximo de Imágenes por Propiedad
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={editedConfig.maxImagesPerProperty}
                            onChange={(e) => setEditedConfig({ ...editedConfig, maxImagesPerProperty: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Mínimo de Propiedad (COP)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="10000"
                            value={editedConfig.minPropertyPrice}
                            onChange={(e) => setEditedConfig({ ...editedConfig, minPropertyPrice: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio Máximo de Propiedad (COP)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="10000"
                            value={editedConfig.maxPropertyPrice}
                            onChange={(e) => setEditedConfig({ ...editedConfig, maxPropertyPrice: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editedConfig.autoApprovalEnabled}
                                onChange={(e) => setEditedConfig({ ...editedConfig, autoApprovalEnabled: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Aprobación Automática
                            </span>
                        </label>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleSaveConfig}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Save size={20} />
                        Guardar Configuración
                    </button>
                </div>
            </div>

            {/* Amenities Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Amenidades</h3>

                {/* Add New Amenity */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar Nueva Amenidad</h4>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Nombre de la amenidad"
                            value={newAmenityName}
                            onChange={(e) => setNewAmenityName(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="text"
                            placeholder="Emoji o ícono"
                            value={newAmenityIcon}
                            onChange={(e) => setNewAmenityIcon(e.target.value)}
                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleAddAmenity}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus size={20} />
                            Agregar
                        </button>
                    </div>
                </div>

                {/* Amenities List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                        <div
                            key={amenity.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{amenity.icon}</span>
                                <span className="text-sm font-medium text-gray-900">{amenity.name}</span>
                            </div>
                            <button
                                onClick={() => onDeleteAmenity(amenity.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar amenidad"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminConfig;
