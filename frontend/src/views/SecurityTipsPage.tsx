import React from 'react';
import { AlertTriangle, Key, Eye, CreditCard, ShieldCheck } from 'lucide-react';

const SecurityTipsPage: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Tu seguridad es prioridad</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Consejos de Seguridad
                    </p>
                    <p className="mt-4 text-xl text-gray-500">
                        Sigue estas recomendaciones para garantizar una experiencia de búsqueda y arrendamiento segura.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-8 sm:p-10">

                        <div className="space-y-10">
                            {/* Tip 1 */}
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="sm:w-16 flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Eye className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Visita la propiedad antes de pagar</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Nunca realices pagos por adelantado sin haber visitado la propiedad personalmente o al menos haber realizado una videollamada completa en vivo mostrando cada rincón del lugar. Asegúrate de que el lugar coincide con las fotos publicadas.
                                    </p>
                                </div>
                            </div>

                            {/* Tip 2 */}
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="sm:w-16 flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cuidado con las ofertas "demasiado buenas"</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Si el precio es absurdamente bajo comparado con propiedades similares en la misma zona, o si el propietario te presiona para tomar una decisión inmediata con historias dramáticas, mantente alerta. Es una táctica de fraude común.
                                    </p>
                                </div>
                            </div>

                            {/* Tip 3 */}
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="sm:w-16 flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                        <Key className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Exige un contrato escrito</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        No te conformes con acuerdos verbales. Exige siempre un contrato de arrendamiento formal que detalle las condiciones, precio, duración, políticas sobre depósitos e inventario del estado inicial de la propiedad. Léelo completamente antes de firmar.
                                    </p>
                                </div>
                            </div>

                            {/* Tip 4 */}
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="sm:w-16 flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Métodos de pago seguros</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Evita pagos en efectivo sin recibo, giros internacionales o transferencias a cuentas que no correspondan al titular que afirma ser el dueño (pide la cédula y certificado de libertad). Siempre exige un comprobante de cada transacción que realices.
                                    </p>
                                </div>
                            </div>

                            {/* Tip 5 */}
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="sm:w-16 flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Comunícate por canales oficiales</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Para tu máxima protección, intenta mantener las conversaciones preliminares dentro de nuestra plataforma hasta que estés seguro de la identidad de la otra persona. Si detectas un anuncio sospechoso, repórtalo inmediatamente a nuestro equipo de soporte.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityTipsPage;
