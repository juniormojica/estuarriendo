import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Hotel, DoorOpen } from 'lucide-react';

interface PropertyTypeOption {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    route: string;
}

const PropertyTypeSelector = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const propertyTypes: PropertyTypeOption[] = [
        {
            id: 'habitacion',
            title: 'Habitación Independiente',
            description: 'Espacio privado con entrada propia, ideal para una persona',
            icon: <DoorOpen className="w-12 h-12" />,
            route: '/submit-property/independent-room'
        },
        {
            id: 'pension',
            title: 'Pensión / Residencia',
            description: 'Varias habitaciones con servicios compartidos para estudiantes',
            icon: <Hotel className="w-12 h-12" />,
            route: '/submit-property/container/pension'
        },
        {
            id: 'apartamento',
            title: 'Apartamento',
            description: 'Completo o por habitaciones, con espacios separados',
            icon: <Building2 className="w-12 h-12" />,
            route: '/submit-property/container/apartamento'
        },
        {
            id: 'aparta-estudio',
            title: 'Aparta-estudio',
            description: 'Espacio integrado, privado o compartido',
            icon: <Home className="w-12 h-12" />,
            route: '/submit-property/container/aparta-estudio'
        }
    ];

    const handleSelect = (type: PropertyTypeOption) => {
        setSelectedType(type.id);
        // Navigate to the appropriate form
        navigate(type.route, { state: { propertyType: type.id } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
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
                            onClick={() => handleSelect(type)}
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
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        ¿No estás seguro? Puedes cambiar el tipo más adelante
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PropertyTypeSelector;
