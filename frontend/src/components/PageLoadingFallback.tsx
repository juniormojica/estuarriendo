import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageLoadingFallback: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner text="Cargando página..." />
        </div>
    );
};

export default PageLoadingFallback;
