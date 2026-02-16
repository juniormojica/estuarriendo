import React, { useState, useEffect } from 'react';
import { User, PropertyType } from '../../types';
import { api } from '../../services/api';
import { Search, User as UserIcon, Shield, ArrowLeft } from 'lucide-react';
import ContainerFlow from '../ContainerFlow';
import RoomFlow from '../RoomFlow';
import PropertyTypeSelectorStep from '../PropertyTypeSelectorStep';
import LoadingSpinner from '../LoadingSpinner';

interface AdminPropertyCreatorProps {
    onComplete: () => void;
}

const AdminPropertyCreator: React.FC<AdminPropertyCreatorProps> = ({ onComplete }) => {
    // Phase 1: Owner Selection
    // Phase 2: Property Type Selection
    // Phase 3: Property Creation (ContainerFlow or RoomFlow)
    const [phase, setPhase] = useState<'select-owner' | 'select-type' | 'create-property'>('select-owner');
    const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);

    // Owner selection state
    const [owners, setOwners] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOwners, setFilteredOwners] = useState<User[]>([]);

    useEffect(() => {
        loadOwners();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredOwners(owners);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = owners.filter(owner =>
            owner.name.toLowerCase().includes(lowerQuery) ||
            owner.email.toLowerCase().includes(lowerQuery) ||
            (owner.phone && owner.phone.includes(lowerQuery))
        );
        setFilteredOwners(filtered);
    }, [searchQuery, owners]);

    const loadOwners = async () => {
        try {
            setLoading(true);
            const allUsers = await api.getUsers();
            const ownerUsers = allUsers.filter(u => u.userType === 'owner');
            setOwners(ownerUsers);
            setFilteredOwners(ownerUsers);
        } catch (error) {
            console.error('Error loading owners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOwnerSelect = (owner: User) => {
        setSelectedOwner(owner);
        setPhase('select-type');
    };

    const handleTypeSelect = (type: PropertyType) => {
        setSelectedPropertyType(type);
        setPhase('create-property');
    };

    const handleBackToSelect = () => {
        setPhase('select-owner');
        setSelectedOwner(null);
        setSelectedPropertyType(null);
    };

    const handleBackToTypeSelect = () => {
        setPhase('select-type');
        setSelectedPropertyType(null);
    };

    // Admin Header Banner (reused across phases)
    const AdminBanner = ({ onBack, backLabel }: { onBack: () => void; backLabel: string }) => (
        <div className="bg-emerald-900 text-white p-4 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-emerald-800 rounded-full transition-colors"
                    title={backLabel}
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">Modo Administrador</p>
                    <div className="flex items-center space-x-2">
                        <h2 className="font-bold text-lg">Creando propiedad para: {selectedOwner?.name}</h2>
                        {selectedOwner?.verificationStatus === 'verified' && (
                            <Shield className="h-4 w-4 text-emerald-400" />
                        )}
                    </div>
                </div>
            </div>
            <div className="text-right hidden sm:block">
                <p className="text-sm opacity-90">{selectedOwner?.email}</p>
                <p className="text-xs opacity-75">{selectedOwner?.phone}</p>
            </div>
        </div>
    );

    // Phase 1: Select Owner
    if (phase === 'select-owner') {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Crear Propiedad para Propietario</h2>
                    <p className="text-gray-600 mt-1">
                        Selecciona el usuario al cual se le asignará la nueva propiedad.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o teléfono..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Owners Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : filteredOwners.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No se encontraron propietarios</h3>
                        <p className="text-gray-500">Intenta con otros términos de búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredOwners.map((owner) => (
                            <div
                                key={owner.id}
                                onClick={() => handleOwnerSelect(owner)}
                                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                            {owner.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                {owner.name}
                                            </h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${owner.plan === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {owner.plan === 'premium' ? 'Premium' : 'Gratis'}
                                            </span>
                                        </div>
                                    </div>
                                    {owner.verificationStatus === 'verified' && (
                                        <Shield className="h-5 w-5 text-emerald-500" />
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-400">✉️</span>
                                        <span className="truncate">{owner.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-400">📱</span>
                                        <span>{owner.phone || 'Sin teléfono'}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                    <span>Registrado: {new Date(owner.joinedAt).toLocaleDateString()}</span>
                                    <span className="text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Seleccionar →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Phase 2: Select Property Type
    if (phase === 'select-type') {
        return (
            <div className="space-y-6">
                <AdminBanner onBack={handleBackToSelect} backLabel="Cambiar propietario" />

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-1">
                        <PropertyTypeSelectorStep
                            onSelect={handleTypeSelect}
                            selectedType={selectedPropertyType as any}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Phase 3: Create Property
    return (
        <div className="space-y-6">
            <AdminBanner onBack={handleBackToTypeSelect} backLabel="Cambiar tipo de propiedad" />

            {/* Embedded Property Flow */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-1">
                    {selectedPropertyType === 'habitacion' ? (
                        <RoomFlow
                            adminMode={true}
                            targetOwnerId={selectedOwner?.id}
                            onAdminComplete={onComplete}
                        />
                    ) : (
                        <ContainerFlow
                            initialPropertyType={selectedPropertyType || undefined}
                            adminMode={true}
                            targetOwnerId={selectedOwner?.id}
                            onAdminComplete={onComplete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyCreator;
