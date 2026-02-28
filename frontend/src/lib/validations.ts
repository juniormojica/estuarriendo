import { z } from 'zod';

// Shared validatons to be reused across forms
const passwordValidation = z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder los 50 caracteres');

const phoneValidation = z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder los 15 caracteres')
    .regex(/^[0-9+]+$/, 'Solo se permiten números y el símbolo +');

// Login Schema
export const loginSchema = z.object({
    email: z.string().min(1, 'El correo electrónico es requerido').email('Formato de correo inválido'),
    password: z.string().min(1, 'La contraseña es requerida')
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Registration Schema
export const registerSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo'),
    email: z.string().min(1, 'El correo electrónico es requerido').email('Formato de correo inválido'),
    phone: phoneValidation,
    whatsapp: phoneValidation.optional().or(z.literal('')),
    password: passwordValidation,
    confirmPassword: z.string().min(1, 'Por favor, confirma tu contraseña')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'El correo electrónico es requerido').email('Formato de correo inválido')
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z.object({
    password: passwordValidation,
    confirmPassword: z.string().min(1, 'Por favor, confirma tu contraseña')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// User Profile Basic Info Schema
export const profileBasicInfoSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo'),
    phone: phoneValidation,
    whatsapp: phoneValidation.optional().or(z.literal(''))
});

export type ProfileBasicInfoFormValues = z.infer<typeof profileBasicInfoSchema>;
