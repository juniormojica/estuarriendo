import React, { useState } from 'react';
import { SystemConfig } from '../../types';
import { Save, Settings, List, MapPin, Building, GraduationCap, Home } from 'lucide-react';
import AmenityManager from './AmenityManager';
import CityManager from './CityManager';
import DepartmentManager from './DepartmentManager';
import InstitutionManager from './InstitutionManager';
import PropertyTypeManager from './PropertyTypeManager';

interface AdminConfigProps {
    config: SystemConfig;
    onSaveConfig: (config: SystemConfig) => void;
}

type ConfigTab = 'general' | 'amenities' | 'departments' | 'cities' | 'institutions' | 'property-types';

const AdminConfig: React.FC<AdminConfigProps> = ({
    config,
    onSaveConfig
}) => {
    const [activeTab, setActiveTab] = useState<ConfigTab>('general');
    const [editedConfig, setEditedConfig] = useState<SystemConfig>(config);

    const handleSaveConfig = () => {
        onSaveConfig(editedConfig);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'amenities', label: 'Amenidades', icon: List },
        { id: 'departments', label: 'Departamentos', icon: MapPin },
        { id: 'cities', label: 'Ciudades', icon: Building },
        { id: 'institutions', label: 'Instituciones', icon: GraduationCap },
        { id: 'property-types', label: 'Tipos Propiedad', icon: Home },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 overflow-x-auto">
                <div className="flex space-x-1 min-w-max">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ConfigTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'general' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Sistema</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                )}

                {activeTab === 'amenities' && <AmenityManager />}
                {activeTab === 'departments' && <DepartmentManager />}
                {activeTab === 'cities' && <CityManager />}
                {activeTab === 'institutions' && <InstitutionManager />}
                {activeTab === 'property-types' && <PropertyTypeManager />}
            </div>
        </div>
    );
};

export default AdminConfig;
