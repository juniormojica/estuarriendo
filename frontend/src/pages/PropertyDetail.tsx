import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bed, Bath, Square, Calendar, Star, MessageCircle, GraduationCap, Heart, ShieldCheck, Lock
} from 'lucide-react';
import { Property, User } from '../types';
import { api } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import { fetchPropertyById } from '../store/slices/propertiesSlice';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFavorites } from '../context/FavoritesContext';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import RelatedProperties from '../components/RelatedProperties';
import { iconMap } from '../lib/icons';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import AuthModal from '../components/AuthModal';
import { authService } from '../services/authService';
import { useToast } from '../components/ToastProvider';

const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: '100%',
  height: '100%'
};

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { items: amenities } = useAppSelector((state) => state.amenities);
  const { currentProperty, loading: propertiesLoading } = useAppSelector((state) => state.properties);

  const [ownerDetails, setOwnerDetails] = useState<{ name: string; whatsapp: string; email: string; plan: 'free' | 'premium' } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFavoriteAction, setPendingFavoriteAction] = useState<'add' | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Get property from Redux state - use currentProperty which is set by fetchPropertyById
  const property = currentProperty;

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = property ? isFavorite(String(property.id)) : false;
  const toast = useToast();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.log('⚠️ No property ID provided');
        return;
      }

      try {
        console.log('🚀 Starting property load for ID:', id);
        setIsLoading(true);
        setError('');

        // Fetch amenities from Redux
        console.log('📦 Fetching amenities...');
        dispatch(fetchAmenities());

        // Fetch property data from Redux
        console.log('🏠 Fetching property by ID:', id);
        const resultAction = await dispatch(fetchPropertyById(id));

        console.log('🔍 Property fetch result:', resultAction);
        console.log('🔍 Result type:', resultAction.type);
        console.log('🔍 Result payload:', resultAction.payload);

        if (fetchPropertyById.rejected.match(resultAction)) {
          console.error('❌ Property fetch was rejected:', resultAction);
          console.error('❌ Error payload:', resultAction.payload);
          setError('Propiedad no encontrada');
          setIsLoading(false);
          return;
        }

        if (fetchPropertyById.fulfilled.match(resultAction)) {
          console.log('✅ Property fetch successful!');
          console.log('✅ Property data:', resultAction.payload);
        }

        // Get current user from localStorage
        const storedUser = localStorage.getItem('estuarriendo_current_user');
        if (storedUser) {
          console.log('👤 Current user found in localStorage');
          setCurrentUser(JSON.parse(storedUser));
        } else {
          console.log('👤 No current user in localStorage');
        }

      } catch (err) {
        console.error('💥 Error loading property:', err);
        setError('Error al cargar la propiedad');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, dispatch]);

  // Fetch owner details when property is loaded
  useEffect(() => {
    console.log('👤 Owner effect triggered, property:', property);

    if (property?.owner) {
      console.log('✅ Owner data found in property:', property.owner);
      // Owner data comes with the property from backend
      setOwnerDetails({
        name: property.owner.name || '',
        whatsapp: property.owner.whatsapp || '',
        email: property.owner.email || '',
        plan: property.owner.plan || 'free'
      });
      console.log('✅ Owner details set successfully');
    } else if (property?.ownerId && !ownerDetails) {
      console.warn('⚠️ Owner details not included in property response, ownerId:', property.ownerId);
      // Fallback: fetch owner details if not included
      const fetchOwner = async () => {
        try {
          // For now, we'll just use basic info from property
          // In the future, we could implement api.getOwnerContactDetails
          console.warn('⚠️ Owner details not included in property response');
        } catch (err) {
          console.error('❌ Error fetching owner details:', err);
        }
      };
      fetchOwner();
    } else {
      console.log('ℹ️ No owner data available yet');
    }
  }, [property, ownerDetails]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const toggleFavorite = () => {
    if (!property) return;

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      setPendingFavoriteAction('add');
      setShowAuthModal(true);
      return;
    }

    // User is authenticated - proceed normally
    if (isFav) {
      removeFavorite(String(property.id));
      toast.info(`❤️ Eliminado de favoritos: ${property.title}`);
    } else {
      addFavorite(String(property.id));
      toast.success(`❤️ Agregado a favoritos: ${property.title}`);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingFavoriteAction === 'add' && property) {
      addFavorite(String(property.id));
      toast.success(`❤️ Agregado a favoritos: ${property.title}`);
      setPendingFavoriteAction(null);
    }
  };

  if (isLoading) {
    console.log('⏳ Rendering loading state...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Cargando propiedad..." />
      </div>
    );
  }

  if (error || !property) {
    console.error('❌ Rendering error state:', { error, hasProperty: !!property });
    console.log('📊 Current property state:', property);
    console.log('📊 Current loading state:', isLoading);
    console.log('📊 Current error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Propiedad no encontrada'}</p>
          <p className="text-sm text-gray-500 mb-4">ID de propiedad: {id}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'apartamento': 'Apartamento',
      'habitacion': 'Habitación',
      'pension': 'Pensión',
      'aparta-estudio': 'Aparta-estudio'
    };
    return labels[type] || 'Propiedad';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAmenityDetails = (amenityId: string | number) => {
    return amenities.find(a => String(a.id) === String(amenityId));
  };

  const handleInterest = async () => {
    console.log('Button clicked! property:', property, 'currentUser:', currentUser, 'ownerDetails:', ownerDetails);
    if (!property || !currentUser || !currentUser.id || !ownerDetails) return;
    try {
      await api.notifyOwnerInterest(property.ownerId, property.id, currentUser.id);
      alert('Se ha notificado al propietario de tu interés.');
    } catch (error) {
      console.error('Error notifying owner:', error);
      alert('Hubo un error al notificar al propietario.');
    }
  };

  // Logic for contact permissions
  const isOwnerFree = ownerDetails?.plan === 'free';
  const isUserPremium = currentUser?.plan === 'premium';
  // Can contact if owner is premium OR user is premium
  const canContact = !isOwnerFree || isUserPremium;

  console.log('🎨 Rendering property detail page for:', property.title);
  console.log('📊 Property data:', property);
  console.log('👤 Owner details:', ownerDetails);
  console.log('👤 Current user:', currentUser);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 min-h-[44px] px-3 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Volver a los resultados</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Image Gallery - Mobile Optimized */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <ImageGallery images={(property.images || []).map(img => typeof img === 'string' ? img : img.url)} alt={property.title} />
            </div>

            {/* Property Info - Responsive Padding */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
              {/* Header Section - Mobile Optimized */}
              <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Badges - Responsive */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {getTypeLabel(property.type?.name || 'apartamento')}
                    </Badge>
                    {property.isFeatured && (
                      <Badge variant="warning" className="text-xs sm:text-sm">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="hidden sm:inline">Destacado</span>
                        <span className="sm:hidden">★</span>
                      </Badge>
                    )}
                    {property.isVerified && (
                      <Badge variant="success" className="text-xs sm:text-sm">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Verificado</span>
                        <span className="sm:hidden">✓</span>
                      </Badge>
                    )}
                    <Badge variant={property.isRented ? "default" : "success"} className="text-xs sm:text-sm">
                      {property.isRented ? 'Rentada' : 'Disponible'}
                    </Badge>
                  </div>

                  {/* Title - Responsive Typography */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{property.title}</h1>

                  {/* Location - Responsive */}
                  <div className="flex items-start sm:items-center text-gray-600">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-sm sm:text-base lg:text-lg">{property.location?.street}, {property.location?.city}, {property.location?.department}</span>
                  </div>
                </div>
              </div>

              {/* Key Stats Grid - Mobile Optimized */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {property.bedrooms && property.type?.name !== 'habitacion' && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center">
                    <Bed className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-emerald-600 mb-1.5 sm:mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Habitaciones</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center">
                    <Bath className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-emerald-600 mb-1.5 sm:mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Baños</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{property.bathrooms}</p>
                  </div>
                )}
                {property.area && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center">
                    <Square className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-emerald-600 mb-1.5 sm:mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Área</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{property.area}m²</p>
                  </div>
                )}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl text-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-emerald-600 mb-1.5 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Publicado</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{formatDate(property.createdAt)}</p>
                </div>
              </div>

              {/* Description - Responsive */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Descripción</h2>
                <div className="prose prose-emerald max-w-none text-sm sm:text-base text-gray-600 leading-relaxed">
                  {property.description}
                </div>
              </div>

              {/* Amenities - Mobile Optimized */}
              {(property.amenities && property.amenities.length > 0) && (
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {property.type?.name === 'habitacion' ? 'Características' : 'Comodidades'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {property.amenities.map(amenity => {
                      const amenityId = typeof amenity === 'string' ? amenity : amenity.id;
                      const amenityDetails = typeof amenity === 'string' ? getAmenityDetails(amenity) : amenity;
                      const IconComponent = amenityDetails ? iconMap[amenityDetails.icon] : null;

                      return amenityDetails ? (
                        <div key={String(amenityId)} className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 flex-shrink-0">
                            {IconComponent ? (
                              <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{amenityDetails.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Map Section - Mobile Optimized */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-emerald-600" />
                  Ubicación en el Mapa
                </h2>

                {/* Map Legend - Responsive */}
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm bg-gray-50 px-2.5 sm:px-3 py-2 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border border-red-600"></div>
                    <span className="text-gray-700 font-medium">Esta Propiedad</span>
                  </div>
                  <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 border border-blue-600"></div>
                    <span className="text-gray-700 font-medium">Universidades</span>
                  </div>
                </div>
              </div>

              {/* Map Container - Responsive Height */}
              <div className="rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 h-64 sm:h-80 lg:h-96 bg-gray-50 relative">
                {property.location?.latitude && property.location?.longitude && property.location.latitude !== 0 && property.location.longitude !== 0 ? (
                  isLoaded ? (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={{
                        lat: Number(property.location.latitude),
                        lng: Number(property.location.longitude)
                      }}
                      zoom={16}
                      onClick={() => setActiveMarker(null)}
                    >
                      {/* Property Marker */}
                      <MarkerF
                        position={{
                          lat: Number(property.location.latitude),
                          lng: Number(property.location.longitude)
                        }}
                        onClick={() => setActiveMarker('property')}
                      >
                        {activeMarker === 'property' && (
                          <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                            <div className="p-2 min-w-[150px]">
                              <h3 className="font-bold text-gray-900 text-sm mb-1">{property.title}</h3>
                              <p className="text-xs text-gray-600">Ubicación exacta de la propiedad</p>
                            </div>
                          </InfoWindowF>
                        )}
                      </MarkerF>

                      {/* University Markers */}
                      {property.institutions?.map(institution => {
                        console.log('🏫 Institution data:', institution);
                        console.log('📍 Coordinates:', { lat: institution?.latitude, lng: institution?.longitude });

                        if (institution && institution.latitude && institution.longitude) {
                          return (
                            <MarkerF
                              key={institution.id}
                              position={{
                                lat: Number(institution.latitude),
                                lng: Number(institution.longitude)
                              }}
                              icon={{
                                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                scaledSize: new window.google.maps.Size(40, 40)
                              }}
                              onClick={() => setActiveMarker(String(institution.id))}
                            >
                              {activeMarker === String(institution.id) && (
                                <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                                  <div className="p-2 min-w-[150px]">
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{institution.name}</h3>
                                    <p className="text-xs text-gray-600">Universidad cercana</p>
                                  </div>
                                </InfoWindowF>
                              )}
                            </MarkerF>
                          );
                        }
                        console.log('❌ Institution skipped - missing coordinates');
                        return null;
                      })}
                    </GoogleMap>

                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LoadingSpinner text="Cargando mapa..." />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                      <MapPin className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="font-medium text-gray-500">Mapa Interactivo no disponible</p>
                    <p className="text-xs mt-1">El propietario no ha proporcionado las coordenadas exactas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location Information - Mobile Optimized */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-emerald-600" />
                Información de Ubicación
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Ciudad</p>
                  <p className="font-semibold text-gray-900">{property.location?.city}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Departamento</p>
                  <p className="font-semibold text-gray-900">{property.location?.department}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Dirección</p>
                  <p className="font-semibold text-gray-900">{property.location?.street}</p>
                </div>
                {property.location?.neighborhood && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <p className="text-sm text-gray-500 mb-1">Barrio</p>
                    <p className="font-semibold text-gray-900">{property.location.neighborhood}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Universities */}
            {property.institutions && property.institutions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-6 w-6 mr-2 text-emerald-600" />
                  Universidades Cercanas
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {property.institutions.map(institution => {
                    return institution ? (
                      <div key={institution.id} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <GraduationCap className="h-5 w-5 text-emerald-600" />
                          </div>
                          <span className="font-medium text-gray-900">{institution.name}</span>
                        </div>
                        {/* Could add distance here if available */}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Related Properties */}
            <RelatedProperties
              currentPropertyId={String(property.id)}
              city={property.location?.city || ''}
              type={property.type?.name || 'apartamento'}
            />
          </div>

          {/* Sidebar - Mobile Optimized */}
          <div className="lg:col-span-1">
            {/* Sticky on desktop, normal flow on mobile */}
            <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                {/* Price - Responsive */}
                <div className="text-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Precio de alquiler</p>
                  <div className="flex items-center justify-center text-emerald-600">
                    <span className="text-3xl sm:text-4xl font-bold">{formatPrice(property.monthlyRent)}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 mt-1">/ mes</p>

                  {/* Owner Plan Message - Responsive */}
                  <div className="mt-3 sm:mt-4 px-1 sm:px-2">
                    {isOwnerFree ? (
                      !canContact ? (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                          El propietario tiene plan gratis, no puedes contactarlo por WhatsApp. Haciendo click en 'Me interesa' hazle saber que quieres alquilar su publicación.
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          Como eres usuario Premium, puedes contactar a este propietario directamente.
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        El plan de <span className="font-semibold">{ownerDetails?.name || 'el propietario'}</span> es premium y lo puedes contactar de forma gratuita.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions - Mobile Optimized */}
                <div className="space-y-2.5 sm:space-y-3">
                  {isOwnerFree && (
                    <button
                      onClick={handleInterest}
                      className="w-full min-h-[48px] bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Me interesa</span>
                    </button>
                  )}

                  {canContact ? (
                    <a
                      href={`https://wa.me/${ownerDetails?.whatsapp}?text=Hola, estoy interesado en la propiedad: ${property.title} (ID: ${property.id})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[48px] bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 group text-sm sm:text-base"
                    >
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  ) : (
                    <Link
                      to="/perfil?tab=billing"
                      className="w-full min-h-[48px] bg-gray-100 text-gray-500 py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center justify-center space-x-2 group cursor-pointer border border-gray-200 text-xs sm:text-sm"
                    >
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Actualiza a Premium para contactar</span>
                      <span className="sm:hidden">Actualiza a Premium</span>
                    </Link>
                  )}

                  <button
                    onClick={toggleFavorite}
                    className={cn(
                      "w-full min-h-[48px] py-3.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 border text-sm sm:text-base",
                      isFav
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 active:bg-red-200"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
                    )}
                  >
                    <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isFav && "fill-current")} />
                    <span className="hidden sm:inline">{isFav ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}</span>
                    <span className="sm:hidden">{isFav ? 'Guardado' : 'Guardar'}</span>
                  </button>
                </div>

                {/* Safety Note - Responsive */}
                <div className="mt-4 sm:mt-6 bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-blue-900">Alquiler Seguro</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Nunca transfieras dinero sin haber visitado la propiedad. EstuArriendo verifica a los propietarios pero recomienda precaución.
                      </p>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        defaultTab="login"
      />
    </div>
  );
};

export default PropertyDetail;
