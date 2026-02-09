import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, Edit, Trash2, DollarSign, Bed } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import type { PropertyUnit } from '../types';
import UnitForm from './UnitForm';

interface UnitBuilderProps {
    onNext: (units: Partial<PropertyUnit>[]) => void;
    onBack: () => void;
    initialData?: Partial<PropertyUnit>[];
}

const UnitBuilder: React.FC<UnitBuilderProps> = ({ onNext, onBack, initialData }) => {
    const [units, setUnits] = useState<Partial<PropertyUnit>[]>(initialData || []);
    const { items: amenitiesList } = useAppSelector((state) => state.amenities);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddUnit = () => {
        setEditingIndex(null);
        setShowForm(true);
    };

    const handleEditUnit = (index: number) => {
        setEditingIndex(index);
        setShowForm(true);
    };

    const handleSaveUnit = (unit: Partial<PropertyUnit>) => {
        if (editingIndex !== null) {
            // Edit existing
            setUnits(prev => prev.map((u, i) => i === editingIndex ? unit : u));
        } else {
            // Add new
            setUnits(prev => [...prev, unit]);
        }
        setShowForm(false);
        setEditingIndex(null);
    };

    const handleDeleteUnit = (index: number) => {
        if (confirm('¿Estás seguro de eliminar esta habitación?')) {
            setUnits(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = () => {
        if (units.length === 0) {
            alert('Debes agregar al menos una habitación');
            return;
        }
        onNext(units);
    };

    const formatCurrency = (amount: number = 0) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getAmenityName = (idOrObj: number | string | { name: string }) => {
        if (typeof idOrObj === 'object' && idOrObj !== null && 'name' in idOrObj) {
            return idOrObj.name;
        }
        const id = Number(idOrObj);
        const found = amenitiesList.find(a => a.id === id);
        return found ? found.name : idOrObj;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 6 de 8</span>
                        <span className="text-sm text-gray-500">Habitaciones</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Agrega las Habitaciones
                    </h1>
                    <p className="text-gray-600">
                        Define cada habitación con su precio y características
                    </p>
                </div>

                {/* Units List */}
                {units.length > 0 ? (
                    <div className="space-y-4 mb-6">
                        {units.map((unit, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {unit.title || `Habitación ${index + 1}`}
                                        </h3>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    {formatCurrency(unit.monthlyRent)}/mes
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Bed className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">
                                                    {unit.roomType === 'individual' ? 'Individual' : `Compartida (${unit.bedsInRoom} camas)`}
                                                </span>
                                            </div>

                                            {unit.area && (
                                                <div className="text-sm text-gray-600">
                                                    📐 {unit.area} m²
                                                </div>
                                            )}

                                            {unit.images && unit.images.length > 0 && (
                                                <div className="text-sm text-gray-600">
                                                    🖼️ {unit.images.length} {unit.images.length === 1 ? 'foto' : 'fotos'}
                                                </div>
                                            )}
                                        </div>

                                        {unit.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {unit.description}
                                            </p>
                                        )}

                                        {unit.amenities && unit.amenities.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {unit.amenities.slice(0, 5).map((amenity, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {getAmenityName(amenity)}
                                                    </span>
                                                ))}
                                                {unit.amenities.length > 5 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        +{unit.amenities.length - 5} más
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEditUnit(index)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUnit(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center mb-6">
                        <div className="text-gray-400 mb-4">
                            <Bed className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay habitaciones agregadas
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Comienza agregando la primera habitación de tu propiedad
                        </p>
                    </div>
                )}

                {/* Add Button */}
                <button
                    onClick={handleAddUnit}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Habitación
                </button>

                {/* Summary */}
                {units.length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Total de habitaciones: {units.length}
                                </p>
                                <p className="text-sm text-blue-700">
                                    Precio promedio: {formatCurrency(units.reduce((sum, u) => sum + (u.monthlyRent || 0), 0) / units.length)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-blue-700">
                                    Desde {formatCurrency(Math.min(...units.map(u => u.monthlyRent || 0)))}
                                </p>
                                <p className="text-sm text-blue-700">
                                    Hasta {formatCurrency(Math.max(...units.map(u => u.monthlyRent || 0)))}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Atrás
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={units.length === 0}
                        className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors ${units.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        Siguiente
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Unit Form Modal */}
            {showForm && (
                <UnitForm
                    onSave={handleSaveUnit}
                    onClose={() => {
                        setShowForm(false);
                        setEditingIndex(null);
                    }}
                    initialData={editingIndex !== null ? units[editingIndex] : undefined}
                    unitNumber={units.length + 1}
                />
            )}
        </div>
    );
};

export default UnitBuilder;
