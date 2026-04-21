import React from 'react';
import { Search, Filter, Home, CheckCircle } from 'lucide-react';

const HowToSearchPage: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Guía Paso a Paso</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Cómo Buscar Alojamiento
                    </p>
                    <p className="mt-4 text-xl text-gray-500">
                        Encontrar tu lugar ideal es muy fácil con EstuArriendo. Sigue estos simples pasos.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-8 rounded-xl shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600">
                                <Search className="h-8 w-8" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Explora las opciones</h3>
                            <p className="text-gray-600 text-lg">
                                Utiliza nuestra barra de búsqueda principal en la página de inicio. Puedes buscar por ciudad, sector o cerca de tu universidad específica. Tenemos una amplia variedad de habitaciones, apartaestudios y apartamentos compartidos.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-8 rounded-xl shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600">
                                <Filter className="h-8 w-8" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Usa los filtros inteligentes</h3>
                            <p className="text-gray-600 text-lg">
                                Refina tu búsqueda utilizando nuestros filtros. Ajusta tu presupuesto máximo, selecciona el tipo de propiedad que prefieres, y elige las comodidades esenciales para ti (como Wi-Fi, baño privado, cocina, etc.).
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-8 rounded-xl shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600">
                                <Home className="h-8 w-8" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Revisa los detalles</h3>
                            <p className="text-gray-600 text-lg">
                                Haz clic en las propiedades que te interesen para ver fotos de alta calidad, descripciones detalladas, reglas de la casa y la ubicación aproximada. Asegúrate de leer todo cuidadosamente.
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-8 rounded-xl shadow-sm">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">4. Contacta y reserva</h3>
                            <p className="text-gray-600 text-lg">
                                Si estás registrado, puedes guardar tus propiedades favoritas. Cuando estés listo, utiliza los botones de contacto en la página de la propiedad para comunicarte de forma segura y coordinar visitas o proceder con la reserva.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowToSearchPage;
