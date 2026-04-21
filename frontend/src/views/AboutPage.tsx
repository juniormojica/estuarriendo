import React from 'react';
import { Users, Target, Shield, Award } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Subtitle & Title */}
                <div className="text-center mb-16">
                    <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Nuestra Historia</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Sobre Nosotros
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        Conectando estudiantes con hogares seguros y cómodos en Colombia.
                    </p>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-16">
                    <div className="p-8 sm:p-12">
                        <div className="prose prose-emerald prose-lg text-gray-600 mx-auto">
                            <p>
                                En <strong>EstuArriendo</strong>, entendemos que encontrar el lugar adecuado para vivir durante la etapa universitaria es fundamental para el éxito académico y personal. Nacimos con la misión de simplificar este proceso y brindar tranquilidad tanto a estudiantes como a sus familias.
                            </p>
                            <p>
                                Nuestra plataforma fue creada por ex-estudiantes que vivieron las dificultades de buscar alojamiento en ciudades nuevas. Por eso, hemos diseñado una experiencia transparente, segura y enfocada en las necesidades reales de la comunidad estudiantil.
                            </p>
                            <h3>Nuestra Visión</h3>
                            <p>
                                Ser la plataforma líder y más confiable para el alquiler de alojamiento estudiantil en Colombia, creando una comunidad donde estudiantes y propietarios se conecten de manera segura y eficiente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Value 1 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                            <Shield className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Seguridad Primero</h3>
                        <p className="text-gray-500 text-sm">
                            Verificamos propietarios y propiedades para garantizar un entorno seguro.
                        </p>
                    </div>

                    {/* Value 2 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                            <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Comunidad</h3>
                        <p className="text-gray-500 text-sm">
                            Fomentamos relaciones basadas en el respeto y la confianza mutua.
                        </p>
                    </div>

                    {/* Value 3 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                            <Target className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Simplicidad</h3>
                        <p className="text-gray-500 text-sm">
                            Hacemos que buscar y reservar alojamiento sea un proceso fácil y rápido.
                        </p>
                    </div>

                    {/* Value 4 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                            <Award className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Calidad</h3>
                        <p className="text-gray-500 text-sm">
                            Mantenemos altos estándares en las propiedades que listamos en nuestra plataforma.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
