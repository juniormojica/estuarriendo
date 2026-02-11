import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
    helperText?: string;
}

/**
 * Componente de input reutilizable con accesibilidad completa
 * Implementa las mejores prácticas de ARIA para formularios
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, helperText, id, className, ...props }, ref) => {
        const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;

        return (
            <div>
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label} {props.required && <span className="text-red-500">*</span>}
                </label>
                <input
                    id={inputId}
                    ref={ref}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? errorId : helperText ? helperId : undefined}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                        } ${className || ''}`}
                    {...props}
                />
                {error && (
                    <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
                        {error.message}
                    </p>
                )}
                {helperText && !error && (
                    <p id={helperId} className="mt-1 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';
