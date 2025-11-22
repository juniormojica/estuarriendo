import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Star, MessageCircle, Heart, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Property } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, index = 0 }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(property.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(property.id);
    } else {
      addFavorite(property.id);
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

  const getTypeLabel = (type: Property['type']) => {
    const labels = {
      'apartamento': 'Apartamento',
      'habitacion': 'Habitación',
      'pension': 'Pensión',
      'aparta-estudio': 'Aparta-estudio'
    };
    return labels[type];
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
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.featured && (
            <Badge variant="warning" className="shadow-sm">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Destacado
            </Badge>
          )}
          {property.isVerified && (
            <Badge variant="success" className="shadow-sm">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm">
            {getTypeLabel(property.type)}
          </Badge>
        </div>

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
            <span className="line-clamp-1">{property.address.city}, {property.address.department}</span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            {property.description}
          </p>
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-50">
          {property.rooms && property.type !== 'habitacion' && (
            <div className="flex items-center" title="Habitaciones">
              <Bed className="h-4 w-4 mr-1.5" />
              <span>{property.rooms}</span>
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
                {formatPrice(property.price)}
              </span>
              <span className="text-xs text-gray-500 ml-1">/mes</span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://wa.me/573000000000?text=Hola, estoy interesado en la propiedad: ${property.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              title="Contactar por WhatsApp"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;