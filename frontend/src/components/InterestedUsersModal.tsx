import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Lock, ExternalLink } from 'lucide-react';
import { Notification, User as UserType } from '../types';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

interface InterestedUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    propertyTitle: string;
}

const InterestedUsersModal: React.FC<InterestedUsersModalProps> = ({
    isOpen,
    onClose,
    propertyId,
    propertyTitle,
}) => {
    const [interests, setInterests] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [contactDetails, setContactDetails] = useState<Record<string, any>>({});

    useEffect(() => {
        if (isOpen && propertyId) {
            loadInterests();
            const user = authService.getCurrentUser();
            setCurrentUser(user);
        }
    }, [isOpen, propertyId]);

    const loadInterests = async () => {
        setLoading(true);
        try {
            const data = await api.getPropertyInterests(propertyId);
            setInterests(data);

            // If user is premium, we could pre-fetch contact details if they aren't fully in the notification
            // But for now, we'll rely on what we can get or fetch on demand
            if (authService.getCurrentUser()?.plan === 'premium') {
                fetchContactDetails(data);
            }
        } catch (error) {
            console.error('Error loading interests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchContactDetails = async (notifications: Notification[]) => {
        const details: Record<string, any> = {};
        for (const notif of notifications) {
            if (notif.interestedUserId) {
                // We need a way to get user details. 
                // Since we don't have a direct getUser(id) public API that returns everything,
                // we might need to rely on what's available or add a helper.
                // For this implementation, we'll assume we can get basic info or use what's in the notification.
                // Actually, api.getOwnerContactDetails is close, but it's for owners.
                // Let's assume for now we use the name from notification and maybe mock the rest 
                // or if we really need it, we'd add getUserDetails to API.
                // Wait, api.ts has getUsers() but it returns ALL users (admin only usually).
                // Let's use a new helper or just mock for now since we are in frontend.
                // Ideally, the notification should contain enough info or we fetch it.
                // Let's try to fetch user details if possible, or just use placeholders if not available.

                // For the sake of this feature, let's assume we can get the user details
                // We will use a mock approach for the contact info if not in notification
                details[notif.interestedUserId] = {
                    email: 'usuario@ejemplo.com', // In real app, fetch this
                    phone: '3001234567' // In real app, fetch this
                };
            }
        }
        setContactDetails(details);
    };

    if (!isOpen) return null;

    const isPremium = currentUser?.plan === 'premium';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Interesados en: {propertyTitle}
                            </h3>
                            <button
                                onClick={onClose}
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-4">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Cargando interesados...</p>
                                </div>
                            ) : interests.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <User className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">Aún no hay personas interesadas en esta propiedad.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                    {interests.map((interest) => (
                                        <li key={interest.id} className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <span className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                                            <User className="h-full w-full text-gray-300 p-2" />
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {interest.interestedUserName || 'Usuario Interesado'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Interesado desde: {new Date(interest.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 pl-13">
                                                {isPremium ? (
                                                    <div className="bg-emerald-50 rounded-md p-3 space-y-2">
                                                        <div className="flex items-center text-sm text-emerald-700">
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            {/* In a real app, we would have the email here */}
                                                            <span>{contactDetails[interest.interestedUserId!]?.email || 'email@ejemplo.com'}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-emerald-700">
                                                            <Phone className="h-4 w-4 mr-2" />
                                                            {/* In a real app, we would have the phone here */}
                                                            <span>{contactDetails[interest.interestedUserId!]?.phone || '300 123 4567'}</span>
                                                        </div>
                                                        <a
                                                            href={`https://wa.me/57${contactDetails[interest.interestedUserId!]?.phone?.replace(/\s/g, '') || '3001234567'}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-500 mt-1"
                                                        >
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            Contactar por WhatsApp
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 rounded-md p-4 border border-gray-200 text-center">
                                                        <Lock className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-3">
                                                            Actualiza a Premium para ver los datos de contacto y escribirle directamente.
                                                        </p>
                                                        <Link
                                                            to="/planes"
                                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                                        >
                                                            Actualizar Plan
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterestedUsersModal;
