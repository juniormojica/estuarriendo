import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { containerCommonAreasSchema, type ContainerCommonAreasData } from '../../lib/schemas/container.schema';
import type { CommonArea, PropertyContainer } from '../../types';
import containerService from '../../services/containerService';
import { iconMap } from '../../lib/icons';
import { useToast } from '../ToastProvider';

interface ContainerEditCommonAreasProps {
    container: PropertyContainer;
    onUpdate?: (updatedContainer: PropertyContainer) => void;
}

const ContainerEditCommonAreas: React.FC<ContainerEditCommonAreasProps> = ({ container, onUpdate }) => {
    const toast = useToast();
    const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Filter to get only common area strings that map to IDs if needed, but the container has `commonAreas` array with objects
    const initialAreaIds = container.commonAreas?.map(area => (area as any).id || area) || [];

    const {
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ContainerCommonAreasData>({
        resolver: zodResolver(containerCommonAreasSchema) as any,
        mode: 'onBlur',
        defaultValues: {
            commonAreaIds: initialAreaIds,
        },
    });

    const selectedIds = watch('commonAreaIds');

    useEffect(() => {
        loadCommonAreas();
    }, []);

    const loadCommonAreas = async () => {
        try {
            const areas = await containerService.getCommonAreas();
            setCommonAreas(areas);
        } catch (error) {
            console.error('Error loading common areas:', error);
            // Fallback data
            setCommonAreas([
                { id: 1, name: 'Cocina compartida', icon: '🍳' },
                { id: 2, name: 'Sala de estar', icon: '🛋️' },
                { id: 3, name: 'Comedor', icon: '🍽️' },
                { id: 4, name: 'Lavandería', icon: '🧺' },
                { id: 5, name: 'Estacionamiento', icon: '🚗' },
                { id: 6, name: 'Terraza', icon: '🌿' },
                { id: 7, name: 'Zona de estudio', icon: '📚' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const toggleArea = (id: number) => {
        const currentIds = selectedIds || [];
        const newIds = currentIds.includes(id)
            ? currentIds.filter(areaId => areaId !== id)
            : [...currentIds, id];
        setValue('commonAreaIds', newIds, { shouldValidate: true });
    };

    const onSubmit = async (data: ContainerCommonAreasData) => {
        if (!container.id) return;

        setIsSaving(true);
        try {
            const updated = await containerService.updateContainer(container.id, {
                commonAreaIds: data.commonAreaIds
            });
            toast.success('Áreas comunes actualizadas correctamente');
            if (onUpdate) {
                onUpdate(updated);
            }
        } catch (error: any) {
            console.error('Error updating common areas:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar las áreas comunes');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8">Cargando...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {commonAreas.map(area => {
                        const iconKey = area.icon as string || 'default';
                        const IconComponent = iconMap[iconKey as keyof typeof iconMap] || iconMap.default;
                        return (
                            <label
                                key={area.id}
                                className={`
                                flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all
                                ${selectedIds?.includes(area.id)
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }
                            `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds?.includes(area.id) || false}
                                    onChange={() => toggleArea(area.id)}
                                    className="sr-only"
                                />
                                <div className="text-4xl mb-2 text-blue-500">
                                    <IconComponent className="w-8 h-8" />
                                </div>
                                <div className="text-sm font-medium text-center text-gray-900">
                                    {area.name}
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Error message */}
            {errors.commonAreaIds && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600" role="alert">
                        {errors.commonAreaIds.message || 'Debes seleccionar al menos un área común'}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Áreas Comunes'}
                </button>
            </div>
        </form>
    );
};

export default ContainerEditCommonAreas;
