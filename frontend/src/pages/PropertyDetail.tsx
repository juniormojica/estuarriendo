import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bed, Bath, Square, Calendar, Star, MessageCircle, GraduationCap, Heart, ShieldCheck, Lock,
  Clock, Users, Ban, Volume2, Utensils, Coffee, Wifi, Zap, Home, ArrowRight
} from 'lucide-react';
import { User } from '../types';
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
import RoomCard from '../components/RoomCard';
import RoomModal from '../components/RoomModal';

const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: '100%',
  height: '100%'
};

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: amenities } = useAppSelector((state) => state.amenities);
  const { currentProperty } = useAppSelector((state) => state.properties);

  const [ownerDetails, setOwnerDetails] = useState<{ name: string; whatsapp: string; email: string; plan: 'free' | 'premium' } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFavoriteAction, setPendingFavoriteAction] = useState<'add' | null>(null);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

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
    if (property?.owner) {
      if (!ownerDetails || ownerDetails.email !== property.owner.email) {
        setOwnerDetails({
          name: property.owner.name || '',
          whatsapp: property.owner.whatsapp || '',
          email: property.owner.email || '',
          plan: property.owner.plan || 'free'
        });
      }
    } else if (property?.ownerId && !ownerDetails) {
      const fetchOwner = async () => {
        try {
          console.warn('⚠️ Owner details not included in property response');
        } catch (err) {
          console.error('❌ Error fetching owner details:', err);
        }
      };
      fetchOwner();
    }
  }, [property?.id, property?.owner?.email, property?.ownerId]);

  // Check contact unlock status
  useEffect(() => {
    const checkUnlockStatus = async () => {
      // If user is authenticated and we have a property
      if (currentUser?.id && property?.id) {
        try {
          const res = await api.checkContactUnlocked(String(currentUser.id), String(property.id));
          setContactUnlocked(res.unlocked);
        } catch (err) {
          console.error('Error checking unlock status', err);
        }
      }
    };
    if (currentUser?.id && property?.id) {
      checkUnlockStatus();
    }
  }, [currentUser?.id, property?.id]);
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

  // Helper to get city/department name from object or string
  const getLocationValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return value.name;
    return '';
  };

  const getAmenityDetails = (amenityId: string | number) => {
    return amenities.find(a => String(a.id) === String(amenityId));
  };

  const handleInterest = async () => {
    console.log('Button clicked! property:', property, 'currentUser:', currentUser, 'ownerDetails:', ownerDetails);
    if (!property || !currentUser || !currentUser.id || !ownerDetails) return;
    try {
      await api.notifyOwnerInterest(property.ownerId, property.id.toString(), currentUser.id);
      alert('Se ha notificado al propietario de tu interés.');
    } catch (error) {
      console.error('Error notifying owner:', error);
      alert('Hubo un error al notificar al propietario.');
    }
  };

  // Logic for contact permissions
  const isOwnerFree = ownerDetails?.plan === 'free';
  const isUserPremium = currentUser && ['weekly', 'monthly', 'quarterly', 'premium'].includes(currentUser.plan as string); // Check valid active plans
  const isTenant = currentUser?.userType === 'tenant';

  // Can contact freely if owner is premium OR user is a premium owner
  // If owner is free and user is tenant, depends on contactUnlocked
  const canContactFree = !isOwnerFree || (!isTenant && isUserPremium);
  const canViewContact = canContactFree || contactUnlocked;

  const handleUnlockContact = async () => {
    if (!currentUser?.id) {
      setShowAuthModal(true);
      return;
    }

    setShowCreditModal(false);

    try {
      setIsUnlocking(true);
      const res: any = await api.unlockContact(String(currentUser.id), String(property.id));
      if (res.success || res.unlocked) {
        setContactUnlocked(true);
        toast.success(res.isFree ? 'El propietario es premium, el contacto es gratis.' : '¡Contacto desbloqueado con éxito!');
      } else {
        toast.error(res.error || 'No tienes suficientes créditos para desbloquear este contacto.');
      }
    } catch (error: any) {
      console.error('Error unlocking contact:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error al desbloquear el contacto.');
    } finally {
      setIsUnlocking(false);
    }
  };

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

            {/* FOR CONTAINERS: Title and Description First (no gallery) */}
            {/* FOR REGULAR PROPERTIES: Gallery First */}
            {!property.isContainer && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <ImageGallery images={(property.images || []).map(img => typeof img === 'string' ? img : img.url)} alt={property.title} />
              </div>
            )}

            {/* Property Info - Responsive Padding */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
              {/* Header Section - Mobile Optimized */}
              <div className="flex flex-col gap-4 mb-4 sm:mb-6">

                {/* Parent Container Banner - For Individual Rooms */}
                {property.parentId && property.container && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                      <Home className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-amber-900">
                        Esta habitacion pertenece a <span className="font-semibold">{property.container.title}</span>.
                      </p>
                      <Link
                        to={`/propiedad/${property.parentId}`}
                        className="text-xs sm:text-sm text-amber-700 font-medium hover:text-amber-800 hover:underline flex items-center mt-0.5 group"
                      >
                        Ver pensión completa y otras habitaciones <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                )}
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
                    <span className="text-sm sm:text-base lg:text-lg">
                      {property.location?.street}, {getLocationValue(property.location?.city)}, {getLocationValue(property.location?.department)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Stats Grid - Mobile Optimized - ONLY FOR NON-CONTAINERS */}
              {!property.isContainer && (
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
              )}

              {/* Description - Responsive */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Descripción</h2>
                <div className="prose prose-emerald max-w-none text-sm sm:text-base text-gray-600 leading-relaxed">
                  {property.description}
                </div>
              </div>

              {/* Amenities - Mobile Optimized - ONLY FOR NON-CONTAINERS */}
              {!property.isContainer && (property.amenities && property.amenities.length > 0) && (
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

            {/* FOR CONTAINERS: Banner + Rooms Section */}
            {property.isContainer && property.rentalMode === 'by_unit' && (
              <>
                {/* Container Type Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Home className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold">
                        {getTypeLabel(property.type?.name || 'apartamento')}
                      </h2>
                      <p className="text-emerald-100 mt-1">
                        Esta propiedad tiene {property.totalUnits || property.units?.length || 0} habitaciones que se arriendan individualmente
                      </p>
                    </div>
                  </div>
                </div>

                {/* Units Section - Visual Room Cards */}
                {property.units && property.units.length > 0 && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
                      <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                          Habitaciones
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                          {property.units.filter(u => !u.isRented).length} disponibles de {property.totalUnits || property.units.length} habitaciones
                        </p>
                      </div>
                      <div className="flex sm:hidden items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 self-start">
                        <Bed className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">
                          {property.units.filter(u => !u.isRented).length} opciones
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
                        <Bed className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">
                          {property.units.filter(u => !u.isRented).length} opciones
                        </span>
                      </div>
                    </div>

                    {/* Room Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {[...property.units].sort((a, b) => Number(a.isRented) - Number(b.isRented)).map((unit) => (
                        <RoomCard
                          key={unit.id}
                          room={unit}
                          onClick={() => {
                            setSelectedRoom(unit);
                            setShowRoomModal(true);
                          }}
                        />
                      ))}
                    </div>

                    {/* Info Banner */}
                    <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                      <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Tip:</span> Haz clic en cualquier habitación para ver su galería de fotos completa, amenidades y detalles.
                      </p>
                    </div>
                  </div>
                )}

              </>
            )}

            {/* Common Areas Section - Shared logic for Container and Units */}
            {((property.commonAreas && property.commonAreas.length > 0) || (property.container?.commonAreas && property.container.commonAreas.length > 0)) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Áreas Comunes</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(property.commonAreas && property.commonAreas.length > 0 ? property.commonAreas : property.container?.commonAreas || []).map((area) => {
                    const IconComponent = area.icon ? iconMap[area.icon] : Home;
                    return (
                      <div key={area.id} className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 flex-shrink-0">
                          {IconComponent ? (
                            <IconComponent className="h-4 w-4" />
                          ) : (
                            <Home className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-700">{area.name}</span>
                          {area.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{area.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gallery of Common Areas - Shared logic */}
            {((property.isContainer && property.images && property.images.length > 0) || (property.container?.images && property.container.images.length > 0)) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 sm:p-6 lg:p-8 pb-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    {property.isContainer ? 'Fotos de Áreas Comunes y Fachada' : `Fotos de Áreas Comunes (${property.container?.title})`}
                  </h2>
                </div>
                <ImageGallery
                  images={(property.isContainer ? (property.images || []) : (property.container?.images || [])).map(img => typeof img === 'string' ? img : img.url)}
                  alt={property.isContainer ? property.title : property.container?.title || 'Common Areas'}
                />
              </div>
            )}

            {/* Rules Section - For habitacion and pension */}
            {((property.rules && property.rules.length > 0) || (property.container?.rules && property.container.rules.length > 0)) && (property.type?.name === 'habitacion' || property.type?.name === 'pension' || property.parentId) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Reglas de Convivencia</h2>
                <div className="space-y-3 sm:space-y-4">
                  {(property.rules && property.rules.length > 0 ? property.rules : property.container?.rules || []).map((rule, index) => {
                    const getRuleIcon = (ruleType: string) => {
                      switch (ruleType) {
                        case 'smoking': return <Ban className="h-5 w-5" />;
                        case 'pets': return <Ban className="h-5 w-5" />;
                        case 'visits': return <Users className="h-5 w-5" />;
                        case 'noise': return <Volume2 className="h-5 w-5" />;
                        case 'curfew': return <Clock className="h-5 w-5" />;
                        default: return <Ban className="h-5 w-5" />;
                      }
                    };

                    const getRuleLabel = (ruleType: string) => {
                      switch (ruleType) {
                        case 'smoking': return 'Fumar';
                        case 'pets': return 'Mascotas';
                        case 'visits': return 'Visitas';
                        case 'noise': return 'Horario de silencio';
                        case 'curfew': return 'Hora límite de llegada';
                        case 'tenant_profile': return 'Perfil de inquilino';
                        case 'couples': return 'Parejas';
                        case 'children': return 'Niños';
                        default: return ruleType;
                      }
                    };

                    return (
                      <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                        <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                          {getRuleIcon(rule.ruleType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                              {getRuleLabel(rule.ruleType)}
                            </h3>
                            {(rule.ruleType === 'smoking' || rule.ruleType === 'pets' || rule.ruleType === 'couples' || rule.ruleType === 'children') && (
                              <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${rule.isAllowed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {rule.isAllowed ? 'Permitido' : 'No permitido'}
                              </span>
                            )}
                          </div>
                          {rule.value && (
                            <p className="text-sm text-gray-700 font-medium mb-1">
                              {rule.value}
                            </p>
                          )}
                          {rule.description && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              {rule.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services Section - For pension and habitacion */}
            {((property.services && property.services.length > 0) || (property.container?.services && property.container.services.length > 0)) && (property.type?.name === 'pension' || property.type?.name === 'habitacion' || property.parentId) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Servicios Incluidos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {(property.services && property.services.length > 0 ? property.services : property.container?.services || []).map((service, index) => {
                    const getServiceIcon = (serviceType: string) => {
                      switch (serviceType) {
                        case 'breakfast': return <Coffee className="h-5 w-5" />;
                        case 'lunch': return <Utensils className="h-5 w-5" />;
                        case 'dinner': return <Utensils className="h-5 w-5" />;
                        case 'housekeeping': return <Home className="h-5 w-5" />;
                        case 'laundry': return <Home className="h-5 w-5" />;
                        case 'wifi': return <Wifi className="h-5 w-5" />;
                        case 'utilities': return <Zap className="h-5 w-5" />;
                        default: return <Home className="h-5 w-5" />;
                      }
                    };

                    const getServiceLabel = (serviceType: string) => {
                      switch (serviceType) {
                        case 'breakfast': return 'Desayuno';
                        case 'lunch': return 'Almuerzo';
                        case 'dinner': return 'Cena';
                        case 'housekeeping': return 'Limpieza';
                        case 'laundry': return 'Lavandería';
                        case 'wifi': return 'WiFi';
                        case 'utilities': return 'Servicios públicos';
                        default: return serviceType;
                      }
                    };

                    return (
                      <div key={index} className={`flex items-start space-x-3 p-3 sm:p-4 rounded-lg border ${service.isIncluded
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className={`flex-shrink-0 p-2 rounded-lg shadow-sm ${service.isIncluded ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {getServiceIcon(service.serviceType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                              {getServiceLabel(service.serviceType)}
                            </h3>
                            {service.isIncluded ? (
                              <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                Incluido
                              </span>
                            ) : service.additionalCost ? (
                              <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                                +${service.additionalCost.toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                          {service.description && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                  <p className="font-semibold text-gray-900">{getLocationValue(property.location?.city)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Departamento</p>
                  <p className="font-semibold text-gray-900">{getLocationValue(property.location?.department)}</p>
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
              city={getLocationValue(property.location?.city) || ''}
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
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">
                    {property.isContainer && property.rentalMode === 'by_unit'
                      ? 'Rango de precios de habitaciones'
                      : 'Precio de alquiler'}
                  </p>

                  {property.isContainer && property.rentalMode === 'by_unit' && property.units && property.units.length > 0 ? (
                    // Show price range for containers rented by unit
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
                          <p className="text-xs text-emerald-600 font-medium mb-1">Desde</p>
                          <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                            {formatPrice(Math.min(...property.units.map(u => u.monthlyRent)))}
                          </p>
                        </div>
                        <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
                          <p className="text-xs text-emerald-600 font-medium mb-1">Hasta</p>
                          <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                            {formatPrice(Math.max(...property.units.map(u => u.monthlyRent)))}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">por habitación / mes</p>
                    </>
                  ) : (
                    // Show single price for regular properties
                    <>
                      <div className="flex items-center justify-center text-emerald-600">
                        <span className="text-3xl sm:text-4xl font-bold">{formatPrice(property.monthlyRent)}</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-500 mt-1">/ mes</p>
                    </>
                  )}

                  {/* Owner Plan Message - Responsive */}
                  <div className="mt-3 sm:mt-4 px-1 sm:px-2">
                    {canContactFree ? (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        El plan de <span className="font-semibold">{ownerDetails?.name || 'el propietario'}</span> es premium y lo puedes contactar de forma gratuita.
                      </p>
                    ) : (
                      contactUnlocked ? (
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          Has desbloqueado el contacto de este propietario.
                        </p>
                      ) : (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                          El propietario tiene plan gratis. {isTenant ? 'Necesitas usar un crédito para ver su información de contacto.' : 'Actualiza a Premium para contactarlo directamente.'}
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Actions - Mobile Optimized */}
                <div className="space-y-2.5 sm:space-y-3">
                  {isOwnerFree && !isTenant && (
                    <button
                      onClick={handleInterest}
                      className="w-full min-h-[48px] bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Me interesa</span>
                    </button>
                  )}

                  {canViewContact ? (
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
                    isTenant ? (
                      <button
                        onClick={() => setShowCreditModal(true)}
                        disabled={isUnlocking}
                        className="w-full min-h-[48px] bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-all flex items-center justify-center space-x-2 group cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
                      >
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>{isUnlocking ? 'Desbloqueando...' : 'Desbloquear Contacto (1 Crédito)'}</span>
                      </button>
                    ) : (
                      <Link
                        to="/perfil?tab=billing"
                        className="w-full min-h-[48px] bg-gray-100 text-gray-500 py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center justify-center space-x-2 group cursor-pointer border border-gray-200 text-xs sm:text-sm"
                      >
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Actualiza a Premium para contactar</span>
                        <span className="sm:hidden">Actualiza a Premium</span>
                      </Link>
                    )
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

      {/* Room Modal */}
      {selectedRoom && (
        <RoomModal
          isOpen={showRoomModal}
          onClose={() => {
            setShowRoomModal(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        defaultTab="login"
      />

      {/* Credit Unlock Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Desbloquear Contacto</h3>

            {currentUser?.creditBalance?.availableCredits === 0 && !currentUser.creditBalance?.hasUnlimited ? (
              <div className="space-y-4">
                <p className="text-gray-600">No tienes créditos disponibles para desbloquear este contacto.</p>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      localStorage.setItem('estuarriendo_pending_redirect', `/propiedad/${property.id}`);
                      navigate('/planes');
                    }}
                    className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition block text-center"
                  >
                    Comprar Créditos
                  </button>
                  <button
                    onClick={() => setShowCreditModal(false)}
                    className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  ¿Deseas usar <span className="font-bold text-gray-900">1 crédito</span> para ver la información de contacto de este propietario?
                  {currentUser?.creditBalance?.hasUnlimited && (
                    <span className="block mt-2 font-medium text-emerald-600">
                      Tienes créditos ilimitados.
                    </span>
                  )}
                </p>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setShowCreditModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUnlockContact}
                    className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center"
                    disabled={isUnlocking}
                  >
                    {isUnlocking ? 'Procesando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
