import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { StudentRequest } from '../types';
import { Calendar, DollarSign, Home, MapPin, Clock, FileText, CheckCircle } from 'lucide-react';
import { mockAmenities } from '../data/mockData';

const StudentRequestPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
    const [existingRequest, setExistingRequest] = useState<StudentRequest | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        universityTarget: '',
        budgetMax: '',
        propertyTypeDesired: '' as 'pension' | 'habitacion' | 'apartamento' | 'aparta-estudio' | '',
        requiredAmenities: [] as string[],
        moveInDate: '',
        contractDuration: '',
        additionalNotes: ''
    });

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
            setFormData({
                universityTarget: request.universityTarget,
                budgetMax: request.budgetMax.toString(),
                propertyTypeDesired: request.propertyTypeDesired,
                requiredAmenities: request.requiredAmenities,
                moveInDate: request.moveInDate.split('T')[0],
                contractDuration: request.contractDuration?.toString() || '',
                additionalNotes: request.additionalNotes || ''
            });
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setSubmitting(true);

        const requestData = {
            studentId: currentUser.id,
            studentName: currentUser.name,
            studentEmail: currentUser.email,
            studentPhone: currentUser.phone,
            studentWhatsapp: currentUser.whatsapp,
            universityTarget: formData.universityTarget,
            budgetMax: parseFloat(formData.budgetMax),
            propertyTypeDesired: formData.propertyTypeDesired as 'pension' | 'habitacion' | 'apartamento' | 'aparta-estudio',
            requiredAmenities: formData.requiredAmenities,
            moveInDate: formData.moveInDate,
            contractDuration: formData.contractDuration ? parseInt(formData.contractDuration) : undefined,
            additionalNotes: formData.additionalNotes
        };

        if (existingRequest && isEditing) {
            const success = await api.updateStudentRequest(existingRequest.id, requestData);
            if (success) {
                await loadExistingRequest();
                setIsEditing(false);
                alert('Solicitud actualizada exitosamente');
            }
        } else {
            const result = await api.createStudentRequest(requestData);
            if (result.success) {
                await loadExistingRequest();
                alert(result.message);
            } else {
                alert(result.message);
            }
        }

        setSubmitting(false);
    };

    const handleCloseRequest = async () => {
        if (!existingRequest) return;
        if (!window.confirm('¿Estás seguro de cerrar tu solicitud? Los propietarios ya no podrán verla.')) return;

        const success = await api.deleteStudentRequest(existingRequest.id);
        if (success) {
            setExistingRequest(null);
            setFormData({
                universityTarget: '',
                budgetMax: '',
                propertyTypeDesired: '',
                requiredAmenities: [],
                moveInDate: '',
                contractDuration: '',
                additionalNotes: ''
            });
            alert('Solicitud cerrada exitosamente');
        }
    };

    const toggleAmenity = (amenityId: string) => {
        setFormData(prev => ({
            ...prev,
            requiredAmenities: prev.requiredAmenities.includes(amenityId)
                ? prev.requiredAmenities.filter(id => id !== amenityId)
                : [...prev.requiredAmenities, amenityId]
        }));
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
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <MapPin className="w-5 h-5 mr-2" />
                                        <span className="text-sm font-medium">Universidad/Zona</span>
                                    </div>
                                    <p className="text-gray-900 font-semibold">{existingRequest.universityTarget}</p>
                                </div>

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
                                            return amenity ? (
                                                <span key={amenityId} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                                                    {amenity.name}
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
                </div>
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Universidad o Zona de Interés *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.universityTarget}
                                onChange={(e) => setFormData({ ...formData, universityTarget: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Ej: Universidad Popular del Cesar, Centro de Valledupar"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-2" />
                                    Presupuesto Máximo (COP/mes) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.budgetMax}
                                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="500000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Home className="w-4 h-4 inline mr-2" />
                                    Tipo de Inmueble *
                                </label>
                                <select
                                    required
                                    value={formData.propertyTypeDesired}
                                    onChange={(e) => setFormData({ ...formData, propertyTypeDesired: e.target.value as any })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="habitacion">Habitación</option>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="aparta-estudio">Aparta-estudio</option>
                                    <option value="pension">Pensión</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Fecha de Mudanza *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.moveInDate}
                                    onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Duración del Contrato (meses)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.contractDuration}
                                    onChange={(e) => setFormData({ ...formData, contractDuration: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="6"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Comodidades Requeridas
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {mockAmenities.map(amenity => (
                                    <button
                                        key={amenity.id}
                                        type="button"
                                        onClick={() => toggleAmenity(amenity.id)}
                                        className={`p-3 rounded-lg border-2 transition-all ${formData.requiredAmenities.includes(amenity.id)
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                                            }`}
                                    >
                                        <span className="text-2xl mb-1 block">{amenity.icon}</span>
                                        <span className="text-sm font-medium">{amenity.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Notas Adicionales
                            </label>
                            <textarea
                                value={formData.additionalNotes}
                                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Ej: Prefiero zonas tranquilas, necesito parqueadero, etc."
                            />
                        </div>

                        <div className="flex gap-4">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        loadExistingRequest();
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Guardando...' : existingRequest ? 'Actualizar Solicitud' : 'Publicar Solicitud'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentRequestPage;
