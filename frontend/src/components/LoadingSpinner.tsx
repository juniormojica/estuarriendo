import React from 'react';
import { Loader2 } from 'lucide-react';
import EstuSpinner from './EstuSpinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, className = '' }) => {
  // Para tamaño pequeño, usamos el spinner circular clásico (ideal para botones)
  if (size === 'sm') {
    return (
      <div className={`flex flex-col items-center justify-center ${className || 'p-2'}`}>
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  // Para tamaños medianos y grandes, usamos nuestra animación personalizada
  return (
    <div className={className}>
      <EstuSpinner size={size} text={text} />
    </div>
  );
};

export default LoadingSpinner;