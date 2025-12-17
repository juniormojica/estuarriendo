import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { StudentRequest } from '../types';
import { Search, Filter, MapPin, DollarSign, Home, Lock, Crown, X, Phone, Mail, MessageCircle, User } from 'lucide-react';
import { mockAmenities } from '../data/mockData';

const OpportunitiesPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(authService.getStoredUser());
    const [opportunities, setOpportunities] = useState<StudentRequest[]>([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState<StudentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<StudentRequest | null>(null);
    const [contactOpportunity, setContactOpportunity] = useState<StudentRequest | null>(null);
    const [detailOpportunity, setDetailOpportunity] = useState<StudentRequest | null>(null);

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

        // Update last viewed timestamp
        localStorage.setItem(
            `estuarriendo_opportunities_last_viewed_${currentUser.id}`,
            Date.now().toString()
        );

        loadOpportunities();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [opportunities, filters]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowContactModal(false);
                setShowPremiumModal(false);
                setShowDetailModal(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

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
            setContactOpportunity(opportunity);
            setShowContactModal(true);
        }
    };

    const handleDetailClick = (opportunity: StudentRequest) => {
        setDetailOpportunity(opportunity);
        setShowDetailModal(true);
    };

    const handleUpgradeToPremium = () => {
        navigate('/perfil?tab=billing');
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
                                                {opportunity.city}
                                                {opportunity.universityTarget && ` • ${opportunity.universityTarget}`}
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
                                                {opportunity.requiredAmenities.slice(0, 3).map((amenityId, idx) => {
                                                    const amenity = mockAmenities.find(a => a.id === amenityId);
                                                    return (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                            {amenity ? amenity.name : amenityId}
                                                        </span>
                                                    );
                                                })}
                                                {opportunity.requiredAmenities.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        +{opportunity.requiredAmenities.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDetailClick(opportunity)}
                                            className="flex-1 py-3 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        >
                                            Ver Detalle
                                        </button>
                                        <button
                                            onClick={() => handleContactClick(opportunity)}
                                            className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${currentUser?.plan === 'premium'
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

                {/* Contact Modal */}
                {showContactModal && contactOpportunity && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 max-w-sm w-full p-4 animate-scaleIn relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Contacto del Estudiante</h2>
                                <p className="text-xs text-gray-600">Información de contacto directa</p>
                            </div>

                            <div className="space-y-2">
                                <div className="bg-gray-50 p-2.5 rounded-lg flex items-center">
                                    <User className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Nombre</p>
                                        <p className="font-medium text-gray-900 text-sm truncate">{contactOpportunity.studentName}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-2.5 rounded-lg flex items-center">
                                    <Mail className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900 text-sm truncate">{contactOpportunity.studentEmail}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-2.5 rounded-lg flex items-center">
                                    <Phone className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Teléfono</p>
                                        <p className="font-medium text-gray-900 text-sm">{contactOpportunity.studentPhone}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-2.5 rounded-lg flex items-center">
                                    <MessageCircle className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">WhatsApp</p>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {contactOpportunity.studentWhatsapp || 'No disponible'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                {(contactOpportunity.studentWhatsapp || contactOpportunity.studentPhone) && (
                                    <button
                                        onClick={() => {
                                            const message = `Hola, mi nombre es ${currentUser?.name || 'un propietario'}, te escribo porque vi tu publicación activa en la página de EstuArriendo y me gustaría ofrecerte algo que se adecua a tus necesidades.`;
                                            const phoneNumber = (contactOpportunity.studentWhatsapp || contactOpportunity.studentPhone).replace(/\D/g, '');
                                            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                                            window.open(whatsappUrl, '_blank');
                                        }}
                                        className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center justify-center text-sm"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Contactar por WhatsApp
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors text-sm"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && detailOpportunity && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Detalle de la Solicitud</h2>
                                    <p className="text-sm text-gray-600 mt-1">Información completa del estudiante</p>
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
                                            <p className="font-medium text-gray-900">
                                                {currentUser?.plan === 'premium' ? detailOpportunity.studentName : 'Estudiante'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Universidad/Zona</p>
                                            <p className="font-medium text-gray-900">{detailOpportunity.universityTarget}</p>
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
                                                ${detailOpportunity.budgetMax.toLocaleString('es-CO')}/mes
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Tipo de Inmueble</p>
                                            <p className="text-lg font-semibold text-gray-900 capitalize">
                                                {detailOpportunity.propertyTypeDesired}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-gray-500 mb-1">Fecha de Mudanza</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(detailOpportunity.moveInDate).toLocaleDateString('es-CO', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        {detailOpportunity.contractDuration && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-xs text-gray-500 mb-1">Duración del Contrato</p>
                                                <p className="font-semibold text-gray-900">
                                                    {detailOpportunity.contractDuration} meses
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Required Amenities */}
                                {detailOpportunity.requiredAmenities && detailOpportunity.requiredAmenities.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Comodidades Requeridas</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {detailOpportunity.requiredAmenities.map((amenityId, idx) => {
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
                                {detailOpportunity.dealBreakers && detailOpportunity.dealBreakers.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Restricciones Importantes</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {detailOpportunity.dealBreakers.map((dealBreaker, idx) => (
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
                                {detailOpportunity.additionalNotes && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-3">Notas Adicionales</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {detailOpportunity.additionalNotes}
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
                                        <p className="font-medium text-gray-900">{detailOpportunity.city}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            handleContactClick(detailOpportunity);
                                        }}
                                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${currentUser?.plan === 'premium'
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                            }`}
                                    >
                                        {currentUser?.plan === 'premium' ? 'Ver Contacto' : 'Actualizar a Premium'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default OpportunitiesPage;
