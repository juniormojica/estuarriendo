import { z } from 'zod';
import { basicPropertyInfoSchema, locationSchema } from './property-common.schema';

/**
 * Schema para información básica de un contenedor (Pensión/Apartamento/Aparta-estudio)
 */
export const containerBasicInfoSchema = basicPropertyInfoSchema.extend({
    typeId: z.number().int().positive(),
    typeName: z.enum(['pension', 'apartamento', 'aparta-estudio']),
    rentalMode: z.enum(['by_unit', 'complete']),
    requiresDeposit: z.boolean(),
    minimumContractMonths: z.union([
        z.number().int().min(1, 'Debe ser al menos 1 mes').max(24, 'Máximo 24 meses'),
        z.undefined(),
    ]).optional(),
});

/**
 * Schema para ubicación de contenedor (reutiliza el schema común)
 */
export const containerLocationSchema = locationSchema.extend({
    nearbyInstitutions: z.array(z.object({
        institutionId: z.coerce.number().int().positive(),
        distance: z.coerce.number().int().positive().nullable(),
    })).optional().default([]),
});

/**
 * Tipos TypeScript inferidos de los schemas
 */
export type ContainerBasicInfoData = z.infer<typeof containerBasicInfoSchema>;
export type ContainerLocationData = z.infer<typeof containerLocationSchema>;
