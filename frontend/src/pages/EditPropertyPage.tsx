import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Server, CheckSquare, Users, Home } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPropertyById, clearCurrentProperty } from '../store/slices/propertiesSlice';
import PropertyEditForm from '../components/forms/PropertyEditForm';
import ContainerEditServices from '../components/forms/ContainerEditServices';
import ContainerEditRules from '../components/forms/ContainerEditRules';
import ContainerEditCommonAreas from '../components/forms/ContainerEditCommonAreas';
import UnitManager from '../components/forms/UnitManager';
import LoadingSpinner from '../components/LoadingSpinner';

const EditPropertyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { currentProperty: property, loading, error } = useAppSelector((state) => state.properties);
    const [activeTab, setActiveTab] = useState<'info' | 'services' | 'rules' | 'areas' | 'units'>('info');

    useEffect(() => {
        if (id) {
            dispatch(fetchPropertyById(id));
        }

        return () => {
            dispatch(clearCurrentProperty());
        };
    }, [dispatch, id]);

    const handleSuccess = () => {
        // Redirigir al panel de propiedades después de un guardado exitoso
        navigate('/dashboard?tab=properties');
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (loading || !property) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Determine if it's a container based on its type name or ID.
    // Pensions (2), Apartments (3), Aparta-estudios (4) are containers. Room (1) is not.
    const isContainer = property.type?.name !== 'habitacion';

    const tabs = [
        { id: 'info', label: 'Información Básica', icon: <Building className="w-4 h-4" /> },
    ];

    if (isContainer) {
        tabs.push(
            { id: 'services', label: 'Servicios', icon: <Server className="w-4 h-4" /> },
            { id: 'rules', label: 'Reglas', icon: <CheckSquare className="w-4 h-4" /> },
            { id: 'areas', label: 'Áreas Comunes', icon: <Users className="w-4 h-4" /> },
            { id: 'units', label: 'Habitaciones', icon: <Home className="w-4 h-4" /> }
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard?tab=properties')}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="Volver al panel"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Propiedad</h1>
                        <p className="text-gray-600">{property.title}</p>
                    </div>
                </div>

                {isContainer && (
                    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex overflow-x-auto hide-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors
                                        ${activeTab === tab.id
                                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    {activeTab === 'info' && (
                        <PropertyEditForm
                            property={property}
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    )}

                    {activeTab === 'services' && isContainer && (
                        <ContainerEditServices
                            container={property as any}
                            onSuccess={handleSuccess}
                        />
                    )}

                    {activeTab === 'rules' && isContainer && (
                        <ContainerEditRules
                            container={property as any}
                            onSuccess={handleSuccess}
                        />
                    )}

                    {activeTab === 'areas' && isContainer && (
                        <ContainerEditCommonAreas
                            container={property as any}
                            onSuccess={handleSuccess}
                        />
                    )}

                    {activeTab === 'units' && isContainer && (
                        <UnitManager
                            container={property as any}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditPropertyPage;
