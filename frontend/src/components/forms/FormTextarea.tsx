import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: FieldError;
    helperText?: string;
}

/**
 * Componente de textarea reutilizable con accesibilidad completa
 * Implementa las mejores prácticas de ARIA para formularios
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, helperText, id, className, ...props }, ref) => {
        const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;
        const errorId = `${textareaId}-error`;
        const helperId = `${textareaId}-helper`;

        return (
            <div>
                <label
                    htmlFor={textareaId}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label} {props.required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    id={textareaId}
                    ref={ref}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? errorId : helperText ? helperId : undefined}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
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

FormTextarea.displayName = 'FormTextarea';
