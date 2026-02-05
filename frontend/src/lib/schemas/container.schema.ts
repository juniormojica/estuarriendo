import { z } from 'zod';
import { basicPropertyInfoSchema, locationSchema, propertyServiceSchema, propertyRuleSchema } from './property-common.schema';

/**
 * Schema para información básica de un contenedor (Pensión/Apartamento/Aparta-estudio)
 */
export const containerBasicInfoSchema = basicPropertyInfoSchema.extend({
    typeId: z.coerce.number().int().positive(),
    typeName: z.enum(['pension', 'apartamento', 'aparta-estudio']),
    rentalMode: z.enum(['by_unit', 'complete']),
    requiresDeposit: z.boolean(),
    minimumContractMonths: z.union([
        z.coerce.number().int().min(1, 'Debe ser al menos 1 mes').max(24, 'Máximo 24 meses'),
        z.undefined(),
    ]).optional(),
});

/**
 * Schema para ubicación de contenedor (reutiliza el schema común)
 */
export const containerLocationSchema = locationSchema.extend({
    nearbyInstitutions: z.array(z.object({
        institutionId: z.number().int().positive(),
        distance: z.union([z.number().int().positive(), z.null()]),
    })).default([]),
});

/**
 * Schema para servicios de contenedor
 */
export const containerServicesSchema = z.object({
    services: z.array(propertyServiceSchema).min(1, 'Debes seleccionar al menos un servicio'),
});

/**
 * Schema para reglas de contenedor
 */
export const containerRulesSchema = z.object({
    rules: z.array(propertyRuleSchema).min(1, 'Debes seleccionar al menos una regla'),
});

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type ContainerBasicInfoData = z.infer<typeof containerBasicInfoSchema>;
export type ContainerLocationData = z.infer<typeof containerLocationSchema>;
export type ContainerServicesData = z.infer<typeof containerServicesSchema>;
export type ContainerRulesData = z.infer<typeof containerRulesSchema>;
