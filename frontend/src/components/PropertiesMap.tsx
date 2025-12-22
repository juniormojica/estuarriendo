import React, { useEffect, useRef, useState } from 'react';
import { MapPin, School, AlertCircle } from 'lucide-react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { api } from '../services/api';

interface Property {
    id: string;
    title: string;
    location?: {
        latitude?: number;
        longitude?: number;
        address?: string;
        city?: string;
    };
}

interface Institution {
    id: number;
    name: string;
    acronym?: string;
    latitude?: number;
    longitude?: number;
    type: string;
    city?: {
        name: string;
    };
}

interface PropertiesMapProps {
    properties: Property[];
    selectedCity?: string;
}

const PropertiesMap: React.FC<PropertiesMapProps> = ({ properties, selectedCity }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const markersRef = useRef<google.maps.Marker[]>([]);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Fetch institutions
    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const data = await api.getInstitutions();
                setInstitutions(data);
            } catch (err) {
                console.error('Error fetching institutions:', err);
            }
        };
        fetchInstitutions();
    }, []);

    useEffect(() => {
        if (!apiKey) {
            setError('Google Maps API key no configurada');
            setIsLoading(false);
            return;
        }

        const initializeMap = async () => {
            if (!mapRef.current) return;

            try {
                setIsLoading(true);
                setError('');

                await loadGoogleMaps(apiKey);

                // Default center (Valledupar, Colombia)
                const defaultCenter = { lat: 10.4633, lng: -73.2506 };

                // Create map
                const map = new google.maps.Map(mapRef.current, {
                    center: defaultCenter,
                    zoom: 13,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                });

                mapInstanceRef.current = map;
                setIsLoading(false);
            } catch (err) {
                console.error('Error loading map:', err);
                setError('Error al cargar el mapa');
                setIsLoading(false);
            }
        };

        initializeMap();
    }, [apiKey]);

    // Update markers when properties or institutions change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        const bounds = new google.maps.LatLngBounds();
        let hasValidCoordinates = false;

        // Add property markers (RED)
        properties.forEach(property => {
            const lat = property.location?.latitude;
            const lng = property.location?.longitude;

            if (lat && lng && lat !== 0 && lng !== 0) {
                const position = { lat, lng };

                const marker = new google.maps.Marker({
                    map: mapInstanceRef.current!,
                    position,
                    title: property.title,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#EF4444', // Red
                        fillOpacity: 0.9,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                    },
                    animation: google.maps.Animation.DROP,
                });

                // Info window for properties
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px; max-width: 200px;">
                            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111;">
                                ${property.title}
                            </h3>
                            <p style="margin: 0; font-size: 12px; color: #666;">
                                📍 ${property.location?.address || 'Dirección no disponible'}
                            </p>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: #EF4444; font-weight: 500;">
                                🏠 Propiedad
                            </p>
                        </div>
                    `,
                });

                marker.addListener('click', () => {
                    infoWindow.open(mapInstanceRef.current!, marker);
                });

                markersRef.current.push(marker);
                bounds.extend(position);
                hasValidCoordinates = true;
            }
        });

        // Add institution markers (BLUE)
        institutions.forEach(institution => {
            const lat = institution.latitude;
            const lng = institution.longitude;

            if (lat && lng && lat !== 0 && lng !== 0) {
                const position = { lat: Number(lat), lng: Number(lng) };

                const marker = new google.maps.Marker({
                    map: mapInstanceRef.current!,
                    position,
                    title: institution.name,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#3B82F6', // Blue
                        fillOpacity: 0.9,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                    },
                    animation: google.maps.Animation.DROP,
                });

                // Info window for institutions
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px; max-width: 200px;">
                            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111;">
                                ${institution.name}
                            </h3>
                            ${institution.acronym ? `
                                <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                                    <strong>${institution.acronym}</strong>
                                </p>
                            ` : ''}
                            <p style="margin: 0; font-size: 11px; color: #3B82F6; font-weight: 500;">
                                🎓 ${institution.type.charAt(0).toUpperCase() + institution.type.slice(1)}
                            </p>
                        </div>
                    `,
                });

                marker.addListener('click', () => {
                    infoWindow.open(mapInstanceRef.current!, marker);
                });

                markersRef.current.push(marker);
                bounds.extend(position);
                hasValidCoordinates = true;
            }
        });

        // Fit bounds if we have valid coordinates
        if (hasValidCoordinates && markersRef.current.length > 0) {
            mapInstanceRef.current.fitBounds(bounds);
            
            // Don't zoom in too much if there's only one marker
            const listener = google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
                if (mapInstanceRef.current!.getZoom()! > 15) {
                    mapInstanceRef.current!.setZoom(15);
                }
                google.maps.event.removeListener(listener);
            });
        }
    }, [properties, institutions]);

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
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
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

            {/* Legend */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                        <span className="text-gray-700 font-medium">Propiedades ({properties.filter(p => p.location?.latitude && p.location?.longitude).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                        <span className="text-gray-700 font-medium">Instituciones ({institutions.filter(i => i.latitude && i.longitude).length})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertiesMap;
