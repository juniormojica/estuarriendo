import React from 'react';
import { Check, Sparkles, TrendingDown } from 'lucide-react';

interface Plan {
    id: 'weekly' | 'monthly' | 'quarterly';
    name: string;
    price: number;
    duration: number;
    description: string;
    recommended?: boolean;
    savings?: string;
}

interface PlanComparisonCardsProps {
    onSelectPlan: (planId: 'weekly' | 'monthly' | 'quarterly') => void;
    selectedPlan: 'weekly' | 'monthly' | 'quarterly' | null;
    currentPlan?: string;
}

const PlanComparisonCards: React.FC<PlanComparisonCardsProps> = ({
    onSelectPlan,
    selectedPlan,
    currentPlan
}) => {
    const plans: Plan[] = [
        {
            id: 'weekly',
            name: 'Semanal',
            price: 12500,
            duration: 7,
            description: '7 días de acceso premium'
        },
        {
            id: 'monthly',
            name: 'Mensual',
            price: 20000,
            duration: 30,
            description: '30 días de acceso premium',
            recommended: true
        },
        {
            id: 'quarterly',
            name: 'Trimestral',
            price: 28000,
            duration: 90,
            description: '90 días de acceso premium',
            savings: 'Ahorra $32,000'
        }
    ];

    const benefits = [
        'Publicaciones destacadas',
        'Soporte prioritario',
        'Estadísticas avanzadas',
        'Sin anuncios'
    ];

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Elige tu Plan Premium</h3>
                <p className="text-sm text-gray-600">Selecciona el plan que mejor se adapte a tus necesidades</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    const isCurrent = currentPlan === 'premium';

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-xl border-2 transition-all duration-300 ${isSelected
                                ? 'border-emerald-500 shadow-xl scale-105'
                                : plan.recommended
                                    ? 'border-emerald-300 shadow-lg'
                                    : 'border-gray-200 shadow-md hover:border-emerald-200 hover:shadow-lg'
                                } ${plan.recommended ? 'md:-mt-2 md:mb-2' : ''}`}
                        >
                            {/* Badge */}
                            {plan.recommended && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">

                                        <span>Más Popular</span>
                                    </div>
                                </div>
                            )}
                            {plan.savings && !plan.recommended && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                                        <TrendingDown className="h-3 w-3" />
                                        <span>{plan.savings}</span>
                                    </div>
                                </div>
                            )}

                            <div className={`p-4 ${plan.recommended ? 'pt-6' : 'pt-4'}`}>
                                {/* Plan Name */}
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h4>
                                <p className="text-xs text-gray-600 mb-3">{plan.description}</p>

                                {/* Price */}
                                <div className="mb-4">
                                    <div className="flex items-baseline">
                                        <span className="text-3xl font-extrabold text-gray-900">
                                            ${(plan.price / 1000).toFixed(0)}k
                                        </span>
                                        <span className="text-gray-600 ml-1 text-sm">COP</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        ${Math.round(plan.price / plan.duration).toLocaleString()} por día
                                    </p>
                                </div>

                                {/* Benefits - Compact */}
                                <ul className="space-y-1.5 mb-4">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start text-xs">
                                            <Check className="h-4 w-4 text-emerald-500 mr-1.5 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => onSelectPlan(plan.id)}
                                    disabled={isCurrent}
                                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 ${isSelected
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                        : plan.recommended
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        } ${isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isCurrent ? 'Plan Actual' : isSelected ? 'Seleccionado ✓' : 'Seleccionar'}
                                </button>

                                {plan.savings && (
                                    <p className="text-center text-xs text-emerald-600 font-semibold mt-1.5">
                                        vs. 3 meses del plan mensual
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Trust Indicators - Compact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
                <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h5 className="text-xs font-semibold text-blue-900 mb-0.5">Pago Seguro</h5>
                        <p className="text-xs text-blue-700">
                            Activación en máximo 2 horas tras verificación.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanComparisonCards;
