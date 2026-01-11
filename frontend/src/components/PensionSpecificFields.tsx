import React from 'react';
import { PropertyService, PropertyRule, Amenity } from '../types';

interface PensionSpecificFieldsProps {
    services: PropertyService[];
    rules: PropertyRule[];
    selectedAmenities: number[];
    onServiceChange: (service: PropertyService) => void;
    onRuleChange: (rule: PropertyRule) => void;
    onAmenityToggle: (amenityId: number) => void;
    availableAmenities: Amenity[];
}

const PensionSpecificFields: React.FC<PensionSpecificFieldsProps> = ({
    services,
    rules,
    selectedAmenities,
    onServiceChange,
    onRuleChange,
    onAmenityToggle,
    availableAmenities
}) => {
    // Filter amenities specific to pension
    const pensionAmenities = availableAmenities.filter(a =>
        a.category === 'pension' ||
        ['sala_estudio', 'comedor_comun', 'wifi'].includes(a.slug || '')
    );

    const getServiceValue = (serviceType: PropertyService['serviceType']) => {
        return services.find(s => s.serviceType === serviceType);
    };

    const getRuleValue = (ruleType: PropertyRule['ruleType']) => {
        return rules.find(r => r.ruleType === ruleType);
    };

    const handleServiceToggle = (serviceType: PropertyService['serviceType']) => {
        const existing = getServiceValue(serviceType);
        onServiceChange({
            serviceType,
            isIncluded: !existing?.isIncluded
        });
    };

    const handleCurfewChange = (value: string) => {
        onRuleChange({
            ruleType: 'curfew',
            isAllowed: !!value,
            value: value || undefined
        });
    };

    return (
        <div className="space-y-6">
            {/* Sección: Servicios Incluidos - Alimentación */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Alimentación Incluida
                </h3>
                <div className="space-y-3">
                    {[
                        { type: 'breakfast' as const, label: 'Desayuno', icon: '🌅' },
                        { type: 'lunch' as const, label: 'Almuerzo', icon: '🍽️' },
                        { type: 'dinner' as const, label: 'Cena', icon: '🌙' }
                    ].map(({ type, label, icon }) => (
                        <label
                            key={type}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{icon}</span>
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm ${getServiceValue(type)?.isIncluded ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {getServiceValue(type)?.isIncluded ? 'Incluido' : 'No incluido'}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={getServiceValue(type)?.isIncluded || false}
                                    onChange={() => handleServiceToggle(type)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sección: Otros Servicios */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Otros Servicios
                </h3>
                <div className="space-y-3">
                    {[
                        { type: 'housekeeping' as const, label: 'Aseo a la habitación', icon: '🧹' },
                        { type: 'laundry' as const, label: 'Lavandería', icon: '👕' },
                        { type: 'utilities' as const, label: 'Servicios públicos incluidos', icon: '💡' }
                    ].map(({ type, label, icon }) => (
                        <label
                            key={type}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{icon}</span>
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-sm ${getServiceValue(type)?.isIncluded ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {getServiceValue(type)?.isIncluded ? 'Incluido' : 'No incluido'}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={getServiceValue(type)?.isIncluded || false}
                                    onChange={() => handleServiceToggle(type)}
                                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Sección: Horarios */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Horarios
                </h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Hay hora límite de llegada?
                    </label>
                    <input
                        type="time"
                        value={getRuleValue('curfew')?.value || ''}
                        onChange={(e) => handleCurfewChange(e.target.value)}
                        className="w-full min-h-[44px] px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Deja vacío si no hay restricción de horario
                    </p>
                </div>
            </div>

            {/* Sección: Zonas Comunes */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Zonas Comunes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pensionAmenities.map(amenity => (
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
                {pensionAmenities.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                        No hay amenidades específicas de pensión disponibles
                    </p>
                )}
            </div>
        </div>
    );
};

export default PensionSpecificFields;
