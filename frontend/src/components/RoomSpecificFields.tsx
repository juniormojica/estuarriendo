import React from 'react';
import { PropertyRule, Amenity } from '../types';

interface RoomSpecificFieldsProps {
    rules: PropertyRule[];
    selectedAmenities: number[];
    onRuleChange: (rule: PropertyRule) => void;
    onAmenityToggle: (amenityId: number) => void;
    availableAmenities: Amenity[];
}

const RoomSpecificFields: React.FC<RoomSpecificFieldsProps> = ({
    rules,
    selectedAmenities,
    onRuleChange,
    onAmenityToggle,
    availableAmenities
}) => {
    // Filter amenities specific to habitacion
    const roomAmenities = availableAmenities.filter(a =>
        a.category === 'habitacion' ||
        ['bano_privado', 'bano_compartido', 'escritorio', 'cama', 'closet', 'cocina_compartida'].includes(a.slug || '')
    );

    const privacyAmenities = roomAmenities.filter(a =>
        a.slug?.includes('bano')
    );

    const furnitureAmenities = roomAmenities.filter(a =>
        ['escritorio', 'cama', 'closet'].includes(a.slug || '')
    );

    const accessAmenities = roomAmenities.filter(a =>
        a.slug === 'cocina_compartida'
    );

    const getRuleValue = (ruleType: PropertyRule['ruleType']) => {
        return rules.find(r => r.ruleType === ruleType);
    };

    const handleRuleToggle = (ruleType: PropertyRule['ruleType']) => {
        const existing = getRuleValue(ruleType);
        onRuleChange({
            ruleType,
            isAllowed: !existing?.isAllowed
        });
    };

    const handleTenantProfileChange = (value: string) => {
        onRuleChange({
            ruleType: 'tenant_profile',
            isAllowed: !!value,
            value: value || undefined
        });
    };

    return (
        <div className="space-y-6">
            {/* Sección: Privacidad */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privacidad
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {privacyAmenities.map(amenity => (
                        <label
                            key={amenity.id}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity.id)}
                                onChange={() => onAmenityToggle(amenity.id)}
                                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sección: Mobiliario Incluido */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Mobiliario Incluido
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {furnitureAmenities.map(amenity => (
                        <label
                            key={amenity.id}
                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity.id)}
                                onChange={() => onAmenityToggle(amenity.id)}
                                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sección: Acceso */}
            {accessAmenities.length > 0 && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        Acceso a Áreas Comunes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {accessAmenities.map(amenity => (
                            <label
                                key={amenity.id}
                                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAmenities.includes(amenity.id)}
                                    onChange={() => onAmenityToggle(amenity.id)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Sección: Reglas de la Habitación */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Reglas de la Habitación
                </h3>
                <div className="space-y-3">
                    {[
                        { type: 'visits' as const, label: '¿Permite visitas?' },
                        { type: 'pets' as const, label: '¿Permite mascotas?' },
                        { type: 'smoking' as const, label: '¿Permite fumar?' }
                    ].map(({ type, label }) => (
                        <label
                            key={type}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm ${getRuleValue(type)?.isAllowed ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {getRuleValue(type)?.isAllowed ? 'Sí' : 'No'}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={getRuleValue(type)?.isAllowed || false}
                                    onChange={() => handleRuleToggle(type)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sección: Perfil de Inquilino Preferido */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Perfil de Inquilino Preferido
                </h3>
                <select
                    value={getRuleValue('tenant_profile')?.value || ''}
                    onChange={(e) => handleTenantProfileChange(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                >
                    <option value="">Sin preferencia (Mixto)</option>
                    <option value="solo_mujeres">Solo Mujeres</option>
                    <option value="solo_hombres">Solo Hombres</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                    Indica si prefieres inquilinos de un género específico
                </p>
            </div>
        </div>
    );
};

export default RoomSpecificFields;
