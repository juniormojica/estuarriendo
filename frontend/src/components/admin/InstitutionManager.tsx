import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import ConfirmModal from '../ConfirmModal';
import './ManagerStyles.css';

interface City {
    id: number;
    name: string;
}

interface Institution {
    id: number;
    name: string;
    cityId: number;
    type: string;
    acronym?: string;
    latitude?: number;
    longitude?: number;
    city?: City;
}

const InstitutionManager: React.FC = () => {
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [filterType, setFilterType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Institution | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        cityId: '',
        type: '',
        acronym: '',
        latitude: '',
        longitude: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = institutions;

        if (searchTerm) {
            filtered = filtered.filter(inst =>
                inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (inst.acronym && inst.acronym.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (filterCity) {
            filtered = filtered.filter(inst => inst.cityId === parseInt(filterCity));
        }

        if (filterType) {
            filtered = filtered.filter(inst => inst.type === filterType);
        }

        setFilteredInstitutions(filtered);
    }, [searchTerm, filterCity, filterType, institutions]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [institutionsData, citiesData] = await Promise.all([
                api.getInstitutions(),
                api.getCities()
            ]);
            setInstitutions(institutionsData);
            setCities(citiesData);
            setFilteredInstitutions(institutionsData);
        } catch (err: any) {
            setError(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (institution?: Institution) => {
        if (institution) {
            setEditingInstitution(institution);
            setFormData({
                name: institution.name,
                cityId: institution.cityId.toString(),
                type: institution.type,
                acronym: institution.acronym || '',
                latitude: institution.latitude?.toString() || '',
                longitude: institution.longitude?.toString() || ''
            });
        } else {
            setEditingInstitution(null);
            setFormData({ name: '', cityId: '', type: '', acronym: '', latitude: '', longitude: '' });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingInstitution(null);
        setFormData({ name: '', cityId: '', type: '', acronym: '', latitude: '', longitude: '' });
        setError('');
    };

    // Helper function to normalize coordinates from Google Maps format
    const normalizeCoordinate = (value: string, type: 'lat' | 'lng'): number | undefined => {
        if (!value || value.trim() === '') return undefined;

        let num = parseFloat(value);

        // Check if it's a valid number
        if (isNaN(num)) return undefined;

        // If the number is too large (Google Maps sometimes gives coordinates without decimal)
        // For latitude: should be between -90 and 90
        // For longitude: should be between -180 and 180
        if (type === 'lat') {
            if (Math.abs(num) > 90) {
                // Likely missing decimal point, divide by 10^(digits-2)
                const str = Math.abs(num).toString();
                const decimals = str.length - 2;
                num = num / Math.pow(10, decimals);
            }
            // Validate range
            if (num < -90 || num > 90) {
                throw new Error(`Latitud inválida: ${num}. Debe estar entre -90 y 90`);
            }
        } else {
            if (Math.abs(num) > 180) {
                // Likely missing decimal point
                const str = Math.abs(num).toString();
                const decimals = str.length - 2;
                num = num / Math.pow(10, decimals);
            }
            // Validate range
            if (num < -180 || num > 180) {
                throw new Error(`Longitud inválida: ${num}. Debe estar entre -180 y 180`);
            }
        }

        return num;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const payload: any = {
                name: formData.name,
                cityId: parseInt(formData.cityId),
                type: formData.type,
                acronym: formData.acronym || undefined,
                latitude: normalizeCoordinate(formData.latitude, 'lat'),
                longitude: normalizeCoordinate(formData.longitude, 'lng')
            };

            if (editingInstitution) {
                await api.updateInstitution(editingInstitution.id, payload);
            } else {
                await api.createInstitution(payload);
            }
            await fetchData();
            handleCloseModal();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Error al guardar institución');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await api.deleteInstitution(deleteConfirm.id);
            await fetchData();
            setDeleteConfirm(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al eliminar institución');
            setDeleteConfirm(null);
        }
    };

    if (loading) {
        return <div className="manager-loading">Cargando instituciones...</div>;
    }

    const institutionTypes = ['universidad', 'instituto', 'corporacion'];

    return (
        <div className="manager-container">
            <div className="manager-header">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar instituciones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn-secondary"
                        onClick={fetchData}
                        title="Refrescar datos"
                    >
                        <RefreshCw size={20} />
                        Refrescar
                    </button>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Nueva Institución
                    </button>
                </div>
            </div>

            <div className="filter-group">
                <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                    <option value="">Todas las ciudades</option>
                    {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    {institutionTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                </select>
            </div>

            {error && !showModal && !deleteConfirm && (
                <div className="error-message">{error}</div>
            )}

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Acrónimo</th>
                            <th>Ciudad</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInstitutions.map(inst => (
                            <tr key={inst.id}>
                                <td>{inst.name}</td>
                                <td>{inst.acronym ? <span className="code-badge">{inst.acronym}</span> : '-'}</td>
                                <td>{inst.city?.name || '-'}</td>
                                <td className="text-muted">{inst.type}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleOpenModal(inst)}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => setDeleteConfirm(inst)}
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

                {filteredInstitutions.length === 0 && (
                    <div className="empty-state">
                        {searchTerm || filterCity || filterType ? 'No se encontraron instituciones' : 'No hay instituciones registradas'}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingInstitution ? 'Editar Institución' : 'Nueva Institución'}</h2>

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
                                <label>Ciudad *</label>
                                <select
                                    value={formData.cityId}
                                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar ciudad</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Tipo *</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar tipo</option>
                                    {institutionTypes.map(type => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Acrónimo</label>
                                <input
                                    type="text"
                                    value={formData.acronym}
                                    onChange={(e) => setFormData({ ...formData, acronym: e.target.value.toUpperCase() })}
                                    maxLength={20}
                                />
                            </div>

                            <div className="form-group">
                                <label>Latitud</label>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Longitud</label>
                                <input
                                    type="number"
                                    step="0.00000001"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingInstitution ? 'Actualizar' : 'Crear'}
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
                    title="Eliminar Institución"
                    message={`¿Estás seguro de que deseas eliminar la institución "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
};

export default InstitutionManager;
