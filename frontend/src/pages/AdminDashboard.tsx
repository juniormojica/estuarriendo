import React, { useEffect, useState } from 'react';
import { Property, PropertyStats, User, ActivityLog, SystemConfig, AdminSection, PaymentRequest, Amenity } from '../types';
import { api } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAmenities, createAmenity, updateAmenity, deleteAmenity } from '../store/slices/amenitiesSlice';
import { fetchProperties, approveProperty, rejectProperty, deleteProperty, toggleFeatured } from '../store/slices/propertiesSlice';
import PropertyReviewModal from '../components/PropertyReviewModal';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminStats from '../components/admin/AdminStats';
import PropertiesTable from '../components/admin/PropertiesTable';
import UsersTable from '../components/admin/UsersTable';
import ActivityFeed from '../components/admin/ActivityFeed';
import AdminConfig from '../components/admin/AdminConfig';
import DeleteConfirmationModal from '../components/admin/DeleteConfirmationModal';
import PropertyEditModal from '../components/admin/PropertyEditModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import { CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

const AdminDashboard = () => {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { items: amenities } = useAppSelector((state) => state.amenities);
    const { items: properties, loading: propertiesLoading } = useAppSelector((state) => state.properties);

    const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
    const [loading, setLoading] = useState(true);

    // Data states
    const [stats, setStats] = useState<PropertyStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        featured: 0,
        totalRevenue: 0
    });
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [pendingVerifications, setPendingVerifications] = useState<User[]>([]);

    // Calculate filtered properties from Redux
    const pendingProperties = properties.filter(p => p.status === 'pending');
    const approvedProperties = properties.filter(p => p.status === 'approved');
    const rejectedProperties = properties.filter(p => p.status === 'rejected');
    const allProperties = properties;

    // UI states
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Fetch all properties from Redux (including pending, approved, rejected)
            await dispatch(fetchProperties({ status: 'all' }));

            // Fetch amenities from Redux
            dispatch(fetchAmenities());

            // Fetch other data that still uses api methods
            // TODO: These should also be migrated to Redux eventually
            const [usersData, activitiesData, configData, paymentsData, verificationsData] = await Promise.all([
                api.getUsers(),
                api.getActivityLog(),
                api.getSystemConfig(),
                api.getPaymentRequests(),
                api.getPendingVerifications()
            ]);

            setUsers(usersData);
            setActivities(activitiesData);
            setSystemConfig(configData);
            setPaymentRequests(paymentsData);
            setPendingVerifications(verificationsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats from Redux properties
    useEffect(() => {
        const calculatedStats: PropertyStats = {
            total: properties.length,
            pending: properties.filter(p => p.status === 'pending').length,
            approved: properties.filter(p => p.status === 'approved').length,
            rejected: properties.filter(p => p.status === 'rejected').length,
            featured: properties.filter(p => p.isFeatured).length,
            totalRevenue: 0 // TODO: Calculate if needed
        };
        setStats(calculatedStats);
    }, [properties]); // Only depend on properties, not the filtered arrays

    const refreshData = async () => {
        // Refresh properties from Redux
        await dispatch(fetchProperties({}));

        // Refresh other data
        const [usersData, paymentsData, verificationsData] = await Promise.all([
            api.getUsers(),
            api.getPaymentRequests(),
            api.getPendingVerifications()
        ]);

        setUsers(usersData);
        setPaymentRequests(paymentsData);
        setPendingVerifications(verificationsData);
    };

    const handleApprove = async (id: string) => {
        try {
            const resultAction = await dispatch(approveProperty(id));

            if (approveProperty.fulfilled.match(resultAction)) {
                toast.success('✅ Propiedad aprobada exitosamente');
                await refreshData();
                setSelectedProperty(null);
            } else {
                toast.error('❌ Error al aprobar la propiedad');
            }
        } catch (error) {
            console.error('Error approving property:', error);
            toast.error('❌ Error al aprobar la propiedad');
        }
    };

    const handleReject = async (id: string, reason?: string) => {
        let finalReason = reason;
        if (!finalReason) {
            const promptResult = window.prompt('Por favor ingresa la razón del rechazo:');
            if (!promptResult) return;
            finalReason = promptResult;
        }

        try {
            const resultAction = await dispatch(rejectProperty({ id, reason: finalReason }));

            if (rejectProperty.fulfilled.match(resultAction)) {
                toast.success('✅ Propiedad rechazada');
                await refreshData();
                setSelectedProperty(null);
            } else {
                toast.error('❌ Error al rechazar la propiedad');
            }
        } catch (error) {
            console.error('Error rejecting property:', error);
            toast.error('❌ Error al rechazar la propiedad');
        }
    };

    const handleDeleteClick = (id: string) => {
        setPropertyToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!propertyToDelete) return;

        setIsDeleting(true);
        try {
            console.log('Attempting to delete property with ID:', propertyToDelete);
            const resultAction = await dispatch(deleteProperty(propertyToDelete));

            if (deleteProperty.fulfilled.match(resultAction)) {
                toast.success('✅ Propiedad eliminada exitosamente');
                await refreshData();
                setSelectedProperty(null);
                setPropertyToDelete(null);
            } else {
                console.error('Failed to delete property.');
                toast.error('❌ No se pudo eliminar la propiedad');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            toast.error('❌ Ocurrió un error al eliminar la propiedad');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (property: Property) => {
        setEditingProperty(property);
    };

    const handleSaveProperty = async () => {
        await refreshData();
        setEditingProperty(null);
    };

    const handleToggleFeatured = async (id: string) => {
        try {
            const resultAction = await dispatch(toggleFeatured(id));

            if (toggleFeatured.fulfilled.match(resultAction)) {
                const updatedProperty = resultAction.payload;
                const message = updatedProperty.isFeatured
                    ? '⭐ Propiedad destacada'
                    : '✅ Destacado removido';
                toast.success(message);
                await refreshData();
            } else {
                toast.error('❌ Error al cambiar estado destacado');
            }
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error('❌ Error al cambiar estado destacado');
        }
    };

    const handleDeleteImage = async (propertyId: string, imageIndex: number) => {
        try {
            const success = await api.deletePropertyImage(propertyId, imageIndex);
            if (success) {
                // Refresh properties from Redux to get updated data
                await dispatch(fetchProperties({}));

                // Update the selected property if it's the one being modified
                if (selectedProperty && String(selectedProperty.id) === propertyId) {
                    setSelectedProperty({
                        ...selectedProperty,
                        images: selectedProperty.images?.filter((_, i) => i !== imageIndex) || []
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleViewUserProperties = async (userId: string) => {
        try {
            const userProperties = await api.getUserProperties(userId);
            // For now, just switch to all properties view
            // In a more advanced version, we could filter the table
            setCurrentSection('all-properties');
        } catch (error) {
            console.error('Error loading user properties:', error);
        }
    };

    const handleSaveConfig = async (config: SystemConfig) => {
        try {
            const success = await api.updateSystemConfig(config);
            if (success) {
                setSystemConfig(config);
                alert('Configuración guardada exitosamente');
            }
        } catch (error) {
            console.error('Error saving config:', error);
        }
    };

    const handleAddAmenity = async (amenity: Omit<Amenity, 'id'>) => {
        try {
            await dispatch(createAmenity(amenity)).unwrap();
            alert('Amenidad agregada exitosamente');
        } catch (error) {
            console.error('Error adding amenity:', error);
            alert('Error al agregar amenidad');
        }
    };

    const handleUpdateAmenity = async (id: string, data: Partial<Amenity>) => {
        try {
            await dispatch(updateAmenity({ id, data })).unwrap();
            alert('Amenidad actualizada exitosamente');
        } catch (error) {
            console.error('Error updating amenity:', error);
            alert('Error al actualizar amenidad');
        }
    };

    const handleDeleteAmenity = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta amenidad?')) {
            try {
                await dispatch(deleteAmenity(id)).unwrap();
            } catch (error) {
                console.error('Error deleting amenity:', error);
                alert('Error al eliminar amenidad');
            }
        }
    };

    const handleVerifyPayment = async (id: string) => {
        if (window.confirm('¿Estás seguro de verificar este pago? El usuario será actualizado a Premium.')) {
            try {
                const success = await api.verifyPaymentRequest(id);
                if (success) {
                    await refreshData();
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
            }
        }
    };

    const handleRejectPayment = async (id: string) => {
        if (window.confirm('¿Estás seguro de rechazar este pago?')) {
            try {
                const success = await api.rejectPaymentRequest(id);
                if (success) {
                    await refreshData();
                }
            } catch (error) {
                console.error('Error rejecting payment:', error);
            }
        }
    };

    const handleApproveVerification = async (userId: string) => {
        if (window.confirm('¿Estás seguro de aprobar esta verificación?')) {
            try {
                const success = await api.updateVerificationStatus(userId, 'verified');
                if (success) {
                    await refreshData();
                }
            } catch (error) {
                console.error('Error approving verification:', error);
            }
        }
    };

    const handleRejectVerification = async (userId: string) => {
        const reason = window.prompt('Por favor ingresa la razón del rechazo:');
        if (reason) {
            try {
                const success = await api.updateVerificationStatus(userId, 'rejected', reason);
                if (success) {
                    await refreshData();
                }
            } catch (error) {
                console.error('Error rejecting verification:', error);
            }
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            );
        }

        switch (currentSection) {
            case 'dashboard':
                return (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
                        <AdminStats stats={stats} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                            <ActivityFeed activities={activities} maxItems={8} />
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Rápido</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                        <span className="text-gray-700">Propiedades Pendientes</span>
                                        <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="text-gray-700">Propiedades Aprobadas</span>
                                        <span className="text-2xl font-bold text-green-600">{stats.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="text-gray-700">Propiedades Destacadas</span>
                                        <span className="text-2xl font-bold text-purple-600">{stats.featured}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="text-gray-700">Total Usuarios</span>
                                        <span className="text-2xl font-bold text-blue-600">{users.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'pending':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Propiedades Pendientes</h2>
                        <PropertiesTable
                            properties={pendingProperties}
                            onView={setSelectedProperty}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDeleteClick}
                            onEdit={handleEdit}
                            onToggleFeatured={handleToggleFeatured}
                            users={users}
                        />
                    </div>
                );
            case 'payments':
                const pendingPayments = paymentRequests.filter(r => r.status === 'pending');
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Pago</h2>
                        {pendingPayments.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                                No hay solicitudes de pago pendientes.
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pendingPayments.map((request) => (
                                            <tr key={request.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {request.referenceCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {request.userName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    ${request.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <a
                                                        href={request.proofImage}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center text-blue-600 hover:text-blue-800"
                                                    >
                                                        <FileText className="w-4 h-4 mr-1" />
                                                        Ver Comprobante
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleVerifyPayment(request.id)}
                                                        className="text-green-600 hover:text-green-900 mr-4"
                                                        title="Verificar Pago"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectPayment(request.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Rechazar Pago"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'verifications':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Verificaciones Pendientes</h2>
                        {pendingVerifications.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                                No hay verificaciones pendientes.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingVerifications.map((user) => (
                                    <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            {user.verificationSubmittedAt && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Enviado: {new Date(user.verificationSubmittedAt).toLocaleDateString('es-CO')}
                                                </p>
                                            )}
                                        </div>

                                        {user.verificationDocuments && (
                                            <div className="space-y-3 mb-4">
                                                <h4 className="text-sm font-medium text-gray-700">Documentos:</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <a
                                                        href={user.verificationDocuments.idFront}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                                    >
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        Cédula Frente
                                                    </a>
                                                    <a
                                                        href={user.verificationDocuments.idBack}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                                    >
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        Cédula Reverso
                                                    </a>
                                                    <a
                                                        href={user.verificationDocuments.selfie}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                                    >
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        Selfie
                                                    </a>
                                                    <a
                                                        href={user.verificationDocuments.utilityBill}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs text-gray-700"
                                                    >
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        Recibo
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApproveVerification(user.id)}
                                                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleRejectVerification(user.id)}
                                                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Rechazar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'all-properties':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Todas las Propiedades</h2>
                        <PropertiesTable
                            properties={allProperties}
                            onView={setSelectedProperty}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDeleteClick}
                            onEdit={handleEdit}
                            onToggleFeatured={handleToggleFeatured}
                            users={users}
                        />
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
                        <UsersTable
                            users={users}
                            onViewDetails={setSelectedUser}
                        />
                    </div>
                );
            case 'activity':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Registro de Actividad</h2>
                        <ActivityFeed activities={activities} />
                    </div>
                );
            case 'config':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
                        {systemConfig && (
                            <AdminConfig
                                config={systemConfig}
                                onSaveConfig={handleSaveConfig}
                                amenities={amenities}
                                onAddAmenity={handleAddAmenity}
                                onUpdateAmenity={handleUpdateAmenity}
                                onDeleteAmenity={handleDeleteAmenity}
                            />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                pendingCount={stats.pending}
                paymentCount={paymentRequests.filter(r => r.status === 'pending').length}
                verificationCount={pendingVerifications.length}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {renderContent()}
                </div>
            </div>

            {/* Property Review Modal */}
            {selectedProperty && (
                <PropertyReviewModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    onApprove={() => handleApprove(String(selectedProperty.id))}
                    onReject={(id, reason) => handleReject(id, reason)}
                    onDeleteImage={handleDeleteImage}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!propertyToDelete}
                onClose={() => setPropertyToDelete(null)}
                onConfirm={handleConfirmDelete}
                isProcessing={isDeleting}
            />

            {/* Edit Modal */}
            {editingProperty && (
                <PropertyEditModal
                    property={editingProperty}
                    isOpen={!!editingProperty}
                    onClose={() => setEditingProperty(null)}
                    onSave={handleSaveProperty}
                />
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={refreshData}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
