import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPropertyById, clearCurrentProperty } from '../store/slices/propertiesSlice';
import PropertyEditForm from '../components/forms/PropertyEditForm';
import LoadingSpinner from '../components/LoadingSpinner';

const EditPropertyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { currentProperty: property, loading, error } = useAppSelector((state) => state.properties);

    useEffect(() => {
        if (id) {
            dispatch(fetchPropertyById(id));
        }

        return () => {
            dispatch(clearCurrentProperty());
        };
    }, [dispatch, id]);

    const handleSuccess = () => {
        // Navigate back to dashboard or property details
        navigate('/dashboard');
    };

    const handleCancel = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!property) {
        return null; // or not found state
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-white rounded-full transition-colors hidden sm:block"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Editar Propiedad</h1>
                        <p className="text-gray-600 mt-2">
                            Actualiza la información de tu propiedad. Ten en cuenta que los cambios requerirán una nueva revisión.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <PropertyEditForm
                        property={property}
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditPropertyPage;
