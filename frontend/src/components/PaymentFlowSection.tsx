import React, { useState } from 'react';
import { User, PaymentRequest } from '../types';
import { Clock, AlertCircle } from 'lucide-react';
import PlanComparisonCards from './PlanComparisonCards';
import PaymentUploadForm from './PaymentUploadForm';

interface PaymentFlowSectionProps {
    user: User;
    paymentRequest: PaymentRequest | null;
    onPaymentSuccess: () => void;
}

const ownerPlanLinks: Record<string, string> = {
    weekly: 'https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=4c24839bb711495d85bbcb828114e61f',
    monthly: '',
    quarterly: ''
};

const PaymentFlowSection: React.FC<PaymentFlowSectionProps> = ({ user, paymentRequest, onPaymentSuccess }) => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer' | null>(null);

    const isPremium = user.plan === 'premium';
    const isExpired = user.planExpiresAt ? new Date(user.planExpiresAt) < new Date() : false;
    const canUploadPayment = !isPremium || isExpired;

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
        setPaymentMethod(null);
        setTimeout(() => {
            document.getElementById('payment-method-section')?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 100);
    };

    if (!canUploadPayment) {
        return null;
    }

    const mpLink = selectedPlan ? ownerPlanLinks[selectedPlan] || '' : '';

    return (
        <div className="space-y-6">
            {isPremium && isExpired && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-2">
                        <AlertCircle className="h-8 w-8 text-orange-600" />
                        <h4 className="text-xl font-bold text-orange-800">Plan Premium Expirado</h4>
                    </div>
                    <p className="text-orange-700">
                        Renueva tu suscripción para seguir disfrutando de todos los beneficios premium.
                    </p>
                </div>
            )}

            {paymentRequest && paymentRequest.status === 'pending' && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Clock className="h-20 w-20 text-yellow-500 mb-4" />
                        <h4 className="text-2xl font-bold text-yellow-800 mb-3">Pago en Revisión</h4>
                        <p className="text-yellow-700 mb-4 max-w-md text-lg">
                            Hemos recibido tu comprobante. El plan se activará en un máximo de 2 horas.
                        </p>
                        <div className="bg-yellow-100 px-6 py-3 rounded-lg">
                            <p className="text-sm text-yellow-600 font-medium mb-1">Referencia</p>
                            <p className="text-xl font-mono font-bold text-yellow-800">{paymentRequest.referenceCode}</p>
                        </div>
                        <p className="text-sm text-yellow-600 mt-4">
                            No puedes enviar otra solicitud mientras esta esté pendiente
                        </p>
                    </div>
                </div>
            )}

            {paymentRequest && paymentRequest.status === 'rejected' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                        <h4 className="text-xl font-bold text-red-800">Pago Rechazado</h4>
                    </div>
                    <p className="text-red-700">
                        Tu último pago fue rechazado. Por favor intenta nuevamente.
                    </p>
                </div>
            )}

            {(!paymentRequest || paymentRequest.status === 'rejected') && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
                    {/* Step Indicators */}
                    <div className="flex items-center justify-center mb-10">
                        <div className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedPlan ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                                    {selectedPlan ? '✓' : '1'}
                                </div>
                                <span className={`mt-2 text-sm font-medium ${selectedPlan ? 'text-green-600' : 'text-blue-600'}`}>
                                    Selecciona Plan
                                </span>
                            </div>
                            <div className={`w-24 h-1 mx-4 ${selectedPlan ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${paymentMethod ? 'bg-green-500 text-white' : selectedPlan ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                                    {paymentMethod ? '✓' : '2'}
                                </div>
                                <span className={`mt-2 text-sm font-medium ${paymentMethod ? 'text-green-600' : selectedPlan ? 'text-blue-600' : 'text-gray-400'}`}>
                                    Método de Pago
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Plan Selection */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Paso 1: Elige tu Plan Premium</h4>
                        <PlanComparisonCards
                            onSelectPlan={handlePlanSelect}
                            selectedPlan={selectedPlan as 'weekly' | 'monthly' | 'quarterly'}
                            currentPlan={user.plan}
                        />
                    </div>

                    {/* Step 2: Payment Method */}
                    <div id="payment-method-section" className={`transition-all duration-300 ${selectedPlan ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Paso 2: Selecciona tu método de pago
                        </h4>
                        {!selectedPlan && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-blue-700 text-center font-medium">
                                    ⬆️ Primero selecciona un plan arriba para continuar
                                </p>
                            </div>
                        )}

                        {selectedPlan && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('mercadopago')}
                                        className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                                    >
                                        <div className="text-center">
                                            <span className="block font-bold text-gray-900 mb-1">Mercado Pago</span>
                                            <span className="text-sm text-gray-500">Pago inmediato (PSE, Tarjeta)</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('transfer')}
                                        className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'transfer' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                                    >
                                        <div className="text-center">
                                            <span className="block font-bold text-gray-900 mb-1">Transferencia</span>
                                            <span className="text-sm text-gray-500">Subir comprobante manual</span>
                                        </div>
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-gray-100 transition-all duration-300">
                                    {paymentMethod === 'mercadopago' && (
                                        <div className="text-center py-6">
                                            {mpLink ? (
                                                <>
                                                    <a
                                                        href={mpLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all w-full md:w-auto"
                                                    >
                                                        Pagar con Mercado Pago
                                                    </a>
                                                    <p className="mt-4 text-sm text-gray-500">Serás redirigido a la pasarela segura de Mercado Pago.</p>
                                                </>
                                            ) : (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <p className="text-yellow-800 font-medium">Link de Mercado Pago no disponible aún para este plan.</p>
                                                    <p className="text-yellow-600 text-sm mt-1">Puedes usar transferencia manual en su lugar.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {paymentMethod === 'transfer' && (
                                        <div className="animate-fadeIn">
                                            <PaymentUploadForm
                                                user={user}
                                                onSuccess={onPaymentSuccess}
                                                selectedPlan={selectedPlan as 'weekly' | 'monthly' | 'quarterly'}
                                            />
                                        </div>
                                    )}

                                    {!paymentMethod && (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                            <p className="text-gray-500">Selecciona un método de pago arriba para continuar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentFlowSection;
