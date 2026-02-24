import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Property, PropertyStats, User, SystemConfig, AdminSection, PaymentRequest, Amenity } from '../types';
import { api } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import { fetchProperties, approveProperty, rejectProperty, deleteProperty, toggleFeatured } from '../store/slices/propertiesSlice';
import ContainerReviewModal from '../components/admin/ContainerReviewModal';
import AdminSidebar from '../components/admin/AdminSidebar';
import PropertiesTable from '../components/admin/PropertiesTable';
import UsersTable from '../components/admin/UsersTable';
import AdminConfig from '../components/admin/AdminConfig';
import DeleteConfirmationModal from '../components/admin/DeleteConfirmationModal';
import PropertyEditModal from '../components/admin/PropertyEditModal';
import PropertyReviewModal from '../components/PropertyReviewModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import StudentRequestsAdmin from '../components/admin/StudentRequestsAdmin';
import ActivityLogsAdmin from '../components/admin/ActivityLogsAdmin';
import PaymentsAdmin from '../components/admin/PaymentsAdmin';
import VerificationsAdmin from '../components/admin/VerificationsAdmin';
import AdminPropertyCreator from '../components/admin/AdminPropertyCreator';
import DashboardHome from '../components/admin/DashboardHome';
import { CheckCircle, XCircle, FileText, Menu } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

const AdminDashboard = () => {
    const dispatch = useAppDispatch();
    const toast = useToast();

    const { items: properties } = useAppSelector((state) => state.properties);

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
    // const [activities, setActivities] = useState<ActivityLog[]>([]); // Removed: DashboardHome handles fetching
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
    const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
    const [pendingVerifications, setPendingVerifications] = useState<User[]>([]);
    const [studentRequestsCount, setStudentRequestsCount] = useState(0);
    const [pendingContainers, setPendingContainers] = useState<Property[]>([]); // New state

    // Calculate filtered properties from Redux
    const pendingProperties = React.useMemo(() => {
        const storePending = properties.filter(p => p.status === 'pending');
        const map = new Map();

        // 1. Add store pending, filtering out child units
        storePending.forEach(p => {
            // Only add if it's not a child unit (no parentId)
            if (!p.parentId) {
                map.set(p.id, p);
            }
        });

        // 2. Add pending containers (takes precedence to ensure we have units)
        pendingContainers.forEach(p => map.set(p.id, p));

        return Array.from(map.values());
    }, [properties, pendingContainers]);

    const allProperties = properties;

    // UI states
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Use React Router's useLocation hook
    const location = useLocation();

    useEffect(() => {
        // Check for section query parameter
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section && ['dashboard', 'pending', 'properties', 'users', 'payments', 'amenities', 'config', 'student-requests', 'activity', 'all-properties', 'verifications'].includes(section)) {
            setCurrentSection(section as AdminSection);
        }
    }, [location.search]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadSectionData = async (section: AdminSection) => {
        try {
            if (section === 'users' && users.length === 0) {
                const data = await api.getUsers();
                setUsers(data);
            }
            if (section === 'config' && !systemConfig) {
                const data = await api.getSystemConfig();
                setSystemConfig(data);
            }
            if (section === 'payments' && paymentRequests.length === 0) {
                const data = await api.getPaymentRequests();
                setPaymentRequests(data);
            }
            if (section === 'verifications' && pendingVerifications.length === 0) {
                const data = await api.getPendingVerifications();
                setPendingVerifications(data);
            }
        } catch (err) {
            console.error('Failed to load section data', err);
        }
    };

    const loadInitialData = async () => {
        try {
            setLoading(true);

            // Fetch all properties from Redux (including pending, approved, rejected)
            await dispatch(fetchProperties({ status: 'all' }));

            // Fetch amenities from Redux
            dispatch(fetchAmenities());

            // Default lightweight fetches needed across dashboard (sidebar counts, pending lists, owners)
            const [studentRequests, containers, usersData] = await Promise.all([
                api.getStudentRequests(),
                api.getPendingContainers(),
                api.getUsers()
            ]);

            setStudentRequestsCount(studentRequests.filter(r => r.status === 'open').length);
            setPendingContainers(containers);
            setUsers(usersData);

            // Load data for the active section immediately
            await loadSectionData(currentSection);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            loadSectionData(currentSection);
        }
    }, [currentSection]);

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
    }, [properties, currentSection]); // Recalculate when properties change OR when section changes

    const refreshData = async () => {
        // Refresh properties from Redux with all statuses
        await dispatch(fetchProperties({ status: 'all' }));

        // Refresh pending containers
        const containers = await api.getPendingContainers();
        setPendingContainers(containers);

        // Refresh other data depending on the current section
        if (currentSection === 'users') {
            const usersData = await api.getUsers();
            setUsers(usersData);
        } else if (currentSection === 'payments') {
            const paymentsData = await api.getPaymentRequests();
            setPaymentRequests(paymentsData);
        } else if (currentSection === 'verifications') {
            const verificationsData = await api.getPendingVerifications();
            setPendingVerifications(verificationsData);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            // Check if the property is a container
            const property = allProperties.find(p => p.id === parseInt(id)) || pendingContainers.find(p => String(p.id) === id);

            if (property?.isContainer) {
                const result = await api.approveContainer(id);
                if (result.success) {
                    toast.success(`✅ Pensión aprobada. ${result.approvedUnitsCount || 0} habitación(es) aprobada(s)`);
                    setSelectedProperty(null);
                    await refreshData();
                } else {
                    toast.error('❌ Error al aprobar la pensión');
                }
            } else {
                const resultAction = await dispatch(approveProperty(id));

                if (approveProperty.fulfilled.match(resultAction)) {
                    toast.success('✅ Propiedad aprobada exitosamente');
                    setSelectedProperty(null);
                    await refreshData();
                } else {
                    toast.error('❌ Error al aprobar la propiedad');
                }
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
                setSelectedProperty(null);
                await refreshData();
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





    const handleSaveConfig = async (config: SystemConfig) => {
        try {
            const success = await api.updateSystemConfig(config);
            if (success) {
                setSystemConfig(config);
                toast.success('Configuración guardada exitosamente');
            }
        } catch (error) {
            console.error('Error saving config:', error);
            toast.error('Error al guardar la configuración');
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
                    <DashboardHome
                        stats={stats}
                        users={users}
                        // activities={activities} // Removed: component self-fetches
                        pendingVerificationsCount={pendingVerifications.length}
                        pendingPaymentsCount={paymentRequests.filter(r => r.status === 'pending').length}
                        studentRequestsCount={studentRequestsCount}
                        onNavigate={setCurrentSection}
                    />
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
                            defaultFilter="all"
                        />
                    </div>
                );
            case 'payments':
                return (
                    <PaymentsAdmin
                        paymentRequests={paymentRequests}
                        onRefresh={loadInitialData}
                    />
                );
            case 'verifications':
                return (
                    <VerificationsAdmin
                        pendingVerifications={pendingVerifications}
                        onRefresh={loadInitialData}
                    />
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
                return <ActivityLogsAdmin />;
            case 'config':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
                        {systemConfig && (
                            <AdminConfig
                                config={systemConfig}
                                onSaveConfig={handleSaveConfig}
                            />
                        )}
                    </div>
                );
            case 'student-requests':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Solicitudes de Estudiantes</h2>
                        <StudentRequestsAdmin />
                    </div>
                );
            case 'create-property':
                return (
                    <AdminPropertyCreator
                        onComplete={() => {
                            toast.success('✅ Propiedad creada exitosamente para el propietario');
                            setCurrentSection('pending'); // Or 'all-properties'
                            refreshData();
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <h1 className="font-bold text-lg text-gray-900">EstuArriendo Admin</h1>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <Menu size={24} />
                </button>
            </div>

            <AdminSidebar
                currentSection={currentSection}
                onSectionChange={(section) => {
                    setCurrentSection(section);
                    // Update URL to match section
                    window.history.pushState({}, '', `/admin?section=${section}`);
                    setIsSidebarOpen(false);
                }}
                pendingCount={stats.pending}
                paymentCount={paymentRequests.filter(r => r.status === 'pending').length}
                verificationCount={pendingVerifications.length}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </div>
            </div>

            {/* Modal de revisión */}
            {selectedProperty && (
                selectedProperty.isContainer ? (
                    <ContainerReviewModal
                        container={selectedProperty}
                        onClose={() => setSelectedProperty(null)}
                        onUpdate={() => {
                            dispatch(fetchProperties({ status: 'all' }));
                            // Reload pending containers and update selected property
                            api.getPendingContainers().then(containers => {
                                setPendingContainers(containers);
                                if (selectedProperty) {
                                    const updated = containers.find(c => c.id === selectedProperty.id);
                                    if (updated) setSelectedProperty(updated);
                                }
                            });
                        }}
                    />
                ) : (
                    <PropertyReviewModal
                        property={selectedProperty}
                        onClose={() => setSelectedProperty(null)}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDeleteImage={handleDeleteImage}
                    />
                )
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
