import React from 'react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import LoadingSpinner from './LoadingSpinner';

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  error?: string;
  showRemoveButton?: boolean; // Show remove button on cards (for favorites page)
  onRemoveFavorite?: (propertyId: string) => void; // Custom handler for removing favorites
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, isLoading, error, showRemoveButton = false, onRemoveFavorite }) => {
  if (isLoading) {
    return <LoadingSpinner text="Cargando propiedades..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No se encontraron propiedades que coincidan con tu búsqueda.</p>
        <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros para ver más resultados.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {properties.length} propiedad{properties.length !== 1 ? 'es' : ''} encontrada{properties.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            index={index}
            showRemoveButton={showRemoveButton}
            onRemoveFavorite={onRemoveFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyGrid;