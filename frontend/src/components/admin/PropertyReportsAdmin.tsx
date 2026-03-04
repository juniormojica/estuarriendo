import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PropertyReport } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PropertyReportsAdmin: React.FC = () => {
    const [reports, setReports] = useState<PropertyReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'confirmed' | 'rejected' | 'all'>('pending');

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<PropertyReport | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Placeholder for current user admin ID. In a real app, you'd get this from Redux/Context
    const currentAdmin = JSON.parse(localStorage.getItem('estuarriendo_user') || '{}');

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await api.getPropertyReports(filter === 'all' ? undefined : filter as any);
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Error al cargar las solicitudes de devolución');
        } finally {
            setLoading(false);
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
            toast.success('Solicitud confirmada. Crédito devuelto y propiedad marcada como arrendada.');
            setShowConfirmModal(false);
            fetchReports();
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
            fetchReports();
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
            case 'confirmed':
                return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Confirmado</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium"><XCircle className="w-3.5 h-3.5" /> Rechazado</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 border-b pb-2">Solicitudes de Devolución</h2>
                    <p className="text-gray-500 text-sm mt-1">Revisa los reportes de propiedades arrendadas para devolver créditos a los inquilinos.</p>
                </div>

                <div className="flex bg-white rounded-lg shadow-sm border p-1">
                    {(['pending', 'confirmed', 'rejected', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'pending' ? 'Pendientes' : f === 'confirmed' ? 'Confirmados' : f === 'rejected' ? 'Rechazados' : 'Todos'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Cargando solicitudes...
                    </div>
                ) : reports.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Sin solicitudes</h3>
                        <p className="text-gray-500">No hay solicitudes de devolución en estado {filter}.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase tracking-wider">
                                    <th className="p-4 font-medium">Fecha</th>
                                    <th className="p-4 font-medium">Propiedad</th>
                                    <th className="p-4 font-medium">Inquilino</th>
                                    <th className="p-4 font-medium">Razón</th>
                                    <th className="p-4 font-medium">Estado</th>
                                    <th className="p-4 font-medium text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 divide-solid">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-sm whitespace-nowrap text-gray-500">
                                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: es })}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{report.property?.title || 'ID: ' + report.propertyId}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900">{report.reporter?.name || 'Usuario'}</div>
                                                <div className="text-gray-500 text-xs">{report.reporter?.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-gray-700 mb-1">{getReasonText(report.reason)}</div>
                                            {report.description && (
                                                <div className="text-xs text-gray-500 line-clamp-2 max-w-xs bg-gray-50 p-1.5 rounded border">
                                                    "{report.description}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="p-4 text-right whitespace-nowrap space-x-2">
                                            {report.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => { setSelectedReport(report); setShowConfirmModal(true); setAdminNotes(''); }}
                                                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Evaluar
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
                            <CheckCircle className="text-emerald-500" /> Confirmar Solicitud
                        </h3>

                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-semibold mb-1">Acciones que se ejecutarán:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Se le devolverá <strong>1 crédito</strong> al inquilino.</li>
                                    {selectedReport.reason === 'already_rented' && (
                                        <li>La propiedad se marcará automáticamente como <strong>Arrendada ({`isRented = true`})</strong>.</li>
                                    )}
                                    <li>Se le notificará al propietario (si aplica) y al inquilino.</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nota de administración (opcional)</label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Ej: Verificado por llamada con propietario..."
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-20"
                            />
                        </div>

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                                disabled={isProcessing}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isProcessing}
                                className="flex-[2] py-2 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 flex items-center justify-center transition disabled:opacity-50"
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar Devolución'}
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <button
                                onClick={() => { setShowConfirmModal(false); setShowRejectModal(true); setAdminNotes(''); }}
                                className="text-xs text-red-500 hover:text-red-700 underline underline-offset-2"
                            >
                                Mejor ir a Rechazar Solicitud
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
                            <XCircle className="text-red-500" /> Rechazar Solicitud
                        </h3>

                        <p className="text-sm text-gray-600">
                            Esta acción denegará la devolución del crédito. Se le notificará al inquilino sobre este rechazo.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Razón del rechazo <span className="text-red-500">*</span></label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Ej: Nos comunicamos con el propietario y la propiedad sigue disponible..."
                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
                            />
                        </div>

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                                disabled={isProcessing}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!adminNotes || isProcessing}
                                className="flex-[2] py-2 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 flex items-center justify-center transition disabled:opacity-50"
                            >
                                {isProcessing ? 'Procesando...' : 'Rechazar Solicitud'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PropertyReportsAdmin;
