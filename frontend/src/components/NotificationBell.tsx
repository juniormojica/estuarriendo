import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '../types';
import { api } from '../services/api';
import { authService } from '../services/authService';

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const loadNotifications = async () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;

        setLoading(true);
        try {
            const userNotifications = await api.getNotifications(currentUser.id);
            setNotifications(userNotifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Reload notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            loadNotifications();
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        await api.markNotificationAsRead(notificationId);
        loadNotifications();
    };

    const handleMarkAllAsRead = async () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return;

        await api.markAllNotificationsAsRead(currentUser.id);
        loadNotifications();
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Notificaciones"
            >
                <Bell className="h-6 w-6" />

                {/* Notification Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notifications Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs text-gray-500">{unreadCount} nuevas</span>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="px-4 py-8 text-center">
                                    <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">No tienes notificaciones</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                            className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatTimestamp(notification.createdAt)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="flex-shrink-0">
                                                        <div className="h-2 w-2 bg-blue-600 rounded-full" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && unreadCount > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    Marcar todas como leídas
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
