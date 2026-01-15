import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { CommonArea } from '../types';
import containerService from '../services/containerService';

interface ContainerCommonAreasProps {
    onNext: (commonAreaIds: number[]) => void;
    onBack: () => void;
    initialData?: number[];
}

const ContainerCommonAreas: React.FC<ContainerCommonAreasProps> = ({ onNext, onBack, initialData }) => {
    const [selectedIds, setSelectedIds] = useState<number[]>(initialData || []);
    const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
    const [loading, setLoading] = useState(true);

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
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(areaId => areaId !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (selectedIds.length === 0) {
            alert('Debes seleccionar al menos un área común');
            return;
        }
        onNext(selectedIds);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Paso 5 de 8</span>
                        <span className="text-sm text-gray-500">Áreas Comunes</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62.5%' }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Áreas Comunes</h1>
                    <p className="text-gray-600">Selecciona los espacios compartidos disponibles</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {commonAreas.map(area => (
                            <label
                                key={area.id}
                                className={`
                  flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all
                  ${selectedIds.includes(area.id)
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:border-blue-300'
                                    }
                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(area.id)}
                                    onChange={() => toggleArea(area.id)}
                                    className="sr-only"
                                />
                                <div className="text-4xl mb-2">{area.icon}</div>
                                <div className="text-sm font-medium text-center text-gray-900">
                                    {area.name}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                        💡 <strong>Tip:</strong> Las áreas comunes ayudan a los estudiantes a entender qué espacios compartirán con otros inquilinos.
                    </p>
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

export default ContainerCommonAreas;
