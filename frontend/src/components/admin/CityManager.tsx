import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import ConfirmModal from '../ConfirmModal';
import { useToast } from '../../components/ToastProvider';
import './ManagerStyles.css';

interface Department {
    id: number;
    name: string;
    code: string;
}

interface City {
    id: number;
    name: string;
    slug: string;
    departmentId: number;
    isActive: boolean;
    department?: Department;
}

const CityManager: React.FC = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<City | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        departmentId: '',
        isActive: true
    });
    const [error, setError] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = cities;

        if (searchTerm) {
            filtered = filtered.filter(city =>
                city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                city.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                city.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterDepartment) {
            filtered = filtered.filter(city => city.departmentId === parseInt(filterDepartment));
        }

        setFilteredCities(filtered);
    }, [searchTerm, filterDepartment, cities]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [citiesData, departmentsData] = await Promise.all([
                api.getCities(),
                api.getDepartments()
            ]);
            setCities(citiesData);
            setDepartments(departmentsData);
            setFilteredCities(citiesData);
        } catch (err: any) {
            const message = err.message || 'Error al cargar datos';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (city?: City) => {
        if (city) {
            setEditingCity(city);
            setFormData({
                name: city.name,
                slug: city.slug,
                departmentId: city.departmentId.toString(),
                isActive: city.isActive
            });
        } else {
            setEditingCity(null);
            setFormData({ name: '', slug: '', departmentId: '', isActive: true });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCity(null);
        setFormData({ name: '', slug: '', departmentId: '', isActive: true });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const payload = {
                ...formData,
                departmentId: parseInt(formData.departmentId)
            };

            if (editingCity) {
                await api.updateCity(editingCity.id, payload);
                toast.success('Ciudad actualizada exitosamente');
            } else {
                await api.createCity(payload);
                toast.success('Ciudad creada exitosamente');
            }
            await fetchData();
            handleCloseModal();
        } catch (err: any) {
            const message = err.response?.data?.error || err.message || 'Error al guardar ciudad';
            setError(message);
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await api.deleteCity(deleteConfirm.id);
            toast.success('Ciudad eliminada exitosamente');
            await fetchData();
            setDeleteConfirm(null);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Error al eliminar ciudad';
            setError(message);
            toast.error(message);
            setDeleteConfirm(null);
        }
    };

    if (loading) {
        return <div className="manager-loading">Cargando ciudades...</div>;
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar ciudades..."
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
                        Nueva Ciudad
                    </button>
                </div>
            </div>

            <div className="filter-group">
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                >
                    <option value="">Todos los departamentos</option>
                    {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
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
                            <th>Departamento</th>
                            <th>Slug</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCities.map(city => (
                            <tr key={city.id}>
                                <td>{city.name}</td>
                                <td>{city.department?.name || '-'}</td>
                                <td className="text-muted">{city.slug}</td>
                                <td>
                                    <span className={`status-badge ${city.isActive ? 'active' : 'inactive'}`}>
                                        {city.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleOpenModal(city)}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => setDeleteConfirm(city)}
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

                {filteredCities.length === 0 && (
                    <div className="empty-state">
                        {searchTerm || filterDepartment ? 'No se encontraron ciudades' : 'No hay ciudades registradas'}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingCity ? 'Editar Ciudad' : 'Nueva Ciudad'}</h2>

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
                                <label>Departamento *</label>
                                <select
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar departamento</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Slug *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    Activo
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingCity ? 'Actualizar' : 'Crear'}
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
                    title="Eliminar Ciudad"
                    message={`¿Estás seguro de que deseas eliminar la ciudad "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
};

export default CityManager;
