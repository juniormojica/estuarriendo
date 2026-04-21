import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <Shield className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Política de Privacidad
                    </h2>
                    <p className="mt-4 text-gray-500">
                        Última actualización: 23 de Febrero de 2026
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 prose prose-emerald prose-lg max-w-none text-gray-600">
                    <p>
                        En <strong>EstuArriendo</strong>, estamos comprometidos con la protección de tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información cuando visitas y usas nuestro sitio web y servicios.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Información que Recopilamos</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Información de Registro:</strong> Cuando te registras, recopilamos tu nombre, dirección de correo electrónico, tipo de usuario (estudiante o propietario) y contraseña.</li>
                        <li><strong>Información del Perfil:</strong> Teléfono de contacto, universidad, y datos adicionales opcionales.</li>
                        <li><strong>Datos de Propiedades:</strong> Si eres propietario, recopilamos dirección de la propiedad, descripciones, fotografías e información relacionada.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Uso de tu Información</h3>
                    <p>Utilizamos la información recopilada para:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Facilitar la conexión entre estudiantes y propietarios.</li>
                        <li>Mejorar y personalizar tu experiencia en la plataforma.</li>
                        <li>Enviar notificaciones importantes sobre tu cuenta o propiedades.</li>
                        <li>Proteger nuestra plataforma contra fraudes y abusos.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Compartir Información</h3>
                    <p>
                        Tu información de contacto (nombre y teléfono proporcionado) sólo será visible para otros usuarios registrados cuando interactúen activamente (por ejemplo, al mostrar interés en una propiedad). No vendemos tus datos personales a terceros bajo ninguna circunstancia.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Seguridad de los Datos</h3>
                    <p>
                        Empleamos medidas técnicas, de cifrado de contraseñas y protocolos de seguridad estándar de la industria (como bases de datos protegidas y certificados SSL) para salvaguardar tus datos.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Tus Derechos</h3>
                    <p>
                        Tienes derecho a acceder, corregir o solicitar la eliminación total de tus datos personales en nuestra plataforma. Puedes realizar esto desde tu perfil de usuario o contactándonos a <strong>privacidad@estuarriendo.com</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
