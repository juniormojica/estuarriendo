import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { StudentRequest } from '../types';
import { Search, Filter, MapPin, DollarSign, Home, Lock, Crown } from 'lucide-react';

const OpportunitiesPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
    const [opportunities, setOpportunities] = useState<StudentRequest[]>([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState<StudentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<StudentRequest | null>(null);

    const [filters, setFilters] = useState({
        universityTarget: '',
        budgetMax: '',
        propertyTypeDesired: ''
    });

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (currentUser.userType !== 'owner') {
            navigate('/');
            return;
        }

        loadOpportunities();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [opportunities, filters]);

    const loadOpportunities = async () => {
        setLoading(true);
        const requests = await api.getStudentRequests();
        setOpportunities(requests);
        setLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...opportunities];

        if (filters.universityTarget) {
            filtered = filtered.filter(opp =>
                opp.universityTarget.toLowerCase().includes(filters.universityTarget.toLowerCase())
            );
        }

        if (filters.budgetMax) {
            filtered = filtered.filter(opp => opp.budgetMax <= parseFloat(filters.budgetMax));
        }

        if (filters.propertyTypeDesired) {
            filtered = filtered.filter(opp => opp.propertyTypeDesired === filters.propertyTypeDesired);
        }

        setFilteredOpportunities(filtered);
    };

    const handleContactClick = (opportunity: StudentRequest) => {
        if (currentUser?.plan !== 'premium') {
            setSelectedOpportunity(opportunity);
            setShowPremiumModal(true);
        } else {
            // Show contact info
            alert(`Contacto:\nNombre: ${opportunity.studentName}\nEmail: ${opportunity.studentEmail}\nTeléfono: ${opportunity.studentPhone}\nWhatsApp: ${opportunity.studentWhatsapp}`);
        }
    };

    const handleUpgradeToPremium = () => {
        navigate('/perfil');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando oportunidades...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Oportunidades</h1>
                    <p className="text-gray-600">Estudiantes buscando inmuebles en tu zona</p>
                </div>

                {/* Premium Banner for Free Users */}
                {currentUser?.plan !== 'premium' && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-6 mb-8 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Crown className="w-12 h-12 mr-4" />
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Actualiza a Premium</h3>
                                    <p className="text-yellow-100">Accede a la información de contacto de los estudiantes</p>
                                </div>
                            </div>
                            <button
                                onClick={handleUpgradeToPremium}
                                className="px-6 py-3 bg-white text-yellow-600 rounded-lg hover:bg-yellow-50 font-bold transition-colors"
                            >
                                Actualizar Ahora
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Filter className="w-5 h-5 text-gray-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Universidad/Zona
                            </label>
                            <input
                                type="text"
                                value={filters.universityTarget}
                                onChange={(e) => setFilters({ ...filters, universityTarget: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Buscar por zona..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Presupuesto Máximo
                            </label>
                            <input
                                type="number"
                                value={filters.budgetMax}
                                onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Ej: 500000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Home className="w-4 h-4 inline mr-1" />
                                Tipo de Inmueble
                            </label>
                            <select
                                value={filters.propertyTypeDesired}
                                onChange={(e) => setFilters({ ...filters, propertyTypeDesired: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Todos</option>
                                <option value="habitacion">Habitación</option>
                                <option value="apartamento">Apartamento</option>
                                <option value="aparta-estudio">Aparta-estudio</option>
                                <option value="pension">Pensión</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'oportunidad encontrada' : 'oportunidades encontradas'}
                    </p>
                </div>

                {/* Opportunities Grid */}
                {filteredOpportunities.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay oportunidades disponibles</h3>
                        <p className="text-gray-600">Intenta ajustar los filtros o vuelve más tarde</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOpportunities.map(opportunity => (
                            <div key={opportunity.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                {currentUser?.plan === 'premium' ? opportunity.studentName : 'Estudiante'}
                                            </h3>
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {opportunity.universityTarget}
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                            Activa
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Presupuesto:</span>
                                            <span className="font-semibold text-gray-900">${opportunity.budgetMax.toLocaleString('es-CO')}/mes</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Tipo:</span>
                                            <span className="font-semibold text-gray-900 capitalize">{opportunity.propertyTypeDesired}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Mudanza:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(opportunity.moveInDate).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        {opportunity.contractDuration && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Duración:</span>
                                                <span className="font-semibold text-gray-900">{opportunity.contractDuration} meses</span>
                                            </div>
                                        )}
                                    </div>

                                    {opportunity.requiredAmenities.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 mb-2">Requiere:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {opportunity.requiredAmenities.slice(0, 3).map((amenityId, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        {amenityId}
                                                    </span>
                                                ))}
                                                {opportunity.requiredAmenities.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        +{opportunity.requiredAmenities.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleContactClick(opportunity)}
                                        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${currentUser?.plan === 'premium'
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {currentUser?.plan === 'premium' ? (
                                            <>Ver Contacto</>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4 mr-2" />
                                                Actualiza a Premium
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Premium Modal */}
                {showPremiumModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-scaleIn">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Crown className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Actualiza a Premium</h2>
                                <p className="text-gray-600 mb-6">
                                    Accede a la información de contacto de los estudiantes y envía ofertas directamente
                                </p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <h3 className="font-semibold text-gray-900 mb-2">Beneficios Premium:</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2"></div>
                                            Ver información de contacto completa
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2"></div>
                                            Contactar estudiantes directamente
                                        </li>
                                        <li className="flex items-center">
                                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2"></div>
                                            Destacar tus propiedades
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPremiumModal(false)}
                                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpgradeToPremium}
                                        className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
                                    >
                                        Actualizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpportunitiesPage;
