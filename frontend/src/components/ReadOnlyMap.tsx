'use client';
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { api } from '../services/api';

interface Institution {
    id: number;
    name: string;
    acronym?: string;
    latitude?: number;
    longitude?: number;
    type: string;
}

interface ReadOnlyMapProps {
    latitude: number;
    longitude: number;
    address?: string;
}

const ReadOnlyMap: React.FC<ReadOnlyMapProps> = ({ latitude, longitude, address }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const institutionMarkersRef = useRef<google.maps.Marker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [institutions, setInstitutions] = useState<Institution[]>([]);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Fetch institutions
    useEffect(() => {
        const fetchInstitutions = async () => {
            try {
                const data = await api.getAllInstitutions();
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
                    zoom: 14,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                    draggable: true,
                    scrollwheel: true,
                });

                // Save map instance
                mapInstanceRef.current = map;

                // Create property marker (RED)
                const propertyMarker = new google.maps.Marker({
                    map,
                    position,
                    title: address || 'Ubicación de la propiedad',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#EF4444', // Red
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 3,
                    },
                    animation: google.maps.Animation.DROP,
                });

                // Property info window
                const propertyInfoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px; max-width: 200px;">
                            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111;">
                                📍 Propiedad
                            </h3>
                            <p style="margin: 0; font-size: 12px; color: #666;">
                                ${address || 'Ubicación de la propiedad'}
                            </p>
                        </div>
                    `,
                });

                propertyMarker.addListener('click', () => {
                    propertyInfoWindow.open(map, propertyMarker);
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

    // Add institution markers when institutions are loaded
    useEffect(() => {
        if (!mapInstanceRef.current || institutions.length === 0) return;

        // Clear existing institution markers
        institutionMarkersRef.current.forEach(marker => marker.setMap(null));
        institutionMarkersRef.current = [];

        const map = mapInstanceRef.current;

        // Add institution markers (BLUE)
        institutions.forEach(institution => {
            const lat = institution.latitude;
            const lng = institution.longitude;

            if (lat && lng && lat !== 0 && lng !== 0) {
                const instPosition = { lat: Number(lat), lng: Number(lng) };

                const institutionMarker = new google.maps.Marker({
                    map,
                    position: instPosition,
                    title: institution.name,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#3B82F6', // Blue
                        fillOpacity: 0.9,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                    },
                });

                // Save marker reference
                institutionMarkersRef.current.push(institutionMarker);

                // Institution info window
                const institutionInfoWindow = new google.maps.InfoWindow({
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

                institutionMarker.addListener('click', () => {
                    institutionInfoWindow.open(map, institutionMarker);
                });
            }
        });
    }, [institutions]);

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

            {/* Map Legend */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
                        <span className="text-gray-700 font-medium">Esta Propiedad</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                        <span className="text-gray-700 font-medium">Instituciones Cercanas ({institutions.filter(i => i.latitude && i.longitude).length})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReadOnlyMap;
