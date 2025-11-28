import React, { useState, useRef, useEffect } from 'react';
import { Upload, Copy, Check, AlertCircle, FileText, X } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface PaymentUploadFormProps {
    user: any;
    onSuccess: () => void;
    initialPlan?: string | null;
}

const PaymentUploadForm: React.FC<PaymentUploadFormProps> = ({ user, onSuccess, initialPlan }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState('');

    const getValidPlan = (plan: string | null | undefined): 'weekly' | 'monthly' | 'quarterly' => {
        if (plan === 'weekly' || plan === 'monthly' || plan === 'quarterly') return plan;
        return 'monthly';
    };

    const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'quarterly'>(getValidPlan(initialPlan));
    const instructionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialPlan && instructionsRef.current) {
            instructionsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [initialPlan]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const referenceCode = `ESTU-P-${user.id.substring(0, 4).toUpperCase()}-${Date.now().toString().substring(9)}`;

    const plans = [
        { id: 'weekly' as const, name: 'Semanal', price: 12500, duration: 7, description: '7 días' },
        { id: 'monthly' as const, name: 'Mensual', price: 20000, duration: 30, description: '30 días', recommended: true },
        { id: 'quarterly' as const, name: 'Trimestral', price: 28000, duration: 90, description: '90 días', savings: 'Ahorra $32,000' }
    ];

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            if (selectedFile.size > 2 * 1024 * 1024) {
                setError('El archivo no debe superar los 2MB');
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
        const selectedPlanData = plans.find(p => p.id === selectedPlan)!;

        try {
            await api.createPaymentRequest({
                userId: user.id,
                userName: user.name,
                amount: selectedPlanData.price,
                planType: selectedPlan,
                planDuration: selectedPlanData.duration,
                referenceCode,
                proofImage: preview
            });
            onSuccess();
        } catch (err) {
            console.error('Error al enviar comprobante:', err);
            setError('Error al enviar el comprobante. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div ref={instructionsRef} className="bg-emerald-600 p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Instrucciones de Pago</h3>
                <p className="text-emerald-100 text-sm">
                    Realiza la transferencia y sube el comprobante para activar tu Plan Premium.
                </p>
            </div>

            <div className="p-6 space-y-6">
                {/* Plan Selection */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Selecciona tu Plan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative p-4 rounded-lg border-2 transition-all text-left ${selectedPlan === plan.id
                                    ? 'border-emerald-600 bg-emerald-50'
                                    : 'border-gray-200 hover:border-emerald-300'
                                    }`}
                            >
                                {plan.recommended && (
                                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                        Recomendado
                                    </span>
                                )}
                                <div className="text-center">
                                    <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-2">
                                        ${plan.price.toLocaleString('es-CO')}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                                    {plan.savings && (
                                        <p className="text-xs text-emerald-600 font-medium mt-2">{plan.savings}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount */}
                <div className="text-center pb-6 border-b border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">Total a Pagar</p>
                    <p className="text-3xl font-bold text-gray-900">
                        ${plans.find(p => p.id === selectedPlan)!.price.toLocaleString('es-CO')} <span className="text-sm font-normal text-gray-500">COP</span>
                    </p>
                </div>

                {/* Bank Accounts */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Cuentas Bancarias</h4>
                    <div className="grid grid-cols-1 gap-4">
                        {bankAccounts.map((account, index) => (
                            <div key={`${account.name}-${index}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">{account.name}</span>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{account.type}</span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{account.holder}</p>
                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                    <code className="text-emerald-600 font-mono font-medium">{account.number}</code>
                                    <button
                                        onClick={() => handleCopy(account.number, `${account.name}-${index}`)}
                                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                                        title="Copiar número"
                                    >
                                        {copied === `${account.name}-${index}` ? <Check size={16} /> : <Copy size={16} />}
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
                            <p className="text-xs text-gray-500 mt-1">Máximo 2MB</p>
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
