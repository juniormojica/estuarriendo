'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams, redirect } from 'next/navigation';
import { ArrowLeft, Building, Server, CheckSquare, Users, Home } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPropertyForEdit, clearCurrentProperty, updateProperty } from '../store/slices/propertiesSlice';
import PropertyEditForm from '../components/forms/PropertyEditForm';
import { useToast } from '../components/ToastProvider';
import ConfirmReviewModal from '../components/ConfirmReviewModal';
import ContainerEditServices from '../components/forms/ContainerEditServices';
import ContainerEditRules from '../components/forms/ContainerEditRules';
import ContainerEditCommonAreas from '../components/forms/ContainerEditCommonAreas';
import UnitManager from '../components/forms/UnitManager';
import LoadingSpinner from '../components/LoadingSpinner';
import { useScrollToTop } from '../hooks/useScrollToTop';

const EditPropertyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const toast = useToast();

    const { currentProperty: property, loading, error } = useAppSelector((state) => state.properties);
    const [activeTab, setActiveTab] = useState<'info' | 'services' | 'rules' | 'areas' | 'units'>('info');

    useScrollToTop([activeTab]);

    const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchPropertyForEdit(id));
        }

        return () => {
            dispatch(clearCurrentProperty());
        };
    }, [dispatch, id]);

    const handleSuccess = () => {
        // Redirigir al panel de propiedades después de un guardado exitoso
        router.push('/dashboard?tab=properties');
    };

    const handleCancel = () => {
        router.back();
    };

    const handleSendToReview = async () => {
        if (!property) return;

        setIsSubmittingRevision(true);
        try {
            // Send a minimal update without skipStatusReset
            // This triggers the backend to change the property status to 'pending'
            const updateData = {
                title: property.title // Basic required string to send
            };

            const resultAction = await dispatch(updateProperty({
                id: property.id.toString(),
                data: updateData as any
            }));

            if (updateProperty.fulfilled.match(resultAction)) {
                toast.success('✅ Propiedad enviada a revisión correctamente');
                router.push('/dashboard?tab=properties');
            } else {
                toast.error('❌ Error al enviar la propiedad a revisión');
            }
        } catch (error) {
            console.error('Error sending to review:', error);
            toast.error('❌ Error al procesar la solicitud');
        } finally {
            setIsSubmittingRevision(false);
            setIsRevisionModalOpen(false);
        }
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
                        onClick={() => router.push('/dashboard')}
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
                        onClick={() => router.push('/dashboard?tab=properties')}
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

                {/* Global Review Button Footer */}
                {property && property.status !== 'pending' && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                        <div className="max-w-5xl w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="text-sm text-gray-600 hidden sm:block">
                                <span className="font-medium text-amber-600">Atención:</span> Recuerda enviar tu propiedad a revisión cuando termines de hacer modificaciones.
                            </div>
                            <button
                                onClick={() => setIsRevisionModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-sm transition-colors"
                            >
                                <CheckSquare className="w-5 h-5" />
                                Enviar a Revisión
                            </button>
                        </div>
                    </div>
                )}
                
                <ConfirmReviewModal
                    isOpen={isRevisionModalOpen}
                    onClose={() => setIsRevisionModalOpen(false)}
                    onConfirm={handleSendToReview}
                    isSaving={isSubmittingRevision}
                    title="¿Enviar a revisión final?"
                    message="Al confirmar, se enviarán todos los cambios guardados de las distintas pestañas para su revisión por parte de un administrador. La propiedad quedará en estado pendiente. ¿Estás seguro de que terminaste de editar?"
                />
            </div>
        </div>
    );
};

export default EditPropertyPage;
