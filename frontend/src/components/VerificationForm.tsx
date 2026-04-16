'use client';
import React, { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader, FileText, Camera, Receipt, Clock } from 'lucide-react';
import { VerificationProgress, DocumentVerificationStatus, VerificationStatus } from '../types';
import { api } from '../services/api';
import { compressImage } from '../utils/imageCompression';
import { directUpload, CLOUDINARY_FOLDERS } from '../services/directUploadService';

interface VerificationFormProps {
    userId: string;
    userRole: 'student' | 'owner';
    onSuccess: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ userId, userRole, onSuccess }) => {
    const [progress, setProgress] = useState<VerificationProgress | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<{ docType: string; message: string } | null>(null);
    const [globalError, setGlobalError] = useState<string>('');

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const fetchProgress = async () => {
        setLoadingProgress(true);
        try {
            const data = await api.getVerificationProgress(userId);
            if (data) {
                setProgress(data);
                if (data.globalStatus === 'verified') {
                    onSuccess();
                }
            }
        } catch (error) {
            setGlobalError('Error al cargar el progreso de verificación');
        } finally {
            setLoadingProgress(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, [userId]);

    const handleFileUpload = async (documentType: string, file: File | null) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError({ docType: documentType, message: 'Selecciona solo archivos de imagen (JPG, PNG)' });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setUploadError({ docType: documentType, message: `Archivo muy grande. Máximo 10MB.` });
            return;
        }

        setUploadError(null);
        setUploadingDoc(documentType);

        try {
            const compressedFile = await compressImage(file, 'verification');
            const uploadResult = await directUpload(compressedFile, CLOUDINARY_FOLDERS.VERIFICATION);
            
            const submitResult = await api.submitSingleVerificationDocument(userId, documentType, uploadResult.url);
            
            if (submitResult.success) {
                // Refetch progress to see the pending status
                await fetchProgress();
            } else {
                setUploadError({ docType: documentType, message: submitResult.message });
            }
        } catch (err: any) {
            console.error('Error in handleFileUpload:', err);
            setUploadError({ docType: documentType, message: 'Error al subir el documento. Intenta de nuevo.' });
        } finally {
            setUploadingDoc(null);
        }
    };

    if (loadingProgress) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 mb-2" />
                No se pudo cargar la información de verificación. Intenta recargar la página.
            </div>
        );
    }

    const requiredDocs = [
        { id: 'idFront', label: 'Cédula Frente', icon: FileText, desc: 'Foto clara del frente de tu cédula de ciudadanía.' },
        { id: 'idBack', label: 'Cédula Reverso', icon: FileText, desc: 'Foto clara del reverso de tu cédula.' },
        { id: 'selfie', label: 'Selfie con Cédula', icon: Camera, desc: 'Sostén tu cédula a la altura de tu rostro sin taparlo.' }
    ];

    if (userRole === 'owner') {
        requiredDocs.push({ id: 'utilityBill', label: 'Recibo Público', icon: Receipt, desc: 'Recibo reciente a tu nombre (Antigüedad máxima: 3 meses).' });
    }

    const completedCount = requiredDocs.filter(d => ['pending', 'approved'].includes(progress.documents[d.id as keyof typeof progress.documents]?.status)).length;
    const progressPercent = Math.round((completedCount / requiredDocs.length) * 100);

    const getStatusInfo = (status: DocumentVerificationStatus) => {
        switch (status) {
            case 'approved': return { text: 'Aprobado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
            case 'pending': return { text: 'En Revisión', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
            case 'rejected': return { text: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle };
            default: return { text: 'Pendiente de Subir', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Upload };
        }
    };

    return (
        <div className="space-y-8">
            {globalError && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" /> {globalError}
                </div>
            )}

            {/* Progress Bar */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progreso de Verificación</h3>
                <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{progressPercent}% Completado</span>
                    <span className="text-sm text-gray-500">{completedCount} de {requiredDocs.length} documentos listos</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                    Sube tus documentos uno por uno. Cada documento será revisado de forma independiente para facilitar tu proceso.
                </p>
            </div>

            {/* Document Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requiredDocs.map((doc) => {
                    const docInfo = progress.documents[doc.id as keyof typeof progress.documents];
                    const docStatus = docInfo?.status || 'not_submitted';
                    const { text: statusText, color: statusColor, icon: StatusIcon } = getStatusInfo(docStatus);
                    const canUpload = docStatus === 'not_submitted' || docStatus === 'rejected';
                    const isUploading = uploadingDoc === doc.id;
                    const error = uploadError?.docType === doc.id ? uploadError.message : null;

                    return (
                        <div key={doc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <doc.icon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{doc.label}</h4>
                                        <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusText}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <p className="text-sm text-gray-600 mb-4">{doc.desc}</p>
                                
                                {docStatus === 'rejected' && docInfo?.rejectionReason && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                        <span className="font-semibold block mb-1">Motivo del rechazo:</span>
                                        {docInfo.rejectionReason}
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {canUpload ? (
                                    <div className="mt-auto relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            disabled={isUploading}
                                        />
                                        <button 
                                            disabled={isUploading}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:text-gray-600"
                                        >
                                            {isUploading ? (
                                                <><Loader className="w-4 h-4 animate-spin" /> Subiendo...</>
                                            ) : (
                                                <><Upload className="w-4 h-4" /> Seleccionar Imagen</>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        {docInfo.url && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Documento subido</span>
                                                <a href={docInfo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Ver imagen</a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VerificationForm;
