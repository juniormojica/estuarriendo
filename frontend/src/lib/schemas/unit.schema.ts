import { z } from 'zod';

/**
 * Schema para validación de unidades (habitaciones dentro de contenedores)
 */
export const unitSchema = z.object({
    title: z.string()
        .min(5, 'El título debe tener al menos 5 caracteres')
        .max(100, 'El título no puede exceder 100 caracteres'),

    description: z.string()
        .optional()
        .or(z.literal('')),

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

    deposit: z.coerce.number()
        .int('El depósito debe ser un número entero')
        .nonnegative('El depósito no puede ser negativo')
        .optional()
        .or(z.literal(0).transform(() => undefined)),

    area: z.coerce.number()
        .int('El área debe ser un número entero')
        .positive('El área debe ser mayor a 0')
        .min(5, 'El área mínima es 5 m²')
        .max(200, 'El área máxima es 200 m²')
        .optional()
        .or(z.literal(0).transform(() => undefined)),

    roomType: z.enum(['individual', 'shared']),

    bedsInRoom: z.coerce.number()
        .int('El número de camas debe ser un número entero')
        .positive('Debe haber al menos 1 cama')
        .min(1, 'Debe haber al menos 1 cama')
        .max(10, 'Máximo 10 camas por habitación'),

    amenities: z.array(z.number().int().positive())
        .optional()
        .default([]),

    images: z.array(z.string())
        .min(1, 'Debes subir al menos 1 imagen de la habitación')
        .max(10, 'No puedes subir más de 10 imágenes'),
})
    .refine(
        (data) => {
            // Si es compartida, debe tener al menos 2 camas
            if (data.roomType === 'shared' && data.bedsInRoom < 2) {
                return false;
            }
            return true;
        },
        {
            message: 'Una habitación compartida debe tener al menos 2 camas',
            path: ['bedsInRoom'],
        }
    );

/**
 * Tipos TypeScript inferidos del schema
 */
export type UnitFormData = z.infer<typeof unitSchema>;
