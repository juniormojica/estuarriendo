import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, AlertCircle, FileText, X } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface PaymentUploadFormProps {
    user: any;
    onSuccess: () => void;
}

const PaymentUploadForm: React.FC<PaymentUploadFormProps> = ({ user, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const referenceCode = `ESTU-P-${user.id.substring(0, 4).toUpperCase()}-${Date.now().toString().substring(9)}`;

    const bankAccounts = [
        { name: 'Nequi', number: '300 123 4567', type: 'Ahorros' },
        { name: 'Daviplata', number: '300 987 6543', type: 'Ahorros' }
    ];

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('El archivo no debe superar los 5MB');
                return;
            }

            setFile(selectedFile);
            setError('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !preview) {
            setError('Por favor sube el comprobante de pago');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createPaymentRequest({
                userId: user.id,
                userName: user.name,
                amount: 25000,
                referenceCode,
                proofImage: preview
            });
            onSuccess();
        } catch (err) {
            setError('Error al enviar el comprobante. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-emerald-600 p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Instrucciones de Pago</h3>
                <p className="text-emerald-100 text-sm">
                    Realiza la transferencia y sube el comprobante para activar tu Plan Premium.
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Amount */}
                <div className="text-center pb-6 border-b border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">Total a Pagar</p>
                    <p className="text-3xl font-bold text-gray-900">$25.000 <span className="text-sm font-normal text-gray-500">COP</span></p>
                </div>

                {/* Bank Accounts */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Cuentas Bancarias</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bankAccounts.map((account) => (
                            <div key={account.name} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">{account.name}</span>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{account.type}</span>
                                </div>
                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                    <code className="text-emerald-600 font-mono font-medium">{account.number}</code>
                                    <button
                                        onClick={() => handleCopy(account.number, account.name)}
                                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                                        title="Copiar número"
                                    >
                                        {copied === account.name ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reference Code */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-blue-800 mb-1">Referencia de Pago</h4>
                            <p className="text-sm text-blue-700 mb-3">
                                Por favor incluye este código en la descripción de tu transferencia:
                            </p>
                            <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                                <code className="text-blue-800 font-mono font-bold">{referenceCode}</code>
                                <button
                                    onClick={() => handleCopy(referenceCode, 'ref')}
                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {copied === 'ref' ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900">Subir Comprobante</h4>

                    {!file ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                        >
                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 font-medium">
                                Haz clic para subir imagen o PDF
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Máximo 5MB</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                                    {file.type.startsWith('image/') ? (
                                        <img src={preview || ''} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <FileText className="h-6 w-6 text-gray-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X size={20} />
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

                    {error && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!file || isSubmitting}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Enviando...
                            </>
                        ) : (
                            'Enviar Comprobante'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentUploadForm;
