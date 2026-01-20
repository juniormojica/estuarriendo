import React, { useState } from 'react';
import { Property, PropertyUnit } from '../../types';
import { X, Check, CheckCircle, XCircle, Home, MapPin, Wifi, Layout, Users, Bed, BedDouble } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../ToastProvider';

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

    const handleApproveAll = async () => {
        const pendingUnits = localUnits.filter(u => u.status === 'pending');
        if (pendingUnits.length === 0) return;

        if (!confirm(`¿Estás seguro de aprobar las ${pendingUnits.length} habitaciones pendientes? Esto también aprobará el contenedor si todas las unidades están listas.`)) return;

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

    const handleApproveContainer = async () => {
        const pendingUnits = localUnits.filter(u => u.status === 'pending');
        const totalUnits = localUnits.length;

        if (!confirm(`¿Estás seguro de aprobar la pensión completa?\n\nEsto aprobará:\n- El contenedor principal\n- ${pendingUnits.length} habitación(es) pendiente(s)\n\nTotal: ${totalUnits} habitación(es)`)) return;

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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-start z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Home className="text-blue-600" />
                            {container.title}
                        </h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {container.location?.city}</span>
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

                    {/* Container Info Review */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Información General</h3>
                        <p className="text-gray-600 text-sm mb-4">{container.description}</p>

                        {/* Common Areas Images */}
                        {container.images && container.images.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fotos Áreas Comunes</h4>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {container.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="w-24 h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
                                            onClick={() => setSelectedImage(typeof img === 'string' ? img : img.url)}
                                        >
                                            <img
                                                src={typeof img === 'string' ? img : img.url}
                                                alt={`Area Común ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Servicios</h4>
                                <div className="flex flex-wrap gap-2">
                                    {container.services?.map((service, idx) => (
                                        <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded text-xs text-gray-600 flex items-center gap-1">
                                            {service.isIncluded ? <Check size={10} className="text-green-500" /> : <X size={10} className="text-red-500" />}
                                            {service.serviceType}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Reglas</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {container.rules?.map((rule, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            {rule.isAllowed ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                                            {rule.ruleType}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
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
                                        onClick={handleApproveContainer}
                                        disabled={!!processingId}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                                        title="Aprueba el contenedor y todas sus habitaciones de una vez"
                                    >
                                        <Home size={16} />
                                        Aprobar Pensión Completa
                                    </button>
                                    <button
                                        onClick={handleApproveAll}
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
                                    <div className="flex flex-col md:flex-row gap-4">
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
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{unit.title}</h4>
                                                    <div className="text-blue-600 font-bold mt-1">{formatPrice(unit.monthlyRent)}</div>
                                                </div>
                                                {getStatusBadge(unit.status)}
                                            </div>

                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{unit.description}</p>

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
                                            <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4" onClick={e => e.stopPropagation()}>
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
        </div>
    );
};

export default ContainerReviewModal;
