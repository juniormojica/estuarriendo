import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { api } from '../services/api';
import PropertyCard from './PropertyCard';
import { Sparkles } from 'lucide-react';

interface RelatedPropertiesProps {
    currentPropertyId: string;
    city: string;
    type: Property['type'];
}

const RelatedProperties: React.FC<RelatedPropertiesProps> = ({ currentPropertyId, city, type }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRelated = async () => {
            setIsLoading(true);
            try {
                // Fetch properties with same city and type
                const data = await api.getProperties({ city, type });

                // Filter out current property and limit to 3 items
                const related = data
                    .filter(p => p.id !== currentPropertyId)
                    .slice(0, 3);

                setProperties(related);
            } catch (error) {
                console.error('Error loading related properties:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRelated();
    }, [currentPropertyId, city, type]);

    if (isLoading || properties.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 border-t border-gray-200 pt-12">
            <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Propiedades Similares</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProperties;
