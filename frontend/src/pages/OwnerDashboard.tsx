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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mis Propiedades</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Gestiona tus publicaciones y revisa su estado
                        </p>
                    </div>
                    <Link
                        to="/publicar"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Home className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes propiedades</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Comienza publicando tu primera propiedad para arriendo.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/publicar"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Publicar Propiedad
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {properties.map((property) => (
                                <li key={property.id}>
                                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
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
                                            <div className="flex items-center space-x-4 ml-4">
                                                {getStatusBadge(property.status)}

                                                {/* Rental Status Toggle */}
                                                {property.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleToggleRented(property.id)}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${property.is_rented
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

                                                <div className="flex items-center space-x-2">
                                                    {/* View Property Button */}
                                                    <Link
                                                        to={`/propiedad/${property.id}`}
                                                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                                                        title="Ver Propiedad"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleOpenInterests(String(property.id), property.title)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Ver Interesados"
                                                    >
                                                        <Users className="h-5 w-5" />
                                                    </button>

                                                    {/* Placeholder for Edit - could be implemented later */}
                                                    <Link
                                                        to={`/editar-propiedad/${property.id}`}
                                                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                                                        title="Editar"
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
                                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
