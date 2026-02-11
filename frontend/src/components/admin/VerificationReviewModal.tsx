import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, ChevronRight, User as UserIcon, Calendar, Mail, AlertTriangle, ZoomIn } from 'lucide-react';
import { User } from '../../types';

interface VerificationReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onApprove: (userId: string) => Promise<void>;
    onReject: (userId: string, reason: string) => Promise<void>;
}

type DocType = 'idFront' | 'idBack' | 'selfie' | 'utilityBill';

export const VerificationReviewModal: React.FC<VerificationReviewModalProps> = ({
    isOpen,
    onClose,
    user,
    onApprove,
    onReject
}) => {
    const [activeDoc, setActiveDoc] = useState<DocType>('idFront');
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset state when user changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setActiveDoc('idFront');
            setIsRejecting(false);
            setRejectionReason('');
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

    const documents = [
        { id: 'idFront', label: 'Cédula (Frente)', url: user.verificationDocuments?.idFront },
        { id: 'idBack', label: 'Cédula (Dorso)', url: user.verificationDocuments?.idBack },
        { id: 'selfie', label: 'Selfie', url: user.verificationDocuments?.selfie },
        { id: 'utilityBill', label: 'Recibo Público', url: user.verificationDocuments?.utilityBill },
    ].filter(doc => doc.url) as { id: DocType; label: string; url: string }[];

    const handleApprove = async () => {
        if (!user.id) return;
        setIsProcessing(true);
        try {
            await onApprove(user.id);
            onClose();
        } catch (error) {
            console.error('Error approving:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!user.id) return;
        if (!rejectionReason.trim()) return;

        setIsProcessing(true);
        try {
            await onReject(user.id, rejectionReason);
            onClose();
        } catch (error) {
            console.error('Error rejecting:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const currentDocUrl = user.verificationDocuments?.[activeDoc];

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
                    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto hidden md:flex flex-col gap-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Documentos</h3>
                        {documents.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => setActiveDoc(doc.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${activeDoc === doc.id
                                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100'
                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${activeDoc === doc.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {doc.label}
                                    </span>
                                    {activeDoc === doc.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
                                </div>
                                <div className="aspect-video w-full bg-gray-100 rounded overflow-hidden relative">
                                    <img
                                        src={doc.url}
                                        alt={doc.label}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col bg-gray-900 relative">
                        {/* Mobile Tabs */}
                        <div className="md:hidden flex overflow-x-auto bg-gray-800 p-2 gap-2 snap-x">
                            {documents.map((doc) => (
                                <button
                                    key={doc.id}
                                    onClick={() => setActiveDoc(doc.id)}
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
                            {currentDocUrl ? (
                                <img
                                    src={currentDocUrl}
                                    alt="Documento seleccionado"
                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
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
                        Revisando documento {documents.findIndex(d => d.id === activeDoc) + 1} de {documents.length}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {!isRejecting ? (
                            <>
                                <button
                                    onClick={() => setIsRejecting(true)}
                                    className="flex-1 sm:flex-none px-6 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rechazar
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Aprobar Verificación
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
