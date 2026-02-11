import React, { forwardRef, useState, useEffect } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    label: string;
    error?: FieldError;
    helperText?: string;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: number | undefined) => void;
    value?: number | string;
}

export const FormCurrencyInput = forwardRef<HTMLInputElement, FormCurrencyInputProps>(
    ({ label, error, helperText, required, onChange, onValueChange, value, className, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState('');

        // Formatear número a COP (1500000 → "1.500.000")
        const formatCOP = (num: number | string): string => {
            if (num === undefined || num === null || num === '') return '';
            const numbers = num.toString().replace(/\D/g, '');
            if (!numbers) return '';
            return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        };

        // Parsear COP a número ("1.500.000" → 1500000)
        const parseCOP = (formatted: string): number | undefined => {
            const numbers = formatted.replace(/\D/g, '');
            return numbers ? parseInt(numbers, 10) : undefined;
        };

        // Sincronizar displayValue cuando value cambia externamente
        useEffect(() => {
            if (value !== undefined && value !== null) {
                setDisplayValue(formatCOP(value));
            } else {
                setDisplayValue('');
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Solo permitir números
            const numbers = inputValue.replace(/\D/g, '');

            // Formatear con separadores de miles
            const formatted = formatCOP(numbers);
            setDisplayValue(formatted);

            // Obtener valor numérico real
            const numericValue = parseCOP(formatted);

            // Priorizar onValueChange para control directo
            if (onValueChange) {
                onValueChange(numericValue);
            }

            // Mantener compatibilidad con onChange estándar (sin hacks de evento)
            if (onChange) {
                onChange(e);
            }
        };

        const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
            e.currentTarget.blur();
        };

        const id = props.id || `currency-${label.toLowerCase().replace(/\s+/g, '-')}`;

        return (
            <div className="space-y-1">
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        $
                    </span>
                    <input
                        ref={ref}
                        id={id}
                        type="text"
                        inputMode="numeric"
                        value={displayValue}
                        onChange={handleChange}
                        onWheel={handleWheel}
                        placeholder="Ej: 1.500.000"
                        className={`
                            w-full pl-8 pr-4 py-2 border rounded-lg
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-colors
                            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
                            ${className || ''}
                        `}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                        {...props}
                    />
                </div>

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

FormCurrencyInput.displayName = 'FormCurrencyInput';
