import React, { useEffect, useMemo } from 'react';
import PropertyCard from './PropertyCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProperties } from '../store/slices/propertiesSlice';

interface RelatedPropertiesProps {
    currentPropertyId: string;
    city: string;
    type: string;
}

const RelatedProperties: React.FC<RelatedPropertiesProps> = ({ currentPropertyId, city, type }) => {
    const dispatch = useAppDispatch();
    const { items: allProperties, loading } = useAppSelector((state) => state.properties);

    useEffect(() => {
        // Fetch properties with same city and type from backend
        if (city && type) {
            dispatch(fetchProperties({ city, type }));
        }
    }, [dispatch, city, type]);

    // Filter and limit related properties
    const relatedProperties = useMemo(() => {
        return allProperties
            .filter(p =>
                // Exclude current property
                String(p.id) !== String(currentPropertyId) &&
                // Only show approved and available properties
                p.status === 'approved' &&
                !p.isRented
            )
            .slice(0, 3); // Limit to 3 properties
    }, [allProperties, currentPropertyId]);

    // Don't render if loading or no related properties found
    if (loading || relatedProperties.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 border-t border-gray-200 pt-12">
            <div className="flex items-center space-x-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Propiedades Similares</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProperties;
