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
  showRemoveButton?: boolean; // Show explicit remove button instead of heart icon
  onRemoveFavorite?: (propertyId: string) => void; // Custom handler for removing favorites
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0, showRemoveButton = false, onRemoveFavorite }) => {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Safety check: return null if property is undefined
  if (!property || !property.id) {
    return null;
  }

  const isFav = isFavorite(String(property.id));
  const currentUser = authService.getStoredUser();

  // Get owner info from property object (included by backend)
  const ownerPlan = property.owner?.plan || 'free';
  const isOwnerVerified = property.owner?.verificationStatus === 'verified';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      // Use custom handler if provided, otherwise use context
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

  const getAmenityIcon = (amenityId: string) => {
    const amenity = mockAmenities.find(a => a.id === amenityId);
    if (!amenity) return null;

    const iconProps = { size: 14, className: "text-gray-500" };
    const IconComponent = iconMap[amenity.icon] || iconMap.default;

    return <IconComponent {...iconProps} />;
  };

  // Premium logic - same as PropertyDetail
  const isOwnerFree = ownerPlan === 'free';
  const isUserPremium = currentUser?.plan === 'premium';
  const canContact = !isOwnerFree || isUserPremium;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canContact) {
      // Redirect to premium upgrade page
      navigate('/perfil?tab=billing');
    } else {
      // Navigate to property detail where they can contact
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
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={(property.images && property.images.length > 0) ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url) : 'https://via.placeholder.com/400x300'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.isFeatured && (
            <Badge variant="warning" className="shadow-sm">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Destacado
            </Badge>
          )}
          {isOwnerVerified && (
            <Badge variant="success" className="shadow-sm">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Propietario Verificado
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm">
            {getTypeLabel(property.type?.name || 'apartamento')}
          </Badge>
        </div>

        {!showRemoveButton ? (
          <button
            onClick={toggleFavorite}
            className={cn(
              "absolute bottom-3 right-3 p-2 rounded-full shadow-md transition-all duration-200",
              isFav
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
            )}
          >
            <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
          </button>
        ) : null}
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/propiedad/${property.id}`} className="block">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {property.title}
            </h3>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
            <span className="line-clamp-1">{property.location?.city}, {property.location?.department}</span>
          </div>

          {/* Amenities Icons */}
          <div className="flex gap-3 mb-3 overflow-hidden">
            {property.amenities?.slice(0, 5).map((amenity, idx) => {
              const amenityName = typeof amenity === 'string'
                ? mockAmenities.find(a => a.id === amenity)?.name
                : amenity.name;
              const amenityIcon = typeof amenity === 'string'
                ? mockAmenities.find(a => a.id === amenity)?.icon
                : amenity.icon;

              const IconComponent = amenityIcon ? iconMap[amenityIcon] || iconMap.default : iconMap.default;

              return (
                <div key={idx} title={amenityName} className="bg-gray-50 p-1.5 rounded-md">
                  <IconComponent size={14} className="text-gray-500" />
                </div>
              );
            })}
            {(property.amenities?.length || 0) > 5 && (
              <div className="bg-gray-50 p-1.5 rounded-md text-xs text-gray-500 font-medium flex items-center justify-center w-7 h-7">
                +{(property.amenities?.length || 0) - 5}
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            {property.description}
          </p>
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-50">
          {property.bedrooms && property.type?.name !== 'habitacion' && (
            <div className="flex items-center" title="Habitaciones">
              <Bed className="h-4 w-4 mr-1.5" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center" title="Baños">
              <Bath className="h-4 w-4 mr-1.5" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center" title="Área">
              <Square className="h-4 w-4 mr-1.5" />
              <span>{property.area}m²</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Precio</span>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-emerald-600">
                {formatPrice(property.monthlyRent)}
              </span>
              <span className="text-xs text-gray-500 ml-1">/mes</span>
            </div>
          </div>

          <div className="flex gap-2">
            {showRemoveButton && (
              <button
                onClick={toggleFavorite}
                className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
                title="Quitar de favoritos"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span>Quitar</span>
              </button>
            )}
            <button
              onClick={handleWhatsAppClick}
              className={cn(
                "p-2.5 rounded-lg transition-colors",
                canContact
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
              title={canContact ? "Contactar por WhatsApp" : "Requiere plan Premium"}
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