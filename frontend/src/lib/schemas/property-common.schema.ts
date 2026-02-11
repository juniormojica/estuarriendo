import { z } from 'zod';

/**
 * Schema para la ubicación de una propiedad
 */
export const locationSchema = z.object({
    cityId: z.number().int().positive('Debes seleccionar una ciudad'),
    departmentId: z.number().int().positive(),
    street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
    neighborhood: z.string().min(3, 'El barrio debe tener al menos 3 caracteres'),
    coordinates: z.object({
        lat: z.number().refine(val => val !== 0, 'Debes seleccionar la ubicación en el mapa'),
        lng: z.number().refine(val => val !== 0, 'Debes seleccionar la ubicación en el mapa'),
    }),
});

/**
 * Schema para instituciones cercanas
 */
export const nearbyInstitutionSchema = z.object({
    institutionId: z.coerce.number().int().positive(),
    distance: z.preprocess(
        (val) => (val === '' || val === null || isNaN(Number(val))) ? null : Number(val),
        z.number().int().positive().nullable()
    ),
});

/**
 * Schema para servicios de la propiedad
 */
export const propertyServiceSchema = z.object({
    serviceType: z.enum(['breakfast', 'lunch', 'dinner', 'housekeeping', 'laundry', 'wifi', 'utilities']),
    isIncluded: z.boolean(),
    additionalCost: z.coerce.number().int().nonnegative().optional(),
    description: z.string().optional(),
});

/**
 * Schema para reglas de convivencia
 */
export const propertyRuleSchema = z.object({
    ruleType: z.enum(['smoking', 'pets', 'visits', 'noise', 'curfew']),
    isAllowed: z.boolean().optional(),
    value: z.string().optional(),
    description: z.string().optional(),
});

/**
 * Schema para información básica de cualquier propiedad
 */
export const basicPropertyInfoSchema = z.object({
    title: z.string()
        .min(10, 'El título debe tener al menos 10 caracteres')
        .max(100, 'El título no puede exceder 100 caracteres'),
    description: z.string()
        .min(50, 'La descripción debe tener al menos 50 caracteres')
        .max(500, 'La descripción no puede exceder 500 caracteres'),
});
