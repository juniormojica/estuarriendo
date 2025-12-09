import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, PaymentRequest } from '../types';
import { useAppSelector } from '../store/hooks';
import { api } from '../services/api';
import { User as UserIcon, Shield, CreditCard, CheckCircle, AlertCircle, Save, Loader, Clock, ShieldCheck, XCircle } from 'lucide-react';
import PaymentUploadForm from '../components/PaymentUploadForm';
import PlanComparisonCards from '../components/PlanComparisonCards';
import VerificationForm from '../components/VerificationForm';

const UserProfile: React.FC = () => {
    const { user: authUser, loading: authLoading } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'verification'>('profile');
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
    const [initialPlan, setInitialPlan] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<User>>({});

    const location = useLocation();

    useEffect(() => {
        // Handle tab parameter
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');
        const planParam = params.get('plan');

        if (tabParam === 'billing' || tabParam === 'security' || tabParam === 'profile' || tabParam === 'verification') {
            setActiveTab(tabParam);
        }

        if (planParam) {
            setInitialPlan(planParam);
        }

        const loadUserAndPayment = async () => {
            // Wait for auth to load
            if (authLoading) {
                return;
            }

            // Use user from AuthContext
            if (authUser) {
                setUser(authUser);
                setFormData(authUser);

                if (authUser.paymentRequestId) {
                    const requests = await api.getPaymentRequests();
                    const req = requests.find(r => r.id === authUser.paymentRequestId);
                    if (req) setPaymentRequest(req);
                }
            } else {
                // No user authenticated, redirect to login
                navigate('/login');
            }
            setLoading(false);
        };
        loadUserAndPayment();
    }, [location.search, authUser, authLoading, navigate]);

    const handleInputChange = (field: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            // TODO: Implement update user endpoint in backend
            // For now, just update local state
            setUser({ ...user, ...formData });
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error inesperado.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePaymentSuccess = async () => {
        // Reload user from AuthContext
        if (authUser) {
            setUser(authUser);
            if (authUser.paymentRequestId) {
                const requests = await api.getPaymentRequests();
                const req = requests.find(r => r.id === authUser.paymentRequestId);
                if (req) setPaymentRequest(req);
            }
        }
        setMessage({ type: 'success', text: 'Comprobante enviado correctamente. Tu pago está en revisión.' });
        window.scrollTo(0, 0);
    };


    const handleVerificationSuccess = () => {
        // Reload user from AuthContext
        if (authUser) {
            setUser(authUser);
        }
        setMessage({ type: 'success', text: 'Documentos enviados correctamente. Tu verificación será revisada pronto.' });
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar - Sticky */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-4 md:sticky md:top-8">
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
                                <button
                                    onClick={() => setActiveTab('verification')}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'verification' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    <span>Verificación</span>
                                    {user.verificationStatus === 'verified' && (
                                        <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    )}
                                    {user.verificationStatus === 'pending' && (
                                        <span className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    )}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
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
                                    {/* Current Plan Header */}
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1">Plan Actual</h3>
                                                <p className="text-emerald-100 text-2xl font-bold">
                                                    {user.plan === 'premium' ? 'Usuario Premium' : 'Usuario Gratuito'}
                                                </p>
                                            </div>
                                            {user.plan === 'premium' && (
                                                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                                                    ✓ Activo
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {user.plan !== 'premium' && (
                                        <div className="space-y-8">
                                            {/* Payment Status Messages */}
                                            {paymentRequest && paymentRequest.status === 'pending' && (
                                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                                    <Clock className="h-16 w-16 text-yellow-500 mb-4" />
                                                    <h4 className="text-xl font-bold text-yellow-800 mb-2">Pago en Revisión</h4>
                                                    <p className="text-yellow-700 mb-4 max-w-md">
                                                        Hemos recibido tu comprobante. El plan se activará en un máximo de 2 horas tras la verificación manual.
                                                    </p>
                                                    <div className="text-sm text-yellow-600 bg-yellow-100 inline-block px-4 py-2 rounded-full font-mono font-bold">
                                                        Referencia: {paymentRequest.referenceCode}
                                                    </div>
                                                </div>
                                            )}

                                            {paymentRequest && paymentRequest.status === 'rejected' && (
                                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                                        <h4 className="text-xl font-bold text-red-800">Pago Rechazado</h4>
                                                    </div>
                                                    <p className="text-red-700">
                                                        Tu último pago fue rechazado. Por favor intenta nuevamente o contacta a soporte.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Plan Comparison Cards */}
                                            {(!paymentRequest || paymentRequest.status === 'rejected') && (
                                                <>
                                                    <PlanComparisonCards
                                                        onSelectPlan={(planId) => setInitialPlan(planId)}
                                                        selectedPlan={initialPlan as 'weekly' | 'monthly' | 'quarterly' || 'monthly'}
                                                        currentPlan={user.plan}
                                                    />

                                                    {/* Payment Upload Form - Only shown after plan selection */}
                                                    {initialPlan && (
                                                        <div className="animate-fadeIn">
                                                            <PaymentUploadForm
                                                                user={user}
                                                                onSuccess={handlePaymentSuccess}
                                                                selectedPlan={initialPlan as 'weekly' | 'monthly' | 'quarterly'}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'verification' && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-medium text-gray-900">Verificación de Identidad</h2>
                                        {user.verificationStatus === 'verified' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Verificado
                                            </span>
                                        )}
                                        {user.verificationStatus === 'pending' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                <Clock className="w-4 h-4 mr-1" />
                                                En Revisión
                                            </span>
                                        )}
                                        {user.verificationStatus === 'rejected' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Rechazado
                                            </span>
                                        )}
                                        {(!user.verificationStatus || user.verificationStatus === 'not_submitted') && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                No Verificado
                                            </span>
                                        )}
                                    </div>

                                    {/* Benefits of Verification */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center">
                                            <ShieldCheck className="w-5 h-5 mr-2" />
                                            Beneficios de la Verificación
                                        </h3>
                                        <ul className="space-y-2 text-sm text-emerald-800">
                                            <li className="flex items-start">
                                                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>Aumenta la confianza de los estudiantes en tus propiedades</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>Badge de "Propietario Verificado" en todas tus publicaciones</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>Mayor visibilidad en los resultados de búsqueda</span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                                <span>Ayuda a prevenir fraudes y estafas en la plataforma</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Verification Status Content */}
                                    {user.verificationStatus === 'verified' && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                                                <h3 className="text-lg font-semibold text-emerald-900">¡Identidad Verificada!</h3>
                                            </div>
                                            <p className="text-sm text-emerald-800">
                                                Tu identidad ha sido verificada exitosamente. Ahora tus propiedades mostrarán el badge de "Propietario Verificado".
                                            </p>
                                            {user.verificationProcessedAt && (
                                                <p className="text-xs text-emerald-700 mt-2">
                                                    Verificado el {new Date(user.verificationProcessedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {user.verificationStatus === 'pending' && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <Clock className="w-6 h-6 text-yellow-600" />
                                                <h3 className="text-lg font-semibold text-yellow-900">Verificación en Proceso</h3>
                                            </div>
                                            <p className="text-sm text-yellow-800">
                                                Hemos recibido tus documentos y están siendo revisados. El proceso de verificación puede tomar hasta 24 horas.
                                            </p>
                                            {user.verificationSubmittedAt && (
                                                <p className="text-xs text-yellow-700 mt-2">
                                                    Enviado el {new Date(user.verificationSubmittedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {user.verificationStatus === 'rejected' && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <XCircle className="w-6 h-6 text-red-600" />
                                                <h3 className="text-lg font-semibold text-red-900">Verificación Rechazada</h3>
                                            </div>
                                            <p className="text-sm text-red-800 mb-2">
                                                Tu solicitud de verificación fue rechazada. Por favor revisa la razón y vuelve a intentarlo.
                                            </p>
                                            {user.verificationRejectionReason && (
                                                <div className="bg-red-100 rounded-lg p-3 mt-3">
                                                    <p className="text-xs font-semibold text-red-900 mb-1">Razón del rechazo:</p>
                                                    <p className="text-sm text-red-800">{user.verificationRejectionReason}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Show form for not_submitted or rejected status */}
                                    {(!user.verificationStatus || user.verificationStatus === 'not_submitted' || user.verificationStatus === 'rejected') && (
                                        <div>
                                            <h3 className="text-md font-semibold text-gray-900 mb-4">Documentos Requeridos</h3>
                                            <VerificationForm userId={user.id} userRole={user.userType === 'tenant' ? 'student' : 'owner'} onSuccess={handleVerificationSuccess} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
