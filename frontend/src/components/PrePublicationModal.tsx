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

// ─── Storage key for "don't show again" ───────────────────────────────────────
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
    category: string;
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
                category: 'Fotografías',
                title: 'Fotos del cuarto (mínimo 3 ángulos)',
                description:
                    'Toma fotos con buena iluminación natural: desde la puerta, la ventana y un ángulo diagonal que muestre el espacio completo.',
            },
            {
                id: 'photos-bathroom',
                icon: <Camera className="w-4 h-4" />,
                category: 'Fotografías',
                title: 'Foto del baño',
                description:
                    'Muestra el baño limpio y ordenado. Si es compartido, menciona cuántas personas lo comparten.',
            },
            {
                id: 'photos-entrance',
                icon: <Camera className="w-4 h-4" />,
                category: 'Fotografías',
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
                category: 'Ubicación',
                title: 'Dirección exacta y barrio',
                description:
                    'Ten a la mano la dirección completa y el nombre del barrio. Esto es obligatorio para la publicación.',
            },
            {
                id: 'location-transport',
                icon: <MapPin className="w-4 h-4" />,
                category: 'Ubicación',
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
                category: 'Precio',
                title: 'Canon mensual y depósito',
                description:
                    'Define el precio de arriendo mensual y si se requiere depósito o garantía. Ten claro si el precio incluye servicios.',
            },
            {
                id: 'price-contract',
                icon: <DollarSign className="w-4 h-4" />,
                category: 'Precio',
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
                category: 'Descripción',
                title: 'Área en m² y descripción del espacio',
                description:
                    'Mide o estima los metros cuadrados. Describe qué mobiliario incluye (cama, escritorio, closet, etc.).',
            },
            {
                id: 'info-tenant',
                icon: <Users className="w-4 h-4" />,
                category: 'Descripción',
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
                category: 'Fotografías comunes',
                title: 'Fotos de zonas comunes',
                description:
                    'Sala, cocina, comedor, patio, lavandería o áreas de estudio. Las zonas comunes son un factor decisivo para los estudiantes.',
            },
            {
                id: 'photos-building',
                icon: <Images className="w-4 h-4" />,
                category: 'Fotografías comunes',
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
                category: 'Servicios',
                title: 'Lista de servicios públicos incluidos',
                description:
                    'Define cuáles están incluidos: agua, luz, gas, internet, TV por cable. Esto influye directamente en el precio.',
            },
            {
                id: 'services-meals',
                icon: <Zap className="w-4 h-4" />,
                category: 'Servicios',
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
                category: 'Reglas',
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
                category: 'Unidades',
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
                category: 'Estado',
                title: 'Estado general y reformas recientes',
                description:
                    'Menciona si el inmueble es nuevo, ha sido renovado recientemente o tiene detalles que aclarar. La transparencia genera confianza.',
            },
        ],
    },
];

// Build full checklist per type
const getChecklistForType = (type: PropertyType): CheckSection[] => {
    if (type === 'habitacion') return ROOM_CHECKS;
    return [...ROOM_CHECKS, ...CONTAINER_EXTRA_CHECKS];
};

const getAllItemIds = (sections: CheckSection[]): string[] =>
    sections.flatMap((s) => s.items.map((i) => i.id));

// ─── Label helpers ────────────────────────────────────────────────────────────
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

    // Animate in on mount
    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleCancel();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        // Prevent body scroll while modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const toggleCheck = (id: string) => {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
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

    const handleCancel = () => {
        setVisible(false);
        setTimeout(onCancel, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) handleCancel();
    };

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backgroundColor: `rgba(15, 23, 42, ${visible ? 0.6 : 0})`,
                backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
                transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
            }}
        >
            {/* Modal card */}
            <div
                style={{
                    width: '100%',
                    maxWidth: '680px',
                    maxHeight: '90vh',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.20)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
                    opacity: visible ? 1 : 0,
                    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
                }}
            >
                {/* ── Header ── */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                        padding: '1.5rem 1.75rem 1.25rem',
                        position: 'relative',
                        flexShrink: 0,
                    }}
                >
                    {/* Close btn */}
                    <button
                        onClick={handleCancel}
                        aria-label="Cerrar"
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background =
                                'rgba(255,255,255,0.35)')
                        }
                        onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLButtonElement).style.background =
                                'rgba(255,255,255,0.2)')
                        }
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Tip badge */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '999px',
                            padding: '4px 12px',
                            marginBottom: '12px',
                        }}
                    >
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-200" />
                        <span style={{ fontSize: '12px', color: '#fef3c7', fontWeight: 600 }}>
                            Checklist de preparación
                        </span>
                    </div>

                    <h2
                        style={{
                            fontSize: '1.375rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: 0,
                            lineHeight: 1.3,
                        }}
                    >
                        Antes de publicar tu{' '}
                        <span style={{ color: '#bfdbfe' }}>{TYPE_LABELS[propertyType]}</span>
                    </h2>
                    <p
                        style={{
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.8)',
                            marginTop: '6px',
                        }}
                    >
                        Confirma que tienes todo listo para completar el formulario sin pausas.
                    </p>

                    {/* Time estimate */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '10px',
                        }}
                    >
                        <Clock className="w-3.5 h-3.5 text-blue-200" />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                            Tiempo estimado de publicación: {TYPE_ESTIMATED[propertyType]}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div
                        style={{
                            marginTop: '16px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '999px',
                            height: '6px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${progress}%`,
                                backgroundColor: '#a5f3fc',
                                borderRadius: '999px',
                                transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '6px',
                        }}
                    >
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                            {checkedCount} de {allIds.length} ítems confirmados
                        </span>
                        {allChecked && (
                            <span
                                style={{
                                    fontSize: '11px',
                                    color: '#a5f3fc',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                ¡Todo listo!
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div
                    style={{
                        overflowY: 'auto',
                        padding: '1.25rem 1.75rem',
                        flexGrow: 1,
                    }}
                >
                    {sections.map((section) => (
                        <div key={section.label} style={{ marginBottom: '1.5rem' }}>
                            {/* Section label */}
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: '#6366f1',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '20px',
                                        height: '2px',
                                        backgroundColor: '#6366f1',
                                        borderRadius: '2px',
                                    }}
                                />
                                {section.label}
                            </div>

                            {/* Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {section.items.map((item) => {
                                    const isChecked = checked.has(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleCheck(item.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                padding: '12px 14px',
                                                borderRadius: '12px',
                                                border: `1.5px solid ${isChecked ? '#6366f1' : '#e5e7eb'}`,
                                                backgroundColor: isChecked ? '#eef2ff' : '#f9fafb',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition:
                                                    'border-color 0.2s, background-color 0.2s, transform 0.15s',
                                                transform: 'scale(1)',
                                                width: '100%',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isChecked)
                                                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                                                        '#a5b4fc';
                                                (e.currentTarget as HTMLButtonElement).style.transform =
                                                    'scale(1.005)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isChecked)
                                                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                                                        '#e5e7eb';
                                                (e.currentTarget as HTMLButtonElement).style.transform =
                                                    'scale(1)';
                                            }}
                                        >
                                            {/* Check icon */}
                                            <div
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: '2px',
                                                    color: isChecked ? '#6366f1' : '#d1d5db',
                                                    transition: 'color 0.2s, transform 0.2s',
                                                    transform: isChecked ? 'scale(1.1)' : 'scale(1)',
                                                }}
                                            >
                                                {isChecked ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <Circle className="w-5 h-5" />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        marginBottom: '3px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: isChecked ? '#6366f1' : '#6b7280',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                            color: isChecked ? '#3730a3' : '#111827',
                                                            transition: 'color 0.2s',
                                                            textDecoration: isChecked
                                                                ? 'none'
                                                                : 'none',
                                                        }}
                                                    >
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <p
                                                    style={{
                                                        fontSize: '13px',
                                                        color: isChecked ? '#6366f1' : '#6b7280',
                                                        margin: 0,
                                                        lineHeight: 1.5,
                                                        transition: 'color 0.2s',
                                                    }}
                                                >
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
                <div
                    style={{
                        padding: '1rem 1.75rem 1.25rem',
                        borderTop: '1px solid #f1f5f9',
                        flexShrink: 0,
                        backgroundColor: '#fafafa',
                    }}
                >
                    {/* Don't show again */}
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            marginBottom: '14px',
                            userSelect: 'none',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            style={{ accentColor: '#6366f1', width: '15px', height: '15px' }}
                        />
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            No mostrar esta guía la próxima vez que publique este tipo de propiedad
                        </span>
                    </label>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                border: '1.5px solid #e5e7eb',
                                backgroundColor: '#ffffff',
                                color: '#374151',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'border-color 0.2s, background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
                                (e.currentTarget as HTMLButtonElement).style.color = '#6366f1';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                                (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </button>

                        <button
                            onClick={handleConfirm}
                            disabled={!allChecked}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                border: 'none',
                                background: allChecked
                                    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                                    : '#e5e7eb',
                                color: allChecked ? '#ffffff' : '#9ca3af',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: allChecked ? 'pointer' : 'not-allowed',
                                transition: 'background 0.3s, color 0.3s, opacity 0.2s, transform 0.15s',
                                boxShadow: allChecked
                                    ? '0 4px 14px rgba(99,102,241,0.35)'
                                    : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (allChecked)
                                    (e.currentTarget as HTMLButtonElement).style.transform =
                                        'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.transform =
                                    'translateY(0)';
                            }}
                        >
                            {allChecked ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    ¡Tengo todo listo, empezar!
                                </>
                            ) : (
                                <>
                                    <Circle className="w-4 h-4" />
                                    Confirma todos los ítems para continuar (
                                    {allIds.length - checkedCount} restantes)
                                </>
                            )}
                            {allChecked && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { getDismissedTypes };
export default PrePublicationModal;
