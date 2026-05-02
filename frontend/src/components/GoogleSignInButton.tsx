'use client';
import React, { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}



const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  text = 'continue_with',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
      return;
    }

    const initializeGoogle = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !containerRef.current) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => {
          onSuccess(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: containerRef.current.offsetWidth || 400,
        text,
        shape: 'rectangular',
        logo_alignment: 'center',
      });
    };

    // Check if script is already loaded
    if ((window as any).google?.accounts) {
      initializeGoogle();
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);

    return () => {
      // Clean up script only if we added it and it's still there
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && existingScript.getAttribute('data-added-by') === 'google-sign-in') {
        existingScript.remove();
      }
    };
  }, [onSuccess, text]);

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center"
      style={{ minHeight: '44px' }}
    />
  );
};

export default GoogleSignInButton;
