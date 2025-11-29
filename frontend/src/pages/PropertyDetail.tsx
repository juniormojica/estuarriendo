import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Bed, Bath, Square, Calendar, Star, MessageCircle, GraduationCap, Heart, ShieldCheck, Lock
} from 'lucide-react';
import { Property, Amenity, User } from '../types';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { universities } from '../data/mockData';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFavorites } from '../context/FavoritesContext';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import RelatedProperties from '../components/RelatedProperties';
import { iconMap } from '../lib/icons';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [ownerDetails, setOwnerDetails] = useState<{ name: string; whatsapp: string; email: string; plan: 'free' | 'premium' } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = property ? isFavorite(property.id) : false;

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError('');
        const [propertyData, amenitiesData] = await Promise.all([
          api.getProperty(id),
          api.getAmenities()
        ]);

        if (!propertyData) {
          setError('Propiedad no encontrada');
          return;
        }

        setProperty(propertyData);
        setAmenities(amenitiesData);

        // Fetch owner details
        if (propertyData.ownerId) {
          const owner = await api.getOwnerContactDetails(propertyData.ownerId);
          setOwnerDetails(owner);
        }

        // Get current user
        const user = authService.getCurrentUser();
        setCurrentUser(user);

      } catch (err) {
        setError('Error al cargar la propiedad');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const toggleFavorite = () => {
    if (!property) return;
    if (isFav) {
      removeFavorite(property.id);
    } else {
      addFavorite(property.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Cargando propiedad..." />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Propiedad no encontrada'}</p>
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

  const getTypeLabel = (type: Property['type']) => {
    const labels = {
      'apartamento': 'Apartamento',
      'habitacion': 'Habitación',
      'pension': 'Pensión',
      'aparta-estudio': 'Aparta-estudio'
    };
    return labels[type];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAmenityDetails = (amenityId: string) => {
    return amenities.find(a => a.id === amenityId);
  };

  const handleInterest = async () => {
    if (!property || !currentUser || !ownerDetails) return;
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

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a los resultados</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <ImageGallery images={property.images} alt={property.title} />
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {getTypeLabel(property.type)}
                    </Badge>
                    {property.featured && (
                      <Badge variant="warning">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Destacado
                      </Badge>
                    )}
                    {property.isVerified && (
                      <Badge variant="success">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{property.title}</h1>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2 text-emerald-500" />
                    <span className="text-lg">{property.address.street}, {property.address.city}, {property.address.department}</span>
                  </div>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {property.rooms && property.type !== 'habitacion' && (
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <Bed className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Habitaciones</p>
                    <p className="font-bold text-gray-900">{property.rooms}</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <Bath className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Baños</p>
                    <p className="font-bold text-gray-900">{property.bathrooms}</p>
                  </div>
                )}
                {property.area && (
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <Square className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Área</p>
                    <p className="font-bold text-gray-900">{property.area}m²</p>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <Calendar className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">Publicado</p>
                  <p className="font-bold text-gray-900 text-sm">{formatDate(property.createdAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
                <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed">
                  {property.description}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {property.type === 'habitacion' ? 'Características' : 'Comodidades'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map(amenityId => {
                      const amenity = getAmenityDetails(amenityId);
                      const IconComponent = amenity ? iconMap[amenity.icon] : null;

                      return amenity ? (
                        <div key={amenityId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600">
                            {IconComponent ? (
                              <IconComponent className="h-4 w-4" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Nearby Universities */}
            {property.nearbyUniversities && property.nearbyUniversities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-6 w-6 mr-2 text-emerald-600" />
                  Universidades Cercanas
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {property.nearbyUniversities.map(uniId => {
                    const university = universities.find(u => u.id === uniId);
                    return university ? (
                      <div key={uniId} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <GraduationCap className="h-5 w-5 text-emerald-600" />
                          </div>
                          <span className="font-medium text-gray-900">{university.name}</span>
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
              currentPropertyId={property.id}
              city={property.address.city}
              type={property.type}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {/* Price */}
                <div className="text-center mb-8 pb-8 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Precio de alquiler</p>
                  <div className="flex items-center justify-center text-emerald-600">
                    <span className="text-4xl font-bold">{formatPrice(property.price)}</span>
                  </div>
                  <p className="text-gray-500 mt-1">/ mes</p>

                  {/* Owner Plan Message */}
                  <div className="mt-4 px-2">
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
                        El plan del propietario es premium y el usuario lo puede contactar de forma gratuita.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {isOwnerFree && (
                    <button
                      onClick={handleInterest}
                      className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2"
                    >
                      <Heart className="h-5 w-5" />
                      <span>Me interesa</span>
                    </button>
                  )}

                  {canContact ? (
                    <a
                      href={`https://wa.me/${ownerDetails?.whatsapp}?text=Hola, estoy interesado en la propiedad: ${property.title} (ID: ${property.id})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 group"
                    >
                      <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  ) : (
                    <Link
                      to="/perfil?tab=billing"
                      className="w-full bg-gray-100 text-gray-500 py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2 group cursor-pointer border border-gray-200"
                    >
                      <Lock className="h-5 w-5" />
                      <span>Actualiza a Premium para contactar</span>
                    </Link>
                  )}

                  <button
                    onClick={toggleFavorite}
                    className={cn(
                      "w-full py-3.5 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 border",
                      isFav
                        ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
                    <span>{isFav ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}</span>
                  </button>
                </div>

                {/* Safety Note */}
                <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">Alquiler Seguro</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Nunca transfieras dinero sin haber visitado la propiedad. EstuArriendo verifica a los propietarios pero recomienda precaución.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ubicación</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Ciudad</span>
                    <span className="font-medium text-gray-900">{property.address.city}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Barrio/Sector</span>
                    <span className="font-medium text-gray-900">{property.address.street}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Departamento</span>
                    <span className="font-medium text-gray-900">{property.address.department}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;