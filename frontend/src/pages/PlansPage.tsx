import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, Zap, Shield, Award } from 'lucide-react';

const PlansPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Elige el plan perfecto para ti
                    </h1>
                    <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-500">
                        Maximiza la visibilidad de tus propiedades y encuentra inquilinos más rápido con nuestros planes premium.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:gap-6 lg:grid-cols-3 lg:gap-8 items-stretch">
                    {/* Plan Semanal */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="p-6 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Plan Semanal</h3>
                            <p className="mt-2 flex items-baseline text-gray-900">
                                <span className="text-4xl font-extrabold tracking-tight">$12.500</span>
                                <span className="ml-1 text-base font-semibold text-gray-500">/semana</span>
                            </p>
                            <p className="mt-4 text-sm text-gray-500">Ideal para pruebas rápidas o necesidades temporales.</p>

                            <ul className="mt-4 space-y-3">
                                <li className="flex">
                                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Duración de 7 días</span>
                                </li>
                                <li className="flex">
                                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Hasta 10 imágenes por propiedad</span>
                                </li>
                                <li className="flex">
                                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Sello de Verificación básico</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                            <Link
                                to="/perfil?tab=billing&plan=weekly"
                                className="block w-full min-h-[48px] bg-emerald-100 border border-transparent rounded-lg py-3 px-4 text-center text-sm sm:text-base font-medium text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300 transition-colors"
                            >
                                Seleccionar Plan Semanal
                            </Link>
                        </div>
                    </div>

                    {/* Plan Mensual (Destacado) */}
                    <div className="bg-white rounded-xl shadow-xl border-2 border-emerald-500 overflow-hidden transform scale-105 z-10 flex flex-col relative">
                        <div className="absolute top-0 inset-x-0 bg-emerald-500 h-1.5"></div>
                        <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden z-20">
                            <div className="absolute top-6 -right-8 w-32 bg-yellow-400 text-xs font-bold py-1 transform rotate-45 text-center shadow-sm">
                                POPULAR
                            </div>
                        </div>

                        <div className="p-6 flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Plan Mensual</h3>
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            </div>
                            <p className="mt-2 flex items-baseline text-gray-900">
                                <span className="text-4xl font-extrabold tracking-tight">$20.000</span>
                                <span className="ml-1 text-base font-semibold text-gray-500">/mes</span>
                            </p>
                            <p className="mt-4 text-sm text-gray-500">La mejor opción para la mayoría de los propietarios.</p>

                            <ul className="mt-4 space-y-3">
                                <li className="flex">
                                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Duración de 30 días</span>
                                </li>
                                <li className="flex">
                                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500"><strong>10 imágenes</strong> + 1 video</span>
                                </li>
                                <li className="flex">
                                    <Shield className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Sello de <strong>Verificación Premium</strong></span>
                                </li>
                                <li className="flex">
                                    <Zap className="flex-shrink-0 w-5 h-5 text-yellow-500" />
                                    <span className="ml-3 text-sm text-gray-500">Mayor visibilidad en búsquedas</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                            <Link
                                to="/perfil?tab=billing&plan=monthly"
                                className="block w-full min-h-[48px] bg-emerald-600 border border-transparent rounded-lg py-3 px-4 text-center text-sm sm:text-base font-medium text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm"
                            >
                                Seleccionar Plan Mensual
                            </Link>
                        </div>
                    </div>

                    {/* Plan Trimestral */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="p-6 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Plan Trimestral</h3>
                            <p className="mt-2 flex items-baseline text-gray-900">
                                <span className="text-4xl font-extrabold tracking-tight">$28.000</span>
                                <span className="ml-1 text-base font-semibold text-gray-500">/3 meses</span>
                            </p>
                            <p className="mt-4 text-sm text-emerald-600 font-medium">¡Ahorra $32.000 comparado con el plan mensual!</p>

                            <ul className="mt-4 space-y-3">
                                <li className="flex">
                                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Duración de 90 días</span>
                                </li>
                                <li className="flex">
                                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Todo lo del plan mensual</span>
                                </li>
                                <li className="flex">
                                    <Award className="flex-shrink-0 w-5 h-5 text-emerald-500" />
                                    <span className="ml-3 text-sm text-gray-500">Prioridad máxima en soporte</span>
                                </li>
                                <li className="flex">
                                    <Zap className="flex-shrink-0 w-5 h-5 text-yellow-500" />
                                    <span className="ml-3 text-sm text-gray-500">Destacado permanente en portada</span>
                                </li>
                            </ul>
                        </div>
                        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                            <Link
                                to="/perfil?tab=billing&plan=quarterly"
                                className="block w-full min-h-[48px] bg-emerald-100 border border-transparent rounded-lg py-3 px-4 text-center text-sm sm:text-base font-medium text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300 transition-colors"
                            >
                                Seleccionar Plan Trimestral
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 sm:mt-10 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">¿Tienes dudas sobre qué plan elegir?</h3>
                            <p className="mt-2 text-sm sm:text-base text-gray-500">
                                Nuestro equipo está disponible para ayudarte a seleccionar la mejor opción para tus necesidades. Contáctanos y te asesoraremos sin compromiso.
                            </p>
                        </div>
                        <div className="mt-4 lg:mt-0 flex justify-center lg:justify-end">
                            <a
                                href="mailto:soporte@estuarriendo.com"
                                className="inline-flex items-center min-h-[48px] px-6 py-3 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                            >
                                Contactar Soporte
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlansPage;
