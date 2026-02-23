import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg mb-4 bg-white overflow-hidden transition-all duration-200">
            <button
                className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-gray-900 pr-4">{question}</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
            </button>
            <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="text-gray-600">{answer}</p>
            </div>
        </div>
    );
};

const FAQPage: React.FC = () => {
    const studentFaqs = [
        {
            question: "¿Tiene algún costo buscar alojamiento en EstuArriendo?",
            answer: "No, el uso de la plataforma es completamente gratuito para los estudiantes que buscan alojamiento. Puedes buscar, filtrar y contactar propiedades sin ningún costo oculto."
        },
        {
            question: "¿Cómo verifican las propiedades publicadas?",
            answer: "Nuestro equipo realiza un proceso de validación sobre la información del propietario y la propiedad antes de publicarla. Sin embargo, siempre recomendamos a los estudiantes visitar el lugar presencialmente antes de realizar cualquier pago."
        },
        {
            question: "¿Qué debo hacer si encuentro una publicación sospechosa?",
            answer: "Si notas algo inusual (precios absurdamente bajos, fotos que no coinciden, o peticiones de dinero por adelantado sin mostrar el lugar), por favor contáctanos inmediatamente a info@estuarriendo.com para investigar y retirar el anuncio si es necesario."
        },
        {
            question: "¿Puedo reservar una habitación directamente desde la página?",
            answer: "Actualmente operamos como un directorio que conecta estudiantes con arrendadores. Facilitamos el contacto seguro, pero tú acuerdas la visita, el contrato y los pagos directamente con el propietario."
        }
    ];

    const ownerFaqs = [
        {
            question: "¿Cómo puedo publicar mi propiedad?",
            answer: "Debes registrarte como 'Propietario', completar tu perfil y luego hacer clic en 'Publicar Propiedad'. Se te pedirá información detallada, fotos y seleccionar las comodidades y reglas del lugar."
        },
        {
            question: "¿Qué tipo de propiedades puedo anunciar?",
            answer: "Aceptamos habitaciones individuales, habitaciones compartidas, apartaestudios, y apartamentos pensados para la comunidad universitaria o técnica."
        },
        {
            question: "¿Cuánto tiempo tarda en aprobarse mi anuncio?",
            answer: "El proceso de revisión por nuestro equipo administrativo suele tardar entre 24 y 48 horas hábiles. Recibirás una notificación una vez tu anuncio esté activo."
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-4">
                        <HelpCircle className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Preguntas Frecuentes
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">
                        Encuentra respuestas a las dudas más comunes sobre el uso de nuestra plataforma.
                    </p>
                </div>

                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        Para Estudiantes
                    </h3>
                    <div className="space-y-4">
                        {studentFaqs.map((faq, index) => (
                            <FAQItem key={`student-faq-${index}`} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center pt-8 border-t border-gray-200">
                        Para Propietarios
                    </h3>
                    <div className="space-y-4">
                        {ownerFaqs.map((faq, index) => (
                            <FAQItem key={`owner-faq-${index}`} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>

                <div className="mt-16 text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-600 mb-4">¿No encontraste la respuesta que buscabas?</p>
                    <a href="mailto:info@estuarriendo.com" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                        Contáctanos
                    </a>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
