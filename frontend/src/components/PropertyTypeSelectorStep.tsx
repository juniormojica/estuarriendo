import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Hotel, DoorOpen, ArrowLeft } from 'lucide-react';
import type { PropertyType } from '../types';

interface PropertyTypeSelectorStepProps {
    onSelect: (type: PropertyType) => void;
    selectedType?: PropertyType;
}

const PropertyTypeSelectorStep: React.FC<PropertyTypeSelectorStepProps> = ({ onSelect, selectedType }) => {
    const navigate = useNavigate();

    const propertyTypes = [
        {
            id: 'habitacion' as PropertyType,
            title: 'Habitación Independiente',
            description: 'Espacio privado con entrada propia, ideal para una persona',
            icon: <DoorOpen className="w-12 h-12" />,
            isContainer: false
        },
        {
            id: 'pension' as PropertyType,
            title: 'Pensión / Residencia',
            description: 'Varias habitaciones con servicios compartidos para estudiantes',
            icon: <Hotel className="w-12 h-12" />,
            isContainer: true
        },
        {
            id: 'apartamento' as PropertyType,
            title: 'Apartamento',
            description: 'Completo o por habitaciones, con espacios separados',
            icon: <Building2 className="w-12 h-12" />,
            isContainer: true
        },
        {
            id: 'aparta-estudio' as PropertyType,
            title: 'Aparta-estudio',
            description: 'Espacio integrado, privado o compartido',
            icon: <Home className="w-12 h-12" />,
            isContainer: true
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver al Dashboard
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        ¿Qué deseas publicar?
                    </h1>
                    <p className="text-lg text-gray-600">
                        Selecciona el tipo de propiedad que quieres ofrecer
                    </p>
                </div>

                {/* Property Type Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {propertyTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => onSelect(type.id)}
                            className={`
                relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 transform hover:-translate-y-2
                border-2 ${selectedType === type.id
                                    ? 'border-blue-500 ring-4 ring-blue-200'
                                    : 'border-transparent hover:border-blue-300'
                                }
                text-left group
              `}
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white group-hover:scale-110 transition-transform">
                                {type.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {type.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {type.description}
                            </p>

                            {/* Container Badge */}
                            {type.isContainer && (
                                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Requiere configuración de unidades
                                </div>
                            )}

                            {/* Arrow indicator */}
                            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                    className="w-6 h-6 text-blue-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Help Text */}
                <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        ℹ️ ¿Cuál es la diferencia?
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>
                            <strong>Habitación Independiente:</strong> Formulario simple, publicación inmediata
                        </li>
                        <li>
                            <strong>Contenedores (Pensión/Apartamento/Aparta-estudio):</strong> Formulario extendido con:
                            <ul className="ml-6 mt-1 space-y-1">
                                <li>• Servicios incluidos (alimentación, limpieza, etc.)</li>
                                <li>• Reglas de convivencia</li>
                                <li>• Áreas comunes</li>
                                <li>• Constructor de habitaciones individuales</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PropertyTypeSelectorStep;
