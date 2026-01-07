import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import ConfirmModal from '../ConfirmModal';
import './ManagerStyles.css';

interface Department {
    id: number;
    name: string;
    code: string;
    slug: string;
    isActive: boolean;
}

const DepartmentManager: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Department | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        slug: '',
        isActive: true
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        const filtered = departments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDepartments(filtered);
    }, [searchTerm, departments]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await api.getDepartments();
            setDepartments(data);
            setFilteredDepartments(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar departamentos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (department?: Department) => {
        if (department) {
            setEditingDepartment(department);
            setFormData({
                name: department.name,
                code: department.code,
                slug: department.slug,
                isActive: department.isActive
            });
        } else {
            setEditingDepartment(null);
            setFormData({ name: '', code: '', slug: '', isActive: true });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDepartment(null);
        setFormData({ name: '', code: '', slug: '', isActive: true });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (editingDepartment) {
                await api.updateDepartment(editingDepartment.id, formData);
            } else {
                await api.createDepartment(formData);
            }
            await fetchDepartments();
            handleCloseModal();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Error al guardar departamento');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await api.deleteDepartment(deleteConfirm.id);
            await fetchDepartments();
            setDeleteConfirm(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al eliminar departamento');
            setDeleteConfirm(null);
        }
    };

    if (loading) {
        return <div className="manager-loading">Cargando departamentos...</div>;
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar departamentos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn-secondary"
                        onClick={fetchDepartments}
                        title="Refrescar datos"
                    >
                        <RefreshCw size={20} />
                        Refrescar
                    </button>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Nuevo Departamento
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
                            <th>Código</th>
                            <th>Slug</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDepartments.map(dept => (
                            <tr key={dept.id}>
                                <td>{dept.name}</td>
                                <td><span className="code-badge">{dept.code}</span></td>
                                <td className="text-muted">{dept.slug}</td>
                                <td>
                                    <span className={`status-badge ${dept.isActive ? 'active' : 'inactive'}`}>
                                        {dept.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleOpenModal(dept)}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => setDeleteConfirm(dept)}
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

                {filteredDepartments.length === 0 && (
                    <div className="empty-state">
                        {searchTerm ? 'No se encontraron departamentos' : 'No hay departamentos registrados'}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}</h2>

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
                                <label>Código *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    maxLength={3}
                                    required
                                />
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
                                    {editingDepartment ? 'Actualizar' : 'Crear'}
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
                    title="Eliminar Departamento"
                    message={`¿Estás seguro de que deseas eliminar el departamento "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
};

export default DepartmentManager;
