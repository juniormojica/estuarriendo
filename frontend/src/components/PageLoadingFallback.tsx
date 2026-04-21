import React from 'react';
import EstuSpinner from './EstuSpinner';

const PageLoadingFallback: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <EstuSpinner size="lg" showPhrases={true} />
        </div>
    );
};

export default PageLoadingFallback;
