import React, { useState, useEffect } from 'react';
import { User, IdType } from '../../types';
import { X, User as UserIcon, Mail, Phone, MessageCircle, Shield, CreditCard, Calendar, CheckCircle, XCircle, FileText, Edit2, Save, ArrowUpCircle, XOctagon } from 'lucide-react';
import { api } from '../../services/api';

interface UserDetailsModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedUser, setEditedUser] = useState<User>(user);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSaving) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isSaving, onClose]);

    if (!isOpen) return null;

    const handleEdit = () => {
        setEditedUser(user);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const success = await api.updateUser(user.id, {
                name: editedUser.name,
                email: editedUser.email,
                phone: editedUser.phone,
                whatsapp: editedUser.whatsapp,
                idType: editedUser.idType,
                idNumber: editedUser.idNumber
            });

            if (success) {
                setIsEditing(false);
                if (onUpdate) onUpdate();
            } else {
                alert('Error al actualizar el usuario');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error al actualizar el usuario');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgradeToPremium = async () => {
        if (window.confirm('¿Estás seguro de actualizar este usuario a Premium?')) {
            setIsSaving(true);
            try {
                const success = await api.updateUser(user.id, {
                    plan: 'premium',
                    premiumSince: new Date().toISOString()
                });

                if (success) {
                    if (onUpdate) onUpdate();
                } else {
                    alert('Error al actualizar el plan');
                }
            } catch (error) {
                console.error('Error upgrading plan:', error);
                alert('Error al actualizar el plan');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleCancelPremium = async () => {
        if (window.confirm('¿Estás seguro de cancelar el plan Premium de este usuario?')) {
            setIsSaving(true);
            try {
                const success = await api.updateUser(user.id, {
                    plan: 'free',
                    premiumSince: undefined
                });

                if (success) {
                    if (onUpdate) onUpdate();
                } else {
                    alert('Error al cancelar el plan');
                }
            } catch (error) {
                console.error('Error canceling plan:', error);
                alert('Error al cancelar el plan');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const displayUser = isEditing ? editedUser : user;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full relative animate-scaleIn max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    disabled={isSaving}
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                                {displayUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{displayUser.name}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${displayUser.userType === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {displayUser.userType === 'owner' ? 'Propietario' : 'Arrendatario'}
                                    </span>
                                    {displayUser.plan === 'premium' && (
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center">
                                            <Shield className="w-3 h-3 mr-1" /> Premium
                                        </span>
                                    )}
                                    {displayUser.isVerified && (
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Verificado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={handleEdit}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center text-sm"
                                disabled={isSaving}
                            >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Editar
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <UserIcon className="w-5 h-5 mr-2 text-gray-500" />
                            Información Personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Nombre Completo</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedUser.name}
                                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 font-medium"
                                    />
                                ) : (
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        {displayUser.name}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Correo Electrónico</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editedUser.email}
                                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 font-medium"
                                    />
                                ) : (
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {displayUser.email}
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editedUser.phone}
                                        onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 font-medium"
                                    />
                                ) : (
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {displayUser.phone}
                                    </div>
                                )}
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editedUser.whatsapp}
                                        onChange={(e) => setEditedUser({ ...editedUser, whatsapp: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 font-medium"
                                    />
                                ) : (
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
                                        {displayUser.whatsapp}
                                    </div>
                                )}
                            </div>

                            {/* ID Type */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Tipo de Documento</p>
                                {isEditing ? (
                                    <select
                                        value={editedUser.idType || 'CC'}
                                        onChange={(e) => setEditedUser({ ...editedUser, idType: e.target.value as IdType })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 font-medium"
                                    >
                                        <option value="CC">CC</option>
                                        <option value="NIT">NIT</option>
                                        <option value="CE">CE</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                        {displayUser.idType || 'No especificado'}
                                    </div>
                                )}
                            </div>

                            {/* ID Number */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Número de Documento</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedUser.idNumber || ''}
                                        onChange={(e) => setEditedUser({ ...editedUser, idNumber: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 font-medium"
                                    />
                                ) : (
                                    <div className="text-gray-900 font-medium">
                                        {displayUser.idNumber || 'No registrado'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-gray-500" />
                            Detalles de la Cuenta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Fecha de Registro</p>
                                <div className="flex items-center text-gray-900 font-medium">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    {new Date(displayUser.joinedAt).toLocaleDateString('es-CO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Plan Actual</p>
                                <div className="flex items-center text-gray-900 font-medium">
                                    <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                                    <span className="capitalize">{displayUser.plan === 'premium' ? 'Premium' : 'Gratuito'}</span>
                                </div>
                            </div>
                            {displayUser.plan === 'premium' && displayUser.premiumSince && (
                                <div className="bg-yellow-50 p-3 rounded-lg md:col-span-2 border border-yellow-200">
                                    <p className="text-xs text-yellow-700 mb-1">Miembro Premium desde</p>
                                    <div className="flex items-center text-yellow-900 font-medium">
                                        <Shield className="w-4 h-4 mr-2 text-yellow-600" />
                                        {new Date(displayUser.premiumSince).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">ID de Usuario</p>
                                <div className="text-gray-900 font-mono text-sm truncate" title={displayUser.id}>
                                    {displayUser.id}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Rol</p>
                                <div className="text-gray-900 font-medium capitalize">
                                    {displayUser.role === 'agency' ? 'Inmobiliaria' : 'Particular'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Estadísticas de Propiedades</h3>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{displayUser.propertiesCount}</div>
                                <div className="text-xs text-blue-800">Total</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{displayUser.approvedCount}</div>
                                <div className="text-xs text-green-800">Aprobadas</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{displayUser.pendingCount}</div>
                                <div className="text-xs text-yellow-800">Pendientes</div>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{displayUser.rejectedCount}</div>
                                <div className="text-xs text-red-800">Rechazadas</div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Management */}
                    {!isEditing && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Gestión de Plan</h3>
                            <div className="flex gap-3">
                                {displayUser.plan !== 'premium' ? (
                                    <button
                                        onClick={handleUpgradeToPremium}
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                                    >
                                        <ArrowUpCircle className="w-5 h-5 mr-2" />
                                        {isSaving ? 'Actualizando...' : 'Actualizar a Premium'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCancelPremium}
                                        disabled={isSaving}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                                    >
                                        <XOctagon className="w-5 h-5 mr-2" />
                                        {isSaving ? 'Cancelando...' : 'Cancelar Plan Premium'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors flex items-center disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors disabled:opacity-50"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
