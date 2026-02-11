import React, { forwardRef } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormNumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    error?: FieldError;
    helperText?: string;
    required?: boolean;
    allowDecimals?: boolean;
}

export const FormNumericInput = forwardRef<HTMLInputElement, FormNumericInputProps>(
    ({ label, error, helperText, required, allowDecimals = false, onChange, className, ...props }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            // Solo permitir números y opcionalmente punto decimal
            const regex = allowDecimals ? /[^\d.]/g : /[^\d]/g;
            let cleaned = value.replace(regex, '');

            // Prevenir múltiples puntos decimales
            if (allowDecimals) {
                const parts = cleaned.split('.');
                if (parts.length > 2) {
                    cleaned = parts[0] + '.' + parts.slice(1).join('');
                }
            }

            // Actualizar el valor del input
            e.target.value = cleaned;

            onChange?.(e);
        };

        // Deshabilitar rueda del mouse
        const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
            e.currentTarget.blur();
        };

        // Prevenir entrada de caracteres no numéricos con teclado
        const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const char = e.key;
            const isNumber = /\d/.test(char);
            const isDecimal = allowDecimals && char === '.' && !(e.currentTarget.value.includes('.'));
            const isControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char);

            if (!isNumber && !isDecimal && !isControl) {
                e.preventDefault();
            }
        };

        const id = props.id || `numeric-${label.toLowerCase().replace(/\s+/g, '-')}`;

        return (
            <div className="space-y-1">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <input
                    ref={ref}
                    id={id}
                    type="text"
                    inputMode="numeric"
                    onChange={handleChange}
                    onWheel={handleWheel}
                    onKeyPress={handleKeyPress}
                    className={`
                        w-full px-4 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-colors
                        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
                        ${className || ''}
                    `}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                    {...props}
                />

                {error && (
                    <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
                        {error.message}
                    </p>
                )}

                {helperText && !error && (
                    <p id={`${id}-helper`} className="text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormNumericInput.displayName = 'FormNumericInput';
