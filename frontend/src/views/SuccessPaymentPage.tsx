'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';

const SuccessPaymentPage: React.FC = () => {
    const pathname = usePathname();
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        // Parse URL parameters from MercadoPago redirect
        // Typically MP sends: ?collection_id=...&collection_status=...&payment_id=...&status=approved...
        const searchParams = new URLSearchParams(location.search);

        const pid = searchParams.get('payment_id') || searchParams.get('collection_id');
        const stat = searchParams.get('status') || searchParams.get('collection_status');

        if (pid) setPaymentId(pid);
        if (stat) setStatus(stat);
    }, [location]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center animate-bounce-short">
                    <div className="rounded-full bg-emerald-100 p-4">
                        <CheckCircle className="w-16 h-16 text-emerald-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    ¡Pago Exitoso!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Tu transacción ha sido procesada correctamente.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">

                    <div className="text-center mb-8">
                        <p className="text-gray-700 font-medium text-lg">
                            Membresía Activada
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            Tus créditos o beneficios de suscripción ya están disponibles en tu cuenta.
                        </p>
                    </div>

                    {paymentId && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">ID de Transacción:</span>
                                <span className="font-mono font-medium text-gray-900">{paymentId}</span>
                            </div>
                            {status && (
                                <div className="flex justify-between items-center text-sm mt-2">
                                    <span className="text-gray-500">Estado:</span>
                                    <span className="capitalize font-medium text-emerald-600 flex items-center">
                                        {status === 'approved' ? 'Aprobado' : status}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Link
                            href="/perfil?tab=billing"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                        >
                            Ir a mi Perfil <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>

                        <Link
                            href="/"
                            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                        >
                            Explorar Propiedades <ExternalLink className="ml-2 w-4 h-4 text-gray-400" />
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-bounce-short {
                    animation: bounce-short 1s ease-in-out 1;
                }
            `}</style>
        </div>
    );
};

export default SuccessPaymentPage;
