import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import ConfirmModal from '../ConfirmModal';
import { useToast } from '../../components/ToastProvider';
import './ManagerStyles.css';

interface Amenity {
    id: number;
    name: string;
    icon?: string;
}

const AmenityManager: React.FC = () => {
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [filteredAmenities, setFilteredAmenities] = useState<Amenity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Amenity | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: ''
    });
    const [error, setError] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchAmenities();
    }, []);

    useEffect(() => {
        const filtered = amenities.filter(amenity =>
            amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAmenities(filtered);
    }, [searchTerm, amenities]);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const data = await api.getAmenities();
            setAmenities(data);
            setFilteredAmenities(data);
        } catch (err: any) {
            const message = err.message || 'Error al cargar amenidades';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (amenity?: Amenity) => {
        if (amenity) {
            setEditingAmenity(amenity);
            setFormData({
                name: amenity.name,
                icon: amenity.icon || ''
            });
        } else {
            setEditingAmenity(null);
            setFormData({ name: '', icon: '' });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAmenity(null);
        setFormData({ name: '', icon: '' });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingAmenity) {
                await api.updateAmenity(editingAmenity.id, formData);
                toast.success('Amenidad actualizada exitosamente');
            } else {
                await api.createAmenity(formData);
                toast.success('Amenidad creada exitosamente');
            }
            await fetchAmenities();
            handleCloseModal();
        } catch (err: any) {
            const message = err.response?.data?.error || err.message || 'Error al guardar amenidad';
            setError(message);
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await api.deleteAmenity(deleteConfirm.id);
            toast.success('Amenidad eliminada exitosamente');
            await fetchAmenities();
            setDeleteConfirm(null);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Error al eliminar amenidad';
            setError(message);
            toast.error(message);
            setDeleteConfirm(null);
        }
    };

    if (loading) {
        return <div className="manager-loading">Cargando amenidades...</div>;
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar amenidades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn-secondary"
                        onClick={fetchAmenities}
                        title="Refrescar datos"
                    >
                        <RefreshCw size={20} />
                        Refrescar
                    </button>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Nueva Amenidad
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
                            <th>Icono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAmenities.map(amenity => (
                            <tr key={amenity.id}>
                                <td><strong>{amenity.name}</strong></td>
                                <td className="text-muted">{amenity.icon || '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleOpenModal(amenity)}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => setDeleteConfirm(amenity)}
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

                {filteredAmenities.length === 0 && (
                    <div className="empty-state">
                        {searchTerm ? 'No se encontraron amenidades' : 'No hay amenidades registradas'}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingAmenity ? 'Editar Amenidad' : 'Nueva Amenidad'}</h2>

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
                                <label>Icono</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="ej: wifi, parking, pool"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingAmenity ? 'Actualizar' : 'Crear'}
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
                    title="Eliminar Amenidad"
                    message={`¿Estás seguro de que deseas eliminar la amenidad "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
};

export default AmenityManager;
