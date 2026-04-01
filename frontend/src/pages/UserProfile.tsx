import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, PaymentRequest, CreditBalance, CreditTransaction } from '../types';
import { useAppSelector } from '../store/hooks';
import { api } from '../services/api';
import { User as UserIcon, Shield, CreditCard, CheckCircle, AlertCircle, Save, Loader, Clock, ShieldCheck, XCircle } from 'lucide-react';
import PaymentFlowSection from '../components/PaymentFlowSection';
import PaymentUploadForm from '../components/PaymentUploadForm';
import VerificationForm from '../components/VerificationForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileBasicInfoSchema, ProfileBasicInfoFormValues } from '../lib/validations';
import { useScrollToTop } from '../hooks/useScrollToTop';
import CityAutocomplete from '../components/CityAutocomplete';
import InstitutionAutocomplete from '../components/InstitutionAutocomplete';
const UserProfile: React.FC = () => {
    const { user: authUser, loading: authLoading } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing' | 'verification'>('profile');
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

    useScrollToTop([activeTab], 'smooth');

    const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
    const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
    const [loadingCredits, setLoadingCredits] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer' | null>(null);
    const [isGeneratingMPLink, setIsGeneratingMPLink] = useState(false);
    const [mpError, setMpError] = useState('');

    // Form states for non-basic info
    const [formData, setFormData] = useState<Partial<User>>({});

    const location = useLocation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ProfileBasicInfoFormValues>({
        resolver: zodResolver(profileBasicInfoSchema) as any,
        defaultValues: {
            name: '',
            phone: '',
            whatsapp: '',
            idType: undefined,
            idNumber: ''
        } as any
    });

    useEffect(() => {
        // --- Redirect Interceptor ---
        const params = new URLSearchParams(location.search);
        const isPaymentSuccessReturn = params.has('payment_id') || params.has('preference_id') || params.has('preapproval_id') || params.get('status') === 'approved';
        const pendingRedirect = localStorage.getItem('estuarriendo_pending_redirect');

        if (isPaymentSuccessReturn && pendingRedirect) {
            localStorage.removeItem('estuarriendo_pending_redirect');
            setMessage({ type: 'success', text: '¡Transacción exitosa! Redirigiéndote a la propiedad...' });

            // Wait 3 seconds to show success message then redirect
            const timeout = setTimeout(() => {
                navigate(pendingRedirect);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [location.search, navigate]);

    useEffect(() => {
        // Handle tab parameter
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab');

        if (tabParam === 'billing' || tabParam === 'security' || tabParam === 'profile' || tabParam === 'verification') {
            setActiveTab(tabParam);
        }

        const loadUserAndPayment = async () => {
            // Wait for auth to load
            if (authLoading) {
                return;
            }

            // Use user from AuthContext
            if (authUser) {
                // Fetch fresh user data from backend to get identification details
                try {
                    const freshUser = await api.getCurrentUser();
                    setUser(freshUser);
                    setFormData(freshUser);
                    reset({
                        name: freshUser.name || '',
                        phone: freshUser.phone || '',
                        whatsapp: freshUser.whatsapp || '',
                        idType: (freshUser.idType as any) || undefined,
                        idNumber: freshUser.idNumber || ''
                    });
                } catch (error) {
                    console.error('Error fetching fresh user data:', error);
                    // Fallback to authUser on error
                    setUser(authUser);
                    setFormData(authUser);
                    reset({
                        name: authUser.name || '',
                        phone: authUser.phone || '',
                        whatsapp: authUser.whatsapp || '',
                        idType: (authUser.idType as any) || undefined,
                        idNumber: authUser.idNumber || ''
                    });
                }

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
    }, [location.search, authUser, authLoading, navigate, reset]);

    // Fetch credits for tenant
    useEffect(() => {
        if (activeTab === 'billing' && user?.userType === 'tenant') {
            const fetchCreditsAndPayments = async () => {
                setLoadingCredits(true);
                try {
                    // user is already checked to be present in the outer if statement
                    const balance = await api.getCreditBalance(String(user.id));
                    setCreditBalance(balance);

                    const transactions = await api.getCreditTransactions(String(user.id));
                    setCreditTransactions(transactions);

                    // Check for pending payment requests for this tenant
                    const allReqs = await api.getPaymentRequests();
                    const userPendingReq = allReqs.find(req => req.userId === user.id && req.status === 'pending');
                    if (userPendingReq) {
                        setPaymentRequest(userPendingReq);
                    }
                } catch (error) {
                    console.error('Error al cargar datos de facturación:', error);
                } finally {
                    setLoadingCredits(false);
                }
            };
            fetchCreditsAndPayments();
        }
    }, [activeTab, user?.userType, user?.id]);

    const handleProfileChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                [field]: value
            }
        }));
    };

    const onSubmitProfile = async (data: ProfileBasicInfoFormValues) => {
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            // Call backend API to update user
            // We include the profile data in the update
            const updatedUser = await api.updateUser(user.id, {
                name: data.name,
                phone: data.phone,
                whatsapp: data.whatsapp,
                idType: data.idType === '' ? undefined : data.idType,
                idNumber: data.idNumber === '' ? undefined : data.idNumber,
                // Include profile data
                profile: formData.profile
            });

            // Update local state with the response from backend
            setUser(updatedUser);
            setFormData(updatedUser);
            reset({
                name: updatedUser.name || '',
                phone: updatedUser.phone || '',
                whatsapp: updatedUser.whatsapp || '',
                idType: (updatedUser.idType as any) || undefined,
                idNumber: updatedUser.idNumber || ''
            });

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Error al actualizar el perfil';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setSaving(false);
        }
    };

    const handleMPPayment = async (planType: string) => {
        if (!user || user.userType !== 'tenant') return;
        setIsGeneratingMPLink(true);
        setMpError('');
        try {
            const link = await api.createMPCheckoutLink(user.id.toString(), planType, user.email);
            if (link) {
                window.location.href = link;
            } else {
                setMpError('Error al generar el link de pago seguro. Por favor intenta de nuevo.');
            }
        } catch (error) {
            setMpError('Ocurrió un error de conexión al generar el pago.');
        } finally {
            setIsGeneratingMPLink(false);
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


    const handleVerificationSuccess = async () => {
        // Reload user from backend to get updated status
        if (authUser) {
            try {
                const freshUser = await api.getCurrentUser();
                setUser(freshUser);
            } catch (error) {
                console.error('Error refreshing user after verification:', error);
            }
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
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header - Responsive */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Mi Perfil</h1>

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Tabs Navigation - Horizontal on Mobile, Vertical Sidebar on Desktop */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        {/* Mobile: Horizontal Scrollable Tabs */}
                        <div className="lg:hidden bg-white rounded-lg shadow-sm p-2 mb-4 overflow-x-auto">
                            <nav className="flex space-x-2 min-w-max">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${activeTab === 'profile' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                                        }`}
                                >
                                    <UserIcon className="w-4 h-4" />
                                    <span>Información</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${activeTab === 'security' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                                        }`}
                                >
                                    <Shield className="w-4 h-4" />
                                    <span>Seguridad</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('billing')}
                                    className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${activeTab === 'billing' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                                        }`}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    <span>Plan</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('verification')}
                                    className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${activeTab === 'verification' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                                        }`}
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Verificación</span>
                                    {user.verificationStatus === 'verified' && (
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    )}
                                    {user.verificationStatus === 'pending' && (
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    )}
                                </button>
                            </nav>
                        </div>

                        {/* Desktop: Vertical Sidebar */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-sm p-4 lg:sticky lg:top-8">
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

                    {/* Content - Responsive Padding */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
                            {message && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center justify-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4 sm:space-y-6 animate-fadeIn">
                                    <h2 className="text-base sm:text-lg font-medium text-gray-900">Información Personal</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                Nombre Completo <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                {...register('name')}
                                                className={`w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                Correo Electrónico
                                                <span className="ml-2 text-xs text-blue-600 font-normal bg-blue-50 px-2 py-0.5 rounded">No editable</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                Teléfono <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                {...register('phone')}
                                                className={`w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                                WhatsApp <span className="text-gray-400 text-xs font-normal">(Opcional)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                {...register('whatsapp')}
                                                className={`w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.whatsapp ? 'border-red-500' : ''}`}
                                            />
                                            {errors.whatsapp && <p className="mt-1 text-sm text-red-600">{errors.whatsapp.message}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-4 sm:pt-6 border-t border-gray-100">
                                        <div className="mb-3 sm:mb-4">
                                            <h2 className="text-base sm:text-lg font-medium text-gray-900 inline-flex items-center">
                                                Documento de Identidad <span className="ml-2 text-gray-400 text-sm font-normal">(Opcional)</span>
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Completa este apartado si deseas ser verificado. Si llenas uno, debes llenar ambos campos.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Tipo de Documento</label>
                                                <select
                                                    {...register('idType')}
                                                    className={`w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.idType ? 'border-red-500' : ''}`}
                                                >
                                                    <option value="">Seleccionar</option>
                                                    <option value="CC">Cédula de Ciudadanía</option>
                                                    <option value="CE">Cédula de Extranjería</option>
                                                    <option value="NIT">NIT</option>
                                                </select>
                                                {errors.idType && <p className="mt-1 text-sm text-red-600">{errors.idType.message}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Número de Documento</label>
                                                <input
                                                    type="text"
                                                    {...register('idNumber')}
                                                    className={`w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.idNumber ? 'border-red-500' : ''}`}
                                                />
                                                {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 sm:pt-6 border-t border-gray-100">
                                        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                                            Información Personal Adicional <span className="text-gray-400 text-sm font-normal ml-2">(Opcional)</span>
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Fecha de Nacimiento</label>
                                                <input
                                                    type="date"
                                                    value={formData.profile?.birthDate ? new Date(formData.profile.birthDate).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleProfileChange('birthDate', e.target.value)}
                                                    className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Género</label>
                                                <select
                                                    value={formData.profile?.gender || ''}
                                                    onChange={(e) => handleProfileChange('gender', e.target.value)}
                                                    className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                >
                                                    <option value="">Seleccionar</option>
                                                    <option value="male">Masculino</option>
                                                    <option value="female">Femenino</option>
                                                    <option value="other">Otro</option>
                                                    <option value="prefer_not_to_say">Prefiero no decir</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Ciudad de Origen</label>
                                                <CityAutocomplete
                                                    hideLabel={true}
                                                    value={formData.profile?.originCity || null}
                                                    onChange={(city) => {
                                                        const profile = { ...formData.profile };
                                                        profile.originCityId = city?.id;
                                                        profile.originCity = city || undefined;
                                                        setFormData(prev => ({ ...prev, profile }));
                                                    }}
                                                    placeholder="Buscar ciudad de origen..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">¿Cómo nos conociste?</label>
                                                <select
                                                    value={formData.profile?.referralSource || ''}
                                                    onChange={(e) => handleProfileChange('referralSource', e.target.value)}
                                                    className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                >
                                                    <option value="">Seleccionar</option>
                                                    <option value="google">Google</option>
                                                    <option value="facebook">Facebook</option>
                                                    <option value="instagram">Instagram</option>
                                                    <option value="tiktok">TikTok</option>
                                                    <option value="friend">Amigo / Referido</option>
                                                    <option value="university">Universidad</option>
                                                    <option value="other">Otro</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {user.userType === 'tenant' && (
                                        <div className="pt-4 sm:pt-6 border-t border-gray-100">
                                            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                                                Información Académica <span className="text-gray-400 text-sm font-normal ml-2">(Opcional)</span>
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Ciudad donde estudias</label>
                                                    <CityAutocomplete
                                                        hideLabel={true}
                                                        value={formData.profile?.studyCity || null}
                                                        onChange={(city) => {
                                                            const profile = { ...formData.profile };
                                                            profile.studyCityId = city?.id;
                                                            profile.studyCity = city || undefined;
                                                            // Si cambia la ciudad, limpiar la institución si existe para evitar inconsistencias
                                                            if (!city || city.id !== formData.profile?.studyCityId) {
                                                                profile.institutionId = undefined;
                                                                profile.institution = undefined;
                                                            }
                                                            setFormData(prev => ({ ...prev, profile }));
                                                        }}
                                                        placeholder="Buscar ciudad de estudio..."
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Institución Educativa</label>
                                                    <InstitutionAutocomplete
                                                        cityId={formData.profile?.studyCityId || null}
                                                        value={formData.profile?.institution || null}
                                                        onChange={(institution) => {
                                                            const profile = { ...formData.profile };
                                                            profile.institutionId = institution?.id;
                                                            profile.institution = institution || undefined;
                                                            setFormData(prev => ({ ...prev, profile }));
                                                        }}
                                                        placeholder="Buscar institución..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Programa Académico</label>
                                                    <input
                                                        type="text"
                                                        value={formData.profile?.academicProgram || ''}
                                                        onChange={(e) => handleProfileChange('academicProgram', e.target.value)}
                                                        placeholder="Ej: Ingeniería de Sistemas"
                                                        className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Semestre Actual</label>
                                                    <input
                                                        type="number"
                                                        value={formData.profile?.currentSemester || ''}
                                                        onChange={(e) => handleProfileChange('currentSemester', Number(e.target.value))}
                                                        min="1"
                                                        max="12"
                                                        className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Preferencia de Vivienda</label>
                                                    <select
                                                        value={formData.profile?.livingPreference || ''}
                                                        onChange={(e) => handleProfileChange('livingPreference', e.target.value)}
                                                        className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        <option value="solo">Vivir solo</option>
                                                        <option value="shared">Compartir (Roomie)</option>
                                                        <option value="indifferent">Indiferente</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {user.userType === 'owner' && (
                                        <div className="pt-4 sm:pt-6 border-t border-gray-100">
                                            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                                                Información del Arrendador <span className="text-gray-400 text-sm font-normal ml-2">(Opcional)</span>
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Total Propiedades Administradas</label>
                                                    <input
                                                        type="number"
                                                        value={formData.profile?.totalPropertiesManaged || ''}
                                                        onChange={(e) => handleProfileChange('totalPropertiesManaged', Number(e.target.value))}
                                                        min="0"
                                                        className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Años de Experiencia</label>
                                                    <input
                                                        type="number"
                                                        value={formData.profile?.yearsAsLandlord || ''}
                                                        onChange={(e) => handleProfileChange('yearsAsLandlord', Number(e.target.value))}
                                                        min="0"
                                                        step="0.5"
                                                        className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.profile?.managesPersonally || false}
                                                            onChange={(e) => handleProfileChange('managesPersonally', e.target.checked)}
                                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                        />
                                                        <span className="text-sm text-gray-700">Administro personalmente mis propiedades (sin inmobiliaria)</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-3 sm:pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center min-h-[48px] px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition-colors font-medium"
                                        >
                                            {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                                    <h2 className="text-base sm:text-lg font-medium text-gray-900">Cambiar Contraseña</h2>
                                    <div className="max-w-md space-y-3 sm:space-y-4">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Contraseña Actual</label>
                                            <input
                                                type="password"
                                                className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Confirmar Nueva Contraseña</label>
                                            <input
                                                type="password"
                                                className="w-full min-h-[44px] px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                className="min-h-[48px] px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-800 text-white rounded-lg hover:bg-gray-900 active:bg-black transition-colors font-medium"
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
                                                <h3 className="text-lg font-semibold mb-1">Tu Cuenta</h3>
                                                <p className="text-emerald-100 text-2xl font-bold">
                                                    {user.userType === 'tenant' ? 'Estudiante / Inquilino' : (user.plan === 'premium' ? 'Propietario Premium' : 'Propietario Gratuito')}
                                                </p>
                                            </div>
                                            {user.plan === 'premium' && user.userType === 'owner' && (
                                                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                                                    ✓ Activo
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {user.userType === 'tenant' ? (
                                        <div className="space-y-6">
                                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Tus Créditos</h3>
                                                    {loadingCredits ? (
                                                        <div className="flex items-center text-gray-500"><Loader className="w-4 h-4 mr-2 animate-spin" /> Cargando...</div>
                                                    ) : creditBalance?.hasUnlimited && creditBalance.unlimitedUntil && new Date(creditBalance.unlimitedUntil) > new Date() ? (
                                                        <p className="text-3xl font-bold text-emerald-600 flex items-center">
                                                            Ilimitados
                                                            <span className="text-sm font-normal text-gray-500 ml-3">
                                                                Vence el {new Date(creditBalance.unlimitedUntil).toLocaleDateString()}
                                                            </span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-3xl font-bold text-emerald-600">
                                                            {creditBalance?.availableCredits || 0}
                                                            <span className="text-sm font-normal text-gray-500 ml-2">disponibles</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        // Ensure we have a clean URL before navigating
                                                        navigate('/planes', { replace: true });
                                                    }}
                                                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
                                                >
                                                    Comprar Más Créditos
                                                </button>
                                            </div>

                                            {/* CHECKOUT FLOW */}
                                            {(() => {
                                                const planParam = new URLSearchParams(location.search).get('plan');
                                                const creditPlansList: Record<string, { name: string, price: number, link: string }> = {
                                                    '5_credits': { name: '5 Créditos de Contacto', price: 8999, link: 'https://mpago.li/13RRpyn' },
                                                    '10_credits': { name: '10 Créditos de Contacto', price: 12999, link: '' },
                                                    '20_credits': { name: '20 Créditos de Contacto', price: 19999, link: '' }
                                                };
                                                const selectedCreditPlan = planParam ? creditPlansList[planParam] : null;

                                                if (!selectedCreditPlan) return null;

                                                return (
                                                    <div className="bg-white rounded-xl border-2 border-emerald-500 shadow-lg overflow-hidden mt-8 animate-fadeIn">
                                                        <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-900">Finalizar Compra</h3>
                                                                <p className="text-emerald-700 font-medium">Estás a punto de adquirir: {selectedCreditPlan.name}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-gray-500">Total a pagar</p>
                                                                <p className="text-2xl font-black text-gray-900">${selectedCreditPlan.price.toLocaleString('es-CO')}</p>
                                                            </div>
                                                        </div>

                                                        {paymentRequest && paymentRequest.status === 'pending' ? (
                                                            <div className="p-8">
                                                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                                                    <Clock className="h-16 w-16 text-yellow-500 mb-4" />
                                                                    <h4 className="text-xl font-bold text-yellow-800 mb-2">Pago en Revisión</h4>
                                                                    <p className="text-yellow-700 mb-4 max-w-md">
                                                                        Hemos recibido tu comprobante. Los créditos se asignarán en un máximo de 2 horas.
                                                                    </p>
                                                                    <div className="text-sm text-yellow-600 bg-yellow-100 inline-block px-4 py-2 rounded-full font-mono font-bold">
                                                                        Referencia: {paymentRequest.referenceCode}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 sm:p-8 space-y-6">
                                                                <h4 className="text-lg font-semibold text-gray-900">Selecciona tu método de pago:</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <button
                                                                        onClick={() => setPaymentMethod('mercadopago')}
                                                                        className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'mercadopago' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                                                                    >
                                                                        <div className="text-center">
                                                                            <span className="block font-bold text-gray-900 mb-1">Mercado Pago</span>
                                                                            <span className="text-sm text-gray-500">Pago inmediato (PSE, Tarjeta)</span>
                                                                        </div>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setPaymentMethod('transfer')}
                                                                        className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'transfer' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                                                                    >
                                                                        <div className="text-center">
                                                                            <span className="block font-bold text-gray-900 mb-1">Transferencia</span>
                                                                            <span className="text-sm text-gray-500">Subir comprobante manual</span>
                                                                        </div>
                                                                    </button>
                                                                </div>

                                                                <div className="pt-6 border-t border-gray-100 transition-all duration-300">
                                                                    {paymentMethod === 'mercadopago' && (
                                                                        <div className="text-center py-6">
                                                                            {mpError && (
                                                                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                                                                                    {mpError}
                                                                                </div>
                                                                            )}
                                                                            <button
                                                                                onClick={() => planParam && handleMPPayment(planParam)}
                                                                                disabled={isGeneratingMPLink}
                                                                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all w-full md:w-auto disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                                                            >
                                                                                {isGeneratingMPLink ? (
                                                                                    <><Loader className="w-5 h-5 mr-2 animate-spin" /> Conectando con Mercado Pago...</>
                                                                                ) : (
                                                                                    'Pagar con Mercado Pago'
                                                                                )}
                                                                            </button>
                                                                            <p className="mt-4 text-sm text-gray-500">Serás redirigido a la pasarela segura de Mercado Pago.</p>
                                                                        </div>
                                                                    )}

                                                                    {paymentMethod === 'transfer' && (
                                                                        <div className="animate-fadeIn">
                                                                            <PaymentUploadForm
                                                                                user={user}
                                                                                onSuccess={() => {
                                                                                    setMessage({ type: 'success', text: 'Comprobante enviado exitosamente.' });
                                                                                    setTimeout(() => window.location.reload(), 1500);
                                                                                }}
                                                                                selectedPlan={planParam as '5_credits' | '10_credits' | '20_credits'}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    {!paymentMethod && (
                                                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                                            <p className="text-gray-500">Selecciona un método de pago arriba para continuar</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            {/* END CHECKOUT FLOW */}

                                            {creditTransactions.length > 0 && (
                                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                                        <h3 className="text-lg font-semibold text-gray-900">Historial de Transacciones</h3>
                                                    </div>
                                                    <ul className="divide-y divide-gray-100">
                                                        {creditTransactions.map(tx => (
                                                            <li key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}</p>
                                                                </div>
                                                                <div className={`font-semibold text-sm ${tx.type === 'use' || tx.type === 'expire' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                    {tx.type === 'use' || tx.type === 'expire' ? '-' : '+'}{tx.amount}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Owner flow */
                                        (() => {
                                            const isPremium = user.plan === 'premium';
                                            const isExpired = user.planExpiresAt ? new Date(user.planExpiresAt) < new Date() : false;
                                            const canUploadPayment = !isPremium || isExpired;

                                            console.log('Payment upload check:', {
                                                plan: user.plan,
                                                isPremium,
                                                planExpiresAt: user.planExpiresAt,
                                                isExpired,
                                                canUploadPayment
                                            });

                                            return canUploadPayment && (
                                                <div className="space-y-8">
                                                    {/* Expiration Warning for expired premium users */}
                                                    {isPremium && isExpired && (
                                                        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <AlertCircle className="h-8 w-8 text-orange-600" />
                                                                <h4 className="text-xl font-bold text-orange-800">Plan Premium Expirado</h4>
                                                            </div>
                                                            <p className="text-orange-700 mb-2">
                                                                Tu plan premium ha expirado el {new Date(user.planExpiresAt!).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}.
                                                            </p>
                                                            <p className="text-orange-700">
                                                                Renueva tu suscripción para seguir disfrutando de todos los beneficios premium.
                                                            </p>
                                                        </div>
                                                    )}

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

                                                    {/* Payment Flow Section with Step Indicators */}
                                                    <PaymentFlowSection
                                                        user={user}
                                                        paymentRequest={paymentRequest}
                                                        onPaymentSuccess={handlePaymentSuccess}
                                                    />
                                                </div>
                                            );
                                        })()
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
