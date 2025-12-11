import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { PropertyFormData, PropertyTypeEntity } from '../types';
import { api } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAmenities } from '../store/slices/amenitiesSlice';
import { createProperty, updateProperty, fetchPropertyById } from '../store/slices/propertiesSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageUploader from '../components/ImageUploader';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';
import RejectionWarningModal from '../components/RejectionWarningModal';
import { departments, getCitiesByDepartment } from '../data/colombiaLocations';
import { transformPropertyForBackend, transformPropertyFromBackend } from '../utils/propertyTransform';
import { fetchPropertyTypes } from '../services/propertyTypeService';

const STEPS = ['Información Básica', 'Ubicación', 'Detalles', 'Imágenes'];

const PropertySubmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: amenities } = useAppSelector((state) => state.amenities);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [coordStrings, setCoordStrings] = useState({ lat: '', lng: '' });
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeEntity[]>([]);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionInfo, setRejectionInfo] = useState({ reason: '', title: '' });
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);

  const maxImages = user?.plan === 'premium' ? 10 : 3;

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    type: 'apartamento',
    monthlyRent: 0,
    currency: 'COP',
    address: {
      country: 'Colombia',
      department: '',
      city: '',
      street: '',
      postalCode: '',
      neighborhood: ''
    },
    bedrooms: undefined,
    bathrooms: undefined,
    area: undefined,
    amenities: [],
    images: [],
    coordinates: {
      lat: 0,
      lng: 0
    }
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('estuarriendo_current_user');
    if (!storedUser) {
      window.location.href = '/login';
      return;
    }
    setUser(JSON.parse(storedUser));
    dispatch(fetchAmenities());

    // Fetch property types
    const loadPropertyTypes = async () => {
      try {
        const types = await fetchPropertyTypes();
        setPropertyTypes(types);
      } catch (err) {
        console.error('Error loading property types:', err);
        // Use fallback types if fetch fails
        setPropertyTypes([
          { id: 1, name: 'apartamento' },
          { id: 2, name: 'habitacion' },
          { id: 3, name: 'pension' },
          { id: 4, name: 'aparta-estudio' }
        ]);
      }
    };
    loadPropertyTypes();

    if (id) {
      setIsEditing(true);
      loadProperty(id);
    }
  }, [id, dispatch]);

  const loadProperty = async (propertyId: string) => {
    setIsLoadingProperty(true);
    setError('');

    try {
      const resultAction = await dispatch(fetchPropertyById(propertyId));

      if (fetchPropertyById.fulfilled.match(resultAction)) {
        const property = resultAction.payload;

        // Verify property exists before accessing its properties
        if (!property) {
          setError('Propiedad no encontrada');
          setIsLoadingProperty(false);
          return;
        }

        // Check if property is rejected and show modal
        if (property.status === 'rejected' && property.rejectionReason) {
          setRejectionInfo({
            reason: property.rejectionReason,
            title: property.title
          });
          setShowRejectionModal(true);
        }

        const transformedData = transformPropertyFromBackend(property);
        setFormData(transformedData);
        setCoordStrings({
          lat: transformedData.coordinates?.lat?.toString() || '',
          lng: transformedData.coordinates?.lng?.toString() || ''
        });

        // Load available cities for the department
        const dept = departments.find(d => d.name === transformedData.address.department);
        if (dept) {
          const cities = getCitiesByDepartment(dept.id);
          setAvailableCities(cities.map(c => c.name));
        }
      } else if (fetchPropertyById.rejected.match(resultAction)) {
        const errorMessage = resultAction.error?.message || 'No se pudo cargar la propiedad';
        setError(`Error: ${errorMessage}`);
        console.error('Error loading property:', resultAction.error);
      } else {
        setError('Propiedad no encontrada');
      }
    } catch (err: any) {
      console.error('Error loading property:', err);
      setError(`Error al cargar la propiedad: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsLoadingProperty(false);
    }
  };

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
          bedrooms: value === 'habitacion' ? 1 : undefined,
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

  const handleCoordChange = (field: 'lat' | 'lng', value: string) => {
    setCoordStrings(prev => ({ ...prev, [field]: value }));

    // Handle comma as decimal separator
    const normalizedValue = value.replace(',', '.');
    const numberValue = parseFloat(normalizedValue);

    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates!,
        [field]: isNaN(numberValue) ? 0 : numberValue
      }
    }));
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
        return !!(formData.title && formData.description && (formData.monthlyRent || formData.price) && (formData.monthlyRent || formData.price) > 0 && formData.type);
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
      console.log('Form data type:', formData.type);

      // Transform form data to backend format
      // propertyTypes is now optional since we send typeName directly
      const backendData = transformPropertyForBackend(formData, user, propertyTypes);

      console.log('Transformed backend data:', backendData);

      if (isEditing && id) {
        // Update existing property
        const resultAction = await dispatch(updateProperty({ id, data: backendData }));

        if (updateProperty.fulfilled.match(resultAction)) {
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const errorMsg = resultAction.payload as string || 'Error al actualizar la propiedad';
          console.error('Update error:', errorMsg);
          setError(errorMsg);
        }
      } else {
        // Create new property
        const resultAction = await dispatch(createProperty(backendData));

        if (createProperty.fulfilled.match(resultAction)) {
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const errorMsg = resultAction.payload as string || 'Error al crear la propiedad';
          console.error('Create error:', errorMsg, resultAction);
          setError(errorMsg);
        }
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(`Error inesperado: ${err.message || 'Por favor, intenta nuevamente.'} `);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4 text-center animate-fadeIn">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isEditing ? '¡Propiedad Actualizada!' : '¡Propiedad Enviada a Revisión!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isEditing
              ? 'Tu propiedad ha sido actualizada exitosamente.'
              : 'Tu propiedad ha sido enviada exitosamente. Nuestro equipo la revisará y será publicada pronto.'}
          </p>
          <div className="space-y-3">
            <Link
              to="/mis-propiedades"
              className="block w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Volver a Mis Propiedades
            </Link>
            {!isEditing && (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setCurrentStep(0);
                  setFormData({
                    title: '',
                    description: '',
                    type: 'apartamento',
                    monthlyRent: 0,
                    currency: 'COP',
                    address: {
                      country: 'Colombia',
                      department: '',
                      city: '',
                      street: '',
                      postalCode: '',
                      neighborhood: ''
                    },
                    bedrooms: undefined,
                    bathrooms: undefined,
                    area: undefined,
                    amenities: [],
                    images: [],
                    coordinates: {
                      lat: 0,
                      lng: 0
                    }
                  });
                  setAvailableCities([]);
                  setCoordStrings({ lat: '', lng: '' });
                }}
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Publicar Otra Propiedad
              </button>
            )}
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
            to={isEditing ? "/mis-propiedades" : "/"}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isEditing ? 'Volver a Mis Propiedades' : 'Volver al inicio'}</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Propiedad' : 'Publicar Propiedad'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Actualiza la información de tu propiedad.' : `Completa la información en ${STEPS.length} sencillos pasos.`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex flex - col items - center ${index <= currentStep ? 'text-emerald-600' : 'text-gray-400'
                  } `}
              >
                <div
                  className={`w - 8 h - 8 rounded - full flex items - center justify - center text - sm font - semibold mb - 1 transition - colors ${index <= currentStep
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-500'
                    } `}
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
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}% ` }}
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
                        value={formData.monthlyRent || ''}
                        onChange={(e) => handleInputChange('monthlyRent', parseInt(e.target.value) || 0)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Barrio (Opcional)</label>
                    <input
                      type="text"
                      value={formData.address.neighborhood || ''}
                      onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: El Chicó"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Latitud (Opcional)</label>
                      <input
                        type="text"
                        value={coordStrings.lat}
                        onChange={(e) => handleCoordChange('lat', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Ej: 10.46314"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Longitud (Opcional)</label>
                      <input
                        type="text"
                        value={coordStrings.lng}
                        onChange={(e) => handleCoordChange('lng', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Ej: -73.25322"
                      />
                    </div>
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
                        value={formData.bedrooms || ''}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
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
                        className={`flex items - center space - x - 3 cursor - pointer p - 3 border rounded - lg transition - all ${formData.amenities.includes(amenity.id)
                          ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:bg-gray-50'
                          } `}
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

                {user?.plan !== 'premium' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800">Plan Gratuito</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Estás limitado a 3 imágenes por propiedad.
                        <button
                          onClick={() => setShowPremiumModal(true)}
                          className="ml-1 underline font-medium hover:text-blue-900"
                        >
                          Mejora a Premium
                        </button>
                        {' '}para subir hasta 10 imágenes y videos.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-gray-600">
                  Sube al menos una imagen de tu propiedad. Las mejores fotos aumentan las posibilidades de arriendo.
                </p>
                <ImageUploader
                  images={formData.images as string[]}
                  onChange={handleImagesChange}
                  maxImages={maxImages}
                  maxSizeMB={5}
                  onLimitReached={() => setShowPremiumModal(true)}
                  folder="properties"
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
              className={`flex items - center space - x - 2 px - 6 py - 3 rounded - lg font - semibold transition - colors ${currentStep === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } `}
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
                    <span>{isEditing ? 'Actualizando...' : 'Publicando...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isEditing ? 'Actualizar Propiedad' : 'Publicar Propiedad'}</span>
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

      {/* Rejection Warning Modal */}
      <RejectionWarningModal
        isOpen={showRejectionModal}
        rejectionReason={rejectionInfo.reason}
        propertyTitle={rejectionInfo.title}
        onClose={() => {
          setShowRejectionModal(false);
          navigate('/mis-propiedades');
        }}
        onContinue={() => setShowRejectionModal(false)}
      />

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};

export default PropertySubmission;