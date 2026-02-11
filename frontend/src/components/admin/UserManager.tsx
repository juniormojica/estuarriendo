import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import ConfirmModal from '../ConfirmModal';
import { useToast } from '../../components/ToastProvider';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: 'owner' | 'tenant' | 'admin' | 'superAdmin';
    plan: 'free' | 'premium';
    verificationStatus: 'pending' | 'verified' | 'rejected';
    whatsapp?: string;
    ownerRole?: 'landlord' | 'agent' | 'property_manager';
    joinedAt: string;
}

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const toast = useToast();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUserType, setFilterUserType] = useState('');
    const [filterPlan, setFilterPlan] = useState('');
    const [filterVerification, setFilterVerification] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        userType: 'owner' as User['userType'],
        plan: 'free' as User['plan'],
        verificationStatus: 'pending' as User['verificationStatus'],
        whatsapp: '',
        ownerRole: '' as User['ownerRole'] | ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterUserType, filterPlan, filterVerification, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await api.getUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err: any) {
            const message = err.message || 'Error al cargar usuarios';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterUserType) {
            filtered = filtered.filter(user => user.userType === filterUserType);
        }

        if (filterPlan) {
            filtered = filtered.filter(user => user.plan === filterPlan);
        }

        if (filterVerification) {
            filtered = filtered.filter(user => user.verificationStatus === filterVerification);
        }

        setFilteredUsers(filtered);
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: '',
                userType: user.userType,
                plan: user.plan,
                verificationStatus: user.verificationStatus,
                whatsapp: user.whatsapp || '',
                ownerRole: user.ownerRole || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                userType: 'owner',
                plan: 'free',
                verificationStatus: 'pending',
                whatsapp: '',
                ownerRole: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            userType: 'owner',
            plan: 'free',
            verificationStatus: 'pending',
            whatsapp: '',
            ownerRole: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const userData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                userType: formData.userType,
                plan: formData.plan,
                verificationStatus: formData.verificationStatus,
                whatsapp: formData.whatsapp || undefined,
                ownerRole: formData.userType === 'owner' && formData.ownerRole ? formData.ownerRole : undefined,
                ...(formData.password && { password: formData.password })
            };

            if (editingUser) {
                await api.updateUser(editingUser.id, userData);
                toast.success('Usuario actualizado exitosamente');
            } else {
                if (!formData.password) {
                    toast.error('La contraseña es requerida para crear un nuevo usuario');
                    return;
                }
                await api.createUser({ ...userData, password: formData.password });
                toast.success('Usuario creado exitosamente');
            }

            await fetchUsers();
            handleCloseModal();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error al guardar usuario');
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.deleteUser(userToDelete.id);
            toast.success('Usuario eliminado exitosamente');
            await fetchUsers();
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error al eliminar usuario');
        }
    };

    const getUserTypeBadge = (type: string) => {
        const badges = {
            owner: 'bg-blue-100 text-blue-800',
            tenant: 'bg-green-100 text-green-800',
            admin: 'bg-purple-100 text-purple-800',
            superAdmin: 'bg-red-100 text-red-800'
        };
        const labels = {
            owner: 'Propietario',
            tenant: 'Estudiante',
            admin: 'Admin',
            superAdmin: 'Super Admin'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
                {labels[type as keyof typeof labels] || type}
            </span>
        );
    };

    const getPlanBadge = (plan: string) => {
        return plan === 'premium' ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Premium
            </span>
        ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Gratis
            </span>
        );
    };

    const getVerificationBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        const labels = {
            pending: 'Pendiente',
            verified: 'Verificado',
            rejected: 'Rechazado'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-emerald-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
                        <p className="text-sm text-gray-500">Administra todos los usuarios del sistema</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchUsers}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="h-5 w-5" />
                        <span>Refrescar</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <select
                        value={filterUserType}
                        onChange={(e) => setFilterUserType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="owner">Propietarios</option>
                        <option value="tenant">Estudiantes</option>
                        <option value="admin">Admins</option>
                        <option value="superAdmin">Super Admins</option>
                    </select>

                    <select
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Todos los planes</option>
                        <option value="free">Gratis</option>
                        <option value="premium">Premium</option>
                    </select>

                    <select
                        value={filterVerification}
                        onChange={(e) => setFilterVerification(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="">Todas las verificaciones</option>
                        <option value="pending">Pendiente</option>
                        <option value="verified">Verificado</option>
                        <option value="rejected">Rechazado</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Verificación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha de Registro
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getUserTypeBadge(user.userType)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getPlanBadge(user.plan)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getVerificationBadge(user.verificationStatus)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('es-CO') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="text-emerald-600 hover:text-emerald-900 mr-4"
                                                title="Editar"
                                            >
                                                <Edit2 className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="+57 300 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        placeholder="+57 300 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Usuario *
                                    </label>
                                    <select
                                        required
                                        value={formData.userType}
                                        onChange={(e) => setFormData({ ...formData, userType: e.target.value as User['userType'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="owner">Propietario</option>
                                        <option value="tenant">Estudiante</option>
                                        <option value="admin">Admin</option>
                                        <option value="superAdmin">Super Admin</option>
                                    </select>
                                </div>

                                {formData.userType === 'owner' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rol de Propietario
                                        </label>
                                        <select
                                            value={formData.ownerRole}
                                            onChange={(e) => setFormData({ ...formData, ownerRole: e.target.value as User['ownerRole'] | '' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="landlord">Arrendador</option>
                                            <option value="agent">Agente</option>
                                            <option value="property_manager">Administrador de Propiedades</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Plan *
                                    </label>
                                    <select
                                        required
                                        value={formData.plan}
                                        onChange={(e) => setFormData({ ...formData, plan: e.target.value as User['plan'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="free">Gratis</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado de Verificación *
                                    </label>
                                    <select
                                        required
                                        value={formData.verificationStatus}
                                        onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as User['verificationStatus'] })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="verified">Verificado</option>
                                        <option value="rejected">Rechazado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && userToDelete && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    title="Eliminar Usuario"
                    message={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete.name}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleDelete}
                    onClose={() => {
                        setShowDeleteConfirm(false);
                        setUserToDelete(null);
                    }}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            )}
        </div>
    );
};

export default UserManager;
