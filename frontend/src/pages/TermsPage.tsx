import React from 'react';
import { FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <FileText className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Términos y Condiciones de Uso
                    </h2>
                    <p className="mt-4 text-gray-500">
                        Última actualización: 23 de Febrero de 2026
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 prose prose-emerald prose-lg max-w-none text-gray-600">
                    <p>
                        Bienvenido a <strong>EstuArriendo</strong>. Al acceder o utilizar nuestra plataforma web, ya sea como estudiante buscando alojamiento o como propietario, aceptas estar sujeto a los siguientes Términos y Condiciones.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Naturaleza del Servicio</h3>
                    <p>
                        EstuArriendo actúa exclusivamente como un directorio que facilita el contacto entre propietarios con inmuebles disponibles y estudiantes o miembros de la comunidad educativa que buscan alojamiento. <strong>No somos una inmobiliaria ni intervenimos en el contrato de arrendamiento final, pagos, ni depósitos.</strong>
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Responsabilidades de los Usuarios</h3>
                    <p>
                        <strong>Estudiantes:</strong> Son responsables de verificar la autenticidad e idoneidad de las propiedades anunciadas y de sus dueños antes de realizar cualquier pago o firmar contratos.
                    </p>
                    <p>
                        <strong>Propietarios:</strong> Se comprometen a ofrecer información y fotografías veraces de las propiedades. Cualquier anuncio falso o engañoso será motivo de suspensión inmediata de la cuenta.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Políticas de Publicación</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>El contenido subido debe ser respetuoso y libre de discriminación.</li>
                        <li>Las fotos no deben mostrar personas ni violar derechos de autor.</li>
                        <li>Es obligatorio contar con los permisos legales para subarrendar o arrendar la propiedad publicada.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Privacidad y Datos</h3>
                    <p>
                        Valoramos tu privacidad. El uso de tus datos personales, como nombre e información de contacto, está regulado estrictamente por nuestra <strong>Política de Privacidad</strong>.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Limitación de Responsabilidad</h3>
                    <p>
                        EstuArriendo no se responsabiliza de daños, estafas, o conflictos derivados de las relaciones comerciales establecidas entre las partes conectadas a través de nuestra plataforma. Recomendamos visitar presencialmente los lugares y leer nuestras guías de seguridad.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Modificaciones de los Términos</h3>
                    <p>
                        Nos reservamos el derecho a modificar estos términos en cualquier momento. Los cambios sustanciales serán notificados a tu correo electrónico registrado.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
