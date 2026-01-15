import { useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Users, Ban, Volume2 } from 'lucide-react';
import type { PropertyRule } from '../types';

interface ContainerRulesProps {
    onNext: (rules: PropertyRule[]) => void;
    onBack: () => void;
    initialData?: PropertyRule[];
}

const ContainerRules: React.FC<ContainerRulesProps> = ({ onNext, onBack, initialData }) => {
    const [rules, setRules] = useState<PropertyRule[]>(initialData || []);

    const ruleOptions = [
        { ruleType: 'curfew' as const, label: 'Hora límite de llegada', icon: <Clock className="w-5 h-5" />, hasValue: true },
        { ruleType: 'noise' as const, label: 'Horario de silencio', icon: <Volume2 className="w-5 h-5" />, hasValue: true },
        { ruleType: 'visits' as const, label: 'Visitas', icon: <Users className="w-5 h-5" />, hasValue: true },
        { ruleType: 'smoking' as const, label: 'Fumar', icon: <Ban className="w-5 h-5" />, hasValue: false },
        { ruleType: 'pets' as const, label: 'Mascotas', icon: <Ban className="w-5 h-5" />, hasValue: false },
    ];

    const toggleRule = (ruleType: PropertyRule['ruleType']) => {
        const exists = rules.find(r => r.ruleType === ruleType);
        if (exists) {
            setRules(rules.filter(r => r.ruleType !== ruleType));
        } else {
            setRules([...rules, { ruleType, isAllowed: true }]);
        }
    };

    const updateRule = (ruleType: PropertyRule['ruleType'], field: keyof PropertyRule, value: any) => {
        setRules(rules.map(r => r.ruleType === ruleType ? { ...r, [field]: value } : r));
    };

    const handleSubmit = () => {
        if (rules.length === 0) {
            alert('Debes seleccionar al menos una regla');
            return;
        }
        onNext(rules);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 4 de 8</span>
                        <span className="text-sm text-gray-500">Reglas de Convivencia</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reglas de Convivencia</h1>
                    <p className="text-gray-600">Define las reglas para una buena convivencia</p>
                </div>

                <div className="space-y-4 mb-6">
                    {ruleOptions.map(option => {
                        const rule = rules.find(r => r.ruleType === option.ruleType);
                        const isSelected = !!rule;

                        return (
                            <div key={option.ruleType} className="bg-white rounded-lg shadow-sm p-6">
                                <label className="flex items-center cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleRule(option.ruleType)}
                                        className="mr-3 w-5 h-5"
                                    />
                                    <div className="flex items-center gap-2 flex-1">
                                        {option.icon}
                                        <span className="font-medium text-lg">{option.label}</span>
                                    </div>
                                </label>

                                {isSelected && (
                                    <div className="ml-8 space-y-3">
                                        {option.hasValue && (
                                            <input
                                                type="text"
                                                placeholder={`Ej: ${option.ruleType === 'curfew' ? '23:00' : option.ruleType === 'noise' ? '22:00 - 07:00' : 'Hasta las 21:00'}`}
                                                value={rule.value || ''}
                                                onChange={(e) => updateRule(option.ruleType, 'value', e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                        )}
                                        {!option.hasValue && (
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        checked={rule.isAllowed === true}
                                                        onChange={() => updateRule(option.ruleType, 'isAllowed', true)}
                                                        className="mr-2"
                                                    />
                                                    <span>Permitido</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        checked={rule.isAllowed === false}
                                                        onChange={() => updateRule(option.ruleType, 'isAllowed', false)}
                                                        className="mr-2"
                                                    />
                                                    <span>No permitido</span>
                                                </label>
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            placeholder="Descripción adicional (opcional)"
                                            value={rule.description || ''}
                                            onChange={(e) => updateRule(option.ruleType, 'description', e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between pt-6">
                    <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50">
                        <ArrowLeft className="w-5 h-5" />
                        Atrás
                    </button>
                    <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Siguiente
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContainerRules;
