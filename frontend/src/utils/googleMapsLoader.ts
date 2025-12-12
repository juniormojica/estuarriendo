let googleMapsPromise: Promise<typeof google> | null = null;
let isLoaded = false;

export const loadGoogleMaps = (apiKey: string): Promise<typeof google> => {
    // If already loaded, return immediately
    if (isLoaded && window.google?.maps) {
        return Promise.resolve(window.google);
    }

    // If loading is in progress, return the existing promise
    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    // Start loading
    googleMapsPromise = new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            // Wait for it to load
            const checkGoogle = setInterval(() => {
                if (window.google?.maps) {
                    clearInterval(checkGoogle);
                    isLoaded = true;
                    resolve(window.google);
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkGoogle);
                reject(new Error('Google Maps script failed to load'));
            }, 10000);
            return;
        }

        // Create and append script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (window.google?.maps) {
                isLoaded = true;
                resolve(window.google);
            } else {
                reject(new Error('Google Maps failed to initialize'));
            }
        };

        script.onerror = () => {
            googleMapsPromise = null;
            reject(new Error('Failed to load Google Maps script'));
        };

        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

// Type declaration for window.google
declare global {
    interface Window {
        google: typeof google;
    }
}
