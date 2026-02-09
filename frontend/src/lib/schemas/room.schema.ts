import { z } from 'zod';
import {
    basicPropertyInfoSchema,
    locationSchema,
    nearbyInstitutionSchema,
    propertyServiceSchema,
    propertyRuleSchema
} from './property-common.schema';

/**
 * Schema para información básica de una habitación
 */
export const roomBasicInfoSchema = basicPropertyInfoSchema.extend({
    monthlyRent: z.coerce.number()
        .optional()
        .superRefine((val, ctx) => {
            // Validar que no sea undefined/null/NaN
            if (val === undefined || val === null || isNaN(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'El precio mensual es obligatorio',
                });
                return; // Detener validaciones adicionales
            }

            // Validar que sea mayor a 0
            if (val <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'El precio debe ser mayor a 0',
                });
                return;
            }

            // Validar que sea entero
            if (!Number.isInteger(val)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'El precio debe ser un número entero',
                });
                return;
            }

            // Validar precio mínimo
            if (val < 100000) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'El precio mínimo es $100,000 COP',
                });
                return;
            }
        }),
});

/**
 * Schema para detalles de una habitación
 * NOTA: El campo area es completamente opcional ya que muchas personas no conocen este dato
 */
export const roomDetailsSchema = z.object({
    area: z.coerce.number()
        .int()
        .positive()
        .min(5, 'El área mínima es 5 m²')
        .max(200, 'El área máxima es 200 m²')
        .optional()
        .or(z.literal(0).transform(() => undefined)), // Permite 0 y lo convierte a undefined
    nearbyInstitutions: z.array(nearbyInstitutionSchema).optional().default([]),
});

/**
 * Schema para amenidades de una habitación
 */
export const roomAmenitiesSchema = z.object({
    amenities: z.array(z.coerce.number()).optional().default([]),
});

/**
 * Schema para servicios de una habitación
 */
export const roomServicesSchema = z.object({
    services: z.array(propertyServiceSchema).optional().default([]),
});

/**
 * Schema para reglas de una habitación
 */
export const roomRulesSchema = z.object({
    rules: z.array(propertyRuleSchema).optional().default([]),
});

/**
 * Schema para imágenes de una habitación
 */
export const roomImagesSchema = z.object({
    images: z.array(z.string())
        .min(1, 'Debes agregar al menos una imagen')
        .max(10, 'Máximo 10 imágenes'),
});

/**
 * Schema completo para el formulario de habitación
 */
export const roomCompleteSchema = roomBasicInfoSchema
    .merge(locationSchema)
    .merge(roomDetailsSchema)
    .merge(roomAmenitiesSchema)
    .merge(roomServicesSchema)
    .merge(roomRulesSchema)
    .merge(roomImagesSchema);

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type RoomBasicInfoData = z.infer<typeof roomBasicInfoSchema>;
export type RoomDetailsData = z.infer<typeof roomDetailsSchema>;
export type RoomFormData = z.infer<typeof roomCompleteSchema>;
