import React, { useState, useEffect } from 'react';
import { User, IdType, PaymentMethod, PaymentRequest } from '../types';
import { authService } from '../services/authService';
import { api } from '../services/api';
import { User as UserIcon, Shield, CreditCard, CheckCircle, AlertCircle, Save, Loader, Clock } from 'lucide-react';
import PaymentUploadForm from '../components/PaymentUploadForm';

const UserProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>('profile');
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        // Handle tab parameter
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'billing' || tabParam === 'security' || tabParam === 'profile') {
            setActiveTab(tabParam);
        }

        const loadUserAndPayment = async () => {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                setFormData(currentUser);

                if (currentUser.paymentRequestId) {
                    const requests = await api.getPaymentRequests();
                    const req = requests.find(r => r.id === currentUser.paymentRequestId);
                    if (req) setPaymentRequest(req);
                }
            } else {
                window.location.href = '/login';
            }
            setLoading(false);
        };
        loadUserAndPayment();
    }, []);

    const handleInputChange = (field: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            const result = await authService.updateUser(user.id, formData);
            if (result.success) {
                setUser(result.user as User);
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
            } else {
                setMessage({ type: 'error', text: result.message || 'Error al actualizar perfil.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error inesperado.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePaymentSuccess = async () => {
        // Reload user to get the new paymentRequestId
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            if (currentUser.paymentRequestId) {
                const requests = await api.getPaymentRequests();
                const req = requests.find(r => r.id === currentUser.paymentRequestId);
                if (req) setPaymentRequest(req);
            }
        }
        setMessage({ type: 'success', text: 'Comprobante enviado correctamente. Tu pago está en revisión.' });
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <UserIcon className="w-5 h-5" />
                                <span>Información Básica</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Shield className="w-5 h-5" />
                                <span>Seguridad</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('billing')}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'billing' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>Plan y Facturación</span>
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center justify-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-lg font-medium text-gray-900">Información Personal</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={formData.whatsapp || ''}
                                            onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Documento de Identidad</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                                            <select
                                                value={formData.idType || ''}
                                                onChange={(e) => handleInputChange('idType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="CC">Cédula de Ciudadanía</option>
                                                <option value="CE">Cédula de Extranjería</option>
                                                <option value="NIT">NIT</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                                            <input
                                                type="text"
                                                value={formData.idNumber || ''}
                                                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Guardar Cambios
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-lg font-medium text-gray-900">Cambiar Contraseña</h2>
                                <div className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                                        >
                                            Actualizar Contraseña
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">Plan Actual</h3>
                                            <p className="text-emerald-100">
                                                {user.plan === 'premium' ? 'Usuario Premium' : 'Usuario Gratuito'}
                                            </p>
                                        </div>
                                        {user.plan === 'premium' && (
                                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                                                Activo
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {user.plan !== 'premium' && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Mejorar a Premium</h3>

                                        {paymentRequest && paymentRequest.status === 'pending' ? (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                                <Clock className="h-12 w-12 text-yellow-500 mb-3" />
                                                <h4 className="text-lg font-bold text-yellow-800 mb-2">Pago en Revisión</h4>
                                                <p className="text-yellow-700 mb-4 max-w-md">
                                                    Hemos recibido tu comprobante. El plan se activará en un máximo de 2 horas tras la verificación manual.
                                                </p>
                                                <div className="text-sm text-yellow-600 bg-yellow-100 inline-block px-3 py-1 rounded-full">
                                                    Referencia: <span className="font-mono font-bold">{paymentRequest.referenceCode}</span>
                                                </div>
                                            </div>
                                        ) : paymentRequest && paymentRequest.status === 'rejected' ? (
                                            <div className="space-y-6">
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                                        <h4 className="text-lg font-bold text-red-800">Pago Rechazado</h4>
                                                    </div>
                                                    <p className="text-red-700">
                                                        Tu último pago fue rechazado. Por favor intenta nuevamente o contacta a soporte.
                                                    </p>
                                                </div>
                                                <PaymentUploadForm user={user} onSuccess={handlePaymentSuccess} />
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                                <ul className="space-y-3 mb-6">
                                                    <li className="flex items-center text-gray-600">
                                                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                                                        Publicaciones destacadas
                                                    </li>
                                                    <li className="flex items-center text-gray-600">
                                                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                                                        Soporte prioritario
                                                    </li>
                                                    <li className="flex items-center text-gray-600">
                                                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                                                        Estadísticas avanzadas
                                                    </li>
                                                </ul>

                                                <div className="border-t border-gray-200 pt-6">
                                                    <PaymentUploadForm user={user} onSuccess={handlePaymentSuccess} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
