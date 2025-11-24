import React from 'react';
import { User } from '../../types';
import { X, User as UserIcon, Mail, Phone, MessageCircle, Shield, CreditCard, Calendar, CheckCircle, XCircle, FileText } from 'lucide-react';

interface UserDetailsModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full relative animate-scaleIn max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 rounded-t-2xl">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.userType === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {user.userType === 'owner' ? 'Propietario' : 'Arrendatario'}
                                </span>
                                {user.plan === 'premium' && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center">
                                        <Shield className="w-3 h-3 mr-1" /> Premium
                                    </span>
                                )}
                                {user.isVerified && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center">
                                        <CheckCircle className="w-3 h-3 mr-1" /> Verificado
                                    </span>
                                )}
                            </div>
                        </div>
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
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Correo Electrónico</p>
                                <div className="flex items-center text-gray-900 font-medium">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    {user.email}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                                <div className="flex items-center text-gray-900 font-medium">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    {user.phone}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
                                <div className="flex items-center text-gray-900 font-medium">
                                    <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
                                    {user.whatsapp}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Documento de Identidad</p>
                                <div className="flex items-center text-gray-900 font-medium">
                                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                    {user.idType} {user.idNumber || 'No registrado'}
                                </div>
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
                                    {new Date(user.joinedAt).toLocaleDateString('es-CO', {
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
                                    <span className="capitalize">{user.plan === 'premium' ? 'Premium' : 'Gratuito'}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">ID de Usuario</p>
                                <div className="text-gray-900 font-mono text-sm truncate" title={user.id}>
                                    {user.id}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Rol</p>
                                <div className="text-gray-900 font-medium capitalize">
                                    {user.role === 'agency' ? 'Inmobiliaria' : 'Particular'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Estadísticas de Propiedades</h3>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{user.propertiesCount}</div>
                                <div className="text-xs text-blue-800">Total</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{user.approvedCount}</div>
                                <div className="text-xs text-green-800">Aprobadas</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{user.pendingCount}</div>
                                <div className="text-xs text-yellow-800">Pendientes</div>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{user.rejectedCount}</div>
                                <div className="text-xs text-red-800">Rechazadas</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-6 border-t border-gray-100 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
