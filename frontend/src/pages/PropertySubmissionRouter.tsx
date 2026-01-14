import React, { useState } from 'react';
import PropertyTypeSelectorStep from '../components/PropertyTypeSelectorStep';
import RoomFlow from '../components/RoomFlow';
import ContainerFlow from '../components/ContainerFlow';
import type { PropertyType } from '../types';

/**
 * PropertySubmissionRouter - Clean routing component
 * 
 * This component handles the property type selection and routes to the appropriate flow:
 * - habitacion → RoomFlow
 * - pension/apartamento/aparta-estudio → ContainerFlow
 */
const PropertySubmissionRouter: React.FC = () => {
    const [selectedType, setSelectedType] = useState<PropertyType | null>(null);

    // Step 0: Show type selector
    if (!selectedType) {
        return <PropertyTypeSelectorStep onSelect={setSelectedType} />;
    }

    // Step 1+: Route to appropriate flow
    if (selectedType === 'habitacion') {
        return <RoomFlow />;
    }

    // pension, apartamento, aparta-estudio
    return <ContainerFlow initialPropertyType={selectedType} />;
};

export default PropertySubmissionRouter;
