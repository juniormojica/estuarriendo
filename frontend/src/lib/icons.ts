import {
    Wifi, Car, Waves, Dumbbell, Shirt, Shield, ArrowUp, Home, Sofa, Snowflake, Flame, ChefHat,
    Bath, DoorOpen, Fan, Monitor, AppWindow, Bed, Tv, Star
} from 'lucide-react';

export const iconMap: Record<string, React.ElementType> = {
    wifi: Wifi,
    parking: Car,
    pool: Waves,
    gym: Dumbbell,
    laundry: Shirt,
    security: Shield,
    elevator: ArrowUp,
    balcony: Home,
    furnished: Sofa,
    ac: Snowflake,
    heating: Flame,
    kitchen: ChefHat,
    'private-bathroom': Bath,
    closet: DoorOpen,
    fan: Fan,
    desk: Monitor,
    window: AppWindow,
    bed: Bed,
    tv: Tv,
    // Fallback
    default: Star
};
