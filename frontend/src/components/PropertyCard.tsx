import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Star, MessageCircle, Heart, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Property } from '../types';
import { mockAmenities } from '../data/mockData';
import { useFavorites } from '../context/FavoritesContext';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { iconMap } from '../lib/icons';
import { authService } from '../services/authService';

interface PropertyCardProps {
  property: Property;
  index?: number;
  showRemoveButton?: boolean;
  onRemoveFavorite?: (propertyId: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0, showRemoveButton = false, onRemoveFavorite }) => {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  if (!property || !property.id) {
    return null;
  }

  const isFav = isFavorite(String(property.id));
  const currentUser = authService.getStoredUser();

  const ownerPlan = property.owner?.plan || 'free';
  const isOwnerVerified = property.owner?.verificationStatus === 'verified';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      if (onRemoveFavorite) {
        onRemoveFavorite(String(property.id));
      } else {
        removeFavorite(String(property.id));
      }
    } else {
      addFavorite(String(property.id));
    }
  };

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

  const isOwnerFree = ownerPlan === 'free';
  const isUserPremium = currentUser?.plan === 'premium';
  const canContact = !isOwnerFree || isUserPremium;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canContact) {
      navigate('/perfil?tab=billing');
    } else {
      navigate(`/propiedad/${property.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full"
    >
      <Link to={`/propiedad/${property.id}`} className="relative block overflow-hidden">
        {/* Image - Responsive aspect ratio */}
        <div className="aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden">
          <img
            src={(property.images && property.images.length > 0) ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url) : 'https://via.placeholder.com/400x300'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Badges - Top Left */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
          {property.isFeatured && (
            <Badge variant="warning" className="shadow-sm text-xs">
              <Star className="h-3 w-3 mr-1 fill-current" />
              <span className="hidden sm:inline">Destacado</span>
              <span className="sm:hidden">★</span>
            </Badge>
          )}
          {isOwnerVerified && (
            <Badge variant="success" className="shadow-sm text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Verificado</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          )}
        </div>

        {/* Type Badge - Top Right */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm text-xs">
            {getTypeLabel(property.type?.name || 'apartamento')}
          </Badge>
        </div>

        {/* Favorite Button - Bottom Right - Touch-friendly & Centered */}
        {!showRemoveButton && (
          <button
            onClick={toggleFavorite}
            className={cn(
              "absolute bottom-2 sm:bottom-3 right-2 sm:right-3",
              "min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px]",
              "flex items-center justify-center",
              "rounded-full shadow-md transition-all duration-200",
              "active:scale-95",
              isFav
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
            )}
            aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
          </button>
        )}
      </Link>

      {/* Content Section */}
      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
        <Link to={`/propiedad/${property.id}`} className="block">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-emerald-500 flex-shrink-0" />
            <span className="line-clamp-1">{property.location?.city}, {property.location?.department}</span>
          </div>

          {/* Amenities Icons - Scrollable on mobile */}
          <div className="flex gap-2 sm:gap-3 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {property.amenities?.slice(0, 6).map((amenity, idx) => {
              const amenityName = typeof amenity === 'string'
                ? mockAmenities.find(a => a.id === amenity)?.name
                : amenity.name;
              const amenityIcon = typeof amenity === 'string'
                ? mockAmenities.find(a => a.id === amenity)?.icon
                : amenity.icon;

              const IconComponent = amenityIcon ? iconMap[amenityIcon] || iconMap.default : iconMap.default;

              return (
                <div
                  key={idx}
                  title={amenityName}
                  className="bg-gray-50 p-1.5 rounded-md flex-shrink-0"
                >
                  <IconComponent size={14} className="text-gray-500" />
                </div>
              );
            })}
            {(property.amenities?.length || 0) > 6 && (
              <div className="bg-gray-50 p-1.5 rounded-md text-xs text-gray-500 font-medium flex items-center justify-center min-w-[28px] h-7 flex-shrink-0">
                +{(property.amenities?.length || 0) - 6}
              </div>
            )}
          </div>

          {/* Description - Hidden on mobile to save space */}
          <p className="hidden sm:block text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            {property.description}
          </p>
        </Link>

        {/* Property Details */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-50">
          {property.bedrooms && property.type?.name !== 'habitacion' && (
            <div className="flex items-center" title="Habitaciones">
              <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center" title="Baños">
              <Bath className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center" title="Área">
              <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              <span>{property.area}m²</span>
            </div>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          {/* Price */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-gray-400 font-medium">Precio</span>
            <div className="flex items-baseline">
              <span className="text-lg sm:text-xl font-bold text-emerald-600 truncate">
                {formatPrice(property.monthlyRent)}
              </span>
              <span className="text-xs text-gray-500 ml-1 flex-shrink-0">/mes</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {showRemoveButton && (
              <button
                onClick={toggleFavorite}
                className="min-w-[44px] min-h-[44px] px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center gap-1.5 active:scale-95"
                title="Quitar de favoritos"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">Quitar</span>
              </button>
            )}
            <button
              onClick={handleWhatsAppClick}
              className={cn(
                "min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-all active:scale-95",
                canContact
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:bg-emerald-200"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 active:bg-gray-300"
              )}
              title={canContact ? "Contactar por WhatsApp" : "Requiere plan Premium"}
              aria-label={canContact ? "Contactar" : "Bloqueado - Requiere Premium"}
            >
              {canContact ? (
                <MessageCircle className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;