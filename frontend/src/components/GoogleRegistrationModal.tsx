'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Building2, User as UserIcon, X, Phone, AlertCircle, CheckCircle } from 'lucide-react';

export interface GooglePendingData {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

interface GoogleRegistrationModalProps {
  googleData: GooglePendingData;
  onSubmit: (data: {
    userType: 'owner' | 'tenant';
    phone: string;
    whatsapp: string;
  }) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

const GoogleRegistrationModal: React.FC<GoogleRegistrationModalProps> = ({
  googleData,
  onSubmit,
  onClose,
  loading = false,
  error = null,
}) => {
  const [userType, setUserType] = useState<'owner' | 'tenant'>('tenant');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (sameAsPhone) setWhatsapp(value);
    if (value.trim()) setPhoneError('');
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(e.target.value);
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) setWhatsapp(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setPhoneError('El teléfono es obligatorio');
      return;
    }
    await onSubmit({
      userType,
      phone: phone.trim(),
      whatsapp: sameAsPhone ? phone.trim() : whatsapp.trim() || phone.trim(),
    });
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-brand-dark rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="relative bg-white dark:bg-brand-dark px-6 pt-8 pb-6 border-b border-gray-100 dark:border-white/10">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-lime rounded-t-2xl" />
          <div className="flex items-center gap-4">
            {googleData.picture ? (
              <Image
                src={googleData.picture}
                alt={googleData.name}
                width={56}
                height={56}
                className="rounded-full ring-2 ring-white dark:ring-brand-dark shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-brand-lime/20 flex items-center justify-center ring-2 ring-white dark:ring-brand-dark shadow-md">
                <UserIcon className="h-7 w-7 text-brand-lime" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-brand-dark dark:text-white">{googleData.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{googleData.email}</p>
              <p className="text-xs text-brand-lime font-medium mt-0.5">✓ Verificado con Google</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Solo necesitamos un par de datos más para completar tu cuenta.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* User type toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ¿Cómo usarás EstuArriendo?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('tenant')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  userType === 'tenant'
                    ? 'border-brand-lime bg-brand-lime/10 text-brand-dark dark:text-brand-lime'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-brand-lime/50 dark:hover:border-brand-lime/50 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <UserIcon className="h-6 w-6" />
                <span>Busco Inmueble</span>
                <span className="text-xs font-normal text-current opacity-70">Soy estudiante</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('owner')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  userType === 'owner'
                    ? 'border-brand-lime bg-brand-lime/10 text-brand-dark dark:text-brand-lime'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-brand-lime/50 dark:hover:border-brand-lime/50 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <Building2 className="h-6 w-6" />
                <span>Soy Propietario</span>
                <span className="text-xs font-normal text-current opacity-70">Tengo inmuebles</span>
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Ej: 3001234567"
                className={`w-full min-h-[44px] pl-9 pr-3 py-2.5 border bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent ${
                  phoneError ? 'border-red-500' : 'border-gray-300 dark:border-white/20'
                }`}
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{phoneError}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                WhatsApp
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsPhone}
                  onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                  className="rounded border-gray-300 dark:border-white/20 dark:bg-white/5 text-brand-lime focus:ring-brand-lime"
                />
                Igual al teléfono
              </label>
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={sameAsPhone ? phone : whatsapp}
                onChange={handleWhatsappChange}
                disabled={sameAsPhone}
                placeholder="Ej: 3001234567"
                className="w-full min-h-[44px] pl-9 pr-3 py-2.5 border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-white/5 disabled:text-gray-400 dark:disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 bg-brand-lime hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-brand-dark font-bold rounded-xl transition-all shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creando cuenta...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Completar Registro
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoogleRegistrationModal;
