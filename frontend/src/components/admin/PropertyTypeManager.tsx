import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import ConfirmModal from '../ConfirmModal';
import './ManagerStyles.css';

interface PropertyType {
    id: number;
    name: string;
    description?: string;
}

const PropertyTypeManager: React.FC = () => {
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [filteredPropertyTypes, setFilteredPropertyTypes] = useState<PropertyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPropertyType, setEditingPropertyType] = useState<PropertyType | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<PropertyType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPropertyTypes();
    }, []);

    useEffect(() => {
        const filtered = propertyTypes.filter(type =>
            type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredPropertyTypes(filtered);
    }, [searchTerm, propertyTypes]);

    const fetchPropertyTypes = async () => {
        try {
            setLoading(true);
            const data = await api.getPropertyTypes();
            setPropertyTypes(data);
            setFilteredPropertyTypes(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar tipos de propiedad');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (propertyType?: PropertyType) => {
        if (propertyType) {
            setEditingPropertyType(propertyType);
            setFormData({
                name: propertyType.name,
                description: propertyType.description || ''
            });
        } else {
            setEditingPropertyType(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPropertyType(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingPropertyType) {
                await api.updatePropertyType(editingPropertyType.id, formData);
            } else {
                await api.createPropertyType(formData);
            }
            await fetchPropertyTypes();
            handleCloseModal();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Error al guardar tipo de propiedad');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await api.deletePropertyType(deleteConfirm.id);
            await fetchPropertyTypes();
            setDeleteConfirm(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al eliminar tipo de propiedad');
            setDeleteConfirm(null);
        }
    };

    if (loading) {
        return <div className="manager-loading">Cargando tipos de propiedad...</div>;
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar tipos de propiedad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn-secondary"
                        onClick={fetchPropertyTypes}
                        title="Refrescar datos"
                    >
                        <RefreshCw size={20} />
                        Refrescar
                    </button>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Nuevo Tipo
                    </button>
                </div>
            </div>

            {error && !showModal && !deleteConfirm && (
                <div className="error-message">{error}</div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPropertyTypes.map(type => (
                            <tr key={type.id}>
                                <td><strong>{type.name}</strong></td>
                                <td className="text-muted">{type.description || '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleOpenModal(type)}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => setDeleteConfirm(type)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredPropertyTypes.length === 0 && (
                    <div className="empty-state">
                        {searchTerm ? 'No se encontraron tipos de propiedad' : 'No hay tipos de propiedad registrados'}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingPropertyType ? 'Editar Tipo de Propiedad' : 'Nuevo Tipo de Propiedad'}</h2>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingPropertyType ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmModal
                    isOpen={true}
                    title="Eliminar Tipo de Propiedad"
                    message={`¿Estás seguro de que deseas eliminar el tipo de propiedad "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
};

export default PropertyTypeManager;
