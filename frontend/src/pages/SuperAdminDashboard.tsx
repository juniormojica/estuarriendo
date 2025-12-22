import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import DepartmentManager from '../components/admin/DepartmentManager';
import CityManager from '../components/admin/CityManager';
import InstitutionManager from '../components/admin/InstitutionManager';
import PropertyTypeManager from '../components/admin/PropertyTypeManager';
import AmenityManager from '../components/admin/AmenityManager';
import UserManager from '../components/admin/UserManager';
import './SuperAdminDashboard.css';

type TabType = 'departments' | 'cities' | 'institutions' | 'propertyTypes' | 'amenities' | 'users';

const SuperAdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('departments');
    const { user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();

    // Redirect if not super admin
    React.useEffect(() => {
        if (!user || user.userType !== 'superAdmin') {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user || user.userType !== 'superAdmin') {
        return null;
    }

    const tabs = [
        { id: 'departments' as TabType, label: 'Departamentos', icon: '🗺️' },
        { id: 'cities' as TabType, label: 'Ciudades', icon: '🏙️' },
        { id: 'institutions' as TabType, label: 'Instituciones', icon: '🎓' },
        { id: 'propertyTypes' as TabType, label: 'Tipos de Propiedad', icon: '🏠' },
        { id: 'amenities' as TabType, label: 'Amenidades', icon: '✨' },
        { id: 'users' as TabType, label: 'Usuarios', icon: '👥' }
    ];

    return (
        <div className="super-admin-dashboard">
            <div className="dashboard-header">
                <h1>Panel de Super Administrador</h1>
                <p>Gestión de datos maestros del sistema</p>
            </div>

            <div className="dashboard-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="dashboard-content">
                {activeTab === 'departments' && <DepartmentManager />}
                {activeTab === 'cities' && <CityManager />}
                {activeTab === 'institutions' && <InstitutionManager />}
                {activeTab === 'propertyTypes' && <PropertyTypeManager />}
                {activeTab === 'amenities' && <AmenityManager />}
                {activeTab === 'users' && <UserManager />}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
