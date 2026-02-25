import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Users, Ban, Volume2, Save } from 'lucide-react';
import { containerRulesSchema, type ContainerRulesData } from '../../lib/schemas/container.schema';
import type { PropertyRule, PropertyContainer } from '../../types';
import containerService from '../../services/containerService';
import { useToast } from '../ToastProvider';

interface ContainerEditRulesProps {
    container: PropertyContainer;
    onUpdate?: (updatedContainer: PropertyContainer) => void;
}

interface RuleOption {
    ruleType: PropertyRule['ruleType'];
    label: string;
    icon: React.ReactNode;
    hasValue: boolean;
    placeholder?: string;
}

const ContainerEditRules: React.FC<ContainerEditRulesProps> = ({ container, onUpdate }) => {
    const toast = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ContainerRulesData>({
        resolver: zodResolver(containerRulesSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            rules: container.rules || [],
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

    const onSubmit = async (data: ContainerRulesData) => {
        if (!container.id) return;

        setIsSaving(true);
        try {
            const updated = await containerService.updateContainer(container.id, {
                rules: data.rules as PropertyRule[]
            });
            toast.success('Reglas actualizadas correctamente');
            if (onUpdate) {
                onUpdate(updated);
            }
        } catch (error: any) {
            console.error('Error updating rules:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar las reglas');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit as any)} noValidate className="space-y-4">
            {ruleOptions.map(option => {
                const isSelected = isRuleSelected(option.ruleType);
                const ruleIndex = getRuleIndex(option.ruleType);
                const rule = ruleIndex >= 0 ? rules[ruleIndex] : null;

                return (
                    <div key={option.ruleType} className="bg-white rounded-lg shadow-sm border p-6">
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

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t mt-6">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Reglas'}
                </button>
            </div>
        </form>
    );
};

export default ContainerEditRules;
