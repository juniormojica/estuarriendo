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
        .int('El precio debe ser un número entero')
        .positive('El precio debe ser mayor a 0')
        .min(100000, 'El precio mínimo es $100,000 COP'),
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
