import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App.tsx';
import GlobalErrorFallback from './components/GlobalErrorFallback';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onReset={() => {
        // Here you could clear local storage or reset state if needed
      }}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>
);
