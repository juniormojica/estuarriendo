'use client';
import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, ChevronRight, User as UserIcon, Calendar, Mail, AlertTriangle, ZoomIn, Loader, Clock } from 'lucide-react';
import { User, VerificationProgress, DocumentVerificationStatus } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../ToastProvider';

interface VerificationReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onRefresh: () => Promise<void>;
}

type DocType = 'idFront' | 'idBack' | 'selfie' | 'utilityBill';

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
    isOpen,
    onClose,
    user,
    onRefresh
}) => {
    const toast = useToast();
    const [progress, setProgress] = useState<VerificationProgress | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(false);
    
    const [activeDoc, setActiveDoc] = useState<DocType>('idFront');
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchProgress = async () => {
        if (!user) return;
        setLoadingProgress(true);
        try {
            const data = await api.getVerificationProgress(user.id);
            setProgress(data);
        } catch (error) {
            console.error('Error fetching progress:', error);
            toast.error('Error al cargar progreso de documentos');
        } finally {
            setLoadingProgress(false);
        }
    };

    // Reset state when user changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setActiveDoc('idFront');
            setIsRejecting(false);
            setRejectionReason('');
            fetchProgress();
        } else {
            setProgress(null);
        }
    }, [isOpen, user]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    const availableDocs = [
        { id: 'idFront', label: 'Cédula (Frente)' },
        { id: 'idBack', label: 'Cédula (Dorso)' },
        { id: 'selfie', label: 'Selfie' },
        { id: 'utilityBill', label: 'Recibo Público' },
    ].filter(doc => progress?.documents[doc.id as DocType]?.url) as { id: DocType; label: string }[];

    const activeDocInfo = progress?.documents[activeDoc];
    const currentDocUrl = activeDocInfo?.url;

    const handleApprove = async () => {
        if (!user.id) return;
        setIsProcessing(true);
        try {
            const res = await api.reviewSingleVerificationDocument(user.id, activeDoc, 'approved');
            if (res.success) {
                toast.success('Documento aprobado exitosamente');
                await fetchProgress(); // reload internal state
                await onRefresh(); // reload standard table state
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error('Error approving:', error);
            toast.error('Error al aprobar documento');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!user.id) return;
        if (!rejectionReason.trim()) return;

        setIsProcessing(true);
        try {
            const res = await api.reviewSingleVerificationDocument(user.id, activeDoc, 'rejected', rejectionReason);
            if (res.success) {
                toast.success('Documento rechazado exitosamente');
                setIsRejecting(false);
                setRejectionReason('');
                await fetchProgress();
                await onRefresh();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            toast.error('Error al rechazar documento');
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status: DocumentVerificationStatus) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded flex items-center gap-1"><Check className="w-3 h-3"/> Aprobado</span>;
            case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded flex items-center gap-1"><Clock className="w-3 h-3"/> Pendiente</span>;
            case 'rejected': return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded flex items-center gap-1"><XCircle className="w-3 h-3"/> Rechazado</span>;
            default: return null;
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full hidden sm:block">
                            <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5" />
                                    {user.email}
                                </span>
                                {user.verificationSubmittedAt && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(user.verificationSubmittedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar - Thumbnails */}
                    <div className="w-64 bg-gray-50 border-r border-gray-200 hidden md:flex flex-col">
                        <div className="p-4 flex-1 overflow-y-auto">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documentos</h3>
                            <div className="flex flex-col gap-3">
                                {loadingProgress ? (
                                    <div className="flex justify-center p-4"><Loader className="w-6 h-6 animate-spin text-gray-400" /></div>
                                ) : availableDocs.map((doc) => {
                                    const docStatus = progress?.documents[doc.id]?.status as DocumentVerificationStatus;
                                    const docUrl = progress?.documents[doc.id]?.url;

                                    return (
                                        <button
                                            key={doc.id}
                                            onClick={() => {
                                                setActiveDoc(doc.id);
                                                setIsRejecting(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${activeDoc === doc.id
                                                ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-2 mb-2">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-medium ${activeDoc === doc.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                                        {doc.label}
                                                    </span>
                                                    {activeDoc === doc.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
                                                </div>
                                                {getStatusBadge(docStatus)}
                                            </div>
                                            <div className="aspect-video w-full bg-gray-100 rounded overflow-hidden relative">
                                                <img
                                                    src={docUrl!}
                                                    alt={doc.label}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                                {!loadingProgress && availableDocs.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center mt-4">Sin documentos subidos</p>
                                )}
                            </div>
                        </div>

                        {/* Match Info Panel */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Match de Identidad
                            </h3>
                            <div className="space-y-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 shadow-sm text-sm">
                                <div>
                                    <span className="block text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">👤 Nombre Completo</span>
                                    <span className="font-medium text-gray-900 block truncate" title={progress?.userInfo?.name || user.name}>
                                        {progress?.userInfo?.name || user.name}
                                    </span>
                                </div>
                                {progress?.userInfo?.idNumber && (
                                    <div>
                                        <span className="block text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">🪪 Documento</span>
                                        <span className="font-medium text-gray-900 block truncate">
                                            {progress.userInfo.idType || 'CC'} {progress.userInfo.idNumber}
                                        </span>
                                    </div>
                                )}
                                {(activeDoc === 'idFront' || activeDoc === 'idBack') && progress?.userInfo?.birthDate && (
                                    <div>
                                        <span className="block text-gray-500 text-[11px] uppercase tracking-wide mb-0.5">📅 Nacimiento</span>
                                        <span className="font-medium text-gray-900 block">
                                            {new Date(progress.userInfo.birthDate).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col bg-gray-900 relative">
                        {/* Mobile Tabs */}
                        <div className="md:hidden flex overflow-x-auto bg-gray-800 p-2 gap-2 snap-x">
                            {availableDocs.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => {
                                        setActiveDoc(doc.id);
                                        setIsRejecting(false);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors snap-center ${activeDoc === doc.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {doc.label}
                                </button>
                            ))}
                        </div>

                        {/* Image Viewer */}
                        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative group">
                            {loadingProgress ? (
                                <Loader className="w-12 h-12 animate-spin text-gray-400" />
                            ) : currentDocUrl ? (
                                <img
                                    src={currentDocUrl}
                                    alt="Documento seleccionado"
                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <AlertTriangle className="w-12 h-12 mb-2 opacity-50" />
                                    <p>Documento no disponible</p>
                                </div>
                            )}

                            {/* Zoom Hint Overlay */}
                            {currentDocUrl && (
                                <a
                                    href={currentDocUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                    title="Abrir imagen original"
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500 hidden sm:block">
                        {activeDocInfo?.status === 'approved' && <span className="text-green-600 font-medium">Este documento ya fue aprobado.</span>}
                        {activeDocInfo?.status === 'rejected' && <span className="text-red-600 font-medium">Este documento está rechazado.</span>}
                        {activeDocInfo?.status === 'pending' && <span className="text-yellow-600 font-medium">Pendiente de revisión.</span>}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {!isRejecting ? (
                            <>
                                <button
                                    onClick={() => setIsRejecting(true)}
                                    disabled={loadingProgress || !activeDocInfo?.url || activeDocInfo?.status !== 'pending'}
                                    className="flex-1 sm:flex-none px-6 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rechazar Documento
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing || loadingProgress || !activeDocInfo?.url || activeDocInfo?.status !== 'pending'}
                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Aprobar Documento
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center animate-in slide-in-from-bottom-2 duration-200">
                                <input
                                    type="text"
                                    placeholder="Razón del rechazo..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setIsRejecting(false); setRejectionReason(''); }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={!rejectionReason.trim() || isProcessing}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? 'Procesando...' : 'Confirmar Rechazo'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
