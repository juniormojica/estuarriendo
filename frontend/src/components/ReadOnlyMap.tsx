import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

interface ReadOnlyMapProps {
    latitude: number;
    longitude: number;
    address?: string;
}

const ReadOnlyMap: React.FC<ReadOnlyMapProps> = ({ latitude, longitude, address }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!apiKey) {
            setError('Google Maps API key no configurada');
            setIsLoading(false);
            return;
        }

        if (!latitude || !longitude || latitude === 0 || longitude === 0) {
            setError('Coordenadas no disponibles');
            setIsLoading(false);
            return;
        }

        const initializeMap = async () => {
            if (!mapRef.current) return;

            try {
                setIsLoading(true);
                setError('');

                await loadGoogleMaps(apiKey);

                const position = { lat: latitude, lng: longitude };

                // Create map
                const map = new google.maps.Map(mapRef.current, {
                    center: position,
                    zoom: 15,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                    draggable: false, // Make map non-draggable
                    scrollwheel: false, // Disable scroll zoom
                });

                // Create static marker
                new google.maps.Marker({
                    map,
                    position,
                    title: address || 'Ubicación de la propiedad',
                    animation: google.maps.Animation.DROP,
                });

                setIsLoading(false);
            } catch (err) {
                console.error('Error loading map:', err);
                setError('Error al cargar el mapa');
                setIsLoading(false);
            }
        };

        initializeMap();
    }, [apiKey, latitude, longitude, address]);

    if (error) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Cargando mapa...</p>
                        </div>
                    </div>
                )}
                <div ref={mapRef} className="w-full h-full"></div>
            </div>

            {/* Coordinates Display */}
            {latitude && longitude && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-emerald-600" />
                        <h4 className="text-sm font-semibold text-gray-900">Coordenadas</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-600">Latitud:</span>
                            <span className="ml-2 font-mono text-gray-900">
                                {typeof latitude === 'number' ? latitude.toFixed(6) : '0.000000'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Longitud:</span>
                            <span className="ml-2 font-mono text-gray-900">
                                {typeof longitude === 'number' ? longitude.toFixed(6) : '0.000000'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReadOnlyMap;
