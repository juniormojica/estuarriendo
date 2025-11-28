import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, Zap, Shield, Award } from 'lucide-react';

const PlansPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
                        Elige el plan perfecto para ti
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                        Maximiza la visibilidad de tus propiedades y encuentra inquilinos más rápido con nuestros planes premium.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6 items-start">
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
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <Link
                                to="/perfil?tab=billing&plan=weekly"
                                className="block w-full bg-emerald-100 border border-transparent rounded-md py-2 px-4 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                                Seleccionar Plan Semanal
                            </Link>
                        </div>
                    </div>

                    {/* Plan Mensual (Destacado) */}
                    <div className="bg-white rounded-xl shadow-xl border-2 border-emerald-500 overflow-hidden transform scale-105 z-10 flex flex-col relative">
                        <div className="absolute top-0 inset-x-0 bg-emerald-500 h-1.5"></div>
                        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-20">
                            <div className="bg-yellow-400 text-xs font-bold px-8 py-1 transform rotate-45 translate-x-8 translate-y-4 shadow-sm text-center">
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
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <Link
                                to="/perfil?tab=billing&plan=monthly"
                                className="block w-full bg-emerald-600 border border-transparent rounded-md py-2 px-4 text-center text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
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
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <Link
                                to="/perfil?tab=billing&plan=quarterly"
                                className="block w-full bg-emerald-100 border border-transparent rounded-md py-2 px-4 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
                            >
                                Seleccionar Plan Trimestral
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-10 bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">¿Tienes dudas sobre qué plan elegir?</h3>
                            <p className="mt-2 text-base text-gray-500">
                                Nuestro equipo está disponible para ayudarte a seleccionar la mejor opción para tus necesidades. Contáctanos y te asesoraremos sin compromiso.
                            </p>
                        </div>
                        <div className="mt-4 lg:mt-0 flex justify-center lg:justify-end">
                            <a
                                href="mailto:soporte@estuarriendo.com"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
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
