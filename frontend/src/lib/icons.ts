import {
    Wifi, Car, Waves, Dumbbell, Shirt, Shield, ArrowUp, Home, Sofa, Snowflake, Flame, ChefHat,
    Bath, DoorOpen, Fan, Monitor, AppWindow, Bed, Tv, Star, ShieldCheck, Users, Trophy,
    Baby, ChevronsUpDown, TreeDeciduous, Sun, Laptop, Trash2, Video, Bike, Gamepad2
} from 'lucide-react';

export const iconMap: Record<string, React.ElementType> = {
    // Existing mappings
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

    // New Common Areas Mappings (matching DB slugs/icon names)
    'shield-check': ShieldCheck,
    'users': Users,
    'flame': Flame,
    'car': Car,
    'dumbbell': Dumbbell,
    'waves': Waves,
    'baby': Baby,
    'chevrons-up-down': ChevronsUpDown,
    'trophy': Trophy,
    'tree-deciduous': TreeDeciduous,
    'sun': Sun,
    'laptop': Laptop,
    'shirt': Shirt,
    'trash-2': Trash2,
    'video': Video,
    'bike': Bike,
    'gamepad-2': Gamepad2,

    // Fallback
    default: Star
};
