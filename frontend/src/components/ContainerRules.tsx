import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Clock, Users, Ban, Volume2 } from 'lucide-react';
import { containerRulesSchema, type ContainerRulesData } from '../lib/schemas/container.schema';
import type { PropertyRule } from '../types';

interface ContainerRulesProps {
    onNext: (rules: PropertyRule[]) => void;
    onBack: () => void;
    initialData?: PropertyRule[];
}

interface RuleOption {
    ruleType: PropertyRule['ruleType'];
    label: string;
    icon: React.ReactNode;
    hasValue: boolean;
    placeholder?: string;
}

const ContainerRules: React.FC<ContainerRulesProps> = ({ onNext, onBack, initialData }) => {
    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ContainerRulesData>({
        resolver: zodResolver(containerRulesSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            rules: initialData || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'rules',
    });

    const ruleOptions: RuleOption[] = [
        {
            ruleType: 'curfew',
            label: 'Hora límite de llegada',
            icon: <Clock className="w-5 h-5" />,
            hasValue: true,
            placeholder: 'Ej: 23:00'
        },
        {
            ruleType: 'noise',
            label: 'Horario de silencio',
            icon: <Volume2 className="w-5 h-5" />,
            hasValue: true,
            placeholder: 'Ej: 22:00 - 07:00'
        },
        {
            ruleType: 'visits',
            label: 'Visitas',
            icon: <Users className="w-5 h-5" />,
            hasValue: true,
            placeholder: 'Ej: Hasta las 21:00'
        },
        {
            ruleType: 'smoking',
            label: 'Fumar',
            icon: <Ban className="w-5 h-5" />,
            hasValue: false
        },
        {
            ruleType: 'pets',
            label: 'Mascotas',
            icon: <Ban className="w-5 h-5" />,
            hasValue: false
        },
    ];

    const rules = watch('rules');

    const toggleRule = (ruleType: PropertyRule['ruleType']) => {
        const existingIndex = fields.findIndex(field => field.ruleType === ruleType);
        if (existingIndex >= 0) {
            remove(existingIndex);
        } else {
            append({ ruleType, isAllowed: true } as any);
        }
    };

    const isRuleSelected = (ruleType: PropertyRule['ruleType']) => {
        return fields.some(field => field.ruleType === ruleType);
    };

    const getRuleIndex = (ruleType: PropertyRule['ruleType']) => {
        return fields.findIndex(field => field.ruleType === ruleType);
    };

    const onSubmit = (data: ContainerRulesData) => {
        onNext(data.rules as PropertyRule[]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 4 de 5</span>
                        <span className="text-sm text-gray-500">Reglas de Convivencia</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reglas de Convivencia</h1>
                    <p className="text-gray-600">Define las reglas para una buena convivencia</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit as any)} noValidate className="space-y-4 mb-6">
                    {ruleOptions.map(option => {
                        const isSelected = isRuleSelected(option.ruleType);
                        const ruleIndex = getRuleIndex(option.ruleType);
                        const rule = ruleIndex >= 0 ? rules[ruleIndex] : null;

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

                                {isSelected && rule && ruleIndex >= 0 && (
                                    <div className="ml-8 space-y-3">
                                        {/* Hidden field for ruleType */}
                                        <input type="hidden" {...register(`rules.${ruleIndex}.ruleType`)} />

                                        {option.hasValue && (
                                            <input
                                                type="text"
                                                placeholder={option.placeholder}
                                                {...register(`rules.${ruleIndex}.value`)}
                                                className="w-full px-4 py-2 border rounded-lg"
                                            />
                                        )}

                                        {!option.hasValue && (
                                            <Controller
                                                name={`rules.${ruleIndex}.isAllowed`}
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                checked={field.value === true}
                                                                onChange={() => field.onChange(true)}
                                                                className="mr-2"
                                                            />
                                                            <span>Permitido</span>
                                                        </label>
                                                        <label className="flex items-center">
                                                            <input
                                                                type="radio"
                                                                checked={field.value === false}
                                                                onChange={() => field.onChange(false)}
                                                                className="mr-2"
                                                            />
                                                            <span>No permitido</span>
                                                        </label>
                                                    </div>
                                                )}
                                            />
                                        )}

                                        <input
                                            type="text"
                                            placeholder="Descripción adicional (opcional)"
                                            {...register(`rules.${ruleIndex}.description`)}
                                            className="w-full px-4 py-2 border rounded-lg text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Error message */}
                    {errors.rules && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600" role="alert">
                                {errors.rules.message || 'Debes seleccionar al menos una regla'}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 min-h-[44px] border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Atrás
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Guardando...' : 'Siguiente'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContainerRules;
