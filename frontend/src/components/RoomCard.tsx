import React from 'react';
import { Bed, Square, Users, Eye } from 'lucide-react';

interface RoomCardProps {
    room: {
        id: number;
        title: string;
        description?: string;
        monthlyRent: number;
        area?: number;
        roomType: 'individual' | 'shared';
        bedsInRoom?: number;
        images?: Array<{ url: string } | string>;
        amenities?: Array<{ id: number; name: string }>;
        isRented: boolean;
    };
    onClick: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const firstImage = room.images && room.images.length > 0
        ? (typeof room.images[0] === 'string' ? room.images[0] : room.images[0].url)
        : null;

    const imageCount = room.images?.length || 0;

    return (
        <div
            onClick={onClick}
            className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer"
        >
            {/* Image Section */}
            <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {firstImage ? (
                    <>
                        <img
                            src={firstImage}
                            alt={room.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Image Count Overlay */}
                        {imageCount > 1 && (
                            <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 text-white text-sm font-medium rounded-full flex items-center space-x-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{imageCount} fotos</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Bed className="h-16 w-16 text-gray-300" />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${room.isRented
                        ? 'bg-gray-800 text-white'
                        : 'bg-emerald-500 text-white'
                        }`}>
                        {room.isRented ? 'Rentada' : 'Disponible'}
                    </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="px-6 py-3 bg-white rounded-full font-semibold text-gray-900 shadow-xl flex items-center space-x-2">
                            <Eye className="h-5 w-5" />
                            <span>Ver detalles</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5">
                {/* Title and Price */}
                <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1">{room.title}</h3>
                        <div className="ml-3">
                            <p className="text-2xl font-bold text-emerald-600">{formatPrice(room.monthlyRent)}</p>
                            <p className="text-xs text-gray-500 text-right">/ mes</p>
                        </div>
                    </div>
                    {room.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                    )}
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-emerald-50 p-2.5 rounded-lg text-center border border-emerald-100">
                        <Users className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                        <p className="text-xs font-medium text-gray-700">
                            {room.roomType === 'individual' ? 'Individual' : 'Compartida'}
                        </p>
                    </div>

                    {room.area && (
                        <div className="bg-blue-50 p-2.5 rounded-lg text-center border border-blue-100">
                            <Square className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                            <p className="text-xs font-medium text-gray-700">{room.area}m²</p>
                        </div>
                    )}

                    {room.roomType === 'shared' && room.bedsInRoom && (
                        <div className="bg-purple-50 p-2.5 rounded-lg text-center border border-purple-100">
                            <Bed className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                            <p className="text-xs font-medium text-gray-700">{room.bedsInRoom} camas</p>
                        </div>
                    )}
                </div>

                {/* Amenities Preview */}
                {room.amenities && room.amenities.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1.5">
                            {room.amenities.slice(0, 3).map((amenity) => (
                                <span key={amenity.id} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                                    {amenity.name}
                                </span>
                            ))}
                            {room.amenities.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">
                                    +{room.amenities.length - 3} más
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomCard;
