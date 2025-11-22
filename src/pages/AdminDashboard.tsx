import React, { useEffect, useState } from 'react';
import { Property, PropertyStats, User, ActivityLog, SystemConfig, AdminSection, Amenity } from '../types';
import { api } from '../services/api';
import PropertyReviewModal from '../components/PropertyReviewModal';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminStats from '../components/admin/AdminStats';
import PropertiesTable from '../components/admin/PropertiesTable';
import UsersTable from '../components/admin/UsersTable';
import ActivityFeed from '../components/admin/ActivityFeed';
import AdminConfig from '../components/admin/AdminConfig';
import DeleteConfirmationModal from '../components/admin/DeleteConfirmationModal';

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

    // UI states
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [statsData, pendingData, allPropsData, usersData, activitiesData, configData, amenitiesData] = await Promise.all([
                api.getPropertyStats(),
                api.getPendingProperties(),
                api.getAllPropertiesAdmin(),
                api.getUsers(),
                api.getActivityLog(),
                api.getSystemConfig(),
                api.getAmenities()
            ]);

            setStats(statsData);
            setPendingProperties(pendingData);
            setAllProperties(allPropsData);
            setUsers(usersData);
            setActivities(activitiesData);
            setSystemConfig(configData);
            setAmenities(amenitiesData);
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        const [statsData, pendingData, allPropsData, usersData] = await Promise.all([
            api.getPropertyStats(),
            api.getPendingProperties(),
            api.getAllPropertiesAdmin(),
            api.getUsers()
        ]);

        setStats(statsData);
        setPendingProperties(pendingData);
        setAllProperties(allPropsData);
        setUsers(usersData);
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

    const handleDeleteAmenity = async () => {
        try {
            const success = await api.deleteAmenity();
            if (success) {
                alert('Amenidad eliminada exitosamente');
                const updatedAmenities = await api.getAmenities();
                setAmenities(updatedAmenities);
            }
        } catch (error) {
            console.error('Error deleting amenity:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentSection) {
            case 'dashboard':
                return (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
                        <AdminStats stats={stats} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Propiedades Pendientes</h1>
                        <PropertiesTable
                            properties={pendingProperties}
                            onView={setSelectedProperty}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDeleteClick}
                            onToggleFeatured={handleToggleFeatured}
                            users={users}
                        />
                    </div>
                );

            case 'all-properties':
                return (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Todas las Propiedades</h1>
                        <PropertiesTable
                            properties={allProperties}
                            onView={setSelectedProperty}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDeleteClick}
                            onToggleFeatured={handleToggleFeatured}
                            users={users}
                        />
                    </div>
                );

            case 'users':
                return (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Usuarios</h1>
                        <UsersTable users={users} onViewProperties={handleViewUserProperties} />
                    </div>
                );

            case 'activity':
                return (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Actividad del Sistema</h1>
                        <ActivityFeed activities={activities} maxItems={50} />
                    </div>
                );

            case 'config':
                return (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>
                        {systemConfig && (
                            <AdminConfig
                                config={systemConfig}
                                amenities={amenities}
                                onSaveConfig={handleSaveConfig}
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
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                pendingCount={stats.pending}
            />

            <div className="flex-1 p-8">
                {renderContent()}
            </div>

            {/* Property Review Modal */}
            {selectedProperty && (
                <PropertyReviewModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
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
        </div>
    );
};

export default AdminDashboard;
