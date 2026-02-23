import React from 'react';
import {
    Wind,
    Snowflake,
    Wifi,
    Tv,
    Bed,
    Bath,
    Briefcase,
    Waves,
    Dumbbell,
    Lock,
    Sun,
    Sofa,
    ChevronsUp,
    Utensils,
    Droplet,
    Zap,
    Home
} from 'lucide-react';

export const getAmenityIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('abanico') || lowerName.includes('ventilador')) return <Wind className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('aire')) return <Snowflake className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('wifi') || lowerName.includes('internet')) return <Wifi className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('tv') || lowerName.includes('televis')) return <Tv className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('cama')) return <Bed className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('baño')) return <Bath className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('espacio') || lowerName.includes('trabajo') || lowerName.includes('escritorio')) return <Briefcase className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('piscina')) return <Waves className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('gimnasio')) return <Dumbbell className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('seguridad') || lowerName.includes('vigilancia')) return <Lock className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('balcón') || lowerName.includes('terraza')) return <Sun className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('amoblado') || lowerName.includes('muebles')) return <Sofa className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('ascensor')) return <ChevronsUp className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('cocina')) return <Utensils className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('lavadora') || lowerName.includes('lavandería')) return <Droplet className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('luz') || lowerName.includes('energía')) return <Zap className="w-8 h-8 mb-2 text-gray-700" />;
    if (lowerName.includes('agua')) return <Droplet className="w-8 h-8 mb-2 text-gray-700" />;

    return <Home className="w-8 h-8 mb-2 text-gray-700" />;
};
