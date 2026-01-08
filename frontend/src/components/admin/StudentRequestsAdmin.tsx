import React, { useState, useEffect } from 'react';
import { StudentRequest } from '../../types';
import { api } from '../../services/api';
import {
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    X,
    MapPin,
    DollarSign,
    Home,
    Calendar,
    User,
    Building2,
    FileText
} from 'lucide-react';
import { mockAmenities } from '../../data/mockData';

const StudentRequestsAdmin: React.FC = () => {
    const [requests, setRequests] = useState<StudentRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<StudentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [filters, setFilters] = useState({
        status: 'all' as 'all' | 'open' | 'closed',
        city: '',
        budgetMin: '',
        budgetMax: '',
        propertyType: '',
        search: ''
    });

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [requests, filters]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await api.getStudentRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error loading student requests:', error);
        }
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...requests];

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(r => r.status === filters.status);
        }

        // City filter
        if (filters.city) {
            filtered = filtered.filter(r =>
                r.city?.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        // Budget filter
        if (filters.budgetMin) {
            filtered = filtered.filter(r => r.budgetMax >= parseFloat(filters.budgetMin));
        }
        if (filters.budgetMax) {
            filtered = filtered.filter(r => r.budgetMax <= parseFloat(filters.budgetMax));
        }

        // Property type filter
        if (filters.propertyType) {
            filtered = filtered.filter(r => r.propertyTypeDesired === filters.propertyType);
        }

        // Search filter
        if (filters.search) {
            filtered = filtered.filter(r =>
                r.universityTarget?.toLowerCase().includes(filters.search.toLowerCase()) ||
                r.city?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        setFilteredRequests(filtered);
    };

    const handleDelete = async () => {
        if (!selectedRequest) return;

        try {
            await api.deleteStudentRequest(selectedRequest.id);
            setRequests(requests.filter(r => r.id !== selectedRequest.id));
            setShowDeleteModal(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Error al eliminar la solicitud');
        }
    };

    // Statistics
    const stats = {
        total: requests.length,
        open: requests.filter(r => r.status === 'open').length,
        closed: requests.filter(r => r.status === 'closed').length,
        cities: new Set(requests.map(r => r.city)).size
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Solicitudes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Activas</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.open}</p>
                        </div>
                        <FileText className="w-8 h-8 text-emerald-600" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Cerradas</p>
                            <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                        </div>
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Ciudades</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.cities}</p>
                        </div>
                        <MapPin className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilters({ ...filters, status: 'all' })}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${filters.status === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, status: 'open' })}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${filters.status === 'open'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Activas
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, status: 'closed' })}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${filters.status === 'closed'
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Cerradas
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por universidad o ciudad..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Property Type */}
                    <select
                        value={filters.propertyType}
                        onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="pension">Pensión</option>
                        <option value="habitacion">Habitación</option>
                        <option value="apartamento">Apartamento</option>
                        <option value="aparta-estudio">Aparta-estudio</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estudiante
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ciudad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Universidad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Presupuesto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Cargando solicitudes...
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron solicitudes
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-5 h-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">
                                                    Estudiante #{request.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                                <span className="text-sm text-gray-900">{request.city}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Building2 className="w-4 h-4 text-gray-400 mr-1" />
                                                <span className="text-sm text-gray-900">{request.universityTarget}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 text-emerald-600 mr-1" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    ${request.budgetMax.toLocaleString('es-CO')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 capitalize">
                                                {request.propertyTypeDesired}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'open'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {request.status === 'open' ? 'Activa' : 'Cerrada'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Detalle de la Solicitud</h2>
                                <p className="text-sm text-gray-600 mt-1">Información completa</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Student Info */}
                            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-emerald-600" />
                                    Información del Estudiante
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Nombre</p>
                                        <p className="font-medium text-gray-900">{selectedRequest.studentName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{selectedRequest.studentEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Teléfono</p>
                                        <p className="font-medium text-gray-900">{selectedRequest.studentPhone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">WhatsApp</p>
                                        <p className="font-medium text-gray-900">{selectedRequest.studentWhatsapp}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Property Requirements */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <Home className="w-5 h-5 mr-2 text-blue-600" />
                                    Requisitos del Inmueble
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 mb-1">Presupuesto Máximo</p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            ${selectedRequest.budgetMax.toLocaleString('es-CO')}/mes
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 mb-1">Tipo de Inmueble</p>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">
                                            {selectedRequest.propertyTypeDesired}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 mb-1">Fecha de Mudanza</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(selectedRequest.moveInDate).toLocaleDateString('es-CO', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {selectedRequest.contractDuration && (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Duración del Contrato</p>
                                            <p className="font-semibold text-gray-900">
                                                {selectedRequest.contractDuration} meses
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Required Amenities */}
                            {selectedRequest.requiredAmenities && selectedRequest.requiredAmenities.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Comodidades Requeridas</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.requiredAmenities.map((amenityId, idx) => {
                                            const amenity = mockAmenities.find(a => a.id === amenityId);
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium"
                                                >
                                                    {amenity ? amenity.name : amenityId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Deal Breakers */}
                            {selectedRequest.dealBreakers && selectedRequest.dealBreakers.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Restricciones Importantes</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRequest.dealBreakers.map((dealBreaker, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
                                            >
                                                {dealBreaker}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Notes */}
                            {selectedRequest.additionalNotes && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Notas Adicionales</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {selectedRequest.additionalNotes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-red-600" />
                                    Ubicación
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="font-medium text-gray-900">{selectedRequest.city}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentRequestsAdmin;
