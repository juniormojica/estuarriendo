import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, AlertCircle, Loader } from 'lucide-react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

interface Address {
    street: string;
    city: string;
    department: string;
    country: string;
    neighborhood?: string;
}

interface Coordinates {
    lat: number;
    lng: number;
}

interface LocationPickerProps {
    address: Address;
    coordinates: Coordinates;
    onCoordinatesChange: (lat: number, lng: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
    address,
    coordinates,
    onCoordinatesChange
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Default center (Colombia)
    const defaultCenter = { lat: 4.5709, lng: -74.2973 };

    useEffect(() => {
        if (!apiKey) {
            setError('Google Maps API key no configurada');
            setIsLoading(false);
            return;
        }

        initializeMap();
    }, [apiKey]);

    // Update marker position when coordinates change externally
    useEffect(() => {
        if (markerRef.current &&
            coordinates.lat != null &&
            coordinates.lng != null &&
            coordinates.lat !== 0 &&
            coordinates.lng !== 0) {
            const newPosition = { lat: coordinates.lat, lng: coordinates.lng };
            markerRef.current.setPosition(newPosition);
            mapInstanceRef.current?.panTo(newPosition);
        }
    }, [coordinates]);

    const initializeMap = async () => {
        if (!mapRef.current) return;

        try {
            setIsLoading(true);
            setError('');

            await loadGoogleMaps(apiKey);

            // Initialize geocoder
            geocoderRef.current = new google.maps.Geocoder();

            // Determine initial center - check for valid coordinates
            const hasValidCoordinates =
                coordinates.lat != null &&
                coordinates.lng != null &&
                coordinates.lat !== 0 &&
                coordinates.lng !== 0;

            const initialCenter = hasValidCoordinates
                ? coordinates
                : defaultCenter;

            // Create map
            const map = new google.maps.Map(mapRef.current, {
                center: initialCenter,
                zoom: hasValidCoordinates ? 15 : 6,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: true,
            });

            mapInstanceRef.current = map;

            // Create draggable marker
            const marker = new google.maps.Marker({
                map,
                position: initialCenter,
                draggable: true,
                title: 'Arrastra para ajustar la ubicación',
                animation: google.maps.Animation.DROP,
            });

            markerRef.current = marker;

            // Handle marker drag
            marker.addListener('dragend', () => {
                const position = marker.getPosition();
                if (position) {
                    const lat = position.lat();
                    const lng = position.lng();
                    onCoordinatesChange(lat, lng);
                }
            });

            // Handle map click
            map.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (e.latLng) {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    marker.setPosition(e.latLng);
                    onCoordinatesChange(lat, lng);
                }
            });

            setIsLoading(false);
        } catch (err) {
            console.error('Error loading map:', err);
            setError('Error al cargar el mapa. Por favor recarga la página.');
            setIsLoading(false);
        }
    };



    const geocodeAddress = async () => {
        if (!geocoderRef.current) return;

        const fullAddress = `${address.street}, ${address.city}, ${address.department}, ${address.country}`;

        if (!address.street || !address.city) {
            setError('Por favor completa la dirección y ciudad primero');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const result = await geocoderRef.current.geocode({
                address: fullAddress
            });

            if (result.results[0]) {
                const location = result.results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                // Update marker and map
                markerRef.current?.setPosition({ lat, lng });
                mapInstanceRef.current?.panTo({ lat, lng });
                mapInstanceRef.current?.setZoom(16);

                // Update coordinates
                onCoordinatesChange(lat, lng);
            } else {
                setError('No se pudo encontrar la dirección. Intenta ajustar el marcador manualmente.');
            }
        } catch (err) {
            console.error('Geocoding error:', err);
            setError('Error al buscar la dirección. Intenta ajustar el marcador manualmente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (error && !mapInstanceRef.current) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-semibold text-red-800">Error al cargar el mapa</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">
                            Cómo seleccionar tu ubicación
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Haz clic en "Buscar en el mapa" para encontrar automáticamente tu dirección</li>
                            <li>O arrastra el marcador 📍 a la ubicación exacta de tu propiedad</li>
                            <li>También puedes hacer clic en el mapa para mover el marcador</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Geocode Button */}
            <button
                type="button"
                onClick={geocodeAddress}
                disabled={isLoading || !address.street || !address.city}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Buscando...</span>
                    </>
                ) : (
                    <>
                        <Search className="h-5 w-5" />
                        <span>Buscar en el mapa</span>
                    </>
                )}
            </button>

            {error && mapInstanceRef.current && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-700">{error}</p>
                </div>
            )}

            {/* Map Container */}
            <div className="relative">
                <div
                    ref={mapRef}
                    className="w-full h-80 sm:h-96 rounded-lg border-2 border-gray-300 overflow-hidden"
                />
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                            <Loader className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Cargando mapa...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Coordinates Display */}
            {coordinates.lat !== 0 && coordinates.lng !== 0 && coordinates.lat != null && coordinates.lng != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Ubicación seleccionada</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-600">Latitud:</span>
                            <span className="ml-2 font-mono text-gray-900">
                                {typeof coordinates.lat === 'number' ? coordinates.lat.toFixed(6) : '0.000000'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Longitud:</span>
                            <span className="ml-2 font-mono text-gray-900">
                                {typeof coordinates.lng === 'number' ? coordinates.lng.toFixed(6) : '0.000000'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
