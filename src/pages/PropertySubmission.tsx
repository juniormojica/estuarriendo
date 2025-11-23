import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { PropertyFormData, Amenity } from '../types';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageUploader from '../components/ImageUploader';
import { departments, getCitiesByDepartment } from '../data/colombiaLocations';

const STEPS = ['Información Básica', 'Ubicación', 'Detalles', 'Imágenes'];

const PropertySubmission: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    type: 'apartamento',
    price: 0,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: '',
      city: '',
      street: '',
      postalCode: ''
    },
    rooms: undefined,
    bathrooms: undefined,
    area: undefined,
    amenities: [],
    images: []
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('estuarriendo_user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    setUser(JSON.parse(storedUser));
    api.getAmenities().then(setAmenities);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];

      if (addressField === 'department') {
        const dept = departments.find(d => d.id === value);
        const deptName = dept ? dept.name : '';
        const cities = getCitiesByDepartment(value);
        setAvailableCities(cities.map(c => c.name));
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            department: deptName,
            city: ''
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        }));
      }
    } else {
      if (field === 'type') {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          rooms: value === 'habitacion' ? 1 : undefined,
          bathrooms: value === 'habitacion' ? undefined : prev.bathrooms
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Info
        return !!(formData.title && formData.description && formData.price > 0 && formData.type);
      case 1: // Location
        return !!(formData.address.department && formData.address.city && formData.address.street);
      case 2: // Details
        // Validation depends on type, but generally area is good to have.
        // For simplicity, we'll just require area if it's not 0/undefined
        return true;
      case 3: // Images
        return formData.images.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    } else {
      setError('Por favor completa todos los campos requeridos de este paso.');
      // Clear error after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
    setError('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const submissionData = {
        ...formData,
        ownerId: user?.id
      };
      const result = await api.submitProperty(submissionData);
      if (result.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(result.message || 'Error al enviar la propiedad');
      }
    } catch (err) {
      setError('Error inesperado. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4 text-center animate-fadeIn">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Propiedad Enviada a Revisión!</h2>
          <p className="text-gray-600 mb-6">
            Tu propiedad ha sido enviada exitosamente. Nuestro equipo la revisará y será publicada pronto.
          </p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Ver Propiedades
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(0);
                setFormData({
                  title: '',
                  description: '',
                  type: 'apartamento',
                  price: 0,
                  currency: 'COP',
                  address: {
                    country: 'Colombia',
                    department: '',
                    city: '',
                    street: '',
                    postalCode: ''
                  },
                  rooms: undefined,
                  bathrooms: undefined,
                  area: undefined,
                  amenities: [],
                  images: []
                });
                setAvailableCities([]);
              }}
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Publicar Otra Propiedad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Publicar Propiedad</h1>
          <p className="text-gray-600 mt-2">
            Completa la información en {STEPS.length} sencillos pasos.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex flex-col items-center ${index <= currentStep ? 'text-emerald-600' : 'text-gray-400'
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1 transition-colors ${index <= currentStep
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-500'
                    }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs hidden sm:block">{step}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="animate-fadeIn">
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la propiedad *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                      placeholder="Ej: Apartamento moderno en zona rosa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de propiedad *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="apartamento">Apartamento</option>
                        <option value="habitacion">Habitación</option>
                        <option value="pension">Pensión</option>
                        <option value="aparta-estudio">Aparta-estudio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Precio mensual (COP) *</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Ej: 2800000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                    <textarea
                      rows={6}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Describe las características principales de tu propiedad..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Ubicación</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
                      <select
                        value={departments.find(d => d.name === formData.address.department)?.id || ''}
                        onChange={(e) => handleInputChange('address.department', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Selecciona un departamento</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                      <select
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={!formData.address.department}
                      >
                        <option value="">Selecciona una ciudad</option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: Carrera 13 #85-32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: 110221"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Detalles y Comodidades</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formData.type !== 'habitacion' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.rooms || ''}
                        onChange={(e) => handleInputChange('rooms', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {formData.type !== 'habitacion' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.bathrooms || ''}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Área (m²)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.area || ''}
                      onChange={(e) => handleInputChange('area', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {formData.type === 'habitacion' ? 'Características de la Habitación' : 'Comodidades'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map(amenity => (
                      <label
                        key={amenity.id}
                        className={`flex items-center space-x-3 cursor-pointer p-3 border rounded-lg transition-all ${formData.amenities.includes(amenity.id)
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity.id)}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Galería de Imágenes</h2>
                <p className="text-gray-600">
                  Sube al menos una imagen de tu propiedad. Las mejores fotos aumentan las posibilidades de arriendo.
                </p>
                <ImageUploader
                  images={formData.images as string[]}
                  onChange={handleImagesChange}
                  maxImages={10}
                  maxSizeMB={5}
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${currentStep === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Anterior</span>
            </button>

            {currentStep === STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <span>Publicar Propiedad</span>
                    <CheckCircle className="h-5 w-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySubmission;