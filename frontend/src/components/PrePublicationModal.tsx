'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    Camera,
    MapPin,
    DollarSign,
    FileText,
    Users,
    Images,
    Zap,
    ClipboardList,
    LayoutGrid,
    Wrench,
    CheckCircle2,
    Circle,
    ArrowRight,
    ArrowLeft,
    Lightbulb,
    Clock,
} from 'lucide-react';
import type { PropertyType } from '../types';

// ─── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = 'prepublication_modal_dismissed';

const getDismissedTypes = (): PropertyType[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const dismissType = (type: PropertyType) => {
    try {
        const existing = getDismissedTypes();
        if (!existing.includes(type)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, type]));
        }
    } catch {
        // silent
    }
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckItem {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface CheckSection {
    label: string;
    items: CheckItem[];
}

// ─── Checklist data ───────────────────────────────────────────────────────────
const ROOM_CHECKS: CheckSection[] = [
    {
        label: 'Fotografías',
        items: [
            {
                id: 'photos-room',
                icon: <Camera className="w-4 h-4" />,
                title: 'Fotos del cuarto (mínimo 3 ángulos)',
                description:
                    'Toma fotos con buena iluminación natural: desde la puerta, la ventana y un ángulo diagonal que muestre el espacio completo.',
            },
            {
                id: 'photos-bathroom',
                icon: <Camera className="w-4 h-4" />,
                title: 'Foto del baño',
                description:
                    'Muestra el baño limpio y ordenado. Si es compartido, menciona cuántas personas lo comparten.',
            },
            {
                id: 'photos-entrance',
                icon: <Camera className="w-4 h-4" />,
                title: 'Foto de la entrada o fachada',
                description:
                    'Ayuda al estudiante a identificar el lugar cuando llegue a visitarlo.',
            },
        ],
    },
    {
        label: 'Ubicación',
        items: [
            {
                id: 'location-address',
                icon: <MapPin className="w-4 h-4" />,
                title: 'Dirección exacta y barrio',
                description:
                    'Ten a la mano la dirección completa y el nombre del barrio. Esto es obligatorio para la publicación.',
            },
            {
                id: 'location-transport',
                icon: <MapPin className="w-4 h-4" />,
                title: 'Referencias de transporte cercano',
                description:
                    'Estaciones de metro, paraderos de bus o ciclovía próximos. Los estudiantes valoran mucho la accesibilidad.',
            },
        ],
    },
    {
        label: 'Precio y condiciones',
        items: [
            {
                id: 'price-rent',
                icon: <DollarSign className="w-4 h-4" />,
                title: 'Canon mensual y depósito',
                description:
                    'Define el precio de arriendo mensual y si se requiere depósito o garantía. Ten claro si el precio incluye servicios.',
            },
            {
                id: 'price-contract',
                icon: <DollarSign className="w-4 h-4" />,
                title: 'Tiempo mínimo de contrato',
                description:
                    'Especifica cuántos meses es el mínimo (ej. 3 meses, 6 meses, sin mínimo).',
            },
        ],
    },
    {
        label: 'Descripción e información',
        items: [
            {
                id: 'info-area',
                icon: <FileText className="w-4 h-4" />,
                title: 'Área en m² y descripción del espacio',
                description:
                    'Mide o estima los metros cuadrados. Describe qué mobiliario incluye (cama, escritorio, closet, etc.).',
            },
            {
                id: 'info-tenant',
                icon: <Users className="w-4 h-4" />,
                title: 'Perfil del arrendatario y reglas básicas',
                description:
                    'Define si prefieres estudiantes, profesionales, o sin restricción. Menciona reglas importantes (no fumadores, no mascotas, etc.).',
            },
        ],
    },
];

const CONTAINER_EXTRA_CHECKS: CheckSection[] = [
    {
        label: 'Fotografías adicionales',
        items: [
            {
                id: 'photos-common',
                icon: <Images className="w-4 h-4" />,
                title: 'Fotos de zonas comunes',
                description:
                    'Sala, cocina, comedor, patio, lavandería o áreas de estudio. Las zonas comunes son un factor decisivo para los estudiantes.',
            },
            {
                id: 'photos-building',
                icon: <Images className="w-4 h-4" />,
                title: 'Fachada del edificio o casa',
                description:
                    'Foto exterior clara del inmueble en horario diurno con buena iluminación.',
            },
        ],
    },
    {
        label: 'Servicios incluidos',
        items: [
            {
                id: 'services-utilities',
                icon: <Zap className="w-4 h-4" />,
                title: 'Lista de servicios públicos incluidos',
                description:
                    'Define cuáles están incluidos: agua, luz, gas, internet, TV por cable. Esto influye directamente en el precio.',
            },
            {
                id: 'services-meals',
                icon: <Zap className="w-4 h-4" />,
                title: 'Alimentación (si aplica)',
                description:
                    'Si ofreces desayuno, almuerzo o cena, especifícalo. Es una ventaja competitiva para pensiones.',
            },
        ],
    },
    {
        label: 'Reglas y convivencia',
        items: [
            {
                id: 'rules-main',
                icon: <ClipboardList className="w-4 h-4" />,
                title: 'Normas de convivencia y horarios',
                description:
                    'Horario de ingreso/salida, política de visitas, uso de áreas comunes y ruido. Esto protege a propietario e inquilinos.',
            },
        ],
    },
    {
        label: 'Unidades disponibles',
        items: [
            {
                id: 'units-count',
                icon: <LayoutGrid className="w-4 h-4" />,
                title: 'Número de habitaciones y precio por unidad',
                description:
                    'El formulario te pedirá crear cada unidad individualmente: número de camas, precio y disponibilidad.',
            },
        ],
    },
    {
        label: 'Estado del inmueble',
        items: [
            {
                id: 'condition-general',
                icon: <Wrench className="w-4 h-4" />,
                title: 'Estado general y reformas recientes',
                description:
                    'Menciona si el inmueble es nuevo, ha sido renovado recientemente o tiene detalles que aclarar. La transparencia genera confianza.',
            },
        ],
    },
];

const getChecklistForType = (type: PropertyType): CheckSection[] => {
    if (type === 'habitacion') return ROOM_CHECKS;
    return [...ROOM_CHECKS, ...CONTAINER_EXTRA_CHECKS];
};

const getAllItemIds = (sections: CheckSection[]): string[] =>
    sections.flatMap((s) => s.items.map((i) => i.id));

// ─── Labels ───────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<PropertyType, string> = {
    habitacion: 'Habitación Independiente',
    pension: 'Pensión / Residencia',
    apartamento: 'Apartamento',
    'aparta-estudio': 'Aparta-estudio',
};

const TYPE_ESTIMATED: Record<PropertyType, string> = {
    habitacion: '5–8 min',
    pension: '10–15 min',
    apartamento: '10–15 min',
    'aparta-estudio': '8–12 min',
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface PrePublicationModalProps {
    propertyType: PropertyType;
    onConfirm: () => void;
    onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const PrePublicationModal: React.FC<PrePublicationModalProps> = ({
    propertyType,
    onConfirm,
    onCancel,
}) => {
    const sections = getChecklistForType(propertyType);
    const allIds = getAllItemIds(sections);

    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [visible, setVisible] = useState(false);

    // Animate in
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    // Lock body scroll & Escape key
    const handleCancel = useCallback(() => {
        setVisible(false);
        setTimeout(onCancel, 300);
    }, [onCancel]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCancel(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [handleCancel]);

    const toggleCheck = (id: string) => {
        setChecked((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const allChecked = allIds.every((id) => checked.has(id));
    const checkedCount = allIds.filter((id) => checked.has(id)).length;
    const progress = allIds.length > 0 ? (checkedCount / allIds.length) * 100 : 0;

    const handleConfirm = () => {
        if (!allChecked) return;
        if (dontShowAgain) dismissType(propertyType);
        onConfirm();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) handleCancel();
    };

    return (
        <div
            onClick={handleBackdropClick}
            className={`
                fixed inset-0 z-[9999] flex items-center justify-center p-4
                bg-black/60 backdrop-blur-sm
                transition-opacity duration-300
                ${visible ? 'opacity-100' : 'opacity-0'}
            `}
        >
            {/* Modal card */}
            <div
                className={`
                    relative w-full max-w-[680px] max-h-[90vh]
                    bg-white dark:bg-gray-900
                    rounded-2xl shadow-2xl
                    flex flex-col overflow-hidden
                    border border-gray-200 dark:border-gray-700
                    transition-all duration-300
                    ${visible
                        ? 'translate-y-0 scale-100 opacity-100'
                        : 'translate-y-6 scale-95 opacity-0'
                    }
                `}
                style={{ transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease' }}
            >
                {/* ── Header ── */}
                <div className="bg-brand-blue dark:bg-brand-blue/90 px-6 pt-5 pb-4 flex-shrink-0">
                    {/* Close */}
                    <button
                        onClick={handleCancel}
                        aria-label="Cerrar"
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mb-3">
                        <Lightbulb className="w-3.5 h-3.5 text-brand-lime" />
                        <span className="text-xs font-semibold text-brand-lime">
                            Checklist de preparación
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-white leading-snug mb-1">
                        Antes de publicar tu{' '}
                        <span className="text-brand-lime">{TYPE_LABELS[propertyType]}</span>
                    </h2>
                    <p className="text-sm text-blue-200">
                        Confirma que tienes todo listo para completar el formulario sin pausas.
                    </p>

                    {/* Time estimate */}
                    <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="w-3.5 h-3.5 text-blue-300" />
                        <span className="text-xs text-blue-300">
                            Tiempo estimado: {TYPE_ESTIMATED[propertyType]}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 bg-white/20 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full bg-brand-lime rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-xs text-blue-300">
                            {checkedCount} de {allIds.length} ítems confirmados
                        </span>
                        {allChecked && (
                            <span className="text-xs text-brand-lime font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                ¡Todo listo!
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="overflow-y-auto flex-grow px-6 py-5 space-y-6">
                    {sections.map((section) => (
                        <div key={section.label}>
                            {/* Section label */}
                            <div className="flex items-center gap-2 mb-2.5">
                                <span className="inline-block w-5 h-0.5 bg-brand-blue dark:bg-blue-400 rounded" />
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-blue dark:text-blue-400">
                                    {section.label}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="space-y-2">
                                {section.items.map((item) => {
                                    const isChecked = checked.has(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleCheck(item.id)}
                                            className={`
                                                w-full flex items-start gap-3 p-3 rounded-xl text-left
                                                border transition-all duration-200
                                                ${isChecked
                                                    ? 'border-brand-blue bg-blue-50 dark:bg-brand-blue/20 dark:border-blue-500'
                                                    : 'border-gray-200 bg-gray-50 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600'
                                                }
                                            `}
                                        >
                                            {/* Check icon */}
                                            <div className={`flex-shrink-0 mt-0.5 transition-colors ${isChecked ? 'text-brand-blue dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}`}>
                                                {isChecked
                                                    ? <CheckCircle2 className="w-5 h-5" />
                                                    : <Circle className="w-5 h-5" />
                                                }
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className={`flex-shrink-0 transition-colors ${isChecked ? 'text-brand-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-brand-blue dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <p className={`text-xs leading-relaxed transition-colors ${isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Footer ── */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {/* Don't show again */}
                    <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="accent-brand-blue w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            No mostrar esta guía la próxima vez que publique este tipo de propiedad
                        </span>
                    </label>

                    {/* Actions */}
                    <div className="flex gap-2.5">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:border-brand-blue dark:hover:border-blue-500 hover:text-brand-blue dark:hover:text-blue-400 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </button>

                        <button
                            onClick={handleConfirm}
                            disabled={!allChecked}
                            className={`
                                flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                                text-sm font-semibold transition-all duration-300
                                ${allChecked
                                    ? 'bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/30 hover:-translate-y-0.5'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {allChecked ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    ¡Tengo todo listo, empezar!
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <Circle className="w-4 h-4" />
                                    Confirma todos los ítems ({allIds.length - checkedCount} restantes)
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { getDismissedTypes };
export default PrePublicationModal;
