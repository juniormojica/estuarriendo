import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PropertyReport, ReportActivityLog } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Search, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Phone, FileText, MessageCircle, ChevronRight, User as UserIcon, Info, ArrowLeft } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';
import { useAppSelector } from '../../store/hooks';

const PropertyReportsAdmin: React.FC = () => {
    const toast = useToast();
    const { user: currentAdmin } = useAppSelector((state) => state.auth);
    const [reports, setReports] = useState<PropertyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'investigating' | 'confirmed' | 'rejected' | 'all'>('pending');

    // Drawer / Panel state
    const [selectedReport, setSelectedReport] = useState<PropertyReport | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

    // Action states
    const [adminNotes, setAdminNotes] = useState('');
    const [newLogNote, setNewLogNote] = useState('');
    const [newLogAction, setNewLogAction] = useState<string>('note_added');
    const [isProcessing, setIsProcessing] = useState(false);

    // Action Modals
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // const currentAdmin = JSON.parse(localStorage.getItem('estuarriendo_user') || '{}');

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await api.getPropertyReports(filter === 'all' ? undefined : filter as any);
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Error al cargar las solicitudes de devolución');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = (report: PropertyReport) => {
        setSelectedReport(report);
        setViewMode('detail');
        // Add activity log to mark as investigating if it's pending?
        // Let's rely on the first manual action to mark it as investigating to avoid false starts.
    };

    const handleCloseDetail = () => {
        setSelectedReport(null);
        setViewMode('list');
        fetchReports(); // Refresh list to get latest statuses
    };

    const handleAddActivity = async () => {
        console.log('handleAddActivity triggered:', { selectedReport, currentAdminId: currentAdmin?.id, newLogNote });
        if (!selectedReport || !currentAdmin?.id || !newLogNote.trim()) {
            console.error('Missing required data for addActivity', {
                hasReport: !!selectedReport,
                hasAdminId: !!currentAdmin?.id,
                hasNote: !!newLogNote.trim()
            });
            return;
        }

        setIsProcessing(true);
        try {
            const newLog = await api.addReportActivity(Number(selectedReport.id), {
                adminId: currentAdmin.id,
                action: newLogAction,
                notes: newLogNote
            });

            toast.success('Actividad registrada correctamente');
            setNewLogNote('');

            // Update local state to show the new log immediately
            setSelectedReport(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: prev.status === 'pending' ? 'investigating' : prev.status,
                    activityLogs: [newLog, ...(prev.activityLogs || [])]
                };
            });
        } catch (error) {
            toast.error('Error al registrar la actividad');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedReport || !currentAdmin?.id) return;

        setIsProcessing(true);
        try {
            await api.confirmPropertyReport(Number(selectedReport.id), {
                adminId: currentAdmin.id,
                adminNotes: adminNotes
            });
            toast.success('Solicitud confirmada. Crédito devuelto.');
            setShowConfirmModal(false);
            handleCloseDetail();
        } catch (error) {
            toast.error('Error al confirmar la solicitud');
        } finally {
            setIsProcessing(false);
            setAdminNotes('');
        }
    };

    const handleReject = async () => {
        if (!selectedReport || !currentAdmin?.id) return;

        setIsProcessing(true);
        try {
            await api.rejectPropertyReport(Number(selectedReport.id), {
                adminId: currentAdmin.id,
                adminNotes: adminNotes
            });
            toast.success('Solicitud rechazada.');
            setShowRejectModal(false);
            handleCloseDetail();
        } catch (error) {
            toast.error('Error al rechazar la solicitud');
        } finally {
            setIsProcessing(false);
            setAdminNotes('');
        }
    };

    const getReasonText = (reason: string) => {
        switch (reason) {
            case 'already_rented': return 'Ya fue arrendada';
            case 'incorrect_info': return 'Info incorrecta/No responde';
            case 'scam': return 'Sospecha de fraude';
            default: return 'Otra razón';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" /> Pendiente</span>;
            case 'investigating':
                return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"><Search className="w-3.5 h-3.5" /> En Revisión</span>;
            case 'confirmed':
                return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Aprobado</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"><XCircle className="w-3.5 h-3.5" /> Denegado</span>;
            default:
                return null;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'contact_attempt': return 'Intento de Contacto';
            case 'note_added': return 'Nota Interna';
            case 'owner_contacted': return 'Contacto Establecido';
            case 'owner_confirmed_rented': return 'Propietario Confirmó Arriendo';
            case 'owner_denied': return 'Propietario Negó Arriendo';
            case 'confirmed': return 'Resolución: Confirmada';
            case 'rejected': return 'Resolución: Denegada';
            default: return 'Actividad';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'contact_attempt': return <Phone className="w-4 h-4 text-blue-600" />;
            case 'note_added': return <FileText className="w-4 h-4 text-gray-600" />;
            case 'owner_contacted': return <MessageCircle className="w-4 h-4 text-purple-600" />;
            case 'owner_confirmed_rented': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
            case 'owner_denied': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'confirmed': return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
            case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    if (viewMode === 'detail' && selectedReport) {
        const owner = selectedReport.property?.owner;
        const tenant = selectedReport.reporter;
        const hasLogs = selectedReport.activityLogs && selectedReport.activityLogs.length > 0;
        const isResolved = selectedReport.status === 'confirmed' || selectedReport.status === 'rejected';

        return (
            <div className="space-y-6 max-w-6xl mx-auto pb-12">
                <div className="flex items-center gap-4 border-b pb-4">
                    <button
                        onClick={handleCloseDetail}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 text-gray-600 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" /> Regresar
                    </button>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Reporte #{selectedReport.id}
                            {getStatusBadge(selectedReport.status)}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Tenant Info */}
                        <div className="bg-white rounded-xl shadow-sm border p-5">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-gray-500" /> Datos del Inquilino (Reportante)
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Nombre</p>
                                    <p className="font-medium text-gray-900">{tenant?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{tenant?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Reportó porque</p>
                                    <p className="font-medium text-amber-700 bg-amber-50 inline-block px-2 py-1 rounded">{getReasonText(selectedReport.reason)}</p>
                                </div>
                                {selectedReport.description && (
                                    <div>
                                        <p className="text-xs text-gray-500">Comentarios del inquilino</p>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border mt-1 italic">"{selectedReport.description}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Propietario a Contactar
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">Propiedad</p>
                                    <p className="font-medium text-gray-900">{selectedReport.property?.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Nombre Propietario</p>
                                    <p className="font-medium text-gray-900">{owner?.name || 'No disponible'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Teléfono / WhatsApp</p>
                                    <p className="font-medium text-gray-900">{owner?.whatsapp || owner?.phone || 'No disponible'}</p>
                                </div>

                                {owner?.whatsapp && (
                                    <a
                                        href={`https://wa.me/${owner.whatsapp.replace(/\D/g, '')}?text=Hola, nos contactamos desde EstuArriendo por el reporte de un inquilino sobre tu propiedad "${selectedReport.property?.title}".`}
                                        target="_blank" rel="noreferrer"
                                        className="mt-4 w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium py-2 rounded-lg transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" /> Abrir WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Timeline & Actions */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Historial de Gestión</h3>

                            {!hasLogs ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 font-medium">Aún no hay actividades registradas.</p>
                                    <p className="text-xs text-gray-400 mt-1">Registra tu primer intento de contacto abajo.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {selectedReport.activityLogs?.map((log, index) => (
                                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                {getActionIcon(log.action)}
                                            </div>
                                            {/* Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-gray-900 text-sm">{getActionLabel(log.action)}</span>
                                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{log.admin?.name || 'Admin'}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2">
                                                    {log.createdAt && !isNaN(new Date(log.createdAt).getTime())
                                                        ? format(new Date(log.createdAt), "dd MMM yyyy, h:mm a", { locale: es })
                                                        : 'Recientemente'}
                                                </p>
                                                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{log.notes}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Log Form */}
                            {!isResolved && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Registrar Nueva Actividad</h4>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <select
                                            value={newLogAction}
                                            onChange={(e) => setNewLogAction(e.target.value)}
                                            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:w-48 bg-white"
                                        >
                                            <option value="note_added">Nota Interna</option>
                                            <option value="contact_attempt">Intento de Contacto</option>
                                            <option value="owner_contacted">Contacto Exitoso</option>
                                            <option value="owner_confirmed_rented">Propietario Confirmó</option>
                                            <option value="owner_denied">Propietario Negó</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newLogNote}
                                            onChange={(e) => setNewLogNote(e.target.value)}
                                            placeholder="Detalle (ej: Llamé pero enviaron a buzón)"
                                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                                        />
                                        <button
                                            onClick={handleAddActivity}
                                            disabled={isProcessing || !newLogNote.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                        >
                                            {isProcessing ? 'Guardando...' : 'Añadir'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resolution Actions */}
                        {!isResolved && (
                            <div className="bg-white rounded-xl shadow-sm border p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Resolución del Caso</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Toma una decisión final sobre este reporte. Se requiere documentar al menos un intento de contacto.
                                </p>

                                {!hasLogs ? (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm flex gap-2">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                        Para poder aceptar o denegar, primero debes registrar alguna actividad en el historial de arriba.
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            className="flex-1 py-3 px-4 bg-white border-2 border-red-200 text-red-700 hover:bg-red-50 rounded-xl font-bold transition-colors text-center"
                                        >
                                            Denegar Devolución
                                        </button>
                                        <button
                                            onClick={() => setShowConfirmModal(true)}
                                            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-center shadow-sm"
                                        >
                                            Aprobar (Devolver Crédito)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {isResolved && (
                            <div className={`p-4 rounded-xl border ${selectedReport.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                <h3 className={`text-lg font-bold flex items-center gap-2 mb-1 ${selectedReport.status === 'confirmed' ? 'text-emerald-800' : 'text-red-800'}`}>
                                    {selectedReport.status === 'confirmed' ? <CheckCircle /> : <XCircle />}
                                    Caso Cerrado: {selectedReport.status === 'confirmed' ? 'Crédito Devuelto' : 'Devolución Denegada'}
                                </h3>
                                <p className={`text-sm ${selectedReport.status === 'confirmed' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    Este reporte ya fue procesado y archivado.
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Confirm/Reject Modals inside detail view (absolute/fixed overlay) */}
                {/* Confirm Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        {/* ... mostly same as before but tailored for the detail view */}
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
                                <CheckCircle className="text-emerald-500" /> Confirmar Devolución
                            </h3>
                            <p className="text-sm text-gray-600">Se reembolsará 1 crédito al inquilino y la propiedad se marcará como arrendada.</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nota Final (Visible en historial)</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Motivo final de validación..."
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-20"
                                />
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button onClick={() => setShowConfirmModal(false)} className="flex-[1] py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">Cancelar</button>
                                <button onClick={handleConfirm} disabled={isProcessing} className="flex-[2] py-2 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
                                    {isProcessing ? 'Procesando...' : 'Aprobar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reject Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
                                <XCircle className="text-red-500" /> Denegar Devolución
                            </h3>
                            <p className="text-sm text-gray-600">El crédito NO será devuelto al inquilino.</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del rechazo <span className="text-red-500">*</span></label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Explique por qué se denegó..."
                                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
                                />
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button onClick={() => setShowRejectModal(false)} className="flex-[1] py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">Cancelar</button>
                                <button onClick={handleReject} disabled={!adminNotes || isProcessing} className="flex-[2] py-2 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50">
                                    {isProcessing ? 'Procesando...' : 'Denegar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default List View
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 border-b pb-2">Gestión de Devoluciones</h2>
                    <p className="text-gray-500 text-sm mt-1">Evalúa reportes de propiedades arrendadas y contacta propietarios.</p>
                </div>

                <div className="flex bg-white rounded-lg shadow-sm border p-1 overflow-x-auto max-w-full">
                    {(['pending', 'investigating', 'confirmed', 'rejected', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${filter === f ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'pending' ? 'Pendientes' : f === 'investigating' ? 'En Revisión' : f === 'confirmed' ? 'Confirmados' : f === 'rejected' ? 'Rechazados' : 'Todos'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Cargando reportes...
                    </div>
                ) : reports.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Sin solicitudes</h3>
                        <p className="text-gray-500">No hay reportes en la bandeja de {filter}.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase tracking-wider">
                                    <th className="p-4 font-medium">Fecha</th>
                                    <th className="p-4 font-medium">Propiedad</th>
                                    <th className="p-4 font-medium">Reportado por</th>
                                    <th className="p-4 font-medium">Razón</th>
                                    <th className="p-4 font-medium">Estado</th>
                                    <th className="p-4 font-medium text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 divide-solid">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-sm whitespace-nowrap text-gray-500">
                                            {report.createdAt
                                                ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: es })
                                                : '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{report.property?.title || 'Propiedad Eliminada'}</div>
                                            <div className="text-xs text-indigo-600 font-medium">Dueño: {report.property?.owner?.name || 'Oculto'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{report.reporter?.name}</div>
                                                <div className="text-gray-500 text-xs">{report.reporter?.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-gray-700 bg-gray-100 inline-block px-2 py-0.5 rounded">{getReasonText(report.reason)}</div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleOpenDetail(report)}
                                                className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Ver Detalles <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyReportsAdmin;
