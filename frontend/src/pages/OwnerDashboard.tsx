import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Home, Edit, Trash2, AlertCircle, CheckCircle, Clock, XCircle, Users, CheckSquare, Square, Eye } from 'lucide-react';
import { Property } from '../types';
import { authService } from '../services/authService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProperties, deleteProperty, toggleRented } from '../store/slices/propertiesSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import InterestedUsersModal from '../components/InterestedUsersModal';

const OwnerDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: properties, loading, error: reduxError } = useAppSelector((state) => state.properties);

    const [deleteId, setDeleteId] = useState<string | null>(null);

    // State for Interested Users Modal
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [selectedPropertyTitle, setSelectedPropertyTitle] = useState<string>('');
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

    useEffect(() => {
        const user = authService.getStoredUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // Fetch user's properties
        dispatch(fetchUserProperties(user.id));
    }, [dispatch]);

    const handleDelete = async (id: number | string) => {
        try {
            const resultAction = await dispatch(deleteProperty(String(id)));

            if (deleteProperty.fulfilled.match(resultAction)) {
                setDeleteId(null);
            }
        } catch (err) {
            console.error('Error deleting property:', err);
        }
    };

    const handleToggleRented = async (id: number | string) => {
        try {
            await dispatch(toggleRented(String(id)));
        } catch (err) {
            console.error('Error toggling rented status:', err);
        }
    };

    const handleOpenInterests = (propertyId: string, propertyTitle: string) => {
        setSelectedPropertyId(propertyId);
        setSelectedPropertyTitle(propertyTitle);
        setIsInterestModalOpen(true);
    };

    const handleCloseInterests = () => {
        setIsInterestModalOpen(false);
        setSelectedPropertyId(null);
        setSelectedPropertyTitle('');
    };

    const getStatusBadge = (status: Property['status']) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aprobada
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rechazada
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mis Propiedades</h1>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            Gestiona tus publicaciones y revisa su estado
                        </p>
                    </div>
                    <Link
                        to="/publicar"
                        className="inline-flex items-center justify-center min-h-[48px] px-4 sm:px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                    >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Nueva Propiedad
                    </Link>
                </div>

                {reduxError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                        <span className="text-red-700">{reduxError}</span>
                    </div>
                )}

                {properties.length === 0 ? (
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                        <Home className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No tienes propiedades</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            Comienza publicando tu primera propiedad para arriendo.
                        </p>
                        <div className="mt-4 sm:mt-6">
                            <Link
                                to="/publicar"
                                className="inline-flex items-center min-h-[48px] px-6 py-3 border border-transparent shadow-sm text-sm sm:text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Publicar Propiedad
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <ul className="divide-y divide-gray-200">
                            {properties.map((property) => (
                                <li key={property.id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center min-w-0 flex-1">
                                                <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                                                    <img
                                                        className="h-16 w-16 object-cover"
                                                        src={(property.images && property.images.length > 0) ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url) : 'https://via.placeholder.com/64x64'}
                                                        alt={property.title}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-emerald-600 truncate">
                                                            {property.title}
                                                        </p>
                                                        <p className="mt-1 flex items-center text-sm text-gray-500">
                                                            <span className="truncate">
                                                                {property.location?.city}, {property.location?.department}
                                                            </span>
                                                        </p>
                                                        {property.status === 'rejected' && property.rejectionReason && (
                                                            <div className="mt-2 p-2 bg-red-50 rounded-md border border-red-100">
                                                                <p className="text-xs text-red-700 font-medium">
                                                                    Razón de rechazo:
                                                                </p>
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    {property.rejectionReason}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            Precio: ${property.monthlyRent.toLocaleString()} {property.currency}
                                                        </div>
                                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                                            Publicado: {new Date(property.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:ml-4">
                                                {getStatusBadge(property.status)}

                                                {/* Rental Status Toggle */}
                                                {property.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleToggleRented(property.id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${property.isRented
                                                            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                            }`}
                                                        title={property.isRented ? 'Marcar como disponible' : 'Marcar como rentada'}
                                                    >
                                                        {property.isRented ? (
                                                            <>
                                                                <CheckSquare className="w-3 h-3 mr-1" />
                                                                Rentada
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Square className="w-3 h-3 mr-1" />
                                                                Disponible
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    {/* View Property Button */}
                                                    <Link
                                                        to={`/propiedad/${property.id}`}
                                                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-emerald-600 active:text-emerald-700 transition-colors rounded-lg hover:bg-emerald-50"
                                                        title="Ver Propiedad"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleOpenInterests(String(property.id), property.title)}
                                                        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 active:text-blue-700 transition-colors rounded-lg hover:bg-blue-50"
                                                        title="Ver Interesados"
                                                    >
                                                        <Users className="h-5 w-5" />
                                                    </button>

                                                    {/* Edit Button - More prominent for rejected properties */}
                                                    <Link
                                                        to={`/editar-propiedad/${property.id}`}
                                                        className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors rounded-lg ${property.status === 'rejected'
                                                            ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 active:bg-orange-100 ring-2 ring-orange-300'
                                                            : 'text-gray-400 hover:text-emerald-600 active:text-emerald-700 hover:bg-emerald-50'
                                                            }`}
                                                        title={property.status === 'rejected'
                                                            ? 'Editar y reenviar para revisión'
                                                            : 'Editar'}
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Link>

                                                    {deleteId === String(property.id) ? (
                                                        <div className="flex items-center space-x-2 animate-fadeIn">
                                                            <span className="text-xs text-red-600 font-medium">¿Eliminar?</span>
                                                            <button
                                                                onClick={() => handleDelete(property.id)}
                                                                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                                            >
                                                                Sí
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteId(null)}
                                                                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteId(String(property.id))}
                                                            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-600 active:text-red-700 transition-colors rounded-lg hover:bg-red-50"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Interested Users Modal */}
            {selectedPropertyId && (
                <InterestedUsersModal
                    isOpen={isInterestModalOpen}
                    onClose={handleCloseInterests}
                    propertyId={selectedPropertyId}
                    propertyTitle={selectedPropertyTitle}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;
