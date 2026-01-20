import React, { useState } from 'react';
import { Property, PropertyUnit } from '../../types';
import { X, Check, CheckCircle, XCircle, Home, MapPin, Wifi, Layout, Users, Bed, BedDouble, User, Phone, Mail, Calendar, DollarSign, Coffee, Shield, Sofa, Building } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../ToastProvider';
import ReadOnlyMap from '../ReadOnlyMap';

interface ContainerReviewModalProps {
    container: Property;
    onClose: () => void;
    onUpdate: () => void;
}

const ContainerReviewModal: React.FC<ContainerReviewModalProps> = ({
    container,
    onClose,
    onUpdate
}) => {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; unitId: string | null }>({ isOpen: false, unitId: null });
    const [rejectionReason, setRejectionReason] = useState('');
    const [localUnits, setLocalUnits] = useState<PropertyUnit[]>(container.units || []);
    const toast = useToast();

    // Sync local units when container prop changes
    React.useEffect(() => {
        setLocalUnits(container.units || []);
    }, [container.units]);

    // Helper to get city/department name from object or string
    const getLocationValue = (value: any): string => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value.name) return value.name;
        return '';
    };

    // Helper to get unit price
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleUnitAction = async (unitId: string | number, action: 'approve' | 'reject') => {
        if (action === 'reject') {
            // Open rejection modal instead of window.prompt
            setRejectionModal({ isOpen: true, unitId: String(unitId) });
            return;
        }

        setProcessingId(String(unitId));
        try {
            const result = await api.approveUnit(String(unitId));
            if (result.success) {
                toast.success('Habitación aprobada');
                if (result.containerApproved) {
                    toast.success('¡Pensión completamente aprobada!');
                }
                // Optimistic update
                setLocalUnits(prev => prev.map(u =>
                    String(u.id) === String(unitId) ? { ...u, status: 'approved' } : u
                ));
                onUpdate();
            } else {
                toast.error('Error al aprobar habitación');
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleConfirmRejection = async () => {
        if (!rejectionModal.unitId || !rejectionReason.trim()) {
            toast.error('Por favor ingresa una razón');
            return;
        }

        setProcessingId(rejectionModal.unitId);
        const success = await api.rejectUnit(rejectionModal.unitId, rejectionReason);

        if (success) {
            toast.success('Habitación rechazada');
            // Optimistic update
            setLocalUnits(prev => prev.map(u =>
                String(u.id) === rejectionModal.unitId
                    ? { ...u, status: 'rejected', rejectionReason }
                    : u
            ));
            onUpdate();
        } else {
            toast.error('Error al rechazar habitación');
        }

        setRejectionModal({ isOpen: false, unitId: null });
        setRejectionReason('');
        setProcessingId(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Aprobada</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><XCircle size={12} /> Rechazada</span>;
            default:
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">Pendiente</span>;
        }
    };

    const sortedUnits = [...localUnits].sort((a, b) => {
        // Pending first
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0;
    });

    const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showApproveAllConfirm, setShowApproveAllConfirm] = useState(false);
    const [showApproveContainerConfirm, setShowApproveContainerConfirm] = useState(false);

    // Handle ESC key to close modal
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                // Close confirmation modals first if open
                if (showApproveAllConfirm) {
                    setShowApproveAllConfirm(false);
                } else if (showApproveContainerConfirm) {
                    setShowApproveContainerConfirm(false);
                } else if (rejectionModal.isOpen) {
                    setRejectionModal({ isOpen: false, unitId: null });
                    setRejectionReason('');
                } else if (selectedUnit) {
                    setSelectedUnit(null);
                } else if (selectedImage) {
                    setSelectedImage(null);
                } else {
                    // Close main modal
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showApproveAllConfirm, showApproveContainerConfirm, rejectionModal.isOpen, selectedUnit, selectedImage, onClose]);

    const handleApproveAllClick = () => {
        const pendingUnits = localUnits.filter(u => u.status === 'pending');
        if (pendingUnits.length === 0) {
            toast.info('No hay habitaciones pendientes para aprobar');
            return;
        }
        setShowApproveAllConfirm(true);
    };

    const handleConfirmApproveAll = async () => {
        const pendingUnits = localUnits.filter(u => u.status === 'pending');
        setShowApproveAllConfirm(false);
        setProcessingId('all');
        try {
            let containerApproved = false;
            // Approve units one by one using new endpoint
            for (const unit of pendingUnits) {
                const result = await api.approveUnit(String(unit.id));
                if (result.containerApproved) {
                    containerApproved = true;
                }
            }

            if (containerApproved) {
                toast.success('¡Todas las habitaciones y la pensión han sido aprobadas!');
            } else {
                toast.success('Todas las habitaciones han sido aprobadas');
            }
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error('Error al aprobar algunas habitaciones');
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveContainerClick = () => {
        setShowApproveContainerConfirm(true);
    };

    const handleConfirmApproveContainer = async () => {
        setShowApproveContainerConfirm(false);
        setProcessingId('container');
        try {
            const result = await api.approveContainer(String(container.id));
            if (result.success) {
                toast.success(`¡Pensión aprobada! ${result.approvedUnitsCount} habitación(es) aprobada(s)`);
                onUpdate();
            } else {
                toast.error('Error al aprobar la pensión');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al aprobar la pensión');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-start z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Home className="text-blue-600" />
                            {container.title}
                        </h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {getLocationValue(container.location?.city)}</span>
                            <span className="flex items-center gap-1"><Layout size={14} /> {container.units?.length || 0} Habitaciones</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-700">{container.units?.length || 0}</div>
                            <div className="text-sm text-blue-600">Total Habitaciones</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-700">
                                {container.units?.filter(u => u.status === 'pending').length || 0}
                            </div>
                            <div className="text-sm text-yellow-600">Pendientes</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-700">
                                {container.units?.filter(u => u.status === 'approved').length || 0}
                            </div>
                            <div className="text-sm text-green-600">Aprobadas</div>
                        </div>
                    </div>

                    {/* Container Info Review - OPTIMIZED LAYOUT */}
                    <div className="space-y-6">
                        {/* SECTION 1: Container Details - CRITICAL INFO FIRST */}
                        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building size={22} className="text-emerald-600" />
                                Detalles del Contenedor
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {container.monthlyRent && (
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DollarSign size={16} className="text-emerald-600" />
                                            <p className="text-xs text-gray-500">Pensión Completa</p>
                                        </div>
                                        <p className="text-lg font-bold text-emerald-600">
                                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: container.currency }).format(container.monthlyRent)}
                                        </p>
                                    </div>
                                )}
                                {container.rentalMode && (
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Home size={16} className="text-blue-600" />
                                            <p className="text-xs text-gray-500">Modo de Arriendo</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                            {container.rentalMode === 'by_unit' ? 'Por habitación' : container.rentalMode}
                                        </p>
                                    </div>
                                )}
                                {container.totalUnits !== undefined && (
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users size={16} className="text-purple-600" />
                                            <p className="text-xs text-gray-500">Total Unidades</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">{container.totalUnits}</p>
                                    </div>
                                )}
                                {container.minimumContractMonths !== undefined && (
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar size={16} className="text-orange-600" />
                                            <p className="text-xs text-gray-500">Contrato Mínimo</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">{container.minimumContractMonths} mes(es)</p>
                                    </div>
                                )}
                                {container.deposit !== undefined && container.deposit > 0 && (
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DollarSign size={16} className="text-green-600" />
                                            <p className="text-xs text-gray-500">Depósito</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: container.currency }).format(container.deposit)}
                                        </p>
                                    </div>
                                )}
                                {container.requiresDeposit !== undefined && (
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield size={16} className="text-indigo-600" />
                                            <p className="text-xs text-gray-500">Requiere Depósito</p>
                                        </div>
                                        <p className={`text-sm font-semibold ${container.requiresDeposit ? 'text-green-600' : 'text-gray-500'}`}>
                                            {container.requiresDeposit ? 'Sí' : 'No'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION 2: Owner/Contact Information */}
                        {(container.owner || container.contact) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-emerald-600" />
                                    Información del Propietario
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {container.owner && (
                                        <>
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                                <User size={18} className="text-gray-400 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Nombre</p>
                                                    <p className="font-medium text-gray-900 truncate">{container.owner.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                                <Mail size={18} className="text-gray-400 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500">Correo</p>
                                                    <p className="font-medium text-gray-900 truncate">{container.owner.email}</p>
                                                </div>
                                            </div>
                                            {container.owner.phone && (
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                                    <Phone size={18} className="text-gray-400 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Teléfono</p>
                                                        <p className="font-medium text-gray-900 truncate">{container.owner.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {container.contact && !container.owner && (
                                        <>
                                            {container.contact.email && (
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                                    <Mail size={18} className="text-gray-400 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Correo de Contacto</p>
                                                        <p className="font-medium text-gray-900 truncate">{container.contact.email}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {container.contact.phone && (
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                                    <Phone size={18} className="text-gray-400 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-gray-500">Teléfono de Contacto</p>
                                                        <p className="font-medium text-gray-900 truncate">{container.contact.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: Description */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{container.description}</p>
                        </div>

                        {/* Common Areas Images */}
                        {container.images && container.images.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Home size={20} className="text-emerald-600" />
                                    Fotos Áreas Comunes ({container.images.length})
                                </h4>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {container.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-all hover:shadow-lg"
                                            onClick={() => setSelectedImage(typeof img === 'string' ? img : img.url)}
                                        >
                                            <img
                                                src={typeof img === 'string' ? img : img.url}
                                                alt={`Área Común ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location & Map */}
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-emerald-600" />
                                Ubicación
                            </h4>
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="font-medium text-gray-900">{container.location?.street}</p>
                                    <p className="text-gray-600">{getLocationValue(container.location?.city)}, {getLocationValue(container.location?.department)}</p>
                                    {container.location?.postalCode && <p className="text-sm text-gray-500">CP: {container.location.postalCode}</p>}
                                </div>
                                {container.location?.latitude && container.location?.longitude ? (
                                    <ReadOnlyMap
                                        latitude={typeof container.location.latitude === 'string' ? parseFloat(container.location.latitude) : container.location.latitude}
                                        longitude={typeof container.location.longitude === 'string' ? parseFloat(container.location.longitude) : container.location.longitude}
                                        address={`${container.location.street}, ${getLocationValue(container.location.city)}`}
                                    />
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">⚠️ Esta propiedad no tiene coordenadas de ubicación.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Services */}
                            {container.services && container.services.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Coffee size={20} className="text-emerald-600" />
                                        Servicios
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {container.services.map((service, idx) => {
                                            const serviceLabels: Record<string, string> = {
                                                breakfast: 'Desayuno',
                                                lunch: 'Almuerzo',
                                                dinner: 'Cena',
                                                housekeeping: 'Aseo',
                                                laundry: 'Lavandería',
                                                wifi: 'WiFi',
                                                utilities: 'Servicios públicos'
                                            };
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${service.isIncluded ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                                                        }`}
                                                >
                                                    {service.isIncluded ? (
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    ) : (
                                                        <XCircle size={16} className="text-gray-400" />
                                                    )}
                                                    <span className="font-medium">
                                                        {serviceLabels[service.serviceType] || service.serviceType}
                                                    </span>
                                                    {service.additionalCost && service.additionalCost > 0 && (
                                                        <span className="text-xs text-gray-500">
                                                            (+${service.additionalCost.toLocaleString()})
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Rules */}
                            {container.rules && container.rules.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Shield size={20} className="text-emerald-600" />
                                        Reglas
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {container.rules.map((rule, idx) => {
                                            const ruleLabels: Record<string, string> = {
                                                visits: 'Visitas',
                                                pets: 'Mascotas',
                                                smoking: 'Fumar',
                                                noise: 'Ruido',
                                                curfew: 'Hora límite',
                                                tenant_profile: 'Perfil inquilino',
                                                couples: 'Parejas',
                                                children: 'Niños'
                                            };
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${rule.isAllowed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                        }`}
                                                >
                                                    {rule.isAllowed ? (
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    ) : (
                                                        <XCircle size={16} className="text-red-500" />
                                                    )}
                                                    <span className="font-medium">
                                                        {ruleLabels[rule.ruleType] || rule.ruleType}
                                                    </span>
                                                    {rule.value && (
                                                        <span className="text-xs text-gray-500">({rule.value})</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Common Areas */}
                        {container.commonAreas && container.commonAreas.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Sofa size={20} className="text-emerald-600" />
                                    Zonas Comunes
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {container.commonAreas.map((area) => (
                                        <span
                                            key={area.id}
                                            className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium"
                                        >
                                            {area.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Units List */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <BedDouble className="text-gray-700" />
                                Revisión de Habitaciones
                            </h3>
                            {container.units?.some(u => u.status === 'pending') && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleApproveContainerClick}
                                        disabled={!!processingId}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                                        title="Aprueba el contenedor y todas sus habitaciones de una vez"
                                    >
                                        <Home size={16} />
                                        Aprobar Pensión Completa
                                    </button>
                                    <button
                                        onClick={handleApproveAllClick}
                                        disabled={!!processingId}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors disabled:opacity-50"
                                        title="Aprueba todas las habitaciones pendientes (una por una)"
                                    >
                                        <CheckCircle size={16} />
                                        Aprobar Habitaciones
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {sortedUnits.map((unit) => (
                                <div
                                    key={unit.id}
                                    className={`border rounded-lg p-4 transition-colors cursor-pointer hover:border-blue-300 ${unit.status === 'pending' ? 'bg-white border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'}`}
                                    onClick={() => setSelectedUnit(unit)}
                                >
                                    <div className="flex flex-col md:flex-row gap-4 min-w-0">
                                        {/* Image */}
                                        <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {unit.images && unit.images.length > 0 ? (
                                                <img
                                                    src={typeof unit.images[0] === 'string' ? unit.images[0] : unit.images[0].url}
                                                    alt={unit.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Bed size={24} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{unit.title}</h4>
                                                    <div className="text-blue-600 font-bold mt-1">{formatPrice(unit.monthlyRent)}</div>
                                                </div>
                                                {getStatusBadge(unit.status)}
                                            </div>

                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 break-words">{unit.description}</p>

                                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Users size={12} /> {unit.roomType === 'individual' ? 'Individual' : 'Compartida'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Home size={12} /> {unit.amenities?.length || 0} Amenidades
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {unit.status === 'pending' && (
                                            <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUnitAction(unit.id, 'approve'); }}
                                                    disabled={!!processingId}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    <Check size={16} /> Aprobar
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleUnitAction(unit.id, 'reject'); }}
                                                    disabled={!!processingId}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    <X size={16} /> Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Unit Details Modal */}
            {selectedUnit && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold">{selectedUnit.title}</h3>
                            <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Images Gallery */}
                            <div className="grid grid-cols-2 gap-2">
                                {selectedUnit.images?.map((img, i) => (
                                    <div
                                        key={i}
                                        className="cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setSelectedImage(typeof img === 'string' ? img : img.url)}
                                    >
                                        <img
                                            src={typeof img === 'string' ? img : img.url}
                                            alt={`Foto ${i + 1}`}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700">Descripción</h4>
                                    <p className="text-gray-600">{selectedUnit.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Precio</h4>
                                        <p className="text-xl font-bold text-blue-600">{formatPrice(selectedUnit.monthlyRent)}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Área</h4>
                                        <p className="text-gray-600">{selectedUnit.area} m²</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Tipo</h4>
                                        <p className="text-gray-600 capitalize">{selectedUnit.roomType}</p>
                                    </div>
                                    {selectedUnit.roomType === 'shared' && (
                                        <div>
                                            <h4 className="font-semibold text-gray-700">Camas</h4>
                                            <p className="text-gray-600">{selectedUnit.bedsInRoom}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Amenities */}
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Amenidades</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUnit.amenities?.map((amenity, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                                {typeof amenity === 'object' ? amenity.name : amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions footer for detailed view */}
                        {selectedUnit.status === 'pending' && (
                            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    onClick={() => { handleUnitAction(selectedUnit.id, 'reject'); setSelectedUnit(null); }}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                >
                                    Rechazar
                                </button>
                                <button
                                    onClick={() => { handleUnitAction(selectedUnit.id, 'approve'); setSelectedUnit(null); }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Aprobar Habitación
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox for Full Screen Images */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-95 z-[70] flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Vista completa"
                        className="max-w-full max-h-[90vh] object-contain select-none"
                    />
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Rechazar Habitación</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ingresa la razón del rechazo..."
                            className="w-full border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setRejectionModal({ isOpen: false, unitId: null });
                                    setRejectionReason('');
                                }}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmRejection}
                                disabled={!rejectionReason.trim() || !!processingId}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve All Confirmation Modal */}
            {showApproveAllConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    ¿Aprobar todas las habitaciones pendientes?
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Esto aprobará <span className="font-semibold text-gray-900">{localUnits.filter(u => u.status === 'pending').length} habitación(es)</span> pendiente(s).
                                </p>
                                <p className="text-xs text-gray-500">
                                    Si todas las unidades quedan aprobadas, el contenedor también será aprobado automáticamente.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowApproveAllConfirm(false)}
                                disabled={!!processingId}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmApproveAll}
                                disabled={!!processingId}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 shadow-lg shadow-green-600/30"
                            >
                                {processingId === 'all' ? 'Aprobando...' : 'Aprobar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Container Confirmation Modal */}
            {showApproveContainerConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Home className="text-blue-600" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    ¿Aprobar la pensión completa?
                                </h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p>Esto aprobará:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>El contenedor principal</li>
                                        <li><span className="font-semibold text-gray-900">{localUnits.filter(u => u.status === 'pending').length} habitación(es)</span> pendiente(s)</li>
                                    </ul>
                                    <p className="pt-2 border-t border-gray-200 font-medium text-gray-900">
                                        Total: {localUnits.length} habitación(es)
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowApproveContainerConfirm(false)}
                                disabled={!!processingId}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmApproveContainer}
                                disabled={!!processingId}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/30"
                            >
                                {processingId === 'container' ? 'Aprobando...' : 'Aprobar Pensión'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContainerReviewModal;
