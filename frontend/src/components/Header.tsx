import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { api } from '../services/api';
import NotificationBell from './NotificationBell';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [newOpportunitiesCount, setNewOpportunitiesCount] = useState(0);

  useEffect(() => {
    const loadNewOpportunitiesCount = async () => {
      if (currentUser?.userType === 'owner') {
        try {
          const requests = await api.getStudentRequests();
          const lastViewed = localStorage.getItem(`estuarriendo_opportunities_last_viewed_${currentUser.id}`);
          const lastViewedTimestamp = lastViewed ? parseInt(lastViewed) : 0;

          const newCount = requests.filter(request => {
            const requestTime = new Date(request.createdAt).getTime();
            return requestTime > lastViewedTimestamp;
          }).length;

          setNewOpportunitiesCount(newCount);
        } catch (error) {
          // Silently fail if not authenticated or error occurs
          console.error('Error loading opportunities count:', error);
          setNewOpportunitiesCount(0);
        }
      }
    };

    loadNewOpportunitiesCount();
  }, [currentUser]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="EstuArriendo" className="h-10" />
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Inicio
            </Link>
            <Link
              to="/favoritos"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/favoritos'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Favoritos
            </Link>
            <Link
              to="/planes"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/planes'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              Planes
            </Link>

            {currentUser && (
              <>
                {/* Admin Panel Link - Only for admin and superAdmin */}
                {(currentUser.userType === 'admin' || currentUser.userType === 'superAdmin') && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    Admin Panel
                  </Link>
                )}

                {currentUser.userType === 'tenant' && (
                  <Link
                    to="/busco-inmueble"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/busco-inmueble'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    Busco Inmueble
                  </Link>
                )}
                {currentUser.userType === 'owner' && (
                  <>
                    <Link
                      to="/oportunidades"
                      className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/oportunidades'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      Solicitudes
                      {newOpportunitiesCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                          {newOpportunitiesCount > 99 ? '99+' : newOpportunitiesCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/mis-propiedades"
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/mis-propiedades'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      Mis Propiedades
                    </Link>
                  </>
                )}
                <Link
                  to="/perfil"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/perfil'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  Mi Perfil
                </Link>
              </>
            )}

            {(!currentUser || currentUser.userType === 'owner') && (
              <Link
                to="/publicar"
                className="flex items-center space-x-1 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="h-4 w-4 text-white" />
                <span>Publicar</span>
              </Link>
            )}

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {/* Notification Bell - Only for logged in users */}
            {currentUser && <NotificationBell />}

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span onClick={() => navigate('/perfil')} className="text-sm text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100git  cursor-pointer">
                  Hola, {currentUser.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;