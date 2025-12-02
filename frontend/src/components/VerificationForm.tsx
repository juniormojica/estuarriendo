import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader, FileText, Camera, Receipt } from 'lucide-react';
import { VerificationDocuments } from '../types';
import { api } from '../services/api';

interface VerificationFormProps {
    userId: string;
    onSuccess: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ userId, onSuccess }) => {
    const [documents, setDocuments] = useState<Partial<VerificationDocuments>>({});
    const [previews, setPreviews] = useState<Partial<Record<keyof VerificationDocuments, string>>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    const handleFileChange = async (field: keyof VerificationDocuments, file: File | null) => {
        if (!file) {
            setDocuments(prev => ({ ...prev, [field]: undefined }));
            setPreviews(prev => ({ ...prev, [field]: undefined }));
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Por favor selecciona solo archivos de imagen (JPG, PNG)');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`El archivo es muy grande. Tamaño máximo: 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return;
        }

        setError('');

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setDocuments(prev => ({ ...prev, [field]: base64 }));
            setPreviews(prev => ({ ...prev, [field]: base64 }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        setLoading(true);

        try {
            // Use placeholder images if no documents are uploaded (temporary for testing)
            const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

            const documentsToSubmit: VerificationDocuments = {
                idFront: documents.idFront || placeholderImage,
                idBack: documents.idBack || placeholderImage,
                selfie: documents.selfie || placeholderImage,
                utilityBill: documents.utilityBill || placeholderImage
            };

            const result = await api.submitVerification(userId, documentsToSubmit);

            if (result.success) {
                onSuccess();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error al enviar los documentos. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const DocumentUploadField = ({
        field,
        label,
        icon: Icon,
        description
    }: {
        field: keyof VerificationDocuments;
        label: string;
        icon: React.ElementType;
        description: string;
    }) => (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-emerald-500 transition-colors">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{label}</h4>
                    <p className="text-xs text-gray-600 mb-3">{description}</p>

                    {previews[field] ? (
                        <div className="relative inline-block">
                            <img
                                src={previews[field]}
                                alt={label}
                                className="w-32 h-32 object-cover rounded-lg border-2 border-emerald-500"
                            />
                            <button
                                type="button"
                                onClick={() => handleFileChange(field, null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 bg-opacity-90 text-white text-xs py-1 px-2 rounded-b-lg flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Cargado
                            </div>
                        </div>
                    ) : (
                        <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4 mr-2 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Seleccionar archivo</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Requisitos para la verificación:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Las imágenes deben ser claras y legibles</li>
                            <li>Tamaño máximo por archivo: 2MB</li>
                            <li>Formatos aceptados: JPG, PNG</li>
                            <li>Los documentos serán revisados en un máximo de 24 horas</li>
                            <li className="text-emerald-700 font-semibold">Puedes enviar sin documentos para probar el flujo (temporal)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DocumentUploadField
                    field="idFront"
                    label="Cédula - Frente"
                    icon={FileText}
                    description="Foto clara del frente de tu cédula de ciudadanía"
                />

                <DocumentUploadField
                    field="idBack"
                    label="Cédula - Reverso"
                    icon={FileText}
                    description="Foto clara del reverso de tu cédula de ciudadanía"
                />

                <DocumentUploadField
                    field="selfie"
                    label="Selfie con Cédula"
                    icon={Camera}
                    description="Foto tuya sosteniendo tu cédula junto a tu rostro"
                />

                <DocumentUploadField
                    field="utilityBill"
                    label="Recibo de Servicios"
                    icon={Receipt}
                    description="Recibo de servicios públicos de la propiedad (máx. 3 meses)"
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? (
                        <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Enviar Verificación
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default VerificationForm;
