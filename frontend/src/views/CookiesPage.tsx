import React from 'react';
import { Cookie } from 'lucide-react';

const CookiesPage: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <Cookie className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Política de Cookies
                    </h2>
                    <p className="mt-4 text-gray-500">
                        Última actualización: 23 de Febrero de 2026
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 prose prose-emerald prose-lg max-w-none text-gray-600">
                    <p>
                        Esta Política de Cookies explica cómo y por qué utilizamos cookies y tecnologías similares en <strong>EstuArriendo</strong>.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">¿Qué son las cookies?</h3>
                    <p>
                        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil) cuando visitas un sitio web. Ayudan al sitio a recordar información sobre tu visita, lo que puede facilitar tu próxima visita y hacer que el sitio te resulte más útil.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Tipos de Cookies que Utilizamos</h3>
                    <ul className="list-disc pl-6 space-y-4">
                        <li>
                            <strong>Cookies Estrictamente Necesarias:</strong>
                            <p className="mt-1 text-base">Son esenciales para navegar por la plataforma y utilizar sus funciones, como acceder a tu cuenta o mantener tu sesión iniciada (Tokens de autenticación).</p>
                        </li>
                        <li>
                            <strong>Cookies de Rendimiento o Analíticas:</strong>
                            <p className="mt-1 text-base">Recogen información sobre cómo usas nuestra web, como las páginas que visitas con mayor frecuencia. Estos datos nos ayudan a mejorar el funcionamiento de la página de forma anónima (por ejemplo, Google Analytics).</p>
                        </li>
                        <li>
                            <strong>Cookies de Funcionalidad:</strong>
                            <p className="mt-1 text-base">Permiten al sitio recordar tus elecciones (como ciudades recientes de búsqueda, filtros aplicados, o tus propiedades guardadas como favoritas en el navegador local).</p>
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Control de Cookies</h3>
                    <p>
                        Puedes configurar tu navegador de internet para que te avise de la recepción de cookies o para impedir la instalación de las mismas. Sin embargo, ten en cuenta que la desactivación de las "Cookies Estrictamente Necesarias" podría afectar el correcto funcionamiento técnico de las sesiones de usuario en EstuArriendo.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CookiesPage;
