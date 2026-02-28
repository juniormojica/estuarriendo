import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import type { PropertyContainer, PropertyUnit } from '../../types';
import containerService from '../../services/containerService';
import UnitEditForm from './UnitEditForm';
import { useToast } from '../ToastProvider';
import ConfirmModal from '../ConfirmModal';

interface UnitManagerProps {
    container: PropertyContainer;
    onUpdate?: (updatedContainer: PropertyContainer) => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

const UnitManager: React.FC<UnitManagerProps> = ({ container, onUpdate }) => {
    const toast = useToast();
    const [units, setUnits] = useState<PropertyUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Partial<PropertyUnit> | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        loadUnits();
    }, [container.id]);

    const loadUnits = async () => {
        if (!container.id) return;
        setIsLoading(true);
        try {
            const data = await containerService.getContainerUnits(container.id);
            setUnits(data);
        } catch (error) {
            console.error('Error loading units:', error);
            toast.error('Error al cargar las habitaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUnit = () => {
        setSelectedUnit(null);
        setIsEditing(true);
    };

    const handleEditUnit = (unit: Partial<PropertyUnit>) => {
        setSelectedUnit(unit);
        setIsEditing(true);
    };

    const handleSaveUnit = async (data: any, imageUrls: string[]) => {
        if (!container.id) return;

        try {
            const unitPayload = {
                ...data,
                images: imageUrls.map((url, i) => ({ url, isPrimary: i === 0 })),
                currency: 'COP' // Fallback to 'COP'
            };

            if (selectedUnit?.id) {
                // Update
                await containerService.updateUnit(selectedUnit.id, unitPayload);
                toast.success('Habitación actualizada correctamente');
            } else {
                // Create
                await containerService.createUnit(container.id, unitPayload);
                toast.success('Habitación creada correctamente');
            }

            setIsEditing(false);
            loadUnits();

            // Optionally update container state if needed (e.g. to reflect new counts)
            if (onUpdate) {
                // Notify parent if needed
            }
        } catch (error: any) {
            console.error('Error saving unit:', error);
            toast.error(error.response?.data?.message || 'Error al guardar la habitación');
            throw error; // Rethrow so the form loading state stops
        }
    };

    const handleDeleteClick = (id: number) => {
        setIsDeleting(id);
    };

    const handleConfirmDelete = async () => {
        if (!isDeleting) return;

        try {
            await containerService.deleteUnit(isDeleting);
            toast.success('Habitación eliminada');
            setUnits(prev => prev.filter(u => u.id !== isDeleting));
            setIsDeleting(null);
        } catch (error: any) {
            console.error('Error deleting unit:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar la habitación');
            setIsDeleting(null);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Cargando habitaciones...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Habitaciones ({units.length})</h3>
                <button
                    onClick={handleAddUnit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Habitación
                </button>
            </div>

            {units.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No hay habitaciones agregadas</p>
                    <button
                        onClick={handleAddUnit}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Comienza agregando una habitación
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {units.map((unit) => {
                        const isUnitRented = unit.isRented || (unit.status as string) === 'rented';
                        return (
                            <div key={unit.id} className="border rounded-xl p-4 flex flex-col sm:flex-row gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-full sm:w-32 h-32 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                    {unit.images && unit.images.length > 0 ? (
                                        <img
                                            src={typeof unit.images[0] === 'string' ? unit.images[0] : unit.images[0].url}
                                            alt={unit.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <Home className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs">Sin imagen</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isUnitRented
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {isUnitRented ? 'Arrendada' : 'Disponible'}
                                            </span>
                                        </div>
                                        <div className="text-blue-600 font-bold mt-1">
                                            {formatCurrency(unit.monthlyRent)} <span className="text-sm font-normal text-gray-500">/mes</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                            {unit.roomType === 'shared' ? 'Compartida' : 'Individual'} • {unit.bedsInRoom} camas
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleEditUnit(unit)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            <Edit className="w-4 h-4" /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(unit.id!)}
                                            className="flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isEditing && (
                <UnitEditForm
                    unit={selectedUnit}
                    containerId={container.id!}
                    onSave={handleSaveUnit}
                    onCancel={() => setIsEditing(false)}
                />
            )}

            <ConfirmModal
                isOpen={isDeleting !== null}
                title="Eliminar Habitación"
                message="¿Estás seguro de que deseas eliminar esta habitación? Esta acción no se puede deshacer y eliminará todos los datos asociados."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onClose={() => setIsDeleting(null)}
            />
        </div>
    );
};

export default UnitManager;
