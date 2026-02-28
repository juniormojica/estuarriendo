import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FallbackProps {
    error: any;
    resetErrorBoundary: () => void;
}

const GlobalErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                    <AlertCircle className="h-8 w-8 text-red-600" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Ups! Algo salió mal</h2>
                <p className="text-gray-500 mb-6 text-sm">
                    Ha ocurrido un error inesperado en la aplicación. No te preocupes, puedes intentar recargar la página.
                </p>

                {/* Only show error message in development */}
                {import.meta.env.DEV && (
                    <div className="bg-gray-100 rounded-md p-4 mb-6 overflow-auto text-left">
                        <p className="text-xs font-mono text-red-800 break-words">{error?.message || String(error)}</p>
                    </div>
                )}

                <button
                    onClick={() => {
                        resetErrorBoundary();
                        window.location.href = '/'; // Opcional: redirigir al inicio en caso de falla grave
                    }}
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Volver al Inicio
                </button>
            </div>
        </div>
    );
};

export default GlobalErrorFallback;
