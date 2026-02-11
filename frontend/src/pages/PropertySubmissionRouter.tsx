import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PropertyTypeSelectorStep from '../components/PropertyTypeSelectorStep';
import RoomFlow from '../components/RoomFlow';
import ContainerFlow from '../components/ContainerFlow';
import EditPropertyPage from './EditPropertyPage';
import type { PropertyType } from '../types';

/**
 * PropertySubmissionRouter - Clean routing component
 * 
 * This component handles:
 * 1. Edit mode: if 'id' param exists, render EditPropertyPage
 * 2. Creation mode:
 *    - Type selection
 *    - Route to appropriate flow (RoomFlow or ContainerFlow)
 */
const PropertySubmissionRouter: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [selectedType, setSelectedType] = useState<PropertyType | null>(null);

    // Check for edit mode first
    if (id) {
        return <EditPropertyPage />;
    }

    // Creation Mode - Step 0: Show type selector
    if (!selectedType) {
        return <PropertyTypeSelectorStep onSelect={setSelectedType} />;
    }

    // Creation Mode - Step 1+: Route to appropriate flow
    if (selectedType === 'habitacion') {
        return <RoomFlow />;
    }

    // pension, apartamento, aparta-estudio
    return <ContainerFlow initialPropertyType={selectedType} />;
};

export default PropertySubmissionRouter;
