import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { StudentRequest } from '../types';
import { Calendar, DollarSign, Home, MapPin, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { mockAmenities } from '../data/mockData';
import { iconMap } from '../lib/icons';
import StudentRequestFormSteps from '../components/StudentRequestFormSteps';
import ConfirmModal from '../components/ConfirmModal';

const dealBreakerOptions = [
    { id: 'no-pets', name: 'Alérgico a mascotas', icon: '🐕' },
    { id: 'no-smoking', name: 'No fumadores', icon: '🚭' },
    { id: 'no-noise', name: 'Ambiente tranquilo', icon: '🔇' },
    { id: 'no-parties', name: 'Sin fiestas', icon: '🎉' },
    { id: 'vegetarian-friendly', name: 'Preferencia vegetariana/vegana', icon: '🥗' },
    { id: 'lgbtq-friendly', name: 'Ambiente LGBTQ+ friendly', icon: '🏳️‍🌈' },
    { id: 'female-only', name: 'Solo mujeres', icon: '👩' },
    { id: 'male-only', name: 'Solo hombres', icon: '👨' },
];

const StudentRequestPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();
    const [existingRequest, setExistingRequest] = useState<StudentRequest | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'warning' | 'danger';
        onConfirm?: () => void;
    }>({ title: '', message: '', type: 'success' });

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (currentUser.userType !== 'tenant') {
            navigate('/');
            return;
        }

        loadExistingRequest();
    }, []);

    const loadExistingRequest = async () => {
        if (!currentUser) return;

        setLoading(true);
        const request = await api.getMyStudentRequest(currentUser.id);
        if (request) {
            setExistingRequest(request);
        }
        setLoading(false);
    };

    const handleSubmit = async (formData: any) => {
        if (!currentUser) return;

        setSubmitting(true);

        const requestData = {
            studentId: currentUser.id,
            studentName: currentUser.name,
            studentEmail: currentUser.email,
            studentPhone: currentUser.phone,
            studentWhatsapp: currentUser.whatsapp,
            city: formData.city,
            universityTarget: formData.universityTarget,
            budgetMax: parseFloat(formData.budgetMax),
            propertyTypeDesired: formData.propertyTypeDesired as 'pension' | 'habitacion' | 'apartamento' | 'aparta-estudio',
            requiredAmenities: formData.requiredAmenities,
            dealBreakers: formData.dealBreakers,
            moveInDate: formData.moveInDate,
            contractDuration: formData.contractDuration ? parseInt(formData.contractDuration) : undefined,
            additionalNotes: formData.additionalNotes
        };

        if (existingRequest && isEditing) {
            const success = await api.updateStudentRequest(existingRequest.id, requestData);
            if (success) {
                await loadExistingRequest();
                setIsEditing(false);
                setModalConfig({
                    title: 'Solicitud Actualizada',
                    message: 'Tu solicitud ha sido actualizada exitosamente.',
                    type: 'success'
                });
                setShowModal(true);
            }
        } else {
            const result = await api.createStudentRequest(requestData);
            if (result.success) {
                await loadExistingRequest();
                setModalConfig({
                    title: 'Solicitud Creada',
                    message: result.message,
                    type: 'success'
                });
                setShowModal(true);
            } else {
                setModalConfig({
                    title: 'Error',
                    message: result.message,
                    type: 'danger'
                });
                setShowModal(true);
            }
        }

        setSubmitting(false);
    };

    const handleCloseRequest = () => {
        if (!existingRequest) return;
        setModalConfig({
            title: 'Cerrar Solicitud',
            message: '¿Estás seguro de cerrar tu solicitud? Los propietarios ya no podrán verla.',
            type: 'warning',
            onConfirm: async () => {
                const success = await api.deleteStudentRequest(existingRequest.id);
                if (success) {
                    setExistingRequest(null);
                    setModalConfig({
                        title: 'Solicitud Cerrada',
                        message: 'Tu solicitud ha sido cerrada exitosamente.',
                        type: 'success'
                    });
                    setShowModal(true);
                }
            }
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // View mode - showing existing request
    if (existingRequest && !isEditing) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <CheckCircle className="w-8 h-8 text-emerald-600 mr-3" />
                                Tu Solicitud Activa
                            </h1>
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                Activa
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Ciudad</span>
                                </div>
                                <p className="text-gray-900 font-semibold">{existingRequest.city}</p>
                            </div>

                            {existingRequest.universityTarget && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        <span className="text-sm font-medium">Universidad/Zona</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{existingRequest.universityTarget}</p>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center text-gray-600 mb-2">
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Presupuesto Máximo</span>
                                </div>
                                <p className="text-gray-900 font-semibold">${existingRequest.budgetMax.toLocaleString('es-CO')}/mes</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center text-gray-600 mb-2">
                                    <Home className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Tipo de Inmueble</span>
                                </div>
                                <p className="text-gray-900 font-semibold capitalize">{existingRequest.propertyTypeDesired}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center text-gray-600 mb-2">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Fecha de Mudanza</span>
                                </div>
                                <p className="text-gray-900 font-semibold">
                                    {new Date(existingRequest.moveInDate).toLocaleDateString('es-CO')}
                                </p>
                            </div>

                            {existingRequest.contractDuration && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <Clock className="w-5 h-5 mr-2" />
                                        <span className="text-sm font-medium">Duración del Contrato</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{existingRequest.contractDuration} meses</p>
                                </div>
                            )}
                        </div>

                        {existingRequest.requiredAmenities.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-600 mb-3">Comodidades Requeridas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {existingRequest.requiredAmenities.map(amenityId => {
                                        const amenity = mockAmenities.find(a => a.id === amenityId);
                                        const IconComponent = amenity ? (iconMap[amenity.icon] || iconMap.default) : null;
                                        return amenity ? (
                                            <span key={amenityId} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center">
                                                <span className="mr-1">
                                                    {IconComponent && <IconComponent size={14} />}
                                                </span>
                                                {amenity.name}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {existingRequest.dealBreakers && existingRequest.dealBreakers.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Preferencias Personales
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {existingRequest.dealBreakers.map(dealBreakerId => {
                                        const dealBreaker = dealBreakerOptions.find(d => d.id === dealBreakerId);
                                        return dealBreaker ? (
                                            <span key={dealBreakerId} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                                                <span className="mr-1">{dealBreaker.icon}</span>
                                                {dealBreaker.name}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {existingRequest.additionalNotes && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center text-gray-600 mb-2">
                                    <FileText className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Notas Adicionales</span>
                                </div>
                                <p className="text-gray-700">{existingRequest.additionalNotes}</p>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm">
                                <strong>Nota:</strong> Los propietarios con plan Premium pueden ver tu información de contacto y enviarte ofertas directamente.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                        >
                            Editar Solicitud
                        </button>
                        <button
                            onClick={handleCloseRequest}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                        >
                            Cerrar Solicitud
                        </button>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={modalConfig.onConfirm || (() => { })}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    type={modalConfig.type}
                />
            </div>
        );
    }

    // Form mode - creating or editing
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {existingRequest ? 'Editar Solicitud' : 'Busco Inmueble'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Completa el formulario para que los propietarios puedan encontrarte
                    </p>

                    <StudentRequestFormSteps
                        initialData={existingRequest ? {
                            city: existingRequest.city,
                            universityTarget: existingRequest.universityTarget,
                            budgetMax: existingRequest.budgetMax.toString(),
                            propertyTypeDesired: existingRequest.propertyTypeDesired,
                            requiredAmenities: existingRequest.requiredAmenities,
                            dealBreakers: existingRequest.dealBreakers || [],
                            moveInDate: existingRequest.moveInDate.split('T')[0],
                            contractDuration: existingRequest.contractDuration?.toString() || '',
                            additionalNotes: existingRequest.additionalNotes || ''
                        } : undefined}
                        onSubmit={handleSubmit}
                        onCancel={isEditing ? () => {
                            setIsEditing(false);
                            loadExistingRequest();
                        } : undefined}
                        submitting={submitting}
                        isEditing={isEditing}
                    />
                </div>

                <ConfirmModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={modalConfig.onConfirm || (() => { })}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    type={modalConfig.type}
                />
            </div>
        </div>
    );
};

export default StudentRequestPage;
