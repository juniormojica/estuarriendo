import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Home, AlertCircle } from 'lucide-react';
import { Property } from '../types';
import { authService } from '../services/authService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProperties, deleteProperty, toggleRented, toggleUnitRented } from '../store/slices/propertiesSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import InterestedUsersModal from '../components/InterestedUsersModal';
import PropertyStatusFilters from '../components/owner/PropertyStatusFilters';
import OwnerPropertyCard from '../components/owner/OwnerPropertyCard';
import OwnerContainerDetail from '../components/owner/OwnerContainerDetail';

const OwnerDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: properties, loading, error: reduxError } = useAppSelector((state) => state.properties);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [expandedContainers, setExpandedContainers] = useState<Set<number>>(new Set());

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

    const handleToggleUnitRented = async (unitId: string) => {
        try {
            // Find the unit to get its current status
            const container = properties.find(p => p.units?.some(u => u.id === parseInt(unitId)));
            const unit = container?.units?.find(u => u.id === parseInt(unitId));

            if (unit) {
                await dispatch(toggleUnitRented({
                    unitId,
                    isRented: !unit.isRented
                }));
            }
        } catch (err) {
            console.error('Error toggling unit rented status:', err);
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

    const handleToggleExpand = (propertyId: number) => {
        setExpandedContainers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(propertyId)) {
                newSet.delete(propertyId);
            } else {
                newSet.add(propertyId);
            }
            return newSet;
        });
    };

    const handleViewUnit = (unitId: string) => {
        // For now, just log - could navigate to unit detail page
        console.log('View unit:', unitId);
    };

    // Filter properties by status
    const filteredProperties = properties.filter(property => {
        if (activeFilter === 'all') return true;
        return property.status === activeFilter;
    });

    // Calculate counts for filters
    const counts = {
        all: properties.length,
        pending: properties.filter(p => p.status === 'pending').length,
        approved: properties.filter(p => p.status === 'approved').length,
        rejected: properties.filter(p => p.status === 'rejected').length
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-6 sm:py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
                            Mis Propiedades
                        </h1>
                        <p className="mt-2 text-sm text-stone-600">
                            Gestiona tus publicaciones y revisa su estado
                        </p>
                    </div>
                    <Link
                        to="/publicar"
                        className="inline-flex items-center justify-center px-4 py-2.5 border border-teal-600 rounded-lg text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all shadow-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Propiedad
                    </Link>
                </div>

                {reduxError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                        <span className="text-sm text-red-700">{reduxError}</span>
                    </div>
                )}

                {/* Status Filters */}
                {properties.length > 0 && (
                    <PropertyStatusFilters
                        counts={counts}
                        activeFilter={activeFilter}
                        onChange={setActiveFilter}
                    />
                )}

                {properties.length === 0 ? (
                    <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-12 text-center">
                        <Home className="mx-auto h-12 w-12 text-stone-400" />
                        <h3 className="mt-4 text-base font-medium text-stone-900">No tienes propiedades</h3>
                        <p className="mt-2 text-sm text-stone-500">
                            Comienza publicando tu primera propiedad para arriendo.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/publicar"
                                className="inline-flex items-center px-4 py-2.5 border border-teal-600 rounded-lg text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all shadow-sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Publicar Propiedad
                            </Link>
                        </div>
                    </div>
                ) : filteredProperties.length === 0 ? (
                    <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-8 text-center">
                        <p className="text-sm text-stone-500">No hay propiedades con el estado seleccionado.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProperties.map((property) => (
                            <div key={property.id}>
                                <OwnerPropertyCard
                                    property={property}
                                    onToggleRented={handleToggleRented}
                                    onDelete={(id) => {
                                        if (deleteId === id) {
                                            handleDelete(id);
                                        } else {
                                            setDeleteId(id);
                                        }
                                    }}
                                    onViewInterests={handleOpenInterests}
                                    isExpanded={expandedContainers.has(property.id)}
                                    onToggleExpand={property.isContainer ? () => handleToggleExpand(property.id) : undefined}
                                    isDeleting={deleteId === String(property.id)}
                                />

                                {/* Show units if container is expanded */}
                                {property.isContainer && expandedContainers.has(property.id) && (
                                    <OwnerContainerDetail
                                        container={property}
                                        onToggleUnitRented={handleToggleUnitRented}
                                        onViewUnit={handleViewUnit}
                                    />
                                )}
                            </div>
                        ))}
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
