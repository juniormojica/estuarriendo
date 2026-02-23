import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { compressImage, formatFileSize } from '../utils/imageCompression';
import { directUpload, CLOUDINARY_FOLDERS } from '../services/directUploadService';

interface PaymentUploadFormProps {
    user: User;
    onSuccess: () => void;
    selectedPlan: 'weekly' | 'monthly' | 'quarterly' | null;
}

const PaymentUploadForm: React.FC<PaymentUploadFormProps> = ({ user, onSuccess, selectedPlan }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const referenceCode = `ESTU-P-${user.id.substring(0, 4).toUpperCase()}-${Date.now().toString().substring(9)}`;

    const plans = {
        weekly: { name: 'Semanal', price: 12500, duration: 7 },
        monthly: { name: 'Mensual', price: 20000, duration: 30 },
        quarterly: { name: 'Trimestral', price: 28000, duration: 90 }
    };

    const selectedPlanData = selectedPlan ? plans[selectedPlan] : null;

    const bankAccounts = [
        { name: 'Nequi', number: '3044736477', type: 'Ahorros', holder: 'Junior Armando Mojica Dominguez' },
        { name: 'Llave Bre-B', number: '1065841642', type: 'Cuenta', holder: 'Junior Armando Mojica Dominguez' },
        { name: 'Llave Bre-B', number: '@moj841', type: 'Alias', holder: 'Junior Armando Mojica Dominguez' }
    ];

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Allow up to 10MB raw, we will compress it
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError(`El archivo no debe superar los 10MB. Tamaño actual: ${formatFileSize(selectedFile.size)}`);
                return;
            }

            try {
                // Compress image for payment proof (get File object)
                const compressedFile = await compressImage(selectedFile, 'payment');

                setFile(compressedFile);

                // Create object URL for preview
                const objectUrl = URL.createObjectURL(compressedFile);
                setPreview(objectUrl);
                setError('');

            } catch (err) {
                console.error('Error compressing image:', err);
                setError('Error al procesar la imagen. Intenta con otra.');
            }
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !preview) {
            setError('Por favor sube el comprobante de pago');
            return;
        }

        if (!selectedPlanData) {
            setError('Por favor selecciona un plan');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Upload to Cloudinary directly
            const uploadResult = await directUpload(file, CLOUDINARY_FOLDERS.PAYOUTS);

            // 2. Create payment request with URL
            await api.createPaymentRequest({
                userId: user.id,
                amount: selectedPlanData.price,
                planType: selectedPlan!,
                planDuration: selectedPlanData.duration,
                referenceCode,
                proofImageUrl: uploadResult.url,
                proofImagePublicId: uploadResult.publicId
            });

            onSuccess();
        } catch (err: any) {
            console.error('Error al enviar comprobante:', err);
            console.error('Error response:', err.response);
            // Extract error message from backend response
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Error al enviar el comprobante. Inténtalo de nuevo.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChangeImage = () => {
        setFile(null);
        setPreview(null);
        setError('');
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Instrucciones de Pago</h3>
                <p className="text-emerald-100 text-sm">
                    {selectedPlanData ? (
                        <>Realiza la transferencia de <span className="font-bold">${selectedPlanData.price.toLocaleString('es-CO')} COP</span> ({selectedPlanData.name}) y sube el comprobante.</>
                    ) : (
                        <>Selecciona un plan para continuar</>
                    )}
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Reference Code */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Código de Referencia</p>
                            <p className="text-lg font-mono font-bold text-blue-700">{referenceCode}</p>
                            <p className="text-xs text-blue-600 mt-1">Incluye este código en la descripción de tu transferencia</p>
                        </div>
                        <button
                            onClick={() => handleCopy(referenceCode, 'ref')}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            {copied === 'ref' ? (
                                <Check className="h-5 w-5 text-green-600" />
                            ) : (
                                <Copy className="h-5 w-5 text-blue-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Bank Accounts - Compact Grid */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Cuentas Disponibles</h4>
                        <p className="text-xs text-gray-500">Junior Armando Mojica Dominguez</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {bankAccounts.map((account, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-900 text-sm">{account.name}</span>
                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                        {account.type}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-gray-700 text-sm">{account.number}</span>
                                    <button
                                        onClick={() => handleCopy(account.number, `acc-${index}`)}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    >
                                        {copied === `acc-${index}` ? (
                                            <Check className="h-3.5 w-3.5 text-green-600" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload Section */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Sube tu Comprobante</h4>

                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer"
                            >
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-700 font-medium mb-1">Haz clic para subir</p>
                                <p className="text-sm text-gray-500">PNG, JPG o PDF (máx. 2MB)</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="relative">
                                    <img
                                        src={preview}
                                        alt="Comprobante"
                                        className="w-full h-64 object-contain bg-gray-100 rounded-lg border border-gray-200"
                                        loading="lazy"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setPreview(null);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleChangeImage}
                                    className="w-full px-4 py-2 border-2 border-emerald-500 text-emerald-700 rounded-lg hover:bg-emerald-50 font-medium transition-colors flex items-center justify-center"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Cambiar Imagen
                                </button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || isSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                                <LoadingSpinner size="sm" />
                                <span>Enviando...</span>
                            </div>
                        ) : (
                            'Enviar Comprobante'
                        )}
                    </button>
                </form>

                {/* Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        <strong>Importante:</strong> Tu plan se activará en un máximo de 2 horas después de verificar tu pago.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentUploadForm;
