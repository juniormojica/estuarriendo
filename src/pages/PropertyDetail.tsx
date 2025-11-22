import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Square, Calendar, Star, MessageCircle, GraduationCap } from 'lucide-react';
import { Property, Amenity } from '../types';
import { api } from '../services/api';
import { universities } from '../data/mockData';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
      } catch (err) {
        setError('Error al cargar la propiedad');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              <ImageGallery images={property.images} alt={property.title} />
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium">
                      {getTypeLabel(property.type)}
                    </span>
                    {property.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>Destacado</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.address.street}, {property.address.city}, {property.address.department}</span>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {/* Only show rooms if not a single room (habitacion) */}
                {property.rooms && property.type !== 'habitacion' && (
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                    <p className="text-sm text-gray-600">Habitaciones</p>
                    <p className="font-semibold">{property.rooms}</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <Bath className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                    <p className="text-sm text-gray-600">Baños</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                )}
                {property.area && (
                  <div className="text-center">
                    <Square className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                    <p className="text-sm text-gray-600">Área</p>
                    <p className="font-semibold">{property.area}m²</p>
                  </div>
                )}
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                  <p className="text-sm text-gray-600">Publicado</p>
                  <p className="font-semibold text-xs">{formatDate(property.createdAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {property.type === 'habitacion' ? 'Características' : 'Comodidades'}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map(amenityId => {
                      const amenity = getAmenityDetails(amenityId);
                      return amenity ? (
                        <div key={amenityId} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                          <div className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm text-gray-700">{amenity.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Nearby Universities */}
            {property.nearbyUniversities && property.nearbyUniversities.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-emerald-600" />
                  Universidades Cercanas
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  {property.nearbyUniversities.map(uniId => {
                    const university = universities.find(u => u.id === uniId);
                    return university ? (
                      <div key={uniId} className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <GraduationCap className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-gray-700 font-medium">{university.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-emerald-600 mb-1">
                  {formatPrice(property.price)}
                </div>
                <div className="text-gray-600">por mes</div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <p className="text-emerald-800 font-medium mb-2">¿Interesado en esta propiedad?</p>
                  <p className="text-emerald-700 text-sm">
                    Contáctanos para más información y programar una visita.
                  </p>
                </div>

                <a
                  href={`https://wa.me/573000000000?text=Hola, estoy interesado en la propiedad: ${property.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Contactar por WhatsApp</span>
                </a>

                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Guardar Favorito
                </button>
              </div>

              {/* Address Details */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Dirección Completa</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>País:</strong> {property.address.country}</p>
                  <p><strong>Departamento:</strong> {property.address.department}</p>
                  <p><strong>Ciudad:</strong> {property.address.city}</p>
                  <p><strong>Dirección:</strong> {property.address.street}</p>
                  <p><strong>Código Postal:</strong> {property.address.postalCode}</p>
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