import React, { useEffect, useState } from 'react';
import { Property, PropertyStats, User, ActivityLog, SystemConfig, AdminSection, Amenity, PaymentRequest } from '../types';
import { api } from '../services/api';
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

const AdminDashboard = () => {
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
    const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [pendingVerifications, setPendingVerifications] = useState<User[]>([]);

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
            const [statsData, pendingData, allPropsData, usersData, activitiesData, configData, amenitiesData, paymentsData, verificationsData] = await Promise.all([
                api.getPropertyStats(),
                api.getPendingProperties(),
                api.getAllPropertiesAdmin(),
                api.getUsers(),
                api.getActivityLog(),
                api.getSystemConfig(),
                api.getAmenities(),
                api.getPaymentRequests(),
                api.getPendingVerifications()
            ]);

            setStats(statsData);
            setPendingProperties(pendingData);
            setAllProperties(allPropsData);
            setUsers(usersData);
            setActivities(activitiesData);
            setSystemConfig(configData);
            setAmenities(amenitiesData);
            setPaymentRequests(paymentsData);
            setPendingVerifications(verificationsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        const [statsData, pendingData, allPropsData, usersData, paymentsData] = await Promise.all([
            api.getPropertyStats(),
            api.getPendingProperties(),
            api.getAllPropertiesAdmin(),
            api.getUsers(),
            api.getPaymentRequests()
        ]);

        setStats(statsData);
        setPendingProperties(pendingData);
        setAllProperties(allPropsData);
        setUsers(usersData);
        setPaymentRequests(paymentsData);

        // Refresh pending verifications
        const verificationsData = await api.getPendingVerifications();
        setPendingVerifications(verificationsData);
    };

    const handleApprove = async (id: string) => {
        try {
            const success = await api.approveProperty(id);
            if (success) {
                await refreshData();
                setSelectedProperty(null);
            }
        } catch (error) {
            console.error('Error approving property:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const success = await api.rejectProperty(id);
            if (success) {
                await refreshData();
                setSelectedProperty(null);
            }
        } catch (error) {
            console.error('Error rejecting property:', error);
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
            const success = await api.deleteProperty(propertyToDelete);
            if (success) {
                await refreshData();
                setSelectedProperty(null);
                setPropertyToDelete(null);
                // Optional: Show success toast/notification
            } else {
                console.error('Failed to delete property. API returned false.');
                alert('No se pudo eliminar la propiedad. Por favor intente nuevamente.');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Ocurrió un error al eliminar la propiedad.');
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
            const success = await api.toggleFeaturedProperty(id);
            if (success) {
                await refreshData();
            }
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    const handleDeleteImage = async (propertyId: string, imageIndex: number) => {
        try {
            const success = await api.deletePropertyImage(propertyId, imageIndex);
            if (success) {
                // Update local state
                setPendingProperties(prev => prev.map(p => {
                    if (p.id === propertyId) {
                        return { ...p, images: p.images.filter((_, i) => i !== imageIndex) };
                    }
                    return p;
                }));
                setAllProperties(prev => prev.map(p => {
                    if (p.id === propertyId) {
                        return { ...p, images: p.images.filter((_, i) => i !== imageIndex) };
                    }
                    return p;
                }));
                if (selectedProperty && selectedProperty.id === propertyId) {
                    setSelectedProperty({
                        ...selectedProperty,
                        images: selectedProperty.images.filter((_, i) => i !== imageIndex)
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
            const success = await api.addAmenity(amenity);
            if (success) {
                alert('Amenidad agregada exitosamente');
                const updatedAmenities = await api.getAmenities();
                setAmenities(updatedAmenities);
            }
        } catch (error) {
            console.error('Error adding amenity:', error);
        }
    };

    const handleDeleteAmenity = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta amenidad?')) {
            try {
                const success = await api.deleteAmenity();
                if (success) {
                    const updatedAmenities = await api.getAmenities();
                    setAmenities(updatedAmenities);
                }
            } catch (error) {
                console.error('Error deleting amenity:', error);
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
                                onSave={handleSaveConfig}
                                amenities={amenities}
                                onAddAmenity={handleAddAmenity}
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
                    isOpen={!!selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    onApprove={() => handleApprove(selectedProperty.id)}
                    onReject={() => handleReject(selectedProperty.id)}
                    onDeleteImage={(index) => handleDeleteImage(selectedProperty.id, index)}
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
